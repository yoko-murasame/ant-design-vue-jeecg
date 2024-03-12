<template>
  <a-modal title="预览" :visible="visible" @ok="handleGetData" @cancel="handleCancel" okText="获取数据" cancelText="关闭"
    style="top:20px;" :destroyOnClose="true" :centered="true" :dialogStyle="dialogStyle" :bodyStyle="bodyStyle"
    wrapClassName="k-form-modal" :width="`${previewWidth}px`">
    <k-form-build :value="jsonData" @change="handleChange" @submit="handleSubmit" ref="KFormBuild" />
    <jsonModel ref="jsonModel" />
  </a-modal>
</template>
<script>
/*
 * author kcz
 * date 2019-11-20
 */
import jsonModel from "../KFormDesign/module/jsonModal";
import { dialogStyle, bodyStyle } from "../../config/modal.js";
import { createAsyncJsEnhanceFunction } from '@/components/yoko/kform/CustomMethods'
export default {
  name: "KFormPreview",
  data() {
    return {
      visible: false,
      previewWidth: 850,
      jsonData: {},
      dialogStyle,
      bodyStyle
    };
  },
  components: {
    jsonModel
  },
  methods: {
    /**
     * 按钮触发提交
     * @param {*} p
     */
    handleSubmit(p) {
      p()
        .then(res => {
          console.log(res, "获取数据成功");
          this.$refs.jsonModel.jsonData = res;
          this.$refs.jsonModel.visible = true;
        })
        .catch(err => {
          console.error(err, "获取数据失败");
        });
    },
    /**
     * 手动验证获取表单数据
     */
    async handleGetData() {
      this.$refs.KFormBuild.getData()
        .then(res => {
          console.log(res, "获取数据成功");
          this.$refs.jsonModel.jsonData = res;
          this.$refs.jsonModel.visible = true;
        })
        .catch(err => {
          console.log(err, "获取数据失败");
        });
    },
    /**
     * 监听表单change 事件
     * @param {*} value
     * @param {*} key
     */
    handleChange(value, key) {
      console.log(value, key);
      const formData = this.$refs.KFormBuild.getData()
      formData[key]=value
      this.$refs.KFormBuild.setData(formData)

      // 判断是否有配置js
      const { config } = this.jsonData
      if (config.hasOwnProperty('afterDataChange')) {
        let afterDataChange = config.afterDataChange
        if (afterDataChange.hasOwnProperty(key)) {
          let funcStr = afterDataChange[key]
          return createAsyncJsEnhanceFunction(
            this,
            funcStr,
            ['data', 'getData', 'setData', 'setOptions',
              'hide', 'show', 'disable', 'enable', 'reset'],
            [this.$refs.KFormBuild.data, this.$refs.KFormBuild.getData, this.$refs.KFormBuild.setData, this.$refs.KFormBuild.setOptions,
            this.$refs.KFormBuild.hide, this.$refs.KFormBuild.show, this.$refs.KFormBuild.disable, this.$refs.KFormBuild.enable, this.$refs.KFormBuild.reset])
            .call()

        }

      }


    },
    handleCancel() {
      this.visible = false;
    }
  }
};
</script>
