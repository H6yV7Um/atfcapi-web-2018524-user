import React from 'react';
import { Breadcrumb, BreadcrumbItem, Table } from 'react-bootstrap';

class Report extends React.Component {
  constructor(props) {
    super(props);
  }
  onPage(href){
    window.location.href=href
  }
  render() {
    let el=[];
    for(let key in this.props.location.state.obj){
        el.push(
          <tr>
            <td><p>{this.props.location.state.appid}</p></td>
            <td><p>{key}</p></td>
            <td onClick={()=>{this.onPage(this.props.location.state.obj[key])}}><p>{this.props.location.state.obj[key]}</p></td>
          </tr>   
        )
    }
    return(
      <div id="ipRegister">
        <Breadcrumb>
          <BreadcrumbItem href="#">
            Department
          </BreadcrumbItem>
          <BreadcrumbItem active>
            Ip Report
          </BreadcrumbItem>
        </Breadcrumb>
        <div className="tableDiv">
          <Table  bordered>
            <thead>
              <tr>
                <th>AppID</th>
                <th>Ip</th>
                <th>链接</th>
              </tr>
            </thead>
            <tbody>
              {el}
            </tbody>
          </Table>
        </div>
      </div>
    )
  }
}

export default Report;
