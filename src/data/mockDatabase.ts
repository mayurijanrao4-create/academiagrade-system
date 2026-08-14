import { Student, Faculty, Subject, ExamMark, AttendanceRecord, User, Department, ReportCard } from '../types';
import { computeSubjectGrade, calculateSGPA, evaluateAttendance75Rule } from '../utils/gradeCalculator';

export const INITIAL_USERS: User[] = [
  { id: 'U001', username: 'admin', email: 'admin@institute.edu', role: 'ADMIN', name: 'Dr. Sarah Jenkins' },
  { id: 'U002', username: 'fac_rvance', email: 'rvance@institute.edu', role: 'FACULTY', name: 'Dr. Robert Vance', associatedId: 'FAC201' },
  { id: 'U003', username: 'fac_msharma', email: 'msharma@institute.edu', role: 'FACULTY', name: 'Prof. Meera Sharma', associatedId: 'FAC202' },
  { id: 'U004', username: 'stu_aaryav', email: 'aaryav.kapoor@student.edu', role: 'STUDENT', name: 'Aaryav Kapoor', associatedId: 'STU1001' },
  { id: 'U005', username: 'stu_ananya', email: 'ananya.iyer@student.edu', role: 'STUDENT', name: 'Ananya Iyer', associatedId: 'STU1002' },
];

export const INITIAL_DEPARTMENTS: Department[] = [
  'Civil Engineering',
  'Computer Science & Eng',
  'Information Technology',
  'Electronics & Comm',
  'Mechanical Eng',
  'Electrical Engineering',
  'Chemical Engineering',
  'Artificial Intelligence & Data Science'
];

export const INITIAL_SUBJECTS: Subject[] = [
  { id: 'SUB301', code: 'CS401', name: 'Data Structures & Algorithms', department: 'Computer Science & Eng', semester: 4, credits: 4, maxIseMarks: 20, maxPracticalMarks: 20, maxEndSemMarks: 60 },
  { id: 'SUB302', code: 'CS402', name: 'Database Management Systems', department: 'Computer Science & Eng', semester: 4, credits: 4, maxIseMarks: 20, maxPracticalMarks: 20, maxEndSemMarks: 60 },
  { id: 'SUB303', code: 'CS403', name: 'Object-Oriented Programming (Java)', department: 'Computer Science & Eng', semester: 4, credits: 3, maxIseMarks: 20, maxPracticalMarks: 20, maxEndSemMarks: 60 },
  { id: 'SUB304', code: 'CS404', name: 'Operating Systems', department: 'Computer Science & Eng', semester: 4, credits: 3, maxIseMarks: 20, maxPracticalMarks: 20, maxEndSemMarks: 60 },
  
  { id: 'SUB305', code: 'CE401', name: 'Structural Analysis & Design', department: 'Civil Engineering', semester: 4, credits: 4, maxIseMarks: 20, maxPracticalMarks: 20, maxEndSemMarks: 60 },
  { id: 'SUB306', code: 'IT401', name: 'Cloud Computing Architecture', department: 'Information Technology', semester: 4, credits: 4, maxIseMarks: 20, maxPracticalMarks: 20, maxEndSemMarks: 60 },
  { id: 'SUB307', code: 'EC401', name: 'Digital Signal Processing', department: 'Electronics & Comm', semester: 4, credits: 4, maxIseMarks: 20, maxPracticalMarks: 20, maxEndSemMarks: 60 },
  { id: 'SUB308', code: 'ME401', name: 'Thermodynamics & Heat Transfer', department: 'Mechanical Eng', semester: 4, credits: 4, maxIseMarks: 20, maxPracticalMarks: 20, maxEndSemMarks: 60 },
  { id: 'SUB309', code: 'EE401', name: 'Power Electronics & Drives', department: 'Electrical Engineering', semester: 4, credits: 4, maxIseMarks: 20, maxPracticalMarks: 20, maxEndSemMarks: 60 },
  { id: 'SUB310', code: 'CH401', name: 'Chemical Reaction Engineering', department: 'Chemical Engineering', semester: 4, credits: 4, maxIseMarks: 20, maxPracticalMarks: 20, maxEndSemMarks: 60 },
  { id: 'SUB311', code: 'AI401', name: 'Deep Learning & AI Systems', department: 'Artificial Intelligence & Data Science', semester: 4, credits: 4, maxIseMarks: 20, maxPracticalMarks: 20, maxEndSemMarks: 60 },
];

