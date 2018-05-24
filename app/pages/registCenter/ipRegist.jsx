import React from 'react';
import { Breadcrumb, BreadcrumbItem, Table, Pagination, Input, Button } from 'react-bootstrap';
import { Notification } from 'atfcapi';
import fetchX from '../../vendor/Fetch';

class IdRegist extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      clusterData:[],
      tableData:[],
      newTabData:[],
      envData:[],
      appIdVal: this.props.location.state.appid,
      envVal: "",
      clusterVal:"",
      iplen:10,
      pages: 0,
      activePage: 1,
      state:true,
      divState:false,
      atrState:false
    };
  }
  componentDidMount() {
    this.getEnv()
  }
async  getEnv(){
  const envUrl = '/atfcapi/registCenter/getEnv';
    try {
      const { code , msg , data = {} } = await fetchX.get(envUrl);
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
async  getCluster(val){
    const url = '/atfcapi/registCenter/checkAppid';
    let { appIdVal }=this.state,me=this
    try {
        const { code , msg , data = {} } =await fetchX.post(url,{appid:appIdVal,env:val});
          if (code === '200') {
            if(data){
              const clusters=await fetchX.post("/atfcapi/registCenter/clusterList",{appid:appIdVal,env:val});
              if(clusters.code === '200'){
                me.setState({
                    state:false,
                    clusterData:clusters.data
                })
              }else{
                Notification.error(clusters.msg);
              }
            }else{
              Notification.error('请为此Ip授权');
              me.setState({
                    state:true,
                    divState:false
                })
            }
            } else {
              Notification.error(msg);
            }
    } catch (e) {
      throw e
    }
  }
  handleChange(e){
    let Ename={};
        Ename[e.target.name]=e.target.value;
        this.setState(Ename)
  }
  handleChangeEnv(e){
    let Ename={};
    Ename[e.target.name]=e.target.value;
    Ename.state=true
    Ename.divState=false
    Ename.clusterVal=""
    this.setState(Ename)
    if(e.target.value!=""){
      this.getCluster(e.target.value)
    }
  }
  idOptions(arr){
    return arr.map((val)=>{
      return (<option value={val}>{val}</option>)
    })
  }
  handlePageSelect(event, selectedEvent) {
    this.setState({
      activePage: selectedEvent.eventKey,
      newTabData:this.state.tableData.slice((selectedEvent.eventKey-1)*this.state.iplen,selectedEvent.eventKey*this.state.iplen)
    });
  }
 async searchClick(){
    const url = '/atfcapi/registCenter/ipList ';
    const {appIdVal,envVal,clusterVal}=this.state
      this.setState({
        activePage:1,
        divState:false
      })
      try {
        const { code , msg , data = {}} = await fetchX.post(url,{appid:appIdVal,env:envVal,cluster:clusterVal});
        if (code === '200') {
          this.setState({
            tableData:data,
            newTabData:data.slice((this.state.activePage-1)*this.state.iplen,this.state.iplen*this.state.activePage),
            divState:true,
            pages:Math.ceil(data.length/this.state.iplen)
          })
          Notification.success(msg);
        } else {
          Notification.error(msg);
        }
      } catch (e) {
        throw e
      }
  }
 async tdClick(mate,sta,idnum){
   const {appIdVal,envVal,clusterVal}=this.state
   if(sta==-1){
      const url = '/atfcapi/registCenter/deleteOutOfDateIp';
      let arrDate=this.state.tableData
          arrDate.splice(idnum,1)
          try {
            const { code , msg } =await fetchX.post(url,{appid:appIdVal,env:envVal,cluster:clusterVal,ip:mate});
            if (code === '200') {
              this.setState({
                newTabData:arrDate.slice((this.state.activePage-1)*this.state.iplen,this.state.iplen*this.state.activePage),
                tableData:arrDate
              })
              Notification.success(msg);
            } else {
              Notification.error(msg);
            }
          } catch (e) {
            throw e
          }

   }else{
     let url = '/atfcapi/registCenter/changeElecocoClusterStatus';
     let status,idNum;
     if(sta=="0"){
       status=true
       idNum=1
       this.setState({
         atrState:true
       })
     }else{
       status=false 
       idNum=0
     }
      try {
        const { code , msg , data } = await fetchX.post(url,{appid:appIdVal,env:envVal,cluster:clusterVal,ip:mate,regist:status});
        if (code === '200') {
          if(data){
            this.setState({
              tableData:this.state.tableData.map((obj)=>{
                  for(let key in obj){
                    if(key==mate){
                        obj[key]=idNum
                      }
                    }
                  return obj;
              })
            })
            Notification.success(`status change success`);
          }else{
            Notification.error(`status change error`);
          }
          this.setState({
            atrState:false
          })
        } else {
          this.setState({
            atrState:false
          })
          Notification.error(msg);
        }
      } catch (e) {
        throw e
      }
   }
  }   
 async changeClick(state){
    const url = '/atfcapi/registCenter/changeElecocoClusterStatusAll';
    const {appIdVal,envVal,clusterVal}=this.state
      this.setState({
          atrState:true
        })
      try {
        const { code , msg , data = {} } = await fetchX.post(url,{appid:appIdVal,env:envVal,cluster:clusterVal,regist:state});
        if (code === '200') {
          this.setState({
            tableData : data,
            atrState:false,
            newTabData : data.slice((this.state.activePage-1)*this.state.iplen,this.state.iplen*this.state.activePage)
          })
          Notification.success(msg);
        } else {
          this.setState({
            atrState:false
          })
          Notification.error(msg);
        }
      } catch (e) {
        throw e
      }
  }
  render() {
    let el=(<div></div>);
    let elList=[]
    let ipArr=[]
    let staArr=[]
    let atrDiv
    if(this.state.newTabData.length>0){
      this.state.newTabData.map((obj)=>{
        for(let key in obj){
          ipArr.push(key)
          staArr.push(obj[key])
        }

      })
    }
    if(this.state.atrState){
      atrDiv=(<div className="upDiv">status changing···</div>)
    }else{
      atrDiv=(<div style={{display:"none"}}></div>)
    }
    if(ipArr.length>0){
      elList=ipArr.map((val,ind)=>{
        let uiState=""
        let ipState=""
        if(staArr[ind]=="-1"){
          uiState="delete"
          ipState="out of delete"
        }else if(staArr[ind]=="0"){
          uiState="turn up"
          ipState="down"
        }else{
          uiState="turn down"
          ipState="up"
        }

        return (<tr key={ind}>
          <td>{val}</td>
          <td>{ipState}</td>
          <td style={{color:"#337ab7"}} onClick={()=>{this.tdClick(val,staArr[ind],ind)}}>{uiState}</td>
        </tr>)
      })
    }

   if(this.state.divState){
     el=(<div className="tableBox">
       <Table striped bordered condensed hover>
         <thead>
           <tr>
             <th>Ip</th>
             <th>Status</th>
             <th>Operation</th>
           </tr>
         </thead>
         <tbody>
           {elList}
         </tbody>
       </Table>
       <div className="ButDiv">
         <Button block onClick={()=>{this.changeClick(true)}}>turn up all</Button>
         <Button block onClick={()=>{this.changeClick(false)}}>turn down all</Button>
       </div>
       <Pagination
         prev
         next
         first
         last
         ellipsis
         boundaryLinks
         items={this.state.pages}
         maxButtons={this.state.iplen}
         activePage={this.state.activePage}
         onSelect={(event, selectedEvent) => this.handlePageSelect(event, selectedEvent)}
       />
     </div>)
   }
    return (
      <div id="idRegist">
        {atrDiv}
        <Breadcrumb>
          <BreadcrumbItem href="#">
            Department
          </BreadcrumbItem>
          <BreadcrumbItem active>
            Ip Regist
          </BreadcrumbItem>
        </Breadcrumb>
        <div className="title_ipt">
          <Input
            type="text"
            label="AppId"
            labelClassName="col-xs-4"
            wrapperClassName="col-xs-8"
            groupClassName="col-xs-4"
            name="appIdVal"
            value={this.state.appIdVal}
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
            onChange={e => this.handleChangeEnv(e)}
          >
            <option value="">--</option>
            {this.idOptions(this.state.envData)}
          </Input>

          <Input
            type="select"
            label="Cluster"
            labelClassName="col-xs-4"
            wrapperClassName="col-xs-8"
            groupClassName="col-xs-4"
            name="clusterVal"
            disabled={this.state.state}
            value={this.state.clusterVal}
            onChange={e => this.handleChange(e)}
          >
            <option value="">--</option>
            {this.idOptions(this.state.clusterData)}
          </Input>

          <Button className="search" disabled={this.state.state} onClick={()=>{this.searchClick()}}>Search</Button>
        </div>
        {el}
      </div>
    );
  }
}

export default IdRegist;
