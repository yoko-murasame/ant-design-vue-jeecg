<template>
  <a-card v-bind="cartAttrs">

    <!--查询插槽-->
    <div class="table-page-search-wrapper" v-if="!cardMode || $slots.cardQuery || $scopedSlots.cardQuery">
      <slot name="cardQuery" v-bind="getCardBindAttrs">
        <a-form layout="inline" @keyup.enter.native="searchByquery" v-if="showQueryBlock">
          <a-row :gutter="24" v-if="queryInfo && queryInfo.length>0 || hasBpmStatus">
            <template v-if="buttonSwitch.bind_bpm_show_my_task && processDefinitionId">
              <a-col :xl="2" :lg="3" :md="4" :sm="24">
                <bind-bpm-show-my-task v-model="queryParam.checked" :parent="vm"></bind-bpm-show-my-task>
              </a-col>
            </template>
            <template v-for="(item,index) in queryInfo">
              <template v-if=" item.hidden==='1' ">
                <a-col v-if="item.view ==='datetime' && 'single'!== item.mode" :md="12" :sm="16" :key=" 'query'+index " v-show="toggleSearchStatus">
                  <online-query-form-item :queryParam="queryParam" :item="item" :dictOptions="dictOptions"></online-query-form-item>
                </a-col>
                <a-col v-else :md="6" :sm="8" :key=" 'query'+index " v-show="toggleSearchStatus">
                  <online-query-form-item :queryParam="queryParam" :item="item" :dictOptions="dictOptions"></online-query-form-item>
                </a-col>
              </template>
              <template v-else>
                <a-col v-if="item.view === 'datetime' && 'single' !== item.mode" :md="12" :sm="16" :key=" 'query'+index ">
                  <online-query-form-item :queryParam="queryParam" :item="item" :dictOptions="dictOptions"></online-query-form-item>
                </a-col>
                <a-col v-else :md="6" :sm="8" :key=" 'query'+index ">
                  <online-query-form-item :queryParam="queryParam" :item="item" :dictOptions="dictOptions"></online-query-form-item>
                </a-col>
              </template>
            </template>

            <a-col :md="6" :sm="8">
              <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
                <a-button type="primary" @click="searchByquery" icon="search">查询</a-button>
                <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
                <a @click="handleToggleSearch" style="margin-left: 8px">
                  {{ toggleSearchStatus ? '收起' : '展开' }}
                  <a-icon :type="toggleSearchStatus ? 'up' : 'down'"/>
                </a>
              </span>
            </a-col>

          </a-row>
        </a-form>
      </slot>
    </div>

    <!--卡片模式-标题插槽 title部分-->
    <span slot="title" v-if="cardMode && ($slots.cardTitle || $scopedSlots.cardTitle)">
      <slot name="cardTitle">
        <span>这是标题</span>
      </slot>
    </span>
    <!--卡片模式-标题栏右侧按钮-->
    <div slot="extra" class="d-flex df-jc-center df-ai-center" v-if="cardMode && ($slots.cardExtra || $scopedSlots.cardExtra)">
      <slot name="cardExtra" v-bind="getCardBindAttrs">
        <a-checkbox>
          收起
        </a-checkbox>
      </slot>
    </div>

    <!-- 非卡片模式-操作按钮区域 -->
    <div class="table-operator" v-if="!cardMode || $slots.cardButton || $scopedSlots.cardButton">
      <slot name="cardButton" v-bind="getCardBindAttrs">
        <a-button v-if="buttonSwitch.add" :disabled="buttonSwitch.disableAdd" @click="handleAdd" type="primary" icon="plus">{{ onlineFormConfig.addButtonName || '新增' }}</a-button>
        <a-button v-if="buttonSwitch.import" :disabled="buttonSwitch.disableAdd" @click="handleImportXls" type="primary" icon="upload">导入</a-button>
        <a-button v-if="buttonSwitch.export" @click="handleExportXls" type="primary" icon="download">导出</a-button>
        <template v-if="cgButtonList && cgButtonList.length>0" v-for="(item,index) in cgButtonList">
          <a-button
            v-if=" item.optType === 'js' "
            :key=" 'cgbtn'+index "
            @click="cgButtonJsHandler(item.buttonCode)"
            type="primary"
            :icon="item.buttonIcon">
            {{ item.buttonName }}
          </a-button>
          <a-button
            v-else-if=" item.optType === 'action' "
            :key=" 'cgbtn'+index "
            @click="cgButtonActionHandler(item.buttonCode)"
            type="primary"
            :icon="item.buttonIcon">
            {{ item.buttonName }}
          </a-button>
        </template>

        <!-- 高级查询 -->
        <j-super-query
          v-if="buttonSwitch.super_query"
          ref="superQuery"
          :fieldList="superQuery.fieldList"
          :saveCode="$route.fullPath"
          :loading="table.loading"
          @handleSuperQuery="handleSuperQuery"/>

        <a-button
          v-if="buttonSwitch.batch_delete"
          :disabled="buttonSwitch.disableDelete"
          @click="handleDelBatch"
          v-show="table.selectedRowKeys.length > 0"
          ghost
          type="primary"
          icon="delete">批量删除</a-button>
      </slot>
    </div>

    <div>

      <!--非卡片模式-选择区域插槽-->
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;" v-if="!cardMode || $slots.cardRowSelector || $scopedSlots.cardRowSelector">
        <slot name="cardRowSelector" v-bind="getCardBindAttrs">
          <i class="anticon anticon-info-circle ant-alert-icon"></i>
          已选择&nbsp;<a style="font-weight: 600">{{ table.selectedRowKeys.length }}</a>项&nbsp;&nbsp;
          <a style="margin-left: 24px" @click="onClearSelected">清空</a>
          <span style="float:right;">
            <a-popover :overlayStyle="{maxWidth:'500px'}" title="自定义列" trigger="click" placement="leftBottom" @visibleChange="popVisibleChange">
              <a><a-icon type="setting"/></a>
              <template slot="content">
                <a-checkbox-group v-model="settingColumns">
                  <a-row>
                    <template v-for="(item,index) in defColumns">
                      <template v-if="item.key!=='rowIndex'&& item.dataIndex!=='action'">
                        <a-col :span="12" :key="index">
                          <a-checkbox :value="item.dataIndex">{{ item.title }}</a-checkbox>
                        </a-col>
                      </template>
                    </template>
                  </a-row>
                </a-checkbox-group>
              </template>
            </a-popover>
          </span>
        </slot>
      </div>

      <!--表格插槽，这里不传入插槽就显示默认的-->
      <slot name="cardTable" v-bind="getCardBindAttrs">
        <a-table
          ref="cgformAutoList"
          bordered
          size="middle"
          rowKey="id"
          :columns="tableColumn"
          :dataSource="table.dataSource"
          :pagination="table.pagination"
          :loading="table.loading"
          :rowSelection="rowSelectionConfig"
          @change="handleTableChange"
          :scroll="tableScroll"
          :class="{'j-table-force-nowrap': enableScrollBar}"
          style="min-height: 300px">

          <slot name="cardTableColumnRender" v-bind="getCardBindAttrs"></slot>

          <template slot="dateSlot" slot-scope="text">
            <span>{{ getFormatDate(text) }}</span>
          </template>

          <template slot="htmlSlot" slot-scope="text">
            <div v-html="text"></div>
          </template>

          <template slot="pcaSlot" slot-scope="text">
            <div>{{ getPcaText(text) }}</div>
          </template>

          <template slot="imgSlot" slot-scope="text">
            <span v-if="!text" style="font-size: 12px;font-style: italic;">无图片</span>
            <img v-else :src="getImgView(text)" height="25px" alt="" style="max-width:80px;font-size: 12px;font-style: italic;"/>
          </template>

          <template slot="fileSlot" slot-scope="text">
            <span v-if="!text" style="font-size: 12px;font-style: italic;">无文件</span>
            <a-button
              v-else
              :ghost="true"
              type="primary"
              icon="download"
              size="small"
              @click="downloadRowFile(text)">
              下载
            </a-button>
          </template>

          <!--表格按钮插槽-->
          <span slot="action" slot-scope="text, record">
            <slot name="cardTableAction" v-bind="{ ...getCardBindAttrs, record, text }">
              <!--流程-->
              <template v-if="hasBpmStatus">
                <!--流程未发起、或者已结束并且配置了可循环发起-->
                <template v-if="(record[bpmStatusFieldName] === '1'||record[bpmStatusFieldName] === ''|| record[bpmStatusFieldName] == null) ||(bpmCirculate && record[bpmStatusFieldName] === '3')">
                  <template v-if="buttonSwitch.update">
                    <a :disabled="buttonSwitch.disableEdit" @click="handleEdit(record)">编辑</a>
                    <a-divider type="vertical"/>
                  </template>
                  <!--新版本审批进度功能-->
                  <template v-if="buttonSwitch.bpm_track && record[bpmStatusFieldName] && record[bpmStatusFieldName] !== '1' && trackCondition">
                    <a @click="handleTrack(record)">{{ record[bpmStatusFieldName] === '3' ? trackHisName : trackName }}</a>
                    <a-divider type="vertical" />
                  </template>
                </template>
                <!--流程过程中或流程结束-->
                <template v-else>
                  <template v-if="buttonSwitch.detail">
                    <a href="javascript:;" @click="handleDetail(record)">详情</a>
                    <a-divider type="vertical"/>
                  </template>
                  <!--新版本审批进度功能-->
                  <template v-if="buttonSwitch.bpm_track && record[bpmStatusFieldName] && record[bpmStatusFieldName] !== '1' && trackCondition">
                    <a @click="handleTrack(record)">{{ record[bpmStatusFieldName] === '3' ? trackHisName : trackName }}</a>
                    <a-divider type="vertical" />
                  </template>
                  <!--新版本审批功能-->
                  <template v-if="buttonSwitch.bpm_handle && record[bpmStatusFieldName] === '2' && record.bpmData">
                    <template v-if="(record.bpmData.taskAssigneeName || '').trim()">
                      <a @click="handleProcess(record)">
                        办理
                      </a>
                    <!--<a-divider type="vertical" />-->
                    <!--<a @click="selectEntruster(record)">委托</a>-->
                    </template>
                    <template v-else>
                      <a @click="handleClaim(record)" >签收</a>
                    </template>
                    <a-divider type="vertical" />
                  </template>
                </template>
              </template>
              <!--非流程-->
              <template v-else>
                <template v-if="buttonSwitch.update">
                  <a :disabled="buttonSwitch.disableEdit" @click="handleEdit(record)">编辑</a>
                  <a-divider type="vertical"/>
                </template>
              </template>
              <a-dropdown>
                <a class="ant-dropdown-link">
                  更多 <a-icon type="down" />
                </a>
                <a-menu slot="overlay">
                  <!--流程-->
                  <template v-if="hasBpmStatus">
                    <template v-if="record[bpmStatusFieldName] === '1'||record[bpmStatusFieldName] === ''|| record[bpmStatusFieldName] == null ||(bpmCirculate && record[bpmStatusFieldName] === '3')">
                      <a-menu-item v-if="buttonSwitch.bpm">
                        <a href="javascript:;" @click="startProcess(record)">提交流程</a>
                      </a-menu-item>
                      <a-menu-item v-if="buttonSwitch.delete">
                        <a-popconfirm :disabled="buttonSwitch.disableDelete" title="确定删除吗?" @confirm="() => handleDeleteOne(record)">
                          <a :disabled="buttonSwitch.disableDelete">删除</a>
                        </a-popconfirm>
                      </a-menu-item>
                    </template>
                    <!--原先的审批进度功能不用了，展示信息太少-->
                    <!--<template v-if="record[bpmStatusFieldName] === '3'&& buttonSwitch.bpm">-->
                    <!--  <a-menu-item @click="handlePreviewPic(record)">审批进度</a-menu-item>-->
                    <!--</template>-->
                    <!--委托-->
                    <template v-if="buttonSwitch.bpm_entrusted">
                      <a-menu-item v-if="record[bpmStatusFieldName] === '2' && record.bpmData && record.bpmData.taskAssigneeName">
                        <a-popconfirm title="确定要委托给别人处理吗?" @confirm="selectEntruster(record)">
                          <a>委托</a>
                        </a-popconfirm>
                      </a-menu-item>
                    </template>
                    <!--完成流程-->
                    <template v-if="buttonSwitch.bpm_finish">
                      <a-menu-item v-if="record[bpmStatusFieldName] === '2' ">
                        <a-popconfirm title="确定要完成流程吗?" @confirm="() => finishProcess(record)">
                          <a>完成流程</a>
                        </a-popconfirm>
                      </a-menu-item>
                    </template>
                    <!--取回流程-->
                    <template v-if="buttonSwitch.bpm_callback">
                      <a-menu-item v-if="record[bpmStatusFieldName] === '2' ">
                        <a-popconfirm title="确定要取回流程吗?" @confirm="() => callBackProcess(record)">
                          <a>取回流程</a>
                        </a-popconfirm>
                      </a-menu-item>
                    </template>
                    <!--管理员编辑-->
                    <template v-if="buttonSwitch.bpm_admin_edit">
                      <a-menu-item>
                        <a @click="handleEdit(record)">编辑(管理员)</a>
                      </a-menu-item>
                    </template>
                    <!--管理员删除-->
                    <template v-if="buttonSwitch.bpm_admin_delete">
                      <a-menu-item>
                        <a-popconfirm title="确定要删除吗?" @confirm="() => handleDeleteOne(record)">
                          <a>删除(管理员)</a>
                        </a-popconfirm>
                      </a-menu-item>
                    </template>
                  </template>
                  <!--非流程-->
                  <template v-else>
                    <a-menu-item v-if="buttonSwitch.detail">
                      <a href="javascript:;" @click="handleDetail(record)">详情</a>
                    </a-menu-item>
                    <a-menu-item v-if="buttonSwitch.delete">
                      <a-popconfirm :disabled="buttonSwitch.disableDelete" title="确定删除吗?" @confirm="() => handleDeleteOne(record)">
                        <a :disabled="buttonSwitch.disableDelete">删除</a>
                      </a-popconfirm>
                    </a-menu-item>
                  </template>
                  <!--自定义JS增强按钮-->
                  <template v-if="cgButtonLinkList && cgButtonLinkList.length>0" v-for="(btnItem,btnIndex) in cgButtonLinkList">
                    <a-menu-item :key=" 'cgbtnLink'+btnIndex " v-if="showLinkButton(btnItem,record)">
                      <template v-if="btnItem.optType === 'js-confirm'">
                        <a-popconfirm
                          :title="`确定${btnItem.buttonName}?`"
                          @confirm="() => cgButtonLinkHandler(record,btnItem.buttonCode,btnItem.optType)">
                          <a href="javascript:void(0);">
                            <a-icon v-if="btnItem.buttonIcon" :type="btnItem.buttonIcon" />
                            {{ btnItem.buttonName }}
                          </a>
                        </a-popconfirm>
                      </template>
                      <template v-else>
                        <a href="javascript:void(0);" @click="cgButtonLinkHandler(record,btnItem.buttonCode,btnItem.optType)">
                          <a-icon v-if="btnItem.buttonIcon" :type="btnItem.buttonIcon" />
                          {{ btnItem.buttonName }}
                        </a>
                      </template>
                    </a-menu-item>
                  </template>
                </a-menu>
              </a-dropdown>
            </slot>
          </span>
        </a-table>
      </slot>

      <!--原始的Online渲染表单-->
      <onl-cgform-auto-modal v-if="isOnlineForm" @success="handleFormSuccess" ref="modal" :code="code" @schema="handleGetSchema" />

      <j-import-modal ref="importModal" :url="getImportUrl()" @ok="importOk"></j-import-modal>

      <!--原先的审批进度功能不用了，展示信息太少-->
      <!--<process-inst-pic-modal ref="processInstPicModal"></process-inst-pic-modal>-->

      <!-- 跳转Href的动态组件方式 -->
      <a-modal v-bind="hrefComponent.model" v-on="hrefComponent.on">
        <component :is="hrefComponent.is" v-bind="hrefComponent.params"/>
      </a-modal>

      <!-- kForm弹框表单设计器区域 -->
      <auto-desform-data-full-screen
        ref="desformModal"
        @ok="handleFormSuccess"
        @saveAndSubmitBPM="saveAndSubmitBPM"
        :buttonSwitch="buttonSwitch"
        :currentTableName="currentTableName"
        :default-data="initQueryParam || {}"
        :hasBpmStatus="hasBpmStatus" />

      <!-- 自定义流程接入 -->
      <bind-bpm v-if="hasBpmStatus" :parent="vm" ref="bindBpm"></bind-bpm>

      <!--嵌入流程审批组件-->
      <component
        :is="realTaskModule"
        v-if="showDealBlock && onlineFormData"
        :show-steps="false"
        :save-form="preSaveForm"
        :formData="onlineFormData"
        @complete="$emit('complete')" />
    </div>

    <!--卡片模式-Card底部按钮部分插槽-->
    <template slot="actions" v-if="cardMode && ($slots.cardBottomButton || $scopedSlots.cardBottomButton)">
      <slot name="cardBottomButton" v-bind="getCardBindAttrs">
        <a-button @click="handleTrack" type="primary" style="margin-right: 1vh"><a-icon key="team" type="team" /> 审批进度</a-button>
      </slot>
    </template>
  </a-card>
