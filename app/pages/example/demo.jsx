import React from 'react';
import ImportCases from '../batch/ImportUnitCases';
import PostMan from '../postman/';
import { AutoComplete } from 'atfcapi';
import CodeMirror from '../../components/CodeMirror';

class Demo extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  render() {
    return (
      <main>
        <ImportCases
          
        />
        {/* <CodeMirror value="123asd" options={{
        }}></CodeMirror> */}
        {/* <PostMan></PostMan> */}
        {/* <AutoComplete dataSource={["1", "2", "3", "4","5"]}></AutoComplete> */}
        {/* <div className="form-group col-xs-4">
          <label className="control-label col-xs-5">Git Version</label>
          <div className="col-xs-7">
          <Select.Creatable
          multi
          options={gitVersionOptions}
          onChange={value => this.handleSelectChange(value)}
          value={gitVersionValue}
          />
          </div>
        </div> */}
      </main>
    );
  }
}

export default Demo;
