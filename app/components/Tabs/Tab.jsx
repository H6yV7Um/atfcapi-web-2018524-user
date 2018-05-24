import React, {Component, PropTypes} from 'react';
import classNames from 'classnames';

class Tab extends Component {
  render() {
    const { label, disabled, children, style, className } = this.props;
    const classes = classNames({
      'tab-content': true,
      [className]: !!className,
    });
    return (
      <section
        label={label}
        disabled={disabled}
        style={style}
        className={classes}
      >
        {children}
      </section>
    );
  }
}

Tab.propTypes = {
  label: PropTypes.string, // 以后可以扩展element
  disabled: PropTypes.bool,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf(PropTypes.node)]),
  style: PropTypes.object,
  className: PropTypes.string,
  count: PropTypes.number, // 有效数量
  showBagde: PropTypes.bool, // 显示圆点
};

Tab.defaultProps = {
  label: '',
  disabled: false,
  style: {},
  className: '',
};

export default Tab;
