import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link, IndexLink } from 'react-router';
import { Table, Glyphicon, Button, Label, Pagination, Breadcrumb, BreadcrumbItem, Modal } from 'react-bootstrap';
import { DeleteDialog, SearchInput, Notification, ConfirmDialog, Toggle, Badge } from 'atfcapi';
import NewProject from './NewProject';
import { catchProjectList } from '../../vendor/util';
import { getProjects, getProjectList, setLogLevel, setMock } from '../../actions/projectActions';
import { startRun } from '../../actions/caseActions';

class ProjectList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sortName: 'lastRunDate',
      projectName: 1, // 用于排序：0表示按项目名称升序，1表示按项目名称降序
      lastRunDate: 1, // 用于排序：0表示按运行时间升序，1表示按运行时间降序
      offset: 1,
      limit: 10,
      showLogSetting: false,
      searchName: '', // 用户输入的需要查询的项目名称
      logSetProject: 0,
      logsetLevel: 2,
      currLogSetLevel: 2,
    };
  }

  componentDidMount() {
    this.init();

    this.props.getProjects();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.list && nextProps.list.length) {
      catchProjectList(nextProps.list);
    }
  }

  setLogLevel(projectId, level) {
    const params = {
      projectId,
      level,
    };
    this.props.setLogLevel(params,
      msg => Notification.success(msg),
      msg => Notification.error(msg)
    );

    this.setState({
      showLogSetting: false,
      logsetLevel: level,
      currLogSetLevel: level,
    });
  }

  init() {
    const { lastProjectName } = this.props;
    if (lastProjectName) {
      this.setState({ searchName: lastProjectName }, this.loadData);
    } else {
      this.loadData();
    }
  }

  loadData() {
    const { offset, limit, sortName, searchName } = this.state;

    const params = {
      offset: offset - 1,
      limit,
      sortName,
      sortType: this.state[sortName],
      projectName: searchName,
    };
    this.props.getProjectList(params);
  }

  buildResult(value) {
    const result = value ?
      <Label bsStyle="success">YES</Label>
      :
      <Label bsStyle="danger">NO</Label>;
    return result;
  }

  handleSort(value) {
    const state = this.state;
    if (state.sortName === value) {
      state[value] = !state[value] ? 1 : 0;
    } else {
      state.sortName = value;
    }
    state.offset = 1;
    this.setState(state, this.loadData);
  }

  handlePageSelect(event, selectedEvent) {
    this.setState({
      offset: selectedEvent.eventKey,
    }, this.loadData);
  }

  handleSearch(searchName) {
    this.setState({
      searchName: searchName.trim(),
      offset: 1,
    }, this.loadData);
  }

  handelRun(projectId) {
    ConfirmDialog({
      title: 'Are you sure to run timing run now? (The project will run in the background, the final results in the Home page view)',
      okCancel: true,
      onConfirm: () => {
        this.props.startRun({ projectId },
          msg => Notification.success(msg),
          () => Notification.error('该项目没有设置定时跑机器,不能生成Jira Issue，如需生成,请设定定时跑并将Server报备给管理员')
        );
      },
    });
  }

  toggleChange(projectId, isMocked, index) {
    const { list = [] } = this.props;
    list[index].isMock = isMocked === 0 ? 1 : 0;

    const params = {
      projectId,
      isMock: list[index].isMock,
    };

    this.props.setMock(params,
      msg => Notification.success(msg),
      msg => Notification.error(msg)
    );
  }


  render() {
    let nameHead;
    let timeHead;
    const { sortName, projectName, lastRunDate, limit, showLogSetting, searchName, logsetLevel, logSetProject, currLogSetLevel } = this.state;
    const nameValue = projectName ? `up` : `down`;
    const timeValue = lastRunDate ? `up` : `down`;
    if (sortName === 'projectName') {
      nameHead = `on`;
      timeHead = null;
    } else {
      nameHead = null;
      timeHead = `on`;
    }
    const { totalCount, list = [], searchOptions } = this.props;
    const project = list.map((item, index) =>
      <tr key={item.projectId}>
        <td>
          <IndexLink to={{pathname: `/project/${item.projectId}/folder`, state: {projectName: item.projectName}}}>
            {item.change ? <Badge isDot> {item.projectName}</Badge> : item.projectName}
          </IndexLink>
        </td>
        <td>{this.buildResult(item.lastResult)}</td>
        <td>{item.lastRunDate}</td>
        <td>
          <Link to={{pathname: `/project/${item.projectId}/config`}}>Detail</Link>
          {/* <Glyphicon glyph="trash" onClick={() => this.refs.deleteProject.show({index: item.projectId, text: item.projectName})}/> */}
        </td>
        <td className="test-result">
          <span>
            <a target="_blank" href="javascript:;" onClick={() => this.handelRun(item.projectId)} >Run</a>
          </span>
          <span>
            { item.lastTestRail !== '' && item.lastTestRail !== 'null' ? <a target="_blank" href={item.lastTestRail}>TestRail Report</a> : ''}
          </span>
          <span>
            { item.lastRunReport !== 'null' && item.lastRunReport !== '' ? <a target="_blank" href={item.lastRunReport}>Last Run Results</a> : ''}
          </span>
          <span>
            <Link to={{pathname: `/project/${item.projectId}/coverage`, state: {projectName: item.projectName}}}>Coverage</Link>
          </span>
        </td>
        <td>
          <a target="_blank" href="javascript:;" onClick={() => this.setState({showLogSetting: true, logSetProject: item.projectId, logsetLevel: item.logLevel, currLogSetLevel: item.logLevel})}>
            Log Settings
          </a>
          ｜
          <span>Mock</span><Toggle checked={item.isMock === 0 ? false : true} onChange={() => this.toggleChange(item.projectId, item.isMock, index)} />
        </td>
      </tr>
    );
    const totalPage = Math.ceil(totalCount / limit);
    return (
      <div id="project">
        <Breadcrumb>
          <BreadcrumbItem href="/">
            Home
          </BreadcrumbItem>
          <BreadcrumbItem active>
            Project List
          </BreadcrumbItem>
        </Breadcrumb>
        <div className="opt">
          <Button onClick={() => this.refs.createProject.show()}>+ New Project</Button>
          <SearchInput
            groupClassName="search"
            options={searchOptions}
            value={searchName}
            query={value => this.handleSearch(value)}
            onEnter={value => this.handleSearch(value)}
          />
        </div>
        <Table responsive bordered striped hover>
          <thead>
            <tr>
              <th>
                <a href="javascript:;" className={nameHead} onClick={() => this.handleSort('projectName')}>
                  Project Name
                  <Glyphicon glyph={`arrow-${nameValue}`} />
                </a>
              </th>
              <th>By State</th>
              <th>
                <a href="javascript:;" className={timeHead} onClick={() => this.handleSort('lastRunDate')}>
                  Last Run Time
                  <Glyphicon glyph={`arrow-${timeValue}`} />
                </a>
              </th>
              <th>Environment Settings</th>
              <th>Test Results</th>
              <th>Other Settings</th>
            </tr>
          </thead>
          <tbody>
            {project}
          </tbody>
        </Table>
        <div className="atfc-pager">
          <Pagination
            prev
            next
            first
            last
            ellipsis
            boundaryLinks
            items={totalPage}
            maxButtons={10}
            activePage={this.state.offset}
            onSelect={this.handlePageSelect.bind(this)}
          />
          <span>Total {totalPage} pages / {totalCount} records</span>
        </div>
        <NewProject ref="createProject" />
        <DeleteDialog
          ref="deleteProject"
          title="Project"
          delete={id => this.handleDelete(id)}
        />
        <Modal bsSize="small" backdrop="static" show={showLogSetting} dialogClassName="log-modal">
          <Modal.Header>
            <Modal.Title>Log Settings</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <input
              type="radio"
              name="setting"
              id="1"
              readOnly
              onClick={() => this.setState({logsetLevel: 1})}
              checked={logsetLevel === 1 ? true : false}
            />
            <label htmlFor="1">Debug</label>
            <input
              type="radio"
              name="setting"
              id="2"
              readOnly
              onClick={() => this.setState({logsetLevel: 2})}
              checked={logsetLevel === 2 ? true : false}
            />
            <label htmlFor="2">Info</label>
            <input
              type="radio"
              name="setting"
              id="3"
              readOnly
              onClick={() => this.setState({logsetLevel: 3})}
              checked={logsetLevel === 3 ? true : false}
            />
            <label htmlFor="3">Warning</label>
            <input
              type="radio"
              name="setting"
              id="4"
              readOnly
              onClick={() => this.setState({logsetLevel: 4})}
              checked={logsetLevel === 4 ? true : false}
            />
            <label htmlFor="4">Error</label>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => this.setState({showLogSetting: false, logsetLevel: currLogSetLevel})}>Cancel</Button>
            <Button bsStyle="primary" onClick={() => this.setLogLevel(logSetProject, logsetLevel)}>Confirm</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

ProjectList.propTypes = {
  totalCount: PropTypes.number,
  list: PropTypes.array,
  searchOptions: PropTypes.array,
  getProjects: PropTypes.func,
  getProjectList: PropTypes.func,
  setLogLevel: PropTypes.func,
  startRun: PropTypes.func,
  setMock: PropTypes.func,
  lastProjectName: PropTypes.string,
};

const mapStateToProps = (state) => Object.assign({}, state.project);

export default connect(mapStateToProps, {
  getProjects,
  getProjectList,
  setLogLevel,
  startRun,
  setMock,
})(ProjectList);
