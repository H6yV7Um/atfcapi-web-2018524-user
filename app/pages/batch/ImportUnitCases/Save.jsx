import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import {
  Input,
  Button,
  Table,
  Modal,
  OverlayTrigger,
  Popover
} from 'react-bootstrap';
import { Notification } from 'atfcapi';
import {
  getLogList,
  saveUnitCase,
  getLogItemDetail,
  setLogList
} from '../../../actions/commonAction';
import fetchX from '../../../vendor/Fetch';
import { validator } from '../../../vendor/util';

class Save extends Component {
  constructor(props) {
    super(props);
    this.state = {
      folderId: 0,
      caseId: 0,
      folderName: '',
      caseName: '',
      folderDefine: false, // 自定义folder
      caseDefine: false, // 自定义case
      suites: [], // suite列表（文件夹列表）
      cases: [], // case列表
      selectRowKeys: [],
      show: false,
      pathId: -1,
      selectRadioIndex: -1
    };
  }

  componentDidMount() {

    this.loadFolders();
  }

  /**
   * 控制详情的显示与隐藏
   */
  handleToggle() {
    const { show } = this.state;
    this.setState({ show: !show });
  }

  /**
   * Version & Case 的选择
   */
  handleSelect(e) {
    const { value, name } = e.target;
    switch (name) {
      case 'suite':
        // User Define
        if (value === '-1') {
          this.setState({
            folderDefine: true
          });
        } else {
          this.setState(
            {
              folderId: parseInt(value, 10)
            },
            this.loadCases
          );
        }
        break;
      case 'case':
        if (value === '-1') {
          this.setState({
            caseDefine: true
          });
        } else {
          this.setState({
            caseId: parseInt(value, 10)
          });
        }
        break;
      default:
        break;
    }
  }

  /**
   * 表单重置
   */
  handleReset() {
    this.setState({
      selectRowKeys: [],
      folderDefine: false,
      caseDefine: false
    });
  }

  /**
   * 查询详情
   */
  handleDetail(pathId) {
    const { startDate, endDate } = this.props;
    const startTime = startDate.format('YYYY-MM-DD');
    const endTime = endDate.format('YYYY-MM-DD');
    this.props.getLogItemDetail(
      { pathId, startTime, endTime },
      () => {
        this.setState({ pathId }, () => this.handleToggle());
      },
      msg => Notification.error(msg)
    );
  }

  /**
   * 删除一条Log
   */
  handleDelete(pathId) {
    const { logList, setLogList } = this.props;
    const { selectRowKeys } = this.state;
    const newList = logList.filter(item => item.pathId !== pathId);
    this.setState(
      {
        selectRowKeys: selectRowKeys.filter(x => x !== pathId)
      },
      () => setLogList(newList)
    );
  }

  /**
   * 当前行的 选中/取消选中 事件
   */
  handleChange(e) {
    const { value, checked, name } = e.target;
    const filter = this.state[name];
    const pathId = parseInt(value, 10);
    if (checked) {
      filter.push(pathId);
    } else {
      const index = filter.indexOf(pathId);
      filter.splice(index, 1);
    }
    this.setState({
      [name]: filter
    });
  }

  validateInput(name, tip) {
    if (!validator.maxLength(name, 30)) {
      Notification.error(`The ${tip} is too long`);
      return false;
    }
    if (!validator.folderName(name)) {
      Notification.error(
        `Please enter the correct ${tip}, can only contain letters, numbers, underscores, can not start with a number`
      );
      return false;
    }
    return true;
  }

  /**
   *  变更
   */
  handleCheck(e) {
    const { value } = e.target;
    const index = parseInt(value, 10);
    this.setState({ selectRadioIndex: index });
  }

  handleConfirm() {
    // 根据选中的selectRadioIndex，得到对应的detailItem
    const { selectRadioIndex, pathId } = this.state;
    const { logList, logDetailList, setLogList } = this.props;
    const item = logDetailList[selectRadioIndex] || {};
    item.pathId = pathId;
    // 替换当前logList中的对应项
    // 1. 复制一份，并过滤掉当前pathId的对应项
    let newList = logList.concat();
    // 将item插入到原来的位置
    const index = logList.findIndex(item => item.pathId === pathId);
    newList[index] = item;
    setLogList(newList);
    this.handleToggle();
  }

