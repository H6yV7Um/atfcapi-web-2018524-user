import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Modal, Button } from 'react-bootstrap';
import { SearchInput } from 'atfcapi';
import CaseItem from './CaseItem';
import { addCase, copyCaseInfo } from '../../actions/caseActions';

const propTypes = {
  show: PropTypes.bool, // 是否显示复制对话框
  data: PropTypes.array,
  onHide: PropTypes.func, // 取消
  cases: PropTypes.array, // 所有cases
  srcSuiteId: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  folderId: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  success: PropTypes.func,
  error: PropTypes.func,
  addFolder: PropTypes.func,
  newCase: PropTypes.object,
  isFetching: PropTypes.bool,
  addCase: PropTypes.func,
  copyCaseInfo: PropTypes.func,
};

const defaultProps = {
  show: false,
  data: [],
  cases: [],
  onHide() {},
  success() {},
  error() {},
};

class CopyApiModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      add: false, // 是否添加
      name: '', // 添加值
      desc: '', // 描述
      checkedData: [], // 选中项
      data: this.props.data, // 源数据
      cases: this.props.cases,
      checked: false, // 全选
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.data,
      cases: nextProps.cases, // what nextProps
    });
  }

  reset() {
    this.setState({
      add: false,
      checkedData: [],
      name: '',
      desc: '',
    }, this.props.onHide());
  }

  // 新建case
  addFolder() {
    const { name, desc, cases } = this.state;
    const {folderId} = this.props;
    const reg = /\s/g;
    if (!name || !desc) {
      this.props.error('Please complete the case name and case description!');
      return false;
    }
    if (reg.test(name)) {
      this.props.error('case name can not be blank spaces!');
      return false;
    }
    const params = {
      folderId,
      testCaseFileName: name,
      testCaseFileDescription: desc,
    };

    this.props.addCase(params,
      msg => {
        cases.unshift(this.props.newCase);
        this.setState({
          add: false,
          cases,
        }, () => {
          // 同步左侧case列表
          this.props.addFolder(this.props.newCase);
          this.props.success(msg);
        });
      },
      msg => this.props.error(msg)
    );
  }

  // 选中某一项时
  checkFolder(e) {
    const { checked, value } = e.target;
    const { checkedData } = this.state;
    if (checked) {
      checkedData.push(value);
    } else {
      const index = checkedData.indexOf(value);
      checkedData.splice(index, 1);
    }

    this.setState({
      checkedData,
    });
  }

  checkItem(id, checked) {
    const { checkedData } = this.state;
    const caseId = parseInt(id, 10);
    if (checked) {
      checkedData.push(caseId);
    } else {
      const index = checkedData.indexOf(caseId);
      checkedData.splice(index, 1);
    }

    this.setState({
      checkedData,
    });
  }


  // 根据搜索框文本进行过滤
  filter(value) {
    // todo不区分大小写
    const cases = this.props.cases.filter(x => x.projectSuiteNaming.toLowerCase().indexOf(value) !== -1);
    this.setState({
      cases,
    });
  }

  confirm() {
    const { checkedData, data } = this.state;
    const {srcSuiteId} = this.props;
    const positions = [];

    data.forEach(function(value, index) {
      if (value.checked) {
        positions.push(index);
      }
    });

    const params = {
      srcSuiteId, // 源caseID
      destSuiteId: checkedData, // 目标caseId
      positions: positions, // case Api的位置
    };

    this.props.copyCaseInfo(params,
      msg => this.props.success(msg),
      msg => this.props.error(msg)
    );
    this.reset();
  }


  render() {
    const { add, name, desc, cases, checked, checkedData } = this.state;
    const { isFetching } = this.props;
    const newFolder = [];
    if (add) {
      newFolder.push(<label key="1" clssName="control-label">Name</label>);
      newFolder.push(
        <input
          key="2"
          type="text"
          name="folder"
          value={name}
          onChange={e => this.setState({ name: e.target.value })}
          style={{'width': '25%'}}
          className="form-control"
        />
      );
      newFolder.push(<label key="3" clssName="control-label">Description</label>);
      newFolder.push(
        <input
          key="4"
          type="text"
          name="folder"
          value={desc}
          onChange={e => this.setState({ desc: e.target.value })}
          style={{'width': '25%'}}
          className="form-control"
        />
      );
      newFolder.push(<Button key="5" disabled={isFetching} onClick={() => this.addFolder()}>OK</Button>);
    }
    return (
      <Modal backdrop="static" bsSize="large" show={this.props.show}>
        <Modal.Header bsClass="copy">
          <Modal.Title>Copy Api
            <SearchInput
              groupClassName="col-xs-8 search"
              query={x => this.filter(x)}
            />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body bsClass="copy">
          <section className="copycase-list">
            {
              cases.map((x, idx) =>
                <CaseItem
                  key={idx}
                  checked={checked}
                  onChange={value => this.checkItem(x.id, value)}
                  title={x.projectSuiteNaming}
                  description={x.description}
                />
              )
            }
          </section>
        </Modal.Body>
        <Modal.Footer bsClass="copy">
          <div className="new" style={{'width': '75%'}}>
            <Button onClick={() => this.setState({ add: true })}>+ New Case</Button>
            {newFolder}
          </div>
          <div className="opt">
            <Button onClick={() => this.reset()}>Cancel</Button>
            <Button disabled={checkedData.length === 0 || isFetching} onClick={() => this.confirm()}>Confirm</Button>
          </div>
        </Modal.Footer>
      </Modal>
    );
  }
}

CopyApiModal.propTypes = propTypes;

CopyApiModal.defaultProps = defaultProps;

const mapStateToProps = (state) => Object.assign({}, state.suitecase);

export default connect(mapStateToProps, {
  addCase,
  copyCaseInfo,
})(CopyApiModal);
