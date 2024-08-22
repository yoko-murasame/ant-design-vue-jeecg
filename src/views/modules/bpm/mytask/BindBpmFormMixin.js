import { FORM_TYPE_ONLINE, FORM_TYPE_DESIGNFORM, FORM_TYPE_CODE } from '@views/modules/bpm/task/TaskDealModal'

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
     * @returns {Promise<void>}
     */
    async saveFormBeforeBpmSubmit(formType) {
      try {
        // online表单的保存
        if (formType === FORM_TYPE_ONLINE) {
          return await this.handleSubmit()
        }
        // kForm设计器表单的保存
        if (formType === FORM_TYPE_DESIGNFORM) {
          return await this.saveAllData()
        }
        // online表单的保存
        if (formType === FORM_TYPE_CODE) {
          return await this.submitForm()
        }
        console.warn('流程提交前，保存表单数据::不支持的表单类型，请检查')
      } catch (e) {
        return Promise.reject(e)
      }
    }
  }
}
