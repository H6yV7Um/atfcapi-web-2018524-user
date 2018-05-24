import React from 'react';
import { Table, Input, OverlayTrigger, Popover } from 'react-bootstrap';

class RequestBaseInfo extends React.Component {
  constructor(props) {
    super(props);
  }

  buildPopover(baseInfo, type) {
    return (
      <Popover id={type} title="" className="sql-pop">
        <Input
          type="textarea"
          name={type}
          value={baseInfo || ''}
          onChange={e => this.handleInputChange(e)}
        />
      </Popover>
    );
  }

  handleInputChange(e) {
    this.props.onChange(e);
  }

  buildPathInfoDiv() {
    const { baseInfo } = this.props;

    return (
      <Table bordered condensed hover >
        <tbody>
          <tr><td>Project:</td><td>{baseInfo.Project}</td></tr>
          <tr><td>Appid:</td><td>{baseInfo.Appid}</td></tr>
          <tr><td>serviceName:</td><td>{baseInfo.serviceName}</td></tr>
          <tr>
            <td>BasePath:</td>
            <td>
              <OverlayTrigger
                trigger="click"
                rootClose
                placement="bottom"
                overlay={this.buildPopover(baseInfo.BasePath, 'basePath')}
              >
                <input
                  className="input-text"
                  type="text"
                  name="basePath"
                  autoComplete="off"
                  value={baseInfo.BasePath ? baseInfo.BasePath : ''}
                  onChange={e => this.handleInputChange(e)}
                />
              </OverlayTrigger>
            </td>
          </tr>
          <tr>
            <td>Path:</td>
            <td>
              <OverlayTrigger
                trigger="click"
                rootClose
                placement="bottom"
                overlay={this.buildPopover(baseInfo.Path ? baseInfo.Path : '', 'paths')}
              >
                <input
                  className="input-text"
                  type="text"
                  name="paths"
                  autoComplete="off"
                  value={baseInfo.Path ? baseInfo.Path : ''}
                  onChange={e => this.handleInputChange(e)}
                />
              </OverlayTrigger>
            </td>
          </tr>
        </tbody>
      </Table>
    );
  }

  render() {
    const { baseInfo } = this.props;
    return (
      baseInfo ?
      (<div>
        <h4>{baseInfo.Method}&nbsp;&nbsp;</h4>
        {this.buildPathInfoDiv()}
        <hr />
      </div>)
      :
      <div>
        <h4>Method: No data</h4>
        <hr />
      </div>
    );
  }
}


RequestBaseInfo.propTypes = {
  baseInfo: React.PropTypes.object,
  onChange: React.PropTypes.func.isRequired,
};

export default RequestBaseInfo;
