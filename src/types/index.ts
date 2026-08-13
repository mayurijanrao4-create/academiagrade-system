export type Role = 'ADMIN' | 'FACULTY' | 'STUDENT';

export type Department =
  | 'Civil Engineering'
  | 'Computer Science & Eng'
  | 'Information Technology'
  | 'Electronics & Comm'
  | 'Mechanical Eng'
  | 'Electrical Engineering'
  | 'Chemical Engineering'
  | 'Artificial Intelligence & Data Science';

export interface User {
  id: string;
  username: string;
  email: string;
  role: Role;
  name: string;
  associatedId?: string; // Student ID or Faculty ID
}

export interface GuardianDetails {
  fatherName: string;
  motherName: string;
  guardianPhone: string;
  guardianEmail?: string;
  address: string;
}

export interface Student {
  id: string; // e.g. STU1001
  rollNumber: string; // e.g. 2024-CSE-042
  name: string;
  email: string;
  phone: string;
  department: Department;
  semester: number; // 1 to 8
  admissionYear: number;
  dob: string;
  guardian: GuardianDetails;
  status: 'ACTIVE' | 'DEBARRED' | 'GRADUATED';
}

export interface Faculty {
  id: string; // e.g. FAC201
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  department: Department;
  designation: 'Professor' | 'Associate Professor' | 'Assistant Professor' | 'Head of Dept';
  assignedSubjectIds: string[];
}

export interface Subject {
  id: string; // e.g. SUB301
  code: string; // e.g. CS401
  name: string;
  department: Department;
  semester: number;
  credits: number; // 3 or 4
  maxIseMarks: number; // 20
  maxPracticalMarks: number; // 20
  maxEndSemMarks: number; // 60
}

export interface ExamMark {
  id: string;
  studentId: string;
  subjectId: string;
  semester: number;
  ise1: number; // out of 20
  ise2: number; // out of 20
  ise3: number; // out of 20
  assignment: number; // out of 10
  practical: number; // out of 20
  endSem: number; // out of 60
  // Derived / Calculated
  calculatedBestIse: number; // Best 2 of 3 average
  internalTotal: number; // Best ISE + Assignment + Practical
  externalTotal: number; // EndSem
  totalMarks: number; // Max 100
  percentage: number;
  grade: 'O' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'F';
  gradePoint: number; // 10, 9, 8, 7, 6, 5, 0
  passed: boolean;
  remarks?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  subjectId: string;
  totalLectures: number;
  attendedLectures: number;
  percentage: number;
  isEligible: boolean; // >= 75%
  lastUpdated: string;
}

export interface ReportCard {
  student: Student;
  semester: number;
  marks: {
    subject: Subject;
    mark: ExamMark;
  }[];
  totalCredits: number;
  obtainedCredits: number;
  totalMarksObtained: number;
  totalMaxMarks: number;
  overallPercentage: number;
  sgpa: number;
  cgpa: number;
  classRank: number;
  totalStudentsInClass: number;
  overallAttendancePercentage: number;
  isExamEligible: boolean;
  issueDate: string;
}

export interface ClassAnalytics {
  department: Department;
  semester: number;
  totalStudents: number;
  passCount: number;
  failCount: number;
  passPercentage: number;
  classAveragePercentage: number;
  highestPercentage: number;
  lowestPercentage: number;
  topperStudent?: Student;
  topperCgpa?: number;
  attendanceDeficitCount: number;
}

export interface JavaCodeFile {
  path: string;
  name: string;
  package: string;
  description: string;
  code: string;
}
