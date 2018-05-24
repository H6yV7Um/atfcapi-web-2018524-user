import React from 'react';
import { Breadcrumb, BreadcrumbItem } from 'react-bootstrap';
import { Notification } from 'atfcapi';
import ApiForm from './ApiForm';
import fetchX from '../../vendor/Fetch';

class EditApi extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pathId: props.params.pathId,
      data: {},
    };
  }

  componentDidMount() {
    this.getApiDetail();
  }

  getApiDetail() {
    const { pathId } = this.state;
    fetchX.get(`atfcapi/apiQuery/detail/${pathId}`)
    .then(json => {
      if (json.code === '200') {
        this.setState({ data: json.data });
      } else {
        Notification.error(json.msg || json.message);
      }
    }).catch(err => Notification.error(err.message));
  }

  render() {
    const { pathId, data } = this.state;
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
            {pathId}
          </BreadcrumbItem>
        </Breadcrumb>
        <ApiForm
          pathId={pathId}
          data={data}
        />
      </div>
    );
  }
}

EditApi.propTypes = {
  params: React.PropTypes.object,
};

export default EditApi;
