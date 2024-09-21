import { FORM_TYPE_CODE, FORM_TYPE_DESIGNFORM, FORM_TYPE_ONLINE } from '@views/modules/bpm/task/TaskDealModal'

/**
 * 流程接入mixin-Form接入
 */
export default {
  data() {
    return {
    }
  },
  created() {
  },
  methods: {
    /**
     * 流程提交前，保存表单数据
     * @param formType 表单类型
     * @param buttonName 按钮名称
     * @returns {Promise<void>}
     */
    async saveFormBeforeBpmSubmit(formType, buttonName) {
      try {
        // online表单的保存
        if (formType === FORM_TYPE_ONLINE) {
          return await this.handleSubmit()
        }
        // kForm设计器表单的保存
        if (formType === FORM_TYPE_DESIGNFORM) {
          return await this.saveAllData(true, buttonName)
        }
        // 编码表单的保存
        if (formType === FORM_TYPE_CODE) {
          return await this.submitForm(2, buttonName)
        }
        console.warn('流程提交前，保存表单数据::不支持的表单类型，请检查')
      } catch (e) {
        return Promise.reject(e)
      }
    }
  }
}
