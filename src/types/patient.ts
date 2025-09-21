export interface BloodPressure {
	systolic: number
	diastolic: number
}

export interface PatientVitals {
	heartRate: number[]
	temperature: number[]
	bloodPressure: BloodPressure[]
	oxygenSaturation: number[]
}

export interface Patient {
	id: number
	firstName: string
	lastName: string
	age: number
	medicalRecordNumber: string
	vitals: PatientVitals
}

export interface PatientsData {
	patients: Patient[]
}

export type PatientStatus = "stable" | "watch" | "critical"

export interface Alert {
	id: string
	patientId: number
	type: "heartRate" | "temperature" | "bloodPressure" | "oxygenSaturation"
	message: string
	severity: "warning" | "critical"
	timestamp: Date
}
