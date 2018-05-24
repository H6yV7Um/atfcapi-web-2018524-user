import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { CodeMirror } from 'atfcapi';
import RequestBodyTypeSelector from './RequestBodyTypeSelector';
import KeyValueForm from './KeyValueForm';

class RequestBodyContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      type: 'form-data',
    };
  }

  handleTypeChange(value) {
    this.setState({ type: value })
  }

  render() {
    const { type } = this.state;
    const { className, typeSource } = this.props;
    const classes = classNames({
      'request-body-editor-container': true,
      [className]: !!className,
    });

    return (
      <div className={classes}>
        <RequestBodyTypeSelector value={type} typeSource={typeSource} onChange={value => this.handleTypeChange(value)} />
        <div className="request-body-editors">
          {type === 'form-data' && <KeyValueForm onChange={value => this.props.onChange(value)} enableFiles />}
          {type === 'x-www-form-urlencoded' && <KeyValueForm onChange={value => this.props.onChange(value)} />}
          {type === 'raw' &&
            <CodeMirror
              height="300px"
              value=""
              onChange={() => {}}
            />
          }
          {type === 'binary' && <input type="file" />}
        </div>
      </div>
    );
  }
}

RequestBodyContainer.propTypes = {
  className: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  typeSource: PropTypes.array,
};

RequestBodyContainer.defaultProps = {
  onChange() {},
  typeSource: ['form-data', 'x-www-form-urlencoded', 'raw', 'binary'],
};

export default RequestBodyContainer;