</template>

<script>

import '@/assets/less/TableExpand.less'
import { deleteAction, downFile, getAction, getFileAccessHttpUrl, postAction } from '@/api/manage'
// import ProcessInstPicModal from '@/components/bpm/ProcessInstPicModal'
import ButtonExpHandler from '@/components/online/autoform/model/ButtonExpHandler'
import OnlineQueryFormItem from '@/components/online/autoform/OnlineQueryFormItem.vue'
import { HrefJump } from '@/mixins/OnlAutoListMixin'
import { onlUtil } from '@/mixins/OnlineCommonUtil'
import { mixinDevice } from '@/utils/mixin'
import { filterObj } from '@/utils/util'
import AutoDesformDataFullScreen from '@/views/modules/online/desform/auto/modules/AutoDesformDataFullScreen'
import { createAsyncJsEnhanceFunction, createVue2Watcher } from '@comp/yoko/kform/CustomMethods'
// 流程处理接入
import BindBpm from '@views/modules/bpm/mytask/BindBpm'
// import BindBpmButton from '@views/modules/bpm/mytask/BindBpmButton'
import BindBpmOnlineMixin from '@views/modules/bpm/mytask/BindBpmOnlineMixin'
import BindBpmShowMyTask from '@views/modules/bpm/mytask/BindBpmShowMyTask'
import TaskModule from '@views/modules/bpm/task/form/TaskModule'
// eslint-disable-next-line camelcase
import lodash_object, { debounce } from 'lodash'
import Vue from 'vue'
import OnlCgformAutoModal from './OnlCgformAutoModal'

