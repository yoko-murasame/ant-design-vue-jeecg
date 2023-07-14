<template>
  <!-- <a-row type="flex" class="height:100%"> -->
  <!-- <a-col :span="6">
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
      <a-collapse>
        <a-collapse-panel
          v-for="(properties, sort) in componentProperty.properties"
          :key="sort"
          :header="properties.group"
        >
          <table>
            <tbody>
              <tr v-for="(r, i) in properties.items" :key="i">
                <th>{{ r.key }}:</th>
                <td>{{ r.value }}</td>
              </tr>
            </tbody>
          </table>
        </a-collapse-panel>
      </a-collapse>
    </a-col> -->
  <!-- <a-col :span="18"> -->
  <div id="domId" style="height:700px;overflow: hidden;"></div>
  <!-- </a-col> -->
  <!-- </a-row> -->
</template>

<script>
export default {
  data() {
    return {
      viewtoken: '',
      viewer3D: null,
      app: null,
      componentProperty: {
        boundingBox: {
          max: {
            x: 0,
            y: 0,
            z: 0
          },
          min: {
            x: 0,
            y: 0,
            z: 0
          }
        },
        elementId: '',
        familyGuid: '',
        guid: '',
        name: '',
        properties: [
          {
            group: '基本属性',
            items: [
              {
                key: 'specialty',
                value: ''
              },
              {
                key: 'floor',
                value: ''
              },
              {
                key: 'categoryId',
                value: ''
              },
              {
                key: 'categoryName',
                value: '场地'
              },
              {
                key: 'family',
                value: ''
              },
              {
                key: 'familyId',
                value: ''
              },
              {
                key: 'familyType',
                value: ''
              },
              {
                key: 'familyTypeId',
                value: ''
              },
              {
                key: 'systemType',
                value: ''
              },
              {
                key: 'building',
                value: ''
              }
            ]
          },
          {
            group: '约束',
            items: [
              {
                key: 'Offset from Host',
                unit: 'mm',
                value: '0',
                valueType: 2
              },
              {
                key: '与邻近图元一同移动',
                unit: '',
                value: '',
                valueType: 1
              },
              {
                key: '主体',
                unit: '',
                value: '',
                valueType: 3
              },
              {
                key: '标高',
                unit: '',
                value: '',
                valueType: 4
              }
            ]
          },
          {
            group: '标识数据',
            items: [
              {
                key: 'OmniClass 标题',
                unit: '',
                value: '',
                valueType: 3
              },
              {
                key: 'OmniClass 编号',
                unit: '',
                value: '',
                valueType: 3
              },
              {
                key: 'URL',
                unit: '',
                value: '',
                valueType: 3
              },
              {
                key: '产品合格证',
                unit: '',
                value: '',
                valueType: 3
              },
              {
                key: '产品类别',
                unit: '',
                value: '',
                valueType: 3
              },
              {
                key: '代码名称',
                unit: '',
                value: '',
                valueType: 3
              },
              {
                key: '制作',
                unit: '',
                value: '',
                valueType: 3
              },
              {
                key: '制造商',
                unit: '',
                value: '',
                valueType: 3
              },
              {
                key: '图像',
                unit: '',
                value: '',
                valueType: 4
              },
              {
                key: '工作集',
                unit: 'UST_NONE',
                value: '',
                valueType: 1
              },
              {
                key: '延长产品使用寿命方法',
                unit: '',
                value: '',
                valueType: 3
              },
              {
                key: '成本',
                unit: 'kr',
                value: '',
                valueType: 2
              },
              {
                key: '施工安装动画链接',
                unit: '',
                value: '',
                valueType: 3
              },
              {
                key: '标记',
                unit: '',
                value: '',
                valueType: 3
              },
              {
                key: '模型',
                unit: '',
                value: '',
                valueType: 3
              },
              {
                key: '注释',
                unit: '',
                value: '',
                valueType: 3
              },
              {
                key: '注释记号',
                unit: '',
                value: '',
                valueType: 3
              },
              {
                key: '版本号',
                unit: '',
                value: '',
                valueType: 3
              },
              {
                key: '类型名称',
                unit: '',
                value: '',
                valueType: 3
              },
              {
                key: '类型图像',
                unit: '',
                value: '',
                valueType: 4
              },
              {
                key: '类型标记',
                unit: '',
                value: '',
                valueType: 3
              },
              {
                key: '类型注释',
                unit: '',
                value: '',
                valueType: 3
              },
              {
                key: '编辑者',
                unit: '',
                value: '',
                valueType: 3
              },
              {
                key: '设计选项',
                unit: '',
                value: '',
                valueType: 4
              },
              {
                key: '说明',
                unit: '',
                value: '',
                valueType: 3
              },
              {
                key: '部件代码',
                unit: '',
                value: '',
                valueType: 3
              },
              {
                key: '部件说明',
                unit: '',
                value: '',
                valueType: 3
              }
            ]
          },
          {
            group: 'IFC 参数',
            items: [
              {
                key: 'PH',
                unit: '',
                value: '',
                valueType: 3
              }
            ]
          },
          {
            group: 'others',
            items: [
              {
                key: '主体 ID',
                unit: '',
                value: '',
                valueType: 4
              },
              {
                key: '族',
                unit: '',
                value: '',
                valueType: 4
              },
              {
                key: '族与类型',
                unit: '',
                value: '',
                valueType: 4
              },
              {
                key: '族名称',
                unit: '',
                value: '',
                valueType: 3
              },
              {
                key: '类别',
                unit: '',
                value: '',
                valueType: 4
              },
              {
                key: '类型',
                unit: '',
                value: '',
                valueType: 4
              },
              {
                key: '类型 ID',
                unit: '',
                value: '',
                valueType: 4
              }
            ]
          },
          {
            group: '文字',
            items: [
              {
                key: '产品使用寿命',
                unit: '',
                value: '',
                valueType: 3
              },
              {
                key: '供应商',
                unit: '',
                value: '',
                valueType: 3
              },
              {
                key: '供应商联系人',
                unit: '',
                value: '',
                valueType: 3
              },
              {
                key: '供应商联系方式',
                unit: '',
                value: '',
                valueType: 3
              },
              {
                key: '保修期',
                unit: '',
                value: '',
                valueType: 3
              },
              {
                key: '建造完成日期',
                unit: '',
                value: '',
                valueType: 3
              },
              {
                key: '建造开始日期',
                unit: '',
                value: '',
                valueType: 3
              },
              {
                key: '技术负责人',
                unit: '',
                value: '',
                valueType: 3
              },
              {
                key: '施工/安装要求',
                unit: '',
                value: '',
                valueType: 3
              },
              {
                key: '施工单位',
                unit: '',
                value: '',
                valueType: 3
              },
              {
                key: '施工变更',
                unit: '',
                value: '',
                valueType: 3
              },
              {
                key: '时间阶段',
                unit: '',
                value: '',
                valueType: 3
              },
              {
                key: '楼层标高',
                unit: '',
                value: '',
                valueType: 3
              },
              {
                key: '物业单位',
                unit: '',
                value: '',
                valueType: 3
              },
              {
                key: '物业联系方式',
                unit: '',
                value: '',
                valueType: 3
              },
              {
                key: '监理单位',
                unit: '',
                value: '',
                valueType: 3
              },
              {
                key: '维修单位地址',
                unit: '',
                value: '',
                valueType: 3
              },
              {
                key: '维修单位联系方式',
                unit: '',
                value: '',
                valueType: 3
              },
              {
                key: '联系方式',
                unit: '',
                value: '',
                valueType: 3
              },
              {
                key: '计量单位',
                unit: '',
                value: '',
                valueType: 3
              },
              {
                key: '设备负责人联系方式',
                unit: '',
                value: '',
                valueType: 3
              },
              {
                key: '项目特征',
                unit: '',
                value: '',
                valueType: 3
              }
            ]
          },
          {
            group: '常规',
            items: [
              {
                key: '产品名称',
                unit: '',
                value: '',
                valueType: 3
              },
              {
                key: '产品特征',
                unit: '',
                value: '',
                valueType: 3
              },
              {
                key: '价格',
                unit: '',
                value: '',
                valueType: 3
              },
              {
                key: '参考标准',
                unit: '',
                value: '',
                valueType: 3
              },
              {
                key: '生产厂家',
                unit: '',
                value: '',
                valueType: 3
              },
              {
                key: '生产日期',
                unit: '',
                value: '',
                valueType: 3
              },
              {
                key: '网站地址',
                unit: '',
                value: '',
                valueType: 3
              }
            ]
          },
          {
            group: '阶段化',
            items: [
              {
                key: '创建的阶段',
                unit: '',
                value: '',
                valueType: 4
              },
              {
                key: '拆除的阶段',
                unit: '',
                value: '',
                valueType: 4
              }
            ]
          },
          {
            group: '材质和装饰',
            items: [
              {
                key: '场地',
                unit: '',
                value: '',
                valueType: 4
              }
            ]
          }
        ]
      }
    }
  },
  computed: {},
  created() {},
  mounted() {},
  methods: {
    showMould(viewtoken) {
      if (viewtoken == '') {
        return
      }
      this.viewtoken = viewtoken
      var BimfaceLoaderConfig = new BimfaceSDKLoaderConfig()
      BimfaceLoaderConfig.viewToken = viewtoken
      BimfaceSDKLoader.load(BimfaceLoaderConfig, this.successCallback, this.failureCallback)
    },
    successCallback(viewMetaData) {
      // // 创建WebApplication，直接显示模型或图纸
      var dom4Show = document.getElementById('domId')
      new Glodon.Bimface.Application.WebApplicationDemo(viewMetaData, dom4Show)
    },
    onresize() {},
    // 加载失败回调函数
    failureCallback(error) {
      console.log(error)
    },
    // 点击监听获取
    getClickData(data) {
      this.componentProperty = data
      // 获取构件属性
      this.getComponentProperty(data.elementId)
    },
    // 获取构建信息
    getComponentProperty(id) {
      this.viewer3D.getComponentProperty(id, objectdata => {
        this.componentProperty = objectdata
      })
    }
  },
  watch: {}
}
</script>

<style></style>
