import React from 'react';
import { Navbar, Nav, NavDropdown, NavItem, MenuItem } from 'react-bootstrap';

let navbars = null;

class Header extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    // navbars中的key对应每一个导航下拉菜单
    //{ 'title': 'appid regist', 'href': '#/regist/appidRegist' },
    //{ 'title': 'ip regist', 'href': '#/regist/ipRegist' },
    navbars = {
      'Project': [
        { 'title': 'New Project', 'onClick': this.props.showCreate },
        { 'title': 'Project List', 'href': '#' },
      ],
      'API': [
        { 'title': 'New API', 'href': '#/api/new' },
        { 'title': 'API List', 'href': '#/api/list' },
      ],
      'Header': '#/header/list',
      'Upload File': [
        { 'title': 'Upload File', 'onClick': this.props.showUpload },
        { 'title': 'Import SOA', 'href': '#/upload/ImportSoa' },
      ],
      'Test Rail': [
        { 'title': 'Copy Case', 'href': '#/copyCase/CopyCaseList/login' },
        { 'title': 'Log Out', 'href': '#/copyCase/CopyCaseList/logout' },
      ],
      'Template': [
        { 'title': 'md', 'href': '#/protocolTemplate/protocolTemplate/md' },
        { 'title': 'yml', 'href': '#/protocolTemplate/protocolTemplate/yml' },
        { 'title': 'thrift', 'href': '#/protocolTemplate/protocolTemplate/thrift' },
      ],
      'Stress': [
        { 'title': 'Stress Setting', 'href': '#/stress/StressSetting' },
        { 'title': 'HAR To JMX', 'href': '#/stress/HarToJmx' },
      ],
      'DB': [
        { 'title': 'DB Configuration', 'href': '#/dbConfig/config/newDbConfig' },
        { 'title': 'DB Configuration List', 'href': '#/dbConfig/DbConfigList' },
      ],
      'Batch': [
        { 'title': 'Import Case', 'href': '#/batch/ImportCase' },
        { 'title': 'Import UnitCase', 'href': '#/batch/ImportUnitCase' },
        { 'title': 'Log Replay', 'href': '#/batch/LogReplay' },
      ],
      'Case Summary': [
        { 'title': 'Case Failed List', 'href': '#/case/failures' },
      ],
      'Regist Center': '#/regist/ipRegister',
      'Pict': [
        { 'title': 'TestCase Select', 'href': '#/pict/testCaseSelect' },
        { 'title': 'TestCase Show', 'href': '#/pict/testCaseShow' }
      ]
    }
  }

  render() {
    return (
      <Navbar inverse fluid>
        <Navbar.Header>
          <Navbar.Brand>
            <a href="#">atfcAPI</a>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav>
            {
              Object.keys(navbars).map((key, index) => {
                if (Array.isArray(navbars[key])) {
                  return (
                    <NavDropdown eventKey={index} title={key}>
                      {
                        navbars[key].map((item, idx) => {
                          const { href, onClick } = item;
                          const restProps = {
                            href,
                            onClick,
                          };
                            return  <MenuItem eventKey={idx} {...restProps}>{item.title}</MenuItem>
                        })
                      }
                    </NavDropdown>
                  )
                }
                  return <NavItem eventKey={index} href={navbars[key]}>{key}</NavItem>
              })
            }
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

Header.propTypes = {
  showCreate: React.PropTypes.func,
  showUpload: React.PropTypes.func,
};

export default Header;
