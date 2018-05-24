import React from 'react';
import { Link } from 'react-router';
import { Button, Input, Breadcrumb, BreadcrumbItem, Modal } from 'react-bootstrap';
import { CodeMirror, Notification } from 'atfcapi';
import VariableValue from './VariableValue';
import Precondition from './Precondition';
import RequestParams from './RequestParams';
import Parameters from './Parameters';
import Header from './Header';
import Body from './Body';
import RequestBaseInfo from './RequestBaseInfo';
import WireMock from '../selectApi/WireMock/index';
import { validator, getEnvId } from '../../vendor/util';
import fetchX from '../../vendor/Fetch';

class ApiRequest extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      type: 0, // 0从select api进来，1从case页面，单个api点击send进来
      position: -1,
      caseId: 0,
      pathId: 0,
      projectId: 0,
      preList: [],
      executeBefore: false, // 是否执行前置suite
      envList: [], // 固有环境信息 showPrintMargin
      envId: 0, // 默认环境
      suiteNames: [],
      executeEnv: 0, // 执行环境
      parametersDescrp: [],
      requestHeader: [],
      response: '',
      baseInfo: {},
      apiDetail: {},
      sendBody: '',
      headers: '',
      headerArr: [],
      queryParams: [],
      pathParams: [],
      cookies: '',
      responseMsg: '',
      responseCode: null,
      responseData: '',
      responseSchema: null,
      sendCount: 0,
      loading: false,
      thriftFileName: null,
      mockData: {},
      isMock: false, // 是否使用mock
      showMockDetail: false,
      mockDetail: '',
      isProjectMock: false, // 该项目是否开启了mock
      activeIndex: 0, //
    };
    // type position folderId caseId pathId projectId projectName
    Object.assign(this.state, this.props.location.state);
  }

  componentDidMount() {
    this.loadMockDetail(false);
    if (this.state.position > -1) {
      this.loadJsonFile();
    } else {
      this.loadApiDetail();
    }
    this.loadEnvList();
    this.loadSuiteNames();
  }

  // WireMock curl or uploadFile
  onTabChange(index) {
    if (index !== this.state.activeIndex) {
      this.setState({
        activeIndex: index,
      });
    }
  }

  loadJsonFile() {
    const { caseId, position } = this.state;
    fetchX.get(`/atfcapi/sendRequest/get/${caseId}/${position}`)
    .then(json => {
      if (json.code === '200') {
        const { body, cookie = '', header, baseInfo = {}, precondition, responseSchema, pathId, thriftFileName, serviceType, mockData, isMock } = json.data;
        const apiDetail = Object.assign({}, json.data);
        const isSoaOrThirft = (parseInt(serviceType, 10) === 2 || parseInt(serviceType, 10) === 3);

        let sendBody = typeof body === 'object' ? JSON.stringify(body, null, 2) : body;
        // 如果是sor或者thirft
        if (isSoaOrThirft) {
          const args = body.args;
          // 只显示args信息
          sendBody = args ? JSON.stringify(args, null, 2) : sendBody;
        }
        this.setState({
          preList: precondition,
          headers: header ? JSON.stringify(header) : '',
          headerArr: header || [],
          cookies: cookie,
          sendBody,
          baseInfo,
          responseSchema,
          apiDetail,
          body,
          pathId,
          thriftFileName,
          mockData,
          isMock,
        });
      } else {
        Notification.error(json.msg);
      }
    })
  }

  loadApiDetail() {
    const { pathId } = this.state;
    fetchX.get(`atfcapi/apiQuery/detail/${pathId}`)
    .then(json => {
      if (json.code === '200') {
        this.setState({
          apiDetail: json.data || {},
          headers: json.data.headers ? JSON.stringify(json.data.headers) : '',
          headerArr: json.data.headers || [],
          responseSchema: json.data.responseSchema,
        }, this.initMockData);
        this.loadServiceDetail();
      } else {
        Notification.error(json.msg || json.message);
      }
    }).catch(err => Notification.error(err.message));
  }

  loadEnvList() {
    fetchX.get('/atfcapi/commonConfig/getAllEvn')
    .then(json => {
      if (json.code === '200') {
        const envId = getEnvId(json.data);
        this.setState({
          envList: json.data,
          executeEnv:envId,
          envId,
        });
      } else {
        Notification.error(json.msg || json.message);
      }
    }).catch(err => Notification.error(err.message));
  }

  loadMockDetail(showDetailModal) {
    const { projectId } = this.state;
    fetchX.post('/atfcapi/project/mockDetail', { projectId })
    .then(json => {
      if (json.code === '200') {
        this.setState({
          mockDetail: JSON.stringify(json.data, null, 2),
          isProjectMock: true,
          showMockDetail: showDetailModal,
        });
      } else if (json.code === '417') {
        this.setState({
          isProjectMock: false,
        });
      } else {
        Notification.error(json.msg || json.message);
      }
    }).catch(err => Notification.error(err.message));
  }

  loadServiceDetail() {
    const { apiDetail } = this.state;
    if (!apiDetail.projectServiceId) return false;
    const condi = {
      projectServiceId: apiDetail.projectServiceId,
    };
    fetchX.get('/atfcapi/uploadFile/querydetail', condi)
    .then(json => {
      if (json.code === '200') {
        const baseInfo = {
          Appid: json.data.appIdName,
          serviceName: json.data.serviceName,
          Project: json.data.projectName,
          Method: apiDetail.method,
          Path: apiDetail.paths,
          BasePath: apiDetail.basePath,
        };
        apiDetail.baseUriPort = json.data.baseUriPort;
        this.setState({
          baseInfo,
          apiDetail,
        });
        this.loadSuiteNames();
      } else {
        Notification.error(json.msg || json.message);
      }
    }).catch(err => Notification.error(err.message));
  }

  loadSuiteNames() {
    const { suiteNames, folderId } = this.state;
    if (suiteNames.length) return;
    const condi = {
      folderId,
    };
    fetchX.post('/atfcapi/suiteCase/getAll', condi)
    .then(json => {
      if (json.code === '200') {
        this.setState({
          suiteNames: json.data,
        });
      } else {
        Notification.error(json.msg || json.message);
      }
    }).catch(err => Notification.error(err.message));
  }
  // 只有insertApi的时候初始化请求方式和url
  initMockData() {
    const { basePath = '', method = 'GET', paths = '' } = this.state.apiDetail || {};
    const mockData = {};
    mockData.request = {};
    mockData.response = {};
    mockData.request.method = method.toUpperCase();
    mockData.request.url = basePath + paths;
    this.setState({
      mockData,
    });
  }
  validateWireMock(mockData) {
    let result = true;
    if (mockData === null) {
      Notification.error('请填写mock信息');
      return false;
    }
    // 校验url
    let urlValue = null;
    if (mockData.request.hasOwnProperty('url')) {
      urlValue = mockData.request.url;
    }
    if (mockData.request.hasOwnProperty('urlPattern')) {
      urlValue = mockData.request.urlPattern;
    }
    if (mockData.request.hasOwnProperty('urlPath')) {
      urlValue = mockData.request.urlPath;
    }
    if (mockData.request.hasOwnProperty('urlPathPattern')) {
      urlValue = mockData.request.urlPathPattern;
    }
    result = validator.required(urlValue);
    if (!result) {
      Notification.error('mock url can not be empty');
      return result;
    }
    // 校验response
    result = Object.values(mockData.response).some(x => validator.required(x));
    if (!result) {
      Notification.error('When using mock response can not use all the empty');
      return result;
    }
    if (mockData.response.status) {
      result = /^\d+$/.test(mockData.response.status);
      if (!result) {
        Notification.error('Response status as a state only allows integer');
        return result;
      }
      const parsedStatus = parseInt(mockData.response.status, 10);
      if (parsedStatus < 200 || parsedStatus > 600) {
        Notification.error('please enter a valid code');
        return result;
      }
    }
    return result;
  }

  async sendRequest() {
    const { apiDetail, baseInfo, caseId, preList, sendBody, cookies, executeBefore, executeEnv, suiteNames, sendCount, headers, isMock } = this.state;
    let precondition = preList;

    if (!suiteNames.length) {// 当suiteNames为空时，表示当前项目下只有一个suite，前置条件为suiteName的都过滤掉
      const pre = preList;
      for (let i = 0; i < pre.length; i++) {
        if (pre[i].key === 'caseName' && pre[i].value === 0) {
          pre.splice(i, 1);
        }
      }
      precondition = pre;
    } else {// 当suiteNames非空时，将preList中的suiteID替换成suiteName
      for (let i = 0; i < precondition.length; i++) {
        if (precondition[i].key === 'caseName') {
          for (let j = 0; j < suiteNames.length; j++) {
            if (precondition[i].value === suiteNames[j].suiteId) {
              precondition[i].value = suiteNames[j].testCaseFileName;
            }
          }
        }
      }
    }
    // 将显示用的dbScriptValue字段删掉，接口不需要
    if (precondition.length) {
      for (let i = 0; i < precondition.length; i++) {
        if (precondition[i].key === 'DBScript' && precondition[i].hasOwnProperty('dbScriptValue')) {
          delete precondition[i].dbScriptValue;
        }
      }
    }
    this.setState({
      sendCount: sendCount + 1,
    });
    const condi = {
      pathId: apiDetail.pathId,
      suiteId: caseId,
      precondition: JSON.stringify(precondition),
      basePath: baseInfo.BasePath,
      path: baseInfo.Path,
      header: headers,
      body: sendBody,
      cookies: cookies,
      executeBefore: executeBefore ? 1 : 0,
      executeEnv: executeEnv,
      bodyMethod: apiDetail.bodyMethod,
      bodyIface: apiDetail.bodyIface,
      bodyVer: apiDetail.bodyVer,
      bodyRpc: apiDetail.bodyRpc,
      bodyReq: apiDetail.bodyReq,
      operation: sendCount > 0 ? 1 : 0,
      apiDescription: apiDetail.apiDescription,
      baseUriPort: apiDetail.baseUriPort,
      method: apiDetail.method || baseInfo.Method,
      serviceType: apiDetail.serviceType,
      jPython: JSON.stringify(apiDetail.jPython),
      js: JSON.stringify(apiDetail.js),
      rabbitMq: JSON.stringify(apiDetail.rabbitMq),
      redis: JSON.stringify(apiDetail.redis),
      isMock,
    };
    // 单步send
    const { position, thriftFileName } = this.state;
    if (position > -1) {
      Object.assign(condi, {
        thriftFileName,
      });
    }
    // mockData，isMock为true或false都发送mockData参数
    const { mockData, activeIndex } = this.state;

    if (activeIndex === 0) {
      // 勾选了并且当前activeIndex为0 才校验
      if (isMock) {
        if (!this.validateWireMock(mockData)) return;
      }
      Object.assign(condi, {
        mockData: JSON.stringify(mockData),
      });
    }
    try {
      this.setState({
        loading: true,
      });
      const { msg, data, code } = await fetchX.post('/atfcapi/sendRequest/executeSendRequest', condi);
      if (code === '200') {
        this.setState({
          responseMsg: msg,
          responseCode: code,
          responseData: data,
        });
        localStorage.setItem('executeEnv', executeEnv);

        this.setState({
          loading: false,
        });
      } else {
        Notification.error(msg);
      }
    } catch (e) {
      Notification.error(e.message);
    } finally {
      this.setState({
        loading: false,
      });
    }
  }

  buildCookieDiv() {
    const { cookies } = this.state;
    return (
      <div>
        <h4>Cookie</h4>
        <Input type="textarea" value={cookies} onChange={e => this.handleCookieChange(e)} />
      </div>
    );
  }

  handleCookieChange(e) {
    const target = e.target;
    this.setState({
      cookies: target.value,
    });
  }

  buildSendRequestDiv() {
    const {
      envList,
      executeBefore,
      executeEnv,
      loading,
      isMock,
      isProjectMock,
    } = this.state;
    const envOption = envList.map( k =>
      <option key={k.envId} value={k.envId}>{k.envName}</option>
    );
    const envSelect = (<Input type="select" name="runEnv" value={executeEnv} onChange={e => this.handleRunEnvChange(e)} >
      { envOption }
    </Input>);
    return (
      <div>
        <Input
          type="checkbox"
          name="executeBefore"
          groupClassName="assert-cbx"
          label="Include Previous Steps"
          checked={executeBefore ? 'checked' : ''}
          onChange={() => this.handleExcBef()}
          value={this.state.executeBefore}
        />
        <Input
          type="checkbox"
          name="useMock"
          groupClassName="assert-cbx"
          label="Use Mock"
          checked={isMock ? 'checked' : ''}
          onChange={() => {
            this.setState({
              isMock: !isMock,
            });
          }}
          value={isMock}
          disabled={!isProjectMock}
        />
        {envSelect}
        <Button bsStyle="primary" disabled={loading} onClick={() => this.sendRequest()}>{loading ? 'Sending' : 'Send Request'}</Button>
      </div>
    );
  }

  handleRunEnvChange(e) {
    const target = e.target;
    this.setState({
      executeEnv: target.value,
    });
  }

  handleExcBef() {
    const { executeBefore } = this.state;

    this.setState({
      executeBefore: !executeBefore,
    });
  }

  handleInputChange(e) {
    const target = e.target;
    const { baseInfo } = this.state;
    switch (target.name) {
    case 'basePath':
      baseInfo.BasePath = target.value; break;
    case 'paths':
      baseInfo.Path = target.value; break;
    default: break;
    }
    this.setState({
      baseInfo,
    });
  }

  handleQueryChange(value) {
    const { baseInfo } = this.state;
    baseInfo.Path = value;
    this.setState({ baseInfo });
  }

  handleBodyChange(body) {
    this.setState({
      sendBody: body,
    })
  }

  handlePathChange(value) {
    const { baseInfo } = this.state;
    baseInfo.Path = value;
    this.setState({ baseInfo });
  }

  buildResponse() {
    const { responseCode, responseMsg, responseData } = this.state;
    return (
      <div className="response-container">
        <h4>Response</h4>
        <p>Code:{responseCode ? responseCode : 'not available'}</p>
        <p>Msg:{responseMsg ? responseMsg : 'not available'}</p>
        <p>Data:</p>
        <CodeMirror
          height="320px"
          value={JSON.stringify(responseData, null, 2)}
          options={{
            readOnly: true,
          }}
        />
      </div>
    );
  }

  render() {
    const {
      type,
      projectId,
      projectName,
      caseId,
      position,
      folderId,
      pathId,
      responseSchema,
      headers,
      sendBody,
      apiDetail,
      baseInfo,
      headerArr,
      responseData,
      responseCode,
      preList,
      envList,
      envId,
      suiteNames,
      mockData,
      mockDetail,
      isProjectMock,
    } = this.state;

    const cookieDiv = this.buildCookieDiv();
    const sendRequestDiv = this.buildSendRequestDiv();
    const responseDiv = this.buildResponse();
    const selectapi = this.props.location.state.selectapi;
    let content;
    try {
      content = JSON.parse(headers);
    } catch (e) {
      content = [];
    }

    const keyValue = content.map(x => {
      const key = Object.keys(x)[0];
      return {
        key,
        value: x[key],
      };
    });
    return (
      <main className="api-request">
        <Breadcrumb>
          <BreadcrumbItem href="#">
            Home
          </BreadcrumbItem>
          <BreadcrumbItem href={`/#/project/${projectId}/folder/${folderId}?_k=${this.props.location.key}`}>
            {projectName}
          </BreadcrumbItem>
          {
            type === 0 ?
              <BreadcrumbItem href={`/#/api/select/?_k=${selectapi}`}>
                Select API
              </BreadcrumbItem>
            :
            ''
          }
          <BreadcrumbItem active>
            API Request
          </BreadcrumbItem>
        </Breadcrumb>
        <div className="api-request-container">
          <div className="api-request-left">
            <Precondition
              preList={preList}
              envList={envList}
              envId={envId}
              suiteNames={suiteNames}
              onChange={(data) => this.setState({preList: data})}
            />
            <RequestParams params={apiDetail.paramsUrl} />
            <Parameters
              requestSchema={apiDetail.requestSchema}
              params={apiDetail.paramsUrl}
              path={baseInfo.Path}
              args={apiDetail.bodyArgs}
              body={apiDetail.body}
              onQueryChange={value => this.handleQueryChange(value)}
              onBodyChange={value => this.handleBodyChange(value)}
              onPathChange={value => this.handlePathChange(value)}
            />
            <VariableValue preList={preList} projectId={projectId} caseId={caseId} />
            <WireMock
              mockData={mockData}
              projectId={projectId}
              isMocked={isProjectMock}
              show={() => this.loadMockDetail(true)}
              onChange={value => this.setState({mockData: value})}
              onTabChange={index => this.onTabChange(index)}
              updateMockStatus={status => this.setState({isProjectMock: status})}
            />
          </div>
          <div className="api-request-right">
            <div className="row">
              <div className="send-info-container">
                <RequestBaseInfo
                  baseInfo={baseInfo}
                  onChange={(e) => this.handleInputChange(e)}
                />
                <Header
                  keyValue={keyValue}
                  headerArr={headerArr}
                  onChange={value => this.setState({headers: value})}
                />
                <Body
                  apiDetail={apiDetail}
                  sendBody={sendBody}
                  headerArr={headerArr}
                  onBodyChange={value => this.handleBodyChange(value)}
                  onBodyPreChange={value => this.setState({apiDetail: value})}
                />
                {cookieDiv}
              </div>
              <div className="send-request-container">
                {sendRequestDiv}
              </div>
            </div>
          </div>
          {responseDiv}
        </div>
        <div className="api-request-opt">
          {type === 0 ?
            <Link to={{pathname: `/api/select`, state: Object.assign({}, this.props.location.state)}}>
              <Button>Previous</Button>
            </Link>
            :
            <Link to={{pathname: `/project/${projectId}/folder/${folderId}`, state: Object.assign({}, this.props.location.state)}}>
              <Button>Previous</Button>
            </Link>
          }
          <Link to={{pathname: `/api/assert`, state: { type, projectId, folderId, caseId, position, pathId, projectName, responseSchema, responseData, apirequest: this.props.location.key, selectapi }}}><Button bsStyle="primary" disabled={responseCode === null}>Next</Button></Link>
        </div>
        <Modal show={this.state.showMockDetail}>
          <Modal.Header >
            <Modal.Title>Mock Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <textarea className="form-control" name="mock-detail" id="mock-detail" cols="70" rows="30">
              {mockDetail}
            </textarea>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => this.setState({showMockDetail: false})}>Close</Button>
          </Modal.Footer>
        </Modal>
      </main>
    );
  }
}

ApiRequest.propTypes = {
  location: React.PropTypes.object,
};

export default ApiRequest;
