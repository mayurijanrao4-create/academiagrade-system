import React, { useState } from 'react';
import { Student, Department } from '../../types';
import { validateEmail, validatePhone } from '../../utils/gradeCalculator';
import { X, UserPlus, AlertCircle } from 'lucide-react';

interface AddStudentModalProps {
  onAddStudent: (student: Student) => void;
  onClose: () => void;
  existingRollNumbers: string[];
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  onAddStudent,
  onClose,
  existingRollNumbers,
}) => {
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState<Department>('Computer Science & Eng');
  const [semester, setSemester] = useState(4);
  const [admissionYear, setAdmissionYear] = useState(2024);
  const [dob, setDob] = useState('2004-06-15');

  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [address, setAddress] = useState('');

  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !rollNumber.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg('Please fill in all mandatory student personal fields.');
      return;
    }

    if (existingRollNumbers.includes(rollNumber.trim())) {
      setErrorMsg(`Duplicate Roll Number Error: '${rollNumber}' is already registered in the system!`);
      return;
    }

    if (!validateEmail(email)) {
      setErrorMsg('Invalid Email Format! Please enter a valid email address (e.g., student@institute.edu).');
      return;
    }

    if (!validatePhone(phone)) {
      setErrorMsg('Invalid Phone Number! Must be a 10 to 12 digit phone number.');
      return;
    }

    if (!fatherName.trim() || !guardianPhone.trim() || !address.trim()) {
      setErrorMsg('Please fill in Guardian Name, Guardian Contact, and Permanent Address.');
      return;
    }

    const newStudent: Student = {
      id: `STU${Math.floor(1000 + Math.random() * 9000)}`,
      rollNumber: rollNumber.trim().toUpperCase(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      department,
      semester,
      admissionYear,
      dob,
      guardian: {
        fatherName: fatherName.trim(),
        motherName: motherName.trim() || 'N/A',
        guardianPhone: guardianPhone.trim(),
        guardianEmail: guardianEmail.trim() || undefined,
        address: address.trim(),
      },
      status: 'ACTIVE',
    };

    onAddStudent(newStudent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Enroll New Student</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
          
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-2 text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Academic & Roll Number */}
          <div className="space-y-3">
            <h3 className="font-bold text-indigo-400 uppercase tracking-wider text-[11px]">Academic Identification</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1">Full Student Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikramaditya Singh"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Roll Number (Unique) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2024-CSE-009"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Department *</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as Department)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Computer Science & Eng">Computer Science & Eng</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics & Comm">Electronics & Comm</option>
                  <option value="Mechanical Eng">Mechanical Eng</option>
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Semester *</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Contact Details */}
          <div className="space-y-3">
            <h3 className="font-bold text-indigo-400 uppercase tracking-wider text-[11px]">Contact & Demographics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="student@institute.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Admission Year</label>
                <input
                  type="number"
                  value={admissionYear}
                  onChange={(e) => setAdmissionYear(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Guardian Details */}
          <div className="space-y-3">
            <h3 className="font-bold text-indigo-400 uppercase tracking-wider text-[11px]">Guardian Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1">Father's Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Father's Name"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Mother's Name</label>
                <input
                  type="text"
                  placeholder="Mother's Name"
                  value={motherName}
                  onChange={(e) => setMotherName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Guardian Contact Number *</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98111 22334"
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Guardian Email (Optional)</label>
                <input
                  type="email"
                  placeholder="parent@email.com"
                  value={guardianEmail}
                  onChange={(e) => setGuardianEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Permanent Residential Address *</label>
              <textarea
                required
                rows={2}
                placeholder="Full Street, City, State, Pincode"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end space-x-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors shadow-lg shadow-indigo-600/30"
            >
              Save & Register Student
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
