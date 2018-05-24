import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

class Tabs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeIndex: this.props.activeIndex,
    };
  }

  componentWillReceiveProps(nextProps) {
    if ('activeIndex' in nextProps && nextProps.activeIndex !== null) {
      this.setState({
        activeIndex: nextProps.activeIndex,
      });
    }
  }

  setActive(index) {
    this.setState({
      activeIndex: index,
    }, () => this.props.onChange(index));
  }

  render() {
    const title = React.Children.map(this.props.children, (child, idx) => {
      const isActive = this.state.activeIndex === idx;
      const className = child.props.className;
      const classes = classNames({
        'is-active': isActive,
        'tab': true,
        [className]: !!className,
      });
      return (
        <button
          className={classes}
          onClick={() => this.setActive(idx)}
          disabled={child.props.disabled}
        >
          <span>{child.props.label}</span>
          { !!child.props.count && <span className="tab-count">{`(${child.props.count})`}</span>}
          { !!child.props.showBagde && <span className="tab-badge"></span>}
        </button>
      );
    });

    const content = React.Children.map(this.props.children, (child, idx) => {
      return React.cloneElement(child, {
        style: {
          display: this.state.activeIndex === idx ? '' : 'none',
        },
        key: idx,
      });
    });
    const wrapperClass = classNames({
      [this.props.wrapperClassName]: !!this.props.wrapperClassName,
    });
    const tabsClass = classNames({
      'atfc-tabs': true,
      [this.props.className]: !!this.props.className,
    });
    return (
      <div className={wrapperClass}>
        <div className={tabsClass}>
          {title}
          {this.props.meta}
        </div>
        <div className="atfc-tabs-content">
          {content}
        </div>
      </div>
    );
  }
}

Tabs.propTypes = {
  activeIndex: PropTypes.number,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)]),
  onChange: PropTypes.func,
  className: PropTypes.string,
  wrapperClassName: PropTypes.string,
  meta: PropTypes.node,
};

Tabs.defaultProps = {
  activeIndex: 0,
  onChange() {},
};

export default Tabs;
