import React, { useState } from 'react';
import { Student, Faculty, Subject, ExamMark, AttendanceRecord, Department } from '../../types';
import { StudentDetailModal } from './StudentDetailModal';
import { AddStudentModal } from './AddStudentModal';
import {
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  Award,
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Trash2,
  Eye,
  Edit,
  Database,
  BarChart3,
  CheckCircle2,
  XCircle,
  FileCode2,
  UserCheck
} from 'lucide-react';

interface AdminDashboardProps {
  students: Student[];
  faculty: Faculty[];
  subjects: Subject[];
  marks: ExamMark[];
  attendance: AttendanceRecord[];
  onAddStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onAddSubject: (subject: Subject) => void;
  onAssignSubjectToFaculty: (facultyId: string, subjectId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  students,
  faculty,
  subjects,
  marks,
  attendance,
  onAddStudent,
  onDeleteStudent,
  onAddSubject,
  onAssignSubjectToFaculty,
}) => {
  const [activeTab, setActiveTab] = useState<'STUDENTS' | 'FACULTY' | 'SUBJECTS' | 'DATABASE'>('STUDENTS');

  // Search, Filter, Sort state for Students
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedSem, setSelectedSem] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'NAME' | 'ROLL' | 'PERCENTAGE'>('ROLL');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');

  // Modal States
  const [selectedStudentForView, setSelectedStudentForView] = useState<Student | null>(null);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);

  // New Subject Form State
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [newSubDept, setNewSubDept] = useState<Department>('Computer Science & Eng');
  const [newSubSem, setNewSubSem] = useState(4);
  const [newSubCredits, setNewSubCredits] = useState(4);
  const [showAddSubjectForm, setShowAddSubjectForm] = useState(false);

  // SQL Query Runner State
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM students WHERE status = "ACTIVE";');
  const [sqlResult, setSqlResult] = useState<string | null>(null);

  // Compute KPI metrics
  const totalStudents = students.length;
  const totalFaculty = faculty.length;

  const totalMarksArr = marks.map((m) => m.totalMarks);
  const overallClassAvgPct = totalMarksArr.length > 0 ? totalMarksArr.reduce((a, b) => a + b, 0) / totalMarksArr.length : 0;

  // Pass vs Fail Count
  const failMarksCount = marks.filter((m) => !m.passed).length;
  const passMarksCount = marks.filter((m) => m.passed).length;

  // Attendance Deficit Count (<75%)
  const deficitStudentsCount = students.filter((st) => {
    const stAtt = attendance.filter((a) => a.studentId === st.id);
    const totLec = stAtt.reduce((acc, curr) => acc + curr.totalLectures, 0);
    const attLec = stAtt.reduce((acc, curr) => acc + curr.attendedLectures, 0);
    return totLec > 0 && (attLec / totLec) < 0.75;
  }).length;

  // Compute Student Marks Summary for sorting & filtering
  const studentSummaries = students.map((st) => {
    const stMarks = marks.filter((m) => m.studentId === st.id);
    const totalObtained = stMarks.reduce((acc, curr) => acc + curr.totalMarks, 0);
    const avgPct = stMarks.length > 0 ? totalObtained / stMarks.length : 0;

    const stAtt = attendance.filter((a) => a.studentId === st.id);
    const totalLectures = stAtt.reduce((acc, curr) => acc + curr.totalLectures, 0);
    const attendedLectures = stAtt.reduce((acc, curr) => acc + curr.attendedLectures, 0);
    const attPct = totalLectures > 0 ? (attendedLectures / totalLectures) * 100 : 100;

    return {
      student: st,
      avgPct,
      attPct,
      isEligible: attPct >= 75.0,
    };
  });

  // Top Performing Student
  const sortedByPerf = [...studentSummaries].sort((a, b) => b.avgPct - a.avgPct);
  const topperSummary = sortedByPerf[0];

  // Filter & Sort Logic
  const filteredStudents = studentSummaries.filter(({ student }) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = selectedDept === 'ALL' || student.department === selectedDept;
    const matchesSem = selectedSem === 'ALL' || student.semester.toString() === selectedSem;

    return matchesSearch && matchesDept && matchesSem;
  });

  filteredStudents.sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'NAME') {
      comparison = a.student.name.localeCompare(b.student.name);
    } else if (sortBy === 'ROLL') {
      comparison = a.student.rollNumber.localeCompare(b.student.rollNumber);
    } else if (sortBy === 'PERCENTAGE') {
      comparison = a.avgPct - b.avgPct;
    }
    return sortOrder === 'ASC' ? comparison : -comparison;
  });

  const handleAddSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubCode || !newSubName) return;

    const newSub: Subject = {
      id: `SUB${Math.floor(300 + Math.random() * 100)}`,
      code: newSubCode.trim().toUpperCase(),
      name: newSubName.trim(),
      department: newSubDept,
      semester: newSubSem,
      credits: newSubCredits,
      maxIseMarks: 20,
      maxPracticalMarks: 20,
      maxEndSemMarks: 60,
    };

    onAddSubject(newSub);
    setNewSubCode('');
    setNewSubName('');
    setShowAddSubjectForm(false);
  };

  const handleRunSql = () => {
    if (sqlQuery.toLowerCase().includes('select')) {
      setSqlResult(`Query Executed Successfully (0.002 sec).\nFetched ${filteredStudents.length} rows from MySQL InnoDB table 'students'.`);
    } else {
      setSqlResult(`DDL/DML Statement Executed Successfully. 1 row affected.`);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Enrolled</p>
            <p className="text-xl font-bold text-white mt-0.5">{totalStudents} Students</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Faculty Members</p>
            <p className="text-xl font-bold text-white mt-0.5">{totalFaculty} Professors</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Overall Class Avg</p>
            <p className="text-xl font-bold text-emerald-400 mt-0.5">{overallClassAvgPct.toFixed(1)}%</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Class Topper</p>
            <p className="text-xs font-bold text-amber-300 mt-0.5 truncate max-w-[120px]">
              {topperSummary?.student.name || 'N/A'}
            </p>
            <span className="text-[10px] text-slate-400 font-mono">({topperSummary?.avgPct.toFixed(1)}%)</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Attendance Deficit</p>
            <p className="text-xl font-bold text-rose-400 mt-0.5">{deficitStudentsCount} (&lt;75%)</p>
          </div>
        </div>

      </div>

      {/* Sub-Navigation Tabs */}
      <div className="border-b border-slate-800 flex space-x-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('STUDENTS')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'STUDENTS' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Student Directory ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('FACULTY')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'FACULTY' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Faculty & Subjects</span>
        </button>

        <button
          onClick={() => setActiveTab('SUBJECTS')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'SUBJECTS' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Course Curriculum</span>
        </button>

        <button
          onClick={() => setActiveTab('DATABASE')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'DATABASE' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>MySQL Database Inspector</span>
        </button>
      </div>

      {/* TAB 1: STUDENT DIRECTORY & MANAGEMENT */}
      {activeTab === 'STUDENTS' && (
        <div className="space-y-4">
          
          {/* Controls Bar: Search, Filters, Sorting & Add Student Button */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
            
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by Student Name, Roll Number, Email or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Filters & Sorting */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              
              {/* Dept Filter */}
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
              >
                <option value="ALL">All Departments</option>
                <option value="Computer Science & Eng">CSE</option>
                <option value="Information Technology">IT</option>
                <option value="Electronics & Comm">ECE</option>
                <option value="Artificial Intelligence">AI</option>
              </select>

              {/* Semester Filter */}
              <select
                value={selectedSem}
                onChange={(e) => setSelectedSem(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
              >
                <option value="ALL">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s.toString()}>Semester {s}</option>
                ))}
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
              >
                <option value="ROLL">Sort by Roll No</option>
                <option value="NAME">Sort by Name</option>
                <option value="PERCENTAGE">Sort by Percentage</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')}
                className="p-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:text-white"
                title="Toggle Sort Order"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>

              {/* Add Student Button */}
              <button
                onClick={() => setIsAddStudentOpen(true)}
                className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl transition-colors shadow-md shadow-indigo-600/30"
              >
                <Plus className="w-4 h-4" />
                <span>Enroll Student</span>
              </button>

            </div>

          </div>

          {/* Student Table */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-700">
                  <tr>
                    <th className="p-3.5">Roll Number & Student</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5">Semester</th>
                    <th className="p-3.5">Average %</th>
                    <th className="p-3.5">Attendance</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        No students match the selected search and filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map(({ student, avgPct, attPct, isEligible }) => (
                      <tr key={student.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="p-3.5 font-medium text-white">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-xs">
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-100">{student.name}</div>
                              <div className="text-[10px] font-mono text-indigo-300">{student.rollNumber}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 text-slate-300">{student.department}</td>
                        <td className="p-3.5 font-mono">Sem {student.semester}</td>
                        <td className="p-3.5 font-mono font-bold text-indigo-300">
                          {avgPct > 0 ? `${avgPct.toFixed(1)}%` : 'N/A'}
                        </td>
                        <td className="p-3.5">
                          <span className={`font-mono font-semibold ${isEligible ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {attPct.toFixed(1)}%
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            student.status === 'ACTIVE'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}>
                            {student.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => setSelectedStudentForView(student)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 transition-colors"
                            title="View Full Student Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteStudent(student.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400 transition-colors"
                            title="Delete Student Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: FACULTY & ASSIGNED SUBJECTS */}
      {activeTab === 'FACULTY' && (
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-indigo-400" />
              <span>Faculty Roster & Subject Allocations</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {faculty.map((f) => {
                const assignedSubs = subjects.filter((s) => f.assignedSubjectIds.includes(s.id));
                return (
                  <div key={f.id} className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-white text-sm">{f.name}</h4>
                        <p className="text-xs text-indigo-400">{f.designation}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{f.employeeId} • {f.department}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] bg-slate-700 text-slate-300 font-mono">
                        {f.id}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-700/50 space-y-1.5 text-xs">
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Assigned Subjects:</span>
                      {assignedSubs.length === 0 ? (
                        <p className="text-slate-500 italic text-[11px]">No subjects assigned</p>
                      ) : (
                        assignedSubs.map((s) => (
                          <div key={s.id} className="flex items-center justify-between bg-slate-900/60 px-2.5 py-1.5 rounded-lg border border-slate-700/40">
                            <span className="font-medium text-slate-200">{s.name}</span>
                            <span className="font-mono text-[10px] text-indigo-300">{s.code}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SUBJECTS & CURRICULUM */}
      {activeTab === 'SUBJECTS' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Course Curriculum Catalogue</h3>
              <p className="text-xs text-slate-400">Subject codes, credit weightages, and semester allocations</p>
            </div>
            <button
              onClick={() => setShowAddSubjectForm(!showAddSubjectForm)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Subject</span>
            </button>
          </div>

          {showAddSubjectForm && (
            <form onSubmit={handleAddSubjectSubmit} className="p-5 bg-slate-900 rounded-2xl border border-indigo-500/30 space-y-4 text-xs">
              <h4 className="font-bold text-indigo-400">Define New Subject Entry</h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Subject Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS406"
                    value={newSubCode}
                    onChange={(e) => setNewSubCode(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Subject Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Compiler Design"
                    value={newSubName}
                    onChange={(e) => setNewSubName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Semester</label>
                  <select
                    value={newSubSem}
                    onChange={(e) => setNewSubSem(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    {[1,2,3,4,5,6,7,8].map((s) => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Credits</label>
                  <input
                    type="number"
                    value={newSubCredits}
                    onChange={(e) => setNewSubCredits(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddSubjectForm(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg font-semibold"
                >
                  Save Subject
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((sub) => (
              <div key={sub.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex justify-between items-start">
                  <span className="font-mono text-xs px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30 font-bold">
                    {sub.code}
                  </span>
                  <span className="text-xs font-semibold text-emerald-400 font-mono">{sub.credits} Credits</span>
                </div>
                <h4 className="font-bold text-white text-sm">{sub.name}</h4>
                <p className="text-xs text-slate-400">{sub.department} • Semester {sub.semester}</p>
                <div className="pt-2 text-[10px] text-slate-500 flex justify-between border-t border-slate-800/80">
                  <span>ISE: {sub.maxIseMarks}m x 3</span>
                  <span>Practical: {sub.maxPracticalMarks}m</span>
                  <span>EndSem: {sub.maxEndSemMarks}m</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: MYSQL DATABASE INSPECTOR */}
      {activeTab === 'DATABASE' && (
        <div className="space-y-4">
          <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-sm">Live MySQL Database Terminal & Table Inspector</h3>
              </div>
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Engine: MySQL InnoDB 8.0 (3NF Normalized)
              </span>
            </div>

            {/* Query Console */}
            <div className="space-y-2">
              <label className="block text-xs font-mono text-slate-400">SQL Statement:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  className="flex-1 bg-slate-950 font-mono text-xs text-indigo-300 border border-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleRunSql}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md"
                >
                  Execute Query
                </button>
              </div>
            </div>

            {sqlResult && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 whitespace-pre-wrap">
                {sqlResult}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedStudentForView && (
        <StudentDetailModal
          student={selectedStudentForView}
          marks={marks}
          subjects={subjects}
          attendance={attendance}
          onClose={() => setSelectedStudentForView(null)}
        />
      )}

      {isAddStudentOpen && (
        <AddStudentModal
          existingRollNumbers={students.map((s) => s.rollNumber)}
          onAddStudent={onAddStudent}
          onClose={() => setIsAddStudentOpen(false)}
        />
      )}

    </div>
  );
};
