<template>
  <div class="vital-chart-container bg-gray-50 rounded-lg p-4">
    <h3 class="text-md font-medium text-gray-700 mb-3">{{ title }}</h3>
    <div class="chart-wrapper h-32">
      <Line
        :data="chartData"
        :options="chartOptions"
        class="chart-canvas"
      />
    </div>
    <div class="chart-info mt-2 text-xs text-gray-500">
      <div class="flex justify-between">
        <span>Dernière valeur: {{ lastValue }}</span>
        <span>{{ timeRange }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import type { Patient } from '@/types/patient'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const props = defineProps<{
  patient: Patient
  type: 'heartRate' | 'temperature' | 'bloodPressure'
  title: string
  unit: string
  color: string
}>()

const chartData = computed(() => {
  const data = props.patient.vitals[props.type]
  if (props.type === 'bloodPressure') {
    const systolicData = data.map((bp: any) => bp.systolic)
    const diastolicData = data.map((bp: any) => bp.diastolic)
    return {
      labels: generateTimeLabels(data.length),
      datasets: [
        {
          label: 'Systolique',
          data: systolicData,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Diastolique',
          data: diastolicData,
          borderColor: '#dc2626',
          backgroundColor: 'rgba(220, 38, 38, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    }
  }
  return {
    labels: generateTimeLabels(data.length),
    datasets: [
      {
        label: props.title,
        data: data,
        borderColor: props.color,
        backgroundColor: `${props.color}20`,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: props.color,
        pointBorderColor: props.color,
        pointRadius: 3,
        pointHoverRadius: 5
      }
    ]
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: props.type === 'bloodPressure',
      position: 'top' as const,
      labels: {
        usePointStyle: true,
        padding: 10,
        font: {
          size: 10
        }
      }
    },
    tooltip: {
      enabled: true,
      mode: 'index' as const,
      intersect: false,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: 'white',
      bodyColor: 'white',
      borderColor: props.color,
      borderWidth: 1,
      cornerRadius: 6,
      displayColors: true,
      callbacks: {
        label: (context: any) => {
          const value = context.parsed.y
          return `${context.dataset.label}: ${value}${props.unit}`
        }
      }
    }
  },
  scales: {
    x: {
      display: true,
      grid: {
        display: false
      },
      ticks: {
        maxTicksLimit: 6,
        font: {
          size: 9
        },
        color: '#6b7280'
      }
    },
    y: {
      display: true,
      grid: {
        color: 'rgba(107, 114, 128, 0.1)',
        drawBorder: false
      },
      ticks: {
        font: {
          size: 9
        },
        color: '#6b7280',
        callback: (value: any) => `${value}${props.unit}`
      }
    }
  },
  interaction: {
    intersect: false,
    mode: 'index' as const
  },
  elements: {
    point: {
      hoverBackgroundColor: props.color,
      hoverBorderColor: props.color
    }
  }
}))

const lastValue = computed(() => {
  const data = props.patient.vitals[props.type]
  if (props.type === 'bloodPressure') {
    const lastBp = data[data.length - 1]
    return `${lastBp.systolic}/${lastBp.diastolic}`
  }
  return `${data[data.length - 1]}${props.unit}`
})

const timeRange = computed(() => {
  const dataLength = props.patient.vitals[props.type].length
  return `24h (${dataLength} points)`
})

const generateTimeLabels = (dataLength: number): string[] => {
  const labels = []
  const now = new Date()
  for (let i = dataLength - 1; i >= 0; i--) {
    const time = new Date(now.getTime() - (i * 60 * 60 * 1000))
    const hours = time.getHours().toString().padStart(2, '0')
    const minutes = time.getMinutes().toString().padStart(2, '0')
    labels.push(`${hours}:${minutes}`)
  }
  return labels
}
</script>

<style scoped>
/* Les styles sont maintenant dans un fichier à part */
</style>
