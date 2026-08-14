import React, { useState } from 'react';
import { Student, ExamMark, Subject, AttendanceRecord } from '../../types';
import { calculateSGPA, evaluateAttendance75Rule, calculateDivision } from '../../utils/gradeCalculator';
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
  Clock,
  MapPin,
  ShieldCheck,
  BarChart3,
  Layers,
  Sparkles,
  Printer
} from 'lucide-react';

interface StudentDashboardProps {
  student: Student;
  marks: ExamMark[];
  subjects: Subject[];
  attendance: AttendanceRecord[];
}

type StudentSection = 'DASHBOARD' | 'PROFILE' | 'SUBJECTS' | 'MARKS' | 'ATTENDANCE' | 'GRADECARD' | 'PERFORMANCE';

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  marks,
  subjects,
  attendance,
}) => {
  const [activeSection, setActiveSection] = useState<StudentSection>('DASHBOARD');
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
  const division = calculateDivision(overallPct, studentMarks);

  // Attendance Metrics
  const studentAtt = attendance.filter((a) => a.studentId === student.id);
  const totalAttended = studentAtt.reduce((acc, curr) => acc + curr.attendedLectures, 0);
  const totalLectures = studentAtt.reduce((acc, curr) => acc + curr.totalLectures, 0);
  const attEval = evaluateAttendance75Rule(totalAttended, totalLectures);

  return (
    <div className="space-y-5 w-full max-w-full overflow-hidden">
      
      {/* Top Banner & Profile Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
        
        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-xl sm:text-2xl shadow-lg shadow-emerald-600/20 shrink-0">
            {student.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-xl font-bold text-white truncate">{student.name}</h2>
              <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-semibold shrink-0">
                {student.rollNumber}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 truncate">
              {student.department} • Semester {student.semester} • Batch {student.admissionYear}
            </p>
          </div>
        </div>

        {/* Quick Action: View Official Grade Card */}
        <button
          onClick={() => setIsReportCardOpen(true)}
          className="w-full md:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold px-4 sm:px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/30 text-xs sm:text-sm shrink-0"
        >
          <FileText className="w-4 h-4 shrink-0" />
          <span>Official Grade Card</span>
        </button>

      </div>

      {/* 75% Attendance Alert Banner if deficit */}
      {!attEval.isEligible && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-3 sm:space-x-4 text-rose-300 shadow-lg">
          <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h3 className="font-bold text-xs sm:text-sm text-rose-200 uppercase tracking-wide">
              Mandatory Attendance Deficit Alert (75% Rule Violation)
            </h3>
            <p>
              Your overall attendance is currently <span className="font-bold underline">{attEval.percentage.toFixed(1)}%</span> ({totalAttended}/{totalLectures} lectures), which is below the university 75% eligibility requirement.
            </p>
            <p className="font-semibold text-rose-200">
              ⚠️ You must attend at least <span className="underline font-bold text-white">{attEval.requiredLecturesToReach75} consecutive upcoming lectures</span> to restore examination eligibility.
            </p>
          </div>
        </div>
      )}

      {/* STUDENT PORTAL NAVIGATION BAR */}
      <div className="border-b border-slate-800 flex space-x-2 sm:space-x-4 text-xs font-medium overflow-x-auto whitespace-nowrap pb-1 w-full max-w-full">
        <button
          onClick={() => setActiveSection('DASHBOARD')}
          className={`pb-2.5 px-2 flex items-center space-x-1.5 border-b-2 transition-colors shrink-0 ${
            activeSection === 'DASHBOARD' ? 'border-emerald-500 text-emerald-400 font-semibold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveSection('PROFILE')}
          className={`pb-2.5 px-2 flex items-center space-x-1.5 border-b-2 transition-colors shrink-0 ${
            activeSection === 'PROFILE' ? 'border-emerald-500 text-emerald-400 font-semibold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>My Profile</span>
        </button>

        <button
          onClick={() => setActiveSection('SUBJECTS')}
          className={`pb-2.5 px-2 flex items-center space-x-1.5 border-b-2 transition-colors shrink-0 ${
            activeSection === 'SUBJECTS' ? 'border-emerald-500 text-emerald-400 font-semibold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>My Subjects</span>
        </button>

        <button
          onClick={() => setActiveSection('MARKS')}
          className={`pb-2.5 px-2 flex items-center space-x-1.5 border-b-2 transition-colors shrink-0 ${
            activeSection === 'MARKS' ? 'border-emerald-500 text-emerald-400 font-semibold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Marks</span>
        </button>

        <button
          onClick={() => setActiveSection('ATTENDANCE')}
          className={`pb-2.5 px-2 flex items-center space-x-1.5 border-b-2 transition-colors shrink-0 ${
            activeSection === 'ATTENDANCE' ? 'border-emerald-500 text-emerald-400 font-semibold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Attendance</span>
        </button>

        <button
          onClick={() => setActiveSection('PERFORMANCE')}
          className={`pb-2.5 px-2 flex items-center space-x-1.5 border-b-2 transition-colors shrink-0 ${
            activeSection === 'PERFORMANCE' ? 'border-emerald-500 text-emerald-400 font-semibold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Performance</span>
        </button>

        <button
          onClick={() => setIsReportCardOpen(true)}
          className="pb-2.5 px-2 flex items-center space-x-1.5 border-b-2 border-transparent text-indigo-400 hover:text-indigo-300 font-medium shrink-0"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Grade Card</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* SECTION 1: DASHBOARD OVERVIEW */}
      {/* ============================================================ */}
      {activeSection === 'DASHBOARD' && (
        <div className="space-y-5">
          {/* Quick Academic Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Semester SGPA</p>
              <div className="text-xl sm:text-2xl font-black font-mono text-indigo-400 mt-1">
                {sgpa.toFixed(2)}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Scale: 10.0</p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Overall Percentage</p>
              <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400 mt-1">
                {overallPct.toFixed(1)}%
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">{totalMarksObtained.toFixed(1)} / {totalMaxMarks} Marks</p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Attendance</p>
              <div className={`text-xl sm:text-2xl font-black font-mono mt-1 ${attEval.isEligible ? 'text-emerald-400' : 'text-rose-400'}`}>
                {attEval.percentage.toFixed(0)}%
              </div>
              <p className={`text-[10px] font-semibold mt-0.5 ${attEval.isEligible ? 'text-emerald-400' : 'text-rose-400'}`}>
                {attEval.isEligible ? '✓ Eligible for Examination' : '⚠ Attendance Shortage'}
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Total Credits Earned</p>
              <div className="text-xl sm:text-2xl font-black font-mono text-amber-400 mt-1">
                {earnedCredits} / {totalCredits}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Current Semester</p>
            </div>

          </div>

          {/* Quick Marks Preview */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 sm:p-6 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <span>Current Semester Evaluation Overview</span>
                </h3>
                <p className="text-xs text-slate-400">Best 2-of-3 ISE, Practical, End-Semester marks and letter grades</p>
              </div>
              <button
                onClick={() => setActiveSection('MARKS')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold hidden sm:inline-block"
              >
                Full Breakdown →
              </button>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Course Title</th>
                    <th className="p-3">Credits</th>
                    <th className="p-3">Best ISE (20)</th>
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
                      <td className="p-3 font-mono">{subject.credits}</td>
                      <td className="p-3 font-mono">{mark.calculatedBestIse.toFixed(1)}</td>
                      <td className="p-3 font-mono">{mark.practical}</td>
                      <td className="p-3 font-mono">{mark.endSem}</td>
                      <td className="p-3 font-mono font-bold text-emerald-400">{mark.totalMarks.toFixed(1)}</td>
                      <td className="p-3 font-mono font-bold text-slate-200">{mark.gradePoint.toFixed(1)}</td>
                      <td className="p-3 font-bold">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          mark.grade === 'F' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {mark.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-2.5">
              {markSubjectPairs.map(({ mark, subject }) => (
                <div key={mark.id} className="p-3.5 bg-slate-800/50 rounded-xl border border-slate-700/50 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white text-xs">{subject.name}</h4>
                      <p className="text-[10px] font-mono text-indigo-300">{subject.code} • {subject.credits} Credits</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      mark.grade === 'F' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {mark.grade} ({mark.gradePoint} pts)
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px] bg-slate-900/60 p-2 rounded-lg font-mono">
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-sans">Best ISE</span>
                      <span className="text-white">{mark.calculatedBestIse.toFixed(1)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-sans">End Sem</span>
                      <span className="text-white">{mark.endSem}/60</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-sans">Total</span>
                      <span className="font-bold text-emerald-400">{mark.totalMarks.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SECTION 2: MY PROFILE */}
      {/* ============================================================ */}
      {activeSection === 'PROFILE' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            
            {/* Personal & Academic Details */}
            <div className="p-4 sm:p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 shadow-md">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Academic & Personal Details</span>
              </h3>
              
              <div className="space-y-2 text-xs divide-y divide-slate-800">
                <div className="flex justify-between pt-1 text-slate-300">
                  <span className="text-slate-400">Full Name:</span>
                  <span className="font-bold text-white">{student.name}</span>
                </div>
                <div className="flex justify-between pt-2 text-slate-300">
                  <span className="text-slate-400">Roll Number:</span>
                  <span className="font-mono font-bold text-indigo-300">{student.rollNumber}</span>
                </div>
                <div className="flex justify-between pt-2 text-slate-300">
                  <span className="text-slate-400">Department:</span>
                  <span className="text-slate-200">{student.department}</span>
                </div>
                <div className="flex justify-between pt-2 text-slate-300">
                  <span className="text-slate-400">Current Semester:</span>
                  <span className="text-slate-200">Semester {student.semester}</span>
                </div>
                <div className="flex justify-between pt-2 text-slate-300">
                  <span className="text-slate-400">Admission Year:</span>
                  <span className="font-mono text-slate-200">{student.admissionYear}</span>
                </div>
                <div className="flex justify-between pt-2 text-slate-300">
                  <span className="text-slate-400">Date of Birth:</span>
                  <span className="text-slate-200">{student.dob}</span>
                </div>
                <div className="flex justify-between pt-2 text-slate-300">
                  <span className="text-slate-400">Official Email:</span>
                  <span className="text-slate-200 truncate max-w-[200px]">{student.email}</span>
                </div>
                <div className="flex justify-between pt-2 text-slate-300">
                  <span className="text-slate-400">Contact Phone:</span>
                  <span className="font-mono text-slate-200">{student.phone}</span>
                </div>
                <div className="flex justify-between pt-2 text-slate-300">
                  <span className="text-slate-400">Enrollment Status:</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    student.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {student.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Guardian & Residential Details */}
            <div className="p-4 sm:p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 shadow-md">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Guardian & Residential Details</span>
              </h3>
              
              <div className="space-y-2 text-xs divide-y divide-slate-800">
                <div className="flex justify-between pt-1 text-slate-300">
                  <span className="text-slate-400">Father's Name:</span>
                  <span className="font-semibold text-white">{student.guardian.fatherName}</span>
                </div>
                <div className="flex justify-between pt-2 text-slate-300">
                  <span className="text-slate-400">Mother's Name:</span>
                  <span className="font-semibold text-white">{student.guardian.motherName}</span>
                </div>
                <div className="flex justify-between pt-2 text-slate-300">
                  <span className="text-slate-400">Guardian Contact:</span>
                  <span className="font-mono text-slate-200">{student.guardian.guardianPhone}</span>
                </div>
                <div className="pt-2 text-slate-300">
                  <span className="text-slate-400 block mb-1">Permanent Address:</span>
                  <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 text-slate-200 text-xs leading-relaxed">
                    {student.guardian.address}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SECTION 3: MY SUBJECTS */}
      {/* ============================================================ */}
      {activeSection === 'SUBJECTS' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Registered Curriculum Courses</span>
              </h3>
              <p className="text-xs text-slate-400">Courses registered for Semester {student.semester} - {student.department}</p>
            </div>
            <span className="text-xs bg-slate-800 text-indigo-300 px-2.5 py-1 rounded-lg border border-slate-700 font-mono">
              Total Credits: {totalCredits}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {markSubjectPairs.map(({ mark, subject }) => (
              <div key={subject.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 shadow-md">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white text-sm">{subject.name}</h4>
                    <span className="text-xs font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      {subject.code}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20 font-mono">
                    {subject.credits} Credits
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/40 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Max ISE</span>
                    <span className="font-mono font-semibold text-slate-200">{subject.maxIseMarks} Marks</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Practical</span>
                    <span className="font-mono font-semibold text-slate-200">{subject.maxPracticalMarks} Marks</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">End Sem</span>
                    <span className="font-mono font-semibold text-slate-200">{subject.maxEndSemMarks} Marks</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Status:</span>
                  <span className="text-emerald-400 font-medium">✓ Enrolled & Evaluated</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SECTION 4: MARKS & EVALUATION BREAKDOWN */}
      {/* ============================================================ */}
      {activeSection === 'MARKS' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 sm:p-6 space-y-4 shadow-lg">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Comprehensive Continuous Evaluation Breakdown</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Algorithm: Best 2 out of 3 In-Semester Exams (ISE), Practical (20), Assignment (10), and End-Sem (60) scaled to 100.
            </p>
          </div>

          {/* Desktop Evaluation Table */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300 whitespace-nowrap">
              <thead className="bg-slate-800/80 text-slate-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Course</th>
                  <th className="p-3">ISE-1 (20)</th>
                  <th className="p-3">ISE-2 (20)</th>
                  <th className="p-3">ISE-3 (20)</th>
                  <th className="p-3">Best 2-of-3</th>
                  <th className="p-3">Practical (20)</th>
                  <th className="p-3">EndSem (60)</th>
                  <th className="p-3">Total (100)</th>
                  <th className="p-3">Grade Point</th>
                  <th className="p-3">Letter Grade</th>
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
                    <td className="p-3 font-mono font-bold text-indigo-300">{mark.calculatedBestIse.toFixed(1)}</td>
                    <td className="p-3 font-mono">{mark.practical}</td>
                    <td className="p-3 font-mono">{mark.endSem}</td>
                    <td className="p-3 font-mono font-bold text-emerald-400">{mark.totalMarks.toFixed(1)}</td>
                    <td className="p-3 font-mono font-bold text-slate-200">{mark.gradePoint.toFixed(1)}</td>
                    <td className="p-3 font-bold">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        mark.grade === 'F' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {mark.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Marks Cards */}
          <div className="md:hidden space-y-3">
            {markSubjectPairs.map(({ mark, subject }) => (
              <div key={mark.id} className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white text-xs">{subject.name}</h4>
                    <p className="text-[10px] font-mono text-indigo-300">{subject.code} • {subject.credits} Credits</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    mark.grade === 'F' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    Grade {mark.grade} ({mark.gradePoint} pts)
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 font-mono">
                  <div>
                    <span className="text-[9px] text-slate-400 block font-sans">ISE (1,2,3)</span>
                    <span className="text-slate-200">{mark.ise1},{mark.ise2},{mark.ise3}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block font-sans">Best ISE</span>
                    <span className="font-bold text-indigo-300">{mark.calculatedBestIse.toFixed(1)}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block font-sans">Practical</span>
                    <span className="text-slate-200">{mark.practical}/20</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block font-sans">End Sem</span>
                    <span className="text-slate-200">{mark.endSem}/60</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[9px] text-slate-400 block font-sans">Total Score</span>
                    <span className="font-bold text-emerald-400 text-xs">{mark.totalMarks.toFixed(1)} / 100</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ============================================================ */}
      {/* SECTION 5: ATTENDANCE */}
      {/* ============================================================ */}
      {activeSection === 'ATTENDANCE' && (
        <div className="space-y-4">
          <div className="p-4 sm:p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>Mandatory 75% Attendance Compliance Meter</span>
                </h3>
                <p className="text-xs text-slate-400">Institutional threshold required for semester exam qualification</p>
              </div>
              <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                attEval.isEligible ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              }`}>
                {attEval.isEligible ? '✓ Eligible for Examination' : '⚠ Attendance Shortage'}
              </span>
            </div>

            {/* Attendance Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Overall Attendance: {attEval.percentage.toFixed(1)}%</span>
                <span className="text-slate-400">{totalAttended} of {totalLectures} Conducted Classes</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700/80">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    attEval.isEligible ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-rose-600 to-amber-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, attEval.percentage))}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0%</span>
                <span className="text-amber-400 font-bold">75% (Mandatory Cutoff)</span>
                <span>100%</span>
              </div>
            </div>

            {/* Subject-Wise Attendance Breakdown */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Subject-Wise Attendance Breakdown</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {studentAtt.map((att) => {
                  const sub = subjects.find((s) => s.id === att.subjectId);
                  return (
                    <div key={att.id} className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/50 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="text-xs font-bold text-white truncate max-w-[160px]">{sub?.name || att.subjectId}</h5>
                          <span className="text-[10px] font-mono text-slate-400">{sub?.code}</span>
                        </div>
                        <span className={`text-xs font-bold font-mono ${att.percentage >= 75 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {att.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex justify-between pt-1 border-t border-slate-700/40">
                        <span>Attended: {att.attendedLectures}/{att.totalLectures}</span>
                        <span className={att.percentage >= 75 ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
                          {att.percentage >= 75 ? 'Qualified' : 'Deficit'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SECTION 6: PERFORMANCE & ANALYTICS */}
      {/* ============================================================ */}
      {activeSection === 'PERFORMANCE' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Division & Academic Standing */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 shadow-md">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span>Academic Standing</span>
              </h4>
              <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60 text-center space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Conferred Result Division</span>
                <p className="text-base font-bold text-white">{division}</p>
              </div>
              <div className="text-xs text-slate-400 space-y-1.5 pt-1">
                <div className="flex justify-between">
                  <span>Semester SGPA:</span>
                  <span className="font-bold text-indigo-300 font-mono">{sgpa.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Aggregate Percentage:</span>
                  <span className="font-bold text-emerald-400 font-mono">{overallPct.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Backlogs / ATKT:</span>
                  <span className="font-bold text-slate-200 font-mono">
                    {studentMarks.filter((m) => m.grade === 'F').length}
                  </span>
                </div>
              </div>
            </div>

            {/* Credit Accumulation */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 shadow-md">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-2">
                <Award className="w-4 h-4" />
                <span>Credit Accumulation</span>
              </h4>
              <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60 text-center space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Earned Credits</span>
                <p className="text-2xl font-black font-mono text-amber-400">{earnedCredits} / {totalCredits}</p>
              </div>
              <p className="text-xs text-slate-400 text-center">
                {earnedCredits === totalCredits ? '✓ 100% of Semester Credits successfully cleared.' : '⚠️ Pending backlog credits detected.'}
              </p>
            </div>

            {/* Grade Distribution */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 shadow-md">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Grade Distribution</span>
              </h4>
              <div className="space-y-1.5 text-xs">
                {['O', 'A+', 'A', 'B+', 'B', 'C', 'F'].map((gradeKey) => {
                  const count = studentMarks.filter((m) => m.grade === gradeKey).length;
                  if (count === 0) return null;
                  return (
                    <div key={gradeKey} className="flex justify-between items-center py-1 px-2.5 bg-slate-800/40 rounded-lg">
                      <span className="font-bold text-indigo-300">Grade {gradeKey}</span>
                      <span className="font-mono text-slate-300 font-semibold">{count} subject{count > 1 ? 's' : ''}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Official Grade Card Modal */}
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

