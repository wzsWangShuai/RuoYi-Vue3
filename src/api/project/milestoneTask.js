import request from '@/utils/request'

// 查询里程碑-任务关联列表
export function listMilestoneTask(query) {
  return request({
    url: '/project/milestoneTask/list',
    method: 'get',
    params: query
  })
}

// 查询里程碑-任务关联详细
export function getMilestoneTask(id) {
  return request({
    url: '/project/milestoneTask/' + id,
    method: 'get'
  })
}

// 新增里程碑-任务关联
export function addMilestoneTask(data) {
  return request({
    url: '/project/milestoneTask',
    method: 'post',
    data: data
  })
}

// 修改里程碑-任务关联
export function updateMilestoneTask(data) {
  return request({
    url: '/project/milestoneTask',
    method: 'put',
    data: data
  })
}

// 删除里程碑-任务关联
export function delMilestoneTask(id) {
  return request({
    url: '/project/milestoneTask/' + id,
    method: 'delete'
  })
}
