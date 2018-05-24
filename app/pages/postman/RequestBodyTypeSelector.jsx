import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

class RequestBodyTypeSelector extends Component {
  constructor(props) {
    super(props);
  }

  handleClick(type) {
    if (type !== this.props.value) {
      this.props.onChange(type);
    }
  }

  bulidRadioGroup() {
    return this.props.typeSource.map((type, index) =>
      <span key={index} className="request-body-type-selector-button">
        <input
          type="radio"
          name="body-type-setting"
          id={type}
          readOnly
          onClick={() => this.handleClick(type)}
          checked={type === this.props.value}
        />
        <label htmlFor={type}>{type}</label>
      </span>
    );
  }

  render() {
    const { className } = this.props;
    const classes = classNames({
      'request-body-type-selector': true,
      [className]: !!className,
    });
    return (
      <div className={classes}>
        {this.bulidRadioGroup()}
      </div>
    );
  }
}

RequestBodyTypeSelector.propTypes = {
  className: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.string,
  typeSource: PropTypes.array,
};

RequestBodyTypeSelector.defaultProps = {
  onChange() {},
};

export default RequestBodyTypeSelector;
