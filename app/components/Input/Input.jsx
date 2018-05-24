import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

class Input extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
    };
  }

  componentWillMount() {
    // 同步到自己的value
    this.setState({
      value: this.props.value,
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value) {
      this.setState({
        value: nextProps.value,
      });
    }
  }

  handleKeyDown(e) {
    this.props.onKeyDown && this.props.onKeyDown(e);
  }

  handleInputChange(e) {
    const { value } = e.target;
    this.setState({
      value,
    }, () => this.props.onChange(value));
  }

  render() {
    const { className, inputClassName, style, type, disabled, placeholder, innerRender } = this.props;
    const { value } = this.state;
    const classes = classNames({
      'atfc-input': true,
      [className]: !!className,
    });
    // 兼容react-bootstrap的 OverlayTrigger 这里只添加了onclick事件，更多事件参考
    // https://github.com/react-bootstrap/react-bootstrap/blob/master/src/OverlayTrigger.js
    const triggerProps = {
      'aria-describedby': this.props['aria-describedby'],
      'onClick': this.props.onClick,
    };
    return (
      <div
        className={classes}
        style={style}
      >
        <input
          disabled={disabled}
          type={type}
          onKeyDown={e => this.handleKeyDown(e)}
          onChange={e => this.handleInputChange(e)}
          onFocus={e => this.props.onFocus(e)}
          className={classNames({
            'input': true,
            [inputClassName]: !!inputClassName,
          })}
          placeholder={placeholder}
          value={value}
          {...triggerProps}
        />
        {/* <div className="right-addon">
          {this.props.rightRender() }
        </div> */}
        {innerRender.constructor.name === 'Function' ? innerRender() : innerRender}
      </div>
    );
  }
}

Input.propTypes = {
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  style: PropTypes.object,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  innerRender: PropTypes.func,
  onKeyDown: PropTypes.func,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
};

Input.defaultProps = {
  className: '',
  style: {},
  placeholder: '...',
  innerRender() {},
  onChange() {},
  onFocus() {},
  onClick() {},
  disabled: false,
  value: '',
};

export default Input;
