<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :xl="12" :lg="12" :md="12" :sm="24">
            <a-form-item label="内容描述">
              <a-input placeholder="请输入内容描述" v-model="queryParam.content"></a-input>
            </a-form-item>
          </a-col>
          <!--<a-col :xl="4" :lg="4" :md="4" :sm="24">-->
          <!--  <a-form-item label="片段标题">-->
          <!--    <a-input placeholder="请输入片段标题" v-model="queryParam.title"></a-input>-->
          <!--  </a-form-item>-->
          <!--</a-col>-->
          <template v-if="toggleSearchStatus">
            <a-col :xl="6" :lg="6" :md="6" :sm="24">
              <a-form-item label="动画名称">
                <a-input placeholder="请输入动画名称" v-model="queryParam.animeName"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="6" :md="6" :sm="24">
              <a-form-item label="作监">
                <a-input placeholder="请输入作监" v-model="queryParam.author"></a-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="6" :md="6" :sm="24">
              <a-form-item label="动画公司">
                <a-input placeholder="请输入动画公司" v-model="queryParam.company"></a-input>
              </a-form-item>
            </a-col>
            <!--<a-col :xl="6" :lg="7" :md="8" :sm="24">-->
            <!--  <a-form-item label="标签">-->
            <!--    <j-multi-select-tag placeholder="请选择标签" dictCode="sakuga_content_tags" v-model="queryParam.tags"/>-->
            <!--  </a-form-item>-->
            <!--</a-col>-->
          </template>
          <a-col :xl="6" :lg="6" :md="6" :sm="24">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
              <a @click="handleToggleSearch" style="margin-left: 8px">
                {{ toggleSearchStatus ? '收起' : '展开' }}
                <a-icon :type="toggleSearchStatus ? 'up' : 'down'"/>
              </a>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <!-- 查询区域-END -->

    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>
      <!--<a-button type="primary" icon="download" @click="handleExportXls('作画内容管理')">导出</a-button>-->
      <!--<a-upload-->
      <!--  name="file"-->
      <!--  :showUploadList="false"-->
      <!--  :multiple="false"-->
      <!--  :headers="tokenHeader"-->
      <!--  :action="importExcelUrl"-->
      <!--  @change="handleImportExcel">-->
      <!--  <a-button type="primary" icon="import">导入</a-button>-->
      <!--</a-upload>-->
      <!-- 高级查询区域 -->
      <!--<j-super-query :fieldList="superFieldList" ref="superQueryModal" @handleSuperQuery="handleSuperQuery"></j-super-query>-->
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel"><a-icon type="delete"/>删除</a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>
      </a-dropdown>
    </div>

    <!-- table区域-begin -->
    <div>
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择 <a style="font-weight: 600">{{ selectedRowKeys.length }}</a>项
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
        <!--<span style="margin-left: 24px;color: #ff5083">注意：超过20MB大小的GIF无法在列表中展示！</span>-->
      </div>

      <a-table
        ref="table"
        size="middle"
        :scroll="{x:true}"
        bordered
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
        class="j-table-force-nowrap"
        @change="handleTableChange">

        <!--用于固定宽度的富文本展示，超出显示省略号-->
        <template slot="htmlSlot" slot-scope="text">
          <a-tooltip>
            <template slot="title">
              <span v-html="text"></span>
            </template>
            <div v-html="text" style="overflow: hidden;text-overflow: ellipsis;max-width: 10vh"></div>
          </a-tooltip>
        </template>
        <!--用于自动换行的富文本展示，这里结合分词搜索的加粗标签展示高亮信息-->
        <template slot="contentHighlight" slot-scope="text, record">
          <a-tooltip>
            <template slot="title">
              <span v-html="text"></span>
            </template>
            <!--<div-->
            <!--  v-html="record.contentHighlight || text"-->
            <!--  style="overflow: hidden;text-overflow: ellipsis;max-width: 20vh;">-->
            <div
              v-html="record.contentHighlight || text"
              class="break-all-table">
            </div>
          </a-tooltip>
        </template>
        <template slot="content" slot-scope="text, record">
          <a-tooltip>
            <template slot="title">
              <span v-html="text"></span>
            </template>
            <div
              v-html="text"
              class="break-all-table">
            </div>
          </a-tooltip>
        </template>
        <template slot="imgSlot" slot-scope="text">
          <j-image-upload
            :disabled="true"
            :value="text"
            :button-visible="false"
            :visible-width="'90vh'"
            :visible-number="20"
            url-suffix="x-oss-process=image/resize,w_120">
            <!--url-suffix="">-->
          </j-image-upload>
          <!--<span v-if="!text" style="font-size: 12px;font-style: italic;">无图片</span>-->
          <!--<template v-else v-for="(item, key) in text.split(',')">-->
          <!--  <img-->
          <!--    v-if="key < 50"-->
          <!--    @click="onViewer(item, text)"-->
          <!--    :key="key"-->
          <!--    :src="getImgView(item)"-->
          <!--    alt=""-->
          <!--    style="height: auto;max-width: 11vh;font-size: 12px;font-style: italic;margin: .1vh 0 .1vh 0"/>-->
          <!--  <template v-if="key < 50 && (key + 1) % 10 === 0 && key !== text.split(',').length - 1">-->
          <!--    <br />-->
          <!--  </template>-->
          <!--</template>-->
          <!--<img v-viewer v-else :src="getImgView(text)" height="25px" alt="" style="max-width:80px;font-size: 12px;font-style: italic;"/>-->
        </template>
        <template slot="fileSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px;font-style: italic;">无文件</span>
          <template v-else v-for="(item, key) in text.split(',')">
            <div style="max-width: 10vh">
              <a-button
                :ghost="true"
                type="primary"
                icon="download"
                size="small"
                @click="play(item)">
                视频{{ key + 1 }}
              </a-button>
            </div>
          </template>
        </template>

        <span slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">编辑</a>

          <a-divider type="vertical" />
          <a-dropdown>
            <a class="ant-dropdown-link">更多 <a-icon type="down" /></a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a @click="handleDetail(record)">详情</a>
              </a-menu-item>
              <a-menu-item>
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>

      </a-table>
    </div>

    <sakuga-content-modal ref="modalForm" @ok="modalFormOk"></sakuga-content-modal>
    <sakuga-video-modal ref="videoModel"></sakuga-video-modal>
  </a-card>
