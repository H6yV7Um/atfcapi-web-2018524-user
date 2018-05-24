import React from 'react';
import { Glyphicon } from 'react-bootstrap';
import ComboBox from './ComboBox';

const propTypes = {
  groupClassName: React.PropTypes.string,
  options: React.PropTypes.array,
  value: React.PropTypes.string,
  onChange: React.PropTypes.func,
  onEnter: React.PropTypes.func,
  query: React.PropTypes.func,
  placeholder: React.PropTypes.string,
};

const defaultProps = {
  groupClassName: '',
  options: [], // 备选项
  value: '', // 文本值
  onChange() {}, // 文本改变事件
  onEnter() {}, // 回车事件
  query() {}, // 搜索按钮点击事件
  placeholder: '...',
};

class SearchInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputValue: this.props.value,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ inputValue: nextProps.value })
  }

  onChange(value) {
    this.setState({
      inputValue: value,
    }, () => this.props.onChange());
  }

  render() {
    const { inputValue } = this.state;
    const { groupClassName, options, placeholder } = this.props;
    return (

      <div className={groupClassName}>
        <div className="input-group">
          <ComboBox
            value={inputValue}
            className="clearfix"
            options={options}
            placeholder={placeholder}
            onChange={value => this.onChange(value)}
            onSelect={value => this.onChange(value)}
            onEnter={value => this.props.onEnter(value)}
          />
          <span className="input-group-addon">
            <a href="javascript:;" onClick={() => this.props.query(inputValue)}>
              <Glyphicon glyph="search" /> Search
            </a>
          </span>
        </div>
      </div>
    );
  }
}

SearchInput.propTypes = propTypes;

SearchInput.defaultProps = defaultProps;

export default SearchInput;
