---
表单设计器JS增强说明 Yoko.Shao 2023-09-01
---

**JS增强Hook说明**

> 代码增强中实现了`async await`的语法嵌入，可以调用接口，执行异步代码

* `handleMounted`：仅在表单弹窗首次加载时执行，在表单数据渲染前执行

* `handleSetData`：仅在表单弹窗首次加载时执行，在表单数据渲染后执行

* `beforeSubmit`：在表单提交前、校验前执行，返回Promise.reject()或抛出异常可以阻止表单提交

* `afterSubmit`：在表单提交后执行，**如果是新增操作，仅在这个钩子中能够获取到数据id**

* `自定义函数`：和Vue2中的`methods`中定义的方法一样，编写后的JS增强代码将注册到表单实例

* `beforeModalClose`：在模态框close事件（关闭前）触发


**表单数据对象**

* `this`：指向当前表单vue实例，建议使用that
* `that`：指向当前表单vue实例，一般和this指向相同（视调用高阶函数位置的传入参数而定）
* `data`：当前编辑的数据对象
* `newFormData`：来自流程或者online列表上文的默认数据，用于填充表单默认值（如：online列表的`openAnyForm`方法中的`newFormData`参数）
* `formData`：表单保存后的完整数据（新增时，会包含由后端生成的新数据ID），**仅在afterSubmit钩子中生效**

* `formMeta`：当前设计器表单的完整配置对象
* `formConfig`：当前设计器表单的配置对象
* `parent`：如果是online列表调用的，则指向online列表的vue实例，否则为null

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

> `getCurrentRealname`：获取当前用户真实姓名

> `getDepartmentByOrgCode`：根据`orgCode`值获取多个部门信息

> `getCurrentDepartment`：获取当前用户的部门信息

> `getCurrentDate`：获取当前日期，默认format参数为：`YYYY-MM-DD`

> `getOnlineDataList`：获取在线表单列表数据，同online列表接口，支持搜索参数和分页，参数为：onlineCode：online表单配置地址的code；params 搜索参数，如：{name:'张三'}，分页也在这里

> `getFullFormData`：获取完整的表单数据，参数为：id 主键，tableName 表名

> `updateFormData`：更新表单数据，参数为：code online表单的配置地址中的code，data 需要更新的表单数据（必须包含id字段且有值）

> `sendTemplateAnnouncement`：发送模板消息，参数为：

* fromUser 发送人
* toUser 接收人
* title 消息标题
* templateCode 模板编码
* formData 模板参数
* THIRD_APP_TYPE 第三方消息推送类型，可选值： DINGTALK、WECHAT_ENTERPRISE、ALL，不传都不推送
* msgAbstract 消息摘要，可选

> `generateCodeByRule`：根据规则生成编码，参数为：ruleCode 规则编码（系统配置），formData 表单数据（可选）

```js
const realname = await getCurrentRealname()
const depts = await getDepartmentByOrgCode('A01,A01A01')
const dept = await getCurrentDepartment()
const dateStr = await getCurrentDate()
const timeStr = await getCurrentDate('YYYY-MM-DD HH:mm:ss')
const onlineDataList = await getOnlineDataList('online表单配置地址的code', {}) // 查询条件和分页都放这里
const fullData = await getFullFormData('id', 'table_name')
const updateId = await updateFormData('code', { id: '1', name: 'yoko' })
await sendTemplateAnnouncement('yoko', 'yoko,admin', '模板消息标题', 'template_code', { name: 'yoko', text: '随便写点什么' }, 'DINGTALK', '请查收消息！')
const code = await generateCodeByRule('rule_code', {})
console.log('默认工具', realname, depts, dept, dateStr, timeStr, onlineDataList, fullData, updateId, code)
```

> `saveBusinessGeometryDataToSupermapFeatures`：保存业务几何数据到超图空间表，参数为（使用请参考下文“天地图-点、线、面模式”）：

