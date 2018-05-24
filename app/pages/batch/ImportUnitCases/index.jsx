import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Breadcrumb, BreadcrumbItem, Panel, Button } from 'react-bootstrap';
import { Spin, Notification } from 'atfcapi';
import { getLogList } from '../../../actions/commonAction';
import FilterFields from './FilterFields';
import Confirmation from './Confirmation';
import Save from './Save';

class ImportUnitCases extends Component {
  constructor(props) {
    super(props);
    this.state = {
      step: [0, 1, 2],
      currentStep: 0
    };
  }

  step() {
    switch (this.state.currentStep) {
      case 0:
        return <FilterFields />;
      case 1:
        return <Confirmation />;
      case 2:
        return <Save />;
    }
  }

  next(step) {
    const { currentStep } = this.state;
    if (currentStep + step === 2) {
      const { pathIds, startDate, endDate } = this.props;
      const startTime = startDate.format('YYYY-MM-DD');
      const endTime = endDate.format('YYYY-MM-DD');
      this.props.getLogList({ pathIds, startTime, endTime }, () => {
        const { logList } = this.props;
        if (logList && logList.length) {
          this.setState({ currentStep: 2 });
        } else {
          Notification.error('No data !');
        }
      });
    } else {
      this.setState({
        currentStep: currentStep + step
      });
    }
  }

  isDisabled() {
    const {
      projectId,
      appId,
      iface,
      startDate,
      endDate,
      pathIds,
      isFetching
    } = this.props;
    switch (this.state.currentStep) {
      case 0:
        if (projectId && appId && iface) {
          return false;
        }
        return true;
      case 1:
        if (pathIds.length && startDate && endDate) {
          return false;
        }
        return true;
    }
  }
  render() {
    const { isFetching } = this.props;
    const disabled = this.isDisabled();
    return (
      <main>
        <Breadcrumb>
          <BreadcrumbItem href="#">
            Home
          </BreadcrumbItem>
          <BreadcrumbItem active>
            ImportUnitCase
          </BreadcrumbItem>
        </Breadcrumb>
        <Panel header="#">
          {this.step()}
        </Panel>
        {this.state.currentStep !== 2 &&
          <Button
            className="api-operate"
            disabled={disabled}
            bsStyle="primary"
            onClick={() => this.next(1)}
          >
            Next
          </Button>}
        {this.state.currentStep !== 0 &&
          <Button className="api-operate" onClick={() => this.next(-1)}>
            Prev
          </Button>}
        {isFetching ? <Spin /> : ''}
      </main>
    );
  }
}

ImportUnitCases.propTypes = {
  isFetching: PropTypes.bool
};

const mapStateToProps = state => Object.assign({}, state.common);

export default connect(mapStateToProps, {
  getLogList
})(ImportUnitCases);
