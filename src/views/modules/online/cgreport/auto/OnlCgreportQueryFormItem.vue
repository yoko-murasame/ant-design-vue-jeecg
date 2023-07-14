<template>
  <a-form-item v-if="item.view=='Date' || item.view=='date'" :label="item.label">
    <template v-if="single_mode===item.mode">
      <j-date :placeholder=" '请选择'+item.label " v-model="queryParam[item.field]"></j-date>
    </template>
    <div v-else>
      <j-date placeholder="开始日期" v-model="queryParam[item.field+'_begin']" :style="getRangeItemStyle(item)"></j-date>
      <span class="group-query-strig">~</span>
      <j-date placeholder="结束日期" v-model="queryParam[item.field+'_end']" :style="getRangeItemStyle(item)"></j-date>
    </div>
  </a-form-item>

  <a-form-item v-else-if="item.view=='Datetime' || item.view=='datetime'" :label="item.label">
    <template v-if="single_mode===item.mode">
      <j-date :placeholder=" '请选择'+item.label " :show-time="true" date-format="YYYY-MM-DD HH:mm:ss" v-model="queryParam[item.field]"></j-date>
    </template>
    <div v-else>
      <div>
        <j-date placeholder="开始时间" :show-time="true" date-format="YYYY-MM-DD HH:mm:ss" :style="getRangeItemStyle(item)" v-model="queryParam[item.field+'_begin']" ></j-date>
        <span class="group-query-strig">~</span>
        <j-date placeholder="开始时间" :show-time="true" date-format="YYYY-MM-DD HH:mm:ss" :style="getRangeItemStyle(item)" v-model="queryParam[item.field+'_end']"></j-date>
      </div>

    </div>
  </a-form-item>

  <a-form-item v-else-if=" item.view=='list' || item.view=='radio' " :label="item.label">
    <a-select :placeholder=" '请选择'+item.label " v-model="queryParam[item.field]">
      <a-select-option
        v-for="(op,opIndex) in dictOptions[item.field]"
        :key="opIndex"
        :value="op.value">
        {{ op.text }}
      </a-select-option>
    </a-select>
  </a-form-item>

  <a-form-item v-else-if=" item.view=='checkbox'" :label="item.label">
    <j-select-multiple :placeholder=" '请选择'+item.label " :options="dictOptions[item.field]" v-model="queryParam[item.field]"></j-select-multiple>
  </a-form-item>

  <a-form-item v-else :label="item.label">
    <div v-if="group_mode===item.mode">
      <a-input :placeholder=" '开始'+item.label " v-model="queryParam[item.field+'_begin']" :style="getRangeItemStyle(item)"></a-input>
      <span class="group-query-strig">~</span>
      <a-input :placeholder=" '结束'+item.label " v-model="queryParam[item.field+'_end']" :style="getRangeItemStyle(item)"></a-input>
    </div>
    <template v-else>
      <a-input :placeholder=" '请输入'+item.label " v-model="queryParam[item.field]"></a-input>
    </template>
  </a-form-item>

</template>

<script>
  import { mixinDevice } from '@/utils/mixin.js'

  export default {
    name: 'OnlineQueryFormItem',
    mixins: [mixinDevice],
    props: {
      item: {
        type: Object,
        default: () => {},
        required: true
      },
      dictOptions: {
        type: Object,
        default: () => {},
        required: true
      },
      queryParam: {
        type: Object,
        default: () => {},
        required: true
      }
    },
    components: {
    },
    data() {
      return {
        single_mode: 'single',
        group_mode: 'group'
      }
    },
    methods: {
      // 范围选择控件的style
      getRangeItemStyle(item) {
        let width = ''
        if (this.isMobile()) {
          width = '100% !important'
        } else {
          width = 'calc(50% - 10px) !important'
        }
        return {
          width: width,
          minWidth: width
        }
      }
    }
  }
</script>

<style>
  /* 解决移动端下，范围选择上下排列的输入框不能顶开高度的问题 */
  .j-jl-cgreport-query .ant-form-item-control {
    height: auto !important;
  }
</style>

<style scoped>
  .group-query-strig{

  }
</style>
