
export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female'
}

export enum ShiftTime {
  MORNING = '6am to 2pm',
  AFTERNOON = '2pm to 10pm',
  GENERAL = '9am to 6pm'
}

export interface MonthlyDuty {
  monthYear: string; // e.g., "November 2025"
  count: number;
}

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  gender: Gender;
  address: string;
  photoUrl: string;
  totalDutiesCount: number;
  monthlyDuties: MonthlyDuty[];
  createdAt: string;
}

export interface Duty {
  id: string;
  employeeId: string;
  date: string; // ISO String (IST localized)
  shiftTime: ShiftTime;
  isScheduled: boolean; // False if Leave/Unavailable
  isCompleted: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'supervisor';
}

export interface AppState {
  user: User | null;
  employees: Employee[];
  duties: Duty[];
}
