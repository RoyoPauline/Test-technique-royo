<template>
  <div class="toast-container-wrapper fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
    <Toast
      v-for="toast in toasts"
      :key="toast.id"
      :alert="toast.alert"
      :patients="patients"
      @close="removeToast(toast.id)"
      @view-patient="handleViewPatient"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Toast from './Toast.vue'
import { PatientService } from '@/services/patientService'
import type { Alert, Patient } from '@/types/patient'

const props = defineProps<{
  patients: Patient[]
}>()

const emit = defineEmits<{
  viewPatient: [patientId: number]
}>()

const patientService = PatientService.getInstance()
const toasts = ref<Array<{ id: string; alert: Alert }>>([])
const refreshInterval = ref<NodeJS.Timeout | null>(null)
const displayedAlerts = ref<Set<string>>(new Set())

const addToast = (alert: Alert) => {
  const alertKey = `${alert.patientId}-${alert.type}-${alert.parameter}`
  
  if (!displayedAlerts.value.has(alertKey)) {
    const toastId = `${alert.id}-${Date.now()}`
    toasts.value.push({ id: toastId, alert })
    displayedAlerts.value.add(alertKey)
    
    if (toasts.value.length > 3) {
      toasts.value.shift()
    }
  }
}

const removeToast = (toastId: string) => {
  const index = toasts.value.findIndex(t => t.id === toastId)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

const checkForNewCriticalAlerts = () => {
  const criticalAlerts = patientService.getCriticalAlerts()
  
  criticalAlerts.forEach(alert => {
    const alertKey = `${alert.patientId}-${alert.type}-${alert.parameter}`
    const existingToast = toasts.value.find(t => t.alert.id === alert.id)
    
    if (!existingToast && !displayedAlerts.value.has(alertKey)) {
      addToast(alert)
    }
  })
}

const handleViewPatient = (patientId: number) => {
  emit('viewPatient', patientId)
}

const clearDisplayedAlerts = () => {
  displayedAlerts.value.clear()
}

const startMonitoring = () => {
  checkForNewCriticalAlerts()
  refreshInterval.value = setInterval(checkForNewCriticalAlerts, 5000)
}

const stopMonitoring = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
}

onMounted(() => {
  startMonitoring()
})

onUnmounted(() => {
  stopMonitoring()
})
</script>

<style scoped>
/* Les styles sont maintenant dans un fichier à part */
</style>
