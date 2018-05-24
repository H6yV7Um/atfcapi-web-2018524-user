import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

class Toggle extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: this.props.checked,
    };
  }

  componentWillReceiveProps(nextProps) {
    if ('checked' in nextProps) {
      this.setState({
        checked: !!nextProps.checked,
      });
    }
  }

  setToggled(newToggledValue) {
    this.setState({
      checked: newToggledValue,
    });
    this.props.onChange(newToggledValue);
  }

  render() {
    const { checked } = this.state;
    const { className } = this.props;
    const classes = classNames({
      'atfc-toggle': true,
      'atfc-toggle-checked': !!checked,
      [className]: !!className,
    });
    return (
      <div
        className={classes}
        onClick={() => this.setToggled(!checked)}
      >
      </div>
    );
  }
}

Toggle.propTypes = {
  onChange: PropTypes.func,
  checked: PropTypes.bool,
  className: PropTypes.string,
};

Toggle.defaultProps = {
  onChange() {},
  checked: false,
};

export default Toggle;
