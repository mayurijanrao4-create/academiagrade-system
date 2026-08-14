import React, { useState, useMemo } from 'react';
import { Faculty, Student, Subject, ExamMark, AttendanceRecord, Department } from '../../types';
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
  UserCheck,
  Search,
  Filter,
  ArrowUpDown,
  LayoutDashboard,
  ClipboardList,
  CalendarCheck,
  FileText,
  Sparkles,
  ArrowRight,
  Shield,
  Clock,
  ChevronRight,
  User,
  Mail,
  Phone,
  Building,
  TrendingUp,
  AlertTriangle,
  Check,
  Layers,
  GraduationCap,
  Percent,
  RefreshCw,
  Info,
  SlidersHorizontal,
  Edit3
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

export type FacultyTab =
  | 'DASHBOARD'
  | 'PROFILE'
  | 'SUBJECTS'
  | 'STUDENTS'
  | 'ATTENDANCE'
  | 'MARKS'
  | 'PERFORMANCE';

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({
  faculty,
  students,
  subjects,
  marks,
  attendance,
  onUpdateMarks,
  onUpdateAttendance,
}) => {
  const [activeTab, setActiveTab] = useState<FacultyTab>('DASHBOARD');

  // Assigned subjects for the logged-in faculty
  const assignedSubjects = useMemo(() => {
    return subjects.filter((s) => faculty.assignedSubjectIds?.includes(s.id));
  }, [subjects, faculty.assignedSubjectIds]);

  // Selected subject for subject-specific views (Marks, Attendance, Performance)
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    assignedSubjects[0]?.id || subjects[0]?.id || ''
  );

  // Active subject object
  const activeSubject = useMemo(() => {
    return subjects.find((s) => s.id === selectedSubjectId) || assignedSubjects[0] || subjects[0];
  }, [subjects, selectedSubjectId, assignedSubjects]);

  // Students enrolled in the active subject's department and semester
  const relevantStudents = useMemo(() => {
    if (!activeSubject) return [];
    return students.filter(
      (st) => st.department === activeSubject.department && st.semester === activeSubject.semester
    );
  }, [students, activeSubject]);

  // All unique students across all assigned subjects of this faculty
  const allAssignedStudents = useMemo(() => {
    if (assignedSubjects.length === 0) return [];
    return students.filter((st) =>
      assignedSubjects.some(
        (sub) => sub.department === st.department && sub.semester === st.semester
      )
    );
  }, [students, assignedSubjects]);

  // ==========================================
  // STUDENT TAB FILTERS & SEARCH
  // ==========================================
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [studentSubjectFilter, setStudentSubjectFilter] = useState<string>('ALL');
  const [studentAttFilter, setStudentAttFilter] = useState<string>('ALL');
  const [studentSortBy, setStudentSortBy] = useState<'NAME' | 'ROLL' | 'ATTENDANCE' | 'MARKS'>('ROLL');
  const [studentSortOrder, setStudentSortOrder] = useState<'ASC' | 'DESC'>('ASC');

  // ==========================================
  // MARKS EDITING STATE
  // ==========================================
  const [editedMarksMap, setEditedMarksMap] = useState<Record<string, Partial<ExamMark>>>({});
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [examComponentFilter, setExamComponentFilter] = useState<string>('ALL');
  const [marksSearchTerm, setMarksSearchTerm] = useState('');

  // ==========================================
  // ATTENDANCE TAB STATE
  // ==========================================
  const [attendanceSearchTerm, setAttendanceSearchTerm] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState<'ALL' | 'ELIGIBLE' | 'SHORTAGE'>('ALL');
  const [bulkSessionName, setBulkSessionName] = useState('');
  const [attFeedbackMsg, setAttFeedbackMsg] = useState('');

  // ==========================================
  // DERIVED KPI CALCULATIONS (ACTUAL PROJECT DATA)
  // ==========================================

  // 1. Total Enrolled Students across all assigned classes
  const totalAssignedStudentsCount = allAssignedStudents.length;

  // 2. Marks across assigned subjects
  const assignedSubjectIds = assignedSubjects.map((s) => s.id);
  const facultyMarks = useMemo(() => {
    return marks.filter((m) => assignedSubjectIds.includes(m.subjectId));
  }, [marks, assignedSubjectIds]);

  // 3. Average Class Performance for faculty subjects
  const facultyAvgPct = useMemo(() => {
    if (facultyMarks.length === 0) return 0;
    const sum = facultyMarks.reduce((acc, m) => acc + m.totalMarks, 0);
    return sum / facultyMarks.length;
  }, [facultyMarks]);

  // 4. Attendance compliance across assigned subjects
  const facultyAttendanceRecords = useMemo(() => {
    return attendance.filter((a) => assignedSubjectIds.includes(a.subjectId));
  }, [attendance, assignedSubjectIds]);

  const { overallAttAvg, shortageCount, eligibleCount } = useMemo(() => {
    if (facultyAttendanceRecords.length === 0) {
      return { overallAttAvg: 100, shortageCount: 0, eligibleCount: 0 };
    }
    let totalLecSum = 0;
    let attLecSum = 0;
    let shortage = 0;
    let eligible = 0;

    facultyAttendanceRecords.forEach((rec) => {
      totalLecSum += rec.totalLectures;
      attLecSum += rec.attendedLectures;
      const pct = rec.totalLectures > 0 ? (rec.attendedLectures / rec.totalLectures) * 100 : 100;
      if (pct >= 75.0) {
        eligible++;
      } else {
        shortage++;
      }
    });

    const avg = totalLecSum > 0 ? (attLecSum / totalLecSum) * 100 : 100;
    return { overallAttAvg: avg, shortageCount: shortage, eligibleCount: eligible };
  }, [facultyAttendanceRecords]);

  // Active Subject specific metrics
  const activeSubjectMarks = useMemo(() => {
    return marks.filter((m) => m.subjectId === activeSubject?.id);
  }, [marks, activeSubject]);

  const activeSubjectAvg = useMemo(() => {
    if (activeSubjectMarks.length === 0) return 0;
    const sum = activeSubjectMarks.reduce((acc, m) => acc + m.totalMarks, 0);
    return sum / activeSubjectMarks.length;
  }, [activeSubjectMarks]);

  const activeSubjectPassRate = useMemo(() => {
    if (activeSubjectMarks.length === 0) return 0;
    const passed = activeSubjectMarks.filter((m) => m.passed).length;
    return (passed / activeSubjectMarks.length) * 100;
  }, [activeSubjectMarks]);

  // Active Subject Grade Distribution
  const gradeDistribution = useMemo(() => {
    const counts: Record<string, number> = { O: 0, 'A+': 0, A: 0, 'B+': 0, B: 0, C: 0, F: 0 };
    activeSubjectMarks.forEach((m) => {
      if (counts[m.grade] !== undefined) {
        counts[m.grade]++;
      }
    });
    return counts;
  }, [activeSubjectMarks]);

  // Active Subject Topper & Needs Support
  const activeSubjectTopStudents = useMemo(() => {
    return [...activeSubjectMarks]
      .sort((a, b) => b.totalMarks - a.totalMarks)
      .slice(0, 3)
      .map((m) => ({
        mark: m,
        student: students.find((s) => s.id === m.studentId),
      }));
  }, [activeSubjectMarks, students]);

  const activeSubjectLowStudents = useMemo(() => {
    return [...activeSubjectMarks]
      .filter((m) => m.totalMarks < 50 || !m.passed)
      .sort((a, b) => a.totalMarks - b.totalMarks)
      .map((m) => ({
        mark: m,
        student: students.find((s) => s.id === m.studentId),
      }));
  }, [activeSubjectMarks, students]);

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleMarkChange = (studentId: string, field: keyof ExamMark, value: number) => {
    if (!activeSubject) return;
    const key = `${studentId}_${activeSubject.id}`;
    const existing =
      editedMarksMap[key] ||
      marks.find((m) => m.studentId === studentId && m.subjectId === activeSubject.id) || {
        studentId,
        subjectId: activeSubject.id,
        semester: activeSubject.semester,
        ise1: 15,
        ise2: 15,
        ise3: 15,
        assignment: 8,
        practical: 16,
        endSem: 40,
      };

    let clampedValue = Math.max(0, value);
    if (field === 'ise1' || field === 'ise2' || field === 'ise3') clampedValue = Math.min(20, clampedValue);
    if (field === 'assignment') clampedValue = Math.min(10, clampedValue);
    if (field === 'practical') clampedValue = Math.min(20, clampedValue);
    if (field === 'endSem') clampedValue = Math.min(60, clampedValue);

    const updated = {
      ...existing,
      [field]: clampedValue,
    };

    setEditedMarksMap((prev) => ({
      ...prev,
      [key]: updated,
    }));
  };

  const handleSaveSingleMark = (studentId: string) => {
    if (!activeSubject) return;
    const key = `${studentId}_${activeSubject.id}`;
    const data = editedMarksMap[key] || marks.find((m) => m.studentId === studentId && m.subjectId === activeSubject.id);
    if (!data) return;

    const ise1 = Number(data.ise1 ?? 15);
    const ise2 = Number(data.ise2 ?? 15);
    const ise3 = Number(data.ise3 ?? 15);
    const assignment = Number(data.assignment ?? 8);
    const practical = Number(data.practical ?? 16);
    const endSem = Number(data.endSem ?? 40);

    const computed = computeSubjectGrade(ise1, ise2, ise3, assignment, practical, endSem);

    const fullMarkObj: ExamMark = {
      id: `M_${studentId}_${activeSubject.id}`,
      studentId,
      subjectId: activeSubject.id,
      semester: activeSubject.semester,
      ise1,
      ise2,
      ise3,
      assignment,
      practical,
      endSem,
      ...computed,
    };

    onUpdateMarks(fullMarkObj);
    const stName = students.find((s) => s.id === studentId)?.name || studentId;
    setSaveSuccessMsg(`Continuous marks saved successfully for ${stName} (${activeSubject.code})!`);
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  const handleSaveAllEditedMarks = () => {
    if (!activeSubject) return;
    let savedCount = 0;
    relevantStudents.forEach((st) => {
      const key = `${st.id}_${activeSubject.id}`;
      if (editedMarksMap[key]) {
        handleSaveSingleMark(st.id);
        savedCount++;
      }
    });
    if (savedCount > 0) {
      setSaveSuccessMsg(`Batch saved continuous evaluation marks for ${savedCount} students in ${activeSubject.code}.`);
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    }
  };

  const handleConductBulkLecture = (markAllPresent: boolean) => {
    if (!activeSubject) return;
    let count = 0;
    relevantStudents.forEach((st) => {
      const attRecord = attendance.find(
        (a) => a.studentId === st.id && a.subjectId === activeSubject.id
      ) || {
        totalLectures: 48,
        attendedLectures: 42,
      };

      const newTotal = attRecord.totalLectures + 1;
      const newAttended = markAllPresent ? attRecord.attendedLectures + 1 : attRecord.attendedLectures;
      onUpdateAttendance(st.id, activeSubject.id, newAttended, newTotal);
      count++;
    });

    setAttFeedbackMsg(
      `Conducted new lecture session for ${activeSubject.code}. Updated ${count} students (${
        markAllPresent ? 'All marked Present' : 'Marked Absent by default'
      }).`
    );
    setTimeout(() => setAttFeedbackMsg(''), 4000);
  };

  // Filtered Students for the "STUDENTS" Tab
  const filteredStudentsList = useMemo(() => {
    let list = relevantStudents;
    if (studentSubjectFilter === 'ALL') {
      list = allAssignedStudents;
    }

    return list
      .filter((st) => {
        const matchesSearch =
          st.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
          st.rollNumber.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
          st.id.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
          st.email.toLowerCase().includes(studentSearchTerm.toLowerCase());

        // Attendance check
        const targetSubId = studentSubjectFilter === 'ALL' ? activeSubject?.id : studentSubjectFilter;
        const attRec = attendance.find((a) => a.studentId === st.id && (targetSubId ? a.subjectId === targetSubId : true));
        const attPct = attRec && attRec.totalLectures > 0 ? (attRec.attendedLectures / attRec.totalLectures) * 100 : 100;
        const isEligible = attPct >= 75.0;

        const matchesAtt =
          studentAttFilter === 'ALL' ||
          (studentAttFilter === 'ELIGIBLE' && isEligible) ||
          (studentAttFilter === 'SHORTAGE' && !isEligible);

        return matchesSearch && matchesAtt;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (studentSortBy === 'NAME') {
          cmp = a.name.localeCompare(b.name);
        } else if (studentSortBy === 'ROLL') {
          cmp = a.rollNumber.localeCompare(b.rollNumber);
        } else if (studentSortBy === 'ATTENDANCE') {
          const targetSubId = activeSubject?.id || '';
          const attA = attendance.find((x) => x.studentId === a.id && x.subjectId === targetSubId);
          const attB = attendance.find((x) => x.studentId === b.id && x.subjectId === targetSubId);
          const pctA = attA && attA.totalLectures > 0 ? attA.attendedLectures / attA.totalLectures : 1;
          const pctB = attB && attB.totalLectures > 0 ? attB.attendedLectures / attB.totalLectures : 1;
          cmp = pctA - pctB;
        } else if (studentSortBy === 'MARKS') {
          const targetSubId = activeSubject?.id || '';
          const markA = marks.find((x) => x.studentId === a.id && x.subjectId === targetSubId)?.totalMarks || 0;
          const markB = marks.find((x) => x.studentId === b.id && x.subjectId === targetSubId)?.totalMarks || 0;
          cmp = markA - markB;
        }
        return studentSortOrder === 'ASC' ? cmp : -cmp;
      });
  }, [
    relevantStudents,
    allAssignedStudents,
    studentSubjectFilter,
    studentSearchTerm,
    studentAttFilter,
    studentSortBy,
    studentSortOrder,
    activeSubject,
    attendance,
    marks,
  ]);

  // Filtered Students for Marks Tab
  const filteredMarksStudents = useMemo(() => {
    return relevantStudents.filter((st) => {
      const matchesSearch =
        st.name.toLowerCase().includes(marksSearchTerm.toLowerCase()) ||
        st.rollNumber.toLowerCase().includes(marksSearchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [relevantStudents, marksSearchTerm]);

  // Filtered Students for Attendance Tab
  const filteredAttendanceStudents = useMemo(() => {
    return relevantStudents.filter((st) => {
      const matchesSearch =
        st.name.toLowerCase().includes(attendanceSearchTerm.toLowerCase()) ||
        st.rollNumber.toLowerCase().includes(attendanceSearchTerm.toLowerCase());

      const attRecord = attendance.find(
        (a) => a.studentId === st.id && a.subjectId === activeSubject?.id
      ) || {
        totalLectures: 48,
        attendedLectures: 42,
      };
      const evalRes = evaluateAttendance75Rule(attRecord.attendedLectures, attRecord.totalLectures);

      const matchesEligibility =
        attendanceFilter === 'ALL' ||
        (attendanceFilter === 'ELIGIBLE' && evalRes.isEligible) ||
        (attendanceFilter === 'SHORTAGE' && !evalRes.isEligible);

      return matchesSearch && matchesEligibility;
    });
  }, [relevantStudents, attendanceSearchTerm, attendanceFilter, attendance, activeSubject]);

  return (
    <div className="space-y-5 max-w-full overflow-hidden">
      
      {/* ========================================================================= */}
      {/* FACULTY TOP BANNER (Header & Subject Selector) */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Left: Faculty Identity */}
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-lg shrink-0 shadow-inner">
            {faculty.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                {faculty.name}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800/60 shrink-0">
                {faculty.designation}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                {faculty.employeeId}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 truncate">
              {faculty.department} • {faculty.email} • {faculty.phone}
            </p>
          </div>
        </div>

        {/* Right: Active Subject Selector & Course Context */}
        <div className="flex items-center space-x-2 bg-slate-950/80 p-2 rounded-xl border border-slate-800 shrink-0">
          <BookOpen className="w-4 h-4 text-blue-400 shrink-0 ml-1" />
          <span className="text-xs font-semibold text-slate-300 hidden sm:inline">Active Course:</span>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-white text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 max-w-[220px] truncate"
          >
            {assignedSubjects.length === 0 ? (
              <option value="">No Subjects Assigned</option>
            ) : (
              assignedSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name} (Sem {s.semester})
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5 KPI SUMMARY METRIC TILES */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Card 1: Assigned Subjects */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex items-center space-x-3 hover:border-slate-700 transition-all">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">My Courses</p>
            <p className="text-lg font-bold text-white mt-0.5">{assignedSubjects.length} Assigned</p>
            <p className="text-[10px] text-slate-500 truncate mt-0.5">
              {assignedSubjects.map((s) => s.code).join(', ') || 'None'}
            </p>
          </div>
        </div>

        {/* Card 2: Total Enrolled in Faculty Classes */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex items-center space-x-3 hover:border-slate-700 transition-all">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Total Students</p>
            <p className="text-lg font-bold text-white mt-0.5">{totalAssignedStudentsCount} Enrolled</p>
            <p className="text-[10px] text-slate-500 truncate mt-0.5">
              {relevantStudents.length} in active course ({activeSubject?.code})
            </p>
          </div>
        </div>

        {/* Card 3: Class Average Score */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex items-center space-x-3 hover:border-slate-700 transition-all">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Class Average</p>
            <p className="text-lg font-bold text-emerald-400 mt-0.5">
              {activeSubjectAvg > 0 ? `${activeSubjectAvg.toFixed(1)}%` : 'N/A'}
            </p>
            <p className="text-[10px] text-slate-500 truncate mt-0.5 font-mono">
              Pass Rate: {activeSubjectPassRate.toFixed(0)}%
            </p>
          </div>
        </div>

        {/* Card 4: Attendance Compliance Rate */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex items-center space-x-3 hover:border-slate-700 transition-all">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Attendance Rate</p>
            <p className="text-lg font-bold text-cyan-400 mt-0.5">
              {overallAttAvg.toFixed(1)}%
            </p>
            <p className="text-[10px] text-slate-500 truncate mt-0.5">
              {eligibleCount} eligible ({((eligibleCount / Math.max(1, eligibleCount + shortageCount)) * 100).toFixed(0)}%)
            </p>
          </div>
        </div>

        {/* Card 5: Attendance Shortage */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex items-center space-x-3 hover:border-slate-700 transition-all">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Attendance Risk</p>
            <p className="text-lg font-bold text-rose-400 mt-0.5">
              {shortageCount} &lt;75%
            </p>
            <p className="text-[10px] text-slate-500 truncate mt-0.5">
              {shortageCount > 0 ? 'Debarment Warning' : 'Full Compliance'}
            </p>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* NOTIFICATIONS / FEEDBACK BANNER */}
      {/* ========================================================================= */}
      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {attFeedbackMsg && (
        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-300 text-xs flex items-center space-x-2 animate-in fade-in">
          <CalendarCheck className="w-4 h-4 text-blue-400 shrink-0" />
          <span>{attFeedbackMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FACULTY PORTAL NAVIGATION TABS */}
      {/* ========================================================================= */}
      <div className="border-b border-slate-800 flex space-x-1.5 sm:space-x-2 text-xs font-medium overflow-x-auto whitespace-nowrap pb-2 w-full max-w-full scrollbar-thin">
        
        <button
          onClick={() => setActiveTab('DASHBOARD')}
          className={`px-3 py-2 rounded-xl flex items-center space-x-1.5 transition-colors shrink-0 ${
            activeTab === 'DASHBOARD'
              ? 'bg-blue-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('PROFILE')}
          className={`px-3 py-2 rounded-xl flex items-center space-x-1.5 transition-colors shrink-0 ${
            activeTab === 'PROFILE'
              ? 'bg-blue-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <User className="w-3.5 h-3.5 shrink-0" />
          <span>My Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('SUBJECTS')}
          className={`px-3 py-2 rounded-xl flex items-center space-x-1.5 transition-colors shrink-0 ${
            activeTab === 'SUBJECTS'
              ? 'bg-blue-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 shrink-0" />
          <span>My Subjects ({assignedSubjects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('STUDENTS')}
          className={`px-3 py-2 rounded-xl flex items-center space-x-1.5 transition-colors shrink-0 ${
            activeTab === 'STUDENTS'
              ? 'bg-blue-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 shrink-0" />
          <span>Student List ({filteredStudentsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ATTENDANCE')}
          className={`px-3 py-2 rounded-xl flex items-center space-x-1.5 transition-colors shrink-0 ${
            activeTab === 'ATTENDANCE'
              ? 'bg-blue-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          <span>Attendance Register</span>
          {shortageCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] bg-rose-500/20 text-rose-300 font-mono">
              {shortageCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('MARKS')}
          className={`px-3 py-2 rounded-xl flex items-center space-x-1.5 transition-colors shrink-0 ${
            activeTab === 'MARKS'
              ? 'bg-blue-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Award className="w-3.5 h-3.5 shrink-0" />
          <span>Enter Marks & Evaluation</span>
        </button>

        <button
          onClick={() => setActiveTab('PERFORMANCE')}
          className={`px-3 py-2 rounded-xl flex items-center space-x-1.5 transition-colors shrink-0 ${
            activeTab === 'PERFORMANCE'
              ? 'bg-blue-600 text-white font-semibold shadow-sm'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5 shrink-0" />
          <span>Class Performance</span>
        </button>

      </div>

      {/* ========================================================================= */}
      {/* TAB 1: FACULTY DASHBOARD OVERVIEW */}
      {/* ========================================================================= */}
      {activeTab === 'DASHBOARD' && (
        <div className="space-y-5">
          
          {/* Quick Academic Action Shortcuts */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <h3 className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Faculty Academic Actions</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              
              <button
                onClick={() => setActiveTab('MARKS')}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 flex flex-col items-center text-center space-y-1.5 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Edit3 className="w-4 h-4" />
                </div>
                <span className="font-semibold text-white">Record Marks</span>
                <span className="text-[10px] text-slate-500">ISE 1-3 & EndSem</span>
              </button>

              <button
                onClick={() => setActiveTab('ATTENDANCE')}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 flex flex-col items-center text-center space-y-1.5 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <span className="font-semibold text-white">Mark Attendance</span>
                <span className="text-[10px] text-slate-500">75% compliance check</span>
              </button>

              <button
                onClick={() => setActiveTab('STUDENTS')}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 flex flex-col items-center text-center space-y-1.5 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <UserCheck className="w-4 h-4" />
                </div>
                <span className="font-semibold text-white">Class Roster</span>
                <span className="text-[10px] text-slate-500">View enrolled students</span>
              </button>

              <button
                onClick={() => setActiveTab('PERFORMANCE')}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 flex flex-col items-center text-center space-y-1.5 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <BarChart2 className="w-4 h-4" />
                </div>
                <span className="font-semibold text-white">Analytics</span>
                <span className="text-[10px] text-slate-500">Grade distribution</span>
              </button>

            </div>
          </div>

          {/* Assigned Courses Overview Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Left 2 Cols: My Assigned Subjects Matrix */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Assigned Course Portfolio</h3>
                  <p className="text-xs text-slate-400">Curriculum units and class performance assigned to you</p>
                </div>
                <button
                  onClick={() => setActiveTab('SUBJECTS')}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center space-x-1"
                >
                  <span>All Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {assignedSubjects.map((sub) => {
                  const subStudents = students.filter(
                    (s) => s.department === sub.department && s.semester === sub.semester
                  );
                  const subMarks = marks.filter((m) => m.subjectId === sub.id);
                  const subAvg = subMarks.length > 0
                    ? subMarks.reduce((a, b) => a + b.totalMarks, 0) / subMarks.length
                    : 0;

                  return (
                    <div
                      key={sub.id}
                      onClick={() => {
                        setSelectedSubjectId(sub.id);
                        setActiveTab('MARKS');
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        selectedSubjectId === sub.id
                          ? 'bg-blue-950/40 border-blue-500/50 shadow-md'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            {sub.code}
                          </span>
                          <h4 className="font-bold text-white text-sm mt-1.5 line-clamp-1">{sub.name}</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Sem {sub.semester} • {sub.credits} Credits • {sub.department}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="text-slate-400">
                          Enrolled: <strong className="text-white font-mono">{subStudents.length}</strong>
                        </span>
                        <span className="text-slate-400">
                          Class Avg: <strong className="text-emerald-400 font-mono">{subAvg > 0 ? `${subAvg.toFixed(1)}%` : 'N/A'}</strong>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Col: Active Subject Quick Snapshot */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Award className="w-4 h-4 text-blue-400" />
                  <span>Selected Course Snapshot</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{activeSubject?.code} - {activeSubject?.name}</p>

                <div className="mt-4 space-y-2.5 text-xs">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Department:</span>
                      <span className="font-semibold text-slate-200">{activeSubject?.department}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Semester & Credits:</span>
                      <span className="font-mono text-slate-200">Sem {activeSubject?.semester} ({activeSubject?.credits} Credits)</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Enrolled Students:</span>
                      <span className="font-mono font-bold text-white">{relevantStudents.length} Students</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Subject Pass Rate:</span>
                      <span className="font-mono font-bold text-emerald-400">{activeSubjectPassRate.toFixed(0)}%</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-blue-400">Continuous Assessment Scheme</span>
                    <p className="text-[11px] text-slate-300">
                      ISE-1 (20) + ISE-2 (20) + ISE-3 (20) [Best 2 avg = 20m] + Assgn (10m) + Prac (20m) + EndSem (60m scaled).
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={() => setActiveTab('MARKS')}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <span>Open Grading Sheet</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MY PROFILE */}
      {/* ========================================================================= */}
      {activeTab === 'PROFILE' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-2xl">
                {faculty.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{faculty.name}</h3>
                <p className="text-xs text-blue-400 font-medium">{faculty.designation} • {faculty.department}</p>
                <p className="text-xs text-slate-400 mt-0.5">Faculty ID: <span className="font-mono text-slate-200">{faculty.employeeId} ({faculty.id})</span></p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Active Faculty Status
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Contact & Demographics */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                <User className="w-4 h-4 text-blue-400" />
                <span>Contact & Department Information</span>
              </h4>

              <div className="space-y-2 text-xs divide-y divide-slate-800/80">
                <div className="pt-2 flex justify-between">
                  <span className="text-slate-400">Official Email:</span>
                  <span className="font-mono text-slate-200">{faculty.email}</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-slate-400">Phone Number:</span>
                  <span className="font-mono text-slate-200">{faculty.phone}</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-slate-400">Department:</span>
                  <span className="font-semibold text-slate-200">{faculty.department}</span>
                </div>
                <div className="pt-2 flex justify-between">
                  <span className="text-slate-400">Designation:</span>
                  <span className="font-semibold text-blue-300">{faculty.designation}</span>
                </div>
              </div>
            </div>

            {/* Academic Responsibilities */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span>Assigned Course Responsibilities</span>
              </h4>

              <div className="space-y-2 text-xs">
                <p className="text-slate-400 text-[11px]">
                  You are the designated course coordinator and primary examiner for the following registered syllabus units:
                </p>
                <div className="space-y-1.5 mt-2">
                  {assignedSubjects.map((sub) => (
                    <div key={sub.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="font-mono text-[10px] font-bold text-blue-400">{sub.code}</span>
                        <p className="text-xs font-semibold text-white">{sub.name}</p>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        Sem {sub.semester} • {sub.credits} Credits
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MY SUBJECTS */}
      {/* ========================================================================= */}
      {activeTab === 'SUBJECTS' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-white">Assigned Course Syllabus Units</h3>
              <p className="text-xs text-slate-400">
                Institutional subjects mapped to your faculty profile in the database
              </p>
            </div>
            <span className="text-xs font-mono bg-blue-500/10 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-lg">
              {assignedSubjects.length} Courses Assigned
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignedSubjects.map((sub) => {
              const subStudents = students.filter(
                (s) => s.department === sub.department && s.semester === sub.semester
              );
              const subMarks = marks.filter((m) => m.subjectId === sub.id);
              const subAvg = subMarks.length > 0
                ? subMarks.reduce((a, b) => a + b.totalMarks, 0) / subMarks.length
                : 0;

              return (
                <div key={sub.id} className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-mono font-bold">
                        {sub.code}
                      </span>
                      <h4 className="text-base font-bold text-white mt-2">{sub.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{sub.department}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs font-mono">
                      {sub.credits} Credits
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Semester</span>
                      <strong className="text-white font-mono text-sm">Sem {sub.semester}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Enrolled</span>
                      <strong className="text-white font-mono text-sm">{subStudents.length}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Avg Marks</span>
                      <strong className="text-emerald-400 font-mono text-sm">
                        {subAvg > 0 ? `${subAvg.toFixed(1)}%` : 'N/A'}
                      </strong>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-400">
                    <div className="flex justify-between">
                      <span>Continuous ISE Max:</span>
                      <span className="font-mono text-slate-200">{sub.maxIseMarks}m (x3 tests)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Practical Component Max:</span>
                      <span className="font-mono text-slate-200">{sub.maxPracticalMarks}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span>End-Semester Written Exam:</span>
                      <span className="font-mono text-slate-200">{sub.maxEndSemMarks}m (scaled to 50)</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setSelectedSubjectId(sub.id);
                        setActiveTab('MARKS');
                      }}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Enter Marks</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSubjectId(sub.id);
                        setActiveTab('ATTENDANCE');
                      }}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Attendance</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: STUDENT LIST */}
      {/* ========================================================================= */}
      {activeTab === 'STUDENTS' && (
        <div className="space-y-4">
          
          {/* Controls Bar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-800 w-full max-w-full">
            
            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 shrink-0" />
              <input
                type="text"
                placeholder="Search student by name, roll number, email..."
                value={studentSearchTerm}
                onChange={(e) => setStudentSearchTerm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 text-xs w-full lg:w-auto">
              
              {/* Course Filter */}
              <select
                value={studentSubjectFilter}
                onChange={(e) => setStudentSubjectFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 sm:px-3 py-2 text-slate-200 focus:outline-none text-xs w-full sm:w-auto"
              >
                <option value="ALL">All My Courses</option>
                {assignedSubjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.code} (Sem {s.semester})</option>
                ))}
              </select>

              {/* Attendance Filter */}
              <select
                value={studentAttFilter}
                onChange={(e) => setStudentAttFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 sm:px-3 py-2 text-slate-200 focus:outline-none text-xs w-full sm:w-auto"
              >
                <option value="ALL">All Attendance</option>
                <option value="ELIGIBLE">Eligible (≥75%)</option>
                <option value="SHORTAGE">Shortage (&lt;75%)</option>
              </select>

              {/* Sort By */}
              <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1 w-full sm:w-auto">
                <select
                  value={studentSortBy}
                  onChange={(e) => setStudentSortBy(e.target.value as any)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-2.5 sm:px-3 py-2 text-slate-200 focus:outline-none text-xs flex-1 sm:flex-initial"
                >
                  <option value="ROLL">Sort: Roll No</option>
                  <option value="NAME">Sort: Name</option>
                  <option value="ATTENDANCE">Sort: Attendance</option>
                  <option value="MARKS">Sort: Marks</option>
                </select>

                <button
                  onClick={() => setStudentSortOrder(studentSortOrder === 'ASC' ? 'DESC' : 'ASC')}
                  className="p-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:text-white shrink-0"
                  title="Toggle Sort Order"
                  aria-label="Toggle Sort Order"
                >
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-700">
                  <tr>
                    <th className="p-3.5">Roll No & Student Name</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5">Semester</th>
                    <th className="p-3.5">Course Attendance</th>
                    <th className="p-3.5">Eligibility Status</th>
                    <th className="p-3.5">Current Mark & Grade</th>
                    <th className="p-3.5 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredStudentsList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        No students match the selected filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredStudentsList.map((st) => {
                      const targetSubId = activeSubject?.id || '';
                      const attRec = attendance.find((a) => a.studentId === st.id && a.subjectId === targetSubId) || {
                        totalLectures: 48,
                        attendedLectures: 42,
                      };
                      const evalRes = evaluateAttendance75Rule(attRec.attendedLectures, attRec.totalLectures);

                      const markRec = marks.find((m) => m.studentId === st.id && m.subjectId === targetSubId);

                      return (
                        <tr key={st.id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="p-3.5 font-medium text-white">
                            <div className="flex items-center space-x-2.5">
                              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-xs shrink-0">
                                {st.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-slate-100">{st.name}</div>
                                <div className="text-[10px] font-mono text-blue-300">{st.rollNumber} • {st.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5 text-slate-300">{st.department}</td>
                          <td className="p-3.5 font-mono">Sem {st.semester}</td>
                          <td className="p-3.5 font-mono">
                            <span className={evalRes.isEligible ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                              {evalRes.percentage.toFixed(1)}%
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              ({attRec.attendedLectures}/{attRec.totalLectures} lecs)
                            </span>
                          </td>
                          <td className="p-3.5">
                            {evalRes.isEligible ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-flex items-center space-x-1">
                                <Check className="w-3 h-3" />
                                <span>Eligible</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 inline-flex items-center space-x-1">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Shortage (&lt;75%)</span>
                              </span>
                            )}
                          </td>
                          <td className="p-3.5">
                            {markRec ? (
                              <div className="flex items-center space-x-1.5">
                                <span className="font-mono font-bold text-white">{markRec.totalMarks.toFixed(1)}m</span>
                                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                  markRec.grade === 'F' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                                }`}>
                                  {markRec.grade}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-500 text-[11px]">Not Evaluated</span>
                            )}
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => {
                                setActiveTab('MARKS');
                              }}
                              className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-semibold transition-colors"
                            >
                              Edit Marks
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden space-y-3">
            {filteredStudentsList.length === 0 ? (
              <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 text-center text-slate-500 text-xs">
                No students match the selected filter criteria.
              </div>
            ) : (
              filteredStudentsList.map((st) => {
                const targetSubId = activeSubject?.id || '';
                const attRec = attendance.find((a) => a.studentId === st.id && a.subjectId === targetSubId) || {
                  totalLectures: 48,
                  attendedLectures: 42,
                };
                const evalRes = evaluateAttendance75Rule(attRec.attendedLectures, attRec.totalLectures);
                const markRec = marks.find((m) => m.studentId === st.id && m.subjectId === targetSubId);

                return (
                  <div key={st.id} className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-3 shadow-md">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-white text-sm">{st.name}</h4>
                        <p className="text-[11px] font-mono text-blue-300">{st.rollNumber} • Sem {st.semester}</p>
                      </div>
                      {evalRes.isEligible ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                          Eligible ({evalRes.percentage.toFixed(0)}%)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
                          Shortage ({evalRes.percentage.toFixed(0)}%)
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-950 rounded-xl text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Attendance</span>
                        <span className="font-mono text-slate-200 font-semibold">
                          {attRec.attendedLectures}/{attRec.totalLectures} ({evalRes.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Mark & Grade</span>
                        <span className="font-mono text-emerald-400 font-bold">
                          {markRec ? `${markRec.totalMarks.toFixed(1)} (${markRec.grade})` : 'Not recorded'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab('MARKS')}
                      className="w-full py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-semibold text-center"
                    >
                      Enter / Edit Marks
                    </button>
                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: ATTENDANCE REGISTER & 75% COMPLIANCE */}
      {/* ========================================================================= */}
      {activeTab === 'ATTENDANCE' && (
        <div className="space-y-4">
          
          {/* Header & Bulk Session Action */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 sm:p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span>Daily Lecture Attendance Register — {activeSubject?.code}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Maintains mandatory 75% institutional examination rule compliance
                </p>
              </div>

              {/* Bulk Lecture Session Controls */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handleConductBulkLecture(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md transition-colors whitespace-nowrap"
                >
                  + Conduct Lecture (All Present)
                </button>
                <button
                  onClick={() => handleConductBulkLecture(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap"
                >
                  + Conduct Lecture (All Absent)
                </button>
              </div>
            </div>

            {/* Filter bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2 border-t border-slate-800">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 shrink-0" />
                <input
                  type="text"
                  placeholder="Filter student in active register..."
                  value={attendanceSearchTerm}
                  onChange={(e) => setAttendanceSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={attendanceFilter}
                  onChange={(e) => setAttendanceFilter(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200 text-xs focus:outline-none"
                >
                  <option value="ALL">All Compliance Levels</option>
                  <option value="ELIGIBLE">Eligible (≥75%)</option>
                  <option value="SHORTAGE">Shortage (&lt;75%)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-700">
                  <tr>
                    <th className="p-3.5">Roll No & Student</th>
                    <th className="p-3.5 text-center">Conducted Lectures</th>
                    <th className="p-3.5 text-center">Attended Lectures</th>
                    <th className="p-3.5 text-center">Attendance %</th>
                    <th className="p-3.5">Eligibility Status</th>
                    <th className="p-3.5">Remedial Action</th>
                    <th className="p-3.5 text-right">Quick Increment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredAttendanceStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        No students in this course roster matching the attendance filter.
                      </td>
                    </tr>
                  ) : (
                    filteredAttendanceStudents.map((st) => {
                      const attRecord = attendance.find(
                        (a) => a.studentId === st.id && a.subjectId === activeSubject?.id
                      ) || {
                        totalLectures: 48,
                        attendedLectures: 42,
                      };

                      const evalResult = evaluateAttendance75Rule(
                        attRecord.attendedLectures,
                        attRecord.totalLectures
                      );

                      return (
                        <tr key={st.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3.5 font-medium text-white">
                            <div className="font-bold">{st.name}</div>
                            <div className="text-[10px] font-mono text-slate-400">{st.rollNumber}</div>
                          </td>
                          <td className="p-3.5 text-center font-mono">{attRecord.totalLectures}</td>
                          <td className="p-3.5 text-center font-mono font-bold text-blue-300">
                            {attRecord.attendedLectures}
                          </td>
                          <td className="p-3.5 text-center font-mono font-bold text-sm">
                            <span className={evalResult.isEligible ? 'text-emerald-400' : 'text-rose-400'}>
                              {evalResult.percentage.toFixed(1)}%
                            </span>
                          </td>
                          <td className="p-3.5">
                            {evalResult.isEligible ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-flex items-center space-x-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>✓ Eligible</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 inline-flex items-center space-x-1">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>⚠ Attendance Shortage</span>
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-slate-400">
                            {!evalResult.isEligible ? (
                              <span className="text-[11px] text-amber-300">
                                Need {evalResult.requiredLecturesToReach75} consecutive lectures
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-500">Compliance Maintained</span>
                            )}
                          </td>
                          <td className="p-3.5 text-right space-x-1.5">
                            <button
                              onClick={() =>
                                onUpdateAttendance(
                                  st.id,
                                  activeSubject.id,
                                  attRecord.attendedLectures + 1,
                                  attRecord.totalLectures + 1
                                )
                              }
                              className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-[10px] font-semibold transition-colors"
                              title="Mark Present in this class"
                            >
                              + Present
                            </button>
                            <button
                              onClick={() =>
                                onUpdateAttendance(
                                  st.id,
                                  activeSubject.id,
                                  attRecord.attendedLectures,
                                  attRecord.totalLectures + 1
                                )
                              }
                              className="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-lg text-[10px] font-semibold transition-colors"
                              title="Mark Absent in this class"
                            >
                              + Absent
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Attendance Cards */}
          <div className="md:hidden space-y-3">
            {filteredAttendanceStudents.map((st) => {
              const attRecord = attendance.find(
                (a) => a.studentId === st.id && a.subjectId === activeSubject?.id
              ) || {
                totalLectures: 48,
                attendedLectures: 42,
              };
              const evalResult = evaluateAttendance75Rule(attRecord.attendedLectures, attRecord.totalLectures);

              return (
                <div key={st.id} className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-3 shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{st.name}</h4>
                      <p className="text-[11px] font-mono text-slate-400">{st.rollNumber}</p>
                    </div>
                    {evalResult.isEligible ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        ✓ Eligible ({evalResult.percentage.toFixed(1)}%)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        ⚠ Shortage ({evalResult.percentage.toFixed(1)}%)
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-950 rounded-xl text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Lectures Attended</span>
                      <span className="font-mono text-slate-200 font-bold">
                        {attRecord.attendedLectures} of {attRecord.totalLectures}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Remedial Status</span>
                      <span className="text-[11px] text-amber-300">
                        {!evalResult.isEligible ? `Need ${evalResult.requiredLecturesToReach75} lecs` : 'Safe'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() =>
                        onUpdateAttendance(
                          st.id,
                          activeSubject.id,
                          attRecord.attendedLectures + 1,
                          attRecord.totalLectures + 1
                        )
                      }
                      className="flex-1 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold"
                    >
                      + Mark Present
                    </button>
                    <button
                      onClick={() =>
                        onUpdateAttendance(
                          st.id,
                          activeSubject.id,
                          attRecord.attendedLectures,
                          attRecord.totalLectures + 1
                        )
                      }
                      className="flex-1 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold"
                    >
                      + Mark Absent
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: ENTER MARKS & CONTINUOUS EVALUATION */}
      {/* ========================================================================= */}
      {activeTab === 'MARKS' && (
        <div className="space-y-4">
          
          {/* Header & Controls Bar */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 sm:p-5 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Award className="w-4 h-4 text-blue-400" />
                  <span>Continuous Marks Entry — {activeSubject?.code} ({activeSubject?.name})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Automatic Best 2 of 3 ISE average calculation • Practical (20) • EndSem (60 scaled to 50)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveAllEditedMarks}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md flex items-center space-x-1.5 transition-colors whitespace-nowrap"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save All Changes</span>
                </button>
              </div>
            </div>

            {/* Sub-bar Filter */}
            <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 shrink-0" />
                <input
                  type="text"
                  placeholder="Search student in mark sheet..."
                  value={marksSearchTerm}
                  onChange={(e) => setMarksSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <span className="text-xs font-mono bg-blue-500/10 text-blue-300 border border-blue-500/30 px-3 py-1.5 rounded-xl font-semibold shrink-0">
                10-Point UGC Grading Active
              </span>
            </div>
          </div>

          {/* Desktop Marks Grid */}
          <div className="hidden lg:block bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-700">
                  <tr>
                    <th className="p-3">Roll No & Student</th>
                    <th className="p-3 text-center">ISE-1 (20)</th>
                    <th className="p-3 text-center">ISE-2 (20)</th>
                    <th className="p-3 text-center">ISE-3 (20)</th>
                    <th className="p-3 text-center">Assgn (10)</th>
                    <th className="p-3 text-center">Prac (20)</th>
                    <th className="p-3 text-center">EndSem (60)</th>
                    <th className="p-3 text-center">Best ISE (20)</th>
                    <th className="p-3 text-center">Total (100)</th>
                    <th className="p-3 text-center">Grade</th>
                    <th className="p-3 text-right">Save</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredMarksStudents.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="p-8 text-center text-slate-500">
                        No students in this course roster matching the search query.
                      </td>
                    </tr>
                  ) : (
                    filteredMarksStudents.map((st) => {
                      const key = `${st.id}_${activeSubject.id}`;
                      const currentMark =
                        editedMarksMap[key] ||
                        marks.find((m) => m.studentId === st.id && m.subjectId === activeSubject.id) || {
                          ise1: 15,
                          ise2: 15,
                          ise3: 15,
                          assignment: 8,
                          practical: 16,
                          endSem: 40,
                        };

                      const ise1 = Number(currentMark.ise1 ?? 15);
                      const ise2 = Number(currentMark.ise2 ?? 15);
                      const ise3 = Number(currentMark.ise3 ?? 15);
                      const assignment = Number(currentMark.assignment ?? 8);
                      const practical = Number(currentMark.practical ?? 16);
                      const endSem = Number(currentMark.endSem ?? 40);

                      const computed = computeSubjectGrade(ise1, ise2, ise3, assignment, practical, endSem);

                      return (
                        <tr key={st.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3 font-medium text-white">
                            <div className="font-bold">{st.name}</div>
                            <div className="text-[10px] font-mono text-slate-400">{st.rollNumber}</div>
                          </td>

                          <td className="p-3 text-center">
                            <input
                              type="number"
                              max={20}
                              min={0}
                              value={ise1}
                              onChange={(e) => handleMarkChange(st.id, 'ise1', Number(e.target.value))}
                              className="w-14 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono font-bold text-slate-100 focus:border-blue-500 focus:outline-none"
                            />
                          </td>

                          <td className="p-3 text-center">
                            <input
                              type="number"
                              max={20}
                              min={0}
                              value={ise2}
                              onChange={(e) => handleMarkChange(st.id, 'ise2', Number(e.target.value))}
                              className="w-14 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono font-bold text-slate-100 focus:border-blue-500 focus:outline-none"
                            />
                          </td>

                          <td className="p-3 text-center">
                            <input
                              type="number"
                              max={20}
                              min={0}
                              value={ise3}
                              onChange={(e) => handleMarkChange(st.id, 'ise3', Number(e.target.value))}
                              className="w-14 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono font-bold text-slate-100 focus:border-blue-500 focus:outline-none"
                            />
                          </td>

                          <td className="p-3 text-center">
                            <input
                              type="number"
                              max={10}
                              min={0}
                              value={assignment}
                              onChange={(e) => handleMarkChange(st.id, 'assignment', Number(e.target.value))}
                              className="w-14 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono text-slate-100 focus:border-blue-500 focus:outline-none"
                            />
                          </td>

                          <td className="p-3 text-center">
                            <input
                              type="number"
                              max={20}
                              min={0}
                              value={practical}
                              onChange={(e) => handleMarkChange(st.id, 'practical', Number(e.target.value))}
                              className="w-14 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono text-slate-100 focus:border-blue-500 focus:outline-none"
                            />
                          </td>

                          <td className="p-3 text-center">
                            <input
                              type="number"
                              max={60}
                              min={0}
                              value={endSem}
                              onChange={(e) => handleMarkChange(st.id, 'endSem', Number(e.target.value))}
                              className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono font-bold text-blue-300 focus:border-blue-500 focus:outline-none"
                            />
                          </td>

                          <td className="p-3 text-center font-mono font-semibold text-slate-300">
                            {computed.calculatedBestIse.toFixed(1)}
                          </td>

                          <td className="p-3 text-center font-mono font-bold text-emerald-400">
                            {computed.totalMarks.toFixed(1)}
                          </td>

                          <td className="p-3 text-center font-bold">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] ${
                                computed.grade === 'F'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              }`}
                            >
                              {computed.grade} ({computed.gradePoint})
                            </span>
                          </td>

                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleSaveSingleMark(st.id)}
                              className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                              title="Save Single Mark Record"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile / Tablet Responsive Marks Cards */}
          <div className="lg:hidden space-y-3">
            {filteredMarksStudents.map((st) => {
              const key = `${st.id}_${activeSubject.id}`;
              const currentMark =
                editedMarksMap[key] ||
                marks.find((m) => m.studentId === st.id && m.subjectId === activeSubject.id) || {
                  ise1: 15,
                  ise2: 15,
                  ise3: 15,
                  assignment: 8,
                  practical: 16,
                  endSem: 40,
                };

              const ise1 = Number(currentMark.ise1 ?? 15);
              const ise2 = Number(currentMark.ise2 ?? 15);
              const ise3 = Number(currentMark.ise3 ?? 15);
              const assignment = Number(currentMark.assignment ?? 8);
              const practical = Number(currentMark.practical ?? 16);
              const endSem = Number(currentMark.endSem ?? 40);

              const computed = computeSubjectGrade(ise1, ise2, ise3, assignment, practical, endSem);

              return (
                <div key={st.id} className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-3 shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{st.name}</h4>
                      <p className="text-[11px] font-mono text-slate-400">{st.rollNumber}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        computed.grade === 'F'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {computed.grade} • {computed.totalMarks.toFixed(1)}m
                    </span>
                  </div>

                  {/* Input Fields in a 3-col grid */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">ISE-1 (20)</label>
                      <input
                        type="number"
                        max={20}
                        min={0}
                        value={ise1}
                        onChange={(e) => handleMarkChange(st.id, 'ise1', Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1 text-center font-mono text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">ISE-2 (20)</label>
                      <input
                        type="number"
                        max={20}
                        min={0}
                        value={ise2}
                        onChange={(e) => handleMarkChange(st.id, 'ise2', Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1 text-center font-mono text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">ISE-3 (20)</label>
                      <input
                        type="number"
                        max={20}
                        min={0}
                        value={ise3}
                        onChange={(e) => handleMarkChange(st.id, 'ise3', Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1 text-center font-mono text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Assgn (10)</label>
                      <input
                        type="number"
                        max={10}
                        min={0}
                        value={assignment}
                        onChange={(e) => handleMarkChange(st.id, 'assignment', Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1 text-center font-mono text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Prac (20)</label>
                      <input
                        type="number"
                        max={20}
                        min={0}
                        value={practical}
                        onChange={(e) => handleMarkChange(st.id, 'practical', Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1 text-center font-mono text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">EndSem (60)</label>
                      <input
                        type="number"
                        max={60}
                        min={0}
                        value={endSem}
                        onChange={(e) => handleMarkChange(st.id, 'endSem', Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1 text-center font-mono text-blue-300 font-bold text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-xs">
                    <span className="text-slate-400 text-[11px]">
                      Best 2 ISE: <strong className="text-white font-mono">{computed.calculatedBestIse.toFixed(1)}</strong>
                    </span>
                    <button
                      onClick={() => handleSaveSingleMark(st.id)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold flex items-center space-x-1"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: CLASS PERFORMANCE & ANALYTICS */}
      {/* ========================================================================= */}
      {activeTab === 'PERFORMANCE' && (
        <div className="space-y-4">
          
          {/* Header Banner */}
          <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <BarChart2 className="w-4 h-4 text-blue-400" />
                <span>Class Academic Performance — {activeSubject?.code}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluation distribution, class toppers, and students requiring remedial guidance
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-lg font-semibold">
                Class Avg: {activeSubjectAvg > 0 ? `${activeSubjectAvg.toFixed(1)}%` : '0%'}
              </span>
              <span className="bg-blue-500/10 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-lg font-semibold">
                Pass Rate: {activeSubjectPassRate.toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Grade Distribution Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              UGC 10-Point Grade Distribution
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {[
                { grade: 'O', label: '90-100%', points: 10, color: 'emerald' },
                { grade: 'A+', label: '80-89%', points: 9, color: 'blue' },
                { grade: 'A', label: '70-79%', points: 8, color: 'cyan' },
                { grade: 'B+', label: '60-69%', points: 7, color: 'indigo' },
                { grade: 'B', label: '50-59%', points: 6, color: 'amber' },
                { grade: 'C', label: '40-49%', points: 5, color: 'slate' },
                { grade: 'F', label: '<40% Fail', points: 0, color: 'rose' },
              ].map((gb) => {
                const count = gradeDistribution[gb.grade] || 0;
                const total = Math.max(1, activeSubjectMarks.length);
                const pct = (count / total) * 100;

                return (
                  <div key={gb.grade} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-1">
                    <span className="text-xs font-bold font-mono text-white block">{gb.grade}</span>
                    <span className="text-[10px] text-slate-500 block">{gb.label}</span>
                    <strong className="text-base font-mono font-bold text-blue-400 block">{count}</strong>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                      <div className="bg-blue-500 h-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dual Columns: Top Performers vs Students Needing Attention */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Top Performers */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center space-x-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Top Performing Students</span>
              </h4>

              <div className="space-y-2">
                {activeSubjectTopStudents.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">No examination data available yet.</p>
                ) : (
                  activeSubjectTopStudents.map(({ mark, student }, idx) => (
                    <div key={mark.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3">
                        <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-bold font-mono text-xs flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-white">{student?.name || mark.studentId}</div>
                          <div className="text-[10px] font-mono text-slate-400">{student?.rollNumber}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-amber-300 text-sm">{mark.totalMarks.toFixed(1)}m</div>
                        <div className="text-[10px] font-semibold text-emerald-400">Grade {mark.grade}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Students Requiring Remedial Attention */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md">
              <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>Remedial Guidance Required</span>
              </h4>

              <div className="space-y-2">
                {activeSubjectLowStudents.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center text-slate-400 text-xs">
                    ✓ All students are currently scoring above 50% in this course.
                  </div>
                ) : (
                  activeSubjectLowStudents.map(({ mark, student }) => (
                    <div key={mark.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white">{student?.name || mark.studentId}</div>
                        <div className="text-[10px] font-mono text-rose-400">
                          {student?.rollNumber} • EndSem: {mark.endSem}/60
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-rose-400 text-sm">{mark.totalMarks.toFixed(1)}m</div>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300">
                          {mark.grade === 'F' ? 'BACKLOG (F)' : 'Low Score'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
