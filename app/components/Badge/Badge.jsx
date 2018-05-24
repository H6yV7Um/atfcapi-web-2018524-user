import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

export default class Badge extends Component {
  render() {
    const { children, value, max, isDot } = this.props;
    const className = classNames({
      'atfc-badge__content': true,
      'is-fixed': !!children,
      'is-dot': !!isDot,
    });
    let content;

    if (isDot) {
      content = null;
    } else {
      if (typeof value === 'number' && typeof max === 'number') {
        content = max < value ? `${max}+` : value;
      } else {
        content = value;
      }
    }

    return (
      <div className="atfc-badge">
        { children }
        <sup className={className}>{ content }</sup>
      </div>
    );
  }
}

Badge.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  max: PropTypes.number,
  isDot: PropTypes.bool,
  children: PropTypes.node,
};

Badge.defaultProps = {
  isDot: false,
};
