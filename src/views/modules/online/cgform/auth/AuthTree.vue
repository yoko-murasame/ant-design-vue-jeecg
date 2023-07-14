<template>
  <div>
    <a-tree
      v-model="checkedKeys"
      checkable
      :expanded-keys="expandedKeys"
      :auto-expand-parent="autoExpandParent"
      :selected-keys="selectedKeys"
      :tree-data="treeData"
      @expand="onExpand"
      @select="onSelect"
    />
  </div>
</template>

<script>
  const treeData = [
    {
      title: '0-0',
      key: '0-0',
      children: [
        {
          title: '0-0-0',
          key: '0-0-0',
          children: [
            { title: '0-0-0-0', key: '0-0-0-0' },
            { title: '0-0-0-1', key: '0-0-0-1' },
            { title: '0-0-0-2', key: '0-0-0-2' }
          ]
        },
        {
          title: '0-0-1',
          key: '0-0-1',
          children: [
            { title: '0-0-1-0', key: '0-0-1-0' },
            { title: '0-0-1-1', key: '0-0-1-1' },
            { title: '0-0-1-2', key: '0-0-1-2' }
          ]
        },
        {
          title: '0-0-2',
          key: '0-0-2'
        }
      ]
    },
    {
      title: '0-1',
      key: '0-1',
      children: [
        { title: '0-1-0-0', key: '0-1-0-0' },
        { title: '0-1-0-1', key: '0-1-0-1' },
        { title: '0-1-0-2', key: '0-1-0-2' }
      ]
    },
    {
      title: '0-2',
      key: '0-2'
    }
  ];

  const authlist = [
    { id: '1', code: 'name', type: 2, page: 3, control: 3, note: '名称' },
    { id: '2', code: 'name', type: 2, page: 5, control: 3, note: '名称' },
    { id: '3', code: 'name', type: 2, page: 5, control: 5, note: '名称' },
    { id: '4', code: 'name', type: 2, page: 3, control: 5, note: '名称' },

    { id: '5', code: 'age', type: 2, page: 3, control: 3, note: '年龄' },
    { id: '6', code: 'age', type: 2, page: 3, control: 5, note: '年龄' },

    { id: '7', code: 'sex', type: 2, page: 3, control: 5, note: '性别' },
    { id: '8', code: 'sex', type: 2, page: 5, control: 5, note: '性别' },
    { id: '9', code: 'sex', type: 2, page: 5, control: 3, note: '性别' },

    { id: '10', code: 'bir', type: 2, page: 3, control: 5, note: '生日' },
    { id: '11', code: 'bir', type: 2, page: 3, control: 3, note: '生日' }
  ]

  const fieldlist = [
    { code: 'name', note: '名称' },
    { code: 'age', note: '年龄' },
    { code: 'sex', note: '性别' },
    { code: 'bir', note: '生日' }
  ]

  const selectedls = [
    '2', '4', '6', '9', '10'
  ]
  export default {
    name: 'AuthTree',
    data() {
      return {
        expandedKeys: ['0-0-0', '0-0-1'],
        autoExpandParent: true,
        checkedKeys: ['0-0-0'],
        selectedKeys: [],
        treeData
      };
    },
    watch: {
      checkedKeys(val) {
        console.log('onCheck', val);
      }
    },
    created() {
      this.init()
    },
    methods: {
      init() {
        let tree = []
        // 加根
        for (let p of fieldlist) {
          let node = {
            key: p.code,
            title: p.note
          }
          let children = []
          // 加子
          for (let item of authlist) {
            if (item.code === p.code) {
              let temp = this.getTreeNodeTitle(item)
              children.push({
                key: p.id,
                title: temp
              })
            }
          }
          node.children = children
          tree.push(node)
        }
        this.treeData = tree
      },

      getTreeNodeTitle(item) {
        let arr = ''
        if (item.page == 3) {
          arr += '列表'
        } else if (item.page == 5) {
          arr += '表单'
        }
        if (item.control == 3) {
          arr += '隐藏'
        } else if (item.control == 5) {
          arr += '禁用'
        }
        return arr
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
      }
    }
  }
</script>

<style scoped>

</style>
