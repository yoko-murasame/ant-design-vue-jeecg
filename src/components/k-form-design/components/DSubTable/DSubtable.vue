<template>
  <div>
    <a-form-model ref="dynamicValidateForm" layout="inline" :model="dynamicValidateForm">
      <Button type="dashed" :disabled="disabled" @click="addDomain">
        <a-icon type="plus"/>
        增加
      </Button>
      <a-table class="batch-table" :pagination="false" :rowKey="record => record.key" :columns="columns"
               :dataSource="dynamicValidateForm.domains" bordered :scroll="{
          x: listLength * 190 + 80 + (!record.options.hideSequence ? 60 : 0),
          y: record.options.scrollY
        }">
        <template slot="dynamic-opr-button" slot-scope="text, row">
          <div style="witdh:130px">
            <a-icon title="详情" type="copy-o" class="dynamic-opr-button" @click="info(row)"/>
            <!-- <a-icon title="复制添加" v-if="!disabled" type="copy-o" class="dynamic-opr-button" @click="copyDomain(row)" /> -->
            <a-icon title="删除该行" v-if="!disabled &&
              record.options.minLimit < dynamicValidateForm.domains.length
              " class="dynamic-opr-button" type="minus-circle-o" @click="removeDomain(row)"/>
          </div>
        </template>
        <template slot="imgSlot" slot-scope="text">
          <j-image-upload
            :disabled="true"
            :value="text"
            :button-visible="false"
            :visible-width="'auto'"
            :visible-number="1"
            url-suffix="">
          </j-image-upload>
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
      </a-table>
    </a-form-model>

    <a-modal v-model="formShowStatus" @ok="handleOk" :maskClosable="false" forceRender>
      <j-form-container v-if="formShowStatus" :disabled="disabled">
        <k-form-build
          :value="formDataJson"
          @change="undefined && handleChange"
          ref="KFormBuild"
          :form-data="currData"
          slot="detail"/>
      </j-form-container>
    </a-modal>
  </div>
</template>

<script>
import { getAction, getFileAccessHttpUrl } from '@/api/manage'
import KFormModelItem from "../../packages/components/KFormModelItem/KFormModelItem";
import { pluginManager, getUUID } from "../../packages/utils/index";
import moment from 'moment'

const Button = pluginManager.getComponent("aButton").component;

