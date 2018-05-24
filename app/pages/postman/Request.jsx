import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import vkbeautify from 'vkbeautify';
import { Dropdown, Tabs, ComboBox } from 'atfcapi';
import Filter from './Filter';
import KeyValueForm from './KeyValueForm';
import RequestBodyContainer from './RequestBodyContainer';
import RequestPreEditorContainer from './RequestPreEditorContainer';
import RequestValidationContainer from './RequestValidationContainer';
import Response from './Response';
import { methods, now } from '../../vendor/util';
import { contentType, bannedHeaders } from './module';

const Tab = Tabs.Tab;
const mockUrl = [
  'www.github.com',
  'www.google.com',
  'www.zcfy.cc',
];


class Request extends Component {
  constructor(props) {
    super(props);
    this.state = {
      method: 'POST',
      url: '',
      activeIndex: 0,
      showParams: false,
      showResponse: false,
      requestParams: [],
      requestHeaders: [],
      time: 0,
      status: 0,
      statusText: '',
      responseBody: '',
      responseHeaders: '',
    };
  }

  buildRequest() {
  }

  handleToggle() {
    this.setState({ showParams: !this.state.showParams });
  }

  handleChangeUrl(url) {
    this.setState({ url });
  }

  handleRequestParamsChange(value) {
    const queryString = this.generateUrl(value);
    const host = this.state.url.split('?')[0];
    this.setState({
      url: host + '?' + queryString,
      requestParams: value,
    });
  }

  handleSend() {
    const { url, method, requestParams } = this.state;
    var condi = {};

    requestParams.forEach(params => {
      if (!condi.hasOwnProperty(params.key)) {
        condi[params.key] = params.value;
      }
    })
    var startTime = now();
    // fetch无法实现abort，考虑用xhr替换

    fetch('/atfcapi/project/mainPageList', {
      method,
      body: condi,
    }).then(res => {
      const time = parseInt(now() - startTime, 10);
      const { status, statusText, headers } = res;
      const responseHeaders = [];
      for(var key of headers.keys()) {
         responseHeaders.push({
           key,
           value: headers.get(key),
         })
      }
      this.setState({
        showResponse: true,
        time,
        status,
        statusText,
        responseHeaders,
      });
      return res.text();
    }).then(text => this.setState({ responseBody: vkbeautify.json(text, 2) }))
  }

  generateOptions(ary) {
    if (Array.isArray(ary)) {
      return ary.map(x => {
        return {
          value: x,
          label: x,
        };
      });
    }
    return [];
  }

  generateUrl(requestParams) {
    const seq = '&';
    const eq = '=';
    const fields = requestParams.filter(params => params.key !== '').map(params => `${params.key}${eq}${params.value}`);
    return fields.join(seq);
  }

  render() {
    const { className } = this.props;
    const classes = classNames({
      [className]: !!className,
    });
    const { method, url, activeIndex, showParams, showResponse, requestHeaders, time, status, statusText, responseBody, responseHeaders } = this.state;

    const methodOptions = this.generateOptions(methods);

    return (
      <div className={classes}>
        <Filter />
        <div className="postman-request content-group">
          <div className="Grid Grid--gutters Grid--center">
            <div className="Grid-cell">
              <div className="InputAddOn mb0">
                <Dropdown
                  className="ml0 InputAddOn-item"
                  options={methodOptions}
                  defaultValue={method}
                  onChange={value => {
                    if (value === 'GET' && activeIndex === 2) {
                      this.setState({
                        method: value,
                        activeIndex: 0,
                      });
                    } else {
                      this.setState({ method: value });
                    }
                  }}
                />
                <ComboBox
                  inputClass="InputAddOn-field postman-request-url"
                  placeholder="Enter request URL"
                  value={url}
                  options={mockUrl}
                  onChange={value => this.handleChangeUrl(value)}
                  onSelect={value => this.handleChangeUrl(value)}
                />
                <Dropdown className="ml0 InputAddOn-item" options={[{value: 1, label: 'Env'}]} />
              </div>
            </div>
            <div className="Grid-cell Grid-cell--autoSize">
              <button className="Button Button--wide" onClick={() => this.handleToggle()} >Params</button>
              <button className="Button Button--action Button--wide" onClick={() => this.handleSend()}>Send</button>
              <button className="Button Button--wide">Save</button>
            </div>
          </div>
          <div className="postman-request-params">
            {
              showParams && <KeyValueForm disableToggle onChange={values => this.handleRequestParamsChange(values)} />
            }
          </div>
          <Tabs wrapperClassName="postman-request-content" className="Grid--justifyStart" activeIndex={activeIndex} onChange={() =>{}}>
            <Tab className="Grid-cell--autoSize" label="Headers" count={requestHeaders.filter(header => header.key && header.value).length}>
              <KeyValueForm keySuggestion={bannedHeaders} valueSuggestion={contentType} onChange={values => this.setState({ requestHeaders: values })} />
            </Tab>
            <Tab className="Grid-cell--autoSize" label="Body" showBagde={method !== 'GET'} disabled={method === 'GET'}>
              <RequestBodyContainer />
            </Tab>
            <Tab className="Grid-cell--autoSize" label="Precondition">
              <RequestPreEditorContainer />
            </Tab>
            <Tab className="Grid-cell--autoSize" label="Validation">
              <RequestValidationContainer />
            </Tab>
            <Tab className="Grid-cell--autoSize" label="Cookies">
              Cookies
            </Tab>
          </Tabs>
        </div>
        {showResponse && <Response time={time} status={status} statusText={statusText} responseBody={responseBody} responseHeaders={responseHeaders} />}
      </div>
    );
  }
}

Request.propTypes = {
  className: PropTypes.string,
};

Request.defaultProps = {

};

export default Request;
