import React from 'react';
import { Student, ExamMark, Subject, AttendanceRecord } from '../../types';
import { calculateSGPA, calculateDivision } from '../../utils/gradeCalculator';
import { downloadStudentScorecardPdf } from '../../utils/pdfGenerator';
import { ParsedStudentResult } from '../../utils/pdfResultParser';
import { X, Printer, Download, GraduationCap, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ReportCardModalProps {
  student: Student;
  marks: ExamMark[];
  subjects: Subject[];
  attendance: AttendanceRecord[];
  allStudents?: Student[];
  allMarks?: ExamMark[];
  onClose: () => void;
}

export const ReportCardModal: React.FC<ReportCardModalProps> = ({
  student,
  marks,
  subjects,
  attendance,
  allStudents = [],
  allMarks = [],
  onClose,
}) => {
  const studentMarks = marks.filter((m) => m.studentId === student.id);
  const markSubjectPairs = studentMarks.map((m) => ({
    mark: m,
    subject: subjects.find((s) => s.id === m.subjectId) || {
      id: m.subjectId,
      code: 'SUB',
      name: 'Subject',
      department: student.department,
      semester: student.semester,
      credits: 4,
      maxIseMarks: 20,
      maxPracticalMarks: 20,
      maxEndSemMarks: 60,
    },
  }));

  const { sgpa, totalCredits, earnedCredits } = calculateSGPA(markSubjectPairs);

  const totalMarksObtained = studentMarks.reduce((acc, curr) => acc + curr.totalMarks, 0);
  const totalMaxMarks = studentMarks.length * 100;
  const overallPct = totalMaxMarks > 0 ? (totalMarksObtained / totalMaxMarks) * 100 : 0;

  // Attendance calculation
  const totalAttended = attendance.filter((a) => a.studentId === student.id).reduce((acc, curr) => acc + curr.attendedLectures, 0);
  const totalLectures = attendance.filter((a) => a.studentId === student.id).reduce((acc, curr) => acc + curr.totalLectures, 0);
  const attendancePct = totalLectures > 0 ? (totalAttended / totalLectures) * 100 : 100;
  const isEligible = attendancePct >= 75.0;

  // CGPA for current academic scope
  const cgpa = sgpa;

  // Dynamic Class Rank Calculation within Department
  let calculatedRank: number = 1;
  if (allStudents.length > 0 && allMarks.length > 0) {
    const deptStudents = allStudents.filter((s) => s.department === student.department && s.semester === student.semester);
    const rankings = deptStudents.map((s) => {
      const sMarks = allMarks.filter((m) => m.studentId === s.id);
      const total = sMarks.reduce((sum, m) => sum + m.totalMarks, 0);
      const max = sMarks.length * 100;
      const pct = max > 0 ? (total / max) * 100 : 0;
      return { studentId: s.id, pct };
    }).sort((a, b) => b.pct - a.pct);

    const rankIdx = rankings.findIndex((r) => r.studentId === student.id);
    if (rankIdx !== -1) {
      calculatedRank = rankIdx + 1;
    }
  }

  const division = calculateDivision(overallPct, studentMarks.filter((m) => !m.passed).length);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    const parsedResult: ParsedStudentResult = {
      rollNumber: student.rollNumber,
      name: student.name,
      collegeName: 'AcademiaGrade Institute of Higher Learning & Technology',
      department: student.department,
      semester: student.semester,
      subjectMarks: markSubjectPairs.map(({ mark, subject }) => ({
        subjectCode: subject.code,
        subjectName: subject.name,
        ise1: mark.ise1,
        ise2: mark.ise2,
        ise3: mark.ise3,
        assignment: mark.assignmentMarks,
        practical: mark.practical,
        endSem: mark.endSem,
        totalMarks: mark.totalMarks,
        grade: mark.grade,
        gradePoint: mark.gradePoint,
        passed: mark.passed,
      })),
      totalMarksObtained,
      totalMaxMarks,
      percentage: overallPct,
      sgpa,
      division,
      status: studentMarks.every((m) => m.passed) ? 'PASS' : 'FAIL',
      backlogCount: studentMarks.filter((m) => !m.passed).length,
      failedSubjectCodes: studentMarks.filter((m) => !m.passed).map((m) => {
        const sub = subjects.find((s) => s.id === m.subjectId);
        return sub?.code || 'SUB';
      }),
    };

    downloadStudentScorecardPdf(parsedResult, calculatedRank);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200 print:p-0 print:bg-white print:static">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[94vh] overflow-hidden flex flex-col shadow-2xl text-slate-100 print:border-none print:shadow-none print:max-h-none print:w-full print:rounded-none">
        
        {/* Top Control Bar (Hidden in Print) */}
        <div className="px-4 sm:px-6 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-2 print:hidden">
          <div className="flex items-center space-x-2 min-w-0">
            <GraduationCap className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <span className="font-bold text-xs sm:text-sm text-white truncate block">ACADEMIAGRADE • Official Grade Card</span>
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">Candidate: {student.rollNumber}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleDownloadPdf}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm whitespace-nowrap"
              title="Download PDF Scorecard"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden sm:inline">Download PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors whitespace-nowrap shadow-sm"
              title="Print Grade Card"
            >
              <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden sm:inline">Print Grade Card</span>
              <span className="sm:hidden">Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE GRADE CARD CONTAINER */}
        <div id="printable-grade-card" className="p-4 sm:p-8 overflow-y-auto space-y-4 sm:space-y-6 bg-white text-slate-900 print:p-0 print:overflow-visible">
          
          {/* Institutional Header */}
          <div className="border-b-2 border-indigo-950 pb-4 text-center space-y-1">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-xl sm:text-2xl font-serif font-black tracking-wider text-indigo-950 uppercase">
                ACADEMIAGRADE
              </span>
            </div>
            <p className="text-xs sm:text-sm font-serif font-bold text-slate-800">
              Autonomous Institute of Technology & Academic Sciences
            </p>
            <p className="text-[10px] sm:text-[11px] text-slate-600 font-sans">
              Affiliated to National Technological University • Approved by AICTE • Accredited 'A+' Grade
            </p>
            <div className="mt-2.5 inline-block bg-indigo-950 text-white text-[11px] sm:text-xs font-bold px-4 sm:px-6 py-1 rounded-full uppercase tracking-widest shadow-sm">
              Student Grade Card & Statement of Grades (Semester {student.semester})
            </div>
          </div>

          {/* Student Demographics Info Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 p-3.5 sm:p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Student Name:</span>
              <span className="font-bold text-slate-900 text-xs sm:text-sm truncate block">{student.name}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Roll Number:</span>
              <span className="font-mono font-bold text-indigo-950 text-xs sm:text-sm">{student.rollNumber}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Department:</span>
              <span className="font-semibold text-slate-800 truncate block">{student.department}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Semester:</span>
              <span className="font-semibold text-slate-800">Semester {student.semester}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Admission Year:</span>
              <span className="font-mono text-slate-800">{student.admissionYear}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Father's Name:</span>
              <span className="text-slate-800 truncate block">{student.guardian.fatherName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Attendance:</span>
              <span className={`font-mono font-bold ${isEligible ? 'text-emerald-700' : 'text-rose-700'}`}>
                {attendancePct.toFixed(1)}% ({isEligible ? 'Eligible' : 'Debarred'})
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Division / Standing:</span>
              <span className="font-bold text-indigo-900 truncate block">{division}</span>
            </div>
          </div>

          {/* Subject-Wise Marks & Credits Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-300">
            <table className="w-full text-left text-xs whitespace-nowrap sm:whitespace-normal">
              <thead className="bg-indigo-950 text-white font-bold uppercase text-[10px] sm:text-[11px] tracking-wider">
                <tr>
                  <th className="p-2.5 sm:p-3">Course Code</th>
                  <th className="p-2.5 sm:p-3">Subject</th>
                  <th className="p-2.5 sm:p-3 text-center">Marks (100)</th>
                  <th className="p-2.5 sm:p-3 text-center">Grade</th>
                  <th className="p-2.5 sm:p-3 text-center">Grade Points</th>
                  <th className="p-2.5 sm:p-3 text-center">Credits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800 text-xs">
                {markSubjectPairs.map(({ mark, subject }) => (
                  <tr key={mark.id} className="hover:bg-slate-50">
                    <td className="p-2.5 sm:p-3 font-mono font-bold text-indigo-950">{subject.code}</td>
                    <td className="p-2.5 sm:p-3 font-semibold text-slate-900">{subject.name}</td>
                    <td className="p-2.5 sm:p-3 font-mono font-bold text-center text-indigo-900">{mark.totalMarks.toFixed(1)}</td>
                    <td className="p-2.5 sm:p-3 text-center font-bold">
                      <span className={`px-2 py-0.5 rounded text-[10px] sm:text-xs ${
                        mark.grade === 'F' ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}>
                        {mark.grade}
                      </span>
                    </td>
                    <td className="p-2.5 sm:p-3 font-mono font-bold text-center text-slate-800">{mark.gradePoint.toFixed(1)}</td>
                    <td className="p-2.5 sm:p-3 font-mono font-bold text-center text-slate-800">{subject.credits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Academic Summary Bottom Grid */}
          <div className="p-3.5 sm:p-4 bg-indigo-50 border border-indigo-200 rounded-xl grid grid-cols-2 sm:grid-cols-6 gap-3 text-center">
            <div>
              <span className="text-[10px] font-bold text-indigo-900 uppercase block">SGPA</span>
              <span className="text-base sm:text-lg font-black font-mono text-indigo-950">{sgpa.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-indigo-900 uppercase block">CGPA</span>
              <span className="text-base sm:text-lg font-black font-mono text-indigo-950">{cgpa.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-indigo-900 uppercase block">Percentage</span>
              <span className="text-base sm:text-lg font-bold font-mono text-emerald-800">{overallPct.toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-indigo-900 uppercase block">Total Credits</span>
              <span className="text-base sm:text-lg font-bold font-mono text-slate-900">{earnedCredits} / {totalCredits}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-indigo-900 uppercase block">Attendance</span>
              <span className={`text-base sm:text-lg font-bold font-mono ${isEligible ? 'text-emerald-800' : 'text-rose-800'}`}>
                {attendancePct.toFixed(0)}%
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-indigo-900 uppercase block">Class Rank</span>
              <span className="text-base sm:text-lg font-bold font-mono text-indigo-950">#{calculatedRank}</span>
            </div>
          </div>

          {/* Institutional Signatures & Verification */}
          <div className="pt-8 sm:pt-10 flex justify-between items-end text-[11px] sm:text-xs text-slate-700">
            <div className="text-center space-y-1">
              <div className="w-28 sm:w-36 border-b border-slate-400 mx-auto"></div>
              <p className="font-bold">Class Advisor</p>
            </div>
            <div className="text-center space-y-1">
              <div className="w-28 sm:w-36 border-b border-slate-400 mx-auto"></div>
              <p className="font-bold">Head of Department</p>
            </div>
            <div className="text-center space-y-1">
              <div className="w-28 sm:w-36 border-b border-slate-400 mx-auto"></div>
              <p className="font-bold">Controller of Examinations</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

