import lemmatization_list_raw from "./lemmatization-en.txt"

class Lemmatization {
  constructor(){
    this.lemmasMap = new Map()
    lemmatization_list_raw.split(/\r?\n/).forEach( line => {
      // console.log(line)
      this.lemmasMap.set(...line.split(/\s+/).reverse())
    })
  }

  lemma(word){
    console.log(this.lemmasMap)
    return this.lemmasMap.get(word) || word
  }
}

export default Lemmatization