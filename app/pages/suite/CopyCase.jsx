import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { Pagination, MenuItem, Glyphicon, Button, Breadcrumb, BreadcrumbItem } from 'react-bootstrap';
import { SearchInput, Notification, Spin } from 'atfcapi';
import CaseItem from './CaseItem';
import CopyCaseModal from './CopyCaseModal';
import { getAllFolders, addFolderVirtual } from '../../actions/folderActions';
import { getAllCases, getCaseList } from '../../actions/caseActions';

class CopyCase extends Component {
  constructor(props) {
    super(props);
    this.state = {
      folderId: props.params.folderId, // 选中的文件夹id
      projectId: props.params.projectId,
      checked: false, // 全选
      checkedData: [], // 选中的case
      iscopy: false, // 是否显示复制对话框
      offset: 1,
      limit: 14,
    };
  }

  componentWillMount() {
    this.loadFolder();
    this.loadCases();
    this.loadSearch();
  }

  // case列表
  loadCases(name = '') {
    const { folderId, offset, limit } = this.state;
    const params = {
      folderId,
      offset: name ? 0 : offset - 1,
      limit,
      name,
    };
    this.props.getCaseList(params);
  }

  loadSearch() {
    const { folderId } = this.state;
    this.props.getAllCases(folderId);
  }

  loadFolder() {
    const { projectId } = this.state;
    this.props.getAllFolders(projectId);
  }

  toggle() {
    const { checked } = this.state;
    const { caseList } = this.props;
    const { dataList = [] } = caseList;
    const checkedData = checked ? [] : dataList.map(x => x.id);
    this.setState({
      checked: !checked,
      checkedData,
    });
  }

  copy() {
    const { checkedData } = this.state;
    if (checkedData.length === 0) {
      Notification.error('Any item not selected');
    } else {
      this.setState({
        iscopy: true,
      });
    }
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

  handleMenuSelect(folderId) {
    this.setState({
      folderId,
      offset: 1,
      checkedData: [],
      checked: false,
    }, () => {
      this.loadCases();
      this.loadSearch();
    });
  }

  handlePageSelect(event, selectedEvent) {
    this.setState({
      offset: selectedEvent.eventKey,
    }, () => this.loadCases());
  }

  render() {
    const { folderId, projectId, checked, checkedData, iscopy, limit, offset } = this.state;
    const { allFolders = [], allCases = [], caseList = {}, isFetching } = this.props;
    const { dataList = [], total = 0 } = caseList;
    const totalPage = Math.ceil(total / limit);
    return (
      <main>
        <Breadcrumb>
          <BreadcrumbItem href="#">
            Home
          </BreadcrumbItem>
          <BreadcrumbItem active>
            <Link to={{pathname: `/project/${projectId}/folder`, state: Object.assign({}, this.props.location.state)}}>Folder List</Link>
          </BreadcrumbItem>
          <BreadcrumbItem active>
            Folder details
          </BreadcrumbItem>
        </Breadcrumb>
        <div className="copycase clearfix">
          <div className="copycase-num">
            <div className="left">File({allFolders.length})</div>
            <div className="main">Case({total})</div>
          </div>
          <ul className="copycase-menu dropdown-menu">
            {
              allFolders.map((x, idx) =>
                <MenuItem active={x.id.toString() === folderId.toString()} onClick={() => this.handleMenuSelect(x.id)} title={x.name} key={idx}>
                  <Glyphicon glyph="folder-open" />
                  <span className="foldername">{x.name}</span>
                </MenuItem>
              )
            }
          </ul>
          {
            dataList.length ?
              <div>
                <section className="copycase-opt">
                  <div className="col-xs-2">
                    <input type="checkbox" id="allcase" checked={checked} onClick={() => this.toggle()} />
                    <label htmlFor="allcase">{checked ? 'Cancel' : 'Select all'}</label>
                  </div>
                  <Button className="col-xs-2" onClick={() => this.copy()}>Copy</Button>
                  <SearchInput
                    groupClassName="col-xs-8 search"
                    options={allCases.map(x => x.projectSuiteNaming)}
                    onEnter={x => this.loadCases(x)}
                    query={x => this.loadCases(x)}
                  />
                </section>
                <section className="copycase-list">
                  {
                    dataList.map(x =>
                      <CaseItem
                        key={folderId.toString() + x.id}
                        checked={checked}
                        onChange={ischeck => this.checkItem(x.id, ischeck)}
                        id={x.id}
                        title={x.projectSuiteNaming}
                        description={x.description}
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
                  <Link to={{pathname: `/project/${projectId}/folder/${folderId}`, state: Object.assign({}, this.props.location.state)}}><span className="detail">Folder details</span></Link>
                </div>
              </div> : <div className="case-none">No data</div>
          }
          <CopyCaseModal
            folder={allFolders.filter(x => x.id !== folderId)}
            srcFolderId={folderId}
            projectId={projectId}
            suite={checkedData}
            show={iscopy}
            addFolder={(newFolder) => this.props.addFolderVirtual(newFolder)}
            onHide={() => this.setState({iscopy: false})}
          />
        </div>
        { isFetching ? <Spin /> : ''}
      </main>
    );
  }
}

CopyCase.propTypes = {
  getAllFolders: PropTypes.func,
  addFolderVirtual: PropTypes.func,
  getAllCases: PropTypes.func,
  getCaseList: PropTypes.func,
  params: PropTypes.object,
  location: PropTypes.object,
  allFolders: PropTypes.array,
  allCases: PropTypes.array,
  caseList: PropTypes.object,
  isFetching: PropTypes.bool,
};

const mapStateToProps = (state) => Object.assign({}, state.folder, state.suitecase);

export default connect(mapStateToProps, {
  getAllFolders,
  addFolderVirtual,
  getAllCases,
  getCaseList,
})(CopyCase);
