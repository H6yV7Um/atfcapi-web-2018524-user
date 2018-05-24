import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import KeyValueRow from './KeyValueRow';

class KeyValueForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      values: this.props.values,
    };
  }

  getNewId() {
    if (this.state.values.length > 0) {
      // 所有id集合
      const ids = this.state.values.map(v => v.id);
      // 取最大值
      return Math.max(...ids) + 1;
    }
    return 0;
  }

  getBlankValue(id, defaults) {
    return Object.assign({
      key: '',
      value: '',
      checked: true,
      type: 'text',
      id,
    }, defaults);
  }

  last(array) {
    const length = array.length;
    return array[length - 2];
  }

  handleCreate(field, defaults) {
    const { values } = this.state;
    const newValue = this.getBlankValue(this.getNewId(), defaults);
    const nextValues = values.concat(newValue);
    this.setState({
      values: nextValues,
    }, () => {
      const domNode = ReactDOM.findDOMNode(this);
      let inputField;
      if (field === 'value') {
        inputField = this.last(domNode.getElementsByClassName('key-value-row__inputvalue input'));
      } else {
        inputField = this.last(domNode.getElementsByClassName('key-value-row__inputkey input'));
      }
      inputField.focus();
      this.props.onChange(nextValues);
    });
  }

  handleRemove(id) {
    const { values } = this.state;
    const newValues = values.filter(v => v.id !== id);
    this.setState({
      values: newValues,
    }, () => this.props.onChange(newValues));
  }

  handleChange(id, value) {
    const { values } = this.state;
    const newValues = values.concat([]);
    const index = newValues.findIndex(v => v.id === id);
    newValues[index] = value;
    this.setState({
      values: newValues,
    }, () => this.props.onChange(newValues));
  }
  render() {
    const { disableToggle, disableDelete, enableFiles, className, valuePlaceholder, keyPlaceholder, valueSuggestion, keySuggestion } = this.props;
    const restProps = {
      disableToggle,
      disableDelete,
      enableFiles,
      className,
      valuePlaceholder,
      keyPlaceholder,
      valueSuggestion,
      keySuggestion,
    };

    const { values } = this.state;
    return (
      <div>
        {
          values.map(value =>
            <KeyValueRow
              key={value.id}
              value={value}
              onChange={v => this.handleChange(value.id, v)}
              onRemove={() => this.handleRemove(value.id)}
              {...restProps}
            />
          )
        }
        {
          <KeyValueRow
            onCreate={(source, defaults) => this.handleCreate(source, defaults)}
            keyPlaceholder={keyPlaceholder}
            valuePlaceholder={valuePlaceholder}
            enableFiles={enableFiles}
            disableToggle
            disableDelete
          />
        }
      </div>
    );
  }
}

KeyValueForm.propTypes = {
  values: PropTypes.array,
  valuePlaceholder: PropTypes.string,
  keyPlaceholder: PropTypes.string,
  valueSuggestion: PropTypes.array,
  keySuggestion: PropTypes.array,
  onChange: PropTypes.func,
  disableDelete: PropTypes.bool, // 是否显示checkbox
  disableToggle: PropTypes.bool,
  enableFiles: PropTypes.bool,
  className: PropTypes.string,
};

KeyValueForm.defaultProps = {
  values: [],
  valuePlaceholder: 'value',
  keyPlaceholder: 'key',
  valueSuggestion: [],
  keySuggestion: [],
  onFocus() {},
  onRemove() {},
  onChange() {},
};

export default KeyValueForm;