export default {
    name: 'OnlCgFormAutoList',
    mixins: [HrefJump, mixinDevice, onlUtil, BindBpmOnlineMixin],
    components: {
      TaskModule,
      OnlCgformAutoModal,
      OnlineQueryFormItem,
      // ProcessInstPicModal,
      AutoDesformDataFullScreen,
      BindBpm,
      BindBpmShowMyTask
    },
    props: {
      // 卡片模式，卡片模式下，支持slot渲染
      cardMode: {
        type: Boolean,
        default: false,
        required: false
      },
      // 卡片属性
      cartAttrs: {
        type: Object,
        default() {
          return {
            'bordered': false,
            'style': { 'height': '100%' }
          }
        },
        required: false
      },
      // 流程表单data
      onlineFormData: {
        type: Object,
        default: null,
        required: false
      },
      // 流程表单配置
      onlineFormConfig: {
        type: Object,
        default() {
          return {
            // 表单code
            code: '',
            // 展示审批模块
            showDealBlock: false,
            // 展示查询模块
            showQueryBlock: true,
            // 初始化筛选参数
            initQueryParam: {},
            // 新增按钮文本
            addButtonName: '新增'
          }
        },
        required: false
      }
    },
    data() {
      return {
        // 表单code
        code: '',
        // 是否展示审批模块
        showDealBlock: false,
        // 是否展示查询模块
        showQueryBlock: false,
        // 初始化筛选参数
        initQueryParam: {},
        // 其他参数
        lodash: lodash_object,
        description: '在线报表功能测试页面',
        currentTableName: '',
        url: {
          getQueryInfo: '/online/cgform/api/getQueryInfo/',
          getColumns: '/online/cgform/api/getColumns/',
          getData: '/online/cgform/api/getData/',
          optPre: '/online/cgform/api/form/',
          exportXls: '/online/cgform/api/exportXls/',
          buttonAction: '/online/cgform/api/doButton',
          getFormData: '/online/cgform/api/form/table_name',
          // 查询原始的online表单配置
          loadFormItems: '/online/cgform/api/getFormItem/'
        },
        isorter: {
          column: 'id',
          order: 'desc'
        },
        // dictOptions:{fieldName:[]}
        dictOptions: {

        },
        cgButtonLinkList: [],
        cgButtonList: [],
        queryInfo: [],
        // 查询参数，多个页面的查询参数用 code 作为键来区分
        queryParamsMap: {},
        toggleSearchStatus: true,
        table: {
          loading: true,
          scroll: { x: false },
          // 表头
          columns: [],
          // 数据集
          dataSource: [],
          // 选择器
          selectedRowKeys: [],
          selectionRows: [],
          // 分页参数
          pagination: {

          }
        },
        metaPagination: {
          current: 1,
          pageSize: 10,
          pageSizeOptions: ['10', '20', '30'],
          showTotal: (total, range) => {
            return range[0] + '-' + range[1] + ' 共' + total + '条'
          },
          showQuickJumper: true,
          showSizeChanger: true,
          total: 0
        },
        rowIndexColumn: {
          title: '序号',
          dataIndex: '',
          key: 'rowIndex',
          width: 60,
          align: 'center'
        },
        actionColumn: {
          title: '操作',
          dataIndex: 'action',
          scopedSlots: { customRender: 'action' },
          // fixed:"right",
          align: 'center',
          width: 150
        },
        formTemplate: '99',
        EnhanceJS: '',
        hideColumns: [],
        buttonSwitch: {
          disableAdd: false,
          disableEdit: false,
          disableDelete: false,
          add: true,
          update: true,
          delete: true,
          batch_delete: true,
          import: true,
          export: true,
          detail: true,
          super_query: false,
          bpm: true,
          bind_bpm_show_my_task: true,
          bpm_track: true,
          bpm_handle: true,
          bpm_entrusted: true,
          bpm_admin_edit: true,
          bpm_admin_delete: true,
          bpm_finish: true,
          bpm_callback: true
        },
        hasBpmStatus: false,
        checkboxFlag: false,
        // 高级查询
        superQuery: {
          // 字段列表
          fieldList: [],
          // 查询参数
          params: '',
          // 查询条件拼接方式 'and' or 'or'
          matchType: 'and'
        },
        scrollFlag: 0,
        settingColumns: [],
        defColumns: [],
        // 接受URL参数
        acceptHrefParams: {},
        // 是否是online表单
        isOnlineForm: '',
        // 是否是kForm设计器表单
        isDesForm: '',
        // kForm设计器表单保存后，会自动生成的表单编码
        desFormCode: '',
        // 可循环发起流程
        bpmCirculate: false,
        // 流程状态字段名
        bpmStatusFieldName: 'bpm_status',
        // 调用$watch api的监听fun结果，需要放入这里后，online表单改变时，去清空旧的监听
        cachedUnWatchMap: {}
      }
    },
    created() {
      this.initAll = debounce(this.initAll, 50)
    },
    watch: {
      // 卡片模式下才触发初始化
      'onlineFormConfig.code': {
        handler(v) {
          if (v && this.cardMode) {
            console.log('Online自动列表加载::OnlCgformAutoList::initAutoList::卡片模式::监听onlineFormConfig.code',
              'code:',
              v,
              'onlineFormConfig:',
              JSON.parse(JSON.stringify(this.onlineFormConfig)),
              'initQueryParam:',
              JSON.parse(JSON.stringify(this.initQueryParam)))
            this.initAll()
          }
        },
        deep: false,
        immediate: true
      },
      // 流程流转模式下的初始化，不受卡片配置影响
      onlineFormData: {
        handler(v) {
          if (v) {
            console.log('Online自动列表加载::OnlCgformAutoList::initAutoList::监听onlineFormData',
              'onlineFormData:',
              JSON.parse(JSON.stringify(v)),
              'onlineFormConfig:',
              JSON.parse(JSON.stringify(this.onlineFormConfig)),
              'initQueryParam:',
              JSON.parse(JSON.stringify(this.initQueryParam)))
            this.initAll()
          }
        },
        deep: false,
        immediate: true
      },
      // 监听路由参数变化，需要在非卡片模式下触发
      '$route': {
        handler() {
          // 刷新参数放到这里去触发，就可以刷新相同界面了
          if (this.$route.params.code && !this.cardMode) {
            console.log('Online自动列表加载::OnlCgformAutoList::initAutoList::监听$route::after',
              'code:',
              this.$route.params.code,
              'onlineFormConfig:',
              JSON.parse(JSON.stringify(this.onlineFormConfig)),
              'initQueryParam:',
              JSON.parse(JSON.stringify(this.initQueryParam)))
            this.initAll()
          }
        },
        immediate: true
      }
    },
    computed: {
      // 获取slot绑定属性
      getCardBindAttrs() {
        // console.log('获取slot绑定属性', this.$slots, this.$scopedSlots)
        return {
          table: this.table,
          columns: this.tableColumn,
          dataSource: this.table.dataSource,
          pagination: this.table.pagination,
          loading: this.table.loading,
          rowSelection: this.rowSelectionConfig,
          handleTableChange: this.handleTableChange,
          scroll: this.tableScroll,
          getFormatDate: this.getFormatDate,
          getPcaText: this.getPcaText,
          getImgView: this.getImgView,
          downloadRowFile: this.downloadRowFile,
          handleEdit: this.handleEdit,
          handleTrack: this.handleTrack,
          handleDetail: this.handleDetail,
          handleProcess: this.handleProcess,
          handleClaim: this.handleClaim,
          startProcess: this.startProcess,
          handleDeleteOne: this.handleDeleteOne,
          selectEntruster: this.selectEntruster,
          finishProcess: this.finishProcess,
          callBackProcess: this.callBackProcess,
          showLinkButton: this.showLinkButton,
          cgButtonLinkHandler: this.cgButtonLinkHandler,
          onClearSelected: this.onClearSelected,
          popVisibleChange: this.popVisibleChange,
          settingColumns: this.settingColumns,
          defColumns: this.defColumns,
          handleAdd: this.handleAdd,
          handleImportXls: this.handleImportXls,
          handleExportXls: this.handleExportXls,
          cgButtonList: this.cgButtonList,
          cgButtonJsHandler: this.cgButtonJsHandler,
          cgButtonActionHandler: this.cgButtonActionHandler,
          superQuery: this.superQuery,
          handleSuperQuery: this.handleSuperQuery,
          handleDelBatch: this.handleDelBatch,
          queryParam: this.queryParam,
          searchByquery: this.searchByquery,
          queryInfo: this.queryInfo,
          buttonSwitch: this.buttonSwitch,
          dictOptions: this.dictOptions,
          toggleSearchStatus: this.toggleSearchStatus,
          bpmStatusFieldName: this.bpmStatusFieldName,
          hasBpmStatus: this.hasBpmStatus,
          cgButtonLinkList: this.cgButtonLinkList
        }
      },
      realTaskModule() {
        console.log('加载动态审批组件', this.innerFormData.customTaskModule)
        if (this.innerFormData.customTaskModule) {
          return () => import(`@/views/${this.innerFormData.customTaskModule}.vue`)
        }
        return 'TaskModule'
      },
      rowSelectionConfig: function() {
        if (!this.checkboxFlag) {
          return null
        }
        return {
          // fixed:true,
          selectedRowKeys: this.table.selectedRowKeys,
          onChange: this.handleChangeInTableSelect
        }
      },
      queryParam: {
        get() {
          return this.queryParamsMap[this.code]
        },
        set(newVal) {
          this.$set(this.queryParamsMap, this.code, newVal)
        }
      },
      enableScrollBar() {
        return this.scrollFlag === 1 || this.isMobile()
      },
      tableScroll() {
        // 移动端模式下无论如何都开启横向滚动条
        if (this.enableScrollBar) {
          return undefined
        } else {
          return this.table.scroll
        }
      },
      tableColumn() {
        // 自定义序号列
        const that = this
        const customRender = (t, r, index) => {
          // console.log('加载序号列', t, r, index)
          // 如果是非分页模式，默认index
          if (!that.table.pagination) {
            return parseInt(index) + 1
          }
          // 分页下和总数计算
          return (that.table.pagination.current - 1) * that.table.pagination.pageSize + parseInt(index) + 1
        }
        // 处理列
        if (!this.settingColumns || this.settingColumns.length <= 0) {
          return this.defColumns
        } else {
          const cols = this.defColumns.filter(item => {
            // 自定义序号字段
            if (item.key === 'rowIndex' || item.dataIndex === 'action') {
              if (item.key === 'rowIndex') {
                item.title = '序号'
                item.customRender = customRender
              }
              return true
            }
            // console.log('加载序号列', item)
            // 自定义流程状态文本
            if (item.key === this.bpmStatusFieldName || item.dataIndex.toUpperCase() === this.bpmStatusFieldName.toUpperCase()) {
              item.customRender = this.getBpmStatusColumn().customRender
              // console.log('加载流程状态列', item)
              return true
            }
            if (this.settingColumns.includes(item.dataIndex)) {
              return true
            }
            return false
          })
          return cols
        }
      },
      localCode() {
        return 'onl_' + this.currentTableName
      }
    },
    methods: {
      // TODO 放入后端配置JS增强，可自定义实现流转前保存事件
      async preSaveForm(flag, buttonName) {
        // TODO 流程按钮提交前会触发，表单自己实现相应的保存事件
      },
      /**
       * 初始化Online列表入口
       */
      initAll() {
        this.clearOnlineConfig()
        this.resetConfig()
        this.initOnlineBpmData()
        this.initAutoList()
      },
      /**
       * 重置配置
       * 主要搜索参数会互相影响
       */
      resetConfig() {
        // Bug在这里，流程上文变量进来，需要判断是否是处于流程表单状态，不是才清空
        // 统一只使用 this.initQueryParam 作为最终的配置，就不再改变 onlineFormConfig.initQueryParam
        // if (this.onlineFormData === null) {
        //   this.$set(this.onlineFormConfig, 'initQueryParam', {})
        // }
        // 清空表单的默认初始化条件
        this.$set(this, 'initQueryParam', {})
        this.$set(this, 'queryParam', {})
        this.$set(this.queryParamsMap, this.code, {})
        this.bpmCirculate = false
        // 重置流程和设计器判断
        this.hasBpmStatus = false
        this.isOnlineForm = ''
        this.isDesForm = ''
        this.desFormCode = ''
        // 清空表单编码
        this.code = ''
        this.showDealBlock = false
        this.showQueryBlock = false
      },
      /**
       * 初始化Online流程展示列表
       */
      initOnlineBpmData() {
        // console.log('优先注入流程节点定义的预定义参数', JSON.parse(JSON.stringify(this.onlineFormData)))
        // 先加载props配置
        this.code = this.onlineFormConfig.code || this.$route.params.code
        this.showDealBlock = this.onlineFormConfig.showDealBlock
        this.showQueryBlock = this.onlineFormConfig.showQueryBlock
        this.initQueryParam = { ...this.initQueryParam, ...this.onlineFormConfig.initQueryParam }
        // 如果从流程配置中有定义，去加载覆盖
        if (this.onlineFormData && this.onlineFormData.onlineFormConfig) {
          const extParams = { ...this.onlineFormData.onlineFormConfig } || {}
          this.code = extParams.hasOwnProperty('code') ? extParams.code : this.code
          this.showDealBlock = extParams.hasOwnProperty('showDealBlock') ? extParams.showDealBlock : this.showDealBlock
          this.showQueryBlock = extParams.hasOwnProperty('showQueryBlock') ? extParams.showQueryBlock : this.showQueryBlock
          // 优先注入流程节点定义的预定义参数
          if (extParams.hasOwnProperty('initQueryParam') && extParams.initQueryParam) {
            // 现在新的配置不会有字符串的形式传入了
            // if (typeof extParams.initQueryParam === 'string') {
            //   this.initQueryParam = Object.assign(this.initQueryParam, JSON.parse(extParams.initQueryParam) || {})
            // }
            if (typeof extParams.initQueryParam === 'object') {
              this.initQueryParam = Object.assign(this.initQueryParam, { ...extParams.initQueryParam })
              // console.log('优先注入流程节点定义的预定义参数', JSON.parse(JSON.stringify(this.initQueryParam)), JSON.parse(JSON.stringify(extParams)))
            }
          }
        }
      },
      /**
       * 发送模板消息
       * @returns {Promise<*>}
       */
      async sendTemplateAnnouncement() {
        // eslint-disable-next-line no-useless-call
        return this.$sendTemplateAnnouncement.call(this, ...arguments)
      },
      /**
       * 获取完整的表单数据
       * @param id 主键
       * @param tableName 表名，即desFormCode
       * @param desFormCode 表单编码，目前统一和表名保持一致
       * @returns {Promise<*>}
       */
      async getFullFormData(id, tableName, desFormCode) {
        if (!id) {
          throw new Error('id不能为空')
        }
        desFormCode = tableName || desFormCode || this.desFormCode
        if (!desFormCode) {
          throw new Error('desFormCode不能为空，目前这个参数就是业务表名！')
        }
        const { result, success, message } = await getAction(`${this.url.getFormData}/${desFormCode}/${id}`)
        !success && this.$message.error(message)
        return result
      },
      /**
       * 打开任意表单
       * @param code online表单的配置地址中的code
       * @param id 主键
       * @param mode 模式 add | edit | detail
       * @param title 标题
       * @param defaultData 携带的数据对象 {}
       * @returns {Promise<void>}
       */
      async openAnyForm(code, id, mode = 'add', title = '表单', defaultData = {}) {
        if (mode !== 'add' && !id) {
          throw new Error('非新增模式（add）时，id不能为空！')
        }
        if (!code) {
          throw new Error('code不能为空，这个参数是online表单的配置地址中的code！')
        }
        const { result, success, message } = await getAction(`${this.url.getColumns}${code}`)
        if (!success) {
          this.$message.error(message)
          console.error('openAnyForm', message)
        }
        const { desFormCode } = result
        this.$refs.desformModal.open(mode, desFormCode, id, title, false, code, defaultData)
      },
      hasBpmStatusFilter() {
        var columnObjs = this.defColumns
        let columns = []
        for (var item of columnObjs) {
          columns.push(item.dataIndex)
        }
        if (columns.includes(this.bpmStatusFieldName) || columns.includes(this.bpmStatusFieldName.toUpperCase())) {
          this.hasBpmStatus = true
        } else {
          this.hasBpmStatus = false
        }
      },
      /**
       * 查看审批流程图
       * @deprecated 已废弃，使用新版本流程审批记录跟踪
       * @param record
       * @returns {Promise<void>}
       */
      async handlePreviewPic(record) {
        var flowCode = await this.getFlowCode(record)
        var dataId = record.id
        this.$refs.processInstPicModal.preview(flowCode, dataId)
        this.$refs.processInstPicModal.title = '流程图'
      },
      initQueryInfo(onlineInitQueryParamGetter) {
        return new Promise((resolve, reject) => {
          getAction(`${this.url.getQueryInfo}${this.code}`).then(async(res) => {
            console.log('--onlineList-获取查询条件配置', res)
            if (res.success) {
              this.queryInfo = res.result
              // 查询条件form 默认值设置
              for (let item of res.result) {
                if (item.config === '1') {
                  if (item.defValue && item.defValue.length > 0 && item.mode === 'single') {
                    this.$set(this.queryParam, item.field, item.defValue)
                  }
                }
              }
              // 参数JS增强
              if (onlineInitQueryParamGetter && onlineInitQueryParamGetter.trim() !== '') {
                try {
                  const func = createAsyncJsEnhanceFunction(this, onlineInitQueryParamGetter,
                    ['queryParam', 'initQueryParam'],
                    [this.queryParam, this.initQueryParam])
                  const getterParams = await func()
                  // FIXME 其实流程变量优先级更高，放前面，这里自己看情况调整吧
                  console.log('online列表合并流程变量', JSON.parse(JSON.stringify(this.initQueryParam)), JSON.parse(JSON.stringify(getterParams)))
                  this.initQueryParam = Object.assign(getterParams || {}, this.initQueryParam)
                } catch (e) {
                  this.$message.error('数据初始化JS增强：onlineInitQueryParamGetter，执行异常！')
                  console.error(e)
                  reject(e)
                  return
                }
              }
              // 初始化传递的查询条件
              Object.keys(this.initQueryParam).forEach(key => {
                this.$set(this.queryParam, key, this.initQueryParam[key])
              })
              console.log('OnlCgformAutoListBpmForm::初始化筛选', this.initQueryParam, this.queryParam)
            } else {
              this.$message.warning(res.message)
            }
            this.loadData()
            resolve()
          })
        })
      },
      initAutoList() {
        if (!this.code) {
          return false
        }

        this.table.loading = true
        // 存在id筛选我的待办时，切换online列表需要清空
        if (!this.queryParam || this.queryParam.id) {
          this.queryParam = {}
        }
        this.handleAcceptHrefParams()
        getAction(`${this.url.getColumns}${this.code}`).then(async(res) => {
          console.log('--onlineList-加载动态列>>', res)
          if (res.success) {
            if (res.result.checkboxFlag === 'Y') {
              this.checkboxFlag = true
            } else {
              this.checkboxFlag = false
            }

            if (res.result.paginationFlag === 'Y') {
              this.table.pagination = { ...this.metaPagination }
            } else {
              this.table.pagination = false
            }

          // 修正BUG：配置查询条件无效问题,仅取第一个设置了排序的字段
          let sortFlieds = res.result.columns.filter(u => u.sorter)
          if (sortFlieds.length > 0) {
            this.isorter = {
              column: sortFlieds[0]['dataIndex'],
              order: sortFlieds[0]['sorterType'] ? sortFlieds[0]['sorterType'] : 'desc'
            }
          }

            // href 跳转
            const fieldHrefSlotKeysMap = {}
            res.result.fieldHrefSlots.forEach(item => (fieldHrefSlotKeysMap[item.slotName] = item))
            this.bpmCirculate = res.result.bpmCirculate

            this.dictOptions = res.result.dictOptions
            this.formTemplate = res.result.formTemplate
            this.description = res.result.description
            this.currentTableName = res.result.currentTableName
            this.isDesForm = res.result.isDesForm
            this.desFormCode = res.result.desFormCode
            // 如果不是kForm设计器表单，才走普通online表单
            this.isOnlineForm = !(this.isDesForm && this.desFormCode)
            this.initCgButtonList(res.result.cgButtonList)
            // 创建vue2监听器
            createVue2Watcher(res.result.onlineVueWatchJsStr, this.code, this.cachedUnWatchMap, this)
            await this.initCgEnhanceJs(res.result.enhanceJs)
            this.initButtonSwitch(res.result.hideColumns)
            res.result.columns.forEach(column => {
              Object.keys(column).map(key => {
                // 删掉空值的字段（不删除 空字符串('') 或 数字 0 ）
                if (column[key] == null) {
                  delete column[key]
                }
              })
              // 处理列中的 href 跳转和 dict 字典，使两者可以兼容存在
              this.handleColumnHrefAndDict(column, fieldHrefSlotKeysMap)
              // 处理显示长度
              this.handleColumnShowLength(column)
            })
            // this.defColumns = res.result.columns.concat([this.actionColumn])
            this.defColumns = [this.rowIndexColumn, ...res.result.columns, this.actionColumn]
            this.settingColumnsHandler(res.result.columns)
            this.scrollFlag = res.result.scrollFlag
            // 检查是否是流程
            this.hasBpmStatusFilter()
            // 初始化高级查询组件条件
            await this.initSuperQuery()
            // 初始化查询条件，这里需要等待先加载
            await this.initQueryInfo(res.result.onlineInitQueryParamGetter)
            // 加载新路由，清空checkbox选中
            this.table.selectedRowKeys = []
          } else {
            this.$message.warning(res.message)
          }
          // 清空高级查询条件
          console.log('现在才清空高级查询条件')
          this.superQuery.params = ''
          if (this.$refs.superQuery) {
            // 清空高级查询组件中的查询条件，会触发历史online表单的数据加载，因此放在code改变之后，再将loadData节流化
            this.$refs.superQuery.handleReset()
          }
        })
      },
      loadData(arg) {
        if (this.table.pagination) {
          if (arg === 1) {
            this.table.pagination.current = 1
          }
          this.table.loading = true
          let params = this.getQueryParams()// 查询条件
          // needList作用：配置在这里的字段，会参与后端条件和数据返回，默认需要加上id字段供流程流转数据合并
          params['needList'] = params['needList'] ? params['needList'].split(',').includes('id') ? params['needList'] : params['needList'] + ',id' : 'id'
          console.log('--onlineList-查询条件-->', params)
          getAction(`${this.url.getData}${this.code}`, params).then((res) => {
            console.log('--onlineList-列表数据', res)
            if (res.success) {
              let result = res.result
              if (Number(result.total) > 0) {
                // 新增功能-懒加载字典
                if (result.dictOptions && Object.keys(result.dictOptions).length > 0) {
                  Object.keys(result.dictOptions).forEach(key => {
                    this.$set(this.dictOptions, key, result.dictOptions[key])
                  })
                  // 换用_dictText自动填充了，不需要下面再处理
                  // this.handleColumnHrefAndDict(this.defColumns, {})
                }
                this.table.pagination.total = Number(result.total)
                this.table.dataSource = result.records
                // 如果有流程，去加载流程相关代办数据
                this.hasBpmStatus && this.combineBpmDataList()
              } else {
                this.table.pagination.total = 0
                this.table.dataSource = []
                // this.$message.warning("查无数据")
              }
            } else {
              this.$message.warning(res.message)
            }
          }).finally(() => {
            this.table.loading = false
          })
        } else {
          this.loadDataNoPage()
        }
      },
      loadDataNoPage() {
        this.table.loading = true
        let param = this.getQueryParams()// 查询条件
        param['pageSize'] = -521
        param['needList'] = 'id'
        getAction(`${this.url.getData}${this.code}`, filterObj(param)).then((res) => {
          console.log('--onlineList-列表数据', res)
          if (res.success) {
            let result = res.result
            if (Number(result.total) > 0) {
              this.table.dataSource = result.records
              this.hasBpmStatus && this.combineBpmDataList()
            } else {
              this.table.dataSource = []
            }
          } else {
            this.$message.warning(res.message)
          }
        }).finally(() => {
          this.table.loading = false
        })
      },
      // 接受URL参数
      handleAcceptHrefParams() {
        this.acceptHrefParams = {}
        let hrefparam = this.$route.query
        if (hrefparam) {
          this.acceptHrefParams = { ...hrefparam }
          Object.keys(hrefparam).map(key => {
            this.queryParam[key] = hrefparam[key]
          })
        }
      },
      getQueryParams() {
        let param = Object.assign({}, this.acceptHrefParams, this.queryParam, this.isorter)
        param.pageNo = this.table.pagination.current
        param.pageSize = this.table.pagination.pageSize
        param.superQueryMatchType = this.superQuery.matchType
        param.superQueryParams = encodeURIComponent(this.superQuery.params)
        return filterObj(param)
      },
      handleChangeInTableSelect(selectedRowKeys, selectionRows) {
        this.table.selectedRowKeys = selectedRowKeys
        this.table.selectionRows = selectionRows
        this.selectedRowKeys = selectedRowKeys
      },
      handleTableChange(pagination, filters, sorter) {
        // TODO 筛选
        if (Object.keys(sorter).length > 0) {
          this.isorter.column = sorter.field
          this.isorter.order = sorter.order === 'ascend' ? 'asc' : 'desc'
        }
        if (this.table.pagination) {
          this.table.pagination = pagination
        }
        this.loadData()
      },
      handleAdd() {
        console.log('code', this.isDesForm, this.code, this.desFormCode, this.formTemplate)
        if (this.isDesForm === 'Y') {
          this.$refs.desformModal.open('add', this.desFormCode, null, '新增数据', false, this.code)
        } else {
          this.cgButtonJsHandler('beforeAdd')
          this.$refs.modal.add(this.formTemplate)
        }
      },
      handleImportXls() {
        this.$refs.importModal.show()
      },
      importOk() {
        this.loadData(1)
      },
      handleExportXls2() {
        let param = this.queryParam
        if (this.table.selectedRowKeys && this.table.selectedRowKeys.length > 0) {
          param['selections'] = this.table.selectedRowKeys.join(',')
        }
        let paramsStr = encodeURI(JSON.stringify(param))
        console.log('paramsStr: ' + paramsStr)
        let url = window._CONFIG['domianURL'] + this.url.exportXls + this.code + '?paramsStr=' + paramsStr
        window.location.href = url
      },
      handleExportXls() {
        // update--begin--autor:lvdandan-----date:20201110------for：LOWCOD-998 导出参数添加高级查询
        let param = this.getQueryParams()
        // update--end--autor:lvdandan-----date:20201110------for：LOWCOD-998 导出参数添加高级查询
        if (this.table.selectedRowKeys && this.table.selectedRowKeys.length > 0) {
          param['selections'] = this.table.selectedRowKeys.join(',')
        }
        console.log('导出参数', param)
        let paramsStr = JSON.stringify(filterObj(param))
        downFile(this.url.exportXls + this.code, { paramsStr: paramsStr }).then((data) => {
          if (!data || data.size === 0) {
            this.$message.warning('文件下载失败')
            return
          }
          if (typeof window.navigator.msSaveBlob !== 'undefined') {
            window.navigator.msSaveBlob(new Blob([data]), this.description + '.xls')
          } else {
            let url = window.URL.createObjectURL(new Blob([data]))
            let link = document.createElement('a')
            link.style.display = 'none'
            link.href = url
            link.setAttribute('download', this.description + '.xls')
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link) // 下载完成移除元素
            window.URL.revokeObjectURL(url) // 释放掉blob对象
          }
        })
      },
      handleEdit(record) {
        console.log('handleEdit', record)
        if (this.isDesForm === 'Y') {
          this.$refs.desformModal.open('edit', this.desFormCode, record.id, '编辑数据', true, this.code)
        } else {
          this.cgButtonLinkHandler(record, 'beforeEdit', 'js')
          this.$refs.modal.edit(this.formTemplate, record.id)
        }
      },
      showLinkButton(item, record) {
        let btn = new ButtonExpHandler(item.exp, record)
        return btn.show
      },
      handleDetail(record) {
        if (this.isDesForm === 'Y') {
          this.$refs.desformModal.open('detail', this.desFormCode, record.id, '查看数据', true, this.code)
        } else {
          this.$refs.modal.detail(this.formTemplate, record.id)
        }
      },
      handleDeleteOne(record) {
        this.cgButtonLinkHandler(record, 'beforeDelete', 'js')
        this.handleDelete(record.id)
      },
      handleDelete(id) {
        deleteAction(this.url.optPre + this.code + '/' + id).then((res) => {
          if (res.success) {
            this.$message.success(res.message)
            this.loadData()
          } else {
            this.$message.warning(res.message)
          }
        })
      },
      async saveAndSubmitBPM(data) {
        data.id = data.id || data.dataId
        await this.startProcess(data, true)
        this.$refs.desformModal && this.$refs.desformModal.close()
      },
      handleFormSuccess() {
        this.loadData()
      },
      // 高级查询，如果为默认online表单，会自动触发加载，但是kForm下，需要手动加载
      initSuperQuery() {
        if (this.buttonSwitch.super_query && !this.isOnlineForm && this.code) {
          return new Promise((resolve) => {
            getAction(`${this.url.loadFormItems}${this.code}`).then((res) => {
              console.log('OnlCgformAutoList--加载高级查询条件：', res)
              if (res.success) {
                this.handleGetSchema(res.result.schema)
              } else {
                this.$message.error(res.message)
              }
              resolve()
            })
          })
        }
        return Promise.resolve()
      },
      // 查询完 schema 后，生成高级查询的字段列表
      handleGetSchema(schema) {
        if (schema && schema.properties) {
          let setField = (array, field) => {
            let type = field.view || (field.type || 'string')
            type = (type === 'inputNumber' ? 'number' : type)
            let params = {
              type: type,
              value: field.key,
              text: field.title,
              // 额外字典参数
              dictCode: field.dictCode,
              dictTable: field.dictTable,
              dictText: field.dictText,
              options: field.enum || field.options,
              order: field.order
            }
            // 处理popup
            if (type === 'popup') {
              params['popup'] = {
                code: field.popupCode || field.code,
                field: field.orgFields.split(',')[0],
                orgFields: field.orgFields.split(',')[0],
                destFields: field.destFields.split(',')[0]
              }
            }
            array.push(params)
          }
          let fieldList = []
          for (let key in schema.properties) {
            if (!schema.properties.hasOwnProperty(key)) {
              continue
            }
            let field = schema.properties[key]
            // tab = 子表 一对多
            if (field.view === 'tab' && field.relationType === 0) {
              let subTable = {
                type: 'sub-table',
                value: field.key,
                text: field.describe,
                children: []
              }
              if (field.columns) {
                for (let column of field.columns) {
                  setField(subTable.children, column)
                }
              }
              fieldList.push(subTable)
              // tab = 子表 一对一
            } else if (field.view === 'tab' && field.relationType === 1) {
              let subTable = {
                type: 'sub-table',
                value: field.key,
                text: field.describe,
                children: []
              }
              Object.keys(field.properties).map(k => {
                field.properties[k]['key'] = k
                setField(subTable.children, field.properties[k])
              })
              fieldList.push(subTable)
            } else {
              field.key = key
              setField(fieldList, field)
            }
          }
          // 冒泡排序
          for (let i = 0; i < fieldList.length; i++) {
            for (let j = i + 1; j < fieldList.length; j++) {
              let temp1 = fieldList[i]
              let temp2 = fieldList[j]
              if (temp1.order > temp2.order) {
                fieldList[i] = temp2
                fieldList[j] = temp1
              }
            }
          }
          this.superQuery.fieldList = fieldList
        }
      },
      onClearSelected() {
        this.table.selectedRowKeys = []
        this.table.selectionRows = []
      },
      getImgView(text) {
        if (text && text.indexOf(',') > 0) {
          text = text.substring(0, text.indexOf(','))
        }
        return getFileAccessHttpUrl(text)
      },
      downloadRowFile(text) {
        if (!text) {
          this.$message.warning('未知的文件')
          return
        }
        if (text.indexOf(',') > 0) {
          text = text.substring(0, text.indexOf(','))
        }
        let url = getFileAccessHttpUrl(text)
        window.open(url)// TODO 下载的方法
      },
      handleDelBatch() {
        if (this.table.selectedRowKeys.length <= 0) {
          this.$message.warning('请选择一条记录！')
          return false
        } else {
          let ids = ''
          let that = this
          that.table.selectedRowKeys.forEach(function(val) {
            ids += val + ','
          })
          that.$confirm({
            title: '确认删除',
            content: '是否删除选中数据?',
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk: function() {
              that.handleDelete(ids)
              that.onClearSelected()
            }
          })
        }
      },

      searchByquery() {
        this.loadData(1)
      },
      searchReset() {
        this.queryParam = { ...this.initQueryParam }
        this.loadData(1)
      },
      handleToggleSearch() {
        this.toggleSearchStatus = !this.toggleSearchStatus
      },
      getFormatDate(text) {
        if (!text) {
          return ''
        }
        let a = text
        if (a.length > 10) {
          a = a.substring(0, 10)
        }
        return a
      },
      getImportUrl() {
        return '/online/cgform/api/importXls/' + this.code
      },
      async initCgEnhanceJs(enhanceJs) {
        // console.log("--onlineList-js增强",enhanceJs)
        const that = this
        try {
          if (enhanceJs) {
            // FIXME 后端如果增强的类型是class对象，bind(this)后会改变指向，对老版本有影响
            // eslint-disable-next-line no-eval
            let Obj = eval(`(${enhanceJs})`)
            this.EnhanceJS = new Obj(getAction, postAction, deleteAction, that)
            await this.cgButtonJsHandler('created')
          } else {
            this.EnhanceJS = ''
          }
        } catch (e) {
          this.$message.error('js增强报错，请检查代码！')
          console.error('js增强报错，请检查代码！如果是多个方法请确保以逗号隔开！', e)
        }
      },
      initCgButtonList(btnList) {
        let linkArr = []
        let buttonArr = []
        if (btnList && btnList.length > 0) {
          for (let i = 0; i < btnList.length; i++) {
            let temp = btnList[i]
            if (temp.buttonStyle === 'button') {
              buttonArr.push(temp)
            } else if (temp.buttonStyle === 'link') {
              linkArr.push(temp)
            }
          }
        }
        this.cgButtonLinkList = [...linkArr]
        this.cgButtonList = [...buttonArr]
      },
      /**
       * 执行逻辑
       * js增强代码中有 created 的方法，会直接执行
       * 其余的代码，根据不同的 buttonCode 执行
       * @param buttonCode 方法名称
       */
      async cgButtonJsHandler(buttonCode) {
        // console.log('this.EnhanceJS', buttonCode, this.EnhanceJS, this.EnhanceJS[buttonCode])
        // console.log('this.EnhanceJS', typeof this.EnhanceJS[buttonCode] === 'function', typeof this.EnhanceJS[buttonCode])
        if (this.EnhanceJS[buttonCode]) {
          // this.EnhanceJS[buttonCode](this)
          const keys = this.table.selectedRowKeys
          const rows = this.table.selectionRows
          const row = (rows || [])[0]
          await this.EnhanceJS[buttonCode].bind(this)(row, keys, rows)
          // FIXME 后端如果增强的类型是class对象，bind(this)后会改变指向，对老版本有影响
          // this.EnhanceJS[buttonCode](row, keys, rows)
        }
      },
      cgButtonActionHandler(buttonCode) {
        // 处理自定义button的 需要配置该button自定义sql
        if (!this.table.selectedRowKeys || this.table.selectedRowKeys.length === 0) {
          this.$message.warning('请先选中一条记录')
          return false
        }
        if (this.table.selectedRowKeys.length > 1) {
          this.$message.warning('请只选中一条记录')
          return false
        }
        let params = {
          formId: this.code,
          buttonCode: buttonCode,
          dataId: this.table.selectedRowKeys[0]
        }
        console.log('自定义按钮请求后台参数：', params)
        postAction(this.url.buttonAction, params).then(res => {
          if (res.success) {
            this.loadData()
            this.$message.success('处理完成!')
          } else {
            this.$message.warning('处理失败!')
          }
        })
      },
      cgButtonLinkHandler(record, buttonCode, optType) {
        if (optType === 'js' || optType === 'js-confirm') {
          if (this.EnhanceJS[buttonCode]) {
            // this.EnhanceJS[buttonCode](this, record)
            const keys = this.table.selectedRowKeys
            const rows = this.table.selectionRows
            this.EnhanceJS[buttonCode].bind(this)(record, keys, rows)
          }
        } else if (optType === 'action') {
          let params = {
            formId: this.code,
            buttonCode: buttonCode,
            dataId: record.id
          }
          console.log('自定义按钮link请求后台参数：', params)
          postAction(this.url.buttonAction, params).then(res => {
            if (res.success) {
              this.loadData()
              this.$message.success('处理完成!')
            } else {
              this.$message.warning('处理失败!')
            }
          })
        }
      },
      initButtonSwitch(hideColumns) {
        Object.keys(this.buttonSwitch).forEach(key => {
          // 以disable为开头的默认取消禁止，其余按钮默认开放
          this.buttonSwitch[key] = !key.startsWith('disable')
        })
        if (hideColumns && hideColumns.length > 0) {
          Object.keys(this.buttonSwitch).forEach(key => {
            if (hideColumns.indexOf(key) >= 0) {
              this.buttonSwitch[key] = false
            }
          })
        }
      },

      // 高级查询
      handleSuperQuery(params, matchType) {
        if (!params || params.length === 0) {
          this.superQuery.params = ''
        } else {
          this.superQuery.params = JSON.stringify(params)
        }
        this.superQuery.matchType = matchType
        this.loadData(1)
      },

      settingColumnsHandler(columns) {
        let str = Vue.ls.get(this.localCode)
        if (!str || str.length === 0) {
          this.settingColumns = []
          columns.forEach(column => {
            if (this.settingColumns.indexOf(column['dataIndex']) < 0) {
              this.settingColumns.push(column['dataIndex'])
            }
          })
        } else {
          this.settingColumns = str.split(',')
        }
      },
      popVisibleChange(visible) {
        if (this.settingColumns && this.settingColumns.length > 0) {
          Vue.ls.set(this.localCode, this.settingColumns.join(','))
        }
      }

    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less';
</style>
<style scoped>
  .ant-card-body .table-operator{
    margin-bottom: 18px;
  }
  .ant-table-tbody .ant-table-row td{
    padding-top:15px;
    padding-bottom:15px;
  }
  .anty-row-operator button{margin: 0 5px}
  .ant-btn-danger{background-color: #ffffff}

  .anty-img-wrap{height:25px;position: relative;}
  .anty-img-wrap > img{max-height:100%;}
  .ant-modal-cust-warp{height: 100%}
  .ant-modal-cust-warp .ant-modal-body{height:calc(100% - 110px) !important;overflow-y: auto}
  .ant-modal-cust-warp .ant-modal-content{height:90% !important;overflow-y: hidden}
</style>
