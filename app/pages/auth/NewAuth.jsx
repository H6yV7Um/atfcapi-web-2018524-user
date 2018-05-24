import React from 'react';
import { Breadcrumb, BreadcrumbItem } from 'react-bootstrap';
import AuthForm from './AuthForm';

class NewAuth extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      authType: 'No Auth',
    };
  }

  render() {
    const { authType } = this.state;
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
            New Auth
          </BreadcrumbItem>
        </Breadcrumb>
        <AuthForm authType={authType} />
      </div>
    );
  }
}

NewAuth.propTypes = {
  params: React.PropTypes.object,
};

export default NewAuth;
