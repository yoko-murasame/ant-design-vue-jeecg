<template>
  <div style="background: #ffffff">
    <!-- 步骤条 -->
    <a-spin :spinning="loading">
      <a-card v-if="showSteps">
        <a-steps progressDot :current="stepIndex" style="padding: 10px" size="default">
          <template v-if="resultObj.bpmLogListCount >3">
            <a-step>
              <template slot="title">
                <div class="task-title">...</div>
              </template>
            </a-step>
          </template>
          <template v-for="(item,index) in resultObj.bpmLogStepList">
            <a-step>
              <template slot="title">
                <div class="task-title">{{ item.taskName }}</div>
              </template>
              <template slot="description">
                <div class="task-date" style="text-align: left"><span><j-ellipsis
                  :length="15"
                  :value="'办理时间：'+ item.opTime"></j-ellipsis></span>
                </div>
                <div class="task-user" style="text-align: left"><span> 操作人：{{ item.opUserName }}</span></div>
              </template>
            </a-step>
          </template>
          <a-step v-if="resultObj.taskName&&resultObj.taskName!=''">
            <template slot="title">
              <div class="task-title">{{ resultObj.taskName }}</div>
            </template>
            <template slot="description">
              <div class="task-date" style="text-align: left"><span style="color: #ff6d75;"><j-ellipsis
                :value="'开始时间：'+ resultObj.taskNameStartTime"></j-ellipsis></span></div>
              <div class="task-user" style="text-align: left"> 操作人：{{ resultObj.taskAssigneeName }}</div>
            </template>
          </a-step>
          <a-step>
            <template slot="title">
              <div class="task-title">...</div>
            </template>
          </a-step>
          <!--<a-step>
            <template slot="title">
              <div class="task-title"></div>
            </template>
          </a-step>-->
        </a-steps>
      </a-card>
      <a-card :title="formData.showMessageHandle ? '意见信息' : '流程办理'" :bodyStyle="{padding:'0 20px'}" size="default" style="margin-top:20px">
        <a-list itemLayout="vertical">
          <template v-if="formData.showMessageHandle">
            <a-list-item>
              <div style="width: 100%;">
                <div style="margin-bottom: 5px">
                  处理意见：
                  <a-select
                    style="width: 300px"
                    placeholder="常用审批语"
                    :getPopupContainer="(target) => target.parentNode"
                    @change="handleChangeSelect">
                    <a-icon slot="suffixIcon" type="smile"/>
                    <a-select-option v-for="(item, key) in remarksDictOptions" :key="key" :value="item.value">{{
                      item.text
                    }}
                    </a-select-option>
                  </a-select>
                  <!--2022.07.20-添加流程处理意见暂存功能-->
                  <a-popconfirm title="确定要暂存处理意见吗?" @confirm="cacheMessage">
                    <a-button type="primary">暂存处理意见</a-button>
                  </a-popconfirm>
                  <a-popconfirm title="确定要恢复暂存意见吗?" @confirm="reloadMessage">
                    <a-button type="primary">恢复暂存意见</a-button>
                  </a-popconfirm>
                </div>
                <a-textarea rows="3" v-model="model.reason"/>
              </div>
            </a-list-item>
            <a-list-item>
              <j-upload text="添加文件" v-model="fileList" :returnUrl="false"></j-upload>
            </a-list-item>
          </template>
          <a-list-item>
            <a-row>
              <a-col :span="24">
                <a-radio-group v-model="model.processModel">
                  <a-radio :checked="true" :value="1">流转下一节点</a-radio>
                  <!-- <a-radio :value="2">多分支模式</a-radio> -->
                  <!--TODO 将驳回功能改成可配置化-->
                  <a-radio :value="3" v-if="formData.showReject && resultObj.histListSize>0">驳回</a-radio>
                </a-radio-group>
                <span :hidden="this.model.processModel!==2">
                  <span style="color: red;">多分支模式默认执行所有分支：</span>
                  <!--<a-checkbox-group v-model="transition" >-->
                  <template v-for="(item,index) in resultObj.transitionList">
                    <a-checkbox :checked="true" :value="item.nextnode">{{ item.Transition }}</a-checkbox>
                  </template>
                  <!-- </a-checkbox-group>-->
                </span>
                <span :hidden="this.model.processModel!==3" v-if="resultObj.histListSize>0">
                  <a-select
                    v-model="model.rejectModelNode"
                    :getPopupContainer="(target) => target.parentNode"
                    style="width:350px">
                    <template v-for="(item,index) in resultObj.histListNode">
                      <a-select-option
                        v-if="item.name_ != resultObj.taskName "
                        :value="item.task_def_key_">{{ item.name_ }}</a-select-option>
                    </template>
                  </a-select>
                </span>
              </a-col>
            </a-row>
          </a-list-item>
          <a-list-item>
            <!-- <a-checkbox :checked="checkedNext" @change="handleCheckedNextChange">指定下一步操作人（指定下一步会签人员 xxx待删除）</a-checkbox> -->
            <a-checkbox :checked="checkedNext" @change="handleCheckedNextChange">指定下一步操作人/会签人</a-checkbox>
            <a-checkbox :checked="checkedCc" @change="handleCheckedCcChange">是否抄送</a-checkbox>
          </a-list-item>
          <a-list-item style="line-height: 32px" :hidden="!checkedNext">
            <span>指定下一步操作人（指定下一步会签人员）：</span>
            <!--<a-input style="width: 200px;" v-model="model.nextUserName"></a-input>-->
            <a-select
              style="width: 300px;"
              mode="multiple"
              placeholder="点击选择用户"
              :value="hqUserList"
            >
              <!--<a-select-option v-for="(item,index) in hqUserSelectList" :key="item.name">
                {{ item.name }}
              </a-select-option>-->
            </a-select>
            <a-button type="primary" @click="handleHqUserSelect" icon="search" style="margin-left: 8px">选择</a-button>
            <a-button type="primary" @click="hqUserSelectReset" icon="reload" style="margin-left: 8px">清空</a-button>
            <span>（如果不指定则按照系统默认，默认将移交给任务发起人）</span>

          </a-list-item>
          <a-list-item style="line-height: 32px" :hidden="!checkedCc">
            <span>抄送给：</span>
            <!--<a-input style="width: 200px;" v-model="model.ccUserRealNames"></a-input>-->
            <a-select
              style="width: 300px;"
              mode="multiple"
              placeholder="点击选择按钮"
              :value="ccUserList"
            >
              <!--<a-select-option v-for="(item,index) in ccUserSelectList" :key="item.name">
                {{ item.name }}
              </a-select-option>-->
            </a-select>
            <a-button type="primary" @click="handleCcUserSelect" icon="search" style="margin-left: 8px">选择</a-button>
            <a-button type="primary" @click="ccUserSelectReset" icon="reload" style="margin-left: 8px">清空</a-button>
          </a-list-item>
        </a-list>
        <!-- 流转按钮 -->
        <div style="margin-top:20px;text-align:center">
          <template v-if="model.processModel==1">
            <template v-for="(item,index) in resultObj.transitionList">
              <a-button type="primary" @click="handleProcessComplete(item.nextnode, item.Transition)">{{ item.Transition }}</a-button>
            </template>
          </template>
          <template v-else>
            <a-button type="primary" @click="handleManyProcessComplete()">确认提交</a-button>
          </template>
        </div>
        <br>
      </a-card>
      <!-- 意见 -->
      <a-card title="审批历史" :bodyStyle="{padding:'0 20px'}" size="default" style="margin-top:20px">
        <a-list itemLayout="vertical">
          <template v-for="(item,index) in bpmLogList">
            <a-list-item>
              <a-list-item-meta :description="item.remarks">
                <a slot="title">{{ item.opUserName }}<span style="color: #ff6d75;">[{{ item.taskName }}]</span>
                  {{ item.opTime }}</a>
                <a-avatar slot="avatar" :size="36" icon="user" style="background-color: #51cbff;"></a-avatar>
              </a-list-item-meta>
              <template v-for="(file,index) in item.bpmFiles">
                <div class="ant-upload-list ant-upload-list-text">
                  <div class="ant-upload-list-item ant-upload-list-item-done">
                    <div class="ant-upload-list-item-info">
                      <span>
                        <a-icon type="paper-clip"/>
                        <a
                          target="_blank"
                          rel="noopener noreferrer"
                          :title="file.fileName"
                          :href="getFileDownloadUrl(file.filePath)"
                          class="ant-upload-list-item-name">{{
                            file.fileName
                          }}</a>
                      </span>
                    </div>
                  </div>
                </div>
              </template>
            </a-list-item>
          </template>
          <!--<a-list-item></a-list-item>-->
          <!--<a-list-item>-->
          <!--  <div style="width: 100%;">-->
          <!--    <div style="margin-bottom: 5px">-->
          <!--      处理意见：-->
          <!--      <a-select-->
          <!--        style="width: 300px"-->
          <!--        placeholder="常用审批语"-->
          <!--        :getPopupContainer="(target) => target.parentNode"-->
          <!--        @change="handleChangeSelect">-->
          <!--        <a-icon slot="suffixIcon" type="smile"/>-->
          <!--        <a-select-option v-for="(item, key) in remarksDictOptions" :key="key" :value="item.value">{{-->
          <!--          item.text-->
          <!--        }}-->
          <!--        </a-select-option>-->
          <!--      </a-select>-->
          <!--      &lt;!&ndash;2022.07.20-添加流程处理意见暂存功能&ndash;&gt;-->
          <!--      <a-popconfirm title="确定要暂存处理意见吗?" @confirm="cacheMessage">-->
          <!--        <a-button type="primary">暂存处理意见</a-button>-->
          <!--      </a-popconfirm>-->
          <!--      <a-popconfirm title="确定要恢复暂存意见吗?" @confirm="reloadMessage">-->
          <!--        <a-button type="primary">恢复暂存意见</a-button>-->
          <!--      </a-popconfirm>-->
          <!--    </div>-->
          <!--    <a-textarea rows="3" v-model="model.reason"/>-->
          <!--  </div>-->
          <!--</a-list-item>-->
          <!--<a-list-item>-->
          <!--  <j-upload text="添加文件" v-model="fileList" :returnUrl="false"></j-upload>-->
          <!--</a-list-item>-->
          <!--<a-list-item>-->
          <!--  <a-row>-->
          <!--    <a-col :span="24">-->
          <!--      <a-radio-group v-model="model.processModel">-->
          <!--        <a-radio :checked="true" :value="1">流转下一节点</a-radio>-->
          <!--        &lt;!&ndash; <a-radio :value="2">多分支模式</a-radio> &ndash;&gt;-->
          <!--        <a-radio :value="3" v-if="resultObj.histListSize>0">驳回</a-radio>-->
          <!--      </a-radio-group>-->
          <!--      <span :hidden="this.model.processModel!==2">-->
          <!--        <span style="color: red;">多分支模式默认执行所有分支：</span>-->
          <!--        &lt;!&ndash;<a-checkbox-group v-model="transition" >&ndash;&gt;-->
          <!--        <template v-for="(item,index) in resultObj.transitionList">-->
          <!--          <a-checkbox :checked="true" :value="item.nextnode">{{ item.Transition }}</a-checkbox>-->
          <!--        </template>-->
          <!--        &lt;!&ndash; </a-checkbox-group>&ndash;&gt;-->
          <!--      </span>-->
          <!--      <span :hidden="this.model.processModel!==3" v-if="resultObj.histListSize>0">-->
          <!--        <a-select-->
          <!--          v-model="model.rejectModelNode"-->
          <!--          :getPopupContainer="(target) => target.parentNode"-->
          <!--          style="width:150px">-->
          <!--          <template v-for="(item,index) in resultObj.histListNode">-->
          <!--            <a-select-option-->
          <!--              v-if="item.name_ != resultObj.taskName "-->
          <!--              :value="item.task_def_key_">{{ item.name_ }}</a-select-option>-->
          <!--          </template>-->
          <!--        </a-select>-->
          <!--      </span>-->
          <!--    </a-col>-->
          <!--  </a-row>-->
          <!--</a-list-item>-->
          <!--<a-list-item>-->
          <!--  &lt;!&ndash; <a-checkbox :checked="checkedNext" @change="handleCheckedNextChange">指定下一步操作人（指定下一步会签人员 xxx待删除）</a-checkbox> &ndash;&gt;-->
          <!--  <a-checkbox :checked="checkedNext" @change="handleCheckedNextChange">指定下一步操作人/会签人</a-checkbox>-->
          <!--  <a-checkbox :checked="checkedCc" @change="handleCheckedCcChange">是否抄送</a-checkbox>-->
          <!--</a-list-item>-->
          <!--<a-list-item style="line-height: 32px" :hidden="!checkedNext">-->
          <!--  <span>指定下一步操作人（指定下一步会签人员）：</span>-->
          <!--  &lt;!&ndash;<a-input style="width: 200px;" v-model="model.nextUserName"></a-input>&ndash;&gt;-->
          <!--  <a-select-->
          <!--    style="width: 300px;"-->
          <!--    mode="multiple"-->
          <!--    placeholder="点击选择用户"-->
          <!--    :value="hqUserList"-->
          <!--  >-->
          <!--    &lt;!&ndash;<a-select-option v-for="(item,index) in hqUserSelectList" :key="item.name">-->
          <!--      {{ item.name }}-->
          <!--    </a-select-option>&ndash;&gt;-->
          <!--  </a-select>-->
          <!--  <a-button type="primary" @click="handleHqUserSelect" icon="search" style="margin-left: 8px">选择</a-button>-->
          <!--  <a-button type="primary" @click="hqUserSelectReset" icon="reload" style="margin-left: 8px">清空</a-button>-->
          <!--  <span>（如果不指定则按照系统默认，默认将移交给任务发起人）</span>-->

          <!--</a-list-item>-->
          <!--  <a-list-item style="line-height: 32px" :hidden="!checkedCc">-->
          <!--    <span>抄送给：</span>-->
          <!--    &lt;!&ndash;<a-input style="width: 200px;" v-model="model.ccUserRealNames"></a-input>&ndash;&gt;-->
          <!--    <a-select-->
          <!--      style="width: 300px;"-->
          <!--      mode="multiple"-->
          <!--      placeholder="点击选择按钮"-->
          <!--      :value="ccUserList"-->
          <!--    >-->
          <!--      &lt;!&ndash;<a-select-option v-for="(item,index) in ccUserSelectList" :key="item.name">-->
          <!--        {{ item.name }}-->
          <!--      </a-select-option>&ndash;&gt;-->
          <!--    </a-select>-->
          <!--    <a-button type="primary" @click="handleCcUserSelect" icon="search" style="margin-left: 8px">选择</a-button>-->
          <!--    <a-button type="primary" @click="ccUserSelectReset" icon="reload" style="margin-left: 8px">清空</a-button>-->
          <!--  </a-list-item>-->
          <!--</a-list>-->
          <!-- 流转按钮 -->
          <!--<div style="margin-top:20px;text-align:center">-->
          <!--  <template v-if="model.processModel==1">-->
          <!--    <template v-for="(item,index) in resultObj.transitionList">-->
          <!--      <a-button type="primary" @click="handleProcessComplete(item.nextnode)">{{ item.Transition }}</a-button>-->
          <!--    </template>-->
          <!--  </template>-->
          <!--  <template v-else>-->
          <!--    <a-button type="primary" @click="handleManyProcessComplete()">确认提交</a-button>-->
          <!--  </template>-->
          <!--</div>-->
          <!--<br>-->
        </a-list>
      </a-card>

      <select-user-modal ref="selectHqUserModal" @selectFinished="selectHqUserOK"></select-user-modal>
      <select-user-modal ref="selectCcUserModal" @selectFinished="selectCcUserOK"></select-user-modal>
    </a-spin>
  </div>
