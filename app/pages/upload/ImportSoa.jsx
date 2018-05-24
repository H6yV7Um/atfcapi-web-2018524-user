import React from 'react';
import { Breadcrumb, BreadcrumbItem, Panel, Input, ButtonInput, Well, Modal} from 'react-bootstrap';
import { Notification } from 'atfcapi';
import fetchX from '../../vendor/Fetch';

class ImportSoa extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      projectId: 0,
      projects: [],
      appId: 0,
      appIds: [],
      serviceId: 0,
      services: [],
      groupId: '',
      artifactId: '',
      version: '',
      interfaces: '',
      loading: false,
      showWell: false,
    };
  }

  componentDidMount() {
    this.loadProjects();
  }

  loadProjects() {
    const { projects } = this.state;
    if (projects.length) return;
    fetchX.get('/atfcapi/uploadFile/queryProject', {
      offset: 0,
      limit: 500,
    })
    .then(json => {
      if (json.code === '200') {
        this.setState({
          projects: json.data.list || [],
        });
      } else {
        Notification.error(json.msg || json.message);
      }
    });
  }

  loadAppIds() {
    const { projectId } = this.state;
    if (!projectId) return;
    fetchX.get('/atfcapi/uploadFile/queryAppId', {
      offset: 0,
      limit: 500,
      projectId: projectId,
    })
    .then(json => {
      if (json.code === '200') {
        this.setState({
          appIds: json.data.list || [],
        });
      } else {
        Notification.error(json.msg || json.message);
        return;
      }
    });
  }

  loadServices() {
    const { projectId, appId } = this.state;
    if (!projectId || !appId) return;
    fetchX.get('/atfcapi/uploadFile/queryServiceName', {
      offset: 0,
      limit: 500,
      projectId: projectId,
      appId: appId,
    })
    .then(json => {
      if (json.code === '200') {
        this.setState({
          services: json.data.list || [],
        });
      } else {
        Notification.error(json.msg || json.message);
        return;
      }
    });
  }

  handleChange(e) {
    const state = this.state;
    const target = e.target;
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
    } else if (target.name === 'appId') {
      this.setState({
        serviceId: 0,
        services: [],
      });
      if (target.value !== '0') {
        this.loadServices();
      }
    }
  }

  buildProjectList() {
    const { projects } = this.state;
    const projectList = projects ?
      projects.map( item =>
        <option key={item.projectId} value={item.projectId}>{ item.projectName }</option>
      )
      : '';
    return projectList;
  }

  buildAppIdList() {
    const { appIds } = this.state;
    const appIdList = appIds ?
      appIds.map( item =>
        <option key={item.appId} value={item.appId}>{ item.appIdName }</option>
      )
      : '';
    return appIdList;
  }

  buildServiceNameList() {
    const { services } = this.state;
    const serviceNameList = services ?
      services.map( item =>
        <option key={item.serviceId} value={item.serviceId}>{ item.serviceName }</option>
      )
      : '';
    return serviceNameList;
  }

  handleImport() {
    const { serviceId, groupId, artifactId, version, interfaces } = this.state;
    const arr = [];
    arr.push({name: 'Service Name', value: serviceId});
    arr.push({name: 'GroupId', value: groupId});
    arr.push({name: 'ArtifactId', value: artifactId});
    arr.push({name: 'Version', value: version});
    arr.push({name: 'Interfaces', value: interfaces});
    const errMsg = this.importValidate(arr);
    if (errMsg !== '') {
      Notification.info('Please fill in the required fields：' + errMsg);
      return;
    }
    // 校验interfaces是不是jsonArray
    try {
      JSON.parse(interfaces);
      if (typeof(JSON.parse(interfaces)) === 'number' || typeof(JSON.parse(interfaces)) === 'string') throw '不是json';
    } catch (err) {
      Notification.error('Interfaces field JSON format checksum error: ' + err);
      return;
    }
    const condi = {
      serviceId: serviceId,
      groupId: groupId,
      artifactId: artifactId,
      version: version,
      interfaces: interfaces,
    };
    this.setState({loading: true});
    fetchX.fetch('/atfcapi/newApi/generateApiTemplate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(condi),
    }).then(json => {
      if (json.code === '200') {
        this.setState({
          loading: false,
          showWell: true,
        });
      } else {
        this.setState({loading: false});
        Notification.error(json.msg || json.message);
      }
    });
  }

  importValidate(arr) {
    let errMsg = '';
    for (const i in arr) {
      if (!arr[i].value) {
        errMsg = errMsg + arr[i].name + ',';
      }
    }
    return errMsg;
  }

  handleBack() {
    this.setState({
      groupId: '',
      artifactId: '',
      version: '',
      interfaces: '',
    });
  }

  render() {
    const { projectId, appId, serviceId, groupId, artifactId, version, interfaces, loading, showWell } = this.state;
    const projectList = this.buildProjectList();
    const appIdList = this.buildAppIdList();
    const serviceNameList = this.buildServiceNameList();
    const well = showWell ? <Well bsSize="small">SOA 导入完成!</Well> : '';
    const mask = (
      <Modal backdrop="static" dialogClassName="upload-form" show={loading}>
        <Modal.Header>
          <Modal.Title>Importing . . .</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="loading">
            <div className="loading-img"></div>
          </div>
        </Modal.Body>
        <Modal.Footer></Modal.Footer>
      </Modal>
    );

    return (
      <div id="import-soa">
        <Breadcrumb>
          <BreadcrumbItem href="#">
            Home
          </BreadcrumbItem>
          <BreadcrumbItem active>
            Import SOA
          </BreadcrumbItem>
        </Breadcrumb>
        <Panel header="SOA Base Info">
          <form className="form-horizontal">
            <div className="select-list">
              <Input
                type="select"
                label="Project"
                labelClassName="col-xs-3"
                wrapperClassName="col-xs-8"
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
                labelClassName="col-xs-3"
                wrapperClassName="col-xs-8"
                name="appId"
                value={appId}
                onChange={e => this.handleChange(e)}
              >
                <option value="0">--</option>
                {appIdList}
              </Input>
              <Input
                type="select"
                label="Service Name"
                labelClassName="col-xs-4"
                wrapperClassName="col-xs-8"
                name="serviceId"
                value={serviceId}
                onChange={e => this.handleChange(e)}
              >
                <option value="0">--</option>
                {serviceNameList}
              </Input>
            </div>
            <div className="input-list">
              <Input
                type="text"
                label="GroupId"
                labelClassName="col-xs-3"
                wrapperClassName="col-xs-6"
                name="groupId"
                value={groupId}
                onChange={e => this.handleChange(e)}
                placeholder="*"
              />
              <Input
                type="text"
                label="ArtifactId"
                labelClassName="col-xs-3"
                wrapperClassName="col-xs-6"
                name="artifactId"
                value={artifactId}
                onChange={e => this.handleChange(e)}
                placeholder="*"
              />
              <Input
                type="text"
                label="Version"
                labelClassName="col-xs-3"
                wrapperClassName="col-xs-6"
                name="version"
                value={version}
                onChange={e => this.handleChange(e)}
                placeholder="*"
              />
              <Input
                type="textarea"
                label="Interfaces"
                labelClassName="col-xs-3"
                wrapperClassName="col-xs-6"
                name="interfaces"
                value={interfaces}
                onChange={e => this.handleChange(e)}
                placeholder='Please enter json array, such as [ "me.ele.service1", "me.ele.service2"], enter only [], default import all the interfaces'
              />
            </div>
            <div className="import-soa-btn">
              <ButtonInput
                type="button"
                disabled={loading}
                value={loading ? `Importing` : `Import`}
                bsStyle="primary"
                onClick={() => this.handleImport()}
                wrapperClassName="col-xs-offset-1 col-xs-3"
              />
              <ButtonInput
                type="button"
                disabled={false}
                value="Clear"
                bsStyle="primary"
                onClick={() => this.handleBack()}
                wrapperClassName="col-xs-offset-1 col-xs-3"
              />
            </div>
            { well }
            { mask }
          </form>
        </Panel>
      </div>
    );
  }
}

export default ImportSoa;
