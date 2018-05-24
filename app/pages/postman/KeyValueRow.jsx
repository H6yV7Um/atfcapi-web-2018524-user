import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { Input, AutoComplete, Dropdown } from 'atfcapi';

class KeyValueRow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: true,
    };
  }

  getComponent(suggestion) {
    return suggestion.length > 0 ? AutoComplete : Input;
  }

  handleChangeKey(key) {
    this.handleChange(Object.assign(this.props.value, { key }));
  }

  handleChangeValue(value) {
    this.handleChange(Object.assign(this.props.value, { value }));
  }

  handleTypeChange(type) {
    if (this.props.onCreate) {
      this.props.onCreate('key', { type })
    } else {
      this.handleChange(Object.assign(this.props.value, {
        type,
        value: '',
      }));
    }
  }

  handleToggle() {
    this.setState({ checked: !this.state.checked });
    this.handleChange(Object.assign(this.props.value, { checked: !this.state.checked }));
  }

  handleChange(value) {
    this.props.onChange(value);
  }

  render() {
    const { disableDelete, disableToggle, className, valuePlaceholder, keyPlaceholder, valueSuggestion, keySuggestion, value = {} } = this.props;
    const { checked } = this.state;
    const classes = classNames({
      'Grid': true,
      'atfc-input-group': true,
      [className]: !!className,
    });
    const KeyComponent = this.getComponent(keySuggestion);
    const ValueComponent = this.getComponent(valueSuggestion);
    const { type = 'text' } = value;
    return (
      <div className={classes}>
        <div className="Grid-cell Grid-cell--autoSize Grid-cell--center">
          { checked ?
            <span onClick={() => this.handleToggle()} className="glyphicon glyphicon-ok scale-xs" style={{ visibility: disableToggle ? 'hidden' : 'visible' }}></span>
            :
            <span onClick={() => this.handleToggle()} className="glyphicon no-check scale-xs"></span>
          }
        </div>
        <div className="Grid-cell">
          <KeyComponent
            dataSource={keySuggestion.map(suggestion => suggestion.toUpperCase())}
            inputClassName="key-value-row__inputkey"
            placeholder={keyPlaceholder}
            onFocus={() => this.props.onCreate && this.props.onCreate('key')}
            onChange={v => this.handleChangeKey(v)}
          />
        </div>
        <div className="Grid-cell">
          <ValueComponent
            dataSource={valueSuggestion}
            inputClassName="key-value-row__inputvalue"
            placeholder={valuePlaceholder}
            type={type}
            onFocus={() => this.props.onCreate && this.props.onCreate('value')}
            onChange={v => this.handleChangeValue(v)}
          />
        </div>
        <div className="Grid-cell Grid-cell--autoSize Grid-cell--center row-controls">
          {this.props.enableFiles &&
            <Dropdown
              options={[
                {
                  value: 'text',
                  label: 'Text',
                },{
                  value: 'file',
                  label: 'File',
                }]
              }
              defaultValue={type}
              onChange={value => this.handleTypeChange(value)}
            />
          }
          <span onClick={() => this.props.onRemove()} className="glyphicon glyphicon-remove scale-xs" style={{ visibility: disableDelete ? 'hidden' : 'visible' }}></span>
        </div>
      </div>
    );
  }
}

KeyValueRow.propTypes = {
  value: PropTypes.object,
  valuePlaceholder: PropTypes.string,
  keyPlaceholder: PropTypes.string,
  valueSuggestion: PropTypes.array,
  keySuggestion: PropTypes.array,
  onCreate: PropTypes.func,
  onRemove: PropTypes.func,
  onChange: PropTypes.func,
  disableToggle: PropTypes.bool, // 是否显示checkbox
  disableDelete: PropTypes.bool,
  enableFiles: PropTypes.bool,
  className: PropTypes.string,
};

KeyValueRow.defaultProps = {
  value: {},
  onRemove() {},
  onChange() {},
  valueSuggestion: [],
  keySuggestion: [],
};

export default KeyValueRow;
