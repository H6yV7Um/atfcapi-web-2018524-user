import React, { Component, PropTypes } from 'react';
import ClickOutside from 'react-click-outside';
import Input from '../Input';

class AutoComplete extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      showComplete: false,
      filterDatas: this.props.dataSource,
      selectIndex: -1,
    };
  }

  handleClickOutside() {
    this.setState({ showComplete: false });
  }

  handleFocus() {
    this.setState({
      showComplete: true,
    });
  }

  handleChange(value) {
    this.setState({
      value,
      filterDatas: this.filterDatas(value),
      selectIndex: -1,
      showComplete: true,
    }, () => this.props.onChange(value));
  }

  filterDatas(value) {
    return this.props.dataSource.filter(data => {
      if (data) {
        return data.toString().toLowerCase().indexOf(value.toString().toLowerCase()) !== -1;
      }
      return false;
    });
  }

  handleSelect(index) {
    this.setState({
      selectIndex: index,
    });
  }

  handleEnter(selectIndex) {
    const value = this.state.filterDatas.find((data, index) => index === selectIndex);
    this.setState({
      value,
      showComplete: false,
      selectIndex: -1,
    }, () => this.props.onChange(value));
  }

  handleKeyDown(e) {
    if (this.state.filterDatas.length === 0) return;
    let newIndex;
    switch (e.keyCode) {
    case 40: // 下
      newIndex = this.state.selectIndex + 1;
      if (newIndex > this.state.filterDatas.length - 1) {
        newIndex = 0;
      }
      this.handleSelect(newIndex);
      break;
    case 38: // 上
      newIndex = this.state.selectIndex - 1;
      if (newIndex < 0) {
        newIndex = this.state.filterDatas.length - 1;
      }
      this.handleSelect(newIndex);
      break;
    case 13: // enter
        // 如果所填没有在显示列表里,则无效
      this.handleEnter(this.state.selectIndex);
      break;
    default: break;
    }
  }

  innerRender() {
    const { filterDatas, selectIndex } = this.state;
    const isEmpty = this.state.filterDatas.length === 0;
    const style = {
      display: this.state.showComplete && !isEmpty ? 'block' : 'none',
    };
    return (
      <ul className="autocomplete" style={style}>
        {
          filterDatas.map((data, index) =>
            <li
              key={index}
              onClick={() => this.handleEnter(index)}
              className={selectIndex === index ? 'is-active' : ''}
            >
              {data}
            </li>
          )
        }
      </ul>
    );
  }

  render() {
    const { value } = this.state;
    const { className, inputClassName, style, placeholder, disabled, onFocus } = this.props;
    const restProps = {
      className,
      inputClassName,
      style,
      placeholder,
      disabled,
      onFocus,
    };
    return (
      <Input
        onChange={v => this.handleChange(v)}
        value={value}
        onKeyDown={e => this.handleKeyDown(e)}
        innerRender={() => this.innerRender()}
        {...restProps}
      />
    );
  }
}

AutoComplete.propTypes = {
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  style: PropTypes.object,
  placeholder: PropTypes.string,
  dataSource: PropTypes.array,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  disabled: PropTypes.bool,
};

AutoComplete.defaultProps = {
  dataSource: [],
  onChange() {},
  onFocus() {},
};

export default ClickOutside(AutoComplete);
