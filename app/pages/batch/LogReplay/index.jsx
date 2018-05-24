import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Breadcrumb,
  BreadcrumbItem,
  Panel,
  Input,
  Button
} from 'react-bootstrap';
import { DateRangePicker } from 'react-dates';
import { Notification } from 'atfcapi';
import moment from 'moment';
import 'react-dates/lib/css/_datepicker.css';
import fetchX from '../../../vendor/Fetch';

const dateLimit = moment().add(1, 'days');

export default class LogReplay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      focusedInput: '',
      appids: [],
      loading: false
    };
    this.onDatesChange = this.onDatesChange.bind(this);
    this.onFocusChange = this.onFocusChange.bind(this);
    this.timer = null;
  }

  componentDidMount() {
    fetchX
      .get('/atfcapi/replay/getSoaAppid')
      .then(result => {
        if (result.data !== null) {
          this.setState({ appids: result.data });
        }
      })
      .catch(err => Notification.error(err.message));
  }

  onDatesChange({ startDate, endDate }) {
    this.setState({ startDate, endDate });
  }

  onFocusChange(focusedInput) {
    this.setState({ focusedInput });
  }

  handleChange(e) {
    this.state.appid = e.target.value;
  }

  handleReplay() {
    const { appid } = this.state;
    if (!this.state.startDate || !this.state.endDate) {
      Notification.error('Select Time Quantum');
      return;
    }
    if (appid === '') {
      Notification.error('Select Appid');
      return;
    }
    clearTimeout(this.timer);
    this.setState(() => ({ loading: true }));
    this.timer = setTimeout(() => {
      fetchX
        .post('/atfcapi/replay/searchSoaLogs', {
          appid,
          startTime: this.state.startDate.format('YYYY-MM-DD'),
          endTime: this.state.endDate.format('YYYY-MM-DD')
        })
        .then(result => {
          if (result.data !== null) {
            this.setState(() => ({ loading: false }));
            location.href = `/#/batch/LogReplay/${result.data}`;
          }
        })
        .catch(err => Notification.error(err.message));
    }, 500)
  }

  isInclusivelyAfterDay(a, b) {
    if (!moment.isMoment(a) || !moment.isMoment(b)) return false;
    return a.isAfter(b) || a.isSame(b, 'day');
  }

  render() {
    const { startDate, endDate, focusedInput, appids, loading } = this.state;
    return (
      <main>
        <Breadcrumb>
          <BreadcrumbItem href="#">
            Home
          </BreadcrumbItem>
          <BreadcrumbItem active>
            LogReplay
          </BreadcrumbItem>
        </Breadcrumb>
        <Panel header="#">
          <section className="form-horizontal" style={{ width: '70%' }}>
            <Input
              type="select"
              label="Appid"
              name="project"
              labelClassName="col-xs-3"
              wrapperClassName="col-xs-5"
              onChange={e => this.handleChange(e)}
            >
              <option value="0">----</option>
              {appids.map((item, index) => (
                <option key={index} value={item}>{item}</option>
              ))}
            </Input>
            <div className="form-group time-quantum">
              <label className="control-label col-xs-3">Time Quantum</label>
              <DateRangePicker
                {...this.props}
                onDatesChange={this.onDatesChange}
                onFocusChange={this.onFocusChange}
                focusedInput={focusedInput}
                startDate={startDate}
                endDate={endDate}
                minimumNights={0}
                monthFormat="YYYY-MMMM"
                startDatePlaceholderText="from"
                endDatePlaceholderText="to"
                withPortal
                isOutsideRange={day =>
                  !this.isInclusivelyAfterDay(day, moment().day(-4)) ||
                  this.isInclusivelyAfterDay(day, dateLimit)}
              />
            </div>
            <Button className="replay" disabled={loading} onClick={() => this.handleReplay()}>Replay</Button>
          </section>
        </Panel>
      </main>
    );
  }
}
