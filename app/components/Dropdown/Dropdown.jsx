import React, { Component, PropTypes } from 'react';
import ClickOutside from 'react-click-outside';
import classNames from 'classnames';

class Dropdown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      isopen: false,
    };
  }

  componentWillMount() {
    const { value } = this.props.options[0] || {};
    this.setState({
      value: this.props.defaultValue || value,
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.defaultValue,
    });
  }

  toggle() {
    if (!this.props.disabled) {
      this.props.onClick();
      this.setState({
        isopen: !this.state.isopen,
      });
    }
  }

  handleClickOutside() {
    this.setState({ isopen: false });
  }

  handleClick(option) {
    const { value } = option;
    if (value !== this.state.value) {
      this.setState({
        isopen: false,
        value,
      }, () => this.props.onChange(value));
    }
  }

  render() {
    const { options, style, disabled, className } = this.props;
    const { isopen, value } = this.state;
    const classes = classNames({
      'atfc-dropdown': true,
      'open': !!isopen,
      'disabled': !!disabled,
      [className]: !!className,
    });
    const selected = options.find(option => option.value === value) || options[0];
    return (
      <div
        className={classes}
        onClick={() => this.toggle()}
        {...style}
      >
        <div className="button">
          <span>{selected.label}</span>
          <span className="d-caret"></span>
        </div>
        <div className="menu">
          {
            options.map((option, idx) =>
              <div
                key={idx}
                className="menu-item"
                onClick={() => this.handleClick(option)}
              >
                {option.label}
              </div>)
          }
        </div>
      </div>
    );
  }
}

Dropdown.propTypes = {
  options: PropTypes.array,
  onChange: PropTypes.func,
  onClick: PropTypes.func,
  defaultValue: PropTypes.string,
  style: PropTypes.object,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

Dropdown.defaultProps = {
  options: [],
  onChange() {},
  onClick() {},
  defaultValue: '',
  style: {},
  disabled: false,
  className: '',
};

export default ClickOutside(Dropdown);
