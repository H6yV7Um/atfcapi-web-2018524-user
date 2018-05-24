import React from 'react';
import { Input, Glyphicon, Collapse } from 'react-bootstrap';
import { Notification } from 'atfcapi';
import fetchX from '../../vendor/Fetch';

class TestTree extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        treeData:[],
        treeClass:""
    }
  }
  componentDidMount() {
    this.getAppidEnv()
  }
  async getAppidEnv() {
    const envUrl = '/atfcapi/pict/getDepartmentAndAppidAndInserfaceFromDB';
    try {
      const { code , msg, data = {}} = await fetchX.get(envUrl);
      if (code === '200') {
        let treeData=this.dataRecon(data)
        this.setState({
          treeData:treeData
        })
      } else {
        Notification.error(msg);
      }
    } catch (e) {
      throw e
    }
  }
  encodeArray(obj) {
      let array = [];
      let isArray = Object.prototype.toString.call(obj) == '[object Array]';
      if (isArray) {
          for (let i = 0; i < obj.length; i++) {
              array[array.length] = this.encodeArray(obj[i]);
          }
          return '[' + array.join(',') + ']';
      }
      else {
          return obj + '';
      }
  }
  dataRecon(data){
    let treeData=[]
    for(let key in data){
      let obj = {}
      obj.name = key
      obj.state=false
      obj.list = []
      for(let twoKey in data[key]){
        let objTwo = {}
        objTwo.name = twoKey
        obj.state=false
        objTwo.list = []
        for(let threeKey in data[key][twoKey]){
          let objThree = {}
          objThree.name = threeKey
          obj.state=false
          objThree.list = data[key][twoKey][threeKey]
          objTwo.list.push(objThree)
        }
        obj.list.push(objTwo)
      }
      treeData.push(obj)
    }
    return treeData
  }
  clickOne(data){
    let { treeData }=this.state
    this.setState({
      treeData:treeData.map((obj)=>{
        if(obj.name==data.name){
          obj.state=!data.state
        }
        return obj
      })
      
    })
  }
  clickTwo(valOne,valTwo){
    let { treeData }=this.state
    this.setState({
      treeData:treeData.map((objOne)=>{
        if(objOne.name==valOne.name){
          objOne.list.map((objTwo)=>{
            if(objTwo.name==valTwo.name){
              objTwo.state=!valTwo.state
            }
            return objTwo
          })
        }
        return objOne
      })
      
    })
  }
  clickThree(valOne,valTwo,valThree){
    let { treeData }=this.state
    this.setState({
      treeData:treeData.map((objOne)=>{
        if(objOne.name==valOne.name){
          objOne.list.map((objTwo)=>{
            if(objTwo.name==valTwo.name){
              objTwo.list.map((objThree)=>{
                if(objThree.name==valThree.name){
                  objThree.state=!valThree.state
                }
                return objThree
              })
            }
            return objTwo
          })
        }
        return objOne
      }),
      treeClass:valThree.state ? "treeWidth" : "" 
    })
  }
  clickFour(jar,val,appid){
    this.props.getInter(jar,val,appid)
  }
  listElFn(){
    let { treeData } = this.state
    let el = [],elTwo = [],elThree = []
    treeData.map((valOne)=>{
      el.push(<li key={valOne.name} className={this.state.treeClass}>
        <h6 onClick={()=> this.clickOne(valOne)}><Glyphicon glyph={valOne.state ? "minus" : "plus"} />  {valOne.name}</h6>
        <div className="tree-p">
          <Collapse in={valOne.state}>
            <div className="tree-span">
              {
                valOne.list.map((valTwo)=>{
                  return (<span key={valTwo.name}>
                    <b onClick={()=> this.clickTwo(valOne,valTwo)}><Glyphicon glyph={valTwo.state ? "minus" : "plus"} />  {valTwo.name}</b>
                    <label>
                      <Collapse in={valTwo.state}>
                        <div>
                          {
                            valTwo.list.map((valThree)=>{
                              return (<div key={valThree.name}>
                                <small onClick={()=> this.clickThree(valOne,valTwo,valThree)}><Glyphicon glyph={valThree.state ? "minus" : "plus"} />  {valThree.name}</small>
                                <Collapse in={valThree.state}>
                                  <div>
                                    {
                                      valThree.list.map((val)=>{
                                        return(<em key={val} onClick={()=> this.clickFour(valThree.name,val,valTwo.name)} >{val}</em>)
                                      })
                                    }
                                  </div>
                                </Collapse>
                              </div>)
                            })
                          }
                        </div>
                      </Collapse>
                    </label>
                  </span>)
                })
              }
            </div>
          </Collapse>
        </div>
      </li>)
    })
    return el;
  }
  searchChange(e){
    let searchVal = e.target.value
    let { treeData } = this.state
    let num = searchVal.length
    if(searchVal==""){
      this.setState({
        treeData:treeData.map((objOne)=>{
          objOne.state=false
          objOne.list.map((objTwo)=>{
            objTwo.state=false
            objTwo.list.map((objThree)=>{
              objThree.state=false
              return objThree
            })
            return objTwo
          })
          return objOne
        }),
        treeClass:"" 
      })
    }else{
      this.setState({
        treeData:treeData.map((objOne)=>{
          objOne.list.map((objTwo)=>{
            if(objTwo.name.slice(0,num)==searchVal){
              objOne.state=true
              objTwo.state=true
            }else{
              objOne.state=false
              objTwo.state=false
            }
            objTwo.list.map((objThree)=>{
              if(objThree.name.slice(0,num)==searchVal){
                objOne.state=true
                objTwo.state=true
                objThree.state=true
                this.setState({
                  treeClass:"treeWidth" 
                })
              }else{
                objThree.list.map((objFour)=>{
                  if(objFour.slice(0,num)==searchVal){
                    objOne.state=true
                    objTwo.state=true
                    objThree.state=true
                    this.setState({
                      treeClass:"treeWidth" 
                    })
                  }else{
                    objOne.state=false
                    objTwo.state=false
                    objThree.state=false
                    this.setState({
                      treeClass:"" 
                    })
                  }
                  return objFour
                })
              }
              return objThree
            })
            return objTwo
          })
          if(objOne.name.slice(0,num)==searchVal){
            objOne.state=true
          }
          return objOne
        })
      })
    }
    
  }
  render() {

    return (
      <div className="Tree-Box">
        <Input
          id="formControlsText"
          type="text"
          className="show-input"
          placeholder="search appid"
          onChange={(e)=>{this.searchChange(e)}}
        />
        <ul>
          {this.listElFn()}
        </ul>
      </div>

    )
  }
}

export default TestTree;
