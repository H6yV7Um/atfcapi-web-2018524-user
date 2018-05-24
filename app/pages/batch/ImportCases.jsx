import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Table, Input, Button, Label, OverlayTrigger, Popover } from 'react-bootstrap';
import Sortable from 'sortablejs';
import { Notification } from 'atfcapi';
import fetchX from '../../vendor/Fetch';
import { validator } from '../../vendor/util';
import { saveHar } from '../../actions/commonAction';

const propTypes = {
  projectId: PropTypes.number,
  appId: PropTypes.number,
  envId: PropTypes.number,
  fileName: PropTypes.string,
  cancel: PropTypes.func,
  saveHar: PropTypes.func,
  isFetching: PropTypes.bool,
};

const defaultProps = {
  projectId: 0,
  appId: 0,
  envId: 0,
  fileName: '',
  cancel() {},
};

class ImportCases extends Component {
  constructor(props) {
    super(props);
    this.state = {
      folderId: 0,
      caseId: 0,
      folderName: '',
      caseName: '',
      list: [],
      folderDefine: false, // 自定义folder
      caseDefine: false, // 自定义case
      urlMatch: '0', // Include包含 Exclude不包含
      urlPattern: '', // url匹配正则
      statusCode: [], // 状态码过滤
      contentType: [], // 响应格式过滤
      suites: [], // suite列表（文件夹列表）
      cases: [], // case列表
      selectRowKeys: [],
    };
  }
  componentDidMount() {
    this.loadFolders();
    this.loadCaseApi();
  }

  loadCaseApi() {
    const { projectId, appId, fileName } = this.props;
    if (projectId) {
      fetchX.get(`/atfcapi/har/reader/${projectId}/${appId}/${encodeURIComponent(fileName)}/`)
      .then(res => {
        if (res.code === '200') {
          if (Array.isArray(res.data)) {
            const list = res.data.map((item, index) => Object.assign({}, item, { uid: index }));
            this.setState({ list });
          }
        } else {
          Notification.error(res.msg);
        }
      });
    }
  }

  loadFolders() {
    const { projectId } = this.props;
    const params = {
      limit: 100,
      offset: 0,
      projectId,
    };
    fetchX.post('/atfcapi/folder/list', params)
    .then(res => {
      if (res.data.total > 0) {
        let { folderId } = this.state;
        folderId = folderId || res.data.folderList[0].id;
        this.setState({
          suites: res.data.folderList,
          folderId,
        }, this.loadCases);
      }
    }).catch(() => Notification.error('Failed to get suiteNames!'));
  }

  loadCases() {
    const { folderId } = this.state;
    fetchX.post('/atfcapi/suiteCase/getAll', { folderId })
    .then(res => {
      let { caseId } = this.state;
      if (res.data && res.data.length) {
        caseId = res.data[0].id;
      } else {
        caseId = 0;
      }
      this.setState({
        cases: res.data,
        caseId,
      });
    }).catch(() => Notification.error('Failed to get caseNames!'));
  }

  handleSelect(e) {
    const { value, name } = e.target;
    switch (name) {
    case 'suite':
      // User Define
      if (value === '-1') {
        this.setState({
          folderDefine: true,
        });
      } else {
        this.setState({
          folderId: parseInt(value, 10),
        }, this.loadCases);
      }
      break;
    case 'case':
      if (value === '-1') {
        this.setState({
          caseDefine: true,
        });
      } else {
        this.setState({
          caseId: parseInt(value, 10),
        });
      }
      break;
    default:
      break;
    }
  }

  handleFilter(e) {
    const { value, checked, name } = e.target;
    const filter = this.state[name];
    if (checked) {
      filter.push(value);
    } else {
      const index = filter.indexOf(value);
      filter.splice(index, 1);
    }
    this.setState({
      [name]: filter,
    });
    // 更新过滤条件时 重置列表选中状态
    if (name !== 'selectRowKeys') {
      this.setState({selectRowKeys: []});
    }
  }

  handleDelete(uid) {
    const { list } = this.state;
    this.setState({
      list: list.filter(x => x.uid !== uid),
    });
  }

  handleChange(e, uid) {
    const { name, value} = e.target;
    const { list } = this.state;
    const index = list.findIndex(x => x.uid === uid);
    list[index][name] = value;
    this.setState({ list });
  }

  handleReset() {
    this.setState({
      urlMatch: '0',
      urlPattern: '',
      statusCode: [],
      contentType: [],
      selectRowKeys: [],
      folderDefine: false,
      caseDefine: false,
    }, this.loadFolders);
  }

  validateInput(name, tip) {
    if (!validator.maxLength(name, 30)) {
      Notification.error(`The ${tip} is too long`);
      return false;
    }
    if (!validator.folderName(name)) {
      Notification.error(`Please enter the correct ${tip}, can only contain letters, numbers, underscores, can not start with a number`);
      return false;
    }
    return true;
  }

