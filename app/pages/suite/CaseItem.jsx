import React from 'react';

const propTypes = {
  checked: React.PropTypes.bool,
  onChange: React.PropTypes.func,
  id: React.PropTypes.number,
  title: React.PropTypes.string,
  description: React.PropTypes.string,
};

const defaultProps = {
  checked: false,
  onChange() {},
  id: 0,
  title: '',
  description: '',
};

class CaseItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: this.props.checked,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.checked !== this.props.checked) {
      this.setState({
        checked: nextProps.checked,
      });
    }
  }

  toggle() {
    const { checked } = this.state;
    this.setState({
      checked: !checked,
    }, () => this.props.onChange(!checked));
  }

  render() {
    const { checked } = this.state;
    return (
      <div className="case">
        <input type="checkbox" name="case" checked={checked} value={this.props.id} onChange={() => this.toggle()} />
        <div className="case-content">
          <h5>{this.props.title}</h5>
          <p title={this.props.description}>{this.props.description}</p>
        </div>
      </div>
    );
  }
}

CaseItem.propTypes = propTypes;

CaseItem.defaultProps = defaultProps;

export default CaseItem;
