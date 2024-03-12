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

/**
 * 为树状数据生成完整数据（icon、key、path）
 */
function generateTreeData(arr, parentIdx = '', treeDataProcessed = []) {
  arr.forEach((item, idx) => {
    // 填充path信息，这里以无children为准，再填充isLeaf
    if (!(item.children && item.children.length)) {
      item.isLeaf = true
      item.path = generatePath(item.title)
    }
    // 填充icon信息
    let slots = {}
    if (item.slots) {
      slots = {
        ...item.slots
      }
    }
    if (item.isLeaf) {
      item.slots = {
        ...slots,
        icon: 'customFileIcon'
      }
    } else {
      item.slots = {
        ...slots,
        icon: 'customFolderIcon'
      }
    }
    // 填充key信息
    if (parentIdx) {
      item.key = parentIdx + '-' + idx
    } else {
      item.key = idx + ''
    }
    // 生成拷贝树
    if (!(item.children && item.children.length)) {
      if (!~item.path.indexOf('welcome')) {
        treeDataProcessed.push({
          ...item
        })
      } else {
        treeDataProcessed.push({})
      }
    } else {
      treeDataProcessed.push({
        ...item,
        children: []
      })
    }
    // 递归
    item.children && item.children.length && generateTreeData(item.children, item.key, treeDataProcessed[idx].children)
  })
}

/**
 * 生成对应path
 */
function generatePath(title) {
  const node = navTree.state.navTreeMap[title] || {
    path: '/navtree/welcome'
  }
  if (~node.path.indexOf('welcome') || (node.component && ~node.component.indexOf('welcome'))) {
    if (!~node.path.indexOf('?title')) {
      node.path = `${node.path}?title=${title}`
    }
  }
  return node.path
}

/**
 * 递归过滤掉没有子项的节点
 */
function filterCopyArr(treeDataProcessed) {
  return treeDataProcessed.filter(node => {
    if (node.title) {
      if (node.children && node.children.length) {
        const res = filterCopyArr(node.children)
        if (res.length) {
          node.children = res
          return true
        }
        return false
      } else {
        return true
      }
    } else {
      return false
    }
  })
}

export {
  getTreeNodeByOrderStr,
  getTreeNodeBrotherByOrderStr,
  getTreeNodeParentByOrderStr,
  getVmParentByName,
  getTreeNodeFieldValues,
  validateTreeCost,
  generateTreeData,
  generatePath,
  filterCopyArr
}
