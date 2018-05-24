import React, { Component, PropTypes } from 'react';
import Codemirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/yaml/yaml';
import 'codemirror/mode/textile/textile';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/htmlmixed/htmlmixed';

// if want to support other language， import the package like: codemirror/mode/javascript/javascript
// more detail http://codemirror.net/doc/manual.html

export default class CodeMirrorEditor extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const cm = this.refs.editor.getCodeMirror();
    const { width, height } = this.props;
    // 初始化宽高
    cm.setSize(width, height);
  }

  render() {
    const { value, className } = this.props;
    const options = Object.assign({
			lineNumbers: true,
      tabSize: 2,
      mode: 'yaml',
		}, this.props.options);

    return (
      <div className={className}>
        <Codemirror ref="editor" value={value} onChange={value => this.props.onChange(value)} options={options} />
      </div>
    );
  }
}

CodeMirrorEditor.propTypes = {
  className: PropTypes.string,
  width: PropTypes.string,
  height: PropTypes.string,
  value: PropTypes.string,
  options: PropTypes.object,
  onChange: PropTypes.func,
};

CodeMirrorEditor.defaultProps = {
  onChange() {},
  width: '100%',
  height: '100%',
};
