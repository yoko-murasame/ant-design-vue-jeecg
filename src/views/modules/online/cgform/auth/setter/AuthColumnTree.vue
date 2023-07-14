<template>
  <div>
    <div class="onl-auth-tree-btns">
      <a-button @click="onRefresh" size="small" type="primary" icon="redo" ghost>刷新</a-button>
      <a-button @click="onExpandAll" size="small" type="primary" icon="down-circle" ghost>展开</a-button>
      <a-button @click="onCloseAll" size="small" type="primary" icon="up-circle" ghost>折叠</a-button>
      <a-button @click="onSave" size="small" type="primary" icon="save" ghost>保存</a-button>
    </div>
    <a-empty v-if="empty" description="请先选中左侧角色/部门/用户"/>
    <a-empty v-else-if="treeData.length==0" description="无权限信息"/>
    <template v-else>
      <a-tree
        v-model="checkedKeys"
        checkable
        :expanded-keys="expandedKeys"
        :auto-expand-parent="autoExpandParent"
        :selected-keys="selectedKeys"
        :tree-data="treeData"
        @expand="onExpand"
        @select="onSelect"/>
    </template>

  </div>
</template>

<script>
  import { getAction, postAction } from '@api/manage'

  export default {
    name: 'AuthColumnTree',
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
        saveUrl: '/online/cgform/api/roleColumnAuth',
        authType: 1,
        empty: false,
        expandedKeys: [],
        autoExpandParent: true,
        checkedKeys: [],
        selectedKeys: [],
        treeData: [],
        allCode: []
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

    },
    methods: {
      loadTree() {
        this.empty = false
        getAction(`${this.url}/${this.cgformId}/${this.authType}`).then(res => {
          console.log('loadTree-column', res)
          if (res.success) {
            this.initTree(res.result)
          }
        })
      },
      initTree(result) {
        // 1.遍历第一次 根据code找一级节点
        let tree = []
        let allCode = []
        result.map(i => {
          if (allCode.indexOf(i.code) < 0) {
            allCode.push(i.code)
            tree.push({
              key: i.code,
              title: i.title
            })
          }
        });
        // 2.双重循环 拼树形数据
        for (let node of tree) {
          let children = []
          for (let item of result) {
            if (node.key === item.code) {
              let temp = this.getTreeNodeTitle(item)
              children.push({
                key: item.id,
                title: temp
              })
            }
          }
          node.children = children
        }
        console.log('当前树', tree)
        this.treeData = tree
        this.expandedKeys = [...allCode]
        this.allCode = [...allCode]
      },
      getTreeNodeTitle(item) {
        let arr = ''
        if (item.page == 3) {
          arr += '列表'
        } else if (item.page == 5) {
          arr += '表单'
        }
        if (item.control == 3) {
          arr += '可编辑'
        } else if (item.control == 5) {
          arr += '可见'
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

        let arr = this.checkedKeys.filter(i => {
          return this.allCode.indexOf(i) < 0
        })
        let param = {
          authId: JSON.stringify(arr)
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
