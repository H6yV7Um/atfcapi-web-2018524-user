import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { Button, Input, Table, Breadcrumb, BreadcrumbItem, OverlayTrigger, Popover } from 'react-bootstrap';
import { ComboBox, ConfirmDialog, Notification } from 'atfcapi';
import JsonEditor from './JsonEditor';
import EditApiDetail from '../testCase/EditApiDetail';
import DBVerify from './DBVerify';
import fetchX from '../../vendor/Fetch';

const propTypes = {
  judgmentMap: PropTypes.object,
  varSource: PropTypes.array,
  location: PropTypes.object,
  onHide: PropTypes.func,
};

const defaultProps = {
  judgmentMap: {
    '=': '=',
    'nq': 'nq',
    '>': '>',
    '<': '<',
    '>=': '>=',
    '<=': '<=',
    'regex': 'regex',
    'size': 'Assert_size',
    'hasItem': 'Assert_hasItem',
    'hasEntry': 'Assert_hasEntry',
    'hasKey': 'Assert_hasKey',
    'hasValue': 'Assert_hasValue',
    'notHasItem': 'Assert_notHasItem',
    'notHaveKey': 'Assert_notHasKey',
    'notHasValue': 'Assert_notHasValue',
    'notHasEntry': 'Assert_notHasEntry',
  },
  varSource: ['body', 'header', 'cookie', 'var', 'userDefine'],
};