  /**
   * 保存case
   */
  handleSave() {
    const { folderDefine, caseDefine, selectRowKeys } = this.state;
    const { projectId, logList } = this.props;
    // 参数

    const soaList = logList.filter(x => selectRowKeys.includes(x.pathId));
    let params = {
      projectId,
      soaList
    };
    const { folderId, caseId, folderName, caseName } = this.state;

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
          caseName
        });
      } else {
        if (parseInt(caseId, 10) === 0) {
          Notification.error('Case can not be empty');
          return;
        }
        params = Object.assign({}, params, {
          folderId,
          caseId
        });
      }
    } else {
      // 自定义folder
      if (!this.validateInput(folderName, 'folder name')) return;
      if (!this.validateInput(caseName, 'case name')) return;
      params = Object.assign({}, params, {
        folderName,
        caseName
      });
    }

    this.props.saveUnitCase(
      params,
      msg => Notification.success(msg),
      msg => Notification.error(msg)
    );
  }

  buildList() {
    const { logList } = this.props;
    const { selectRowKeys } = this.state;
    const tr = logList.length
      ? logList.map((item, index) => {
          return (
            <tr key={index}>
              <td>
                <input
                  type="checkbox"
                  name="selectRowKeys"
                  value={item.pathId}
                  checked={selectRowKeys.includes(item.pathId)}
                  onClick={e => this.handleChange(e)}
                />
                <label className="ml5">{index + 1}</label>
              </td>
              <td>{item.iface}</td>
              <td>{item.method}</td>
              <td>
                <OverlayTrigger
                  trigger="click"
                  rootClose
                  placement="bottom"
                  overlay={this.buildPopover(item.args, index)}
                >
                  <code className="api-path">...</code>
                </OverlayTrigger>
              </td>
              <td>
                <a
                  href="javascript:;"
                  onClick={() => this.handleDelete(item.pathId)}
                >
                  Delete
                </a>
                &nbsp;&nbsp;
                <a
                  href="javascript:;"
                  onClick={() => this.handleDetail(item.pathId)}
                >
                  Detail
                </a>
              </td>
            </tr>
          );
        })
      : <tr className="no-data"><td colSpan="5">No data</td></tr>;
    return tr;
  }

  buildDetail() {
    const { logDetailList } = this.props; // TODO: logList => logDetailList
    const tr = logDetailList.length
      ? logDetailList.map((item, index) => {
          return (
            <tr key={index}>
              <td>
                <input
                  type="radio"
                  name="unitTest-detail"
                  value={index}
                  onClick={e => this.handleCheck(e)}
                />
                <label className="ml5">{index + 1}</label>
              </td>
              <td>{item.iface}</td>
              <td>
                {item.method}
              </td>
              <td>
                <OverlayTrigger
                  trigger="click"
                  rootClose
                  placement="bottom"
                  overlay={this.buildPopover(item.args, index)}
                >
                  <code className="api-path">...</code>
                </OverlayTrigger>
              </td>
              <td>
                <OverlayTrigger
                  trigger="click"
                  rootClose
                  placement="bottom"
                  overlay={this.buildPopover(item.schema, index)}
                >
                  <code className="api-path">...</code>
                </OverlayTrigger>
              </td>
            </tr>
          );
        })
      : <tr className="no-data"><td colSpan="5">No data</td></tr>;
    return tr;
  }

  buildPopover(data, index) {
    let content;
    if (typeof data === 'object') {
      content = JSON.stringify(data, null, 2);
    }
    return (
      <Popover className="unitcase-args" id={index} title="Args Detail">
        <textarea readOnly>{content}</textarea>
      </Popover>
    );
  }

  loadFolders() {
    const { projectId } = this.props;
    const params = {
      limit: 100,
      offset: 0,
      projectId
    };
    fetchX
      .post('/atfcapi/folder/list', params)
      .then(res => {
        if (res.data.total > 0) {
          let { folderId } = this.state;
          folderId = folderId || res.data.folderList[0].id;
          this.setState(
            {
              suites: res.data.folderList,
              folderId
            },
            this.loadCases
          );
        }
      })
      .catch(() => Notification.error('Failed to get suiteNames!'));
  }

  loadCases() {
    const { folderId } = this.state;
    fetchX
      .post('/atfcapi/suiteCase/getAll', { folderId })
      .then(res => {
        let { caseId } = this.state;
        if (res.data && res.data.length) {
          caseId = res.data[0].id;
        } else {
          caseId = 0;
        }
        this.setState({
          cases: res.data,
          caseId
        });
      })
      .catch(() => Notification.error('Failed to get caseNames!'));
  }

  buildOpt() {
    const { folderDefine, caseDefine, suites, cases } = this.state;
    const output = [];
    // 勾选了Insert To Suite，允许用户从下拉列表选择
    if (!folderDefine) {
      const nullOption = <option value="0">---</option>;
      const userDefineOption = <option value="-1">User Define</option>;
      const suiteOptions = suites.length
        ? suites.map(x => <option key={x.id} value={x.id}>{x.name}</option>)
        : nullOption;
      const caseOptions = cases.length
        ? cases.map(x => (
          <option key={x.id} value={x.id}>{x.projectSuiteNaming}</option>
        ))
      : nullOption;
      output.push(
        <Input
          key="0"
          type="select"
          label="Version"
          groupClassName="col-xs-3"
          name="suite"
          onChange={e => this.handleSelect(e)}
        >
          {suiteOptions}
          {userDefineOption}
        </Input>
      );
      if (caseDefine) {
        output.push(
          <Input
            key="1"
            type="text"
            groupClassName="col-xs-2"
            placeholder="Case"
            onChange={e => this.setState({ caseName: e.target.value })}
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
            onChange={e => this.handleSelect(e)}
          >
            {caseOptions}
            {userDefineOption}
          </Input>
        );
      }
    } else {
      // 未勾选 要求用户手动输入
      output.push(
        <Input
          key="0"
          type="text"
          groupClassName="col-xs-2"
          placeholder="Version"
          onChange={e => this.setState({ folderName: e.target.value })}
        />
      );
      output.push(
        <Input
          key="1"
          type="text"
          groupClassName="col-xs-2"
          placeholder="Case"
          onChange={e => this.setState({ caseName: e.target.value })}
        />
      );
    }
    return output;
  }

  render() {
    const { isFetching, logList } = this.props;
    return (
      <section>
        <form>
          <Table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onClick={e =>
                      this.setState({
                        selectRowKeys: e.target.checked
                          ? logList.map(x => x.pathId)
                          : []
                      })}
                  />
                  <label className="ml5">NO</label>
                </th>
                <th>Iface</th>
                <th>Method</th>
                <th>Args</th>
                <th>Operation</th>
              </tr>
            </thead>
            <tbody>
              {this.buildList()}
            </tbody>
          </Table>
          <div className="case-list-opt left">
            {this.buildOpt()}
            <Button
              onClick={() => this.handleSave()}
              bsStyle="primary"
              disabled={isFetching}
            >
              {isFetching ? 'Saving...' : 'Save'}
            </Button>
            <Button type="reset" onClick={() => this.handleReset()}>
              Reset
            </Button>
          </div>
        </form>
        <Modal
          bsSize="large"
          backdrop="static"
          show={this.state.show}
          onHide={() => this.handleToggle()}
          dialogClassName="log-modal"
        >
          <Modal.Header closeButton>
            <Modal.Title>Detail</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Table>
              <thead>
                <tr>
                  <th>NO</th>
                  <th>Iface</th>
                  <th>Method</th>
                  <th>Args</th>
                  <th>Schema</th>
                </tr>
              </thead>
              <tbody>
                {this.buildDetail()}
              </tbody>
            </Table>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => this.handleToggle()}>Cancel</Button>
            <Button bsStyle="primary" onClick={() => this.handleConfirm()}>
              Confirm
            </Button>
          </Modal.Footer>
        </Modal>
      </section>
    );
  }
}

Save.propTypes = {
  isFetching: PropTypes.bool,
  projectId: PropTypes.string,
  getLogList: PropTypes.func,
  saveUnitCase: PropTypes.func,
  getLogItemDetail: PropTypes.func,
  setLogList: PropTypes.func,
  logList: PropTypes.array,
  logDetailList: PropTypes.array,
  pathIds: PropTypes.array,
  startDate: PropTypes.object,
  endDate: PropTypes.object
};

const mapStateToProps = state => Object.assign({}, state.common);

export default connect(mapStateToProps, {
  getLogList,
  saveUnitCase,
  getLogItemDetail,
  setLogList
})(Save);
