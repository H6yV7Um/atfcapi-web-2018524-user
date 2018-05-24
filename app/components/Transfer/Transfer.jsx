import React from 'react';
import { Button, Glyphicon } from 'react-bootstrap';

const defaultProps = {
  height: 220,
  data: [],
  titles: ['未选中', '已选中'],
  onChange: function() {},
};

const propTypes = {
  titles: React.PropTypes.array,
  data: React.PropTypes.array,
  onChange: React.PropTypes.func,
};

class Transfer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      chosen: props.data.filter(item => item.chosen), // 已选择 右侧
      unChosen: props.data.filter(item => !item.chosen), // 未选择 左侧
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!this.isEqual(nextProps.data, this.props.data)) {
      this.setState({
        chosen: nextProps.data.filter(item => item.chosen),
        unChosen: nextProps.data.filter(item => !item.chosen),
      });
    }
  }

  isEqual(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  handleTransfer(e, direction) {
    let { chosen, unChosen } = this.state;
    let output = {};
    if (direction === 'left') {
      output = this.changeChosenData(chosen, unChosen);
      chosen = output.source;
      unChosen = output.target;
    } else {
      output = this.changeChosenData(unChosen, chosen);
      unChosen = output.source;
      chosen = output.target;
    }

    this.setState({
      chosen,
      unChosen,
    }, () => {
      this.props.onChange(this.state);
    });
  }

  /**
   * arr1中选中项移动到arr2
   * @param  {[array]} arr1 [源数组]
   * @param  {[array]} arr2 [目标数组]
   * @return {[object]}      [移动后的新数组]
   */
  changeChosenData(arr1, arr2) {
    const source = arr1.filter(item => !item.selected);
    const target = arr2.concat(arr1.filter(item => item.selected).map(item => {
      item.chosen = !item.chosen;
      item.selected = false;
      return item;
    }));
    return {
      source,
      target,
    };
  }

  checkAll(direction) {
    const { chosen, unChosen } = this.state;
    if (direction === 'left') {
      unChosen.forEach(item => item.selected = true);
      this.setState({
        unChosen,
      });
    } else {
      chosen.forEach(item => item.selected = true);
      this.setState({
        chosen,
      });
    }
  }

  handleItemClick(e) {
    const { chosen, unChosen } = this.state;
    const index = e.currentTarget.getAttribute('data-index');
    const direction = e.currentTarget.getAttribute('data-direction');
    if (direction === 'left') {
      unChosen[index].selected = !unChosen[index].selected;
    } else {
      chosen[index].selected = !chosen[index].selected;
    }
    this.setState({
      chosen,
      unChosen,
    });
  }

  buildList(direction) {
    const { titles } = this.props;
    return (
      <div className="transfer-list">
        <div className="transfer-list-header">
          <span className="info">{titles[direction === 'left' ? 0 : 1]}</span>
          <Button bsSize="xsmall" onClick={() => this.checkAll(direction)}>All</Button>
        </div>
        <div className="transfer-list-body">
          <ul>
            {this.buildItem(direction)}
          </ul>
        </div>
      </div>
    );
  }

  /**
   * 生成列表项
   * @return {[type]} [description]
   */
  buildItem(direction) {
    const { chosen, unChosen } = this.state;
    if (direction === 'left') {
      return unChosen.map((item, index) => {
        return (
          <li key={index} data-direction={direction} data-index={index} onClick={e => this.handleItemClick(e)}>
            <a className={item.selected ? 'selected' : ''} href="javascript:;" title={item.description}>{item.name}</a>
          </li>
        );
      });
    }
    return chosen.map((item, index) => {
      return (
        <li key={index} data-direction={direction} data-index={index} onClick={e => this.handleItemClick(e)}>
          <a className={item.selected ? 'selected' : ''} href="javascript:;" title={item.description}>{item.name}</a>
        </li>
      );
    });
  }

  render() {
    const { chosen, unChosen } = this.state;
    const leftList = this.buildList('left');
    const rightList = this.buildList('right');
    const disabledLeft = !chosen.some(item => item.selected); // 禁用左转换按钮
    const disabledRight = !unChosen.some(item => item.selected); // 禁用右转换按钮
    return (
      <div className="transfer">
        {leftList}
        <div className="transfer-opt">
          <Button bsSize="xsmall" onClick={(e) => this.handleTransfer(e, 'left')} bsStyle={disabledLeft ? 'default' : 'success'} disabled={disabledLeft}>
            <Glyphicon glyph="chevron-left" />
          </Button>
          <br />
          <Button bsSize="xsmall" onClick={(e) => this.handleTransfer(e, 'right')} bsStyle={disabledRight ? 'default' : 'success'} disabled={disabledRight}>
            <Glyphicon glyph="chevron-right" />
          </Button>
        </div>
        {rightList}
      </div>
    );
  }
}

Transfer.propTypes = propTypes;

Transfer.defaultProps = defaultProps;

export default Transfer;
