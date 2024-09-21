<template>
  <a-drawer
    :title="title"
    :width="drawerWidth"
    @close="handleCancel"
    :visible="visible"
    :confirmLoading="confirmLoading"
  >
    <div :style="{ width: '100%', border: '1px solid #e9e9e9', padding: '10px 16px', background: '#fff' }">
      <a-spin :spinning="confirmLoading">
        <a-form-model ref="form" :model="model" :rules="validatorRules">
          <a-form-model-item :labelCol="labelCol" :wrapperCol="wrapperCol" prop="menuType" required label="菜单类型">
            <a-select placeholder="请输入菜单类型" v-model="model.menuType">
              <a-select-option value="project">项目</a-select-option>
              <a-select-option value="header">头部模块</a-select-option>
              <a-select-option value="module">目录模块</a-select-option>
              <a-select-option value="menu">目录</a-select-option>
              <a-select-option value="data">数据</a-select-option>
              <a-select-option value="assembly">组件</a-select-option>
            </a-select>
          </a-form-model-item>

          <a-form-model-item :labelCol="labelCol" :wrapperCol="wrapperCol" prop="code" required label="菜单编号">
            <a-input placeholder="请输入菜单编号" v-model="model.code" />
          </a-form-model-item>

          <a-form-model-item :labelCol="labelCol" :wrapperCol="wrapperCol" prop="name" required label="菜单名称">
            <a-input placeholder="请输入菜单名称" v-model="model.name" />
          </a-form-model-item>

          <a-form-model-item
            label="上级菜单"
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            :validate-status="validateStatus"
            :hasFeedback="true"
          >
            <span slot="help">{{ validateStatus == 'error' ? '请选择上级菜单' : '&nbsp;&nbsp;' }}</span>
            <a-tree-select
              style="width: 100%"
              :dropdownStyle="{ maxHeight: '200px', overflow: 'auto' }"
              :treeData="treeData"
              v-model="model.parentId"
              placeholder="请选择父级菜单"
              :disabled="disableSubmit"
              @change="handleParentIdChange"
            >
            </a-tree-select>
          </a-form-model-item>

          <a-form-model-item :labelCol="labelCol" :wrapperCol="wrapperCol" prop="sort" label="排序">
            <a-input-number
              placeholder="请输入菜单排序"
              v-model="model.sort"
              style="width: 200px"
              :readOnly="disableSubmit"
            />
          </a-form-model-item>

          <a-form-model-item :labelCol="labelCol" :wrapperCol="wrapperCol" prop="isDefaultOverlay" label="是否默认叠加">
            <a-switch
              placeholder="请选择是否默认叠加"
              v-model="model.isDefaultOverlay"
              :disabled="disableSubmit"
            />
          </a-form-model-item>

          <!--
          <a-form-model-item :labelCol="labelCol" :wrapperCol="wrapperCol" prop="bgImg" label="背景图">
            <a-input placeholder="请输入背景图" v-model="model.bgImg" />
          </a-form-model-item> -->

          <a-form-model-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            prop="assembly"
            required
            label="组件名称"
            v-if="model.menuType == 'assembly'"
          >
            <a-input placeholder="请输入组件名称" v-model="model.assembly" />
          </a-form-model-item>

          <a-form-model-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            prop="layerShowName"
            :required="false"
            label="图层展示名称"
            v-if="model.menuType === 'data'"
          >
            <a-input :disabled="disableSubmit" placeholder="请输入图层展示名称" v-model="model.layerShowName" />
          </a-form-model-item>

          <a-form-model-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            required
            label="数据类型"
            v-if="model.menuType==='data'">
            <a-select placeholder="请输入数据类型" v-model="model.dataType">
              <a-select-option value="iserver">iserver</a-select-option>
              <a-select-option value="api">api</a-select-option>
              <a-select-option value="sql">sql</a-select-option>
              <a-select-option value="json">json</a-select-option>
              <a-select-option value="onlineList">online列表</a-select-option>
            </a-select>
          </a-form-model-item>

          <template v-if="model.dataType === 'onlineList'">
            <a-form-model-item
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
              prop="onlineCode"
              required
              label="online列表code"
            >
              <j-search-select-tag
                placeholder="请选择表单"
                v-model="model.onlineCode"
                dict="onl_cgform_head,table_txt,id"
                triggerChange
              ></j-search-select-tag>
            </a-form-model-item>
            <a-form-model-item
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
              prop="onlineCondition"
              required
              label="online列表条件"
            >
              <a-textarea placeholder="请输入online列表条件" v-model="model.onlineCondition" />
            </a-form-model-item>
          </template>

          <a-form-model-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            prop="code"
            required
            label="显示方式"
            v-if="model.dataType === 'api' || model.dataType === 'json'"
          >
            <a-select placeholder="请输入显示方式" v-model="model.displayModal">
              <a-select-option value="list">列表</a-select-option>
              <a-select-option value="bargraph">柱状图</a-select-option>
              <a-select-option value="line">折线图</a-select-option>
              <a-select-option value="pie">饼图</a-select-option>
              <a-select-option value="block">块</a-select-option>
              <a-select-option value="block_detailed">块（明细）</a-select-option>
            </a-select>
          </a-form-model-item>

          <a-form-model-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            prop="type"
            label="服务类型"
            v-if="model.dataType === 'iserver'"
          >
            <a-select placeholder="请输入服务类型" v-model="model.type">
              <a-select-option value="scene">scene</a-select-option>
              <a-select-option value="xhr">xhr</a-select-option>
              <a-select-option value="mvt">mvt</a-select-option>
              <a-select-option value="data">data</a-select-option>
              <a-select-option value="s3m">s3m</a-select-option>
              <a-select-option value="map">map</a-select-option>
              <a-select-option value="dem">dem</a-select-option>
            </a-select>
            <!--          <a-input placeholder="请输入数据类型" v-model="model.type"/>-->
          </a-form-model-item>

          <a-form-model-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            prop="type"
            label="数据类型"
            v-if="model.dataType === 'iserver' && (model.type === 's3m' || model.type === 'data')"
          >
            <a-select placeholder="请输入数据类型" v-model="model.sceneType">
              <a-select-option value="倾斜摄影" v-if="model.type === 's3m'">倾斜摄影</a-select-option>
              <a-select-option value="bim" v-if="model.type === 's3m'">BIM</a-select-option>
              <a-select-option value="精模" v-if="model.type === 's3m'">精模</a-select-option>
              <a-select-option value="白模" v-if="model.type === 's3m'">白模</a-select-option>
              <a-select-option value="s3m矢量" v-if="model.type === 's3m'">s3m矢量</a-select-option>
              <a-select-option value="点" v-if="model.type === 'data'">点</a-select-option>
              <a-select-option value="线" v-if="model.type === 'data'">线</a-select-option>
              <a-select-option value="面" v-if="model.type === 'data'">面</a-select-option>
              <a-select-option value="三维点" v-if="model.type === 'data'">三维点</a-select-option>
              <a-select-option value="三维线" v-if="model.type === 'data'">三维线</a-select-option>
              <a-select-option value="三维面" v-if="model.type === 'data'">三维面</a-select-option>
              <a-select-option value="三维面" v-if="model.type === 'data'">三维面</a-select-option>
            </a-select>
          </a-form-model-item>

          <a-form-model-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            label="面镂空"
            v-if="model.sceneType === '面'"
          >
            <a-select placeholder="请输入线型" v-model="model.faceHollow" allowClear>
              <a-select-option value="是">镂空</a-select-option>
              <a-select-option value="否">不镂空</a-select-option>
            </a-select>
          </a-form-model-item>
          <a-form-model-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            label="面范围线"
            v-if="model.sceneType === '面'"
          >
            <a-select placeholder="请输入线型" v-model="model.faceLine" allowClear>
              <a-select-option value="是">显示</a-select-option>
              <a-select-option value="否">不显示</a-select-option>
            </a-select>
          </a-form-model-item>
          <a-form-model-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            label="线宽度"
            v-if="model.sceneType === '线' || (model.sceneType === '面'&&model.faceLine==='是')"
          >
            <a-input-number placeholder="" v-model="model.lineWidth" />
          </a-form-model-item>

          <a-form-model-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            label="线型"
            v-if="model.sceneType === '线' || (model.sceneType === '面'&&model.faceLine==='是')"
          >
            <a-select placeholder="请输入线型" v-model="model.lineType" allowClear>
              <a-select-option value="实线">实线</a-select-option>
              <a-select-option value="虚线">虚线</a-select-option>
            </a-select>
          </a-form-model-item>

          <a-form-model-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            label="颜色"
            v-if="model.sceneType === '线' || model.sceneType === '面'|| model.sceneType === '点'"
          >

            <ColorPicker v-model="model.sceneColor" />
          </a-form-model-item>

          <a-form-model-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            prop="functionType"
            label="功能类型"
            v-if="model.dataType === 'iserver' && (model.sceneType === '三维面' || model.sceneType === '面')"
          >
            <a-select placeholder="请输入数据类型" v-model="model.functionType" allowClear>
              <a-select-option value="flatten">压平</a-select-option>
              <a-select-option value="crop_inside">裁剪（内部）</a-select-option>
              <a-select-option value="crop_external">裁剪（外部）</a-select-option>
              <a-select-option value="superposition">叠加</a-select-option>
            </a-select>
          </a-form-model-item>

          <a-form-model-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            prop="serviceAddress"
            label="服务地址"
            v-if="model.dataType === 'iserver'"
          >
            <a-input placeholder="请输入服务地址" v-model="model.serviceAddress" />
          </a-form-model-item>

          <a-form-model-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            prop="datasource"
            label="数据源"
            v-if="model.dataType === 'api' || model.dataType === 'iserver' || model.dataType === 'json'"
          >
            <a-textarea placeholder="请输入数据源" v-model="model.datasource" />
          </a-form-model-item>

          <a-form-model-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            prop="dataset"
            label="数据集"
            v-if="model.dataType === 'iserver'"
          >
            <a-input placeholder="请输入数据集" v-model="model.dataset" />
          </a-form-model-item>
          <a-form-model-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            prop="dataAddress"
            label="属性数据地址"
            v-if="model.dataType === 'iserver'"
          >
            <a-input placeholder="属性数据地址" v-model="model.dataAddress" />
          </a-form-model-item>
          <a-form-model-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            prop="showSum"
            label="是否显示合计"
            v-if="model.dataType === 'api' || model.dataType === 'json'"
          >
            <a-input placeholder="请输入合计标题" v-model="model.showSum" />
          </a-form-model-item>
          <a-form-model-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            prop="displayLegend"
            label="图例显示模式"
            v-if="model.dataType === 'api' || model.dataType === 'json'"
          >

            <!-- <a-switch checked-children="显示" un-checked-children="隐藏" v-model="model.displayLegend" /> -->
            <a-select placeholder="图例显示模式" v-model="model.displayLegend">
              <a-select-option :value="0">不显示</a-select-option>
              <a-select-option :value="1">显示，不显示数量</a-select-option>
              <a-select-option :value="2">显示，并显示数量</a-select-option>
            </a-select>
          </a-form-model-item>
          <a-form-model-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            prop="stacked"
            label="是否堆积"
            v-if="(model.dataType === 'api' || model.dataType === 'json') && model.displayModal === 'bargraph'"
          >
            <a-switch checked-children="是" un-checked-children="否" v-model="model.stacked" />
          </a-form-model-item>
          <a-form-model-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            prop="hideHeader"
            label="是否隐藏表头"
            v-if="(model.dataType === 'api' || model.dataType === 'json') && model.displayModal === 'list'"
          >
            <a-switch checked-children="隐藏" un-checked-children="显示" v-model="model.hideHeader" />
          </a-form-model-item>
          <a-form-model-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            prop="sortIcon"
            label="是否显示排序图标"
            v-if="(model.dataType === 'api' || model.dataType === 'json') && model.displayModal === 'list'"
          >
            <a-switch checked-children="显示" un-checked-children="隐藏" v-model="model.sortIcon" />
          </a-form-model-item>

          <a-form-model-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            prop="showTitle"
            label="显示名称"
            v-if="(model.dataType === 'api' || model.dataType === 'json') && model.displayModal === 'list'"
          >
            <a-input placeholder="请输入显示名称" v-model="model.showTitle" />
          </a-form-model-item>

          <a-form-model-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            prop="showFiled"
            label="显示字段"
            v-if="(model.dataType === 'api' || model.dataType === 'json') && model.displayModal === 'list'"
          >
            <a-input placeholder="请输入显示字段" v-model="model.showFiled" />
          </a-form-model-item>

          <a-form-model-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            prop="colorArr"
            label="颜色组(RGB)"
            v-if="model.dataType === 'api' || model.dataType === 'json'"
          >
            <a-textarea placeholder="请输入颜色组(RGB)" v-model="model.colorArr" />
          </a-form-model-item>
          <a-form-model-item :labelCol="labelCol" :wrapperCol="wrapperCol" prop="queryCriteria" label="配置json">
            <a-textarea placeholder="请输入配置json" v-model="model.queryCriteria" />
          </a-form-model-item>
          <a-form-model-item :labelCol="labelCol" :wrapperCol="wrapperCol" prop="querySql" label="配置sql" v-if="model.dataType === 'iserver'">
            <a-textarea placeholder="请输入配置sql" v-model="model.querySql" />
          </a-form-model-item>
          <a-form-model-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            prop="minLevel"
            label="最小层级"
            v-if="model.dataType === 'iserver'"
          >
            <a-input-number placeholder="" v-model="model.minLevel" />
          </a-form-model-item>
          <a-form-model-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            prop="maxLevel"
            label="最大层级"
            v-if="model.dataType === 'iserver'"
          >
            <a-input-number placeholder="" v-model="model.maxLevel" />
          </a-form-model-item>

          <a-form-model-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            prop="chartHeight"
            label="图表高度"
            v-if="model.dataType === 'api' || model.dataType === 'json'"
          >
            <a-input placeholder="请输入图表高度" v-model="model.chartHeight" />
          </a-form-model-item>

          <a-form-model-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            prop="graphicalWidth"
            label="图形宽度"
            v-if="model.dataType === 'api' || model.dataType === 'json'"
          >
            <a-input-number placeholder="请输入图形宽度" v-model="model.graphicalWidth" />
          </a-form-model-item>

          <a-form-model-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            prop="rotate"
            label="文本旋转角度"
            v-if="
              (model.dataType === 'api' || model.dataType === 'json') &&
                (model.displayModal == 'bargraph' || model.displayModal == 'line')
            "
          >
            <a-input placeholder="请输入文本旋转角度" v-model="model.rotate" />
          </a-form-model-item>
          <a-form-model-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            prop="showLabel"
            label="是否显示标签"
            v-if="model.dataType === 'api' || model.dataType === 'json'"
          >
            <a-switch checked-children="是" un-checked-children="否" v-model="model.showLabel" />
          </a-form-model-item>
          <a-form-model-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            label="是否显示明细"
            v-if="model.dataType === 'iserver'"
          >
            <a-switch checked-children="显示" un-checked-children="隐藏" v-model="model.showChilden" />
          </a-form-model-item>
          <a-form-model-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            label="明细key"
            v-if="model.showChilden"
          >
            <a-input v-model="model.childenKey" />
          </a-form-model-item>
          <a-form-model-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            label="明细Title"
            v-if="model.showChilden"
          >
            <a-input v-model="model.childenTitle" />
          </a-form-model-item>

          <!-- <a-form-model-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            prop="withExtraData"
            label="额外数据"
            v-if="model.dataType === 'iserver'"
          >
            <a-input placeholder="请输入额外数据" v-model="model.withExtraData" />
          </a-form-model-item>
          <a-form-model-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            prop="typeJson"
            label="type涉及的配置"
            v-if="model.dataType === 'iserver'"
          >
            <a-textarea placeholder="请输入type涉及的配置" v-model="model.typeJson" autoSize />
          </a-form-model-item> -->

          <a-form-model-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            label="是否是临时图层"
            v-if="model.type === 'map'"
          >
            <a-switch checked-children="是" un-checked-children="否" v-model="model.isTempMap" />
          </a-form-model-item>

          <a-form-model-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            prop="visualAngleLon"
            label="视角经度"
            v-if="model.dataType === 'iserver'"
          >
            <a-textarea placeholder="请输入视角经度" v-model="model.visualAngleLon" autoSize />
          </a-form-model-item>
          <a-form-model-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            prop="visualAngleLat"
            label="视角纬度"
            v-if="model.dataType === 'iserver'"
          >
            <a-textarea placeholder="请输入视角纬度" v-model="model.visualAngleLat" autoSize />
          </a-form-model-item>
          <a-form-model-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            prop="visualAngleAltitude"
            label="视角高度"
            v-if="model.dataType === 'iserver'"
          >
            <a-textarea placeholder="请输入视角高度" v-model="model.visualAngleAltitude" autoSize />
          </a-form-model-item>
          <a-form-model-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            prop="visualAngleAzimuth"
            label="视角方位角"
            v-if="model.dataType === 'iserver'"
          >
            <a-textarea placeholder="请输入视角方位角" v-model="model.visualAngleAzimuth" autoSize />
          </a-form-model-item>
          <a-form-model-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            prop="visualAngleAngle"
            label="视角倾斜角度"
            v-if="model.dataType === 'iserver'"
          >
            <a-textarea placeholder="请输入视角倾斜角度" v-model="model.visualAngleAngle" autoSize />
          </a-form-model-item>

          <!-- <a-form-model-item :labelCol="labelCol" :wrapperCol="wrapperCol" prop="code" required label="排列方式">
            <a-select placeholder="请输入排列方式" v-model="model.arrangement">
              <a-select-option value="horizontal">横向</a-select-option>
              <a-select-option value="vertical">纵向</a-select-option>
            </a-select>
          </a-form-model-item> -->
          <a-form-model-item :labelCol="labelCol" :wrapperCol="wrapperCol" prop="code" required label="样式">
            <a-input placeholder="请输入样式" v-model="model.styleName" />
          </a-form-model-item>
          <a-form-model-item :labelCol="labelCol" :wrapperCol="wrapperCol" prop="code" required label="子级样式">
            <a-input placeholder="请输入子级样式" v-model="model.childStyleName" />
          </a-form-model-item>
          <a-form-model-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            prop="bottomType"
            required
            label="底部类型"
            v-if="model.menuType=='project'">
            <a-select placeholder="请输入底部类型" v-model="model.bottomType">
              <a-select-option value="left">左侧</a-select-option>
              <a-select-option value="bottom">底部</a-select-option>
            </a-select>
          </a-form-model-item>
          <a-form-model-item
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            prop="coordinate"
            required
            label="系统坐标系"
            v-if="model.menuType=='project'">
            <a-select placeholder="请输入系统坐标系" v-model="model.coordinate">
              <a-select-option value="国家2000">国家2000</a-select-option>
              <a-select-option value="温州2000">温州2000</a-select-option>
            </a-select>
          </a-form-model-item>
        </a-form-model>
      </a-spin>
      <a-row :style="{ textAlign: 'right' }">
        <a-button :style="{ marginRight: '8px' }" @click="handleCancel"> 关闭 </a-button>
        <a-button :disabled="disableSubmit" @click="handleOk" type="primary">确定</a-button>
      </a-row>
    </div>
  </a-drawer>
