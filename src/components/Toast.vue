<template>
  <Transition name="toast" appear>
    <div
      v-if="isVisible"
      class="toast-container fixed top-4 right-4 z-50 max-w-sm w-full"
    >
      <div
        class="toast bg-white rounded-lg shadow-lg border-l-4 p-4 flex items-start gap-3"
        :class="getToastClass()"
      >
        <div class="toast-icon text-2xl flex-shrink-0">
          {{ getIcon() }}
        </div>
        
        <div class="toast-content flex-1">
          <div class="toast-header flex items-center justify-between mb-1">
            <h4 class="font-semibold text-sm" :class="getTitleClass()">
              {{ getTitle() }}
            </h4>
            <button
              class="toast-close text-gray-400 hover:text-gray-600 transition-colors"
              @click="closeToast"
            >
              ✕
            </button>
          </div>
          
          <p class="toast-message text-sm" :class="getMessageClass()">
            {{ alert.message }}
          </p>
          
          <div class="toast-details mt-2 text-xs text-gray-500">
            <div class="flex items-center justify-between">
              <span>{{ getPatientName() }}</span>
              <span>{{ formatTime(alert.timestamp) }}</span>
            </div>
          </div>
          
          <div class="toast-actions mt-3 flex gap-2">
            <button
              class="toast-action-btn px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
              :class="getActionClass()"
              @click="viewPatient"
            >
              Voir le patient
            </button>
            <button
              class="toast-dismiss-btn px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              @click="closeToast"
            >
              Ignorer
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { PatientService } from '@/services/patientService'
import type { Alert, Patient } from '@/types/patient'

const props = defineProps<{
  alert: Alert
  patients: Patient[]
}>()

const emit = defineEmits<{
  close: []
  viewPatient: [patientId: number]
}>()

const patientService = PatientService.getInstance()
const isVisible = ref(true)
const autoCloseTimer = ref<NodeJS.Timeout | null>(null)

const getToastClass = (): string => {
  switch (props.alert.severity) {
    case 'critical':
      return 'border-medical-critical-500 bg-medical-critical-50'
    case 'warning':
      return 'border-medical-watch-500 bg-medical-watch-50'
    default:
      return 'border-gray-500 bg-gray-50'
  }
}

const getIcon = (): string => {
  switch (props.alert.severity) {
    case 'critical':
      return '🚨'
    case 'warning':
      return '⚠️'
    default:
      return 'ℹ️'
  }
}

const getTitle = (): string => {
  switch (props.alert.severity) {
    case 'critical':
      return 'Alerte Critique'
    case 'warning':
      return 'Alerte de Surveillance'
    default:
      return 'Notification'
  }
}

const getTitleClass = (): string => {
  switch (props.alert.severity) {
    case 'critical':
      return 'text-medical-critical-800'
    case 'warning':
      return 'text-medical-watch-800'
    default:
      return 'text-gray-800'
  }
}

const getMessageClass = (): string => {
  switch (props.alert.severity) {
    case 'critical':
      return 'text-medical-critical-700'
    case 'warning':
      return 'text-medical-watch-700'
    default:
      return 'text-gray-700'
  }
}

const getActionClass = (): string => {
  switch (props.alert.severity) {
    case 'critical':
      return 'bg-medical-critical-600 text-white hover:bg-medical-critical-700'
    case 'warning':
      return 'bg-medical-watch-600 text-white hover:bg-medical-watch-700'
    default:
      return 'bg-primary-600 text-white hover:bg-primary-700'
  }
}

const getPatientName = (): string => {
  const patient = props.patients.find(p => p.id === props.alert.patientId)
  return patient ? `${patient.firstName} ${patient.lastName}` : `Patient #${props.alert.patientId}`
}

const formatTime = (timestamp: Date): string => {
  const now = new Date()
  const diff = now.getTime() - timestamp.getTime()
  const minutes = Math.floor(diff / 60000)
  
  if (minutes < 1) return 'À l\'instant'
  if (minutes < 60) return `Il y a ${minutes}min`
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Il y a ${hours}h`
  
  return timestamp.toLocaleDateString('fr-FR')
}

const viewPatient = () => {
  emit('viewPatient', props.alert.patientId)
  closeToast()
}

const closeToast = () => {
  isVisible.value = false
  if (autoCloseTimer.value) {
    clearTimeout(autoCloseTimer.value)
  }
  setTimeout(() => {
    emit('close')
  }, 300)
}

const startAutoClose = () => {
  if (props.alert.severity === 'critical') {
    autoCloseTimer.value = setTimeout(() => {
      closeToast()
    }, 10000)
  } else {
    autoCloseTimer.value = setTimeout(() => {
      closeToast()
    }, 5000)
  }
}

onMounted(() => {
  startAutoClose()
})

onUnmounted(() => {
  if (autoCloseTimer.value) {
    clearTimeout(autoCloseTimer.value)
  }
})
</script>

<style scoped>
/* Les styles sont maintenant dans un fichier à part */
</style>
