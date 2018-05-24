import React from 'react';
import { Link } from 'react-router';
import { Breadcrumb, BreadcrumbItem, Table, Pagination, Input, Button } from 'react-bootstrap';
import { DeleteDialog, Notification } from 'atfcapi';
import fetchX from '../../vendor/Fetch';

class AuthList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      offset: 1,
      limit: 10,
      authType: '',
      data: [],
      totalCount: 0,
    };
  }

  componentDidMount() {
    this.getAuthList();
  }

  getAuthList() {
    const { authType, offset, limit } = this.state;
    const condi = {
      authType: authType,
      offset: offset - 1,
      limit: limit,
    };
    fetchX.get('/atfcapi/commonAuth/queryAuth', condi)
    .then(res => {
      if (res.code === '200') {
        this.setState({
          data: res.data.list || [],
          totalCount: res.data.total,
        });
      } else {
        Notification.error(res.msg || res.message);
      }
    }).catch(err => Notification.error(err.message));
  }

  handleChange(event) {
    this.setState({
      authType: event.target.value,
    });
  }

  handleSearch() {
    this.setState({
      offset: 1,
    }, this.getAuthList);
  }

  resetList() {
    this.setState({
      offset: 1,
      authType: '',
    }, this.getAuthList);
  }

  handlePageSelect(event, selectedEvent) {
    this.setState({
      offset: selectedEvent.eventKey,
    }, this.getAuthList);
  }

  handleDelete(data) {
    const condi = {
      id: data.id,
    };

    fetchX.get('/atfcapi/commonAuth/deleteAuth', condi)
    .then(res => {
      if (res.code === '200') {
        Notification.success(res.msg);
        window.location.reload();
      } else {
        Notification.error(res.msg || res.message);
        this.refs.delete.handleFail();
      }
    }).catch(err => Notification.error(err.message));
  }

  render() {
    const { data, offset, limit, totalCount, authType } = this.state;
    const totalPage = Math.ceil(totalCount / limit);
    const authDom = data.map( item =>
      <tr key={item.id}>
        <td>{item.id}</td>
        <td>{item.authType}</td>
        <td>
          <Link to={{pathname: `/auth/${item.id}`}}>Modify</Link>
          <a
            href="javascript:;"
            onClick={() => this.refs.delete.show({
              text: item.authType,
              data: item,
            })}
          >
            Delete
          </a>
        </td>
      </tr>
    );
    return (
      <div id="auth">
        <Breadcrumb>
          <BreadcrumbItem href="#">
            Home
          </BreadcrumbItem>
          <BreadcrumbItem active>
            Auth List
          </BreadcrumbItem>
        </Breadcrumb>
        <form className="form-horizontal api-filter">
          <Input
            type="text"
            label="Auth Type"
            labelClassName="col-xs-3"
            wrapperClassName="col-xs-9"
            value={authType}
            onChange={e => this.handleChange(e)}
          />
          <Button bsStyle="primary" onClick={() => this.handleSearch()}>Search</Button>
          <Button onClick={() => this.resetList()}>Reset</Button>
        </form>
        <Table bordered stripped hover condensed response className="auth-list">
          <thead>
            <tr>
              <th>ID</th>
              <th>AuthType</th>
              <th>Operation</th>
            </tr>
          </thead>
          <tbody>
            { data.length ? authDom :<tr><td colSpan="3">No data</td></tr> }
          </tbody>
        </Table>
        <Pagination
          prev
          next
          ellipsis
          boundaryLinks
          items={totalPage}
          maxButtons={10}
          activePage={offset}
          onSelect={this.handlePageSelect.bind(this)}
        />

        <DeleteDialog
          ref="delete"
          title="Auth"
          delete={target => this.handleDelete(target.data)}
        />
      </div>
    );
  }
}

export default AuthList;
