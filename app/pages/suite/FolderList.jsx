import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Pagination, Button, Breadcrumb, BreadcrumbItem } from 'react-bootstrap';
import { Notification, Spin } from 'atfcapi';
import FolderItem from './FolderItem';
import { validator, cacheFolderList } from '../../vendor/util';
import { getFolderList, addFolder, showNewFolder } from '../../actions/folderActions';
import { lastProejct } from '../../actions/projectActions';

const propTypes = {
  params: PropTypes.object,
  location: PropTypes.object,
  getFolderList: PropTypes.func,
  addFolder: PropTypes.func,
  showNewFolder: PropTypes.func,
  lastProejct: PropTypes.func,
  add: PropTypes.bool,
  isFetching: PropTypes.bool,
  folderData: PropTypes.object,
};

const defaultProps = {
  params: {},
  location: {},
};

class FolderList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      offset: 1,
      limit: 10,
    };
  }

  componentWillMount() {
    let { state } = this.props.location;
    const projectName = state && state.projectName;

    this.loadFolders();

    if (this.props.add) {
      this.props.showNewFolder(false);
    }

    if (projectName) {
      this.props.lastProejct(projectName);
    }
  }

  componentWillReceiveProps(nextProps) {
    cacheFolderList(this.props.params.projectId, nextProps.folderData.folderList);
  }

  loadFolders() {
    const { offset, limit } = this.state;
    const { projectId } = this.props.params;
    const condi = {
      limit,
      offset: offset - 1,
      projectId,
    };
    this.props.getFolderList(condi, () => {}, msg => Notification.error(msg));
  }

  addFolder() {
    const { name } = this.state;
    const { projectId } = this.props.params;
    // 名称校验 -- 长度限制、同项目名称校验规则
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

    this.props.addFolder(
      condi,
      () => this.loadFolders(),
      msg => Notification.error(msg)
    );
  }

  handlePageSelect(event, selectedEvent) {
    this.setState({
      offset: selectedEvent.eventKey,
    }, () => this.loadFolders());
  }

  render() {
    const { name, offset, limit } = this.state;
    const { state } = this.props.location;
    const projectName = state && state.projectName;
    const { folderData = {}, isFetching, add } = this.props;
    const { folderList = [], total = 0 } = folderData;
    const totalPage = Math.ceil(total / limit);
    const newSuite = [];
    if (add) {
      newSuite.push(<label key="1" className="control-label">New Folder Name</label>);
      newSuite.push(
        <input
          key="2"
          type="text"
          name="key"
          value={name}
          placeholder="only letters, numbers, underscores"
          onChange={e => this.setState({ name: e.target.value })}
          style={{'width': '35%'}}
          className="form-control"
        />
      );
      newSuite.push(<Button key="3" onClick={() => this.addFolder()}>confirm</Button>);
    }
    return (
      <main>
        <Breadcrumb>
          <BreadcrumbItem href="#">
            Home
          </BreadcrumbItem>
          <BreadcrumbItem active>
            {projectName}
          </BreadcrumbItem>
        </Breadcrumb>
        <section className="suite-new">
          <Button onClick={() => this.props.showNewFolder()}>+ New Folder</Button>
          {newSuite}
        </section>
        <section className="suite-list">
          {
            folderList.map((x, idx) =>
              <FolderItem
                key={idx}
                name={x.name}
                id={x.id}
                change={x.change}
                projectId={x.projectId}
                projectName={projectName}
                reload={() => this.loadFolders()}
                error={msg => Notification.error(msg)}
              />
            )
          }
        </section>
        <div className="atfc-pager">
          <Pagination
            prev
            next
            first
            last
            ellipsis
            boundaryLinks
            items={totalPage}
            maxButtons={5}
            activePage={offset}
            onSelect={(event, selectedEvent) => this.handlePageSelect(event, selectedEvent)}
          />
          <span>Total {totalPage} pages / {total} records</span>
        </div>
        { isFetching ? <Spin /> : ''}
      </main>
    );
  }
}

FolderList.propTypes = propTypes;

FolderList.defaultProps = defaultProps;

const mapStateToProps = (state) => Object.assign({}, state.folder);

export default connect(mapStateToProps, {
  getFolderList,
  addFolder,
  showNewFolder,
  lastProejct,
})(FolderList);
