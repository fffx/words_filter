import React, { Component } from "react";

export default class ExtractConfig extends Component {

  render() {
    const { scanRegex, updateScanRegex } = this.props
    return ( 
      <div className="row pt-3">
        <div className="card">
          <div className="card-body">
            <ul className="list-group">
              <div className="input-group mb-3">
                <span className="input-group-text">提取Regex:</span>
                <input type="text" className="form-control" placeholder={scanRegex.source} onChange={updateScanRegex} />
              </div>
              {/* <div className="form-check form-switch">
                <label className="form-check-label" htmlFor="flexSwitchCheckDefault">单词还原（went -> go)</label>
                <input className="form-check-input" type="checkbox" />
              </div> */}

              <li className="list-group-item">
                排除单词 
                <textarea className="form-control mt-1" id="userInputFilter" placeholder="" rows="9"></textarea>
              </li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

}