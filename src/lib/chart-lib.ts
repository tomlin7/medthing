import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Chart data interface
export interface ChartData {
  data: number[];
  labels: string[];
}

// Line chart configuration
export const getLineChartOptions = (title: string): ChartOptions<'line'> => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: title,
      font: {
        size: 14,
      },
    },
    tooltip: {
      mode: 'index',
      intersect: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        display: true,
        color: 'rgba(0,0,0,0.1)',
      },
      border: {
        display: true,
      }
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
  elements: {
    line: {
      tension: 0.4, // Smooth curves
    },
    point: {
      radius: 3,
      hoverRadius: 5,
    },
  },
  animation: {
    duration: 2000,
    easing: 'easeOutQuart',
  },
});

// Bar chart configuration
export const getBarChartOptions = (title: string): ChartOptions<'bar'> => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: title,
      font: {
        size: 14,
      },
    },
    tooltip: {
      mode: 'index',
      intersect: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        display: true,
        color: 'rgba(0,0,0,0.1)',
      },
      border: {
        display: true,
      }
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
  animation: {
    duration: 1800,
    easing: 'easeInOutQuart',
  },
});

// Helper to prepare line chart data
export const prepareLineChartData = (chartData: ChartData) => {
  return {
    labels: chartData.labels,
    datasets: [
      {
        data: chartData.data,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#3b82f6',
      },
    ],
  };
};

// Helper to prepare bar chart data
export const prepareBarChartData = (chartData: ChartData) => {
  return {
    labels: chartData.labels,
    datasets: [
      {
        data: chartData.data,
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        hoverBackgroundColor: 'rgba(37, 99, 235, 0.8)',
        borderRadius: 4,
        borderWidth: 0,
      },
    ],
  };
}; 