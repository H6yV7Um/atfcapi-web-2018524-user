import React, { Component, PropTypes } from 'react';
import { Glyphicon, OverlayTrigger, Popover } from 'react-bootstrap';
import { Input, Dropdown, Tabs } from 'atfcapi';
import { headers, methods } from '../../../vendor/util';
import JsonEditor from '../JsonEditor';

class Curl extends Component {
  constructor(props) {
    super(props);
    this.state = {
      method: 'GET',
      urlKey: 'url',
      urlValue: '',
      requestParams: [],
      requestBodys: [],
      requestHeaders: [],
      responseStatus: '',
      responseStatusMessage: '',
      responseBody: '',
      responseHeaders: [],
      activeIndex: 0,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.mockData !== null
      && this.props.mockData !== null && Object.keys(this.props.mockData).length === 0 ) {
      this.getMock(nextProps.mockData);
    }
  }

  /**
   * 获取mock信息
   */
  getMock(mockData) {
    // 将返回结果转换成一个个数组以便填充表单
    // 异常判断
    if (mockData === null || mockData === undefined) return;
    // 如果为字符串 将其转换为json
    if (typeof mockData === 'string') {
      try {
        mockData = JSON.parse(mockData);
      } catch (e) {
        return;
      }
    }
    if (Object.keys(mockData).length === 0) return;

    const { request = {}, response = {} } = mockData;
    // request部分
    const method = request.method;
    const urlKey = Object.keys(request).find(x => this.props.urls.includes(x));
    const urlValue = request[urlKey];
    const toString = value => {
      if (typeof value !== 'string') {
        return JSON.stringify(value);
      }
      return value;
    };
    const requestParams = Object.entries(request.queryParameters || {}).map(x => {
      return {
        key: x[0],
        pattern: Object.entries(x[1])[0][0],
        value: toString(Object.entries(x[1])[0][1]),
      };
    });
    const requestHeaders = Object.entries(request.headers || {}).map(x => {
      return {
        key: x[0],
        pattern: Object.entries(x[1])[0][0],
        value: toString(Object.entries(x[1])[0][1]),
      };
    });
    let requestBodys = [];
    if (Array.isArray(request.bodyPatterns)) {
      requestBodys = request.bodyPatterns.map(x => {
        return {
          key: Object.entries(x)[0][0],
          value: toString(Object.entries(x)[0][1]),
        };
      });
    }
    // response部分
    const responseHeaders = Object.entries(response.headers || {}).map(
      x => {
        return {
          key: x[0],
          value: toString(x[1]),
        };
      }
    );
    const responseStatus = response.status;
    const responseStatusMessage = response.statusMessage;
    let responseBody = response.body === undefined ? response.jsonBody : response.body;
    if (typeof responseBody === 'object') {
      responseBody = JSON.stringify(responseBody);
    }
    this.setState({
      method,
      urlKey,
      urlValue,
      requestParams,
      requestHeaders,
      requestBodys,
      responseStatus,
      responseStatusMessage,
      responseBody,
      responseHeaders,
    });
  }

  handleSet(stateObj) {
    this.setState(stateObj, () => {
      const mockData = this.assembleMapping();
      this.props.onChange(mockData);
    });
  }

