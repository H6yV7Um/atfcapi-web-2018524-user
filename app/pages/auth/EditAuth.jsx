import React from 'react';
import { Breadcrumb, BreadcrumbItem } from 'react-bootstrap';
import { Notification } from 'atfcapi';
import AuthForm from './AuthForm';
import fetchX from '../../vendor/Fetch';

class EditAuth extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      authId: props.params.authId,
      authType: ''
    };
  }

  componentDidMount() {
    this.getAuthInfo();
  }

  getAuthInfo() {
    const condi = {
      authId: this.state.authId
    };
    fetchX
      .get('/atfcapi/commonAuth/queryAuthDetail', condi)
      .then(res => {
        if (res.code === '200') {
          this.setState({
            data: res.data.dataList,
            authType: res.data.authType
          });
        } else {
          Notification.error(res.msg || res.message);
        }
      })
      .catch(err => Notification.error(err.message));
  }

  render() {
    const { data, authId, authType } = this.state;
    return (
      <div id="auth">
        <Breadcrumb>
          <BreadcrumbItem href="#">
            Home
          </BreadcrumbItem>
          <BreadcrumbItem href="#/auth/list">
            Auth List
          </BreadcrumbItem>
          <BreadcrumbItem active>
            {authId ? authId : `New Auth`}
          </BreadcrumbItem>
        </Breadcrumb>
        <AuthForm authId={authId} authType={authType} data={data} />
      </div>
    );
  }
}

EditAuth.propTypes = {
  params: React.PropTypes.object
};

export default EditAuth;
