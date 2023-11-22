<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form :form="form" slot="detail" :class="{'view-mode': viewMode}">
        <a-row>
          <a-col :span="12" v-show="!formDisabled && !(formData.id)">
            <a-form-item label="父级节点" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
              <j-tree-select
                :disabled="!!(formData.id)"
                placeholder="请选择父级节点"
                v-decorator="['pid', validatorRules.pid]"
                dict="om_sz_category,label,id"
                v-if="pidTreeCondition"
                :condition="pidTreeCondition"
                pid-value="0"
                pidField="pid">
              </j-tree-select>
            </a-form-item>
          </a-col>
          <a-col :span="12" v-show="!formDisabled && !(formData.id)">
            <a-form-item label="排序" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
              <a-input v-decorator="[ 'orderNum', validatorRules.orderNum]" placeholder="在树列表中选择父节点后新增可自动填充；复制时也会自动计算；请不要重号！"></a-input>
            </a-form-item>
          </a-col>
          <a-col :span="24" v-show="!formDisabled && !(formData.id)">
            <a-form-item label="节点类型" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-dict-select-tag
                :disabled="!!(formData.id)"
                v-decorator="['nodeType', validatorRules.nodeType]"
                :trigger-change="true"
                @change="e => {validatorRules.nodeType.modelValue = e;refreshForm({nodeType: e})}"
                :options="menuTypeOptions"
                type="radio"
                placeholder="请选择节点类型"/>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item style="margin-bottom: 1vh" :label="isProjectNode ? '项目名称' : isFolderNode ? '目录名称' : '文件名称'" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input v-decorator="['label', validatorRules.label]" placeholder="请输入名称" @change="e => changeXmmc(e, {target:{}})"></a-input>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row v-if="!isFolderNode">
          <a-col :span="24">
            <a-form-item style="margin-bottom: 0vh;" :label="isCadNode ? 'CAD附件' : '节点附件'" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <j-upload
                style="display: inline-block"
                :disabled="!!(formData.id)"
                :button-visible="!(formData.id)"
                fileType="all"
                :custom-upload-action="url.customUploadAction"
                :number="1"
                :biz-path="'layers'"
                :text="isCadNode ? '上传CAD文件' : '点击上传'"
                @change="onFileChange"
                v-decorator="['download', validatorRules.download]"
                :trigger-change="true"></j-upload>
              <a-popconfirm title="此操作将自动导入CAD并发布成超图服务，耗时较久，确定执行导入吗?" @confirm="onImportCad">
                <a-button
                  v-show="!viewMode && !disabled && isCadNode && form.getFieldValue('download')"
                  type="primary"
                  :loading="btnLoading"
                  ref="importCadBtn"
                  style="display: inline-block;margin-left: 1vh">立即执行导入</a-button>
              </a-popconfirm>
            </a-form-item>
            <a-progress
              ref="importCadProgress"
              v-show="!viewMode && !disabled && isCadNode && form.getFieldValue('download')"
              :percent="btnProgress"
              :status="btnProgress < 100 ? 'active' : 'success'" />
          </a-col>
        </a-row>
        <!--分tab展示-->
        <a-tabs defaultActiveKey="1" v-model="activeKey">
          <a-tab-pane tab="项目信息" key="1" style="min-height: 300px" forceRender :class="{'view-mode': !isProjectNode}">
            <a-row>
              <a-col :span="24">
                <a-form-item label="项目名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <a-input
                    :disabled="!isProjectNode"
                    v-decorator="['xmmc', validatorRules.xmmc]"
                    placeholder="请输入项目名称"
                    @change="e => changeXmmc({ target: {} }, e)" ></a-input>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="项目负责人" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
                  <!--<a-input :disabled="!isProjectNode" v-decorator="['xmfzr']" placeholder="请输入项目负责人" ></a-input>-->
                  <j-search-select-tag
                    placeholder="请选择项目负责人"
                    v-decorator="['xmfzr']"
                    dict="sys_user,realname,username"
                    :disabled="!isProjectNode"
                    :async="true"
                    :pageSize="20"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="专业负责人" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
                  <!--<a-input :disabled="!isProjectNode" v-decorator="['zyfzr']" placeholder="请输入专业负责人" ></a-input>-->
                  <j-search-select-tag
                    placeholder="请选择专业负责人"
                    v-decorator="['zyfzr']"
                    dict="sys_user,realname,username"
                    :disabled="!isProjectNode"
                    :async="true"
                    :pageSize="20"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="设计人" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
                  <!--<a-input :disabled="!isProjectNode" v-decorator="['sjr']" placeholder="请输入设计人" ></a-input>-->
                  <j-search-select-tag
                    placeholder="请选择设计人"
                    v-decorator="['sjr']"
                    dict="sys_user,realname,username"
                    :disabled="!isProjectNode"
                    :async="true"
                    :pageSize="20"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="工程总负责人" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
                  <!--<a-input :disabled="!isProjectNode" v-decorator="['gczfzr']" placeholder="请输入工程总负责人" ></a-input>-->
                  <j-search-select-tag
                    placeholder="请选择工程总负责人"
                    v-decorator="['gczfzr']"
                    dict="sys_user,realname,username"
                    :disabled="!isProjectNode"
                    :async="true"
                    :pageSize="20"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="制图" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
                  <!--<a-input :disabled="!isProjectNode" v-decorator="['zt']" placeholder="请输入制图" ></a-input>-->
                  <j-search-select-tag
                    placeholder="请选择制图人"
                    v-decorator="['zt']"
                    dict="sys_user,realname,username"
                    :disabled="!isProjectNode"
                    :async="true"
                    :pageSize="20"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="校对" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
                  <!--<a-input :disabled="!isProjectNode" v-decorator="['jd']" placeholder="请输入校对" ></a-input>-->
                  <j-search-select-tag
                    placeholder="请选择校对人"
                    v-decorator="['jd']"
                    dict="sys_user,realname,username"
                    :disabled="!isProjectNode"
                    :async="true"
                    :pageSize="20"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row>
              <!--<a-col :span="12">-->
              <!--  <a-form-item label="工种负责人" :labelCol="labelCol2" :wrapperCol="wrapperCol2">-->
              <!--    <a-input :disabled="!isProjectNode" v-decorator="['gzfzr']" placeholder="请输入工种负责人" ></a-input>-->
              <!--  </a-form-item>-->
              <!--</a-col>-->
              <!--<a-col :span="12">-->
              <!--  <a-form-item label="工程负责人" :labelCol="labelCol2" :wrapperCol="wrapperCol2">-->
              <!--    <a-input :disabled="!isProjectNode" v-decorator="['gcfzr']" placeholder="请输入工程负责人" ></a-input>-->
              <!--  </a-form-item>-->
              <!--</a-col>-->
            </a-row>
            <a-row>
              <a-col :span="12">
                <a-form-item label="审核" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
                  <!--<a-input :disabled="!isProjectNode" v-decorator="['sh']" placeholder="请输入审核" ></a-input>-->
                  <j-search-select-tag
                    placeholder="请选择审核人"
                    v-decorator="['sh']"
                    dict="sys_user,realname,username"
                    :disabled="!isProjectNode"
                    :async="true"
                    :pageSize="20"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="审定" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
                  <!--<a-input :disabled="!isProjectNode" v-decorator="['sd']" placeholder="请输入审定" ></a-input>-->
                  <j-search-select-tag
                    placeholder="请选择审定人"
                    v-decorator="['sd']"
                    dict="sys_user,realname,username"
                    :disabled="!isProjectNode"
                    :async="true"
                    :pageSize="20"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row>
              <a-col :span="24">
                <a-form-item label="工程总称" :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <!--<a-input v-decorator="['gczc']" :disabled="false || !!(formData.id)" placeholder="请输入工程总称" ></a-input>-->
                  <j-search-select-tag
                    :disabled="true"
                    v-decorator="['projectId', validatorRules.projectId]"
                    placeholder="自动填充"
                    :enable-jsdw="false"
                    :dict="projectDict"
                    :async="true"
                    :pageSize="20"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="工程号" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
                  <a-input disabled v-decorator="['gch', validatorRules.gch]" placeholder="自动填充" ></a-input>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="建设单位" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
                  <a-input disabled v-decorator="['jsdw', validatorRules.jsdw]" placeholder="自动填充" ></a-input>
                </a-form-item>
              </a-col>
            </a-row>
            <a-alert v-if="!isProjectNode" style="text-align: center;margin: 0 0 1vh 0" message="此页属性继承自关联项目，如需修改请编辑关联项目！" type="info" show-icon />
          </a-tab-pane>
          <a-tab-pane v-if="!isFolderNode && !isProjectNode" tab="出图信息" key="2" style="min-height: 475px" forceRender>
            <a-row>
              <a-col :span="12">
                <a-form-item label="标题" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
                  <a-input v-decorator="['title']" placeholder="请输入标题" ></a-input>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="图号" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
                  <a-input v-decorator="['th']" placeholder="请输入图号" ></a-input>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="阶段" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
                  <a-input v-decorator="['jieduan']" placeholder="请输入阶段" ></a-input>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="图名" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
                  <a-input v-decorator="['tm']" placeholder="请输入图名" ></a-input>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item ref="dateRef" label="出图日期" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
                  <j-date :getCalendarContainer="getCalendarContainer" placeholder="请选择出图日期" v-decorator="['ctrq']" :trigger-change="true" style="width: 100%" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="比例" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
                  <j-dict-select-tag
                    v-decorator="['bl']"
                    :trigger-change="true"
                    dict-code="sz_picture_scale"
                    type="select"
                    placeholder="请选择比例" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="页次" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
                  <a-input v-decorator="['yc']" placeholder="请输入页次" ></a-input>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="出图数据" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
                  <j-upload
                    :custom-upload-action="url.customUploadAction"
                    :disabled="true"
                    :button-visible="false"
                    :trigger-change="true"
                    v-decorator="['picture']"
                    text="点击上传"
                    :number="10"
                    :returnUrl="true"
                    fileType="file"
                  ></j-upload>
                </a-form-item>
              </a-col>
            </a-row>
          </a-tab-pane>
          <a-tab-pane v-if="true" tab="服务配置" key="3" forceRender>
            <a-row>
              <!--<a-divider>服务配置</a-divider>-->
              <a-col :span="12">
                <a-form-item label="服务类型" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
                  <!--<a-input v-decorator="['serviceType']" placeholder="请输入服务类型" ></a-input>-->
                  <j-dict-select-tag
                    v-decorator="['serviceType']"
                    :trigger-change="true"
                    :options="[
                      {value: '', text: '无', title: '无'},
                      {value: 'map', text: 'map', title: 'map'},
                      {value: 's3m', text: 's3m', title: 's3m'},
                      {value: 'data', text: 'data', title: 'data'},
                      {value: 'mvt', text: 'mvt', title: 'mvt'},
                      {value: 'xhr', text: 'xhr', title: 'xhr'},
                      {value: 'scene', text: 'scene', title: 'scene'}]"
                    type="select"
                    placeholder="请选择服务类型"/>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="服务名称" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
                  <a-input v-decorator="['serviceName']" placeholder="请输入服务名称" ></a-input>
                </a-form-item>
              </a-col>
              <a-col :span="24">
                <a-form-item label="服务地址" :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <a-input v-decorator="['serviceAddress']" placeholder="请输入服务地址" ></a-input>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="数据类型" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
                  <!--<a-input v-decorator="['sceneType']" placeholder="请输入数据类型" ></a-input>-->
                  <j-dict-select-tag
                    v-decorator="['sceneType']"
                    :trigger-change="true"
                    :options="[
                      {value: '', text: '无', title: '无'},
                      {value: 's3m矢量', text: 's3m矢量', title: 's3m矢量'},
                      {value: 's3m专题图', text: 's3m专题图', title: 's3m专题图'},
                      {value: 'iserver', text: 'iserver', title: 'iserver'}]"
                    type="select"
                    placeholder="请选择数据类型"/>
                </a-form-item>
              </a-col>
              <a-col :span="24">
                <a-form-item label="数据地址" :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <a-input v-decorator="['dataAddress']" placeholder="请输入数据地址" ></a-input>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="默认开启" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
                  <j-dict-select-tag
                    v-decorator="['show']"
                    :trigger-change="true"
                    :options="[
                      {value: '1', text: '是', title: '是'},
                      {value: '0', text: '否', title: '否'}]"
                    type="radio"
                    placeholder="选择默认开启"/>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="默认缩放层级" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
                  <a-input v-decorator="['defaultZoom']" placeholder="请输入默认缩放层级" ></a-input>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row>
              <a-col :span="12">
                <a-form-item label="最小缩放层级" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
                  <a-input v-decorator="['minZoom']" placeholder="请输入最小缩放层级" ></a-input>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="最大缩放层级" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
                  <a-input v-decorator="['maxZoom']" placeholder="请输入最大缩放层级" ></a-input>
                </a-form-item>
              </a-col>
            </a-row>
          </a-tab-pane>
          <a-tab-pane v-if="true" tab="其他配置" key="4" forceRender>
            <a-row>
              <!--<a-divider>其它配置</a-divider>-->
              <a-col :span="12">
                <a-form-item label="datasource" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
                  <a-input v-decorator="['datasource']" placeholder="请输入datasource" ></a-input>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="dataset" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
                  <a-input v-decorator="['dataset']" placeholder="请输入dataset" ></a-input>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="表名" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
                  <a-input v-decorator="['tableName']" placeholder="请输入表名" ></a-input>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="筛选条件sql" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
                  <a-input v-decorator="['sqlText']" placeholder="请输入筛选条件sql" ></a-input>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="icon名称" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
                  <a-input v-decorator="['iconName']" placeholder="请输入icon名称" ></a-input>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="icon地址" :labelCol="labelCol2" :wrapperCol="wrapperCol2">
                  <a-input v-decorator="['iconUrl']" placeholder="请输入icon地址" ></a-input>
                </a-form-item>
              </a-col>
              <a-col :span="24">
                <a-form-item label="其它文件下载地址" :labelCol="labelCol" :wrapperCol="wrapperCol">
                  <a-input v-decorator="['fileUrlCustomOne']" placeholder="文件下载地址(手动输入)" ></a-input>
                </a-form-item>
              </a-col>
            </a-row>
            <!--动态字段-地图图层名称 BEGIN-->
            <template v-if="form.getFieldValue(dynamicKeyFieldsForLayoutMap[0]).length">
              <div
                v-for="(k, index) in form.getFieldValue(dynamicKeyFieldsForLayoutMap[0])"
                :key="k+dynamicNameSuffixesForLayoutMap[0]">
                <a-row>
                  <a-col :span="24">
                    <!--只展示第一行label-->
                    <a-form-item
                      :labelCol="labelCol"
                      :wrapperCol="wrapperCol"
                      :label="index === 0 ? `地图图层名称` : ' '"
                      :required="false">
                      <!--第一个字段-->
                      <j-dict-select-tag
                        style="width: 20%"
                        v-decorator="[
                          `${k}${dynamicNameSuffixesForLayoutMap[1]}`,
                          {
                            validateTrigger: ['change'],
                            rules: [
                              {
                                required: true,
                                message: '请选择地图图层对应的类型',
                              },
                            ]
                          }
                        ]"
                        @change="(e) => dynamicCalculateMultiFieldsForLayoutMap(e, k, index, dynamicNameSuffixesForLayoutMap[1])"
                        placeholder="未选择"
                        :trigger-change="true"
                        dict-code="sz_draw_type"
                        type="select"
                      />
                      <!--第二个字段-->
                      <a-input
                        style="width: 75%;margin-left: 1vh"
                        v-decorator="[
                          `${k}${dynamicNameSuffixesForLayoutMap[0]}`,
                          {
                            validateTrigger: ['change', 'blur'],
                            rules: [
                              {
                                required: false,
                                message: '请输入地图图层名称',
                              },
                            ]
                          }
                        ]"
                        @change="(e) => dynamicCalculateMultiFieldsForLayoutMap(e.target.value, k, index, dynamicNameSuffixesForLayoutMap[0])"
                        placeholder="未输入名称"
                      />
                      <a-icon
                        style="position: absolute;top: 0.5vh;right: -1.2vw;"
                        v-if="!(formDisabled || viewMode) && form.getFieldValue(dynamicKeyFieldsForLayoutMap[0]).length > 0"
                        class="dynamic-delete-button"
                        type="minus-circle-o"
                        :disabled="false"
                        @click="() => dynamicRemoveMultiFieldsForLayoutMap(k)"
                      />
                      <a-icon
                        style="position: absolute;top: 0.5vh;right: -2.2vw;"
                        v-if="!(formDisabled || viewMode) && (index + 1 === form.getFieldValue(dynamicKeyFieldsForLayoutMap[0]).length)"
                        class="dynamic-add-button"
                        type="plus-circle-o"
                        @click="dynamicAddMultiFieldsForLayoutMap"
                      />
                    </a-form-item>
                  </a-col>
                </a-row>
              </div>
            </template>
            <template v-else>
              <!--动态表单-控制按钮 BEGIN-->
              <a-row>
                <a-col :span="12">
                  <a-form-item
                    label="地图图层名称"
                    :labelCol="labelCol2"
                    :wrapperCol="wrapperCol2">
                    <a-button
                      v-if="!(formDisabled || viewMode)"
                      :disabled="formDisabled || viewMode"
                      type="dashed"
                      style="width: auto"
                      @click="dynamicAddMultiFieldsForLayoutMap">
                      <a-icon type="plus"/>
                      新增地图图层名称
                    </a-button>
                    <a-input v-else v-decorator="[dynamicFieldsForLayoutMap[0]]" placeholder="暂无数据" ></a-input>
                  </a-form-item>
                </a-col>
              </a-row>
              <!--动态表单-控制按钮 END-->
            </template>
            <!--动态字段-地图图层名称 END-->
            <!--动态字段-数据集名称 BEGIN-->
            <template v-if="form.getFieldValue(dynamicKeyFieldsForLayoutDataset[0]).length">
              <div
                v-for="(k, index) in form.getFieldValue(dynamicKeyFieldsForLayoutDataset[0])"
                :key="k+dynamicNameSuffixesForLayoutDataset[0]">
                <a-row>
                  <a-col :span="24">
                    <!--只展示第一行label-->
                    <a-form-item
                      :labelCol="labelCol"
                      :wrapperCol="wrapperCol"
                      :label="index === 0 ? `数据集名称` : ' '"
                      :required="false">
                      <!--第一个字段-->
                      <j-dict-select-tag
                        style="width: 20%"
                        v-decorator="[
                          `${k}${dynamicNameSuffixesForLayoutDataset[1]}`,
                          {
                            validateTrigger: ['change'],
                            rules: [
                              {
                                required: true,
                                message: '请选择数据集对应的类型',
                              },
                            ]
                          }
                        ]"
                        @change="(e) => dynamicCalculateMultiFieldsForLayoutDataset(e, k, index, dynamicNameSuffixesForLayoutDataset[1])"
                        placeholder="未选择"
                        :trigger-change="true"
                        dict-code="sz_draw_type"
                        type="select"
                      />
                      <!--第二个字段-->
                      <a-input
                        style="width: 75%;margin-left: 1vh"
                        v-decorator="[
                          `${k}${dynamicNameSuffixesForLayoutDataset[0]}`,
                          {
                            validateTrigger: ['change', 'blur'],
                            rules: [
                              {
                                required: false,
                                message: '请输入数据集名称',
                              },
                            ]
                          }
                        ]"
                        @change="(e) => dynamicCalculateMultiFieldsForLayoutDataset(e.target.value, k, index, dynamicNameSuffixesForLayoutDataset[0])"
                        placeholder="未输入名称"
                      />
                      <a-icon
                        style="position: absolute;top: 0.5vh;right: -1.2vw;"
                        v-if="!(formDisabled || viewMode) && form.getFieldValue(dynamicKeyFieldsForLayoutDataset[0]).length > 0"
                        class="dynamic-delete-button"
                        type="minus-circle-o"
                        :disabled="false"
                        @click="() => dynamicRemoveMultiFieldsForLayoutDataset(k)"
                      />
                      <a-icon
                        style="position: absolute;top: 0.5vh;right: -2.2vw;"
                        v-if="!(formDisabled || viewMode) && (index + 1 === form.getFieldValue(dynamicKeyFieldsForLayoutDataset[0]).length)"
                        class="dynamic-add-button"
                        type="plus-circle-o"
                        @click="dynamicAddMultiFieldsForLayoutDataset"
                      />
                    </a-form-item>
                  </a-col>
                </a-row>
              </div>
            </template>
            <template v-else>
              <!--动态表单-控制按钮 BEGIN-->
              <a-row>
                <a-col :span="12">
                  <a-form-item
                    label="数据集名称"
                    :labelCol="labelCol2"
                    :wrapperCol="wrapperCol2">
                    <a-button
                      v-if="!(formDisabled || viewMode)"
                      :disabled="formDisabled || viewMode"
                      type="dashed"
                      style="width: auto"
                      @click="dynamicAddMultiFieldsForLayoutDataset">
                      <a-icon type="plus"/>
                      新增数据集名称
                    </a-button>
                    <a-input v-else v-decorator="[dynamicFieldsForLayoutDataset[0]]" placeholder="暂无数据" ></a-input>
                  </a-form-item>
                </a-col>
              </a-row>
              <!--动态表单-控制按钮 END-->
            </template>
            <!--动态字段-数据集名称 END-->
          </a-tab-pane>
        </a-tabs>
      </a-form>
    </j-form-container>
  </a-spin>
