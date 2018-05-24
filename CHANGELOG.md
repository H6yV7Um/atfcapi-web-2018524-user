## v1.4.0
***
+ 首页： 修改页面细节，增加及时run以及增加一些小功能
+ Suite页面（原case页面）：实现case的版本控制和复制功能、增加单步调试
+ 将ajax 替换为 async/await + fetch（只尝试了部分页面，后期会逐步替换掉）

## v1.5.0
***
+ 增加了har文件上传，批量上传case
+ 项目内的alert提示替换，部分ajax替换。
+ 引入了redux

## v1.6.0
***
+ 增加了mock功能（*curl 和 uploadFile两种方式*）
+ 增加了Toggle、Dropdown、Input、Tab组件（*位于app/components目录*）
+ 优化了一些布局 && 修复了一些反馈的bug

## v1.6.1
+ 修复了safari不兼容fetch、不兼容Request的bug

## v1.7.0
+ 增加了可视化的case变动提醒
+ 优化了Har导入功能，支持case编辑，自定义folder
+ 断言新增"或逻辑"、"验反"功能
+ 项目内所有中文替换为英文

## v1.8.0
+ 增加覆盖率报告
+ 优化断言或逻辑的验证
+ 改善用户操作提示 && 修复了一些反馈的bug
+ 移除ajax，全部替换为fetch
+ 移除jquery，使用js-cookie替代jquery.cookie

## v1.8.1 2017-01-06
+ 增加PV UV统计
+ 增加HAR to JMX 转换
+ Request联动的优化

## v1.8.2 2017-01-20
+ 增加对Case失败后的流程管理（列表展示、详情编辑）

## v1.8.3
+ 批量扫描soa接口生成用例
+ 接入faas
