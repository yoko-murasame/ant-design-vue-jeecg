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
      title: '文件列表',
      visible: false,
      selectedIds: [],
      queryParam: {
        folderId: null,
        id: null
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
    show(folderId = '', ids = []) {
      this.selectedIds = [folderId]
      this.queryParam = {
        folderId: folderId,
        id: ids.join(',')
      }
      this.visible = true
    },
    handleCancel() {
      this.visible = false
      this.$emit('close')
    }
  }
}
</script>
