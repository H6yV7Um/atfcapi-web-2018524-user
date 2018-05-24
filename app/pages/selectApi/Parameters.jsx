import React, { Component, PropTypes } from 'react';
import { Well } from 'react-bootstrap';
import 'json-editor';

const querystring = require('querystring');

class Parameters extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: {},
      path: '', // 保存初始化时path的值
    };
    this.editor = null;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.path !== this.props.path && !this.props.path) {
      this.setState({ path: nextProps.path })
    }
  }

  setJsonEditor(schema) {
    const jsonEditorDom = this.refs.jsonEditor;
    if (schema === null || !jsonEditorDom) return;
    schema.title = 'Parameters';
    if (jsonEditorDom.childNodes.length < 1) {
      const options = {
        theme: 'bootstrap3',
        schema: schema,
        disable_edit_json: true,
        disable_collapse: true,
        disable_properties: true,
      };
      /*global JSONEditor*/
      this.editor = new JSONEditor(jsonEditorDom, options);
      this.editor.on('change', () => {
        const value = this.editor.getValue();
        // 绑定时会触发一次
        this.handleChange(value);
        this.setState({
          value,
        });
      });
    }
  }

  getPatch(nextValue) {
    const { value } = this.state;
    let targetKey;
    if (Object.keys(value).length === 0) {
      targetKey = undefined;
    } else {
      targetKey = Object.keys(nextValue).find(key => nextValue[key] !== value[key]);
    }
    return {
      name: targetKey,
      value: nextValue[targetKey],
    };
  }

  templateRegex(path, key, value) {
    return path.replace(/{([^}]+)?}/gi, match => {
      if (match.includes(key)) {
        return value;
      }
      return match;
    })
  }

  handleChange(nextValue) {
    const { params, args, body } = this.props;
    let { path } = this.state;
    const patch = this.getPatch(nextValue);
    if (Array.isArray(params)) {
      const target = params.find(p => {
        if (p.name === patch.name) {
          return true;
        } else if (p.schema.properties && Object.keys(p.schema.properties).includes(patch.name)) {
          return true;
        }
        return false;
      });

      if (target) {
        // 参数名对应的Located in为以下一种时，触发联动
        // 根据Located in值的不同，联动的位置不同
        switch (target.in) {
        case 'body':
          var originValue;
          if (args) {
            originValue = args;
          } else if(body) {
            originValue = body;
          } else {
            originValue = {};
          }
          this.props.onBodyChange(JSON.stringify(Object.assign({}, nextValue, originValue), null, 2));
          break;
        case 'query':
          var queryObj = {};
          Object.keys(nextValue).forEach(key => {
            if (nextValue[key]) {
              // 是有效值 可以放入query里
              queryObj[key] = nextValue[key];
            }
          })
          // 得到querystring
          var query = querystring.stringify(queryObj);
          // 连接符 => 如果初始链接中包含‘?’, 那么使用‘&’，否则使用‘?’
          var connector = path.includes('?') ? '&' : '?';
          // 最终路径
          path = path + connector + query;
          this.props.onQueryChange(path);
          break;
        case 'path':
          Object.keys(nextValue).forEach(key => {
            if (nextValue[key]) {
              // 是有效值 可以替换path里面的变量
              path = this.templateRegex(path, key, nextValue[key])
            }
          })
          this.props.onPathChange(path);
          break;
        case 'header':
          // dosomthing
          break;
        default:
          break;
        }
      }
    }
  }

  render() {
    const { requestSchema } = this.props;

    const content = requestSchema ? this.setJsonEditor(requestSchema) : <div><h4>Parameters</h4><label>No data</label></div>;
    return (
      <div>
        <Well bsSize="large">
          {content}
          <div ref="jsonEditor"></div>
        </Well>
      </div>
    );
  }
}

Parameters.propTypes = {
  requestSchema: PropTypes.object,
  params: PropTypes.array,
  path: PropTypes.string,
  args: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  body: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  onBodyChange: PropTypes.func.isRequired,
  onQueryChange: PropTypes.func.isRequired,
  onPathChange: PropTypes.func.isRequired,
};

export default Parameters;
