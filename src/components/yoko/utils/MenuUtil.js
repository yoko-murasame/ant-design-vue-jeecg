import store from '@/store'
import { getAction } from '@/api/manage'

export class MenuUtil {
  constructor() {
    this.todoNum = 0
    this.style = {
      // color: 'red',
      display: 'inline-block',
      marginLeft: '5px',
      width: '20px',
      height: '20px',
      color: '#fff',
      fontWeight: 'normal',
      lineHeight: '18px',
      whiteSpace: 'nowrap',
      textAlign: 'center',
      background: '#f5222d',
      borderRadius: '10px',
      boxShadow: '0 0 0 1px #fff',
      boxSizing: 'border-box',
      verticalAlign: 'middle'
    }
    this.menuList = []
    this.fetchMenuList();
  }

  fetchMenuList() {
    // 从 Vuex store 中读取 menuList 数据
    this.menuList = store.state.user.permissionList
    // console.log('MenuUtil', this.menuList)
  }

  async fetchTodoNum() {
    if (process.env.VUE_APP_ENABLE_NAVBAR_TODO_NUM !== 'true') {
      return
    }
    const res = await getAction('/workflow/common/myTaskList')
    .catch(err => {
      console.error(err)
    })
    this.todoNum = +res.result.total
    // console.log('fetchTodoNum', this.todoNum)
  }

  /**
   * 更新菜单代办数量
   * @param num 指定数量就不会再请求接口
   * @returns {Promise<void>}
   */
  async updateTodoNum(num) {
    if (num == null) {
      await this.fetchTodoNum()
    }
    const arr = this.getMenusByKey('/bpm/task/MyTaskList')
    arr.forEach(item => {
      item.meta.todoNum = `${num || this.todoNum}`
      item.meta.style = this.style
    })
  }

  getMenuByKey(key) {
    // 根据菜单项的 ID 获取菜单项
    return getMenuByKey(this.menuList, key);
  }

  getMenusByKey(key) {
    // 根据菜单项的 ID 获取菜单项列表
    return getMenusByKey(this.menuList, key);
  }
}

/**
 * 根据菜单键获取菜单
 * @param menus 菜单列表
 * @param key   菜单键
 * @returns {*|null}
 */
export const getMenuByKey = (menus, key) => {
  // 遍历当前层级的节点
  for (let i = 0; i < menus.length; i++) {
    const menu = menus[i];
    // 如果当前节点的键与目标键匹配，则返回当前节点
    if (menu.path === key) {
      return menu;
    }
    // 如果当前节点有子节点，则递归调用 getMenuByKey 在子节点中查找目标键
    if (menu.children && menu.children.length > 0) {
      const result = getMenuByKey(menu.children, key);
      // 如果在子节点中找到了目标节点，则返回结果
      if (result) {
        return result;
      }
    }
  }
  // 如果没有找到目标节点，则返回 null 或者其他适合的默认值
  return null;
}

/**
 * 根据菜单键获取菜单列表（从父节点到指定节点）
 * @param menus 菜单列表
 * @param key   菜单键
 * @param path  路径
 * @returns {*|null|*[]}
 */
export const getMenusByKey = (menus, key, path = []) => {
  // 遍历当前层级的节点
  for (let i = 0; i < menus.length; i++) {
    const menu = menus[i];
    // 如果当前节点的键与目标键匹配，则将当前节点添加到路径中
    if (menu.path === key) {
      return [...path, menu]; // 返回包含路径的节点列表
    }
    // 如果当前节点有子节点，则递归调用 getMenuByKey 在子节点中查找目标键
    if (menu.children && menu.children.length > 0) {
      const result = getMenusByKey(menu.children, key, [...path, menu]);
      // 如果在子节点中找到了目标节点，则返回结果
      if (result) {
        return result;
      }
    }
  }
  // 如果没有找到目标节点，则返回 null 或者其他适合的默认值
  return null;
}
