import React, { Component, PropTypes } from 'react';
import { Input, Breadcrumb, BreadcrumbItem, Table, Button, Modal } from 'react-bootstrap';
import Notification from '../../components/Notification';
import fetchX from '../../vendor/Fetch';

class CopyCaseList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loginModalShow: false,
      projects: [],
      suites: [],
      sourceSections: [],
      cases: [],
      targetSections: [],
      loading: false,
      selectedProId: 0,
      selectedSuiId: 0,
      selectedSrcSecId: 0,
      selectedtgtSecId: 0,
      selectedCaseIds: [],
      condi: {},
      testRailUser: '',
      testRailPwd: '',
    };
  }

  componentDidMount() {
    this.handleRedirect(this.props.params.type);
  }

  componentWillReceiveProps(nextProps) {
    const str = nextProps.params.type;
    this.handleRedirect(str);
  }

  getAllSuites(selectedProId) {
    if (!selectedProId) {
      return;
    }
    const condi = this.state.condi;
    fetchX.post(`/atfcapi/testRail/getAllSuites/${selectedProId}`, condi)
    .then(json => {
      if (json.code === '200') {
        this.setState({
          suites: json.data || [],
        });
      } else {
        Notification.error(json.msg || json.message);
      }
    }).catch(err => Notification.error(err.message));
  }

  getTargetSections(suiteId) {
    if (!suiteId) {
      return;
    }
    const condi = this.state.condi;
    condi.suiteId = suiteId;
    fetchX.post(`/atfcapi/testRail/getAllSections/${this.state.selectedProId}`, condi)
    .then(json => {
      if (json.code === '200') {
        this.setState({
          sourceSections: json.data || [],
        });
      } else {
        Notification.error(json.msg || json.message);
        return;
      }
    }).catch(err => Notification.error(err.message));
  }

  fetchData(isFromLogin) {
    // 用户是否登录，从cookie中取user、passwd
    const url = 'https://testrail.ele.me/testrail';
    const cookieArr = document.cookie.split(';');
    let user;
    let passwd;
    for (let i = 0; i < cookieArr.length; i++) {
      const arr = cookieArr[i].split('=');
      if (arr[0].trim() === 'user') {
        user = arr[1];
      } else if (arr[0].trim() === 'passwd') {
        passwd = arr[1];
      }
    }
    if (!document.cookie || !user || !passwd) {
      this.setState({
        loginModalShow: true,
      });
      return;
    }
    const condi = {
      'url': url,
      'user': user,
      'passwd': passwd,
    };
    this.setState({
      condi: condi,
    });
    if (!user || !passwd) {// 没有cookie，弹出登录modal，根据用户输入值
      this.setState({
        loginModalShow: true,
      });
    } else { // 有cookie，调用接口获取projects
      fetchX.get('/atfcapi/testRail/getAllProjects', condi)
      .then(json => {
        if (json.code === '200') {
          if (isFromLogin) {
            Notification.success('登录成功！');
          }
          this.setState({
            projects: json.data || [],
            loginModalShow: false,
          });
        } else if (json.code === '401') {// 登录账户、密码不正确
          Notification.info('用户名或者密码错误，请重新输入!');
          this.setState({
            loginModalShow: true,
          });
          return;
        } else {// 其他失败情况
          Notification.error(json.msg || json.message);
        }
      }).catch(err => Notification.error(err.message));
    }
  }

  handleSearch(e, sourceSectionId) {// get all cases
    const condi = this.state.condi;
    condi.suiteId = this.state.selectedSuiId;
    condi.sourceSectionId = sourceSectionId;
    if (!sourceSectionId || !condi.suiteId) {
      Notification.error('请选择全部三项筛选条件后再进行查询操作!');
      return;
    }
    fetchX.post(`/atfcapi/testRail/getAllCases/${this.state.selectedProId}`, condi)
    .then(json => {
      if (json.code === '200') {
        this.setState({
          cases: json.data || [],
        });
      } else {
        Notification.error(json.msg || json.message);
      }
    }).catch(err => Notification.error(err.message));
  }

  handleRedirect(type) {
    if (type === 'login') {// 用户点击copy case，写入cookie，获取data
      this.fetchData(false);
    } else {// 用户点击logout，清理cookie，跳转到首页
      this.handleLogout();
    }
  }

  handleLogin() {
    // 获取用户输入，写入cookie
    const user = this.state.testRailUser;
    const passwd = this.state.testRailPwd;
    if (!user || !passwd) {
      Notification.info('The user name and password cannot be empty!');
      return;
    }
    const exp = new Date();
    exp.setTime(exp.getTime() + 2 * 60 * 60 * 1000);
    document.cookie = 'user=' + user + ';expires=' + exp.toGMTString();
    document.cookie = 'passwd=' + passwd + ';expires=' + exp.toGMTString();
    this.hideLoginModal();
    this.fetchData(true);
  }

  handleLogout() {
    // 用户点击logout，清理cookie，跳转到首页
    document.cookie = 'user=;';
    document.cookie = 'passwd=;';
    window.location.href = '#';
  }

  hideLoginModal() {
    this.setState({
      loginModalShow: false,
    });
  }

  loginInputChange(e) {
    const state = this.state;
    const target = e.target;
    state[target.name] = target.value;
    this.setState(state);
  }

  clearLoginInput() {
    this.setState({
      testRailUser: '',
      testRailPwd: '',
    });
  }

  handleChange(event) {
    const target = event.target;
    const targetValue = parseInt(target.value, 10);
    if (!targetValue) {// 当下拉选择"--"时清空下一个下拉框的内容
      if (target.name === 'selectedProId') {
        this.setState({
          suites: [],
          sourceSections: [],
        });
      } else if (target.name === 'selectedSuiId') {
        this.setState({
          sourceSections: [],
          targetSections: [],
        });
      }
    }
    switch (target.name) {
    case 'selectedProId':
      this.setState({
        selectedProId: targetValue,
        selectedSuiId: 0,
        selectedSrcSecId: 0,
      }, this.getAllSuites(targetValue));
      break;
    case 'selectedSuiId':
      this.setState({
        selectedSuiId: targetValue,
        selectedSrcSecId: 0,
      }, this.getTargetSections(targetValue));
      break;
    case 'selectedtgtSecId':
      this.setState({
        selectedtgtSecId: targetValue,
      });
      break;
    default:
      this.setState({
        selectedSrcSecId: targetValue,
      });
    }
  }

  selectCase(e) {
    const target = e.target;
    if (target.className === 'caseInput') {
      target.className = 'caseInput checked';
    } else {
      target.className = 'caseInput';
    }
  }

  copyAllCases() {
    const suiteId = this.state.selectedSuiId;
    const sourceSectionId = this.state.selectedSrcSecId;
    const targetSectionId = this.state.selectedtgtSecId;
    if (!sourceSectionId) {
      Notification.info('Please select the Source Section!');
      return;
    }
    if (!targetSectionId) {
      Notification.info('Please select the Target Section !');
      return;
    }
    if (sourceSectionId === targetSectionId) {
      Notification.info('Target Section and Source Section can not be the same，Please select again!');
      return;
    }
    const condi = this.state.condi;
    condi.suiteId = suiteId;
    condi.sourceSectionId = sourceSectionId;
    condi.targetSectionId = targetSectionId;
    // 调接口
    fetchX.post(`/atfcapi/testRail/copyAllCases/${this.state.selectedProId}`, condi)
    .then(json => {
      if (json.code === '200') {
        Notification.success('拷贝成功');
      } else {
        Notification.error(json.msg || json.message);
      }
    }).catch(err => Notification.error(err.message));
  }

  copySelectedCases() {
    const selectedCaseIds = [];
    const checkedCases = document.querySelectorAll('.caseInput.checked');
    const sourceSectionId = this.state.selectedSrcSecId;
    const targetSectionId = this.state.selectedtgtSecId;
    if (!sourceSectionId) {
      Notification.info('Please select the Source Section !');
      return;
    }
    if (!targetSectionId) {
      Notification.info('Please select the Target Section!');
      return;
    }
    if (sourceSectionId === targetSectionId) {
      Notification.info('Target Section and Source Section can not be the same，Please select again!');
      return;
    }
    if (checkedCases.length) {// 当用户选择case不为0个时，循环将caseid存进数组
      for (let i = 0; i < checkedCases.length; i++) {
        selectedCaseIds.push(parseInt(checkedCases[i].id, 10));
      }
    } else {
      Notification.info('Please select case!');
      return;
    }
    const condi = this.state.condi;
    condi.targetSectionId = targetSectionId;
    condi.caseIds = selectedCaseIds;
    // 调接口
    fetchX.post('/atfcapi/testRail/copyCases')
    .then(json => {
      if (json.code === '200') {
        Notification.success(json.msg);
      } else {
        Notification.error(json.msg || json.message);
      }
    }).catch(err => Notification.error(err.message));
  }

  toCaseDetial() {
    const url = this.state.condi.url;
    const suiteId = this.state.selectedSuiId;
    const targetSectionId = this.state.selectedtgtSecId;
    if (!targetSectionId || !suiteId) {
      Notification.info('Please select Target Section and Suite!');
      return;
    }
    window.location.href = url + '/index.php?/suites/view/' + suiteId +
    '&group_by=cases:section_id&group_order=asc&group_id=' + targetSectionId;
  }

  render() {
    const {loginModalShow, projects, suites, sourceSections, cases, loading, selectedProId, selectedSuiId, selectedSrcSecId, selectedtgtSecId, testRailUser, testRailPwd } = this.state;
    const projectOption = projects.map( item =>
      <option key={item.id} value={item.id}>{item.name}</option>
    );
    const suiteOption = suites.map( item =>
      <option key={item.id} value={item.id}>{item.name}</option>
    );
    const sourceSectionOption = sourceSections.map( item =>
      <option key={item.id} value={item.id}>{item.name}</option>
    );

    const casesTrs = cases.map( item =>
      <tr key={item.id}>
        <th><input className="caseInput" onClick={e => this.selectCase(e)} type="checkbox" id={item.id} /></th>
        <th>C{item.id}</th>
        <th>{item.title}</th>
      </tr>
    );

    return (
      <div id="CopyCaseList">
        <Breadcrumb>
          <BreadcrumbItem href="#">
            Home
          </BreadcrumbItem>
          <BreadcrumbItem active>
            Copy Case
          </BreadcrumbItem>
        </Breadcrumb>
        <Modal dialogClassName="response-modal" bsSize="large" backdrop="static" show={loginModalShow} onHide={() => this.handleLogout()}>
          <Modal.Header closeButton>
            <Modal.Title>TestRail Login</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form className="form-horizontal">
              <Input
                type="text"
                name="testRailUrl"
                value="https://testrail.ele.me/testrail"
                label="TestRail Url"
                readOnly
                labelClassName="col-xs-3"
                wrapperClassName="col-xs-7"
              />
              <Input
                type="text"
                name="testRailUser"
                value={testRailUser}
                onChange={e => this.loginInputChange(e)}
                label="TestRail User"
                labelClassName="col-xs-3"
                wrapperClassName="col-xs-7"
              />
              <Input
                type="password"
                name="testRailPwd"
                value={testRailPwd}
                onChange={e => this.loginInputChange(e)}
                label="TestRail Password"
                labelClassName="col-xs-3"
                wrapperClassName="col-xs-7"
              />
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              disabled={loading}
              bsStyle="primary"
              onClick={() => this.handleLogin()}
            >
              Login
            </Button>
            <Button onClick={() => this.clearLoginInput()}>
              Clear
            </Button>
          </Modal.Footer>
        </Modal>
        <form className="form-horizontal copy-case-filter">
          <Input
            type="select"
            label="Project"
            name="selectedProId"
            labelClassName="col-xs-4"
            wrapperClassName="col-xs-8"
            value={selectedProId}
            onChange={e => this.handleChange(e)}
          >
            <option value="0">--</option>
            {projectOption}
          </Input>
          <Input
            type="select"
            label="Suite"
            name="selectedSuiId"
            labelClassName="col-xs-3"
            wrapperClassName="col-xs-8"
            value={selectedSuiId}
            onChange={e => this.handleChange(e)}
          >
            <option value="0">--</option>
            {suiteOption}
          </Input>
          <Input
            type="select"
            label="Source Section"
            labelClassName="col-xs-4"
            wrapperClassName="col-xs-8"
            name="selectedSrcSecId"
            value={selectedSrcSecId}
            onChange={e => this.handleChange(e)}
          >
            <option value="0">--</option>
            {sourceSectionOption}
          </Input>
          <Button className="search-btn" bsStyle="primary" onClick={(e) => this.handleSearch(e, selectedSrcSecId)}>Search</Button>
        </form>
        <Table bordered condensed stripped hover>
          <thead>
            <tr>
              <th>Selection</th>
              <th>Case ID</th>
              <th>Case Title</th>
            </tr>
          </thead>
          <tbody>
            { cases.length > 0 ? casesTrs : <tr className="nodata"><td colSpan="5">No data</td></tr> }
          </tbody>
        </Table>
        <form className="form-horizontal copy-case-filter">
          <Input
            type="select"
            label="Target Section"
            labelClassName="col-xs-3"
            wrapperClassName="col-xs-9"
            name="selectedtgtSecId"
            value={selectedtgtSecId}
            onChange={e => this.handleChange(e)}
          >
            <option value="0">--</option>
            {sourceSectionOption}
          </Input>
          <Button bsStyle="primary" className="right-margin" onClick={e => this.copyAllCases(e)}>Copy All Cases</Button>
          <Button bsStyle="primary" className="right-margin" onClick={e => this.copySelectedCases(e)}>Copy Selected Cases</Button>
          <Button bsStyle="primary" className="right-margin" onClick={() => this.toCaseDetial()}>Target section Case Detail Info</Button>
        </form>
        <div className="mask"></div>
      </div>

    );
  }
}

CopyCaseList.propTypes = {
  params: PropTypes.object,
};

export default CopyCaseList;
