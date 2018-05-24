import React, { Component }from 'react';
import { Modal, Table, Button, Input } from 'react-bootstrap';
import { Notification } from 'atfcapi';
import fetchX from '../../vendor/Fetch';

class ApiChangeHistory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      position: 0,
      data: [],
      offHint: false,
      description: '',
      path: '',
    };
  }

  show(data, index, description, path) {
    this.setState({
      show: true,
      position: index,
      data: data,
      description: description,
      path: path,
    });
  }

  close() {
    const { offHint } = this.state;
    if (offHint) {
      window.location.reload();
    } else {
      this.setState({
        show: false,
      });
    }
  }

  toggle() {
    const params = {
      caseId: this.props.caseId,
      position: this.state.position,
    };

    fetchX.post('/atfcapi/suiteCase/offHint', params)
      .then(res => {
        if (res.code === 200) {
          this.setState({
            offHint: true,
          });
        } else {
          Notification.success(res.msg);
        }
      }).catch(err => Notification.error(err.responseJSON.msg));
  }

  buildChangeHistory() {
    const { data } = this.state;
    const length = data.length;
    const defaultTr = (
      <tr className="no-data">
        <td colSpan="4">No data</td>
      </tr>
    );
    const tr = data.map((item, index) =>
      <tr key={index}>
        <td>{item.git_version}</td>
        <td> <Input type="radio" name="offHint" onChange={() => this.toggle()} label="Off Hint" /> </td>
        <td>{item.parameters_change_list}</td>
        <td>{item.responses_change_list}</td>
      </tr>
    );

    return length === 0 ? defaultTr : tr;
  }


  render() {
    const { show, description, path } = this.state;
    const title = description + ' ' + path;
    return (
      <Modal className="api-change-modal" bsSize="large" show={show} >
        <Modal.Header>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table className="change-history-table" responsive bordered striped hover >
            <thead>
              <tr>
                <th width="150">Git Version</th>
                <th width="150">Operation</th>
                <th>Parameters Change</th>
                <th>Responses Change</th>
              </tr>
            </thead>
            <tbody>
              { this.buildChangeHistory() }
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => this.close()}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

ApiChangeHistory.propTypes = {
  caseId: React.PropTypes.number,
};

export default ApiChangeHistory;
