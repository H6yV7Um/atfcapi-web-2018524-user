import React from 'react';
import classNames from 'classnames';
import { CodeMirror } from 'atfcapi';

class JsonEditor extends React.Component {
  constructor(props) {
    super(props);
  }

  handleChange(value) {
    this.props.onChange(value);
  }

  render() {
    let { value } = this.props;
    if (typeof value !== 'string') {
      try {
        value = JSON.parse(value);
      } catch (err) {
        value = '';
      }
    }
    const classes = classNames({
      'api-editor': true,
      [this.props.className]: !!this.props.className,
    });
    return (
      <CodeMirror
        className={classes}
        width={this.props.width}
        height={this.props.height}
        value={this.props.value}
        onChange={e => this.handleChange(e)}
      />
    );
  }
}

JsonEditor.propTypes = {
  value: React.PropTypes.string,
  width: React.PropTypes.string,
  height: React.PropTypes.string,
  className: React.PropTypes.string,
  onChange: React.PropTypes.func.isRequired,
};

JsonEditor.defaultProps = {
  value: '',
  width: '100%',
  height: '500px',
};

export default JsonEditor;
