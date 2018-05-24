import React from 'react';
import ReactDOM from 'react-dom';
import { Modal, Button } from 'react-bootstrap';

export default function confirm(config) {
  // 获取配置
  // confirmText, cancelText, title, content, okCancel => 确认文本、取消文本、标题、描述内容、是否显示footer(确认、取消)
	const props = { ...config };
  // 创建一个容器节点
  let div = document.createElement('div');
  document.body.appendChild(div);
  // 存储Modal
  let d;
  // 确认或取消时调用的函数
  function close() {
    d.setState({
      show: false,
    })
    ReactDOM.unmountComponentAtNode(div);

    div.parentNode.removeChild(div);
  }

  function handleCancel() {
    let cancelFn = props.onCancel;

    if (cancelFn) {
      let ret;
      if (cancelFn.length) {
        ret = cancelFn(close);
      } else {
        ret = cancelFn();
        if (!ret) {
          close();
        }
      }
      if (ret && ret.then) {
        ret.then(close);
      }
    } else {
      close();
    }
  }

  function handleConfirm() {
    let confirmFn = props.onConfirm;

    if (confirmFn) {
      let ret;
      if (confirmFn.length) {
        ret = confirmFn(close);
      } else {
        ret = confirmFn();
        if (!ret) {
          close();
        }
      }
      // 支持promise
      if (ret && ret.then) {
        ret.then(close);
      }
    } else {
      close();
    }
  }

  const { confirmText, cancelText, title, okCancel = true } = props;
  let footer = null;
  if (okCancel) {
    footer = [
      <Button key="cancel" bsSize="small" onClick={handleCancel}>{cancelText || 'Cancel'}</Button>,
      <Button key="confirm" bsSize="small" bsStyle="primary" onClick={handleConfirm}>{confirmText || 'Confirm'}</Button>
    ]
  } else {
    footer = (
      <Button key="confirm" bsSize="small" bsStyle="primary" onClick={handleConfirm}>{confirmText || 'Confirm'}</Button>
    )
  }

  // ReactDOM.render的第三个参数是虚拟元素对应的DOM元素创建成功后的回调函数，可选
  // d = this 是将Modal对象赋值给事先声明的 d 变量
  ReactDOM.render(
    <Modal bsSize="small" backdrop="static" show onHide={handleCancel} dialogClassName="dialog-modal">
      <Modal.Body>
        {title || ''}
      </Modal.Body>
      <Modal.Footer>
        { footer }
      </Modal.Footer>
    </Modal>
    , div, function () {
      d = this;
  });
}
