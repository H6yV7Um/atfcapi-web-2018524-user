import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { Notification } from 'atfcapi';
import HeaderForm from './HeaderForm';
import fetchX from '../../vendor/Fetch';


class NewHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      type: 'ADD',
      params: {},
      data: [],
      loading: false,
    };

    this.show = ({type, params}) => this.setState({
      show: true,
      type: type || 'ADD',
      params: params,
    }, this.getHeaderDetail);

    this.close = () => this.setState({
      show: false,
    });
  }

  async getHeaderDetail() {
    const { type, params } = this.state;
    if (type === 'ADD') {
      this.setState({
        data: [],
      });
      return;
    }
    try {
      const { code, data, msg } = await fetchX.get('/atfcapi/commonHeader/queryHeaderDetails', { serviceId: params.serviceId });
      if (code === '200') {
        this.setState({ data });
      } else {
        Notification.error(msg);
      }
    } catch (e) {
      throw e;
    }
  }

  async handleSubmit(data) {
    let url;
    const { type, params } = this.state;
    const condi = {
      serviceId: params.serviceId,
      dataList: JSON.stringify(data),
    };
    if (type === 'ADD') {
      url = `/atfcapi/commonHeader/insertHeader`;
    } else {
      url = `/atfcapi/commonHeader/updateHeader`;
    }
    this.setState({
      loading: true,
    });
    try {
      const { code, msg } = await fetchX.post(url, condi);
      this.close();
      this.props.refresh();
      Notification[ code === '200' ? 'success' : 'error'](msg);
    } catch (e) {
      throw e;
    }
    this.setState({
      loading: false,
    });
  }

  render() {
    const { loading, data } = this.state;
    return (
      <Modal backdrop="static" dialogClassName="header-form" bsSize="lg" show={this.state.show} onHide={this.close}>
        <Modal.Header closeButton>
          <Modal.Title>New Header</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <HeaderForm ref="headerForm" data={data} save={value => this.handleSubmit(value)} />
        </Modal.Body>
        <Modal.Footer>
          <Button
            disabled={loading}
            bsStyle="primary"
            onClick={() => this.refs.headerForm.handleSave()}
          >
            { loading ? `Submit...` : `Submit` }
          </Button>
          <Button onClick={this.close}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

NewHeader.propTypes = {
  refresh: React.PropTypes.func,
};

export default NewHeader;
