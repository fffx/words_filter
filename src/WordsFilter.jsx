import React, { Component} from "react";
import Lemmatization from "./lemmatization";
import * as Helpers from "./helpers.jsx";

const lemmatization = new Lemmatization();

export default class WordsFilter extends Component {
  constructor(props){
    super(props)
    this.state = {
      scanRegex: this.getScanRegex()
    }
  }

  // componentDidMount(){

  // }


  // https://en.wikipedia.org/wiki/Longest_word_in_English
  // https://reference.wolfram.com/language/example/FitWordLengthDataToDistributions.html.zh
  // https://pdf.sciencedirectassets.com/273276/1-s2.0-S0019995800X01489/1-s2.0-S0019995858902298/main.pdf
  getScanRegex() {
    const minLen = 2;
    const maxLen = 15;
    // 匹配连词， good-looking,
    return new RegExp(`[a-zA-Z]+-?[a-z]{${minLen},${maxLen}}`, 'g')
  };

  onSaveBtnClick = () => {
    const userInputSource = document.getElementById("userInputSource")
    const userInputFilter = document.getElementById("userInputFilter")
    const filterResults = document.getElementById("filterResults")

    // console.log("went", lemmatization.lemma("went"))
    // const scanRegex = getScanRegex({minLen: 2, maxLen: 15})
    const { scanRegex } = this.state

    let fileEl = document.getElementById("formFile")
    let file = fileEl.files[0]
    let fileReader = new FileReader();
    let fileType = Helpers.getFileType(file?.name)
    
    fileReader.onload = () => {
      userInputSource.value = fileReader.result
      this.doFilter()
    };
    
    fileReader.onerror = () => {
      Helpers.showError(fileReader.error);
    };
    
    if(fileType === 'pdf'){
      fileReader.onload = () => {
        Helpers.extractTxtFromPdf(fileReader.result).then(text => {
          userInputSource.value = text
          this.doFilter()
        })
      };
      fileReader.readAsArrayBuffer(file);
    } else if (fileType === "plain-text") {
      fileReader.readAsText(file);
    } else if(fileType === "unknown") {
      // TODO warning user
      fileReader.readAsText(file);
    } else {
      this.doFilter();
    }
  };

  doFilter = () => {
    const { scanRegex } = this.state
    let inputWords  = new Set(Helpers.scan(userInputSource.value, scanRegex).map( x => {
      return lemmatization.lemma(x.toLowerCase())
    }))
    let filterWords = new Set(Helpers.scan(userInputFilter.value, scanRegex).map( x => { 
      return lemmatization.lemma(x.toLowerCase()) 
    }))
  
    const results = Array.from(inputWords).filter(item => !filterWords.has(item))
    // console.log({inputWords, filterWords, results})
    document.getElementById("filterResults").value = results.join(" ")
  };

  
  render(){
    const {scanRegex} = this.state

    return (<>
      <div className="card">
          <div className="card-header"> 输入： </div>
          <div className="card-body">
              <div className="row">
                  <div className="col-4">
                      <div className="mb-3">
                          <label htmlFor="formFile" className="form-label">上传文件(txt)</label>
                          <input className="form-control" type="file" id="formFile"/>
                      </div>
                  </div>
                  <div className="col-8"> 
                      <textarea className="form-control" id="userInputSource" rows="6" placeholder="或者黏贴文本"></textarea>        
                  </div>
              </div>
          </div>
      </div>
      <div className="row pt-3">
          <div className="col-6">
              <div className="card">
                  <div className="card-header"> 过滤: </div>
                  <div className="card-body">
                      <div className="row">
                          <div className="col-12">
                              <textarea className="form-control" id="userInputFilter" rows="9" placeholder="... 过滤你不想背的单词"></textarea>
                          </div>
                      </div>
                      {/* TODO words list */}
                      <div className="row pt-3 d-none">
                          <ul className="list-group">
                              <li className="list-group-item">An item</li>
                              <li className="list-group-item">A second item</li>
                              <li className="list-group-item">A third item</li>
                              <li className="list-group-item">A fourth item</li>
                              <li className="list-group-item">And a fifth one</li>
                          </ul>
                      </div>
                  </div>
              </div>
          </div>
          <div className="col-6">
              <div className="card">
                  <div className="card-header"> 操作: </div>
                  <div className="card-body">
                      <div className="col-8">
                          <ol className="list-group list-group-numbered">
                              <li className="list-group-item">
                                单词提取正则
                                <div className="input-group mb-3">
                                  <span className="input-group-text">Regex:</span>
                                  <input type="text" className="form-control" placeholder={scanRegex}/>
                                </div>
                              </li>
                              <li>

                                <div className="form-check form-switch">
                                  <label className="form-check-label" htmlFor="flexSwitchCheckDefault">单词还原（went -> go)</label>
                                  <input className="form-check-input" type="checkbox" />
                                </div>

                              </li>
                          </ol>
                          <button className="btn btn-primary" id="save" onClick={this.onSaveBtnClick}> 保存 </button>
                      </div>
                      <textarea className="form-control" id="filterResults" placeholder="结果输出" rows="9"></textarea>
                  </div>
              </div>
          </div>
      </div>

    </>
    )
  }
  
}