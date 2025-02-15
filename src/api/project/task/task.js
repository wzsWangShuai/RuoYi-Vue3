import request from '@/utils/request.js'

// 查询任务管理列表
export function listTask(query) {
  return request({
    url: '/project/task/list',
    method: 'get',
    params: query
  })
}

// 查询任务管理详细
export function getTask(taskId) {
  return request({
    url: '/project/task/' + taskId,
    method: 'get'
  })
}

// 新增任务管理
export function addTask(data) {
  return request({
    url: '/project/task',
    method: 'post',
    data: data
  })
}

// 修改任务管理
export function updateTask(data) {
  return request({
    url: '/project/task',
    method: 'put',
    data: data
  })
}

// 删除任务管理
export function delTask(taskId) {
  return request({
    url: '/project/task/' + taskId,
    method: 'delete'
  })
}

// 查询项目里程碑下拉树结构
export function projMilestoneTreeSelect() {
  return request({
    url: '/project/task/projMilestoneTree',
    method: 'get'
  })
}

// 查询项目下拉树结构
export function projTreeSelect() {
  return request({
    url: '/project/task/projTree',
    method: 'get'
  })
}