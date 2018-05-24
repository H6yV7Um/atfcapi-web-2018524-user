import React, { Component, PropTypes } from 'react';

import PreConditionForm from './PreConditionForm';

class RequestPreEditorContainer extends Component {
  constructor(props) {
    super(props);
  }


  generateOptions(ary, label, value) {
    if (Array.isArray(ary)) {
      return ary.map(x => {
        if (typeof x === 'string') {
          return {
            label: x,
            value: x,
          };
        }
        return {
          label: x[label],
          value: x[value],
        };
      });
    }
    return [];
  }

  render() {
    return (
      <PreConditionForm

        onChange={() => {}}
      />
    );
  }
}

RequestPreEditorContainer.propTypes = {
  className: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

RequestPreEditorContainer.defaultProps = {
  onChange() {},
};

export default RequestPreEditorContainer;
