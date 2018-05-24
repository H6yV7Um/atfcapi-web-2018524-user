import React from 'react';
import { Table, Panel, PanelGroup, Glyphicon } from 'react-bootstrap';
import { Notification } from 'atfcapi';
import fetchX from '../../vendor/Fetch';

const propTypes = {
  preList: React.PropTypes.array,
  projectId: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number
  ]),
  caseId: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number
  ])
};

const defaultProps = {
  preList: [],
  projectId: '',
  caseId: ''
};

class VariableValue extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      variables: []
    };
  }

  componentWillMount() {
    this.loadVariables();
  }

  loadVariables() {
    const { projectId, caseId, preList } = this.props;
    // 防止没有获取到caseId时请求该接口报错
    if (!caseId) return;
    // 过滤出preList中的suiteName项，获取他们的变量
    const caseIds = preList.filter(x => x.key === 'caseName').map(x => x.value);
    caseIds.push(caseId);

    const condi = {
      projectId,
      suiteIds: caseIds,
      offset: 0,
      limit: 20
    };

    fetchX
      .get('/atfcapi/sendRequest/getVariables', condi)
      .then(json => {
        if (json.code === '200') {
          if (json.data.projectInfoDto) {
            // 将含有'&port'、'&host'的项屏蔽掉
            const projectInfoDto = json.data.projectInfoDto;
            const variables = projectInfoDto.filter(
              x =>
                !x.variableName.includes('&port') &&
                !x.variableName.includes('&host')
            );
            this.setState({
              variables
            });
          }
        } else {
          Notification.error(json.msg || json.message);
        }
      })
      .catch(err => Notification.error(err.message));
  }

  buildVariablesTable() {
    const { variables } = this.state;
    const tbody = variables.length
      ? variables.map((item, index) => (
        <tr key={index}>
          <td>{item.variableName}</td>
          <td>
            {item.type === 2
              ?
                <input
                  className="input-text"
                  type="text"
                  name="variableValue"
                  value={item.variableValue || ''}
                  onChange={e => this.handleVarChange(e, index)}
                />
            : item.variableValue || ''}
          </td>
        </tr>
        ))
      : <tr><td colSpan="2">No data</td></tr>;
    return (
      <PanelGroup defaultActiveKey="0" accordion>
        <Panel
          header={<span>Variable<Glyphicon glyph="menu-down" /></span>}
          eventKey="1"
        >
          <Table striped bordered condensed hover>
            <thead>
              <tr>
                <th>Variable</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {tbody}
            </tbody>
          </Table>
        </Panel>
      </PanelGroup>
    );
  }

  handleVarChange(e, index) {
    const target = e.target;
    const { variables } = this.state;
    variables[index].variableValue = target.value;

    const condi = {
      variableValue: variables[index].variableValue
    };

    fetchX
      .put(`/atfcapi/sendRequest/updateVariable/${variables[index].id}`, condi)
      .then(json => {
        if (json.code === '200') {
          this.setState({
            variables: variables
          });
        } else {
          Notification.error(json.msg || json.message);
        }
      })
      .catch(err => Notification.error(err.message));
  }

  render() {
    return (
      <div className="var-info-container">{this.buildVariablesTable()}</div>
    );
  }
}

VariableValue.propTypes = propTypes;

VariableValue.defaultProps = defaultProps;

export default VariableValue;
