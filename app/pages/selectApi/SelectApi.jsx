import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { Table, Pagination, Input, Button, Label, Breadcrumb, BreadcrumbItem, Tooltip, OverlayTrigger, Glyphicon } from 'react-bootstrap';
import { Notification } from 'atfcapi';
import fetchX from '../../vendor/Fetch';
import { getProjectEntries, getAppIds, resetAppIds, getServices, resetServices } from '../../actions/commonAction';

class SelectApi extends Component {
  constructor(props, context) {
    super(props, context);
    this.initState = {
      offset: 1,
      limit: 10,
      data: [],
      totalCount: 0,
      description: '',
      projectId: props.location.state.projectId,
      projectName: props.location.state.projectName,
      folderId: props.location.state.folderId,
      caseId: props.location.state.caseId,
      paths: '',
      allInfo: null,
      loading: false,
      pathId: 0,
      responseId: 0,
      bodyId: 0,
      showResponse: false,
      responseList: [],
      appId: 0,
      serviceId: 0,
    };
    this.state = this.initState;
    this.loadApiList = this.loadApiList.bind(this);
    this.handleFail = () => this.setState({
      loading: false,
    });
  }

  componentDidMount() {
    this.loadApiList();
  }

  loadApiList() {
    const {offset, limit, description, projectId, paths, appId, serviceId } = this.state;
    const condi = {
      offset: offset - 1,
      limit: limit,
      description: description,
      projectId: projectId,
      paths: paths,
      appId: appId,
      serviceId: serviceId,
    };

    fetchX.get('/atfcapi/apiQuery/list', condi)
    .then(json => {
      if (json.code === '200') {
        this.setState({
          data: json.data.dataList,
          pathId: json.data.dataList.length ? json.data.dataList[0].id : 0,
          allInfo: JSON.stringify(json.data.dataList[0]),
          totalCount: json.data.totalCount,
        });
      } else {
        this.handleFail(json.msg);
        Notification.error(json.msg || json.message);
      }
      this.loadProjects();
      this.loadAppIds();
    }).catch(err => Notification.error(err.message));
  }

  loadProjects() {
    const { projectList } = this.props;
    if (projectList.length) return;
    this.props.getProjectEntries(
      () => {},
      msg => Notification.error(msg)
    );
  }

  loadAppIds() {
    const { projectId, offset, limit } = this.state;
    if (!projectId) return;
    const condi = {
      offset: offset - 1,
      limit: limit,
      projectId: projectId,
    };
    this.props.getAppIds(condi,
      () => this.loadServices(),
      msg => Notification.error(msg)
    );
  }

  loadServices() {
    const { projectId, appId, offset, limit } = this.state;
    if (!projectId || !appId) return;
    const condi = {
      projectId: projectId,
      appId: appId,
      offset: offset - 1,
      limit: limit,
    };
    this.props.getServices(condi,
      () => {},
      msg => Notification.error(msg)
    );
  }

  loadResponseList(pathId) {
    fetchX.get('/atfcapi/apiQuery/getResponsesBodies', { pathId })
    .then(json => {
      if (json.code === '200') {
        this.setState({
          responseList: json.data || [],
          responseId: json.data && json.data.length > 0 ? json.data[0].responseId : 0,
          bodyId: json.data && json.data.length > 0 ? json.data[0].bodyId : 0,
        });
      } else {
        Notification.error(json.msg);
      }
    }).catch(err => Notification.error(err.message));
  }

  handleClick(item) {
    this.setState({
      pathId: item.id,
      allInfo: JSON.stringify(item),
    });
  }

