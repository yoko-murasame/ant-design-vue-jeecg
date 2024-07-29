<template>
  <div>
    <a-input
      :disabled="disabled"
      v-model="coordinates"
      placeholder="请选择定位"
      readOnly
      unselectable="on"
      @click="openModal"
    />
    <map-loction
      ref="mapModal"
      :modal-width="modalWidth"
      :mapUrl="mapUrl"
      :mode="mode"
      :lnglatSplitChar="lnglatSplitChar"
      :lnglatArrSplitChar="lnglatArrSplitChar"
      @ok="handleOK"
      />
  </div>
</template>

<script>
import mapLoction, { MODE_LINE, MODE_POINT, MODE_POLYGON } from './mapLoction'

export default {
  components: {
    mapLoction,
  },
  props: {
    modalWidth: {
      type: Number,
      default: 1000,
      required: false,
    },
    // 保留精度
    precision: {
      type: Number,
      default: 4,
      required: false,
    },
    record: {
      type: Object,
      required: true
    },
    value: {
      type: String,
      required: false,
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    /**
     * 地图应用地址（额外服务单独部署）
     */
    mapUrl: {
      type: String,
      required: false,
      default: '',
    },
    /**
     * 选择模式 point/line/polygon 点线面
     */
    mode: {
      type: String,
      required: false,
      default: MODE_POINT,
    },
    /**
     * 经纬度之间的分隔符，默认逗号
     */
    lnglatSplitChar: {
      type: String,
      required: false,
      default: ',',
    },
    /**
     * 多组经纬度间的分隔符，默认分号
     */
    lnglatArrSplitChar: {
      type: String,
      required: false,
      default: ';',
    },
  },
  data() {
    return {
      visible: false,
      confirmLoading: false,
      coordinates: ''
    }
  },
  created() {
    this.coordinates = this.value
  },
  methods: {
    /**
     * 获取正确的经纬度值
     * @param val 原值，接受点线面的结果字符串
     * @param format 是否格式化坐标精度
     * @returns {string}
     */
    getCorrectValue(val, format = false) {
      if (!val) {
        return ''
      }
      const coords = val.split(this.lnglatArrSplitChar).map(e => format ? this.formatCoordinates(e, this.precision) : e)
      switch (this.mode) {
        case MODE_POINT:
          return coords[0]
        case MODE_LINE:
          return coords.join(this.lnglatArrSplitChar)
        case MODE_POLYGON:
          return coords.join(this.lnglatArrSplitChar)
        default:
          console.warn('地图选择组件::不支持的模式: ', this.mode)
          return val
      }
    },
    /**
     * 格式化经纬度到指定精度
     * @param coordinates 经纬度字符串坐标
     * @param precision 精度
     * @returns {string}
     */
    formatCoordinates(coordinates, precision = 4) {
      const [longitude, latitude] = coordinates.split(this.lnglatSplitChar);
      const formattedLongitude = Number(longitude).toFixed(precision);
      const formattedLatitude = Number(latitude).toFixed(precision);
      return `${formattedLongitude}${this.lnglatSplitChar}${formattedLatitude}`;
    },
    /**
     * 打开地图选择模态框
     */
    openModal() {
      this.$refs.mapModal.lnglatStr = this.getCorrectValue(this.value)
      this.$refs.mapModal.show()
    },
    /**
     * 选择回调
     * @param result
     */
    handleOK(result) {
      this.coordinates = this.getCorrectValue(result, true)
      this.$emit('change', this.coordinates)
    },
  },
  model: {
    prop: 'value',
    event: 'change',
  },
  watch: {
    value() {
      this.coordinates = this.value
    },
  },
}
</script>

<style scoped>
.components-input-demo-presuffix .anticon-close-circle {
  cursor: pointer;
  color: #ccc;
  transition: color 0.3s;
  font-size: 12px;
}
.components-input-demo-presuffix .anticon-close-circle:hover {
  color: #f5222d;
}
.components-input-demo-presuffix .anticon-close-circle:active {
  color: #666;
}
</style>