<template>
  <div v-show="true">
    <a-card :bordered="false">
      <!-- 查询区域 -->
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="24">
            <!--<a-col :xl="6" :lg="6" :md="6" :sm="12">-->
            <!--  <a-form-item label="查找目录">-->
            <!--    <a-input-search allowClear placeholder="请输入目录名称" style="width: 300px" v-model="queryParam.folderName" @search="onSearchFolder"/>-->
            <!--  </a-form-item>-->
            <!--</a-col>-->
            <a-col :xl="6" :lg="6" :md="6" :sm="12">
              <a-form-item label="查找文件">
                <a-input-search allowClear placeholder="请输入文件名称" style="width: 300px"
                                v-model="queryParam.fileName" @search="onSearchFile"/>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="6" :md="6" :sm="12">
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
            <a-col :xl="6" :lg="6" :md="6" :sm="24">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="onSearchFile" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
            </span>
            </a-col>
          </a-row>
        </a-form>
      </div>

      <a-row :gutter="16">
        <a-col :md="8" :sm="24">
          <div class="dis-boxflex">
            <!-- <div class="box-flex">文档目录</div> -->
            <div class="flex-unshrink" style="margin-right: 1vh" v-if="show || isSearch">
              <a-button-group>
                <a-button :disabled="false && !!selectedNode.id" title="新增" type="primary" icon="plus"
                          @click="handleAddFolder"></a-button>
                <a-button title="编辑" icon="edit" @click="handleEditFolder"></a-button>
                <a-button title="删除" icon="delete" @click="deleteFolder"></a-button>
                <a-button title="刷新" icon="reload" @click="onSearchFolder"></a-button>
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
                    <a-input-search v-model="queryParam.folderName" allowClear placeholder="筛选目录"
                                    style="width: 300px" @search="onSearchFolder"/>
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>
          </div>
          <!--全部默认展示到额树-->
          <a-tree
            v-if="show"
            default-expand-all
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
                <div class="box-flex ellipsis" :style="{color: props.childFileSize > 0 ? '' : ''}">{{
                    props.name
                  }}
                </div>
                <div class="flex-unshrink">
                  {{
                    props.childFolderSize && props.childFolderSize > 0 ? '子目录 ' + props.childFolderSize : ''
                  }}{{ props.childFileSize && props.childFileSize > 0 ? '&nbsp子文件 ' + props.childFileSize : '' }}
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
              <div class="dis-boxflex" :title="props.name">
                <div class="box-flex ellipsis" :style="{color: props.childFileSize > 0 ? '' : ''}">{{
                    props.name
                  }}
                </div>
                <div class="flex-unshrink">
                  {{
                    props.childFolderSize && props.childFolderSize > 0 ? '子目录 ' + props.childFolderSize : ''
                  }}&nbsp;{{ props.childFileSize && props.childFileSize > 0 ? '子文件 ' + props.childFileSize : '' }}
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
                <!-- :before-upload="beforeUploadFile" -->
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

          <div>
            <a-table
              size="small"
              ref="table"
              rowKey="id"
              :columns="columns"
              :dataSource="dataSource"
              :pagination="false"
              :loading="loading"
              @change="handleTableChange"
            >
              <template v-slot:nameSlot="text, record">
                <a-button
                  type="link"
                  @click="handlePreview(record)"
                  :title="text"
                  class="button-ellipsis"
                  style="width: 100%; padding: 0;"
                >{{ text }}
                </a-button>
              </template>

              <template v-slot:tagsSlot="tags, row">
                <a-tag v-for="(tag, idx) in tags.split(',')"
                       :title="tag" :key="tag + idx"
                       style="margin-right: .2vh !important;"
                       :color="getTagColor(tag)">{{ tag }}
                </a-tag>
              </template>

              <template slot="action" slot-scope="text, record">
                <a href="javascript:;" @click="changeTags(record)">标签</a>
                <a-divider type="vertical"/>
                <a :href="downloadCompleteUrl + record.id" target="_blank">下载</a>
                <a-divider type="vertical"/>
                <a href="javascript:;" @click="changeFileName(record)">重命名</a>
                <a-divider type="vertical"/>
                <a href="javascript:;" v-show="false" @click="e => showQrCode(record, e)">二维码</a>
                <a-divider v-show="false" type="vertical"/>
                <a-dropdown>
                  <a class="ant-dropdown-link">更多
                    <a-icon type="down"/>
                  </a>
                  <a-menu slot="overlay">
                    <a-menu-item>
                      <a href="javascript:;" @click="handleShowHistoryList(record.id)">版本管理</a>
                    </a-menu-item>
                    <a-menu-item>
                      <a-popconfirm title="确定删除吗?" @confirm="() => deleteFile(record.id)">
                        <a>删除</a>
                      </a-popconfirm>
                    </a-menu-item>
                  </a-menu>
                </a-dropdown>
              </template>
            </a-table>
          </div>
        </a-col>
      </a-row>
    </a-card>
    <folder-modal ref="folderModal" @ok="folderModalFormOk(arguments)"></folder-modal>
    <!-- 历史版本 -->
    <history-list ref="historyList" @ok="handleCloseVersionHistoryList"></history-list>
    <!--重命名-->
    <a-modal
      v-model="renameVisible"
      title="请输入新文件名称"
      ok-text="确认"
      cancel-text="取消"
      @ok="doRenameFile(true)"
      @cancel="doRenameFile(false)">
      <a-input v-model="rename" placeholder="请输入新文件名称"></a-input>
    </a-modal>
    <!--打标签-->
    <a-modal
      v-model="tagsVisible"
      title="请输入标签"
      ok-text="确认"
      cancel-text="取消"
      @ok="doChangeTags(true)"
      @cancel="doChangeTags(false)">
      <j-search-select-tag
        keep-input
        v-model="tags"
        placeholder="请输入标签"
        dict="technical_file,tags,tags"
        :async="true"
        :pageSize="50"
        mode="tags"
      />
    </a-modal>
  </div>
