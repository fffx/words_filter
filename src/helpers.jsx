export const scan = (str, regexp) => {
  if (!regexp.global) {
    throw new Error(`RegExp: ${regexp.toString()} without global (g) flag is not supported.`);
  }
  // var str = this
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


export const showError = (msg) => {
  console.error(msg)
}


export const UNKNOWN_FILE_TYPE = 'unknown'
export const getFileType = (strName) => {
  if(!strName) return null;

  if ( /\.(txt|md)/i.test(strName) ){
    // fileReader.readAsText(file);
    return 'plain-text'
  } else if( /\.(pdf)/i.test(strName) ) {
    return "pdf"
  } else {
    return UNKNOWN_FILE_TYPE
  }
}

// TODO allow choose page range ?
// TODO show words count
export const extractTxtFromPdf = (readResult) => {
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