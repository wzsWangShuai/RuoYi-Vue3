import request from '@/utils/request.js'

// 查询任务分配历史列表
export function listHistory(query) {
  return request({
    url: '/project/task/history/list',
    method: 'get',
    params: query
  })
}

// 查询任务分配历史详细
export function getHistory(historyId) {
  return request({
    url: '/project/task/history/' + historyId,
    method: 'get'
  })
}

// 新增任务分配历史
export function addHistory(data) {
  return request({
    url: '/project/task/history',
    method: 'post',
    data: data
  })
}

// 修改任务分配历史
export function updateHistory(data) {
  return request({
    url: '/project/task/history',
    method: 'put',
    data: data
  })
}

// 删除任务分配历史
export function delHistory(historyId) {
  return request({
    url: '/project/task/history/' + historyId,
    method: 'delete'
  })
}
