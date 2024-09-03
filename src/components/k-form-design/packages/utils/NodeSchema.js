/**
 * 节点管理
 */
import { pluginManager } from './index'
import { defaultComoponetsSchemaList, defaultLayoutSchemaList } from '@comp/k-form-design/packages/components/KFormDesign/config/formItemsConfig'

class NodeSchema {
  schemaList = [];
  schemaGroup = [
    {
      title: '表单组件',
      list: [
        // 默认组件
        ...defaultComoponetsSchemaList.map(item => item.type)
      ]
      // list: [
      //   'input',
      //   'textarea',
      //   'number',
      //   'select',
      //   'checkbox',
      //   'radio',
      //   'date',
      //   'time',
      //   'rate',
      //   'slider',
      //   'uploadFile',
      //   'uploadImg',
      //   'cascader',
      //   'treeSelect',
      //   'batch',
      //   'selectInputList',
      //   'editor',
      //   'switch',
      //   'button',
      //   'alert',
      //   'text',
      //   'html'
      // ]
    },
    {
      title: '布局组件',
      list: defaultLayoutSchemaList.map(item => item.type)
      // list: ['divider', 'card', 'tabs', 'grid', 'table']
    }
  ];
  designSchemaGroup = [];

  /**
   * 添加节点结构数据
   * @returns
   * @param schemas
   */
  addSchemas(schemas) {
    const s = schemas.map(item => {
      // 存在component组件则添加到插件管理器中
      item.component && pluginManager.addComponent(item.type, item.component)
      // 删除schemas中的component属性
      delete item.component
      return item
    })

    return this.schemaList.push(...s)
  }

  /**
   * 获取所有node schema
   * @returns
   */
  getSchemaList() {
    return this.schemaList
  }

  /**
   * 通过type查询node schema
   * @returns
   */
  getSchemaByType(type) {
    const schemaList = this.schemaList
    for (const i in schemaList) {
      if (schemaList[i].type === type) {
        return schemaList[i]
      }
    }
    return null
  }

  /**
   * 设置分组,这个操作将会覆盖原来的数据
   * @param {*} schemaGroup
   * @returns
   */
  setSchemaGroup(schemaGroup) {
    this.schemaGroup = schemaGroup
  }

  /**
   * 添加分组
   * @param {*} schemaGroupItem
   * @returns
   */
  addSchemaGroup(schemaGroupItem) {
    this.schemaGroup.push(schemaGroupItem)
    this.designSchemaGroup.length = 0
    this.designSchemaGroup.push(...this.getSchemaByGroup())
  }

  /**
   * 添加计算schemaGroup 值
   * @param {*} schemaGroup
   */
  addComputed(schemaGroup) {
    this.designSchemaGroup = schemaGroup
    schemaGroup.push(...this.getSchemaByGroup())
  }

  /**
   * 按照分组获取schemaGroupList
   * @returns schemaGroupList
   */
  getSchemaByGroup() {
    const schemaGroupList = this.schemaGroup.map(item => {
      // console.log('this.schemaList',this.schemaList, this.schemaGroup)
      const list = this.schemaList.filter(v => {
        return item.list.includes(v.type)
      })
      return {
        ...item,
        list
      }
    })
    return schemaGroupList
  }

  /**
   * 添加schema到指定分组，如果分组不存在则创建
   * @param schemas 需要添加的schema
   * @param groupTitle 组标题
   */
  addSchemaToGroup(schemas, groupTitle = '表单组件') {
    this.addSchemas(schemas)
    const gp = this.schemaGroup.find(item => item.title === groupTitle)
    if (gp) {
      gp.list.push(...schemas.map(item => item.type))
    } else {
      this.addSchemaGroup({
        title: groupTitle,
        list: schemas.map(item => item.type)
      })
    }
  }
}

// 注册默认组件
export const nodeSchema = new NodeSchema()
// 默认表单组件
nodeSchema.addSchemas(defaultComoponetsSchemaList)
// 默认布局组件
nodeSchema.addSchemas(defaultLayoutSchemaList)