</template>

<script>
import { deleteAction, getAction, postAction, putAction } from '@/api/manage'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { ACCESS_TOKEN, BUSINESS_ID } from '@/store/mutation-types'
import { union } from 'lodash'
import QRCode from 'qrcodejs2'
import Vue from 'vue'
import folderConfig from './modules/folderConfig'
import FolderModal from './modules/FolderModal'
import HistoryList from './modules/HistoryList'

const columns = [
  // {
  //   title: '序号',
  //   dataIndex: '',
  //   key: 'rowIndex',
  //   width: 70,
  //   align: 'center',
  //   customRender: function(t, r, index) {
  //     return parseInt(index) + 1
  //   }
  // },
  {
    title: '文件名称',
    align: 'left',
    ellipsis: true,
    dataIndex: 'name',
    fixed: 'left',
    scopedSlots: { customRender: 'nameSlot' }
    // width: 380
    // width: 280,
  },
  // {
  //   title: '上传人',
  //   align: 'center',
  //   width: 100,
  //   dataIndex: 'uploadBy'
  // },
  // {
  //   title: '类型',
  //   align: 'center',
  //   dataIndex: 'suffix',
  //   width: 100
  // },
  {
    title: '文件大小',
    align: 'center',
    width: 100,
    dataIndex: 'size'
  },
  {
    title: '标签',
    align: 'center',
    width: 200,
    dataIndex: 'tags',
    scopedSlots: { customRender: 'tagsSlot' }
  },
  // {
  //   title: '上传时间',
  //   align: 'center',
  //   width: 120,
  //   dataIndex: 'createTime'
  // },
  {
    title: '版本',
    align: 'center',
    width: 100,
    dataIndex: 'version',
    customRender: function (t, r, index) {
      return 'V' + (r.version + 1)
    }
  },
  {
    title: '操作',
    dataIndex: 'action',
    // fixed: 'right',
    scopedSlots: { customRender: 'action' },
    align: 'center',
    width: 210,
    fixed: 'right'
  }
]
export default {
  name: 'SafetyFile',
  components: {
    FolderModal,
    HistoryList
  },
  mixins: [JeecgListMixin],
  data() {
    return {
      businessId: 'KNOWLEDGE_BASE',
      businessName: '知识库',
      cardList: [],
      cardListLoading: true, // 加载中

      disableMixinCreated: true,
      // 分页
      total: 0,
      page_sizeOptions: ['20', '30', '40', '50'], // 每页条数选项
      page: 1, // 当前页数
      page_size: 20, // 默认每页条数.

      queryParam: {
        folderName: null,
        fileName: null,
        tags: null
      },

      treeData: [], // 左侧树数据
      selectedIds: [],
      selectedNode: {},
      uploadConfig: {
        action: '/technical/file/upload',
        name: 'multipartFiles',
        multiple: true
      },
      headers: {
        'X-Access-Token': Vue.ls.get(ACCESS_TOKEN)
      },
      fileList: [], // 用于清空上传文件数据
      columns,
      url: {
        list: '/technical/file/files?folderId=',
        deleteFolderUrl: '/technical/folder/business/',
        deleteFileUrl: '/technical/file',
        searchFolder: '/technical/folder/business/search/folder',
        searchFile: '/technical/folder/business/search/file',
        downLoadUrl: '/technical/file/download/',
        rename: '/technical/file/rename',
        reTags: '/technical/file/reTags'
      },
      show: true,
      expandedKeys: [],
      debug: process.env.NODE_ENV === 'development',
      isSearch: false,
      multiple: false,
      // 重命名功能
      rename: '',
      renameFile: null,
      renameVisible: false,
      // 打标签功能
      tags: '',
      tagsFile: null,
      tagsVisible: false
    }
  },
  computed: {
    downloadCompleteUrl: function () {
      return window._CONFIG['domianURL'] + this.url.downLoadUrl
    },
    uploadCompleteUrl: function () {
      return window._CONFIG['domianURL'] + this.uploadConfig.action
    }
  },
  mounted() {
    this.loadAllTree(true);
  },
  methods: {
    getTagColor(tag) {
      if (!this.queryParam.tags) {
        return ''
      }
      const tags = this.queryParam.tags.split(',')
      return tags.includes(tag) ? 'green' : ''
    },
    searchReset() {
      this.queryParam = {
        folderName: null,
        fileName: null,
        tags: null
      }
      this.onSearchFile()
    },
    /**
     * 变更标签方法
     * @param flag
     */
    doChangeTags(flag) {
      if (flag) {
        console.log('标签', this.tagsFile, this.tags)
        putAction(`${this.url.reTags}?fileId=${this.tagsFile.id}&tags=${this.tags}`)
        .then(res => {
          if (res.success) {
            this.$message.success('操作成功');
            this.loadFileData()
          } else {
            this.$message.error('操作失败：', res.message)
          }
          this.tagsVisible = false
        })
      } else {
        this.tags = ''
        this.tagsFile = null
        this.tagsVisible = false
      }
    },
    changeTags(record) {
      this.tags = record.tags || undefined
      this.tagsFile = record
      this.tagsVisible = true
    },
    /**
     * 重命名文件
     * @param flag 执行flag
     */
    doRenameFile(flag) {
      if (flag) {
        console.log('新文件名', this.renameFile, this.rename)
        putAction(`${this.url.rename}?fileId=${this.renameFile.id}&name=${this.rename}`)
        .then(res => {
          if (res.success) {
            this.$message.success('操作成功');
            this.loadFileData()
          } else {
            this.$message.error('操作失败：', res.message)
          }
          this.renameVisible = false
        })
      } else {
        this.rename = ''
        this.renameFile = null
        this.renameVisible = false
      }
    },
    changeFileName(record) {
      this.rename = record.name
      this.renameFile = record
      this.renameVisible = true
    },
    getIcon(node) {
      const { expanded, childFolderSize, childFileSize } = node
      return (expanded || childFolderSize || childFileSize) ? 'folder-open' : 'folder'
    },
    /**
     * 文件上传后的回调
     */
    async onUploadCallback(fileLength) {
      const { id: folderId } = this.selectedNode;
      if (!folderId) {
        return;
      }
      this.onSearchFolder(null, folderId)
    },
    /**
     * 手动加载到指定树层级的数据
     */
    loadSearchFolderTree(folderTreeId) {
      const that = this;
      return new Promise(async resolve => {
        let curNode = that.treeData;
        for (let folderId of folderTreeId) {
          const folder = curNode && curNode.filter(item => item.id === folderId)[0];
          if (!folder) {
            break;
          }
          if (!(folder.children && folder.children.length)) {
            await that.onLoadChildrenData({ dataRef: folder }, false);
          }
          curNode = folder.children;
        }
        resolve(that.treeData);
      });
    },
    loadAllTree(flag) {
      this.selectedIds = [];
      this.dataSource = [];
      if (!flag) {
        this.show = false;
        this.isSearch = false;
      } else {
        this.show = false;
        this.isSearch = false;
        this.getTreeRootData().then((treeNode) => this.show = true)
      }
    },
    onSearchFolder(folderName, folderId) {
      if (!this[BUSINESS_ID]) {
        this.$message.info('请选择项目！');
        return;
      }
      folderName = folderName || this.queryParam.folderName
      if (typeof folderId !== 'string') {
        folderId = '';
      }
      if (!folderId && (!folderName || typeof folderName !== 'string')) {
        console.log('onSearchFolder clear', folderName);
        this.loadAllTree(true);
        return;
      }
      getAction(`${this.url.searchFolder}`, {
        businessId: this[BUSINESS_ID],
        folderName,
        folderId
      }).then(res => {
        if (res.success) {
          this.selectedIds = [];
          this.expandedKeys = res.result.reduce((pre, cur) => {
            this.selectedIds.push(cur.folder.id);
            return union(pre, cur.folderTreeId)
          }, []);
          console.log('onSearchFolder', folderName, res, this.selectedIds, this.expandedKeys);
          this.isSearch = false;
          this.isSearch = !!(folderName && folderName.trim());
          this.show = !this.isSearch;
          this.multiple = this.isSearch;
          this.loadFileData();
        } else {
          this.$notification.error({
            message: '出错提示',
            description: res.message
          });
        }
      });
    },
    onSearchFile() {
      if (!this[BUSINESS_ID]) {
        this.$message.info('请选择项目！');
        return;
      }
      this.queryParam.folderName = ''
      const fileName = this.queryParam.fileName
      const tags = this.queryParam.tags
      if (!tags && (typeof fileName !== 'string' || !fileName)) {
        this.loadAllTree(true);
        return;
      }
      getAction(`${this.url.searchFile}`, {
        businessId: this[BUSINESS_ID],
        fileName,
        tags
      }).then(res => {
        if (res.success) {
          this.selectedIds = [];
          this.expandedKeys = res.result.reduce((pre, cur) => {
            this.selectedIds.push(cur.file.folderId);
            return union(pre, cur.folderTreeId)
          }, []);
          this.isSearch = false;
          this.isSearch = !!(fileName && fileName.trim()) || !!(tags && tags.trim());
          this.show = !this.isSearch;
          this.multiple = this.isSearch;
          this.loadFileData();
        } else {
          this.$notification.error({
            message: '出错提示',
            description: res.message
          });
        }
      });
    },
    /**
     * 控制默认生产的目录
     * @deprecated 使用 initialFolders 参数替代（支持JSON格式）
     * @returns {string|string}
     */
    subFolders() {
      const folders = []
      return folders.length ? folders.join(',') : ''
    },
    showQrCode(record, e) {
      e.preventDefault()
      this.debug && console.log('显示二维码', record)
      this.$alert('<div id="qrCode" ref="qrCode"></div>', '扫一扫', {
        dangerouslyUseHTMLString: true,
        center: true,
        customClass: 'qr-code-messagebox',
        showConfirmButton: false,
        closeOnClickModal: true
      }).then(action => {
        this.debug && console.log(action, this.$refs.qrCode)
      })
      let url = record.ossFile.url
      // 处理本地文件链接
      if (!~record.ossFile.url.indexOf('http')) {
        url = this.downloadCompleteUrl + record.id
      }
      this.$nextTick(() => {
        const qrCodeDiv = document.getElementById('qrCode')
        qrCodeDiv.innerHTML = ''
        new QRCode(qrCodeDiv, {
          text: url,
          width: 100,
          height: 100,
          colorDark: '#333333', // 二维码颜色
          colorLight: '#ffffff', // 二维码背景色
          correctLevel: QRCode.CorrectLevel.L // 容错率，L/M/H
        })
      })
    },
    loadFileData(arg) {
      if (!this.url.list) {
        this.$message.error('请设置url.list属性!')
        return
      }
      if (!this.selectedIds || !this.selectedIds[0]) {
        return
      }
      // 加载数据 若传入参数1则加载第一页的内容
      if (arg === 1) {
        this.ipagination.current = 1
      }
      let params = this.getQueryParams() // 查询条件
      this.loading = true
      getAction(this.url.list + this.selectedIds[0], params).then(res => {
        if (res.success) {
          this.dataSource = res.result
          this.ipagination.total = res.result.total
        } else {
          this.$notification.error({
            message: '出错提示',
            description: res.message
          })
        }
        this.loading = false
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
      this.selectedIds = selectedKeys;
      this.selectedNode = e.selectedNodes && e.selectedNodes.length > 0 ? e.node.dataRef : {};
      this.debug && console.log(selectedKeys, e);
      this.debug && console.log(this.selectedNode);
      // this.debug && console.log('展开的id | 选中的id:', this.expandedKeys, this.selectedIds, this.$refs.tree);
      if (e.selected) {
        // e.node.dataRef &&
        // e.node.dataRef.childFolderSize &&
        // !(e.node.dataRef.children && e.node.dataRef.children.length) &&
        // this.onLoadChildrenData(e.node, false);
        // 设置叶子节点时才展示文件列表
        // e.node.dataRef && e.node.dataRef.isLeaf && this.loadFileData();
        // 都展示文件列表
        e.node.dataRef && this.loadFileData();
      }
      // 选中且未展开时设置自动展开
      e.selected && !e.node.expanded && e.node.dataRef && e.node.dataRef.childFolderSize && e.node.onExpand()
      // 取消选中且已展开时收起展开
      !e.selected && e.node.expanded && e.node.dataRef && e.node.dataRef.childFolderSize && e.node.onExpand()
      // 处理搜索时，高亮了多个搜索结果，点击其中一个结果然后加载列表
      if (e.selectedNodes && e.selectedNodes.length > 1) {
        console.log('加载选择的搜索项', selectedKeys, e);
        this.multiple = false;
        this.selectedIds = [e.node.dataRef.id];
        this.loadFileData();
      }
      console.log('选中节点', selectedKeys, this.$refs.tree, this.selectedNode, this.selectedIds, this.expandedKeys)
    },
    getTreeRootData() {
      return new Promise((resolve, reject) => {
        postAction(`/technical/folder/business/findRoot?businessId=${this.businessId}&businessName=${this.businessName}&type=DOCUMENT`, {
          subFolders: this.subFolders(),
          initialFolders: JSON.stringify(folderConfig)
        }).then(res => {
          if (res.success) {
            this.treeData = res.result.map(item => {
              item.scopedSlots = { title: 'nodeTitle', icon: 'customIcon' }
              // 判断节点是否包含子目录，不包含时不去请求
              item.isLeaf = item.childFolderSize === 0
              return item
            })
            // this.debug && console.log('重置tree前', this.treeData, res.result)
            // 重新重置根节点
            // const tree = this.$refs.tree // root在this.$refs.tree中找到
            const tree = this.treeData
            // this.debug && console.log(tree)
            // tree.updateTreeData(this.treeData)
            this.debug && console.log('重置tree后', this.treeData)
            if (!(this.selectedIds && this.selectedIds.length > 0)) {
              if (res.result.length > 0) {
                this.debug && console.log('展开的id | 选中的id:', this.expandedKeys, this.selectedIds);
                this.selectedIds = [res.result[0].id]
                this.selectedNode = res.result[0]
                // 加载关联文件
                this.loadFileData()
                // 目录
                this.onLoadChildrenData().then(res2 => {
                  // this.expandedKeys = [res.result[0].id];
                  resolve(tree)
                })
              }
            } else {
              resolve(tree);
            }
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
    onLoadChildrenData(treeNode, cacheFlag = true) {
      return new Promise((resolve, reject) => {
        // if (treeNode.dataRef.children) {
        //   resolve();
        //   return;
        // }
        // 默认初始第一个节点
        const { dataRef } = treeNode || { dataRef: this.treeData[0] };
        // 修复默认展开“房建二级”目录后，收起再展开会导致列表异常（dataRef指向相同，但是不知道为什么没有缓存结果，因此直接放行）
        if (cacheFlag && treeNode && dataRef.name === this.treeData[0].name) {
          resolve();
          return
        }
        getAction('/technical/folder/findChild?parentId=' + dataRef.id).then(res => {
          if (res.success) {
            this.debug && console.log('onLoadChildrenData', treeNode, dataRef, this.selectedIds);
            const result = res.result.map(item => {
              item.scopedSlots = { title: 'nodeTitle', icon: 'customIcon' }
              // 判断节点是否包含子目录，不包含时不去请求
              item.isLeaf = item.childFolderSize === 0
              return item
            });
            // this.debug && console.log('child load finished1', this.treeData)
            // this.treeData = [...this.treeData];
            // this.debug && console.log('child load finished2', this.treeData);
            // treeNode.dataRef.children = result;
            // this.$forceUpdate();
            this.$set(dataRef, 'children', result);
            resolve(result)
          } else {
            this.$notification.error({
              message: '出错提示',
              description: res.message
            })
            resolve([])
            // reject()
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
                const newTreeData = that.changeTreeData(that.treeData, deletedData, 3)
                that.treeData = (newTreeData || []).filter(e => e)
                that.selectedIds = []
                that.selectedNode = {}
                that.dataSource = []
                that.$forceUpdate()
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
      const treeData = this.treeData
      this.debug && console.log('返回Form的数据', args)
      this.debug && console.log('返回修改后---treeData', JSON.parse(JSON.stringify(treeData)))
      const data = args[0]
      const type = args[1] ? 1 : 2
      // 设置新节点是否为叶子节点
      data.isLeaf = !(args[0].hasChild)
      // 设置新节点的slot属性
      data.scopedSlots = { title: 'nodeTitle', icon: 'customIcon' }
      // 新增时展开父节点
      this.$set(this.selectedNode, 'expanded', true)
      if (data && data.parentId === '' && !treeData.filter(e => e.id === data.id)[0]) {
        treeData.push(data)
        this.treeData = [...treeData]
      } else {
        // 用户自己选择节点操作
        this.treeData = this.changeTreeData(treeData, data, type)
      }
      this.debug && console.log('返回修改后---treeData', JSON.parse(JSON.stringify(treeData)))
      this.$forceUpdate()
    },
    getChidlNode(arr, id) {
      let hasFound = false; // 表示是否有找到id值
      let result = null
      let fn = function (data) {
        if (Array.isArray(data) && !hasFound) {
          // 判断是否是数组并且没有的情况下，
          data.forEach(item => {
            if (item.id === id) {
              // 数据循环每个子项，并且判断子项下边是否有id值
              result = item // 返回的结果等于每一项
              hasFound = true // 并且找到id值
            } else if (item.children) {
              fn(item.children) // 递归调用下边的子项
            }
          })
        }
      }
      fn(arr) // 调用一下
      return result
    },
    // 遍历修改树节点
    changeTreeData(treeData = [], data, type, parent) {
      // type 1新增 2编辑 3删除
      if (!(treeData instanceof Array) || !treeData.length) {
        return
      }
      if (!data) {
        return
      }
      let flag = false // 是否找到当前data数据
      if (type == 2 && !flag) {
        for (let i = 0; i < treeData.length; i++) {
          if (data.id == treeData[i].id) {
            // data.isLeaf = !(data.hasChild)
            // data.children = treeData[i].children
            // treeData[i] = data
            Object.assign(treeData[i], data)
            this.selectedNode = treeData[i]
            flag = true
            // todo 修改排序后，拿到父节点重置孩子的排序
            // console.log('修改的节点', treeData[i], data)
            break
          } else {
            treeData[i].children =
              treeData[i].children && treeData[i].children.length
                ? this.changeTreeData(treeData[i].children, data, type, treeData[i])
                : undefined
          }
        }
      } else if (type === 1 && !flag) {
        for (let i = 0; i < treeData.length; i++) {
          if (data.parentId === treeData[i].id) {
            if (treeData[i].children) {
              treeData[i].children.push(data)
            } else {
              treeData[i].children = [data]
            }
            // 文件加统计+1
            treeData[i].isLeaf = false
            treeData[i].hasChild = '1'
            break
          } else {
            treeData[i].children =
              treeData[i].children && treeData[i].children.length
                ? this.changeTreeData(treeData[i].children, data, type, treeData[i])
                : undefined
          }
        }
      } else if (type === 3 && !flag) {
        for (let i = 0; i < treeData.length; i++) {
          if (!treeData[i]) {
            continue
          }
          if (data.parentId === '') {
            treeData = treeData.filter(e => e.id !== data.id)
          } else if (treeData[i].id === data.parentId) {
            treeData[i].children = treeData[i].children.filter(e => e.id !== data.id)
            treeData[i].isLeaf = treeData[i].children.length < 1
            treeData[i].hasChild = treeData[i].children.length > 0
            break
          } else {
            treeData[i].children =
              treeData[i].children && treeData[i].children.length
                ? this.changeTreeData(treeData[i].children, data, type, treeData[i])
                : undefined
          }
        }
      }
      return treeData
    },
    handleUp() {
      if (this.selectedIds && this.selectedIds.length > 0) {
        this.debug && console.log(this.selectedIds)
        const treeData = this.treeData
        this.changeSortTreeData(this.selectedNode, 1)
      } else {
        this.$message.warning('请选择您要操作的目录！')
      }
    },
    handleDown() {
      if (this.selectedIds && this.selectedIds.length > 0) {
        this.debug && console.log(this.selectedIds)
        const treeData = this.treeData
        this.changeSortTreeData(this.selectedNode, -1)
      } else {
        this.$message.warning('请选择您要操作的目录！')
      }
    },
    changeSortTreeData(data, type) {
      // 修改同层节点顺序 type 1上移 -1下移
      let that = this
      const treeData = that.treeData
      if (!(treeData instanceof Array) || !treeData.length) {
        return
      }
      const arr = that.findSameLevelNode(treeData, that.selectedNode)
      let idArr = arr.map(item => {
        return item.id
      })
      let index = idArr.indexOf(data.id)
      if (index >= 0) {
        if (index == 0 && type == 1) {
          that.$message.warning('不允许上移!')
          return
        } else if (index == idArr.length - 1 && type == -1) {
          that.$message.warning('不允许下移!')
          return
        }
        if (type == 1 || type == -1) {
          let sourceId = data.id
          let targetId = arr[index - type].id
          getAction('/technical/folder/reOrder?sourceId=' + sourceId + '&targetId=' + targetId).then(res => {
            if (res.success) {
              let obj = arr[index]

              arr[index] = arr[index - type]
              arr[index - type] = obj
              that.treeData = [...treeData]
              that.$message.success('操作成功！')
            } else {
              that.$notification.error({
                message: '出错提示',
                description: res.message
              })
            }
          })
        }
      }
    },
    findSameLevelNode(treeData = [], data) {
      if (!(treeData instanceof Array) || !treeData.length) {
        return
      }
      let arr = []
      if (data.parentId) {
        for (let i = 0; i < treeData.length; i++) {
          if (data.parentId === treeData[i].id) {
            arr = treeData[i].children
            break
          } else {
            this.findSameLevelNode(treeData[i].children, data)
          }
        }
      } else {
        arr = treeData
      }
      return arr
    },
    handleUploadFileChange(e) {
      this.debug && console.log(e)
      // 上传进度显示
      if (e.event) {
        let baifenbi = parseInt(e.event.loaded * 100 / e.event.total) + '%';
        this.$message.loading({
          content: '上传进度：' + baifenbi,
          key: 'uploadProcess',
          duration: 2
        });
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
      if (errorArr.length > 0 && responseArr.length > 0 && responseArr.length == fileList.length) {
        this.$notification.error({
          message: '出错提示',
          description: errorArr.join(' \n '),
          duration: null
        })
        // this.onUploadCallback();
        this.fileList = []
      } else if (errorArr.length <= 0 && responseArr.length > 0 && responseArr.length == fileList.length) {
        this.$message.success('文件上传成功')
        this.onUploadCallback(this.fileList.length);
        this.fileList = []
      }
    },
    beforeUploadFile(file, fileList) {
      this.debug && console.log(file, fileList)
      this.fileList = [...this.fileList, file]
      return new Promise((resolve, reject) => {
        if (this.fileList.length == fileList.length) {
          resolve()
        } else {
          reject()
        }
      })
    },
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
      if (errorArr.length > 0 && responseArr.length > 0 && responseArr.length == fileList.length) {
        this.$notification.error({
          message: '出错提示',
          description: errorArr.join(' \n')
        })
        this.loadFileData()
        this.updataThisNode()
      } else if (errorArr.length <= 0 && responseArr.length > 0 && responseArr.length == fileList.length) {
        this.$message.success('文件上传成功')
        this.loadFileData()
        this.updataThisNode()
      }
    },
    goToDetail(item) {
      if (item.bimfaceFile && item.bimfaceFile.fileId) {
        // this.$router.push({name:'construction-drawing-detail',query: {id:item.bimfaceFile.fileId}})
        /* let routeUrl = this.$router.resolve({
         name:'construction-drawing-detail',
         query: {id:item.bimfaceFile.fileId}
         });
         window.open(routeUrl.href, '_blank'); */
        // this.$refs.bimfaceDetail.show(item.bimfaceFile.fileId)
      } else {
        if (item.type === 'DOCUMENT' || item.type === 'PICTURE') {
          // item.ossFile.url && window.open(item.ossFile.url)
          window.open(this.downloadCompleteUrl + item.id)
          return
        }
        this.$notification.warning({
          message: '提示',
          description: '当前模型/图纸转化失败'
        })
      }
    },
    handleShowHistoryList(id) {
      this.$refs.historyList.show(id)
    },
    handleCloseVersionHistoryList() {
      this.loadFileData()
      this.updataThisNode()
    },
    updataThisNode() {
      let that = this
      const treeData = that.treeData
      if (!(treeData instanceof Array) || !treeData.length) {
        return
      }
      const arr = that.findSameLevelNode(treeData, that.selectedNode)
      let idArr = arr.map(item => {
        return item.id
      })
      let index = idArr.indexOf(that.selectedNode.id)
      if (index >= 0) {
        getAction('/technical/folder/findOne?folderId=' + that.selectedNode.id).then(res => {
          if (res.success) {
            arr[index].childFileSize = res.result.childFileSize
            arr[index].childFolderSize = res.result.childFolderSize
            // arr[index].scopedSlots = { title: 'nodeTitle' }
            that.treeData = [...treeData]
            console.log('树节点更新成功')
            // that.$message.success('树节点更新成功！')
          } else {
            that.$notification.error({
              message: '出错提示',
              description: res.message
            })
          }
        })
      }
    },
    handlePreview(record) {
      window.open(this.downloadCompleteUrl + record.id)
    },
    deleteFile(id) {
      // 第二种删除 url直接最后拼接/id
      if (!this.url.deleteFileUrl) {
        this.$message.error('请设置url.delete属性!')
        return
      }
      let that = this;
      deleteAction(that.url.deleteFileUrl + '/' + id).then((res) => {
        if (res.success) {
          that.$message.success(res.message);
          that.onUploadCallback();
          // that.loadFileData();
        } else {
          that.$message.warning(res.message);
        }
      });
    },
    getRootNode(node) {
      if (node.parentId === '0') {
        return node
      }
      node = this.getNode(node.parentId, this.treeData)
      return this.getRootNode(node)
    },
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
<style scoped>
.dis-boxflex {
  display: flex;
  align-items: center;
}

.space-around {
  justify-content: space-around;
}

.justify-end {
  justify-content: flex-end;
}

.box-flex {
  flex: 1;
}

.flex-2 {
  flex: 2;
}

.flex-3 {
  flex: 3;
}

.flex-unshrink {
  flex-grow: 0;
  flex-shrink: 0;
}

.align-start {
  align-items: flex-start;
}

.align-end {
  align-items: flex-end;
}

.align-stretch {
  align-items: stretch;
}

.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.line-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.line-3 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.split-text {
  display: inline-block;
  margin: 0 12px;
}

/*禁用效果样式调整*/
.ant-select-disabled,
.ant-input-number-disabled,
.ant-input-disabled {
  background: none !important;
  cursor: not-allowed;
  color: rgba(0, 0, 0, 0.65) !important;
}

.ant-btn-danger {
  background: #ff4d4f !important;
}
</style>
<style lang="less" scoped>
/deep/ .button-ellipsis {
  span {
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    text-align: left !important;
    width: 100% !important;
  }
}

.card-img {
  display: block;
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.card-info-div {
  margin-top: 15px;
}

.bg-gray {
  padding: 12px;
  background: #f2f2f2;
  margin-bottom: 16px;
}
</style>
<style lang="less" scoped>
.card-div {
  border-radius: 8px;

  /deep/ .ant-card-head {
    padding: 0 12px;
    min-height: unset;
    height: auto;
  }

  /deep/ .ant-card-head-title,
  /deep/ .ant-card-extra {
    padding: 8px 0;
  }

  /deep/ .ant-card-body {
    padding: 16px;
  }
}

.inline-flex {
  display: inline-flex;
  align-items: center;
}
</style>
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
  .ant-card-body {
    padding: 0vh !important;
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
