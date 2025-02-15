<template>
  <div class="gantt-container">
    <div class="filter-container">
      <el-form :model="filterParams" ref="filterRef" :inline="true" label-width="84px">
        <el-form-item label="项目" prop="projId">
          <el-select v-model="filterParams.projId" placeholder="请选择项目" clearable>
            <el-option
              v-for="proj in projOptions"
              :key="proj.id"
              :label="proj.label"
              :value="proj.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="负责人" prop="ownerId">
          <el-input
            v-model="filterParams.ownerId"
            placeholder="请输入负责人ID"
            clearable
          />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker clearable
            v-model="filterParams.startTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择开始时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker clearable
            v-model="filterParams.endTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择结束时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleFilter">筛选</el-button>
          <el-button icon="Refresh" @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div ref="ganttChart" class="gantt-chart"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import Gantt from 'frappe-gantt';
import { listProject } from "@/api/project/project.js";
import { listMilestone } from "@/api/project/milestone.js";
import { listTask } from "@/api/project/task/task.js";

const projOptions = ref([]);
const filterParams = ref({
  projId: null,
  ownerId: null,
  startTime: null,
  endTime: null
});
const ganttChart = ref(null);
let gantt = null;

// 获取项目选项
function getProjOptions() {
  listProject().then(response => {
    projOptions.value = response.rows.map(proj => ({
      id: proj.projId,
      label: proj.projName
    }));
  });
}

// 获取任务和里程碑数据
function fetchData() {
  Promise.all([
    listTask(),
    listMilestone()
  ]).then(([tasksResponse, milestonesResponse]) => {
    const tasks = tasksResponse.data;
    const milestones = milestonesResponse.data;
    const ganttData = [];

    debugger
    tasks.forEach(task => {
      ganttData.push({
        id: task.taskId.toString(),
        name: task.taskName,
        start: task.planStartDate,
        end: task.planEndDate,
        progress: task.actualEndDate ? 100 : 0, // 假设实际完成时间存在则进度为100%
        dependencies: task.parentId ? [task.parentId.toString()] : [],
        custom_class: 'bar-task',
        projId: task.projId,
        ownerId: task.ownerId
      });
    });

    // milestones.forEach(milestone => {
    //   ganttData.push({
    //     id: milestone.milestoneId.toString(),
    //     name: milestone.milestoneName,
    //     start: milestone.deadline,
    //     end: milestone.deadline,
    //     progress: milestone.status === '1' ? 100 : 0, // 假设状态为1则进度为100%
    //     dependencies: [],
    //     custom_class: 'bar-milestone',
    //     projId: milestone.projId,
    //     ownerId: null // 假设里程碑没有负责人
    //   });
    // });

    renderGantt(ganttData);
  });
}

// 渲染甘特图
function renderGantt(tasks) {
  if (gantt) {
    // 移除当前的甘特图元素
    ganttChart.value.innerHTML = '';
  }

  gantt = new Gantt(ganttChart.value, tasks, {
    view_mode: 'Month',
    on_click: task => console.log(task),
    on_date_change: (task, start, end) => console.log(task, start, end),
    on_progress_change: task => console.log(task),
    on_view_change: mode => console.log(mode),
    on_task_add: task => console.log(task),
    on_task_update: task => console.log(task),
    on_task_delete: task => console.log(task),
    date_format: 'YYYY-MM-DD' // 确保日期格式正确
  });
}

// 应用筛选
function applyFilters() {
  const filteredTasks = gantt.tasks.filter(task => {
    if (filterParams.value.projId && task.projId !== filterParams.value.projId) return false;
    if (filterParams.value.ownerId && task.ownerId !== filterParams.value.ownerId) return false;
    if (filterParams.value.startTime && new Date(task.start) < new Date(filterParams.value.startTime)) return false;
    if (filterParams.value.endTime && new Date(task.end) > new Date(filterParams.value.endTime)) return false;
    return true;
  });

  renderGantt(filteredTasks);
}

// 筛选按钮操作
function handleFilter() {
  applyFilters();
}

// 重置筛选按钮操作
function resetFilter() {
  filterParams.value = {
    projId: null,
    ownerId: null,
    startTime: null,
    endTime: null
  };
  fetchData();
}

onMounted(() => {
  getProjOptions();
  fetchData();
});

watch(filterParams, () => {
  applyFilters();
});
</script>

<style scoped>
.gantt-container {
  padding: 20px;
}

.filter-container {
  margin-bottom: 20px;
}

.gantt-chart {
  height: 80vh;
}

.bar-milestone {
  background-color: #4CAF50;
  border-color: #4CAF50;
}

.bar-task {
  background-color: #2196F3;
  border-color: #2196F3;
}
</style>
