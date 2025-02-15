<template>
  <div class="app-container">

    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="任务名称" prop="taskName">
        <el-input
            v-model="queryParams.taskName"
            placeholder="请输入任务名称"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="负责人ID" prop="ownerId">
        <el-input
            v-model="queryParams.ownerId"
            placeholder="请输入负责人ID"
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
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option
              v-for="dict in task_status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="计划开始时间" prop="planStartDate">
        <el-date-picker clearable
                        v-model="queryParams.planStartDate"
                        type="date"
                        value-format="YYYY-MM-DD"
                        placeholder="选择计划开始时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="计划结束时间" prop="planEndDate">
        <el-date-picker clearable
                        v-model="queryParams.planEndDate"
                        type="date"
                        value-format="YYYY-MM-DD"
                        placeholder="选择计划结束时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="实际完成时间" prop="actualEndDate">
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
      <el-table-column label="任务描述" align="center" prop="description" />
      <el-table-column label="负责人ID" align="center" prop="ownerId" />
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
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['project:task:edit']">修改</el-button>
          <el-button link type="primary" icon="Plus" @click="handleAdd(scope.row)" v-hasPermi="['project:task:add']">新增</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['project:task:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改任务管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="taskRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="父任务ID" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="taskOptions"
            :props="{ value: 'taskId', label: 'taskName', children: 'children' }"
            value-key="taskId"
            placeholder="请选择父任务ID"
            check-strictly
          />
        </el-form-item>
        <el-form-item label="所属项目ID" prop="projId">
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
          <el-input v-model="form.taskName" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="任务描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="负责人ID" prop="ownerId">
          <el-input v-model="form.ownerId" placeholder="请输入负责人ID" />
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
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in task_status"
              :key="dict.value"
              :label="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="计划开始时间" prop="planStartDate">
          <el-date-picker clearable
            v-model="form.planStartDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择计划开始时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="计划结束时间" prop="planEndDate">
          <el-date-picker clearable
            v-model="form.planEndDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择计划结束时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="实际完成时间" prop="actualEndDate">
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

<script setup name="MilestoneTask">
import { listTask, getTask, delTask, addTask, updateTask, projMilestoneTreeSelect, projTreeSelect } from "@/api/project/task/task";
import {Pane, Splitpanes} from "splitpanes";
import "splitpanes/dist/splitpanes.css";
import useAppStore from "@/store/modules/app.js";

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
const route = useRoute();

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
  form: {},
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
      { required: true, message: "父任务ID不能为空", trigger: "blur" }
    ],
    projId: [
      { required: true, message: "所属项目ID不能为空", trigger: "blur" }
    ],
    taskName: [
      { required: true, message: "任务名称不能为空", trigger: "blur" }
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

function handleQueryParams(milestoneId) {
  queryParams.value.pageNum = 1;
  queryParams.value.milestoneId = milestoneId;
}
/** 查询任务管理列表 */
function getList() {
  loading.value = true;
  listTask(queryParams.value).then(response => {
    taskList.value = proxy.handleTree(response.data, "taskId", "parentId");
    loading.value = false;
  });
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
    updateTime: null
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

/** 搜索按钮操作 */
function handleQuery() {
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  proxy.$refs.projTreeRef.setCurrentKey(null);
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

handleQueryParams(route.params.milestoneId);
getProjMilestoneTree();
getProjTree();
getList();
</script>
