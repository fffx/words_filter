import React, { Component} from "react";
import ExtractConfig from "./components/ExtractConfig.jsx"
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

  // https://en.wikipedia.org/wiki/Longest_word_in_English
  // https://reference.wolfram.com/language/example/FitWordLengthDataToDistributions.html.zh
  // https://pdf.sciencedirectassets.com/273276/1-s2.0-S0019995800X01489/1-s2.0-S0019995858902298/main.pdf
  getScanRegex() {
    const minLen = 2;
    const maxLen = 15;
    // 匹配连词， good-looking,
    return new RegExp(`[a-zA-Z]+-?[a-z]{${minLen},${maxLen}}`, 'g')
  };

  updateScanRegex = (event) => {
    let regex = null
    try{
      regex = new RegExp(event.target.value, 'g')
    } catch(e){
      console.log(e)
    }
    console.log({regex})
    if(regex) this.setState({scanRegex: regex})
  }

  userInputFilter = () => document.getElementById("userInputFilter")

  onSaveBtnClick = () => {
    const userInputSource = document.getElementById("userInputSource")
    const userInputFilter = this.userInputFilter()
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
    let filterWords = new Set(Helpers.scan(this.userInputFilter().value, scanRegex).map( x => { 
      return lemmatization.lemma(x.toLowerCase()) 
    }))
  
    const results = Array.from(inputWords).filter(item => !filterWords.has(item))
    // console.log({inputWords, filterWords, results})
    document.getElementById("filterResults").value = results.join(" ")
  };


  componentDidUpdate(){
    this.doFilter()
  }

  
  render(){
    const {scanRegex} = this.state

    return (<>
      <div className="card">
          <div className="card-header"> 输入： </div>
          <div className="card-body">
              <div className="row">
                  <div className="col-12">
                      <div className="mb-3 row">
                          <label htmlFor="formFile" className="form-label col-sm-12 col-lg-2 col-form-label">上传文件(pdf/txt): </label>
                          <div className="col-lg-10 col-12">
                            <input className="form-control" type="file" id="formFile"/>
                          </div>
                      </div>
                  </div>
                  <div className="col-12"> 
                      <textarea className="form-control" id="userInputSource" rows="6" placeholder="或者黏贴文本"></textarea>        
                  </div>
              </div>
          </div>
      </div>

      <div className="container pt-2"> 
        <div className="row">
          <nav>
            <div className="nav nav-tabs" role="tablist">
              <button className="nav-link active" data-bs-toggle="tab" data-bs-target="#output-tab" type="button" aria-selected="true">输出</button>
              <button className="nav-link"        data-bs-toggle="tab" data-bs-target="#config-tab" type="button">设置</button>
            </div>
          </nav>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="tab-content" id="main-tab-content">
              <div className="tab-pane fade show active" id="output-tab" role="tabpanel">
                <div className="row pt-3">
                  <div className="card">
                      <div className="card-body">
                          <div className="col-8">
                              <button className="btn btn-primary" id="save" onClick={this.onSaveBtnClick}> 保存 </button>
                          </div>
                          <textarea className="form-control mt-1" id="filterResults" placeholder="结果输出" rows="9"></textarea>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="tab-pane fade" id="config-tab" role="tabpanel"> 
                  <ExtractConfig scanRegex={scanRegex} updateScanRegex={this.updateScanRegex} />
                </div>
              </div>
            </div> {/* tabs end */}
        </div>
      </div>
    </>
    )
  }
  
}