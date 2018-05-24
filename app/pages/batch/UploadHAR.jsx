import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { ButtonInput, Input, Breadcrumb, BreadcrumbItem, Panel} from 'react-bootstrap';
import { ComboBox, Notification, Spin } from 'atfcapi';
import ImportCases from './ImportCases';
import { getAllEvn, getProjectEntries, getAppIds, resetAppIds, uploadHar, setProject, setApp } from '../../actions/commonAction';
import { getEnvId } from '../../vendor/util';

class UploadHAR extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null,
      fileTypeError: false,
      filePath: '',
      envId: 0,
      nextStep: false,
    };
  }

  componentDidMount() {
    this.props.getProjectEntries(
      () => {},
      msg => Notification.error(msg)
    );

    this.props.getAllEvn(
      () => {
        const envId = getEnvId(this.props.envList);
        this.setState({ envId });
      },
      msg => Notification.error(msg)
    );
  }

  onChange(target, value) {
    if (target === 'project') {
      this.props.setProject(-1, value);
    } else if (target === 'appId') {
      this.props.setApp(-1, value);
    }
  }

  onBlur(target, value) {
    const { projectList = [], appIds = [] } = this.props;
    if (target === 'project') {
      const newProjects = projectList.filter(item => item.projectName === value);
      if (newProjects.length !== 0) {
        const projectId = newProjects[0].projectId;
        if (projectId !== '' && projectId !== this.props.projectId) {
          const params = {
            offset: 0,
            limit: 500,
            projectId,
          };
          this.props.getAppIds(params,
            () => this.props.setProject(projectId, value),
            msg => Notification.error(msg)
          );
        }
      } else {
        this.props.resetAppIds();
        this.props.setProject(-1, value);
      }
    } else {
      const newAppIds = appIds.filter(item => item.appIdName === value);
      if (newAppIds.length !== 0) {
        if (newAppIds[0].appId !== '') {
          this.props.setApp(newAppIds[0].appId, value);
        }
      } else {
        this.props.setApp(-1, value);
      }
    }
  }

  handleChange(event) {
    const state = this.state;
    const target = event.target;
    state[target.name] = target.value;
    if (target.name === 'envId') {
      this.setState({
        envId: target.value,
      });
    }
  }

  selectFile(event) {
    const filePath = event.target.value;
    const file = event.target.files[0];
    const test = filePath.indexOf('.har') !== -1;
    if (test) {
      this.setState({
        file,
        filePath,
        fileTypeError: false,
      });
    } else {
      this.setState({
        filePath: '',
        fileTypeError: true,
      });
    }
  }

  uploadFile() {
    const { file, filePath, envId} = this.state;
    const { projectName, appIdName } = this.props;

    // 校验
    if (!filePath) {
      Notification.info('Please select HAR file');
      return;
    } else if (!projectName) {
      Notification.info('Please select Project');
      return;
    } else if (!appIdName) {
      Notification.info('Please select AppId');
      return;
    } else if (!envId) {
      Notification.info('Please select Environment');
      return;
    }

    // 设置参数
    const formData = new FormData();
    formData.append('file', file);
    formData.append('project', projectName);
    formData.append('appIdName', appIdName);
    this.props.uploadHar(formData,
      () => {
        this.setState({
          nextStep: true,
        });
      },
      msg => Notification.error(msg)
    );
  }

  buildEnvironmentList() {
    const { envList } = this.props;
    const environmentList = envList ?
      envList.map( item =>
        <option key={item.envId} value={item.envId}>{ item.envName }</option>
      )
      : '';
    return environmentList;
  }

  render() {
    const { fileTypeError, filePath, envId, loading, nextStep } = this.state;
    const { projectList = [], appIds = [], appId, appIdName, projectId, projectName } = this.props;
    const projectNames = projectList.map(item => item.projectName);
    const appIdNames = appIds.map(item => item.appIdName);
    const environmentList = this.buildEnvironmentList();
    const inputs = (
      <div className="input-list">
        <div className="form-group">
          <label className="control-label col-xs-3">Project *</label>
          <div className="combo-box col-xs-9">
            <ComboBox
              value={projectName}
              options={projectNames}
              placeholder="Please enter or select project"
              onChange={value => this.onChange('project', value)}
              onSelect={value => this.onChange('project', value)}
              onBlur={value => this.onBlur('project', value)}
            />
          </div>
        </div>
        <div className="form-group">
          <label className="control-label col-xs-3">AppId *</label>
          <div className="combo-box col-xs-9">
            <ComboBox
              value={appIdName}
              options={appIdNames}
              placeholder="Please enter or select AppId"
              onChange={value => this.onChange('appId', value)}
              onSelect={value => this.onChange('appId', value)}
              onBlur={value => this.onBlur('appId', value)}
            />
          </div>
        </div>
        <Input
          className="select-box"
          type="select"
          label="Environment *"
          labelClassName="col-xs-3"
          wrapperClassName="col-xs-9"
          name="envId"
          value={envId}
          onChange={e => this.handleChange(e)}
        >
          <option value="0">--</option>
          {environmentList}
        </Input>

      </div>
    );

    const tip = fileTypeError ? <span className="tip error">You uploaded an incorrect file type!</span> : <span className="tip">{filePath}</span>;
    const arr = filePath.split('\\');
    const fileName = arr[arr.length - 1];
    const fileNameWithoutExt = fileName.substr(0, fileName.lastIndexOf('.har'));
    return (
      <div id="import-case">
        <Breadcrumb>
          <BreadcrumbItem href="#">
            Home
          </BreadcrumbItem>
          <BreadcrumbItem active>
            ImportCase
          </BreadcrumbItem>
        </Breadcrumb>
        {nextStep ?
          <ImportCases
            projectId={projectId}
            appId={appId}
            envId={envId}
            fileName={fileNameWithoutExt}
            cancel={() => this.setState({ nextStep: false })}
          />
          :
          <Panel header="Upload HAR2Case">
            <div className="upload-wrap form-horizontal ">
              <div className="form-group">
                <label className="control-label col-xs-3">Upload File</label>
                <div className="combo-box col-xs-9">
                  <a href="javascript:;" className="file">
                    Select File
                    <input type="file" id="file" onChange={e => this.selectFile(e)} />
                  </a>
                  {tip}
                </div>
              </div>
            </div>
            <form className="form-horizontal">
              {inputs}
            </form>
            <div className="import-case-btn row">
              <ButtonInput disabled={loading} className="next-btn" type="button" value={loading ? `Uploading...` : `Next`} bsStyle="primary" onClick={() => this.uploadFile()} />
            </div>
          </Panel>
        }
        {loading ? <Spin /> : '' }
      </div>
    );
  }
}

UploadHAR.propTypes = {
  projectList: PropTypes.array,
  envList: PropTypes.array,
  appIds: PropTypes.array,
  appId: PropTypes.number,
  appIdName: PropTypes.string,
  projectId: PropTypes.number,
  projectName: PropTypes.string,
  getAllEvn: PropTypes.func,
  getProjectEntries: PropTypes.func,
  getAppIds: PropTypes.func,
  resetAppIds: PropTypes.func,
  uploadHar: PropTypes.func,
  setProject: PropTypes.func,
  setApp: PropTypes.func,
};

const mapStateToProps = (state) => Object.assign({}, state.common);

export default connect(mapStateToProps, {
  getAllEvn,
  getProjectEntries,
  getAppIds,
  resetAppIds,
  uploadHar,
  setProject,
  setApp,
})(UploadHAR);
