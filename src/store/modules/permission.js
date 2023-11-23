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
    // 知识库路径
    KNOWLEDGE_MODULE: 'modules/knowledge/Knowledge',
    // 知识库是否已配置
    KNOWLEDGE_FLAG: null,
    // 按钮权限-目录授权按钮
    KNOWLEDGE_FOLDER_USER_AUTH_BUTTON: 'KNOWLEDGE_FOLDER_USER_AUTH_BUTTON',
    KNOWLEDGE_FOLDER_USER_AUTH_BUTTON_FLAG: false,
    // 按钮权限-文件下载按钮
    KNOWLEDGE_FILE_DOWNLOAD_BUTTON: 'KNOWLEDGE_FILE_DOWNLOAD_BUTTON',
    KNOWLEDGE_FILE_DOWNLOAD_BUTTON_FLAG: false,
    // 管理员权限-强制开放全部目录查看权
    KNOWLEDGE_FOLDER_USER_FULL: 'KNOWLEDGE_FOLDER_USER_FULL',
    KNOWLEDGE_FOLDER_USER_FULL_FLAG: false
  },
  mutations: {
    SET_ROUTERS: (state, data) => {
      state.addRouters = data
      state.routers = constantRouterMap.concat(data)
      // console.log('-----mutations---SET_ROUTERS----', data)
    },
    SET_KNOWLEDGE_FLAG(state, data) {
      state.KNOWLEDGE_FLAG = data.KNOWLEDGE_FLAG
      state.KNOWLEDGE_FOLDER_USER_AUTH_BUTTON_FLAG = data.KNOWLEDGE_FOLDER_USER_AUTH_BUTTON_FLAG
      state.KNOWLEDGE_FILE_DOWNLOAD_BUTTON_FLAG = data.KNOWLEDGE_FILE_DOWNLOAD_BUTTON_FLAG
      state.KNOWLEDGE_FOLDER_USER_FULL_FLAG = data.KNOWLEDGE_FOLDER_USER_FULL_FLAG
    }
  },
  actions: {
    /**
     * 检查知识库菜单、权限
     */
    CheckKnowledgeFlag({ commit, state }) {
      const flags = {
        KNOWLEDGE_FLAG: false,
        KNOWLEDGE_FOLDER_USER_AUTH_BUTTON_FLAG: false,
        KNOWLEDGE_FILE_DOWNLOAD_BUTTON_FLAG: false,
        KNOWLEDGE_FOLDER_USER_FULL_FLAG: false
      }
      const checkApi = '/sys/permission/checkPermissionExist'
      return new Promise(async resolve => {
        // 检测菜单路由是否已配置
        if (state.KNOWLEDGE_FLAG === null) {
          const { result } = await getAction(checkApi, { component: state.KNOWLEDGE_MODULE })
          // 不存在就不检查按钮权限了
          if (!result) {
            commit('SET_KNOWLEDGE_FLAG', flags)
            console.info('检测到系统未配置知识库模块，如需使用，请根据文档配置菜单路由！')
            resolve()
            return
          }
          flags.KNOWLEDGE_FLAG = result
        }
        // 检查按钮权限-目录授权按钮
        const { result: flag1 } = await getAction(checkApi, { perms: state.KNOWLEDGE_FOLDER_USER_AUTH_BUTTON, status: '1' })
        flags.KNOWLEDGE_FOLDER_USER_AUTH_BUTTON_FLAG = flag1
        if (!flag1) {
          console.warn('检测到系统未配置知识库目录授权按钮权限，默认将隐藏授权按钮！如需控制，请根据文档配置按钮权限！')
        }
        // 检查按钮权限-文件下载按钮
        const { result: flag2 } = await getAction(checkApi, { perms: state.KNOWLEDGE_FILE_DOWNLOAD_BUTTON, status: '1' })
        flags.KNOWLEDGE_FILE_DOWNLOAD_BUTTON_FLAG = flag2
        if (!flag2) {
          console.warn('检测到系统未配置知识库文件下载按钮权限，默认将显示下载按钮！如需控制，请根据文档配置按钮权限！')
        }
        // 检查管理员权限-强制开放全部目录查看权
        const { result: flag3 } = await getAction(checkApi, { perms: state.KNOWLEDGE_FOLDER_USER_FULL, status: '1' })
        flags.KNOWLEDGE_FOLDER_USER_FULL_FLAG = flag3
        if (!flag3) {
          console.warn('检测到系统未配置知识库管理员权限，默认将不开放全部目录查看权！如需控制，请根据文档配置管理员权限！')
        }
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
