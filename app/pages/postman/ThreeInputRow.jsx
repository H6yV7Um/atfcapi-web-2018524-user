import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { Input, Dropdown } from 'atfcapi';

class ThreeInputRow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: true,
    };
  }

  getComponent(suggestion) {
    return suggestion.length > 0 ? Dropdown : Input;
  }

  handleChangeKey(key) {
    this.handleChange(Object.assign(this.props.value, { key }));
  }

  handleChangeOperate(operate) {
    this.handleChange(Object.assign(this.props.value, { operate }));
  }

  handleChangeValue(value) {
    this.handleChange(Object.assign(this.props.value, { value }));
  }

  handleToggle() {
    this.setState({ checked: !this.state.checked });
    this.handleChange(Object.assign(this.props.value, { checked: !this.state.checked }));
  }

  handleChange(value) {
    this.props.onChange(value);
  }

  render() {
    const { disableDelete, disableToggle, className, valuePlaceholder, operateSuggestion, keySuggestion, value = {} } = this.props;
    const { checked } = this.state;
    const classes = classNames({
      'Grid': true,
      'atfc-input-group': true,
      'three-input-row': true,
      [className]: !!className,
    });

    const { key, operate, value: val } = value;
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
          <Dropdown
            className="three-input-row__key"
            options={keySuggestion}
            defaultValue={key}
            onClick={() => this.props.onCreate && this.props.onCreate('key')}
            onChange={value => this.handleChangeKey(value)}
          />
        </div>
        {
          key && key !== 'caseName' && <div className="Grid-cell">
            <Dropdown
              className="three-input-row__operate"
              options={operateSuggestion}
              defaultValue={operate}
              onClick={() => this.props.onCreate && this.props.onCreate('operate')}
              onChange={value => this.handleChangeOperate(value)}
            />
          </div>
        }
        <div className="Grid-cell">
          { key && key !== 'caseName' ?
            <Input onChange={value => this.handleChangeValue(value)} placeholder={valuePlaceholder} />
            :
            <Dropdown
              className="three-input-row__value"
              options={[
                {
                  value: 'text',
                  label: 'Text',
                },{
                  value: 'file',
                  label: 'File',
                }]
              }
              defaultValue={val}
              onClick={() => this.props.onCreate && this.props.onCreate('value')}
              onChange={value => this.handleChangeValue(value)}
            />
          }
        </div>
        <div className="Grid-cell Grid-cell--autoSize Grid-cell--center row-controls">
          <span onClick={() => this.props.onRemove()} className="glyphicon glyphicon-remove scale-xs" style={{ visibility: disableDelete ? 'hidden' : 'visible' }}></span>
        </div>
      </div>
    );
  }
}

ThreeInputRow.propTypes = {
  value: PropTypes.object,
  valuePlaceholder: PropTypes.string,
  valueSuggestion: PropTypes.array,
  operateSuggestion: PropTypes.array,
  keySuggestion: PropTypes.array,
  onCreate: PropTypes.func,
  onRemove: PropTypes.func,
  onChange: PropTypes.func,
  disableToggle: PropTypes.bool, // 是否显示checkbox
  disableDelete: PropTypes.bool,
  className: PropTypes.string,
};

ThreeInputRow.defaultProps = {
  value: {},
  onRemove() {},
  onChange() {},
  valueSuggestion: [],
  keySuggestion: [],
};

export default ThreeInputRow;
