import React from 'react';
import { Button, Modal, PanelGroup, Panel, Table } from 'react-bootstrap';
import { CodeMirror, Notification } from 'atfcapi';
import fetchX from '../../vendor/Fetch';

class EditApiDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      pathId: 0,
      data: null,
      index: 0,
      loading: false,
      errMsg: '',
      request: null,
      response: null,
      recode: null,
      sample: null,
    };

    this.show = (data, index) => {
      delete data.checked;
      this.setState({
        show: true,
        pathId: data.pathId,
        data: JSON.stringify(data, null, 2),
        index: index,
      }, () => this.getRequestDiscription() );
    }


    this.close = () => {
      this.handleFail('');
      this.setState({
        show: false,
        request: null,
        response: null,
        recode: null,
        sample: null,
      });
    };
    this.handleFail = msg => this.setState({
      loading: false,
      errMsg: msg,
    });
  }


  getRequestDiscription() {
    const { pathId } = this.state;
    if (!pathId) return false;
    fetchX.get(`atfcapi/apiQuery/queryRequestDescription/${pathId}`)
    .then(res => {
      if (res.code === '200') {
        this.setState({
          request: res.data,
        });
      } else {
        Notification.error(res.msg || res.message);
      }
    });
  }

  getResponseDiscription() {
    const { pathId } = this.state;
    if (!pathId) return false;
    fetchX.get(`/atfcapi/apiQuery/queryResponseDescription/${pathId}`)
    .then(res => {
      if (res.code === '200') {
        this.setState({
          response: res.data,
        });
      } else {
        Notification.error(res.msg || res.message);
      }
    });
  }

  getRecodeDiscription() {
    const { pathId } = this.state;
    if (!pathId) return false;
    fetchX.get(`/atfcapi/apiQuery/queryRecodeDescription/${pathId}`)
    .then(res => {
      if (res.code === '200') {
        this.setState({
          recode: res.data,
        });
      } else {
        Notification.error(res.msg || res.message);
      }
    });
  }

  getSample() {
    const { pathId } = this.state;
    if (!pathId) return false;
    fetchX.get(`/atfcapi/apiQuery/querySamples/${pathId}`)
    .then(res => {
      if (res.code === '200') {
        this.setState({
          sample: res.data,
        });
      } else {
        Notification.error(res.msg || res.message);
      }
    });
  }

  handleSelect(key) {
    const { request, response, recode, sample } = this.state;
    switch (key) {
    case '2':
      if (response) return;
      this.getResponseDiscription();
      break;
    case '3':
      if (recode) return;
      this.getRecodeDiscription();
      break;
    case '4':
      if (sample) return;
      this.getSample();
      break;
    default:
      if (request) return;
      this.getRequestDiscription();
    }
  }

  handleChange(value) {
    this.setState({
      data: value,
      errMsg: '',
    });
  }

  save() {
    const {index, data} = this.state;
    try {
      JSON.parse(data);
      if (typeof(JSON.parse(data)) === 'number' || typeof(JSON.parse(data)) === 'string') throw 'not json';
    } catch (err) {
      this.handleFail('JSON format checksum error: ' + err);
      return;
    }
    this.setState({
      loading: true,
    });
    this.props.save({
      value: data,
      index: index,
    });
  }

  buildRequestTable(obj, k) {
    if (!obj) return null;
    const tr = obj.map( (item, index) =>
      <tr key={index}>
        <td>{item.name}</td>
        <td>{item.type}</td>
        <td>{item.description}</td>
        <td>{item.in}</td>
        <td>{item.required ? `yes` : `no`}</td>
        <td>{item.example}</td>
      </tr>
    );
    return (
      <Table striped bordered condensed hover key={k}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Description</th>
            <th>Parameter position</th>
            <th>Required</th>
            <th>Example</th>
          </tr>
        </thead>
        <tbody>
          {tr}
        </tbody>
      </Table>
    );
  }

  buildRequest() {
    const { request, pathId } = this.state;
    if (!request) {
      return <p>No data</p>;
    }

    let k = null;
    const html = [];
    html.push(this.buildRequestTable(request[`pathId${pathId}`], `pathId${pathId}`));
    for (k in request) {
      if (request.hasOwnProperty(k)) {
        if (k !== `pathId${pathId}`) {
          html.push(<p>{k}的参数</p>);
          html.push(this.buildRequestTable(request[k], k));
        }
      }
    }

    return html;
  }

  buildResponseTable(obj, k) {
    const tr = obj.map( (item, index) =>
      <tr key={index}>
        <td>{item.name}</td>
        <td>{item.type}</td>
        <td>{item.description}</td>
        <td>{item.required ? `yes` : `no`}</td>
        <td>{item.is_extra ? `yes` : `no`}</td>
        <td>{item.example}</td>
      </tr>
    );
    return (
      <Table striped bordered condensed hover key={k}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Description</th>
            <th>Required</th>
            <th>Extras</th>
            <th>Example</th>
          </tr>
        </thead>
        <tbody>
          {tr}
        </tbody>
      </Table>
    );
  }

  buildResponse() {
    const { response, pathId } = this.state;
    if (!response) {
      return <p>No data</p>;
    }

    let k = null;
    const html = [];
    html.push(this.buildResponseTable(response[`pathId${pathId}`], `pathId${pathId}`));
    for (k in response) {
      if (response.hasOwnProperty(k)) {
        if (k !== `pathId${pathId}`) {
          html.push(<p key={`${k}p`}>{k}的参数</p>);
          html.push(this.buildResponseTable(response[k], k));
        }
      }
    }
    return html;
  }

  buildRecodeDiscription() {
    const { recode } = this.state;
    if (!recode || !recode.length) {
      return (
        <tr>
          <td colSpan="3">No data</td>
        </tr>
      );
    }
    return recode.map( (item, index) =>
      <tr key={index}>
        <td>{item.httpStatusCode}</td>
        <td>{item.responseCode}</td>
        <td>{item.responseMsg}</td>
      </tr>
    );
  }

  render() {
    const { show, data, loading, errMsg, sample } = this.state;
    return (
      <Modal backdrop="static" dialogClassName="api-detail-modal" show={show} onHide={() => this.close()}>
        <Modal.Header closeButton={this.props.showClose}>
          <Modal.Title>Context</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CodeMirror
            className="api-editor"
            height="500px"
            value={data}
            onChange={e => this.handleChange(e)}
          />
          <PanelGroup className="decriptions-tab" defaultActiveKey="1" accordion onSelect={k => this.handleSelect(k)}>
            <Panel header="Request Description" eventKey="1">
              {this.buildRequest()}
            </Panel>
            <Panel header="Response Description" eventKey="2">
              {this.buildResponse()}
            </Panel>
            <Panel header="Recode Description" eventKey="3">
              <Table striped bordered condensed hover>
                <thead>
                  <tr>
                    <th>Http Status Code</th>
                    <th>Response Code</th>
                    <th>Response Msg</th>
                  </tr>
                </thead>
                <tbody>
                  {this.buildRecodeDiscription()}
                </tbody>
              </Table>
            </Panel>
            <Panel header="Samples" eventKey="4">
              <CodeMirror
                height="320px"
                value={JSON.stringify(sample, null, 2)}
                options={{
                  readOnly: true,
                  lineNumbers: false,
                }}
              />
            </Panel>
          </PanelGroup>
        </Modal.Body>
        <Modal.Footer>
          <span className="error">{errMsg}</span>
          {
            this.props.showClose &&
              <Button onClick={() => this.close()}>
                取消
              </Button>
          }

          <Button
            bsStyle="primary"
            disabled={loading}
            onClick={() => this.save()}
          >
            {loading ? `保存...` : `保存`}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

EditApiDetail.propTypes = {
  save: React.PropTypes.func,
  showClose: React.PropTypes.bool,
};

EditApiDetail.defaultProps = {
  showClose: true,
}

export default EditApiDetail;
