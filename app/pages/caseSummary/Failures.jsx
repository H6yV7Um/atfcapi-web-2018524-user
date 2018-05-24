import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Input, Button, Table, Pagination, Breadcrumb, BreadcrumbItem, Glyphicon } from 'react-bootstrap';
import { Notification } from 'atfcapi';
import { getFailedCategory, getFailedList } from '../../actions/caseActions';
import Detail from './Detail';


class Failures extends Component {
  constructor(props) {
    super(props);
    this.state = {
      limit: 10,
      offset: 1,
      showDetail: false,
      detail: {},
      path: '',
      category: -1,
      caseName: '',
      count: '',
      memo: '',
      sortType: 0, // 用于排序：0表示升序，1表示降序
      sortName: '', // 排序字段名称
    }
  }

  componentDidMount() {
    this.props.getFailedCategory();
    this.handleSearch();
  }

  reset() {
    this.setState({
      limit: 10,
      offset: 1,
      path: '',
      category: -1,
      caseName: '',
      count: '',
      memo: '',
      sortType: 0,
      sortName: '',
    }, this.handleSearch);
  }

  /**
   * input & select 的change事件 根据表单元素的name赋值
   */
  handleChange(e) {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  /**
   * 排序
   */
  handleSort(name, type) {
    const { sortName, sortType } = this.state;
    if (sortName === name && type === sortType) {
      // 取消排序
      this.setState({ sortName: '', sortType: 0 }, this.handleSearch);
    } else {
      this.setState({ sortName: name, sortType: type }, this.handleSearch);
    }
  }

  /**
   * 列表搜索
   */
  handleSearch() {
    const { limit, offset, category, path, caseName, count, memo, sortType, sortName } = this.state;
    const params = {
      limit,
      offset: offset - 1,
      category,
      path,
      caseName,
      memo,
      sortType,
      sortName,
    }
    // 1. param 校验
    if (count !== '') {
      params.count = count;
      if (!/^\d+$/.test(count)) {
        Notification.error('The \'Count\' must be an integer');
        return;
      } else {
        params.count = parseInt(count, 10);
      }
    }

    // 2. 发起请求
    this.props.getFailedList(params,
      () => {
         // success
      },
      msg => Notification.error(msg)
    )
  }

  handlePageSelect(event, selectedEvent) {
    this.setState({
      offset: selectedEvent.eventKey,
    }, this.handleSearch);
  }

  /**
   * case列表
   */
  buildList() {
    const { failedList, failedCategory, totalCount } = this.props;
    const stateArray = ['progress', 'closed'];
    const resultArray = ['未解决', '解决', '不解决'];
    const tr = totalCount
      ? failedList.map((item, index) => {
          // 根据id找到名称
          if (parseInt(item.category, 10)) {
            item.category = failedCategory.find(x => x.id === item.category).failed_category;
          }

          return (
            <tr key={index}>
              <td>{item.projectName}</td>
              <td>{item.versionName}</td>
              <td><a href="javascript:;" onClick={() => this.setState({ showDetail: true, detail: item })}>{item.caseName}</a></td>
              <td>{item.description}</td>
              <td>{item.method}</td>
              <td><a href={item.testrailLink} target="_blank">{item.testrailLink}</a></td>
              <td>{item.failedReason}</td>
              <td>{item.fixedMethods}</td>
              <td>{item.path}</td>
              <td>{resultArray[item.result]}</td>
              <td><a href={`//${item.ticketToJira}`} target="_blank">{item.ticketToJira}</a></td>
              <td>{item.count}</td>
              <td>{item.category}</td>
              <td>{stateArray[item.state]}</td>
            </tr>
          )
        }
      )
      : <tr className="no-data"><td colSpan="14">No data</td></tr>
    return tr;
  }

  /**
   * select选项
   */
  buildOptions(source) {
    return source.map((item, index) =>
      <option key={index} value={item.value}>{item.name}</option>
    )
  }

  /**
   * 生成带排序的表头
   * @type {String}
   */
  buildSortColumn({ label = '', sortby = ''}) {
    const { sortName, sortType } = this.state;
    return (
      <span className="column-sorter">
        {label}
        <div>
          <Glyphicon glyph="triangle-top" className={sortType === 0 && sortby === sortName ? 'on' : 'off'} onClick={() => this.handleSort(sortby, 0)} />
          <Glyphicon glyph="triangle-bottom" className={sortType === 1 && sortby === sortName ? 'on' : 'off'} onClick={() => this.handleSort(sortby, 1)} />
        </div>
      </span>
    )
  }

  render() {
    const { showDetail, detail, count, limit, offset, category } = this.state;
    const { failedCategory, isFetching, totalCount } = this.props;
    const totalPage = Math.ceil(totalCount / limit);
    return (
      <main>
        <Breadcrumb>
          <BreadcrumbItem href="#">
            Home
          </BreadcrumbItem>
          <BreadcrumbItem active>
            Case Failed List
          </BreadcrumbItem>
        </Breadcrumb>
        <section className="form-filter">
          <Input
            type="select"
            label="Failed Category"
            name="category"
            labelClassName="col-xs-4"
            wrapperClassName="col-xs-8"
            groupClassName="col-xs-4"
            value={category}
            onChange={e => this.handleChange(e)}
          >
            <option value="0">----</option>
            {this.buildOptions(failedCategory.map(category => {
              return {
                name: category.failed_category,
                value: category.id,
              }
            }))}
          </Input>
          <Input
            type="text"
            label="API Path"
            name="path"
            labelClassName="col-xs-4"
            wrapperClassName="col-xs-8"
            groupClassName="col-xs-4"
            onChange={e => this.handleChange(e)}
          />
          <Input
            type="text"
            label="Case Name"
            name="caseName"
            labelClassName="col-xs-4"
            wrapperClassName="col-xs-8"
            groupClassName="col-xs-4"
            onChange={e => this.handleChange(e)}
          />
          <Input
            type="text"
            label="Count"
            name="count"
            labelClassName="col-xs-4"
            wrapperClassName={count !== '' && !/^\d+$/.test(count) ? 'col-xs-8 has-error': 'col-xs-8'}
            groupClassName="col-xs-4"
            onChange={e => this.handleChange(e)}
          />
          <Input
            type="text"
            label="Memo"
            name="memo"
            labelClassName="col-xs-4"
            wrapperClassName="col-xs-8"
            groupClassName="col-xs-4"
            onChange={e => this.handleChange(e)}
          />
          <div className="form-group col-xs-4">
            <div className="col-xs-12">
              <Button className="api-operate" disabled={isFetching} onClick={() => this.reset()} >All</Button>
              <Button className="api-operate" disabled={isFetching} bsStyle="primary" onClick={() => this.handleSearch()}>{ isFetching ? 'Searching...' : 'Search'}</Button>
            </div>
          </div>
        </section>
        <section className="case-fail-list">
          <Table>
            <thead>
              <tr>
                <th>
                  {this.buildSortColumn({ label: 'Project Name', sortby: 'projectName'})}
                </th>
                <th>Version</th>
                <th>
                  {this.buildSortColumn({ label: 'Case Name', sortby: 'caseName'})}
                </th>
                <th>API Description</th>
                <th>API Method</th>
                <th>TestRail Link</th>
                <th>Failed Reason</th>
                <th>Fixed Mehtods</th>
                <th>{this.buildSortColumn({ label: 'Paths', sortby: 'path'})}</th>
                <th>Result</th>
                <th>Ticket to Jira</th>
                <th>Count</th>
                <th>Failed Category</th>
                <th>State</th>
              </tr>
            </thead>
            <tbody>
              {this.buildList()}
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
              activePage={offset}
              onSelect={this.handlePageSelect.bind(this)}
            />
            <span>Total {totalPage} pages / {totalCount} records</span>
          </div>
        </section>
        <Detail source={detail} show={showDetail} onToggle={() => this.setState({ showDetail: !showDetail })} onSaved={() => this.handleSearch()}></Detail>
      </main>
    )
  }
}

Failures.propTypes = {
  getFailedCategory: PropTypes.func,
  getFailedList: PropTypes.func,
  failedList: PropTypes.array,
  totalCount: PropTypes.number,
  failedCategory: PropTypes.array,
  isFetching: PropTypes.bool,
}

const mapStateToProps = (state) => Object.assign({}, state.suitecase);

export default connect(mapStateToProps, {
  getFailedCategory,
  getFailedList,
})(Failures);
