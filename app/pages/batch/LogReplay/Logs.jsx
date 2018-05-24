import React, { Component } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  Panel,
  Table,
  OverlayTrigger,
  Popover,
  Label,
  Input,
  Pagination
} from 'react-bootstrap';
import { Notification, Progress } from 'atfcapi';
import fetchX from '../../../vendor/Fetch';

export default class Logs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      percent: 0,
      totalCount: 0,
      offset: 1,
      logList: []
    };
    this.timer = null;
  }

  componentDidMount() {
    if (this.id) {
      this.fetch(this.id);
      this.timer = setInterval(() => this.fetch(this.id), 5000);
    }
  }

  jump() {
    clearInterval(this.timer);
    location.href = '/#/batch/LogReplay/';
  }

  fetch(id) {
    fetchX
      .get(`/atfcapi/replay/getExecuteSchedule/${id}`)
      .then(result => {
        if (result.data !== null) {
          const percent = parseInt(result.data.num / result.data.total * 100);
          const totalCount = result.data.total;

          if (percent === 100) {
            setTimeout(() => this.setState({ percent, totalCount }), 2000);
            clearInterval(this.timer);
            this.loadLogs(this.id);
          } else {
            this.setState({ percent, totalCount });
          }
        }
      })
      .catch(err => Notification.error(err.message));
  }

  get limit() {
    return 20;
  }

  get id() {
    return this.props.params.id;
  }

  handlePageSelect(event, selectedEvent) {
    this.setState({
      offset: selectedEvent.eventKey,
    }, () => this.loadLogs(this.id));
  }

  loadLogs(id) {
    const { offset } = this.state;
    fetchX
      .post('/atfcapi/replay/repalyResult', {
        id,
        offset: offset - 1,
        limit: this.limit
      })
      .then(result => {
        if (result.data !== null) {
          this.setState({ logList: result.data });
        }
      })
      .catch(err => Notification.error(err.message));
  }

  buildPopover(data, index) {
    const cloneData = Object.assign({}, data);
    return (
      <Popover className="unitcase-args" id={index} title='#'>
        <Input type="textarea" readOnly defaultValue={JSON.stringify(cloneData, null, 2)} />
      </Popover>
    );
  }

  render() {
    let { offset, percent, logList, totalCount } = this.state;
    if (Number.isNaN(percent)) percent = 0;
    const totalPage = Math.ceil(totalCount / this.limit);
    const tbody = logList.map((item, index) => (
      <tr key={index}>
        <td>{index + 1}</td>
        <td title={item.iface}>{item.iface}</td>
        <td>{item.method}</td>
        <td>
          <OverlayTrigger
            trigger="click"
            rootClose
            placement="bottom"
            overlay={this.buildPopover(item.soa, index)}
          >
            <code>...</code>
          </OverlayTrigger>
        </td>
        <td>{item.ver}</td>
        <td>
          <OverlayTrigger
            trigger="click"
            rootClose
            placement="bottom"
            overlay={this.buildPopover(item.args, index)}
          >
            <code>...</code>
          </OverlayTrigger>
        </td>
        <td>
          <OverlayTrigger
            trigger="click"
            rootClose
            placement="bottom"
            overlay={this.buildPopover(item.logResponse, index)}
          >
            <code>...</code>
          </OverlayTrigger>
        </td>
        <td>
          <OverlayTrigger
            trigger="click"
            rootClose
            placement="bottom"
            overlay={this.buildPopover(item.returnResponse, index)}
          >
            <code>...</code>
          </OverlayTrigger>
        </td>
        <td>
          {item.testRestult
            ? <Label bsStyle="success">YES</Label>
            : <Label bsStyle="danger">NO</Label>}
        </td>
      </tr>
    ));
    return (
      <main className="log-replay">
        <Breadcrumb>
          <BreadcrumbItem href="#">
            Home
          </BreadcrumbItem>
          <BreadcrumbItem onClick={() => this.jump()}>
            LogReplay
          </BreadcrumbItem>
          <BreadcrumbItem active>
            Logs
          </BreadcrumbItem>
        </Breadcrumb>
        <Panel header="#">
          <section className="form-horizontal">
            {percent < 100 &&
              <div>
                <Progress
                  strokeWidth={18}
                  percentage={percent}
                  status="success"
                  textInside
                />
                <p className="replay-tip">EXECUTING</p>
              </div>}
            {percent === 100 &&
              <Table>
                <thead>
                  <tr>
                    <th>NO</th>
                    <th>Iface</th>
                    <th>Method</th>
                    <th>Soa</th>
                    <th>Ver</th>
                    <th>Args</th>
                    <th>Log Response</th>
                    <th>Rerun Response</th>
                    <th>Test Result</th>
                  </tr>
                </thead>
                <tbody>
                  {tbody}
                </tbody>
              </Table>}
            {
              percent === 100 &&
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
                    onSelect={this.handlePageSelect.bind(this)}
                  />
                  <span>Total {totalPage} pages / {totalCount} records</span>
                </div>
            }
          </section>
        </Panel>
      </main>
    );
  }
}
