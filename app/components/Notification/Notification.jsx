import React from 'react';
import ReactDOM from 'react-dom';

const defaultDuration = 3000;

const propTypes = {
  type: React.PropTypes.string,
  content: React.PropTypes.string,
};

const defaultPorps = {
  type: '',
  content: '',
};

const icons = {
  error: require('./assets/error.svg'),
  info: require('./assets/info.svg'),
  success: require('./assets/success.svg'),
  warning: require('./assets/warning.svg'),
};

class Notification extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { type, content } = this.props;

    return (
      <div className="atfc-message">
        <img className="atfc-message__icon" src={icons[type]} />
        <div className="atfc-message__group">
          <p>{content}</p>
        </div>
      </div>
    );
  }
}

class Notify {
  constructor() {
    const div = document.createElement('div');
    document.body.appendChild(div);
    this.el = div;
  }

  open(content, duration = defaultDuration, type) {
    this.close();

    if (duration) {
      setTimeout(() => this.close(), duration);
    }

    ReactDOM.render(
      <Notification type={type} content={content} />,
      this.el
    );
  }

  close() {
    ReactDOM.unmountComponentAtNode(this.el);
  }

  destroy() {
    if (this.el) {
      document.body.removeChild(this.el);
    }
  }
}
Notification.defaultPorps = defaultPorps;

Notification.propTypes = propTypes;

export default {
  success(content, duration) {
    return new Notify().open(content, duration, 'success');
  },
  error(content, duration) {
    return new Notify().open(content, duration, 'error');
  },
  info(content, duration) {
    return new Notify().open(content, duration, 'info');
  },
  warning(content, duration) {
    return new Notify().open(content, duration, 'warning');
  },
};
