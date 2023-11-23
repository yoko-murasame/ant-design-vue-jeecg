<template>
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
        <!--<a-button-->
        <!--  type="link"-->
        <!--  @click="handlePreview(record)"-->
        <!--  :title="text"-->
        <!--  class="button-ellipsis"-->
        <!--  style="width: 100%; padding: 0;"-->
        <!--&gt;{{ text }}-->
        <!--</a-button>-->
        <div @click="handlePreview(record)" :title="text" class="button-ellipsis file-name">
          {{ text }}
        </div>
      </template>

      <template v-slot:tagsSlot="tags, row">
        <template v-if="tags">
          <div class="file-tags">
            <a-tag
              v-for="(tag, idx) in tags.split(',')"
              :title="tag"
              :key="tag + idx"
              style="margin-right: .2vh !important;"
              :color="getTagColor(tag)">{{ tag }}
            </a-tag>
          </div>
        </template>
        <span v-else>暂无标签</span>
      </template>

      <template slot="action" slot-scope="text, record">
        <!--仅当系统已配置此按钮权限时，才生效-->
        <a
          :disabled="KNOWLEDGE_FILE_DOWNLOAD_BUTTON_FLAG && isDisabledAuth(KNOWLEDGE_FILE_DOWNLOAD_BUTTON)"
          href="javascript:;"
          @click="handleDownload(record)">下载</a>
        <a-divider type="vertical" />
        <a
          :disabled="KNOWLEDGE_FILE_TAG_BUTTON_FLAG && isDisabledAuth(KNOWLEDGE_FILE_TAG_BUTTON)"
          href="javascript:;"
          @click="changeTags(record)">打标签</a>
        <a-divider type="vertical" />
        <a
          :disabled="KNOWLEDGE_FILE_RENAME_BUTTON_FLAG && isDisabledAuth(KNOWLEDGE_FILE_RENAME_BUTTON)"
          href="javascript:;"
          @click="changeFileName(record)">重命名</a>
        <a-divider type="vertical" />
        <a-divider v-show="false" type="vertical" />
        <a href="javascript:;" v-show="false" @click="e => showQrCode(record, e)">二维码</a>
        <a-dropdown>
          <a class="ant-dropdown-link">更多
            <a-icon type="down" />
          </a>
          <a-menu slot="overlay">
            <a-menu-item
              :disabled="KNOWLEDGE_FILE_VERSION_BUTTON_FLAG && isDisabledAuth(KNOWLEDGE_FILE_VERSION_BUTTON)">
              <a
                :disabled="KNOWLEDGE_FILE_VERSION_BUTTON_FLAG && isDisabledAuth(KNOWLEDGE_FILE_VERSION_BUTTON)"
                href="javascript:;"
                @click="$refs.historyList.show(record.id)">版本管理</a>
            </a-menu-item>
            <a-menu-item
              :disabled="KNOWLEDGE_FILE_DELETE_BUTTON_FLAG && isDisabledAuth(KNOWLEDGE_FILE_DELETE_BUTTON)">
              <a-popconfirm
                :disabled="KNOWLEDGE_FILE_DELETE_BUTTON_FLAG && isDisabledAuth(KNOWLEDGE_FILE_DELETE_BUTTON)"
                title="确定删除吗?"
                @confirm="() => deleteFile(record.id)">
                <a :disabled="KNOWLEDGE_FILE_DELETE_BUTTON_FLAG && isDisabledAuth(KNOWLEDGE_FILE_DELETE_BUTTON)">删除</a>
              </a-popconfirm>
            </a-menu-item>
          </a-menu>
        </a-dropdown>
      </template>
    </a-table>

    <!-- 历史版本 -->
    <history-list ref="historyList" @ok="onHistoryOk"></history-list>
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
    <!--视频预览-->
    <a-modal
      :maskClosable="false"
      v-model="videoVisible"
      title="视频预览"
      ok-text=""
      cancel-text="关闭"
      width="80vh"
      @ok="videoUrl = null"
      @cancel="videoUrl = null">
      <template slot="footer">
        <cancel-button :disableSubmit="true" key="back" @click="videoUrl = null;videoVisible=false;" />
      </template>
      <vue-aliplayer-v2
        v-if="videoUrl"
        :source="videoUrl"
        :options="{ autoplay: true, height: '50vh' }" />
    </a-modal>
    <!--PDF预览-->
    <a-modal
      :maskClosable="false"
      v-model="pdfVisible"
      title="PDF预览"
      ok-text=""
      cancel-text="关闭"
      width="60vw">
      <template slot="footer">
        <cancel-button :disableSubmit="true" key="back" @click="onPdfClose" />
      </template>
      <!--<pdf v-if='pdfUrl' :src="pdfUrl"></pdf>-->
      <pdf
        v-for="i in pdfPages"
        :key="i"
        :src="pdfSrc"
        :page="i"
        style="display: inline-block; width: 100%"
      ></pdf>
    </a-modal>
  </div>
