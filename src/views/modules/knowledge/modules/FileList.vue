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
        <template v-if="tags">
          <a-tag v-for="(tag, idx) in tags.split(',')"
                 :title="tag" :key="tag + idx"
                 style="margin-right: .2vh !important;"
                 :color="getTagColor(tag)">{{ tag }}
          </a-tag>
        </template>
        <span v-else>暂无标签</span>
      </template>

      <template slot="action" slot-scope="text, record">
        <a href="javascript:;" @click="handleDownload(record)">下载</a>
        <a-divider type="vertical"/>
        <a href="javascript:;" @click="changeTags(record)">打标签</a>
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
              <a href="javascript:;" @click="$refs.historyList.show(record.id)">版本管理</a>
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

    <!-- 历史版本 -->
    <history-list ref="historyList" @ok="$emit('reload')"></history-list>
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
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import HistoryList from '@views/modules/knowledge/modules/HistoryList.vue'
import QRCode from 'qrcodejs2'
import { deleteAction, getAction, putAction } from '@api/manage'

export default {
  name: 'FileList',
  components: { HistoryList },
  mixins: [JeecgListMixin],
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
      handler: function (val) {
        // Object.assign(this.queryParam, val)
        // 必须重置值才会触发监听
        this.queryParam = { ...val }
      },
      immediate: false,
      deep: true
    },
    selectedIds: {
      handler: function (val) {
        val && val.length && this.loadFileData()
      },
      immediate: true,
      deep: true
    }
  },
  computed: {
    downloadCompleteUrl: function () {
      return window._CONFIG['domianURL'] + this.url.downLoadUrl
    },
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
          width: 300,
          fixed: 'right'
        }
      ],
      url: {
        list: '/technical/file/files?folderId=',
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
      tagsVisible: false
    }
  },
  methods: {
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
      window.open(this.downloadCompleteUrl + record.id)
    },
    handleDownload(record) {
      const url = this.downloadCompleteUrl + record.id; // 图片的URL
      const link = document.createElement('a');
      link.href = url;
      link.download = record.name; // 下载的文件名
      link.target = '_blank'; // 在新窗口中打开下载链接（可选）
      link.click();
      link.remove();
    },
    /**
     * 删除文件
     * @param id
     */
    deleteFile(id) {
      let that = this;
      deleteAction(that.url.deleteFileUrl + id).then((res) => {
        if (res.success) {
          that.$message.success(res.message);
          that.$emit('reload')
        } else {
          that.$message.warning(res.message);
        }
      });
    },
    getTagColor(tag) {
      if (!this.queryParam.tags) {
        return ''
      }
      const tags = this.queryParam.tags.split(',')
      return tags.includes(tag) ? 'green' : ''
    },
  }
}
</script>