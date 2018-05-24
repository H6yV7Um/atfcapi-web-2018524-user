import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Glyphicon, Button } from 'react-bootstrap';
import { ConfirmDialog, Notification, Tabs } from 'atfcapi';
import Curl from './Curl';
import { setMock } from '../../../actions/projectActions';
import { uploadMock } from '../../../actions/commonAction';

class WireMock extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openMock: false,
      mappingFile: null,
      fileFile: null,
      mappingFilePath: '',
      fileFilePath: '',
      projectId: this.props.projectId,
      fileTypeError: false,
      mappingFileTypeError: false,
      isMocked: this.props.isMocked,
      activeIndex: 0,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      isMocked: nextProps.isMocked,
    });
  }

  onTabChange(index) {
    this.props.onTabChange(index);
    this.setState({ activeIndex: index });
  }

  handleMockOpen() {
    const {openMock} = this.state;
    this.setState({
      openMock: !openMock,
    });
  }

  loadMockDetail() {
    this.props.show();
  }

  handleMockSetting() {
    ConfirmDialog({
      title: 'The project is not configured through Mock, Mock ok now configure services for this project?',
      okCancel: true,
      onConfirm: () => this.startMock(),
      confirmText: 'Confirm',
    });
  }


  startMock() {
    const params = {
      projectId: this.state.projectId,
      isMock: true,
    };

    this.props.setMock(params,
      msg => {
        Notification.success(msg);
        this.props.updateMockStatus(true);
        this.setState({
          isMocked: true,
        });
      },
      msg => {
        Notification.error(msg);
        const self = this;
        ConfirmDialog({
          title: 'Mock service fails to start, to restart?',
          okCancel: true,
          onConfirm() {
            self.startMock();
          },
          confirmText: 'confirm',
        });
      }
    );
  }

  selectFile(event) {
    if (event.target.id === 'mapping') {
      const mappingFile = event.target.files[0];
      this.setState({
        mappingFile,
        mappingFilePath: event.target.value,
        mappingFileTypeError: !(event.target.value.indexOf('.json') !== -1),
      });
    } else if (event.target.id === 'file') {
      const fileFile = event.target.files[0];
      this.setState({
        fileFile,
        fileFilePath: event.target.value,
        fileTypeError: !(event.target.value.indexOf('.json') !== -1),
      });
    }
  }


  uploadFile() {
    const { mappingFile, mappingFilePath, fileFile, projectId } = this.state;
    // 校验
    if (!mappingFilePath) {
      Notification.info('Choose Mapping File');
      return;
    }

    // 设置参数
    const formData = new FormData();
    formData.append('projectId', projectId);
    formData.append('mapping', mappingFile);
    formData.append('file', fileFile);
    this.props.uploadMock(formData,
      () => {
        Notification.success('Upload successful!');
        this.setState({ loading: false });
      },
      msg => Notification.error(msg)
    );
  }

  buildMockHeading() {
    const {isMocked} = this.state;
    const content = isMocked ?
      <div className="header-right" >
        <a href="javascript:;" onClick={() => this.loadMockDetail()}>Mock details</a>
        <a href="http://wiremock.org/docs/" target="_blank">Help</a>
      </div>
      :
      <span className="header-center" onClick={() => this.handleMockSetting()}>click here to open Mock Service</span>;

    return (
      <div className="header">
        <span className="header-title">
          <a href="javascript:;" onClick={() => this.handleMockOpen()}>
            Mock<Glyphicon glyph="menu-down" />
          </a>
        </span>
        {content}
      </div>
    );
  }

  buildUploadFile() {
    const { fileTypeError, mappingFileTypeError, mappingFilePath, fileFilePath } = this.state;
    const mappingTip = mappingFileTypeError ? <span className="tip error">The file you uploaded the wrong type!</span> : <span className="tip">{mappingFilePath}</span>;
    const fileTip = fileTypeError ? <span className="tip error">The file you uploaded the wrong type!</span> : <span className="tip">{fileFilePath}</span>;
    return (
      <div className="upload-file">
        <table className="table-wrap">
          <tbody>
            <tr>
              <td>
                <label className="mapping">Mapping</label>
                <a href="javascript:;" className="file">Click Choose File<input type="file" id="mapping" onChange={(e) => this.selectFile(e)} /></a>
              </td>
              <td>
                <label>__files</label>
                <a href="javascript:;" className="file">Click Choose File<input type="file" id="file" onChange={(e) => this.selectFile(e)} /></a>
              </td>
            </tr>
            <tr>
              <td>{mappingTip}</td>
              <td>{fileTip}</td>
            </tr>
          </tbody>
        </table>
        <p>Note: not recommended in this way, use the upload of papers Mock need to restart the service to take effect, use Curl mode configuration before restarting the service will result in failure</p>
        <Button onClick={() => this.uploadFile()}>Upload</Button>
      </div>
    );
  }

  render() {
    const {openMock, activeIndex} = this.state;
    const panelHeading = this.buildMockHeading();
    const uploadFilePanel = this.buildUploadFile();
    return (
      <div className="panel panel-group panel-default">
        <div className="panel-heading">{panelHeading}</div>
        <div
          className={openMock ? 'panel-collapse collapse in' : 'panel-collapse collapse'}
          aria-hidden={openMock ? false : true}
          role="tabpanel" style={openMock ? {} : { height: 0}}
        >
          <div className="panel-body">
            <Tabs activeIndex={activeIndex} onChange={index => this.onTabChange(index)}>
              <Tabs.Tab label="Curl">
                <Curl mockData={this.props.mockData} onChange={value => this.props.onChange(value)} />
              </Tabs.Tab>
              <Tabs.Tab label="UploadFile">
                {uploadFilePanel}
              </Tabs.Tab>
            </Tabs>
          </div>
        </div>
      </div>
    );
  }
}

WireMock.propTypes = {
  show: PropTypes.func,
  projectId: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  uploadMock: PropTypes.func,
  setMock: PropTypes.func,
  isMocked: PropTypes.bool,
  mockData: PropTypes.object,
  onTabChange: PropTypes.func,
  updateMockStatus: PropTypes.func,
  onChange: PropTypes.func,
};

WireMock.defaultProps = {
  mockData: null,
};

const mapStateToProps = (state) => Object.assign({}, state.project, state.common);

export default connect(mapStateToProps, {
  setMock,
  uploadMock,
})(WireMock);
