import React from 'react';
import { Table } from 'react-bootstrap';
import { CodeMirror } from 'atfcapi'

const propTypes = {
  apiDetail: React.PropTypes.object,
  sendBody: React.PropTypes.string,
  headerArr: React.PropTypes.array,
  onBodyPreChange: React.PropTypes.func.isRequired,
  onBodyChange: React.PropTypes.func.isRequired,
};

const defaultProps = {
  apiDetail: {},
  sendBody: '',
  headerArr: [],
  onBodyPreChange() {},
  onBodyChange() {},
};

class Body extends React.Component {
  constructor(props) {
    super(props);
  }

  handleBodyPreChange(e) {
    const { name, value } = e.target;

    this.props.apiDetail[name] = value;
    this.props.onBodyPreChange(this.props.apiDetail);
  }

  render() {
    const { apiDetail, headerArr, sendBody } = this.props;
    const trArr = ['Method', 'Iface', 'Ver', 'Rpc', 'Req'];
    // 1.代表http 2.代表SOA 3.Thrift 4：Long_Poll
    const serviceType = parseInt(apiDetail.serviceType, 10);
    const bodyPreInfo = (serviceType === 2 || serviceType === 3) ?
      <div>
        <Table bordered condensed hover >
          <tbody>
            {
              trArr.map((x, idx) =>
                <tr key={idx}>
                  <td>{`${x}:`}</td>
                  <td><input className="input-text" type="text" name={`body${x}`} value={apiDetail[`body${x}`]} onChange={e => this.handleBodyPreChange(e)} /></td>
                </tr>
              )
            }
          </tbody>
        </Table>
        <h4>Args</h4>
      </div>
      : '';

    const aceJsonMode = headerArr.some(x => x['Content-Type'] !== undefined && x['Content-Type'].includes('application/json'));

    return (
      <div>
        <h4>Body</h4>
        {bodyPreInfo}
        <CodeMirror
          height="200px"
          value={sendBody}
          onChange={value => this.props.onBodyChange(value)}
          options={{
            mode: aceJsonMode ? 'javascript' : 'textile'
          }}
        />
        <hr />
      </div>
    );
  }
}

Body.propTypes = propTypes;

Body.defaultProps = defaultProps;

export default Body;
