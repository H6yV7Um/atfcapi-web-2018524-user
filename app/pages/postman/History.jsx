import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import IndexedDB from './IndexedDBUtil'

class History extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: true,
      searchContent: '',
      list: [],
    };
  }

  handleToggle() {
    this.setState({
      open: !this.state.open,
    });
  }

  componentDidMount() {
    IndexedDB.open();
    this.getDataFromDB();
  }
  
  getDataFromDB() {
    IndexedDB.getAll((results) => {
      this.setState({
        list: results,
      });
    });
  }

  onClickHistory() {
    //mock data
    const data = {
      id: 1,
      date: "2016-12-29",
      method: "POST",
      url: "http://www.elenet.me",
    };
    IndexedDB.add(data, () => {
      this.getDataFromDB();
    });
  }

  search() {
    const { searchConent } = this.state;
    //搜索url
    IndexedDB.getData(searchConent, (results) => {
      this.setState({
        list: results
      });
    });
  }

  handleChange(e){
    const value = e.target.value;
    this.setState({
      searchConent: value,
    });
  }
  

  delete(id) {
    IndexedDB.deleteById(id, () => {
      this.getDataFromDB();
    });
  }

  getHistoryList(list) {
    let newList = [];
    let map = new Map();

    for (let i = 0; i < list.length; i++) {
      if (map.has(list[i].date)) {
        map.get(list[i].date).push(list[i]);
      } else {
        map.set(list[i].date, [list[i]]);
      }
    }

    for (let value of map.values()) {
      newList.push(value);
    }

    return newList;
  }

  buildHistory() {
    const list = this.getHistoryList(this.state.list);
    return list.map((item, index) =>
      <div className="postman-history-list-group" key={index}>
        <strong className="history-item__title">{ item[index].date }</strong>
        {
          item.map((h, index) =>
            <div className="Media history-item__items" key={index}>
              <span className={`Media-figure request-method--${h.method}`}>
                {h.method}
              </span>
              <div className="Media-body">
                <p>{`${h.url}`}</p>
              </div>
              <span className="glyphicon glyphicon-remove remove-btn" onClick={() => this.delete(h.id)}></span>
            </div>
          )
        }
      </div>
    );
  }

  render() {
    const { className } = this.props;
    const classes = classNames({
      [className]: !!className,
    });
    const { open } = this.state;
    return (
      open ?
        <div className={classes} style={{position: 'relative'}}>
          <div className="postman-history-menu">
            <h4 onClick={() => this.onClickHistory()}>History</h4>
            <span className="glyphicon glyphicon-chevron-left close-menu" onClick={() => this.handleToggle()}></span>
            <div className="InputAddOn">
              <button className="InputAddOn-item" onClick={() => this.search()}>
                <span className="glyphicon glyphicon-search"></span>
              </button>
              <input className="InputAddOn-field" onChange={e => this.handleChange(e)} />
            </div>
          </div>
          <div className="postman-history-list">
            {this.buildHistory()}
          </div>
        </div>
        :
        <span className="glyphicon glyphicon-chevron-right open-menu" onClick={() => this.handleToggle()}></span>
    );
  }
}

History.propTypes = {
  className: PropTypes.string,
};

History.defaultProps = {

};

export default History;