* mode 模式(point、line、polygon)
* formData 业务表单数据
* businessIdField 业务主键字段
* businessIdFieldInSupermap 空间表关联的业务主键字段
* iserverFeaturesUrl 空间表服务地址，e.g. http://localhost:8090/iserver/services/data-GJDW/rest/data/datasources/GJDW/datasets/region_test/features
* coordinatesStr 坐标串（来自天地图组件的返回结果）
* debug 调试模式，默认false
* throwError 抛出错误，默认false
* lnglatSplitChar 坐标串经纬度分隔符，默认逗号
* lnglatArrSplitChar 坐标串经纬度数组分隔符，默认分号

> `getUserByUsername`：根据用户名获取用户信息，参数为：username

```js
// 这个示例，通过获取用户名，去填充关联的手机号，在字段onChange时触发
const nowData = await getData(['captain_name'])
const {captain_name} = nowData
if (captain_name) {
  const {phone}= await getUserByUsername(captain_name)
  console.log('选择用户后自动填充手机号：', captain_name, phone)
  setData({captain_phone: phone})
}
```


**操作表单数据方法**

* `setData`：设置表单数据，参数为：['fieldA', 'fieldB']（字段名称数组，下面同此）
* `getData`：获取表单数据，参数为：参数1可选，若传入可限制字段列表['fieldA', 'fieldA']，参数2是否抛出异常：true/false
* `hide`：隐藏表单字段，参数为：['fieldA', 'fieldB']，**注：该API会自动调用`closeRequired`去关闭表单项的必填属性！**
* `show`：显示表单字段，参数为：['fieldA', 'fieldB']
* `disable`：禁用表单字段，参数为：['fieldA', 'fieldB']
* `enable`：启用表单字段，参数为：['fieldA', 'fieldB']
* `reset`：重置表单，将清空所有表单数据
* `setOptions`：批量设置表单组件的option的值，参数为：['fieldA', 'fieldB']，optionName(配置属性名称)，optionsValue(配置属性值)
* `changeDict`：变更字典（字典单选、多选、搜索组件生效），参数为：['fieldA', 'fieldB']，dictCode(字典Code)，dictOptions(字典数组)
* `setRules`：批量设置表单组件的所有rules的值，参数为：['fieldA', 'fieldB']，key(属性名称)，value(属性值)
* `openRequired`：开启表单项必填，**请注意预览模式下会更改表单项配置！务必先保存后预览！**，参数为：['fieldA', 'fieldB']
* `closeRequired`：关闭表单项必填，**请注意预览模式下会更改表单项配置！务必先保存后预览！**，参数为：['fieldA', 'fieldB']
* `getAllTabs`：获取当前表单的所有tab配置对象
* `selectTabByName`：根据tab名称选中tab，参数为：name(tab名称)

