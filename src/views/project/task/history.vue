<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="83px">
      <el-form-item label="任务ID" prop="taskId">
        <el-input
          v-model="queryParams.taskId"
          placeholder="请输入任务ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="被分配人ID" prop="assignedTo">
        <el-input
          v-model="queryParams.assignedTo"
          placeholder="请输入被分配人ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="分配人" prop="assignedBy">
        <el-input
          v-model="queryParams.assignedBy"
          placeholder="请输入分配人"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="分配时间" prop="assignedTime">
        <el-date-picker clearable
          v-model="queryParams.assignedTime"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择分配时间">
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
          v-hasPermi="['project:history:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['project:history:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['project:history:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['project:history:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="historyList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="历史记录ID" align="center" prop="historyId" />
      <el-table-column label="任务ID" align="center" prop="taskId" />
      <el-table-column label="被分配人ID" align="center" prop="assignedTo" />
      <el-table-column label="分配人" align="center" prop="assignedBy" />
      <el-table-column label="分配时间" align="center" prop="assignedTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.assignedTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remarks" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['project:history:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['project:history:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改任务分配历史对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="historyRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="任务ID" prop="taskId">
          <el-input v-model="form.taskId" placeholder="请输入任务ID" />
        </el-form-item>
        <el-form-item label="被分配人ID" prop="assignedTo">
          <el-input v-model="form.assignedTo" placeholder="请输入被分配人ID" />
        </el-form-item>
        <el-form-item label="分配人" prop="assignedBy">
          <el-input v-model="form.assignedBy" placeholder="请输入分配人" />
        </el-form-item>
        <el-form-item label="分配时间" prop="assignedTime">
          <el-date-picker clearable
            v-model="form.assignedTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择分配时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input v-model="form.remarks" type="textarea" placeholder="请输入内容" />
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

<script setup name="History">
import { listHistory, getHistory, delHistory, addHistory, updateHistory } from "@/api/project/task/history.js";

const { proxy } = getCurrentInstance();

const historyList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const route = useRoute();

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    taskId: null,
    assignedTo: null,
    assignedBy: null,
    assignedTime: null,
  },
  rules: {
    taskId: [
      { required: true, message: "任务ID不能为空", trigger: "blur" }
    ],
    assignedTo: [
      { required: true, message: "被分配人ID不能为空", trigger: "blur" }
    ],
    assignedBy: [
      { required: true, message: "分配人不能为空", trigger: "blur" }
    ],
    assignedTime: [
      { required: true, message: "分配时间不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

function handleQueryParams(taskId) {
  queryParams.value.pageNum = 1;
  queryParams.value.taskId = taskId;
}

/** 查询任务分配历史列表 */
function getList() {
  loading.value = true;
  listHistory(queryParams.value).then(response => {
    historyList.value = response.rows;
    total.value = response.total;
    loading.value = false;
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
    historyId: null,
    taskId: null,
    assignedTo: null,
    assignedBy: null,
    assignedTime: null,
    remarks: null
  };
  proxy.resetForm("historyRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.historyId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加任务分配历史";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _historyId = row.historyId || ids.value
  getHistory(_historyId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改任务分配历史";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["historyRef"].validate(valid => {
    if (valid) {
      if (form.value.historyId != null) {
        updateHistory(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addHistory(form.value).then(response => {
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
  const _historyIds = row.historyId || ids.value;
  proxy.$modal.confirm('是否确认删除任务分配历史编号为"' + _historyIds + '"的数据项？').then(function() {
    return delHistory(_historyIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('project/task/history/export', {
    ...queryParams.value
  }, `history_${new Date().getTime()}.xlsx`)
}

handleQueryParams(route.params.taskId);
getList();
</script>
