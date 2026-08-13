import React, { useState } from 'react';
import { Student, Subject, ExamMark, AttendanceRecord } from '../../types';
import { calculateDivision, ResultDivision } from '../../utils/gradeCalculator';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import confetti from 'canvas-confetti';
import {
  Award,
  TrendingUp,
  Sparkles,
  BarChart3,
  PieChartIcon,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  User,
  BookOpen,
  Filter,
  ShieldCheck,
  Check,
  FileSpreadsheet
} from 'lucide-react';

interface AnalyticsViewProps {
  students: Student[];
  subjects: Subject[];
  marks: ExamMark[];
  attendance: AttendanceRecord[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  students,
  subjects,
  marks,
  attendance,
}) => {
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [activeDivisionTab, setActiveDivisionTab] = useState<string>('ALL');

  const filteredStudents = deptFilter === 'ALL'
    ? students
    : students.filter((s) => s.department === deptFilter);

  // 1. Calculate Per-Student Overall Averages, Divisions & Status
  const studentPerformanceList = filteredStudents.map((st) => {
    const stMarks = marks.filter((m) => m.studentId === st.id);
    const totalObtained = stMarks.reduce((a, b) => a + b.totalMarks, 0);
    const totalMax = stMarks.length * 100;
    const avg = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;

    const failedMarks = stMarks.filter((m) => !m.passed);
    const backlogCount = failedMarks.length;
    const division = calculateDivision(avg, backlogCount);
    
    let status: 'PASS' | 'FAIL' | 'ATKT' = 'PASS';
    if (backlogCount > 2) status = 'FAIL';
    else if (backlogCount > 0) status = 'ATKT';

    return {
      student: st,
      totalObtained,
      totalMax,
      avg: Number(avg.toFixed(2)),
      backlogCount,
      failedSubjects: failedMarks.map((fm) => {
        const sub = subjects.find((s) => s.id === fm.subjectId);
        return { code: sub?.code || 'SUB', name: sub?.name || 'Subject', mark: fm.totalMarks };
      }),
      status,
      division,
    };
  }).sort((a, b) => b.avg - a.avg);

  // 2. Division & Status Metrics & Counts
  const totalAppeared = studentPerformanceList.length;
  
  const distinctionStudents = studentPerformanceList.filter((s) => s.division === 'FIRST CLASS WITH DISTINCTION');
  const firstClassStudents = studentPerformanceList.filter((s) => s.division === 'FIRST CLASS');
  const secondClassStudents = studentPerformanceList.filter((s) => s.division === 'SECOND CLASS');
  const passClassStudents = studentPerformanceList.filter((s) => s.division === 'PASS CLASS');
  const atktStudents = studentPerformanceList.filter((s) => s.division === 'ATKT');
  const failedStudents = studentPerformanceList.filter((s) => s.division === 'FAIL');

  const clearPassedCount = distinctionStudents.length + firstClassStudents.length + secondClassStudents.length + passClassStudents.length;
  const passPercentage = totalAppeared > 0 ? Number(((clearPassedCount / totalAppeared) * 100).toFixed(1)) : 0;

  // Filter list by selected Division Tab
  const displayedStudents = activeDivisionTab === 'ALL'
    ? studentPerformanceList
    : studentPerformanceList.filter((s) => s.division === activeDivisionTab);

  // 3. Toppers Podium (Rank 1, 2, 3)
  const toppers = studentPerformanceList.slice(0, 3);

  // 4. Division Pie Chart
  const divisionPieData = [
    { name: 'First Class with Distinction (>=75%)', count: distinctionStudents.length, color: '#10B981' },
    { name: 'First Class (60% - 74%)', count: firstClassStudents.length, color: '#3B82F6' },
    { name: 'Second Class (50% - 59%)', count: secondClassStudents.length, color: '#8B5CF6' },
    { name: 'Pass Class (40% - 49%)', count: passClassStudents.length, color: '#F59E0B' },
    { name: 'ATKT (1-2 Backlogs)', count: atktStudents.length, color: '#F97316' },
    { name: 'Failed (>2 Backlogs)', count: failedStudents.length, color: '#EF4444' },
  ].filter((d) => d.count > 0);

  // 5. Subject Average Data
  const subjectAvgData = subjects.map((sub) => {
    const subMarks = marks.filter((m) => m.subjectId === sub.id);
    const avg = subMarks.length > 0 ? subMarks.reduce((a, b) => a + b.totalMarks, 0) / subMarks.length : 0;
    return {
      code: sub.code,
      name: sub.name,
      average: Number(avg.toFixed(1)),
    };
  });

  // 6. Grade Distribution
  const gradeCounts: Record<string, number> = { O: 0, 'A+': 0, A: 0, 'B+': 0, B: 0, C: 0, F: 0 };
  marks.forEach((m) => {
    if (gradeCounts[m.grade] !== undefined) {
      gradeCounts[m.grade]++;
    }
  });

  const gradePieData = Object.entries(gradeCounts).map(([grade, count]) => ({
    name: `Grade ${grade}`,
    count,
  }));

  const COLORS = ['#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#F59E0B', '#E11D48', '#EF4444'];

  // 7. Subject Toppers
  const subjectToppers = subjects.map((sub) => {
    const subMarks = marks.filter((m) => m.subjectId === sub.id).sort((a, b) => b.totalMarks - a.totalMarks);
    const topMark = subMarks[0];
    const topStudent = topMark ? students.find((s) => s.id === topMark.studentId) : null;
    return {
      subject: sub,
      topStudent,
      topMarks: topMark ? topMark.totalMarks : 0,
      grade: topMark ? topMark.grade : 'N/A',
    };
  });

  const triggerTopperConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Bar with Department Filter */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
              Examination & Result Intelligence
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1 flex items-center space-x-2">
            <Award className="w-5 h-5 text-indigo-400" />
            <span>Class Toppers & Pass/Fail Examination Analytics</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time merit rankings, distinction metrics, pass vs fail distributions, and backlog analysis
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-800 p-2 rounded-xl border border-slate-700">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-300 font-semibold">Filter Dept:</span>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none"
          >
            <option value="ALL">All Departments (8 Branches)</option>
            <option value="Civil Engineering">Civil Engineering</option>
            <option value="Computer Science & Eng">Computer Science & Eng</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Electronics & Comm">Electronics & Comm</option>
            <option value="Mechanical Eng">Mechanical Eng</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
            <option value="Chemical Engineering">Chemical Engineering</option>
            <option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science</option>
          </select>
        </div>
      </div>

      {/* High-Level Result Segregation Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-1">
          <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider block">Distinction</span>
          <p className="text-2xl font-black text-emerald-300">{distinctionStudents.length}</p>
          <p className="text-[10px] text-emerald-400/80">≥ 75% Marks (Clear)</p>
        </div>

        <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30 space-y-1">
          <span className="text-[11px] text-blue-400 font-bold uppercase tracking-wider block">First Class</span>
          <p className="text-2xl font-black text-blue-300">{firstClassStudents.length}</p>
          <p className="text-[10px] text-blue-400/80">60% – 74% Marks</p>
        </div>

        <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-1">
          <span className="text-[11px] text-purple-400 font-bold uppercase tracking-wider block">Second Class</span>
          <p className="text-2xl font-black text-purple-300">{secondClassStudents.length}</p>
          <p className="text-[10px] text-purple-400/80">50% – 59% Marks</p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 space-y-1">
          <span className="text-[11px] text-amber-400 font-bold uppercase tracking-wider block">Pass Class</span>
          <p className="text-2xl font-black text-amber-300">{passClassStudents.length}</p>
          <p className="text-[10px] text-amber-400/80">40% – 49% Marks</p>
        </div>

        <div className="p-4 rounded-2xl bg-orange-950/40 border border-orange-500/30 space-y-1">
          <span className="text-[11px] text-orange-400 font-bold uppercase tracking-wider block">ATKT (1-2 KT)</span>
          <p className="text-2xl font-black text-orange-300">{atktStudents.length}</p>
          <p className="text-[10px] text-orange-400/80">Allowed To Keep Term</p>
        </div>

        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 space-y-1">
          <span className="text-[11px] text-rose-400 font-bold uppercase tracking-wider block">Failed (&gt;2 KT)</span>
          <p className="text-2xl font-black text-rose-300">{failedStudents.length}</p>
          <p className="text-[10px] text-rose-400/80">Year Down / Re-Exam</p>
        </div>

      </div>

      {/* Class Toppers Hall of Fame Podium */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Official Class Merit Toppers Podium</span>
            </h3>
            <p className="text-xs text-slate-400">Ranked by aggregate semester examination percentage</p>
          </div>

          <button
            onClick={triggerTopperConfetti}
            className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl transition-all shadow-lg"
          >
            <Sparkles className="w-4 h-4" />
            <span>Celebrate Toppers</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {toppers.map((top, idx) => {
            const rankTitles = ['🥇 GOLD MEDALIST (RANK 1)', '🥈 SILVER MEDALIST (RANK 2)', '🥉 BRONZE MEDALIST (RANK 3)'];
            const rankBorders = [
              'border-amber-500/40 bg-amber-500/10 text-amber-300',
              'border-slate-400/40 bg-slate-400/10 text-slate-200',
              'border-amber-700/40 bg-amber-700/10 text-amber-400',
            ];

            return (
              <div key={top.student.id} className={`p-5 rounded-2xl border ${rankBorders[idx]} space-y-3 bg-slate-950 shadow-md relative overflow-hidden`}>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider">{rankTitles[idx]}</span>
                  <span className="text-xs font-mono font-bold">{top.student.rollNumber}</span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-white">{top.student.name}</h4>
                  <p className="text-xs text-slate-400">{top.student.department}</p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between items-center font-mono text-xs">
                  <span>Aggregate: <strong className="text-amber-300 text-sm">{top.avg}%</strong></span>
                  <span>Marks: <strong className="text-emerald-400">{top.totalObtained} / {top.totalMax}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Division Segregation Filter Tabs & Student Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <span>Student Segregation by Academic Result Division</span>
            </h3>
            <p className="text-xs text-slate-400">Select an academic division to inspect segregated candidate list</p>
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto p-1.5 bg-slate-800/80 rounded-xl border border-slate-700/60 text-[11px]">
            <button
              onClick={() => setActiveDivisionTab('ALL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                activeDivisionTab === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              All ({totalAppeared})
            </button>
            <button
              onClick={() => setActiveDivisionTab('FIRST CLASS WITH DISTINCTION')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                activeDivisionTab === 'FIRST CLASS WITH DISTINCTION'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-emerald-400 hover:bg-emerald-500/10'
              }`}
            >
              Distinction ({distinctionStudents.length})
            </button>
            <button
              onClick={() => setActiveDivisionTab('FIRST CLASS')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                activeDivisionTab === 'FIRST CLASS'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-blue-400 hover:bg-blue-500/10'
              }`}
            >
              First Class ({firstClassStudents.length})
            </button>
            <button
              onClick={() => setActiveDivisionTab('SECOND CLASS')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                activeDivisionTab === 'SECOND CLASS'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-purple-400 hover:bg-purple-500/10'
              }`}
            >
              Second Class ({secondClassStudents.length})
            </button>
            <button
              onClick={() => setActiveDivisionTab('PASS CLASS')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                activeDivisionTab === 'PASS CLASS'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-amber-400 hover:bg-amber-500/10'
              }`}
            >
              Pass Class ({passClassStudents.length})
            </button>
            <button
              onClick={() => setActiveDivisionTab('ATKT')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                activeDivisionTab === 'ATKT'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-orange-400 hover:bg-orange-500/10'
              }`}
            >
              ATKT ({atktStudents.length})
            </button>
            <button
              onClick={() => setActiveDivisionTab('FAIL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                activeDivisionTab === 'FAIL'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-rose-400 hover:bg-rose-500/10'
              }`}
            >
              Failed ({failedStudents.length})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold uppercase text-[10px]">
              <tr>
                <th className="p-3">Rank</th>
                <th className="p-3">Roll Number</th>
                <th className="p-3">Student Candidate</th>
                <th className="p-3">Department</th>
                <th className="p-3">Percentage</th>
                <th className="p-3">Result Division</th>
                <th className="p-3">Exam Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {displayedStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-500">
                    No student candidates found under selected division category.
                  </td>
                </tr>
              ) : (
                displayedStudents.map((st, idx) => {
                  const getDivisionBadge = (div: ResultDivision) => {
                    switch (div) {
                      case 'FIRST CLASS WITH DISTINCTION':
                        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
                      case 'FIRST CLASS':
                        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
                      case 'SECOND CLASS':
                        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
                      case 'PASS CLASS':
                        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
                      case 'ATKT':
                        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
                      case 'FAIL':
                        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
                      default:
                        return 'bg-slate-700 text-slate-300';
                    }
                  };

                  return (
                    <tr key={st.student.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono text-slate-400">#{idx + 1}</td>
                      <td className="p-3 font-mono font-bold text-indigo-300">{st.student.rollNumber}</td>
                      <td className="p-3 font-semibold text-white">{st.student.name}</td>
                      <td className="p-3 text-slate-400">{st.student.department}</td>
                      <td className="p-3 font-mono font-bold text-emerald-400">{st.avg}%</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getDivisionBadge(st.division)}`}>
                          {st.division}
                        </span>
                      </td>
                      <td className="p-3">
                        {st.status === 'PASS' ? (
                          <span className="text-emerald-400 font-bold flex items-center space-x-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>CLEAR PASS</span>
                          </span>
                        ) : st.status === 'ATKT' ? (
                          <span className="text-orange-400 font-bold flex items-center space-x-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>ATKT ({st.backlogCount} KT)</span>
                          </span>
                        ) : (
                          <span className="text-rose-400 font-bold flex items-center space-x-1">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>FAIL ({st.backlogCount} KT)</span>
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

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pass vs Fail Ratio Pie Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-2">
              <PieChartIcon className="w-4 h-4" />
              <span>Result Division Breakdown</span>
            </h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={divisionPieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  label={({ name, count }) => `${count}`}
                >
                  {divisionPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC', borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grade Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Subject-Wise Class Average Marks</span>
            </h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectAvgData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="code" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC', borderRadius: '12px' }} />
                <Bar dataKey="average" fill="#6366F1" radius={[6, 6, 0, 0]} name="Avg Marks (100)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Subject Toppers Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <span>Subject-Wise Highest Scorers (Course Toppers)</span>
        </h3>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold uppercase text-[10px]">
              <tr>
                <th className="p-3">Course Code</th>
                <th className="p-3">Course Title</th>
                <th className="p-3">Course Topper Student</th>
                <th className="p-3">Highest Score</th>
                <th className="p-3">Grade Awarded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {subjectToppers.map((st, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40">
                  <td className="p-3 font-mono font-bold text-indigo-300">{st.subject.code}</td>
                  <td className="p-3 font-medium text-white">{st.subject.name}</td>
                  <td className="p-3">
                    {st.topStudent ? (
                      <div>
                        <span className="font-bold text-white">{st.topStudent.name}</span>
                        <span className="text-[10px] font-mono text-slate-400 ml-2">({st.topStudent.rollNumber})</span>
                      </div>
                    ) : (
                      <span className="text-slate-500">No data</span>
                    )}
                  </td>
                  <td className="p-3 font-mono font-bold text-emerald-400">{st.topMarks} / 100</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                      {st.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Backlog & Failed Candidates List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-rose-300 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Failed / KT Candidates & Backlog Summary ({failedStudents.length})</span>
            </h3>
            <p className="text-xs text-slate-400">Students requiring re-examination or remedial assistance</p>
          </div>
        </div>

        {failedStudents.length === 0 ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs text-center font-bold">
            🎉 Excellent! 100% Pass Rate - No students failed in this examination batch.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Roll Number</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Backlog Count</th>
                  <th className="p-3">Failed Courses & Marks</th>
                  <th className="p-3">Remedial Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {failedStudents.map((fs) => (
                  <tr key={fs.student.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-indigo-300">{fs.student.rollNumber}</td>
                    <td className="p-3 font-medium text-white">{fs.student.name}</td>
                    <td className="p-3 text-slate-400">{fs.student.department}</td>
                    <td className="p-3 font-bold text-rose-400">{fs.failedCount} Subjects</td>
                    <td className="p-3">
                      <div className="space-y-1">
                        {fs.failedSubjects.map((fsub, fIdx) => (
                          <span key={fIdx} className="inline-block bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded text-[10px] font-mono mr-1.5">
                            {fsub.code}: {fsub.mark} marks
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-[11px] text-amber-300 font-medium">
                      Re-Exam Scheduled • Extra Tutorial Assigned
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
