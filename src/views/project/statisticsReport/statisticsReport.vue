<template>
  <div class="statistics-report">
    <h2>项目统计报表</h2>
    <div class="chart-container">
      <div class="chart" ref="projectProgressChart" id="projectProgressChart"></div>
      <div class="chart" ref="memberLoadChart" id="memberLoadChart"></div>
      <div class="chart" ref="priorityDistributionChart" id="priorityDistributionChart"></div>
      <div class="chart" ref="delayReasonChart" id="delayReasonChart"></div>
    </div>
    <div class="export-buttons no-print">
      <el-button type="primary" @click="exportPDF">导出PDF</el-button>
      <el-button type="primary" @click="exportPNG">导出PNG</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';
import html2canvas from 'html2canvas';
import { getProjectProgress } from "@/api/project/task/task.js";
import jsPDF from 'jspdf';

const projectProgressChart = ref(null);
const memberLoadChart = ref(null);
const priorityDistributionChart = ref(null);
const delayReasonChart = ref(null);
const projectProgress = ref([]);

// 生成假数据
const generateFakeData = () => {
  return {
    // projectProgress: [
    //   {
    //     projectName: '项目A',
    //     data: [
    //       { week: '2023-01', progress: 20 },
    //       { week: '2023-02', progress: 40 },
    //       { week: '2023-03', progress: 60 },
    //       { week: '2023-04', progress: 80 },
    //       { week: '2023-05', progress: 100 }
    //     ]
    //   },
    //   {
    //     projectName: '项目B',
    //     data: [
    //       { week: '2023-01', progress: 10 },
    //       { week: '2023-02', progress: 30 },
    //       { week: '2023-03', progress: 50 },
    //       { week: '2023-04', progress: 70 },
    //       { week: '2023-05', progress: 90 }
    //     ]
    //   }
    // ],
    memberLoad: [
      { name: '张三', hours: 120, tasks: 5 },
      { name: '李四', hours: 150, tasks: 6 },
      { name: '王五', hours: 100, tasks: 4 }
    ],
    priorityDistribution: [
      { name: '高', value: 30 },
      { name: '中', value: 50 },
      { name: '低', value: 20 }
    ],
    delayReasons: [
      { name: '资源不足', value: 40 },
      { name: '需求变更', value: 30 },
      { name: '技术问题', value: 20 },
      { name: '其他', value: 10 }
    ]
  };
};

// 初始化项目进度趋势图
const initProjectProgressChart = (data) => {
  const chart = echarts.init(projectProgressChart.value);

  // 提取所有项目的周数据
  const weeks = Array.from(new Set(data.flatMap(project => project.data.map(item => item.week)))).sort();

  // 生成系列数据
  const series = data.map(project => ({
    name: project.projectName,
    data: weeks.map(week => {
      const item = project.data.find(d => d.week === week);
      return item ? item.progress : null;
    }),
    type: 'line',
    smooth: true
  }));

  const option = {
    title: {
      text: '项目进度趋势图',
      subtext: '按月',
      left: 'center',
      top: '-5'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: data.map(project => project.projectName),
      top: '40'
    },
    xAxis: {
      type: 'category',
      data: weeks
    },
    yAxis: {
      type: 'value',
      name: '进度 (%)'
    },
    series: series,
    grid: {
      top: '100', // 增加图表内容区域的 top 值
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    }
  };

  chart.setOption(option);
};

// 初始化成员任务负载分布图
const initMemberLoadChart = (data) => {
  const chart = echarts.init(memberLoadChart.value);
  const option = {
    title: {
      text: '成员任务负载分布',
      subtext: '工时/任务数',
      left: 'center',
      top: '-5'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['工时', '任务数'],
      top: '40'
    },
    xAxis: {
      type: 'category',
      data: data.memberLoad.map(item => item.name)
    },
    yAxis: [
      {
        type: 'value',
        name: '工时 (小时)'
      },
      {
        type: 'value',
        name: '任务数',
        position: 'right'
      }
    ],
    series: [
      {
        name: '工时',
        type: 'bar',
        data: data.memberLoad.map(item => item.hours)
      },
      {
        name: '任务数',
        type: 'line',
        yAxisIndex: 1,
        data: data.memberLoad.map(item => item.tasks)
      }
    ],
    grid: {
      top: '100', // 增加图表内容区域的 top 值
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    }
  };
  chart.setOption(option);
};

// 初始化优先级分布饼图
const initPriorityDistributionChart = (data) => {
  const chart = echarts.init(priorityDistributionChart.value);
  const option = {
    title: {
      text: '优先级分布',
      subtext: '饼图',
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '优先级',
        type: 'pie',
        radius: '50%',
        data: data.priorityDistribution,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };
  chart.setOption(option);
};

// 初始化延期任务原因分析图
const initDelayReasonChart = (data) => {
  const chart = echarts.init(delayReasonChart.value);
  const option = {
    title: {
      text: '延期任务原因分析',
      subtext: '饼图',
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '原因',
        type: 'pie',
        radius: '50%',
        data: data.delayReasons,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };
  chart.setOption(option);
};



// 导出PDF
const exportPDF = () => {
  const chartContainer = document.querySelector('.statistics-report');
  chartContainer.querySelectorAll('.no-print').forEach(el => el.remove());

  html2canvas(chartContainer, {
    scale: 1.5, // 根据需要调整缩放比例
    scrollY: -window.scrollY,
    useCORS: true
  }).then(canvas => {
    const imgData = canvas.toDataURL('image/jpeg');
    const pdf = new jsPDF('p', 'mm', 'a4'); // A4 页面大小
    const imgWidth = 210; // A4 页面宽度
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
    pdf.save('statistics-report.pdf');
  });
};

// 导出PNG
const exportPNG = () => {
  html2canvas(document.querySelector('.statistics-report')).then(canvas => {
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'statistics_report.png';
    link.click();
  });
};

const fetchProjectProgress = () => {
  getProjectProgress().then(response => {
    projectProgress.value = response.data;
    initProjectProgressChart(projectProgress.value);
  }).catch(error => {
    console.error('Failed to fetch project progress:', error);
  });
};

onMounted(() => {
  fetchProjectProgress();
  const data = generateFakeData();
  initMemberLoadChart(data);
  initPriorityDistributionChart(data);
  initDelayReasonChart(data);
});
</script>

<style scoped>
.statistics-report {
  padding: 20px;
}

.chart-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}

.chart {
  width: 45%;
  height: 400px;
  margin: 10px 0;
}

.export-buttons {
  text-align: center;
  margin-top: 20px;
}

.export-buttons button {
  margin: 0 10px;
}
</style>
