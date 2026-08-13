import { ExamMark, Subject, AttendanceRecord, ReportCard, Student } from '../types';

/**
 * Calculates Best 2 out of 3 ISE Marks.
 */
export function calculateBestIse(ise1: number, ise2: number, ise3: number): number {
  const scores = [ise1, ise2, ise3].sort((a, b) => b - a);
  // Average of top 2
  return Number(((scores[0] + scores[1]) / 2).toFixed(2));
}

/**
 * Calculates total marks, percentage, grade, and grade points for a subject exam record.
 */
export function computeSubjectGrade(
  ise1: number,
  ise2: number,
  ise3: number,
  assignment: number,
  practical: number,
  endSem: number
): {
  calculatedBestIse: number;
  internalTotal: number;
  externalTotal: number;
  totalMarks: number;
  percentage: number;
  grade: 'O' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'F';
  gradePoint: number;
  passed: boolean;
  remarks: string;
} {
  const bestIse = calculateBestIse(ise1, ise2, ise3);
  // Internal: Best ISE (out of 20) + Assignment (out of 10) + Practical (out of 20) = Max 50
  const internalTotal = Number((bestIse + assignment + practical).toFixed(2));
  // External: EndSem (out of 60 scaled or out of 50 depending on weightage) -> total 100
  // Here: Internal (max 50) + EndSem (max 50 scaled from 60) OR EndSem out of 50. Let's scale endSem to 50 if max is 60:
  const scaledEndSem = Number(((endSem / 60) * 50).toFixed(2));
  const totalMarks = Number((internalTotal + scaledEndSem).toFixed(2));
  const percentage = Math.min(100, Math.max(0, totalMarks));

  let grade: 'O' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'F' = 'F';
  let gradePoint = 0;
  let passed = true;
  let remarks = 'Pass';

  if (percentage >= 90) {
    grade = 'O';
    gradePoint = 10;
    remarks = 'Outstanding';
  } else if (percentage >= 80) {
    grade = 'A+';
    gradePoint = 9;
    remarks = 'Excellent';
  } else if (percentage >= 70) {
    grade = 'A';
    gradePoint = 8;
    remarks = 'Very Good';
  } else if (percentage >= 60) {
    grade = 'B+';
    gradePoint = 7;
    remarks = 'Good';
  } else if (percentage >= 50) {
    grade = 'B';
    gradePoint = 6;
    remarks = 'Above Average';
  } else if (percentage >= 40) {
    grade = 'C';
    gradePoint = 5;
    remarks = 'Pass';
  } else {
    grade = 'F';
    gradePoint = 0;
    passed = false;
    remarks = 'Fail (Re-Exam Required)';
  }

  // End sem min pass criteria: 35% in EndSem
  if (endSem < 21) { // 35% of 60 is 21
    passed = false;
    grade = 'F';
    gradePoint = 0;
    remarks = 'Fail (End-Sem Cutoff Not Met)';
  }

  return {
    calculatedBestIse: bestIse,
    internalTotal,
    externalTotal: scaledEndSem,
    totalMarks,
    percentage,
    grade,
    gradePoint,
    passed,
    remarks,
  };
}

/**
 * Calculates Semester SGPA from list of subject marks and subjects.
 */
export function calculateSGPA(
  marks: { mark: ExamMark; subject: Subject }[]
): { sgpa: number; totalCredits: number; earnedCredits: number } {
  let totalCreditPoints = 0;
  let totalCredits = 0;
  let earnedCredits = 0;

  marks.forEach(({ mark, subject }) => {
    totalCredits += subject.credits;
    if (mark.passed) {
      earnedCredits += subject.credits;
      totalCreditPoints += subject.credits * mark.gradePoint;
    }
  });

  const sgpa = totalCredits > 0 ? Number((totalCreditPoints / totalCredits).toFixed(2)) : 0;
  return { sgpa, totalCredits, earnedCredits };
}

/**
 * Evaluates 75% Attendance Eligibility Rule.
 */
export function evaluateAttendance75Rule(attended: number, total: number): {
  percentage: number;
  isEligible: boolean;
  requiredLecturesToReach75: number;
} {
  if (total === 0) return { percentage: 100, isEligible: true, requiredLecturesToReach75: 0 };
  const percentage = Number(((attended / total) * 100).toFixed(1));
  const isEligible = percentage >= 75.0;

  let requiredLecturesToReach75 = 0;
  if (!isEligible) {
    // 0.75 = (attended + x) / (total + x)
    // 0.75 * total + 0.75 * x = attended + x
    // 0.25 * x = 0.75 * total - attended
    // x = (3 * total - 4 * attended)
    const needed = Math.ceil(3 * total - 4 * attended);
    requiredLecturesToReach75 = Math.max(0, needed);
  }

  return { percentage, isEligible, requiredLecturesToReach75 };
}

export type ResultDivision =
  | 'FIRST CLASS WITH DISTINCTION'
  | 'FIRST CLASS'
  | 'SECOND CLASS'
  | 'PASS CLASS'
  | 'ATKT'
  | 'FAIL';

export function calculateDivision(percentage: number, backlogCount: number): ResultDivision {
  if (backlogCount > 2) return 'FAIL';
  if (backlogCount > 0) return 'ATKT';
  if (percentage >= 75) return 'FIRST CLASS WITH DISTINCTION';
  if (percentage >= 60) return 'FIRST CLASS';
  if (percentage >= 50) return 'SECOND CLASS';
  if (percentage >= 40) return 'PASS CLASS';
  return 'FAIL';
}

/**
 * Validates Email input according to standard RFC 5322 regex pattern.
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Validates Phone Number (10 digits).
 */
export function validatePhone(phone: string): boolean {
  return /^\+?[0-9]{10,12}$/.test(phone.replace(/[\s-]/g, ''));
}
