/*
 * 工具函数
 */
export const validator = {
  chinese(value) {
    const regex = /[\u4E00-\u9FA5\uF900-\uFA2D]/;
    return regex.test(value);
  },
  maxLength(value, requirement) {
    return value.length <= requirement;
  },
  minLength(value, requirement) {
    return value.length >= requirement;
  },
  folderName(value) {
    const regex = /^[a-zA-Z0-9](\w|\.|-)*[a-zA-Z0-9]$/;
    return regex.test(value);
  },
  projectName(value) {
    const regex = /^[a-zA-Z0-9](\w)*[a-zA-Z0-9]$/;
    return regex.test(value);
  },
  required(value) {
    if (typeof value === 'string') {
      return value.trim().length > 0;
    } else if (typeof value === 'number') {
      return true;
    } else if (typeof value === 'boolean') {
      return value;
    } else if (value !== null && typeof value === 'object') {
      return Object.keys(value).length > 0;
    } else if (value === null || value === undefined) {
      return false;
    } else if (Array.isArray(value)) {
      return value.length > 0;
    }
    return false;
  },
};

export const headers = [
  'Accept',
  'Accept-Encoding',
  'Accept-Language',
  'Authorization',
  'Cookie',
  'Content-Length',
  'Content-Type',
  'Referer',
  'User-Agent',
  'Host',
  'User Define',
];

export const methods = [
  'GET',
  'POST',
  'DELETE',
  'PUT',
  'ANY',
];

export const now = (window.performance.now || window.performance.webkitNow).bind(window.performance);

export const catchProjectList = (p) => {
  let list = localStorage.getItem('projectList') || [];
  let listkeys = [];
  const key = 'projectId';
  const value = 'projectName';
  try {
    list = JSON.parse(list);
    listkeys = list.map(x => x.key);
  } catch (err) {
    list = [];
  }
  const newlist = [];
  p.forEach(x => {
    if (!listkeys.includes(x[key])) {
      newlist.push({
        key: x[key],
        value: x[value],
      });
    }
  });

  if (newlist.length) {
    list = list.concat(newlist);
  }

  localStorage.setItem('projectList', JSON.stringify(list));
};

export const getProjectName = (id) => {
  let list = localStorage.getItem('projectList') || [];
  try {
    list = JSON.parse(list);
  } catch (err) {
    list = [];
  }
  const project = list.filter(x => x.key.toString() === id.toString());
  let projectName = '文件夹列表';
  if (project.length) projectName = project[0].value;
  return projectName;
};

export const cacheFolderList = (projectId, folderList) => {
  let list = localStorage.getItem('folderList') || [];
  let listkeys = [];
  try {
    list = JSON.parse(list);
    listkeys = list.map(x => x.key);
  } catch (err) {
    list = [];
  }
  if (listkeys.includes(projectId)) {
    const target = list.find(x => x.key === projectId);
    target.value = Array.isArray(folderList) ? folderList : target.value;
  } else {
    list.push({
      key: projectId,
      value: folderList,
    });
  }
  localStorage.setItem('folderList', JSON.stringify(list));
};

export const getFolderName = (projectId, folderId) => {
  let list = localStorage.getItem('folderList') || [];
  try {
    list = JSON.parse(list);
  } catch (err) {
    list = [];
  }
  const folderList = list.filter(x => x.key.toString() === projectId.toString()).map(x => x.value)[0];
  let folderName = '文件夹详情';
  if (folderList && folderList.length) {
    const target = folderList.find(x => x.id.toString() === folderId.toString());
    if (target) {
      folderName = target.name;
    }
  }
  return folderName;
};

// 根据域名来选择默认的环境 比如atfcapi.alpha.elenet.me的默认环境就是alpha 以此类推
export const getEnvId = list => {
  if (Array.isArray(list)) {
    const result = list.find(x => x.envName.toLowerCase() === ATFCAPI.ENV.toLowerCase());
    if (!result) {
      throw new Error('wrong environment configuration !')
    }
    return result.envId;
  } else {
    throw new Error('no environment configuration !')
  }
}
