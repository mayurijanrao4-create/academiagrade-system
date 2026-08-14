import React from 'react';
import { Student, ExamMark, Subject, AttendanceRecord } from '../../types';
import { calculateSGPA } from '../../utils/gradeCalculator';
import { X, User, Phone, Mail, MapPin, Award, AlertTriangle, ShieldCheck, Calendar, BookOpen, CheckCircle2 } from 'lucide-react';

interface StudentDetailModalProps {
  student: Student;
  marks: ExamMark[];
  subjects: Subject[];
  attendance: AttendanceRecord[];
  onClose: () => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  marks,
  subjects,
  attendance,
  onClose,
}) => {
  // Compute overall statistics for this student
  const studentMarks = marks.filter((m) => m.studentId === student.id);
  const totalMarksObtained = studentMarks.reduce((acc, curr) => acc + curr.totalMarks, 0);
  const avgPercentage = studentMarks.length > 0 ? totalMarksObtained / studentMarks.length : 0;

  // Calculate real SGPA and Credits using calculateSGPA utility
  const marksWithSubjects = studentMarks.map((m) => ({
    mark: m,
    subject: subjects.find((s) => s.id === m.subjectId) || {
      id: m.subjectId,
      code: 'SUB',
      name: m.subjectId,
      department: student.department,
      semester: student.semester,
      credits: 4,
      maxIseMarks: 20,
      maxPracticalMarks: 20,
      maxEndSemMarks: 60,
    },
  }));

  const { sgpa, totalCredits, earnedCredits } = calculateSGPA(marksWithSubjects);

  // Attendance metrics
  const studentAttendance = attendance.filter((a) => a.studentId === student.id);
  const totalAttended = studentAttendance.reduce((acc, curr) => acc + curr.attendedLectures, 0);
  const totalLectures = studentAttendance.reduce((acc, curr) => acc + curr.totalLectures, 0);
  const overallAttendancePct = totalLectures > 0 ? (totalAttended / totalLectures) * 100 : 100;
  const isAttendanceEligible = overallAttendancePct >= 75.0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl text-slate-100">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-base sm:text-lg shrink-0">
              {student.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2 truncate">
                <span className="truncate">{student.name}</span>
                <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-md font-mono bg-slate-800 border border-slate-700 text-indigo-300 shrink-0">
                  {student.rollNumber}
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">{student.department} • Semester {student.semester}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Close Profile"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6">
          
          {/* Status Alert Banner */}
          {!isAttendanceEligible && (
            <div className="p-3.5 sm:p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-3 text-rose-300 text-xs">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-200">ATTENDANCE DEFICIT ALERT (DEBARRED RISK)</p>
                <p className="mt-0.5 text-[11px] sm:text-xs">
                  Overall attendance is <span className="font-bold underline">{overallAttendancePct.toFixed(1)}%</span> (below mandatory 75% rule). Student is flagged as in-eligible for term end examinations.
                </p>
              </div>
            </div>
          )}

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="p-3 sm:p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="text-[10px] sm:text-xs text-slate-400 font-medium">Semester SGPA</div>
              <div className="text-lg sm:text-xl font-bold font-mono text-indigo-400 mt-0.5">{sgpa.toFixed(2)}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Scale: 10.0</div>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="text-[10px] sm:text-xs text-slate-400 font-medium">Average Score</div>
              <div className="text-lg sm:text-xl font-bold font-mono text-indigo-300 mt-0.5">{avgPercentage.toFixed(1)}%</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Weighted Avg</div>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="text-[10px] sm:text-xs text-slate-400 font-medium">Credits Earned</div>
              <div className="text-lg sm:text-xl font-bold font-mono text-emerald-400 mt-0.5">{earnedCredits} / {totalCredits}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Current Term</div>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="text-[10px] sm:text-xs text-slate-400 font-medium">Attendance</div>
              <div className={`text-lg sm:text-xl font-bold font-mono mt-0.5 ${isAttendanceEligible ? 'text-emerald-400' : 'text-rose-400'}`}>
                {overallAttendancePct.toFixed(1)}%
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">{isAttendanceEligible ? 'Eligible' : 'Debarred'}</div>
            </div>
          </div>

          {/* Student & Guardian Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-1.5">
                <User className="w-4 h-4" />
                <span>Personal & Academic Details</span>
              </h3>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-700/40 text-slate-300">
                  <span className="text-slate-400">Student ID:</span>
                  <span className="font-mono">{student.id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700/40 text-slate-300">
                  <span className="text-slate-400">Email:</span>
                  <span className="truncate max-w-[180px] sm:max-w-none">{student.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700/40 text-slate-300">
                  <span className="text-slate-400">Phone:</span>
                  <span>{student.phone}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700/40 text-slate-300">
                  <span className="text-slate-400">Admission Year:</span>
                  <span>{student.admissionYear}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-300">
                  <span className="text-slate-400">Date of Birth:</span>
                  <span>{student.dob}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Guardian & Contact Info</span>
              </h3>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-700/40 text-slate-300">
                  <span className="text-slate-400">Father's Name:</span>
                  <span>{student.guardian.fatherName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700/40 text-slate-300">
                  <span className="text-slate-400">Mother's Name:</span>
                  <span>{student.guardian.motherName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700/40 text-slate-300">
                  <span className="text-slate-400">Guardian Phone:</span>
                  <span>{student.guardian.guardianPhone}</span>
                </div>
                <div className="py-1 text-slate-300">
                  <span className="text-slate-400 block mb-0.5">Address:</span>
                  <span className="text-slate-300 text-[11px] leading-relaxed">{student.guardian.address}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Subject-Wise Marks & Grades Breakdown */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-1.5">
              <BookOpen className="w-4 h-4" />
              <span>Subject-Wise Marks & Grades</span>
            </h3>

            <div className="overflow-x-auto rounded-xl border border-slate-700/60">
              <table className="w-full text-left text-xs text-slate-300 whitespace-nowrap">
                <thead className="bg-slate-800 text-slate-400 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Credits</th>
                    <th className="p-3">Best ISE (20)</th>
                    <th className="p-3">Practical (20)</th>
                    <th className="p-3">End Sem (60)</th>
                    <th className="p-3">Total (100)</th>
                    <th className="p-3">Grade</th>
                    <th className="p-3">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {studentMarks.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-4 text-center text-slate-500">
                        No examination records found for this student.
                      </td>
                    </tr>
                  ) : (
                    studentMarks.map((m) => {
                      const sub = subjects.find((s) => s.id === m.subjectId);
                      return (
                        <tr key={m.id} className="hover:bg-slate-800/40">
                          <td className="p-3 font-medium text-white">
                            <div>{sub?.name || m.subjectId}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{sub?.code}</div>
                          </td>
                          <td className="p-3 font-mono text-slate-300">{sub?.credits || 4}</td>
                          <td className="p-3 font-mono">{m.calculatedBestIse.toFixed(1)}</td>
                          <td className="p-3 font-mono">{m.practical}</td>
                          <td className="p-3 font-mono">{m.endSem}</td>
                          <td className="p-3 font-mono font-bold text-indigo-300">{m.totalMarks.toFixed(1)}</td>
                          <td className="p-3 font-semibold">
                            <span className={`px-2 py-0.5 rounded text-[10px] ${
                              m.grade === 'F' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}>
                              {m.grade}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-semibold text-slate-200">{m.gradePoint}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 bg-slate-800/60 border-t border-slate-700/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            Close Profile
          </button>
        </div>

      </div>
    </div>
  );
};

