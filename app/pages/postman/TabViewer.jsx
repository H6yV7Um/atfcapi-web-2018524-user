import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

class TabViewer extends Component {
  constructor(props) {
    super(props);
  }

  handleClick(type) {
    if (type !== this.props.value) {
      this.props.onChange(type);
    }
  }

  bulidGroup() {
    return this.props.typeSource.map((type, index) => {
        const classes = classNames({
          'tab': true,
          'is-active': type === this.props.value,
        })
        return <div key={index} className={classes} onClick={() => this.handleClick(type)}>{type}</div>
      }
    );
  }

  render() {
    const { className } = this.props;
    const classes = classNames({
      'tabs-viewer': true,
      [className]: !!className,
    });
    return (
      <div className={classes}>
        {this.bulidGroup()}
      </div>
    );
  }
}

TabViewer.propTypes = {
  className: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.string,
  typeSource: PropTypes.array,
};

TabViewer.defaultProps = {
  onChange() {},
};

export default TabViewer;
