<template>
  <div class="alerts-panel bg-white rounded-lg shadow-lg border border-gray-200">
    <div class="panel-header p-4 border-b border-gray-100">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="alert-icon text-2xl">🚨</div>
          <h2 class="text-lg font-semibold text-gray-800">Alertes Critiques</h2>
        </div>
        <div class="alert-count bg-medical-critical-100 text-medical-critical-800 px-3 py-1 rounded-full text-sm font-medium">
          {{ criticalAlerts.length }}
        </div>
      </div>
    </div>

    <div class="panel-content">
      <div v-if="criticalAlerts.length === 0" class="no-alerts p-6 text-center">
        <div class="text-4xl mb-3">✅</div>
        <p class="text-gray-600 font-medium">Aucune alerte critique</p>
        <p class="text-sm text-gray-500 mt-1">Tous les patients sont stables</p>
      </div>

      <div v-else class="alerts-list max-h-96 overflow-y-auto">
        <div
          v-for="alert in criticalAlerts"
          :key="alert.id"
          class="alert-item p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer"
          @click="handleAlertClick(alert)"
        >
          <div class="flex items-start gap-3">
            <div class="alert-severity-icon text-xl flex-shrink-0">
              🚨
            </div>
            <div class="alert-content flex-1">
              <div class="flex items-center justify-between mb-1">
                <span class="font-medium text-medical-critical-800">
                  {{ getPatientName(alert.patientId) }}
                </span>
                <span class="text-xs text-gray-500">
                  {{ formatTime(alert.timestamp) }}
                </span>
              </div>
              <p class="text-sm text-gray-700 mb-2">
                {{ alert.message }}
              </p>
              <div class="flex items-center gap-2">
                <span class="alert-type-badge px-2 py-1 rounded text-xs font-medium"
                      :class="getAlertTypeClass(alert.type)">
                  {{ getAlertTypeLabel(alert.type) }}
                </span>
                <span class="text-xs text-gray-500">
                  Patient #{{ alert.patientId }}
                </span>
              </div>
            </div>
            <div class="alert-actions flex-shrink-0">
              <button
                class="view-patient-btn text-primary-600 hover:text-primary-700 text-sm font-medium"
                @click.stop="handleViewPatient(alert.patientId)"
              >
                Voir →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="criticalAlerts.length > 0" class="panel-footer p-4 bg-gray-50 border-t border-gray-100">
      <div class="flex items-center justify-between">
        <p class="text-sm text-gray-600">
          {{ criticalAlerts.length }} alerte{{ criticalAlerts.length > 1 ? 's' : '' }} critique{{ criticalAlerts.length > 1 ? 's' : '' }}
        </p>
        <button
          class="clear-all-btn text-sm text-gray-500 hover:text-gray-700 font-medium"
          @click="handleClearAll"
        >
          Tout marquer comme lu
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { PatientService } from '@/services/patientService'
import type { Alert, Patient } from '@/types/patient'

const props = defineProps<{
  patients: Patient[]
}>()

const emit = defineEmits<{
  viewPatient: [patientId: number]
  alertClick: [alert: Alert]
}>()

const patientService = PatientService.getInstance()
const criticalAlerts = ref<Alert[]>([])
const refreshInterval = ref<NodeJS.Timeout | null>(null)

const loadCriticalAlerts = () => {
  criticalAlerts.value = patientService.getCriticalAlerts()
}

const getPatientName = (patientId: number): string => {
  const patient = props.patients.find(p => p.id === patientId)
  return patient ? `${patient.firstName} ${patient.lastName}` : `Patient #${patientId}`
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

const getAlertTypeClass = (type: string): string => {
  switch (type) {
    case 'heartRate':
      return 'bg-red-100 text-red-700'
    case 'temperature':
      return 'bg-orange-100 text-orange-700'
    case 'bloodPressure':
      return 'bg-purple-100 text-purple-700'
    case 'oxygenSaturation':
      return 'bg-blue-100 text-blue-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

const getAlertTypeLabel = (type: string): string => {
  switch (type) {
    case 'heartRate':
      return 'FC'
    case 'temperature':
      return 'Temp'
    case 'bloodPressure':
      return 'TA'
    case 'oxygenSaturation':
      return 'SpO2'
    default:
      return type
  }
}

const handleAlertClick = (alert: Alert) => {
  emit('alertClick', alert)
}

const handleViewPatient = (patientId: number) => {
  emit('viewPatient', patientId)
}

const handleClearAll = () => {
  criticalAlerts.value = []
}

const startAutoRefresh = () => {
  refreshInterval.value = setInterval(() => {
    loadCriticalAlerts()
  }, 30000)
}

const stopAutoRefresh = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
}

onMounted(() => {
  loadCriticalAlerts()
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
.alerts-panel {
  min-height: 200px;
}

.alert-item {
  transition: all 0.2s ease-in-out;
}

.alert-item:hover {
  transform: translateX(2px);
}

.alert-type-badge {
  transition: all 0.2s ease-in-out;
}

.view-patient-btn {
  transition: all 0.2s ease-in-out;
}

.clear-all-btn {
  transition: all 0.2s ease-in-out;
}

.no-alerts {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