  /**
   * 添加request queryParameters
   */
  addParams() {
    const { requestParams } = this.state;
    requestParams.push({
      key: '',
      pattern: this.props.patterns[0],
      value: '',
    });
    this.setState({
      requestParams,
    });
  }
  /**
   * 添加request header
   */
  addHeaders() {
    const { requestHeaders } = this.state;
    requestHeaders.push({
      key: headers[0],
      pattern: this.props.patterns[0],
      value: '',
    });
    this.setState({
      requestHeaders,
    });
  }
  /**
   * 添加request body
   */
  addBodys() {
    const { requestBodys } = this.state;
    requestBodys.push({
      key: this.props.bodys[0],
      value: '',
    });
    this.setState({
      requestBodys,
    });
  }
  /**
   * 添加response body
   */
  addResponseHeaders() {
    const { responseHeaders } = this.state;
    responseHeaders.push({
      key: headers[0],
      value: '',
    });
    this.setState({
      responseHeaders,
    });
  }
  /**
   * 修改某个表单值 依据groupName判断
   */
  updateGroup(groupName, key, value, index) {
    if (groupName in this.state) {
      const { [groupName]: group } = this.state;
      group[index][key] = value;
      this.handleSet({ [groupName]: group });
    }
  }
  /**
   * 删除一行
   */
  removeGroup(groupName, index) {
    if (groupName in this.state) {
      const { [groupName]: group } = this.state;
      this.handleSet({
        [groupName]: group.filter((x, idx) => idx !== index),
      });
    }
  }
  /**
   * 组装mapping映射文件的 request和response，逻辑和getMock相反
   */
  assembleMapping() {
  //  {
  //     "request": {
  //       "method": "GET",
  //       "urlPath": "/everything",
  //       "queryParameters" : {
  //         "search_term" : {
  //           "equalTo" : "WireMock"
  //         }
  //       },
  //       "headers": {
  //         "Content-Type": {
  //           "equalTo": "application/json"
  //         }
  //       },
  //       "bodyPatterns" : [ {
  //         "matchesXPath" : "/stuff:outer/more:inner[.=111]",
  //       }]
  //     },
  //     "response": {
  //       "status": 200,
  //       "statusMessage": "ok",
  //       "body": "testdetail.json",
  //       "headers": {
  //         "Content-Type": "text/plain"
  //       }
  //     }
  //  }
    const {
      method,
      urlKey,
      urlValue,
      requestParams,
      requestBodys,
      requestHeaders,
      responseStatus,
      responseStatusMessage,
      responseBody,
      responseHeaders,
    } = this.state;

    const generateObj = (ary) => {
      const result = {};
      ary.forEach(x => {
        if (x.key && !result.hasOwnProperty(x.key)) {
          result[x.key] = {
            [x.pattern]: x.value,
          };
        }
      });
      return result;
    };

    const generateAry = (ary) => {
      return ary.map(x => {
        return {
          [x.key]: x.value,
        };
      });
    };
    // 组装request
    const request = {
      method,
      [urlKey]: urlValue,
    };
    if (requestParams.some(x => !!x.key.trim())) {
      request.queryParameters = generateObj(requestParams);
    }
    // method为get时 不允许添加body
    if (method !== 'GET' && requestBodys.some(x => !!x.key.trim())) {
      request.bodyPatterns = generateAry(requestBodys);
    }
    if (requestHeaders.some(x => !!x.value.trim())) {
      request.headers = generateObj(requestHeaders);
    }
    // 组装response
    const response = {
      status: responseStatus,
      statusMessage: responseStatusMessage,
    };
    if (responseHeaders.some(x => !!x.value.trim())) {
      response.headers = generateAry(responseHeaders).reduce((prev, next) => Object.assign(prev, next));
    }
    // 根据输入的body内容判断 要返回的response中包含body还是jsonBody
    let bodyKey = null;
    try {
      const bodyValue = JSON.parse(responseBody);
      if (typeof bodyValue === 'object') {
        bodyKey = 'jsonBody';
        response[bodyKey] = bodyValue;
      } else {
        bodyKey = 'body';
        response[bodyKey] = responseBody;
      }
    } catch (e) {
      bodyKey = 'body';
      response[bodyKey] = responseBody;
    }

    return {
      request,
      response,
    };
  }

  /**
   * 生成Dropdown组件需要的options
   */
  generateOptions(ary) {
    if (Array.isArray(ary)) {
      return ary.map(x => {
        return {
          value: x,
          label: x,
        };
      });
    }
    return [];
  }

