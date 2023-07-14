<template>
  <div>
    <a-tree
      autoExpandParent
      :treeData="departTree"
      @select="onSelect"
      :selectedKeys="selectedKeys"
      :expandedKeys="iExpandedKeys"
      @expand="onExpand"/>
  </div>
</template>

<script>
  import { queryDepartTreeList } from '@/api/api'

  export default {
    name: 'LsDepart',
    data() {
      return {
        departTree: [],
        selectedKeys: [],
        checkedKeys: [],
        iExpandedKeys: []
      }
    },
    created() {
      this.loadTree();
    },
    methods: {
      onSelect(selectedKeys, e) {
        console.log('selected', selectedKeys, e)
        let record = e.node.dataRef
        console.log('onSelect-record', record)
        this.selectedKeys = [record.key]
        this.$emit('select', record.id)
        /* this.currSelected = Object.assign({}, record)
        this.model.parentId = record.parentId */
      },
      onCheck(checkedKeys, info) {
        console.log('onCheck', checkedKeys, info)
        if (this.checkStrictly) {
          this.checkedKeys = checkedKeys.checked;
        } else {
          this.checkedKeys = checkedKeys
        }
      },
      onExpand(expandedKeys) {
        console.log('onExpand', expandedKeys)
        this.iExpandedKeys = expandedKeys
        this.autoExpandParent = false
      },
      loadTree() {
        this.departTree = []
        queryDepartTreeList().then((res) => {
          if (res.success) {
            for (let i = 0; i < res.result.length; i++) {
              let temp = res.result[i]
              this.departTree.push(temp)
            }
          }
        })
      }

    }

  }
</script>
