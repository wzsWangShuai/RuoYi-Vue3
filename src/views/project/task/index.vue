<template>
  <div class="app-container">
    <el-row :gutter="20">
      <splitpanes :horizontal="appStore.device === 'mobile'" class="default-theme">
        <!--项目数据-->
        <pane size="16">
          <el-col>
            <div class="head-container">
              <el-input v-model="projName" placeholder="请输入项目名称" clearable prefix-icon="Search" style="margin-bottom: 20px" />
            </div>
            <div class="head-container">
              <el-tree :data="projMilestoneOptions" :props="{ label: 'label', children: 'children' }" :expand-on-click-node="false" :filter-node-method="filterNode" ref="projTreeRef" node-key="id" highlight-current default-expand-all @node-click="handleNodeClick" />
            </div>
          </el-col>
        </pane>
        <!--任务数据-->
        <pane size="84">
          <el-col>
            <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="83px">
              <el-form-item label="任务名称" prop="taskName">
                <el-input
                    v-model="queryParams.taskName"
                    placeholder="请输入任务名称"
                    clearable
                    @keyup.enter="handleQuery"
                />
              </el-form-item>
              <el-form-item label="负责人" prop="ownerId">
                <el-input
                    v-model="queryParams.ownerId"
                    placeholder="请输入负责人"
                    clearable
                    @keyup.enter="handleQuery"
                />
              </el-form-item>
              <el-form-item label="优先级" prop="priority">
                <el-select v-model="queryParams.priority" placeholder="请选择优先级" clearable>
                  <el-option
                      v-for="dict in task_priority"
                      :key="dict.value"
                      :label="dict.label"
                      :value="dict.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="状态" prop="status" class="break-line">
                <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
                  <el-option
                      v-for="dict in task_status"
                      :key="dict.value"
                      :label="dict.label"
                      :value="dict.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="计划开始时间" prop="planStartDate" label-width="96px">
                <el-date-picker clearable
                                v-model="queryParams.planStartDate"
                                type="date"
                                value-format="YYYY-MM-DD"
                                placeholder="选择计划开始时间">
                </el-date-picker>
              </el-form-item>
              <el-form-item label="计划结束时间" prop="planEndDate" label-width="96px">
                <el-date-picker clearable
                                v-model="queryParams.planEndDate"
                                type="date"
                                value-format="YYYY-MM-DD"
                                placeholder="选择计划结束时间">
                </el-date-picker>
              </el-form-item>
              <el-form-item label="实际完成时间" prop="actualEndDate" label-width="96px">
                <el-date-picker clearable
                                v-model="queryParams.actualEndDate"
                                type="date"
                                value-format="YYYY-MM-DD"
                                placeholder="选择实际完成时间">
                </el-date-picker>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                <el-button icon="Refresh" @click="resetQuery">重置</el-button>
              </el-form-item>
            </el-form>

            <el-row :gutter="10" class="mb8">
              <el-col :span="1.5">
                <el-button
                    type="primary"
                    plain
                    icon="Plus"
                    @click="handleAdd"
                    v-hasPermi="['project:task:add']"
                >新增</el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button
                    type="info"
                    plain
                    icon="Sort"
                    @click="toggleExpandAll"
                >展开/折叠</el-button>
              </el-col>
              <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
            </el-row>

            <el-table
                v-if="refreshTable"
                v-loading="loading"
                :data="taskList"
                row-key="taskId"
                :default-expand-all="isExpandAll"
                :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
            >
              <el-table-column label="任务名称" align="center" prop="taskName">
                <template #default="scope">
                  <router-link :to="'/project/task-history/index/' + scope.row.taskId" class="link-type">
                    <span>{{ scope.row.taskName }}</span>
                  </router-link>
                </template>
              </el-table-column>
              <el-table-column label="任务描述" align="center" prop="description" show-overflow-tooltip />
              <el-table-column label="负责人" align="center" prop="ownerId" />
              <el-table-column label="优先级" align="center" prop="priority">
                <template #default="scope">
                  <dict-tag :options="task_priority" :value="scope.row.priority"/>
                </template>
              </el-table-column>
              <el-table-column label="状态" align="center" prop="status">
                <template #default="scope">
                  <dict-tag :options="task_status" :value="scope.row.status"/>
                </template>
              </el-table-column>
              <el-table-column label="计划开始时间" align="center" prop="planStartDate" width="180">
                <template #default="scope">
                  <span>{{ parseTime(scope.row.planStartDate, '{y}-{m}-{d}') }}</span>
                </template>
              </el-table-column>
              <el-table-column label="计划结束时间" align="center" prop="planEndDate" width="180">
                <template #default="scope">
                  <span>{{ parseTime(scope.row.planEndDate, '{y}-{m}-{d}') }}</span>
                </template>
              </el-table-column>
              <el-table-column label="实际完成时间" align="center" prop="actualEndDate" width="180">
                <template #default="scope">
                  <span>{{ parseTime(scope.row.actualEndDate, '{y}-{m}-{d}') }}</span>
                </template>
              </el-table-column>
              <el-table-column label="预估工时" align="center" prop="estimatedHours" />
              <el-table-column label="实际工时" align="center" prop="actualHours" />
              <el-table-column label="完成进度" align="center">
                <template #default="scope">
                  <el-progress :percentage="scope.row.taskSchedule" :color="progressColor(scope.row.taskSchedule)" />
                </template>
              </el-table-column>
              <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template #default="scope">
                  <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['project:task:edit']">修改</el-button>
                  <el-button link type="primary" icon="Plus" @click="handleAdd(scope.row)" v-hasPermi="['project:task:add']">新增</el-button>
                  <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['project:task:remove']">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
        </pane>
      </splitpanes>
    </el-row>
    <!-- 添加或修改任务管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="taskRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="上级任务" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="taskOptions"
            :props="{ value: 'taskId', label: 'taskName', children: 'children' }"
            value-key="taskId"
            placeholder="请选择父任务"
            check-strictly
          />
        </el-form-item>
        <el-form-item label="前置任务" prop="dependencyId">
          <el-tree-select
              v-model="form.dependencyId"
              :data="taskOptions"
              :props="{ value: 'taskId', label: 'taskName', children: 'children' }"
              value-key="taskId"
              placeholder="请选择前置任务"
              check-strictly
              clearable
              :multiple="false"
          />
        </el-form-item>
        <el-form-item label="所属项目" prop="projId">
          <el-select v-model="form.projId" placeholder="请选择所属项目">
            <el-option
                v-for="proj in projOptions"
                :key="proj.id"
                :label="proj.label"
                :value="proj.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="任务名称" prop="taskName">
          <el-input v-model="form.taskName" placeholder="请输入任务名称" @blur="generateDesc" />
        </el-form-item>
        <el-form-item label="任务描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="负责人" prop="ownerId">
          <el-input v-model="form.ownerId" placeholder="请输入负责人工号" />
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-select v-model="form.priority" placeholder="请选择优先级">
            <el-option
              v-for="dict in task_priority"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态" clearable>
            <el-option
                v-for="dict in task_status"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="开始时间" prop="planStartDate">
          <el-date-picker clearable
            v-model="form.planStartDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择计划开始时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间" prop="planEndDate">
          <el-date-picker clearable
            v-model="form.planEndDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择计划结束时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="完成时间" prop="actualEndDate">
          <el-date-picker clearable
            v-model="form.actualEndDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择实际完成时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="预估工时" prop="estimatedHours">
          <el-input v-model="form.estimatedHours" placeholder="请输入预估工时" />
        </el-form-item>
        <el-form-item label="实际工时" prop="actualHours">
          <el-input v-model="form.actualHours" placeholder="请输入实际工时" />
        </el-form-item>
        <el-form-item label="任务进度" prop="taskSchedule">
          <el-slider
              v-model="form.taskSchedule"
              :min="0"
              :max="100"
              :step="1"
              show-input
              input-size="small"
              :format-tooltip="formatTooltip"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Task">
