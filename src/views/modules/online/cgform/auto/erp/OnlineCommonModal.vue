<template>
  <j-modal
    :title="titleText"
    :width="modalWidth"
    :style="modalStyle"
    :visible="visible"
    :confirmLoading="confirmLoading"
    :okButtonProps="{ props: {disabled: disableSubmit} }"
    @ok="handleSubmit"
    @cancel="handleCancel"
    cancelText="关闭"
    switch-fullscreen
    :destroyOnClose="true"
    :class="'jeecg-online-modal'">

    <div v-if="(!disableSubmit) && hasOwnButton(1)">
      <a-button @click="openDoor" :class="single?'cust-button-switch-single':'cust-button-switch-many'">
        <a-icon type="fast-backward" />
      </a-button>
    </div>

    <div :class="btnBoxVisible?'show-drawer':'hide-drawer'" v-if="!disableSubmit && hasOwnButton(1)">
      <div class="jeecg-mask-cust" @click="closeDoor"></div>
      <div class="jeecg-drawer-content" :class="btnBoxVisible?'drawer-open':'drawer-close'">
        <div class="jeecg-drawer-header">自定义按钮</div>
        <div class="jeecg-drawer-body">
          <template v-if="cgButtonList && cgButtonList.length>0">
            <a-button
              v-for="btn in cgButtonList"
              v-if="btn.optPosition == '1'"
              :key="btn.id"
              type="primary"
              :icon="btn.buttonIcon"
              block
              @click="handleCgButtonClick(btn.optType,btn.buttonCode)">
              {{ btn.buttonName }}
            </a-button>
          </template>
        </div>
      </div>
    </div>

    <template slot="footer">
      <template v-if="cgButtonList && hasOwnButton(2)">
        <a-button
          v-for="btn in cgButtonList"
          v-if="btn.optPosition == '2'"
          :key="btn.id"
          type="primary"
          :icon="btn.buttonIcon"
          @click="handleCgButtonClick(btn.optType,btn.buttonCode)">
          {{ btn.buttonName }}
        </a-button>
      </template>

      <a-button v-if="!disableSubmit" key="submit" type="primary" @click="handleSubmit" :loading="submitLoading">确定</a-button>
      <a-button key="back" @click="handleCancel">关闭</a-button>
    </template>

    <a-spin :spinning="confirmLoading">
      <online-form
        ref="onlineForm"
        @onSuccess="handleSuccess"
        :formSchema="schema"
        :uiSchema="uiSchema"
        :single="true"
        :table-type="tableType"
        :enhanceStr="enhanceStr">
      </online-form>
    </a-spin>

  </j-modal>
</template>

<script>
  import OnlineForm from '@/components/online/autoform/OnlineFormSwitch';
  import { getAction } from '@/api/manage'

  const singleWidth = 800
  const one2ManyWidth = 1100
  export default {
    name: "OnlineCommonModal",
    components: {
      OnlineForm
    },
    data () {
      return {
        visible: false,
        confirmLoading: false,
        disableSubmit:false,
        titleText:"操作",
        optMethod:"post",
        url:{
          loadFormItems:"/online/cgform/api/getErpFormItem/",
          loadEnhanceJs:"/online/cgform/api/getEnhanceJs/",
          optPre:"/online/cgform/api/form/"
        },
        schema:{},
        uiSchema:{
          itemattrs: ""
        },
        single:true,
        treeForm:false,
        enhanceStr:'',
        modalStyle: { 'position': 'relative' },
        cgButtonList:[],
        btnBoxVisible:false,
        btnBoxVisible2:false,

        submitLoading:false
      }
    },
    props:{
      code:{
        type: String,
        required: true,
        default:''
      },
      foreignKeys:{
        type:Array,
        required:false,
        default:()=>[]
      },
      tableType:{
        type: Number,
        required: false,
        default:1
      }
    },
    computed: {
      modalWidth() {
        let formTemplate = 1;
        if (this.uiSchema.formTemplate) {
          try {
            formTemplate = Number.parseInt(this.uiSchema.formTemplate)
          } catch {
            console.warn('error formTemplate value: ', this.uiSchema.formTemplate)
          }
        }
        // 不同的列数展示不同的宽度
        let diff = 200 * (formTemplate - 1)
        // 基值加上阈值
        let width = (this.single ? singleWidth : one2ManyWidth) + diff
        console.log('-- modalWidth: ',width)
        return width
      },
    },
    created () {
      this.loadFormItems()
    },
    watch: {
      code () {
        this.loadFormItems();
      }
    },
    methods: {
      initForeignKeyForm(){
        //处理子表的 外键问题
        if(this.foreignKeys && this.foreignKeys.length>0){
          console.log("aaaa",this.foreignKeys)
          for(let item of this.foreignKeys){
            this.schema.properties[item.field]={
              hidden: true,
              key: item.field,
              title: item.field,
              type: 'string',
              view: 'hidden'
            }
          }
        }
        console.log("this.schema",this.schema)
      },
      getForeignKeyValue(main){
        // 在add方法后面调用即可
        let obj = {};
        if(main){
          for(let item of this.foreignKeys){
            obj[item.field] = main[item.key]
          }
        }
        return obj;
      },
      loadFormItems(){
        console.log("this.code",this.code)
        let url = this.url.loadFormItems + this.code;
        getAction(url).then((res)=>{
          console.log("OnlCgformAutoModal--动态表单查询结果是：",res)
          if(res.success){
            this.single = true
            this.schema = res.result.schema
            this.initForeignKeyForm();
            this.$emit('schema', this.schema)
            console.log('schema', this.schema)
            this.treeForm = res.result.head.isTree=='Y'
            this.cgButtonList = (!res.result.cgButtonList)?[]:res.result.cgButtonList
            if(res.result.enhanceJs){
              this.enhanceStr = res.result.enhanceJs
            }else{
              this.enhanceStr=''
            }
            this.$nextTick(() => {
              if(this.$refs.onlineForm){
                this.$refs.onlineForm.createRootProperties()
              }
            });

          }
        });
      },

      close () {
        this.visible = false;
        this.submitLoading = false
      },
      handleSubmit () {
        this.submitLoading = true
        this.$refs.onlineForm.handleSubmit();
        setTimeout(()=>{
          this.submitLoading = false
        },3500)
      },
      handleSuccess(){
        this.close()
        this.$emit('success');
      },
      handleCancel () {
        this.close()
      },
      add (formTemplate,main) {
        this.titleText = "新增"
        this.uiSchema.method = "post"
        this.uiSchema.formTemplate = formTemplate
        this.uiSchema.url = this.url.optPre+this.code
        this.uiSchema = { ...this.uiSchema }
        this.visible = true
        this.disableSubmit = false
        this.$nextTick(() => {
          this.$refs.onlineForm.add()
          this.$refs.onlineForm.setForeignKeysValue(this.getForeignKeyValue(main))
        });
      },
      edit (formTemplate,id) {
        this.titleText = "编辑"
        this.uiSchema.method = "put"
        this.uiSchema.formTemplate = formTemplate
        this.uiSchema.url = this.url.optPre+this.code
        this.uiSchema = { ...this.uiSchema }
        this.visible = true
        this.disableSubmit = false
        getAction(this.url.optPre+this.code+"/"+id).then((res)=>{
          if(res.success){
            let record = res.result
            this.$refs.onlineForm.edit(record)
          }else{
            this.$message.warning(res.message)
          }
        })
      },
      detail(formTemplate,id){
        this.titleText = "详情"
        this.visible = true
        this.uiSchema.formTemplate = formTemplate
        this.uiSchema = { ...this.uiSchema }
        this.disableSubmit = true
        getAction(this.url.optPre+this.code+"/"+id).then((res)=>{
          if(res.success){
            let record = res.result
            this.$refs.onlineForm.detail(record)
          }else{
            this.$message.warning(res.message)
          }
        })
      },
      handleCgButtonClick(optType,buttonCode){
        this.$refs.onlineForm.handleCgButtonClick(optType,buttonCode,this.code)
      },
      openDoor(){
        if(this.btnBoxVisible2){
          setTimeout(()=>{
            this.btnBoxVisible2 = !this.btnBoxVisible2
          },1000)
        }else{
          this.btnBoxVisible2 = !this.btnBoxVisible2
        }
        this.btnBoxVisible = !this.btnBoxVisible
      },
      closeDoor(){
        this.btnBoxVisible = false
      },
      hasOwnButton(flag){
        if(!this.cgButtonList || this.cgButtonList.length==0){
          return false
        }else{
          let a = this.cgButtonList.filter(item=>{
            return item.optPosition == flag
          })
          return a && a.length>0
        }
      }

    }
  }
