<template>
  <div v-show="true">
    <a-card :bordered="false" class="layer-manager-container">
      <!-- 查询区域 -->
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="24">
            <!--<a-col :xl="6" :lg="6" :md="6" :sm="12">-->
            <!--  <a-form-item label="查找目录">-->
            <!--    <a-input-search allowClear placeholder="请输入目录名称" style="width: 300px" v-model="queryParam.folderName" @search="onSearchFolder"/>-->
            <!--  </a-form-item>-->
            <!--</a-col>-->
            <a-col :xl="6" :lg="10" :md="10" :sm="24">
              <a-form-item label="查找文件">
                <a-input-search
                  allowClear
                  placeholder="请输入文件名称"
                  style="width: 100%"
                  v-model="queryParam.fileName"
                  @search="onSearchFile"/>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="9" :md="9" :sm="24">
              <a-form-item label="文件标签">
                <j-search-select-tag
                  keep-input
                  v-model="queryParam.tags"
                  placeholder="请输入标签"
                  dict="technical_file,tags,tags"
                  :async="true"
                  :pageSize="50"
                  mode="tags"
                />
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="4" :md="4" :sm="24">
              <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
                <a-button type="primary" @click="onSearchFile" icon="search">查询</a-button>
                <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
              </span>
            </a-col>
          </a-row>
        </a-form>
      </div>
      <a-row :gutter="16">
        <a-col :md="8" :sm="24" class="inner-tree">
          <div class="inner-tree-flex">
            <!-- <div class="box-flex">文档目录</div> -->
            <div class="flex-unshrink" style="margin-right: 1vh" v-if="show || isSearch">
              <a-button-group>
                <a-button
                  v-if="KNOWLEDGE_FOLDER_ADD_BUTTON_FLAG"
                  v-has="KNOWLEDGE_FOLDER_ADD_BUTTON"
                  :disabled="false && !!selectedNode.id"
                  title="新增"
                  type="primary"
                  icon="plus"
                  @click="handleAddFolder"></a-button>
                <a-button
                  v-else
                  :disabled="false && !!selectedNode.id"
                  title="新增"
                  type="primary"
                  icon="plus"
                  @click="handleAddFolder"></a-button>
                <a-button v-if="KNOWLEDGE_FOLDER_EDIT_BUTTON_FLAG" v-has="KNOWLEDGE_FOLDER_EDIT_BUTTON" title="编辑" icon="edit" @click="handleEditFolder"></a-button>
                <a-button v-else title="编辑" icon="edit" @click="handleEditFolder"></a-button>
                <a-button v-if="KNOWLEDGE_FOLDER_DELETE_BUTTON_FLAG" v-has="KNOWLEDGE_FOLDER_DELETE_BUTTON" title="删除" icon="delete" @click="deleteFolder"></a-button>
                <a-button v-else title="删除" icon="delete" @click="deleteFolder"></a-button>
                <a-button title="刷新" icon="reload" @click="onSearchFolder"></a-button>
                <a-button v-has="KNOWLEDGE_FOLDER_USER_AUTH_BUTTON" title="用户授权" icon="user-add" @click="openAuthModel"></a-button>
              </a-button-group>
              <a-button-group v-show="false" style="margin-left: 12px">
                <a-button icon="arrow-up" @click="handleUp"></a-button>
                <a-button icon="arrow-down" @click="handleDown"></a-button>
              </a-button-group>
            </div>
            <a-form style="flex: 1" layout="inline">
              <a-row :gutter="0">
                <a-col :xl="24" :lg="24" :md="24" :sm="24">
                  <a-form-item label="">
                    <a-input-search
                      v-model="queryParam.folderName"
                      allowClear
                      placeholder="查找目录"
                      style="width: 100%"
                      @search="onSearchFolder"/>
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>
          </div>
          <!--全部默认展示到额树-->
          <a-tree
            v-if="show"
            :expanded-keys.sync="expandedKeys"
            ref="tree"
            :blockNode="true"
            :show-icon="true"
            :selectedKeys="selectedIds"
            :load-data="onLoadChildrenData"
            :tree-data="treeData"
            :replaceFields="{ title: 'name', key: 'id' }"
            @select="onSelectThis"
          >
            <template v-slot:customIcon="props">
              <a-icon style="display: inline-block" :type="getIcon(props)"/>
            </template>
            <template v-slot:nodeTitle="props">
              <div class="dis-boxflex" :title="props.name">
                <div class="box-flex ellipsis" :style="{color: props.childFileSize > 0 ? '#01b683' : ''}">
                  {{ props.name }}
                </div>
                <div class="flex-unshrink dis-boxflex justify-between" style="flex-basis: 7vh">
                  <span
                    :title="`子目录${props.childFolderSize}个`"
                    style="flex-basis: 3vh"
                    v-if="props.childFolderSize">
                    <a-icon type="folder-open"/> {{ props.childFolderSize }}
                  </span>
                  <span v-else style="display: inline-block;width: 1vh"></span>
                  <span
                    :title="`子文件${props.childFileSize}个`"
                    style="flex-basis: 4vh"
                    v-if="props.childFileSize">
                    <a-icon type="file-text"/> {{ props.childFileSize }}
                  </span>
                </div>
              </div>
            </template>
          </a-tree>
          <!--用于搜索展示的树-->
          <a-tree
            v-if="isSearch"
            :expanded-keys.sync="expandedKeys"
            :multiple="multiple"
            ref="tree"
            :blockNode="true"
            :show-icon="true"
            :selectedKeys="selectedIds"
            :load-data="onLoadChildrenData"
            :tree-data="treeData"
            :replaceFields="{ title: 'name', key: 'id' }"
            @select="onSelectThis"
          >
            <template v-slot:customIcon="props">
              <a-icon style="display: inline-block" :type="getIcon(props)"/>
            </template>
            <template v-slot:nodeTitle="props">
              <div class="dis-boxflex" :title="props.name" :style="{ backgroundColor: searchResult.includes(props.id) ? 'rgba(186,231,255,.3)' : ''}">
                <div class="box-flex ellipsis" :style="{color: props.childFileSize > 0 ? '#01b683' : ''}">
                  {{ props.name }}
                </div>
                <div class="flex-unshrink dis-boxflex justify-between" style="flex-basis: 7vh">
                  <span
                    :title="`子目录${props.childFolderSize}个`"
                    style="flex-basis: 3vh"
                    v-if="props.childFolderSize">
                    <a-icon type="folder-open"/> {{ props.childFolderSize }}
                  </span>
                  <span v-else style="display: inline-block;width: 1vh"></span>
                  <span
                    :title="`子文件${props.childFileSize}个`"
                    style="flex-basis: 4vh"
                    v-if="props.childFileSize">
                    <a-icon type="file-text"/> {{ props.childFileSize }}
                  </span>
                </div>
              </div>
            </template>
          </a-tree>
        </a-col>
        <a-col :md="16" :sm="24">
          <div class="table-operator">
            <div style="display: inline-block;margin-left: 0vh;">
              <a-upload
                accept=".doc,.docx,.xls,.xlsx,.pdf,.ppt,.pptx,.png,.jpg,.jpeg,.bmp,.tif,.webp,.rar,.zip,.7z,.tar,.gz"
                :disabled="!selectedIds || selectedIds.length <= 0"
                :file-list="fileList"
                @change="handleUploadFileChange"
                :showUploadList="false"
                :headers="headers"
                :data="{ folderId: selectedIds && selectedIds.length > 0 ? selectedIds[0] : '' }"
                :action="uploadCompleteUrl"
                :name="uploadConfig.name"
                :multiple="uploadConfig.multiple"
              >
                <a-button
                  size="small"
                  type="primary"
                  :disabled="!selectedIds || selectedIds.length <= 0 || !selectedNode || !selectedNode.isLeaf"
                >上传文件
                </a-button
                >
              </a-upload>
            </div>
          </div>
          <!--文件列表-->
          <file-list ref="fileList" v-if="show || isSearch" :selected-ids="selectedIds" :search-params="queryParam" @reload="loadAllTree()"></file-list>
        </a-col>
      </a-row>
    </a-card>
    <folder-modal ref="folderModal" @ok="folderModalFormOk(arguments)"></folder-modal>
    <folder-user-permission-modal ref="userPermissionModal" @ok="folderModalFormOk(arguments)"></folder-user-permission-modal>
  </div>
