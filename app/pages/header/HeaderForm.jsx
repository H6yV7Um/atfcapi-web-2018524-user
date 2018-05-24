import React from 'react';
import { Input, Table } from 'react-bootstrap';

class HeaderForm extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      data: props.data,
    };
  }

  componentWillUpdate(nextProps) {
    const { data } = nextProps;
    if (this.state.data === data) return;
    this.setState({
      data: data,
    }, this.initForm);
  }

  initForm() {
    const { data } = this.state;
    if ( data.length === 0) this.handleAdd(0);
  }

  handleAdd(index) {
    const { data } = this.state;
    data.splice(index + 1, 0, {
      headerKey: 'Accept',
      headerValue: '',
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

  handleChange(event, index) {
    const target = event.target;
    const { data } = this.state;
    data[index][target.name] = target.value;
    this.setState({
      data: data,
    });
  }

  handleUserDefine(event, index) {
    const target = event.target;
    const { data } = this.state;
    data[index].userDefine = target.value;
    this.setState({
      data: data,
    });
  }

  handleSave() {
    const {data} = this.state;
    this.props.save(data);
  }

  buildHeaderKey(item, index) {
    return item.headerKey === 'UserDefine' ?
      <input type="text" name="headerKey" placeholder="please enter" autoFocus className="input-text" value={item.userDefine} onChange={e => this.handleUserDefine(e, index)} />
      :
      <Input type="select" name="headerKey" value={item.headerKey} onChange={e => this.handleChange(e, index)} >
        <option value="Accept">Accept</option>
        <option value="Accept-Encoding">Accept-Encoding</option>
        <option value="Accept-Language">Accept-Language</option>
        <option value="Authorization">Authorization</option>
        <option value="Cookie">Cookie</option>
        <option value="Content-Length">Content-Length</option>
        <option value="Content-Type">Content-Type</option>
        <option value="Referer">Referer</option>
        <option value="User-Agent">User-Agent</option>
        <option value="Host">Host</option>
        <option value="UserDefine">User Define</option>
      </Input>
    ;
  }

  render() {
    const { data } = this.state;
    const headerDetail = data.length ?
      data.map((item, index) =>
        <tr key={index}>
          <td>{index + 1}</td>
          <td>
            {this.buildHeaderKey(item, index)}
          </td>
          <td>
            <input type="text" name="headerValue" placeholder="please enter" className="input-text" value={item.headerValue} onChange={e => this.handleChange(e, index)} />
          </td>
          <td>
            <a href="javascript:;" onClick={() => this.handleAdd(index)}>Add</a>
            <a href="javascript:;" onClick={() => this.handleDelete(index)}>Delete</a>
          </td>
        </tr>
      ) :
      <tr>
        <td colSpan="3">No information display</td>
        <td>
          <a href="javascript:;" onClick={() => this.handleAdd(0)}>Add</a>
        </td>
      </tr>;
    return (
      <div>
        <Table striped bordered condensed hover className="table-form">
          <thead>
            <tr>
              <th>Sequence</th>
              <th width="180">Header Key</th>
              <th>Header value</th>
              <th>Operation</th>
            </tr>
          </thead>
          <tbody>
            {headerDetail}
          </tbody>
        </Table>
      </div>
    );
  }
}

HeaderForm.propTypes = {
  serviceId: React.PropTypes.string,
  data: React.PropTypes.array,
  save: React.PropTypes.func,
};


export default HeaderForm;
