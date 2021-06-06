import { resolveConfigFile } from "prettier";
import Lemmatization from "./lemmatization";

// https://en.wikipedia.org/wiki/Longest_word_in_English
// https://reference.wolfram.com/language/example/FitWordLengthDataToDistributions.html.zh
// https://pdf.sciencedirectassets.com/273276/1-s2.0-S0019995800X01489/1-s2.0-S0019995858902298/main.pdf


const userInputSource = document.getElementById("userInputSource")
const userInputFilter = document.getElementById("userInputFilter")
const filterResults = document.getElementById("filterResults")

String.prototype.scan = function (regexp) {
  if (!regexp.global) {
    throw new Error("RegExp without global (g) flag is not supported.");
  }
  var str = this
  var result = [];
  var m;
  while (m = regexp.exec(str)) {
      if (m.length >= 2) {
          result.push(m.slice(1));
      } else {
          result.push(m[0]);
      }
  }
  return result;
}


const doFilter = (scanRegex) => {
  let inputWords  = new Set(userInputSource.value.scan(scanRegex).map( x => lemmatization.lemma(x.toLowerCase()) ) )
  let filterWords = new Set(userInputFilter.value.scan(scanRegex).map( x => lemmatization.lemma(x.toLowerCase()) ) )

  const results = Array.from(inputWords).filter(item => !filterWords.has(item))
  // console.log({inputWords, filterWords, results})
  document.getElementById("filterResults").value = results.join(" ")
}

const getFileType = (strName) => {
  if(!strName) return null;

  if ( /\.(txt|md)/i.test(strName) ){
    // fileReader.readAsText(file);
    return 'plain-text'
  } else if( /\.(pdf)/i.test(strName) ) {
    return "pdf"
  } else {
    return 'unknown'
  }
}

const getScanRegex = (opt = {}) => {
  const {minLen = 2, maxLen = 15} = opt;
  return new RegExp(`[a-zA-Z][a-z]{${minLen - 1},${maxLen - 1}}`, 'g')
}

// TODO allow choose page range ?
// TODO show words count
const extractTxtFromPdf = (readResult) => {
  var loadingtask = pdfjsLib.getDocument(new Uint8Array(readResult))
  console.log({loadingtask})
  return loadingtask.promise.then(pdf => {
    var numPages = pdf.numPages;
    var countPromises = []; // collecting all page promises
    
    console.log({numPages})
    for(let pageIndex = 1; pageIndex <= numPages; pageIndex ++){
      var page = pdf.getPage(pageIndex);
      var txt = "";
      countPromises.push(page.then(function(page) { // add page promise
        var textContent = page.getTextContent();
        return textContent.then(function(text){ // return content promise
          return text.items.map(function (s) { return s.str; }).join(' '); // value page text 
        });
      }));
    }// end for loop

    // Wait for all pages and join text
    return Promise.all(countPromises).then(function (texts) {
      return texts.join(' ');
    });

  });

}

const showError = (msg) => {
  console.error(msg)
}

const lemmatization = new Lemmatization()
// console.log("went", lemmatization.lemma("went"))
document.getElementById("save").onclick = () => {
  // const scanRegex = getScanRegex({minLen: 2, maxLen: 15})
  const scanRegex = getScanRegex()
  console.debug({scanRegex})
  let fileEl = document.getElementById("formFile")
  let file = fileEl.files[0]
  let fileReader = new FileReader();
  let fileType = getFileType(file?.name)
  
  fileReader.onload = function() {
    userInputSource.value = fileReader.result
    doFilter(scanRegex)
  };
  
  fileReader.onerror = function() {
    showError(fileReader.error);
  };
  

  if(fileType === 'pdf'){
    fileReader.onload = function() {
      console.log("onload ----", fileReader.result)
      extractTxtFromPdf(fileReader.result).then(text => {
        userInputSource.value = text
        doFilter(scanRegex)
      })
    };
    fileReader.readAsArrayBuffer(file);
  } else if (fileType === "plain-text") {
    fileReader.readAsText(file);
  } else if(fileType === "unknown") {
    // TODO warning user
    fileReader.readAsText(file);
  } else {
    doFilter(scanRegex);
  }

}




