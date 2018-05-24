import React, { Component, PropTypes } from 'react';
import { Modal, Glyphicon, Button } from 'react-bootstrap';
import { Notification, SearchInput } from 'atfcapi';
import { validator } from '../../vendor/util';
import fetchX from '../../vendor/Fetch';

const propTypes = {
  show: PropTypes.bool,
  folder: PropTypes.array,
  suite: PropTypes.array,
  srcFolderId: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  projectId: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  addFolder: PropTypes.func,
  onHide: PropTypes.func,
};

const defaultProps = {
  show: false,
  folder: [],
  suite: [],
  srcFolderId: 0,
  addFolder() {},
  onHide() {},
};

class CopyCaseModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      add: false,
      name: '',
      checkedData: [],
      data: this.props.folder, // 过滤源文件夹
      loading: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: nextProps.folder,
    });
  }

  // 新建文件夹
  async addFolder() {
    const { name, data, loading } = this.state;
    const { projectId } = this.props;
    // 名称校验
    if (name.trim() === '') {
      Notification.info('Folder name cannot be empty');
      return;
    }
    if (!validator.maxLength(name, 30)) {
      Notification.error('Folder name is too long');
      return;
    }
    if (!validator.folderName(name)) {
      Notification.error('Please enter the correct folder name should contain only letters, numbers, underscores');
      return;
    }
    const condi = {
      name,
      projectId,
    };
    if (!loading) {
      this.setState({ loading: true });
    }
    try {
      const { code, data: res, msg } = await fetchX.post('/atfcapi/folder', condi);
      if (code === '200' && res && res.id) {
        const newFolder = {
          id: res.id,
          name: res.name,
        };
        data.unshift(newFolder);
        this.setState({
          data,
        }, () => {
          // 同步左侧文件夹列表
          this.props.addFolder(newFolder);
          // 新建成功
          Notification.success(msg);
        });
      } else {
        Notification.error(msg);
      }
    } catch (e) {
      Notification.error(e.responseJSON.msg);
    } finally {
      this.setState({ loading: false });
    }
  }

  // 选择文件夹
  checkFolder(e) {
    const { checked, value } = e.target;
    const { checkedData } = this.state;
    const folderId = parseInt(value, 10);
    if (checked) {
      checkedData.push(folderId);
    } else {
      const index = checkedData.indexOf(folderId);
      checkedData.splice(index, 1);
    }

    this.setState({
      checkedData,
    });
  }

  reset() {
    this.setState({
      add: false,
      name: '',
      checkedData: [],
    }, this.props.onHide);
  }

  // 复制case 确认
  async confirm() {
    const { checkedData, loading } = this.state;
    const { srcFolderId, suite } = this.props;
    const condi = {
      srcFolderId,
      destFolderId: checkedData,
      suiteId: suite,
    };
    if (!loading) {
      this.setState({ loading: true });
    }
    try {
      const { code, msg } = await fetchX.fetch('/atfcapi/suiteCase/copy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(condi),
      });
      if (code === '200') {
        Notification.success(msg);
      } else {
        Notification.error(msg);
      }
    } catch (e) {
      Notification.error(e.responseJSON.msg);
    } finally {
      this.props.onHide();
      this.setState({loading: false});
    }
  }

  filter(value) {
    const data = this.props.folder.filter(x => x.name.toLowerCase().indexOf(value.toLowerCase()) !== -1);
    this.setState({
      data,
    });
  }

  render() {
    const { add, name, checkedData, data, loading } = this.state;
    const newFolder = [];
    if (add) {
      newFolder.push(<label key="1" clssName="control-label">New folder name</label>);
      newFolder.push(
        <input
          key="2"
          type="text"
          name="folder"
          value={name}
          onChange={e => this.setState({ name: e.target.value })}
          style={{'width': '45%'}}
          placeholder="only letters, numbers, underscores"
          className="form-control"
        />
      );
      newFolder.push(<Button key="3" disabled={loading} onClick={() => this.addFolder()}>OK</Button>);
    }
    return (
      <Modal backdrop="static" bsSize="large" show={this.props.show}>
        <Modal.Header bsClass="copy">
          <Modal.Title>Copy Case
            <SearchInput
              groupClassName="col-xs-8 search"
              onEnter={x => this.filter(x)}
              query={x => this.filter(x)}
            />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body bsClass="copy">
          {
            data.map((x, idx) =>
              <div className="folder" key={idx}>
                <input type="checkbox" checked={checkedData.includes(x.id)} onChange={(e) => this.checkFolder(e)} value={x.id} />
                <Glyphicon glyph="folder-open" />
                <span>{x.name}</span>
              </div>
            )
          }
        </Modal.Body>
        <Modal.Footer bsClass="copy">
          <div className="new">
            <Button onClick={() => this.setState({ add: true })}>+ New Folder</Button>
            {newFolder}
          </div>
          <div className="opt">
            <Button onClick={() => this.reset()}>Cancel</Button>
            <Button disabled={checkedData.length === 0 || loading} onClick={() => this.confirm()}>Confirm</Button>
          </div>
        </Modal.Footer>
      </Modal>
    );
  }
}

CopyCaseModal.propTypes = propTypes;

CopyCaseModal.defaultProps = defaultProps;

export default CopyCaseModal;
