<template>
  <j-modal
    title="Online权限授权"
    :visible.sync="visible"
    :width="900"
    :maskClosable="false"
    fullscreen
    switch-fullscreen
    :okButtonProps="{style:{'display':'none'}}"
    cancelText="关闭"
    :confirmLoading="confirmLoading">
    <a-row>
      <a-col :span="12">
        <a-tabs>
          <a-tab-pane tab="角色授权" key="1" forceRender>
            <ls-role ref="roleRef" @select="onSelectRole"></ls-role>
          </a-tab-pane>
          <a-tab-pane tab="部门授权" key="2" forceRender>
            <ls-depart @select="onSelectDepart"></ls-depart>
          </a-tab-pane>
          <a-tab-pane tab="人员授权" key="3" forceRender>
            <ls-user></ls-user>
          </a-tab-pane>
        </a-tabs>
      </a-col>
      <a-col :span="1"></a-col>
      <a-col :span="11">
        <a-tabs v-model="activeKey" @change="authTabChange">
          <a-tab-pane tab="字段权限" key="a" forceRender>
            <auth-column-tree :ref="rightTreeRef['a']" :cgform-id="cgformId"></auth-column-tree>
          </a-tab-pane>

          <a-tab-pane tab="按钮权限" key="b" forceRender>
            <auth-button-tree :ref="rightTreeRef['b']" :cgform-id="cgformId"></auth-button-tree>
          </a-tab-pane>

          <a-tab-pane tab="数据权限" key="c" forceRender>
            <auth-data-tree :ref="rightTreeRef['c']" :cgform-id="cgformId"></auth-data-tree>
          </a-tab-pane>
        </a-tabs>
      </a-col>

    </a-row>
  </j-modal>
</template>

<script>
  import LsRole from './LsRole'
  import LsDepart from './LsDepart'
  import LsUser from './LsUser'

  import AuthDataTree from './setter/AuthDataTree'
  import AuthColumnTree from './setter/AuthColumnTree'
  import AuthButtonTree from './setter/AuthButtonTree'

  export default {
    name: 'AuthSetter',
    components: {
      LsRole,
      LsDepart,
      LsUser,
      AuthDataTree,
      AuthButtonTree,
      AuthColumnTree
    },
    data() {
      return {
        visible: false,
        cgformId: '',
        confirmLoading: false,
        activeKey: 'a',

        rightTreeRef: {
          a: 'fieldRef',
          b: 'buttonRef',
          c: 'dataref'
        },

        activeRole: ''
      }
    },
    methods: {
      show(cgformId) {
        if (this.cgformId && this.cgformId != cgformId) {
          this.reset();
        }
        this.cgformId = cgformId
        this.visible = true
        this.activeKey = 'a'
      },
      reset() {
        this.$nextTick(() => {
          this.$refs.roleRef.clearRow()
          let activeRef = this.rightTreeRef[this.activeKey]
          this.$refs[activeRef].clear();
        })
      },
      onSelectRole(roleId) {
        // 选中角色事件'
        this.activeRole = roleId
        this.authTabChange(this.activeKey)
      },
      onSelectDepart(departid) {
        console.log('选中的部门ID', departid)
      },
      authTabChange(value) {
        // 切换 右侧tab 如果当前选中角色信息需要加载tab内选中信息
        let activeRef = this.rightTreeRef[value]
        this.$nextTick(() => {
          if (this.activeRole) {
            this.$refs[activeRef].loadChecked(this.activeRole);
          }
        })
      }
    }
  }
</script>

<style scoped>

</style>
