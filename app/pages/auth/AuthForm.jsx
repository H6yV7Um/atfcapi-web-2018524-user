import React from 'react';
import { Table, Input, Button, Glyphicon } from 'react-bootstrap';
import { Notification } from 'atfcapi';
import fetchX from '../../vendor/Fetch';

class AuthForm extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      data: [],
      authId: props.authId,
      authType: 'No Auth',
      userDefine: '',
      loading: false,
    };
  }

  componentDidMount() {
    if (!this.state.authId) this.handleAdd();
  }

  componentWillUpdate(nextProps) {
    const { authType, data } = nextProps;
    const isSame = this.state.authType === authType && this.state.data === data;
    if ( !data || isSame ) return;
    this.setState({
      data: data,
      authType: authType,
    });
  }

  handleAdd() {
    const { data } = this.state;
    data.push({
      authKey: '',
      authValue: '',
    });
    this.setState({
      data: data,
    });
  }

  handleDelete(index) {
    const { data } = this.state;
    data.splice(index, 1);
    this.setState({
      data: data,
    });
  }

  changeAuthType(event) {
    this.setState({
      authType: event.target.value,
    });
  }

  handleUserDefine(event) {
    this.setState({
      userDefine: event.target.value,
    });
  }

  handleChange(event, index) {
    const {data} = this.state;
    data[index][event.target.name] = event.target.value;
    this.setState({
      data: data,
    });
  }

  async handleSubmit() {
    const {data, authId, authType, userDefine} = this.state;
    const condi = {
      operation: authId ? 2 : 1,
      id: authId,
      authType: authType === 'User Define' ? userDefine : authType,
      dataList: JSON.stringify(data),
    };
    this.setState({
      loading: true,
    });
    try {
      const { msg, code } = await fetchX.post('/atfcapi/commonAuth/operateAuth', condi);
      if (code === '200') {
        Notification.success(msg);
        this.context.router.push(`/auth/list`);
      } else {
        Notification.error(msg);
      }
    } catch (e) {
      throw e
    } finally {
      this.setState({
        loading: false,
      });
    }
  }

  render() {
    const { data, authId, authType, loading } = this.state;
    const isEdit = authId ? true : false;
    const userAuthType = authType === 'User Define' ?
      <Input
        type="text"
        wrapperClassName="col-xs-8"
        className="user-define"
        name="userDefine"
        placeholder="Please fill in auth type"
        onChange={e => this.handleUserDefine(e)}
      />
      :
      null;

    const authDetail = data.map( (item, index) =>
      <tr key={index}>
        <td>
          <input type="text" placeholder="please enter" name="authKey" className="input-text" value={item.authKey} onChange={(e) => this.handleChange(e, index)} />
        </td>
        <td>
          <input type="text" placeholder="please enter" name="authValue" className="input-text" value={item.authValue} onChange={(e) => this.handleChange(e, index)} />
        </td>
        <td><a href="javascript:;" onClick={() => this.handleDelete(index)}>Delete</a></td>
      </tr>
    );
    return (
      <div>
        <form className="form-horizontal api-filter">
          <Input type="select" label="Auth Type" disabled={isEdit} value={authType} onChange={this.changeAuthType.bind(this)} labelClassName="col-xs-4" wrapperClassName="col-xs-7">
            <option value="No Auth">No Auth</option>
            <option value="Auth Basic">Auth Basic</option>
            <option value="Digest Auth">Digest Auth</option>
            <option value="OAuth 1.0">OAuth 1.0</option>
            <option value="OAuth 2.0">OAuth 2.0</option>
            <option value="Hawk Authentication">Hawk Authentication</option>
            <option value="AWS Signature">AWS Signature</option>
            <option value="User Define">User Define</option>
          </Input>
          {userAuthType}
        </form>
        <div className="table-wrap">
          <Table striped bordered condensed hover className="table-form">
            <thead>
              <tr>
                <th>Auth Key</th>
                <th>Auth Value</th>
                <th>Operation</th>
              </tr>
            </thead>
            <tbody>
              { authDetail }
            </tbody>
          </Table>
          <a href="javascript:;" onClick={() => this.handleAdd()}>
            <Glyphicon glyph="plus" />
          </a>
        </div>
        <Button
          disabled={loading}
          bsStyle="primary"
          onClick={() => this.handleSubmit()}
        >
          {loading ? `Submit...` : `Submit`}
        </Button>
      </div>
    );
  }
}

AuthForm.propTypes = {
  authId: React.PropTypes.string,
  authType: React.PropTypes.string,
  data: React.PropTypes.array,
};

AuthForm.contextTypes = {
  router: React.PropTypes.object,
};

export default AuthForm;
