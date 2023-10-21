<template>
  <div v-show="true">
    <a-card :bordered="false">

      <!-- 查询区域 -->
      <div class="table-page-search-wrapper">
        <a-form layout="inline" @keyup.enter.native="searchQuery">
          <a-row :gutter="24">
            <a-col :xl="12" :lg="12" :md="12" :sm="24">
              <a-form-item label="选择项目">
                <j-search-select-tag
                  @change="handleChange"
                  v-model="$store.state.project.businessId"
                  placeholder="请输入项目名称（支持全表搜索）"
                  dict="deal_service_project,name,project_key"
                  :async="true"
                  :pageSize="100"
                />
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="6" :md="6" :sm="24">
              <a-form-item label="查找目录">
                <a-input-search allowClear placeholder="请输入目录名称" style="width: 300px" @search="onSearchFolder"/>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="6" :md="6" :sm="24">
              <a-form-item label="查找文件">
                <a-input-search allowClear placeholder="请输入文件名称" style="width: 300px" @search="onSearchFile"/>
              </a-form-item>
            </a-col>
            <!--<a-col :xl="6" :lg="7" :md="8" :sm="24">
            <span style="float: left; overflow: hidden" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
            </span>
            </a-col>-->
          </a-row>
        </a-form>
      </div>
      <!-- <a-tabs :default-active-key="1" style="margin-top: -20px;" >@change="handleTabsChange"
        <a-tab-pane :key="1" tab="施工图纸" force-render>
        </a-tab-pane>
      </a-tabs> -->
      <a-row :gutter="16">
        <a-col :md="8" :sm="24">
          <div class="dis-boxflex">
            <!-- <div class="box-flex">文档目录</div> -->
            <div class="flex-unshrink" v-if="show || isSearch">
              <a-button-group>
                <a-button type="primary" icon="plus" @click="handleAddFolder"></a-button>
                <a-button icon="edit" @click="handleEditFolder"></a-button>
                <!-- <a-popconfirm title="确定删除吗?" @confirm="() => handleDeleteFolder"> -->
                <a-button icon="delete" @click="handleDeleteFolder"></a-button>
                <!-- </a-popconfirm> -->
              </a-button-group>
              <a-button-group v-show="false" style="margin-left: 12px">
                <a-button icon="arrow-up" @click="handleUp"></a-button>
                <a-button icon="arrow-down" @click="handleDown"></a-button>
              </a-button-group>
            </div>
            <div v-else>
              请选择一个项目
            </div>
          </div>
          <a-spin
            :spinning="folderInitialLoading"
            :style="{marginTop: folderInitialLoading ? '100px' : '0'}"
            tip="目录初始化中...">
            <div class="spin-content"></div>
          </a-spin>
          <!--全部默认展示到额树-->
          <a-tree
            v-if="show"
            default-expand-all
            ref="tree"
            :blockNode="true"
            :selectedKeys="selectedIds"
            :load-data="onLoadChildrenData"
            :tree-data="treeData"
            :replaceFields="{ title: 'name', key: 'id' }"
            @select="onSelectThis"
          >
            <template v-slot:nodeTitle="props">
              <div class="dis-boxflex" :title="props.name">
                <div class="box-flex ellipsis" :style="{color: props.childFileSize > 0 ? '#01b683' : ''}">{{ props.name
                  }}
                </div>
                <div class="flex-unshrink">
                  {{ props.childFolderSize && props.childFolderSize > 0 ? '子目录 ' + props.childFolderSize : ''
                  }}{{ props.childFileSize && props.childFileSize > 0 ? '&nbsp;子文件 ' + props.childFileSize : '' }}
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
            :selectedKeys="selectedIds"
            :load-data="onLoadChildrenData"
            :tree-data="treeData"
            :replaceFields="{ title: 'name', key: 'id' }"
            @select="onSelectThis"
          >
            <template v-slot:nodeTitle="props">
              <div class="dis-boxflex" :title="props.name">
                <div class="box-flex ellipsis" :style="{color: props.childFileSize > 0 ? '#01b683' : ''}">{{ props.name
                  }}
                </div>
                <div class="flex-unshrink">
                  {{ props.childFolderSize && props.childFolderSize > 0 ? '子目录 ' + props.childFolderSize : ''
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
                  :disabled="!selectedIds || selectedIds.length <= 0"
                >上传文件
                </a-button
                >
              </a-upload>
            </div>
            <!-- <div style="display: inline-block;margin-left: 1vh;">
              <a-upload
                :disabled="!selectedIds || selectedIds.length <= 0"
                :showUploadList="false"
                @change="handleUploadFileDirectoryChange"
                :action="uploadCompleteUrl"
                :headers="headers"
                :data="{ folderId: selectedIds && selectedIds.length > 0 ? selectedIds[0] : '' }"
                :name="uploadConfig.name"
                :multiple="uploadConfig.multiple"
                directory
              >
                <a-button size="small" type="primary" :disabled="!selectedIds || selectedIds.length <= 0"
                  >上传文件夹</a-button
                >
              </a-upload>
            </div> -->
            <!-- <a-button-group> -->
            <!-- <a-button icon="export" :disabled="!(checkedList&&checkedList.length>0)">移动到</a-button> -->
            <!-- <a-button
                size="small"
                icon="delete"
                :disabled="!(selectedRowKeys && selectedRowKeys.length > 0)"
                @click="handleBatchDelete"
                >删除</a-button
              > -->
            <!-- <a-button icon="download" :disabled="!(checkedList&&checkedList.length>0)">下载</a-button> -->
            <!-- </a-button-group> -->
          </div>

          <div>
            <!-- <a-table
              ref="table"
              rowKey="id"
              :scroll="{ x: 1000 }"
              :columns="columns"
              :dataSource="dataSource"
              :pagination="false"
              :loading="loading"
              @change="handleTableChange"
              :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
            > -->
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
              <template slot="name" slot-scope="text, record">
                <a-button
                  type="link"
                  @click="handlePreview(record)"
                  :title="text"
                  class="button-ellipsis"
                  style="width: 100%; padding: 0;"
                >{{ text }}
                </a-button
                >
                <!-- <a-button
                  type="link"
                  @click="handlePreview(record)"
                  :title="wpsPreview ? '点击预览' : '点击下载'"
                  class="ellipsis"
                  style="width: 100%"
                >{{ text }}</a-button> -->
              </template>

              <template slot="action" slot-scope="text, record">
                <!-- <a :href="downloadCompleteUrl + record.id" target="_blank"><a-icon type="download"/></a> -->
                <!-- <a-divider type="vertical" /> -->

                <a :href="downloadCompleteUrl + record.id" target="_blank">下载</a>
                <a-divider type="vertical"/>
                <a href="javascript:;" @click="changeFileName(record)">重命名</a>
                <a-divider type="vertical"/>
                <a href="javascript:;" v-show="false" @click="e => showQrCode(record, e)">二维码</a>
                <a-divider v-show="false" type="vertical"/>
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDeleteUrlWithId(record.id)">
                  <a>删除</a>
                </a-popconfirm>
                <a-divider type="vertical"/>
                <a href="javascript:;" @click="handleShowHistoryList(record.id)">版本管理</a>

                <!--<a-dropdown :trigger="['click']">
                  <a class="ant-dropdown-link" icon="small-dash" @click="e => e.preventDefault()">
&lt;!&ndash;                    <a-icon type="small-dash" />&ndash;&gt;文件操作
                  </a>
                  <a-menu slot="overlay">
                    <a-menu-item>
                      &lt;!&ndash; <a :href="downloadCompleteUrl+record.id" target="_blank" ><a-icon type="download" /></a> &ndash;&gt;
                      <a :href="downloadCompleteUrl + record.id" target="_blank">下载</a>
                    </a-menu-item>
                    <a-menu-item>
                      &lt;!&ndash; <a href="javascript:;" @click="e => showQrCode(record, e)"><a-icon type="el-icon-full-screen" />二维码</a> &ndash;&gt;
                      &lt;!&ndash;二维码需要引入element=UI的alert组件，这里隐藏掉先&ndash;&gt;
                      <a href="javascript:;" v-show="false" @click="e => showQrCode(record, e)">二维码</a>
                    </a-menu-item>
                    &lt;!&ndash; <a-menu-item>
                      <a href="javascript:;" >重命名</a>
                    </a-menu-item>
                    <a-menu-item>
                      <a href="javascript:;" >更新文件</a>
                    </a-menu-item> &ndash;&gt;
                    <a-menu-item>
                      <a-popconfirm title="确定删除吗?" @confirm="() => handleDeleteUrlWithId(record.id)">
                        <a>删除</a>
                      </a-popconfirm>
                    </a-menu-item>
                    <a-menu-item @click="handleShowHistoryList(record.id)">
                      <a href="javascript:;">版本管理</a>
                    </a-menu-item>
                  </a-menu>
                </a-dropdown>-->
              </template>
            </a-table>
          </div>
        </a-col>
      </a-row>
    </a-card>
    <folder-modal ref="folderModal" @ok="folderModalFormOk(arguments)"></folder-modal>
    <!-- 历史版本 -->
    <history-list ref="historyList" @ok="handleCloseVersionHistoryList"></history-list>
    <!-- <bimface-detail ref="bimfaceDetail" ></bimface-detail> -->
    <a-modal
      v-model="renameVisible"
      title="请输入新文件名称"
      ok-text="确认"
      cancel-text="取消"
      @ok="doRenameFile(true)"
      @cancel="doRenameFile(false)">
      <a-input v-model="rename" placeholder="请输入新文件名称"></a-input>
    </a-modal>
  </div>
</template>

<script>
  /* eslint-disable */
  import Vue from 'vue'
  import { ACCESS_TOKEN, PROJECT_ID, BUSINESS_ID, BUSINESS_NAME } from '@/store/mutation-types'
  import { mapGetters, mapActions } from 'vuex'
  import { putAction, postAction, getAction, deleteAction } from '@/api/manage'
  import FolderModal from './modules/FolderModal'
  import HistoryList from './modules/HistoryList'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import QRCode from 'qrcodejs2'
  import folderConfig from './modules/folderConfig'
  import folderConfigTwo from './modules/folderConfigTwo'
  import { union } from 'lodash'
  import { debounce } from 'lodash'
  // import BimfaceDetail from './BimfaceDetail.vue'
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
      scopedSlots: { customRender: 'name' },
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
    // {
    //   title: '上传时间',
    //   align: 'center',
    //   width: 120,
    //   dataIndex: 'createTime'
    // },
    {
      title: '操作',
      dataIndex: 'action',
      // fixed: 'right',
      scopedSlots: { customRender: 'action' },
      align: 'center',
      width: 260,
      fixed: 'right'
    }
  ]
  export default {
    name: 'DocumentList',
    components: {
      FolderModal,
      HistoryList
      // BimfaceDetail
    },
    mixins: [JeecgListMixin],
    data() {
      return {
        cardList: [],
        cardListLoading: true, //加载中
        // 分页
        total: 0,
        page_sizeOptions: ['20', '30', '40', '50'], //每页条数选项
        page: 1, //当前页数
        page_size: 20, //默认每页条数.

        checkedList: [], // 已选列表
        indeterminate: false, // 是否半选
        checkAll: false, // 是否全选

        treeData: [], //左侧树数据
        selectedIds: [],
        edit_data: {},
        downLoadUrl: '/technical/file/download/',
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
          previewUrl: '/technical/file/getWpsOnlineUrl',
          // list: "/project/getAllList",
          list: '/technical/file/files?folderId=',
          delete: '/technical/file',
          rename: '/technical/file/rename',
          searchFolder: '/technical/folder/business/search/folder',
          searchFile: '/technical/folder/business/search/file'
        },
        wpsPreview: false,
        show: false,
        expandedKeys: [],
        debug: process.env.NODE_ENV === 'development',
        rename: '',
        renameFile: null,
        renameVisible: false,
        folderInitialLoading: false,
        isSearch: false,
        multiple: false
      }
    },
    computed: {
      ...mapGetters([PROJECT_ID, BUSINESS_ID, BUSINESS_NAME]),
      // projectId: function() {
      //   return Vue.ls.get(PROJECT_ID)
      // },
      downloadCompleteUrl: function () {
        return window._CONFIG['domianURL'] + this.downLoadUrl
      },
      uploadCompleteUrl: function () {
        return window._CONFIG['domianURL'] + this.uploadConfig.action
      }
    },
    watch: {
      [BUSINESS_ID]: {
        immediate: true,
        deep: false,
        handler(val) {
          this.debug && console.log(PROJECT_ID + '改变了::', val)
          this.loadAllTree(val);
        }
      }
    },
    created() {
      // Vue.ls.set(PROJECT_ID, '1462044393897922562')
      // this.onLoadChildrenData = debounce(this.onLoadChildrenData, 100)
    },
    mounted() {
      // this.getTreeRootData()
    },
    methods: {
      /**
       * 文件上传后的回调
       * @version 2
       * 1.通过修改接口（传入目录id，查询到顺序的父子目录id列表）
       * 2.实现方法loadSearchFolderTree，手动强制加载这条树上的节点数据
       * 3.通过配合 expanded-all 自动展开全部节点参数，和上面已加载的数据，会自动去展开所有
       * 4.回选到原先的节点
       * @version 1
       * 1.手动更新子文件数（不走后端重新请求接口了）
       * 2.刷新文件列表
       */
      async onUploadCallback(fileLength) {
        /**
         * @deprecated
         */
        // this.show = false;
        // this.show = true;
        // this.isSearch = false;
        // this.getTreeRootData().then((treeNode) => this.show = true)
        /**
         * @version 1
         */
        // this.$set(this.edit_data, 'childFileSize', this.edit_data.childFileSize + fileLength);
        // this.loadData();
        /**
         * @version 2
         */
        const that = this;
        const { id: folderId } = this.edit_data;
        if (!folderId) {
          return;
        }
        const res = await getAction(`${this.url.searchFolder}?businessId=${this[BUSINESS_ID]}&folderId=${folderId}`);
        if (res.success) {
          this.selectedIds = [];
          this.expandedKeys = res.result.reduce((pre, cur) => {
            this.selectedIds.push(cur.folder.id);
            return union(pre, cur.folderTreeId)
          }, []);
          // 刷新树
          await this.getTreeRootData();
          await this.loadSearchFolderTree(this.expandedKeys);
          that.isSearch = false;
          that.show = false;
          console.log('onSearchFolder', folderId, res, this.selectedIds, this.expandedKeys, this.treeData);
          setTimeout(() => {
            // that.isSearch = true;
            // that.show = !that.isSearch;
            // that.multiple = that.isSearch;
            that.show = true;
            that.loadData();
          }, 100);
        } else {
          this.$notification.error({
            message: '出错提示',
            description: res.message
          });
        }
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
          this.getTreeRootData().then((treeNode) => {
            console.log('treeNode', treeNode);
            /**
             * 节点异步数据加载和自动全部展开控制分析@2022.04.24
             * 通过使用v-if来控制组件创建、销毁
             * 1.优先请求到需要展开的节点数据级别（这里优先请求了“房建”目录，以及其子目录）
             * 2.数组件创建时，基于配置：default-expand-all、:load-data="onLoadChildrenData"
             * 3.上面的配置，会自动异步请求当前树中含有节点的子节点
             * 4.最终展示效果就是：展开了1级所有目录、房建的2级所有目录
             * PS：换成这种形式加载树列表后，切换项目后的节点点不开的问题也消失了
             */
            this.show = true;
            /**
             * onLoadChildrenData和a-tree的属性:load-data="onLoadChildrenData"做绑定了
             * 在选中节点后，会自动触发这个方法去异步加载数据
             **/
            // if (treeNode) {
            //   const {$children: [{$children: [node]}]} = treeNode
            //   this.onLoadChildrenData(node)
            // }
          })
        }
      },
      onSearchFolder(e) {
        if (!this[BUSINESS_ID]) {
          this.$message.info('请选择项目！');
          return;
        }
        if (!e) {
          console.log('onSearchFolder clear', e);
          this.loadAllTree(true);
          return;
        }
        getAction(`${this.url.searchFolder}?businessId=${this[BUSINESS_ID]}&folderName=${e}`).then(res => {
          if (res.success) {
            this.selectedIds = [];
            this.expandedKeys = res.result.reduce((pre, cur) => {
              this.selectedIds.push(cur.folder.id);
              return union(pre, cur.folderTreeId)
            }, []);
            console.log('onSearchFolder', e, res, this.selectedIds, this.expandedKeys);
            this.isSearch = false;
            this.isSearch = !!(e && e.trim());
            this.show = !this.isSearch;
            this.multiple = this.isSearch;
            this.loadData();
          } else {
            this.$notification.error({
              message: '出错提示',
              description: res.message
            });
          }
        });
      },
      onSearchFile(e) {
        if (!this[BUSINESS_ID]) {
          this.$message.info('请选择项目！');
          return;
        }
        if (!e) {
          console.log('onSearchFile clear', e);
          this.loadAllTree(true);
          return;
        }
        getAction(`${this.url.searchFile}?businessId=${this[BUSINESS_ID]}&fileName=${e}`).then(res => {
          if (res.success) {
            this.selectedIds = [];
            this.expandedKeys = res.result.reduce((pre, cur) => {
              this.selectedIds.push(cur.file.folderId);
              return union(pre, cur.folderTreeId)
            }, []);
            console.log('onSearchFile', e, res, this.selectedIds, this.expandedKeys);
            this.isSearch = false;
            this.isSearch = !!(e && e.trim());
            this.show = !this.isSearch;
            this.multiple = this.isSearch;
            this.loadData();
          } else {
            this.$notification.error({
              message: '出错提示',
              description: res.message
            });
          }
        });
      },
      doRenameFile(flag) {
        if (flag) {
          console.log('新文件名', this.renameFile, this.rename)
          putAction(`${this.url.rename}?fileId=${this.renameFile.id}&name=${this.rename}`)
            .then(res => {
              if (res.success) {
                this.$message.success('操作成功');
                this.loadData()
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
        console.log('changeFileName', record)
        this.rename = record.name
        this.renameFile = record
        this.renameVisible = true
        // const that = this
        // this.$confirm({
        //   title: '请输入新文件名',
        //   content: h => {
        //     console.log('h', h)
        //     return <a-input placeholder="请输入新文件名" ></a-input>
        //   },
        //   onOk() {
        //     console.log('新文件名', that.rename)
        //   },
        //   onCancel() {
        //     this.rename = ''
        //     console.log('新文件名', that.rename)
        //   }
        // })
      },
      handleChange(value) {
        console.log('选择项目变化', value)
      },
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
            colorDark: '#333333', //二维码颜色
            colorLight: '#ffffff', //二维码背景色
            correctLevel: QRCode.CorrectLevel.L //容错率，L/M/H
          })
        })
      },
      getCardList(isRefresh) {
        this.cardListLoading = true
        if (this.selectedIds && this.selectedIds.length > 0) {
          getAction('/technical/file/files?folderId=' + this.selectedIds[0]).then(res => {
            if (res.success) {
              this.cardListLoading = false
              this.cardList = res.result
              this.total = res.result.length
            } else {
              this.cardListLoading = false
              this.$notification.error({
                message: '出错提醒',
                description: res.message
              })
            }
          })
        } else {
          this.cardListLoading = false
        }
      },
      loadData(arg) {
        if (!this.url.list) {
          this.$message.error('请设置url.list属性!')
          return
        }
        if (!this.selectedIds || !this.selectedIds[0]) {
          return
        }
        //加载数据 若传入参数1则加载第一页的内容
        if (arg === 1) {
          this.ipagination.current = 1
        }
        var params = this.getQueryParams() //查询条件
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

      onCheckAllChange(e) {
        this.debug && console.log(e.target.checked)
        this.checkAll = e.target.checked
        this.indeterminate = false
        this.checkedList = e.target.checked
          ? this.cardList.map(item => {
            return item.id
          })
          : []
      },
      onCheckboxChange(checkedList) {
        this.debug && console.log(checkedList)
        this.indeterminate = !!checkedList.length && checkedList.length < this.cardList.length
        this.checkAll = checkedList.length === this.cardList.length
      },
      /**
       * 选中节点的操作
       * 1.保存选中的data -> this.edit_data
       * 2.保存当前选中的id
       * 3.当状态为选中时，判断目录是否有子目录和子目录数据，去加载数据
       * 4.当状态为选中时，加载文件列表
       * 5.搜索结果高亮了多个选中项时，加载指定选中项的数据
       */
      onSelectThis(selectedKeys, e) {
        this.selectedIds = selectedKeys;
        this.edit_data = e.selectedNodes && e.selectedNodes.length > 0 ? e.node.dataRef : {};
        // this.debug && console.log(selectedKeys, e);
        // this.debug && console.log(this.edit_data);
        // this.debug && console.log('展开的id | 选中的id:', this.expandedKeys, this.selectedIds, this.$refs.tree);
        if (e.selected) {
          e.node.dataRef &&
          e.node.dataRef.childFolderSize &&
          !(e.node.dataRef.children && e.node.dataRef.children.length) &&
          this.onLoadChildrenData(e.node, false);
          this.loadData();
        }
        // 处理搜索时，高亮了多个搜索结果，点击其中一个结果然后加载列表
        if (e.selectedNodes && e.selectedNodes.length > 1) {
          console.log('加载选择的搜索项', selectedKeys, e);
          this.multiple = false;
          this.selectedIds = [e.node.dataRef.id];
          this.loadData();
        }
      },
      getTreeRootData() {
        this.debug && console.log('getTreeRootData', this.treeData, this.selectedIds);
        return new Promise((resolve, reject) => {
          this.folderInitialLoading = true;
          this.treeData = [];
          postAction(`/technical/folder/business/findRoot?projectId=${this[PROJECT_ID]}&businessId=${this[BUSINESS_ID]}&businessName=${this[BUSINESS_NAME]}&type=DOCUMENT`, {
            subFolders: this.subFolders(),
            initialFolders: JSON.stringify(folderConfig)
          }).then(res => {
            if (res.success) {
              this.treeData = res.result.map(item => {
                item.scopedSlots = { title: 'nodeTitle' }
                return item
              });
              this.debug && console.log('重置tree前', this.treeData, res.result)
              // 重新重置根节点
              // const tree = this.$refs.tree // root在this.$refs.tree中找到
              const tree = this.treeData
              // this.debug && console.log(tree)
              // tree.updateTreeData(this.treeData)
              this.debug && console.log('重置tree后', this.treeData);
              if (!(this.selectedIds && this.selectedIds.length > 0)) {
                if (res.result.length > 0) {
                  this.debug && console.log('展开的id | 选中的id:', this.expandedKeys, this.selectedIds);
                  this.selectedIds = [res.result[0].id]
                  this.edit_data = res.result[0]
                  // 加载关联文件
                  this.loadData()
                  // 目录
                  this.onLoadChildrenData().then(res2 => {
                    // this.expandedKeys = [res.result[0].id];
                    resolve(tree)
                  })
                }
              } else {
                resolve(tree)
              }
            } else {
              this.$notification.error({
                message: '出错提示',
                description: res.message
              })
              reject()
            }
            this.folderInitialLoading = false;
          })
        })
      },
      onLoadChildrenData(treeNode, cacheFlag = true) {
        this.debug && console.log('onLoadChildrenData', treeNode, this.selectedIds);
        return new Promise((resolve, reject) => {
          // if (treeNode.dataRef.children) {
          //   resolve();
          //   return;
          // }
          // 默认初始第一个节点“房建”
          const { dataRef } = treeNode || { dataRef: this.treeData[0] };
          // 修复默认展开“房建二级”目录后，收起再展开会导致列表异常（dataRef指向相同，但是不知道为什么没有缓存结果，因此直接放行）
          if (cacheFlag && treeNode && dataRef.name === this.treeData[0].name) {
            // treeNode.dataRef = this.treeData[0];
            // console.log('bug位置', treeNode, dataRef, this.treeData[0]);
            resolve();
            return
          }
          getAction('/technical/folder/findChild?parentId=' + dataRef.id).then(res => {
            if (res.success) {
              const result = res.result.map(item => {
                item.scopedSlots = { title: 'nodeTitle' };
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
              });
              resolve([])
              // reject()
            }
          });
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
        this.debug && console.log('即将编辑的数据', this.edit_data)
        if (this.selectedIds && this.selectedIds.length > 0) {
          params = this.edit_data
          this.$refs.folderModal.edit(params)
          this.$refs.folderModal.title = '编辑'
          this.$refs.folderModal.disableSubmit = false
        } else {
          this.$message.warning('请选择您要操作的目录！')
        }
      },
      handleDeleteFolder() {
        let that = this
        this.debug && console.log('删除前', that.treeData)
        if (that.selectedIds && that.selectedIds.length > 0) {
          that.$confirm({
            title: '确定删除?',
            content: '删除后无法恢复，请谨慎操作！',
            onOk() {
              deleteAction('/technical/folder/business/' + that.selectedIds[0]).then(res => {
                if (res.success) {
                  that.treeData = that.changeTreeData(that.treeData, { id: that.selectedIds[0] }, 3)
                  this.debug && console.log('删除后', that.treeData)
                  that.selectedIds = []
                  that.edit_data = {}
                  that.$forceUpdate()
                  // that.getTreeRootData()
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
        this.debug && console.log('返回的数据', args)
        this.debug && console.log('返回修改前treeData', treeData)
        const data = args[0]
        const type = args[1] ? 1 : 2
        if (data && data.level === 'ROOT' && !treeData.filter(e => e.id === data.id)[0]) {
          treeData.push(data)
          this.treeData = [...treeData]
        } else {
          //用户自己选择节点操作
          this.treeData = this.changeTreeData(treeData, data, type)
        }
        // if (data && treeData) {
        //   //用户自己选择节点操作
        //   this.treeData = this.changeTreeData(treeData, data, type)
        // } else {
        //   treeData.push(data)
        //   this.treeData = [...treeData]
        // }
        this.debug && console.log('返回修改后---treeData', treeData)
        this.$forceUpdate()
        // this.getTreeRootData()
      },
      getChidlNode(arr, id) {
        var hasFound = false, // 表示是否有找到id值
          result = null
        var fn = function (data) {
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
              treeData[i] = data
              this.edit_data = data
              flag = true
              break
            } else {
              treeData[i].children =
                treeData[i].children && treeData[i].children.length > 0
                  ? this.changeTreeData(treeData[i].children, data, type, treeData[i])
                  : undefined
            }
          }
        } else if (type == 1 && !flag) {
          for (let i = 0; i < treeData.length; i++) {
            if (data.parentId == treeData[i].id) {
              if (treeData[i].children) {
                treeData[i].children.push(data)
              } else {
                treeData[i].children = [data]
              }
              // 文件加统计+1
              treeData[i].childFolderSize += 1
              break
            } else {
              treeData[i].children =
                treeData[i].children && treeData[i].children.length > 0
                  ? this.changeTreeData(treeData[i].children, data, type, treeData[i])
                  : undefined
            }
          }
        } else if (type == 3 && !flag) {
          for (let i = 0; i < treeData.length; i++) {
            if (data.id == treeData[i].id) {
              delete treeData[i]
              // 文件加统计-1
              parent.childFolderSize -= 1
              break
            } else {
              treeData[i].children =
                treeData[i].children && treeData[i].children.length > 0
                  ? this.changeTreeData(treeData[i].children, data, type, treeData[i])
                  : undefined
            }
          }
        }
        return treeData
      },
      handleBatchDelete() {
        let that = this
        let fileIds = this.selectedRowKeys ? this.selectedRowKeys.join(',') : ''
        if (that.selectedRowKeys && that.selectedRowKeys.length > 0) {
          that.$confirm({
            title: '确定删除?',
            content: '删除后无法恢复，请谨慎操作！',
            onOk() {
              deleteAction('/technical/file/deleteAll?fileIds=' + fileIds)
                .then(res => {
                  if (res.success) {
                    that.$message.success(res.message)
                    that.loadData()
                    that.updataThisNode()
                    that.onClearSelected()
                  } else {
                    that.$message.warning(res.message)
                  }
                })
                .finally(() => {
                  that.loading = false
                })
            },
            onCancel() {
            }
          })
        } else {
          this.$message.warning('请选择您要删除的文件！')
        }
      },
      handleUp() {
        if (this.selectedIds && this.selectedIds.length > 0) {
          this.debug && console.log(this.selectedIds)
          const treeData = this.treeData
          this.changeSortTreeData(this.edit_data, 1)
        } else {
          this.$message.warning('请选择您要操作的目录！')
        }
      },
      handleDown() {
        if (this.selectedIds && this.selectedIds.length > 0) {
          this.debug && console.log(this.selectedIds)
          const treeData = this.treeData
          this.changeSortTreeData(this.edit_data, -1)
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
        const arr = that.findSameLevelNode(treeData, that.edit_data)
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
            if (data.parentId == treeData[i].id) {
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
        //上传进度显示
        if (e.event) {
          let baifenbi = parseInt(e.event.loaded * 100 / e.event.total) + '%'
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
          this.onUploadCallback();
          this.fileList = []
          // this.loadData()
        } else if (errorArr.length <= 0 && responseArr.length > 0 && responseArr.length == fileList.length) {
          this.$message.success('文件上传成功')
          this.onUploadCallback(this.fileList.length);
          this.fileList = []
          // this.loadData()
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
          this.loadData()
          this.updataThisNode()
        } else if (errorArr.length <= 0 && responseArr.length > 0 && responseArr.length == fileList.length) {
          this.$message.success('文件上传成功')
          this.loadData()
          this.updataThisNode()
        }
      },
      goToDetail(item) {
        if (item.bimfaceFile && item.bimfaceFile.fileId) {
          // this.$router.push({name:'construction-drawing-detail',query: {id:item.bimfaceFile.fileId}})
          /*let routeUrl = this.$router.resolve({
            name:'construction-drawing-detail',
            query: {id:item.bimfaceFile.fileId}
          });
          window.open(routeUrl.href, '_blank');*/
          // this.$refs.bimfaceDetail.show(item.bimfaceFile.fileId)
        } else {
          if (item.type === 'DOCUMENT' || item.type === 'PICTURE') {
            item.ossFile.url && window.open(item.ossFile.url)
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
        this.loadData()
        this.updataThisNode()
      },
      updataThisNode() {
        let that = this
        const treeData = that.treeData
        if (!(treeData instanceof Array) || !treeData.length) {
          return
        }
        const arr = that.findSameLevelNode(treeData, that.edit_data)
        let idArr = arr.map(item => {
          return item.id
        })
        let index = idArr.indexOf(that.edit_data.id)
        if (index >= 0) {
          getAction('/technical/folder/findOne?folderId=' + that.edit_data.id).then(res => {
            if (res.success) {
              arr[index].childFileSize = res.result.childFileSize
              arr[index].childFolderSize = res.result.childFolderSize
              // arr[index].scopedSlots = { title: 'nodeTitle' }
              that.treeData = [...treeData]
              that.$message.success('树节点更新成功！')
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
        if (!this.wpsPreview) {
          window.open(this.downloadCompleteUrl + record.id)
          return
        }
        // 下面是在线预览功能，这里没去对接，因此不走此逻辑，全部直接下载
        if (record.suffix && record.suffix.toLowerCase() == 'pdf') {
          window.open(this.downloadCompleteUrl + record.id)
        } else {
          getAction('/technical/file/getALiOSSOnlineUrl?fileId=' + record.id).then(res => {
            if (res.success) {
              if (res.result && res.result.wpsUrl) {
                window.open(res.result.wpsUrl)
              } else {
                this.$notification.error({
                  message: '出错提示',
                  description: '获取文件预览链接失败'
                })
              }
            } else {
              this.$notification.error({
                message: '出错提示',
                description: res.message
              })
            }
          })
        }
      },
      handleDeleteUrlWithId: function (id) {
        // 第二种删除 url直接最后拼接/id
        if (!this.url.delete) {
          this.$message.error('请设置url.delete属性!')
          return
        }
        var that = this;
        deleteAction(that.url.delete + '/' + id).then((res) => {
          if (res.success) {
            that.$message.success(res.message);
            that.onUploadCallback();
            // that.loadData();
          } else {
            that.$message.warning(res.message);
          }
        });
      },
    }
  }
</script>
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
<style>
  .qr-code-messagebox {
    width: 154px;
  }
</style>
