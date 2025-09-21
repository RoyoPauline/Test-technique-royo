<template>
  <div class="search-bar-container">
    <div class="search-input-wrapper relative">
      <div class="search-icon absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        🔍
      </div>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Rechercher par nom ou numéro de dossier..."
        class="search-input w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
        @input="handleSearch"
        @keyup.enter="handleSearch"
      />
      <button
        v-if="searchQuery"
        class="clear-button absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        @click="clearSearch"
      >
        ✕
      </button>
    </div>

    <div v-if="searchQuery && filteredPatients.length === 0" class="no-results mt-4 p-4 bg-gray-50 rounded-lg text-center">
      <div class="text-gray-500">
        <div class="text-2xl mb-2">🔍</div>
        <p class="font-medium">Aucun patient trouvé</p>
        <p class="text-sm">Essayez avec un autre terme de recherche</p>
      </div>
    </div>

    <div v-if="searchQuery && filteredPatients.length > 0" class="search-results mt-4">
      <div class="results-header flex items-center justify-between mb-3">
        <h3 class="text-sm font-medium text-gray-700">
          {{ filteredPatients.length }} résultat{{ filteredPatients.length > 1 ? 's' : '' }} trouvé{{ filteredPatients.length > 1 ? 's' : '' }}
        </h3>
        <button
          class="show-all-btn text-sm text-primary-600 hover:text-primary-700 font-medium"
          @click="showAllPatients"
        >
          Voir tous les patients
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { PatientService } from '@/services/patientService'
import type { Patient } from '@/types/patient'

const props = defineProps<{
  patients: Patient[]
}>()

const emit = defineEmits<{
  searchResults: [patients: Patient[]]
  clearSearch: []
}>()

const patientService = PatientService.getInstance()
const searchQuery = ref('')

const filteredPatients = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.patients
  }
  return patientService.searchPatients(searchQuery.value)
})

const handleSearch = () => {
  emit('searchResults', filteredPatients.value)
}

const clearSearch = () => {
  searchQuery.value = ''
  emit('clearSearch')
}

const showAllPatients = () => {
  searchQuery.value = ''
  emit('searchResults', props.patients)
}

watch(searchQuery, () => {
  handleSearch()
})

watch(() => props.patients, () => {
  if (searchQuery.value) {
    handleSearch()
  }
}, { deep: true })
</script>

<style scoped>
/* Les styles sont maintenant dans un fichier à part */
</style>
