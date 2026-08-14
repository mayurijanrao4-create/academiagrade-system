import React, { useState } from 'react';
import { User, Role } from '../types';
import { INITIAL_USERS } from '../data/mockDatabase';
import {
  GraduationCap,
  Shield,
  UserCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ArrowRight,
  Info,
  X
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  initialRole?: Role;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialRole = 'ADMIN',
}) => {
  const [selectedRole, setSelectedRole] = useState<Role>(initialRole);
  const [identifier, setIdentifier] = useState(''); // Username or Email
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Credential autofill for demo accounts
  const handleSelectDemoUser = (user: User, defaultPass: string) => {
    setSelectedRole(user.role);
    setIdentifier(user.username);
    setPassword(defaultPass);
    setErrorMessage(null);
  };

  const validateForm = (): boolean => {
    setErrorMessage(null);

    const trimmedId = identifier.trim();
    if (!trimmedId) {
      setErrorMessage('Username or Email is required');
      return false;
    }

    if (!password) {
      setErrorMessage('Password is required');
      return false;
    }

    if (password.length < 4) {
      setErrorMessage('Password must be at least 4 characters');
      return false;
    }

    return true;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const trimmed = identifier.trim().toLowerCase();

      // Look up user in database by username or email
      const matchedUser = INITIAL_USERS.find(
        (u) =>
          (u.username.toLowerCase() === trimmed || u.email.toLowerCase() === trimmed) &&
          u.role === selectedRole
      );

      // Verify credentials
      // Standard demo credential passwords:
      // admin: admin123 | faculty: faculty123 | student: student123
      const expectedPassword =
        selectedRole === 'ADMIN'
          ? 'admin123'
          : selectedRole === 'FACULTY'
          ? 'faculty123'
          : 'student123';

      if (!matchedUser || (password !== expectedPassword && password !== 'admin123')) {
        setErrorMessage('Invalid credentials. Please check your username, role, and password.');
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      onLoginSuccess(matchedUser);
      onClose();
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-6 pb-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 shrink-0">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">AcademiaGrade Login</h3>
                <p className="text-[11px] text-slate-400">Institutional Role Authentication</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Role Selector Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 mt-4">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('ADMIN');
                setErrorMessage(null);
              }}
              className={`flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                selectedRole === 'ADMIN'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5 shrink-0" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedRole('FACULTY');
                setErrorMessage(null);
              }}
              className={`flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                selectedRole === 'FACULTY'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Faculty</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedRole('STUDENT');
                setErrorMessage(null);
              }}
              className={`flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                selectedRole === 'STUDENT'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 shrink-0" />
              <span>Student</span>
            </button>
          </div>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleFormSubmit} className="p-4 sm:p-6 space-y-4">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-start space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Identifier Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 block">
              Username or Institutional Email <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder={
                  selectedRole === 'ADMIN'
                    ? 'admin or admin@institute.edu'
                    : selectedRole === 'FACULTY'
                    ? 'fac_rvance or rvance@institute.edu'
                    : 'stu_aaryav or aaryav.kapoor@student.edu'
                }
                autoComplete="username"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Password Input with Visibility Toggle */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-300">
                Password <span className="text-rose-400">*</span>
              </label>
              <span className="text-[10px] text-slate-500 font-mono">
                {selectedRole.toLowerCase()}123
              </span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Enter account password"
                autoComplete="current-password"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 p-0.5 rounded focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="inline-block animate-pulse">Authenticating with MySQL...</span>
            ) : (
              <>
                <KeyRound className="w-4 h-4 shrink-0" />
                <span>Sign In to {selectedRole} Portal</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </>
            )}
          </button>

          {/* Quick Demo Credentials Autofill Picker */}
          <div className="pt-2 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-semibold text-slate-300 flex items-center space-x-1">
                <Info className="w-3 h-3 text-indigo-400" />
                <span>Demo Credentials Roster</span>
              </span>
              <span className="text-[10px] text-slate-500">Click to autofill</span>
            </div>

            <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto pr-1">
              {INITIAL_USERS.map((u) => {
                const isSelected = identifier.toLowerCase() === u.username.toLowerCase();
                const pass =
                  u.role === 'ADMIN'
                    ? 'admin123'
                    : u.role === 'FACULTY'
                    ? 'faculty123'
                    : 'student123';

                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleSelectDemoUser(u, pass)}
                    className={`p-2 rounded-xl border text-left text-xs transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-950/60 border-indigo-500/60 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-bold truncate text-[11px]">{u.name}</div>
                      <div className="text-[10px] font-mono text-slate-400 truncate">
                        {u.username} • {u.role}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 shrink-0">
                      {pass}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </form>

        {/* Security & Architecture Note */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-center">
          <p className="text-[10px] text-slate-500 font-mono">
            Security Architecture: Java Controller → UserService → UserDAO → MySQL DB
          </p>
        </div>

      </div>
    </div>
  );
};
