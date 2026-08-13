import React from 'react';
import { User, Role } from '../types';
import { GraduationCap, Shield, UserCheck, BookOpen, Terminal, Code2, Sparkles, ChevronDown } from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  onSwitchRole: (role: Role) => void;
  activeView: 'APP' | 'ARCH' | 'CLI';
  onChangeView: (view: 'APP' | 'ARCH' | 'CLI') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSwitchRole,
  activeView,
  onChangeView,
}) => {
  const [roleDropdownOpen, setRoleDropdownOpen] = React.useState(false);

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800';
      case 'FACULTY': return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800';
      case 'STUDENT': return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Brand & Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">AcademiaGrade</span>
                <span className="text-[10px] font-mono uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded">Java MVC & MySQL</span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Academic Performance & Gradebook System</p>
            </div>
          </div>

          {/* Middle: Navigation Mode Switcher */}
          <nav className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => onChangeView('APP')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeView === 'APP'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Portal App</span>
            </button>

            <button
              onClick={() => onChangeView('ARCH')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeView === 'ARCH'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span className="hidden md:inline">Java Architecture & SRS</span>
              <span className="md:hidden">Architecture</span>
            </button>

            <button
              onClick={() => onChangeView('CLI')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeView === 'CLI'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span className="hidden md:inline">Java CLI Emulator</span>
              <span className="md:hidden">CLI</span>
            </button>
          </nav>

          {/* Right: Role Switcher & User Profile */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 px-3 py-1.5 rounded-lg text-xs transition-colors"
              >
                <span className="text-slate-400">Switch Persona:</span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getRoleBadgeColor(currentUser.role)}`}>
                  {currentUser.role}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1 z-50 divide-y divide-slate-700/60">
                  <div className="px-3 py-2">
                    <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Select Role Persona</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => { onSwitchRole('ADMIN'); setRoleDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs flex items-center space-x-2 hover:bg-slate-700/60 text-slate-200"
                    >
                      <Shield className="w-4 h-4 text-purple-400" />
                      <div>
                        <div className="font-semibold">Admin Portal</div>
                        <div className="text-[10px] text-slate-400">Dr. Sarah Jenkins</div>
                      </div>
                    </button>

                    <button
                      onClick={() => { onSwitchRole('FACULTY'); setRoleDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs flex items-center space-x-2 hover:bg-slate-700/60 text-slate-200"
                    >
                      <UserCheck className="w-4 h-4 text-blue-400" />
                      <div>
                        <div className="font-semibold">Faculty Portal</div>
                        <div className="text-[10px] text-slate-400">Dr. Robert Vance</div>
                      </div>
                    </button>

                    <button
                      onClick={() => { onSwitchRole('STUDENT'); setRoleDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs flex items-center space-x-2 hover:bg-slate-700/60 text-slate-200"
                    >
                      <GraduationCap className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="font-semibold">Student Portal</div>
                        <div className="text-[10px] text-slate-400">Aaryav Kapoor (STU1001)</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