</template>

<script>
import { getResourceLayerTree, submitResourceLayer } from '@/api/business'
import { pluginManager } from '@/components/k-form-design/packages/utils/index'
const ColorPicker = pluginManager.getComponent('colorPicker').component

export default {
  name: 'ResourceLayerModel',
  data() {
    return {
      drawerWidth: 700,
      value: 1,
      title: '操作',
      visible: false,
      disableSubmit: false,
      model: {},
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      },
      confirmLoading: false,
      validateStatus: '',
      treeData: []
    }
  },
  components: {
    ColorPicker
  },
  computed: {
    validatorRules: function () {
      return {
        menuType: [{ required: true, message: '请输入菜单类型!' }],
        name: [{ required: true, message: '请输入菜单标题!' }],
        code: [{ required: true, message: '请输入菜单编号!' }],
        bottomType: [{ required: true, message: '请输入底部类型!' }],
        coordinate: [{ required: true, message: '请输入系统坐标系!' }]
      }
    }
  },
  created() {},
  methods: {
    loadTree() {
      var that = this
      getResourceLayerTree().then((res) => {
        if (res.success) {
          console.log(res)
          that.treeData = that.convertToTreeData(res.data)
        }
      })
    },
    convertToTreeData(data) {
      var returnData = []
      for (var i = 0; i < data.length; i++) {
        var tempObj = {
          title: data[i].name,
          value: data[i].id,
          key: data[i].id
        }
        if ('children' in data[i]) {
          tempObj.children = this.convertToTreeData(data[i].children)
        }
        returnData.push(tempObj)
      }
      return returnData
    },
    handleChange(value) {
      this.model.status = value
    },
    add() {
      this.edit({})
    },
    edit(record) {
      this.resetScreenSize()
      this.model = Object.assign({}, record)
      this.visible = true
      this.loadTree()
    },
    // 确定
    handleOk() {
      const that = this
      console.log(that.model.sceneColor)
      // 触发表单验证
      this.$refs.form.validate((valid) => {
        if (valid) {
          that.confirmLoading = true
          submitResourceLayer(this.model)
            .then((res) => {
              if (res.success) {
                that.$message.success(res.msg)
                that.$emit('ok')
              } else {
                that.$message.warning(res.msg)
              }
            })
            .finally(() => {
              that.confirmLoading = false
              that.close()
            })
        } else {
          return false
        }
      })
    },
    // 关闭
    handleCancel() {
      this.close()
    },
    close() {
      this.$emit('close')
      this.visible = false
      ;(this.disableSubmit = false), this.$refs.form.resetFields()
    },
    // 根据屏幕变化,设置抽屉尺寸
    resetScreenSize() {
      let screenWidth = document.body.clientWidth
      if (screenWidth < 500) {
        this.drawerWidth = screenWidth
      } else {
        this.drawerWidth = 700
      }
    },
    handleParentIdChange(value) {
      if (!value) {
        this.validateStatus = 'error'
      } else {
        this.validateStatus = 'success'
      }
    }
  }
}
</script>
