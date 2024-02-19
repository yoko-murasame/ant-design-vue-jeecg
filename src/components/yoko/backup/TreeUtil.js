/**
 * 递归查找项
 * @param key
 * @param source
 * @returns {指定节点}
 */
function getTreeNodeByOrderStr(key, source) {
  if (!source) {
    return null
  }
  let [exist] = source.filter(node => node.orderStr + '' === key + '')
  if (!exist) {
    source.forEach(node => {
      exist = exist || getTreeNodeByOrderStr(key, node.children)
    })
  }
  return exist
}

/**
 * 查找兄弟项
 * @param key
 * @param source
 * @returns {指定节点}
 */
function getTreeNodeBrotherByOrderStr(key, source) {
  const parent = getTreeNodeParentByOrderStr(key, source)
  return parent && parent.children || []
}

/**
 * 查找父亲项
 * @param key
 * @param source
 * @returns {指定节点}
 */
function getTreeNodeParentByOrderStr(key, source) {
  const keys = key.split('.')
  keys.pop()
  const newKey = keys.join('.')
  return getTreeNodeByOrderStr(newKey, source)
}

/**
 * 根据组件名获取父级
 * @param vm
 * @param name
 * @returns {Vue | null|null|Vue}
 */
function getVmParentByName(vm, name) {
  let parent = vm.$parent
  if (parent && parent.$options) {
    if (parent.$options.name === name) {
      return parent
    } else {
      let res = getVmParentByName(parent, name)
      if (res) {
        return res
      }
    }
  }
  return null
}

/**
 * 递归校验新增分项的父子值
 * 在前端统一计算，用于合同联系单
 * 概算备案的核定表是单项保存的，需要在后端进行计算
 * @returns 返回目标值 - 总值
 */
function validateTreeCost(item, { keyField = 'orderStr', targetField = '', costField = 'cost', savePre = false, rowSelectCallback, selectedRowKeys } = {}) {
  if (typeof item === 'boolean' || typeof item === 'number') {
    return item
  }
  if (!targetField) {
    return false
  }
  // 获取同级所有项，累加值变成父项
  const brother = getTreeNodeBrotherByOrderStr(item[keyField]);
  const parent = getTreeNodeParentByOrderStr(item[keyField])

  // 如果编辑的是顶级节点，将没有父项，直接校验剩余概算和值
  if (!parent) {
    return (item[targetField] - item[costField]).toFixed(4)
  }

  // 计算兄弟分项联系单额，回填给父项
  const brotherSum = brother.reduce((pre, cur) => pre + (cur[targetField] && cur[targetField] - 0 || 0), 0);
  // 保存旧数据
  if (savePre) {
    const preField = targetField + 'Pre'
    Object.assign(parent, { [preField]: parent[targetField] })
  }
  // 回填父项
  Object.assign(parent, { [targetField]: brotherSum })

  // 选中父节点
  selectedRowKeys && !selectedRowKeys.indexOf(parent[keyField]) && selectedRowKeys.push(parent[keyField])
  rowSelectCallback && rowSelectCallback(parent, { keyField, targetField, costField })
  // 若parent不是root父节点，递归
  const parentOrderStrs = parent[keyField].split('.')
  if (parentOrderStrs.length === 1) {
    return (brotherSum - parent[costField]).toFixed(4)
  } else {
    return validateTreeCost(parent, { keyField, targetField, costField, savePre, rowSelectCallback, selectedRowKeys })
  }
}

/**
 * 递归获取项及其所有子项的某个字段的值（这里默认取orderStr）
 * @returns Array
 */
function getTreeNodeFieldValues(key, newKeyArr, nodeArr, field = 'orderStr', dataSource = []) {
  if (!newKeyArr) {
    newKeyArr = []
  }
  if (!nodeArr) {
    nodeArr = key ? [getTreeNodeByOrderStr(key, dataSource)] : []
  }
  nodeArr.forEach(node => {
    newKeyArr.push(node[field])
    node.children && getTreeNodeFieldValues(null, newKeyArr, node.children, field, dataSource)
  })
  return newKeyArr
}

export {
  getTreeNodeByOrderStr,
  getTreeNodeBrotherByOrderStr,
  getTreeNodeParentByOrderStr,
  getVmParentByName,
  getTreeNodeFieldValues,
  validateTreeCost
}
