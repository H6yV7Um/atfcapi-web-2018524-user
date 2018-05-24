import React, { Component, PropTypes } from 'react';
import { Table } from 'react-bootstrap';
import { Tabs, CodeMirror } from 'atfcapi';
import TabViewer from './TabViewer';

const Tab = Tabs.Tab;

const mock = [1,2,3].map((x, index) => {
  return {
    name: `name${index}`,
    value: `value${index}`,
    domain: `domain${index}`,
    path: `path${index}`,
    expires: `expires${index}`,
    http: `http${index}`,
    secure: `secure${index}`,
  }
})
class Response extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bodytype: 'Pretty',
    };
  }

  buildCookies() {
    const cookieList = [];
    let cookies = null;

    if (cookieList.length) {
      (
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Value</th>
              <th>Domain</th>
              <th>Path</th>
              <th>Expires</th>
              <th>HTTP</th>
              <th>Secure</th>
            </tr>
          </thead>
          <tbody>
            {
              cookieList.map(cookie =>
                <tr>
                  <td>{cookie.name}</td>
                  <td>{cookie.value}</td>
                  <td>{cookie.domain}</td>
                  <td>{cookie.path}</td>
                  <td>{cookie.expires}</td>
                  <td>{cookie.http}</td>
                  <td>{cookie.secure}</td>
                </tr>
              )
            }
          </tbody>
        </Table>
      )
    } else {
      cookies = (
        <div className="response-cookie-empty-message">
          <div className="response-cookie-empty-message__image"></div>
          <div className="response-cookie-empty-message__title">
            No cookie for you
          </div>
          <div className="response-cookie-empty-message__details">
            No cookies were returned by the server
          </div>
        </div>
      )
    }
    return cookies;
  }

  buildHeaders() {
    const { responseHeaders } = this.props;
    return (
      <div className="response-header-list">
        {
          responseHeaders.map((header, index) =>
            <div className="response-header-item" key={index}>
              <span className="response-header-name">{header.key}</span>
              <span>→</span>
              <span className="response-header-value">{header.value}</span>
            </div>
          )
        }
      </div>
    )
  }

  handleTypeChange(value) {
    this.setState({ bodytype: value })
  }

  render() {
    const cookies = this.buildCookies();
    const headers = this.buildHeaders();
    const { typeSource, time, status, statusText, responseBody, responseHeaders } = this.props;

    const { bodytype } = this.state;
    return (
      <Tabs
        className="Grid--justifyStart"
        wrapperClassName="postman-response content-group"
        activeIndex={0}
        onChange={() => {}}
        meta={
          <div className="tab tab-meta">
            <span className="tab-meta-item">Status:</span><span className="response-meta">{status} {statusText}</span>
            <span className="tab-meta-item">Time:</span><span className="response-meta">{`${time}ms`}</span>
          </div>
        }
      >
        <Tab className="Grid-cell--autoSize" label="Body">
          <TabViewer typeSource={typeSource} value={bodytype} onChange={value => this.handleTypeChange(value)} />
          { bodytype === 'Pretty' &&
            <CodeMirror
              className="response-body"
              height="400px"
              value={responseBody}
              options={{
                mode: 'htmlmixed'
              }}
              onChange={() => {}}
            />
          }
        </Tab>
        <Tab className="Grid-cell--autoSize" label="Cookies">
          {cookies}
        </Tab>
        <Tab className="Grid-cell--autoSize" label="Headers">
          {headers}
        </Tab>
      </Tabs>

    );
  }
}

Response.propTypes = {
  typeSource: PropTypes.array,
  time: PropTypes.number,
  status: PropTypes.number,
  statusText: PropTypes.string,
  responseBody:  PropTypes.string,
  responseHeaders: PropTypes.any,
};

Response.defaultProps = {
  typeSource: ['Pretty', 'Raw', 'Preview'],
};

export default Response;
