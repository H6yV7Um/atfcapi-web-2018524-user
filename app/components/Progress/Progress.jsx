import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

export default class Progress extends Component {
  constructor(props) {
    super(props);
  }

  relativeStrokeWidth() {
    const { strokeWidth, width } = this.props;
    return (strokeWidth / width * 100).toFixed(1);
  }

  trackPath() {
    const radius = parseInt(
      50 - parseFloat(this.relativeStrokeWidth()) / 2,
      10
    );
    return `M 50 50 m 0 -${radius} a ${radius} ${radius} 0 1 1 0 ${radius * 2} a ${radius} ${radius} 0 1 1 0 -${radius * 2}`;
  }

  perimeter() {
    const radius = 50 - parseFloat(this.relativeStrokeWidth()) / 2;
    return 2 * Math.PI * radius;
  }

  circlePathStyle() {
    const perimeter = this.perimeter();
    return {
      strokeDasharray: `${perimeter}px,${perimeter}px`,
      strokeDashoffset: (1 - this.props.percentage / 100) * perimeter + 'px',
      transition: 'stroke-dashoffset 0.6s ease 0s, stroke 0.6s ease'
    };
  }

  stroke() {
    let ret;
    switch (this.props.status) {
      case 'success':
        ret = '#13ce66';
        break;
      case 'exception':
        ret = '#ff4949';
        break;
      default:
        ret = '#20a0ff';
    }
    return ret;
  }

  iconClass() {
    const { type, status } = this.props;
    return type === 'line'
      ? status === 'success' ? 'el-icon-circle-check' : 'el-icon-circle-cross'
      : status === 'success' ? 'el-icon-check' : 'el-icon-close';
  }

  progressTextSize() {
    const { type, strokeWidth, width } = this.props;
    return type === 'line' ? 12 + strokeWidth * 0.4 : width * 0.111111 + 2;
  }

  render() {
    const {
      type,
      percentage,
      status,
      strokeWidth,
      textInside,
      width,
      showText,
      style
    } = this.props;
    let progress;
    if (type === 'line') {
      progress = (
        <div className="atfc-progress-bar">
          <div
            className="atfc-progress-bar__outer"
            style={{ height: `${strokeWidth}px` }}
          >
            <div
              className="atfc-progress-bar__inner"
              style={{ width: `${percentage}%` }}
            >
              {showText &&
                textInside &&
                <div className="atfc-progress-bar__innerText">
                  {`${percentage}%`}
                </div>}
            </div>
          </div>
        </div>
      );
    } else {
      progress = (
        <div
          className="atfc-progress-circle"
          style={{ height: `${width}px`, width: `${width}px` }}
        >
          <svg viewBox="0 0 100 100">
            <path
              className="atfc-progress-circle__track"
              d={this.trackPath()}
              stroke="#e5e9f2"
              strokeWidth={this.relativeStrokeWidth()}
              fill="none"
            />
            <path
              className="atfc-progress-circle__path"
              d={this.trackPath()}
              strokeLinecap="round"
              stroke={this.stroke()}
              strokeWidth={this.relativeStrokeWidth()}
              fill="none"
              style={this.circlePathStyle()}
            />
          </svg>
        </div>
      );
    }
    const progressInfo = showText &&
      !textInside &&
      <div
        className="atfc-progress__text"
        style={{ fontSize: `${this.progressTextSize()}px` }}
      >
        {status ? <i className={this.iconClass()} /> : `${percentage}%`}
      </div>;

    return (
      <div
        style={style}
        className={classNames('atfc-progress', `atfc-progress--${type}`, {
          [`is-${status}`]: !!status,
          'atfc-progress--without-text': !showText,
          'atfc-progress--text-inside': textInside
        })}
      >
        {progress}
        {progressInfo}
      </div>
    );
  }
}

Progress.propTypes = {
  type: PropTypes.oneOf(['line', 'circle']),
  percentage: PropTypes.number.isRequired,
  status: PropTypes.string,
  strokeWidth: PropTypes.number,
  width: PropTypes.number,
  textInside: PropTypes.bool,
  showText: PropTypes.bool
};

Progress.defaultProps = {
  type: 'line',
  percentage: 0,
  strokeWidth: 6,
  width: 126,
  showText: true,
  textInside: false
};
