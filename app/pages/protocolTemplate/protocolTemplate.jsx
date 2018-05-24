import React from 'react';
import { Breadcrumb, BreadcrumbItem, Panel } from 'react-bootstrap';

class ProtocolTemplate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      protocolTemplate: '',
    };
  }

  componentDidMount() {
    this.loadFile(this.props.params.type);
  }

  componentWillReceiveProps(nextProps) {
    const type = nextProps.params.type;
    if (type !== this.props.params.type) {
      this.loadFile(nextProps.params.type);
    }
  }

  loadFile(type) {
    let url;
    if (type === 'md') {
      url = 'pages/protocolTemplate/demo.md';
    } else if (type === 'yml') {
      url = 'pages/protocolTemplate/demo.yml';
    } else {
      url = 'pages/protocolTemplate/demo.thrift';
    }

    fetch(url + '?text').then(res => {
      if (res.ok) {
        return res.text();
      }
    }).then(text => this.setState({ protocolTemplate: text }));
  }

  buildLoadLink() {
    const { type } = this.props.params;
    let loadLink;
    if (type === 'md') {
      loadLink = <a href="/pages/protocolTemplate/demo.md" download="demo.md">md template download</a>;
    } else if (type === 'yml') {
      loadLink = <a href="pages/protocolTemplate/demo.yml" download="demo.yml">yml template download</a>;
    } else {
      loadLink = <a href="pages/protocolTemplate/demo.thrift" download="demo.thrift">thrift template download</a>;
    }
    return loadLink;
  }

  render() {
    const { protocolTemplate } = this.state;
    const { type } = this.props.params;
    const title = type + ' template';
    const loadLink = this.buildLoadLink();
    return (
      <div id="protocolTemplate">
        <Breadcrumb>
          <BreadcrumbItem href="#">
            Home
          </BreadcrumbItem>
          <BreadcrumbItem active>
            Protocol Template
          </BreadcrumbItem>
        </Breadcrumb>
        <Panel header={title}>
          { loadLink }
          <div id="template">
            <pre>
              { protocolTemplate }
            </pre>
          </div>
        </Panel>
      </div>
    );
  }
}

ProtocolTemplate.propTypes = {
  params: React.PropTypes.object,
};

export default ProtocolTemplate;
