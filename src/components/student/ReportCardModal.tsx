import React from 'react';
import { Student, ExamMark, Subject, AttendanceRecord } from '../../types';
import { calculateSGPA, calculateDivision } from '../../utils/gradeCalculator';
import { downloadStudentScorecardPdf } from '../../utils/pdfGenerator';
import { ParsedStudentResult } from '../../utils/pdfResultParser';
import { X, Printer, Download, Award, GraduationCap, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ReportCardModalProps {
  student: Student;
  marks: ExamMark[];
  subjects: Subject[];
  attendance: AttendanceRecord[];
  onClose: () => void;
}

export const ReportCardModal: React.FC<ReportCardModalProps> = ({
  student,
  marks,
  subjects,
  attendance,
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

  const totalAttended = attendance.filter((a) => a.studentId === student.id).reduce((acc, curr) => acc + curr.attendedLectures, 0);
  const totalLectures = attendance.filter((a) => a.studentId === student.id).reduce((acc, curr) => acc + curr.totalLectures, 0);
  const attendancePct = totalLectures > 0 ? (totalAttended / totalLectures) * 100 : 100;
  const isEligible = attendancePct >= 75.0;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    const parsedResult: ParsedStudentResult = {
      rollNumber: student.rollNumber,
      name: student.name,
      collegeName: 'St. Xavier Institute of Technology',
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
      division: calculateDivision(overallPct, studentMarks.filter((m) => !m.passed).length),
      status: studentMarks.every((m) => m.passed) ? 'PASS' : 'FAIL',
      backlogCount: studentMarks.filter((m) => !m.passed).length,
      failedSubjectCodes: studentMarks.filter((m) => !m.passed).map((m) => {
        const sub = subjects.find((s) => s.id === m.subjectId);
        return sub?.code || 'SUB';
      }),
    };

    downloadStudentScorecardPdf(parsedResult);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl text-slate-100">
        
        {/* Top Control Bar */}
        <div className="px-6 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-sm text-white">Official Term Grade Transcript</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadPdf}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF Scorecard</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Transcript</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE REPORT CARD CONTAINER */}
        <div className="p-8 overflow-y-auto space-y-6 bg-white text-slate-900 print:p-0">
          
          {/* Institutional Header */}
          <div className="border-b-2 border-indigo-900 pb-4 text-center space-y-1">
            <h1 className="text-xl font-serif font-black tracking-wider text-indigo-950 uppercase">
              INSTITUTE OF TECHNOLOGY & SCIENCE
            </h1>
            <p className="text-xs font-serif text-slate-600">
              Autonomous Institution Affiliated to National Technological University
            </p>
            <p className="text-[10px] font-mono text-slate-500">
              ISO 9001:2015 Certified • Accredited 'A+' Grade by NAAC
            </p>
            <div className="mt-2 inline-block bg-indigo-900 text-white text-[11px] font-bold px-4 py-1 rounded-full uppercase tracking-widest">
              OFFICIAL GRADE CARD & STATEMENT OF MARKS (SEMESTER {student.semester})
            </div>
          </div>

          {/* Student Demographics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Student Name:</span>
              <span className="font-bold text-slate-900">{student.name}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Roll Number:</span>
              <span className="font-mono font-bold text-indigo-900">{student.rollNumber}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Department:</span>
              <span className="font-semibold text-slate-800">{student.department}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Semester & Year:</span>
              <span className="font-semibold text-slate-800">Sem {student.semester} ({student.admissionYear})</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Father's Name:</span>
              <span className="text-slate-800">{student.guardian.fatherName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Student ID:</span>
              <span className="font-mono text-slate-800">{student.id}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Attendance %:</span>
              <span className={`font-mono font-bold ${isEligible ? 'text-emerald-700' : 'text-rose-700'}`}>
                {attendancePct.toFixed(1)}% ({isEligible ? 'Eligible' : 'Debarred'})
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Result Status:</span>
              <span className="font-bold text-emerald-700 uppercase">
                {studentMarks.every((m) => m.passed) ? 'PASSED' : 'RE-EXAM REQUIRED'}
              </span>
            </div>
          </div>

          {/* Marks Breakdown Table */}
          <div className="overflow-x-auto rounded-lg border border-slate-300">
            <table className="w-full text-left text-xs">
              <thead className="bg-indigo-900 text-white font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">Sub Code</th>
                  <th className="p-2.5">Subject Title</th>
                  <th className="p-2.5">Credits</th>
                  <th className="p-2.5">Best ISE (20)</th>
                  <th className="p-2.5">Prac (20)</th>
                  <th className="p-2.5">EndSem (60)</th>
                  <th className="p-2.5">Total (100)</th>
                  <th className="p-2.5">Grade</th>
                  <th className="p-2.5">Grade Point</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {markSubjectPairs.map(({ mark, subject }) => (
                  <tr key={mark.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-mono font-bold text-indigo-950">{subject.code}</td>
                    <td className="p-2.5 font-semibold">{subject.name}</td>
                    <td className="p-2.5 font-mono text-center">{subject.credits}</td>
                    <td className="p-2.5 font-mono">{mark.calculatedBestIse.toFixed(1)}</td>
                    <td className="p-2.5 font-mono">{mark.practical}</td>
                    <td className="p-2.5 font-mono">{mark.endSem}</td>
                    <td className="p-2.5 font-mono font-bold text-indigo-900">{mark.totalMarks.toFixed(1)}</td>
                    <td className="p-2.5 font-bold">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        mark.grade === 'F' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {mark.grade}
                      </span>
                    </td>
                    <td className="p-2.5 font-mono font-bold text-center">{mark.gradePoint.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Transcript Summary Metrics Footer */}
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <span className="text-[10px] font-bold text-indigo-800 uppercase block">Total Marks</span>
              <span className="text-lg font-bold text-slate-900">{totalMarksObtained.toFixed(1)} / {totalMaxMarks}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-indigo-800 uppercase block">Percentage</span>
              <span className="text-lg font-bold text-indigo-900">{overallPct.toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-indigo-800 uppercase block">Credits Earned</span>
              <span className="text-lg font-bold text-slate-900">{earnedCredits} / {totalCredits}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-indigo-800 uppercase block">Semester SGPA</span>
              <span className="text-xl font-black text-indigo-950">{sgpa.toFixed(2)} / 10.0</span>
            </div>
          </div>

          {/* Institutional Signatures */}
          <div className="pt-12 flex justify-between items-end text-xs text-slate-700">
            <div className="text-center space-y-1">
              <div className="w-36 border-b border-slate-400 mx-auto"></div>
              <p className="font-bold">Verified By (Class Teacher)</p>
            </div>
            <div className="text-center space-y-1">
              <div className="w-36 border-b border-slate-400 mx-auto"></div>
              <p className="font-bold">Controller of Examinations</p>
            </div>
            <div className="text-center space-y-1">
              <div className="w-36 border-b border-slate-400 mx-auto"></div>
              <p className="font-bold">Principal / Dean Academic</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
