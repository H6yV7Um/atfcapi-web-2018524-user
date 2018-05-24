import React from 'react';
import { Input, Table, OverlayTrigger, Popover } from 'react-bootstrap';
import { headers as baseHeaders } from '../../vendor/util';

const propTypes = {
  keyValue: React.PropTypes.array,
  headerArr: React.PropTypes.array,
  onChange: React.PropTypes.func,
};

const defaultProps = {
  keyValue: [],
  headerArr: [],
  onChange() {},
};

class Header extends React.Component {
  constructor(props) {
    super(props);
  }

  setHeader(keyValue) {
    const headers = keyValue.map(x => {
      return {
        [x.key]: x.value,
      };
    });
    this.props.onChange(JSON.stringify(headers));
  }

  handleChange(e, index) {
    const { value, name} = e.target;
    const { keyValue } = this.props;
    keyValue[index][name] = value;
    this.setHeader(keyValue);
  }

  add(idx) {
    const { keyValue } = this.props;
    keyValue.splice(idx + 1, 0, {
      key: baseHeaders[0],
      value: '',
    });
    this.setHeader(keyValue);
  }

  addEmpty() {
    this.add(baseHeaders[0], '', 0);
  }

  del(idx) {
    const { keyValue } = this.props;
    keyValue.splice(idx, 1);
    this.setHeader(keyValue);
  }

  buildPopover(value, idx) {
    return (
      <Popover id={`header-${idx}`} title="" className="sql-pop">
        <Input
          type="textarea"
          name="value"
          value={value || ''}
          onChange={e => this.handleChange(e, idx)}
        />
      </Popover>
    );
  }

  render() {
    const { keyValue } = this.props;
    // 基础header 与 接口返回的header 合并
    let headers = baseHeaders.concat(this.props.headerArr.map(x => Object.keys(x)[0]));
    // 去重
    headers = [...new Set(headers)];
    const selectOpt = headers.map((x, idx) => {
      return (<option key={idx} value={x}>{x}</option>);
    });
    const tbody = keyValue.length ?
      keyValue.map((x, idx) => {
        return (
          <tr key={idx}>
            <td>
              {headers.includes(x.key) && x.key !== 'User Define' ?
                <Input
                  type="select"
                  name="key"
                  value={x.key}
                  onChange={e => this.handleChange(e, idx)}
                >
                  {selectOpt}
                </Input>
                :
                <Input
                  type="text"
                  name="key"
                  value={x.key}
                  onChange={e => this.handleChange(e, idx)}
                />
              }
            </td>
            <td>
              <OverlayTrigger
                ref="OverlayTrigger"
                trigger="click"
                rootClose
                placement="bottom"
                overlay={this.buildPopover(x.value, idx)}
              >
                <Input
                  type="text"
                  name="value"
                  value={x.value}
                  onChange={e => this.handleChange(e, idx)}
                />
              </OverlayTrigger>
            </td>
            <td>
              <a href="javascript:;" onClick={() => this.add(idx)}>Add</a>
              <a href="javascript:;" onClick={() => this.del(idx)}>Delete</a>
            </td>
          </tr>
        );
      })
      :
     (<tr>
       <td colSpan="2">No data</td>
       <td>
         <a href="javascript:;" onClick={() => this.addEmpty()}>Add</a>
       </td>
     </tr>);
    return (
      <div>
        <h4>Header</h4>
        <Table striped bordered condensed hover >
          <thead>
            <tr>
              <th>Header Key</th>
              <th>Header Value</th>
              <th>Operation</th>
            </tr>
          </thead>
          <tbody>
            { tbody }
          </tbody>
        </Table>
        <hr />
      </div>
    );
  }
}

Header.propTypes = propTypes;

Header.defaultProps = defaultProps;

export default Header;
