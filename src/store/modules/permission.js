import { asyncRouterMap, constantRouterMap } from '@/config/router.config'
import { getAction } from '@api/manage'

/**
 * 过滤账户是否拥有某一个权限，并将菜单从加载列表移除
 *
 * @param permission
 * @param route
 * @returns {boolean}
 */
function hasPermission(permission, route) {
  if (route.meta && route.meta.permission) {
    let flag = -1
    for (let i = 0, len = permission.length; i < len; i++) {
      flag = route.meta.permission.indexOf(permission[i])
      if (flag >= 0) {
        return true
      }
    }
    return false
  }
  return true
}

/**
 * 单账户多角色时，使用该方法可过滤角色不存在的菜单
 *
 * @param roles
 * @param route
 * @returns {*}
 */
// eslint-disable-next-line
function hasRole(roles, route) {
  if (route.meta && route.meta.roles) {
    return route.meta.roles.indexOf(roles.id)
  } else {
    return true
  }
}

function filterAsyncRouter(routerMap, roles) {
  const accessedRouters = routerMap.filter(route => {
    if (hasPermission(roles.permissionList, route)) {
      if (route.children && route.children.length) {
        route.children = filterAsyncRouter(route.children, roles)
      }
      return true
    }
    return false
  })
  return accessedRouters
}

