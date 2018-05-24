import React, { Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { Table, Button, Glyphicon, Breadcrumb, BreadcrumbItem } from 'react-bootstrap';
import { DeleteDialog, Notification } from 'atfcapi';
import AppIdModal from './AppIdModal';
import { updateConfig, getConfigList } from '../../actions/commonAction';

class ProjectConfig extends Component {
  constructor(props) {
    super(props);
    this.state = {
      projectId: props.params.projectId,
    };
  }

  componentDidMount() {
    this.getConfigDetail();
  }

  getConfigDetail() {
    const { projectId } = this.state;
    this.props.getConfigList({ projectId },
      () => {},
      msg => Notification.error(msg)
    );
  }

  handleAppId({index, name, descrip, appId, serviceId, isDelete}) {
    let url;
    let type = 'GET';
    const { projectId } = this.state;
    const condi = {};
    if (isDelete) {
      if (serviceId) {
        // delete serviceId
        condi.serviceId = serviceId;
        url = '/atfcapi/commonConfig/deleteService';
      } else {
        // delete appId
        condi.appId = index;
        url = '/atfcapi/commonConfig/deleteAppIdName';
      }
    } else if (serviceId) {
      // update service
      condi.projectId = projectId;
      condi.serviceId = serviceId;
      condi.serviceName = name;
      condi.serviceDescription = descrip;
      type = 'POST';
      url = '/atfcapi/commonConfig/updateService';
    } else if (appId) {
      // insert service
      condi.projectId = projectId;
      condi.appId = appId;
      condi.serviceName = name;
      condi.serviceDescription = descrip;
      type = 'POST';
      url = '/atfcapi/commonConfig/insertService';
    } else if (!index) {
      // new appId
      condi.projectId = projectId;
      condi.appIdName = name;
      url = '/atfcapi/commonConfig/insertAppIdName';
    } else {
      // update appId
      condi.appId = index;
      condi.appIdName = name;
      url = 'atfcapi/commonConfig/updateAppIdName';
    }

    this.props.updateConfig(type, url, condi,
      () => {
        this.refs.appId.close();
        this.refs.delete.close();
        this.getConfigDetail();
      },
      msg => Notification.error(msg)
    );
  }

  handleEditAppId(name, id) {
    this.refs.appId.show({
      name: name,
      id: id,
    });
  }

  handleEditService(id, service) {
    const { data } = this.state;
    this.refs.appId.show({
      appId: id,
      name: service.serviceName,
      descrip: service.serviceDescription,
      serviceId: service.serviceId,
      data: data,
    });
  }

  handleDeleteAppId(obj) {
    this.refs.delete.show({
      index: obj.appId,
      text: obj.appIdName,
    });
  }

  handleDeleteService(obj) {
    this.refs.delete.show({
      serviceId: obj.serviceId,
      text: obj.serviceName,
    });
  }

  buildConfigHtml(data) {
    const {projectId} = this.state;
    const html = [];
    for (let i = 0; i < data.length; i++) {
      const len = data[i].serviceList ? data[i].serviceList.length : 0;
      html.push(
        <tr key={'i' + i}>
          <td rowSpan={len}>
            {data[i].appIdName}
            {/*
              <a href="javacript:;" onClick={this.handleEditAppId.bind(this, data[i].appIdName, data[i].appId)}>
              <Glyphicon glyph="edit" />
              </a>
            */}
            <a href="javacript:;" onClick={this.handleDeleteAppId.bind(this, data[i])}>
              <Glyphicon glyph="remove" />
            </a>
          </td>
          <td>{len ? data[i].serviceList[0].serviceName : 'No data'}</td>
          <td>{len ? data[i].serviceList[0].serviceDescription : 'No data'}</td>
          <td>
            { len ?
              <div>
                <Link to={{ pathname: `/project/${projectId}/config/env`, query: { serviceId: data[i].serviceList[0].serviceId } }}>
                  Detailed environment configuration
                </Link>
                <a
                  href="javascript:;"
                  onClick={this.handleEditService.bind(this, data[i].appId, data[i].serviceList[0])}
                >
                  Edit
                </a>
                <a href="javascript:;" onClick={this.handleDeleteService.bind(this, data[i].serviceList[0])}>
                  Delete
                </a>
              </div>
              :
              '--'
            }
          </td>
        </tr>
      );
      for (let j = 1; j < len; j++) {
        html.push(
          <tr key={'i' + i + 'j' + j}>
            <td>{data[i].serviceList[j].serviceName}</td>
            <td>{data[i].serviceList[j].serviceDescription}</td>
            <td>
              <Link to={{ pathname: `/project/${projectId}/config/env`, query: { serviceId: data[i].serviceList[j].serviceId } }}>
                Detailed environment configuration
              </Link>
              <a
                href="javascript:;"
                onClick={this.handleEditService.bind(this, data[i].appId, data[i].serviceList[j])}
              >
                Edit
              </a>
              <a href="javascript:;" onClick={this.handleDeleteService.bind(this, data[i].serviceList[j])}>
                Delete
              </a>
            </td>
          </tr>
        );
      }
    }

    return html;
  }

  render() {
    let configHtml;
    const { configInfo = {} } = this.props;
    const { projectName = '', dataList = [] } = configInfo;
    if (dataList.length > 0) {
      configHtml = this.buildConfigHtml(dataList);
    } else {
      configHtml = (
        <tr>
          <td colSpan="4">No data</td>
        </tr>
      );
    }
    return (
      <div id="config">
        <Breadcrumb>
          <BreadcrumbItem href="#">
            Home
          </BreadcrumbItem>
          <BreadcrumbItem active>
            Project Config
          </BreadcrumbItem>
        </Breadcrumb>
        <h4>Project: {projectName}</h4>
        <Table responsive bordered striped hover>
          <thead>
            <tr>
              <th>AppId</th>
              <th>Service Name</th>
              <th>Service Description</th>
              <th>operation</th>
            </tr>
          </thead>
          <tbody>
            { configHtml }
          </tbody>
        </Table>
        <div className="btn-panel">
          <Button
            bsStyle="primary"
            onClick={() => this.refs.appId.show({})}
          >
            Add AppId
          </Button>
          <Button
            bsStyle="primary"
            onClick={() => this.refs.appId.show({
              data: dataList,
            })}
          >
            Add Service Name
          </Button>
        </div>
        <AppIdModal
          ref="appId"
          save={obj => this.handleAppId(obj)}
        />
        <DeleteDialog
          ref="delete"
          delete={obj => this.handleAppId(Object.assign({}, obj, { isDelete: true }))}
        />
      </div>
    );
  }
}

ProjectConfig.propTypes = {
  params: PropTypes.object,
  configInfo: PropTypes.object,
  updateConfig: PropTypes.func,
  getConfigList: PropTypes.func,
};


const mapStateToProps = (state) => Object.assign({}, state.common);

export default connect(mapStateToProps, {
  updateConfig,
  getConfigList,
})(ProjectConfig);