import { listTask, getTask, delTask, addTask, updateTask, projMilestoneTreeSelect, projTreeSelect, generateDescription } from "@/api/project/task/task";
import {Pane, Splitpanes} from "splitpanes";
import "splitpanes/dist/splitpanes.css";
import useAppStore from "@/store/modules/app.js";
import axios from "axios";

const appStore = useAppStore();
const { proxy } = getCurrentInstance();
const { task_status, task_priority } = proxy.useDict('task_status', 'task_priority');

const taskList = ref([]);
const taskOptions = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const title = ref("");
const isExpandAll = ref(true);
const refreshTable = ref(true);
const projName = ref("");
const projOptions = ref(undefined);
const projMilestoneOptions = ref(undefined);

/** 通过条件过滤节点  */
const filterNode = (value, data) => {
  if (!value) return true;
  return data.label.indexOf(value) !== -1;
};

/** 根据名称筛选部门树 */
watch(projName, val => {
  proxy.$refs["projTreeRef"].filter(val);
});

const data = reactive({
  form: {
    taskId: null,
    parentId: null,
    projId: null,
    taskName: null,
    description: null,
    ownerId: null,
    priority: null,
    status: null,
    planStartDate: null,
    planEndDate: null,
    actualEndDate: null,
    estimatedHours: null,
    actualHours: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    taskSchedule: 0,
    dependencyId: null
  },
  queryParams: {
    taskName: null,
    ownerId: null,
    priority: null,
    status: null,
    planStartDate: null,
    planEndDate: null,
    actualEndDate: null,
  },
  rules: {
    parentId: [
      { required: true, message: "父任务不能为空", trigger: "blur" }
    ],
    projId: [
      { required: true, message: "所属项目不能为空", trigger: "blur" }
    ],
    taskName: [
      { required: true, message: "任务名称不能为空", trigger: "blur" }
    ],
    ownerId: [
      { required: true, message: "负责人不能为空", trigger: "change" },
      { pattern: /^\d+$/, message: "负责人工号必须为数字", trigger: "blur" }
    ],
    priority: [
      { required: true, message: "优先级不能为空", trigger: "change" }
    ],
    status: [
      { required: true, message: "状态不能为空", trigger: "change" }
    ],
    createBy: [
      { required: true, message: "创建者不能为空", trigger: "blur" }
    ],
    createTime: [
      { required: true, message: "创建时间不能为空", trigger: "blur" }
    ],
    updateBy: [
      { required: true, message: "更新者不能为空", trigger: "blur" }
    ],
    updateTime: [
      { required: true, message: "更新时间不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 监听 status 的变化 */
watch(
    () => form.value.status,
    (newStatus) => {
      if (newStatus === '3') {
        form.value.taskSchedule = 100; // 自动设置任务进度为 100
      }
    }
);

/** 查询任务管理列表 */
function getList() {
  loading.value = true;
  listTask(queryParams.value).then(response => {
    taskList.value = proxy.handleTree(response.data, "taskId", "parentId");
    loading.value = false;
  });
}

function formatTooltip(value) {
  return `${value}%`;
}

/** 查询项目里程下拉树结构 */
function getProjMilestoneTree() {
  projMilestoneTreeSelect().then(response => {
    projMilestoneOptions.value = response.data;
  });
};
/** 查询项目下拉树结构 */
function getProjTree() {
  projTreeSelect().then(response => {
    projOptions.value = response.data;
  });
};

/** 查询任务管理下拉树结构 */
function getTreeselect() {
  listTask().then(response => {
    taskOptions.value = [];
    const data = { taskId: 0, taskName: '顶级节点', children: [] };
    data.children = proxy.handleTree(response.data, "taskId", "parentId");
    taskOptions.value.push(data);
  });
}
	
// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    taskId: null,
    parentId: null,
    projId: null,
    taskName: null,
    description: null,
    ownerId: null,
    priority: null,
    status: null,
    planStartDate: null,
    planEndDate: null,
    actualEndDate: null,
    estimatedHours: null,
    actualHours: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    taskSchedule: 0,
    dependencyId: null
  };
  proxy.resetForm("taskRef");
}

/** 节点单击事件 */
function handleNodeClick(data) {
  const parentId = findParentId(projMilestoneOptions.value, data.id, data.label);
  queryParams.value.projId = parentId;
  handleQuery();
};

/** 递归查找父节点 ID */
function findParentId(nodes, targetId, targetName, currentParentId = null) {
  for (const node of nodes) {
    if (node.id === targetId && node.label === targetName) {
      if (currentParentId) {
        return currentParentId;
      } else {
        queryParams.value.milestoneId = null;
        return targetId;
      }
    }
    if (node.children && node.children.length > 0) {
      const foundId = findParentId(node.children, targetId, targetName, node.id);
      if (foundId) {
        queryParams.value.milestoneId = targetId;
        return foundId;
      }
    }
  }
}

function progressColor(percentage) {
  if (percentage < 30) {
    return '#F56C6C'; // 红色
  } else if (percentage < 70) {
    return '#E6A23C'; // 橙色
  } else {
    return '#67C23A'; // 绿色
  }
}

async function generateDesc() {
  // 验证 form.value 是否存在且为对象
  if (!form.value || typeof form.value !== 'object' || !form.value.taskName) {
    return;
  }

  try {
    const response = await generateDescription({taskName: form.value.taskName}, {timeout: 60000});

    // 防止 XSS 攻击，对描述进行转义（假设有一个 escapeHtml 函数）
    form.value.description = response.data.description; // 设置生成的任务描述
  } catch (error) {
    console.error("生成任务描述失败", error);

    // 提取硬编码字符串
    const errorMessage = "生成任务描述失败，请稍后再试";
    alert(errorMessage);
  }
};


/** 搜索按钮操作 */
function handleQuery() {
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  proxy.$refs.projTreeRef.setCurrentKey(null);
  queryParams.value.projId = null;
  queryParams.value.milestoneId = null;
  handleQuery();
}

/** 新增按钮操作 */
function handleAdd(row) {
  reset();
  getTreeselect();
  if (row != null && row.taskId) {
    form.value.parentId = row.taskId;
  } else {
    form.value.parentId = 0;
  }
  open.value = true;
  title.value = "添加任务管理";
}

/** 展开/折叠操作 */
function toggleExpandAll() {
  refreshTable.value = false;
  isExpandAll.value = !isExpandAll.value;
  nextTick(() => {
    refreshTable.value = true;
  });
}

/** 修改按钮操作 */
async function handleUpdate(row) {
  reset();
  await getTreeselect();
  if (row != null) {
    form.value.parentId = row.parentId;
  }
  getTask(row.taskId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改任务管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["taskRef"].validate(valid => {
    if (valid) {
      if (form.value.taskId != null) {
        updateTask(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addTask(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  proxy.$modal.confirm('是否确认删除任务管理编号为"' + row.taskId + '"的数据项？').then(function() {
    return delTask(row.taskId);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}
getProjMilestoneTree();
getProjTree();
getList();
</script>

<style scoped>
.break-line {
  margin-left: auto; /* 将该表单项推到行尾 */
}

.el-form-item + .el-form-item {
  margin-left: 0; /* 确保其他表单项不被推到行尾 */
}

.el-form-item:last-child {
  margin-left: 0; /* 确保最后一个表单项不被推到行尾 */
}
</style>
