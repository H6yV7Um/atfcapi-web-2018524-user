import React from 'react';
import { Breadcrumb, BreadcrumbItem, Table, Input, Button, Grid, Row, Col } from 'react-bootstrap';
import { Notification } from 'atfcapi';
import TestTree from './testTree'
import fetchX from '../../vendor/Fetch';

class TestCaseShow extends React.Component {
   constructor(props) {
    super(props);
    this.state = {
      tableData:[],
      tableDataAdd:[],
      selectVal:"",
      textareaVal:"",
      appid:"",
      link:"",
      artifactId:"",
      interfacename:""

    };
  }
  componentDidMount() {
    
  }
  async getInter(jar,val,appid) {
    const envUrl = '/atfcapi/pict/getConfiguration?artifactId='+jar+"&interfacename="+val;
    try {
      const { code , msg, data = {}} = await fetchX.get(envUrl);
      if (code === '200') {
        this.setState({
          artifactId:jar,
          interfacename:val,
          appid:appid,
          textareaVal:data.requirementexpression,
          tableDataAdd:this.tableDataFn(data.testCaseResponseData),
          selectVal:data.testCaseSum
        })
      } else {
        Notification.error(msg);
      }
    } catch (e) {
      throw e
    }
  }
  async savePost(artifactId,interfacename,appid,requestData,restriction,testCaseSum) {
    const envUrl = '/atfcapi/pict/getTestCase';
    try {
      const { code , msg, data = {}} = await fetchX.post(envUrl,{artifactId,interfacename,appid,requestData,restriction,testCaseSum});
      if (code === '200') {
        let arr=[]
        data.testCaseResponseData.map((responseArr,index)=>{
          if(index==0){
            responseArr.map((val)=>{
              let arrVal=[]
              arrVal.push(val)
              arr.push(arrVal)
            })
          }else{
            arr.map((arrData,ind)=>{
              arr[ind].push(responseArr[ind])
            })
          }
        })
        this.setState({
          tableData:arr,
          link:data.link
        })
      } else {
        Notification.error(msg);
      }
    } catch (e) {
      throw e
    }
  }
  tableDataFn(data){
    let num=10;
    data.map((arr)=>{
      if(num<arr.length){
        num=arr.length
      }
    })
    return data.map((arr,ind)=>{
      let a=[]
      for(let i=0;i<num;i++){
        if(i==0){
          a[i]=arr[i]
        }else{
          a[i]={
            id:ind+"-"+i,
            count:0,
            content:arr[i]?arr[i]:"",
            state:true
          }
        }
      }
      return a
    })
  }

  tableEl(){
    let { tableData } = this.state
    let trEl=[]
    let num=10;
    tableData.map((arr)=>{
      if(num<arr.length){
        num=arr.length
      }
    })
    for(let i=1;i<num;i++){
      trEl.push(<tr key={i}>
        {
          tableData.map((arr,ind)=>{
            return (<td key={i+"-"+ind}>
              <Input 
                type="text" 
                readOnly="true" 
                value={arr[i] ? arr[i] : ""}
              >
              </Input>
            </td>)
          })
        }
      </tr>)
    }
    if(tableData.length==0){
      return (<h5>无结果</h5>)
    }else{
      return (<Table striped bordered condensed hover >
        <thead>
          <tr>
            {
              tableData.map((arr)=>{
                return (<th>{arr[0]}</th>)
              })
            }
          </tr>
        </thead>
        <tbody>
          {trEl}
        </tbody>
      </Table>)
    }
  }
  addEl(){
    let { tableDataAdd } = this.state
    let trEl=[]
    let num=10;
    tableDataAdd.map((arr)=>{
      if(num<arr.length){
        num=arr.length
      }
    })
    for(let i=1;i<num;i++){
      trEl.push(<tr key={i}>
        {
          tableDataAdd.map((arr,ind)=>{
            return (<td key={i+"-"+ind}>
              <Input 
                type="text" 
                readOnly="true"
                value={arr[i] ? arr[i].content : ""}
              >
              </Input>
            </td>)
          })
        }
      </tr>)
    }
    if(tableDataAdd.length==0){
      return (<h5>未选择参数和值</h5>)
    }else{
      return (<Table striped bordered condensed hover >
        <thead>
          <tr>
            {
              tableDataAdd.map((arr)=>{
                return (<th>{arr[0]}</th>)
              })
            }
          </tr>
        </thead>
        <tbody>
          {trEl}
        </tbody>
      </Table>)
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
      } else {
        return obj + '';
      }
  }
  saveClick(){
    let {tableDataAdd,textareaVal,selectVal,artifactId,interfacename,appid} = this.state
    if(tableDataAdd.length!=0){
      let arr=[]
      tableDataAdd.map((val)=>{
        let valArr=[]
        val.map((valTwo,ind)=>{
          if(ind==0){
            valArr.push('"'+valTwo+'"')
          }else{
            if(valTwo.content!=""){
              valArr.push('"'+valTwo.content+'"')
            }
          }
        })
        arr.push(valArr)
      })
      this.savePost(artifactId,interfacename,appid,this.encodeArray(arr),textareaVal,selectVal)
    }
  }
  cancelClick(){
    this.setState({
      tableDataAdd:[],
      textareaVal:""
    })
  }
  linkClick(){
    let { link }=this.state
    if(link!=""){
      let href=location.origin+"/atfcapi/pict/downloadFile?path="+link
      window.open(href)
    }
  }
  render() {

    return (
      <div id="idpict">
        <Breadcrumb>
          <BreadcrumbItem href="#">
            Home
          </BreadcrumbItem>
          <BreadcrumbItem active>
            TestCase Show
          </BreadcrumbItem>
        </Breadcrumb>
        <div className="show-content">
          <Grid>
            <Row className="show-grid">
              <Col sm={6} md={3} className="show-border">
                <TestTree  getInter={this.getInter.bind(this)} />
              </Col>
              <Col sm={6} md={9} className="show-border">
                <div className="cont-fixed">
                  <h5>已选择参数和值</h5>
                  <div className="cont-auto">
                    {this.addEl()}
                  </div>
                  <div>
                    <h6>测试用例组合数</h6>
                    <Input
                      type="select"
                      name="selectVal"
                      disabled="true"
                      value={this.state.selectVal}
                    >            
                      <option value="">--</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="6">6</option>
                    </Input>
                  </div>
                </div>
                <div className="cont-fixed">
                  <h5>条件表达式</h5>
                  <div className="cont-border">
                    <Input
                      type="textarea"
                      name="textareaVal"
                      readOnly="true"
                      value={this.state.textareaVal}
                    >
                    </Input>
                  </div>
                  <div className="btn-one">
                    <Button onClick={()=>{this.saveClick()}}>生成TestCase</Button>
                    <Button onClick={()=>{this.cancelClick()}}>取消</Button>
                  </div>
                </div>
                <div className="cont-fixed">
                  <h5>结果</h5>
                  <div className="cont-auto">
                    {this.tableEl()}
                  </div>
                  <div className="text-link">
                    <h6 onClick={()=>{this.linkClick()}}>点击下载文件</h6>
                  </div>
                </div>
              </Col>
            </Row>
          </Grid>
        </div>
      </div>
    );
  }
}

export default TestCaseShow;
