import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { Breadcrumb, BreadcrumbItem, Input, Button, Pagination, Table, Glyphicon } from 'react-bootstrap';
import Cookies from 'js-cookie';
import { DeleteDialog, Spin, Notification } from 'atfcapi';
import { getAllAlias, getDbList, deleteDbconfig } from '../../actions/databaseAction';

class DbConfigList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dbAlias: Cookies.get('dbAlias') || '', // DB别名，用户当前选择的，不做校验
      dbName: Cookies.get('dbName') || '', // 数据库名，用户输入，不做校验
      dbUrl: Cookies.get('dbUrl') || '', // DB连接字符串，用户输入，不做校验
      username: Cookies.get('username') || '', // 用户名，用户输入，不做校验
      sortType: 1, // 排序类型（0升序1降序）
      sortName: 'updated_at',
      showNewDbCfg: false, // 是否弹出新建DBConfig modal,当用户点击“增加”、“修改”按钮时改值为ture
      offset: 1, // 分页，起始页,请求接口时-1，分页点击页码时更改为相应的值offset:selectedEvent.eventKey，按某列排序时重新置为1，
      limit: 10, // 分页，每页条数
    };
  }

  componentDidMount() {
    this.props.getAllAlias(
      () => {},
      msg => Notification.error(msg)
    );
    this.handleSearch();
  }

  handleChange(e) {
    const target = e.target;
    const state = this.state;
    state[target.name] = target.value;
    this.setState(state);
  }

  handleSearch() {
    const { dbAlias, dbName, dbUrl, username, limit, offset, sortName, sortType } = this.state;
    const condi = {
      alias: dbAlias,
      name: dbName,
      url: dbUrl,
      username: username,
      limit: limit,
      offset: offset - 1,
      sortName: sortName,
      sortType: sortType,
    };
    Cookies.set('dbAlias', dbAlias);
    Cookies.set('dbName', dbName);
    Cookies.set('dbUrl', dbUrl);
    Cookies.set('username', username);
    this.props.getDbList(condi,
      () => {},
      msg => Notification.error(msg)
    );
  }

  resetList() {
    this.setState({
      dbAlias: '',
      dbName: '',
      dbUrl: '',
      username: '',
      limit: 10,
      offset: 1,
      sortName: 'updated_at',
      sortType: 1,
      loading: true,
    });
    setTimeout( () => {
      this.handleSearch();
    }, 1000);
  }

  handlePageSelect(event, selectedEvent) {
    this.setState({
      offset: selectedEvent.eventKey,
      loading: true,
    });
    setTimeout( () => {
      this.handleSearch();
    }, 1000);
  }

  handleDelete(item) {
    this.props.deleteDbconfig(item.id,
      () => {
        this.refs.delete.close();
        this.handleSearch();
      },
      msg => Notification.error(msg)
    );
  }

  handleSort(value) {
    const { sortName, sortType } = this.state;
    if (sortName === value) {
      this.setState({
        sortType: sortType ? 0 : 1,
      });
    } else {
      this.setState({
        sortName: value,
        sortType: 1,
        loading: true,
      });
    }
    setTimeout( () => {
      this.handleSearch();
    }, 1000);
  }

  buildDataTable() {
    const { limit, sortName, sortType } = this.state;
    const { dbInfo = {} } = this.props;
    const { databaseList: dblist = [], total = 0 } = dbInfo;
    const totalPage = Math.ceil(total / limit);
    let aliasActive;
    let timeActive;
    let aliasActType = 'down';
    let timeActType = 'down';
    if (sortName === 'alias') {
      aliasActive = 'on';
      timeActive = '';
      aliasActType = sortType ? `down` : `up`;
    } else {
      aliasActive = '';
      timeActive = 'on';
      timeActType = sortType ? `down` : `up`;
    }
    let list;
    if (dblist.length) {
      list = dblist.map( item =>
        <tr key={item.id}>
          <td>{item.alias}</td>
          <td>{item.env}</td>
          <td>{item.name}</td>
          <td title={item.url}>{item.url}</td>
          <td>{item.username}</td>
          <td>{item.updated_at}</td>
          <td>
            <Link to={{pathname: '/dbConfig/config/newDbConfig'}}>Add</Link>
            <a href="javascript:;" onClick={() => this.refs.delete.show({text: item.alias, data: item})}>
              Delete
            </a>
            <Link to={{pathname: `/dbConfig/config/${item.id}`}}>Modify</Link>
          </td>
        </tr>
      );
    } else {
      list = <tr className="no-data"><td colSpan="7">No data</td></tr>;
    }

    return (
      <div>
        <Table bordered condensed stripped>
          <thead>
            <tr>
              <th>
                <a href="javascript:;" className={aliasActive} onClick={() => this.handleSort('alias')}>
                  Alias
                  <Glyphicon glyph={`arrow-${aliasActType}`} />
                </a>
              </th>
              <th>Environment</th>
              <th>Database Name</th>
              <th>DB URL</th>
              <th>Username</th>
              <th>
                <a href="javascript:;" className={timeActive} onClick={() => this.handleSort('updated_at')}>
                  Last Updated
                  <Glyphicon glyph={`arrow-${timeActType}`} />
                </a>
              </th>
              <th>Operation</th>
            </tr>
          </thead>
          <tbody>
            {list}
          </tbody>
        </Table>
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
      </div>
    );
  }

  render() {
    const { dbAlias, dbName, dbUrl, username, loading } = this.state;
    const { aliasList } = this.props;
    const aliasOption = aliasList.map( (item, index) =>
      <option key={index} value={item}>{item}</option>
    );
    const dataTable = this.buildDataTable();
    const inputs = (<div>
      <Input
        type="select"
        value={dbAlias || 0}
        label="Alias"
        name="dbAlias"
        labelClassName="col-xs-3"
        wrapperClassName="col-xs-9"
        onChange={e => this.handleChange(e)}
      >
        <option value="">--</option>
        {aliasOption}
      </Input>
      <Input
        type="text"
        value={dbName || ''}
        label="Database Name"
        name="dbName"
        labelClassName="col-xs-3"
        wrapperClassName="col-xs-9"
        onChange={e => this.handleChange(e)}
      />
      <Input
        type="text"
        value={dbUrl || ''}
        label="DB URL"
        name="dbUrl"
        labelClassName="col-xs-3"
        wrapperClassName="col-xs-9"
        onChange={e => this.handleChange(e)}
      />
      <Input
        type="text"
        value={username || ''}
        label="Username"
        name="username"
        labelClassName="col-xs-3"
        wrapperClassName="col-xs-9"
        onChange={e => this.handleChange(e)}
      />
    </div>);
    return (
      <main id="dbConfig">
        <Breadcrumb>
          <BreadcrumbItem href="#">
            Home
          </BreadcrumbItem>
          <BreadcrumbItem active>
            DB Configuration List
          </BreadcrumbItem>
        </Breadcrumb>
        <div className="configList">
          <form className="form-horizontal">
            {inputs}
            <Button bsStyle="primary" disabled={loading} onClick={() => this.handleSearch()}>Search</Button>
            <Button disabled={loading} onClick={() => this.resetList()}>All</Button>
          </form>
          {dataTable}
          <DeleteDialog
            ref="delete"
            title="DB Configuration"
            delete={target => this.handleDelete(target.data)}
          />
        </div>
        {this.state.loading ? <Spin /> : ''}
      </main>
    );
  }
}

DbConfigList.propTypes = {
  dbInfo: PropTypes.object,
  aliasList: PropTypes.array,
  getAllAlias: PropTypes.func,
  getDbList: PropTypes.func,
  deleteDbconfig: PropTypes.func,
};

const mapStateToProps = (state) => Object.assign({}, state.database);

export default connect(mapStateToProps, {
  getAllAlias,
  getDbList,
  deleteDbconfig,
})(DbConfigList);
