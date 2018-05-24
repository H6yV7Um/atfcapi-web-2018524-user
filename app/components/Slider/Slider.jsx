import React from 'react';
import ReactDOM from 'react-dom';

const propTypes = {
  min: React.PropTypes.number, // 最小值
  max: React.PropTypes.number, // 最大值
  step: React.PropTypes.number, // 滑动间隔
  value: React.PropTypes.number, // 初始值
  onChange: React.PropTypes.func, // 滑动触发的事件
  className: React.PropTypes.string, // 自定义样式
};

const defaultProps = {
  min: 0,
  max: 100,
  step: 1,
  value: 0,
  onChange() {},
};

class Slider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      limit: 0,
      grab: 0,
    };
    // 不能在addEventListener中直接使用this.handleEnd.bind(this),
    // 原因是bind方法会创建一个新函数。调用两次bind会返回两个不同的方法，虽然表面上看起来一样
    // 实际上在内存中的地址是不一样的。会导致removeEventListener失败。
    this.mouseup = this.handleEnd.bind(this);
    this.mousemove = this.handleDrag.bind(this);
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleSlide);
    this.handleSlide();
  }

  getPositionFromValue(value) {
    const { limit } = this.state;
    const { min, max } = this.props;
    const percentage = (value - min) / (max - min);
    const pos = Math.round(percentage * limit);

    return pos;
  }

  getValueFromPosition(pos) {
    let percentage;
    const { limit } = this.state;
    const { min, max, step } = this.props;
    percentage = (this.maxmin(pos, 0, limit) / (limit || 1));

    let value = step * Math.round(percentage * (max - min) / step) + min;
    if (value % step > 0) value = parseInt(value / step, 10) * step;
    if (value > max) value = max;
    if (value < min) value = min;
    return value;
  }

  maxmin(pos, min, max) {
    if (pos < min) { return min; }
    if (pos > max) { return max; }
    return pos;
  }

  position(e) {
    const { grab } = this.state;
    const slider = ReactDOM.findDOMNode(this.refs.slider);
    const coordinate = e.touches ? e.touces[0].clientX : e.clientX;
    const direction = slider.getBoundingClientRect().left;

    const pos = coordinate - direction - grab;
    return this.getValueFromPosition(pos);
  }

  coordinates(pos) {
    const { grab } = this.state;
    const value = this.getValueFromPosition(pos);
    const handlePos = this.getPositionFromValue(value);
    const fillPos = handlePos + grab;
    return {
      fill: fillPos,
      handle: handlePos,
    };
  }

  handleSlide() {
    const dimension = 'offsetWidth';
    if (this.refs) {
      const sliderPos = ReactDOM.findDOMNode(this.refs.slider)[dimension];
      const handlePos = ReactDOM.findDOMNode(this.refs.handle)[dimension];
      this.setState({
        limit: sliderPos - handlePos,
        grab: handlePos / 2,
      });
    }
  }

  handleStart() {
    document.addEventListener('mousemove', this.mousemove, false);
    document.addEventListener('mouseup', this.mouseup, false);
  }

  handleEnd() {
    document.removeEventListener('mousemove', this.mousemove, false);
    document.removeEventListener('mouseup', this.mouseup, false);
  }

  handleDrag(e) {
    this.handleNoop(e);

    const { onChange } = this.props;
    if (onChange) {
      onChange(this.position(e));
    }
  }

  handleNoop(e) {
    e.stopPropagation();
    e.preventDefault();
  }

  render() {
    const { min, max, value } = this.props;
    const position = this.getPositionFromValue(value);
    const coords = this.coordinates(position);
    const trackStyle = {['width']: `${coords.fill}px`};
    const handleStyle = {['left']: `${coords.handle}px`};
    let { className } = this.props;
    className = className ? `slider ${className}` : 'slider';
    return (
      <div
        className={className}
        ref="slider"
        onMouseDown={e => this.handleDrag(e)}
        onClick={e => this.handleNoop(e)}
      >
        <div
          className="handle"
          ref="handle"
          onClick={e => this.handleNoop(e)}
          onMouseDown={e => this.handleStart(e)}
          style={handleStyle}
        >
        </div>
        <div className="track" ref="track" style={trackStyle}></div>
        <div className="mask">
          <span style={{left: '0%'}}>{min}</span>
          <span style={{left: '100%'}}>{max}</span>
        </div>
      </div>
    );
  }
}

Slider.propTypes = propTypes;

Slider.defaultProps = defaultProps;

export default Slider;
