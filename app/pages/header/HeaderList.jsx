import React from 'react';
import { Breadcrumb, BreadcrumbItem, Table, Pagination, Button } from 'react-bootstrap';
import { DeleteDialog, ServiceFilter, Notification } from 'atfcapi';
import NewHeader from './NewHeader';
import fetchX from '../../vendor/Fetch';

const header = JSON.parse(localStorage.getItem('header')) || {};

class HeaderList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      offset: 1,
      limit: 10,
      projectId: header.projectId || 0,
      appId: header.appId || 0,
      serviceId: header.serviceId || 0,
      totalCount: 0,
      data: [],
    };
  }

  componentDidMount() {
    this.loadHeaderList();
    localStorage.removeItem('header, project');
  }

  async loadHeaderList() {
    const { projectId, appId, serviceId, offset, limit } = this.state;
    const params = {
      projectId: projectId,
      appId: appId,
      serviceId: serviceId,
      offset: offset - 1,
      limit: limit,
    };
    try {
      const { code, data, msg } = await fetchX.get('/atfcapi/commonHeader/queryHeader', params);
      if (code === '200') {
        this.setState({
          data: data.list || [],
          totalCount: data.total,
        });
      } else {
        Notification.error(msg);
      }
    } catch (err) {
      throw err;
    }
  }

  handleSearch(projectId, appId, serviceId) {
    this.setState({
      offset: 1,
      projectId,
      appId,
      serviceId: parseInt(serviceId, 10),
    }, this.loadHeaderList);
    const obj = {
      projectId,
      appId,
      serviceId,
    };
    localStorage.setItem('header', JSON.stringify(obj));
  }

  handlePageSelect(event, selectedEvent) {
    this.setState({
      offset: selectedEvent.eventKey,
    }, this.loadHeaderList);
  }

  async handleDelete(data) {
    const params = {
      serviceId: data.serviceId,
    };
    const { code, msg } = await fetchX.get(`/atfcapi/commonHeader/deleteHeader`, params);
    Notification[code === '200' ? 'success' : 'error'](msg);
    this.refs.delete.close();
    this.loadHeaderList();
  }

  handleNewHeader() {
    const { projectId, appId, serviceId } = this.state;
    this.refs.headerDetail.show({
      type: 'ADD',
      params: {
        projectId: projectId,
        appId: appId,
        serviceId: serviceId,
      },
    });
  }

  render() {
    const { data, offset, limit, totalCount, serviceId } = this.state;
    const totalPage = Math.ceil(totalCount / limit);
    const pager = totalPage > 1 ?
      <Pagination
        prev
        next
        ellipsis
        boundaryLinks
        items={totalPage}
        maxButtons={10}
        activePage={offset}
        onSelect={(event, selectedEvent) => this.handlePageSelect(event, selectedEvent)}
      />
      :
      null;

    const listDom = data.map( (item, index) =>
      <tr key={index}>
        <td>{index + 1}</td>
        <td>{item.projectName}</td>
        <td>{item.appIdName}</td>
        <td>{item.serviceName}</td>
        <td>
          <a
            href="javascript:;"
            onClick={() => this.refs.headerDetail.show({
              type: 'UPDATE',
              params: {
                projectId: item.projectId,
                appId: item.appId,
                serviceId: item.serviceId,
              },
            })}
          >
            Modify
          </a>
          <a
            href="javascript:;"
            onClick={() => this.refs.delete.show({
              text: `service ${item.serviceName}'s header`,
              data: item,
            })}
          >
            Delete
          </a>
        </td>
      </tr>
    );
    const newHeader = serviceId ?
      <Button bsStyle="primary" onClick={() => this.handleNewHeader()}>New Header</Button>
      :
      null;

    return (
      <div id="header">
        <Breadcrumb>
          <BreadcrumbItem href="#">
            Home
          </BreadcrumbItem>
          <BreadcrumbItem active>
            Header List
          </BreadcrumbItem>
        </Breadcrumb>
        <ServiceFilter header={header} callback={(a, b, c) => this.handleSearch(a, b, c)} />
        <Table bordered stripped hover condensed response className="header-list">
          <thead>
            <tr>
              <th></th>
              <th>Project</th>
              <th>AppId</th>
              <th>Service</th>
              <th>Operation</th>
            </tr>
          </thead>
          <tbody>
            { data.length ? listDom : <tr><td colSpan="5">No data {newHeader}</td></tr> }
          </tbody>
        </Table>
        {pager}
        <DeleteDialog
          ref="delete"
          title="Header"
          delete={target => this.handleDelete(target.data)}
        />
        <NewHeader
          ref="headerDetail"
          refresh={() => this.loadHeaderList()}
        />
      </div>
    );
  }
}

export default HeaderList;
