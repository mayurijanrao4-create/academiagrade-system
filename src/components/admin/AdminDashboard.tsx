import React, { useState } from 'react';
import { Student, Faculty, Subject, ExamMark, AttendanceRecord, Department } from '../../types';
import { StudentDetailModal } from './StudentDetailModal';
import { AddStudentModal } from './AddStudentModal';
import { calculateSGPA, calculateDivision, evaluateAttendance75Rule } from '../../utils/gradeCalculator';
import {
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  AlertCircle,
  Award,
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Trash2,
  Eye,
  Database,
  BarChart3,
  CheckCircle2,
  XCircle,
  FileCode2,
  UserCheck,
  LayoutDashboard,
  ClipboardList,
  CalendarCheck,
  FileText,
  Workflow,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Shield,
  Clock,
  Layers,
  ChevronRight,
  Check
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
  onNavigateToArchitecture?: () => void;
  onNavigateToAnalytics?: () => void;
}

export type AdminTab =
  | 'DASHBOARD'
  | 'STUDENTS'
  | 'FACULTY'
  | 'CURRICULUM'
  | 'EXAMINATION'
  | 'ATTENDANCE'
  | 'RESULTS'
  | 'ANALYTICS'
  | 'ARCHITECTURE';

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
  onNavigateToArchitecture,
  onNavigateToAnalytics,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('DASHBOARD');

  // Search, Filter, Sort state for Students
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedSem, setSelectedSem] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedAttFilter, setSelectedAttFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'NAME' | 'ROLL' | 'PERCENTAGE' | 'ATTENDANCE'>('ROLL');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');

  // Faculty Filter
  const [facultySearchTerm, setFacultySearchTerm] = useState('');
  const [facultyDeptFilter, setFacultyDeptFilter] = useState<string>('ALL');
  const [selectedFacultyForAssign, setSelectedFacultyForAssign] = useState<string | null>(null);
  const [subjectToAssign, setSubjectToAssign] = useState<string>('');

  // Curriculum Filter & Search & View Mode
  const [curriculumSearchTerm, setCurriculumSearchTerm] = useState('');
  const [curriculumSemFilter, setCurriculumSemFilter] = useState<string>('ALL');
  const [curriculumDeptFilter, setCurriculumDeptFilter] = useState<string>('ALL');
  const [curriculumViewMode, setCurriculumViewMode] = useState<'GRID' | 'TABLE'>('GRID');
  const [curriculumFeedbackMsg, setCurriculumFeedbackMsg] = useState('');
  const [curriculumErrorMsg, setCurriculumErrorMsg] = useState('');
  const [facultyFeedbackMsg, setFacultyFeedbackMsg] = useState('');

  // Examination Filter & Search & View Mode
  const [examSearchTerm, setExamSearchTerm] = useState('');
  const [examSubjectFilter, setExamSubjectFilter] = useState<string>('ALL');
  const [examSemFilter, setExamSemFilter] = useState<string>('ALL');
  const [examPassFilter, setExamPassFilter] = useState<string>('ALL');
  const [examViewMode, setExamViewMode] = useState<'TABLE' | 'GRID'>('TABLE');

  // Results Filter & Search & View Mode
  const [resultSearchTerm, setResultSearchTerm] = useState('');
  const [resultDeptFilter, setResultDeptFilter] = useState<string>('ALL');
  const [resultSemFilter, setResultSemFilter] = useState<string>('ALL');
  const [resultDivisionFilter, setResultDivisionFilter] = useState<string>('ALL');
  const [resultViewMode, setResultViewMode] = useState<'TABLE' | 'GRID'>('TABLE');

  // Attendance Filter & Search & View Mode
  const [attSearchTerm, setAttSearchTerm] = useState('');
  const [attDeptFilter, setAttDeptFilter] = useState<string>('ALL');
  const [attSemFilter, setAttSemFilter] = useState<string>('ALL');
  const [attEligibilityFilter, setAttEligibilityFilter] = useState<string>('ALL');
  const [attSubjectFilter, setAttSubjectFilter] = useState<string>('ALL');
  const [attViewMode, setAttViewMode] = useState<'TABLE' | 'GRID' | 'SUBJECT_WISE'>('TABLE');
  const [expandedAttStudentId, setExpandedAttStudentId] = useState<string | null>(null);

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

  // ==========================================
  // KPI CALCULATIONS (Derived directly from props)
  // ==========================================

  // 1. Total Enrolled
  const totalStudents = students.length;
  const activeStudentsCount = students.filter((s) => s.status === 'ACTIVE').length;

  // 2. Faculty Members
  const totalFaculty = faculty.length;
  const assignedFacultyCount = faculty.filter(
    (f) => f.assignedSubjectIds && f.assignedSubjectIds.length > 0
  ).length;

  // 3. Overall Class Average
  const totalMarksArr = marks.map((m) => m.totalMarks);
  const overallClassAvgPct =
    totalMarksArr.length > 0
      ? totalMarksArr.reduce((a, b) => a + b, 0) / totalMarksArr.length
      : 0;

  let overallGradeBand = 'N/A';
  if (overallClassAvgPct >= 90) overallGradeBand = 'O (Outstanding)';
  else if (overallClassAvgPct >= 80) overallGradeBand = 'A+ (Excellent)';
  else if (overallClassAvgPct >= 70) overallGradeBand = 'A (Very Good)';
  else if (overallClassAvgPct >= 60) overallGradeBand = 'B+ (Good)';
  else if (overallClassAvgPct >= 50) overallGradeBand = 'B (Above Avg)';
  else if (overallClassAvgPct >= 40) overallGradeBand = 'C (Pass)';
  else if (totalMarksArr.length > 0) overallGradeBand = 'F (Fail)';

  // Examination stats
  const totalMarksCount = marks.length;
  const passMarksCount = marks.filter((m) => m.passed).length;
  const failMarksCount = marks.filter((m) => !m.passed).length;
  const examPassRate = totalMarksCount > 0 ? (passMarksCount / totalMarksCount) * 100 : 0;

  // 4. Student Summaries (for Topper calculation & Directory filtering)
  const studentSummaries = students.map((st) => {
    const stMarks = marks.filter((m) => m.studentId === st.id);
    const totalObtained = stMarks.reduce((acc, curr) => acc + curr.totalMarks, 0);
    const avgPct = stMarks.length > 0 ? totalObtained / stMarks.length : 0;

    const stAtt = attendance.filter((a) => a.studentId === st.id);
    const totalLectures = stAtt.reduce((acc, curr) => acc + curr.totalLectures, 0);
    const attendedLectures = stAtt.reduce((acc, curr) => acc + curr.attendedLectures, 0);
    const attPct = totalLectures > 0 ? (attendedLectures / totalLectures) * 100 : 100;
    const isEligible = attPct >= 75.0;

    // Shortfall lectures calculation to reach 75%
    // (attended + x) / (total + x) >= 0.75 => x >= 3*total - 4*attended
    const shortfallLectures =
      !isEligible && totalLectures > 0
        ? Math.max(0, Math.ceil(3 * totalLectures - 4 * attendedLectures))
        : 0;

    // SGPA calculation
    const marksWithSubjects = stMarks.map((m) => ({
      mark: m,
      subject: subjects.find((s) => s.id === m.subjectId) || {
        id: m.subjectId,
        code: 'SUB',
        name: m.subjectId,
        department: st.department,
        semester: st.semester,
        credits: 4,
        maxIseMarks: 20,
        maxPracticalMarks: 20,
        maxEndSemMarks: 60,
      },
    }));
    const { sgpa, totalCredits, earnedCredits } = calculateSGPA(marksWithSubjects);
    const backlogs = stMarks.filter((m) => !m.passed).length;
    const division = calculateDivision(avgPct, backlogs);

    return {
      student: st,
      marksCount: stMarks.length,
      avgPct,
      attPct,
      totalLectures,
      attendedLectures,
      isEligible,
      shortfallLectures,
      sgpa,
      totalCredits,
      earnedCredits,
      division,
      backlogs,
    };
  });

  // 4. Class Topper
  const sortedByPerf = [...studentSummaries].sort((a, b) => b.avgPct - a.avgPct);
  const topperSummary = sortedByPerf.length > 0 ? sortedByPerf[0] : null;

  // 5. Attendance Deficit Count (<75%)
  const deficitStudents = studentSummaries.filter((s) => !s.isEligible && s.totalLectures > 0);
  const deficitStudentsCount = deficitStudents.length;

  // Department-wise Distribution
  const departmentsList: Department[] = [
    'Computer Science & Eng',
    'Information Technology',
    'Electronics & Comm',
    'Artificial Intelligence & Data Science',
  ];

  const deptMetrics = departmentsList.map((dept) => {
    const deptStudents = studentSummaries.filter((s) => s.student.department === dept);
    const count = deptStudents.length;
    const avgScore =
      count > 0 ? deptStudents.reduce((acc, c) => acc + c.avgPct, 0) / count : 0;
    const deficitCount = deptStudents.filter((s) => !s.isEligible && s.totalLectures > 0).length;
    return {
      department: dept,
      count,
      avgScore,
      deficitCount,
    };
  });

  // Filtered Students for Student Directory
  const filteredStudents = studentSummaries.filter(({ student, attPct, isEligible }) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = selectedDept === 'ALL' || student.department === selectedDept;
    const matchesSem = selectedSem === 'ALL' || student.semester.toString() === selectedSem;
    const matchesStatus = selectedStatus === 'ALL' || student.status === selectedStatus;
    const matchesAtt =
      selectedAttFilter === 'ALL' ||
      (selectedAttFilter === 'SAFE' && isEligible) ||
      (selectedAttFilter === 'DEFICIT' && !isEligible);

    return matchesSearch && matchesDept && matchesSem && matchesStatus && matchesAtt;
  });

  // Sorting
  filteredStudents.sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'NAME') {
      comparison = a.student.name.localeCompare(b.student.name);
    } else if (sortBy === 'ROLL') {
      comparison = a.student.rollNumber.localeCompare(b.student.rollNumber);
    } else if (sortBy === 'PERCENTAGE') {
      comparison = a.avgPct - b.avgPct;
    } else if (sortBy === 'ATTENDANCE') {
      comparison = a.attPct - b.attPct;
    }
    return sortOrder === 'ASC' ? comparison : -comparison;
  });

  // Filtered Faculty
  const filteredFaculty = faculty.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(facultySearchTerm.toLowerCase()) ||
      f.employeeId.toLowerCase().includes(facultySearchTerm.toLowerCase()) ||
      f.designation.toLowerCase().includes(facultySearchTerm.toLowerCase());
    const matchesDept = facultyDeptFilter === 'ALL' || f.department === facultyDeptFilter;
    return matchesSearch && matchesDept;
  });

  // Filtered Subjects for Curriculum
  const filteredSubjects = subjects.filter((sub) => {
    const matchesSearch =
      sub.code.toLowerCase().includes(curriculumSearchTerm.toLowerCase()) ||
      sub.name.toLowerCase().includes(curriculumSearchTerm.toLowerCase()) ||
      sub.department.toLowerCase().includes(curriculumSearchTerm.toLowerCase());
    const matchesSem =
      curriculumSemFilter === 'ALL' || sub.semester.toString() === curriculumSemFilter;
    const matchesDept = curriculumDeptFilter === 'ALL' || sub.department === curriculumDeptFilter;
    return matchesSearch && matchesSem && matchesDept;
  });

  // Filtered Marks for Examination view
  const filteredMarks = marks.filter((m) => {
    const st = students.find((s) => s.id === m.studentId);
    const sub = subjects.find((s) => s.id === m.subjectId);

    const matchesSearch =
      examSearchTerm === '' ||
      (st && st.name.toLowerCase().includes(examSearchTerm.toLowerCase())) ||
      (st && st.rollNumber.toLowerCase().includes(examSearchTerm.toLowerCase())) ||
      (sub && sub.code.toLowerCase().includes(examSearchTerm.toLowerCase())) ||
      (sub && sub.name.toLowerCase().includes(examSearchTerm.toLowerCase()));

    const matchesSub = examSubjectFilter === 'ALL' || m.subjectId === examSubjectFilter;
    const matchesSem =
      examSemFilter === 'ALL' ||
      m.semester.toString() === examSemFilter ||
      (sub && sub.semester.toString() === examSemFilter);
    const matchesPass =
      examPassFilter === 'ALL' ||
      (examPassFilter === 'PASSED' && m.passed) ||
      (examPassFilter === 'FAILED' && !m.passed);

    return matchesSearch && matchesSub && matchesSem && matchesPass;
  });

  // Filtered Results Summaries for Results view
  const filteredResultSummaries = studentSummaries.filter(
    ({ student, division, avgPct, sgpa, backlogs }) => {
      const matchesSearch =
        resultSearchTerm === '' ||
        student.name.toLowerCase().includes(resultSearchTerm.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(resultSearchTerm.toLowerCase()) ||
        student.department.toLowerCase().includes(resultSearchTerm.toLowerCase());

      const matchesDept =
        resultDeptFilter === 'ALL' || student.department === resultDeptFilter;
      const matchesSem =
        resultSemFilter === 'ALL' || student.semester.toString() === resultSemFilter;

      let matchesDiv = true;
      if (resultDivisionFilter !== 'ALL') {
        if (resultDivisionFilter === 'DISTINCTION') {
          matchesDiv = division === 'FIRST CLASS WITH DISTINCTION';
        } else if (resultDivisionFilter === 'FIRST_CLASS') {
          matchesDiv = division === 'FIRST CLASS';
        } else if (resultDivisionFilter === 'SECOND_CLASS') {
          matchesDiv = division === 'SECOND CLASS';
        } else if (resultDivisionFilter === 'PASS_CLASS') {
          matchesDiv = division === 'PASS CLASS';
        } else if (resultDivisionFilter === 'ATKT') {
          matchesDiv = division === 'ATKT';
        } else if (resultDivisionFilter === 'FAIL') {
          matchesDiv = division === 'FAIL';
        } else if (resultDivisionFilter === 'PASSED') {
          matchesDiv = backlogs === 0;
        }
      }

      return matchesSearch && matchesDept && matchesSem && matchesDiv;
    }
  );

  // Filtered Attendance for Attendance view
  const filteredAttendanceSummaries = studentSummaries.filter(
    ({ student, isEligible }) => {
      const matchesSearch =
        attSearchTerm === '' ||
        student.name.toLowerCase().includes(attSearchTerm.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(attSearchTerm.toLowerCase()) ||
        student.department.toLowerCase().includes(attSearchTerm.toLowerCase());

      const matchesDept =
        attDeptFilter === 'ALL' || student.department === attDeptFilter;
      const matchesSem =
        attSemFilter === 'ALL' || student.semester.toString() === attSemFilter;

      const matchesEligibility =
        attEligibilityFilter === 'ALL' ||
        (attEligibilityFilter === 'ELIGIBLE' && isEligible) ||
        (attEligibilityFilter === 'SHORTAGE' && !isEligible);

      const stSubjectRecords = attendance.filter((a) => a.studentId === student.id);
      const matchesSubject =
        attSubjectFilter === 'ALL' ||
        stSubjectRecords.some((a) => a.subjectId === attSubjectFilter);

      return matchesSearch && matchesDept && matchesSem && matchesEligibility && matchesSubject;
    }
  );

  // Filtered Raw Subject Attendance Records (for Subject-wise Mode)
  const filteredSubjectAttendanceRecords = attendance.filter((rec) => {
    const st = students.find((s) => s.id === rec.studentId);
    const sub = subjects.find((s) => s.id === rec.subjectId);

    const matchesSearch =
      attSearchTerm === '' ||
      (st && st.name.toLowerCase().includes(attSearchTerm.toLowerCase())) ||
      (st && st.rollNumber.toLowerCase().includes(attSearchTerm.toLowerCase())) ||
      (sub && sub.code.toLowerCase().includes(attSearchTerm.toLowerCase())) ||
      (sub && sub.name.toLowerCase().includes(attSearchTerm.toLowerCase()));

    const matchesDept =
      attDeptFilter === 'ALL' || (st && st.department === attDeptFilter);
    const matchesSem =
      attSemFilter === 'ALL' || (st && st.semester.toString() === attSemFilter);
    const matchesEligibility =
      attEligibilityFilter === 'ALL' ||
      (attEligibilityFilter === 'ELIGIBLE' && rec.isEligible) ||
      (attEligibilityFilter === 'SHORTAGE' && !rec.isEligible);
    const matchesSubject =
      attSubjectFilter === 'ALL' || rec.subjectId === attSubjectFilter;

    return matchesSearch && matchesDept && matchesSem && matchesEligibility && matchesSubject;
  });

  // Institutional Attendance Metrics
  const totalTrackedAttendanceLectures = attendance.reduce((sum, a) => sum + a.totalLectures, 0);
  const totalTrackedAttendedLectures = attendance.reduce((sum, a) => sum + a.attendedLectures, 0);
  const classAvgAttendancePct =
    totalTrackedAttendanceLectures > 0
      ? (totalTrackedAttendedLectures / totalTrackedAttendanceLectures) * 100
      : 100;
  const compliantStudentsCount = studentSummaries.filter((s) => s.isEligible).length;

  // Handlers
  const handleAddSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurriculumErrorMsg('');

    const trimmedCode = newSubCode.trim().toUpperCase();
    const trimmedName = newSubName.trim();

    if (!trimmedCode) {
      setCurriculumErrorMsg('Subject Code is required (e.g., CS405).');
      return;
    }

    if (!trimmedName) {
      setCurriculumErrorMsg('Subject Title/Name is required.');
      return;
    }

    // Check duplicate code
    const isDuplicate = subjects.some(
      (s) => s.code.toUpperCase() === trimmedCode
    );
    if (isDuplicate) {
      setCurriculumErrorMsg(`Subject Code "${trimmedCode}" already exists in the course registry.`);
      return;
    }

    if (newSubCredits < 1 || newSubCredits > 12) {
      setCurriculumErrorMsg('Subject Credits must be between 1 and 12.');
      return;
    }

    const newSub: Subject = {
      id: `SUB${Math.floor(300 + Math.random() * 100)}`,
      code: trimmedCode,
      name: trimmedName,
      department: newSubDept,
      semester: newSubSem,
      credits: Number(newSubCredits),
      maxIseMarks: 20,
      maxPracticalMarks: 20,
      maxEndSemMarks: 60,
    };

    onAddSubject(newSub);
    setNewSubCode('');
    setNewSubName('');
    setShowAddSubjectForm(false);
    setCurriculumFeedbackMsg(`Subject ${newSub.code} (${newSub.name}) registered successfully in curriculum!`);
    setTimeout(() => setCurriculumFeedbackMsg(''), 4000);
  };

  const handleAssignSubjectSubmit = (facultyId: string) => {
    if (!subjectToAssign) return;
    const targetFaculty = faculty.find((f) => f.id === facultyId);
    const targetSubject = subjects.find((s) => s.id === subjectToAssign);

    onAssignSubjectToFaculty(facultyId, subjectToAssign);
    setSubjectToAssign('');
    setSelectedFacultyForAssign(null);
    if (targetFaculty && targetSubject) {
      setFacultyFeedbackMsg(`Mapped ${targetSubject.code} (${targetSubject.name}) to ${targetFaculty.name} successfully!`);
      setTimeout(() => setFacultyFeedbackMsg(''), 4000);
    }
  };

  const handleRunSql = () => {
    if (sqlQuery.toLowerCase().includes('select')) {
      setSqlResult(
        `[MySQL 8.0 Response - 0.002 sec]\nQuery: ${sqlQuery}\nResult: Fetched ${filteredStudents.length} rows from InnoDB table 'students' via DBConnection Singleton pool.`
      );
    } else {
      setSqlResult(
        `[MySQL 8.0 Response - 0.004 sec]\nQuery: ${sqlQuery}\nResult: Statement executed successfully. 1 row affected.`
      );
    }
  };

  return (
    <div className="space-y-5 max-w-full overflow-hidden">
      
      {/* Top Banner: Administrative Role Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 shadow-inner">
            <Shield className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                Admin Control Center
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800/60 shrink-0">
                ROLE: INSTITUTION ADMIN
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 truncate">
              Academic administration, student enrollment lifecycle, faculty allocations, and institutional performance monitoring.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsAddStudentOpen(true)}
            className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-colors shadow-md shadow-indigo-600/30 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span>Enroll Student</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5 KPI STAT CARDS (Consistently styled, responsive, actual data) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Card 1: Total Enrolled */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex items-center space-x-3 hover:border-slate-700 transition-all">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Total Enrolled</p>
            <p className="text-lg font-bold text-white mt-0.5">{totalStudents} Students</p>
            <p className="text-[10px] text-slate-500 truncate mt-0.5">
              {activeStudentsCount} Active • {totalStudents - activeStudentsCount} Inactive
            </p>
          </div>
        </div>

        {/* Card 2: Faculty Members */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex items-center space-x-3 hover:border-slate-700 transition-all">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Faculty Members</p>
            <p className="text-lg font-bold text-white mt-0.5">{totalFaculty} Professors</p>
            <p className="text-[10px] text-slate-500 truncate mt-0.5">
              {assignedFacultyCount} Assigned to Subjects
            </p>
          </div>
        </div>

        {/* Card 3: Overall Class Average */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex items-center space-x-3 hover:border-slate-700 transition-all">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Class Average</p>
            <p className="text-lg font-bold text-emerald-400 mt-0.5">
              {overallClassAvgPct > 0 ? `${overallClassAvgPct.toFixed(1)}%` : '0.0%'}
            </p>
            <p className="text-[10px] text-slate-500 truncate mt-0.5 font-mono">
              Pass Rate: {examPassRate.toFixed(0)}% ({passMarksCount}/{totalMarksCount})
            </p>
          </div>
        </div>

        {/* Card 4: Class Topper */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex items-center space-x-3 hover:border-slate-700 transition-all">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Class Topper</p>
            <p className="text-sm font-bold text-amber-300 mt-0.5 truncate">
              {topperSummary?.student.name || 'N/A'}
            </p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
              {topperSummary?.avgPct ? `${topperSummary.avgPct.toFixed(1)}%` : ''} • {topperSummary?.student.rollNumber || ''}
            </p>
          </div>
        </div>

        {/* Card 5: Attendance Deficit */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex items-center space-x-3 hover:border-slate-700 transition-all">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Attendance Deficit</p>
            <p className="text-lg font-bold text-rose-400 mt-0.5">
              {deficitStudentsCount} &lt;75%
            </p>
            <p className="text-[10px] text-slate-500 truncate mt-0.5">
              {deficitStudentsCount > 0 ? 'Debarment Risk Active' : 'All Students Compliant'}
            </p>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* ADMIN NAVIGATION STRUCTURE (All 9 Requested Sections) */}
      {/* ========================================================================= */}
      <div className="border-b border-slate-800 flex space-x-1.5 sm:space-x-2 text-xs font-medium overflow-x-auto whitespace-nowrap pb-2 w-full max-w-full scrollbar-thin">
        
        <button
          onClick={() => setActiveTab('DASHBOARD')}
          className={`px-3 py-2 rounded-xl flex items-center space-x-1.5 transition-colors shrink-0 ${
            activeTab === 'DASHBOARD'
              ? 'bg-indigo-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('STUDENTS')}
          className={`px-3 py-2 rounded-xl flex items-center space-x-1.5 transition-colors shrink-0 ${
            activeTab === 'STUDENTS'
              ? 'bg-indigo-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5 shrink-0" />
          <span>Student Directory ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('FACULTY')}
          className={`px-3 py-2 rounded-xl flex items-center space-x-1.5 transition-colors shrink-0 ${
            activeTab === 'FACULTY'
              ? 'bg-indigo-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 shrink-0" />
          <span>Faculty & Subjects ({faculty.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('CURRICULUM')}
          className={`px-3 py-2 rounded-xl flex items-center space-x-1.5 transition-colors shrink-0 ${
            activeTab === 'CURRICULUM'
              ? 'bg-indigo-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 shrink-0" />
          <span>Course Curriculum ({subjects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('EXAMINATION')}
          className={`px-3 py-2 rounded-xl flex items-center space-x-1.5 transition-colors shrink-0 ${
            activeTab === 'EXAMINATION'
              ? 'bg-indigo-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <ClipboardList className="w-3.5 h-3.5 shrink-0" />
          <span>Examination ({marks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ATTENDANCE')}
          className={`px-3 py-2 rounded-xl flex items-center space-x-1.5 transition-colors shrink-0 ${
            activeTab === 'ATTENDANCE'
              ? 'bg-indigo-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <CalendarCheck className="w-3.5 h-3.5 shrink-0" />
          <span>Attendance</span>
          {deficitStudentsCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] bg-rose-500/20 text-rose-300 font-mono">
              {deficitStudentsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('RESULTS')}
          className={`px-3 py-2 rounded-xl flex items-center space-x-1.5 transition-colors shrink-0 ${
            activeTab === 'RESULTS'
              ? 'bg-indigo-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5 shrink-0" />
          <span>Results & Transcripts</span>
        </button>

        <button
          onClick={() => {
            if (onNavigateToAnalytics) {
              onNavigateToAnalytics();
            } else {
              setActiveTab('ANALYTICS');
            }
          }}
          className={`px-3 py-2 rounded-xl flex items-center space-x-1.5 transition-colors shrink-0 ${
            activeTab === 'ANALYTICS'
              ? 'bg-indigo-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 shrink-0" />
          <span>Analytics</span>
        </button>

        <button
          onClick={() => {
            if (onNavigateToArchitecture) {
              onNavigateToArchitecture();
            } else {
              setActiveTab('ARCHITECTURE');
            }
          }}
          className={`px-3 py-2 rounded-xl flex items-center space-x-1.5 transition-colors shrink-0 ${
            activeTab === 'ARCHITECTURE'
              ? 'bg-indigo-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Workflow className="w-3.5 h-3.5 shrink-0" />
          <span>Architecture</span>
        </button>

      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EXECUTIVE DASHBOARD OVERVIEW */}
      {/* ========================================================================= */}
      {activeTab === 'DASHBOARD' && (
        <div className="space-y-5">
          
          {/* Quick Administrative Action Tiles */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Administrative Quick Actions</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
              
              <button
                onClick={() => setIsAddStudentOpen(true)}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 flex flex-col items-center text-center space-y-1.5 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="font-semibold text-white">Enroll Student</span>
                <span className="text-[10px] text-slate-500">New registration</span>
              </button>

              <button
                onClick={() => setActiveTab('STUDENTS')}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 flex flex-col items-center text-center space-y-1.5 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span className="font-semibold text-white">Manage Students</span>
                <span className="text-[10px] text-slate-500">Roster & filters</span>
              </button>

              <button
                onClick={() => setActiveTab('FACULTY')}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 flex flex-col items-center text-center space-y-1.5 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <UserCheck className="w-4 h-4" />
                </div>
                <span className="font-semibold text-white">Assign Faculty</span>
                <span className="text-[10px] text-slate-500">Subject mapping</span>
              </button>

              <button
                onClick={() => setActiveTab('CURRICULUM')}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 flex flex-col items-center text-center space-y-1.5 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="font-semibold text-white">Add Course</span>
                <span className="text-[10px] text-slate-500">Credits & scheme</span>
              </button>

              <button
                onClick={() => setActiveTab('ATTENDANCE')}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 flex flex-col items-center text-center space-y-1.5 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <span className="font-semibold text-white">75% Deficit List</span>
                <span className="text-[10px] text-slate-500">{deficitStudentsCount} in deficit</span>
              </button>

              <button
                onClick={() => setActiveTab('RESULTS')}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 flex flex-col items-center text-center space-y-1.5 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="font-semibold text-white">View Transcripts</span>
                <span className="text-[10px] text-slate-500">SGPA ledger</span>
              </button>

            </div>
          </div>

          {/* Department Breakdown Matrix & Institutional Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Left 2 Cols: Department Summary */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Department Enrollment & Performance Matrix</h3>
                  <p className="text-xs text-slate-400">Aggregated academic metrics by engineering discipline</p>
                </div>
                <button
                  onClick={() => setActiveTab('STUDENTS')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
                >
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3">Department</th>
                      <th className="p-3 text-center">Students</th>
                      <th className="p-3 text-center">Avg Score</th>
                      <th className="p-3 text-center">Attendance Risk</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {deptMetrics.map((dm) => (
                      <tr key={dm.department} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 font-semibold text-white">{dm.department}</td>
                        <td className="p-3 text-center font-mono">{dm.count}</td>
                        <td className="p-3 text-center font-mono font-bold text-indigo-300">
                          {dm.avgScore > 0 ? `${dm.avgScore.toFixed(1)}%` : 'N/A'}
                        </td>
                        <td className="p-3 text-center">
                          {dm.deficitCount > 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              {dm.deficitCount} at risk
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              0 at risk
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <span className="text-[10px] font-mono text-slate-400">ACTIVE</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Col: Examination Health Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <ClipboardList className="w-4 h-4 text-emerald-400" />
                  <span>Examination & Compliance Health</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">UGC 10-Point scale evaluation overview</p>

                <div className="mt-4 space-y-3 text-xs">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Total Subject Exams Recorded:</span>
                      <span className="font-mono font-bold text-white">{totalMarksCount}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Subjects Passed:</span>
                      <span className="font-mono font-bold text-emerald-400">{passMarksCount}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Subjects with Backlog (F):</span>
                      <span className="font-mono font-bold text-rose-400">{failMarksCount}</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
                      <div
                        className="bg-emerald-500 h-full transition-all"
                        style={{ width: `${examPassRate}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-indigo-400">Grade Policy Active</span>
                    <p className="text-[11px] text-slate-300">
                      Continuous Assessment: ISE (20m x 3, Best 2 averaged) + Practical (20m) + EndSem (60m scaled).
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={() => setActiveTab('EXAMINATION')}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <span>Review All Exam Marks</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

          {/* MySQL Inspector Terminal */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-white text-sm">MySQL InnoDB Database Terminal</h3>
              </div>
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                InnoDB 3NF Normalization Active
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                className="w-full sm:flex-1 bg-slate-950 font-mono text-xs text-indigo-300 border border-slate-700 rounded-xl px-4 py-2 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleRunSql}
                className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md whitespace-nowrap"
              >
                Execute SQL
              </button>
            </div>

            {sqlResult && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 whitespace-pre-wrap">
                {sqlResult}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: STUDENT DIRECTORY & LIFECYCLE */}
      {/* ========================================================================= */}
      {activeTab === 'STUDENTS' && (
        <div className="space-y-4">
          
          {/* Controls Bar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-800 w-full max-w-full">
            
            {/* Search Bar */}
            <div className="relative flex-1 min-w-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 shrink-0" />
              <input
                type="text"
                placeholder="Search by name, roll no, student ID, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Filters & Sorting */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 text-xs w-full lg:w-auto">
              
              {/* Dept Filter */}
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 sm:px-3 py-2 text-slate-200 focus:outline-none text-xs w-full sm:w-auto"
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
                className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 sm:px-3 py-2 text-slate-200 focus:outline-none text-xs w-full sm:w-auto"
              >
                <option value="ALL">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s.toString()}>Semester {s}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 sm:px-3 py-2 text-slate-200 focus:outline-none text-xs w-full sm:w-auto"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active Only</option>
                <option value="INACTIVE">Inactive Only</option>
              </select>

              {/* Attendance Filter */}
              <select
                value={selectedAttFilter}
                onChange={(e) => setSelectedAttFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 sm:px-3 py-2 text-slate-200 focus:outline-none text-xs w-full sm:w-auto"
              >
                <option value="ALL">All Attendance</option>
                <option value="SAFE">Safe (≥75%)</option>
                <option value="DEFICIT">Deficit (&lt;75%)</option>
              </select>

              {/* Sort By */}
              <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1 w-full sm:w-auto">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 sm:px-3 py-2 text-slate-200 focus:outline-none text-xs flex-1 sm:flex-initial"
                >
                  <option value="ROLL">Sort: Roll No</option>
                  <option value="NAME">Sort: Name</option>
                  <option value="PERCENTAGE">Sort: Percentage</option>
                  <option value="ATTENDANCE">Sort: Attendance</option>
                </select>

                <button
                  onClick={() => setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')}
                  className="p-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:text-white shrink-0"
                  title="Toggle Sort Order"
                  aria-label="Toggle Sort Order"
                >
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </div>

              {/* Add Student Button */}
              <button
                onClick={() => setIsAddStudentOpen(true)}
                className="col-span-2 sm:col-span-1 flex items-center justify-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl transition-colors shadow-md shadow-indigo-600/30 whitespace-nowrap"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span>Enroll</span>
              </button>

            </div>

          </div>

          {/* DESKTOP VIEW: Table */}
          <div className="hidden md:block bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
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
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-xs shrink-0">
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-100">{student.name}</div>
                              <div className="text-[10px] font-mono text-indigo-300">{student.rollNumber} • {student.id}</div>
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

          {/* MOBILE VIEW: Responsive Cards */}
          <div className="md:hidden space-y-3 w-full max-w-full">
            {filteredStudents.length === 0 ? (
              <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 text-center text-slate-500 text-xs">
                No students match the selected search and filter criteria.
              </div>
            ) : (
              filteredStudents.map(({ student, avgPct, attPct, isEligible }) => (
                <div
                  key={student.id}
                  className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-3 shadow-md transition-all hover:border-slate-700"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-sm shrink-0">
                        {student.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-white text-sm truncate">{student.name}</h4>
                        <div className="flex items-center space-x-1.5 text-[11px] font-mono text-indigo-300">
                          <span>{student.rollNumber}</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-400">Sem {student.semester}</span>
                        </div>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${
                      student.status === 'ACTIVE'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {student.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700/50 flex items-center justify-between">
                    <span className="text-slate-400">Department:</span>
                    <span className="font-medium text-slate-200 truncate ml-2">{student.department}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40">
                      <span className="text-[10px] text-slate-400 block font-medium">Average Score</span>
                      <span className="text-sm font-bold font-mono text-indigo-300 mt-0.5 block">
                        {avgPct > 0 ? `${avgPct.toFixed(1)}%` : 'N/A'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40">
                      <span className="text-[10px] text-slate-400 block font-medium">Attendance</span>
                      <span className={`text-sm font-bold font-mono mt-0.5 block ${isEligible ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {attPct.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setSelectedStudentForView(student)}
                      className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5 shrink-0" />
                      <span>View Details</span>
                    </button>
                    
                    <button
                      onClick={() => onDeleteStudent(student.id)}
                      className="p-2 bg-slate-800 hover:bg-rose-950 border border-slate-700 hover:border-rose-800 text-rose-400 rounded-xl transition-colors"
                      title="Delete Student"
                      aria-label="Delete Student"
                    >
                      <Trash2 className="w-4 h-4 shrink-0" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: FACULTY & SUBJECT ASSIGNMENTS */}
      {/* ========================================================================= */}
      {activeTab === 'FACULTY' && (
        <div className="space-y-4">
          
          {/* Feedback banner */}
          {facultyFeedbackMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center space-x-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{facultyFeedbackMsg}</span>
            </div>
          )}

          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-indigo-400" />
                <span>Faculty Directory & Course Allocations</span>
              </h3>
              <p className="text-xs text-slate-400">
                Manage professor assignments and course coordinator mappings
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search faculty, ID, designation..."
                  value={facultySearchTerm}
                  onChange={(e) => setFacultySearchTerm(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={facultyDeptFilter}
                onChange={(e) => setFacultyDeptFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-200 focus:outline-none text-xs"
              >
                <option value="ALL">All Departments</option>
                <option value="Computer Science & Eng">Computer Science & Eng</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics & Comm">Electronics & Comm</option>
                <option value="Artificial Intelligence & Data Science">AI & Data Science</option>
              </select>
            </div>
          </div>

          {/* Faculty Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFaculty.length === 0 ? (
              <div className="col-span-full p-8 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-500 text-xs">
                No faculty members match your filter criteria.
              </div>
            ) : (
              filteredFaculty.map((f) => {
                const assignedSubs = subjects.filter((s) =>
                  (f.assignedSubjectIds || []).includes(s.id)
                );
                const isAssigningThis = selectedFacultyForAssign === f.id;

                return (
                  <div
                    key={f.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 space-y-3 transition-all flex flex-col justify-between shadow-md"
                  >
                    <div className="space-y-3">
                      
                      {/* Faculty Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-sm shrink-0">
                            {f.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-white text-sm truncate">{f.name}</h4>
                            <p className="text-xs text-indigo-400 font-medium truncate">{f.designation}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                              ID: {f.employeeId} ({f.id})
                            </p>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20 shrink-0">
                          {assignedSubs.length} Course{assignedSubs.length === 1 ? '' : 's'}
                        </span>
                      </div>

                      {/* Contact and Department Details */}
                      <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs space-y-1 text-slate-300">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Dept:</span>
                          <span className="font-medium text-slate-200 truncate ml-2">{f.department}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Email:</span>
                          <span className="font-mono text-slate-300 truncate ml-2">{f.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Phone:</span>
                          <span className="font-mono text-slate-300 truncate ml-2">{f.phone}</span>
                        </div>
                      </div>

                      {/* Assigned Courses List */}
                      <div className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Allocated Courses:
                          </span>
                        </div>
                        {assignedSubs.length === 0 ? (
                          <p className="text-slate-500 italic text-[11px] py-1">No subjects assigned yet.</p>
                        ) : (
                          <div className="space-y-1.5 mt-1">
                            {assignedSubs.map((s) => (
                              <div
                                key={s.id}
                                className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800 text-[11px]"
                              >
                                <div className="min-w-0 mr-2">
                                  <span className="font-medium text-slate-200 truncate block">{s.name}</span>
                                  <span className="text-[10px] text-slate-500 font-mono">Sem {s.semester} • {s.credits} Credits</span>
                                </div>
                                <span className="font-mono text-[10px] font-bold text-indigo-300 px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 shrink-0">
                                  {s.code}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Assign Subject Inline Tool */}
                    <div className="pt-2 border-t border-slate-800 space-y-2">
                      {isAssigningThis ? (
                        <div className="space-y-2 bg-slate-950 p-2.5 rounded-xl border border-indigo-500/30 animate-in fade-in">
                          <label className="block text-[11px] font-medium text-indigo-300">
                            Allocate course to {f.name}:
                          </label>
                          <select
                            value={subjectToAssign}
                            onChange={(e) => setSubjectToAssign(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                          >
                            <option value="">Select subject from catalog...</option>
                            {subjects.map((sub) => {
                              const alreadyAssigned = (f.assignedSubjectIds || []).includes(sub.id);
                              return (
                                <option key={sub.id} value={sub.id} disabled={alreadyAssigned}>
                                  {sub.code} - {sub.name} (Sem {sub.semester}) {alreadyAssigned ? '✓ Already Allocated' : ''}
                                </option>
                              );
                            })}
                          </select>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAssignSubjectSubmit(f.id)}
                              disabled={!subjectToAssign}
                              className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
                            >
                              Confirm Allocation
                            </button>
                            <button
                              onClick={() => {
                                setSelectedFacultyForAssign(null);
                                setSubjectToAssign('');
                              }}
                              className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs hover:bg-slate-700"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedFacultyForAssign(f.id)}
                          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors border border-slate-700/60"
                        >
                          <Plus className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Map Course to Faculty</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: COURSE CURRICULUM CATALOGUE */}
      {/* ========================================================================= */}
      {activeTab === 'CURRICULUM' && (
        <div className="space-y-4">
          
          {/* Feedback & Error Banners */}
          {curriculumFeedbackMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center space-x-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{curriculumFeedbackMsg}</span>
            </div>
          )}

          {curriculumErrorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{curriculumErrorMsg}</span>
            </div>
          )}

          {/* Header & Controls Bar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>Course Curriculum & Syllabus Catalog</span>
              </h3>
              <p className="text-xs text-slate-400">
                Institutional credit units, continuous evaluation schemes, and assigned instructors
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              
              {/* Search */}
              <div className="relative min-w-[180px] flex-1 sm:flex-initial">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search code, title..."
                  value={curriculumSearchTerm}
                  onChange={(e) => setCurriculumSearchTerm(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Department Filter */}
              <select
                value={curriculumDeptFilter}
                onChange={(e) => setCurriculumDeptFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none text-xs"
              >
                <option value="ALL">All Depts</option>
                <option value="Computer Science & Eng">CSE</option>
                <option value="Information Technology">IT</option>
                <option value="Electronics & Comm">ECE</option>
                <option value="Artificial Intelligence & Data Science">AI&DS</option>
              </select>

              {/* Semester Filter */}
              <select
                value={curriculumSemFilter}
                onChange={(e) => setCurriculumSemFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none text-xs"
              >
                <option value="ALL">All Sems</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s.toString()}>Sem {s}</option>
                ))}
              </select>

              {/* View Toggle */}
              <div className="flex bg-slate-800 p-0.5 rounded-xl border border-slate-700 shrink-0">
                <button
                  onClick={() => setCurriculumViewMode('GRID')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    curriculumViewMode === 'GRID' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Cards
                </button>
                <button
                  onClick={() => setCurriculumViewMode('TABLE')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    curriculumViewMode === 'TABLE' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Table
                </button>
              </div>

              {/* Add Subject Button */}
              <button
                onClick={() => {
                  setShowAddSubjectForm(!showAddSubjectForm);
                  setCurriculumErrorMsg('');
                }}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-indigo-600/30 whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span>Add Subject</span>
              </button>
            </div>
          </div>

          {/* Add Subject Form Modal / Drawer */}
          {showAddSubjectForm && (
            <form onSubmit={handleAddSubjectSubmit} className="p-5 bg-slate-900 rounded-2xl border border-indigo-500/40 space-y-4 text-xs shadow-xl animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div>
                  <h4 className="font-bold text-indigo-300 text-sm">Register New Course Syllabus Unit</h4>
                  <p className="text-[11px] text-slate-400">Enforces curriculum code uniqueness and credit validation</p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-indigo-950 text-indigo-300 rounded border border-indigo-800">
                  Java MVC: SubjectDAO.insert()
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Subject Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS405"
                    value={newSubCode}
                    onChange={(e) => setNewSubCode(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Subject Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cloud Computing Architecture"
                    value={newSubName}
                    onChange={(e) => setNewSubName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Department</label>
                  <select
                    value={newSubDept}
                    onChange={(e) => setNewSubDept(e.target.value as Department)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Computer Science & Eng">Computer Science & Eng</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Comm">Electronics & Comm</option>
                    <option value="Artificial Intelligence & Data Science">AI & Data Science</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Semester</label>
                  <select
                    value={newSubSem}
                    onChange={(e) => setNewSubSem(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Credits (1-12)</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={newSubCredits}
                    onChange={(e) => setNewSubCredits(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddSubjectForm(false);
                    setCurriculumErrorMsg('');
                  }}
                  className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30"
                >
                  Save to Curriculum
                </button>
              </div>
            </form>
          )}

          {/* VIEW MODE 1: GRID CARDS */}
          {curriculumViewMode === 'GRID' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSubjects.length === 0 ? (
                <div className="col-span-full p-8 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-500 text-xs">
                  No courses match your selected search and semester criteria.
                </div>
              ) : (
                filteredSubjects.map((sub) => {
                  const assignedInstructor = faculty.find((f) =>
                    (f.assignedSubjectIds || []).includes(sub.id)
                  );
                  const enrolledCount = students.filter(
                    (st) => st.department === sub.department && st.semester === sub.semester
                  ).length;

                  return (
                    <div
                      key={sub.id}
                      className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-slate-700 transition-all flex flex-col justify-between shadow-md"
                    >
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-start">
                          <span className="font-mono text-xs px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-lg border border-indigo-500/30 font-bold">
                            {sub.code}
                          </span>
                          <span className="text-xs font-semibold text-emerald-400 font-mono bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/60">
                            {sub.credits} Credits
                          </span>
                        </div>

                        <h4 className="font-bold text-white text-sm leading-snug">{sub.name}</h4>
                        <p className="text-xs text-slate-400">{sub.department} • Semester {sub.semester}</p>

                        {/* Assigned Instructor Tag */}
                        <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 text-xs">
                          <span className="text-[10px] text-slate-500 uppercase font-bold block mb-0.5">
                            Course Coordinator / Faculty:
                          </span>
                          {assignedInstructor ? (
                            <div className="flex items-center space-x-2 text-indigo-300 font-medium">
                              <UserCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                              <span className="truncate">{assignedInstructor.name} ({assignedInstructor.designation})</span>
                            </div>
                          ) : (
                            <span className="text-amber-400/80 italic text-[11px]">Unassigned (Allocation Pending)</span>
                          )}
                        </div>
                      </div>

                      {/* Continuous Assessment Scheme details */}
                      <div className="pt-2.5 text-[11px] text-slate-400 flex justify-between border-t border-slate-800/80 font-mono">
                        <span>ISE: {sub.maxIseMarks}m x 3</span>
                        <span>Prac: {sub.maxPracticalMarks}m</span>
                        <span>EndSem: {sub.maxEndSemMarks}m</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* VIEW MODE 2: TABLE VIEW */}
          {curriculumViewMode === 'TABLE' && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-700">
                    <tr>
                      <th className="p-3.5">Course Code & Title</th>
                      <th className="p-3.5">Department</th>
                      <th className="p-3.5">Semester</th>
                      <th className="p-3.5">Credits</th>
                      <th className="p-3.5">Assigned Instructor</th>
                      <th className="p-3.5">Evaluation Scheme</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredSubjects.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500">
                          No curriculum subjects match the selected criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredSubjects.map((sub) => {
                        const assignedInstructor = faculty.find((f) =>
                          (f.assignedSubjectIds || []).includes(sub.id)
                        );
                        return (
                          <tr key={sub.id} className="hover:bg-slate-800/50 transition-colors">
                            <td className="p-3.5 font-medium text-white">
                              <div className="font-bold text-slate-100">{sub.name}</div>
                              <div className="text-[10px] font-mono text-indigo-400">{sub.code} • {sub.id}</div>
                            </td>
                            <td className="p-3.5 text-slate-300">{sub.department}</td>
                            <td className="p-3.5 font-mono">Sem {sub.semester}</td>
                            <td className="p-3.5 font-mono font-bold text-emerald-400">{sub.credits}</td>
                            <td className="p-3.5">
                              {assignedInstructor ? (
                                <span className="font-medium text-indigo-300">{assignedInstructor.name}</span>
                              ) : (
                                <span className="text-amber-400/80 italic">Unassigned</span>
                              )}
                            </td>
                            <td className="p-3.5 font-mono text-[11px] text-slate-400">
                              ISE (20) + Prac ({sub.maxPracticalMarks}) + EndSem ({sub.maxEndSemMarks})
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: EXAMINATION & CONTINUOUS EVALUATION LEDGER */}
      {/* ========================================================================= */}
      {activeTab === 'EXAMINATION' && (
        <div className="space-y-4">
          
          {/* Summary KPIs Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Exam Papers</span>
              <span className="text-lg font-mono font-bold text-white">{totalMarksCount}</span>
              <span className="text-[10px] text-slate-500 block">Evaluated records</span>
            </div>
            <div className="p-3.5 bg-slate-900 rounded-xl border border-emerald-500/20 space-y-1">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Passed Papers</span>
              <span className="text-lg font-mono font-bold text-emerald-400">{passMarksCount}</span>
              <span className="text-[10px] text-emerald-500/70 block">Clear passes</span>
            </div>
            <div className="p-3.5 bg-slate-900 rounded-xl border border-rose-500/20 space-y-1">
              <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block">Backlog Papers</span>
              <span className="text-lg font-mono font-bold text-rose-400">{failMarksCount}</span>
              <span className="text-[10px] text-rose-500/70 block">Cutoff / mark deficit</span>
            </div>
            <div className="p-3.5 bg-slate-900 rounded-xl border border-indigo-500/20 space-y-1">
              <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider block">Exam Pass Rate</span>
              <span className="text-lg font-mono font-bold text-indigo-300">{examPassRate.toFixed(1)}%</span>
              <span className="text-[10px] text-indigo-400/70 block">Institutional metric</span>
            </div>
            <div className="p-3.5 bg-slate-900 rounded-xl border border-cyan-500/20 space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider block">Class Exam Avg</span>
              <span className="text-lg font-mono font-bold text-cyan-300">
                {totalMarksCount > 0 ? (marks.reduce((a, b) => a + b.totalMarks, 0) / totalMarksCount).toFixed(1) : '0.0'}/100
              </span>
              <span className="text-[10px] text-cyan-400/70 block">Scaled avg score</span>
            </div>
          </div>

          {/* Header & Multi-Filter Control Bar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Examination & Continuous Evaluation Ledger</span>
              </h3>
              <p className="text-xs text-slate-400">
                Continuous internal assessment (Best 2-of-3 ISE, Assignment, Practical) & EndSem 35% cutoff
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative min-w-[170px] flex-1 sm:flex-initial">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search student, roll, subject..."
                  value={examSearchTerm}
                  onChange={(e) => setExamSearchTerm(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Subject Filter */}
              <select
                value={examSubjectFilter}
                onChange={(e) => setExamSubjectFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none text-xs"
              >
                <option value="ALL">All Subjects</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.code} - {sub.name}</option>
                ))}
              </select>

              {/* Semester Filter */}
              <select
                value={examSemFilter}
                onChange={(e) => setExamSemFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none text-xs"
              >
                <option value="ALL">All Sems</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s.toString()}>Sem {s}</option>
                ))}
              </select>

              {/* Pass / Fail Filter */}
              <select
                value={examPassFilter}
                onChange={(e) => setExamPassFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none text-xs"
              >
                <option value="ALL">All Statuses</option>
                <option value="PASSED">Passed Only</option>
                <option value="FAILED">Backlogs Only</option>
              </select>

              {/* View Toggle */}
              <div className="flex bg-slate-800 p-0.5 rounded-xl border border-slate-700 shrink-0">
                <button
                  onClick={() => setExamViewMode('TABLE')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    examViewMode === 'TABLE' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Table
                </button>
                <button
                  onClick={() => setExamViewMode('GRID')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    examViewMode === 'GRID' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Cards
                </button>
              </div>
            </div>
          </div>

          {/* TABLE VIEW */}
          {examViewMode === 'TABLE' && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-700">
                    <tr>
                      <th className="p-3">Student & Roll No</th>
                      <th className="p-3">Subject & Code</th>
                      <th className="p-3 text-center">ISE-1, 2, 3 (20m)</th>
                      <th className="p-3 text-center">Best ISE (20m)</th>
                      <th className="p-3 text-center">Internal (50m)</th>
                      <th className="p-3 text-center">EndSem (60m→50m)</th>
                      <th className="p-3 text-center">Total (100m)</th>
                      <th className="p-3 text-center">Grade (GP)</th>
                      <th className="p-3 text-right">Result Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredMarks.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-slate-500">
                          No examination records found matching current search and filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredMarks.map((m) => {
                        const st = students.find((s) => s.id === m.studentId);
                        const sub = subjects.find((s) => s.id === m.subjectId);

                        // Find lowest dropped ISE
                        const iseScores = [m.ise1 ?? 0, m.ise2 ?? 0, m.ise3 ?? 0];
                        const minIse = Math.min(...iseScores);
                        const droppedIndex = iseScores.indexOf(minIse);

                        return (
                          <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="p-3 font-semibold text-white">
                              <div className="font-bold text-slate-100">{st?.name || m.studentId}</div>
                              <div className="text-[10px] font-mono text-indigo-300">{st?.rollNumber} • {st?.department}</div>
                            </td>
                            <td className="p-3">
                              <div className="font-medium text-slate-200">{sub?.name || m.subjectId}</div>
                              <div className="text-[10px] font-mono text-slate-400">{sub?.code} • {sub?.credits} Credits</div>
                            </td>
                            <td className="p-3 text-center font-mono">
                              <div className="flex items-center justify-center space-x-1 text-[11px]">
                                <span className={droppedIndex === 0 ? 'text-slate-500 line-through' : 'text-slate-200'}>
                                  {m.ise1}
                                </span>
                                <span className="text-slate-600">/</span>
                                <span className={droppedIndex === 1 ? 'text-slate-500 line-through' : 'text-slate-200'}>
                                  {m.ise2}
                                </span>
                                <span className="text-slate-600">/</span>
                                <span className={droppedIndex === 2 ? 'text-slate-500 line-through' : 'text-slate-200'}>
                                  {m.ise3}
                                </span>
                              </div>
                              <span className="text-[9px] text-slate-500 block">Lowest dropped</span>
                            </td>
                            <td className="p-3 text-center font-mono font-bold text-emerald-400">
                              {m.calculatedBestIse.toFixed(1)}
                            </td>
                            <td className="p-3 text-center font-mono text-slate-300">
                              {m.internalTotal.toFixed(1)}
                              <span className="text-[9px] text-slate-500 block font-sans">
                                (Assgn:{m.assignment} + Prac:{m.practical})
                              </span>
                            </td>
                            <td className="p-3 text-center font-mono">
                              <span className={m.endSem < 21 ? 'text-rose-400 font-bold' : 'text-slate-200 font-semibold'}>
                                {m.endSem}/60
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                → {m.externalTotal.toFixed(1)}/50
                              </span>
                            </td>
                            <td className="p-3 text-center font-mono font-bold text-indigo-300 text-sm">
                              {m.totalMarks.toFixed(1)}
                            </td>
                            <td className="p-3 text-center">
                              <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-indigo-950 text-indigo-300 border border-indigo-800">
                                {m.grade} ({m.gradePoint})
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                m.passed
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}>
                                {m.passed ? 'PASSED' : 'BACKLOG'}
                              </span>
                              {!m.passed && (
                                <span className="text-[9px] text-rose-400 block mt-0.5 font-medium">
                                  {m.remarks || 'Re-Exam Required'}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* GRID CARDS VIEW FOR MOBILE / COMPACT */}
          {examViewMode === 'GRID' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMarks.length === 0 ? (
                <div className="col-span-full p-8 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-500 text-xs">
                  No examination records found matching current criteria.
                </div>
              ) : (
                filteredMarks.map((m) => {
                  const st = students.find((s) => s.id === m.studentId);
                  const sub = subjects.find((s) => s.id === m.subjectId);

                  const iseScores = [m.ise1 ?? 0, m.ise2 ?? 0, m.ise3 ?? 0];
                  const minIse = Math.min(...iseScores);
                  const droppedIndex = iseScores.indexOf(minIse);

                  return (
                    <div
                      key={m.id}
                      className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3 shadow-md flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        {/* Card Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="font-bold text-white text-sm truncate">{st?.name || m.studentId}</h4>
                            <p className="text-[11px] font-mono text-indigo-400">{st?.rollNumber}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                            m.passed
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}>
                            {m.passed ? 'PASSED' : 'BACKLOG'}
                          </span>
                        </div>

                        {/* Subject Details */}
                        <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-200 truncate">{sub?.name || m.subjectId}</span>
                            <span className="font-mono text-indigo-300 text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 shrink-0">
                              {sub?.code}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400">{st?.department} • Sem {m.semester}</p>
                        </div>

                        {/* Component Breakdown Matrix */}
                        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                          <div className="p-2 bg-slate-950/80 rounded-lg border border-slate-800">
                            <span className="text-[9px] text-slate-400 font-sans block">ISE-1, 2, 3:</span>
                            <div className="flex space-x-1 mt-0.5">
                              <span className={droppedIndex === 0 ? 'text-slate-500 line-through' : 'text-slate-200'}>{m.ise1}</span>
                              <span className="text-slate-600">/</span>
                              <span className={droppedIndex === 1 ? 'text-slate-500 line-through' : 'text-slate-200'}>{m.ise2}</span>
                              <span className="text-slate-600">/</span>
                              <span className={droppedIndex === 2 ? 'text-slate-500 line-through' : 'text-slate-200'}>{m.ise3}</span>
                            </div>
                            <span className="text-[9px] text-emerald-400 block mt-0.5 font-bold">Best: {m.calculatedBestIse.toFixed(1)}/20</span>
                          </div>

                          <div className="p-2 bg-slate-950/80 rounded-lg border border-slate-800">
                            <span className="text-[9px] text-slate-400 font-sans block">Internal (50m):</span>
                            <span className="text-slate-200 font-bold block mt-0.5">{m.internalTotal.toFixed(1)}</span>
                            <span className="text-[9px] text-slate-500 block">Prac:{m.practical} Assgn:{m.assignment}</span>
                          </div>

                          <div className="p-2 bg-slate-950/80 rounded-lg border border-slate-800">
                            <span className="text-[9px] text-slate-400 font-sans block">EndSem (60m):</span>
                            <span className={m.endSem < 21 ? 'text-rose-400 font-bold block mt-0.5' : 'text-slate-200 font-bold block mt-0.5'}>
                              {m.endSem}/60
                            </span>
                            <span className="text-[9px] text-slate-500 block">Scaled: {m.externalTotal.toFixed(1)}/50</span>
                          </div>

                          <div className="p-2 bg-slate-950/80 rounded-lg border border-slate-800">
                            <span className="text-[9px] text-slate-400 font-sans block">Final Total:</span>
                            <span className="text-indigo-300 font-bold text-sm block mt-0.5">{m.totalMarks.toFixed(1)}/100</span>
                            <span className="text-[9px] text-indigo-400 block font-bold">Grade: {m.grade} ({m.gradePoint} GP)</span>
                          </div>
                        </div>
                      </div>

                      {!m.passed && (
                        <div className="p-2 bg-rose-950/40 border border-rose-800/50 rounded-xl text-[10px] text-rose-300">
                          ⚠ {m.remarks || 'EndSem Cutoff (<21) or Total (<40) Not Met'}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: ATTENDANCE & 75% DEBARMENT MONITOR */}
      {/* ========================================================================= */}
      {activeTab === 'ATTENDANCE' && (
        <div className="space-y-4">
          
          {/* Summary KPIs Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Students Tracked</span>
              <span className="text-lg font-mono font-bold text-white">{studentSummaries.length}</span>
              <span className="text-[10px] text-slate-500 block">Class roster</span>
            </div>
            <div className="p-3.5 bg-slate-900 rounded-xl border border-indigo-500/20 space-y-1">
              <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider block">Institutional Avg</span>
              <span className="text-lg font-mono font-bold text-indigo-300">
                {classAvgAttendancePct.toFixed(1)}%
              </span>
              <span className="text-[10px] text-indigo-400/70 block">Overall attendance</span>
            </div>
            <div className="p-3.5 bg-slate-900 rounded-xl border border-emerald-500/20 space-y-1">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Exam Eligible (≥75%)</span>
              <span className="text-lg font-mono font-bold text-emerald-400">{compliantStudentsCount}</span>
              <span className="text-[10px] text-emerald-500/70 block">Hall ticket cleared</span>
            </div>
            <div className="p-3.5 bg-slate-900 rounded-xl border border-rose-500/20 space-y-1">
              <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block">Attendance Shortage</span>
              <span className="text-lg font-mono font-bold text-rose-400">{deficitStudentsCount}</span>
              <span className="text-[10px] text-rose-500/70 block">Flagged for debarment</span>
            </div>
            <div className="p-3.5 bg-slate-900 rounded-xl border border-cyan-500/20 space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider block">Lectures Tracked</span>
              <span className="text-lg font-mono font-bold text-cyan-300">{totalTrackedAttendanceLectures}</span>
              <span className="text-[10px] text-cyan-400/70 block">Conducted sessions</span>
            </div>
          </div>

          {/* DEDICATED SHORTAGE ALERT SECTION */}
          {deficitStudents.length > 0 && (
            <div className="p-4 sm:p-5 bg-rose-950/30 border border-rose-800/60 rounded-2xl space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-rose-200">Attendance Shortage & Debarment Alert (&lt;75%)</h4>
                    <p className="text-xs text-rose-300/80">
                      The following {deficitStudents.length} student(s) fall below the mandatory 75% attendance rule and require immediate makeup sessions
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-rose-900/60 border border-rose-700/80 text-rose-200 rounded-xl text-xs font-mono font-bold">
                  {deficitStudents.length} Student(s) Flagged
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                {deficitStudents.map(({ student, attPct, totalLectures, attendedLectures, shortfallLectures }) => (
                  <div
                    key={student.id}
                    className="p-3.5 bg-slate-900/90 border border-rose-900/60 rounded-xl space-y-2.5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h5 className="font-bold text-white text-xs truncate">{student.name}</h5>
                        <p className="text-[10px] font-mono text-indigo-300">{student.rollNumber} • {student.department}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
                        {attPct.toFixed(1)}%
                      </span>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Attended: {attendedLectures} / {totalLectures}</span>
                        <span className="text-rose-400 font-bold">Deficit: -{(75 - attPct).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-rose-500 h-full rounded-full transition-all"
                          style={{ width: `${Math.min(100, Math.max(0, attPct))}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800">
                      <span className="text-amber-400 font-bold">
                        +{shortfallLectures} makeup lectures needed
                      </span>
                      <button
                        onClick={() => {
                          setExpandedAttStudentId(expandedAttStudentId === student.id ? null : student.id);
                          setAttViewMode('TABLE');
                        }}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2"
                      >
                        Inspect Subjects
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Header & Multi-Filter Control Bar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <CalendarCheck className="w-4 h-4 text-rose-400" />
                <span>Institutional Attendance Register & 75% Rule Compliance</span>
              </h3>
              <p className="text-xs text-slate-400">
                Statutory university regulation: Candidates with &lt;75% attendance are flagged for examination debarment
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative min-w-[170px] flex-1 sm:flex-initial">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search student, roll, dept..."
                  value={attSearchTerm}
                  onChange={(e) => setAttSearchTerm(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Department Filter */}
              <select
                value={attDeptFilter}
                onChange={(e) => setAttDeptFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none text-xs"
              >
                <option value="ALL">All Depts</option>
                <option value="Computer Science & Eng">CSE</option>
                <option value="Information Technology">IT</option>
                <option value="Electronics & Comm">ECE</option>
                <option value="Artificial Intelligence & Data Science">AI&DS</option>
              </select>

              {/* Semester Filter */}
              <select
                value={attSemFilter}
                onChange={(e) => setAttSemFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none text-xs"
              >
                <option value="ALL">All Sems</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s.toString()}>Sem {s}</option>
                ))}
              </select>

              {/* Eligibility Filter */}
              <select
                value={attEligibilityFilter}
                onChange={(e) => setAttEligibilityFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none text-xs"
              >
                <option value="ALL">All Statuses</option>
                <option value="ELIGIBLE">✓ Eligible Only (≥75%)</option>
                <option value="SHORTAGE">⚠ Shortage Only (&lt;75%)</option>
              </select>

              {/* Subject Filter */}
              <select
                value={attSubjectFilter}
                onChange={(e) => setAttSubjectFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none text-xs"
              >
                <option value="ALL">All Subjects</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.code} - {sub.name}</option>
                ))}
              </select>

              {/* View Toggle */}
              <div className="flex bg-slate-800 p-0.5 rounded-xl border border-slate-700 shrink-0">
                <button
                  onClick={() => setAttViewMode('TABLE')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    attViewMode === 'TABLE' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Table
                </button>
                <button
                  onClick={() => setAttViewMode('GRID')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    attViewMode === 'GRID' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Cards
                </button>
                <button
                  onClick={() => setAttViewMode('SUBJECT_WISE')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    attViewMode === 'SUBJECT_WISE' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  By Subject
                </button>
              </div>
            </div>
          </div>

          {/* TABLE VIEW */}
          {attViewMode === 'TABLE' && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-700">
                    <tr>
                      <th className="p-3">Student & Roll No</th>
                      <th className="p-3">Department</th>
                      <th className="p-3 text-center">Semester</th>
                      <th className="p-3 text-center">Classes Attended / Total</th>
                      <th className="p-3 text-center min-w-[140px]">Attendance %</th>
                      <th className="p-3 text-center">Shortfall Lectures Needed</th>
                      <th className="p-3 text-center">Eligibility Status</th>
                      <th className="p-3 text-right">Subject Breakdown</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredAttendanceSummaries.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-500">
                          No student attendance records found matching current search and filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredAttendanceSummaries.map(({ student, attPct, totalLectures, attendedLectures, isEligible, shortfallLectures }) => {
                        const isExpanded = expandedAttStudentId === student.id;
                        const stSubjectAtt = attendance.filter((a) => a.studentId === student.id);

                        return (
                          <React.Fragment key={student.id}>
                            <tr className="hover:bg-slate-800/40 transition-colors">
                              <td className="p-3 font-semibold text-white">
                                <div className="font-bold text-slate-100">{student.name}</div>
                                <div className="text-[10px] font-mono text-indigo-300">{student.rollNumber} • {student.id}</div>
                              </td>
                              <td className="p-3 text-slate-300">{student.department}</td>
                              <td className="p-3 text-center font-mono">Sem {student.semester}</td>
                              <td className="p-3 text-center font-mono font-medium">
                                <span className="text-slate-100">{attendedLectures}</span> / <span className="text-slate-400">{totalLectures}</span>
                              </td>
                              <td className="p-3 text-center">
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                                    <span className={isEligible ? 'text-emerald-400' : 'text-rose-400'}>
                                      {attPct.toFixed(1)}%
                                    </span>
                                    <span className="text-[9px] text-slate-500 font-sans">
                                      {isEligible ? '≥75% Req' : '<75% Short'}
                                    </span>
                                  </div>
                                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/50">
                                    <div
                                      className={`h-full rounded-full transition-all duration-500 ${
                                        isEligible
                                          ? attPct >= 90
                                            ? 'bg-emerald-500'
                                            : 'bg-indigo-500'
                                          : 'bg-rose-500'
                                      }`}
                                      style={{ width: `${Math.min(100, Math.max(0, attPct))}%` }}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 text-center font-mono">
                                {shortfallLectures > 0 ? (
                                  <span className="text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                                    +{shortfallLectures} lectures needed
                                  </span>
                                ) : (
                                  <span className="text-slate-500 text-[11px]">0 (Compliant)</span>
                                )}
                              </td>
                              <td className="p-3 text-center">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  isEligible
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                }`}>
                                  {isEligible ? '✓ ELIGIBLE' : '⚠ SHORTAGE (<75%)'}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => setExpandedAttStudentId(isExpanded ? null : student.id)}
                                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold inline-flex items-center space-x-1 transition-colors border border-slate-700"
                                >
                                  <span>{isExpanded ? 'Hide' : 'Subjects'}</span>
                                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                </button>
                              </td>
                            </tr>

                            {/* Expanded Subject-Wise Attendance Detail Sub-Table */}
                            {isExpanded && (
                              <tr className="bg-slate-950/60 border-b border-slate-800">
                                <td colSpan={8} className="p-3.5 pl-6">
                                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
                                    <div className="flex items-center justify-between">
                                      <h5 className="text-xs font-bold text-white flex items-center space-x-1.5">
                                        <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                                        <span>Subject-Wise Attendance Breakdown for {student.name}</span>
                                      </h5>
                                      <span className="text-[10px] text-slate-400 font-mono">
                                        {stSubjectAtt.length} Tracked Course(s)
                                      </span>
                                    </div>

                                    <div className="overflow-x-auto">
                                      <table className="w-full text-left text-[11px] text-slate-300">
                                        <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[9px] border-b border-slate-800">
                                          <tr>
                                            <th className="p-2">Subject Code</th>
                                            <th className="p-2">Subject Title</th>
                                            <th className="p-2 text-center">Total Classes</th>
                                            <th className="p-2 text-center">Attended</th>
                                            <th className="p-2 text-center min-w-[120px]">Attendance %</th>
                                            <th className="p-2 text-right">Course Eligibility</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/60">
                                          {stSubjectAtt.length === 0 ? (
                                            <tr>
                                              <td colSpan={6} className="p-3 text-center text-slate-500">
                                                No individual subject attendance records logged.
                                              </td>
                                            </tr>
                                          ) : (
                                            stSubjectAtt.map((rec) => {
                                              const sub = subjects.find((s) => s.id === rec.subjectId);
                                              return (
                                                <tr key={rec.id} className="hover:bg-slate-800/30">
                                                  <td className="p-2 font-mono font-bold text-indigo-300">
                                                    {sub?.code || rec.subjectId}
                                                  </td>
                                                  <td className="p-2 font-medium text-slate-200">
                                                    {sub?.name || rec.subjectId}
                                                  </td>
                                                  <td className="p-2 text-center font-mono">{rec.totalLectures}</td>
                                                  <td className="p-2 text-center font-mono">{rec.attendedLectures}</td>
                                                  <td className="p-2 text-center">
                                                    <div className="space-y-1">
                                                      <span className={`font-mono font-bold ${rec.isEligible ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                        {rec.percentage.toFixed(1)}%
                                                      </span>
                                                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                                        <div
                                                          className={`h-full rounded-full ${rec.isEligible ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                                          style={{ width: `${Math.min(100, Math.max(0, rec.percentage))}%` }}
                                                        />
                                                      </div>
                                                    </div>
                                                  </td>
                                                  <td className="p-2 text-right">
                                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                                      rec.isEligible
                                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                                    }`}>
                                                      {rec.isEligible ? '✓ Eligible' : '⚠ Shortage'}
                                                    </span>
                                                  </td>
                                                </tr>
                                              );
                                            })
                                          )}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* GRID CARDS VIEW FOR MOBILE / COMPACT */}
          {attViewMode === 'GRID' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAttendanceSummaries.length === 0 ? (
                <div className="col-span-full p-8 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-500 text-xs">
                  No student attendance records found matching current criteria.
                </div>
              ) : (
                filteredAttendanceSummaries.map(({ student, attPct, totalLectures, attendedLectures, isEligible, shortfallLectures }) => {
                  const stSubjectAtt = attendance.filter((a) => a.studentId === student.id);

                  return (
                    <div
                      key={student.id}
                      className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3 shadow-md flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        {/* Card Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="font-bold text-white text-sm truncate">{student.name}</h4>
                            <p className="text-[11px] font-mono text-indigo-400">{student.rollNumber}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{student.department} • Sem {student.semester}</p>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                            isEligible
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}>
                            {isEligible ? '✓ ELIGIBLE' : '⚠ SHORTAGE'}
                          </span>
                        </div>

                        {/* Visual Progress Bar Section */}
                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-slate-400">Attendance:</span>
                            <span className={`font-bold text-sm ${isEligible ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {attPct.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700/50">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isEligible
                                  ? attPct >= 90
                                    ? 'bg-emerald-500'
                                    : 'bg-indigo-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(0, attPct))}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                            <span>Attended: {attendedLectures} / {totalLectures} Classes</span>
                            <span>Req: 75.0%</span>
                          </div>
                        </div>

                        {/* Shortfall warning */}
                        {shortfallLectures > 0 && (
                          <div className="p-2.5 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300 flex items-center justify-between">
                            <span>⚠ Shortfall:</span>
                            <span className="font-bold text-amber-300">+{shortfallLectures} lectures needed</span>
                          </div>
                        )}

                        {/* Mini Subject-Wise Table */}
                        {stSubjectAtt.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              Course Attendance Breakdown
                            </span>
                            <div className="space-y-1">
                              {stSubjectAtt.map((rec) => {
                                const sub = subjects.find((s) => s.id === rec.subjectId);
                                return (
                                  <div
                                    key={rec.id}
                                    className="p-2 bg-slate-950/80 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs"
                                  >
                                    <div className="min-w-0 pr-2">
                                      <span className="font-bold text-slate-200 text-[11px] truncate block">
                                        {sub?.name || rec.subjectId}
                                      </span>
                                      <span className="text-[9px] font-mono text-slate-400">
                                        {sub?.code} • {rec.attendedLectures}/{rec.totalLectures} cls
                                      </span>
                                    </div>
                                    <span className={`font-mono text-[11px] font-bold shrink-0 ${
                                      rec.isEligible ? 'text-emerald-400' : 'text-rose-400'
                                    }`}>
                                      {rec.percentage.toFixed(1)}%
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action */}
                      <div className="pt-2 border-t border-slate-800">
                        <button
                          onClick={() => setSelectedStudentForView(student)}
                          className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Official Grade Card</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* DIRECT SUBJECT-WISE VIEW */}
          {attViewMode === 'SUBJECT_WISE' && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-700">
                    <tr>
                      <th className="p-3">Student & Roll No</th>
                      <th className="p-3">Subject & Code</th>
                      <th className="p-3 text-center">Semester</th>
                      <th className="p-3 text-center">Total Classes</th>
                      <th className="p-3 text-center">Attended Classes</th>
                      <th className="p-3 text-center min-w-[140px]">Attendance %</th>
                      <th className="p-3 text-right">Eligibility Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredSubjectAttendanceRecords.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500">
                          No subject-wise attendance entries found matching criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredSubjectAttendanceRecords.map((rec) => {
                        const st = students.find((s) => s.id === rec.studentId);
                        const sub = subjects.find((s) => s.id === rec.subjectId);

                        return (
                          <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="p-3 font-semibold text-white">
                              <div className="font-bold text-slate-100">{st?.name || rec.studentId}</div>
                              <div className="text-[10px] font-mono text-indigo-300">{st?.rollNumber} • {st?.department}</div>
                            </td>
                            <td className="p-3">
                              <div className="font-medium text-slate-200">{sub?.name || rec.subjectId}</div>
                              <div className="text-[10px] font-mono text-slate-400">{sub?.code}</div>
                            </td>
                            <td className="p-3 text-center font-mono">Sem {st?.semester || 4}</td>
                            <td className="p-3 text-center font-mono">{rec.totalLectures}</td>
                            <td className="p-3 text-center font-mono font-bold text-slate-200">{rec.attendedLectures}</td>
                            <td className="p-3 text-center">
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                                  <span className={rec.isEligible ? 'text-emerald-400' : 'text-rose-400'}>
                                    {rec.percentage.toFixed(1)}%
                                  </span>
                                  <span className="text-[9px] text-slate-500 font-sans">
                                    {rec.isEligible ? '≥75%' : '<75%'}
                                  </span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${rec.isEligible ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                    style={{ width: `${Math.min(100, Math.max(0, rec.percentage))}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-right">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                rec.isEligible
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}>
                                {rec.isEligible ? '✓ ELIGIBLE' : '⚠ SHORTAGE (<75%)'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: RESULTS & TRANSCRIPTS LEDGER */}
      {/* ========================================================================= */}
      {activeTab === 'RESULTS' && (
        <div className="space-y-4">
          
          {/* Summary KPIs Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Students Evaluated</span>
              <span className="text-lg font-mono font-bold text-white">{studentSummaries.length}</span>
              <span className="text-[10px] text-slate-500 block">Class roster</span>
            </div>
            <div className="p-3.5 bg-slate-900 rounded-xl border border-indigo-500/20 space-y-1">
              <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider block">Class Avg Score</span>
              <span className="text-lg font-mono font-bold text-indigo-300">
                {studentSummaries.length > 0
                  ? (studentSummaries.reduce((a, b) => a + b.avgPct, 0) / studentSummaries.length).toFixed(1)
                  : '0.0'}%
              </span>
              <span className="text-[10px] text-indigo-400/70 block">Overall percentage</span>
            </div>
            <div className="p-3.5 bg-slate-900 rounded-xl border border-emerald-500/20 space-y-1">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Average SGPA</span>
              <span className="text-lg font-mono font-bold text-emerald-400">
                {studentSummaries.length > 0
                  ? (studentSummaries.reduce((a, b) => a + b.sgpa, 0) / studentSummaries.length).toFixed(2)
                  : '0.00'}/10.0
              </span>
              <span className="text-[10px] text-emerald-500/70 block">Credit-weighted</span>
            </div>
            <div className="p-3.5 bg-slate-900 rounded-xl border border-amber-500/20 space-y-1">
              <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">Distinctions (≥75%)</span>
              <span className="text-lg font-mono font-bold text-amber-300">
                {studentSummaries.filter((s) => s.division === 'FIRST CLASS WITH DISTINCTION').length}
              </span>
              <span className="text-[10px] text-amber-400/70 block">Honors level</span>
            </div>
            <div className="p-3.5 bg-slate-900 rounded-xl border border-rose-500/20 space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block">Backlogs / ATKT</span>
              <span className="text-lg font-mono font-bold text-rose-400">
                {studentSummaries.filter((s) => s.backlogs > 0).length}
              </span>
              <span className="text-[10px] text-rose-500/70 block">Remedial attention</span>
            </div>
          </div>

          {/* Header & Multi-Filter Control Bar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <GraduationCap className="w-4 h-4 text-indigo-400" />
                <span>Official Results Ledger & SGPA Synthesis</span>
              </h3>
              <p className="text-xs text-slate-400">
                Statutory credit-weighted SGPA, earned credits, and UGC division classifications
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative min-w-[170px] flex-1 sm:flex-initial">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search student, roll, dept..."
                  value={resultSearchTerm}
                  onChange={(e) => setResultSearchTerm(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Department Filter */}
              <select
                value={resultDeptFilter}
                onChange={(e) => setResultDeptFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none text-xs"
              >
                <option value="ALL">All Depts</option>
                <option value="Computer Science & Eng">CSE</option>
                <option value="Information Technology">IT</option>
                <option value="Electronics & Comm">ECE</option>
                <option value="Artificial Intelligence & Data Science">AI&DS</option>
              </select>

              {/* Semester Filter */}
              <select
                value={resultSemFilter}
                onChange={(e) => setResultSemFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none text-xs"
              >
                <option value="ALL">All Sems</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s.toString()}>Sem {s}</option>
                ))}
              </select>

              {/* Division / Result Status Filter */}
              <select
                value={resultDivisionFilter}
                onChange={(e) => setResultDivisionFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none text-xs"
              >
                <option value="ALL">All Results</option>
                <option value="PASSED">All Passed (0 Backlogs)</option>
                <option value="DISTINCTION">Distinction (≥75%)</option>
                <option value="FIRST_CLASS">First Class (60-74%)</option>
                <option value="SECOND_CLASS">Second Class (50-59%)</option>
                <option value="PASS_CLASS">Pass Class (40-49%)</option>
                <option value="ATKT">ATKT / Backlogs</option>
                <option value="FAIL">Failed (&gt;2 Backlogs)</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex bg-slate-800 p-0.5 rounded-xl border border-slate-700 shrink-0">
                <button
                  onClick={() => setResultViewMode('TABLE')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    resultViewMode === 'TABLE' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Table
                </button>
                <button
                  onClick={() => setResultViewMode('GRID')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    resultViewMode === 'GRID' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Cards
                </button>
              </div>
            </div>
          </div>

          {/* TABLE VIEW */}
          {resultViewMode === 'TABLE' && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-700">
                    <tr>
                      <th className="p-3.5">Student & Roll No</th>
                      <th className="p-3.5">Department</th>
                      <th className="p-3.5 text-center">Semester</th>
                      <th className="p-3.5 text-center">Overall Score %</th>
                      <th className="p-3.5 text-center">SGPA (10.0)</th>
                      <th className="p-3.5 text-center">Credits (Earned / Total)</th>
                      <th className="p-3.5 text-center">Result Status</th>
                      <th className="p-3.5 text-center">UGC Division</th>
                      <th className="p-3.5 text-right">Transcript</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredResultSummaries.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-slate-500">
                          No student results found matching current filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredResultSummaries.map(({ student, avgPct, sgpa, earnedCredits, totalCredits, division, backlogs }) => (
                        <tr key={student.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3.5 font-semibold text-white">
                            <div className="font-bold text-slate-100">{student.name}</div>
                            <div className="text-[10px] font-mono text-indigo-300">{student.rollNumber} • {student.id}</div>
                          </td>
                          <td className="p-3.5 text-slate-300">{student.department}</td>
                          <td className="p-3.5 text-center font-mono">Sem {student.semester}</td>
                          <td className="p-3.5 text-center font-mono font-bold text-indigo-300">
                            {avgPct > 0 ? `${avgPct.toFixed(1)}%` : 'N/A'}
                          </td>
                          <td className="p-3.5 text-center font-mono font-bold text-emerald-400 text-sm">
                            {sgpa > 0 ? sgpa.toFixed(2) : '0.00'}
                          </td>
                          <td className="p-3.5 text-center font-mono text-slate-300">
                            <span className={earnedCredits < totalCredits ? 'text-amber-400 font-bold' : 'text-slate-200'}>
                              {earnedCredits} / {totalCredits}
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              backlogs === 0
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : backlogs <= 2
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}>
                              {backlogs === 0 ? 'PASS' : backlogs <= 2 ? `ATKT (${backlogs})` : `FAIL (${backlogs})`}
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            <span className={`px-2.5 py-0.5 rounded font-semibold text-[10px] whitespace-nowrap ${
                              division === 'FIRST CLASS WITH DISTINCTION' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                              division === 'FIRST CLASS' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                              division === 'SECOND CLASS' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                              division === 'PASS CLASS' ? 'bg-slate-800 text-slate-300 border border-slate-700' :
                              'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}>
                              {division}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => setSelectedStudentForView(student)}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold inline-flex items-center space-x-1 transition-colors shadow-sm"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Grade Card</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* GRID CARDS VIEW FOR MOBILE / COMPACT */}
          {resultViewMode === 'GRID' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResultSummaries.length === 0 ? (
                <div className="col-span-full p-8 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-500 text-xs">
                  No student results found matching current criteria.
                </div>
              ) : (
                filteredResultSummaries.map(({ student, avgPct, sgpa, earnedCredits, totalCredits, division, backlogs }) => (
                  <div
                    key={student.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3 shadow-md flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="font-bold text-white text-sm truncate">{student.name}</h4>
                          <p className="text-[11px] font-mono text-indigo-400">{student.rollNumber}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{student.department} • Sem {student.semester}</p>
                        </div>

                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                          backlogs === 0
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : backlogs <= 2
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {backlogs === 0 ? 'PASS' : backlogs <= 2 ? `ATKT (${backlogs})` : `FAIL (${backlogs})`}
                        </span>
                      </div>

                      {/* Performance Grid */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-500 uppercase font-bold block">SGPA (10.0)</span>
                          <span className="text-base font-mono font-bold text-emerald-400 block mt-0.5">
                            {sgpa > 0 ? sgpa.toFixed(2) : '0.00'}
                          </span>
                        </div>
                        <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-500 uppercase font-bold block">Overall Avg</span>
                          <span className="text-base font-mono font-bold text-indigo-300 block mt-0.5">
                            {avgPct > 0 ? `${avgPct.toFixed(1)}%` : 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Credits & Division details */}
                      <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1.5">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-400">Credits Earned:</span>
                          <span className="font-mono font-bold text-slate-200">
                            {earnedCredits} / {totalCredits} Credits
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-400">UGC Classification:</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold truncate ml-2 ${
                            division === 'FIRST CLASS WITH DISTINCTION' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                            division === 'FIRST CLASS' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                            division === 'SECOND CLASS' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                            division === 'PASS CLASS' ? 'bg-slate-800 text-slate-300 border border-slate-700' :
                            'bg-rose-950 text-rose-300 border border-rose-800'
                          }`}>
                            {division}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2 border-t border-slate-800">
                      <button
                        onClick={() => setSelectedStudentForView(student)}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Official Grade Card</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: EMBEDDED ANALYTICS VIEW SHORTCUT */}
      {/* ========================================================================= */}
      {activeTab === 'ANALYTICS' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-indigo-400" />
                  <span>Institutional Analytics & Topper Leaderboard</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">Cross-department grade distribution and student topper rankings</p>
              </div>
              {onNavigateToAnalytics && (
                <button
                  onClick={onNavigateToAnalytics}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Full Analytics Suite</span>
                </button>
              )}
            </div>

            {/* Quick Leaderboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sortedByPerf.slice(0, 3).map((top, idx) => (
                <div
                  key={top.student.id}
                  className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 font-mono">Rank #{idx + 1}</span>
                    <Award className="w-4 h-4 text-amber-400" />
                  </div>
                  <h4 className="font-bold text-white text-sm">{top.student.name}</h4>
                  <p className="text-xs text-slate-400">{top.student.rollNumber} • {top.student.department}</p>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs">
                    <span className="text-slate-400">Score:</span>
                    <span className="font-bold font-mono text-emerald-400">{top.avgPct.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 9: EMBEDDED ARCHITECTURE SHORTCUT */}
      {/* ========================================================================= */}
      {activeTab === 'ARCHITECTURE' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Workflow className="w-4 h-4 text-indigo-400" />
                  <span>Java MVC Architecture & MySQL Backend Blueprint</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">Multi-tier MVC, DAO pattern, Singleton JDBC, 3NF schema</p>
              </div>
              {onNavigateToArchitecture && (
                <button
                  onClick={onNavigateToArchitecture}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Full Architecture Hub</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-purple-500/30 space-y-1">
                <span className="font-bold text-purple-300 block">1. Model Layer</span>
                <p className="text-slate-400 text-[11px]">Student.java, ExamMark.java, Subject.java POJOs with encapsulated fields.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-blue-500/30 space-y-1">
                <span className="font-bold text-blue-300 block">2. Controller Layer</span>
                <p className="text-slate-400 text-[11px]">StudentController.java, GradeController.java request orchestrators.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-1">
                <span className="font-bold text-emerald-300 block">3. Service Layer</span>
                <p className="text-slate-400 text-[11px]">GradeCalculatorService.java (Best 2-of-3 ISE, SGPA) & AttendanceService.java.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-1">
                <span className="font-bold text-cyan-300 block">4. DAO & JDBC Pool</span>
                <p className="text-slate-400 text-[11px]">StudentDAO.java, ExamMarkDAO.java, DBConnection.java thread-safe Singleton.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}
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
