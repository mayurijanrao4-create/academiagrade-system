import React, { useState } from 'react';
import { Student, ExamMark, Subject, AttendanceRecord } from '../../types';
import { calculateSGPA, evaluateAttendance75Rule } from '../../utils/gradeCalculator';
import { ReportCardModal } from './ReportCardModal';
import {
  GraduationCap,
  Award,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  FileText,
  User,
  Phone,
  Mail,
  ShieldAlert,
  BookOpen,
  TrendingUp,
  Clock
} from 'lucide-react';

interface StudentDashboardProps {
  student: Student;
  marks: ExamMark[];
  subjects: Subject[];
  attendance: AttendanceRecord[];
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  marks,
  subjects,
  attendance,
}) => {
  const [isReportCardOpen, setIsReportCardOpen] = useState(false);

  // Student specific data
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

  // Attendance Metrics
  const studentAtt = attendance.filter((a) => a.studentId === student.id);
  const totalAttended = studentAtt.reduce((acc, curr) => acc + curr.attendedLectures, 0);
  const totalLectures = studentAtt.reduce((acc, curr) => acc + curr.totalLectures, 0);
  const attEval = evaluateAttendance75Rule(totalAttended, totalLectures);

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Profile Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-emerald-600/20">
            {student.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white">{student.name}</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-semibold">
                {student.rollNumber}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {student.department} • Semester {student.semester} • Batch {student.admissionYear}
            </p>
          </div>
        </div>

        {/* View Official Report Card Button */}
        <button
          onClick={() => setIsReportCardOpen(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/30"
        >
          <FileText className="w-4 h-4" />
          <span>View Official Grade Card</span>
        </button>

      </div>

      {/* 75% Attendance Warning Banner if deficit */}
      {!attEval.isEligible && (
        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-4 text-rose-300 shadow-lg">
          <ShieldAlert className="w-6 h-6 text-rose-400 flex-shrink-0 mt-1" />
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-rose-200 uppercase tracking-wide">
              MANDATORY ATTENDANCE DEFICIT ALERT (75% RULE VIOLATION)
            </h3>
            <p className="text-xs">
              Your overall attendance is currently <span className="font-bold underline">{attEval.percentage.toFixed(1)}%</span> ({totalAttended}/{totalLectures} lectures), which is below the university 75% eligibility rule.
            </p>
            <p className="text-xs font-semibold text-rose-200">
              ⚠️ You must attend at least <span className="underline font-bold text-white">{attEval.requiredLecturesToReach75} consecutive upcoming lectures</span> to restore eligibility for end-semester examinations.
            </p>
          </div>
        </div>
      )}

      {/* Quick Academic Metric Dials */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-black text-xl">
            {sgpa.toFixed(2)}
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Semester SGPA</p>
            <p className="text-sm font-bold text-white mt-0.5">Scale 10.0</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-black text-xl">
            {overallPct.toFixed(1)}%
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Overall Percentage</p>
            <p className="text-sm font-bold text-white mt-0.5">{totalMarksObtained.toFixed(1)} / {totalMaxMarks} Marks</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center font-black text-xl ${
            attEval.isEligible ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}>
            {attEval.percentage.toFixed(0)}%
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Attendance</p>
            <p className={`text-xs font-bold mt-0.5 ${attEval.isEligible ? 'text-emerald-400' : 'text-rose-400'}`}>
              {attEval.isEligible ? 'Eligible for Exams' : 'Debarred (<75%)'}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Credits Earned</p>
            <p className="text-sm font-bold text-white mt-0.5">{earnedCredits} / {totalCredits} Credits</p>
          </div>
        </div>

      </div>

      {/* Subject-Wise Marks & Performance Grid */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg space-y-4 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Current Term Evaluation Breakdown</span>
            </h3>
            <p className="text-xs text-slate-400">ISE (Best 2 of 3), Practical, Assignment, and End-Semester scores</p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold uppercase text-[10px]">
              <tr>
                <th className="p-3">Course Title</th>
                <th className="p-3">ISE-1 (20)</th>
                <th className="p-3">ISE-2 (20)</th>
                <th className="p-3">ISE-3 (20)</th>
                <th className="p-3">Best ISE</th>
                <th className="p-3">Prac (20)</th>
                <th className="p-3">EndSem (60)</th>
                <th className="p-3">Total (100)</th>
                <th className="p-3">Grade Point</th>
                <th className="p-3">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {markSubjectPairs.map(({ mark, subject }) => (
                <tr key={mark.id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-medium text-white">
                    <div>{subject.name}</div>
                    <div className="text-[10px] font-mono text-indigo-300">{subject.code}</div>
                  </td>
                  <td className="p-3 font-mono">{mark.ise1}</td>
                  <td className="p-3 font-mono">{mark.ise2}</td>
                  <td className="p-3 font-mono">{mark.ise3}</td>
                  <td className="p-3 font-mono font-bold text-slate-100">{mark.calculatedBestIse.toFixed(1)}</td>
                  <td className="p-3 font-mono">{mark.practical}</td>
                  <td className="p-3 font-mono">{mark.endSem}</td>
                  <td className="p-3 font-mono font-bold text-emerald-400">{mark.totalMarks.toFixed(1)}</td>
                  <td className="p-3 font-mono font-bold text-slate-200">{mark.gradePoint.toFixed(1)}</td>
                  <td className="p-3 font-bold">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      mark.grade === 'F' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {mark.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guardian Demographics Card */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-1.5">
          <User className="w-4 h-4" />
          <span>Guardian & Residential Details</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 block text-[10px] uppercase">Father's Name</span>
            <span className="font-semibold text-white">{student.guardian.fatherName}</span>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 block text-[10px] uppercase">Guardian Phone</span>
            <span className="font-semibold text-white">{student.guardian.guardianPhone}</span>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 block text-[10px] uppercase">Address</span>
            <span className="font-semibold text-white truncate block">{student.guardian.address}</span>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isReportCardOpen && (
        <ReportCardModal
          student={student}
          marks={marks}
          subjects={subjects}
          attendance={attendance}
          onClose={() => setIsReportCardOpen(false)}
        />
      )}

    </div>
  );
};
