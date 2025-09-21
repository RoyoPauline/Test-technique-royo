<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="py-6">
          <h1 class="text-3xl font-bold text-primary-700">
            Dashboard Médical
          </h1>
          <p class="mt-2 text-gray-600">
            Monitoring des paramètres vitaux des patients
          </p>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="currentView === 'list'" class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div class="lg:col-span-3">
          <PatientList
            :patients="patients"
            @view-patient="handleViewPatient"
          />
        </div>
        <div class="lg:col-span-1">
          <AlertsPanel
            :patients="patients"
            @view-patient="handleViewPatientFromAlert"
            @alert-click="handleAlertClick"
          />
        </div>
      </div>
      
      <div v-if="currentView === 'detail' && selectedPatient" class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div class="lg:col-span-3">
          <PatientCard
            :patient="selectedPatient"
            @go-back="handleGoBack"
            @refresh="handleRefresh"
          />
        </div>
        <div class="lg:col-span-1">
          <AlertsPanel
            :patients="patients"
            @view-patient="handleViewPatientFromAlert"
            @alert-click="handleAlertClick"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import PatientList from '@/components/PatientList.vue'
import PatientCard from '@/components/PatientCard.vue'
import AlertsPanel from '@/components/AlertsPanel.vue'
import { PatientService } from '@/services/patientService'
import type { Patient, Alert } from '@/types/patient'

  const patientService = PatientService.getInstance()

const currentView = ref<'list' | 'detail'>('list')
const selectedPatient = ref<Patient | null>(null)
const patients = ref<Patient[]>([])
const loadPatients = () => {
  patients.value = patientService.getAllPatients()
}

const handleViewPatient = (patient: Patient) => {
  selectedPatient.value = patient
  currentView.value = 'detail'
}

const handleGoBack = () => {
  currentView.value = 'list'
  selectedPatient.value = null
}

const handleRefresh = () => {
  if (selectedPatient.value) {
    const updatedPatient = patientService.getPatientById(selectedPatient.value.id)
    if (updatedPatient) {
      selectedPatient.value = updatedPatient
    }
  }
  loadPatients()
}

const handleAlertClick = (alert: Alert) => {
  const patient = patients.value.find(p => p.id === alert.patientId)
  if (patient) {
    handleViewPatient(patient)
  }
}

const handleViewPatientFromAlert = (patientId: number) => {
  const patient = patients.value.find(p => p.id === patientId)
  if (patient) {
    handleViewPatient(patient)
  }
}


onMounted(() => {
  loadPatients()
})
</script>