export const INITIAL_FACULTY: Faculty[] = [
  {
    id: 'FAC201',
    employeeId: 'EMP-9081',
    name: 'Dr. Robert Vance',
    email: 'rvance@institute.edu',
    phone: '+91 98765 43210',
    department: 'Computer Science & Eng',
    designation: 'Professor',
    assignedSubjectIds: ['SUB301', 'SUB303'],
  },
  {
    id: 'FAC202',
    employeeId: 'EMP-9082',
    name: 'Prof. Meera Sharma',
    email: 'msharma@institute.edu',
    phone: '+91 98765 43211',
    department: 'Computer Science & Eng',
    designation: 'Associate Professor',
    assignedSubjectIds: ['SUB302', 'SUB304'],
  },
  {
    id: 'FAC203',
    employeeId: 'EMP-9083',
    name: 'Dr. Alan Turing',
    email: 'aturing@institute.edu',
    phone: '+91 98765 43212',
    department: 'Artificial Intelligence & Data Science',
    designation: 'Head of Dept',
    assignedSubjectIds: ['SUB306'],
  },
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'STU1001',
    rollNumber: '2024-CSE-001',
    name: 'Aaryav Kapoor',
    email: 'aaryav.kapoor@student.edu',
    phone: '+91 91234 56789',
    department: 'Computer Science & Eng',
    semester: 4,
    admissionYear: 2023,
    dob: '2004-05-14',
    guardian: {
      fatherName: 'Rajesh Kapoor',
      motherName: 'Sunita Kapoor',
      guardianPhone: '+91 98111 22334',
      guardianEmail: 'rajesh.kapoor@gmail.com',
      address: '74, Green Park Avenue, New Delhi',
    },
    status: 'ACTIVE',
  },
  {
    id: 'STU1002',
    rollNumber: '2024-CSE-002',
    name: 'Ananya Iyer',
    email: 'ananya.iyer@student.edu',
    phone: '+91 91234 56790',
    department: 'Computer Science & Eng',
    semester: 4,
    admissionYear: 2023,
    dob: '2004-09-21',
    guardian: {
      fatherName: 'Sridhar Iyer',
      motherName: 'Padma Iyer',
      guardianPhone: '+91 98111 22335',
      guardianEmail: 'sridhar.iyer@yahoo.com',
      address: '12, Anna Nagar West, Chennai',
    },
    status: 'ACTIVE',
  },
  {
    id: 'STU1003',
    rollNumber: '2024-CSE-003',
    name: 'Rohan Deshmukh',
    email: 'rohan.d@student.edu',
    phone: '+91 91234 56791',
    department: 'Computer Science & Eng',
    semester: 4,
    admissionYear: 2023,
    dob: '2004-01-11',
    guardian: {
      fatherName: 'Prakash Deshmukh',
      motherName: 'Vandana Deshmukh',
      guardianPhone: '+91 98111 22336',
      address: '45, Kothrud Main Road, Pune',
    },
    status: 'ACTIVE',
  },
  {
    id: 'STU1004',
    rollNumber: '2024-CSE-004',
    name: 'Siddharth Verma',
    email: 'siddharth.v@student.edu',
    phone: '+91 91234 56792',
    department: 'Computer Science & Eng',
    semester: 4,
    admissionYear: 2023,
    dob: '2003-11-30',
    guardian: {
      fatherName: 'Vikram Verma',
      motherName: 'Ritu Verma',
      guardianPhone: '+91 98111 22337',
      address: '102, Gomti Nagar, Lucknow',
    },
    status: 'ACTIVE',
  },
  {
    id: 'STU1005',
    rollNumber: '2024-CSE-005',
    name: 'Priya Nair',
    email: 'priya.nair@student.edu',
    phone: '+91 91234 56793',
    department: 'Computer Science & Eng',
    semester: 4,
    admissionYear: 2023,
    dob: '2004-03-18',
    guardian: {
      fatherName: 'Unnikrishnan Nair',
      motherName: 'Lakshmi Nair',
      guardianPhone: '+91 98111 22338',
      address: '88, MG Road, Kochi',
    },
    status: 'DEBARRED', // Due to low attendance
  },
];

