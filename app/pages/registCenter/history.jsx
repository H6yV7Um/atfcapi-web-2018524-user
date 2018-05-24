import React from 'react';
import { Breadcrumb, BreadcrumbItem, Table, Pagination } from 'react-bootstrap';
import { Notification } from 'atfcapi';
import fetchX from '../../vendor/Fetch';

class History extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        historyData:[],
        newhistoryData:[],
        activePage:1,
        pageContain:0,
        pages:0
    };
  }
  componentDidMount() {
    this.getDiffCoverageHistory();
  }
  async getDiffCoverageHistory() {
    let arr = this.props.params.newkey.split("--")
    const idUrl = '/atfcapi/registCenter/getDiffCoverageHistory?appId='+arr[0]+'&env='+arr[1];
    try {
      const { code , msg , data = {} } = await fetchX.get(idUrl);
      if (code === '200') {
        this.setState({
          historyData: data.historyList || [],
          newhistoryData:data.historyList.slice(0,data.pageContain),
          pageContain: data.pageContain,
          pages:Math.ceil(data.count/data.pageContain)
        })
      } else {
        Notification.error(msg);
      }
    } catch (e) {
      throw e
    }
  }
  onPage(href){
      window.location.href=href
  }
  handlePageSelect(event, selectedEvent) {
    this.setState({
      activePage: selectedEvent.eventKey,
      newhistoryData:this.state.historyData.slice((selectedEvent.eventKey-1)*this.state.pageContain,selectedEvent.eventKey*this.state.pageContain)
    });
  }
  render() {
    let el=[];
    el=this.state.newhistoryData.map((obj)=>{
      return(
        <tr>
          <td><p>{obj.created_at}</p></td>
          <td><p>{obj.appid}</p></td>
          <td><p>{obj.git_commit}和{obj.git_commit_prod}</p></td>
          <td><p>{obj.ipaddress}</p></td>
          <td onClick={()=>{this.onPage(obj.resulturl)}}><p>{obj.resulturl}</p></td>
        </tr>
      )
    })
    return(
      <div id="ipRegister">
        <Breadcrumb>
          <BreadcrumbItem href="#">
            Department
          </BreadcrumbItem>
          <BreadcrumbItem active>
            Ip History
          </BreadcrumbItem>
        </Breadcrumb>
        <div className="tableDiv">
          <Table  bordered>
            <thead>
              <tr>
                <th>时间</th>
                <th>AppID</th>
                <th>git版本</th>
                <th>IP</th>
                <th>链接</th>
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
      </div>
    )
  }
}
export default History;
