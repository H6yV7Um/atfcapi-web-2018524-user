import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Input, Button, Modal } from 'react-bootstrap';
import { ComboBox, Notification } from 'atfcapi';
import { saveFailedDetail } from '../../actions/caseActions';

class Detail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      memo: '',
    }
  }

  componentWillReceiveProps(nextProps) {
    const state = this.state;
    Object.assign(state, nextProps.source);
    this.setState(state);
  }

  handleChange(e) {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  /**
   * 保存
   */
  handleSave() {
    const {
      id,
      testrailLink,
      failedReason,
      fixedMethods,
      result,
      ticketToJira,
      category,
      state,
      memo,
    } = this.state;

    // 1. params 校验
    const params = {
      id,
      testrailLink,
      failedReason,
      fixedMethods,
      results: result,
      ticketToJira,
      failedCategory: category,
      state,
      memo,
    }

    // 2. 发起请求
    this.props.saveFailedDetail(params,
      msg => {
         this.props.onToggle();
         this.props.onSaved();
         Notification.success(msg);
      },
      msg => Notification.error(msg)
    )
  }

  buildInput({label = '', stateName = '', disabled = false}) {
    const value = this.state[stateName];
    return (disabled ?
      <Input
        type="text"
        label={label}
        labelClassName="col-xs-4"
        disabled
        value={value}
      />
      :
      <Input
        type="text"
        label={label}
        labelClassName="col-xs-4"
        value={value}
        name={stateName}
        onChange={e => this.handleChange(e)}
      />
    )
  }

  render() {
    const {
      category,
      result,
      state,
    } = this.state;
    const { failedCategory } = this.props;

    return (
      <Modal bsSize="large" backdrop="static" show={this.props.show} onHide={() => this.props.onToggle()} dialogClassName="log-modal">
        <Modal.Header closeButton>
          <Modal.Title>Detail</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <section className="case-detail">
            {this.buildInput({ label: 'Project Name', stateName: 'projectName', disabled: true })}
            {this.buildInput({ label: 'Version', stateName: 'versionName', disabled: true })}
            {this.buildInput({ label: 'Case Name', stateName: 'caseName', disabled: true })}
            {this.buildInput({ label: 'API Description', stateName: 'description', disabled: true })}
            {this.buildInput({ label: 'Method', stateName: 'method', disabled: true })}
            {this.buildInput({ label: 'Paths', stateName: 'path', disabled: true })}
            {this.buildInput({ label: 'Testrail Link', stateName: 'testrailLink' })}
            {this.buildInput({ label: 'Failed Reason', stateName: 'failedReason' })}
            {this.buildInput({ label: 'Fixed Methods', stateName: 'fixedMethods' })}
            <Input
              type="select"
              label="Result"
              labelClassName="col-xs-4"
              value={result}
              name="result"
              onChange={e => this.handleChange(e)}
            >
              <option value="0">未解决</option>
              <option value="1">解决</option>
              <option value="2">不解决</option>
            </Input>
            {this.buildInput({ label: 'Tickcet to jira', stateName: 'ticketToJira' })}
            {this.buildInput({ label: 'Count', stateName: 'count', disabled: true })}
            <div className="form-group">
              <label className="control-label col-xs-4">Failed Category</label>
              <ComboBox
                class={category === '' ? 'has-error': ''}
                value={category}
                options={failedCategory}
                onChange={value => this.setState({ category: value })}
                onSelect={value => this.setState({ category: value })}
                getOptionValue={option => option.failed_category}
              />
            </div>
            <Input
              type="select"
              label="State"
              labelClassName="col-xs-4"
              value={state}
              name="state"
              onChange={e => this.handleChange(e)}
            >
              <option value="0">in progress</option>
              <option value="1">closed</option>
            </Input>
            {this.buildInput({ label: 'Memo', stateName: 'memo' })}
          </section>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => this.props.onToggle()}>Cancel</Button>
          <Button bsStyle="primary" onClick={() => this.handleSave()}>Save</Button>
        </Modal.Footer>
      </Modal>

    )
  }
}

Detail.propTypes = {
  source: PropTypes.object,
  show: PropTypes.bool,
  failedCategory: PropTypes.array,
  saveFailedDetail: PropTypes.func,
  onToggle: PropTypes.func,
  onSaved: PropTypes.func,
}

const mapStateToProps = (state) => Object.assign({}, state.suitecase);

export default connect(mapStateToProps, {
  saveFailedDetail,
})(Detail);
