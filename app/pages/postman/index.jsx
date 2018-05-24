import React from 'react';
import { Breadcrumb, BreadcrumbItem } from 'react-bootstrap';
import History from './History';
import Request from './Request';
import './index.scss';

const PostMan = () => (
  <div>
    <Breadcrumb>
      <BreadcrumbItem href="#">
        Home
      </BreadcrumbItem>
      <BreadcrumbItem active>
        PostMan
      </BreadcrumbItem>
    </Breadcrumb>
    <div className="HolyGrail-body p0">
      <History className="HolyGrail-nav u-textCenter sidebar content-group" />
      <Request className="HolyGrail-content p0" />
    </div>
  </div>
);

export default PostMan;
