import React, { useState } from 'react';
import { User, Role } from '../types';
import { GraduationCap, Shield, UserCheck, BookOpen, Terminal, Code2, ChevronDown, Menu, X, Check, LogIn, LogOut, KeyRound } from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  onSwitchRole: (role: Role) => void;
  onOpenLoginModal: (role?: Role) => void;
  onLogout: () => void;
  activeView: 'APP' | 'ARCH' | 'CLI';
  onChangeView: (view: 'APP' | 'ARCH' | 'CLI') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSwitchRole,
  onOpenLoginModal,
  onLogout,
  activeView,
  onChangeView,
}) => {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getRoleBadgeColor = (role?: Role) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-950/50 text-purple-300 border-purple-800';
      case 'FACULTY': return 'bg-blue-950/50 text-blue-300 border-blue-800';
      case 'STUDENT': return 'bg-emerald-950/50 text-emerald-300 border-emerald-800';
      default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const handleSelectView = (view: 'APP' | 'ARCH' | 'CLI') => {
    onChangeView(view);
    setMobileMenuOpen(false);
  };

  const handleSelectRole = (role: Role) => {
    onSwitchRole(role);
    setRoleDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-md w-full max-w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Brand & Logo */}
          <div className="flex items-center space-x-2.5 sm:space-x-3 shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 shrink-0">
              <GraduationCap className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-white">AcademiaGrade</span>
                <span className="text-[9px] sm:text-[10px] font-mono uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1 sm:px-1.5 py-0.5 rounded hidden sm:inline-block whitespace-nowrap">
                  Java MVC & MySQL
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 hidden lg:block truncate">Academic Performance & Gradebook System</p>
            </div>
          </div>

          {/* Middle: Desktop Navigation Mode Switcher (Hidden on Mobile) */}
          <nav className="hidden md:flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => handleSelectView('APP')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activeView === 'APP'
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
              title="Portal Application"
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>Portal App</span>
            </button>

            <button
              onClick={() => handleSelectView('ARCH')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activeView === 'ARCH'
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
              title="Java Architecture & SRS"
            >
              <Code2 className="w-4 h-4 shrink-0" />
              <span>Java Architecture & SRS</span>
            </button>

            <button
              onClick={() => handleSelectView('CLI')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                activeView === 'CLI'
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
              title="Java CLI Terminal Emulator"
            >
              <Terminal className="w-4 h-4 shrink-0" />
              <span>Java CLI Emulator</span>
            </button>
          </nav>

          {/* Right: Desktop Role Switcher & User Profile (Hidden on Mobile) */}
          <div className="hidden md:flex items-center space-x-2 shrink-0">
            {currentUser ? (
              <>
                <div className="relative">
                  <button
                    onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                    aria-expanded={roleDropdownOpen}
                    aria-haspopup="true"
                    aria-label="Switch Persona Role"
                    className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 px-3 py-1.5 rounded-lg text-xs transition-colors whitespace-nowrap focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <span className="text-slate-400">Role:</span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getRoleBadgeColor(currentUser.role)}`}>
                      {currentUser.role}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </button>

                  {roleDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-1 z-50 divide-y divide-slate-700/60 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-3 py-2">
                        <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Demo Role Switcher (Preview)</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Switch role to preview portal permissions</p>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => handleSelectRole('ADMIN')}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-700/60 ${currentUser.role === 'ADMIN' ? 'bg-slate-700/40 text-white' : 'text-slate-200'}`}
                        >
                          <div className="flex items-center space-x-2">
                            <Shield className="w-4 h-4 text-purple-400 shrink-0" />
                            <div>
                              <div className="font-semibold">Admin Portal</div>
                              <div className="text-[10px] text-slate-400">Dr. Sarah Jenkins</div>
                            </div>
                          </div>
                          {currentUser.role === 'ADMIN' && <Check className="w-3.5 h-3.5 text-purple-400" />}
                        </button>

                        <button
                          onClick={() => handleSelectRole('FACULTY')}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-700/60 ${currentUser.role === 'FACULTY' ? 'bg-slate-700/40 text-white' : 'text-slate-200'}`}
                        >
                          <div className="flex items-center space-x-2">
                            <UserCheck className="w-4 h-4 text-blue-400 shrink-0" />
                            <div>
                              <div className="font-semibold">Faculty Portal</div>
                              <div className="text-[10px] text-slate-400">Dr. Robert Vance</div>
                            </div>
                          </div>
                          {currentUser.role === 'FACULTY' && <Check className="w-3.5 h-3.5 text-blue-400" />}
                        </button>

                        <button
                          onClick={() => handleSelectRole('STUDENT')}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-700/60 ${currentUser.role === 'STUDENT' ? 'bg-slate-700/40 text-white' : 'text-slate-200'}`}
                        >
                          <div className="flex items-center space-x-2">
                            <GraduationCap className="w-4 h-4 text-emerald-400 shrink-0" />
                            <div>
                              <div className="font-semibold">Student Portal</div>
                              <div className="text-[10px] text-slate-400">Aaryav Kapoor (STU1001)</div>
                            </div>
                          </div>
                          {currentUser.role === 'STUDENT' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                        </button>
                      </div>

                      <div className="py-1 px-1">
                        <button
                          onClick={() => {
                            setRoleDropdownOpen(false);
                            onOpenLoginModal(currentUser.role);
                          }}
                          className="w-full text-left px-2.5 py-1.5 text-xs text-indigo-300 hover:bg-indigo-950/60 rounded-lg flex items-center space-x-2 font-medium"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span>Login Dialog Box</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Logout Button */}
                <button
                  onClick={onLogout}
                  title="Logout Session"
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/80 hover:text-rose-300 border border-slate-700 hover:border-rose-700/60 text-xs font-semibold flex items-center space-x-1.5 transition-colors text-slate-300"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="hidden xl:inline">Logout</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => onOpenLoginModal('ADMIN')}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-indigo-600/20 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 shrink-0" />
                <span>Sign In</span>
              </button>
            )}
          </div>

          {/* Right: Mobile Hamburger Toggle Button */}
          <div className="flex md:hidden items-center space-x-2">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getRoleBadgeColor(currentUser?.role)}`}>
              {currentUser ? currentUser.role : 'GUEST'}
            </span>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-700 focus:outline-none transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-indigo-400" />
              ) : (
                <Menu className="w-5 h-5 text-slate-300" />
              )}
            </button>
          </div>

        </div>
      </div>

      {/* MOBILE EXPANDABLE MENU DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900/98 border-b border-slate-800 px-4 py-4 space-y-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-top-2 duration-150">
          
          {/* Section 1: Navigation Links */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">Navigation Views</p>
            
            <button
              onClick={() => handleSelectView('APP')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeView === 'APP'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 bg-slate-800/60 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <BookOpen className="w-4 h-4 text-indigo-300" />
                <span>Portal Application</span>
              </div>
              {activeView === 'APP' && <Check className="w-4 h-4 text-white" />}
            </button>

            <button
              onClick={() => handleSelectView('ARCH')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeView === 'ARCH'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 bg-slate-800/60 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Code2 className="w-4 h-4 text-indigo-300" />
                <span>Java Architecture & SRS</span>
              </div>
              {activeView === 'ARCH' && <Check className="w-4 h-4 text-white" />}
            </button>

            <button
              onClick={() => handleSelectView('CLI')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeView === 'CLI'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 bg-slate-800/60 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Terminal className="w-4 h-4 text-indigo-300" />
                <span>Java CLI Emulator</span>
              </div>
              {activeView === 'CLI' && <Check className="w-4 h-4 text-white" />}
            </button>
          </div>

          {/* Section 2: Demo Role Switcher */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">Demo Role Switcher (Preview)</p>
            
            <button
              onClick={() => handleSelectRole('ADMIN')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                currentUser?.role === 'ADMIN'
                  ? 'bg-purple-950/60 border border-purple-500/40 text-purple-200'
                  : 'bg-slate-800/50 border border-slate-700/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Shield className="w-4 h-4 text-purple-400" />
                <div className="text-left">
                  <div className="font-semibold text-white">Admin Portal</div>
                  <div className="text-[10px] text-slate-400">Dr. Sarah Jenkins (Administrator)</div>
                </div>
              </div>
              {currentUser?.role === 'ADMIN' && <Check className="w-4 h-4 text-purple-400" />}
            </button>

            <button
              onClick={() => handleSelectRole('FACULTY')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                currentUser?.role === 'FACULTY'
                  ? 'bg-blue-950/60 border border-blue-500/40 text-blue-200'
                  : 'bg-slate-800/50 border border-slate-700/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <UserCheck className="w-4 h-4 text-blue-400" />
                <div className="text-left">
                  <div className="font-semibold text-white">Faculty Portal</div>
                  <div className="text-[10px] text-slate-400">Dr. Robert Vance (Dept Faculty)</div>
                </div>
              </div>
              {currentUser?.role === 'FACULTY' && <Check className="w-4 h-4 text-blue-400" />}
            </button>

            <button
              onClick={() => handleSelectRole('STUDENT')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                currentUser?.role === 'STUDENT'
                  ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-200'
                  : 'bg-slate-800/50 border border-slate-700/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                <div className="text-left">
                  <div className="font-semibold text-white">Student Portal</div>
                  <div className="text-[10px] text-slate-400">Aaryav Kapoor (STU1001)</div>
                </div>
              </div>
              {currentUser?.role === 'STUDENT' && <Check className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* Mobile Auth Actions */}
            <div className="pt-2 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLoginModal(currentUser?.role || 'ADMIN');
                }}
                className="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center space-x-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Login Dialog</span>
              </button>

              {currentUser && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="py-2 px-3 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-300 text-xs font-bold flex items-center justify-center space-x-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </div>

        </div>
      )}
    </header>
  );
};
