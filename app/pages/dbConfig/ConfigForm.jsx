import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Panel, Input, ButtonInput } from 'react-bootstrap';
import { Notification, Spin } from 'atfcapi';
import { getProjects } from '../../actions/projectActions';
import { testConnection, testSuccess, saveDbconfig } from '../../actions/databaseAction';
import { getAllEvn } from '../../actions/commonAction';

class ConfigForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dbCfgId: props.dbCfgId || 0, // 用来区分是新增还是修改
      env: '', // 用户当前选择的env id
      envList: [], // 数据库环境，需要调用接口获取数组
      name: '', // 数据库名，用户输入，不做校验
      url: '', // DB连接字符串，用户输入，不做校验
      username: '', // 用户名，用户输入，不做校验
      password: '',  // 密码，用户输入，不做校验
      alias: '', // DB别名，用户输入，不做校验
      project: 0, // 用户当前选择的项目
      isEncryption: true, // testLink时是否加密，新增配置时true,修改配置时当密码修改过为false，密码未修改为true
    };
  }

  componentDidMount() {
    this.props.testSuccess(!!this.props.dbCfgId);
    this.props.getAllEvn(
      () => {},
      msg => Notification.error(msg)
    );
    this.props.getProjects();
  }

  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(nextProps.configData) !== JSON.stringify(this.props.configData)) {
      this.init(nextProps.configData);
    }
  }

  init(data = {}) {
    const { alias, env, name, username, password, project, url } = data;
    this.setState({
      alias,
      env,
      name,
      username,
      password,
      project,
      url,
    });
  }

  handleTestLink() {
    const { dbCfgId, url, username, password, isEncryption } = this.state;

    const errMsg = this.requiredValidate();
    if (errMsg !== '') {
      Notification.error(errMsg);
      return;
    }

    let condi = {
      url,
      username,
      password,
    };
    if (dbCfgId) { // 修改
      condi = Object.assign(condi, {
        isEncryption,
      });
    } else { // 新增
      condi = Object.assign(condi, {
        isEncryption: false,
      });
    }

    this.props.testConnection(condi,
      msg => Notification.success(msg),
      msg => Notification.error(msg)
    );
  }

  handleSave() {
    const { name, url, username, password, alias, env, project, dbCfgId } = this.state;

    const condi = {
      id: dbCfgId,
      env,
      name,
      url,
      username,
      password,
      alias,
      project,
    };

    const errMsg = this.requiredValidate();
    if (errMsg !== '') {
      Notification.error(errMsg);
      return;
    }

    const sendType = dbCfgId ? 'PUT' : 'POST';
    this.props.saveDbconfig(sendType, condi,
      msg => {
        Notification.success(msg);
        setTimeout(() => {
          window.location.href = '/#/dbConfig/dbConfigList';
        }, 2000);
      },
      msg => Notification.error(msg)
    );
  }

  requiredValidate() {
    const {
      env,
      name,
      url,
      username,
      password,
      alias,
      project,
    } = this.state;

    const arr = [
      { name: 'Database Name', value: name },
      { name: 'DB Connection String', value: url },
      { name: 'Username', value: username },
      { name: 'Password', value: password },
      { name: 'Alias', value: alias },
      { name: 'Environment', value: env },
      { name: 'Project', value: project },
    ];

    const reg = /^[a-zA-Z_][a-zA-Z0-9_]{0,32}$/;

    // 找出输入项为空的集合
    const emptyArr = arr.filter(item => !item.value).map(item => item.name);
    if (emptyArr.length > 0) {
      return 'Required: ' + emptyArr.join(' , ');
    }

    // 判断别名输入是否符合要求
    if (!reg.test(alias)) {
      return 'Alias only support letters, numbers, underscores, can not start with a number, 32 characters or less!';
    }
    if (!alias.includes(`${name}_${env}_`)) {
      return 'Follow the alias naming rules: dbname_environment_custom-string!';
    }
    return '';
  }

  handleChange(e) {
    const target = e.target;
    if (this.props.isTestSuc) {
      this.props.testSuccess(false);
    }
    if (target.name === 'password') { // 密码项修改，将isEncryption置为false
      this.setState({
        [target.name]: target.value,
        isEncryption: false,
      });
    } else {
      this.setState({
        [target.name]: target.value,
      });
    }
  }

  render() {
    const { env, name, url, username, password, alias, project } = this.state;
    const { searchOptions = [], envList = [], isTestSuc, isFetching } = this.props;
    const envOption = envList.map( k =>
      <option key={k.envId} value={k.envName}>{k.envName}</option>
    );
    const projectOption = searchOptions.map( (k, index) =>
      <option key={index} value={k}>{k}</option>
    );
    const inputs = (<div>
      <Input
        type="select"
        label="Environment"
        name="env"
        labelClassName="col-xs-3"
        wrapperClassName="col-xs-6"
        value={env}
        onChange={e => this.handleChange(e)}
      >
        <option key="0" value="0">----</option>
        {envOption}
      </Input>
      <Input
        type="text"
        label="Database Name"
        name="name"
        placeholder="*"
        labelClassName="col-xs-3"
        wrapperClassName="col-xs-6"
        value={name}
        onChange={e => this.handleChange(e)}
      />
      <Input
        type="textarea"
        label="DB Connection String"
        name="url"
        placeholder="*"
        labelClassName="col-xs-3"
        wrapperClassName="col-xs-6"
        value={url}
        onChange={e => this.handleChange(e)}
      />
      <Input
        type="text"
        label="Username"
        name="username"
        placeholder="*"
        labelClassName="col-xs-3"
        wrapperClassName="col-xs-6"
        value={username}
        onChange={e => this.handleChange(e)}
      />
      <Input
        type="password"
        label="Password"
        name="password"
        placeholder="*"
        labelClassName="col-xs-3"
        wrapperClassName="col-xs-6"
        value={password}
        onChange={e => this.handleChange(e)}
      />
      <Input
        type="text"
        label="Alias"
        name="alias"
        placeholder="*,Naming rules:dbname_environment_string"
        labelClassName="col-xs-3"
        wrapperClassName="col-xs-6"
        value={alias}
        onChange={e => this.handleChange(e)}
      />
      <Input
        type="select"
        label="Project"
        name="project"
        labelClassName="col-xs-3"
        wrapperClassName="col-xs-6"
        value={project}
        onChange={e => this.handleChange(e)}
      >
        <option key="0" value="">----</option>
        {projectOption}
      </Input>
    </div>);

    return (
      <Panel header="Basic Database Information">
        <form className="form-horizontal configForm">
          {inputs}
          <div className="row">
            <ButtonInput
              type="button"
              disabled={isFetching}
              value={isFetching ? `Connecting...` : `Test the Connection`}
              bsStyle="primary"
              onClick={() => this.handleTestLink()}
              wrapperClassName="col-xs-offset-3 col-xs-6"
            />
            <ButtonInput
              type="button"
              value="Save"
              bsStyle="primary"
              disabled={!isTestSuc}
              onClick={() => this.handleSave()}
              wrapperClassName="col-xs-offset-3 col-xs-6"
            />
          </div>
        </form>
        {isFetching ? <Spin /> : ''}
      </Panel>
    );
  }
}

ConfigForm.propTypes = {
  dbCfgId: PropTypes.number,
  searchOptions: PropTypes.array,
  envList: PropTypes.array,
  isTestSuc: PropTypes.bool,
  isFetching: PropTypes.bool,
  testConnection: PropTypes.func,
  testSuccess: PropTypes.func,
  saveDbconfig: PropTypes.func,
  getAllEvn: PropTypes.func,
  getProjects: PropTypes.func,
  configData: PropTypes.object,
};

const mapStateToProps = state => Object.assign({}, state.database, state.project, state.common, { isFetching: state.database.isFetching });

export default connect(mapStateToProps, {
  getProjects,
  testConnection,
  testSuccess,
  getAllEvn,
  saveDbconfig,
})(ConfigForm);
