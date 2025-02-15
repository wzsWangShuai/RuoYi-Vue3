import request from '@/utils/request'

// 查询任务依赖关系列表
export function listTaskDependency(query) {
  return request({
    url: '/project/taskDependency/list',
    method: 'get',
    params: query
  })
}

// 查询任务依赖关系详细
export function getTaskDependency(id) {
  return request({
    url: '/project/taskDependency/' + id,
    method: 'get'
  })
}

// 新增任务依赖关系
export function addTaskDependency(data) {
  return request({
    url: '/project/taskDependency',
    method: 'post',
    data: data
  })
}

// 修改任务依赖关系
export function updateTaskDependency(data) {
  return request({
    url: '/project/taskDependency',
    method: 'put',
    data: data
  })
}

// 删除任务依赖关系
export function delTaskDependency(id) {
  return request({
    url: '/project/taskDependency/' + id,
    method: 'delete'
  })
}
