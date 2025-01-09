---
Online列表JS增强说明 Yoko.Shao 2023-09-05
---

**JS增强说明**

> JS代码格式参考如下：[Jeecg文档](https://www.kancloud.cn/zhangdaiscott/jeecg-boot/2044101)（版本和这里不一样，仅作参考）

**务必注意多个方法间需要有逗号分隔！支持async方法！**

**[自定义按钮的配置说明](https://www.kancloud.cn/zhangdaiscott/jeecg-boot/2292479)**

按钮样式
* link	挂在列表中操作列【更多】中
* link-pre	挂在列表中操作列所有【默认按钮】前
* link-after	挂在列表中操作列所有【默认按钮】前、【更多】后
* button	列表上方新增按钮所在行
* form	表单页面右侧折叠处

按钮类型
* js	触发自定义js事件(编写js增强)
* js-confirm 触发自定义js事件(编写js增强),并且有确认提示(此配置为设计器分支扩展选项)
* action	调用后台请求/online/cgform/api/doButton 触发sql增强

**每个方法名称和JS增强的按钮Code一一对应才能够顺利调用方法逻辑！**

```js
/**
 * 务必注意多个方法间需要有逗号分隔
 * 每个方法默认参数有三个，参数说明：
 * row：当前行或者选中的唯一一行
 * keys：当前表格勾选的所有行的key
 * rows：当前表格勾选的所有行
 */
methodA(row, keys, rows) {
  console.log('methodA', row, keys, rows)
},
async methodB(row, keys, rows) {
  console.log('methodB')
  const res = await getAction('/xxx', { id: row.id })
  return res.result
},
methodC(row, keys, rows) {
  console.log('methodC')
  return Promise.resolve(row)
},
```

**几个可能用到的事件钩子**


| 事件方法     | 功能描述                                      |
| :----------- |:------------------------------------------|
| beforeAdd    | 在新增之前调用,后续扩展after方法                       |
| beforeEdit   | 在编辑之前调用,该方法可以携带一个参数row，表示当前记录，后续扩展after方法 |
| beforeDelete | 在删除之前调用,该方法可以携带一个参数row，表示当前记录,后续扩展after方法 |
| created      | 在对应页面vue钩子函数created中调用（实际在mounted后）       |

```shell
# 具体可定位这个源码类
org.jeecg.modules.online.cgform.util.EnhanceJsUtil#enhanceJsButtonCode
"beforeSubmit,beforeAdd,beforeEdit,afterAdd,afterEdit,beforeDelete,afterDelete,mounted,created,show,loaded";
```

JS增强的代码示例：（改造后均支持await、async）

```js
async created() {
  // doSomething
},
async beforeAdd(row, keys, rows) {
  // doSomething
}
```


**默认属性**

* `this`：指向online列表组件实例
* `that`：指向online列表组件实例
* `row`：当前行或者选中的唯一一行
* `keys`：当前表格勾选的所有行的key
* `rows`：当前表格勾选的所有行

```js
methodA(row, keys, rows) {
  console.log('默认属性', this, that, row, keys, rows)
  return Promise.resolve(row)
}
```

**online列表组件实例的默认方法**

> 可通过 `this` 或者 `that` 访问

* `table`: 当前表格对象
* `columns`: 当前columns设置列表
* `dataSource`: 当前表格数据列表
* `pagination`: 当前分页参数
* `loading`: 加载状态
* `rowSelection`: 列选择配置对象
* `handleTableChange`: 处理分页、排序、筛选变化的方法 `handleTableChange(pagination, filters, sorter)`
* `scroll`: 列滚动控制
* `getFormatDate`: 获取格式化的日期方法 `getFormatDate(text)`
* `getPcaText`: 获取区域代码翻译方法 `getPcaText(code)`
* `handleEdit`: 调用编辑方法 `handleEdit(record)`
* `handleTrack`: 调用流程历史信息方法 `handleTrack(record)`
* `handleDetail`: 调用详情方法 `handleDetail(record)`
* `handleProcess`: 调用流程审批方法 `handleProcess(record)`
* `handleClaim`: 调用流程签收方法 `handleClaim(record)`
* `startProcess`: 调用流程发起方法 `startProcess(record)`
* `handleDeleteOne`: 调用删除方法 `handleDeleteOne(record)`
* `selectEntruster`: 调用流程委托方法 `selectEntruster(record)`
* `finishProcess`: 调用流程快速结束方法 `finishProcess(record)`
* `callBackProcess`: 调用流程取回方法 `callBackProcess(record)`
* `cgButtonLinkList`: 自定义按钮列表（表格行操作列，更多下面的按钮）
* `cgButtonLinkHandler`: 调用自定义按钮处理器 `await cgButtonLinkHandler(record, buttonCode, optType)`
* `onClearSelected`: 调用清空选中行方法 `onClearSelected()`
* `settingColumns`: 当前列表如果筛选了展示列，将在这里返回列表
* `defColumns`: 当前列表所有列列表
* `handleAdd`: 调用添加方法 `handleAdd()`
* `handleImportXls`: 调用导入方法 `handleImportXls()`
* `handleExportXls`: 调用导出方法 `handleExportXls()`
* `cgButtonList`: 和新增按钮一行的自定义按钮列表
* `cgButtonJsHandler`: 和新增按钮一行的自定义按钮列表处理器 `await cgButtonJsHandler(buttonCode)`
* `cgButtonActionHandler`: 和新增按钮一行的自定义按钮列表处理器 `cgButtonActionHandler(buttonCode)`
* `superQuery`: 高级查询对象
* `handleSuperQuery`: 调用高级查询方法 `handleSuperQuery(params, matchType)`
* `handleDelBatch`: 调用批量删除方法 `handleDelBatch()`
* `queryParam`: 当前查询参数对象
* `searchByquery`: 调用搜索方法 `searchByquery()`
* `queryInfo`: 搜索项渲染列表（online列表配置了多少个搜索项，都在这里）
* `buttonSwitch`: 当前按钮开关状态（控制按钮显隐、是否禁用等）
* `dictOptions`: 当前搜索项的字典翻译数据列表
* `toggleSearchStatus`: 搜索收起展开状态
* `bpmStatusFieldName`: BPM状态字段名称
* `hasBpmStatus`: 是否有BPM状态字段
* `getFullFormData`: 获取完整表单数据方法 `await getFullFormData(id, tableName, desFormCode)`
* `openAnyForm`: 打开任意表单方法 `await openAnyForm(code, id, mode = 'add', title = '表单', newFormData = {})`
* `sendTemplateAnnouncement`: 发送模板公告方法 `sendTemplateAnnouncement(fromUser, toUser, title, templateCode, formData, THIRD_APP_TYPE, msgAbstract)`
* `setQueryOptions`: 重置查询参数方法 `setQueryOptions(fields = [], options = {})`
* `setQueryDict`: 设置查询字典方法 `setQueryDict(fields = [], dict = '')`
* `getQueryItem`: 获取查询项方法 `getQueryItem(fields = [])`
* `loadData`: 刷新列表 `loadData()`
* `searchReset`: 重置搜索 `searchReset()`
* `moment`: moment对象


**默认请求API**

* `getAction`：Get请求，返回Promise
* `postAction`：Post请求，返回Promise
* `deleteAction`：Delete请求，返回Promise

```js
async methodB (row, keys, rows) {
  const params = {}
  const get = await getAction('/xxx', params)
  const post = await postAction('/xxx', params)
  const del = await deleteAction('/xxx', params)
}
```



**默认工具API**

* `getFullFormData`：获取当前表单行的完整数据，参数为：id 主键，tableName 表名可选
* `openAnyForm`：打开任意表单，参数为：
  * code online表单的配置地址中的code
  * id 主键
  * mode 模式 add | edit | detail
  * title 标题
  * newFormData 携带的数据对象 {}
* `sendTemplateAnnouncement`：发送模板消息，参数为：
  * fromUser 发送人，留空自动获取当前用户名
  * toUser 接收人
  * title 消息标题
  * templateCode 模板编码
  * formData 模板参数
  * THIRD_APP_TYPE 第三方消息推送类型，可选值： DINGTALK、WECHAT_ENTERPRISE、ALL，不传都不推送
  * msgAbstract 消息摘要，可选
* `setQueryOptions`：设置当前搜索组件配置项，参数为：
  * fields 字段名数组
  * options 配置对象
* `setQueryDict`：设置当前搜索组件字典配置，参数为：
  * fields 字段名数组
  * dict 新的字典字符串
* `getQueryItem`：获取搜索组件项，参数为：
  * fields 字段名数组


# 使用示例一：一对一关联表单填写

根据主表id获取完整信息，然后根据关联字段打开子表，并在新增时携带关联的值（此示例和表单设计器JS增强说明文档的示例一相对应）

```js
  async jiean(row, keys, rows){
    // 获取完整数据
    const caseInfo = await this.getFullFormData(row.id)
    console.log('完整数据', caseInfo)
    // 额外的信息，用于新增时传递给表单
    const { id, enterprise_id, case_name } = caseInfo
    const extraInfo = {
      case_id: id, // 案件id
      enterprise_id, // 企业id
      case_name // 案件名称
    }
    // 根据结案状态打开不同状态的表单，第一次打开时为新增
    const { case_close_id, is_end } = caseInfo
    if (case_close_id) {
      if (is_end == '1') {
        console.log('详情')
        await this.openAnyForm('76273b05421c49218b3118f7495fad1a', case_close_id, 'detail', '结案表', extraInfo)
      } else {
        console.log('编辑')
        await this.openAnyForm('76273b05421c49218b3118f7495fad1a', case_close_id, 'edit', '结案表', extraInfo)
      }
    } else {
      console.log('新增')
      await this.openAnyForm('76273b05421c49218b3118f7495fad1a', case_close_id, 'add', '结案表', extraInfo)
    }
  }
```

# 使用示例二：发送模板消息

新增自定义按钮：按钮编码 `sendTemplateMessage`、按钮名称 `发送模板消息`、按钮样式 `link`、按钮类型 `js`、按钮状态 `激活`

```js
async sendTemplateMessage(row, keys, rows){
  // 获取完整数据
  const formData = await this.getFullFormData(row.id)
  const fromUser = ''
  const toUser = formData.submit_person || 'yoko,admin'
  const title = formData.title || '测试标题'
  const 推送类型 = formData.submit_type === '2' ? 'DINGTALK' : ''
  const 消息摘要 = '请查收消息！'
  // 模板code请在 消息中心->模板管理 中添加
  const templateCode = 'log_reporting'
  await this.sendTemplateAnnouncement(fromUser, toUser, title, templateCode, formData, 推送类型, 消息摘要)
  console.log('发送模板消息', fromUser, toUser, title, templateCode, formData, 推送类型, 消息摘要)
  // 如果遇到Nginx代理下回调地址无端口问题，请配置Header：
  // proxy_set_header "X_GATEWAY_BASE_PATH" http://aa.bb.com:8888;
}
```
