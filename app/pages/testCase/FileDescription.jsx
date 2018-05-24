import React from 'react';
import { Link } from 'react-router';
import { Table, Input, Button, Label, OverlayTrigger, Popover } from 'react-bootstrap';
import Sortable from 'sortablejs';
import { DeleteDialog, Notification, Badge } from 'atfcapi';
import EditApiDetail from './EditApiDetail';
import CopyApiModal from '../suite/CopyApiModal';
import fetchX from '../../vendor/Fetch';
import ApiChangeHistory from './ApiChangeHistory';

class FileDescription extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      caseId: props.caseId,
      suiteName: '',
      data: [],
      selectAll: false,
      isCopy: false, //是否显示复制对话框
    };
  }

  componentDidMount() {
    this.loadDescrip();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.caseId !== this.props.caseId) {
      this.setState({
        caseId: nextProps.caseId,
      }, this.loadDescrip);
    } else{
      const { data } = this.state;
      if (nextProps.descriptionList.includes(-1)) {
        data.map((x) => {
          x.checked = true;
        });

      }else {
        data.map((x) => {
          x.checked = false;
        });

        nextProps.descriptionList.map(i => {
          data[i].checked = true;
        });
      }
      this.setState({
        data,
      });
    }
  }

  loadDescrip() {
    const { caseId } = this.state;
    if (caseId === 0) {
      this.setState({
        data: [],
      });
      return;
    }
    fetchX.get(`/atfcapi/suiteCase/descriptionList?caseId=${caseId}`)
    .then(json => {
      if (json.code === '200') {
        const { descriptionList } = this.props;
        let data = [];
        // 全选状态
        if (descriptionList.includes(-1)) {
          data = json.data.map((x) => {
            x.checked = true;
            return x;
          });
        } else {
          data = json.data.map((x, idx) => {
            x.checked = descriptionList.includes(idx);
            return x;
          });
        }
        this.setState({
          data,
        });
      } else {
        Notification.error(json.msg || json.message);
      }
    }).catch(err => Notification.error(err.responseJSON.msg));
  }

  async deleteCaseInfo() {
    const { data, caseId, descriptionList } = this.state;
    //已勾选的api index
    const checkedApiList = [];
    data.forEach((x, idx) => {
      if (x.checked) {
        checkedApiList.push(idx);
      }
    });

    const params = {
      caseId,
      positions: checkedApiList.toString(),
    };
    try {
      const { code, msg } = await fetchX.post('/atfcapi/suiteCase/deleteCaseInfo', params);
      if (code === '200') {
        this.refs.delComfirm.close();
        Notification.success(msg);

        //descriptionList记录了选中的api,删除选中的api后,descriptionList的记录清空
        descriptionList.length = 0;

        this.setState({
          data: data.filter(x => !x.checked),
          descriptionList: descriptionList
        });
      } else {
        Notification.error(msg);
      }
    } catch (e) {
      throw e
    }
  }

  async updateCaseInfo(value, index) {
    const { caseId } = this.state;
    const params = {
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
        body: JSON.stringify(params)
      });

      Notification[code === '200' ? 'success' : 'error'](msg);
      this.refs.editApi.close();
      this.loadDescrip();
    } catch (e) {
      this.refs.editApi.handleFail('Modify information failed. Please try again later！');
      throw e
    }
  }

  handleEdit(index) {
    const { caseId } = this.state;
    fetchX.get(`/atfcapi/suiteCase/getCaseApi?caseId=${caseId}&position=${index}`)
    .then(json => this.refs.editApi.show(json.data, index));
  }

  handleApiChangeHistory(index, unRead, description, path) {
    const { caseId, data } = this.state;
    const params = {
      caseId: caseId,
      position: index,
    };

    fetchX.post('/atfcapi/suiteCase/changeHistory', params)
      .then(res => {
        if (res.code == 200) {
          this.refs.apiChangeHistory.show(res.data, index, description, path);
        } else {
          Notification.error(res.msg || res.message);
        }
      }).catch(err => Notification.error(err.message));

    //update read status
    if (unRead) {
      //update current api read status, api's red dots disappear
      data[index].IsChange = false;
      this.setState({
        data: data
      });
      //if all chagne api is read status, update case read status, case's red dots disappear
      const isAllRead = data.every(x => x.IsChange === false);
      if (isAllRead) {
        this.props.onReadStatusChange();
      }
    }
  }

  buildPopover(data, index) {
    const cloneData = Object.assign({}, data);
    delete cloneData.checked;
    return (
      <Popover className="preview-pop" id={index} title={cloneData.ADescription}>
        <Input type="textarea" readOnly defaultValue={JSON.stringify(cloneData, null, 2)} />
      </Popover>
    );
  }

  sortableContainersDecorator(sortList) {
    const self = this;
    if (sortList) {
      Sortable.create(sortList, {
        handle: '.drag-handle',
        onEnd(evt) {  // TODO  联调，注意页面刷新之后，api顺序以及是否选中
          // 调接口，重新排序，获取排序后list,更新data
          const params = {
            caseId: evt.target.id,
            destPosition: evt.newIndex,
            srcPosition: evt.oldIndex,
          };

          if (evt.newIndex >= 0 && evt.newIndex !== evt.oldIndex) {
            fetchX.post('/atfcapi/suiteCase/move', params)
            .then(res => {
              if (res.code === '200') {
                self.loadDescrip();
              } else {
                Notification.error(res.msg || res.message);
              }
            }).catch(err => Notification.error(err.message));
          }
        },
      });
    }
  }

  handleSelect() {
    const { data } = this.state;
    // 表示已勾选的api index
    const descriptionList = [];
    data.forEach((x, idx) => {
      if (x.checked) {
        descriptionList.push(idx);
      }
    });
    const flag = data.every(x => x.checked);
    this.setState({
      selectAll: flag,
      descriptionList,
    });
    // 触发父组件onChange
    this.props.onChange(descriptionList);
  }

  handleSelectAll() {
    // 根据selectAll修改selectAll
    const { selectAll, data } = this.state;
    const descriptionList = [];
    if (selectAll) {
      data.map( item => {
        item.checked = false;
      });
    } else {
      data.map( (item, index) => {
        item.checked = true;
        descriptionList.push(index);
      });
    }
    this.setState({
      data,
      selectAll: !selectAll,
      descriptionList,
    });
    this.props.onChange(descriptionList);
  }

  copy() {
    const {data} = this.state;
    const flag = data.some(x => x.checked);
    if (flag) {
      this.setState({
        isCopy: true,
      });
    } else {
      Notification.error('Any item not selected');
    }

  }

  isIncludePath(path) {
    const { searchCaseInput } = this.props;
    if (searchCaseInput === '') {
      return false;
    }
    return path.toLowerCase().indexOf(searchCaseInput.toLowerCase()) > -1;
  }

  buildDescrip(data) {
    let table;
    const { caseId } = this.state;
    const { projectId, projectName, folderId } = this.props;
    const tr = data.map( (item, index) =>
      <tr key={index + Math.random()}>
        <td>
          <Input type="checkbox" groupClassName="mb0" checked={item.checked ? true : false} label={index + 1} onChange={() => this.toggle(index)} />
        </td>
        <td>
          {item.IsChange
            ?
              <Badge isDot>
                <a href="javascript:;" onClick={() => this.handleApiChangeHistory(index, item.IsChange, item.ADescription, item.Path)}>{item.ADescription}</a>
              </Badge>
            : <a href="javascript:;" onClick={() => this.handleApiChangeHistory(index,item.IsChange, item.ADescription, item.Path)}>{item.ADescription}</a>
          }
        </td>
        { item.ServiceType === 'THRIFT' ?
          <td>
            {
              item.Method ?
              this.isIncludePath(item.Path) ? <code className="api-path">{item.Method.toUpperCase()}</code> : item.Method.toUpperCase()
              : ''
            }
          </td>
          :
          <td>
            <OverlayTrigger
              trigger="click"
              rootClose
              placement="bottom"
              overlay={this.buildPopover(item, index)}
            >
              <code className={this.isIncludePath(item.Path) ? "api-path" : "api-path-no-highlight"}>{item.Path}</code>
            </OverlayTrigger>
          </td>
        }
        { item.ServiceType === 'THRIFT' ?
          <td><Label bsStyle="primary">{item.Method ? item.Method.toUpperCase() : ''}</Label></td>
          :
          <td><Label bsStyle="primary">{item.Method ? item.Method.toUpperCase() : ''}</Label></td>
        }
        <td>
          <a href="javascript:;" onClick={() => this.handleEdit(index)}>Modify</a>
          <Link to={{pathname: `/api/request`, state: { projectId, projectName, caseId, folderId, position: index, type: 1 }}}>Send</Link>
          <span className="glyphicon glyphicon-move drag-handle" aria-hidden="true"></span>
        </td>
      </tr>
    );
    table = (
      <div>
        <div className="option-wrap">
          {/*<Input type="checkbox" checked={selectAll ? 'checked' : ''} label="全选" onChange={() => this.handleSelectAll()}/>*/}
          <Button onClick={() => this.copy()}>Copy</Button>
          <Button
            onClick={() => {
              const checkedApiList = data.filter(x => x.checked);
              if (checkedApiList.length !== 0) {
                this.refs.delComfirm.show({
                  index: 0,
                  text: checkedApiList.length + ' API',
                });
              } else {
                Notification.error('Please select at least one API to delete!');
              }
            }}
          >
            Delete
          </Button>
          <span>Api({data.length})</span>
        </div>
        <div className="table-scroll">
          <Table className="mb0" response striped bordered>
            <thead>
              <tr style={{'height': '45px'}}>
                <th>Step</th>
                <th>API Description</th>
                <th>API Path</th>
                <th>Method</th>
                <th>Operation</th>
              </tr>
            </thead>
            <tbody id={caseId} ref={(e) => this.sortableContainersDecorator(e)}>
              {tr}
            </tbody>
          </Table>
        </div>
      </div>
    );
    return table;
  }

  handleChangeEnv(event) {
    this.setState({
      envId: event.target.value,
    });
  }

  toggle(index) {
    const { data } = this.state;
    data[index].checked = !data[index].checked;
    this.setState({data}, this.handleSelect);
  }

  render() {
    const { data, isCopy } = this.state;
    const descripHtml = data && data.length ? this.buildDescrip(data) : <div className="no-data">No data</div>;
    return (
      <div>
        {descripHtml}
        <EditApiDetail
          ref="editApi"
          save={({value, index}) => this.updateCaseInfo(value, index)}
        />

        <ApiChangeHistory
          ref="apiChangeHistory"
          caseId={this.props.caseId}
        />

        <DeleteDialog
          ref="delComfirm"
          delete={() => this.deleteCaseInfo()}
        />

        {/*默认传递所有suit文件夹下所有的case*/}
        <CopyApiModal
          folderId={this.props.folderId}
          srcSuiteId={this.props.caseId}
          cases={this.props.cases}
          show={isCopy}
          onHide={() => this.setState({isCopy: false})}
          data={data}
          addFolder={(newCase) => this.props.addFolder(newCase)}
          success={msg => {
            Notification.success(msg);
            this.loadDescrip();
          }}
          error={msg => Notification.error(msg)}
        />
      </div>
    );
  }
}

FileDescription.propTypes = {
  folderId: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number,
  ]),
  caseId: React.PropTypes.number,
  projectName: React.PropTypes.string,
  projectId: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number,
  ]),
  descriptionList: React.PropTypes.array,
  onChange: React.PropTypes.func,
  cases: React.PropTypes.array,
  addFolder: React.PropTypes.func,
  onReadStatusChange: React.PropTypes.func,
  searchCaseInput: React.PropTypes.string
};

export default FileDescription;