export default {
  name: "KBatch",
  // mode:add = 新增，edit = 修改，detail = 只读查看
  props: ["record", "value", "dynamicData", "config", "parentDisabled", "mode"],

  components: {
    KFormModelItem,
    Button
  },
  watch: {
    value: {
      // value 需要深度监听及默认先执行handler函数
      handler(val) {
        console.log("value", val)
        this.dynamicValidateForm.domains = val || [];
      },
      immediate: true,
      deep: true
    }
  },
  data() {
    return {
      dynamicValidateForm: {
        domains: []
      },
      formShowStatus: false,
      desformCode: "",
      formDataJson: {},
      url: {
        // add: '/desform/data/add',
        add: "/online/cgform/api/form",
        // edit: '/desform/data/edit',
        edit: "/online/cgform/api/form",
        online: '/online/cgform/api/crazyForm',
        json: '/desform/queryByCode',
        getFormData: "/online/cgform/api/form/table_name/"
      },
      currData: {}
    };
  },
  computed: {
    listLength() {
      return this.record.list.filter(item => !item.options.hidden).length;
    },
    columns() {
      const columns = [];
      if (!this.record.options.hideSequence) {
        columns.push({
          title: "序号",
          dataIndex: "sequence_index_number",
          width: "60px",
          align: "center",
          customRender: (text, record, index) => {
            return index + 1;
          }
        });
      }

      columns.push(
        ...this.record.options.showFileds[this.record.model]
        // .filter(item => !item.options.hidden)
        .map((item, index) => {
          // if (!this.disabled) {
          //   return {
          //     title: item.label,
          //     dataIndex: item.key,
          //     width: index === this.record.list.length - 1 ? "" : "190px",
          //     scopedSlots: { customRender: item.key }
          //   };
          // } else {
          let targetColumn = {}
          if (~item.code.indexOf('picture') || ~item.code.indexOf('image') || ~item.code.indexOf('img') || ~item.code.indexOf('photo') || ~item.code.indexOf('avatar')) {
            targetColumn = {
              title: item.title,
              dataIndex: item.code,
              scopedSlots: { customRender: 'imgSlot' }
            };
          }

          if (~item.code.indexOf('file') || ~item.code.indexOf('fujian') || ~item.code.indexOf('_fj') || ~item.code.indexOf('fj_')) {
            targetColumn = {
              title: item.title,
              dataIndex: item.code,
              scopedSlots: { customRender: 'fileSlot' }
            };
          }

          targetColumn = {
            title: item.title,
            dataIndex: item.code,
            width: index === this.record.list.length - 1 ? "" : "190px"
          };
          console.log("添加列表", item)

          // todo 暂时给叫日期的添加排序
          if (~item.title.indexOf('日期') || ~item.title.indexOf('时间')) {
            // 日期排序、数值排序、字符串排序
            targetColumn.sorter = (a, b) => {
              const va = a[item.code]
              const vb = b[item.code]
              if (!va || !vb) {
                return -1
              }
              try { return moment(va).isBefore(moment(vb))} catch (e) {
                try { return parseInt(va) - parseInt(vb)} catch (e) {
                  try { return va.localeCompare(vb)} catch (e) {
                    return -1
                  }
                }
              }
            }
            // 指定排序顺序、默认顺序
            targetColumn.sortDirections = ['descend', 'ascend']
            targetColumn.defaultSortOrder = 'descend'
            // 格式化日期
            targetColumn.customRender = (text, record, index) => {
              text = text && (text + '') || ''
              return !text ? '' : (text.length > 10 ? text.substr(0, 10) : text)
            }
          }

          return targetColumn
        })
      );

      columns.push({
        title: "操作",
        dataIndex: "dynamic-opr-button",
        // fixed: "right",
        width: "80px",
        align: "center",
        scopedSlots: { customRender: "dynamic-opr-button" }
      });
      return columns;
    },
    disabled() {
      return this.record.options.disabled || this.parentDisabled;
    }

  },
  methods: {
    downloadRowFile(text) {
      if (!text) {
        this.$message.warning('未知的文件')
        return;
      }
      if (text.indexOf(',') > 0) {
        text = text.substring(0, text.indexOf(','))
      }
      let url = getFileAccessHttpUrl(text);
      window.open(url);// TODO 下载的方法
    },
    init() {
      console.log("this.$parent", this.$parent)
      if (this.desformCode) {
        // 获取json
        var params = { desformCode: this.desformCode };// 查询条件
        getAction(this.url.json, params)
        .then(res => {
          this.formDataJson = JSON.parse(res.result.desformDesignJson)
        })
        // // 添加子表字段
        // this.getTableFileds(desformCode)
      }
    },
    // // 获取子表列名，并生成控件
    // async getTableFileds(value){
    //   this.$set(this.config, 'subtableCode', value)
    //   const { result } = await getAction('/online/cgform/field/listByHeadCode', { headCode: value })
    //   this.$emit('change', result,value)
    // },
    validationSubform() {
      let verification;
      this.$refs.dynamicValidateForm.validate(valid => {
        verification = valid;
      });
      return verification;
    },
    resetForm() {
      this.$refs.dynamicValidateForm.resetFields();
    },
    removeDomain(item) {
      const index = this.dynamicValidateForm.domains.indexOf(item);
      if (index !== -1) {
        this.dynamicValidateForm.domains.splice(index, 1);
      }
    },
    copyDomain(record) {
      this.dynamicValidateForm.domains.push({
        ...record,
        key: getUUID()
      });
      this.handleInput();
    },
    addDomain() {
      const data = {};
      this.record.list.forEach(item => {
        data[item.model] = item.options.defaultValue;
      });

      this.dynamicValidateForm.domains.push({
        ...data,
        key: getUUID()
      });
      this.handleInput();
    },
    handleInput() {
      this.$emit("change", this.dynamicValidateForm.domains);
    },
    info(record) {
      this.formShowStatus = true
      this.cloneAndBindData(record)
    },
    cloneAndBindData(record) {
      console.log("this.dynamicValidateForm.domains", this.dynamicValidateForm.domains)
      this.currData = {}
      if (record.id !== undefined) {
        this.currData = this.dynamicValidateForm.domains.filter(item => record.id === item.id)[0];
      } else {
        this.currData = this.dynamicValidateForm.domains.filter(item => record.key === item.key)[0];
      }
      this.currData = this.currData || {}
      // setTimeout(() => {
      // this.$refs.KFormBuild.setData(this.currData)
      // }, 200);
    },
    // 子表数据发生变更，以对象形式向上传递，子表数据必须是数组格式
    // async handleChange(value, key) {
    //   this.currData[key] = value
    // },
    async handleOk() {
      // 校验子表表单
      try {
        const newData = await this.$refs.KFormBuild.getData()
        console.log('handleOk', newData)
        Object.assign(this.currData, newData)
        this.$emit('change', this.dynamicValidateForm.domains)
        this.formShowStatus = false
      } catch (e) {
        console.error('子表校验未通过', e)
      }
    }
  },
  created() {
    // 判断是否有最小行限度
    if (this.record.options.minLimit) {
      // 初始化最小行
      for (let i = 0; i < this.record.options.minLimit; i++) {
        this.addDomain();
      }
      // 初始化子表表单
      this.desformCode = this.record.model
      this.init()
    }
  }
};
</script>
