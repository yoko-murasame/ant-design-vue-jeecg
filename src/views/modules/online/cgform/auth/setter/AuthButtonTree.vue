<template>
  <div>
    <div class="onl-auth-tree-btns">
      <a-button @click="onRefresh" size="small" type="primary" icon="redo" ghost>刷新</a-button>
      <a-button @click="onSave" size="small" type="primary" icon="save" ghost>保存</a-button>
    </div>
    <a-empty v-if="empty" description="请先选中左侧角色/部门/用户"/>
    <a-empty v-else-if="treeData.length==0" description="无权限信息"/>
    <a-tree
      v-else
      v-model="checkedKeys"
      checkable
      :expanded-keys="expandedKeys"
      :auto-expand-parent="autoExpandParent"
      :selected-keys="selectedKeys"
      :tree-data="treeData"
      @expand="onExpand"
      @select="onSelect"/>
  </div>
</template>

<script>
  import { getAction, postAction } from '@api/manage'
  import { fixedButton } from '@views/modules/online/cgform/auth/manager/AuthButtonConfig'

  export default {
    name: 'AuthButtonTree',
    props: {
      cgformId: {
        type: String,
        default: '',
        required: true
      }
    },
    data() {
      return {
        roleId: '',
        url: '/online/cgform/api/authPage',
        roleAuthUrl: '/online/cgform/api/roleAuth',
        saveUrl: '/online/cgform/api/roleButtonAuth',
        authType: 2,
        empty: false,
        expandedKeys: [],
        autoExpandParent: true,
        checkedKeys: [],
        selectedKeys: [],
        treeData: []
      };
    },
    watch: {
      cgformId: {
        immediate: true,
        handler() {
          this.loadTree();
        }
      }
    },
    created() {
      this.checkedKeys = []
      this.selectedKeys = []
      this.treeData = []
      this.expandedKeys = []
    },
    methods: {
      loadTree() {
        this.empty = false
        getAction(`${this.url}/${this.cgformId}/${this.authType}`).then(res => {
          console.log('loadTree-button', res)
          if (res.success) {
            this.initTree(res.result)
          }
        })
      },
      initTree(result) {
        // 1.遍历第一次 根据code设置默认按钮名称
        let tree = []
        result.map(item => {
          for (let i = 0; i < fixedButton.length; i++) {
            if (item.code == fixedButton[i].code) {
              item['title'] = fixedButton[i].title
              break;
            }
          }
        });
        // 2.拼树形数据
        for (let item of result) {
          let temp = this.getTreeNodeTitle(item)
          tree.push({
            key: item.id,
            title: temp
          })
        }
        console.log('当前树', tree)
        this.treeData = tree
      },
      getTreeNodeTitle(item) {
        let arr = item.title + '-'
        if (item.page == 3) {
          arr += '列表可见'
        } else if (item.page == 5) {
          arr += '表单可见'
        }
        return arr
      },

      loadChecked(roleId) {
        this.roleId = roleId
        let param = {
          roleId: roleId,
          cgformId: this.cgformId,
          type: this.authType
        }
        this.checkedKeys = []
        getAction(this.roleAuthUrl, param).then(res => {
          if (res.success) {
            let arr = []
            for (let k of res.result) {
              arr.push(k.authId)
            }
            this.checkedKeys = [...arr]
          } else {
            this.$message.warning(res.message)
          }
        })
      },
      onRefresh() {
        this.loadTree()
      },
      onSave() {
        if (!this.roleId) {
          this.$message.warning('请先选中左侧角色')
          return;
        }
        let param = {
          authId: JSON.stringify(this.checkedKeys)
        }
        postAction(`${this.saveUrl}/${this.roleId}/${this.cgformId}`, param).then(res => {
          if (res.success) {
            this.$message.success('保存成功')
          } else {
            this.$message.warning(res.message)
          }
        })
      },
      onExpandAll() {
        this.expandedKeys = [...this.allCode]
      },
      onCloseAll() {
        this.expandedKeys = []
      },
      onExpand(expandedKeys) {
        console.log('onExpand', expandedKeys);
        // if not set autoExpandParent to false, if children expanded, parent can not collapse.
        // or, you can remove all expanded children keys.
        this.expandedKeys = expandedKeys;
        this.autoExpandParent = false;
      },
      onCheck(checkedKeys) {
        console.log('onCheck', checkedKeys);
        this.checkedKeys = checkedKeys;
      },
      onSelect(selectedKeys, info) {
        console.log('onSelect', info);
        this.selectedKeys = selectedKeys;
      },
      clear() {
        this.roleId = ''
        this.checkedKeys = []
      }

    }
  }
</script>

<style>
  .onl-auth-tree-btns{
    margin-left:10px
  }
  .onl-auth-tree-btns button{
    margin: 0 5px 0 2px ;
  }
</style>
