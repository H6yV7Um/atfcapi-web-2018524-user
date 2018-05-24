import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button, Table, Input, OverlayTrigger, Popover } from 'react-bootstrap';
import { Notification, DeleteDialog } from 'atfcapi';
import { getAllAlias } from '../../actions/databaseAction';

class Precondition extends Component {
  constructor(props) {
    super(props);
    this.state = {
      preList: props.preList || [],
      suiteNames: props.suiteNames || [],
      dbAlias: '',
      envId: props.envId, // 默认环境
    };
  }

  componentDidMount() {
    this.loadDbAliasList();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      envId: nextProps.envId, // 默认环境
      preList: nextProps.preList || [],
      suiteNames: nextProps.suiteNames || [],
    });
  }

  loadDbAliasList() {
    this.props.getAllAlias(
      () => this.setState({ dbAlias: this.props.aliasList[0] || '' }),
      msg => Notification.error(msg)
    );
  }

  handleAddPre() {// 在PreList之后插入一个前置条件，index = preList.length + 1
    const { preList, suiteNames } = this.state;
    const preLen = preList.length;
    preList.splice(preLen, 0, {
      key: 'caseName',
      value: suiteNames.length ? suiteNames[0].id : 0,
      env: '-1',
    });
    this.setState({
      preList,
    });
    this.props.onChange(preList);
  }

  handleInsertPre(index) {// 在当前index之后插入一个前置条件，index = index + 1
    const { preList, suiteNames } = this.state;
    preList.splice(index + 1, 0, {
      key: 'caseName',
      value: suiteNames.length ? suiteNames[0].id : 0,
      env: '-1',
    });
    this.setState({
      preList,
    });
    this.props.onChange(preList);
  }

  handleDeletePre(index) {// 删除当前index前置条件
    const { preList } = this.state;
    preList.splice(index, 1);
    this.setState({
      preList,
    });
    this.refs.delete.close();
    this.props.onChange(preList);
  }

  buildKeySelect(item, index) {
    return (
      <Input type="select" name="key" value={item.key} onChange={e => this.handleChange(e, index)} >
        <option value="caseName">caseName</option>
        <option value="shellID">shellID</option>
        <option value="DBScript">DBScript</option>
      </Input>
    );
  }

  buildEnvSelect(item, index) {
    const { envList, aliasList } = this.props;
    const envOption = envList.map( k =>
      <option key={k.envId} value={k.envId}>{k.envName}</option>
    );
    const aliasOption = aliasList.map( k =>
      <option key={k} value={k}>{k}</option>
    );
    let input;
    if (item.key === 'caseName') {
      input = (<Input disabled type="select" name="env" value={item.env} onChange={e => this.handleChange(e, index)} >
        <option value="-1" disabled>--</option>
      </Input>);
    } else if (item.key === 'shellID') {
      input = (<Input type="select" name="env" value={item.env} onChange={e => this.handleChange(e, index)} >
        { envOption }
      </Input>);
    } else {
      input = (<Input type="select" name="env" value={item.env} onChange={e => this.handleChange(e, index)} >
        { aliasOption }
      </Input>);
    }
    return input;
  }

  buildPreValue(item, index) {
    const { suiteNames } = this.state;
    // 将preList中的suiteName替换成suiteID
    if (item.key === 'caseName') {
      for (let j = 0; j < suiteNames.length; j++) {
        if (item.value === suiteNames[j].projectSuiteNaming) {
          item.value = suiteNames[j].id;
        }
      }
    }
    const suiteNameOpts = suiteNames.length ?
    suiteNames.map( k =>
      <option key={k.id} value={k.id}>{k.projectSuiteNaming}</option>
    )
    :
    <option key="0" value={0}>--</option>;

    let preValue;
    if (item.key === 'caseName') {
      preValue = (
        <Input type="select" disabled={!suiteNames.length ? true : false} name="suiteNameValue" value={item.value} onChange={e => this.handleChange(e, index)} >
          {suiteNameOpts}
        </Input>
      );
    } else if (item.key === 'shellID') {
      preValue = (
        <Input
          type="text"
          name="shellIDValue"
          placeholder="Please fill shellID, only support digital"
          value={item.value}
          onChange={e => this.handleChange(e, index)}
          className="input-text"
        />
      );
    } else {
      preValue = (
        <OverlayTrigger
          ref="OverlayTrigger"
          trigger="click"
          rootClose
          placement="bottom"
          overlay={this.buildPopover(item, index)}
        >
          <Input
            type="text"
            name="dbScriptValue"
            placeholder="Please fill out the sql statement"
            value={item.dbScriptValue || item.value}
            onChange={e => this.handleChange(e, index)}
            className="input-text"
          />
        </OverlayTrigger>
      );
    }
    return preValue;
  }

  buildPopover(item, index) {
    return (
      <Popover id={index} title={item.env} className="sql-pop">
        <Input
          type="textarea"
          name="dbScriptValue"
          value={item.dbScriptValue || item.value}
          onChange={e => this.handleChange(e, index)}
        />
        <Button onClick={() => this.hideOverlay()} bsStyle="primary">Save</Button>
        <Button onClick={() => this.hideOverlay()}>Cancle</Button>
      </Popover>
    );
  }

  hideOverlay() {
    this.refs.OverlayTrigger.hide();
  }

  handleChange(event, index) {
    const target = event.target;
    const { preList, envId, dbAlias } = this.state;
    if (target.name === 'suiteNameValue') {
      preList[index].value = parseInt(target.value, 10);
    } else if (target.name === 'shellIDValue') {
      const reg = /^[0-9]+$/;
      if (!reg.test(target.value) && target.value !== '') {
        Notification.error('shellID only support digital!');
        return;
      }
      preList[index].value = target.value;
    } else if (target.name === 'dbScriptValue') {
      preList[index][target.name] = target.value;
      preList[index].value = target.value;
    } else if (target.name === 'key' && target.value === 'shellID') {
      preList[index][target.name] = target.value;
      preList[index].env = envId;
      preList[index].value = '';
    } else if (target.name === 'key' && target.value === 'DBScript') {
      preList[index][target.name] = target.value;
      preList[index].env = dbAlias;
      preList[index].value = '';
    } else {
      preList[index][target.name] = target.value;
    }

    this.setState({
      preList,
    });
    if (target.name === 'suiteNameValue') {
      this.props.onChange(preList);
    }
  }

  buildPreList() {
    const { preList } = this.state;
    const tbody = preList.length > 0 ?
      preList.map( (item, index) =>
        <tr key={index}>
          <td>{this.buildKeySelect(item, index)}</td>
          <td>{this.buildEnvSelect(item, index)}</td>
          <td>{this.buildPreValue(item, index)}</td>
          <td>
            <a href="javascript:;" onClick={() => this.handleInsertPre(index)}>Add</a>
            <a href="javascript:;" onClick={() => this.refs.delete.show({text: 'Precondition' + item.key, data: index})}>Delete</a>
          </td>
        </tr>)
        :
      <tr><td colSpan="4">No data</td></tr>;

    return (
      <div>
        <Table striped bordered condensed hover >
          <thead>
            <tr>
              <th>Key</th>
              <th>Env</th>
              <th>Value</th>
              <th>Operation</th>
            </tr>
          </thead>
          <tbody>
            {tbody}
          </tbody>
        </Table>
      </div>
    );
  }

  render() {
    return (
      <div>
        <div className="api-requset-title"><h4>Precondition</h4> <Button onClick={() => this.handleAddPre()}>Add</Button></div>
        <div>{this.buildPreList()}</div>
        <DeleteDialog
          ref="delete"
          title="Precondition"
          delete={target => this.handleDeletePre(target.data)}
        />
      </div>
    );
  }
}

Precondition.propTypes = {
  preList: PropTypes.array,
  envList: PropTypes.array,
  suiteNames: PropTypes.array,
  envId: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  aliasList: PropTypes.array,
  getAllAlias: PropTypes.func,
};

const mapStateToProps = (state) => Object.assign({}, state.database);

export default connect(mapStateToProps, {
  getAllAlias,
})(Precondition);
