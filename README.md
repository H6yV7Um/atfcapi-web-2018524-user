## atfcAPI 测试框架:

### 知识储备与工具链

ES6(babel), CSS3(SCSS), react-bootstrap, reactjs, react-router, redux, fetch, webpack, flex

### 推荐的Chrome插件
  - [Redux](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en-US)
  - [React](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)

### 部署攻略

前提：`node > 7.0.0`

`npm i` 安装依赖

配置代理（两种方式）

+ 使用http-proxy-middleware
   > 访问/dev/server.js 文件中的监听地址:端口号 例：http://atfcapidev.elenet.me:8082
   > 实际请求地址参考dev/server.js => proxy属性

+ 使用nginx反向代理 （默认）
   > 修改atfcapi.conf里的项目路径（location里面的root），然后拷贝nginx配置: `cp atfcapi.conf /usr/local/etc/nginx/servers`
   > 更改/dev/server.js中的proxy选项。

`npm start` 启动开发环境，然后访问`http://atfcapidev.elenet.me:8082`

### 目录说明

`app/` 开发时在这个目录工作

`dev/` 开发过程中的临时目录

`build/` 生产环境用 配置文件放这里

需要运行的命令在package.json 里做了配置

webpack.config.js 生产环境配置

### 目录结构
    app
    ├── actions
    ├── components 公共组件
    ├── constants 常量
    ├── middleware redux中间件
    ├── pages 页面部分（按导航划分文件夹）
    │   ├── api
    │   ├── auth
    │   ├── batch
    │   ├── copyCase
    │   ├── dbConfig
    │   ├── example
    │   ├── header
    │   ├──   .js
    │   ├── main
    │   ├── postman
    │   ├── project
    │   ├── protocolTemplate
    │   ├── selectApi
    │   ├── stress
    │   ├── suite
    │   ├── testCase
    │   └── upload
    ├── reducers
    ├── store
    ├── style scss文件
    ├── vendor
    │    ├── Fetch.js
    │    ├── bootstrap
    │    └── util.js 工具类
    ├── index.js 入口文件
    └── routes.js 路由配置文件

- app
  + 子目录是按照redux官方的example搭建的
  + 所有的页面都在pages目录下
  + 所有的公共组件都在components下
  + 公共函数在vendor下
  + 路由配置 => routes.js
  + 入口文件 => index.js
  + 由于历史遗留问题，样式文件没有按照页面进行分类，统一放在了style目录
- build目录是构建项目相关的
  + 全局配置
  + faas关联的替换脚本
- dev目录是本地开发时的相关配置
- .babellrc 编译jsx语法、es6语法的配置文件
- .eslintigore 忽略eslint检查的文件/文件夹
- .eslintrc eslint检查的配置文件
- .gitignore 忽略git提交的文件/文件夹
- 项目安装了`precommint` + `lint-staged`，会在提交前强制eslint检查
- 打包文件对应根目录下的`webpack.config.js`，目前没有采用常规的`preset-es2015`，使用是`preset-env`，不了解可以看[介绍](https://github.com/cuining/blog/issues/20)
- 压缩文件使用的是`babel-preset-babili`
- 接口请求使用的fetch，对应目录在 app/vendor/Fetch.js
- `sw-precache`插件会在构建的时候生成一个servece-worker.js，缓存指定的文件
- 使用了`tree-shaking`、`code-spliting`
- 每一次迭代记得要把更改内容写进`CHANGELOG`

### 发布
+ 发布到[faas](https://board.faas.ele.me/#/)
 - 首先执行 `npm run prod`
 - 然后执行 `faas testing -e $env`, `$env`代表要发布的环境

+ 发布到eless（不推荐）
   push到gitlab上会自动触发，`atfcapi.portal_build.yml`配置文件中branch节点决定了哪个仓库版本的提交会自动触发job。
