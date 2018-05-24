import React from 'react';
import { Breadcrumb, BreadcrumbItem } from 'react-bootstrap';
import ApiForm from './ApiForm';

class NewApi extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {
        bodyType: 'json',
        serviceType: 1,
        schemes: 'http',
        method: 'get',
      },
    };
  }

  render() {
    const { data } = this.state;
    return (
      <div id="newApi">
        <Breadcrumb>
          <BreadcrumbItem href="#">
            Home
          </BreadcrumbItem>
          <BreadcrumbItem href="#/api/list">
            API List
          </BreadcrumbItem>
          <BreadcrumbItem active>
            New Api
          </BreadcrumbItem>
        </Breadcrumb>
        <ApiForm data={data} /> 
      </div>
    );
  }
}

NewApi.propTypes = {
  params: React.PropTypes.object,
};

export default NewApi;
