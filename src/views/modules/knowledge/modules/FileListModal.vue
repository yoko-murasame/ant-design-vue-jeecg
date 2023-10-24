<template>
  <a-modal
    :title="title"
    :width="modalWidth"
    @ok="() => {}"
    @cancel="handleCancel"
    :ok-button-props="{ props: { disabled: true } }"
    :cancel-button-props="{ props: { disabled: false } }"
    :visible="visible"
    :confirmLoading="false"
  >
    <div :style="{ width: '100%', background: '#fff' }">
      <a-spin :spinning="false">
        <file-list ref="fileList" v-if="visible" :selected-ids="selectedIds" :search-params="queryParam"></file-list>
      </a-spin>
    </div>
  </a-modal>
</template>

<script>
import FileList from '@views/modules/knowledge/modules/FileList.vue'

export default {
  name: 'FileModal',
  components: { FileList},
  props: {},
  data() {
    return {
      modalWidth: 1000,
      title: '知识库列表',
      visible: false,
      selectedIds: [],
      queryParam: {
        folderId: null,
        ids: null,
        name: null,
        names: null
      }
    }
  },
  computed: {
  },
  created() {
  },
  mounted() {
  },
  methods: {
    show(param = { folderId: '' }) {
      this.selectedIds = [param.folderId]
      this.queryParam = { ...param }
      this.visible = true
    },
    handleCancel() {
      this.visible = false
      this.$emit('close')
    }
  }
}
</script>