const permission = {
  state: {
    routers: constantRouterMap,
    addRouters: [],
    // 知识库模块路径，每个flag表示系统内是否已配置按钮权限
    KNOWLEDGE_MODULE: 'modules/knowledge/Knowledge',
    KNOWLEDGE_FLAG: null,
    // 数据权限-全目录-全文件-查看权限
    KNOWLEDGE_FOLDER_USER_FULL: 'KNOWLEDGE_FOLDER_USER_FULL',
    KNOWLEDGE_FOLDER_USER_FULL_FLAG: false,
    // 按钮权限-目录-新增按钮
    KNOWLEDGE_FOLDER_ADD_BUTTON: 'KNOWLEDGE_FOLDER_ADD_BUTTON',
    KNOWLEDGE_FOLDER_ADD_BUTTON_FLAG: false,
    // 按钮权限-目录-编辑按钮
    KNOWLEDGE_FOLDER_EDIT_BUTTON: 'KNOWLEDGE_FOLDER_EDIT_BUTTON',
    KNOWLEDGE_FOLDER_EDIT_BUTTON_FLAG: false,
    // 按钮权限-目录-删除按钮
    KNOWLEDGE_FOLDER_DELETE_BUTTON: 'KNOWLEDGE_FOLDER_DELETE_BUTTON',
    KNOWLEDGE_FOLDER_DELETE_BUTTON_FLAG: false,
    // 按钮权限-目录-授权按钮
    KNOWLEDGE_FOLDER_USER_AUTH_BUTTON: 'KNOWLEDGE_FOLDER_USER_AUTH_BUTTON',
    KNOWLEDGE_FOLDER_USER_AUTH_BUTTON_FLAG: false,
    // 按钮权限-文件-下载按钮
    KNOWLEDGE_FILE_DOWNLOAD_BUTTON: 'KNOWLEDGE_FILE_DOWNLOAD_BUTTON',
    KNOWLEDGE_FILE_DOWNLOAD_BUTTON_FLAG: false,
    // 按钮权限-文件-打标签按钮
    KNOWLEDGE_FILE_TAG_BUTTON: 'KNOWLEDGE_FILE_TAG_BUTTON',
    KNOWLEDGE_FILE_TAG_BUTTON_FLAG: false,
    // 按钮权限-文件-重命名按钮
    KNOWLEDGE_FILE_RENAME_BUTTON: 'KNOWLEDGE_FILE_RENAME_BUTTON',
    KNOWLEDGE_FILE_RENAME_BUTTON_FLAG: false,
    // 按钮权限-文件-版本管理按钮
    KNOWLEDGE_FILE_VERSION_BUTTON: 'KNOWLEDGE_FILE_VERSION_BUTTON',
    KNOWLEDGE_FILE_VERSION_BUTTON_FLAG: false,
    // 按钮权限-文件-删除按钮
    KNOWLEDGE_FILE_DELETE_BUTTON: 'KNOWLEDGE_FILE_DELETE_BUTTON',
    KNOWLEDGE_FILE_DELETE_BUTTON_FLAG: false
  },
  mutations: {
    SET_ROUTERS: (state, data) => {
      state.addRouters = data
      state.routers = constantRouterMap.concat(data)
      // console.log('-----mutations---SET_ROUTERS----', data)
    },
    SET_KNOWLEDGE_FLAG(state, data) {
      state.KNOWLEDGE_FLAG = data.KNOWLEDGE_FLAG
      state.KNOWLEDGE_FOLDER_USER_FULL_FLAG = data.KNOWLEDGE_FOLDER_USER_FULL_FLAG
      state.KNOWLEDGE_FOLDER_ADD_BUTTON_FLAG = data.KNOWLEDGE_FOLDER_ADD_BUTTON_FLAG
      state.KNOWLEDGE_FOLDER_EDIT_BUTTON_FLAG = data.KNOWLEDGE_FOLDER_EDIT_BUTTON_FLAG
      state.KNOWLEDGE_FOLDER_DELETE_BUTTON_FLAG = data.KNOWLEDGE_FOLDER_DELETE_BUTTON_FLAG
      state.KNOWLEDGE_FOLDER_USER_AUTH_BUTTON_FLAG = data.KNOWLEDGE_FOLDER_USER_AUTH_BUTTON_FLAG
      state.KNOWLEDGE_FILE_DOWNLOAD_BUTTON_FLAG = data.KNOWLEDGE_FILE_DOWNLOAD_BUTTON_FLAG
      state.KNOWLEDGE_FILE_TAG_BUTTON_FLAG = data.KNOWLEDGE_FILE_TAG_BUTTON_FLAG
      state.KNOWLEDGE_FILE_RENAME_BUTTON_FLAG = data.KNOWLEDGE_FILE_RENAME_BUTTON_FLAG
      state.KNOWLEDGE_FILE_VERSION_BUTTON_FLAG = data.KNOWLEDGE_FILE_VERSION_BUTTON_FLAG
      state.KNOWLEDGE_FILE_DELETE_BUTTON_FLAG = data.KNOWLEDGE_FILE_DELETE_BUTTON_FLAG
    }
  },
  actions: {
    /**
     * 检查知识库菜单、权限
     */
    CheckKnowledgeFlag({ commit, state }) {
      const flags = {
        KNOWLEDGE_FLAG: null,
        KNOWLEDGE_FOLDER_USER_FULL_FLAG: false,
        KNOWLEDGE_FOLDER_ADD_BUTTON_FLAG: false,
        KNOWLEDGE_FOLDER_EDIT_BUTTON_FLAG: false,
        KNOWLEDGE_FOLDER_DELETE_BUTTON_FLAG: false,
        KNOWLEDGE_FOLDER_USER_AUTH_BUTTON_FLAG: false,
        KNOWLEDGE_FILE_DOWNLOAD_BUTTON_FLAG: false,
        KNOWLEDGE_FILE_TAG_BUTTON_FLAG: false,
        KNOWLEDGE_FILE_RENAME_BUTTON_FLAG: false,
        KNOWLEDGE_FILE_VERSION_BUTTON_FLAG: false,
        KNOWLEDGE_FILE_DELETE_BUTTON_FLAG: false
      }
      const msgs = {
        KNOWLEDGE_FOLDER_USER_FULL_FLAG: '检测到系统未配置知识库-数据权限-全目录-全文件-查看权限，默认不开放！如需控制，请根据文档配置管理员权限！',
        KNOWLEDGE_FOLDER_ADD_BUTTON_FLAG: '检测到系统未配置知识库-按钮权限-目录-新增按钮，默认显示！如需控制，请根据文档配置按钮权限！',
        KNOWLEDGE_FOLDER_EDIT_BUTTON_FLAG: '检测到系统未配置知识库-按钮权限-目录-编辑按钮，默认显示！如需控制，请根据文档配置按钮权限！',
        KNOWLEDGE_FOLDER_DELETE_BUTTON_FLAG: '检测到系统未配置知识库-按钮权限-目录-删除按钮，默认显示！如需控制，请根据文档配置按钮权限！',
        KNOWLEDGE_FOLDER_USER_AUTH_BUTTON_FLAG: '检测到系统未配置知识库-按钮权限-目录-授权按钮，默认隐藏！如需控制，请根据文档配置按钮权限！',
        KNOWLEDGE_FILE_DOWNLOAD_BUTTON_FLAG: '检测到系统未配置知识库-按钮权限-文件-下载按钮，默认隐藏！如需控制，请根据文档配置按钮权限！',
        KNOWLEDGE_FILE_TAG_BUTTON_FLAG: '检测到系统未配置知识库-按钮权限-文件-打标签按钮，默认显示！如需控制，请根据文档配置按钮权限！',
        KNOWLEDGE_FILE_RENAME_BUTTON_FLAG: '检测到系统未配置知识库-按钮权限-文件-重命名按钮，默认显示！如需控制，请根据文档配置按钮权限！',
        KNOWLEDGE_FILE_VERSION_BUTTON_FLAG: '检测到系统未配置知识库-按钮权限-文件-版本管理按钮，默认显示！如需控制，请根据文档配置按钮权限！',
        KNOWLEDGE_FILE_DELETE_BUTTON_FLAG: '检测到系统未配置知识库-按钮权限-文件-删除按钮，默认显示！如需控制，请根据文档配置按钮权限！'
      }
      const component = state.KNOWLEDGE_MODULE
      const perms = [state.KNOWLEDGE_FOLDER_USER_FULL, state.KNOWLEDGE_FOLDER_ADD_BUTTON,
        state.KNOWLEDGE_FOLDER_EDIT_BUTTON, state.KNOWLEDGE_FOLDER_DELETE_BUTTON, state.KNOWLEDGE_FOLDER_USER_AUTH_BUTTON,
        state.KNOWLEDGE_FILE_DOWNLOAD_BUTTON, state.KNOWLEDGE_FILE_TAG_BUTTON,
        state.KNOWLEDGE_FILE_RENAME_BUTTON, state.KNOWLEDGE_FILE_VERSION_BUTTON, state.KNOWLEDGE_FILE_DELETE_BUTTON]
      const checkApi = '/sys/permission/checkPermissionExist'
      return new Promise(async resolve => {
        // 检测菜单路由是否已配置
        if (state.KNOWLEDGE_FLAG !== null) {
          resolve()
          return
        }
        const { result } = await getAction(checkApi, { component })
        // 不存在就不检查按钮权限了
        if (!result[state.KNOWLEDGE_MODULE]) {
          commit('SET_KNOWLEDGE_FLAG', flags)
          console.warn('检测到系统未配置知识库模块，如需使用，请根据文档配置菜单路由！')
          resolve()
          return
        }
        flags.KNOWLEDGE_FLAG = result
        // 检查按钮权限
        const { result: permMap } = await getAction(checkApi, { perms: perms.join(','), status: '1' })
        Object.keys(permMap).forEach(key => {
          flags[key + '_FLAG'] = permMap[key]
          !permMap[key] && console.warn(msgs[key + '_FLAG'])
        })
        commit('SET_KNOWLEDGE_FLAG', flags)
        resolve()
      })
    },
    GenerateRoutes({ commit }, data) {
      return new Promise(resolve => {
        const { roles } = data
        console.log('-----mutations---data----', data)
        let accessedRouters
        accessedRouters = filterAsyncRouter(asyncRouterMap, roles)
        console.log('-----mutations---accessedRouters----', accessedRouters)
        commit('SET_ROUTERS', accessedRouters)
        resolve()
      })
    },
    // 动态添加主界面路由，需要缓存
    UpdateAppRouter({ commit }, routes) {
      return new Promise(resolve => {
        // const [ roles ] = routes.constRoutes
        let routelist = routes.constRoutes
        commit('SET_ROUTERS', routelist)
        resolve()
      })
    }
  }
}

export default permission
