import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Table, Breadcrumb, BreadcrumbItem } from 'react-bootstrap';
import { Notification } from 'atfcapi';
import { getProjectCoverage } from '../../actions/commonAction';

class Coverage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      projectId: props.params.projectId,
      projectName: '',
    };
  }

  componentWillMount() {
    if (this.props.location.state !== null) {
      this.setState({
        projectName: this.props.location.state.projectName,
      });
    }
  }

  componentDidMount() {
    this.getProjectCoverage();
  }

  getProjectCoverage() {
    const { projectId } = this.state;
    this.props.getProjectCoverage(
      { projectId },
      () => {},
      msg => Notification.error(msg)
    );
  }

  buildCoverage() {
    const { coverageList = []} = this.props;
    const noData = (
      <tr className="no-data">
        <td colSpan="3">No data</td>
      </tr>
    );
    const tr = coverageList.map((item, index) =>
      <tr key={index}>
        <td>{ item.appId }</td>
        <td>
          <span>
            <a target="_blank" href={item.reportUrl}>{ item.reportUrl }</a>
          </span>
        </td>
        <td>{ item.lastTime }</td>
      </tr>
    );
    return coverageList.length === 0 ? noData : tr;
  }

  render() {
    const { projectName } = this.state;
    return (
      <div id="coverage">
        <Breadcrumb>
          <BreadcrumbItem href="#">
            Home
          </BreadcrumbItem>
          <BreadcrumbItem active>
            Coverage
          </BreadcrumbItem>
        </Breadcrumb>
        <h4>Project: {projectName} </h4>
        <Table responsive bordered striped hover>
          <thead>
            <tr>
              <th>AppId</th>
              <th>Latest Coverage report</th>
              <th>Latest Time</th>
            </tr>
          </thead>
          <tbody>
            { this.buildCoverage() }
          </tbody>
        </Table>
      </div>
    );
  }
}


Coverage.propTypes = {
  params: PropTypes.object,
  location: PropTypes.object,
  coverageList: PropTypes.array,
  getProjectCoverage: PropTypes.func,
};

const mapStateToProps = (state) => Object.assign({}, state.common);

export default connect(mapStateToProps, {
  getProjectCoverage,
})(Coverage);
