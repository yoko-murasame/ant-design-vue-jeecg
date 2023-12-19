---
表单设计器JS增强说明 Yoko.Shao 2023-09-01
---

**JS增强Hook说明**

> 代码增强中实现了`async await`的语法嵌入，可以调用接口，执行异步代码

* `handleMounted`：仅在表单弹窗首次加载时执行，在表单数据渲染前执行

* `handleSetData`：仅在表单弹窗首次加载时执行，在表单数据渲染后执行

* `beforeSubmit`：在表单提交前、校验前执行，返回Promise.reject()或抛出异常可以阻止表单提交

* `afterSubmit`：在表单提交后执行，**如果是新增操作，仅在这个钩子中能够获取到数据id**



**默认属性**

* `this`：指向当前表单vue实例
* `that`：指向当前表单vue实例
* `data`：当前编辑的数据对象
* `formConfig`：当前设计器表单的配置对象
* `formData`：表单保存后的完整数据对象，**仅在afterSubmit钩子中生效**

```js
console.log('默认属性', this, that, data, formConfig, formData)
```



**默认请求API**

* `getAction`：Get请求，返回Promise
* `postAction`：Post请求，返回Promise
* `putAction`：Put请求，返回Promise
* `httpAction`：自定义Http请求，返回Promise
* `myRequest`：构造自定义请求

```js
const params = {}
const get = await getAction('/xxx', params)
const post = await postAction('/xxx', params)
const put = await putAction('/xxx', params)
const http = await httpAction('/xxx', params, 'POST')
const myRequest = await myRequest({
    baseURL: window._CONFIG['domianURL'],
    url: '/xxx',
    method: 'get',
    params: {}
})
```



**默认工具API**

* `getCurrentRealname`：获取当前用户真实姓名
* `getDepartmentByOrgCode`：根据`orgCode`值获取多个部门信息
* `getCurrentDepartment`：获取当前用户的部门信息
* `getCurrentDate`：获取当前日期，默认format参数为：`YYYY-MM-DD`
* `getFullFormData`：获取完整的表单数据，参数为：id 主键，tableName 表名
* `updateFormData`：更新表单数据，参数为：code online表单的配置地址中的code，data 需要更新的表单数据（必须包含id字段且有值）
* `sendTemplateAnnouncement`：发送模板消息，参数为：
  * fromUser 发送人
  * toUser 接收人
  * title 消息标题
  * templateCode 模板编码
  * formData 模板参数
  * THIRD_APP_TYPE 第三方消息推送类型，可选值： DINGTALK、WECHAT_ENTERPRISE、ALL，不传都不推送
  * msgAbstract 消息摘要，可选

```js
const realname = await getCurrentRealname()
const depts = await getDepartmentByOrgCode('A01,A01A01')
const dept = await getCurrentDepartment()
const dateStr = await getCurrentDate()
const timeStr = await getCurrentDate('YYYY-MM-DD HH:mm:ss')
const fullData = await this.getFullFormData('id', 'table_name')
const updateId = await this.updateFormData('code', { id: '1', name: 'yoko' })
await this.sendTemplateAnnouncement('yoko', 'yoko,admin', '模板消息标题', 'template_code', { name: 'yoko', text: '随便写点什么' }, 'DINGTALK', '请查收消息！')
console.log('默认工具', realname, depts, dept, dateStr, timeStr, fullData, updateId)
```



**操作表单数据方法**

* `setData`：设置表单数据
* `getData`：获取表单数据
* `hide`：隐藏表单字段
* `show`：显示表单字段
* `disable`：禁用表单字段
* `enable`：启用表单字段
* `reset`：重置表单，将清空所有表单数据
* `setOptions`：批量设置某个option的值，不建议使用

```js
// 注意不要申明成data，默认属性已经有data了
const newData = { id: '1', name: 'yoko' }
const flag = await setData(newData)
const nowData = await getData()
console.log('nowData', flag, nowData)

// 操作表单字段的方法是非异步的
this.hide(['fieldA', 'fieldB'])
this.show(['fieldA', 'fieldB'])
this.disable(['fieldA', 'fieldB'])
this.enable(['fieldA', 'fieldB'])
this.reset()
```



**一些系统字段的配置说明**

| 字段名         | 说明                 | 建议选择组件    | 组件字典参数                      |
| -------------- | -------------------- |-----------| --------------------------------- |
| **系统字段**   |                      |           |                                   |
| `createTime`   | 创建日期 | 日期选择框、输入框 | -                                 |
| `createBy`     | 创建人（取**用户名**） | 下拉选择器     | `sys_user,realname,username`      |
| `createBy`     | 创建人（取**真实姓名**） | 输入框       | -                                 |
| `sysOrgCode`   | 创建部门             | 下拉选择器     | `sys_depart,depart_name,org_code` |
| **非系统字段** |                      |           |                                   |
| `createUnit` | 二级公司（创建单位） | 下拉选择器     | `sys_depart,depart_name,org_code` |
| `currentTime` | 当前日期+时间 | 日期选择框、输入框 | - |



**其他代码参考**

```js
console.log('data', this.data)
const { createBy, sysOrgCode, createUnit, createTime } = this.data
// 获取当前用户名
this.setData({ createBy: this.data.createBy || this.$store.getters.userInfo.username })
// 获取当前用户真实姓名
this.$getCurrentRealname().then((realname) => { this.setData({ createBy: this.data.createBy || realname }) })
// 获取当前用户部门code
this.$getCurrentDepartment().then((dept) => { this.setData({ sysOrgCode: this.data.sysOrgCode || dept.orgCode }) })
// 获取当前用户部门名称
this.$getCurrentDepartment().then((dept) => { this.setData({ departName: this.data.departName || dept.departName }) })
// 创建单位code（字典形式）
this.setData({ createUnit: this.data.createUnit || this.$store.getters.userInfo.orgCode.substring(0, 1) })
// 创建单位名称（文本形式）
const topCode = this.$store.getters.userInfo.orgCode.substring(0, 1)
this.$getDepartmentByOrgCode(topCode).then((dept) => { this.setData({ createUnit: this.data.createUnit || dept[0].departName }) })
// 获取当前日期
this.setData({ createTime: this.data.createTime || this.$getCurrentDate() })
// 获取当前日期+时间
this.setData({ currentTime: this.data.currentTime || this.$getCurrentDate('YYYY-MM-DD HH:mm:ss') })
```

# 使用示例一：一对一关联表单填写

在表单保存后，实现更新主表的状态（此示例和online列表JS增强说明文档的示例一相对应）

1. 表单JS-beforeSubmit-表单提交前调用：

```js
const { case_id } = data
if (!case_id) {
  throw new Error('无案件信息id，请检查代码！')
}
```

2. 表单JS-afterSubmit-表单提交后调用：

```js
// 获取案件信息id
const { case_id } = data
if (!case_id) {
  throw new Error('无案件信息id，请检查代码！')
}
// 获取主表信息
const caseInfo = await getFullFormData(case_id, 'case_info')
// 获取结案表信息, 确保必填字段有值，id字段必须在表单提交的钩子中才有值
const { state, id } = formData
// 已结案就更新主表
if (state == '1') {
  caseInfo.is_end = 1
} else {
  caseInfo.is_end = 0
}
caseInfo.case_close_id = id
await updateFormData('eaf401c32b16492fae05812a430026d9', caseInfo)
console.log('更新主表成功', formData, caseInfo)
```