// Helper to seed realistic marks
function buildInitialMarks(): ExamMark[] {
  const marksList: ExamMark[] = [];

  // STU1001 - Aaryav Kapoor (High performer)
  const aaryavMarksRaw = [
    { subId: 'SUB301', ise1: 18, ise2: 19, ise3: 17, assignment: 9.5, practical: 19, endSem: 54 },
    { subId: 'SUB302', ise1: 17, ise2: 18, ise3: 19, assignment: 9, practical: 18, endSem: 52 },
    { subId: 'SUB303', ise1: 19, ise2: 20, ise3: 18, assignment: 10, practical: 19.5, endSem: 56 },
    { subId: 'SUB304', ise1: 16, ise2: 17, ise3: 18, assignment: 8.5, practical: 17, endSem: 48 },
    { subId: 'SUB305', ise1: 18, ise2: 17, ise3: 19, assignment: 9, practical: 18, endSem: 51 },
  ];

  aaryavMarksRaw.forEach((m, idx) => {
    const computed = computeSubjectGrade(m.ise1, m.ise2, m.ise3, m.assignment, m.practical, m.endSem);
    marksList.push({
      id: `M1001_${idx}`,
      studentId: 'STU1001',
      subjectId: m.subId,
      semester: 4,
      ise1: m.ise1,
      ise2: m.ise2,
      ise3: m.ise3,
      assignment: m.assignment,
      practical: m.practical,
      endSem: m.endSem,
      ...computed,
    });
  });

  // STU1002 - Ananya Iyer (Top Performer - Class Topper)
  const ananyaMarksRaw = [
    { subId: 'SUB301', ise1: 20, ise2: 19, ise3: 20, assignment: 10, practical: 20, endSem: 58 },
    { subId: 'SUB302', ise1: 19, ise2: 20, ise3: 19, assignment: 9.5, practical: 19, endSem: 57 },
    { subId: 'SUB303', ise1: 20, ise2: 20, ise3: 20, assignment: 10, practical: 20, endSem: 59 },
    { subId: 'SUB304', ise1: 19, ise2: 18, ise3: 19, assignment: 9.5, practical: 19, endSem: 55 },
    { subId: 'SUB305', ise1: 20, ise2: 19, ise3: 20, assignment: 10, practical: 19.5, endSem: 56 },
  ];

  ananyaMarksRaw.forEach((m, idx) => {
    const computed = computeSubjectGrade(m.ise1, m.ise2, m.ise3, m.assignment, m.practical, m.endSem);
    marksList.push({
      id: `M1002_${idx}`,
      studentId: 'STU1002',
      subjectId: m.subId,
      semester: 4,
      ise1: m.ise1,
      ise2: m.ise2,
      ise3: m.ise3,
      assignment: m.assignment,
      practical: m.practical,
      endSem: m.endSem,
      ...computed,
    });
  });

  // STU1003 - Rohan Deshmukh (Average Performer)
  const rohanMarksRaw = [
    { subId: 'SUB301', ise1: 14, ise2: 15, ise3: 13, assignment: 7.5, practical: 15, endSem: 38 },
    { subId: 'SUB302', ise1: 13, ise2: 14, ise3: 12, assignment: 7, practical: 14, endSem: 36 },
    { subId: 'SUB303', ise1: 15, ise2: 16, ise3: 14, assignment: 8, practical: 16, endSem: 42 },
    { subId: 'SUB304', ise1: 12, ise2: 13, ise3: 11, assignment: 6.5, practical: 13, endSem: 32 },
    { subId: 'SUB305', ise1: 14, ise2: 13, ise3: 15, assignment: 7, practical: 15, endSem: 37 },
  ];

  rohanMarksRaw.forEach((m, idx) => {
    const computed = computeSubjectGrade(m.ise1, m.ise2, m.ise3, m.assignment, m.practical, m.endSem);
    marksList.push({
      id: `M1003_${idx}`,
      studentId: 'STU1003',
      subjectId: m.subId,
      semester: 4,
      ise1: m.ise1,
      ise2: m.ise2,
      ise3: m.ise3,
      assignment: m.assignment,
      practical: m.practical,
      endSem: m.endSem,
      ...computed,
    });
  });

  // STU1004 - Siddharth Verma
  const sidMarksRaw = [
    { subId: 'SUB301', ise1: 11, ise2: 12, ise3: 10, assignment: 6, practical: 12, endSem: 28 },
    { subId: 'SUB302', ise1: 10, ise2: 11, ise3: 9, assignment: 5.5, practical: 11, endSem: 24 },
    { subId: 'SUB303', ise1: 12, ise2: 13, ise3: 11, assignment: 7, practical: 13, endSem: 30 },
    { subId: 'SUB304', ise1: 9, ise2: 10, ise3: 8, assignment: 5, practical: 10, endSem: 18 }, // Fail in OS endsem
    { subId: 'SUB305', ise1: 11, ise2: 10, ise3: 12, assignment: 6, practical: 12, endSem: 26 },
  ];

  sidMarksRaw.forEach((m, idx) => {
    const computed = computeSubjectGrade(m.ise1, m.ise2, m.ise3, m.assignment, m.practical, m.endSem);
    marksList.push({
      id: `M1004_${idx}`,
      studentId: 'STU1004',
      subjectId: m.subId,
      semester: 4,
      ise1: m.ise1,
      ise2: m.ise2,
      ise3: m.ise3,
      assignment: m.assignment,
      practical: m.practical,
      endSem: m.endSem,
      ...computed,
    });
  });

  // STU1005 - Priya Nair
  const priyaMarksRaw = [
    { subId: 'SUB301', ise1: 15, ise2: 14, ise3: 16, assignment: 8, practical: 16, endSem: 42 },
    { subId: 'SUB302', ise1: 14, ise2: 15, ise3: 13, assignment: 7.5, practical: 15, endSem: 40 },
    { subId: 'SUB303', ise1: 16, ise2: 17, ise3: 15, assignment: 8.5, practical: 17, endSem: 45 },
    { subId: 'SUB304', ise1: 13, ise2: 14, ise3: 12, assignment: 7, practical: 14, endSem: 38 },
    { subId: 'SUB305', ise1: 15, ise2: 14, ise3: 16, assignment: 8, practical: 16, endSem: 41 },
  ];

  priyaMarksRaw.forEach((m, idx) => {
    const computed = computeSubjectGrade(m.ise1, m.ise2, m.ise3, m.assignment, m.practical, m.endSem);
    marksList.push({
      id: `M1005_${idx}`,
      studentId: 'STU1005',
      subjectId: m.subId,
      semester: 4,
      ise1: m.ise1,
      ise2: m.ise2,
      ise3: m.ise3,
      assignment: m.assignment,
      practical: m.practical,
      endSem: m.endSem,
      ...computed,
    });
  });

  return marksList;
}