  handleSelectResponse(item) {
    this.setState({
      responseId: item.responseId,
      bodyId: item.bodyId,
    });
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
      this.props.resetAppIds();
      this.props.resetServices();
      if (target.value !== '0') {
        this.loadAppIds();
      }
    }
    if (target.name === 'appId') {
      this.props.resetServices();
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

  handleSearch() {
    this.setState({
      offset: 1,
    }, this.loadApiList);
  }

  initLoad() {
    const init = this.initState;
    init.show = true;
    this.setState(init, this.loadApiList);
  }

  buildApiList() {
    const { data, projectId, projectName, folderId, caseId, pathId, limit, totalCount, appId, serviceId } = this.state;
    const { projectList, appIds, services } = this.props;
    const totalPage = Math.ceil(totalCount / limit);
    const list = data.map( (item, index) =>
      <tr key={index}>
        <td onClick={() => this.handleClick(item)}><input type="radio" defaultChecked={index === 0} name="pathId" /></td>
        <td>{item.id}</td>
        <td><code>{item.paths}</code></td>
        <td>{item.description}</td>
        <td className="label-td"><Label bsStyle="primary">{item.method ? item.method.toUpperCase() : ''}</Label></td>
      </tr>
    );
    const projectOptions = projectList.map( item =>
      <option key={item.projectId} value={item.projectId}>{item.projectName}</option>
    );
    const appIdOptions = appIds.map( item =>
      <option key={item.appId} value={item.appId}>{item.appIdName}</option>
    );
    const serviceNameOptions = services.map( item =>
      <option key={item.serviceId} value={item.serviceId}>{item.serviceName}</option>
    );
    const tooltip = (
      <Tooltip id="tooltip">插入API中的Body/Response 将使用 New API/Import API时提供的Body/Response</Tooltip>
    );
    return (
      <div>
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
            {projectOptions}
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
            {appIdOptions}
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
            {serviceNameOptions}
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
              <Button className="api-operate" onClick={() => this.initLoad()} >All</Button>
              <Button className="api-operate" bsStyle="primary" onClick={() => this.handleSearch()}>Search</Button>
            </div>
          </div>
        </form>
        <Table bordered condensed stripped>
          <thead>
            <tr>
              <th>Select</th>
              <th>ID</th>
              <th>Path</th>
              <th>API Description</th>
              <th>Method</th>
            </tr>
          </thead>
          <tbody>
            { data.length ? list :<tr><td colSpan="5">No data</td></tr> }
          </tbody>
        </Table>
        <div className="pagination-wrap">
          <Pagination
            prev
            next
            ellipsis
            first
            last
            boundaryLinks
            items={totalPage}
            maxButtons={10}
            activePage={this.state.offset}
            onSelect={this.handlePageSelect.bind(this)}
          />
          <span className="page-info">Total {totalPage} pages / {totalCount} records</span>
        </div>
        <span className="api-opt">
          <OverlayTrigger placement="top" overlay={tooltip}>
            <Glyphicon glyph="question-sign" />
          </OverlayTrigger>
          <Button disabled={!pathId} onClick={() => this.handleNext()}>Using Templates</Button>
          <Link to={{pathname: '/api/request/', state: { projectId, projectName, caseId, pathId, folderId, selectapi: this.props.location.key }}}><Button bsStyle="primary" disabled={!pathId} >Next</Button></Link>
        </span>
      </div>
    );
  }

  buildResponseList() {
    const { responseList, loading } = this.state;
    const list = responseList.map( (item, index) =>
      <tr key={index}>
        <td onClick={() => this.handleSelectResponse(item)}>
          <input type="radio" defaultChecked={index === 0} name="responseId" />
        </td>
        <td>{item.httpStatusCode}</td>
        <td>{item.httpStatusMsg}</td>
        <td><code>{JSON.stringify(item.body)}</code></td>
        <td><code>{JSON.stringify(item.responseData)}</code></td>
      </tr>
    );
    return (
      <div>
        <Table bordered condensed stripped className="response-table">
          <thead>
            <tr>
              <th>Select</th>
              <th>Http Status Code</th>
              <th>Http Status Message</th>
              <th>Body</th>
              <th>Response</th>
            </tr>
          </thead>
          <tbody>
            { responseList.length ? list: <tr><td colSpan="5">No data</td></tr> }
          </tbody>
        </Table>
        <span className="api-opt">
          <Button onClick={() => this.goBack()}>Previous</Button>
          <Button bsStyle="primary" disabled={loading} onClick={() => this.saveChange()}>{loading ? `Saving...` : `Save`}</Button>
        </span>
      </div>
    );
  }

  buildModalBody() {
    let body;
    const { showResponse } = this.state;
    body = showResponse ?
      this.buildResponseList()
      :
      this.buildApiList();
    return body;
  }

  handleNext() {
    const { pathId } = this.state;
    this.setState({
      showResponse: true,
    }, () => this.loadResponseList(pathId));
  }

  goBack() {
    this.setState({
      showResponse: false,
    });
  }

  saveChange() {
    const { caseId, folderId, pathId, responseId, bodyId } = this.state;
    const { projectId } = this.initState;
    const condi = {
      suiteId: caseId,
      pathId,
      responseId,
      bodyId,
    };
    fetchX.post('/atfcapi/suiteCase/insertCaseInfo', condi)
    .then(json => {
      if (json.code === '200') {
        location.href = `/#/project/${projectId}/folder/${folderId}/case/${caseId}`;
      } else {
        Notification.error(json.msg || json.message);
      }
    }).catch(err => Notification.error(err.message));
  }

  render() {
    const { projectName, folderId } = this.state;
    const { projectId } = this.initState;
    return (
      <main className="selectApi">
        <Breadcrumb>
          <BreadcrumbItem href="#">
            Home
          </BreadcrumbItem>
          <BreadcrumbItem>
            <Link to={{pathname: `/project/${projectId}/folder/${folderId}`, state: { projectId, projectName, folderId }}}>{projectName}</Link>
          </BreadcrumbItem>
          <BreadcrumbItem active>
            Select API
          </BreadcrumbItem>
        </Breadcrumb>
        { this.buildModalBody() }
      </main>
    );
  }
}

SelectApi.propTypes = {
  location: PropTypes.object,
  save: PropTypes.func,
  projectId: PropTypes.string,
  projectList: PropTypes.array,
  appIds: PropTypes.array,
  services: PropTypes.array,
  getProjectEntries: PropTypes.func,
  getAppIds: PropTypes.func,
  resetAppIds: PropTypes.func,
  getServices: PropTypes.func,
  resetServices: PropTypes.func,
};

const mapStateToProps = (state) => Object.assign({}, state.common);

export default connect(mapStateToProps, {
  getProjectEntries,
  getAppIds,
  resetAppIds,
  getServices,
  resetServices,
})(SelectApi);
