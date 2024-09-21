import { getAction, deleteAction, putAction, postAction, httpAction } from '@/api/manage'
import Vue from 'vue'
import {UI_CACHE_DB_DICT_DATA } from "@/store/mutation-types"

// 资源图层
const getResourceLayerTree = (params)=>getAction("/business/resourceLayer/tree",params);
const submitResourceLayer = (params)=>postAction("/business/resourceLayer/submit",params);
const queryGrantTree = (params)=>getAction("/business/resourceLayer/grant-tree",params);
const queryRoleTreeKeys = (params)=>getAction("/business/resourceLayer/role-tree-keys",params);
//视频列表
const submitVideo = (params)=>postAction("/business/video/submit",params);
const queryVideoGrantTree = (params)=>getAction("/business/video/grant-video-list",params);
const queryVideoRoleTreeKeys = (params)=>getAction("/business/video/role-keys",params);
//pad权限
const getAppRoleTree = (params)=>getAction("/business/appRole/list",params);
const submitAppRole = (params)=>postAction("/business/appRole/submit",params);
const grantLayer = (params)=>postAction("/business/appRole/grantLayer",params);
const grantVideo = (params)=>postAction("/business/appRole/grantVideo",params);

const getRoleTree = (params)=>getAction("/business/appRole/tree",params);
// appDingUser
const updateDingUser = (params)=>postAction("/appUser/update",params);
// map
const submitMapUser = (params)=>postAction("/business/mapApp/submit",params);
// field
const getFieldList = (params)=>getAction("/business/fieldLayer/getByLayerId",params);
const submitField = (params)=>postAction("/business/fieldLayer/updateList",params);
//file
const getFileList = (params)=>getAction("/business/resourceFile/getByLayerId",params);
const submitFile = (params)=>postAction("/business/resourceFile/updateList",params);
const deleteFile = (params)=>postAction("/business/resourceFile/remove",params);
//dataInterface
const getDataInterfaceTree = (params)=>getAction("/business/dataInterface/tree",params);
const submitDataInterface = (params)=>postAction("/business/dataInterface/submit",params);
//data org role
const getDingOrgTree = (params)=>getAction("/organization/tree",params);
const queryDepartPermission = (params)=>getAction("/business/diRoleOrg/getRoleByOrg",params);
const saveDepartPermission = (params)=>postAction("/business/diRoleOrg/save",params);
export {
  getResourceLayerTree,
  submitResourceLayer,
  queryGrantTree,
  queryRoleTreeKeys,

  submitVideo,
  queryVideoGrantTree,
  queryVideoRoleTreeKeys,

  getAppRoleTree,
  submitAppRole,
  grantLayer,
  grantVideo,
  getRoleTree,
  updateDingUser,

  submitMapUser,
  getFieldList,
  submitField,
  getFileList,
  submitFile,
  deleteFile,

  getDataInterfaceTree,
  submitDataInterface,
  getDingOrgTree,
  queryDepartPermission,
  saveDepartPermission,
}