</script>

<style scoped >
  .avatar-uploader > .ant-upload {
    width:104px;
    height:104px;
  }
  .ant-upload-select-picture-card i {
    font-size: 49px;
    color: #999;
  }

  .ant-upload-select-picture-card .ant-upload-text {
    margin-top: 8px;
    color: #666;
  }

  .ant-table-tbody .ant-table-row td{
    padding-top:10px;
    padding-bottom:10px;
  }

  .has-error .ant-form-explain, .has-error .ant-form-split {
    color: #f5222d;
    position: absolute;
  }


.jeecg-mask-cust{
  height:0%;
  width: 100%;
  opacity:0.3;
  position: absolute;
  left:0;
  top:0;
  background-color: rgba(0, 0, 0, 0.65);
  z-index: 999;
}


  .jeecg-drawer-content{
    position: absolute;
    top: 0;
    right: 0;
    z-index: 10000;
    width: 160px;
    height: 100%;
    overflow: hidden;
    background: #fff;
    transform-origin: 100% 50% 0;
    transition: transform 0.3s, opacity 0.2s;
  }

  .jeecg-drawer-content.drawer-open {
    opacity: 1;
    transform: scaleX(1);
  }

  .jeecg-drawer-content.drawer-close {
    opacity: 0;
    transform: scaleX(0);
  }

  .show-drawer{
    width: 100%;
  }
  .hide-drawer{
    width: 0;
  }

  .show-drawer .jeecg-drawer-content{
    height:100%;
    z-index: 10000;
  }

  .jeecg-drawer-header {
    padding: 16px;
    border-radius: 4px 4px 0 0;
    background: #fff;
    border-bottom: 1px solid #e8e8e8;
    color: rgba(0, 0, 0, 0.85);
  }

  .jeecg-drawer-body {
    padding:0px 24px;
    font-size: 14px;
    line-height: 1.5;
    word-wrap: break-word;
    overflow: auto;
    height: calc(100% - 54px);
  }

  .jeecg-drawer-body .ant-btn {
    margin-top: 12px;
  }

  .jeecg-drawer-body .ant-btn:last-child {
    margin-bottom: 12px;
  }

  .show-drawer .jeecg-mask-cust{
    height:100%;
  }

  .cust-button-switch-single{
    position: absolute;top:220px;right:0px;z-index: 1000;cursor: pointer;padding: 0 5px;font-size: 20px;
  }
  .cust-button-switch-many{
    position: absolute;top:220px;right:0px;z-index: 1000;cursor: pointer;padding: 0 5px;font-size: 20px;
  }

  .cust-button-switch-single,
  .cust-button-switch-many {
    top:50%;
    border-right: 0;
    border-radius: 4px 0 0 4px;
  }

</style>