```js
// 注意不要申明成data，默认属性已经有data了
const newData = { id: '1', name: 'yoko' }
const flag = await setData(newData)
const nowData = await getData() // 支持
const nowDataWithFields = await getData(['name', 'sex'], false) // 支持, 参数false表示字段为空时不抛异常
console.log('nowData', flag, nowData, nowDataWithFields)

// 操作表单字段的方法是非异步的
that.hide(['fieldA', 'fieldB'])
that.show(['fieldA', 'fieldB'])
that.disable(['fieldA', 'fieldB'])
that.enable(['fieldA', 'fieldB'])
that.reset()
// 批量设置组件的options，这里以改变 disabled 属性为例
that.setOptions(['fieldA', 'fieldB'], 'disabled', true)
// 批量设置组件的动态字典code
that.changeDict(['fieldA', 'fieldB'], '系统里的字典code或者表字典')
// 批量设置组件的静态字典选项
that.changeDict(['fieldA', 'fieldB'], null, [{ text: '文本', value: '1' }])
// 批量设置组件的rules，这里以改变 required 属性为例
that.setRules(['fieldA', 'fieldB'], 'required', true)
// 开启表单项必填
that.openRequired(['fieldA', 'fieldB'])
// 关闭表单项必填
that.closeRequired(['fieldA', 'fieldB'])
// 获取当前表单的所有tab配置对象
const tabs = getAllTabs()
// 根据tab名称选中tab
that.selectTabByName('选项2')
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
console.log('data', that.data)
const { createBy, sysOrgCode, createUnit, createTime } = that.data
// 获取当前用户名
that.setData({ createBy: that.data.createBy || that.$store.getters.userInfo.username })
// 获取当前用户真实姓名
that.$getCurrentRealname().then((realname) => { that.setData({ createBy: that.data.createBy || realname }) })
// 获取当前用户部门code
that.$getCurrentDepartment().then((dept) => { that.setData({ sysOrgCode: that.data.sysOrgCode || dept.orgCode }) })
// 获取当前用户部门名称
that.$getCurrentDepartment().then((dept) => { that.setData({ departName: that.data.departName || dept.departName }) })
// 创建单位code（字典形式）
that.setData({ createUnit: that.data.createUnit || that.$store.getters.userInfo.orgCode.substring(0, 1) })
// 创建单位名称（文本形式）
const topCode = that.$store.getters.userInfo.orgCode.substring(0, 1)
that.$getDepartmentByOrgCode(topCode).then((dept) => { that.setData({ createUnit: that.data.createUnit || dept[0].departName }) })
// 获取当前日期
that.setData({ createTime: that.data.createTime || that.$getCurrentDate() })
// 获取当前日期+时间
that.setData({ currentTime: that.data.currentTime || that.$getCurrentDate('YYYY-MM-DD HH:mm:ss') })
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

# 使用示例二：表单填写后自动生成编码

1）去系统 `在线开发 -> 系统编码规则` 模块里新增一条规则：

* 规则名称(随便写)：`模块XX编码规则`
* 规则Code(随便写)：`module_xx_code`
* 规则实现类(这个是固定的)：`org.jeecg.modules.system.rule.ModuleCodeRule`
* 规则参数(需完整填写)：`{"tableName":"表名","fieldName":"编号字段名","prefix":"前缀"}`

以上配置生成的code规则为：传入前缀+YYMMdd+三位数顺序号，如：`XX2312200001`

2）在表单设计器的`数据提交前调用`钩子中加入下面参考代码：

```js
// 假设表单的code字段是编码字段
const { code } = data
// 如果code字段没有值就生成（一般新增操作时调用）
if (!code) {
  // 生成编码
  const code = await generateCodeByRule('module_xx_code', data)
  // 设置编码
  that.setData({ code })
}
```

3）现在每次新增表单时，都会自动生成编码了

# 使用示例三：地图选择组件保存数据到超图

1）去系统 `在线开发 -> online表单开发` 模块里新增测试表

2）点击 `设计表单` 按钮，在表单里添加一个地图选择组件（左边 -> 自定义组件 -> 天地图）

3）在设计界面右下角 `表单JS-afterSubmit-表单提交后调用` 模块加入增强JS代码

3.1）**天地图-点、线、面模式**——参考JS增强代码：

```js
const iserverUrl = ''
const addPolygonFunc = async () => {
  // 超图-服务地址-这里需要注意跨域，留空是为了走代理
  const params = {
    mode: 'polygon', // 模式：point（点）、line（线）、polygon（面）
    formData: formData, // 表单数据
    businessIdField: 'id', // 业务id字段
    businessIdFieldInSupermap: 'BUSS_ID', // 业务id字段在超图空间表中的字段名
    iserverFeaturesUrl: `${iserverUrl}/iserver/services/data-GJDW/rest/data/datasources/GJDW/datasets/region_test/features`, // 服务地址，需要区分点线面的服务地址
    coordinatesStr: formData['new_one'], // 从业务表单数据中取出天地图组件返回的坐标串数据
    debug: false, // 调试模式，默认是false
    throwError: false, // 抛出错误，默认是false
    lnglatSplitChar: ',', // 坐标串中经纬度分隔符，默认是逗号（不建议修改）
    lnglatArrSplitChar: ';' // 坐标串中经纬度数组分隔符，默认是分号（不建议修改）
  }
  // 执行-保存业务几何数据到超图空间表
  await saveBusinessGeometryDataToSupermapFeatures(params)
}
await addPolygonFunc()
```
