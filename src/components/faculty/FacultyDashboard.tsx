import React, { useState } from 'react';
import { Faculty, Student, Subject, ExamMark, AttendanceRecord } from '../../types';
import { computeSubjectGrade, evaluateAttendance75Rule } from '../../utils/gradeCalculator';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  XCircle,
  Save,
  Award,
  AlertCircle,
  BarChart2,
  UserCheck
} from 'lucide-react';

interface FacultyDashboardProps {
  faculty: Faculty;
  students: Student[];
  subjects: Subject[];
  marks: ExamMark[];
  attendance: AttendanceRecord[];
  onUpdateMarks: (updatedMark: ExamMark) => void;
  onUpdateAttendance: (studentId: string, subjectId: string, attended: number, total: number) => void;
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({
  faculty,
  students,
  subjects,
  marks,
  attendance,
  onUpdateMarks,
  onUpdateAttendance,
}) => {
  const assignedSubjects = subjects.filter((s) => faculty.assignedSubjectIds.includes(s.id));
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(assignedSubjects[0]?.id || subjects[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'MARKS' | 'ATTENDANCE'>('MARKS');

  const activeSubject = subjects.find((s) => s.id === selectedSubjectId);

  // Filter students relevant to active subject's department/semester
  const relevantStudents = students.filter(
    (st) => st.department === activeSubject?.department && st.semester === activeSubject?.semester
  );

  // Local state for editing marks
  const [editedMarksMap, setEditedMarksMap] = useState<Record<string, Partial<ExamMark>>>({});
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const handleMarkChange = (studentId: string, field: keyof ExamMark, value: number) => {
    const key = `${studentId}_${selectedSubjectId}`;
    const existing = editedMarksMap[key] || marks.find((m) => m.studentId === studentId && m.subjectId === selectedSubjectId) || {
      studentId,
      subjectId: selectedSubjectId,
      semester: activeSubject?.semester || 4,
      ise1: 15,
      ise2: 15,
      ise3: 15,
      assignment: 8,
      practical: 16,
      endSem: 40,
    };

    const updated = {
      ...existing,
      [field]: Math.max(0, value),
    };

    setEditedMarksMap((prev) => ({
      ...prev,
      [key]: updated,
    }));
  };

  const handleSaveMarks = (studentId: string) => {
    const key = `${studentId}_${selectedSubjectId}`;
    const data = editedMarksMap[key];
    if (!data) return;

    const ise1 = Number(data.ise1 ?? 0);
    const ise2 = Number(data.ise2 ?? 0);
    const ise3 = Number(data.ise3 ?? 0);
    const assignment = Number(data.assignment ?? 0);
    const practical = Number(data.practical ?? 0);
    const endSem = Number(data.endSem ?? 0);

    const computed = computeSubjectGrade(ise1, ise2, ise3, assignment, practical, endSem);

    const fullMarkObj: ExamMark = {
      id: `M_${studentId}_${selectedSubjectId}`,
      studentId,
      subjectId: selectedSubjectId,
      semester: activeSubject?.semester || 4,
      ise1,
      ise2,
      ise3,
      assignment,
      practical,
      endSem,
      ...computed,
    };

    onUpdateMarks(fullMarkObj);
    setSaveSuccessMsg(`Marks updated successfully for Student ID ${studentId}!`);
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Faculty Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xl">
            {faculty.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <span>{faculty.name}</span>
              <span className="text-xs px-2 py-0.5 rounded-md font-mono bg-blue-500/10 border border-blue-500/30 text-blue-300">
                {faculty.designation}
              </span>
            </h2>
            <p className="text-xs text-slate-400">{faculty.department} • {faculty.email}</p>
          </div>
        </div>

        {/* Assigned Subject Selector */}
        <div className="flex items-center space-x-3 bg-slate-800 p-2 rounded-xl border border-slate-700">
          <span className="text-xs font-medium text-slate-400 pl-2">Subject:</span>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-white text-xs font-semibold rounded-lg px-3 py-1.5 focus:outline-none"
          >
            {assignedSubjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.name} (Sem {s.semester})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Save Success Banner */}
      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Evaluation Tabs */}
      <div className="border-b border-slate-800 flex space-x-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('MARKS')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'MARKS' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Marks Evaluation Grid (ISE 1-3, Practical, EndSem)</span>
        </button>

        <button
          onClick={() => setActiveTab('ATTENDANCE')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'ATTENDANCE' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Attendance Register (75% Eligibility Check)</span>
        </button>
      </div>

      {/* TAB 1: MARKS EVALUATION GRID */}
      {activeTab === 'MARKS' && (
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
            <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700/80 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-white">{activeSubject?.name}</h3>
                <p className="text-xs text-slate-400">
                  Course Code: <span className="font-mono text-indigo-300">{activeSubject?.code}</span> • Max Marks: ISE (20x3), Assignment (10), Practical (20), EndSem (60)
                </p>
              </div>
              <span className="text-xs font-mono bg-blue-500/10 text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-lg font-semibold">
                Auto-Grade Active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/50 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-700/80">
                  <tr>
                    <th className="p-3">Roll No & Student</th>
                    <th className="p-3">ISE-1 (20)</th>
                    <th className="p-3">ISE-2 (20)</th>
                    <th className="p-3">ISE-3 (20)</th>
                    <th className="p-3">Assgn (10)</th>
                    <th className="p-3">Prac (20)</th>
                    <th className="p-3">EndSem (60)</th>
                    <th className="p-3">Best ISE</th>
                    <th className="p-3">Total (100)</th>
                    <th className="p-3">Grade</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {relevantStudents.map((st) => {
                    const key = `${st.id}_${selectedSubjectId}`;
                    const currentMark = editedMarksMap[key] || marks.find((m) => m.studentId === st.id && m.subjectId === selectedSubjectId) || {
                      ise1: 15, ise2: 15, ise3: 15, assignment: 8, practical: 16, endSem: 40
                    };

                    const ise1 = Number(currentMark.ise1 ?? 0);
                    const ise2 = Number(currentMark.ise2 ?? 0);
                    const ise3 = Number(currentMark.ise3 ?? 0);
                    const assignment = Number(currentMark.assignment ?? 0);
                    const practical = Number(currentMark.practical ?? 0);
                    const endSem = Number(currentMark.endSem ?? 0);

                    const computed = computeSubjectGrade(ise1, ise2, ise3, assignment, practical, endSem);

                    return (
                      <tr key={st.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 font-medium text-white">
                          <div className="font-bold">{st.name}</div>
                          <div className="text-[10px] font-mono text-slate-400">{st.rollNumber}</div>
                        </td>

                        <td className="p-3">
                          <input
                            type="number"
                            max={20}
                            min={0}
                            value={ise1}
                            onChange={(e) => handleMarkChange(st.id, 'ise1', Number(e.target.value))}
                            className="w-14 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono font-bold text-slate-100"
                          />
                        </td>

                        <td className="p-3">
                          <input
                            type="number"
                            max={20}
                            min={0}
                            value={ise2}
                            onChange={(e) => handleMarkChange(st.id, 'ise2', Number(e.target.value))}
                            className="w-14 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono font-bold text-slate-100"
                          />
                        </td>

                        <td className="p-3">
                          <input
                            type="number"
                            max={20}
                            min={0}
                            value={ise3}
                            onChange={(e) => handleMarkChange(st.id, 'ise3', Number(e.target.value))}
                            className="w-14 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono font-bold text-slate-100"
                          />
                        </td>

                        <td className="p-3">
                          <input
                            type="number"
                            max={10}
                            min={0}
                            value={assignment}
                            onChange={(e) => handleMarkChange(st.id, 'assignment', Number(e.target.value))}
                            className="w-14 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono text-slate-100"
                          />
                        </td>

                        <td className="p-3">
                          <input
                            type="number"
                            max={20}
                            min={0}
                            value={practical}
                            onChange={(e) => handleMarkChange(st.id, 'practical', Number(e.target.value))}
                            className="w-14 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono text-slate-100"
                          />
                        </td>

                        <td className="p-3">
                          <input
                            type="number"
                            max={60}
                            min={0}
                            value={endSem}
                            onChange={(e) => handleMarkChange(st.id, 'endSem', Number(e.target.value))}
                            className="w-16 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono font-bold text-indigo-300"
                          />
                        </td>

                        <td className="p-3 font-mono font-semibold text-slate-300">
                          {computed.calculatedBestIse.toFixed(1)}
                        </td>

                        <td className="p-3 font-mono font-bold text-emerald-400">
                          {computed.totalMarks.toFixed(1)}
                        </td>

                        <td className="p-3 font-bold">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${
                            computed.grade === 'F' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                          }`}>
                            {computed.grade}
                          </span>
                        </td>

                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleSaveMarks(st.id)}
                            className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                            title="Save Mark Entry"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ATTENDANCE REGISTER */}
      {activeTab === 'ATTENDANCE' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-white">Daily Lecture Attendance Register</h3>
              <p className="text-xs text-slate-400">Maintains mandatory 75% attendance rule compliance</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Student Name & Roll No</th>
                  <th className="p-3">Conducted Lectures</th>
                  <th className="p-3">Attended Lectures</th>
                  <th className="p-3">Attendance %</th>
                  <th className="p-3">Eligibility Status</th>
                  <th className="p-3 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {relevantStudents.map((st) => {
                  const attRecord = attendance.find((a) => a.studentId === st.id && a.subjectId === selectedSubjectId) || {
                    totalLectures: 48,
                    attendedLectures: 42,
                  };

                  const evalResult = evaluateAttendance75Rule(attRecord.attendedLectures, attRecord.totalLectures);

                  return (
                    <tr key={st.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-medium text-white">
                        <div>{st.name}</div>
                        <div className="text-[10px] font-mono text-slate-400">{st.rollNumber}</div>
                      </td>
                      <td className="p-3 font-mono">{attRecord.totalLectures}</td>
                      <td className="p-3 font-mono font-bold text-indigo-300">{attRecord.attendedLectures}</td>
                      <td className="p-3 font-mono font-bold">
                        <span className={evalResult.isEligible ? 'text-emerald-400' : 'text-rose-400'}>
                          {evalResult.percentage.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-3">
                        {evalResult.isEligible ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center w-fit space-x-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>ELIGIBLE</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center w-fit space-x-1">
                            <XCircle className="w-3 h-3" />
                            <span>DEBARRED (&lt;75%)</span>
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => onUpdateAttendance(st.id, selectedSubjectId, attRecord.attendedLectures + 1, attRecord.totalLectures + 1)}
                          className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-[10px] font-semibold"
                        >
                          + Mark Present
                        </button>
                        <button
                          onClick={() => onUpdateAttendance(st.id, selectedSubjectId, attRecord.attendedLectures, attRecord.totalLectures + 1)}
                          className="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-lg text-[10px] font-semibold"
                        >
                          + Mark Absent
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