</template>

<script>
import { getFileAccessHttpUrl } from '@/api/manage'
import { TaskModuleMixin } from '@views/modules/bpm/mixins/TaskModuleMixin'
import AListItem from 'ant-design-vue/es/list/Item'
import Vue from 'vue'
import JEllipsis from '@/components/jeecg/JEllipsis.vue'
import JUpload from '@/components/jeecg/JUpload'
import SelectUserModal from '@views/modules/bpm/task/form/SelectUserModal.vue'

export default {
  mixins: [TaskModuleMixin],
  components: {
    JUpload,
    JEllipsis,
    AListItem,
    SelectUserModal
  },
  name: 'TaskModule',
  data() {
    return {
      parent: null,
      transition: [],
      hqUserSelectList: [],
      ccUserSelectList: [],
      bodyStyle: {
        padding: '10px'
      },
      checkedCc: false
    }
  },
  computed: {
    bpmLogList() {
      return (this.resultObj.bpmLogList || []).reverse()
    },
    stepIndex: function () {
      if (this.resultObj.bpmLogListCount > 3) {
        return this.resultObj.bpmLogStepListCount + 1
      }
      return this.resultObj.bpmLogStepListCount
    },
    hqUserList: function () {
      console.log('hq user select ', this.hqUserSelectList)
      var names = []
      var ids = []
      for (var a = 0; a < this.hqUserSelectList.length; a++) {
        names.push(this.hqUserSelectList[a].realname)
        ids.push(this.hqUserSelectList[a].username)
      }
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.model.nextUserId = ids.join(',')
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.model.nextUserName = names.join(',')
      return names
    },
    ccUserList: function () {
      console.log('cc user select ', this.ccUserSelectList)
      var names = []
      var ids = []
      for (var a = 0; a < this.ccUserSelectList.length; a++) {
        names.push(this.ccUserSelectList[a].realname)
        ids.push(this.ccUserSelectList[a].username)
      }
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.model.ccUserIds = ids.join(',')
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.model.ccUserRealNames = names.join(',')
      return names
    }
  },
  methods: {
    cacheMessage() {
      Vue.ls.set('TaskModuleDealMessage', this.model.reason)
      this.$message.success('处理意见已暂存')
    },
    reloadMessage() {
      const msg = Vue.ls.get('TaskModuleDealMessage')
      !msg && this.$message.info('无暂存数据')
      if (msg) {
        this.model.reason = msg
        this.$message.success('处理意见已恢复')
      }
    },
    handleChangeSelect(value) {
      console.log('handleChangeSelect', value)
      this.model.reason = value
    },
    getFileDownloadUrl: function (path) {
      return getFileAccessHttpUrl(path)
    },
    handleCheckedNextChange(e) {
      this.checkedNext = e.target.checked
      this.hqUserSelectReset()
    },
    handleCheckedCcChange(e) {
      this.checkedCc = e.target.checked
      this.ccUserSelectReset()
    },
    selectHqUserOK: function (data) {
      this.hqUserSelectList = data
    },
    handleHqUserSelect: function () {
      this.$refs.selectHqUserModal.add()
    },
    hqUserSelectReset() {
      this.hqUserSelectList = []
    },
    selectCcUserOK: function (data) {
      this.ccUserSelectList = data
    },
    handleCcUserSelect: function () {
      this.$refs.selectCcUserModal.add()
    },
    ccUserSelectReset() {
      this.ccUserSelectList = []
    }
  }
}
</script>

<style scoped>
.task-info {
  margin: 20px 0;
}

.task-title {
  font-weight: bold;
}

.task-date {
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-date span {
  /* color: #ff6d75;*/
}

.ant-steps-item-description {
  max-width: 200px !important;
}

/** Button按钮间距 */
.ant-btn {
  margin-left: 3px
}
</style>