  /**
   * 保存case
   */
  handleSave() {
    const { folderDefine, caseDefine, list, selectRowKeys } = this.state;
    const { projectId, appId, envId } = this.props;
    // 参数
    const caseList = list.filter(x => selectRowKeys.includes(x.uid.toString())).map(x => {
      const temp = Object.assign({}, x);
      delete temp.uid;
      temp.headers = typeof temp.headers === 'object' ? JSON.stringify(temp.headers) : temp.headers;
      return temp;
    });
    let params = {
      projectId,
      appId,
      envId,
      caseList,
    };
    const { folderId, caseId, folderName, caseName } = this.state;
    // 自定义folder
    if (!folderDefine) {
      if (parseInt(folderId, 10) === 0) {
        Notification.error('Folder can not be empty');
        return;
      }
      // 自定义case
      if (caseDefine) {
        if (!this.validateInput(caseName, 'case name')) return;
        params = Object.assign({}, params, {
          folderId,
          caseName,
        });
      } else {
        if (parseInt(caseId, 10) === 0) {
          Notification.error('Case can not be empty');
          return;
        }
        params = Object.assign({}, params, {
          folderId,
          caseId,
        });
      }
    } else { // 未勾选
      if (!this.validateInput(folderName, 'folder name')) return;
      if (!this.validateInput(caseName, 'case name')) return;
      params = Object.assign({}, params, {
        folderName,
        caseName,
      });
    }

    this.props.saveHar(params,
      msg => Notification.success(msg),
      msg => Notification.error(msg)
    );
  }

  buildOpt() {
    const { folderDefine, caseDefine, suites, cases } = this.state;
    const output = [];
    // 勾选了Insert To Suite，允许用户从下拉列表选择
    if (!folderDefine) {
      const nullOption = <option value="0">---</option>;
      const userDefineOption = <option value="-1">User Define</option>;
      const suiteOptions = suites.length ?
      suites.map(x =>
        <option key={x.id} value={x.id}>{x.name}</option>
      ) : nullOption;
      const caseOptions = cases.length ?
      cases.map(x =>
        <option key={x.id} value={x.id}>{x.projectSuiteNaming}</option>
      ) : nullOption;
      output.push(
        <Input
          key="0"
          type="select"
          label="Version"
          groupClassName="col-xs-3"
          name="suite"
          onChange={(e) => this.handleSelect(e)}
        >
          { suiteOptions }
          { userDefineOption }
        </Input>
      );
      if (caseDefine) {
        output.push(
          <Input
            key="1"
            type="text"
            groupClassName="col-xs-2"
            placeholder="Case"
            onChange={e => this.setState({caseName: e.target.value})}
          />
        );
      } else {
        output.push(
          <Input
            key="1"
            type="select"
            label="Case"
            groupClassName="col-xs-3"
            name="case"
            onChange={(e) => this.handleSelect(e)}
          >
            { caseOptions }
            { userDefineOption }
          </Input>
        );
      }
    } else {// 未勾选 要求用户手动输入
      output.push(
        <Input
          key="0"
          type="text"
          groupClassName="col-xs-2"
          placeholder="Version"
          onChange={e => this.setState({folderName: e.target.value})}
        />
      );
      output.push(
        <Input
          key="1"
          type="text"
          groupClassName="col-xs-2"
          placeholder="Case"
          onChange={e => this.setState({caseName: e.target.value})}
        />
      );
    }
    return output;
  }
  // 拖拽
  sortableContainersDecorator(sortList) {
    if (sortList) {
      Sortable.create(sortList, {
        handle: '.drag-handle',
        onEnd: (evt) => {
          if (evt.newIndex >= 0 && evt.newIndex !== evt.oldIndex) {
            const { list } = this.state;
            // array move
            list.splice(evt.newIndex, 0, list.splice(evt.oldIndex, 1)[0]);
            this.setState({ list });
          }
        },
      });
    }
  }

  buildPopover(data, name, uid) {
    return (
      <Popover id={`import-case-${uid}`} title="编辑">
        <textarea name={name} cols="30" rows="10" onChange={e => this.handleChange(e, uid)}>{data}</textarea>
      </Popover>
    );
  }

