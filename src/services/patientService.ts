import type { Patient, PatientStatus, Alert } from '@/types/patient'
import * as patientsData from '@/data/patients.json'

export class PatientService {
  private static instance: PatientService
  private patients: Patient[] = patientsData.patients

  static getInstance(): PatientService {
    if (!PatientService.instance) {
      PatientService.instance = new PatientService()
    }
    return PatientService.instance
  }

  getAllPatients(): Patient[] {
    return this.patients
  }

  getPatientById(id: number): Patient | undefined {
    return this.patients.find(patient => patient.id === id)
  }

  searchPatients(query: string): Patient[] {
    const lowerQuery = query.toLowerCase()
    return this.patients.filter(
      patient =>
        patient.firstName.toLowerCase().includes(lowerQuery) ||
        patient.lastName.toLowerCase().includes(lowerQuery) ||
        patient.medicalRecordNumber.toLowerCase().includes(lowerQuery)
    )
  }

  getPatientStatus(patient: Patient): PatientStatus {
    const latest = this.getLatestVitals(patient)

    if (this.hasCriticalVitals(latest, patient.age)) return 'critical'
    if (this.hasWarningVitals(latest, patient.age)) return 'watch'

    return 'stable'
  }

  private getLatestVitals(patient: Patient) {
    const vitals = patient.vitals
    return {
      heartRate: vitals.heartRate[vitals.heartRate.length - 1],
      temperature: vitals.temperature[vitals.temperature.length - 1],
      bloodPressure: vitals.bloodPressure[vitals.bloodPressure.length - 1]
    }
  }

  private hasCriticalVitals(vitals: any, age: number): boolean {
    return (
      this.isCriticalHeartRate(vitals.heartRate, age) ||
      this.isCriticalTemperature(vitals.temperature) ||
      this.isCriticalBloodPressure(vitals.bloodPressure, age)
    )
  }

  private hasWarningVitals(vitals: any, age: number): boolean {
    return (
      this.isWarningHeartRate(vitals.heartRate, age) ||
      this.isWarningTemperature(vitals.temperature) ||
      this.isWarningBloodPressure(vitals.bloodPressure, age)
    )
  }

  private isCriticalHeartRate(heartRate: number, age: number): boolean {
    const limits = this.getHeartRateLimits(age)
    return heartRate < limits.critical.min || heartRate > limits.critical.max
  }

  private isWarningHeartRate(heartRate: number, age: number): boolean {
    const limits = this.getHeartRateLimits(age)
    return heartRate < limits.warning.min || heartRate > limits.warning.max
  }

  private getHeartRateLimits(age: number) {
    if (age < 18) {
      return {
        critical: { min: 60, max: 150 },
        warning: { min: 80, max: 120 }
      }
    }
    if (age >= 65) {
      return {
        critical: { min: 60, max: 100 },
        warning: { min: 70, max: 90 }
      }
    }
    return {
      critical: { min: 50, max: 100 },
      warning: { min: 60, max: 80 }
    }
  }

  private isCriticalTemperature(temperature: number): boolean {
    return temperature < 29 || temperature > 42.6
  }

  private isWarningTemperature(temperature: number): boolean {
    return temperature < 36.3 || temperature > 37.5
  }

  private isCriticalBloodPressure(bp: any, age: number): boolean {
    const limits = this.getBloodPressureLimits(age)
    return bp.systolic > limits.critical.systolic || bp.diastolic > limits.critical.diastolic
  }

  private isWarningBloodPressure(bp: any, age: number): boolean {
    const limits = this.getBloodPressureLimits(age)
    return bp.systolic > limits.warning.systolic || bp.diastolic > limits.warning.diastolic
  }

  private getBloodPressureLimits(age: number) {
    if (age >= 65) {
      return {
        critical: { systolic: 180, diastolic: 110 },
        warning: { systolic: 170, diastolic: 90 }
      }
    }
    return {
      critical: { systolic: 160, diastolic: 100 },
      warning: { systolic: 140, diastolic: 80 }
    }
  }

  getStatusColor(status: PatientStatus): string {
    switch (status) {
      case 'stable':
        return 'green'
      case 'watch':
        return 'yellow'
      case 'critical':
        return 'red'
      default:
        return 'gray'
    }
  }

  generateAlerts(patient: Patient): Alert[] {
    const alerts: Alert[] = []
    const latest = this.getLatestVitals(patient)
    const vitalChecks = [
      {
        type: 'heartRate' as const,
        value: latest.heartRate,
        critical: this.isCriticalHeartRate(latest.heartRate, patient.age),
        warning: this.isWarningHeartRate(latest.heartRate, patient.age),
        format: (val: number) => `${val} bpm`
      },
      {
        type: 'temperature' as const,
        value: latest.temperature,
        critical: this.isCriticalTemperature(latest.temperature),
        warning: this.isWarningTemperature(latest.temperature),
        format: (val: number) => `${val}°C`
      },
      {
        type: 'bloodPressure' as const,
        value: latest.bloodPressure,
        critical: this.isCriticalBloodPressure(latest.bloodPressure, patient.age),
        warning: this.isWarningBloodPressure(latest.bloodPressure, patient.age),
        format: (val: any) => `${val.systolic}/${val.diastolic} mmHg`
      }
    ]

    vitalChecks.forEach(check => {
      if (check.critical) {
        alerts.push(
          this.createAlert(patient.id, check.type, 'critical', check.format(check.value as any))
        )
      } else if (check.warning) {
        alerts.push(
          this.createAlert(patient.id, check.type, 'warning', check.format(check.value as any))
        )
      }
    })

    return alerts
  }

  private createAlert(
    patientId: number,
    type: string,
    severity: 'critical' | 'warning',
    value: string
  ): Alert {
    const severityText = severity === 'critical' ? 'critique' : 'élevée'
    const typeText = {
      heartRate: 'Fréquence cardiaque',
      temperature: 'Température',
      bloodPressure: 'Tension artérielle'
    }[type]

    return {
      id: `${type}-${severity}-${patientId}`,
      patientId,
      type: type as any,
      message: `${typeText} ${severityText}: ${value}`,
      severity,
      timestamp: new Date()
    }
  }

  getAllAlerts(): Alert[] {
    const allAlerts: Alert[] = []
    this.patients.forEach(patient => {
      allAlerts.push(...this.generateAlerts(patient))
    })
    return allAlerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  getCriticalAlerts(): Alert[] {
    return this.getAllAlerts().filter(alert => alert.severity === 'critical')
  }
}
