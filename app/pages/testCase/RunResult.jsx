import React from 'react';
import { Modal } from 'react-bootstrap';

class RunResult extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      url: '',
      msg: '',
    };

    this.show = (obj) => this.setState({
      show: true,
      url: obj.str,
    });
    this.close = () => this.setState({
      show: false,
    });
  }

  render() {
    const { show, url } = this.state;
    const body = url ?
    (<div>
      <p>Run successfully, please click on the following link to view operating results</p>
      <p><a href={url} target="_blank">{url}</a></p>
    </div>)
      :
    <p>Case in the background, over a period of time to switch to the Home Show Final operating results.</p>;
    return (
      <Modal show={show} onHide={this.close}>
        <Modal.Header closeButton>
          <Modal.Title>Run Result</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {body}
        </Modal.Body>
      </Modal>
    );
  }
}

export default RunResult;
