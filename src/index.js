import Lemmatization from "./lemmatization";

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
};

const lemmatization = new Lemmatization()
console.log("went", lemmatization.lemma("went"))
document.getElementById("save").onclick = () => {
  let inputWords = new Set(userInputSource.value.scan(/\w+/g).map( x => lemmatization.lemma(x) ) )
  let filterWords = new Set(userInputFilter.value.scan(/\w+/g).map( x => lemmatization.lemma(x) ) )

  const results = Array.from(inputWords).filter(item => !filterWords.has(item))
  console.log({inputWords, filterWords, results})
  document.getElementById("filterResults").value = results.join(" ")
}




