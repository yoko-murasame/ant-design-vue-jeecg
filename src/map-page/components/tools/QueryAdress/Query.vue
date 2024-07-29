<template>
  <div  class="queryable">
    <div>
      <div class="query-list">
        <a-input-search
          placeholder="地名地址查询"
          v-model="Address"
          @search="QueryAddress"
          allowClear>
        </a-input-search>
      </div>
    </div>
    <div v-if="Query_List.length>0"  class="list" infinite-scroll-distance="10">
      <div
        :class="liActive === index ? 'liActive li flex' : 'li flex'"
        @click="() => flyTo(item,index)"
        v-for="(item, index) in Query_List"
        :key="index"
      >
        <div class="content">
          <div class="title" :title="item.name">{{ index + 1 }}、{{ item.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import _ from 'lodash'
import { AddImage, AddPointLabel, AddPointServer, MapMove } from '@/map-page/configs/MapApi'
import { LngLatTramsfrom } from '@/map-page/configs/LngLatTramsform'

export default {
  name: 'Query',
  components: {
  },
  data() {
    return {
      Address: '',
      QueryValue: '',
      liActive: 0,
      Query_List: [],
      Total: 0,
      pageIndex: 1,
      pageSize: 10,
    }
  },
  watch: {
    Address(value) {
      // this.debouncedClick(value)
      this.QueryValue = value
      if (!value) {
        this.handleClear()
      }
    }
  },
  created() {
    this.debouncedClick = _.debounce(this.QueryAddress, 500)
  },
  methods: {
    QueryAddress(value) {
      this.Query_List = []
      if (value !== '') {
        this.AddressList(value)
      } else {
        this.ClearPoint('AddressPoint')
      }
    },
    AddressList(value) {
      const that = this
      if (that.Query_List.length === 0 || that.Query_List.length !== that.Total) {
        if (value) {
          that.pageIndex = 1
        } else {
          value = that.QueryValue
          that.pageIndex++
        }
        //异步加载 AutoComplete 插件  PlaceSearch
        window.AMap.plugin("AMap.PlaceSearch",  () =>{
          let autoOptions = {
            city: "温州",
            pageSize: that.pageSize, // 单页显示结果条数
            pageIndex: that.pageIndex , // 页码
          };
          //实例化AutoComplete
          let autoComplete = new window.AMap.PlaceSearch(autoOptions);
          //根据关键字进行搜索 keyword 为搜索的关键词
          autoComplete.search(value,  (status, result)=> {
            //搜索成功时，result 即是对应的匹配数据
            if(result.info==='OK'){
              let PointList = result.poiList
              if (PointList.count.length == 0) {
                that.Query_List = []
                that.Total = 0
                that.ClearPoint('AddressPoint')
              } else {
                if (that.pageIndex === 1) {
                  that.Query_List = PointList.pois
                } else {
                  that.Query_List = that.Query_List.concat(PointList.pois)
                }
                that.Total = PointList.count
                that.ClearPoint('AddressPoint')
                that.AddPoint()
              }
            } else {
              that.ClearPoint('AddressPoint')
              that.Query_List = []
              that.Total = 0
            }
          });
        });
      }
    },
    AddPoint() {
      if (this.Query_List.length > 0) {
        let AddressPoint = [];
        for (let k in this.Query_List) {
          let lngLat = LngLatTramsfrom( [
            Number(this.Query_List[k]['location'].lng),
            Number(this.Query_List[k]['location'].lat)
          ])
          AddressPoint.push({
            type: 'Feature',
            id: Number(k) + 1,
            geometry: {
              type: 'Point',
              coordinates:lngLat
            },
            properties: {
              SMID: Number(k) + 1,
              NAME: this.Query_List[k]['name'],
              LON: lngLat[0],
              LAT:  lngLat[1]
            }
          })
        }
        let features = {
          features: AddressPoint,
          type: 'FeatureCollection'
        }
        // 添加点图标
        AddImage('AddressPoint', 'LocationPoint.png')
        // 添加点
        AddPointServer(window.map, 'AddressPoint',features, '', 'AddressPoint', '');
        AddPointLabel(window.map,'AddressPoint',"{SMID}",[0,-0.3],'#FFFFFF')
      }
    },
    handleClear() {
      this.ClearPoint('AddressPoint')
      this.Query_List = []
      this.Total = 0
    },
    ClearPoint(LayerName) {
      if (window.map.getLayer(LayerName + "_layer")) {
        window.map.removeLayer(LayerName + "_layer");
      }
      if (window.map.getLayer(LayerName + "_LabelLayer")) {
        window.map.removeLayer(LayerName + "_LabelLayer");
      }
      if (window.map.getSource(LayerName + "_source")) {
        window.map.removeSource(LayerName + "_source");
      }
    },
    flyTo(item, index) {
      this.liActive = index
      let lngLat = LngLatTramsfrom( [
        Number(item.location.lng),
        Number(item.location.lat)
      ])
      MapMove(window.map, 16, lngLat)
    }
  }
}
</script>
<style lang="less" scoped>
@import './Query.less';
</style>
