/**
 * 生成Antd Table的排序配置
 * 1.数字优先
 * 2.中文基于localeCompare默认排序
 * 3.默认desc
 * 4.默认支持asc、desc
 * @author yoko
 * @param field
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
      // 如果 number 是有限数字（或可转换为有限数字），那么返回 true。否则，如果 number 是 NaN（非数字），或者是正、负无穷大的数，则返回 false
      let c = isFinite(a);
      let d = isFinite(b);
      // 是否强制提取数字（联系单用）
      if (forceNumber) {
        c = true;
        d = true;
        try {
          a = parseInt(a.match(/\d+/g).pop() || '0')
          b = parseInt(b.match(/\d+/g).pop() || '0')
        } catch (e) {
          a = 0
          b = 0
        }
      }
      return (c != d && d - c) || (c && d ? a - b : a.localeCompare(b));
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