</template>
<script>
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import HistoryList from './HistoryList.vue'
import QRCode from 'qrcodejs2'
import { deleteAction, postAction, putAction } from '@api/manage'
import { generateSorterOptions } from '@comp/yoko/utils/AntdTableUtils'
import { isImage, isVideo } from '@comp/yoko/utils/FileUtil'
import pdf from '@teckel/vue-pdf'
import { mapState } from 'vuex'
import { DisabledAuthFilterMixin } from '@/mixins/DisabledAuthFilterMixin'

export default {
  name: 'FileList',
  components: { HistoryList, pdf },
  mixins: [JeecgListMixin, DisabledAuthFilterMixin],
  props: {
    selectedIds: {
      type: Array,
      default: () => []
    },
    searchParams: {
      type: Object,
      default: () => ({})
    }
  },
  watch: {
    searchParams: {
      handler: function(val) {
        // Object.assign(this.queryParam, val)
        // 必须重置值才会触发监听
        this.queryParam = { ...val }
      },
      immediate: true,
      deep: true
    },
    selectedIds: {
      handler: function(val) {
        val && val.length && this.loadFileData()
      },
      immediate: true,
      deep: true
    }
  },
  computed: {
    ...mapState({
      KNOWLEDGE_FILE_DOWNLOAD_BUTTON: state => state.permission.KNOWLEDGE_FILE_DOWNLOAD_BUTTON,
      KNOWLEDGE_FILE_DOWNLOAD_BUTTON_FLAG: state => state.permission.KNOWLEDGE_FILE_DOWNLOAD_BUTTON_FLAG,
      KNOWLEDGE_FILE_TAG_BUTTON: state => state.permission.KNOWLEDGE_FILE_TAG_BUTTON,
      KNOWLEDGE_FILE_TAG_BUTTON_FLAG: state => state.permission.KNOWLEDGE_FILE_TAG_BUTTON_FLAG,
      KNOWLEDGE_FILE_RENAME_BUTTON: state => state.permission.KNOWLEDGE_FILE_RENAME_BUTTON,
      KNOWLEDGE_FILE_RENAME_BUTTON_FLAG: state => state.permission.KNOWLEDGE_FILE_RENAME_BUTTON_FLAG,
      KNOWLEDGE_FILE_VERSION_BUTTON: state => state.permission.KNOWLEDGE_FILE_VERSION_BUTTON,
      KNOWLEDGE_FILE_VERSION_BUTTON_FLAG: state => state.permission.KNOWLEDGE_FILE_VERSION_BUTTON_FLAG,
      KNOWLEDGE_FILE_DELETE_BUTTON: state => state.permission.KNOWLEDGE_FILE_DELETE_BUTTON,
      KNOWLEDGE_FILE_DELETE_BUTTON_FLAG: state => state.permission.KNOWLEDGE_FILE_DELETE_BUTTON_FLAG
    }),
    downloadCompleteUrl: function() {
      return window._CONFIG['domianURL'] + this.url.downLoadUrl
    }
  },
  data() {
    return {
      disableMixinCreated: true,
      // 分页
      total: 0,
      page_sizeOptions: ['20', '30', '40', '50'], // 每页条数选项
      page: 1, // 当前页数
      page_size: 20, // 默认每页条数.
      columns: [
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
          scopedSlots: { customRender: 'nameSlot' },
          ...generateSorterOptions('name', 'descend', true)
          // sorter: (a, b) => {
          //   const va = a.name
          //   const vb = b.name
          //   if (!va || !vb) {
          //     return -1
          //   }
          //   try { return va.localeCompare(vb)} catch (e) {
          //     return -1
          //   }
          // },
          // sortDirections: ['descend', 'ascend'],
          // defaultSortOrder:'descend'
          // width: 380
          // width: 280,
        },
        {
          title: '版本',
          align: 'center',
          width: 100,
          dataIndex: 'version',
          customRender: function(t, r, index) {
            return 'V' + (r.version + 1)
          }
        },
        {
          title: '文件大小',
          align: 'center',
          width: 100,
          dataIndex: 'size'
        },
        {
          title: '上传人',
          align: 'center',
          width: 100,
          dataIndex: 'uploadBy'
        },
        // {
        //   title: '类型',
        //   align: 'center',
        //   dataIndex: 'suffix',
        //   width: 100
        // },

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
          title: '操作',
          dataIndex: 'action',
          // fixed: 'right',
          scopedSlots: { customRender: 'action' },
          align: 'center',
          width: '22vh'
          // fixed: 'right'
        }
      ],
      url: {
        list: '/technical/file/files',
        deleteFileUrl: '/technical/file/',
        downLoadUrl: '/technical/file/download/',
        rename: '/technical/file/rename',
        reTags: '/technical/file/reTags'
      },
      // 重命名功能
      rename: '',
      renameFile: null,
      renameVisible: false,
      // 打标签功能
      tags: '',
      tagsFile: null,
      tagsVisible: false,
      // 视频播放
      videoUrl: '',
      videoVisible: false,
      // pdf预览
      pdfUrl: '',
      pdfVisible: false,
      pdfPages: 0,
      pdfSrc: null
    }
  },
  methods: {
    onPdfClose() {
      this.pdfUrl = null
      this.pdfVisible = false
      this.pdfPages = 0
      this.pdfSrc = null
    },
    handleTableChange(pagination, filters, sorter) {
      // 分页、排序、筛选变化时触发
      // TODO 筛选
      console.log(pagination)
      if (Object.keys(sorter).length > 0) {
        this.isorter.column = sorter.field
        this.isorter.order = sorter.order == 'ascend' ? 'asc' : 'desc'
      }
      this.ipagination = pagination
      // this.loadData()
    },
    onHistoryOk() {
      this.loadFileData()
      // this.$emit('reload')
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
      postAction(this.url.list, {
        ...params,
        folderId: this.selectedIds[0]
      }).then(res => {
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
     * 变更标签方法
     * @param flag
     */
    doChangeTags(flag) {
      if (flag) {
        console.log('标签', this.tagsFile, this.tags)
        putAction(`${this.url.reTags}?fileId=${this.tagsFile.id}&tags=${this.tags}`)
        .then(res => {
          if (res.success) {
            this.$message.success('操作成功')
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
            this.$message.success('操作成功')
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
    handlePreview(record) {
      // window.open(this.downloadCompleteUrl + record.id)
      console.log('handlePreview', record)
      const dotName = `.${record.suffix.toLowerCase()}`
      const fileUrl = this.downloadCompleteUrl + record.id
      if (isImage(dotName)) {
        const centextMenuListener = (event) => {
          event.preventDefault() // 阻止右键菜单的默认行为
        }
        const viewer = this.$viewerApi({
          images: [fileUrl],
          options: {
            button: false, // 右上方的关闭按钮
            navbar: false, // 底部工具栏
            toolbar: false, // 底部工具配置
            // url: 'data-source',
            initialViewIndex: 0,
            backdrop: true, // 遮罩关闭
            className: 'v-viewer-image-hide',
            viewed: function() {
              console.log('viewed', viewer)
              viewer.body.addEventListener('contextmenu', centextMenuListener)
            },
            hidden: function() {
              console.log('hidden', viewer)
              viewer.body.removeEventListener('contextmenu', centextMenuListener)
            }
          }
        })
        return
      }
      if (isVideo(dotName)) {
        this.videoUrl = fileUrl
        this.videoVisible = true
        return
      }
      if (/pdf/.test(dotName)) {
        this.pdfUrl = fileUrl
        const pdfSrc = pdf.createLoadingTask(this.pdfUrl)
        pdfSrc.promise.then(pdf => {
          this.pdfPages = pdf.numPages
          this.pdfSrc = pdfSrc
          this.pdfVisible = true
        })
        return
      }
      this.$message.info('暂不支持该文件类型预览！')
    },
    handleDownload(record) {
      const url = this.downloadCompleteUrl + record.id + '?forceDownload=true' // 图片的URL
      const link = document.createElement('a')
      link.href = url
      link.download = record.name // 下载的文件名
      link.target = '_blank' // 在新窗口中打开下载链接（可选）
      link.click()
      link.remove()
    },
    /**
     * 删除文件
     * @param id
     */
    deleteFile(id) {
      let that = this
      deleteAction(that.url.deleteFileUrl + id).then((res) => {
        if (res.success) {
          that.$message.success(res.message)
          that.loadFileData()
          that.$emit('reload')
        } else {
          that.$message.warning(res.message)
        }
      })
    },
    getTagColor(tag) {
      if (!this.queryParam.tags) {
        return ''
      }
      const tags = this.queryParam.tags.split(',')
      return tags.includes(tag) ? 'green' : ''
    }
  }
}
</script>
<style scoped lang="less">
.file-name {
  width: auto;
  max-width: 35vh;
  padding: 0;
  color: #1890FF;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    cursor: pointer;
  }
}

.file-tags {
  width: auto;
}
</style>
<style lang="less">
// v-viewer的禁用右键菜单
.v-viewer-image-hide {
  img {
    user-select: none;
    //pointer-events: none;
  }
}
</style>
