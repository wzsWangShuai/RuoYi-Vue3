import request from '@/utils/request'

// 查询里程碑管理列表
export function listMilestone(query) {
  return request({
    url: '/project/milestone/list',
    method: 'get',
    params: query
  })
}

// 查询里程碑管理详细
export function getMilestone(milestoneId) {
  return request({
    url: '/project/milestone/' + milestoneId,
    method: 'get'
  })
}

// 新增里程碑管理
export function addMilestone(data) {
  return request({
    url: '/project/milestone',
    method: 'post',
    data: data
  })
}

// 修改里程碑管理
export function updateMilestone(data) {
  return request({
    url: '/project/milestone',
    method: 'put',
    data: data
  })
}

// 删除里程碑管理
export function delMilestone(milestoneId) {
  return request({
    url: '/project/milestone/' + milestoneId,
    method: 'delete'
  })
}

// 查询项目下拉树结构
export function projTreeSelect() {
  return request({
    url: '/project/task/projTree',
    method: 'get'
  })
}

// 查询任务管理列表
export function listTask(query) {
  return request({
    url: '/project/task/list',
    method: 'get',
    params: query
  })
}
