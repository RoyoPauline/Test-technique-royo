<template>
  <div class="patient-list">
    <div class="header">
      <h2 class="text-2xl font-bold text-gray-800 mb-4">Liste des Patients</h2>
      <div class="stats flex gap-4 mb-6">
        <div class="stat-card bg-medical-stable-50 border border-medical-stable-200 rounded-lg p-3">
          <div class="text-medical-stable-600 font-semibold">{{ stableCount }}</div>
          <div class="text-sm text-medical-stable-700">Stables</div>
        </div>
        <div class="stat-card bg-medical-watch-50 border border-medical-watch-200 rounded-lg p-3">
          <div class="text-medical-watch-600 font-semibold">{{ watchCount }}</div>
          <div class="text-sm text-medical-watch-700">Surveillance</div>
        </div>
        <div class="stat-card bg-medical-critical-50 border border-medical-critical-200 rounded-lg p-3">
          <div class="text-medical-critical-600 font-semibold">{{ criticalCount }}</div>
          <div class="text-sm text-medical-critical-700">Critiques</div>
        </div>
      </div>
    </div>

    <div class="grid gap-4">
      <div
        v-for="patient in patients"
        :key="patient.id"
        class="patient-card bg-white rounded-lg shadow-md border-l-4 p-4 hover:shadow-lg transition-shadow"
        :class="getStatusBorderClass(patient)"
      >
        <div class="flex items-center justify-between">
          <div class="patient-info">
            <div class="flex items-center gap-3">
              <div
                class="status-indicator w-3 h-3 rounded-full"
                :class="getStatusColorClass(patient)"
              ></div>
              <div>
                <h3 class="font-semibold text-gray-800">
                  {{ patient.firstName }} {{ patient.lastName }}
                </h3>
                <p class="text-sm text-gray-600">
                  {{ patient.age }} ans • {{ patient.medicalRecordNumber }}
                </p>
              </div>
            </div>
          </div>

          <div class="vitals-summary flex gap-6">
            <div class="vital-item text-center">
              <div class="text-lg font-semibold" :class="getVitalColorClass(patient, 'heartRate')">
                {{ getLatestVital(patient, 'heartRate') }}
              </div>
              <div class="text-xs text-gray-500">BPM</div>
            </div>
            <div class="vital-item text-center">
              <div class="text-lg font-semibold" :class="getVitalColorClass(patient, 'temperature')">
                {{ getLatestVital(patient, 'temperature') }}°
              </div>
              <div class="text-xs text-gray-500">°C</div>
            </div>
            <div class="vital-item text-center">
              <div class="text-lg font-semibold" :class="getVitalColorClass(patient, 'bloodPressure')">
                {{ getLatestBloodPressure(patient) }}
              </div>
              <div class="text-xs text-gray-500">mmHg</div>
            </div>
          </div>

          <div class="actions">
            <button
              class="btn-primary bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              @click="viewPatientDetails(patient)"
            >
              Voir détails
            </button>
          </div>
        </div>

        <div v-if="hasAlerts(patient)" class="alerts mt-3 pt-3 border-t border-gray-100">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-red-600">Alertes :</span>
            <div class="flex gap-2">
              <span
                v-for="alert in getPatientAlerts(patient)"
                :key="alert.id"
                class="alert-badge px-2 py-1 rounded-full text-xs font-medium"
                :class="alert.severity === 'critical' ? 'bg-medical-critical-100 text-medical-critical-700' : 'bg-medical-watch-100 text-medical-watch-700'"
              >
                {{ alert.message }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { computed } from 'vue'
import { PatientService } from '@/services/patientService'
import type { Patient, PatientStatus } from '@/types/patient'

const patientService = PatientService.getInstance()

const props = defineProps<{
  patients: Patient[]
}>()

const emit = defineEmits<{
  viewPatient: [patient: Patient]
}>()

const stableCount = computed(() =>
  props.patients.filter(p => patientService.getPatientStatus(p) === 'stable').length
)

const watchCount = computed(() =>
  props.patients.filter(p => patientService.getPatientStatus(p) === 'watch').length
)

const criticalCount = computed(() =>
  props.patients.filter(p => patientService.getPatientStatus(p) === 'critical').length
)

const getStatusBorderClass = (patient: Patient): string => {
  const status = patientService.getPatientStatus(patient)
  switch (status) {
    case 'stable':
      return 'border-l-medical-stable-500'
    case 'watch':
      return 'border-l-medical-watch-500'
    case 'critical':
      return 'border-l-medical-critical-500'
    default:
      return 'border-l-gray-500'
  }
}

const getStatusColorClass = (patient: Patient): string => {
  const status = patientService.getPatientStatus(patient)
  switch (status) {
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

const getLatestVital = (patient: Patient, type: keyof Patient['vitals']): number => {
  const vitals = patient.vitals[type]
  if (Array.isArray(vitals)) {
    return vitals[vitals.length - 1]
  }
  return 0
}

const getLatestBloodPressure = (patient: Patient): string => {
  const bp = patient.vitals.bloodPressure[patient.vitals.bloodPressure.length - 1]
  return `${bp.systolic}/${bp.diastolic}`
}

const getVitalColorClass = (patient: Patient, type: string): string => {
  const status = patientService.getPatientStatus(patient)
  switch (status) {
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

const hasAlerts = (patient: Patient): boolean => {
  return patientService.generateAlerts(patient).length > 0
}

const getPatientAlerts = (patient: Patient) => {
  return patientService.generateAlerts(patient)
}

const viewPatientDetails = (patient: Patient) => {
  emit('viewPatient', patient)
}
</script>

<style scoped>
/* Les styles sont un fichier à part */
</style>