</template>

<script>
import { deleteAction, getAction, postAction } from '@/api/manage'
import { ACCESS_TOKEN, BUSINESS_ID } from '@/store/mutation-types'
import { union } from 'lodash'
import Vue from 'vue'
import folderConfig from './modules/folderConfig'
import FolderModal from './modules/FolderModal'
import HistoryList from './modules/HistoryList'
import FileList from './modules/FileList'
import FolderUserPermissionModal from './modules/FolderUserPermissionModal'
import { mapState } from 'vuex'

export default {
  name: 'Knowledge',
  components: {
    FolderModal,
    HistoryList,
    FileList,
    FolderUserPermissionModal
  },
  /**
   * 业务id绑定模式
   * 1、添加业务id属性
   */
  props: {
    // [PROJECT_ID]: {
    //   type: String,
    //   default: ''
    // },
    // [BUSINESS_ID]: {
    //   type: String,
    //   default: ''
    // }
  },
  /**
   * 业务id绑定模式
   * 2、监听业务id改变
   */
  watch: {
    // [PROJECT_ID]: {
    //   immediate: true,
    //   deep: false,
    //   handler(val) {
    //     this.debug && console.log(PROJECT_ID + '改变了::', val)
    //     this.loadAllTree(val);
    //   }
    // },
    // [BUSINESS_ID]: {
    //   immediate: true,
    //   deep: false,
    //   handler(val) {
    //     this.debug && console.log(BUSINESS_ID + '改变了::', val)
    //     this.loadAllTree(val);
    //   }
    // }
  },
  data() {
    return {
      /**
       * 业务id绑定模式
       * 3、需要注释常量
       */
      businessId: 'KNOWLEDGE_BASE',
      businessName: '知识库',
      queryParam: {
        folderName: null,
        fileName: null,
        tags: null
      },
      uploadConfig: {
        action: '/technical/file/upload',
        name: 'multipartFiles',
        multiple: true
      },
      headers: {
        'X-Access-Token': Vue.ls.get(ACCESS_TOKEN)
      },
      fileList: [], // 用于清空上传文件数据
      url: {
        deleteFolderUrl: '/technical/folder/business/',
        searchFolder: '/technical/folder/business/search/folder',
        searchFile: '/technical/folder/business/search/file',
        findPath: '/technical/folder/findPath/'
      },
      debug: process.env.NODE_ENV !== 'production',
      show: true,
      isSearch: false,
      multiple: false,
      treeData: [], // 左侧树数据
      selectedIds: [],
      selectedNode: {},
      expandedKeys: [],
      searchResult: []
    }
  },
  computed: {
    ...mapState({
      KNOWLEDGE_FOLDER_ADD_BUTTON: state => state.permission.KNOWLEDGE_FOLDER_ADD_BUTTON,
      KNOWLEDGE_FOLDER_ADD_BUTTON_FLAG: state => state.permission.KNOWLEDGE_FOLDER_ADD_BUTTON_FLAG,
      KNOWLEDGE_FOLDER_EDIT_BUTTON: state => state.permission.KNOWLEDGE_FOLDER_EDIT_BUTTON,
      KNOWLEDGE_FOLDER_EDIT_BUTTON_FLAG: state => state.permission.KNOWLEDGE_FOLDER_EDIT_BUTTON_FLAG,
      KNOWLEDGE_FOLDER_DELETE_BUTTON: state => state.permission.KNOWLEDGE_FOLDER_DELETE_BUTTON,
      KNOWLEDGE_FOLDER_DELETE_BUTTON_FLAG: state => state.permission.KNOWLEDGE_FOLDER_DELETE_BUTTON_FLAG,
      KNOWLEDGE_FOLDER_USER_AUTH_BUTTON: state => state.permission.KNOWLEDGE_FOLDER_USER_AUTH_BUTTON
    }),
    uploadCompleteUrl: function () {
      return window._CONFIG['domianURL'] + this.uploadConfig.action
    }
  },
  mounted() {
    this.loadAllTree()
  },
  methods: {
    openAuthModel() {
      if (!this.selectedNode.id) {
        this.$message.warn('请选择目录！')
        return
      }
      this.$refs.userPermissionModal.edit(this.selectedNode)
    },
    searchReset() {
      this.queryParam = {
        folderName: null,
        fileName: null,
        tags: null
      }
      this.loadAllTree()
    },
    getIcon(node) {
      const { expanded, childFolderSize, childFileSize } = node
      return (expanded || childFolderSize || childFileSize) ? 'folder-open' : 'folder'
    },
    /**
     * 加载指定选中节点的路径
     * @param folderId
     * @returns {Promise<unknown>}
     */
    loadExpandedKeys(folderId) {
      return new Promise(resolve => {
        getAction(`${this.url.findPath}${folderId}`).then(res => {
          if (res.success) {
            this.expandedKeys = res.result
            resolve(res.result)
          } else {
            resolve([])
          }
        })
      })
    },
    /**
     * 手动加载到指定树层级的数据
     */
    loadSearchFolderTree(folderTreeId) {
      const that = this
      return new Promise(async resolve => {
        let curNode = that.treeData
        for (let folderId of folderTreeId) {
          const folder = curNode && curNode.filter(item => item.id === folderId)[0]
          if (!folder) {
            break
          }
          if (!(folder.children && folder.children.length)) {
            await that.onLoadChildrenData({ dataRef: folder }, false)
          }
          curNode = folder.children
        }
        resolve(that.treeData)
      })
    },
    loadAllTree(flag = true) {
      this.selectedIds = []
      this.searchResult = []
      this.$refs.fileList.dataSource = []
      if (!flag) {
        this.show = false
        this.isSearch = false
      } else {
        this.show = false
        this.isSearch = false
        this.getTreeRootData().then(() => (this.show = true))
      }
    },
    onSearchFolder(folderName, folderId) {
      if (!this[BUSINESS_ID]) {
        this.$message.info('请选择项目！')
        return
      }
      folderName = folderName || this.queryParam.folderName
      if (typeof folderId !== 'string') {
        folderId = ''
      }
      if (!folderId && (!folderName || typeof folderName !== 'string')) {
        console.log('onSearchFolder clear', folderName)
        this.loadAllTree()
        return
      }
      getAction(`${this.url.searchFolder}`, {
        businessId: this[BUSINESS_ID],
        folderName,
        folderId
      }).then(res => {
        if (res.success) {
          this.selectedIds = []
          this.expandedKeys = res.result.reduce((pre, cur) => {
            this.selectedIds.push(cur.folder.id)
            return union(pre, cur.folderTreeId)
          }, [])
          this.searchResult = [...this.selectedIds]
          console.log('onSearchFolder', folderName, res, this.selectedIds, this.expandedKeys)
          this.isSearch = false
          this.isSearch = !!(folderName && folderName.trim())
          this.show = !this.isSearch
          this.multiple = this.isSearch
        } else {
          this.$notification.error({
            message: '出错提示',
            description: res.message
          })
        }
      })
    },
    onSearchFile() {
      if (!this[BUSINESS_ID]) {
        this.$message.info('请选择项目！')
        return
      }
      this.queryParam.folderName = ''
      const fileName = this.queryParam.fileName
      const tags = this.queryParam.tags
      if (!tags && (typeof fileName !== 'string' || !fileName)) {
        this.loadAllTree()
        return
      }
      getAction(`${this.url.searchFile}`, {
        businessId: this[BUSINESS_ID],
        fileName,
        tags
      }).then(res => {
        if (res.success) {
          this.selectedIds = []
          this.expandedKeys = res.result.reduce((pre, cur) => {
            this.selectedIds.push(cur.file.folderId)
            return union(pre, cur.folderTreeId)
          }, [])
          this.searchResult = [...this.selectedIds]
          console.log('onSearchFile', fileName, res, this.selectedIds, this.expandedKeys)
          this.isSearch = false
          this.isSearch = !!(fileName && fileName.trim()) || !!(tags && tags.trim())
          this.show = !this.isSearch
          this.multiple = this.isSearch
        } else {
          this.$notification.error({
            message: '出错提示',
            description: res.message
          })
        }
      })
    },
    /**
     * 选中节点的操作
     * 1.保存选中的data -> this.selectedNode
     * 2.保存当前选中的id
     * 3.当状态为选中时，判断目录是否有子目录和子目录数据，去加载数据
     * 4.当状态为选中时，加载文件列表
     * 5.搜索结果高亮了多个选中项时，加载指定选中项的数据
     */
    onSelectThis(selectedKeys, e) {
      this.selectedIds = selectedKeys
      this.selectedNode = e.selectedNodes && e.selectedNodes.length > 0 ? e.node.dataRef : {}
      this.debug && console.log(selectedKeys, e)
      this.debug && console.log(this.selectedNode)
      // this.debug && console.log('展开的id | 选中的id:', this.expandedKeys, this.selectedIds, this.$refs.tree);
      if (e.selected) {
        // e.node.dataRef &&
        // e.node.dataRef.childFolderSize &&
        // !(e.node.dataRef.children && e.node.dataRef.children.length) &&
        // this.onLoadChildrenData(e.node, false);
        // 设置叶子节点时才展示文件列表
        // e.node.dataRef && e.node.dataRef.isLeaf && this.loadFileData();
        // 都展示文件列表
        // e.node.dataRef && this.loadFileData();
      }
      // 选中且未展开时设置自动展开
      e.selected && !e.node.expanded && e.node.dataRef && e.node.dataRef.childFolderSize && e.node.onExpand()
      // 取消选中且已展开时收起展开
      !e.selected && e.node.expanded && e.node.dataRef && e.node.dataRef.childFolderSize && e.node.onExpand()
      // 处理搜索时，高亮了多个搜索结果，点击其中一个结果然后加载列表
      if (e.selectedNodes && e.selectedNodes.length > 1) {
        console.log('加载选择的搜索项', selectedKeys, e)
        this.multiple = false
        this.selectedIds = [e.node.dataRef.id]
      }
      console.log('选中节点', selectedKeys, this.$refs.tree, this.selectedNode, this.selectedIds, this.expandedKeys)
    },
    getTreeRootData() {
      return new Promise((resolve, reject) => {
        postAction(`/technical/folder/business/findRoot`, {
          initialFolders: folderConfig,
          businessId: this.businessId,
          businessName: this.businessName,
          type: 'DOCUMENT'
        }).then(res => {
          if (res.success) {
            const tree = this.treeData = res.result.map(item => {
              item.scopedSlots = { title: 'nodeTitle', icon: 'customIcon' }
              // 判断节点是否包含子目录，不包含时不去请求
              item.isLeaf = item.childFolderSize === 0
              return item
            })
            if (!(tree && tree.length > 0)) {
              resolve([])
            }
            // 重置回选项
            if (this.selectedNode.id) {
              this.selectedIds = [this.selectedNode.id]
            } else {
              this.selectedIds = [res.result[0].id]
              this.selectedNode = res.result[0]
            }
            this.debug && console.log('展开的id | 选中的id:', this.expandedKeys, this.selectedIds)
            // 展开到指定层级目录
            this.loadExpandedKeys(this.selectedIds[0])
            .then(paths => this.loadSearchFolderTree(paths))
            .then(() => resolve(tree))
          } else {
            this.$notification.error({
              message: '出错提示',
              description: res.message
            })
            reject()
          }
        })
      })
    },
    /**
     * 加载子节点数据
     * @param treeNode 目标节点
     * @param cacheFlag 如果手动加载的数据，antdTree无法识别会重新加载，因此引入缓存标识
     * @returns {Promise<unknown>}
     */
    onLoadChildrenData(treeNode, cacheFlag = true) {
      return new Promise(resolve => {
        // 默认初始第一个节点
        const { dataRef } = treeNode || { dataRef: this.treeData[0] }
        // 修复展开根目录后，收起再展开会导致列表异常（dataRef指向相同，但是不知道为什么没有缓存结果，因此直接放行）
        if (cacheFlag && treeNode && dataRef.children && dataRef.children.length) {
          resolve()
          return
        }
        getAction('/technical/folder/findChild?parentId=' + dataRef.id).then(res => {
          if (res.success) {
            this.debug && console.log('onLoadChildrenData', treeNode, dataRef, this.selectedIds)
            const result = res.result.map(item => {
              item.scopedSlots = { title: 'nodeTitle', icon: 'customIcon' }
              // 判断节点是否包含子目录，不包含时不去请求
              item.isLeaf = item.childFolderSize === 0
              return item
            })
            this.$set(dataRef, 'children', result)
            resolve(result)
          } else {
            this.$notification.error({
              message: '出错提示',
              description: res.message
            })
            resolve([])
          }
        })
      })
    },
    handleAddFolder() {
      let params = {}
      if (this.selectedIds && this.selectedIds.length > 0) {
        params.parentId = this.selectedIds[0]
      }
      this.$refs.folderModal.add(params)
      this.$refs.folderModal.title = params.parentId ? '新增子目录' : '新增根目录'
      this.$refs.folderModal.disableSubmit = false
    },
    handleEditFolder() {
      let params = {}
      this.debug && console.log('即将编辑的数据', this.selectedNode)
      if (this.selectedIds && this.selectedIds.length > 0) {
        params = this.selectedNode
        this.$refs.folderModal.edit(params)
        this.$refs.folderModal.title = '编辑'
        this.$refs.folderModal.disableSubmit = false
      } else {
        this.$message.warning('请选择您要操作的目录！')
      }
    },
    deleteFolder() {
      let that = this
      const deletedData = { ...that.selectedNode }
      if (that.selectedIds && that.selectedIds.length > 0) {
        that.$confirm({
          title: '确定删除?',
          content: '删除后无法恢复，请谨慎操作！',
          onOk() {
            deleteAction(that.url.deleteFolderUrl + that.selectedIds[0]).then(res => {
              if (res.success) {
                // 选回父节点
                that.selectedNode = deletedData.parentId ? { id: deletedData.parentId } : {}
                that.loadAllTree()
                that.$message.success('删除成功')
              } else {
                that.$notification.error({
                  message: '出错提示',
                  description: res.message
                })
              }
            })
          },
          onCancel() {
          }
        })
      } else {
        that.$message.warning('请选择您要操作的目录！')
      }
    },
    folderModalFormOk(args) {
      this.selectedNode = args[0]
      this.loadAllTree()
    },
    /**
     * 上移操作 todo
     */
    handleUp() {
      if (this.selectedIds && this.selectedIds.length > 0) {
        this.debug && console.log(this.selectedIds)
        const treeData = this.treeData
      } else {
        this.$message.warning('请选择您要操作的目录！')
      }
    },
    /**
     * 下移操作 todo
     */
    handleDown() {
      if (this.selectedIds && this.selectedIds.length > 0) {
        this.debug && console.log(this.selectedIds)
        const treeData = this.treeData
      } else {
        this.$message.warning('请选择您要操作的目录！')
      }
    },
    /**
     * 文件上传监听
     * @param e
     */
    handleUploadFileChange(e) {
      this.debug && console.log(e)
      // 上传进度显示
      if (e.event) {
        let baifenbi = parseInt(e.event.loaded * 100 / e.event.total) + '%'
        this.$message.loading({
          content: '上传进度：' + baifenbi,
          key: 'uploadProcess',
          duration: 2
        })
      }
      let fileList = [...e.fileList]
      let responseArr = []
      let errorArr = []
      this.fileList = fileList
      try {
        fileList.forEach(item => {
          if (item.response) {
            if (!item.response.success) {
              responseArr.push(false)
              errorArr.push('文件' + item.name + '上传失败：' + item.response.message)
            } else {
              responseArr.push(true)
            }
          }
        })
      } catch (error) {
        this.debug && console.log(error)
      }
      this.debug && console.log(errorArr)
      this.debug && console.log(responseArr)
      if (errorArr.length > 0 && responseArr.length > 0 && responseArr.length === fileList.length) {
        this.$notification.error({
          message: '出错提示',
          description: errorArr.join(' \n '),
          duration: null
        })
        this.fileList = []
      } else if (errorArr.length <= 0 && responseArr.length > 0 && responseArr.length === fileList.length) {
        this.$message.success('文件上传成功')
        this.fileList = []
        this.loadAllTree()
      }
    },
    /**
     * 上传文件夹 暂未用到
     * @param e
     */
    handleUploadFileDirectoryChange(e) {
      this.debug && console.log(e)
      let fileList = [...e.fileList]
      let responseArr = []
      let errorArr = []
      try {
        fileList.forEach(item => {
          if (item.response) {
            if (!item.response.success) {
              responseArr.push(false)
              errorArr.push('文件' + item.name + '上传失败：' + item.response.message)
            } else {
              responseArr.push(true)
            }
          }
        })
      } catch (error) {
        this.debug && console.log(error)
      }
      this.debug && console.log(errorArr)
      this.debug && console.log(responseArr)
      if (errorArr.length > 0 && responseArr.length > 0 && responseArr.length === fileList.length) {
        this.$notification.error({
          message: '出错提示',
          description: errorArr.join(' \n')
        })
      } else if (errorArr.length <= 0 && responseArr.length > 0 && responseArr.length === fileList.length) {
        this.$message.success('文件上传成功')
        this.loadAllTree()
      }
    },
    /**
     * 获取指定节点的根节点
     * @param node
     * @returns {*}
     */
    getRootNode(node) {
      if (node.parentId === '') {
        return node
      }
      node = this.getNode(node.parentId, this.treeData)
      return this.getRootNode(node)
    },
    /**
     * 获取指定节点
     * @param id
     * @param arr
     * @returns {*|null}
     */
    getNode(id, arr) {
      if (!arr || !arr.length) {
        return null
      }
      let target = arr.filter(e => e.id === id)[0]
      if (!target) {
        for (let i = 0; i < arr.length; i++) {
          target = this.getNode(id, arr[i].children)
          if (target) {
            break
          }
        }
      }
      return target
    }
  }
}
</script>
<style lang="less" scoped>
/deep/ .ant-tree li .ant-tree-node-content-wrapper {
  padding: 0 !important;
}

