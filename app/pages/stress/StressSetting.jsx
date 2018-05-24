import React from 'react';
import { Breadcrumb, BreadcrumbItem, Input, Button, Panel } from 'react-bootstrap';
import { Slider, Transfer, Notification, DeleteDialog, Spin } from 'atfcapi';
import fetchX from '../../vendor/Fetch';

// 压测配置 alias 对应后端参数名称
const defaultConfig = [
  { key: 'Step Number', alias: 'stepNumbers', step: 10, min: 10, max: 600 },
  { key: 'Start Number of thread', alias: 'startThread', step: 10, min: 1, max: 600 },
  { key: 'End Number of thread', alias: 'endThread', step: 10, min: 1, max: 600 },
  { key: 'Ramp-up period(in seconds)', alias: 'rampUp', step: 1, min: 0, max: 60 },
  { key: 'Duraion(in seconds)', alias: 'duration', step: 60, min: 0, max: 7200 },
  { key: 'Startup delays(in seconds)', alias: 'delays', step: 60, min: 0, max: 7200 },
];

class StressSetting extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      gitDir: '', // 当前选中的目录
      dirList: [], // git目录和压测脚本
      scriptList: [], // 脚本列表
      emails: [], // 邮箱列表
      suffix: '@ele.me', // 后缀
      mailValue: '', // xxx@ele.me
      host: '', // Server Name and IP
      port: '', // 端口号
      csv: '', //
      loaded: false,
    };
    // 初始化压测配置
    defaultConfig.forEach(item => {
      this.state[item.alias] = item.min;
    });
  }

  componentWillMount() {
    this.getDir();
  }

  // 获取压力测试git目录和压测脚本
  getDir() {
    fetchX.get('/atfcapi/pressure/getDir')
    .then(res => {
      if (res.code === '200') {
        const dirList = res.data || [];
        dirList.forEach(item => {
          item.fileObj = item.files.map(file => {
            return {
              project: item.project,
              name: file,
              chosen: false,
            };
          });
        });
        this.setState({
          dirList: dirList,
          loaded: true,
        });
      } else {
        this.setState({
          loaded: true,
        });
        Notification.error(res.msg || res.message);
      }
    }).catch(err => {
      Notification.error(err.message);
      setTimeout(() => this.setState({
        loaded: true,
      }));
    });
  }

  /**
   * 压测配置
   * @return {[type]} [description]
   */
  getConfig() {
    const { csv } = this.state;
    const config = defaultConfig.map((item, index) => {
      const slideValue = this.state[item.alias];
      const { key, alias, step, min, max } = item;
      return (
        <div className="clearfix stress-config" key={index}>
          <Input
            type="text"
            label={key}
            labelClassName="col-xs-4"
            wrapperClassName="col-xs-2"
            value={slideValue}
            disabled
          />
          <div className="col-xs-6">
            <Slider
              className="mt-5"
              min={min}
              max={max}
              step={step}
              value={slideValue || 0}
              onChange={value => this.handleSlide(value, alias)}
            />
          </div>
        </div>
      );
    });

    return (
      <section className="col-xs-6 stress">
        <div className="clearfix stress-config">
          <Input
            type="text"
            name="key"
            label={'CSV'}
            labelClassName="col-xs-4"
            wrapperClassName="col-xs-2"
            value={csv}
            onChange={e => this.setState({ csv: e.target.value })}
          />
        </div>
        {config}
      </section>
    );
  }

  /**
   * Host & Port
   * @return {[type]} [description]
   */
  getHost() {
    const { host, port } = this.state;
    return (
      <section className="col-xs-6 stress-config">
        <Input
          type="text"
          name="key"
          label={'Server Name and IP'}
          labelClassName="col-xs-4"
          wrapperClassName="col-xs-8"
          groupClassName="clearfix"
          value={host}
          onChange={e => this.setState({ host: e.target.value })}
        />
        <Input
          type="text"
          name="key"
          label={'Port Number'}
          labelClassName="col-xs-4"
          wrapperClassName="col-xs-8"
          groupClassName="clearfix"
          value={port}
          onChange={e => this.setState({ port: e.target.value })}
        />
      </section>
    );
  }

  /**
   * 脚本配置
   * @return {[type]} [description]
   */
  getTransfer() {
    const { gitDir, dirList, scriptList } = this.state;
    let finaldata = [];

    for (let i = 0; i < dirList.length; i++) {
      if (dirList[i].project === gitDir) {
        // 切换项目列表时为了保持脚本顺序不变，
        // 取出当前目录的未选中项
        finaldata = finaldata.concat(dirList[i].fileObj.filter(item => !item.chosen));
      }
    }
    // 遍历取出所有已选中项并组合
    finaldata = finaldata.concat(scriptList);
    const titles = ['Script list', 'Script order'];

    const dirLi = dirList.map( (item, index) =>
      <li key={index} onClick={() => this.changeDir(item.project)}><a href="javascript:;">{item.project}</a></li>
    );

    return (
      <section className="col-xs-6">
        <div className="transfer" style={{'marginRight': '10px'}}>
          <div className="transfer-list">
            <div className="transfer-list-header">
              <span className="info">Item list ({gitDir})</span>
            </div>
            <div className="transfer-list-body">
              <ul>
                { dirLi }
              </ul>
            </div>
          </div>
        </div>
        <Transfer titles={titles} data={finaldata} onChange={(data) => this.changeScript(data)} />
      </section>
    );
  }

  /**
   * 邮箱配置
   * @return {[type]} [description]
   */
  getMail() {
    const { emails, suffix, mailValue } = this.state;

    return (
      <section className="col-xs-4">
        <div className="transfer" style={{'float': 'right'}}>
          <div className="transfer-list" style={{'width': '360px'}}>
            <div className="transfer-list-header">
              <span className="info">Mail List</span>
              <Input
                type="text"
                name="key"
                wrapperClassName="mail col-xs-8"
                value={mailValue}
                onChange={e => {this.setState({ mailValue: e.target.value });}}
                onKeyUp={e => this.addEmail(e)}
                addonAfter={<span>{suffix}</span>}
              />
            </div>
            <div className="transfer-list-body">
              <ul>
                {
                  emails.map((item, index) =>
                    <li key={index}>
                      <a href="javascript:;">{item}</a>
                      <a
                        className="selected" onClick={() =>
                          this.refs.delete.show({text: 'Mail address:' + item, data: index})
                        }
                        href="javascript:;"
                      >
                        delete
                      </a>
                    </li>
                  )
                }
              </ul>
            </div>
          </div>
        </div>
      </section>
    );
  }

   // Slider 滑动
  handleSlide(value, key) {
    this.setState({
      [key]: value,
    });
  }

  // 切换脚本目录
  changeDir(dirname) {
    this.setState({
      gitDir: dirname,
    });
  }

  // 添加邮箱
  addEmail(e) {
    if (e.keyCode === 13) {
      const prefix = e.target.value.trim();
      const { emails, suffix } = this.state;
      const email = prefix + suffix;
      const reg = /^[A-Za-z0-9\.]+$/g;
      if (!prefix) {
        Notification.info('space does not permit');
        return;
      }
      if (emails.indexOf(email) > -1) {
        Notification.error('Add not allowed to repeat');
        return;
      }
      if (!reg.test(prefix)) {
        Notification.error('E-mail addresses are only supported characters, numbers, and "."');
        return;
      }
      emails.push(email);
      this.setState({
        emails,
        mailValue: '',
      });
    }
  }

  // 移除邮箱列表某一项
  removeEmail(index) {
    const { emails } = this.state;
    emails.splice(index, 1);
    this.setState({
      emails,
    });
    this.refs.delete.close();
  }

  // Transfer 的onChange事件
  changeScript(data) {
    this.setState({scriptList: data.chosen});
  }

  fireJob() {
    const { scriptList } = this.state;
    if (scriptList.length === 0) {
      Notification.info('no script');
      return;
    }
    const projectList = scriptList.map(item => item.project);
    fetchX.fetch('/atfcapi/pressure/job', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectList),
    }).then(json => {
      if (json.code === '200') {
        Notification.success(json.msg);
      } else {
        Notification.error(json.msg || json.message);
      }
    })
    .catch(err => Notification.error(err.message));
  }

  saveJob() {
    const { csv, stepNumbers, startThread, endThread, rampUp, duration, delays, host, port, emails, scriptList } = this.state;
    if (scriptList.length === 0) {
      Notification.info('no script');
      return;
    }
    const condi = {
      csv,
      stepNumbers,
      startThread,
      endThread,
      rampUp,
      duration,
      delays,
      host,
      port,
      files: scriptList.map(item => {
        return {
          project: item.project,
          files: item.name,
        };
      }),
      emails: emails.toString(),
    };
    fetchX.fetch('/atfcapi/pressure/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(condi),
    }).then(json => {
      if (json.code === '200') {
        Notification.success(json.msg);
      } else {
        Notification.error(json.msg || json.message);
      }
    }).catch(err => Notification.error(err.message));
  }

  render() {
    const config = this.getConfig();
    const host = this.getHost();
    const transfer = this.getTransfer();
    const mail = this.getMail();
    const operation = (
      <section className="col-xs-2">
        <div className="btn-container">
          <Button bsSize="xsmall" bsStyle="success" className="btn-fire" onClick={() => this.fireJob()}>
            Fire Job
          </Button>
          <Button bsSize="xsmall" bsStyle="success" onClick={() => this.saveJob()}>
            Save Job Template
          </Button>
        </div>
      </section>
    );
    return (
      <main>
        <Breadcrumb>
          <BreadcrumbItem href="#">
            Home
          </BreadcrumbItem>
          <BreadcrumbItem active>
            Stress Setting
          </BreadcrumbItem>
        </Breadcrumb>
        <Panel>
          {config}
          {host}
        </Panel>
        <Panel>
          {transfer}
          {mail}
          {operation}
          <DeleteDialog
            ref="delete"
            title="Mail List"
            delete={target => this.removeEmail(target.data)}
          />
        </Panel>
        {this.state.loaded ? '' : <Spin />}
      </main>
    );
  }
}

export default StressSetting;
