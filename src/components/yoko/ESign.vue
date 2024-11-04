<template>
  <div class="signer">
    <a-modal
      v-model="visible"
      title="签名"
      @ok="handleOk"
      @cancel="handleCancel"
      :width="600"
      :maskClosable="false">
      <div class="esign">
        <div class="esign-box">
          <vue-esign
            class="sign1"
            ref="esign"
            :width="800"
            :height="300"
            :isCrop="isCrop"
            :lineWidth="lineWidth"
            :lineColor="lineColor"
            :bgColor.sync="bgColor"
          />
        </div>
        <div class="esigh-btns">
          <a-button @click="handleReset">清空画板</a-button>
          <!-- <a-button @click="handleGenerate">生成图片</a-button> -->
        </div>
        <!-- <div class="esigh-result">
          <img v-if="resultImg" :src="resultImg" alt="" />
        </div> -->
      </div>
    </a-modal>
    <!-- <a-input :placeholder="placeholder" :value="resultImg" ref="singInput" @change="handleChange"></a-input> -->
    <img
      v-if="resultImg"
      @click="!disabled && (visible = true)"
      class="resultImg"
      :src="resultImg"
      :alt="title"
      :title="title" />
    <a-button :disabled="disabled" v-if="!resultImg" @click="confirmSign" style="display:inline-block;">签名</a-button>
  </div>
</template>

<script>
/**
 * 更新日志 2022-03-05
 * 根据当前用户的真实姓名，读取图片转换成签名
 */
import vueEsign from 'vue-esign'

export default {
  name: 'ESign',
  components: {
    vueEsign
  },
  props: {
    value: {
      type: String,
      required: false
    },
    placeholder: {
      type: String,
      required: false,
      default: ''
    },
    disabled: {
      type: [Boolean, String],
      required: false,
      default: false
    },
    existPath: {
      type: String,
      required: false,
      default: '/esign/'
    }
  },
  watch: {
    value: {
      immediate: true,
      handler: function(e) {
        this.resultImg = e || ''
      }
    }
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  data() {
    return {
      visible: false,
      lineWidth: 4,
      lineColor: '#000000',
      bgColor: '',
      resultImg: '',
      isCrop: true,
      borders: '1px solid red',
      title: '点击重新签名'
    }
  },
  methods: {
    /**
     * 判断用户是否有签名图片在了，在的话直接用签名的图片
     */
    confirmSign() {
      const self = this;
      let realname = this.$store.getters.userInfo.realname;
      let signPath = this.existPath;// 已有签名图片路径
      let image = new Image();
      let base64;
      // 签名存在，把签名图片转成base64设置进去
      image.onload = function (e) {
        base64 = self.imageToBase64(image);
        // 弹个确认框出来
        self.$confirm({
          okText: '确定',
          cancelText: '取消',
          title: '确定要签名吗?',
          onOk() {
            self.$emit('change', base64)
            self.$emit('ok', base64)
          }
        });
      }
      // 签名图片不存在，手写签名
      image.onerror = function () {
        self.visible = true;
      }
      image.src = signPath + realname + '.png';
    },
    imageToBase64(image) {
      let canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      let ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0, image.width, image.height);
      return canvas.toDataURL('image/png');
    },
    handleChange(e) {
      this.$emit('change', e.target.value)
    },
    async handleOk() {
      await this.handleGenerate()
      this.$emit('change', this.resultImg)
      this.$emit('ok', this.resultImg)
      this.visible = false
      this.$refs.esign.reset()
      // this.resultImg = ''
    },
    handleReset() {
      this.$refs.esign.reset()
    },
    handleGenerate() {
      return new Promise(resolve => {
        this.$refs.esign
          .generate()
          .then(res => {
            this.resultImg = res
            resolve(res)
            // this.$refs.singInput.value = res
            // console.log('生成图片', this.$refs.singInput.value, this.resultImg)
          })
          .catch(_err => {
            this.$message.warning('请先签名')
            // alert(err);
            // 画布没有签字时会执行这里 'Not Signned'
          })
      })
    },
    handleCancel() {
      this.$refs.esign.reset()
      // this.resultImg = ''
    }
  }
}
</script>

<style scoped>
.signer {
  /* display: flex;
  align-items: flex-start; */
  position: relative;
  height: 40px;
}
.resultImg {
  position: absolute;
  width: auto;
  max-width: 100%;
  height: auto;
  max-height: 5vh;
  display: inline-block;
  margin-top: 0px;
}
.resultImg:hover {
  cursor: pointer;
}
.esign {
  max-width: 1000px;
  margin: auto;
  padding: 10px;
  border: 1px solid rebeccapurple;
}
.esigh-btns button {
  /* color: #fff; */
  /* height: 40px;
  width: 100px;
  font-size: 16px; */
  margin-right: 10px;
  /* outline: none;
  border-radius: 4px;
  background: #f60;
  border: 1px solid transparent; */
}
.esigh-btns button:active {
  /* color: #fff;
  box-shadow: 0px 0px 50px orangered inset; */
}
.esigh-result {
  margin-top: 10px;
}
.esigh-result img {
  display: block;
  /* max-width: 100%; */
  /* height: auto; */
  max-width: 100%;
  /* max-width: 50%; */
  height: 50%;
  margin: auto;
  left: 50%;
  transform: rotateX(50%);
  border: 1px solid #ececee;
}
.esignature {
  margin: 10px 0;
  border: 2px solid #ccc;
}
</style>
