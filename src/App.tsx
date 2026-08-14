import React, { useState } from 'react';
import { User, Role, Student, Faculty, Subject, ExamMark, AttendanceRecord } from './types';
import {
  INITIAL_USERS,
  INITIAL_STUDENTS,
  INITIAL_FACULTY,
  INITIAL_SUBJECTS,
  INITIAL_MARKS,
  INITIAL_ATTENDANCE
} from './data/mockDatabase';
import { Navbar } from './components/Navbar';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { FacultyDashboard } from './components/faculty/FacultyDashboard';
import { StudentDashboard } from './components/student/StudentDashboard';
import { ArchitectureHub } from './components/architecture/ArchitectureHub';
import { JavaConsoleEmulator } from './components/console/JavaConsoleEmulator';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { UniversityPdfImporter } from './components/pdf/UniversityPdfImporter';
import { LoginModal } from './components/LoginModal';
import { BarChart3, GraduationCap, LayoutDashboard, FileUp, LogIn, ShieldAlert } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(INITIAL_USERS[0]); // Default Admin
  const [activeView, setActiveView] = useState<'APP' | 'ARCH' | 'CLI'>('APP');
  const [portalTab, setPortalTab] = useState<'DASHBOARD' | 'ANALYTICS' | 'PDF_IMPORT'>('DASHBOARD');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [targetLoginRole, setTargetLoginRole] = useState<Role>('ADMIN');

  // Application State
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [faculty, setFaculty] = useState<Faculty[]>(INITIAL_FACULTY);
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [marks, setMarks] = useState<ExamMark[]>(INITIAL_MARKS);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);

  // Switch Persona Role Handler (Demo/Preview Mode)
  const handleSwitchRole = (role: Role) => {
    const user = INITIAL_USERS.find((u) => u.role === role) || {
      id: 'U999',
      username: role.toLowerCase(),
      email: `${role.toLowerCase()}@institute.edu`,
      role,
      name: `User (${role})`,
    };
    setCurrentUser(user);
  };

  // Open Login Modal with specific role preset
  const handleOpenLoginModal = (role: Role = 'ADMIN') => {
    setTargetLoginRole(role);
    setIsLoginModalOpen(true);
  };

  // Logout Handler
  const handleLogout = () => {
    setCurrentUser(null);
  };

  // Login Success Handler
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsLoginModalOpen(false);
  };

  // CRUD Handlers
  const handleAddStudent = (newStudent: Student) => {
    setStudents((prev) => [newStudent, ...prev]);
  };

  const handleDeleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAddSubject = (newSubject: Subject) => {
    setSubjects((prev) => [...prev, newSubject]);
  };

  const handleAssignSubjectToFaculty = (facultyId: string, subjectId: string) => {
    setFaculty((prev) =>
      prev.map((f) => {
        if (f.id === facultyId) {
          const current = f.assignedSubjectIds || [];
          if (!current.includes(subjectId)) {
            return { ...f, assignedSubjectIds: [...current, subjectId] };
          }
        }
        return f;
      })
    );
  };

  const handleUpdateMarks = (updatedMark: ExamMark) => {
    setMarks((prev) => {
      const idx = prev.findIndex(
        (m) => m.studentId === updatedMark.studentId && m.subjectId === updatedMark.subjectId
      );
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updatedMark;
        return copy;
      }
      return [...prev, updatedMark];
    });
  };

  const handleUpdateAttendance = (
    studentId: string,
    subjectId: string,
    attended: number,
    total: number
  ) => {
    setAttendance((prev) => {
      const idx = prev.findIndex((a) => a.studentId === studentId && a.subjectId === subjectId);
      const pct = total > 0 ? (attended / total) * 100 : 100;
      const record: AttendanceRecord = {
        id: idx >= 0 ? prev[idx].id : `ATT_${Math.random()}`,
        studentId,
        subjectId,
        totalLectures: total,
        attendedLectures: attended,
        percentage: Number(pct.toFixed(1)),
        isEligible: pct >= 75.0,
        lastUpdated: new Date().toISOString().split('T')[0],
      };

      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = record;
        return copy;
      }
      return [...prev, record];
    });
  };

  // Handle PDF Import into active state
  const handleImportPdfData = (
    newStudents: Student[],
    newMarks: ExamMark[],
    newSubjects: Subject[]
  ) => {
    setStudents((prev) => [...newStudents, ...prev]);
    setMarks((prev) => [...newMarks, ...prev]);
    setSubjects((prev) => {
      const existingCodes = prev.map((s) => s.code);
      const unique = newSubjects.filter((s) => !existingCodes.includes(s.code));
      return [...prev, ...unique];
    });
  };

  // Resolve Student object for active Student persona
  const currentStudentObj = currentUser
    ? students.find((s) => s.id === currentUser.associatedId) || students[0]
    : students[0];

  // Resolve Faculty object for active Faculty persona
  const currentFacultyObj = currentUser
    ? faculty.find((f) => f.id === currentUser.associatedId) || faculty[0]
    : faculty[0];

  return (
    <div className="min-h-screen w-full max-w-full bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white flex flex-col overflow-x-hidden">
      
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onSwitchRole={handleSwitchRole}
        onOpenLoginModal={handleOpenLoginModal}
        onLogout={handleLogout}
        activeView={activeView}
        onChangeView={setActiveView}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 overflow-hidden">
        
        {/* VIEW 1: PORTAL APPLICATION */}
        {activeView === 'APP' && (
          <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden">
            
            {/* If user is logged out / unauthenticated */}
            {!currentUser ? (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-10 text-center max-w-lg mx-auto shadow-2xl space-y-4 my-8">
                <div className="w-14 h-14 bg-indigo-950/60 border border-indigo-700/60 rounded-2xl flex items-center justify-center mx-auto text-indigo-400">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-xl font-bold text-white tracking-tight">Authentication Required</h2>
                  <p className="text-xs text-slate-400">
                    You have logged out or your session has expired. Please sign in with your institutional credentials to access student records and grading modules.
                  </p>
                </div>
                <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-2">
                  <button
                    onClick={() => handleOpenLoginModal('ADMIN')}
                    className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/20 flex items-center justify-center space-x-2 transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In to AcademiaGrade</span>
                  </button>
                  <button
                    onClick={() => setActiveView('ARCH')}
                    className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
                  >
                    Inspect Java Architecture
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Top Sub-Bar for Portal vs Analytics vs PDF Importer */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 sm:gap-3 bg-slate-900/80 p-2.5 sm:p-3 rounded-2xl border border-slate-800 w-full max-w-full">
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-xs text-slate-400">Active:</span>
                    <span className="text-[11px] sm:text-xs font-bold text-white uppercase bg-slate-800 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg border border-slate-700">
                      {currentUser.role} PORTAL
                    </span>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-800 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
                    <button
                      onClick={() => setPortalTab('DASHBOARD')}
                      className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                        portalTab === 'DASHBOARD' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>Dashboard</span>
                    </button>

                    <button
                      onClick={() => setPortalTab('ANALYTICS')}
                      className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                        portalTab === 'ANALYTICS' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Toppers & Examination Stats</span>
                      <span className="sm:hidden">Stats</span>
                    </button>

                    <button
                      onClick={() => setPortalTab('PDF_IMPORT')}
                      className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                        portalTab === 'PDF_IMPORT' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      <FileUp className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-bold text-amber-300">
                        <span className="hidden sm:inline">University PDF Importer</span>
                        <span className="sm:hidden">PDF Import</span>
                      </span>
                    </button>
                  </div>
                </div>

                {/* Sub-Tab 1: Main Dashboard with Strict Role-Based Redirection */}
                {portalTab === 'DASHBOARD' && (
                  <>
                    {currentUser.role === 'ADMIN' && (
                      <AdminDashboard
                        students={students}
                        faculty={faculty}
                        subjects={subjects}
                        marks={marks}
                        attendance={attendance}
                        onAddStudent={handleAddStudent}
                        onDeleteStudent={handleDeleteStudent}
                        onAddSubject={handleAddSubject}
                        onAssignSubjectToFaculty={handleAssignSubjectToFaculty}
                        onNavigateToArchitecture={() => setActiveView('ARCH')}
                        onNavigateToAnalytics={() => setPortalTab('ANALYTICS')}
                      />
                    )}

                    {currentUser.role === 'FACULTY' && (
                      <FacultyDashboard
                        faculty={currentFacultyObj}
                        students={students}
                        subjects={subjects}
                        marks={marks}
                        attendance={attendance}
                        onUpdateMarks={handleUpdateMarks}
                        onUpdateAttendance={handleUpdateAttendance}
                      />
                    )}

                    {currentUser.role === 'STUDENT' && (
                      <StudentDashboard
                        student={currentStudentObj}
                        marks={marks}
                        subjects={subjects}
                        attendance={attendance}
                      />
                    )}
                  </>
                )}

                {/* Sub-Tab 2: Analytics & Toppers */}
                {portalTab === 'ANALYTICS' && (
                  <AnalyticsView
                    students={students}
                    subjects={subjects}
                    marks={marks}
                    attendance={attendance}
                  />
                )}

                {/* Sub-Tab 3: University PDF Result Importer */}
                {portalTab === 'PDF_IMPORT' && (
                  <UniversityPdfImporter onImportToDatabase={handleImportPdfData} />
                )}
              </>
            )}

          </div>
        )}

        {/* VIEW 2: JAVA ARCHITECTURE & DEVELOPER SUITE */}
        {activeView === 'ARCH' && <ArchitectureHub />}

        {/* VIEW 3: JAVA CLI CONSOLE TERMINAL EMULATOR */}
        {activeView === 'CLI' && <JavaConsoleEmulator />}

      </main>

      {/* Login Authentication Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        initialRole={targetLoginRole}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/60 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AcademiaGrade System © 2026 • Java Core + OOP + JDBC + MySQL Architecture</span>
          <span className="font-mono text-[11px] text-indigo-400">MVC Architecture • SOLID Principles • 75% Attendance Rule</span>
        </div>
      </footer>

    </div>
  );
}
