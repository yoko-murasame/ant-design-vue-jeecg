<template>
  <div>
    <a-input
      :disabled="disabled"
      v-model="coordinates"
      placeholder="请选择定位"
      readOnly
      unselectable="on"
      @click="openModal"
    >
      <!-- <a-button slot="enterButton" :disabled="disabled"  @click="openModal">定位</a-button> -->
    </a-input>
    <!-- <a-input @click="openModal" placeholder="请点击选择定位" v-model="coordinates" readOnly :disabled="disabled">

      <a-icon slot="prefix" type="cluster" title="选择位置"/>
      <a-icon v-if="coordinates" slot="suffix" type="close-circle" @click="handleEmpty" title="清空"/>
    </a-input> -->

    <map-loction ref="mapModal" :modal-width="modalWidth" :location="coordinates" @ok="handleOK" :mapUrl="mapUrl"/>
  </div>
</template>

<script>
import mapLoction from './mapLoction'
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
  },
  data() {
    return {
      visible: false,
      confirmLoading: false,
      coordinates: '',
      mapUrl:""
    }
  },
  mounted() {
    this.coordinates = this.value
    this.mapUrl=this.record.options.mapUrl
    // console.log("mapUrl",this.mapUrl, this.coordinates, this.value)
  },

  methods: {
    formatCoordinates(coordinates, precision = 4) {
      const [longitude, latitude] = coordinates.split(",");
      const formattedLongitude = Number(longitude).toFixed(precision);
      const formattedLatitude = Number(latitude).toFixed(precision);
      return `${formattedLongitude},${formattedLatitude}`;
    },
    openModal() {
      this.$refs.mapModal.lnglatStr = this.value
      this.$refs.mapModal.show()
    },
    handleOK(rows, idstr) {
      this.coordinates = this.formatCoordinates(rows, this.precision)
      this.$emit('change', this.coordinates)
    },
    handleEmpty() {
      this.handleOK('')
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