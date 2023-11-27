/**
 * 生成Antd Table的排序配置
 * 1.数字优先
 * 2.中文基于localeCompare默认排序
 * 3.默认desc
 * 4.默认支持asc、desc
 * @author yoko
 * @param field
 * @param order
 * @param forceNumber 强制提取数字排序
 * @param options
 * @returns {{sortDirections: string[], defaultSortOrder: string, sorter: (function(*, *))}}
 */
export const generateSorterOptions = (field, order = 'descend', forceNumber, options = {}) => {
  return {
    // 自动处理数字/中文排序
    sorter: (a, b) => {
      a = a[field]
      b = b[field]
      // // 如果 number 是有限数字（或可转换为有限数字），那么返回 true。否则，如果 number 是 NaN（非数字），或者是正、负无穷大的数，则返回 false
      // let c = isFinite(a);
      // let d = isFinite(b);
      // // 是否强制提取数字（联系单用）
      // if (forceNumber) {
      //   c = true;
      //   d = true;
      //   try {
      //     a = parseInt(a.match(/\d+/g).pop() || '0')
      //     b = parseInt(b.match(/\d+/g).pop() || '0')
      //   } catch (e) {
      //     a = 0
      //     b = 1
      //   }
      // }
      // return (c !== d && ((d - c) || -1)) || (c && d ? a - b : a.localeCompare(b));

      // const regex = /(\d+)/g; // 正则表达式匹配数字
      // const matchA = a.match(regex)
      // const matchB = b.match(regex)
      // const numA = matchA ? parseInt(matchA[0]) : a // 提取第一个数字并转换为整数
      // const numB = matchB ? parseInt(matchB[0]) : b // 提取第一个数字并转换为整数
      //
      // if (isNaN(numA) && isNaN(numB)) {
      //   // 如果两个文件名都不包含数字，按照字符串的排序顺序进行比较
      //   return a.localeCompare(b);
      // } else if (isNaN(numA)) {
      //   // 如果第一个文件名不包含数字，将其排在后面
      //   return 1;
      // } else if (isNaN(numB)) {
      //   // 如果第二个文件名不包含数字，将其排在前面
      //   return -1;
      // } else {
      //   // 如果两个文件名都包含数字，按照数字大小进行比较
      //   return numA - numB;
      // }
      // 最终解决方案
      // https://datatracker.ietf.org/doc/html/rfc4647#section-3.4
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare
      return a.localeCompare(b, 'zh-CN', { numeric: true })
    },
    sortDirections: ['descend', 'ascend'],
    defaultSortOrder: order === 'asc' ? 'ascend' : order === 'desc' ? 'descend' : order,
    ...options
  }
}

/**
 * 生成Antd Table的连续列表序列
 * @param pagination
 * @param options
 * @returns {{customRender: (function(*, *, *))}}
 */
export const generateSeriesIndexOptions = (pagination = { current: 1, pageSize: 10 }, options = {}) => {
  return {
    customRender: function (t, r, index) {
      return (pagination.current - 1) * pagination.pageSize + parseInt(index) + 1;
    },
    ...options
  }
}
