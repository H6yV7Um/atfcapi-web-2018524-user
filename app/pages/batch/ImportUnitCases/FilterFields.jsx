import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Input } from 'react-bootstrap';
import { Notification } from 'atfcapi';
import { getProjectEntries, getAppIds, getIfaces, setIface, resetIfaces, setProject, setApp } from '../../../actions/commonAction';

class FilterFields extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentDidMount() {
    if (this.props.projectList.length === 0) {
      this.props.getProjectEntries(
        () => {},
        msg => Notification.error(msg)
      );
    }
  }

  handleChange(e) {
    const { value, name } = e.target;
    if (name === 'project') {
      const params = {
        offset: 0,
        limit: 500,
        projectId: value,
      };
      this.props.getAppIds(params,
        () => {
          this.props.setProject(value);
          this.props.setApp();
          this.props.resetIfaces();
          this.props.setIface();
        },
        msg => Notification.error(msg)
      );
    } else if (name === 'appid') {
      const { projectId } = this.props;
      const params = {
        projectId,
        appIdName: value
      }
      this.props.getIfaces(params,
        () => {
          const item = this.props.appIds.find(x => x.appIdName === value);
          this.props.setApp(item.appId, item.appIdName);
        },
        msg => Notification.error(msg)
      );

    } else {
      const iface = this.props.ifaceList.find(item => item.iface === value);
      this.props.setIface(iface);
    }
  }

  render() {
    const { projectList, appIds, ifaceList, projectId, appIdName, iface = {} } = this.props;

    return (
      <section className="form-horizontal" style={{width: '70%'}}>
        <Input
          type="select"
          label="Project"
          name="project"
          value={projectId}
          labelClassName="col-xs-3"
          wrapperClassName="col-xs-9"
          onChange={e => this.handleChange(e)}
        >
          <option value="0">----</option>
          { projectList && projectList.map((item, index) => <option key={index} value={item.projectId}>{item.projectName}</option>) }
        </Input>
        <Input
          type="select"
          label="Appid"
          name="appid"
          value={appIdName}
          labelClassName="col-xs-3"
          wrapperClassName="col-xs-9"
          onChange={e => this.handleChange(e)}
        >
          <option value="0">----</option>
          { appIds && appIds.map((item, index) => <option key={index} value={item.appIdName}>{item.appIdName}</option>) }
        </Input>
        <Input
          type="select"
          label="Iface"
          name="iface"
          value={iface.iface}
          labelClassName="col-xs-3"
          wrapperClassName="col-xs-9"
          onChange={e => this.handleChange(e)}
        >
          <option value="0">----</option>
          { ifaceList && ifaceList.map((item, index) => <option key={index} value={item.iface}>{item.iface}</option>) }
        </Input>
      </section>
    );
  }
}

FilterFields.propTypes = {
  getProjectEntries: PropTypes.func,
  getAppIds: PropTypes.func,
  getIfaces: PropTypes.func,
  setProject: PropTypes.func,
  setIface: PropTypes.func,
  setApp: PropTypes.func,
  projectId: PropTypes.string,
  appIdName: PropTypes.string,
  projectList: PropTypes.array,
  appIds: PropTypes.array,
  ifaceList: PropTypes.array,
  iface: PropTypes.object,
}

const mapStateToProps = state => Object.assign({}, state.common);

export default connect(mapStateToProps, {
  getProjectEntries,
  getAppIds,
  getIfaces,
  resetIfaces,
  setProject,
  setIface,
  setApp,
})(FilterFields);
