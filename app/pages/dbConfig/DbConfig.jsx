import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Breadcrumb, BreadcrumbItem } from 'react-bootstrap';
import { Notification } from 'atfcapi';
import ConfigForm from './ConfigForm';
import { getConfigData } from '../../actions/databaseAction';

class DbConfig extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dbCfgId: props.params.dbCfgId !== 'newDbConfig' ? parseInt(props.params.dbCfgId, 10) : 0, // 用来区分是新增还是修改
    };
  }

  componentDidMount() {
    this.getConfigData();
  }

  getConfigData() {
    const { dbCfgId } = this.state;
    if (dbCfgId === 0) {
      return;
    }
    this.props.getConfigData(dbCfgId,
      () => {},
      msg => Notification.error(msg)
    );
  }

  render() {
    const { dbCfgId } = this.state;
    return (
      <div id="dbConfig">
        <Breadcrumb>
          <BreadcrumbItem href="#">
            Home
          </BreadcrumbItem>
          <BreadcrumbItem active>
            DB Configuration
          </BreadcrumbItem>
        </Breadcrumb>
        <ConfigForm dbCfgId={dbCfgId} />
      </div>
    );
  }
}

DbConfig.propTypes = {
  params: PropTypes.object,
  getConfigData: PropTypes.func,
};

const mapStateToProps = (state) => Object.assign({}, state.database);

export default connect(mapStateToProps, {
  getConfigData,
})(DbConfig);
