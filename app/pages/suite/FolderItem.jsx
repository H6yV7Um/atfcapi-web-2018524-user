import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { Glyphicon } from 'react-bootstrap';
import { DeleteDialog, Badge } from 'atfcapi';
import ReNameFolder from './ReNameFolder';
import { copyFolder, delFolder } from '../../actions/folderActions';

const propTypes = {
  name: PropTypes.string,
  id: PropTypes.number,
  change: PropTypes.bool,
  projectId: PropTypes.number,
  projectName: PropTypes.string,
  reload: PropTypes.func,
  error: PropTypes.func,
  copyFolder: PropTypes.func,
  delFolder: PropTypes.func,
};

const defaultProps = {
  name: 'New Folder',
  id: 0,
  projectId: 0,
  projectName: '',
  reload() {},
  error() {},
};

class FolderItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nowrap: true,
    };
  }

  copyFolder(id) {
    this.props.copyFolder(
      id,
      () => this.props.reload(),
      msg => this.props.error(msg)
    );
  }

  delFolder(id) {
    this.props.delFolder(
      id,
      () => this.props.reload(),
      msg => this.props.error(msg)
    );
    this.refs.delete.close();
  }

  // 文件夹名称截断 or 全部显示
  toggle() {
    this.setState({
      nowrap: !this.state.nowrap,
    });
  }

  render() {
    const nameStyle = this.state.nowrap ? {'whiteSpace': 'nowrap'} : {'whiteSpace': 'normal'};
    const { name, id, change, projectId, projectName, reload } = this.props;
    return (
      <div className="suite">
        <div className="suite-item">
          <Glyphicon glyph="edit" onClick={() => this.refs.rename.show(name)} />
          <Glyphicon glyph="trash" onClick={() => this.refs.delete.show({index: 1000, text: name})} />
          <div className="suite-folder">
            <Link to={{pathname: `/project/${projectId}/folder/${id}`, state: { projectName, folderName: name }}}>
              { change ? <Badge isDot><Glyphicon glyph="folder-open" /></Badge> : <Glyphicon glyph="folder-open" /> }
            </Link>
          </div>
        </div>
        <div className="suite-desc">
          <h5 onClick={() => this.toggle()} style={nameStyle}>{name}</h5>
          <span>
            <a href="javascript:;" onClick={() => this.copyFolder(id)}>Copy Completely</a>
            &nbsp;|&nbsp;
            <Link to={{pathname: `/project/${projectId}/folder/${id}/copy`, state: { projectName, folderName: name }}}>Copy Partly</Link>
          </span>
        </div>
        <DeleteDialog
          ref="delete"
          title="Folder"
          delete={() => this.delFolder(id)}
        />
        <ReNameFolder
          ref="rename"
          name={name}
          id={id}
          projectId={projectId}
          reload={() => reload()}
        />
      </div>
    );
  }
}

FolderItem.propTypes = propTypes;

FolderItem.defaultProps = defaultProps;

const mapStateToProps = (state) => Object.assign({}, state.folder);

export default connect(mapStateToProps, {
  copyFolder,
  delFolder,
})(FolderItem);
