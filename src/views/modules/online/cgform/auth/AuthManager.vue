<template>
  <a-drawer title="Online表单权限管理" :width="800" :visible="visible" @close="close()">
    <a-tabs v-model="activeKey">

      <a-tab-pane tab="字段权限" key="a" forceRender>
        <auth-column-config :head-id="headId"/>
      </a-tab-pane>
      <a-tab-pane tab="按钮权限" key="b" forceRender>
        <auth-button-config :head-id="headId"/>
      </a-tab-pane>
      <!-- 数据权限不需要实时刷新 故而此处传原表单ID -->
      <a-tab-pane tab="数据权限" key="c" forceRender>
        <auth-data-config :cgform-id="cgformId"></auth-data-config>
      </a-tab-pane>

    </a-tabs>
  </a-drawer>
</template>

<script>
  import AuthDataConfig from './manager/AuthDataConfig'
  import AuthButtonConfig from './manager/AuthButtonConfig'
  import AuthColumnConfig from './manager/AuthColumnConfig'

  export default {
    name: 'AuthManager',
    components: {
      AuthColumnConfig,
      AuthDataConfig,
      AuthButtonConfig
    },
    data() {
      return {
        visible: false,
        cgformId: '',
        headId: '',
        activeKey: 'a',
        bpmStatus: false

      }
    },
    methods: {
      close() {
        this.visible = false
      },
      show(cgformId) {
        this.cgformId = cgformId
        this.headId = cgformId + '?' + new Date().getTime()
        this.visible = true
        this.activeKey = 'a'
      }
    }
  }
</script>

<style scoped>

</style>
