import React from 'react';
import { Link } from 'react-router';
import Cookies from 'js-cookie';
import { Breadcrumb, BreadcrumbItem, Table, Pagination, Input, Button, Label } from 'react-bootstrap';
import { DeleteDialog, Notification } from 'atfcapi';
import fetchX from '../../vendor/Fetch';

class ApiList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      offset: 1,
      limit: 10,
      data: [],
      totalCount: 0,
      description: '',
      projectId: Cookies.get('projectId'),
      paths: '',
      projects: [],
      appId: Cookies.get('appId'),
      appIds: [],
      serviceId: Cookies.get('serviceId'),
      services: [],
      gitVersionValue: [],
    };
  }

  componentDidMount() {
    this.loadApiList();
  }

  async loadServices() {
    const { projectId, appId, offset, limit } = this.state;
    if (!projectId || !appId) return;
    const params = {
      projectId,
      appId,
      offset: offset - 1,
      limit,
    };

    try {
      const { code, data, msg } = await fetchX.get('/atfcapi/uploadFile/queryServiceName', params);
      if (code === '200') {
        this.setState({
          services: data.list,
        });
      } else {
        Notification.error(msg);
      }
    } catch(err) {
      throw err
    }
  }

  async loadAppIds() {
    const { projectId, offset, limit } = this.state;
    if (!projectId) return;
    const params = {
      offset: offset - 1,
      limit,
      projectId,
    };

    try {
      const { code, data, msg } = await fetchX.get('/atfcapi/uploadFile/queryAppId', params);
      if (code === '200') {
        this.setState({
          appIds: data.list,
        });
      } else {
        Notification.error(msg);
      }
      this.loadServices();
    } catch(err) {
      throw err
    }
  }

  async loadProjects() {
    const { projects } = this.state;
    if (projects.length) return;

    try {
      const { code, data, msg } = await fetchX.get('/atfcapi/uploadFile/queryProject');
      if (code === '200') {
        this.setState({
          projects: data.list || [],
        });
      } else {
        Notification.error(msg);
      }
      this.loadAppIds();
    } catch(err) {
      throw err
    }
  }

  async loadApiList() {
    const { offset, limit, description, paths, projectId, appId, serviceId } = this.state;
    const params = {
      offset: offset - 1,
      limit,
      description,
      paths,
      projectId,
      appId,
      serviceId,
    };

    try {
      const { code, data, msg } = await fetchX.get('/atfcapi/apiQuery/list', params);
      if (code === '200') {
        this.setState({
          data: data.dataList,
          totalCount: data.totalCount,
        });
      } else {
        Notification.error(msg);
      }
      this.loadProjects();
    } catch(err) {
      throw err
    }
  }

  handlePageSelect(event, selectedEvent) {
    this.setState({
      offset: selectedEvent.eventKey,
    }, this.loadApiList);
  }

  handleChange(event) {
    const state = this.state;
    const target = event.target;
    state[target.name] = target.value;
    this.setState(state);
    if (target.name === 'projectId') {
      this.setState({
        appId: 0,
        appIds: [],
        serviceId: 0,
        services: [],
      });
      if (target.value !== '0') {
        this.loadAppIds();
      }
    }
    if (target.name === 'appId') {
      this.setState({
        serviceId: 0,
        services: [],
      });
      if (target.value !== '0') {
        this.loadServices();
      }
    }
  }

  handleInputChange(event) {
    const state = this.state;
    const target = event.target;
    state[target.name] = target.value;
    this.setState(state);
  }

  handleSelectChange(value) {
    this.setState({
      gitVersionValue: value
    })
  }

  handleSearch() {
    this.setState({
      offset: 1,
    }, this.loadApiList);
    const { projectId, appId, serviceId } = this.state;
    Cookies.set('projectId', projectId);
    Cookies.set('appId', appId);
    Cookies.set('serviceId', serviceId);
  }

  resetList() {
    this.setState({
      offset: 1,
      description: '',
      pathId: null,
      projectId: null,
      paths: '',
    }, this.loadApiList);
  }

  async handleDelete(data) {
    const { id } = data;

    try {
      const { code, msg } = await fetchX.get('/atfcapi/newApi/deleteNewAPI', { id });
      Notification[code === '200' ? 'success' : 'error'](msg);
      this.loadApiList();
      this.refs.delete.close();
    } catch(err) {
      throw err
    }
  }

  buildApiList() {
    const { data } = this.state;
    const list = data.map( item =>
      <tr key={item.id}>
        <td>{item.id}</td>
        <td><code>{item.paths}</code></td>
        <td>{item.description}</td>
        <td className="label-td"><Label bsStyle="primary">{item.method.toUpperCase()}</Label></td>
        <td>
          <Link to={{ pathname: `/api/${item.id}`}}>
            Modify
          </Link>
          <a
            href="javascript:;"
            onClick={() => this.refs.delete.show({
              text: item.path,
              data: item,
            })}
          >
            Delete
          </a>
        </td>
      </tr>
    );
    return list;
  }

  buildProjectList() {
    const { projects } = this.state;
    return projects.map( item =>
      <option key={item.projectId} value={item.projectId}>{item.projectName}</option>
    );
  }

  buildAppIdList() {
    const { appIds } = this.state;
    if (!appIds) return '';// 首次请求接口时有返回list=null的情况
    return appIds.map( item =>
      <option key={item.appId} value={item.appId}>{item.appIdName}</option>
    );
  }

  buildServiceNameList() {
    const { services } = this.state;
    return services.map( item =>
      <option key={item.serviceId} value={item.serviceId}>{item.serviceName}</option>
    );
  }

  render() {
    const { totalCount, limit, projectId, appId, serviceId } = this.state;
    const totalPage = Math.ceil(totalCount / limit);
    const list = this.buildApiList();
    const projectList = this.buildProjectList();
    const AppIdList = this.buildAppIdList();
    const serviceNameList = this.buildServiceNameList();

    return (
      <div id="apiList">
        <Breadcrumb>
          <BreadcrumbItem href="#">
            Home
          </BreadcrumbItem>
          <BreadcrumbItem active>
            API List
          </BreadcrumbItem>
        </Breadcrumb>
        <form className="form-horizontal">
          <Input
            type="select"
            label="Project"
            labelClassName="col-xs-4"
            wrapperClassName="col-xs-8"
            groupClassName="col-xs-4"
            name="projectId"
            value={projectId}
            onChange={e => this.handleChange(e)}
          >
            <option value="0">--</option>
            {projectList}
          </Input>
          <Input
            type="select"
            label="AppId"
            labelClassName="col-xs-4"
            wrapperClassName="col-xs-8"
            groupClassName="col-xs-4"
            name="appId"
            value={appId}
            onChange={e => this.handleChange(e)}
          >
            <option value="0">--</option>
            {AppIdList}
          </Input>
          <Input
            type="select"
            label="Service Name"
            labelClassName="col-xs-5"
            wrapperClassName="col-xs-7"
            groupClassName="col-xs-4"
            name="serviceId"
            value={serviceId}
            onChange={e => this.handleChange(e)}
          >
            <option value="0">--</option>
            {serviceNameList}
          </Input>
          <Input
            type="text"
            label="Description"
            labelClassName="col-xs-4"
            wrapperClassName="col-xs-8"
            groupClassName="col-xs-4"
            name="description"
            onChange={e => this.handleInputChange(e)}
          />
          <Input
            type="text"
            label="Path"
            labelClassName="col-xs-4"
            wrapperClassName="col-xs-8"
            groupClassName="col-xs-4"
            name="paths"
            onChange={e => this.handleInputChange(e)}
          />
          <div className="form-group col-xs-4">
            <div className="col-xs-12">
              <Button className="api-operate" onClick={() => this.resetList()} >All</Button>
              <Button className="api-operate" bsStyle="primary" onClick={() => this.handleSearch()}>Search</Button>
            </div>
          </div>
        </form>
        <Table bordered condensed stripped>
          <thead>
            <tr>
              <th>ID</th>
              <th>Path</th>
              <th>API Description</th>
              <th>Method</th>
              <th>Operation</th>
            </tr>
          </thead>
          <tbody>
            {list}
          </tbody>
        </Table>
        <div className="atfc-pager">
          <Pagination
            prev
            next
            first
            last
            ellipsis
            boundaryLinks
            items={totalPage}
            maxButtons={10}
            activePage={this.state.offset}
            onSelect={(event, selectedEvent) => this.handlePageSelect(event, selectedEvent)}
          />
          <span className="page-info">Total {totalPage} pages / {totalCount} records</span>
        </div>

        <DeleteDialog
          ref="delete"
          title="API"
          delete={target => this.handleDelete(target.data)}
        />
      </div>
    );
  }
}

export default ApiList;