  render() {
    const {
      method,
      urlKey,
      urlValue,
      requestParams,
      requestBodys,
      requestHeaders,
      responseHeaders,
      responseStatus,
      responseStatusMessage,
      responseBody,
      activeIndex,
    } = this.state;
    const { patterns, urls, bodys } = this.props;
    // 请求 queryParameters
    const patternOptions = this.generateOptions(patterns);
    const requestParamsDiv = requestParams.map((x, idx) =>
      <div className="atfc-input-group" key={idx}>
        <Input placeholder="key" value={x.key} onChange={value => this.updateGroup('requestParams', 'key', value, idx )} />
        {(!patterns.includes(x.pattern) || x.pattern === patterns[patterns.length - 1]) ?
          <Input placeholder="value" value={x.pattern} onChange={value => this.updateGroup('requestParams', 'pattern', value, idx)} />
          :
          <Dropdown options={patternOptions} defaultValue={x.pattern} onChange={value => this.updateGroup('requestParams', 'pattern', value, idx)} />
        }
        <Input placeholder="value" value={x.value} onChange={value => this.updateGroup('requestParams', 'value', value, idx)} />
        <Glyphicon glyph="remove" onClick={() => this.removeGroup('requestParams', idx)} />
      </div>
    );
    requestParamsDiv.push(
      <div className="atfc-input-group" key={requestParamsDiv.length}>
        <Input placeholder="key" onFocus={() => this.addParams()} />
        <Dropdown options={patternOptions} defaultValue="equalTo" onClick={() => this.addParams()} />
        <Input placeholder="value" onFocus={() => this.addParams()} />
        <Glyphicon glyph="remove" style={{ visibility: 'hidden' }} />
      </div>
    );
    // 请求 header
    const headerOptioins = this.generateOptions(headers);
    const requestHeadersDiv = requestHeaders.map((x, idx) =>
      <div className="atfc-input-group" key={idx}>
        {(!headers.includes(x.key) || x.key === headers[headers.length - 1]) ?
          <Input placeholder="value" value={x.key} onChange={value => this.updateGroup('requestHeaders', 'key', value, idx)} />
          :
          <Dropdown options={headerOptioins} defaultValue={x.key} onChange={value => this.updateGroup('requestHeaders', 'key', value, idx)} />
        }
        {(!patterns.includes(x.pattern) || x.pattern === patterns[patterns.length - 1]) ?
          <Input placeholder="value" value={x.pattern} onChange={value => this.updateGroup('requestHeaders', 'pattern', value, idx)} />
          :
          <Dropdown options={patternOptions} defaultValue={x.pattern} onChange={value => this.updateGroup('requestHeaders', 'pattern', value, idx)} />
        }
        <Input placeholder="value" value={x.value} onChange={value => this.updateGroup('requestHeaders', 'value', value, idx)} />
        <Glyphicon glyph="remove" onClick={() => this.removeGroup('requestHeaders', idx)} />
      </div>
    );
    requestHeadersDiv.push(
      <div className="atfc-input-group" key={requestHeadersDiv.length}>
        <Dropdown options={headerOptioins} defaultValue={headers[0]} onClick={() => this.addHeaders()} />
        <Dropdown options={patternOptions} defaultValue={patterns[0]} onClick={() => this.addHeaders()} />
        <Input placeholder="value" onFocus={() => this.addHeaders()} />
        <Glyphicon glyph="remove" style={{ visibility: 'hidden' }} />
      </div>
    );
    // 请求 body
    const bodyOptions = this.generateOptions(bodys);
    const requestBodysDiv = requestBodys.map((x, idx) =>
      <div className="atfc-input-group" key={idx}>
        {(!bodys.includes(x.key) || x.key === bodys[bodys.length - 1]) ?
          <Input placeholder="value" value={x.key} onChange={value => this.updateGroup('requestBodys', 'key', value, idx)} />
          :
          <Dropdown options={bodyOptions} defaultValue={x.key} onChange={value => this.updateGroup('requestBodys', 'key', value, idx)} />
        }
        <OverlayTrigger
          trigger="click"
          rootClose
          placement="top"
          overlay={
            <Popover id="1" title="request-body" className="sql-pop">
              <JsonEditor name="request-body" height="200px" value={x.value} onChange={value => this.updateGroup('requestBodys', 'value', value, idx)} />
            </Popover>
          }
        >
          <Input placeholder="value" value={x.value} onChange={value => this.updateGroup('requestBodys', 'value', value, idx)} />
        </OverlayTrigger>
        <Glyphicon glyph="remove" onClick={() => this.removeGroup('requestBodys', idx)} />
      </div>
    );
    requestBodysDiv.push(
      <div className="atfc-input-group" key={requestBodysDiv.length}>
        <Dropdown options={bodyOptions} defaultValue={bodys[0]} onClick={() => this.addBodys()} />
        <Input placeholder="value" onFocus={() => this.addBodys()} />
        <Glyphicon glyph="remove" style={{ visibility: 'hidden' }} />
      </div>
    );
    // 响应 body
    const responseHeadersDiv = responseHeaders.map((x, idx) =>
      <div className="atfc-input-group" key={idx}>
        {(!headers.includes(x.key) || x.key === headers[headers.length - 1]) ?
          <Input placeholder="value" value={x.key} onChange={value => this.updateGroup('responseHeaders', 'key', value, idx)} />
          :
          <Dropdown options={headerOptioins} defaultValue={x.key} onChange={value => this.updateGroup('responseHeaders', 'key', value, idx)} />
        }
        <Input placeholder="value" value={x.value} onChange={value => this.updateGroup('responseHeaders', 'value', value, idx)} />
        <Glyphicon glyph="remove" onClick={() => this.removeGroup('responseHeaders', idx)} />
      </div>
    );
    responseHeadersDiv.push(
      <div className="atfc-input-group" key={responseHeadersDiv.length}>
        <Dropdown options={headerOptioins} defaultValue={headers[0]} onClick={() => this.addResponseHeaders()} />
        <Input placeholder="value" onFocus={() => this.addResponseHeaders()} />
        <Glyphicon glyph="remove" style={{ visibility: 'hidden' }} />
      </div>
    );
    // 请求方式和url
    const methodOptions = this.generateOptions(methods);
    const urlOptions = this.generateOptions(urls);
    return (
      <div>
        <h3>Request</h3>
        <div className="request-url-group">
          <Dropdown
            className="righttrim" options={methodOptions} defaultValue={method} onChange={value => {
              // 如果切换到get请求并且当前activeIndex为body，则重置activeIndex
              if (value === 'GET' && activeIndex === 2) {
                this.handleSet({
                  method: value,
                  activeIndex: 0,
                });
              } else {
                this.handleSet({ method: value });
              }
            }}
          />
          <Dropdown className="lefttrim" options={urlOptions} defaultValue={urlKey} onChange={value => this.handleSet({ urlKey: value })} />
          <Input placeholder="url" value={urlValue} onChange={value => this.handleSet({ urlValue: value })} />
        </div>
        <Tabs activeIndex={activeIndex} onChange={index => this.handleSet({ activeIndex: index })}>
          <Tabs.Tab label="queryParameter">
            {requestParamsDiv}
          </Tabs.Tab>
          <Tabs.Tab label="header">
            {requestHeadersDiv}
          </Tabs.Tab>
          <Tabs.Tab label="body" disabled={method === 'GET'}>
            {requestBodysDiv}
          </Tabs.Tab>
        </Tabs>
        <h3>Response</h3>
        status<Input placeholder="" value={responseStatus} onChange={value => this.handleSet({ responseStatus: value })} />
        statusMessage<Input placeholder="" value={responseStatusMessage} onChange={value => this.handleSet({ responseStatusMessage: value })} />
        body
        <OverlayTrigger
          trigger="click"
          rootClose
          placement="top"
          overlay={
            <Popover id="0" title="response-body" className="sql-pop">
              <JsonEditor name="response-body" height="200px" value={responseBody} onChange={value => this.handleSet({ responseBody: value})} />
            </Popover>
          }
        >
          <Input placeholder="" value={responseBody} onChange={value => this.handleSet({ responseBody: value })} />
        </OverlayTrigger>
        header{responseHeadersDiv}
      </div>
    );
  }
}

Curl.propTypes = {
  patterns: PropTypes.array,
  urls: PropTypes.array,
  bodys: PropTypes.array,
  mockData: PropTypes.object,
  onChange: PropTypes.func,
};

Curl.defaultProps = {
  patterns: [
    'equalTo',
    'contains',
    'matches',
    'doesNotMatch',
    'absent',
    'User Define',
  ],
  urls: [
    'url',
    'urlPattern',
    'urlPath',
    'urlPathPattern',
  ],
  bodys: [
    'equalToJson',
    'equalToXml',
    'matchesJsonPath',
    'matchesXPath',
    'ignoreArrayOrder',
    'ignoreExtraElements',
    'User Define',
  ],
  mockData: null,
  onChange() {},
};

export default Curl;
