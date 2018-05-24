import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, Input, Table, OverlayTrigger, Popover } from 'react-bootstrap';
import { Notification } from 'atfcapi';
import JsonEditor from '../selectApi/JsonEditor';
import { getAllAlias } from '../../actions/databaseAction';
import fetchX from '../../vendor/Fetch';

const propTypes = {
  dbList: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  toggle: PropTypes.func,
  env: PropTypes.string,
  isDbVerify: PropTypes.bool,
  aliasList: PropTypes.array,
  getAllAlias: PropTypes.func,
};

const defaultProps = {
  dbList: [],
  onChange() {},
  toggle() {},
  env: localStorage.getItem('executeEnv'),
};

class DBVerify extends Component {
  constructor(props) {
    super(props);
    this.state = {
      limit: 1,
    };
  }

  componentDidMount() {
    this.props.getAllAlias(
      () => {},
      msg => Notification.error(msg)
    );
  }

  toggleOption() {
    const { isDbVerify } = this.props;
    this.props.toggle(!isDbVerify);
  }

  exec(index) {
    const { dbList, env } = this.props;
    if (dbList[index].real === '') {
      Notification.info('Please enter the actual value');
      return;
    }
    if (dbList[index].alias === 0) {
      Notification.info('Please select DB Alias');
      return;
    }
    if (!env) return;

    const condi = {
      alias: dbList[index].alias,
      env: env,
      sql: dbList[index].real,
    };

    fetchX.post('/atfcapi/database/execute', condi)
    .then(json => {
      if (json.code === '200') {
        // 对expected赋值
        dbList[index].expected = json.data || '';
        this.props.onChange(dbList);
      } else {
        Notification.error(json.msg || json.message);
      }
    }).catch(err => Notification.error(err.message));
  }

  add() {
    const { dbList } = this.props;
    dbList.push({
      alias: 0,
      expected: '',
      real: '',
    });
    this.props.onChange(dbList);
  }

  del(index) {
    const { dbList } = this.props;
    dbList.splice(index, 1);
    this.props.onChange(dbList);
  }

  handleChange(e, index) {
    const { dbList } = this.props;
    dbList[index].real = e.target.value;
    this.props.onChange(dbList);
  }

  handleSelect(e, index) {
    const { dbList } = this.props;
    dbList[index].alias = e.target.value;
    this.props.onChange(dbList);
  }

  handleExpChange(e, index) {
    const { dbList } = this.props;
    dbList[index].expected = e;
    this.props.onChange(dbList);
  }

  buildTable() {
    const { isDbVerify, dbList, aliasList } = this.props;
    if (!isDbVerify) return '';

    const thead = [ 'DB Alias', 'Expectations', 'The actual value', 'Operation'].map((item, index) => {
      return <th key={index}>{item}</th>;
    });

    const tbody = dbList.map((item, index) =>
      <tr key={index}>
        <td style={{'minWidth': '200px'}}>
          <Input
            type="select"
            name="alias"
            value={item.alias || 0}
            onChange={e => this.handleSelect(e, index)}
          >
            <option key="0" value={0}>----</option>
            {
              aliasList.map((k, idx) => <option key={idx} value={k}>{k}</option>)
            }
          </Input>
        </td>
        <td style={{'width': '250px'}}>
          <OverlayTrigger
            trigger="click"
            rootClose
            placement="top"
            overlay={this.buildPopover(item, index)}
          >
            <code className="api-path">{this.buildExpValue(item) || ''}</code>
          </OverlayTrigger>
        </td>
        <td>
          <Input
            type="text"
            name="real"
            value={item.real || ''}
            onChange={e => this.handleChange(e, index)}
          />
        </td>
        <td>
          <Button onClick={() => this.exec(index)}>
            EXEC
          </Button>
          <Button onClick={() => this.add()}>
            Add
          </Button>
          <Button onClick={() => this.del(index)}>
            Delete
          </Button>
        </td>
      </tr>
    );

    return tbody.length > 0 ?
      <Table striped bordered condensed hover className="assert-table dbverify-table">
        <thead>
          <tr>
            {thead}
          </tr>
        </thead>
        <tbody>
          {tbody}
        </tbody>
      </Table>
      : '';
  }

  buildPopover(data, index) {
    const expectedValue = this.buildExpValue(data);
    return (
      <Popover id={index} title={data.ADescription} className="sql-pop">
        <JsonEditor name={`dbverify-${index}`} height="300px" value={expectedValue} onChange={(e) => this.handleExpChange(e, index)} />
      </Popover>
    );
  }

  buildExpValue(data) {
    let expectedValue = '';
    if (typeof(data.expected) === 'object' && data.expected.length > 0) {
      expectedValue = JSON.stringify(data.expected, null, 2);
    } else if (typeof(data.expected) === 'string') {
      expectedValue = data.expected;
    }
    return expectedValue;
  }

  render() {
    const table = this.buildTable();
    return (
      <div>
        <Input
          type="checkbox"
          label="DB Verify"
          onChange={() => this.toggleOption()}
        />
        { table }
      </div>
    );
  }
}

DBVerify.propTypes = propTypes;

DBVerify.defaultProps = defaultProps;

const mapStateToProps = (state) => Object.assign({}, state.database);

export default connect(mapStateToProps, {
  getAllAlias,
})(DBVerify);
