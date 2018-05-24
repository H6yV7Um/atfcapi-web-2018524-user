import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Modal, Table, Button, Label, Pagination } from 'react-bootstrap';
import { Dropdown, Notification, Input } from 'atfcapi';
import { getProjectEntries, getAppIds, resetAppIds, getServices, resetServices } from '../../actions/commonAction';
import { getApiList } from '../../actions/apiActions';

const defaultValue = 0;

class Filter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      offset: 1,
      limit: 10,
      show: false,
      projectId: defaultValue,
      appId: defaultValue,
      serviceId: defaultValue,
      description: '',
      paths: '',
      version: '',
      showModal: false,
    };
  }

  componentDidMount() {
    this.props.getProjectEntries(
      () => {},
      msg => Notification.error(msg)
    );
  }

  handleProjectChange(value) {
    const params = {
      offset: 0,
      limit: 500,
      projectId: value,
    };
    if (value === defaultValue) {
      this.props.resetAppIds();
      this.props.resetServices();
      this.setState({
        projectId: defaultValue,
        appId: defaultValue,
        serviceId: defaultValue,
      });
    } else {
      this.props.getAppIds(params,
        () => this.setState({ projectId: value }),
        msg => Notification.error(msg)
      );
    }
  }

  handleAppIdChange(value) {
    const params = {
      offset: 0,
      limit: 500,
      appId: value,
      projectId: this.state.projectId,
    };
    if (value === defaultValue) {
      this.props.resetServices();
      this.setState({
        appId: defaultValue,
        serviceId: defaultValue,
      });
    } else {
      this.props.getServices(params,
        () => this.setState({ appId: value }),
        msg => Notification.error(msg)
      );
    }
  }

  handleSearch() {
    this.setState({
      offset: 1,
    }, this.loadApiList);
  }

  handleReset() {
    this.setState({
      projectId: defaultValue,
      appId: defaultValue,
      serviceId: defaultValue,
      description: '',
      paths: '',
      version: '',
      offset: 1,
    }, this.loadApiList);
  }

  handlePageSelect(event, selectedEvent) {
    this.setState({
      offset: selectedEvent.eventKey,
    }, this.loadApiList);
  }

  loadApiList() {
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
    this.props.getApiList(params, () => {
      const { apiList } = this.props;
      if (apiList.dataList.length > 0) {
        if (apiList.dataList.length === 1) {
          // only one, auto fill
        } else {
          // open dialog
          this.setState({
            showModal: true,
          });
        }
      }
    });
  }

  buildFilter() {
    const filterForm = [];
    const { projectList, appIds, services } = this.props;
    const { projectId, appId, serviceId } = this.state;
    const defaultOptions = [{ label: '--', value: defaultValue }];
    const projectOptions = defaultOptions.concat(projectList.map(item => {
      return {
        label: item.projectName,
        value: item.projectId,
      };
    }));
    const appIdOptions = defaultOptions.concat(appIds.map(item => {
      return {
        label: item.appIdName,
        value: item.appId,
      };
    }));
    const serviceOptions = defaultOptions.concat(services.map(item => {
      return {
        label: item.serviceName,
        value: item.serviceId,
      };
    }));
    filterForm.push(
      <div key={0} className="Grid">
        <div className="Grid-cell filter-form">
          <span>Project</span><Dropdown options={projectOptions} defaultValue={projectId} onChange={value => this.handleProjectChange(value)} />
        </div>
        <div className="Grid-cell filter-form">
          <span>AppId</span><Dropdown options={appIdOptions} defaultValue={appId} onChange={value => this.handleAppIdChange(value)} />
        </div>
        <div className="Grid-cell filter-form">
          <span>Service Name</span><Dropdown options={serviceOptions} defaultValue={serviceId} onChange={value => this.setState({ serviceId: value })} />
        </div>
      </div>
    );
    filterForm.push(
      <div key={1} className="Grid">
        <div className="Grid-cell filter-form">
          <span>Path</span><Input className="input" onChange={value => this.setState({ paths: value })} />
        </div>
        <div className="Grid-cell filter-form">
          <span>Version</span><Input className="input" onChange={value => this.setState({ version: value })} />
        </div>
        <div className="Grid-cell filter-form">
          <span>Description</span><Input className="input" onChange={value => this.setState({ description: value })} />
        </div>
      </div>
    );
    filterForm.push(
      <div key={2} className="Grid">
        <div className="Grid-cell filter-form">
          <button className="Button Button--action Button--wide" onClick={() => this.handleSearch()}>Search</button>
          <button className="Button Button--wide" type="reset" onClick={() => this.handleReset()}>All</button>
        </div>
      </div>
    );
    return filterForm;
  }

  buildFilterModal() {
    const modal = (
      <Modal className="modal-filter" backdrop="static" bsSize="lg" show={this.state.showModal}>
        <Modal.Body>
          { this.buildFilter() }
          <Table className="table-apiList" bordered condensed stripped>
            <thead>
              <tr>
                <th>Select</th>
                <th>ID</th>
                <th>Path</th>
                <th>Description</th>
                <th>Method</th>
              </tr>
            </thead>
            <tbody>
              { this.buildAPiList() }
            </tbody>
          </Table>
          { this.buildPagenation()}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => this.setState({showModal: false})}>Close</Button>
          <Button bsStyle="primary">Select</Button>
        </Modal.Footer>
      </Modal>
    );
    return modal;
  }

  buildAPiList() {
    if (Object.keys(this.props.apiList).length === 0) return '';

    const list = this.props.apiList.dataList;

    const noData = (
      <tr>
        <td colSpan="5">No data</td>
      </tr>
    );

    return list.length ? list.map((item, index) =>
      <tr key={item.id}>
        <td onClick={() => this.handleSelectResponse(item)}>
          <input
            type="radio"
            defaultChecked={index === 0}
            name="responseId"
          />
        </td>
        <td>{item.id}</td>
        <td>
          <code>{item.paths}</code>
        </td>
        <td>{item.description}</td>
        <td>
          <Label bsStyle="primary">{item.method}</Label>
        </td>
      </tr>
    ) : noData;
  }

  buildPagenation() {
    const { limit, offset } = this.state;
    if (Object.keys(this.props.apiList).length === 0) return '';
    const totalCount = this.props.apiList.totalCount;
    const totalPage = Math.ceil(totalCount / limit);
    return (
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
          activePage={offset}
          onSelect={(event, selectedEvent) => this.handlePageSelect(event, selectedEvent)}
        />
        <span className="page-info">Total {totalPage} pages / {totalCount} records</span>
      </div>
    );
  }

  render() {
    const { show } = this.state;
    return (
      <div className="postman-filter content-group">
        <div className="filter-title" onClick={() => this.setState({ show: !show })}>
          <span>Filter</span>
          <span className="glyphicon glyphicon-chevron-down"></span>
        </div>
        {show && this.buildFilter()}
        { this.buildFilterModal() }
      </div>
    );
  }
}

const mapStateToProps = (state) => Object.assign({}, state.common, state.api);

Filter.propTypes = {
  projectList: PropTypes.array,
  apiList: PropTypes.array,
  appIds: PropTypes.array,
  services: PropTypes.array,
  getProjectEntries: PropTypes.func,
  getAppIds: PropTypes.func,
  resetAppIds: PropTypes.func,
  getServices: PropTypes.func,
  resetServices: PropTypes.func,
  getApiList: PropTypes.func,
};

Filter.defaultProps = {

};

export default connect(mapStateToProps, {
  getProjectEntries,
  getAppIds,
  resetAppIds,
  getServices,
  resetServices,
  getApiList,
})(Filter);
