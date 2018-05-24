import React from 'react';
import { Breadcrumb, BreadcrumbItem, Table, Pagination, Input, Button, ProgressBar , Glyphicon } from 'react-bootstrap';
import { Notification } from 'atfcapi';
import fetchX from '../../vendor/Fetch';

class Registcenter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        allDepartmentData:[],
        newDepartmentData:[],
        departmentdData:[],
        appidsData:[],
        env:[],
        envVal:"",
        appidVal:"",
        departmentdVal:"",
        historyData:[],
        radioObj:null,
        inputA:"",
        inputB:"",
        activePage:1,
        pageContain:0,
        pages:0,
        alterState:false
    };
  }
  componentDidMount() {
    this.getEnv()
    this.getDepartment();
    this.getAllDepartmentAndAppid();
  }
  async getDepartment() {
    const idUrl = '/atfcapi/registCenter/getDepartments';
    try {
      const { code , msg , data = {} } = await fetchX.get(idUrl);
      if (code === '200') {
        this.setState({
          departmentdData: data || []
        })
      } else {
        Notification.error(msg);
      }
    } catch (e) {
      throw e
    }
  }
  async getAppidsByDepartmentName(val) {
    const idUrl = '/atfcapi/registCenter/getAppidsByDepartmentName?departmentName='+val;
    try {
      const { code , msg , data = {} } = await fetchX.get(idUrl);
      if (code === '200') { 
        this.setState({
          appidsData: data || []
        })
      } else {
        Notification.error(msg);
      }
    } catch (e) {
      throw e
    }
  }
  async getEnv() {
    const idUrl = '/atfcapi/registCenter/getEnv';
    try {
      const { code , msg , data = {} } = await fetchX.get(idUrl);
      if (code === '200') {
        this.setState({
          env: data || []
        })
      } else {
        Notification.error(msg);
      }
    } catch (e) {
      throw e
    }
  }
  async getAllDepartmentAndAppid() {
    const idUrl = '/atfcapi/registCenter/getAllDepartmentAndAppid';
    try {
      const { code , msg , data = {} } = await fetchX.get(idUrl);
      if (code === '200') {
        this.setState({
          allDepartmentData: data.departmentList,
          pageContain: data.pageContain,
          newDepartmentData:data.departmentList.slice(0,6).map((obj)=>{
              obj.radioState={
                radioA:true,
                radioB:false,
                radioC:false
              }
              obj.radioVal=["Prod","Beta"]
              obj.playState="未运行"
              obj.playAble=obj.appidList[0].isdelete
              return obj;
          }),
          pages: Math.ceil(data.departmentList.length/data.pageContain)
        })
      } else {
        Notification.error(msg);
      }
    } catch (e) {
      throw e
    }
  }

  async getCoverageForAppids(obj) {
    const idUrl = '/atfcapi/coverage/getCoverageForWeb';
    let { appId , env }=obj.appidList[0],{ radioVal } = obj,appIdArr=new Array()
    appIdArr[0]=appId
    try {
      const { code , msg } = await fetchX.post(idUrl,{appids:appIdArr,env,prodCommitId:radioVal[0],commitId:radioVal[1]});
      this.setState({
          newDepartmentData:this.state.newDepartmentData.map((obj)=>{
              if(obj.appidList[0].appId==appId && obj.appidList[0].env==env){
                obj.playState="运行中"
                obj.playAble=true
              }
              return obj;
          })
      })
      if (code === '200') {
        this.setState({
          newDepartmentData:this.state.newDepartmentData.map((obj)=>{
              if(obj.appidList[0].appId==appId  && obj.appidList[0].env==env){
                obj.playState="已完成"
                obj.playAble=false
              }
              return obj;
          })
        })
      } else {
        this.setState({
          newDepartmentData:this.state.newDepartmentData.map((obj)=>{
              if(obj.appidList[0].appId==appId  && obj.appidList[0].env==env){
                obj.playState="未运行"
                obj.playAble=false
              }
              return obj;
          })
        })
        Notification.error(msg);
      }
    } catch (e) {
      throw e
    }
  }
  async getConditoin() {
    let { departmentdVal , appidVal , envVal} = this.state
    const idUrl = '/atfcapi/registCenter/getDepartmentAndAppIdByConditoin?departmentName='+departmentdVal+'&appId='+appidVal+'&env='+envVal;
    try {
      const { code , msg , data = {} } = await fetchX.get(idUrl);
      if (code === '200') {
        this.setState({
          allDepartmentData: data.departmentList,
          pageContain: data.pageContain,
          activePage:1,
          newDepartmentData: data.departmentList.slice(0,6).map((obj)=>{
              obj.radioState={
                radioA:true,
                radioB:false,
                radioC:false
              }
              obj.radioVal=["Prod","Beta"]
              obj.playState="未运行"
              obj.playAble=obj.appidList[0].isdelete
              return obj;
          }),
          pages: Math.ceil(data.departmentList.length/data.pageContain)
        })
      } else {
        Notification.error(msg);
      }
    } catch (e) {
      throw e
    }
  }
  async getDiffCoverageRepo(obj) {
    let { appId , env } = obj.appidList[0]
    const idUrl = '/atfcapi/registCenter/getDiffCoverageReport?appid='+ appId +'&env='+env;
    try {
      const { code , msg , data = {} } = await fetchX.get(idUrl);
      if (code === '200') {
        let objArr = Object.keys(data)
        if(objArr.length>1){
          this.props.history.push({pathname:'regist/ipRegister/report',state:{obj:data,appid:appId}})
        }else{
          window.location.href = data[objArr[0]]
        }
      } else {
        Notification.error(msg);
      }
    } catch (e) {
      throw e
    }
  }
  async getTotalCoverageRepo(obj){
    let { appId , env } = obj.appidList[0]
    const idUrl = '/atfcapi/registCenter/getTotalCoverageReport?appid='+ appId +'&env='+env;
    try {
      const { code , msg , data = {} } = await fetchX.get(idUrl);
      if (code === '200') {
        let objArr = Object.keys(data)
        if(objArr.length>1){
          this.props.history.push({pathname:'regist/ipRegister/report',state:{obj:data,appid:appId}})
        }else{
          window.location.href = data[objArr[0]]
        }
      } else {
        Notification.error(msg);
      }
    } catch (e) {
      throw e
    }
  }
  async getdele(obj) {
    let { appId ,  env , isdelete } = obj.appidList[0]
    const idUrl = '/atfcapi/registCenter/enableOrDisableAppidCoverage';
    try {
      const { code , msg } = await fetchX.post(idUrl,{appid:appId,env,isdelete:!isdelete});
      if (code === '200') {
        this.setState({
          newDepartmentData:this.state.newDepartmentData.map((opt)=>{
              if(opt.appidList[0].appId==appId && opt.appidList[0].env==env){
                  opt.playAble=!isdelete
                  opt.appidList[0].isdelete=!isdelete
              }
              return opt;
          })
        })
        Notification.success(msg);
      } else {
        Notification.error(msg);
      }
    } catch (e) {
      throw e
    }
  }
  idOptions(arr){ 
    return arr.map((val)=>{
      return (<option value={val}>{val}</option>)
    })
  }
  departmentdChange(e){
    this.setState({
        departmentdVal:e.target.value,
        envVal:"",
        appidVal:""
    })
    this.getAppidsByDepartmentName(e.target.value)
  }
  handleChange(e){
    let Ename={};
        Ename[e.target.name]=e.target.value;
        this.setState(Ename)
  }
  searchClick(){
    this.getConditoin()
  }
  historyClick(obj,count){
    if(count>0){
      let {appId} = obj.appidList[0]
      let env = obj.appidList[0].env
      let newkey = appId + "--" + env
      this.props.history.push('regist/ipRegister/history/'+newkey)
    }
  }
  playClick(obj){
    this.getCoverageForAppids(obj)
  }
  closeClick(obj){
    this.getDiffCoverageRepo(obj)
  }
  openClick(obj){
    this.getTotalCoverageRepo(obj)
  }
  deleClick(obj){
      this.getdele(obj)
  }
  cogClick(obj){
    this.props.history.push({pathname:'regist/appidRegist',state:{appid:obj.appidList[0].appId}})
  }
  asteriskClick(obj){
    this.props.history.push({pathname:'regist/ipRegist',state:{appid:obj.appidList[0].appId}})
  }
  infoClick(sta,obj){
    let radioState={},radioVal=["",""],state;
    if(sta==0){
      radioState={
                    radioA:true,
                    radioB:false,
                    radioC:false
                  }
      radioVal=["Prod","Beta"]
      state=false
    }else if(sta==1){
      radioState={
                    radioA:false,
                    radioB:true,
                    radioC:false
                  }
      radioVal=["Beta","上一版"]
      state=false
    }else if(sta==2){
      radioState={
                    radioA:false,
                    radioB:false,
                    radioC:true
                  }
      this.setState({
        radioObj:obj
      })
      state=true
    }
    let { newDepartmentData } = this.state
    this.setState({
      newDepartmentData:newDepartmentData.map((ipt)=>{
          if(ipt.appidList[0].appId==obj.appidList[0].appId && ipt.appidList[0].env==obj.appidList[0].env){
              ipt.radioState=radioState
              ipt.radioVal=radioVal
          }
         return ipt;
      }),
      alterState:state
    })
  }
  alterClick(sta){
    let { radioObj , newDepartmentData , inputA , inputB} = this.state

    if(sta){
      this.setState({
        newDepartmentData:newDepartmentData.map((ipt)=>{
                          if(ipt.appidList[0].appId==radioObj.appidList[0].appId){
                              ipt.radioVal[0]=inputA
                              ipt.radioVal[1]=inputB
                          }
                          return ipt;
                        }),
        alterState:false
      })
    }else{
      this.setState({
        alterState:false
      })
    }
    
  }
  handlePageSelect(event, selectedEvent) {
    this.setState({
      activePage: selectedEvent.eventKey,
      newDepartmentData:this.state.allDepartmentData.slice((selectedEvent.eventKey-1)*this.state.pageContain,selectedEvent.eventKey*this.state.pageContain).map((obj)=>{
              obj.radioState={
                radioA:true,
                radioB:false,
                radioC:false
              }
              obj.radioVal=["Prod","Beta"]
              obj.playState="未运行"
              obj.playAble=obj.appidList[0].isdelete
              return obj;
          })
    });
  }
  render() {
    let el=[]
        el=this.state.newDepartmentData.map((obj,ind)=>{
            return(
              <tr key={ind}>
                <td><p>{obj.departmentName}</p></td>
                <td><p>{obj.appidList[0].appId}</p></td>
                <td><p>{obj.playState}</p></td>
                <td><p onClick={()=>this.historyClick(obj,obj.appidList[0].historycount)}>{obj.appidList[0].historycount}</p></td>
                <td>
                  <p>
                    <ProgressBar bsStyle="info" now={obj.appidList[0].avgcoveragemap.line} />
                    <span>{obj.appidList[0].avgcoveragemap.line}%</span>
                  </p>
                </td>
                <td>
                  <p>
                    <ProgressBar bsStyle="info" now={obj.appidList[0].avgcoveragemap.branch} />
                    <span>{obj.appidList[0].avgcoveragemap.branch}%</span>
                  </p>
                </td>
                <td>
                  <p>
                    <ProgressBar bsStyle="info" now={obj.appidList[0].avgcoveragemap.method} />
                    <span>{obj.appidList[0].avgcoveragemap.method}%</span>
                  </p>
                </td>
                <td>
                  <label>
                    <input type="radio" value="0" checked={obj.radioState.radioA} onClick={()=>{this.infoClick(0,obj)}} name={"bate"+ind} ></input>
                    <span>Beta和Prod</span>
                  </label>
                  <label>
                    <input type="radio" value="1" checked={obj.radioState.radioB} onClick={()=>{this.infoClick(1,obj)}} name={"bate"+ind}></input>
                    <span>Beta和上一版</span>
                  </label>
                  <label>
                    <input type="radio" value="2" checked={obj.radioState.radioC} onClick={()=>{this.infoClick(2,obj)}} name={"bate"+ind}></input>
                    <span>自定义</span>
                  </label>
                </td>
                <td>
                  <p>
                    <Button  onClick={()=>{this.playClick(obj)}} disabled={obj.playAble}>
                      <Glyphicon glyph="play" />
                    </Button>
                    <Button onClick={()=>{this.closeClick(obj)}}>
                      <Glyphicon glyph="folder-close" />
                    </Button>
                    <Button onClick={()=>{this.openClick(obj)}}>
                      <Glyphicon glyph="folder-open" />
                    </Button>
                    <Button bsStyle={obj.appidList[0].isdelete ? "warning" : "default"} onClick={()=>{this.deleClick(obj)}}>
                      <Glyphicon glyph="trash" />
                    </Button>
                    <Button  onClick={()=>{this.cogClick(obj)}}>
                      <Glyphicon glyph="cog" />
                    </Button>
                    <Button  onClick={()=>{this.asteriskClick(obj)}}>
                      <Glyphicon glyph="asterisk" />
                    </Button>
                  </p>
                </td> 
              </tr>
              );
            })
      let alterDiv=null;
        if(this.state.alterState){
          alterDiv=(
            <div className='alterDiv'>
              <div className='alterBox'>
                <h1>自定义版本号</h1>
                <label>
                  <span>版本号1：</span>
                  <input
                    type="text" 
                    value={this.state.inputA}
                    name="inputA"
                    onChange={e => this.handleChange(e)}
                  >
                  </input>
                </label>
                <label>
                  <span>版本号2：</span>
                  <input 
                    type="text" 
                    name="inputB"
                    value={this.state.inputB}
                    onChange={e => this.handleChange(e)}
                  >
                  </input>
                </label>
                <p>
                  <Button onClick={()=>{this.alterClick(true)}}>确定</Button>
                  <Button onClick={()=>{this.alterClick(false)}}>取消</Button>
                </p>
              </div>  
            </div>
            )
          }
      
    return(
      <div id="ipRegister">
        <Breadcrumb>
          <BreadcrumbItem href="#">
            Department
          </BreadcrumbItem>
          <BreadcrumbItem active>
              Ip Register
          </BreadcrumbItem>
        </Breadcrumb>
        <div className="searchDiv">
          <Input
            type="select"
            label="AppId" 
            labelClassName="col-xs-4"
            wrapperClassName="col-xs-8"
            groupClassName="col-xs-3"
            name="departmentdVal"
            value={this.state.departmentdVal}
            onChange={e => this.departmentdChange(e)}
          >
            <option value="">--</option>
            {this.idOptions(this.state.departmentdData)}
          </Input>
          <Input
            type="select"
            label="Appid"
            labelClassName="col-xs-4"
            wrapperClassName="col-xs-8"
            groupClassName="col-xs-3"
            name="appidVal"
            value={this.state.appidVal}
            onChange={e => this.handleChange(e)}
          >
            <option value="">--</option>
            {this.idOptions(this.state.appidsData)}
          </Input>
          <Input
            type="select"
            label="Env"
            labelClassName="col-xs-4"
            wrapperClassName="col-xs-8"
            groupClassName="col-xs-3"
            name="envVal"
            value={this.state.envVal}
            onChange={e => this.handleChange(e)}
          >
            <option value="">--</option>
            {this.idOptions(this.state.env)}
          </Input>
          <Button className="search" onClick={()=>{this.searchClick(this)}}>Search</Button>
        </div>
        <div className="tableDiv">
          <Table striped bordered condensed hover>
            <thead>
              <tr>
                <th>部门名称</th>
                <th>AppId</th>
                <th>运行状态</th>
                <th>报告数</th>
                <th>行覆盖率</th>
                <th>分支覆盖率</th>
                <th>精准覆盖率</th>
                <th>比较版本</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {el}
            </tbody>
          </Table>
        </div>
        <div>
        </div>
        <Pagination
          prev
          next
          first
          last
          ellipsis
          boundaryLinks
          items={this.state.pages}
          maxButtons={5}
          activePage={this.state.activePage}
          onSelect={(event, selectedEvent) => this.handlePageSelect(event, selectedEvent)}
        />
        {alterDiv}
      </div>
    )
  }
}

export default Registcenter;
