import React from 'react';
import { Table } from 'react-bootstrap';
import { JSONSchemaView } from 'atfcapi';
import '../../components/JSONSchemaView/style.min.css';

class RequestParams extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      append: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.params && this.props.params.length && !this.state.append) {
      this.setState({ append: true });
      nextProps.params.forEach((item, index) => {
        const view = new JSONSchemaView(item.schema, 0);
        this.refs[`schemaview${index}`].appendChild(view.render());
      });
    }
  }

  buildParameters() {
    const { params } = this.props;
    return params ? params.map((item, index) =>
      <tr key={index}>
        <td className="text-navy">{item.name}</td>
        <td>{item.in}</td>
        <td>{item.description}</td>
        <td>{item.required ? 'YES' : 'NO'}</td>
        <td className="text-blue" ref={`schemaview${index}`} />
      </tr>
      )
      :
    <tr><td colSpan="5">No data</td></tr>;
  }

  render() {
    return (
      <div>
        <h4>Request</h4>
        <Table striped bordered condensed hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Located In</th>
              <th>Description</th>
              <th>Required</th>
              <th>Schema</th>
            </tr>
          </thead>
          <tbody>
            {this.buildParameters()}
          </tbody>
        </Table>
      </div>
    );
  }
}

RequestParams.propTypes = {
  params: React.PropTypes.array,
};

export default RequestParams;
