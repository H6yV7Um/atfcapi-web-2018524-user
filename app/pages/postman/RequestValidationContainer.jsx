import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import TabViewer from './TabViewer';

class RequestValidationContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      type: 'Assert',
    };
  }

  handleTypeChange(value) {
    this.setState({ type: value })
  }

  render() {
    const { type } = this.state;
    const { className, typeSource } = this.props;
    const classes = classNames({
      'request-validation-editor-container': true,
      [className]: !!className,
    });

    return (
      <div className={classes}>
        <TabViewer value={type} typeSource={typeSource} onChange={value => this.handleTypeChange(value)} />
        <div className="request-validation-editors">
          {/* {type === 'form-data' && <KeyValueForm onChange={value => this.props.onChange(value)} enableFiles />}
            {type === 'x-www-form-urlencoded' && <KeyValueForm onChange={value => this.props.onChange(value)} />}
            {type === 'raw' &&
            <CodeMirror
            height="300px"
            value=""
            onChange={() => {}}
            />
            }
          {type === 'binary' && <input type="file" />} */}
        </div>
      </div>
    );
  }
}

RequestValidationContainer.propTypes = {
  className: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  typeSource: PropTypes.array,
};

RequestValidationContainer.defaultProps = {
  onChange() {},
  typeSource: ['Assert', 'Var', 'Respone Schema', 'DB Verify'],
};

export default RequestValidationContainer;
