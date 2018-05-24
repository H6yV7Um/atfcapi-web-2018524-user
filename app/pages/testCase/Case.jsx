import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { Button, Breadcrumb, BreadcrumbItem, ListGroup, ListGroupItem, Glyphicon, Input } from 'react-bootstrap';
import { Badge, EditModal, DeleteDialog, Notification } from 'atfcapi';
import NewCase from './NewCase';
import RunResult from './RunResult';
import FileDescription from './FileDescription';
import fetchX from '../../vendor/Fetch';
import { getProjectName, getFolderName, getEnvId } from '../../vendor/util';
import { getAllCases } from '../../actions/caseActions';
import { getAllEvn } from '../../actions/commonAction';

class Case extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      projectId: props.params.projectId,
      suiteName: '',
      projectName: '',
      dataList: [],
      cacheDataList: [],
      activeKey: 0,
      running: false,
      envId: 0,
      folderId: props.params.folderId, // TODO 需要父组件传递过来
      caseId: props.params.caseId || 0,
      folderName: '',
      selectAll: false,
      debugCaseList: [],
      searchCaseInput: '',
    };
  }

  componentWillMount() {
    const { projectId, folderId } = this.state;
    const projectName = getProjectName(projectId);
    const folderName = getFolderName(projectId, folderId);
    this.setState({
      projectName,
      folderName,
    })
  }

  componentDidMount() {
    this.loadTestCases();
    this.loadEnvList();
  }

  async loadTestCases() {
    const { folderId } = this.state;
    //获取所有的cases
    this.props.getAllCases(folderId,
      () => {
        const cacheDataList = [];
        const debugCaseList = [];
        this.props.allCases.map((item) => {
          item.checked = false;
          cacheDataList.push(item);
        });
        // update data list
        this.setState({
          dataList: cacheDataList,
          cacheDataList,
          debugCaseList: debugCaseList,
        });

        if (!cacheDataList.length) return;
        let { caseId } = this.state;
        caseId = cacheDataList[0].id;
        this.setState({
          caseId,
        });
      },
      msg => Notification.error(msg));
  }

  handleGlobal(name) {
    const { projectId } = this.state;
    const condi = {
      projectId,
    };
    const type = name === 'dbinit' ? 2 : 1;
    fetchX.get('/atfcapi/suiteCase/getGlobal', condi)
    .then(json => {
      if (json.code === '200') {
        this.refs.editModal.show(json.data, type);
      } else {
        this.refs.editModal.handleFail(json.msg);
      }
    }).catch(err => this.refs.editModal.handleFail(err.message));
  }

  saveChange({type, value, pathId, responseId, bodyId}) {
    let url;
    const { projectId, projectName } = this.state;
    const suiteName = localStorage.getItem('suiteName');
    const names = [suiteName, 'Global', 'dbinit'];
    const fileName = names[type];
    const condi = {
      projectId: projectId,
      projectName: projectName,
      testCaseFileName: fileName,
    };
    if (!type) {
      condi.pathId = pathId;
      condi.responseId = responseId;
      condi.bodyId = bodyId;
      url = '/atfcapi/suiteCase/insertCaseInfo';
    } else {
      condi.allInfo = value;
      url = '/atfcapi/suiteCase/replaceCaseInfo';
    }
    fetchX.post(url, condi)
    .then(json => {
      if (json.code === '200') {
        window.location.reload();
      } else {
        this.refs.editModal.handleFail(json.msg);
        this.refs.apiList.handleFail(json.msg);
        Notification.error(json.msg);
      }
    }).catch(err => Notification.error(err.message));
  }

  handleDeleteSuite(obj) {
    const suiteId = obj.index;
    fetchX.delete(`/atfcapi/suiteCase/deleteSuite/${suiteId}`)
    .then(json => {
      if (json.code === '200') {
        this.refs.delete.close();
        this.loadTestCases();
      } else {
        Notification.error(json.msg);
        this.refs.delete.handleFail(json.msg);
      }
    }).catch(err => this.refs.delete.handleFail(err.message));
  }

  loadEnvList() {
    this.props.getAllEvn(
      () => {
        const envId = getEnvId(this.props.envList);
        this.setState({ envId });
      }
    );
  }

  async handleRun() {
    const { debugCaseList, folderId, envId } = this.state;
    if (debugCaseList.length !== 0) {
      const condi = {
        folderId,
        debugCaseList: JSON.stringify(debugCaseList),
        envId,
      };
      this.setState({
        running: true,
      });
      try {
        const { msg, code, data } = await fetchX.post('/atfcapi/suiteCase/debugTestCase', condi);
        if (code === '200') {
          this.refs.runResult.show({str: data});
        } else {
          Notification.error(msg);
        }
      } catch (e) {
        throw e
      } finally {
        this.setState({
          running: false,
        });
      }
    } else {
      Notification.error('Please select the case you want to run');
    }
  }

  handleChangeEnv(event) {
    this.setState({
      envId: event.target.value,
    });
  }

  handleChangeInput(event) {
    this.setState({
      searchCaseInput: event.target.value,
    });
  }

  handleSelect() {
    // 更改selectAll逻辑：有一个checked为ture时selectAll->true, 全为false时selectAll->false
    const { dataList, debugCaseList } = this.state;
    const flag = dataList.every(x => x.checked);
    const debugCaseIds = debugCaseList.map(item => item.caseId);
    const selectCaseList = dataList.filter(x => x.checked).map(x => {
      return {
        caseId: x.id,
        caseName: x.projectSuiteNaming,
        descriptionList: debugCaseIds.includes(x.id) ? debugCaseList.filter(k => k.caseId === x.id)[0].descriptionList : [-1],
      };

    });
    this.setState({
      selectAll: flag,
      debugCaseList: selectCaseList,
    });
  }

  handleSelectAll() {
    // 根据selectAll修改selectAll
    const { selectAll, dataList } = this.state;

    dataList.forEach(item => {
      item.checked = !selectAll;
    });

    let selectCaseList = [];
    if (!selectAll) {
      //全选,所有api都要全选
      selectCaseList = dataList.filter(x => x.checked).map(x => {
        return {
          caseId: x.id,
          caseName: x.projectSuiteNaming,
          descriptionList: [-1],
        };

      });

    } else {
      //都不选,清空debugCaseList
      selectCaseList.length = 0;
    }

    this.setState({
      dataList,
      selectAll: !selectAll,
      debugCaseList: selectCaseList,
    });
  }

  toggle(index) {
    const dataList = this.state.dataList;
    dataList[index].checked = !dataList[index].checked;
    this.setState({dataList}, this.handleSelect());
  }

  handleDescrpChange(descriptionList, caseId) {
    const { debugCaseList, dataList } = this.state;
    debugCaseList.map( k => {
      if (k.caseId === caseId) {
        k.descriptionList = descriptionList;
      }
    });

    dataList.forEach(item => {
      if (item.id == caseId) {

        //如果右边的api选中,左边的case更新为选中状态,若api都未选,左边case更新为未选中
        item.checked = descriptionList.length !== 0;

        const included = debugCaseList.some(x => x.caseId == caseId);
        if (descriptionList.length !== 0 && !included) {
          //添加
          debugCaseList.push({
            caseId: item.id,
            caseName: item.projectSuiteNaming,
            descriptionList: descriptionList,
          });
        } else if(descriptionList.length == 0 && included) {
          //删除
          const index = debugCaseList.findIndex(x => x.caseId == caseId);
          debugCaseList.splice(index, 1);
        } else {
          //修改
          const index = debugCaseList.findIndex(x => x.caseId == caseId);
          debugCaseList[index].descriptionList = descriptionList;

        }
      }
    });

    this.setState({
      debugCaseList,
      dataList,
    });
  }

  handleReadStatusChange(caseId) {
    const { dataList } = this.state;
    dataList.forEach(item => {
      if (item.id == caseId) {
        item.change = false;
      }
    });
    this.setState({
      dataList
    });
  }

  handleKeyDown(e) {
    if (e.keyCode === 13) {
      this.handleSearch();
    }
  }

  handleSearch() {
    const { folderId, searchCaseInput } = this.state;
    const params = {
      folderId: folderId,
      content: searchCaseInput,
    }
    fetchX.post('/atfcapi/suiteCase/search', params).then(res => {
      if (res.code === '200') {
        const dataList = res.data;
        const caseId = dataList.length ? dataList[0].id : 0;
        this.setState({
          dataList,
          caseId,
        });
      } else {
        Notification.error(res.msg);
      }
    }).catch(err => Notification.error(err.responseJSON.msg));
  }

  addFolder(newCase) {
    const {cacheDataList} = this.state;
    cacheDataList.unshift(newCase);
    this.setState({
      dataList: cacheDataList,
      cacheDataList,
    });
  }

  buildCaseListDiv() {
    const { dataList, projectId, folderId, caseId, projectName, folderName } = this.state;
    const caselist = dataList.length > 0 ?
    dataList.map( (item, index) =>
      <ListGroupItem key={index}>
        <input type="checkbox" name="case" checked={item.checked ? 'checked' : ''} onChange={() => this.toggle(index)} />
        <Link
          to={{pathname: `/project/${projectId}/folder/${folderId}/case/${item.id}`, state: { projectName, folderName } }}
          onClick={() => {
            this.setState({
              caseId: item.id,
              caseName: item.projectSuiteNaming,
            })}}
          className={(item.id.toString() === caseId.toString()) ? 'active' : ''}
        >
          {item.change ? <Badge isDot> {item.projectSuiteNaming}</Badge> :  item.projectSuiteNaming}
          <p>{item.description}</p>
          <div className="icon-opt">
            <span onClick={() => this.refs.newCase.show(folderId, item.id, item.projectSuiteNaming, item.description)}>
              <Glyphicon glyph="edit" />
            </span>
            <span onClick={() => this.refs.delete.show({ index: item.id, text: item.projectSuiteNaming})}>
              <Glyphicon glyph="remove" />
            </span>
          </div>
        </Link>
      </ListGroupItem>
    )
    :
    <div className="no-data">No data</div>;
    return caselist;
  }

  buildCaseOptionDiv() {
    const { dataList, selectAll } = this.state;
    const caseOptionDiv = (
      <div className="option-wrap">
        <Input type="checkbox" checked={selectAll ? 'checked' : ''} label="All" onChange={() => this.handleSelectAll()} />
        <span>Case({dataList.length ? dataList.length : 0})</span>
      </div>
    );
    return caseOptionDiv;
  }

  buildSearchCaseDiv() {
    const { searchCaseInput, running } = this.state;
    const searchCaseDiv = (
      <div className="search-case-wrap">
        <Input
          type="text"
          name="searchCaseInput"
          value={searchCaseInput}
          onChange={e => this.handleChangeInput(e)}
          onKeyDown={e => this.handleKeyDown(e)}
          placeholder="Please enter a case name"
        />
        <Button
          disabled={running}
          onClick={() => this.handleSearch()}
          className="search-btn"
        >
          <span className="glyphicon glyphicon-search" aria-hidden="true"></span>
          Search
        </Button>
      </div>
    );
    return searchCaseDiv;
  }

  render() {
    const { projectId, projectName, dataList, envId, running, folderId, caseId, folderName, debugCaseList, searchCaseInput } = this.state;
    const { allCases = [], envList = [] } = this.props;
    const envOption = envList.map( item => <option key={item.envId} value={item.envId}>{item.envName}</option>);
    const caselist = this.buildCaseListDiv();
    const caseOptionDiv = this.buildCaseOptionDiv();
    const searchCaseInputDiv = this.buildSearchCaseDiv();
    // 获取当前case下选中的position
    const currentCase = debugCaseList.filter(x => x.caseId == caseId);
    const descriptionList = currentCase.length ? currentCase[0].descriptionList : [];
    return (
      <main id="testCase">
        <Breadcrumb>
          <BreadcrumbItem href="#">
            Home
          </BreadcrumbItem>
          <BreadcrumbItem active>
            <Link to={{pathname: `/project/${projectId}/folder`, state: { ...this.props.location.state }}}>{projectName}</Link>
          </BreadcrumbItem>
          <BreadcrumbItem active>
            {folderName}
          </BreadcrumbItem>
        </Breadcrumb>
        <div className="btn-wrap">
          <div className="env-select">
            <Input
              type="select"
              name="envId"
              value={envId}
              onChange={e => this.handleChangeEnv(e)}
            >
              {envOption}
            </Input>
            <Button
              disabled={running}
              onClick={() => this.handleRun()}
              className="run-btn"
            >
              {running ? `Debug...` : `Debug`}
            </Button>
          </div>
          <div className="case-btn">
            <Button
              className="mL30"
              bsStyle="default"
              onClick={() => this.refs.newCase.show(folderId)}
            >
              New Case
            </Button>
            <Button className="mL30" onClick={() => this.handleGlobal()}>Global</Button>
          </div>
        </div>
        <div className="content-wrap">
          <div className="list-wrap">
            {caseOptionDiv}
            {searchCaseInputDiv}
            <ListGroup>
              {caselist}
            </ListGroup>
          </div>
          <div className="descrip-wrap">
            <FileDescription
              projectId={projectId}
              projectName={projectName}
              descriptionList={descriptionList}
              cases={allCases}
              folderId={folderId}
              caseId={caseId}
              onChange={(item) => this.handleDescrpChange(item, caseId)}
              addFolder={(newCase) => this.addFolder(newCase)}
              onReadStatusChange={() => this.handleReadStatusChange(caseId)}
              searchCaseInput={searchCaseInput}
            />
            <div className="insert-btn">
              <Link to={{pathname: `/api/select`, state: {projectId, caseId, folderId, projectName } }}><Button bsStyle="primary" disabled={dataList.length ? false : true}>Insert API</Button></Link>
            </div>
          </div>
        </div>
        <NewCase
          ref="newCase"
        />
        <EditModal
          ref="editModal"
          save={this.saveChange.bind(this)}
        />
        <DeleteDialog
          ref="delete"
          title="Case"
          delete={obj => this.handleDeleteSuite(obj)}
        />
        <RunResult ref="runResult" />
      </main>
    );
  }
}

Case.propTypes = {
  params: PropTypes.object,
  envList: PropTypes.array,
  location: PropTypes.object,
  getAllCases: PropTypes.func,
  getAllEvn: PropTypes.func,
  allCases: PropTypes.array,
};

Case.contextTypes = {
  router: PropTypes.object,
};

const mapStateToProps = (state) => Object.assign({}, state.common, state.suitecase);

export default connect(mapStateToProps, {
  getAllCases,
  getAllEvn,
})(Case);
