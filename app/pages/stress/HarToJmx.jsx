import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Breadcrumb, BreadcrumbItem, Panel, ButtonInput} from 'react-bootstrap';
import { Notification, Spin } from 'atfcapi';
import { uploadHarToJmx } from '../../actions/commonAction';

class HarToJmx extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filePath: '',
      fileTypeError: false,
      loading: false,
      isConverted: false
    };
  }

  handleConvert() {
    const { file, filePath } = this.state;

    if (!filePath) {
      Notification.info("Please select HAR file");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    this.setState({
      loading: true,
    });

    this.props.uploadHarToJmx(formData,
      () => {
        this.setState({
          loading: false,
          isConverted: true,
        });
      },
      msg => {
        this.setState({
          loading: false,
        });
        Notification.error(msg);
      }
    );
  }

  handleDownload() {
    const res = this.props.jmxData;
    const data = new Blob([res]);
    this.refs.download.href = window.URL.createObjectURL(data);
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
        isConverted: false,
      });
    } else {
      this.setState({
        filePath: '',
        fileTypeError: true,
        isConverted: false,
      });
    }
  }

  render() {
    const { fileTypeError, filePath, loading, isConverted } = this.state;
    const arr = filePath.split('\\');
    const fileName = arr[arr.length - 1];
    const fileNameWithoutExt = fileName.substr(0, fileName.lastIndexOf('.har'));
    const tip = fileTypeError ? <span className="tip error">You uploaded an incorrect file type!</span> : <span className="tip">{filePath}</span>;

    return (
      <div id="har-to-jmx">
        <Breadcrumb>
          <BreadcrumbItem href="#">
            Home
          </BreadcrumbItem>
          <BreadcrumbItem active>
            Har To Jmx
          </BreadcrumbItem>
        </Breadcrumb>

        <Panel header="HAR To JMX ">
          <div className="upload-file">
            <h4>Convert HAR to JMX format</h4>
            <div className="select-file">
              <a href="javascript:;" className="file">
                Select File
                <input type="file" id="file" onChange={e => this.selectFile(e)} />
              </a>
              {tip}
            </div>
            <ButtonInput className={isConverted ? 'hide' : 'show'} onClick={() => this.handleConvert()}>Convert</ButtonInput>
            <a ref="download" className={isConverted ? 'download-btn' : 'hide'} type="text/jmx" download={fileNameWithoutExt + `.jmx`} onClick={() => this.handleDownload()} >
              Download
            </a>
          </div>
        </Panel>
        {loading ? <Spin /> : '' }
      </div>
    )
  }
}

HarToJmx.propTypes = {
  uploadHarToJmx: PropTypes.func,
  jmxData: PropTypes.string,
};

const mapStateToProps = (state) => Object.assign({}, state.common);

export default connect(mapStateToProps, {
  uploadHarToJmx,
})(HarToJmx);
