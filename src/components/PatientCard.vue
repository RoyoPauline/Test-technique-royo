<template>
  <div class="patient-detail-container">
    <div class="navigation-bar mb-6">
      <button
        class="btn-back bg-primary-100 text-primary-700 px-4 py-2 rounded-lg hover:bg-primary-200 transition-colors font-medium"
        @click="goBack"
      >
        ← Retour au Dashboard
      </button>
    </div>
    
    <div class="patient-card-detail bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
    <div class="card-header p-6 border-b border-gray-100" :class="getHeaderClass()">
      <div class="flex items-center justify-between">
        <div class="patient-info">
          <div class="flex items-center gap-4">
            <div
              class="status-indicator w-4 h-4 rounded-full"
              :class="getStatusColorClass()"
            ></div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">
                {{ patient.firstName }} {{ patient.lastName }}
              </h1>
              <p class="text-gray-600">
                {{ patient.age }} ans • {{ patient.medicalRecordNumber }}
              </p>
            </div>
          </div>
        </div>
        <div class="status-badge px-4 py-2 rounded-full text-sm font-semibold" :class="getStatusBadgeClass()">
          {{ getStatusText() }}
        </div>
      </div>
    </div>

    <div class="card-content p-6">
      <div class="vitals-current mb-8">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Paramètres Vitaux Actuels</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="vital-card bg-gray-50 rounded-lg p-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm text-gray-600">Fréquence Cardiaque</div>
                <div class="text-2xl font-bold" :class="getVitalColorClass('heartRate')">
                  {{ getLatestVital('heartRate') }} <span class="text-sm font-normal">bpm</span>
                </div>
              </div>
              <div class="vital-icon text-3xl">💓</div>
            </div>
          </div>

          <div class="vital-card bg-gray-50 rounded-lg p-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm text-gray-600">Température</div>
                <div class="text-2xl font-bold" :class="getVitalColorClass('temperature')">
                  {{ getLatestVital('temperature') }}°C
                </div>
              </div>
              <div class="vital-icon text-3xl">🌡️</div>
            </div>
          </div>

          <div class="vital-card bg-gray-50 rounded-lg p-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm text-gray-600">Tension Artérielle</div>
                <div class="text-2xl font-bold" :class="getVitalColorClass('bloodPressure')">
                  {{ getLatestBloodPressure() }} <span class="text-sm font-normal">mmHg</span>
                </div>
              </div>
              <div class="vital-icon text-3xl">🩸</div>
            </div>
          </div>
        </div>
      </div>

      <div class="charts-section mb-8">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Évolution des 24 dernières heures</h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="chart-container bg-gray-50 rounded-lg p-4">
            <h3 class="text-md font-medium text-gray-700 mb-3">Fréquence Cardiaque</h3>
            <div class="chart-placeholder h-32 bg-white rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
              <span class="text-gray-500">Graphique FC (Chart.js)</span>
            </div>
          </div>
          <div class="chart-container bg-gray-50 rounded-lg p-4">
            <h3 class="text-md font-medium text-gray-700 mb-3">Température</h3>
            <div class="chart-placeholder h-32 bg-white rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
              <span class="text-gray-500">Graphique Température (Chart.js)</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="hasAlerts()" class="alerts-section">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Alertes Actives</h2>
        <div class="space-y-3">
          <div
            v-for="alert in getPatientAlerts()"
            :key="alert.id"
            class="alert-item p-4 rounded-lg border-l-4"
            :class="alert.severity === 'critical' ? 'bg-medical-critical-50 border-medical-critical-500' : 'bg-medical-watch-50 border-medical-watch-500'"
          >
            <div class="flex items-center gap-3">
              <div class="alert-icon text-xl">
                {{ alert.severity === 'critical' ? '🚨' : '⚠️' }}
              </div>
              <div>
                <div class="font-medium" :class="alert.severity === 'critical' ? 'text-medical-critical-800' : 'text-medical-watch-800'">
                  {{ alert.message }}
                </div>
                <div class="text-sm text-gray-600">
                  {{ formatTimestamp(alert.timestamp) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card-actions p-6 bg-gray-50 border-t border-gray-100">
      <div class="flex gap-3">
        <button
          class="btn-secondary bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          @click="goBack"
        >
          ← Retour à la liste
        </button>
        <button
          class="btn-primary bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          @click="refreshData"
        >
          🔄 Actualiser
        </button>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { PatientService } from '@/services/patientService'
import type { Patient } from '@/types/patient'

const props = defineProps<{
  patient: Patient
}>()

const emit = defineEmits<{
  goBack: []
  refresh: []
}>()

const patientService = PatientService.getInstance()

const patientStatus = computed(() => patientService.getPatientStatus(props.patient))
const getLatestVital = (type: keyof Patient['vitals']): number => {
  const vitals = props.patient.vitals[type]
  if (Array.isArray(vitals)) {
    return vitals[vitals.length - 1]
  }
  return 0
}

const getLatestBloodPressure = (): string => {
  const bp = props.patient.vitals.bloodPressure[props.patient.vitals.bloodPressure.length - 1]
  return `${bp.systolic}/${bp.diastolic}`
}

const getHeaderClass = (): string => {
  switch (patientStatus.value) {
    case 'stable':
      return 'bg-medical-stable-50'
    case 'watch':
      return 'bg-medical-watch-50'
    case 'critical':
      return 'bg-medical-critical-50'
    default:
      return 'bg-gray-50'
  }
}

const getStatusColorClass = (): string => {
  switch (patientStatus.value) {
    case 'stable':
      return 'bg-medical-stable-500'
    case 'watch':
      return 'bg-medical-watch-500'
    case 'critical':
      return 'bg-medical-critical-500'
    default:
      return 'bg-gray-500'
  }
}

const getStatusBadgeClass = (): string => {
  switch (patientStatus.value) {
    case 'stable':
      return 'bg-medical-stable-100 text-medical-stable-800'
    case 'watch':
      return 'bg-medical-watch-100 text-medical-watch-800'
    case 'critical':
      return 'bg-medical-critical-100 text-medical-critical-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (): string => {
  switch (patientStatus.value) {
    case 'stable':
      return 'Stable'
    case 'watch':
      return 'Surveillance'
    case 'critical':
      return 'Critique'
    default:
      return 'Inconnu'
  }
}

const getVitalColorClass = (type: string): string => {
  switch (patientStatus.value) {
    case 'critical':
      return 'text-medical-critical-600'
    case 'watch':
      return 'text-medical-watch-600'
    case 'stable':
      return 'text-medical-stable-600'
    default:
      return 'text-gray-600'
  }
}

const hasAlerts = (): boolean => {
  return patientService.generateAlerts(props.patient).length > 0
}

const getPatientAlerts = () => {
  return patientService.generateAlerts(props.patient)
}

const formatTimestamp = (timestamp: Date): string => {
  return timestamp.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Actions
const goBack = () => {
  emit('goBack')
}

const refreshData = () => {
  emit('refresh')
}
</script>

<style scoped>
/* Les styles sont dans un fichier à part*/
</style>