</template>

<script>
import { getAction, httpAction } from '@/api/manage'
import { merge, pick } from 'lodash'
import DynamicFormLayoutDataset from './DynamicFormLayoutDataset'
import DynamicFormLayoutMap from './DynamicFormLayoutMap'

export default {
  name: 'LayerModal',
  components: {},
  mixins: [DynamicFormLayoutDataset, DynamicFormLayoutMap],
  props: {
    // 绑定总工程
    project: {
      type: Object,
      default: () => {},
      required: true
    },
    // 绑定根节点(项目)
    rootData: {
      type: Object,
      default: () => ({}),
      required: false
    },
    // 表单禁用
    disabled: {
      type: [Boolean, String],
      default: false,
      required: false
    },
    // 展示模式
    viewMode: {
      type: [Boolean, String],
      default: false,
      required: false
    },
    // 表单data
    formData: {
      type: Object,
      default: () => ({}),
      required: false
    }
  },
  data() {
    return {
      form: this.$form.createForm(this),
      model: {},
      labelCol: {
        xs: { span: 24 },
        sm: { span: 3 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 }
      },
      labelCol2: {
        xs: { span: 24 },
        sm: { span: 6 }
      },
      wrapperCol2: {
        xs: { span: 24 },
        sm: { span: 16 }
      },
      labelCol3: {
        xs: { span: 24 },
        sm: { span: 6 }
      },
      wrapperCol3: {
        xs: { span: 24 },
        sm: { span: 15 }
      },
      confirmLoading: false,
      validatorRules: {
        nodeType: { modelValue: '', rules: [{ required: true, message: '请选择节点类型' }] },
        label: { rules: [{ required: true, message: '请输入名称' }] },
        orderNum: { rules: [{ required: true, message: '请输入排序' }] },
        pid: { rules: [{ required: false, message: '请上传文件' }] },
        projectId: { rules: [{ required: true, message: '必须绑定工程总称' }] },
        gch: { rules: [{ required: false, message: '必须绑定工程号' }] },
        jsdw: { rules: [{ required: false, message: '必须绑定建设单位' }] },
        xmmc: { rules: [{ required: false, message: '必须绑定项目名称' }] }
      },
      url: {
        add: '/om/sz/category/add',
        edit: '/om/sz/category/edit',
        customUploadAction: `${window._CONFIG['domianURL']}/sys/common/upload`
      },
      pidTreeCondition: '',
      activeKey: '1',
      isAdd: false,
      btnLoading: false,
      btnProgress: 100
    }
  },
  computed: {
    formDisabled() {
      return this.disabled
    },
    projectId() {
      return this.project[this.project.projectCallbackFields.idField]
    },
    projectName() {
      return this.project[this.project.projectCallbackFields.nameField]
    },
    tableName() {
      return this.project[this.project.projectCallbackFields.tableName]
    },
    // 项目选择字典的默认条件
    projectDict() {
      const { idField, nameField, tableName } = this.project.projectConfig
      return `${tableName} where del_flag=0,${nameField},${idField}`
    },
    isCadNode() {
      return ['dwg'].includes(this.validatorRules.nodeType.modelValue)
    },
    isProjectNode() {
      return this.validatorRules.nodeType.modelValue === 'project'
    },
    isFolderNode() {
      return this.validatorRules.nodeType.modelValue === 'menu'
    },
    isFileNode() {
      return this.validatorRules.nodeType.modelValue !== 'menu' && this.validatorRules.nodeType.modelValue !== 'project'
    },
    // 切换节点类型，控制住根节点必为项目
    menuTypeOptions() {
      const project = { value: 'project', text: '项目', title: '项目' }
      const menu = { value: 'menu', text: '目录', title: '目录' }
      const file = { value: 'file', text: '文件', title: '文件' }
      const dwg = { value: 'dwg', text: 'dwg', title: 'dwg' }
      const pdf = { value: 'pdf', text: 'pdf', title: 'pdf' }
      if (this.isProjectNode) {
        return [project]
      }
      if (this.isAdd) {
        return [menu, file, pdf, dwg]
      }
      if (this.isFileNode) {
        return [file, pdf, dwg]
      }
      if (this.isFolderNode) {
        return [menu]
      }
      return [menu, file, pdf, dwg]
    }
  },
  watch: {
    // 这里必须等待render因此不放进computed
    'project': {
      handler() {
        // 父id树的默认条件
        this.pidTreeCondition = ''
        this.$nextTick(() => {
          this.pidTreeCondition = JSON.stringify({ project_id: this.projectId })
          this.$nextTick(() => {
            this.form.setFieldsValue({ pid: this.model.pid })
          })
        })
      },
      immediate: true
    },
    formData: {
      handler(v) {
        if (v) {
          this.confirmLoading = true
          this.add(v)
          this.$nextTick(() => {
            this.activeKey = this.isFileNode ? this.isCadNode ? '3' : '2' : '1'
            setTimeout(() => this.confirmLoading = false, 100)
          })
        }
      },
      immediate: true
    }
  },
  created() {
  },
  mounted() {
  },
  methods: {
    onImportCad() {
      if (!this.isCadNode) {
        return
      }
      const filePath = this.form.getFieldValue('download')
      if (!filePath) {
        this.$message.error('请先上传文件')
        this.$refs.importCadBtn.$el.style.display = 'none'
        return
      }
      // 请求立即执行cad导入
      this.$message.success('导入处理中，请耐心等待...')
      this.btnLoading = true
      this.btnProgress = 0
      this.$refs.importCadProgress.$el.style.display = 'block'
      const itv = setInterval(() => {
        this.btnProgress += 1
        if (this.btnProgress >= 99) {
          clearInterval(itv)
        }
      }, 500)
      const pureName = filePath.substring(filePath.lastIndexOf('/') + 1, filePath.lastIndexOf('_'))
      getAction('/om/sz/category/importCad', { filePath, pureName }).then(res => {
        if (res.code === 200) {
          this.$message.success('导入成功')
          this.$refs.importCadBtn.$el.style.display = 'none'
          this.btnProgress = 100
          console.log('导入成功', res.result || {})
          const { serviceType, serviceName, serviceAddress, maxZoom } = res.result
          this.form.setFieldsValue({
            serviceType,
            serviceName,
            serviceAddress,
            maxZoom
          })
          this.activeKey = '3'
        } else {
          throw new Error(res.msg)
        }
      }).catch((err) => {
        this.$message.error(err)
      }).finally(() => {
        clearInterval(itv)
        this.btnLoading = false
        this.btnProgress = 0
        this.$refs.importCadProgress.$el.style.display = 'none'
      })
    },
    onFileChange(e) {
      if (!this.isCadNode) {
        return
      }
      if (e) {
        this.$refs.importCadBtn.$el.style.display = 'inline-block'
        this.btnProgress = 0
      }
    },
    /**
     * 日期选择组件，放进tab组件里，forceRender后，初始化时组件的父节点在页面可视窗口外部，因此定位异常
     * 因此不在这里解决
     * 1.使用v-if渲染tab内部表单
     * 2.使用setFieldsValue重设值
     * 最后发现，是父容器的min-height属性影响，不够时就跳走了，因此稍微拉长就行
     * @returns {Element}
     */
    getCalendarContainer(node) {
      // const node1 = document.querySelector('.ant-calendar-picker')
      // console.log('getCalendarContainer', node, node1, node1.parentNode)
      return node.parentNode
    },
    /**
     * 在类型为项目节点中，需要同时改变xmmc
     * @param xmmc 写label时自动绑定项目名称
     * @param another 写项目名称时自动绑定label
     */
    changeXmmc({ target: { value: xmmc } }, { target: { value: another } }) {
      if (this.isProjectNode) {
        xmmc && this.form.setFieldsValue({ xmmc })
        another && this.form.setFieldsValue({ label: another })
      }
    },
    /**
     * 新增时需要赋予默认值
     * 来自总项目(工程总称)相关
     * 1.projectId 项目id project.id 必须绑定的id
     * 2.gczc 工程总称 同项目名称
     * 3.gch 工程号 取项目.工程号
     * 4.jsdw 建设单位 取项目.建设单位
     * 来自树型图层的第0层根节点(项目名称), 字段名称一致的，去依赖父节点新增时带过来
     * 1.xmmc 项目名称 取图层的第0级节点，依赖父级计算传递
     * 2.xmfzr 项目负责人
     * 3.zyfzr 专业负责人
     * 4.sjr 设计人
     * 5.gczfzr 工程总负责人
     * 6.gcfzr 工程负责人
     * 7.gzfzr 工种负责人
     * 8.zt 制图
     * 9.jd 校对
     * 10.sh 审核
     * 11.sd 审定
     * @param record
     */
    add(record = {}) {
      this.isAdd = true
      this.btnLoading = false
      this.btnProgress = 100
      // 绑定的工程字段
      const { idField, nameField, gchField, jsdwField } = this.project.projectCallbackFields
      const gczcObj = {
        projectId: this.project[idField],
        gczc: this.project[nameField],
        gch: this.project[gchField],
        jsdw: this.project[jsdwField]
      }
      // 绑定的项目字段
      const rootData = this.rootData || {}
      const xmmcObj = {
        xmmc: rootData.label,
        xmfzr: rootData.xmfzr,
        zyfzr: rootData.zyfzr,
        sjr: rootData.sjr,
        gczfzr: rootData.gczfzr,
        gcfzr: rootData.gcfzr,
        gzfzr: rootData.gzfzr,
        zt: rootData.zt,
        jd: rootData.jd,
        sh: rootData.sh,
        sd: rootData.sd
      }
      merge(record, gczcObj, xmmcObj)
      this.edit(record)
    },
    edit(record) {
      this.form.resetFields()
      // 初始化表单类型（节点类型）
      this.validatorRules.nodeType.modelValue = record.nodeType = record.nodeType || 'menu'
      this.model = Object.assign({}, record)
      this.dynamicInitMultiFieldsForLayoutDataset()
      this.dynamicInitMultiFieldsForLayoutMap()
      this.refreshForm()
    },
    refreshForm(newRecord = {}) {
      this.activeKey = '1'
      // 合并已经输入的表单数据
      const curForm = this.form.getFieldsValue()
      const nonNone = {}
      for (const curFormKey in curForm) {
        if (curForm[curFormKey]) {
          nonNone[curFormKey] = curForm[curFormKey]
        }
      }
      Object.assign(this.model, nonNone, newRecord)
      // 服务配置需要的字段
      const layerFields = ['projectId', 'pid', 'orderNum', 'nodeType', 'label', 'defaultZoom', 'minZoom',
        'maxZoom', 'fileUrlCustomOne', 'iconUrl', 'iconName', 'show', 'download',
        'serviceName', 'serviceType', 'serviceAddress', 'sceneType', 'dataAddress',
        'datasource', 'dataset', 'tableName', 'sqlText', 'show',
        'layoutMap', 'layoutDataset', 'layoutMapType', 'layoutDatasetType']
      // 出图需要的字段
      const drawFields = ['title', 'xmfzr', 'zyfzr', 'sjr', 'gczfzr',
        'gcfzr', 'gzfzr', 'zt', 'jd', 'sh', 'sd', 'jsdw',
        'gczc', 'xmmc', 'gch', 'th', 'jieduan', 'tm', 'ctrq',
        'bl', 'yc', 'picture']
      // 渲染表单
      this.$nextTick(() => {
        this.form.setFieldsValue(pick(this.model, [...layerFields, ...drawFields]))
      })
    },
    handleOk() {
      const that = this
      // 触发表单验证
      this.form.validateFields((err, values) => {
        console.log('提交的数据', err, values)
        if (!err) {
          that.confirmLoading = true;
          let isAdd = false
          let httpurl = '';
          let method = '';
          let formData = Object.assign(this.model, values);
          if (!this.model.id) {
            httpurl += this.url.add;
            method = 'post';
            delete formData.id;
            isAdd = true
          } else {
            httpurl += this.url.edit;
            method = 'put';
          }
          console.log('提交的数据', formData)
          httpAction(httpurl, formData, method).then((res) => {
            if (res.success) {
              that.$message.success(res.message);
              that.$emit('ok', res.result, isAdd)
            } else {
              that.$message.warning(res.message);
            }
          }).finally(() => {
            that.confirmLoading = false;
          })
        }
      })
    }
  }
}
</script>
<style lang="less" scoped>
// 优化表单禁用效果
/deep/ .view-mode {
  .ant-form-item-control {
    cursor: not-allowed !important;
  }
  .ant-form-item-label {
    pointer-events: none !important;
    label {
      //color: rgba(51, 59, 59, 0.5) !important;
      color: rgba(0, 0, 0, 0.5) !important;
    }
  }
  input,
  .ant-calendar-picker,
  .ant-select,
  .ant-select-selection {
    border: none !important;
    pointer-events: none !important;
    cursor: not-allowed !important;
  }
}

/deep/ .ant-form-item {
  margin-bottom: 1vh;
}

// 表单form-item对齐长label
/deep/ .ant-form-item-label {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  line-height: 20px;
  margin-top: .8vh;
  margin-left: 1.5vh;
  margin-right: 1vh;
  padding-left: 0;
  label {
    //这是关键
    white-space: normal;
    text-align: left;
    //color: #909399;
    //color: rgba(51, 59, 59, 0.5);
    width: auto;
    // padding-right: 32px;
    font-size: 1.4vh;
    &:after {
      content: none !important; //解决上面的样式label后面会有空格
    }
  }
  // 绝对定位必填*号
  overflow: visible;
  label {
    overflow: visible;
  }
  .ant-form-item-required {
    position: relative;
    &::before {
      display: inline-block;
      margin-right: 4px;
      color: #f5222d;
      font-size: 14px;
      font-family: SimSun, sans-serif;
      line-height: 1;
      content: '*';
      position: absolute;
      left: -12px;
      top: 3px;
    }
  }
}
</style>
