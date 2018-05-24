import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { DateRangePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import moment from 'moment';
import { Table, Input } from 'react-bootstrap';
import {
  getMethodList,
  deleteMethodItem,
  setTimeQuantum,
  setPathIds,
  setMethodList
} from '../../../actions/commonAction';

const dateLimit = moment().add(1, 'days');

class Confirmation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      method: ''
    };
    this.onDatesChange = this.onDatesChange.bind(this);
    this.onFocusChange = this.onFocusChange.bind(this);
  }
  componentDidMount() {
    this.props.getMethodList(this.props.iface);
  }

  onDatesChange({ startDate, endDate }) {
    this.props.setTimeQuantum(startDate, endDate);
  }

  onFocusChange(focusedInput) {
    this.setState({ focusedInput });
  }

  handleChange(e) {
    const { value } = e.target;
    const { pathIds, setPathIds } = this.props;
    this.setState({ method: value }, () =>
      setPathIds(
        this.getFilterList().filter(item => pathIds.includes(item.pathId))
      ));
  }

  handleToggle(e) {
    const { value, checked } = e.target;
    const { pathIds, setPathIds } = this.props;
    const pathId = parseInt(value, 10);
    if (checked) {
      setPathIds(pathIds.concat(pathId));
    } else {
      setPathIds(pathIds.filter(x => x !== pathId));
    }
  }

  handleDelete(pathId) {
    const { methodList, pathIds, setMethodList, setPathIds } = this.props;
    const newList = methodList.filter(item => item.pathId !== pathId);
    setMethodList(newList);
    setPathIds(pathIds.filter(x => x !== pathId.toString()));
  }

  isInclusivelyAfterDay(a, b) {
    if (!moment.isMoment(a) || !moment.isMoment(b)) return false;
    return a.isAfter(b) || a.isSame(b, 'day');
  }

  getFilterList() {
    const { method } = this.state;
    const { methodList } = this.props;
    return methodList.filter(item =>
      item.method.toLowerCase().includes(method.toLowerCase()));
  }

  render() {
    const { focusedInput, method } = this.state;
    const { methodList, startDate, endDate, pathIds, setPathIds } = this.props;
    const filterList = this.getFilterList();

    const tr = filterList.length
      ? filterList.map((item, index) => {
          return (
            <tr key={index}>
              <td>
                <input
                  type="checkbox"
                  name="selectRowKeys"
                  value={item.pathId}
                  checked={pathIds.includes(item.pathId)}
                  onClick={e => this.handleToggle(e)}
                />
                <label className="ml5">{index + 1}</label>
              </td>
              <td>{item.iface}</td>
              <td>{item.method}</td>
              <td>
                <a
                  href="javascript:;"
                  onClick={() => this.handleDelete(item.pathId)}
                >
                  Delete
                </a>
              </td>
            </tr>
          );
        })
      : <tr className="no-data"><td colSpan="4">No data</td></tr>;

    return (
      <div>
        <section className="form-filter">
          <Input
            type="text"
            label="Method"
            name="method"
            value={method}
            wrapperClassName="col-xs-12"
            groupClassName="col-xs-3"
            onChange={e => this.handleChange(e)}
          />
        </section>
        <Table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={pathIds.length === methodList.length}
                  onClick={e =>
                    this.props.setPathIds(
                      e.target.checked ? filterList.map(x => x.pathId) : []
                    )}
                />
                <label className="ml5">NO</label>
              </th>
              <th>Iface</th>
              <th>Method</th>
              <th>Operation</th>
            </tr>
          </thead>
          <tbody>
            {tr}
          </tbody>
        </Table>
        <div className="form-group col-xs-6 time-quantum">
          <label className="control-label">Time Quantum</label>
          <DateRangePicker
            {...this.props}
            onDatesChange={this.onDatesChange}
            onFocusChange={this.onFocusChange}
            focusedInput={focusedInput}
            startDate={startDate}
            endDate={endDate}
            minimumNights={0}
            monthFormat="YYYY[年]MMMM"
            startDatePlaceholderText="from"
            endDatePlaceholderText="to"
            withPortal
            isOutsideRange={day =>
              !this.isInclusivelyAfterDay(day, moment().day(-30)) ||
              this.isInclusivelyAfterDay(day, dateLimit)}
          />
        </div>
      </div>
    );
  }
}

Confirmation.propTypes = {
  iface: PropTypes.object,
  getMethodList: PropTypes.func,
  setTimeQuantum: PropTypes.func,
  setPathIds: PropTypes.func,
  setMethodList: PropTypes.func,
  pathIds: PropTypes.array,
  methodList: PropTypes.array,
  startDate: PropTypes.object,
  endDate: PropTypes.object
};

const mapStateToProps = state => Object.assign({}, state.common);

export default connect(mapStateToProps, {
  getMethodList,
  deleteMethodItem,
  setTimeQuantum,
  setPathIds,
  setMethodList
})(Confirmation);
