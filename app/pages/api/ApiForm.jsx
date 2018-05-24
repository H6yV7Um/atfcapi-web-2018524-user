import React from 'react';
import { Input, ButtonInput, Button, PanelGroup, Panel, Table } from 'react-bootstrap';
import { ServiceFilter, DeleteDialog, Notification } from 'atfcapi';
import Parameter from './Parameter';
import JsonEditor from '../selectApi/JsonEditor';
import fetchX from '../../vendor/Fetch';

class ApiForm extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      loading: false,
      auth: [],
      pathId: props.pathId || 0,
      data: props.data,
      parameters: [],
      bodyCheck: true,
      responseCheck: true,
      serviceDetail: {},
      appIds: [],
      services: [],
      key: localStorage.getItem('activeKey') || '1',
    };
  }

  componentDidMount() {
    this.getAuth();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.state.data) {
      this.setState({
        data: nextProps.data,
        parameters: nextProps.data.responseBodies || [],
      }, () => this.getServiceDetail() );
    }
  }

  componentWillUnmount() {
    localStorage.removeItem('activeKey');
  }

  async getAuth() {
    const url = '/atfcapi/commonAuth/queryAuth';
    try {
      const { code , msg, data = {}} = await fetchX.get(url);
      if (code === '200') {
        this.setState({
          auth: data.list || [],
        })
      } else {
        Notification.error(msg);
      }
    } catch (e) {
      throw e
    }
  }

  getServiceDetail() {
    let { data, serviceDetail} = this.state;
    if (!data.projectServiceId) return false;
    let querydetail = fetchX.get('/atfcapi/uploadFile/querydetail', {
      projectServiceId: data.projectServiceId,
    })
    querydetail.then(res => {
      serviceDetail = res.data || {};
      return fetchX.get('/atfcapi/uploadFile/queryAppId', {
        offset: 0,
        limit: 10,
        projectId: `${res.data.projectId}`,
      })
    }).then(res => {
      this.setState({
        appIds: res.data.list || [],
        serviceDetail,
      })
      this.loadServices(serviceDetail.appId, serviceDetail.projectId);
    }).catch(res => {
      if (res && res.message) Notification.error(res.message);
    })
  }

  loadServices(appId, projectId) {
    if (!projectId || !appId) return;
    const condi = {
      projectId,
      appId,
      offset: 0,
      limit: 10,
    };
    fetchX.get('/atfcapi/uploadFile/queryServiceName', condi)
    .then( res => {
      if (res.code === '200') {
        const { data, serviceDetail } = this.state;
        let services = res.data.list || [];
        if (this.state.services.length) {
          data.projectServiceId = services.length > 0 ? services[0].serviceId : 0;
          data.projectServiceName = services.length > 0 ? services[0].serviceName : '';
        }

        serviceDetail.appId = appId;
        this.setState({
          services,
          data,
          serviceDetail,
        });

      } else {
        Notification.error(res.msg || res.message);
      }
    });
  }

  handleChange(event) {
    const { data , serviceDetail } = this.state;
    let { value, name } = event.target;

    if (name === 'port' || name === 'retryCount' ) value = value.replace(/\D+/g, '');
    if (name === 'responseData' ) {
      data.responseBodies[0].responseData = value;
    } else if (name === 'appId'){
      this.loadServices(value, serviceDetail.projectId);
      return;
    } else if(name === 'serviceName'){
      data.projectServiceId = value;
    }
    else {
      data[event.target.name] = value;
    }

    this.setState({
      data: data,
      bodyCheck: true,
      responseData: true,
    });
  }

  checkIntegrity(condi) {
    let msg = ``;
    msg += !condi.apiDescription ? `API Description \n` : ``;
    msg += !condi.projectServiceId ? `Service Name \n` : ``;
    msg += !condi.paths ? `Paths ` : ``;
    if (msg) Notification.error(`Please fill in the following information \n` + msg);
    return msg;
  }

  handleSelect(projectId, appId, serviceId) {
    const { data } = this.state;
    data.projectServiceId = serviceId;
    this.setState({
      data: data,
    });
  }

  handleSaveBaseInfo() {
    const serviceType = this.state.data.serviceType;
    if (serviceType === 3) { // 如果是thrift类型api，调用saveThriftApiInfo保存信息
      this.saveThriftApiInfo();
    } else {
      this.saveCommonApiInfo();
    }
  }

  async saveCommonApiInfo() {
    const { data, pathId, auth } = this.state;
    try {
      if (typeof data.responseSchema === 'string'){
        JSON.parse(data.responseSchema);
      } else {
        data.responseSchema = JSON.stringify(data.responseSchema);
      }
    } catch (err) {
      Notification.error('responseSchema field JSON format validation error: ' + err);
      return;
    }
    const condi = Object.assign({}, data);
    let url;
    if (!pathId) {
      url = `/atfcapi/newApi/insertNewAPI`;
    } else {
      url = `/atfcapi/newApi/updateNewAPI`;
      delete condi.responseBodies;
      delete condi.paramsUrl;
    }
    if (!condi.authId) condi.authId = auth[0].id;
    if (this.checkIntegrity(condi)) return false;
    try {
      this.setState({
        loading: true,
      });
      const { msg, code, data:pathID  } = await fetchX.post(url, condi);
      if (code === '200') {
        if (!pathId && pathID) {// insertNewAPI成功后，跳转到update页面res.data是pathID
          window.location.href = `/#/api/${pathID}`;
        } else {// updateNewAPI成功后，刷新当前页
          Notification.error(msg);
          window.location.reload();
        }
      } else {
        Notification.error(msg);
      }
    } catch (e) {
      throw e
    } finally {
      this.setState({
        loading: false,
      });
    }
  }

  async saveThriftApiInfo() {
    const data = this.state.data;
    let condi = {
      pathId: data.pathId,
      apiDescription: data.apiDescription,
      apiSummary: data.apiSummary,
      responseId: data.responseBodies[0].responseId,
      responseData: data.responseBodies[0].responseData,
      projectServiceId: data.projectServiceId,
    };
    // 校验data.apiSummary是不是json
    try {
      JSON.parse(data.apiSummary);
      if (typeof(JSON.parse(data.apiSummary)) === 'number' || typeof(JSON.parse(data.apiSummary)) === 'string') throw '不是json';
    } catch (err) {
      Notification.error('Args field JSON format validation error: ' + err);
      return;
    }
    // 校验data.responseBodies[0].responseData是不是json
    try {
      JSON.parse(data.responseBodies[0].responseData);
    } catch (err) {
      Notification.error('Response Data field JSON format validation error: ' + err);
      return;
    }
    try {
      if (typeof data.responseSchema === 'string') {
        JSON.parse(data.responseSchema)
      } else {
        data.responseSchema = JSON.stringify(data.responseSchema);
      }
      Object.assign(condi, {
        responseSchema: data.responseSchema,
      })
    } catch (err) {
      Notification.error('responseSchema field JSON format validation error: ' + err);
      return;
    }

    try {
      this.setState({
        loading: true,
      });
      const { msg, code } = await fetchX.post('/atfcapi/newApi/updateThriftAPI', condi)
      if (code === '200') {
        window.location.reload();
      } else {
        Notification.error(msg);
      }
    } catch (e) {
      throw e
    } finally {
      this.setState({
        loading: false,
      });
    }
  }

  handleSchema(schema) {
    const { data } = this.state;
    data.responseSchema = schema;
    this.setState({
      data,
    })
  }

  handleParameter(k) {
    const { pathId } = this.state;
    if (!pathId && k === '2') {
      Notification.error('Please fill in Base Info, save and add Parameter!');
    } else {
      this.setState({
        key: k,
      });
      localStorage.setItem('activeKey', k);
    }
  }

  handleDeleteParameter(index) {
    fetchX.get('/atfcapi/newApi/deleteResponseBody', { responseId: index })
    .then(res => {
      if (res.code === '200') {
        Notification.success(res.msg);
        window.location.reload();
      } else {
        Notification.error(res.msg || res.message);
      }
    }).catch(err =>   Notification.error(err.message));
  }

  render() {
    const { auth, loading, data, parameters, pathId, key, serviceDetail, appIds, services } = this.state;
    const initParameter = {
      httpStatusCode: '',
      httpStatusMsg: '',
      responseData: '',
      body: [{
        bodyContentType: 'json',
        bodyData: '',
      }],
    };
    const authOption = auth.map( item =>
      <option key={item.id} value={item.id}>{item.authType}</option>
    );
    const serviceInput = pathId ?
      (<div className="api-form">
        <Input
          type="select"
          disabled
          label="Project"
          labelClassName="col-xs-3"
          wrapperClassName="col-xs-6"
          value={serviceDetail.projectId || ''}
        >
          <option value={serviceDetail.projectId}>{serviceDetail.projectName}</option>
        </Input>
        <Input
          type="select"
          label="AppId"
          name="appId"
          labelClassName="col-xs-3"
          wrapperClassName="col-xs-6"
          value={serviceDetail.appId}
          onChange={e => this.handleChange(e)}
        >
          {
            appIds.map((item, index) =>
              <option key={index} value={item.appId}>{item.appIdName}</option>
            )
          }
        </Input>
        <Input
          type="select"
          label="Service Name"
          name="serviceName"
          labelClassName="col-xs-3"
          wrapperClassName="col-xs-6"
          value={data.projectServiceId || ''}
          onChange={e => this.handleChange(e)}
        >
          {
            services.length ?
            services.map((item, index) =>
              <option key={index} value={item.serviceId}>{item.serviceName}</option>
            )
            :
            <option value={data.projectServiceId}>{data.projectServiceName}</option>
          }
        </Input>
      </div>)
      :
      <ServiceFilter callback={(a, b, c) => this.handleSelect(a, b, c)} />;

    const retryCount = data.serviceType === 4 ?
      <Input
        type="text"
        name="retryCount"
        label="Retry Count"
        placeholder="*"
        value={data.retryCount || ''}
        onChange={e => this.handleChange(e)}
        labelClassName="col-xs-3"
        wrapperClassName="col-xs-6"
      />
      :
      '';

    const responses = parameters.map( (item, index) =>
      <tr key={index}>
        <td>{index + 1}</td>
        <td>{item.httpStatusCode}</td>
        <td>{item.httpStatusMsg}</td>
        <td>{item.responseData}</td>
        <td>
          <a
            href="javascript:;"
            onClick={() => this.refs.parameter.show(item, data.method, pathId)}
          >
            Edit
          </a>
          <a
            href="javascript:;"
            onClick={() => this.refs.delete.show({
              index: item.responseId,
              text: '此Parameter',
            })}
          >
            Delete
          </a>
        </td>
      </tr>
    );

    const baseInput = data.serviceType !== 3 ?
      (<div className="api-form">
        <Input
          type="text"
          name="basePath"
          value={data.basePath || ''}
          onChange={e => this.handleChange(e)}
          label="Base Path"
          labelClassName="col-xs-3"
          wrapperClassName="col-xs-6"
        />
        <Input
          type="select"
          name="authId"
          value={data.authId || ''}
          label="Auth Type"
          onChange={e => this.handleChange(e)}
          labelClassName="col-xs-3"
          wrapperClassName="col-xs-6"
        >
          {authOption}
        </Input>
        <Input
          type="select"
          name="serviceType"
          label="Service Type"
          value={data.serviceType || ''}
          onChange={e => this.handleChange(e)}
          labelClassName="col-xs-3"
          wrapperClassName="col-xs-6"
        >
          <option value="1">HTTP</option>
          <option value="2">SOA</option>
          <option value="4">Long Polling</option>
        </Input>
        <Input
          type="select"
          name="schemes"
          label="Schemes"
          value={data.schemes || ''}
          onChange={e => this.handleChange(e)}
          labelClassName="col-xs-3"
          wrapperClassName="col-xs-6"
        >
          <option value="http">HTTP</option>
          <option value="https">HTTPS</option>
        </Input>
        <Input
          type="select"
          name="method"
          disabled={!!pathId}
          value={data.method || ''}
          label="Method"
          labelClassName="col-xs-3"
          onChange={e => this.handleChange(e)}
          wrapperClassName="col-xs-6"
        >
          <option value="get">GET</option>
          <option value="put">PUT</option>
          <option value="post">POST</option>
          <option value="delete">DELETE</option>
          <option value="patch">PATCH</option>
        </Input>
      </div>)
      :
      '';

    const apiSummaryInput = data.serviceType !== 3 ?
      <Input
        type="text"
        name="apiSummary"
        label="API Summary"
        value={data.apiSummary || ''}
        onChange={e => this.handleChange(e)}
        labelClassName="col-xs-3"
        wrapperClassName="col-xs-6"
      />
      :
      (<div className="api-form">
        <Input
          type="textarea"
          name="apiSummary"
          label="Args"
          value={data.apiSummary || ''}
          onChange={e => this.handleChange(e)}
          labelClassName="col-xs-3"
          wrapperClassName="col-xs-6"
        />
        <Input
          type="textarea"
          name="responseData"
          label="Response Data"
          value={data.responseBodies[0].responseData || ''}
          onChange={e => this.handleChange(e)}
          labelClassName="col-xs-3"
          wrapperClassName="col-xs-6"
        />
      </div>);

    const parametersPanel = data.serviceType !== 3 ?
      <Panel header="Parameters" eventKey="2">
        <Table>
          <thead>
            <tr>
              <th>Index</th>
              <th>Http Status Code</th>
              <th>Http Status Msg</th>
              <th>Response Data</th>
              <th>Operation</th>
            </tr>
          </thead>
          <tbody>
            {parameters.length ? responses : <tr><td colSpan="5">No data</td></tr>}
          </tbody>
        </Table>
        <Button
          bsStyle="primary"
          onClick={() => this.refs.parameter.show(initParameter, data.method, pathId, true)}
        >
          Add New Parameter
        </Button>
        <Parameter ref="parameter" />
        <DeleteDialog ref="delete" title="Parameter" delete={k => this.handleDeleteParameter(k.index)} />
      </Panel>
      :
      '';
    let responseSchema = typeof data.responseSchema === 'string' ? data.responseSchema : JSON.stringify(data.responseSchema, null, 2);

    const schema = pathId ? <JsonEditor value={responseSchema} onChange={data => this.handleSchema(data)} /> : '';

    return (
      <PanelGroup activeKey={key} onSelect={k => this.handleParameter(k)} accordion>
        <Panel header="Base Info" eventKey="1">
          <form className="baseinfo">
            <div className="api-form left">
              <Input
                type="text"
                name="apiDescription"
                label="API Description"
                placeholder="*"
                value={data.apiDescription || ''}
                onChange={e => this.handleChange(e)}
                labelClassName="col-xs-3"
                wrapperClassName="col-xs-6"
              />
              {apiSummaryInput}
              {serviceInput}
              <Input
                type="text"
                name="paths"
                placeholder="*"
                value={data.paths || ''}
                onChange={e => this.handleChange(e)}
                label="Paths"
                labelClassName="col-xs-3"
                wrapperClassName="col-xs-6"
              />
              {retryCount}
              {baseInput}
              <ButtonInput
                type="button"
                disabled={loading}
                value={loading ? `Saving...` : `Save Base Info`}
                bsStyle="primary"
                onClick={() => this.handleSaveBaseInfo()}
                wrapperClassName="col-xs-offset-3 col-xs-6"
              />
            </div>
            <div className="api-form schema">
              {pathId ? <h4 className="schemaTitle">Response Schema</h4> : ''}
              {schema}
            </div>
          </form>
        </Panel>
        {parametersPanel}
      </PanelGroup>
    );
  }
}

ApiForm.propTypes = {
  pathId: React.PropTypes.string,
  data: React.PropTypes.object,
};

ApiForm.contextTypes = {
  router: React.PropTypes.object,
};

export default ApiForm;
