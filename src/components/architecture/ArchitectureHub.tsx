import React, { useState } from 'react';
import { SYSTEM_SRS_DOCUMENT, MYSQL_SCHEMA_SQL, JAVA_FILES, JavaCodeFile } from '../../data/javaCodebase';
import {
  Code2,
  FileText,
  Database,
  FolderTree,
  Copy,
  Check,
  Download,
  Layers,
  Table,
  KeyRound,
  FileCode,
  ArrowDown,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Server,
  HelpCircle,
  Box,
  Binary,
  Workflow,
  Sparkles,
  Award,
  BookOpen,
  Terminal,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Shield,
  Gauge,
  HardDrive,
  GitBranch,
  RefreshCw
} from 'lucide-react';

export const ArchitectureHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'FLOW' | 'INSPECTION' | 'JAVA' | 'PATTERNS' | 'OOP' | 'JDBC_FLOW' | 'SRS' | 'ERD' | 'SQL' | 'REQUIREMENTS' | 'VIVA'
  >('FLOW');
  const [selectedJavaIndex, setSelectedJavaIndex] = useState(0);
  const [layerFilter, setLayerFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [expandedSrsSection, setExpandedSrsSection] = useState<number | null>(null);

  const filteredJavaFiles = JAVA_FILES.filter((f) => {
    const matchesLayer = layerFilter === 'ALL' || f.layer === layerFilter;
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.package.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLayer && matchesSearch;
  });

  const activeJavaFile = JAVA_FILES[selectedJavaIndex] || JAVA_FILES[0];

  const handleCopyCode = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCode = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Structured SRS sections
  const srsSections = [
    {
      id: 1,
      title: '1. Introduction',
      content:
        'AcademiaGrade is an academic performance and evaluation management system built with Core Java, Object-Oriented Architecture, and MySQL. It bridges faculty grade book entry, institutional debarment rules, and automated credit-weighted SGPA/CGPA evaluation.'
    },
    {
      id: 2,
      title: '2. Purpose',
      content:
        'To provide an automated, tamper-evident computational engine for continuous in-semester evaluation (ISE-1, ISE-2, ISE-3), automatic Best 2-of-3 drop logic, mandatory 75% attendance threshold verification, and official university transcript generation.'
    },
    {
      id: 3,
      title: '3. Scope',
      content:
        'Covers the full academic lifecycle for students across semesters: student registration, department allocation, faculty subject assignment, marks aggregation, grade point calculation on UGC 10-point scale, and PDF/text report card synthesis.'
    },
    {
      id: 4,
      title: '4. System Architecture',
      content:
        'Implements a classic Multi-Tier MVC + DAO architecture: View (Console CLI & Web UI) -> Controller (Request Routing & Validation) -> Service Layer (Grading Math & Attendance Rules) -> DAO (JDBC PreparedStatement Execution) -> DBConnection (Thread-Safe Singleton) -> MySQL InnoDB Database.'
    },
    {
      id: 5,
      title: '5. Functional Requirements (FR-1 to FR-6)',
      content:
        '• FR-1: Authentication & Role-Based Access Control (Admin, Faculty, Student).\n• FR-2: Student Demographics & Lifecycle Management.\n• FR-3: Faculty Course Assignment & Department Allocation.\n• FR-4: Examination & Grading Engine with Best 2-of-3 ISE drop and 10-point UGC scale.\n• FR-5: Attendance Compliance Module with mandatory 75% cutoff rule.\n• FR-6: Official Grade Card & Transcript Generation with Class Rankings.'
    },
    {
      id: 6,
      title: '6. Non-Functional Requirements (NFR-1 to NFR-10)',
      content:
        '• Reliability: Custom Exception handling for duplicate roll numbers, SQL failures, and mark bounds.\n• Performance: Sub-50ms query latency using B-Tree indexes on student_id, roll_number, and subject_id.\n• Scalability: 3NF Normalized relational schema supporting 100,000+ student marks.\n• Maintainability: Clean code adhering to SOLID principles and DRY guidelines.\n• Security: Parameterized SQL PreparedStatements preventing SQL Injection attacks.'
    },
    {
      id: 7,
      title: '7. Design Patterns',
      content:
        '• MVC Architectural Pattern: Separates View, Controller, Model.\n• DAO Pattern: Decouples database operations from business domain services.\n• Singleton Pattern: DBConnection ensures a single thread-safe JDBC connection.\n• Builder Pattern: ReportCardBuilder constructs multi-section official transcripts.'
    },
    {
      id: 8,
      title: '8. Database Design & Normalization',
      content:
        'Fully normalized 3NF relational database schema with 9 tables (roles, departments, users, faculty, students, subjects, faculty_subjects, exam_marks, attendance), foreign key cascades, and MySQL generated virtual columns.'
    }
  ];

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-2xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800/60">
              JAVA SE 17 + MYSQL 8.0
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/60">
              ACTUAL CODEBASE
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2 mt-2">
            <Code2 className="w-5 h-5 text-indigo-400 shrink-0" />
            <span>Java System Architecture & Developer Suite</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Actual implementation of AcademiaGrade: Model-View-Controller, DAO pattern, Singleton JDBC connection pool, normalized MySQL DDL, and examiner viva prep.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => handleDownloadCode('schema.sql', MYSQL_SCHEMA_SQL)}
            className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-colors shadow-md shadow-indigo-600/30 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span>Export MySQL Schema</span>
          </button>
          <button
            onClick={() => handleDownloadCode('SRS_AcademiaGrade.txt', SYSTEM_SRS_DOCUMENT)}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs px-3 py-2 rounded-xl transition-colors border border-slate-700 whitespace-nowrap"
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span>Export SRS</span>
          </button>
        </div>
      </div>

      {/* Architecture Sub-Navigation Tabs */}
      <div className="border-b border-slate-800 flex space-x-1.5 sm:space-x-2 text-xs font-medium overflow-x-auto whitespace-nowrap pb-2 w-full max-w-full scrollbar-thin">
        
        <button
          onClick={() => setActiveTab('FLOW')}
          className={`px-3 py-2 rounded-xl flex items-center space-x-1.5 transition-colors shrink-0 ${
            activeTab === 'FLOW' ? 'bg-indigo-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Workflow className="w-3.5 h-3.5 shrink-0" />
          <span>1. MVC Architecture Flow</span>
        </button>

        <button
          onClick={() => setActiveTab('INSPECTION')}
          className={`px-3 py-2 rounded-xl flex items-center space-x-1.5 transition-colors shrink-0 ${
            activeTab === 'INSPECTION' ? 'bg-indigo-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5 shrink-0" />
          <span>2. Project Class Map</span>
        </button>

        <button
          onClick={() => setActiveTab('JAVA')}
          className={`px-3 py-2 rounded-xl flex items-center space-x-1.5 transition-colors shrink-0 ${
            activeTab === 'JAVA' ? 'bg-indigo-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <FolderTree className="w-3.5 h-3.5 shrink-0" />
          <span>3. Java Code Explorer ({JAVA_FILES.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('PATTERNS')}
          className={`px-3 py-2 rounded-xl flex items-center space-x-1.5 transition-colors shrink-0 ${
            activeTab === 'PATTERNS' ? 'bg-indigo-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Box className="w-3.5 h-3.5 shrink-0" />
          <span>4. Design Patterns</span>
        </button>

        <button
          onClick={() => setActiveTab('OOP')}
          className={`px-3 py-2 rounded-xl flex items-center space-x-1.5 transition-colors shrink-0 ${
            activeTab === 'OOP' ? 'bg-indigo-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Binary className="w-3.5 h-3.5 shrink-0" />
          <span>5. OOP & SOLID</span>
        </button>

        <button
          onClick={() => setActiveTab('JDBC_FLOW')}
          className={`px-3 py-2 rounded-xl flex items-center space-x-1.5 transition-colors shrink-0 ${
            activeTab === 'JDBC_FLOW' ? 'bg-indigo-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <HardDrive className="w-3.5 h-3.5 shrink-0" />
          <span>6. JDBC + MySQL Flow</span>
        </button>

        <button
          onClick={() => setActiveTab('SRS')}
          className={`px-3 py-2 rounded-xl flex items-center space-x-1.5 transition-colors shrink-0 ${
            activeTab === 'SRS' ? 'bg-indigo-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5 shrink-0" />
          <span>7. SRS Document</span>
        </button>

        <button
          onClick={() => setActiveTab('ERD')}
          className={`px-3 py-2 rounded-xl flex items-center space-x-1.5 transition-colors shrink-0 ${
            activeTab === 'ERD' ? 'bg-indigo-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Database className="w-3.5 h-3.5 shrink-0" />
          <span>8. Normalized ERD (3NF)</span>
        </button>

        <button
          onClick={() => setActiveTab('SQL')}
          className={`px-3 py-2 rounded-xl flex items-center space-x-1.5 transition-colors shrink-0 ${
            activeTab === 'SQL' ? 'bg-indigo-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Table className="w-3.5 h-3.5 shrink-0" />
          <span>9. MySQL DDL</span>
        </button>

        <button
          onClick={() => setActiveTab('REQUIREMENTS')}
          className={`px-3 py-2 rounded-xl flex items-center space-x-1.5 transition-colors shrink-0 ${
            activeTab === 'REQUIREMENTS' ? 'bg-indigo-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Award className="w-3.5 h-3.5 shrink-0" />
          <span>10. FR & NFR</span>
        </button>

        <button
          onClick={() => setActiveTab('VIVA')}
          className={`px-3 py-2 rounded-xl flex items-center space-x-1.5 transition-colors shrink-0 ${
            activeTab === 'VIVA' ? 'bg-amber-600 text-white font-semibold shadow-sm' : 'text-amber-400/80 hover:bg-slate-800 hover:text-amber-300'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 shrink-0" />
          <span>11. Viva Q&A Guide</span>
        </button>

      </div>

      {/* ========================================================================= */}
      {/* TAB 1: VISUAL JAVA MVC ARCHITECTURE FLOW */}
      {/* ========================================================================= */}
      {activeTab === 'FLOW' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Workflow className="w-4 h-4 text-indigo-400" />
                <span>Multi-Tier Architecture & Data Flow Pipeline</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Visual representation of actual request routing, computational business logic, and JDBC persistence across project layers.
              </p>
            </div>

            {/* Visual Architecture Flow Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3 relative items-stretch">
              
              {/* Layer 1: View / Client */}
              <div className="bg-slate-950 border border-indigo-500/40 rounded-xl p-3.5 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">1. View / UI</span>
                  </div>
                  <p className="text-xs font-bold text-white mt-1">Console & Web UI</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Captures user actions & forms</p>
                </div>
                <div className="font-mono text-[10px] text-indigo-300 bg-slate-900/80 p-2 rounded-lg border border-slate-800 space-y-0.5">
                  <div className="font-semibold text-white">ConsoleMenuApp.java</div>
                  <div>ReportCardModal.tsx</div>
                </div>
              </div>

              {/* Layer 2: Controller */}
              <div className="bg-slate-950 border border-blue-500/40 rounded-xl p-3.5 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">2. Controller</span>
                  </div>
                  <p className="text-xs font-bold text-white mt-1">Workflow Routing</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Validates & routes payloads</p>
                </div>
                <div className="font-mono text-[10px] text-blue-300 bg-slate-900/80 p-2 rounded-lg border border-slate-800 space-y-0.5">
                  <div className="font-semibold text-white">StudentController.java</div>
                  <div>GradeController.java</div>
                </div>
              </div>

              {/* Layer 3: Service Layer */}
              <div className="bg-slate-950 border border-emerald-500/40 rounded-xl p-3.5 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">3. Service</span>
                  </div>
                  <p className="text-xs font-bold text-white mt-1">Business Logic</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Best ISE, SGPA, 75% rule</p>
                </div>
                <div className="font-mono text-[10px] text-emerald-300 bg-slate-900/80 p-2 rounded-lg border border-slate-800 space-y-0.5">
                  <div className="font-semibold text-white">GradeCalculatorService.java</div>
                  <div>AttendanceService.java</div>
                </div>
              </div>

              {/* Layer 4: Model */}
              <div className="bg-slate-950 border border-purple-500/40 rounded-xl p-3.5 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">4. Model</span>
                  </div>
                  <p className="text-xs font-bold text-white mt-1">Domain POJOs</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Encapsulated entities</p>
                </div>
                <div className="font-mono text-[10px] text-purple-300 bg-slate-900/80 p-2 rounded-lg border border-slate-800 space-y-0.5">
                  <div className="font-semibold text-white">Student.java</div>
                  <div>ExamMark.java</div>
                  <div>Subject.java</div>
                </div>
              </div>

              {/* Layer 5: DAO */}
              <div className="bg-slate-950 border border-cyan-500/40 rounded-xl p-3.5 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">5. DAO Layer</span>
                  </div>
                  <p className="text-xs font-bold text-white mt-1">Data Access Object</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">PreparedStatement CRUD</p>
                </div>
                <div className="font-mono text-[10px] text-cyan-300 bg-slate-900/80 p-2 rounded-lg border border-slate-800 space-y-0.5">
                  <div className="font-semibold text-white">StudentDAO.java</div>
                  <div>ExamMarkDAO.java</div>
                </div>
              </div>

              {/* Layer 6: JDBC */}
              <div className="bg-slate-950 border border-amber-500/40 rounded-xl p-3.5 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">6. JDBC Pool</span>
                  </div>
                  <p className="text-xs font-bold text-white mt-1">Singleton Pool</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">MySQL Driver Manager</p>
                </div>
                <div className="font-mono text-[10px] text-amber-300 bg-slate-900/80 p-2 rounded-lg border border-slate-800 space-y-0.5">
                  <div className="font-semibold text-white">DBConnection.java</div>
                  <div>(com.mysql.cj.jdbc)</div>
                </div>
              </div>

              {/* Layer 7: MySQL DB */}
              <div className="bg-slate-950 border border-rose-500/40 rounded-xl p-3.5 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">7. MySQL DB</span>
                  </div>
                  <p className="text-xs font-bold text-white mt-1">InnoDB Engine</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">3NF Relational Tables</p>
                </div>
                <div className="font-mono text-[10px] text-rose-300 bg-slate-900/80 p-2 rounded-lg border border-slate-800 space-y-0.5">
                  <div className="font-semibold text-white">students</div>
                  <div>exam_marks</div>
                  <div>attendance</div>
                </div>
              </div>

            </div>

            {/* Step-by-Step Flow Example: Saving Examination Marks */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Concrete Execution Trace: Recording Subject Marks & Generating SGPA</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
                <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/80 space-y-1">
                  <div className="flex items-center space-x-2 text-indigo-300 font-mono font-bold">
                    <span>[Step 1] View / User Input</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Faculty inputs continuous assessment marks: ISE-1 (18), ISE-2 (19), ISE-3 (14), Assignment (9), Practical (19), EndSem (52).
                  </p>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/80 space-y-1">
                  <div className="flex items-center space-x-2 text-blue-300 font-mono font-bold">
                    <span>[Step 2] GradeController.java</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Receives form payload, performs validation, and instantiates an <code className="font-mono text-purple-300">ExamMark</code> model object.
                  </p>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/80 space-y-1">
                  <div className="flex items-center space-x-2 text-emerald-300 font-mono font-bold">
                    <span>[Step 3] GradeCalculatorService.java</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Calculates <code className="font-mono text-emerald-300">calculateBestIse(18, 19, 14) = 18.50</code> (drops lowest 14), scales EndSem (43.33), computes total <strong>89.83</strong>, assigns grade <strong>A+</strong> (9.0 GP).
                  </p>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/80 space-y-1">
                  <div className="flex items-center space-x-2 text-cyan-300 font-mono font-bold">
                    <span>[Step 4] ExamMarkDAO.java</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Invokes <code className="font-mono text-cyan-300">saveOrUpdateMark(mark)</code>, builds SQL query with parameter markers (<code className="text-amber-300">?</code>) to prevent SQL Injection.
                  </p>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/80 space-y-1">
                  <div className="flex items-center space-x-2 text-amber-300 font-mono font-bold">
                    <span>[Step 5] DBConnection.java</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Retrieves thread-safe connection via <code className="font-mono text-amber-300">DBConnection.getConnection()</code> from MySQL Driver Manager.
                  </p>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/80 space-y-1">
                  <div className="flex items-center space-x-2 text-rose-300 font-mono font-bold">
                    <span>[Step 6] MySQL InnoDB Engine</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Executes <code className="font-mono text-rose-300">INSERT INTO exam_marks ... ON DUPLICATE KEY UPDATE</code> with full ACID transaction safety.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ACTUAL PROJECT CLASS INSPECTION MAP */}
      {/* ========================================================================= */}
      {activeTab === 'INSPECTION' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Actual Java Implementation Class Directory</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Verified classes active in the AcademiaGrade codebase categorized by architectural layer.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              {/* MODEL Classes */}
              <div className="bg-slate-950 border border-purple-500/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-purple-400 font-mono flex items-center space-x-1.5">
                    <FileCode className="w-4 h-4" />
                    <span>MODEL LAYER</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300">3 Classes</span>
                </div>
                
                <div className="space-y-2 font-mono text-[11px]">
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="text-white font-bold">Student.java</div>
                    <div className="text-purple-300 text-[10px]">com.academic.gradebook.model</div>
                    <div className="text-slate-400 text-[10px] mt-1 font-sans">
                      Encapsulates candidate identity, roll number, academic department, semester, and guardian details.
                    </div>
                    <div className="text-[10px] text-emerald-400 mt-1">
                      Methods: getStudentId(), getRollNumber(), setSemester(), toString()
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="text-white font-bold">ExamMark.java</div>
                    <div className="text-purple-300 text-[10px]">com.academic.gradebook.model</div>
                    <div className="text-slate-400 text-[10px] mt-1 font-sans">
                      Holds multi-component continuous evaluation marks (ISE-1, ISE-2, ISE-3, Assignment, Practical, EndSem).
                    </div>
                    <div className="text-[10px] text-emerald-400 mt-1">
                      Methods: getCalculatedBestIse(), getTotalMarks(), getGrade(), setPassed()
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="text-white font-bold">Subject.java</div>
                    <div className="text-purple-300 text-[10px]">com.academic.gradebook.model</div>
                    <div className="text-slate-400 text-[10px] mt-1 font-sans">
                      Holds curriculum metadata, credit weights, and evaluation thresholds.
                    </div>
                    <div className="text-[10px] text-emerald-400 mt-1">
                      Methods: getSubjectCode(), getCredits(), getMaxEndSemMarks()
                    </div>
                  </div>
                </div>
              </div>

              {/* CONTROLLER Classes */}
              <div className="bg-slate-950 border border-blue-500/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-blue-400 font-mono flex items-center space-x-1.5">
                    <FileCode className="w-4 h-4" />
                    <span>CONTROLLER LAYER</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300">2 Classes</span>
                </div>
                
                <div className="space-y-2 font-mono text-[11px]">
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="text-white font-bold">StudentController.java</div>
                    <div className="text-blue-300 text-[10px]">com.academic.gradebook.controller</div>
                    <div className="text-slate-400 text-[10px] mt-1 font-sans">
                      Handles student registration requests, validates inputs, and coordinates with StudentDAO.
                    </div>
                    <div className="text-[10px] text-emerald-400 mt-1">
                      Methods: registerStudent(Student), fetchAllStudents()
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="text-white font-bold">GradeController.java</div>
                    <div className="text-blue-300 text-[10px]">com.academic.gradebook.controller</div>
                    <div className="text-slate-400 text-[10px] mt-1 font-sans">
                      Coordinates continuous marks entry, triggers GradeCalculatorService, and invokes ExamMarkDAO.
                    </div>
                    <div className="text-[10px] text-emerald-400 mt-1">
                      Methods: recordSubjectMarks(ExamMark)
                    </div>
                  </div>
                </div>
              </div>

              {/* SERVICE Classes */}
              <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-emerald-400 font-mono flex items-center space-x-1.5">
                    <FileCode className="w-4 h-4" />
                    <span>SERVICE LAYER (BUSINESS LOGIC)</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300">2 Classes</span>
                </div>
                
                <div className="space-y-2 font-mono text-[11px]">
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="text-white font-bold">GradeCalculatorService.java</div>
                    <div className="text-emerald-300 text-[10px]">com.academic.gradebook.service</div>
                    <div className="text-slate-400 text-[10px] mt-1 font-sans">
                      Evaluates Best 2-of-3 ISE average, UGC 10-point grades, EndSem cutoffs, and credit-weighted SGPA/CGPA.
                    </div>
                    <div className="text-[10px] text-indigo-400 mt-1">
                      Methods: calculateBestIse(), computeFullSubjectMark(), calculateSGPA()
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="text-white font-bold">AttendanceService.java</div>
                    <div className="text-emerald-300 text-[10px]">com.academic.gradebook.service</div>
                    <div className="text-slate-400 text-[10px] mt-1 font-sans">
                      Evaluates mandatory ≥75% examination eligibility rule and calculates shortfall lectures.
                    </div>
                    <div className="text-[10px] text-indigo-400 mt-1">
                      Methods: calculatePercentage(), isEligibleForExams(), calculateShortfallLectures()
                    </div>
                  </div>
                </div>
              </div>

              {/* DAO Classes */}
              <div className="bg-slate-950 border border-cyan-500/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-cyan-400 font-mono flex items-center space-x-1.5">
                    <FileCode className="w-4 h-4" />
                    <span>DAO LAYER (DATA ACCESS)</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300">2 Classes</span>
                </div>
                
                <div className="space-y-2 font-mono text-[11px]">
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="text-white font-bold">StudentDAO.java</div>
                    <div className="text-cyan-300 text-[10px]">com.academic.gradebook.dao</div>
                    <div className="text-slate-400 text-[10px] mt-1 font-sans">
                      Executes parameterized JDBC SQL queries to persist and retrieve student demographic records.
                    </div>
                    <div className="text-[10px] text-emerald-400 mt-1">
                      Methods: addStudent(Student), getAllStudents()
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="text-white font-bold">ExamMarkDAO.java</div>
                    <div className="text-cyan-300 text-[10px]">com.academic.gradebook.dao</div>
                    <div className="text-slate-400 text-[10px] mt-1 font-sans">
                      Executes SQL upsert queries (ON DUPLICATE KEY UPDATE) for marks persistence in MySQL.
                    </div>
                    <div className="text-[10px] text-emerald-400 mt-1">
                      Methods: saveOrUpdateMark(ExamMark), getMarksByStudent(studentId)
                    </div>
                  </div>
                </div>
              </div>

              {/* JDBC & DESIGN PATTERNS / UTILITY */}
              <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-4 space-y-3 md:col-span-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-amber-400 font-mono flex items-center space-x-1.5">
                    <FileCode className="w-4 h-4" />
                    <span>DATABASE / JDBC & DESIGN PATTERN / UTILITY</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300">3 Classes</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-[11px]">
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="text-white font-bold">DBConnection.java</div>
                    <div className="text-amber-300 text-[10px]">com.academic.gradebook.database</div>
                    <div className="text-slate-400 text-[10px] mt-1 font-sans">
                      Thread-safe Singleton managing MySQL connection pool and JDBC driver registration.
                    </div>
                    <div className="text-[10px] text-emerald-400 mt-1">
                      Methods: getConnection(), closeConnection()
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="text-white font-bold">ReportCardBuilder.java</div>
                    <div className="text-purple-300 text-[10px]">com.academic.gradebook.pattern</div>
                    <div className="text-slate-400 text-[10px] mt-1 font-sans">
                      GoF Builder Pattern constructing comprehensive multi-part grade transcripts fluently.
                    </div>
                    <div className="text-[10px] text-emerald-400 mt-1">
                      Methods: forStudent(), withAcademicData(), buildOfficialTextTranscript()
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="text-white font-bold">ConsoleMenuApp.java</div>
                    <div className="text-indigo-300 text-[10px]">com.academic.gradebook.ui</div>
                    <div className="text-slate-400 text-[10px] mt-1 font-sans">
                      Menu-driven Console Application for command-line execution and examiner demonstration.
                    </div>
                    <div className="text-[10px] text-emerald-400 mt-1">
                      Methods: main(), handleLogin(), calculateIseInteractive()
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: JAVA MVC CODE EXPLORER */}
      {/* ========================================================================= */}
      {activeTab === 'JAVA' && (
        <div className="space-y-4">
          
          {/* Controls: Search & Layer Filter Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
              <span className="text-slate-400 text-[11px] uppercase font-semibold shrink-0 mr-1">Layer:</span>
              {['ALL', 'MODEL', 'CONTROLLER', 'SERVICE', 'DAO', 'JDBC', 'PATTERN', 'UI'].map((layer) => (
                <button
                  key={layer}
                  onClick={() => setLayerFilter(layer)}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-colors shrink-0 ${
                    layerFilter === layer
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {layer}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search class or method..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* File Tree Sidebar */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-2 flex justify-between">
                <span>Java Source Classes</span>
                <span className="font-mono text-indigo-400">{filteredJavaFiles.length} Matches</span>
              </h3>
              <div className="space-y-1.5 max-h-[560px] overflow-y-auto pr-1">
                {filteredJavaFiles.map((file) => {
                  const globalIdx = JAVA_FILES.findIndex((f) => f.path === file.path);
                  const isSelected = selectedJavaIndex === globalIdx;
                  return (
                    <button
                      key={file.path}
                      onClick={() => setSelectedJavaIndex(globalIdx)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex flex-col space-y-1 transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-2 truncate">
                          <FileCode className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate font-mono">{file.name}</span>
                        </div>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ${
                          file.layer === 'SERVICE' ? 'bg-emerald-950 text-emerald-300' :
                          file.layer === 'DAO' ? 'bg-cyan-950 text-cyan-300' :
                          file.layer === 'MODEL' ? 'bg-purple-950 text-purple-300' :
                          file.layer === 'CONTROLLER' ? 'bg-blue-950 text-blue-300' :
                          file.layer === 'JDBC' ? 'bg-amber-950 text-amber-300' :
                          file.layer === 'PATTERN' ? 'bg-fuchsia-950 text-fuchsia-300' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {file.layer}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 truncate opacity-80">{file.package}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Code Viewer Panel */}
            <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-mono text-sm font-bold text-indigo-300">{activeJavaFile.name}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60 font-bold">
                      {activeJavaFile.layer} LAYER
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">{activeJavaFile.path}</p>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleCopyCode(activeJavaFile.code)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono flex items-center space-x-1 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                  <button
                    onClick={() => handleDownloadCode(activeJavaFile.name, activeJavaFile.code)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-mono flex items-center space-x-1 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="font-bold text-indigo-400 uppercase text-[10px] block mb-1">Class Responsibility & Purpose:</span>
                {activeJavaFile.description}
              </div>

              <pre className="font-mono text-xs text-indigo-200 leading-relaxed whitespace-pre bg-slate-950 p-4 sm:p-6 rounded-xl border border-slate-800 overflow-x-auto max-h-[520px]">
                {activeJavaFile.code}
              </pre>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: DESIGN PATTERNS APPLIED */}
      {/* ========================================================================= */}
      {activeTab === 'PATTERNS' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Box className="w-4 h-4 text-indigo-400" />
                <span>Actual Design Patterns Implemented in AcademiaGrade</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Verified architectural and GoF creational/structural patterns active in the Java codebase.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              {/* Pattern 1: MVC */}
              <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-300 text-sm">1. Model-View-Controller (MVC) Pattern</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300">Architectural</span>
                </div>
                <p className="text-slate-300">
                  Separates application state (Models), UI rendering (Views), and workflow/request orchestration (Controllers).
                </p>
                <div className="font-mono text-[11px] text-slate-400 pt-1 border-t border-slate-800 space-y-0.5">
                  <div><span className="text-indigo-400">Model:</span> Student.java, ExamMark.java, Subject.java</div>
                  <div><span className="text-blue-400">Controller:</span> StudentController.java, GradeController.java</div>
                  <div><span className="text-emerald-400">View:</span> ConsoleMenuApp.java, ReportCardModal.tsx</div>
                </div>
              </div>

              {/* Pattern 2: DAO */}
              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-300 text-sm">2. Data Access Object (DAO) Pattern</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300">Structural</span>
                </div>
                <p className="text-slate-300">
                  Abstracts and encapsulates all access to the MySQL database. Business services never write raw SQL queries directly.
                </p>
                <div className="font-mono text-[11px] text-slate-400 pt-1 border-t border-slate-800 space-y-0.5">
                  <div><span className="text-cyan-400">Classes:</span> StudentDAO.java, ExamMarkDAO.java</div>
                  <div><span className="text-slate-300">Benefit:</span> Clean separation of SQL persistence from business grading logic.</div>
                </div>
              </div>

              {/* Pattern 3: Singleton */}
              <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300 text-sm">3. Singleton Pattern</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300">Creational</span>
                </div>
                <p className="text-slate-300">
                  Ensures only a single, thread-safe instance of the JDBC MySQL Connection manager exists throughout the JVM lifecycle.
                </p>
                <div className="font-mono text-[11px] text-slate-400 pt-1 border-t border-slate-800 space-y-0.5">
                  <div><span className="text-amber-400">Class:</span> DBConnection.java</div>
                  <div><span className="text-slate-300">Implementation:</span> Private constructor + <code className="text-amber-300">synchronized getConnection()</code>.</div>
                </div>
              </div>

              {/* Pattern 4: Builder */}
              <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-300 text-sm">4. Builder Pattern</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300">Creational</span>
                </div>
                <p className="text-slate-300">
                  Constructs complex, multi-tiered official Grade Cards step-by-step with candidate demographics, subject marks, SGPA, and signature blocks.
                </p>
                <div className="font-mono text-[11px] text-slate-400 pt-1 border-t border-slate-800 space-y-0.5">
                  <div><span className="text-purple-400">Class:</span> ReportCardBuilder.java</div>
                  <div><span className="text-slate-300">Benefit:</span> Fluent API without telescoping constructor antipattern.</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: OOP & SOLID PRINCIPLES */}
      {/* ========================================================================= */}
      {activeTab === 'OOP' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Binary className="w-4 h-4 text-indigo-400" />
                <span>OOP Concepts & SOLID Principles in AcademiaGrade</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Concrete source code evidence showing how Object-Oriented paradigms are applied.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              {/* Encapsulation */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-indigo-300 text-sm block">1. Encapsulation (Data Hiding)</span>
                <p className="text-slate-300">
                  Entity variables are marked <code className="text-indigo-400 font-mono">private</code> and accessed exclusively through type-safe public getter and setter methods.
                </p>
                <div className="p-2.5 rounded-lg bg-slate-900 font-mono text-[11px] text-slate-400 border border-slate-800 space-y-1">
                  <div className="text-purple-300">// In Student.java</div>
                  <div><code className="text-indigo-300">private String rollNumber;</code></div>
                  <div><code className="text-emerald-400">public String getRollNumber() &#123; return rollNumber; &#125;</code></div>
                  <div><code className="text-emerald-400">public void setRollNumber(String rollNumber) &#123; this.rollNumber = rollNumber; &#125;</code></div>
                </div>
              </div>

              {/* Abstraction */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-indigo-300 text-sm block">2. Abstraction & Decoupling</span>
                <p className="text-slate-300">
                  The Service layer exposes clear business interfaces (<code className="font-mono text-emerald-300">computeFullSubjectMark</code>, <code className="font-mono text-emerald-300">calculateSGPA</code>), hiding complex calculations and SQL queries.
                </p>
                <div className="p-2.5 rounded-lg bg-slate-900 font-mono text-[11px] text-slate-400 border border-slate-800 space-y-1">
                  <div className="text-blue-300">// In GradeController.java</div>
                  <div><code className="text-cyan-300">gradeService.computeFullSubjectMark(mark);</code></div>
                  <div><code className="text-slate-500">// Controller does not know sorting/scaling internals</code></div>
                </div>
              </div>

              {/* Single Responsibility Principle */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-indigo-300 text-sm block">3. Single Responsibility Principle (SRP)</span>
                <p className="text-slate-300">
                  Each class has a single, well-defined reason to change:
                </p>
                <div className="p-2.5 rounded-lg bg-slate-900 font-mono text-[11px] text-slate-300 border border-slate-800 space-y-1">
                  <div>• <code className="text-purple-300">StudentDAO</code>: Database persistence only</div>
                  <div>• <code className="text-emerald-300">GradeCalculatorService</code>: Grading calculations only</div>
                  <div>• <code className="text-amber-300">DBConnection</code>: JDBC connection pooling only</div>
                </div>
              </div>

              {/* Separation of Concerns */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-indigo-300 text-sm block">4. Separation of Concerns (SoC)</span>
                <p className="text-slate-300">
                  Strict layer isolation prevents leakage: Controllers do not execute SQL queries; DAOs do not apply 75% attendance rules; Views only display formatted data.
                </p>
                <div className="p-2.5 rounded-lg bg-slate-900 font-mono text-[11px] text-slate-300 border border-slate-800">
                  <div className="text-emerald-400">View &harr; Controller &harr; Service &harr; DAO &harr; MySQL</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: JDBC + MYSQL FLOW */}
      {/* ========================================================================= */}
      {activeTab === 'JDBC_FLOW' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <HardDrive className="w-4 h-4 text-amber-400" />
                <span>How Java Connects to MySQL (JDBC Execution Pipeline)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Detailed step-by-step communication pipeline answering: &quot;How does your Java application communicate with MySQL?&quot;
              </p>
            </div>

            {/* Step-by-Step JDBC Flow Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              
              <div className="p-3.5 bg-slate-950 rounded-xl border border-indigo-500/30 space-y-2">
                <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase">1. Driver Loading</span>
                <div className="font-mono text-xs font-bold text-white">Class.forName()</div>
                <p className="text-[11px] text-slate-400">
                  Loads <code className="text-indigo-300 font-mono">com.mysql.cj.jdbc.Driver</code> into the JVM runtime classpath.
                </p>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-amber-500/30 space-y-2">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">2. Connection Pool</span>
                <div className="font-mono text-xs font-bold text-white">DriverManager</div>
                <p className="text-[11px] text-slate-400">
                  <code className="text-amber-300 font-mono">DBConnection.getConnection()</code> initiates TCP/IP socket to <code className="text-slate-300">localhost:3306</code>.
                </p>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-cyan-500/30 space-y-2">
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">3. Prepared Query</span>
                <div className="font-mono text-xs font-bold text-white">PreparedStatement</div>
                <p className="text-[11px] text-slate-400">
                  Compiles SQL statement with parameter placeholders (<code className="text-cyan-300">?</code>) protecting against injection.
                </p>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-rose-500/30 space-y-2">
                <span className="text-[10px] font-mono font-bold text-rose-400 uppercase">4. MySQL Execution</span>
                <div className="font-mono text-xs font-bold text-white">InnoDB Engine</div>
                <p className="text-[11px] text-slate-400">
                  MySQL executes query, validates constraints, and commits transaction within ACID boundaries.
                </p>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-emerald-500/30 space-y-2">
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">5. ResultSet Mapping</span>
                <div className="font-mono text-xs font-bold text-white">POJO Extraction</div>
                <p className="text-[11px] text-slate-400">
                  DAO iterates <code className="text-emerald-300 font-mono">rs.next()</code>, extracts typed columns, and builds Model objects.
                </p>
              </div>

            </div>

            {/* Concrete JDBC Code Example */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Terminal className="w-3.5 h-3.5" />
                <span>Actual JDBC Code Snippet (from StudentDAO.java &amp; DBConnection.java)</span>
              </h4>
              
              <pre className="font-mono text-xs text-amber-200/90 leading-relaxed whitespace-pre bg-slate-900 p-4 rounded-xl border border-slate-800 overflow-x-auto">
{`// 1. Obtain connection from Singleton Pool
try (Connection conn = DBConnection.getConnection();
     PreparedStatement stmt = conn.prepareStatement(
         "SELECT s.*, d.dept_name FROM students s JOIN departments d ON s.dept_id = d.dept_id WHERE s.semester = ?")) {

    // 2. Bind parameter to placeholder
    stmt.setInt(1, currentSemester);

    // 3. Execute query and iterate ResultSet
    try (ResultSet rs = stmt.executeQuery()) {
        while (rs.next()) {
            Student s = new Student();
            s.setStudentId(rs.getString("student_id"));
            s.setRollNumber(rs.getString("roll_number"));
            s.setName(rs.getString("name"));
            s.setDepartment(rs.getString("dept_name"));
            s.setSemester(rs.getInt("semester"));
            studentList.add(s);
        }
    }
} // Auto-closes Connection, PreparedStatement, and ResultSet via try-with-resources`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: SOFTWARE REQUIREMENTS SPECIFICATION (SRS) */}
      {/* ========================================================================= */}
      {activeTab === 'SRS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Software Requirement Specification (SRS)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Organized into 8 formal engineering specification modules.
              </p>
            </div>
            <button
              onClick={() => handleDownloadCode('SRS_AcademiaGrade.txt', SYSTEM_SRS_DOCUMENT)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 self-start sm:self-auto"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Raw SRS</span>
            </button>
          </div>

          {/* Structured SRS Panels */}
          <div className="space-y-3">
            {srsSections.map((sec) => (
              <div key={sec.id} className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedSrsSection(expandedSrsSection === sec.id ? null : sec.id)}
                  className="w-full text-left p-3.5 flex items-center justify-between hover:bg-slate-900/60 transition-colors"
                >
                  <span className="font-bold text-xs text-indigo-300 font-mono">{sec.title}</span>
                  {expandedSrsSection === sec.id ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                {expandedSrsSection === sec.id && (
                  <div className="p-4 pt-0 text-xs text-slate-300 leading-relaxed border-t border-slate-900 font-mono whitespace-pre-wrap">
                    {sec.content}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Raw Document View */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Full IEEE SRS Plaintext:</span>
            <pre className="font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-950 p-4 sm:p-6 rounded-xl border border-slate-800 max-h-[400px] overflow-y-auto">
              {SYSTEM_SRS_DOCUMENT}
            </pre>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: NORMALIZED ER DIAGRAM */}
      {/* ========================================================================= */}
      {activeTab === 'ERD' && (
        <div className="space-y-6">
          <div className="p-4 sm:p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center space-x-2">
                <Database className="w-4 h-4 text-indigo-400" />
                <span>Relational Entity Relationship Diagram (3NF Normalized Schema)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                9 normalized relational tables in MySQL InnoDB with explicit Primary Keys (PK), Foreign Keys (FK), Unique Constraints (UQ), and Generated Columns.
              </p>
            </div>

            {/* ERD Nodes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              
              {/* Entity: Students */}
              <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/30 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-indigo-300 flex items-center space-x-1">
                    <Table className="w-3.5 h-3.5" />
                    <span>students</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">InnoDB</span>
                </div>
                <div className="space-y-1 font-mono text-[11px] text-slate-300">
                  <div className="flex justify-between text-amber-400 font-bold">
                    <span>student_id</span>
                    <span>VARCHAR(20) [PK]</span>
                  </div>
                  <div className="flex justify-between text-indigo-300 font-bold">
                    <span>roll_number</span>
                    <span>VARCHAR(30) [UQ]</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>name</span>
                    <span>VARCHAR(100)</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>email</span>
                    <span>VARCHAR(100) [UQ]</span>
                  </div>
                  <div className="flex justify-between text-blue-400">
                    <span>dept_id</span>
                    <span>INT [FK]</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>semester</span>
                    <span>INT (1-8)</span>
                  </div>
                </div>
              </div>

              {/* Entity: Exam Marks */}
              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-emerald-300 flex items-center space-x-1">
                    <Table className="w-3.5 h-3.5" />
                    <span>exam_marks</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">InnoDB</span>
                </div>
                <div className="space-y-1 font-mono text-[11px] text-slate-300">
                  <div className="flex justify-between text-amber-400 font-bold">
                    <span>mark_id</span>
                    <span>INT [PK, AI]</span>
                  </div>
                  <div className="flex justify-between text-blue-400 font-bold">
                    <span>student_id</span>
                    <span>VARCHAR(20) [FK]</span>
                  </div>
                  <div className="flex justify-between text-blue-400 font-bold">
                    <span>subject_id</span>
                    <span>VARCHAR(20) [FK]</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>ise1, ise2, ise3</span>
                    <span>DECIMAL(5,2)</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>calculated_best_ise</span>
                    <span>GENERATED</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>end_sem, total</span>
                    <span>DECIMAL(5,2)</span>
                  </div>
                </div>
              </div>

              {/* Entity: Attendance */}
              <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-amber-300 flex items-center space-x-1">
                    <Table className="w-3.5 h-3.5" />
                    <span>attendance</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">InnoDB</span>
                </div>
                <div className="space-y-1 font-mono text-[11px] text-slate-300">
                  <div className="flex justify-between text-amber-400 font-bold">
                    <span>attendance_id</span>
                    <span>INT [PK, AI]</span>
                  </div>
                  <div className="flex justify-between text-blue-400">
                    <span>student_id</span>
                    <span>VARCHAR(20) [FK]</span>
                  </div>
                  <div className="flex justify-between text-blue-400">
                    <span>subject_id</span>
                    <span>VARCHAR(20) [FK]</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>total_lectures</span>
                    <span>INT</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>attended_lectures</span>
                    <span>INT</span>
                  </div>
                  <div className="flex justify-between text-amber-400 font-bold">
                    <span>is_eligible</span>
                    <span>GENERATED (&ge;75%)</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Relationship Explanations */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="font-bold text-xs text-indigo-300 uppercase tracking-wider block">Key Relational Cardinalities:</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-400">
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                  <strong className="text-white">departments &rarr; students (1:N)</strong>
                  <p className="mt-0.5">One department has multiple enrolled students; student belongs to exactly one department.</p>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                  <strong className="text-white">students &harr; subjects (N:M via marks)</strong>
                  <p className="mt-0.5">Bridged by <code className="text-indigo-300">exam_marks</code> junction storing continuous component scores.</p>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                  <strong className="text-white">faculty &harr; subjects (N:M)</strong>
                  <p className="mt-0.5">Bridged by <code className="text-indigo-300">faculty_subjects</code> for departmental subject assignment.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 9: MYSQL DDL SCHEMA */}
      {/* ========================================================================= */}
      {activeTab === 'SQL' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <div>
              <span className="text-xs font-mono text-indigo-400 font-bold">academia_gradebook_schema.sql</span>
              <p className="text-[11px] text-slate-400">MySQL 8.0 InnoDB Script with Generated Columns and B-Tree Indexes</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleCopyCode(MYSQL_SCHEMA_SQL)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono flex items-center space-x-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy SQL'}</span>
              </button>
              <button
                onClick={() => handleDownloadCode('schema.sql', MYSQL_SCHEMA_SQL)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-mono flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .sql</span>
              </button>
            </div>
          </div>
          <pre className="font-mono text-xs text-indigo-300 leading-relaxed whitespace-pre bg-slate-950 p-4 sm:p-6 rounded-xl border border-slate-800 overflow-x-auto max-h-[600px]">
            {MYSQL_SCHEMA_SQL}
          </pre>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 10: FUNCTIONAL & NON-FUNCTIONAL REQUIREMENTS */}
      {/* ========================================================================= */}
      {activeTab === 'REQUIREMENTS' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-6">
            
            {/* Functional Requirements */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Functional Requirements (FR-1 to FR-6)</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-bold text-indigo-300 font-mono">FR-1: Authentication &amp; RBAC</span>
                  <p className="text-slate-400 leading-relaxed">
                    Secure role-based access for Admin, Faculty, and Student users with isolated route permissions.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-bold text-indigo-300 font-mono">FR-2: Student Lifecycle Management</span>
                  <p className="text-slate-400 leading-relaxed">
                    Full CRUD operations, roll number indexing, guardian demographic logging, and semester progression.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-bold text-indigo-300 font-mono">FR-3: Faculty &amp; Subject Allocation</span>
                  <p className="text-slate-400 leading-relaxed">
                    Dynamic assignment of instructors to departmental subjects and semesters via junction table.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-bold text-indigo-300 font-mono">FR-4: Examination &amp; Grading Engine</span>
                  <p className="text-slate-400 leading-relaxed">
                    Automated Best 2-of-3 ISE calculation, scaled EndSem totals, 10-point UGC grade mapping, and credit-weighted SGPA/CGPA.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-bold text-indigo-300 font-mono">FR-5: Attendance Compliance</span>
                  <p className="text-slate-400 leading-relaxed">
                    Mandatory 75% institutional attendance rule verification with automatic debarment flags and shortfall lecture calculation.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-bold text-indigo-300 font-mono">FR-6: Official Report Card Synthesis</span>
                  <p className="text-slate-400 leading-relaxed">
                    Printable transcripts with subject breakdown, SGPA, CGPA, class rank, and institutional validation blocks.
                  </p>
                </div>
              </div>
            </div>

            {/* Non-Functional Requirements */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Non-Functional Requirements (NFR)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="font-bold text-indigo-300 block mb-1">Reliability &amp; Exception Safety</span>
                  <p className="text-slate-400">Custom exception handlers prevent JVM crashes on duplicate keys or database drops.</p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="font-bold text-indigo-300 block mb-1">Performance &amp; Latency</span>
                  <p className="text-slate-400">Sub-50ms query response time using B-Tree indexing on primary and foreign keys.</p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="font-bold text-indigo-300 block mb-1">Scalability</span>
                  <p className="text-slate-400">Normalized 3NF relational schema capable of storing 100,000+ student mark records.</p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="font-bold text-indigo-300 block mb-1">Maintainability &amp; SOLID</span>
                  <p className="text-slate-400">Modular design ensures classes have single responsibilities and low coupling.</p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="font-bold text-indigo-300 block mb-1">Security</span>
                  <p className="text-slate-400">Parameterized PreparedStatements prevent SQL injection; RBAC prevents privilege escalation.</p>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="font-bold text-indigo-300 block mb-1">Platform Independence</span>
                  <p className="text-slate-400">Runs across Windows, Linux, and macOS via standard Java Virtual Machine (JVM).</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 11: VIVA Q&A PREPARATION GUIDE */}
      {/* ========================================================================= */}
      {activeTab === 'VIVA' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
              <HelpCircle className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Examiner Viva Q&amp;A Cheat-Sheet (11 Questions &amp; Answers)</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <span className="font-bold text-amber-300 font-mono">Q1. Why did you choose Java for this project?</span>
                <p className="text-slate-300 leading-relaxed font-sans">
                  Java provides platform independence (JVM), strong compile-time type safety, robust exception handling, and enterprise-standard JDBC connectivity for ACID-compliant MySQL operations.
                </p>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <span className="font-bold text-amber-300 font-mono">Q2. What is MVC and where is it used in your project?</span>
                <p className="text-slate-300 leading-relaxed font-sans">
                  MVC separates Data (<code className="text-indigo-300">Student.java</code>, <code className="text-indigo-300">ExamMark.java</code>), Request Routing (<code className="text-blue-300">GradeController.java</code>), and Presentation (<code className="text-emerald-300">ConsoleMenuApp.java</code>), eliminating business logic leakage into UI screens.
                </p>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <span className="font-bold text-amber-300 font-mono">Q3. What is DAO (Data Access Object)?</span>
                <p className="text-slate-300 leading-relaxed font-sans">
                  DAO (<code className="text-cyan-300">StudentDAO.java</code>, <code className="text-cyan-300">ExamMarkDAO.java</code>) encapsulates all JDBC SQL queries (<code className="text-slate-400">PreparedStatement</code>, <code className="text-slate-400">ResultSet</code>), completely isolating the Service layer from database queries.
                </p>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <span className="font-bold text-amber-300 font-mono">Q4. Why did you use JDBC?</span>
                <p className="text-slate-300 leading-relaxed font-sans">
                  JDBC (Java Database Connectivity) provides a standard API for Java applications to execute SQL queries, manage transactions, and retrieve tabular ResultSet data from relational databases.
                </p>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <span className="font-bold text-amber-300 font-mono">Q5. How does Java connect to MySQL?</span>
                <p className="text-slate-300 leading-relaxed font-sans">
                  Via the JDBC Driver (<code className="text-amber-300 font-mono">com.mysql.cj.jdbc.Driver</code>) managed through the thread-safe Singleton <code className="text-amber-300 font-mono">DBConnection.getConnection()</code> which connects to MySQL on port 3306.
                </p>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <span className="font-bold text-amber-300 font-mono">Q6. Where is business logic written?</span>
                <p className="text-slate-300 leading-relaxed font-sans">
                  Exclusively in the Service Layer: <code className="text-emerald-300 font-mono">GradeCalculatorService.java</code> for Best 2-of-3 ISE drop logic &amp; SGPA math, and <code className="text-emerald-300 font-mono">AttendanceService.java</code> for 75% examination compliance.
                </p>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <span className="font-bold text-amber-300 font-mono">Q7. Where are database operations performed?</span>
                <p className="text-slate-300 leading-relaxed font-sans">
                  Exclusively in the DAO layer (<code className="text-cyan-300 font-mono">StudentDAO</code>, <code className="text-cyan-300 font-mono">ExamMarkDAO</code>). Neither Controllers nor Models execute SQL.
                </p>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <span className="font-bold text-amber-300 font-mono">Q8. Where is OOP used in the code?</span>
                <p className="text-slate-300 leading-relaxed font-sans">
                  • <strong>Encapsulation:</strong> Private fields and public getters/setters in <code className="text-purple-300">Student.java</code>.<br />
                  • <strong>Abstraction:</strong> High-level Service APIs hiding math formulas.<br />
                  • <strong>Single Responsibility:</strong> DAOs only persist data, Services only compute logic.
                </p>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <span className="font-bold text-amber-300 font-mono">Q9. Which design patterns are actually implemented?</span>
                <p className="text-slate-300 leading-relaxed font-sans">
                  1. <strong>Singleton:</strong> <code className="text-amber-300">DBConnection.java</code> for shared connection.<br />
                  2. <strong>DAO Pattern:</strong> <code className="text-cyan-300">StudentDAO.java</code> &amp; <code className="text-cyan-300">ExamMarkDAO.java</code>.<br />
                  3. <strong>Builder Pattern:</strong> <code className="text-purple-300">ReportCardBuilder.java</code>.<br />
                  4. <strong>MVC:</strong> Architectural layer separation.
                </p>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <span className="font-bold text-amber-300 font-mono">Q10. How does data flow through the system?</span>
                <p className="text-slate-300 leading-relaxed font-sans">
                  User/View &rarr; Controller &rarr; Service (computes rules) &rarr; DAO (binds parameters) &rarr; JDBC (executes SQL) &rarr; MySQL InnoDB (stores data) &rarr; ResultSet mapped back to Model.
                </p>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 md:col-span-2">
                <span className="font-bold text-amber-300 font-mono">Q11. What should you show the examiner during viva?</span>
                <p className="text-slate-300 leading-relaxed font-sans">
                  1. <strong>MVC Flow Tab:</strong> Walk the examiner through the 7-tier pipeline diagram.<br />
                  2. <strong>Java Code Explorer:</strong> Show layer filtering (Model, Controller, Service, DAO, JDBC).<br />
                  3. <strong>Best 2-of-3 ISE drop logic:</strong> Show the sorting and averaging code in <code className="text-emerald-300">GradeCalculatorService.java</code>.<br />
                  4. <strong>Singleton JDBC:</strong> Show <code className="text-amber-300">DBConnection.java</code> with synchronized <code className="text-amber-300">getConnection()</code>.
                </p>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