/deep/ .ant-tag {
  margin-right: 0 !important;
  width: 4vh;
}

//修复自定义的树菜单title样式第二步
/deep/ .ant-tree-title {
  display: inline-block;
  width: calc(100% - 24px);
}

/deep/ .layer-manager-container {
  border-radius: 1vh;
  .ant-card-body {
    padding: 1vh !important;
  }
  .inner-tree {
    border-right: .5px rgba(232, 232, 232, 0.5) solid;
    // 实际的树
    .real-tree {
      max-height: 67vh;
      overflow-y: auto;
      padding-right: .5vh;

      &::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }

      &::-webkit-scrollbar-track {
        background: rgb(239, 239, 239);
        border-radius: 2px;
      }

      &::-webkit-scrollbar-thumb {
        background: #bfbfbf;
        border-radius: 6px;
      }

      &::-webkit-scrollbar-thumb:hover {
        background: #3fa9fb;
      }

      &::-webkit-scrollbar-corner {
        background: #69c3ff;
      }
    }

    // 按钮等
    .inner-tree-flex {
      display: -ms-flexbox;
      display: flex;
      -ms-flex-align: center;
      align-items: center;
      justify-content: space-around;
      // 搜索栏样式
      .ant-form-item {
        margin-right: 0;
        width: 100%;
        .ant-form-item-control-wrapper {
          width: 100%;
          .ant-form-item-control {
            line-height: 32px;
            width: 100%;
          }
        }
      }
    }
  }

  .inner-container {
    border-left: .5px rgba(232, 232, 232, 0.5) solid;
  }
}
</style>
