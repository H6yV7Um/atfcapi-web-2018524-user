import React from 'react';
import { Breadcrumb, BreadcrumbItem, Input, Button } from 'react-bootstrap';
import { Notification } from 'atfcapi';
import fetchX from '../../vendor/Fetch';

class AppidRegist extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      appIdData:[],
      envData:[],
      appid: this.props.location.state.appid,
      envVal: "",
      sessionid:"",
      output:"",
      jmx:"",
      append:false,
      includesOption:"",
      excludesOption:"",
      includesOptions:"",
      excludesOptions:"",
      excludesMap:{},
      includesMap:{},
      includeState:"none",
      excludeState:"none",
      exclclassloader: "",
      inclbootstrapclasses: false,
      inclnolocationclasses: false,
      dumponexit: false
    };
  }
  componentDidMount() {
    this.getAppidEnv();
  }

  async getAppidEnv() {
    const envUrl = '/atfcapi/registCenter/getEnv';
    try {
      const { code , msg, data = {}} = await fetchX.get(envUrl);
      if (code === '200') {
        this.setState({
          envData: data || [],  
        })
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
  mapOptions(obj,name){
   let el=[],keyArr=[];
        for(let key in obj){
          if(obj[key]==1){
            let state=true
            keyArr.push(key)
            el.push(<Input name={name} type="checkbox" checked={state}  value={key}  label={key} onClick={()=>{this.clickVal(key,state,name)}} />)
          }else{
            let state=false
            el.push(<Input name={name} type="checkbox" checked={state}  value={key}  label={key} onClick={()=>{this.clickVal(key,state,name)}} />)
          }
        }
    return (el)
  }
  clickVal(key,state,name){
    let includes=this.state[name+"Map"]
    for(let keyData in includes){
      if(keyData==key){
        if(state){
          includes[keyData]=0
        }else{
          includes[keyData]=1
        }
      }
    }
    if(name=="includes"){
      this.setState({
        includesMap:includes
      })
    }else{
      this.setState({
        excludesMap:includes
      })
    }
    
  }
  clickSelect(){
    if(this.state.includeState=="none"){
      this.setState({
        includeState:"flex"
      })
    }else{
      this.setState({
        includeState:"none"
      })
    }
  }
  clickexclude(){
    if(this.state.excludeState=="none"){
      this.setState({
        excludeState:"flex"
      })
    }else{
      this.setState({
        excludeState:"none"
      })
    }
  }
  stateClick(e){
    if(e.target.name!="includes" && e.target.nodeName!="LABEL" && e.target.className!="checkbox" && e.target.className!="selectDiv"){
      let keys=[],nums=0,str="";
      for(let key in this.state.includesMap){
        if(this.state.includesMap[key]=="1"){
          keys.push(key)
        }
        nums++;
      }
      if(keys.length==nums && nums!=0){
        str="*"
      }else{
        str=keys.join(":") 
      }
      this.setState({
        includeState:"none",
        includesOptions:keys[0],
        includesOption:str
      })
    }
    if(e.target.name!="excludes" && e.target.nodeName!="LABEL" && e.target.className!="checkbox" &&  e.target.className!="selectDiv"){
      let keys=[],nums=0,str="";
      for(let key in this.state.excludesMap){
        if(this.state.excludesMap[key]=="1"){
          keys.push(key)
        }
         nums++;
      }
      if(keys.length==nums && nums!=0){
        str="*"
      }else{
        str=keys.join(":")
      }
      this.setState({
        excludeState:"none",
        excludesOptions:keys[0],
        excludesOption:str
      })
    }
  }
  handleChange(e){
    let Ename={}; 
    Ename[e.target.name]=e.target.value;
    this.setState(Ename)
  }
async  geiInfo(me){
    const url = '/atfcapi/registCenter/getElecocoParam';
    const { envVal }=me.state
    const { appid } = me.props.location.state
    try {
      const { code , msg, data = {}} = await fetchX.post(url,{appid:appid,env:envVal});
      if (code === '200') {
        for(let key in data.includesMap){
          if(data.includesMap[key]=="1"){
            me.setState({
              includesOptions:key
            })
            break;
          }
        }
        for(let key in data.excludesMap){
          if(data.excludesMap[key]=="1"){
            me.setState({
              excludesOptions:key
            })
            break;
          }
        }
        me.setState(data)
      } else {
        Notification.error(msg);
      }
    } catch (e) {
      throw e
    }
  }
async  searchClick(me){
  const url = '/atfcapi/registCenter/checkAppid';
  const { envVal }=me.state
  const { appid } = me.props.location.state
  me.setState({
    excludesMap:{},
    includesMap:{},
    includesOptions:"",
    excludesOptions:"",
    exclclassloader: "",
    inclbootstrapclasses: false,
    inclnolocationclasses: false,
    dumponexit: false
  })
  if(appid!="" && envVal!=""){
      try {
        const { code , msg }  = await fetchX.post(url,{appid:appid,env:envVal});
        if (code === '200') {
          me.geiInfo(me) 
          Notification.success(msg);
        } else {
          Notification.error(msg);
        }
      } catch (e) {
        throw e
      }
  }else{
    let msg=""
    if(appid=="" && envVal==""){
      msg="Please fill in the appid and env information"
    }else if(envVal==""){
      msg="Please fill in the env information"
    }else{
      msg="Please fill in the appid information"
    }
    Notification.error(msg);
  }
  
}
async  updataClick(me){
  const {envVal,includesOption,excludesOption,exclclassloader,inclbootstrapclasses,inclnolocationclasses,dumponexit,sessionid,output,jmx,append}=me.state
  const { appid } = me.props.location.state
  if(includesOption!="" && appid!="" && envVal!=""){
    const url = '/atfcapi/registCenter/updateAndRegist';
      try {
        const { code , msg } = await fetchX.post(url,{ appid:appid,env:envVal,includes:includesOption,excludes:excludesOption,exclclassloader,inclbootstrapclasses,inclnolocationclasses,dumponexit,sessionid,output,jmx,append});
        if (code === '200') {
            Notification.success(msg);
        } else {
          Notification.error(msg);
        }
      } catch (e) {
        throw e
      }
  }else{
    let msg=""
    if(includesOption==""){
      msg=`Please fill in the incude information`
    }else if(appid==""){
      msg=`Please fill in the appid information`
    }else{
      msg=`Please fill in the env information`
    }
    Notification.error(msg);
  }
  
}

async cancelClick(me){
    const { envVal }=me.state
    const { appid } = this.props.location.state
    if(appid!="" && envVal!=""){
      const url = '/atfcapi/registCenter/cancelTheAuthorization';
        try {
          const { code , msg } = await fetchX.post(url,{ appid,env:envVal});
          if (code === '200') {
             Notification.success(msg);
          } else {
            Notification.error(msg);
          }
        } catch (e) {
          throw e
        }
    }else{
      let msg=""
      if(appid==""){
        msg="Please fill in the appid information"
      }else{
        msg="Please fill in the env information"
      }
      Notification.error(msg);
    }

  }
  locaClick(){
    let hrefs = `http://wiki.ele.to:8090/pages/viewpage.action?pageId=66317402`
    window.open(hrefs)
  }
  render() {
    return (
      <div id="appidRegist" onClick={(e)=>{this.stateClick(e)}}>
        <Breadcrumb>
          <BreadcrumbItem href="#">
            Department
          </BreadcrumbItem>
          <BreadcrumbItem active>
            Appid Regist
          </BreadcrumbItem>
        </Breadcrumb>

        <div className="title_ipt">
          <Input
            type="text"
            label="AppId" 
            labelClassName="col-xs-4"
            wrapperClassName="col-xs-8"
            groupClassName="col-xs-4"
            name="appid"
            value={this.state.appid}
          >
          </Input>

          <Input
            type="select"
            label="Env"
            labelClassName="col-xs-4"
            wrapperClassName="col-xs-8"
            groupClassName="col-xs-4"
            name="envVal"
            value={this.state.envVal}
            onChange={e => this.handleChange(e)}
          >
            <option value="">--</option>
            {this.idOptions(this.state.envData)}
          </Input>

          <Button className="search" onClick={()=>{this.searchClick(this)}}>Search</Button>
        </div>

        <div className="infoForm">
          <h5 onClick={()=>{this.locaClick()}}>Click Here First</h5>
          <div className="selectIncludes col-xs-8" style={{display:this.state.includeState}}>
            <div className="selectDiv" >
              <Input name="includes" type="checkbox" value=""  label="--" />
              {this.state.includesMap==null ? [] : this.mapOptions(this.state.includesMap,"includes")}
            </div>
          </div>
          <div className="selectExcludes col-xs-8" style={{display:this.state.excludeState}}>
            <div className="selectDiv" >
              <Input name="excludes" type="checkbox" value=""  label="--" />
              {this.state.excludesMap==null ? [] : this.mapOptions(this.state.excludesMap,"excludes")}
            </div>
          </div> 
          <Input
            type="select"
            label="incudes"
            labelClassName="col-xs-4"
            wrapperClassName="col-xs-8"
            groupClassName="col-xs-4"
            name="includes"
            value={this.state.includesOptions}
            onClick={()=>{this.clickSelect()}}
          >
            <option value={this.state.includesOptions}>{this.state.includesOptions}</option>
          </Input>

          <Input
            type="select"
            label="excludes"
            labelClassName="col-xs-4"
            wrapperClassName="col-xs-8"
            groupClassName="col-xs-4"
            name="excludes"
            value={this.state.excludesOptions}
            onClick={()=>{this.clickexclude()}}
          >
            <option value={this.state.excludesOptions}>{this.state.excludesOptions}</option>
          </Input>
          <Input
            type="text"
            label="exclude classloader"
            labelClassName="col-xs-4"
            wrapperClassName="col-xs-8"
            groupClassName="col-xs-4"
            name="exclclassloader"
            value={this.state.exclclassloader}
            onChange={e => this.handleChange(e)}
          >
          </Input>

          <Input
            type="select"
            label="include bootstrap classes"
            labelClassName="col-xs-4"
            wrapperClassName="col-xs-8"
            groupClassName="col-xs-4"
            name="inclbootstrapclasses"
            value={this.state.inclbootstrapclasses}
            onChange={e => this.handleChange(e)}
          >
            <option value="true">true</option>
            <option value="false">false</option>
          </Input>

          <Input
            type="select"
            label="include no location class"
            labelClassName="col-xs-4"
            wrapperClassName="col-xs-8"
            groupClassName="col-xs-4"
            name="inclnolocationclasses"
            value={this.state.inclnolocationclasses}
            onChange={e => this.handleChange(e)}
          >
            <option value="true">true</option>
            <option value="false">false</option>
          </Input>

          <Input
            type="select"
            label="dump on exit"
            labelClassName="col-xs-4"
            wrapperClassName="col-xs-8"
            groupClassName="col-xs-4"
            name="dumponexit"
            value={this.state.dumponexit}
            onChange={e => this.handleChange(e)}
          >
            <option value="true">true</option>
            <option value="false">false</option>
          </Input>  

        </div>

        <div className="ButDiv">
          <Button bsStyle="primary" onClick={()=>{this.updataClick(this)}}>Update And Regist</Button>
          <Button bsStyle="primary" onClick={()=>{this.cancelClick(this)}}>Cancel The Authorization</Button>
        </div>
      </div>
    );
  }
}

export default AppidRegist;