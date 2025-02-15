<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="84px">
      <el-form-item label="所属项目ID" prop="projId">
        <el-input
          v-model="queryParams.projId"
          placeholder="请输入所属项目ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="里程碑名称" prop="milestoneName">
        <el-input
          v-model="queryParams.milestoneName"
          placeholder="请输入里程碑名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="截止时间" prop="deadline">
        <el-date-picker clearable
          v-model="queryParams.deadline"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="选择截止时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option
            v-for="dict in milestone_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
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
          v-hasPermi="['project:milestone:add']"
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
      :data="milestoneList"
      row-key="milestoneId"
      :default-expand-all="isExpandAll"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column label="所属项目ID" prop="projId" />
      <el-table-column label="里程碑名称" align="center" prop="milestoneName">
        <template #default="scope">
          <router-link :to="'/project/milestone-milestoneTask/index/' + scope.row.milestoneId" class="link-type">
            <span>{{ scope.row.milestoneName }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="里程碑描述" align="center" prop="description" />
      <el-table-column label="截止时间" align="center" prop="deadline" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.deadline, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="milestone_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['project:milestone:edit']">修改</el-button>
          <el-button link type="primary" icon="Plus" @click="handleAdd(scope.row)" v-hasPermi="['project:milestone:add']">新增</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['project:milestone:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改里程碑管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="milestoneRef" :model="form" :rules="rules" label-width="80px">
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
        <el-form-item label="包含任务ID" prop="taskIds">
          <el-tree-select
              v-model="form.taskIds"
              :data="taskOptions"
              :props="{ value: 'taskId', label: 'taskName', children: 'children' }"
              value-key="taskId"
              placeholder="请选择任务ID"
              check-strictly
              multiple
              @change="handleTaskChange"
          />
        </el-form-item>
        <el-form-item label="里程碑名称" prop="milestoneName">
          <el-input v-model="form.milestoneName" placeholder="请输入里程碑名称" />
        </el-form-item>
        <el-form-item label="里程碑描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="截止时间" prop="deadline">
          <el-date-picker clearable
            v-model="form.deadline"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择截止时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in milestone_status"
              :key="dict.value"
              :label="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="删除标志" prop="delFlag">
          <el-input v-model="form.delFlag" placeholder="请输入删除标志" />
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

<script setup name="Milestone">
import { listMilestone, getMilestone, delMilestone, addMilestone, updateMilestone, projTreeSelect, listTask } from "@/api/project/milestone";

const { proxy } = getCurrentInstance();
const { milestone_status } = proxy.useDict('milestone_status');

const milestoneList = ref([]);
const milestoneOptions = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const title = ref("");
const isExpandAll = ref(true);
const refreshTable = ref(true);
const projOptions = ref(undefined);
const taskOptions = ref([]);

const data = reactive({
  form: {},
  queryParams: {
    projId: null,
    milestoneName: null,
    description: null,
    deadline: null,
    status: null,
  },
  rules: {
    projId: [
      { required: true, message: "所属项目ID不能为空", trigger: "blur" }
    ],
    milestoneName: [
      { required: true, message: "里程碑名称不能为空", trigger: "blur" }
    ],
    deadline: [
      { required: true, message: "截止时间不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "状态不能为空", trigger: "change" }
    ],
    delFlag: [
      { required: true, message: "删除标志不能为空", trigger: "blur" }
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

/** 查询里程碑管理列表 */
function getList() {
  loading.value = true;
  listMilestone(queryParams.value).then(response => {
    milestoneList.value = proxy.handleTree(response.data, "milestoneId", "parentId");
    loading.value = false;
  });
}

/** 查询里程碑管理下拉树结构 */
function getTreeselect() {
  listMilestone().then(response => {
    milestoneOptions.value = [];
    const data = { milestoneId: 0, milestoneName: '请展开选择', children: [] };
    data.children = proxy.handleTree(response.data, "milestoneId", "parentId");
    milestoneOptions.value.push(data);
  });
}

/** 查询任务管理下拉树结构 */
function getTaskTreeselect() {
  listTask().then(response => {
    taskOptions.value = [];
    const data = { taskId: 0, taskName: '请展开选择', children: [] };
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
    milestoneId: null,
    projId: null,
    taskIds: null,
    milestoneName: null,
    description: null,
    deadline: null,
    status: null,
    delFlag: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  };
  proxy.resetForm("milestoneRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

/** 新增按钮操作 */
function handleAdd(row) {
  reset();
  getTreeselect();
  getTaskTreeselect();
  if (row != null && row.milestoneId) {
    form.value.projId = row.milestoneId;
  } else {
    form.value.projId = null;
  }
  open.value = true;
  title.value = "添加里程碑管理";
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
  await getTaskTreeselect();
  if (row != null) {
    form.value.projId = row.projId;
  }
  getMilestone(row.milestoneId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改里程碑管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["milestoneRef"].validate(valid => {
    if (valid) {
      if (form.value.milestoneId != null) {
        updateMilestone(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addMilestone(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除里程碑管理编号为"' + row.milestoneId + '"的数据项？').then(function() {
    return delMilestone(row.milestoneId);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}
/** 查询项目下拉树结构 */
function getProjTree() {
  projTreeSelect().then(response => {
    projOptions.value = response.data;
  });
};

function handleTaskChange(selectedIds) {
  this.form.taskIds = selectedIds.join(',');
};

getProjTree();
getList();
</script>