  render() {
    const { list, urlMatch, urlPattern, contentType, statusCode, selectRowKeys } = this.state;
    const { isFetching } = this.props;
    // 根据筛选条件得到对应list
    const filterList = list.filter(x =>
      // 排除正则匹配到的api
      statusCode.every(pattern => !new RegExp(pattern).test(Number(x.statusCode)))
    ).filter(x =>
      // 排除contentType包含xxx的api
      contentType.every(type => !x.contentType.includes(type))
    ).filter(x => {
      if (urlPattern.trim() === '') {
        return true;
      }
      // shell通配符 * 跟正则表达式中的 * 不一样

      const pattern = new RegExp(urlPattern.replace('*', '.*'), 'i');
      const result = pattern.test(x.path);
      // url过滤 or url包含
      return urlMatch === '0' ? result : !result;
    });
    const tbody = filterList.length ?
    filterList.map((x, idx) =>
      <tr key={idx}>
        <td>
          <Input
            type="checkbox"
            label={idx + 1}
            name="selectRowKeys"
            value={x.uid}
            checked={selectRowKeys.includes(x.uid.toString())}
            onChange={(e) => this.handleFilter(e)}
          />
        </td>
        <td>
          <OverlayTrigger
            trigger="click"
            rootClose
            placement="bottom"
            overlay={this.buildPopover(x.description, 'description', x.uid)}
          >
            <code>{x.description}</code>
          </OverlayTrigger>
        </td>
        <td>
          <OverlayTrigger
            trigger="click"
            rootClose
            placement="bottom"
            overlay={this.buildPopover(x.path, 'path', x.uid)}
          >
            <code>{x.path}</code>
          </OverlayTrigger>
        </td>
        <td><Label bsStyle="primary">{x.method}</Label></td>
        <td>
          <a href="javascript:;" onClick={() => this.handleDelete(x.uid)}>Delete</a>
          <span className="glyphicon glyphicon-move drag-handle"></span>
        </td>
      </tr>
    ) : <tr className="no-data"><td colSpan="5">No data</td></tr>;

    return (
      <form>
        <section className="case-filter">
          <fieldset>
            <legend>Match Url</legend>
            <div>
              <Input
                type="select"
                groupClassName="url-select"
                onChange={e => this.setState({urlMatch: e.target.value})}
              >
                <option value="0">Include</option>
                <option value="1">Exclude</option>
              </Input>
              <Input
                type="textarea"
                groupClassName="url-input"
                onChange={e => this.setState({urlPattern: e.target.value})}
              />
            </div>
          </fieldset>
          <fieldset>
            <legend>Response Status Code</legend>
            <div>
              <Input
                type="checkbox"
                value="^200$"
                name="statusCode"
                label="Hide Success 200"
                onChange={e => this.handleFilter(e)}
              />
              <Input
                type="checkbox"
                value="[^200]"
                name="statusCode"
                label="Hide non-200"
                onChange={e => this.handleFilter(e)}
              />
              <Input
                type="checkbox"
                value="^304$"
                name="statusCode"
                label="Hide Not-Modified 304"
                onChange={e => this.handleFilter(e)}
              />
              <Input
                type="checkbox"
                value="^30[0-3,7]$"
                name="statusCode"
                label="Hide Redirect (300,301,302,303,307)"
                onChange={e => this.handleFilter(e)}
              />
            </div>
          </fieldset>
          <fieldset>
            <legend>Response Content Type</legend>
            <div>
              <Input
                type="checkbox"
                value="image"
                name="contentType"
                label="Hide Images"
                groupClassName="mb0"
                onChange={e => this.handleFilter(e)}
              />
            </div>
          </fieldset>
        </section>
        <div className="atfc-table-header">
          <Table>
            <thead>
              <tr>
                <th>
                  <Input
                    type="checkbox"
                    label="Step"
                    checked={filterList.length > 0 && selectRowKeys.length === filterList.length}
                    onChange={(e) => this.setState({selectRowKeys: e.target.checked ? filterList.map(x => x.uid.toString()) : []})}
                  />
                </th>
                <th>API Description</th>
                <th>API Path</th>
                <th>Method</th>
                <th>Operation</th>
              </tr>
            </thead>
          </Table>
        </div>
        <div className="atfc-table-body-scroll">
          <Table>
            <tbody ref={(e) => this.sortableContainersDecorator(e)}>
              {tbody}
            </tbody>
          </Table>
        </div>
        <section>
          <div className="case-list-opt">
            { this.buildOpt() }
            <Button type="reset" onClick={() => this.handleReset()}>Reset</Button>
            <Button
              onClick={() => {
                this.setState({show: false});
                this.props.cancel();
              }}
            >
              Cancel
            </Button>
            <Button onClick={() => this.handleSave()} disabled={isFetching}>{isFetching ? 'Saving...' : 'Save'}</Button>
          </div>
        </section>
      </form>
    );
  }
}

ImportCases.propTypes = propTypes;

ImportCases.defaultProps = defaultProps;

const mapStateToProps = (state) => Object.assign({}, state.common);

export default connect(mapStateToProps, {
  saveHar,
})(ImportCases);
