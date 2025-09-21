import type { Patient, PatientVitals, BloodPressure } from '@/types/patient'

export class RealtimeService {
  private static instance: RealtimeService
  private updateInterval: NodeJS.Timeout | null = null
  private listeners: Array<(patients: Patient[]) => void> = []
  private alertListeners: Array<(alerts: any[]) => void> = []
  private patients: Patient[] = []

  static getInstance(): RealtimeService {
    if (!RealtimeService.instance) {
      RealtimeService.instance = new RealtimeService()
    }
    return RealtimeService.instance
  }

  setPatients(patients: Patient[]) {
    this.patients = JSON.parse(JSON.stringify(patients))
  }

  subscribe(callback: (patients: Patient[]) => void) {
    this.listeners.push(callback)
  }

  unsubscribe(callback: (patients: Patient[]) => void) {
    const index = this.listeners.indexOf(callback)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }

  subscribeToAlerts(callback: (alerts: any[]) => void) {
    this.alertListeners.push(callback)
  }

  unsubscribeFromAlerts(callback: (alerts: any[]) => void) {
    const index = this.alertListeners.indexOf(callback)
    if (index > -1) {
      this.alertListeners.splice(index, 1)
    }
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback(this.patients))
  }

  private notifyAlertListeners() {
    const { PatientService } = require('./patientService')
    const patientService = PatientService.getInstance()
    const criticalAlerts = patientService.getCriticalAlerts()
    this.alertListeners.forEach(callback => callback(criticalAlerts))
  }

  startRealTimeUpdates() {
    if (this.updateInterval) {
      return
    }

    this.updateInterval = setInterval(() => {
      this.updatePatientVitals()
      this.notifyListeners()
      this.notifyAlertListeners()
    }, 60000)
  }

  stopRealTimeUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
  }

  private updatePatientVitals() {
    this.patients.forEach(patient => {
      this.updatePatientVital(patient)
    })
  }

  private updatePatientVital(patient: Patient) {
    const vitals = patient.vitals

    const newHeartRate = this.generateNewHeartRate(
      vitals.heartRate[vitals.heartRate.length - 1],
      patient.age
    )
    const newTemperature = this.generateNewTemperature(
      vitals.temperature[vitals.temperature.length - 1]
    )
    const newBloodPressure = this.generateNewBloodPressure(
      vitals.bloodPressure[vitals.bloodPressure.length - 1],
      patient.age
    )
    const newOxygenSaturation = this.generateNewOxygenSaturation(
      vitals.oxygenSaturation[vitals.oxygenSaturation.length - 1]
    )

    vitals.heartRate.push(newHeartRate)
    vitals.temperature.push(newTemperature)
    vitals.bloodPressure.push(newBloodPressure)
    vitals.oxygenSaturation.push(newOxygenSaturation)

    if (vitals.heartRate.length > 24) {
      vitals.heartRate.shift()
    }
    if (vitals.temperature.length > 24) {
      vitals.temperature.shift()
    }
    if (vitals.bloodPressure.length > 24) {
      vitals.bloodPressure.shift()
    }
    if (vitals.oxygenSaturation.length > 24) {
      vitals.oxygenSaturation.shift()
    }
  }

  private generateNewHeartRate(current: number, age: number): number {
    const baseRate = age < 18 ? 80 : age >= 65 ? 70 : 75
    const variation = Math.random() * 20 - 10
    const newRate = Math.round(current + variation)

    const minRate = age < 18 ? 60 : age >= 65 ? 50 : 50
    const maxRate = age < 18 ? 150 : age >= 65 ? 100 : 120

    return Math.max(minRate, Math.min(maxRate, newRate))
  }

  private generateNewTemperature(current: number): number {
    const variation = Math.random() * 0.6 - 0.3
    const newTemp = current + variation

    return Math.round(newTemp * 10) / 10
  }

  private generateNewBloodPressure(current: BloodPressure, age: number): BloodPressure {
    const systolicVariation = Math.random() * 10 - 5
    const diastolicVariation = Math.random() * 8 - 4

    const newSystolic = Math.round(current.systolic + systolicVariation)
    const newDiastolic = Math.round(current.diastolic + diastolicVariation)

    const minSystolic = age >= 65 ? 100 : 90
    const maxSystolic = age >= 65 ? 180 : 160
    const minDiastolic = age >= 65 ? 60 : 50
    const maxDiastolic = age >= 65 ? 110 : 100

    return {
      systolic: Math.max(minSystolic, Math.min(maxSystolic, newSystolic)),
      diastolic: Math.max(minDiastolic, Math.min(maxDiastolic, newDiastolic))
    }
  }

  private generateNewOxygenSaturation(current: number): number {
    const variation = Math.random() * 2 - 1
    const newSaturation = Math.round(current + variation)

    return Math.max(90, Math.min(100, newSaturation))
  }

  getPatients(): Patient[] {
    return this.patients
  }

  isRunning(): boolean {
    return this.updateInterval !== null
  }
}
