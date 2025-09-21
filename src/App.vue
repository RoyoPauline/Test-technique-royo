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
      <PatientList
        v-if="currentView === 'list'"
        :patients="patients"
        @view-patient="handleViewPatient"
      />
      <PatientCard
        v-if="currentView === 'detail' && selectedPatient"
        :patient="selectedPatient"
        @go-back="handleGoBack"
        @refresh="handleRefresh"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import PatientList from '@/components/PatientList.vue'
import PatientCard from '@/components/PatientCard.vue'
import { PatientService } from '@/services/patientService'
import type { Patient } from '@/types/patient'

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

onMounted(() => {
  loadPatients()
})
</script>