export const INITIAL_MARKS: ExamMark[] = buildInitialMarks();

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  // STU1001
  { id: 'ATT101', studentId: 'STU1001', subjectId: 'SUB301', totalLectures: 48, attendedLectures: 44, percentage: 91.7, isEligible: true, lastUpdated: '2026-07-25' },
  { id: 'ATT102', studentId: 'STU1001', subjectId: 'SUB302', totalLectures: 45, attendedLectures: 40, percentage: 88.9, isEligible: true, lastUpdated: '2026-07-25' },
  { id: 'ATT103', studentId: 'STU1001', subjectId: 'SUB303', totalLectures: 40, attendedLectures: 38, percentage: 95.0, isEligible: true, lastUpdated: '2026-07-25' },

  // STU1002
  { id: 'ATT201', studentId: 'STU1002', subjectId: 'SUB301', totalLectures: 48, attendedLectures: 47, percentage: 97.9, isEligible: true, lastUpdated: '2026-07-25' },
  { id: 'ATT202', studentId: 'STU1002', subjectId: 'SUB302', totalLectures: 45, attendedLectures: 44, percentage: 97.8, isEligible: true, lastUpdated: '2026-07-25' },
  { id: 'ATT203', studentId: 'STU1002', subjectId: 'SUB303', totalLectures: 40, attendedLectures: 39, percentage: 97.5, isEligible: true, lastUpdated: '2026-07-25' },

  // STU1003
  { id: 'ATT301', studentId: 'STU1003', subjectId: 'SUB301', totalLectures: 48, attendedLectures: 38, percentage: 79.2, isEligible: true, lastUpdated: '2026-07-25' },
  { id: 'ATT302', studentId: 'STU1003', subjectId: 'SUB302', totalLectures: 45, attendedLectures: 35, percentage: 77.8, isEligible: true, lastUpdated: '2026-07-25' },

  // STU1004
  { id: 'ATT401', studentId: 'STU1004', subjectId: 'SUB301', totalLectures: 48, attendedLectures: 36, percentage: 75.0, isEligible: true, lastUpdated: '2026-07-25' },

  // STU1005 (Attendance deficit < 75%)
  { id: 'ATT501', studentId: 'STU1005', subjectId: 'SUB301', totalLectures: 48, attendedLectures: 28, percentage: 58.3, isEligible: false, lastUpdated: '2026-07-25' },
  { id: 'ATT502', studentId: 'STU1005', subjectId: 'SUB302', totalLectures: 45, attendedLectures: 29, percentage: 64.4, isEligible: false, lastUpdated: '2026-07-25' },
  { id: 'ATT503', studentId: 'STU1005', subjectId: 'SUB303', totalLectures: 40, attendedLectures: 25, percentage: 62.5, isEligible: false, lastUpdated: '2026-07-25' },
];
