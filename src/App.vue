<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="py-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-primary-700">
                Dashboard Médical
              </h1>
              <p class="mt-2 text-gray-600">
                Monitoring des paramètres vitaux des patients
              </p>
            </div>
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-2">
                <div 
                  class="w-3 h-3 rounded-full"
                  :class="isRealTimeActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'"
                ></div>
                <span class="text-sm font-medium" :class="isRealTimeActive ? 'text-green-700' : 'text-gray-600'">
                  {{ isRealTimeActive ? 'Temps réel actif' : 'Temps réel inactif' }}
                </span>
              </div>
              <button
                class="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
                :class="isRealTimeActive ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'"
                @click="isRealTimeActive ? stopRealTimeUpdates() : startRealTimeUpdates()"
              >
                {{ isRealTimeActive ? 'Arrêter' : 'Démarrer' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="currentView === 'list'" class="space-y-6">
        <div class="search-section">
          <SearchBar
            :patients="patients"
            @search-results="handleSearchResults"
            @clear-search="handleClearSearch"
          />
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div class="lg:col-span-3">
            <PatientList
              :patients="filteredPatients"
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

    <ToastContainer
      :patients="patients"
      @view-patient="handleViewPatientFromAlert"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import PatientList from '@/components/PatientList.vue'
import PatientCard from '@/components/PatientCard.vue'
import AlertsPanel from '@/components/AlertsPanel.vue'
import SearchBar from '@/components/SearchBar.vue'
import ToastContainer from '@/components/ToastContainer.vue'
import { PatientService } from '@/services/patientService'
import { RealtimeService } from '@/services/realtimeService'
import type { Patient, Alert } from '@/types/patient'

const patientService = PatientService.getInstance()
const realtimeService = RealtimeService.getInstance()

const currentView = ref<'list' | 'detail'>('list')
const selectedPatient = ref<Patient | null>(null)
const patients = ref<Patient[]>([])
const filteredPatients = ref<Patient[]>([])
const isRealTimeActive = ref(false)

const loadPatients = () => {
  patients.value = patientService.getAllPatients()
  filteredPatients.value = patients.value
  realtimeService.setPatients(patients.value)
}

const startRealTimeUpdates = () => {
  if (!isRealTimeActive.value) {
    realtimeService.subscribe(handleRealTimeUpdate)
    realtimeService.startRealTimeUpdates()
    isRealTimeActive.value = true
  }
}

const stopRealTimeUpdates = () => {
  if (isRealTimeActive.value) {
    realtimeService.stopRealTimeUpdates()
    realtimeService.unsubscribe(handleRealTimeUpdate)
    isRealTimeActive.value = false
  }
}

const handleRealTimeUpdate = (updatedPatients: Patient[]) => {
  patients.value = updatedPatients
  filteredPatients.value = updatedPatients
  
  if (selectedPatient.value) {
    const updatedPatient = updatedPatients.find(p => p.id === selectedPatient.value!.id)
    if (updatedPatient) {
      selectedPatient.value = updatedPatient
    }
  }
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

const handleSearchResults = (results: Patient[]) => {
  filteredPatients.value = results
}

const handleClearSearch = () => {
  filteredPatients.value = patients.value
}


onMounted(() => {
  loadPatients()
  startRealTimeUpdates()
})

onUnmounted(() => {
  stopRealTimeUpdates()
})
</script>