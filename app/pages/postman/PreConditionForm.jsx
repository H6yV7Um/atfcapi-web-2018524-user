import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import ThreeInputRow from './ThreeInputRow';
import { getAllEvn } from '../../actions/commonAction';
import { getAllAlias } from '../../actions/databaseAction';

class PreConditionForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      values: this.props.values,
    };
  }

  componentDidMount() {
    this.props.getAllEvn();
    this.props.getAllAlias();
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

  getBlankValue(id) {
    return Object.assign({
      key: '',
      operate: '',
      value: '',
      checked: true,
      id,
    });
  }

  last(array) {
    const length = array.length;
    return array[length - 2];
  }

  handleCreate(field) {
    const { values } = this.state;
    const newValue = this.getBlankValue(this.getNewId());
    const nextValues = values.concat(newValue);
    this.setState({
      values: nextValues,
    }, () => {
      const domNode = ReactDOM.findDOMNode(this);
      let inputField;
      if (field === 'value') {
        inputField = this.last(domNode.getElementsByClassName('three-input-row__value'));
      } else if (field === 'key'){
        inputField = this.last(domNode.getElementsByClassName('three-input-row__key'));
      } else {
        inputField = this.last(domNode.getElementsByClassName('three-input-row__operate'));
      }
      inputField.click();
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

  generateOptions(ary, label, value) {
    if (Array.isArray(ary)) {
      return ary.map(x => {
        if (typeof x === 'string') {
          return {
            label: x,
            value: x,
          };
        }
        return {
          label: x[label],
          value: x[value],
        };
      });
    }
    return [];
  }

  render() {
    const { envList } = this.props;
    const keySuggestion = this.generateOptions(['caseName', 'ShellID', 'DBSCript']);

    const { values } = this.state;
    return (
      <div>
        {
          values.map(value =>
            <ThreeInputRow
              key={value.id}
              value={value}
              onChange={v => this.handleChange(value.id, v)}
              onRemove={() => this.handleRemove(value.id)}
              keySuggestion={keySuggestion}
              operateSuggestion={this.generateOptions(envList, 'envName', 'envId')}
            />
          )
        }
        {
          <ThreeInputRow
            onCreate={source => this.handleCreate(source)}
            keySuggestion={keySuggestion}
            disableToggle
            disableDelete
          />
        }
      </div>
    );
  }
}

const mapStateToProps = (state) => Object.assign({}, state.common, state.database);

PreConditionForm.propTypes = {
  values: PropTypes.array,
  valuePlaceholder: PropTypes.string,
  keyPlaceholder: PropTypes.string,
  valueSuggestion: PropTypes.array,
  operateSuggestion: PropTypes.string,
  keySuggestion: PropTypes.array,
  onChange: PropTypes.func,
  disableDelete: PropTypes.bool, // 是否显示checkbox
  disableToggle: PropTypes.bool,
  className: PropTypes.string,
  getAllEvn: PropTypes.func,
  getAllAlias: PropTypes.func,
  envList: PropTypes.array,
};

PreConditionForm.defaultProps = {
  values: [],
  valuePlaceholder: 'value',
  keyPlaceholder: 'key',
  valueSuggestion: [],
  operateSuggestion: [],
  keySuggestion: [],
  onRemove() {},
  onChange() {},
};

export default connect(mapStateToProps, {
  getAllEvn,
  getAllAlias,
})(PreConditionForm);
