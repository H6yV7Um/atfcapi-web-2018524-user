import React from 'react';
import { Input, Button, Modal, Tabs, Tab } from 'react-bootstrap';
import { CodeMirror, Notification } from 'atfcapi';
import fetchX from '../../vendor/Fetch';

class Parameter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      key: 1,
      pathId: 0,
      data: {},
      method: '',
      loading: false,
      show: false,
      insert: false,
    };

    this.show = (item, method, pathId, insert) => this.setState({
      show: true,
      data: item,
      method: method,
      pathId: pathId,
      insert: insert,
    });
    this.hide = () => this.setState({
      show: false,
    });
    this.buildBody = this.buildBody.bind(this);
    this.handleAddBody = this.handleAddBody.bind(this);
  }

  handleChange(event) {
    const { data } = this.state;
    let value = event.target.value;
    if (event.target.name === 'httpStatusCode') value = value.replace(/\D+/g, '');
    data[event.target.name] = value;
    this.setState({
      data: data,
    });
  }

  handleChangeResponse(value) {
    const { data } = this.state;
    data.responseData = value;
    this.setState({
      data: data,
    });
  }

  handleChangeBody(event, index) {
    const { data } = this.state;
    data.body[index][event.target.name] = event.target.value;
    this.setState({data: data});
  }

  handleChangeBodyData(value, index) {
    const { data } = this.state;
    data.body[index].bodyData = value;
    this.setState({data: data});
  }

  handleSelect(key) {
    this.setState({key: key});
  }

  handleAddBody() {
    const { data } = this.state;
    const length = data.body.length;
    if ( !data.body[length - 1].bodyData) {
      this.setState({
        key: length,
      });
      Notification.info('Please fill in current bodyData content first!');
      return false;
    }

    data.body.push({
      bodyContentType: 'json',
      bodyData: '',
    });
    this.setState({
      data: data,
      key: data.body.length,
    });
  }

  handleDeleteBody(index) {
    const { data } = this.state;
    data.body.splice(index, 1);
    this.setState({
      data: data,
      key: 1,
    });
  }

  formatBody(data) {
    for (let i = 0; i < data.length; i++) {
      const obj = data[i].bodyData;
      try {
        JSON.parse(obj);
        if (typeof(JSON.parse(obj)) === 'number' || typeof(JSON.parse(obj)) === 'string') throw 'not json';
      } catch (err) {
        this.setState({
          key: i + 1,
        });
        Notification.info('Please enter the correct JSON format');
        return false;
      }
    }
    return data;
  }

  handleSaveParameter() {
    let url;
    const { data, pathId, method, insert } = this.state;
    const condi = Object.assign({}, data);
    if (!data.httpStatusCode) {
      Notification.info('Please enter Http Status Code !');
      return;
    }
    if (method === 'get') {
      delete condi.body;
    } else {
      const obj = this.formatBody(condi.body);
      if (!obj) return;
      condi.body = JSON.stringify(obj);
    }
    condi.pathId = pathId;
    if (insert ) {
      url = '/atfcapi/newApi/insertResponseBody';
    } else {
      url = '/atfcapi/newApi/updateResponseBody';
    }

    fetchX.post(url, condi)
    .then(json => {
      if (json.code === '200') {
        Notification.success(json.msg);
        window.location.reload();
      } else {
        Notification.error(json.msg);
      }
    }).catch(err => Notification.error(err.message));
  }

  buildBody() {
    const { data } = this.state;
    if (!data.body) return null;
    return data.body.map( (item, index) =>
      <Tab key={index} eventKey={index + 1} title={`Body ${index + 1}`}>
        <Input
          type="select"
          label="Body Type"
          name="bodyContentType"
          value={item.bodyContentType}
          onChange={e => this.handleChangeBody(e, index)}
          labelClassName="col-xs-2"
          wrapperClassName="col-xs-7"
        >
          <option value="json">JSON</option>
          <option value="xml">XML</option>
        </Input>
        <div className="ace-wrap row">
          <span className="tit col-xs-2">Body Data</span>
          <CodeMirror
            className="code-editor"
            height="120px"
            options={{
              lineNumbers: false,
              mode: 'javascript'
            }}
            value={item.bodyData}
            onChange={e => this.handleChangeBodyData(e, index)}
          />

        </div>
        { index > 0 ?
          <Button
            className="del-body"
            bsStyle="danger"
            onClick={() => this.handleDeleteBody(index)}
          >
            Delete Body
          </Button>
          :
          null
        }
      </Tab>
    );
  }

  render() {
    const { data, loading, show, key, method } = this.state;
    const bodies = this.buildBody();
    return (
      <Modal dialogClassName="response-modal" bsSize="large" backdrop="static" show={show} onHide={() => this.hide()}>
        <Modal.Header closeButton>
          <Modal.Title>Parameter Detail</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="form-horizontal">
            { method === 'get' ? null : <Tabs className="body-tabs" activeKey={key} onSelect={k => this.handleSelect(k)}>
              {bodies}
              <a href="javascript:;" className="add-body" onClick={() => this.handleAddBody()}>Add New Body</a>
            </Tabs>
            }
            <Input
              type="text"
              name="httpStatusCode"
              onChange={e => this.handleChange(e)}
              value={data.httpStatusCode}
              label="Http Status Code"
              placeholder="*"
              labelClassName="col-xs-2"
              wrapperClassName="col-xs-7"
            />
            <Input
              type="text"
              name="httpStatusMsg"
              value={data.httpStatusMsg}
              onChange={e => this.handleChange(e)}
              label="Http Status Msg"
              labelClassName="col-xs-2"
              wrapperClassName="col-xs-7"
            />
            <div className="ace-wrap row">
              <span className="tit col-xs-2">Response Data</span>
              <CodeMirror
                className="code-editor"
                value={data.responseData}
                options={{
                  lineNumbers: false,
                  mode: 'javascript'
                }}
                onChange={e => this.handleChangeResponse(e)}
                height="120px"
              />
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            disabled={loading}
            bsStyle="primary"
            onClick={() => this.handleSaveParameter()}
          >
            {loading ? `Saving...` : `Save`}
          </Button>
          <Button
            onClick={() => this.hide()}
          >
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

Parameter.propTypes = {
  data: React.PropTypes.object,
  pathId: React.PropTypes.number,
};

export default Parameter;