</template>

<script>

import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import SakugaContentModal from './modules/SakugaContentModal'
import SakugaVideoModal from '@views/sakuga/modules/SakugaVideoModal'

export default {
  name: 'SakugaContentList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    SakugaContentModal,
    SakugaVideoModal
  },
  data () {
    const that = this
    return {
      description: '作画内容管理管理页面',
      /* 分页参数 */
      ipagination: {
        current: 1,
        pageSize: 50,
        pageSizeOptions: ['50', '100', '200', '500'],
        showTotal: (total, range) => {
          return range[0] + '-' + range[1] + ' 共' + total + '条'
        },
        showQuickJumper: true,
        showSizeChanger: true,
        total: 0
      },
      // 表头
      columns: [
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          // fixed: 'right',
          width: 147,
          scopedSlots: { customRender: 'action' }
        },
        {
          title: '序号',
          dataIndex: '',
          key: 'rowIndex',
          width: 60,
          align: 'center',
          customRender: function (t, r, index) {
            // return parseInt(index) + 1;
            return (that.ipagination.current - 1) * that.ipagination.pageSize + parseInt(index) + 1
          }
        },
        {
          title: '图片',
          align: 'center',
          dataIndex: 'picture',
          scopedSlots: { customRender: 'imgSlot' }
        },
        {
          title: '视频',
          align: 'center',
          dataIndex: 'video',
          width: '10vh',
          scopedSlots: { customRender: 'fileSlot' }
        },
        {
          title: '内容描述',
          align: 'center',
          dataIndex: 'content',
          width: '20vh',
          scopedSlots: { customRender: 'contentHighlight' }
        },
        // {
        //   title: '标签',
        //   align: 'center',
        //   dataIndex: 'tags_dictText'
        // },
        // {
        //   title: '片段标题',
        //   align: 'center',
        //   dataIndex: 'title'
        // },
        {
          title: '动画名称',
          align: 'center',
          dataIndex: 'animeName',
          width: '10vh',
          scopedSlots: { customRender: 'content' }
        },
        {
          title: '作监',
          align: 'center',
          dataIndex: 'author',
          width: '10vh',
          scopedSlots: { customRender: 'content' }
        },
        {
          title: '动画公司',
          align: 'center',
          dataIndex: 'company',
          width: '10vh',
          scopedSlots: { customRender: 'content' }
        }
      ],
      url: {
        list: '/sakuga/sakugaContent/list',
        delete: '/sakuga/sakugaContent/delete',
        deleteBatch: '/sakuga/sakugaContent/deleteBatch',
        exportXlsUrl: '/sakuga/sakugaContent/exportXls',
        importExcelUrl: 'sakuga/sakugaContent/importExcel'
      },
      dictOptions: {},
      superFieldList: []
    }
  },
  created() {
    this.getSuperFieldList();
  },
  computed: {
    importExcelUrl: function() {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
    }
  },
  methods: {
    getFileAccessHttpUrl(avatar, subStr) {
      if (!subStr) subStr = 'http'
      try {
        if (avatar && avatar.startsWith(subStr)) {
          return avatar;
        } else {
          if (avatar &&　avatar.length > 0 && avatar.indexOf('[') == -1) {
            return window._CONFIG['staticDomainURL'] + '/' + avatar;
          }
        }
      } catch (err) {

      }
    },
    /* 图片预览 */
    getImgView(text, doCompress = true) {
      if (text && text.indexOf(',') > 0) {
        text = text.substring(0, text.indexOf(','))
      }
      const url = this.getFileAccessHttpUrl(text)
      if (url && ~url.indexOf('.gif')) {
        return url
      }
      return doCompress ? url + '?x-oss-process=image/resize,w_120' : url
    },
    play(url) {
      url = this.getFileAccessHttpUrl(url)
      this.$refs.videoModel.videos = [url]
      this.$refs.videoModel.show()
    },
    onViewer(item, text) {
      item = this.getImgView(item, false)
      const images = text.split(',').filter(e => e !== item).map(e => this.getImgView(e, false))
      this.$viewerApi({
        images: [item, ...images]
      })
    },
    initDictConfig() {
    },
    getSuperFieldList() {
      let fieldList = [];
      fieldList.push({ type: 'string', value: 'title', text: '片段标题', dictCode: '' })
      fieldList.push({ type: 'string', value: 'animeName', text: '动画名称', dictCode: '' })
      fieldList.push({ type: 'string', value: 'author', text: '作监', dictCode: '' })
      fieldList.push({ type: 'string', value: 'company', text: '动画公司', dictCode: '' })
      fieldList.push({ type: 'Text', value: 'content', text: '内容描述', dictCode: '' })
      fieldList.push({ type: 'list_multi', value: 'tags', text: '标签', dictTable: '', dictText: '', dictCode: 'sakuga_content_tags' })
      fieldList.push({ type: 'Text', value: 'picture', text: '图片', dictCode: '' })
      fieldList.push({ type: 'string', value: 'video', text: '视频', dictCode: '' })
      this.superFieldList = fieldList
    }
  }
}
</script>
<style lang="less" scoped>
  @import '~@assets/less/common.less';
  .break-all-table {
    //white-space: pre-line;
    max-width: 20vh;
    //max-height: 11vh;
    //overflow: hidden;
    //text-overflow: ellipsis;
    overflow-y: auto;
    word-wrap: break-word;
    word-break: break-all;
    white-space: initial;
  }
</style>