class ApiAssertation extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      response: {},
      assert: {}, // 扁平化的response对象
      assertList: [], // 断言表单集合
      orOperaterList: [], // 使用或逻辑的断言表单集合
      varList: [], // 变量表单集合
      schema: null,
      isPreview: true, // 是否预览
      isSchema: false, // 是否Schema校验
      isDbVerify: false,
      cansave: true, // 允许保存
      dbAliasList: [],
      dbList: [{ alias: 0, expected: [], real: '' }],
      logicExpression: '',
    };
    // { type, projectId, folderId, caseId, position, projectName, suiteName, responseSchema, responseData } = this.props.location.state
    Object.assign(this.state, this.props.location.state);
  }

  componentDidMount() {
    this.loadDefault();
    if (this.state.position >= 0) {
      this.loadYaml();
    }
  }

  // 默认加载
  loadDefault() {
    let res = this.state.responseData;
    if (res === null || res.body === undefined) res = {};
    let body;
    let originAssert = Object.create(null);
    try {
      body = JSON.parse(res.body);
      originAssert = this.flatten(body);
    } catch (err) {
      body = res.body || '';
    }

    const extraAssert = {
      'httpstatuscode': res.httpStatusCode || '',
    };

    this.setState({
      assert: Object.assign({}, extraAssert, originAssert),
      response: res,
      schema: JSON.stringify(this.state.responseSchema, null, 2),
      assertList: [{
        key: 'all',
        judgment: '=',
        value: res.body,
      }],
    });
  }

  // 加载yaml文件中的断言和dbverify
  loadYaml() {
    const { caseId, position } = this.state;

    const condi = {
      caseId,
      position,
    };
    const assertList = [];
    const generateAssertList = (assert) => {
      for (const key in assert) {
        let value = assert[key];
        let judgment = '=';
        if (typeof value !== 'object') {
          assertList.push({
            key,
            judgment,
            value,
          });
        } else if (value !== null && Object.keys(value).length) {
          judgment = Object.keys(value)[0];
          if (Object.values(this.props.judgmentMap).includes(judgment)) {
            value = typeof value[judgment] === 'string' ? value[judgment] : JSON.stringify(value[judgment]);
            assertList.push({
              key,
              judgment,
              value,
            });
          } else {
            assertList.push({
              key,
              judgment: '=',
              value: JSON.stringify(value),
            });
          }
        }
      }
    };

    fetchX.post('/atfcapi/sendRequest/getAssert', condi)
    .then(res => {
      if (res.code === '200') {
        const dbList = res.data.dbVerify.map(x => {
          return {
            alias: x.alias,
            expected: JSON.stringify(x.DBexpected, null, 2),
            real: x.DBactual,
          };
        });
        const { variable = [] } = res.data;
        const varsourceMap = {
          'Bodys': 'body',
          'Headers': 'header',
          'Cookies': 'cookie',
          'Vars': 'var',
          'userDefine': 'userDefine',
        };
        const varList = variable.map(x => {
          return {
            key: x.name,
            judgment: varsourceMap[x.source],
            value: x.value,
          };
        });
        if (dbList.length === 0) {
          dbList.push([{ alias: 0, expected: [], real: '' }]);
        }

        const { logicExpression, assertList: sourceList = [] } = res.data.assertInfo;

        sourceList.forEach(assert => generateAssertList(assert));

        const oldAssert = Object.assign({}, res.data.assertInfo);
        delete oldAssert.assertList;
        delete oldAssert.logicExpression;
        generateAssertList(oldAssert);

        this.setState({
          dbList,
          assertList,
          varList,
          logicExpression,
        });
      } else {
        Notification.error(res.msg || res.message);
      }
    });
  }

  /**
   * 添加断言
   */
  addAssert() {
    // 判断all校验信息是否存在
    const { assertList } = this.state;
    if (assertList.some(assert => assert.key === 'all')) {
      ConfirmDialog({
        title: 'Delete all information in order to verify a custom assert',
        onConfirm() {},
        okCancel: false, // 是否显示确定和取消按钮
        confirmText: 'Know',
      });
      return;
    }
    assertList.push({
      key: '',
      judgment: '=',
      value: '',
    });
    this.setState({
      assertList,
      cansave: false,
    }, () => this.generateExpression(assertList.length, 'add'));
  }

  /**
   * 添加变量
   */
  addVar() {
    const { varList } = this.state;
    varList.push({
      key: '',
      judgment: 'body',
      value: '',
    });
    this.setState({
      varList,
      cansave: false,
    });
  }

  /**
   * 删除断言
   * @param  {number} index
   * @return {[type]}
   */
  delAssert(index) {
    ConfirmDialog({
      title: 'whether to delete',
      onConfirm: () => {
        const { assertList } = this.state;
        assertList.splice(index, 1);
        const cansave = this.cansave();
        this.setState({
          assertList,
          cansave,
        }, () => this.generateExpression(assertList.length));
      },
    });
  }

  /**
   * 删除变量
   * @param  {[number]} index
   * @return {[type]}
   */
  delVar(index) {
    ConfirmDialog({
      title: 'whether to delete',
      onConfirm: () => {
        const { varList } = this.state;
        varList.splice(index, 1);
        const cansave = this.cansave();
        this.setState({
          varList,
          cansave,
        });
      },
    });
  }

  /**
   * 下拉框的change事件
   * @param  {[object]} e     [事件源]
   * @param  {[number]} index []
   * @param  {[number]} type  [0 or 1,0代表断言，1代表变量]
   */
  handleChange(e, index, type) {
    const { assertList, varList } = this.state;
    const { name, value } = e.target;

    if (index !== undefined) {
      if (type) {
        // 变量的change事件

        varList[index][name] = value;
        const cansave = this.cansave();
        this.setState({
          varList,
          cansave,
        });
      } else {
        // 断言的change事件
        assertList[index][name] = value;

        this.setState({
          assertList,
        });
      }
    }
  }

  handleExpressionChange(e) {
    this.setState({
      logicExpression: e.target.value,
    });
  }

  generateExpression(newIndex, type) {
    const { logicExpression = '' } = this.state;
    let newLogicExpression;
    if (type === 'add') {
      const indexArr = logicExpression.match(/\d+/ig) || [];
      const max = Math.max(...indexArr);
      if (logicExpression.includes('||') && max < newIndex) {
        newLogicExpression = `(${logicExpression})&&${newIndex}`;
      } else {
        // if max = 5, preExp will be [1, 2, 3, 4, 5]
        newLogicExpression = [...Array(newIndex)].map((x, index) => index + 1).join('&&');
      }
    } else {
      newLogicExpression = [...Array(newIndex)].map((x, index) => index + 1).join('&&');
    }
    this.setState({ logicExpression: newLogicExpression});
  }

  /**
   * 自动完成框的change事件
   * @param  {[string]} value [输入的值，或者select的值]
   * @param  {[number]} index [description]
   * @param  {[number]} type  [同上]
   */
  updateAssertVal(props) {
    const { assertList, varList, response } = this.state;
    const { name, value, index, type = 0 } = props;
    let cansave;
    if (type) {
      varList[index][name] = value;
      cansave = this.cansave();
      this.setState({
        varList,
        cansave,
      });
    } else {
      assertList[index][name] = value;
      if (name === 'key') {
        // 当key 改变时，期望值需要联动
        const { assert } = this.state;
        let body;
        try {
          body = JSON.parse(response.body) || {};
        } catch (err) {
          body = response.body;
        }
        if (value === 'all') {
          assertList[index].value = response.body;
        } else {
          assertList[index].value = assert[value] || this.unflatten(body, value) || '';
        }
      }
      cansave = this.cansave();
      this.setState({
        assertList,
        cansave,
      });
    }
  }

  /**
   * 是否预览和修改json / 是否开启schema校验
   */
  toggleOption(e) {
    const name = e.target.name;
    // 属性计算名的解构赋值. name为isPreview时，isSelect的值 = this.state.isPreview.
    const { [name]: isSelect } = this.state;
    this.setState({
      [name]: !isSelect,
    });
  }

  // 判断变量名是否合法
  validate(value) {
    const regex = /^[a-zA-Z][(a-zA-Z0-9_&\.)+]{2,50}$/;
    return regex.test(value);
  }

  /**
   * 得到一个对象的所有自有属性（扁平化）
   * @param  {[object]} obj    [目标对象]
   * @param  {[string]} prekey [当前属性的上级属性]
   * @return {[array]}         [一维数组，嵌套结构的对象会返回类似 父属性.子属性 的结果]
   */
  flatten(target) {
    const output = Object.create(null);
    function loop(obj, prekey) {
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        const isArray = Array.isArray(value);
        const type = Object.prototype.toString.call(value).slice(8, -1);
        const isObject = (type === 'Array' || type === 'Object');
        const realkey = prekey ? prekey + '.' + key : key;
        if (isObject && !isArray && Object.keys(value).length) {
          return loop(value, realkey);
        } else if (isArray) {
          return loop(value[0], realkey + '[0]');
        }
        output[realkey] = value;
      });
    }
    // 第一步
    loop(target);
    return output;
  }

  unflatten(target, key) {
    if (typeof target === 'string' || target === undefined || target === null) return '';
    if (key === 'all') return target.body;
    let result = target;
    // key = data.cityList[2].code
    const step = [];
    const arr = key.split('.');
    arr.forEach(item => {
      const pre = item.indexOf('[');
      const next = item.indexOf(']');
      if (pre > 0) {
        step.push(item.substr(0, pre));
        step.push(item.slice(pre + 1, next));
      } else {
        step.push(item);
      }
    });

    step.forEach(item => {
      const r = result[item];
      if (r) {
        result = r;
      } else {
        return;
      }
    });

    return typeof result === 'string' ? result : '';
  }

  isJson(str) {
    try {
      const o = JSON.parse(str);
      return typeof o === 'object';
    } catch (e) {
      return false;
    }
  }

  cansave() {
    const { assertList, varList } = this.state;
    const r1 = assertList.every(item => item.key.trim() !== '');
    const r2 = varList.every(item => this.validate(item.key) && item.value.trim() !== '');
    return r1 && r2;
  }

  close() {
    ConfirmDialog({
      title: 'cancel editing ?',
      onConfirm: () => this.props.onHide(),
    });
  }

  getVarEntries(varOutput) {
    const output = Object.create(null);
    delete varOutput.userDefine;
    const keys = Object.keys(varOutput);
    let vars = [];
    let paths = [];
    keys.forEach(item => {
      for (const key in varOutput[item]) {
        vars = vars.concat(key);
        paths = paths.concat(varOutput[item][key]);
      }
    });

    const { response, assert } = this.state;

    paths.forEach((item, index) => {
      output[vars[index]] = assert[item] || this.unflatten(response, item) || response.header[item] || item;
    });
    return JSON.stringify(output);
  }

  async changeCaseInfo(value, index) {
    const { caseId, projectId, folderId } = this.state;
    const condi = {
      caseId,
      position: index,
      allInfo: value,
    };

    try {
      const { code, msg } = await fetchX.fetch('/atfcapi/suiteCase/updateCaseInfo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(condi),
      });
      Notification[code === '200' ? 'success' : 'error'](msg);
      location.href = `/#/project/${projectId}/folder/${folderId}/case/${caseId}`;
    } catch (e) {
      this.refs.editApi.handleFail('the modified information failed. Please try again later!');
    }
  }

  /**
  * 返回生成变量所需条件
  * @return {[object]} [{tbody,thead}]
  */
  getVarCondition() {
    const selectOpts = this.props.varSource.map((item, index) =>
      <option key={index} value={item}>{item}</option>
    );
    const thead = [ 'Variable name', 'Variable source', 'Json Path / Custom values', 'Operation'].map((item, index) =>
      <th key={index}>{item}</th>
    );
    const { varList, assert, response } = this.state;
    const options = Object.keys(assert);
    const tbody = varList.map((item, index) => {
      let optionsTemp = [...options];
      if (item.judgment === 'body') {
        if (!options.includes('all')) {
          optionsTemp.unshift('all');
        }
      } else if (item.judgment === 'header') {
        optionsTemp = Object.keys(this.flatten(response.header));
      } else if (item.judgment === 'cookie') {
        optionsTemp = Object.keys(this.flatten(response.cookies));
      } else {
        optionsTemp = [];
      }
      return (
        <tr key={index}>
          <td>
            <Input
              type="text"
              wrapperClassName={this.validate(item.key) ? 'has-success' : 'has-error'}
              placeholder="Supports only letters, numbers, underscores"
              name="key"
              value={item.key}
              onChange={e => this.handleChange(e, index, 1)}
            />
          </td>
          <td>
            <Input
              type="select"
              name="judgment"
              value={item.judgment}
              onChange={e => this.handleChange(e, index, 1)}
            >
              {selectOpts}
            </Input>
          </td>
          <td>
            <ComboBox
              value={item.value}
              options={optionsTemp}
              className={(item.value || '').trim() === '' ? 'has-error' : 'has-success'}
              onChange={value => this.updateAssertVal({name: 'value', value, index, type: 1})}
              onSelect={value => this.updateAssertVal({name: 'value', value, index, type: 1})}
            />
          </td>
          <td>
            <Button onClick={() => this.delVar(index)}>
              Delete
            </Button>
          </td>
        </tr>
      );
    });
    return {
      thead,
      tbody,
    };
  }

  /**
   * 返回生成断言的所需条件 thead tbod selectOpts
   * @return {[object]} [description]
   */
  getAssertCondition() {
    const judgmentMap = this.props.judgmentMap;
    const selectOpts = Object.keys(judgmentMap).map((key, index)=>
      <option key={index} value={judgmentMap[key]}>{key}</option>
    );
    const thead = ['Index', 'Json path', 'Comparison operators', 'Expectations', 'Operation'].map((item, index) =>
      <th key={index}>{item}</th>
    );
    const { assertList, assert } = this.state;

    const tbody = assertList.map((item, index) => {
      const optionsTemp = Object.keys(assert);
      const disabled = this.isJson(item.value) && item.key === 'all';
      return (
        <tr key={index} className={item.selected ? 'selected' : ''}>
          <td>{index + 1}</td>
          <td>
            <ComboBox
              value={item.key}
              options={index === 0 ? ['all'].concat(optionsTemp) : optionsTemp}
              className={item.key.trim() === '' ? 'has-error' : 'has-success'}
              onChange={value => this.updateAssertVal({name: 'key', value, index})}
              onSelect={value => this.updateAssertVal({name: 'key', value, index})}
            />
          </td>
          <td>
            <Input
              type="select"
              name="judgment"
              value={disabled ? '=' : item.judgment}
              disabled={disabled}
              onChange={e => this.handleChange(e, index)}
            >
              {selectOpts}
            </Input>
          </td>
          <td>
            { disabled ?
              <OverlayTrigger
                trigger="click"
                rootClose
                placement="bottom"
                overlay={this.buildPopover(item.value, index)}
              >
                <ComboBox
                  value={item.value}
                  options={optionsTemp.map(option => {
                      return typeof assert[option] === 'string' ? assert[option] : '';
                  } )}
                  name="value"
                  onChange={value => this.updateAssertVal({name: 'value', value, index})}
                  onSelect={value => this.updateAssertVal({name: 'value', value, index})}
                />
              </OverlayTrigger>
              :
              <ComboBox
                value={item.value}
                options={optionsTemp.map(option => {
                    return typeof assert[option] === 'string' ? assert[option] : '';
                } )}
                name="value"
                onChange={value => this.updateAssertVal({name: 'value', value, index})}
                onSelect={value => this.updateAssertVal({name: 'value', value, index})}
                placeholder={item.judgment.toLowerCase().indexOf('hasvalue') > -1 ? 'To validate multiple,use [],like [1, 2, "3"]...' : ''}
              />
            }
          </td>
          <td>
            <Button onClick={() => this.delAssert(index)}>
              Delete
            </Button>
          </td>
        </tr>
      );
    });
    return {
      selectOpts,
      thead,
      tbody,
    };
  }

  /**
  * 构建table
  * @param  {number} [type=0表示生成断言，type=1表示生成变量]
  * @return {Table}  [...]
  */
  buildTable(type = 0) {
    const { thead, tbody } = type ? this.getVarCondition() : this.getAssertCondition();
    const tip = type ? 'Click Add Var to add' : 'Click Add Assert to add';
    return (
      <Table bordered condensed className="assert-table">
        <thead>
          <tr>
            {thead}
          </tr>
        </thead>
        <tbody>
          {tbody.length === 0 ? <tr className="no-data"><td colSpan={type ? '4' : '5'}>{tip}</td> </tr> : tbody}
        </tbody>
      </Table>
    );
  }

  buildSchema() {
    const { isSchema, responseSchema } = this.state;
    let { schema } = this.state;
    if (schema === null) {
      schema = typeof responseSchema === 'object' ? JSON.stringify(responseSchema, null, 2) : responseSchema;
    }
    if (isSchema) {
      return (
        <JsonEditor value={schema || ''} height="200px" onChange={data => this.setState({ schema: data })} />
      );
    }
  }

  buildPopover(data, index = 0) {
    try {
      data = JSON.stringify(JSON.parse(data), null, 2);
    } catch (e) {
      throw e;
    }
    return (
      <Popover id={index} title="Expectations" className="sql-pop">
        <JsonEditor name={`assert-all-${index}`} height="300px" value={data} onChange={value => this.updateAssertVal({name: 'value', value, index})} />
      </Popover>
    );
  }

  async save() {
    const { projectId, folderId, caseId, assertList, varList, isSchema, schema, isDbVerify, isPreview, dbList, position, logicExpression } = this.state;
    // assert
    const addAssert = assertList.map(item => {
      if (['[', ']', '{', '}'].some(char => item.value.toString().includes(char))) {
        try {
          item.value = JSON.parse(item.value);
        } catch (e) {
          item.value = item.value;
        }
      }
      return {
        [item.key]: item.judgment === '=' ? item.value : { [item.judgment]: item.value },
      };
    });

    if (logicExpression) {
      const reg = '^[0-9,&,||,(,)]*$';
      if (!logicExpression.match(reg)) {
        Notification.error('Please enter a valid logical expressions');
        return;
      }
      const indexArr = logicExpression.match(/\d+/ig);
      const max = Math.max(...indexArr);
      if (max > assertList.length) {
        Notification.error('Please enter a valid logical expressions');
        return;
      }
    }

    const newAddAssert = {
      logicExpression: logicExpression,
      assertList: addAssert,
    };

    // var
    const varOutput = Object.create(null);
    let hasrepeat = false;
    varList.forEach(item => {
      if (varOutput[item.judgment] === undefined) {
        varOutput[item.judgment] = Object.create(null);
      }
      if (varOutput[item.judgment][item.key] === undefined) {
        varOutput[item.judgment][item.key] = item.value;
      } else {
        hasrepeat = true;
      }
    });

    if (hasrepeat) {
      Notification.info('Variables are not allowed to repeat');
      return;
    }

    // pre data
    const output = {
      projectId,
      suiteId: caseId,
      addAssert: JSON.stringify(newAddAssert),
      addBodysVars: JSON.stringify(varOutput.body),
      addHeadersVars: JSON.stringify(varOutput.header),
      addCookiesVars: JSON.stringify(varOutput.cookie),
      addVarVars: JSON.stringify(varOutput.var),
      addUserDefineVars: JSON.stringify(varOutput.userDefine),
      varEntries: this.getVarEntries(varOutput),
      position,
    };
    // schema校验
    if (isSchema) {
      if (schema) {
        if (!this.isJson(schema)) {
          Notification.error('json format error');
          return;
        }
      } else {
        Notification.error('Content is empty, you can not save');
        return;
      }
      Object.assign(output, { responseSchema: schema });
    }

    if (isDbVerify) {
       //  DBVerify data
      const addDBUnit = dbList.map( item => {
        return {
          DBexpected: item.expected,
          alias: item.alias,
          DBactual: item.real,
        };
      });
      Object.assign(output, {
        addDBUnit: JSON.stringify(addDBUnit),
      });
    }
    // send request
    this.setState({ cansave: false });
    try {
      const { msg, code, data } = await fetchX.post('/atfcapi/sendRequest/saveAssertVar', output);
      if (code === '200') {
        if (isPreview) {
          this.refs.editApi.show(data.allInfo, data.position);
        } else {
          this.context.router.push(`/project/${projectId}/folder/${folderId}/case/${caseId}`);
        }
      } else {
        Notification.error(msg);
      }
    } catch (e) {
      throw e;
    } finally {
      this.setState({ cansave: true });
    }
  }

  render() {
    const { type, projectId, folderId, projectName, logicExpression, isDbVerify } = this.state;
    const { selectapi, apirequest } = this.props.location.state;
    return (
      <main>
        <Breadcrumb>
          <BreadcrumbItem href="#">
            Home
          </BreadcrumbItem>
          <BreadcrumbItem active>
            <Link to={{pathname: `/project/${projectId}/folder/${folderId}`, state: { projectName }}}>{projectName}</Link>
          </BreadcrumbItem>
          {
            type === 0 ?
              <BreadcrumbItem href={`/#/api/select/?_k=${selectapi}`}>
                Select API
              </BreadcrumbItem>
            :
            ''
          }
          <BreadcrumbItem href={`/#/api/request/?_k=${apirequest}`}>
            API Request
          </BreadcrumbItem>
          <BreadcrumbItem active>
            Assert
          </BreadcrumbItem>
        </Breadcrumb>
        <Button
          className="mr15"
          onClick={() => this.addAssert()}
        >
          Add Assert
        </Button>
        <Button onClick={() => this.addVar()}>Add Var</Button>
        {this.buildTable(0)}
        <Input
          type="text"
          label="Logical expression (using figures from 1 represents assertion conditions using logical operators or logical AND && and ||, such as 1 || 2)"
          name="name"
          value={logicExpression}
          placeholder="Enter the correct logical expression"
          onChange={e => this.handleExpressionChange(e)}
        />
        <Input
          type="checkbox"
          label="Response Schema Validation"
          name="isSchema"
          onChange={e => this.toggleOption(e)}
        />
        {this.buildSchema()}
        {this.buildTable(1)}
        <DBVerify
          dbList={this.state.dbList}
          onChange={data => this.setState({dbList: data})}
          toggle={value => this.setState({isDbVerify: value})}
          isDbVerify={isDbVerify}
        />
        <div className="assert-opt">
          <Input
            type="checkbox"
            label="Preview and edit json"
            groupClassName="assert-cbx"
            name="isPreview"
            checked={this.state.isPreview}
            onChange={e => this.toggleOption(e)}
          />
          <div>
            <Link to={{pathname: `/api/request`, state: Object.assign({}, this.props.location.state)}}><Button>Previous</Button></Link>
            <Button
              bsStyle="primary"
              disabled={!this.state.cansave}
              onClick={() => this.save()}
            >
              Save
            </Button>
          </div>
        </div>
        <EditApiDetail
          ref="editApi"
          save={({value, index}) => this.changeCaseInfo(value, index)}
          showClose={false}
        />
      </main>
    );
  }
}

ApiAssertation.propTypes = propTypes;

ApiAssertation.defaultProps = defaultProps;

ApiAssertation.contextTypes = {
  router: React.PropTypes.object,
};

export default ApiAssertation;
