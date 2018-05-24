import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';

class ComboBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      highlightedIndex: null,
    }
  }

  setIgnoreBlur (ignore) {
    this.ignoreBlur = ignore;
  }

  // 根据输入的value得到匹配结果
  getFilterOption() {
    const { options, value } = this.props;

    return options.filter(item => {
        let v = this.props.getOptionValue(item);
        if (value === null || value === undefined) return false;
        return v.toString().toLowerCase().indexOf(value.toString().toLowerCase()) !== -1
      }
    )
  }

  // 重置状态
  reset(callback) {
    this.setState({
      isOpen: false,
      highlightedIndex: null,
    }, typeof callback === "function" ? callback() : () => {})
  }

  // 按下键盘时
  handleKeyDown (e) {
    // 如果匹配到了 up down enter esc
    if (this[e.key]){
      this[e.key].call(this, e);
    } else {
      const { selectionStart } = e.target;

      //if (value === this.props.value) return;
      this.setState({
        highlightedIndex: null,
        isOpen: true
      }, () => {
        this.refs.input.selectionStart = selectionStart;
      })
    }
  }

  ArrowDown(e) {
    e.preventDefault();
    const optionsLength = this.getFilterOption().length;
    if (!optionsLength) return;
    const { highlightedIndex } = this.state;
    // 如果未高亮任何一项 或者当前高亮的为最后一项，则从第一项开始
    const index = (highlightedIndex === null || highlightedIndex === optionsLength -1) ? 0 : highlightedIndex + 1;
    this.setState({
      highlightedIndex: index,
      isOpen: true,
    })
  }

  ArrowUp(e) {
    e.preventDefault();
    const optionsLength = this.getFilterOption().length;
    if (!optionsLength) return;
    const { highlightedIndex } = this.state;
    // 如果未高亮任何一项 或者当前高亮的为第一项，则从最后一项开始
    const index = (highlightedIndex === null || highlightedIndex === 0) ? optionsLength - 1 : highlightedIndex - 1;
    this.setState({
      highlightedIndex: index,
      isOpen: true,
    })
  }

  Enter(e) {
    if (this.state.isOpen === false) {
      this.props.onEnter(e.target.value);
    }
    else if (this.state.highlightedIndex == null) {
      this.setState({
        isOpen: false
      }, () => {
        this.refs.input.select()
      })
    }
    else {
      e.preventDefault();
      const option = this.getFilterOption()[this.state.highlightedIndex];
      const value = this.props.getOptionValue(option);
      this.reset(() => {
        this.refs.input.setSelectionRange(
          value.length,
          value.length
        )
        this.props.onSelect(value, option)
      })

    }
  }

  Escape() {
    this.reset();
  }

  handleChange(e) {
    this.props.onChange(e.target.value, e.target);
  }

  handleBlur(e) {
    if (this.ignoreBlur) return;
    this.props.onBlur(e.target.value, e.target);
    this.reset();
  }

  handleFocus() {
    if (this.ignoreBlur) return;
    this.setState({
      isOpen: true,
    })
  }

  handleClick() {
    const element = ReactDOM.findDOMNode(this.refs.input);
    const { isOpen, highlightedIndex } =  this.state;

    if (!isOpen && element === document.activeElement) {
      this.setState({
        isOpen: true,
      })
    } else if (highlightedIndex !== null) {
      this.selectOption(this.getFilterOption()[highlightedIndex])
    }
    this.props.onClick();
  }
  // 高亮当前选中项
  highlightOption (index) {
    this.setState({ highlightedIndex: index })
  }
  // enter 或 click 某一项时
  selectOption (option) {
    let value = this.props.getOptionValue(option);

    this.reset(() => {
      this.props.onSelect(value, option)
      this.refs.input.focus()
      this.setIgnoreBlur(false)
    })
  }

  // 根据匹配结果渲染 option
  renderOption(option, index, isHighlighted) {
    let value = this.props.getOptionValue(option);

    return(
      <div
        className={isHighlighted ? "highlighted" : "option"}
        key={index}
      >
        {value}
      </div>
    )
  }
  // 渲染下拉列表
  renderMenu() {
    const options = this.getFilterOption().map((item, index) => {
      let element = this.renderOption(
        item,
        index,
        this.state.highlightedIndex === index
      )
      return React.cloneElement(element, {
        onMouseDown: () => this.setIgnoreBlur(true),
        onMouseEnter: () => this.highlightOption(index),
        onClick: () => this.selectOption(item),
      })
    })
    if (!options.length) return;
    const node = this.refs.input;
    const rect = node.getBoundingClientRect();
    const style = {
      minWidth: rect.width,
      zIndex:100,
    }
    const menu = <div className="menu" style={{...style}} children={options} />
    return React.cloneElement(menu);
  }

  render() {
    const { placeholder, onClick, inputProps,inputClass, name, value, className } = this.props;

    const classes = classNames({
      'atfc-autocomplete': true,
      [className]: !!className,
    })
    // 兼容react-bootstrap的 OverlayTrigger 这里只添加了onclick事件，更多事件参考
    // https://github.com/react-bootstrap/react-bootstrap/blob/master/src/OverlayTrigger.js
    const triggerProps = {
      'aria-describedby': this.props['aria-describedby'],
      'onClick': onClick,
    };
    return(
      <div className={classes} style={this.state.isOpen ? {zIndex:10} : {}}>
        <input
          {...inputProps}
          {...triggerProps}
          name={name}
          className={inputClass ? inputClass : "form-control"}
          type="text"
          ref="input"
          autoComplete="off"
          placeholder={placeholder}
          onChange={e => this.handleChange(e)}
          onKeyDown={e => this.handleKeyDown(e)}
          onClick={() => this.handleClick()}
          onFocus={() => this.handleFocus()}
          onBlur={e => this.handleBlur(e)}
          value={value}
        />
        {this.state.isOpen && this.renderMenu()}
      </div>
    )
  }
}

ComboBox.propTypes = {
  value: PropTypes.any,
  name: PropTypes.string,
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
  onSelect: PropTypes.func,
  onEnter: PropTypes.func,
  onClick: PropTypes.func,
  onBlur: PropTypes.func,
  getOptionValue: PropTypes.func,
  options: PropTypes.array,
  inputProps: PropTypes.object,
  inputClass: PropTypes.string,
  className: PropTypes.string,
}

ComboBox.defaultProps = {
  value: '', // 文本框的默认值
  name:'',
  placeholder: '',
  onChange() {},
  onSelect() {},
  onEnter() {},
  onClick() {},
  onBlur() {},
  getOptionValue: (option) => option, // 定义如何获取当前项的值，默认为当前数组某一项
  options: [],
  inputProps: {},
  className:'',
}

export default ComboBox;
