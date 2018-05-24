import React from 'react';
import { Breadcrumb, BreadcrumbItem, Table, Input, Button, Grid, Row, Col } from 'react-bootstrap';
import { Notification } from 'atfcapi';
import TestTree from './testTree'
import fetchX from '../../vendor/Fetch';

class TestCaseSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tableData:[],
      tableDataAdd:[],
      selectVal:"",
      textareaVal:"",
      artifactId:"",
      interfacename:""

    };
  }
  componentDidMount() {
    
  }
  oneClick(val){
    let { tableData } = this.state
      this.setState({
        tableData:tableData.map((arr)=>{
          arr.map((twoArr,ind)=>{
            if(ind>0){
              if(val.id==twoArr.id){
                twoArr.count++
              }
            }
            return twoArr
          })
          return arr
        })
      })
      let clearTime=setTimeout(()=>{
        if(val.count==1 && val.content!=""){
          let { tableDataAdd } = this.state
          let addArr=[]
          tableData.map((arr)=>{
            arr.map((twoArr,ind)=>{
              if(ind>0){
                if(val.id==twoArr.id){
                  addArr.push(arr[0])
                  addArr.push(twoArr)
                }
              }
            })
          })
          
          if(tableDataAdd.length>0){
            let index,content,addIndex;
            tableDataAdd.map((arr,ind)=>{
              if(arr[0]==addArr[0]){
                index=ind
                addIndex=arr.indexOf(addArr[1])
                content=addArr[1]
              }
            })
            if(index!=undefined){
              if(addIndex==-1){
                tableDataAdd[index].push(content)
              }else{
                tableDataAdd[index].splice(addIndex,1)
              }
              
            }else{
              tableDataAdd.push(addArr)
            }
          }else{
            tableDataAdd.push(addArr)
          }
          this.setState({
            tableDataAdd:tableDataAdd
          })
          
        }else if(val.count==2){
          this.setState({
            tableData:tableData.map((arr)=>{
              arr.map((twoArr,ind)=>{
                if(ind>0){
                  if(val.id==twoArr.id){
                    twoArr.state=false
                  }
                }
                return twoArr
              })
              return arr
            })
          })
        }
        this.setState({
          tableData:tableData.map((arr)=>{
            arr.map((twoArr,ind)=>{
              if(ind>0){
                if(val.id==twoArr.id){
                  twoArr.count=0
                }
              }
              return twoArr
            })
            return arr
          })
        })
        clearTimeout(clearTime)
      },200)
  }
  async getInter(jar,val) {
    const envUrl = '/atfcapi/pict/getInterfaceParamandValues?artifactid='+jar+"&interfacename="+val;

    try {
      const { code , msg, data = {}} = await fetchX.get(envUrl);
      if (code === '200') {
        this.setState({
          artifactId:jar,
          interfacename:val,
          tableData:this.tableDataFn(data)
        })
      } else {
        Notification.error(msg);
      }
    } catch (e) {
      throw e
    }
  }
  async savePost(artifactId,interfacename,requestData,restriction,testCaseSum) {
    const envUrl = '/atfcapi/pict/saveConfigurationToDB';
    try {
      const { code , msg, data = {}} = await fetchX.post(envUrl,{artifactId,interfacename,requestData,restriction,testCaseSum});
      if (code === '200') {
        Notification.success(data);
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
  blurInput(val){
    if(val!=undefined){
      let { tableData } = this.state
      this.setState({
        tableData:tableData.map((arr)=>{
          arr.map((twoArr,ind)=>{
            if(ind>0){
              if(val.id==twoArr.id){
                twoArr.state=true
              }
            }
            return twoArr
          })
          return arr
        })
      })
    }
  }
  changeInput(val,e){
    let { tableData } = this.state
    this.setState({
      tableData:tableData.map((arr)=>{
        arr.map((twoArr,ind)=>{
          if(ind>0){
            if(val.id==twoArr.id){
              twoArr.content=e.target.value
            }
          }
          return twoArr
        })
        return arr
      })
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
                readOnly={arr[i] ? arr[i].state : true} 
                value={arr[i] ? arr[i].content : ""}
                onChange={(e)=>{this.changeInput(arr[i],e)}}
                onBlur={()=>{this.blurInput(arr[i])}}
                onClick={()=>{this.oneClick(arr[i])}}
              >
              </Input>
            </td>)
          })
        }
      </tr>)
    }
    if(tableData.length==0){
      return (<h5>无参数和值</h5>)
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
    }else {
      return obj + '';
    }
  }
  saveClick(){
    let {tableDataAdd,textareaVal,selectVal,artifactId,interfacename} = this.state
    if(tableDataAdd.length!=0){
      if(selectVal==""){
        Notification.error("请选择组合数");
        return false;
      }
      if(textareaVal==""){
        Notification.error("请填写条件");
        return false;
      }
      let arr=tableDataAdd.map((val)=>{
        val=val.map((valTwo,ind)=>{
          if(ind==0){
            return '"'+valTwo+'"'
          }else{
            return '"'+valTwo.content+'"'
          }
        })
        return val
      })
      this.savePost(artifactId,interfacename,this.encodeArray(arr),textareaVal,selectVal)
    }else{
      Notification.error("无参数值");
    }
  }
  cancelClick(){
    this.setState({
      tableDataAdd:[],
      textareaVal:""
    })
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
                  <h5>可选择参数和值</h5>
                  <div className="cont-auto">
                    {this.tableEl()}
                  </div>
                  <div>
                    <h6>测试用例组合数</h6>
                    <Input
                      type="select"
                      name="selectVal"
                      value={this.state.selectVal}
                      onChange={(e)=>{this.setState({selectVal:e.target.value})}}
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
                  <h5>已选择参数和值</h5>
                  <div className="cont-auto">
                    {this.addEl()}
                  </div>
                  <div className="btn-one">
                    <Button onClick={()=>{this.saveClick()}}>保存方案</Button>
                    <Button onClick={()=>{this.cancelClick()}}>取消</Button>
                  </div>
                </div>
                <div className="cont-fixed">
                  <h5>条件表达式</h5>
                  <div className="cont-border">
                    <Input
                      type="textarea"
                      name="textareaVal"
                      value={this.state.textareaVal}
                      onChange={(e)=>{this.setState({textareaVal:e.target.value})}}
                    >
                    </Input>
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

export default TestCaseSelect;