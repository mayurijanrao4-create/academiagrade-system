import React, { useState } from 'react';
import { Department, Student, ExamMark, Subject } from '../../types';
import {
  extractTextFromPdfFile,
  parseUniversityLedgerText,
  UniversityLedgerSummary,
  ParsedStudentResult,
  SAMPLE_UNIVERSITY_LEDGERS
} from '../../utils/pdfResultParser';
import {
  downloadStudentScorecardPdf,
  downloadAllStudentScorecardsBulkPdf,
  downloadBatchResultGazettePdf
} from '../../utils/pdfGenerator';
import confetti from 'canvas-confetti';
import {
  FileUp,
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Upload,
  Download,
  Sparkles,
  Building2,
  GraduationCap,
  BookOpen,
  ArrowRight,
  Database,
  FileText,
  Search,
  Check,
  Printer,
  Layers
} from 'lucide-react';

interface UniversityPdfImporterProps {
  onImportToDatabase: (
    newStudents: Student[],
    newMarks: ExamMark[],
    newSubjects: Subject[]
  ) => void;
}

export const UniversityPdfImporter: React.FC<UniversityPdfImporterProps> = ({
  onImportToDatabase,
}) => {
  const [selectedCollege, setSelectedCollege] = useState('St. Xavier Institute of Technology');
  const [selectedDept, setSelectedDept] = useState<Department>('Computer Science & Eng');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFileCount, setUploadedFileCount] = useState(0);
  const [ledgerSummary, setLedgerSummary] = useState<UniversityLedgerSummary | null>(() =>
    parseUniversityLedgerText(SAMPLE_UNIVERSITY_LEDGERS[0].rawText, selectedCollege, selectedDept)
  );
  const [importSuccess, setImportSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Handle Multi-PDF / Batch PDF File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setImportSuccess(false);
    setUploadedFileCount(files.length);

    try {
      const fileList = Array.from(files) as File[];
      const textPromises = fileList.map(async (file: File) => {
        if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
          return await extractTextFromPdfFile(file);
        } else {
          return await file.text();
        }
      });

      const extractedTexts = await Promise.all(textPromises);
      const combinedRawText = extractedTexts.join('\n\n--- NEXT PDF LEDGER DOCUMENT ---\n\n');

      const summary = parseUniversityLedgerText(combinedRawText, selectedCollege, selectedDept);
      setLedgerSummary(summary);
      setIsProcessing(false);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err) {
      console.error('Error parsing multiple PDFs:', err);
      setIsProcessing(false);
    }
  };

  // Load Preset Sample PDF
  const handleLoadSample = (sampleIdx: number) => {
    setIsProcessing(true);
    setImportSuccess(false);
    setUploadedFileCount(1);

    setTimeout(() => {
      const sample = SAMPLE_UNIVERSITY_LEDGERS[sampleIdx];
      setSelectedCollege(sample.college);
      const summary = parseUniversityLedgerText(sample.rawText, sample.college, selectedDept);
      setLedgerSummary(summary);
      setIsProcessing(false);

      confetti({
        particleCount: 70,
        spread: 50,
        origin: { y: 0.6 },
      });
    }, 400);
  };

  // Import into Master Database
  const handleConfirmImport = () => {
    if (!ledgerSummary) return;

    const newStudents: Student[] = ledgerSummary.studentResults.map((sr, idx) => ({
      id: `STU_IMP_${Date.now()}_${idx}`,
      rollNumber: sr.rollNumber,
      name: sr.name,
      email: `${sr.name.toLowerCase().replace(/\s+/g, '.')}@${sr.collegeName.toLowerCase().replace(/[^a-z]/g, '')}.edu`,
      phone: `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
      department: sr.department,
      semester: sr.semester,
      admissionYear: 2024,
      dob: '2004-05-15',
      guardian: {
        fatherName: 'Guardian Name',
        motherName: 'Mother Name',
        guardianPhone: '+91 9800000000',
        address: `${sr.collegeName} Campus, City`,
      },
      status: sr.status === 'PASS' ? 'ACTIVE' : 'DEBARRED',
    }));

    const newSubjects: Subject[] = [
      { id: 'SUB_401', code: 'CS401', name: 'Data Structures & Algorithms', department: selectedDept, semester: 4, credits: 4, maxIseMarks: 20, maxPracticalMarks: 20, maxEndSemMarks: 60 },
      { id: 'SUB_402', code: 'CS402', name: 'Operating Systems Core', department: selectedDept, semester: 4, credits: 4, maxIseMarks: 20, maxPracticalMarks: 20, maxEndSemMarks: 60 },
      { id: 'SUB_403', code: 'CS403', name: 'Database Management Systems', department: selectedDept, semester: 4, credits: 4, maxIseMarks: 20, maxPracticalMarks: 20, maxEndSemMarks: 60 },
      { id: 'SUB_404', code: 'CS404', name: 'Web Dev & Software Eng', department: selectedDept, semester: 4, credits: 4, maxIseMarks: 20, maxPracticalMarks: 20, maxEndSemMarks: 60 },
    ];

    const newMarks: ExamMark[] = [];
    ledgerSummary.studentResults.forEach((sr, sIdx) => {
      const studentObj = newStudents[sIdx];
      sr.subjectMarks.forEach((sm, subIdx) => {
        newMarks.push({
          id: `MARK_IMP_${Date.now()}_${sIdx}_${subIdx}`,
          studentId: studentObj.id,
          subjectId: newSubjects[subIdx % newSubjects.length].id,
          semester: 4,
          ise1: sm.ise1,
          ise2: sm.ise2,
          ise3: sm.ise3,
          assignment: sm.assignment,
          practical: sm.practical,
          endSem: sm.endSem,
          calculatedBestIse: Number(((sm.ise1 + sm.ise2) / 2).toFixed(1)),
          internalTotal: Number((((sm.ise1 + sm.ise2) / 2) + sm.assignment + sm.practical).toFixed(1)),
          externalTotal: sm.endSem,
          totalMarks: sm.totalMarks,
          percentage: sm.totalMarks,
          grade: sm.grade,
          gradePoint: sm.gradePoint,
          passed: sm.passed,
          remarks: sm.passed ? 'Clear Pass' : 'Backlog (Re-Exam Required)',
        });
      });
    });

    onImportToDatabase(newStudents, newMarks, newSubjects);
    setImportSuccess(true);
    setTimeout(() => setImportSuccess(false), 5000);
  };

  const filteredResults = ledgerSummary
    ? ledgerSummary.studentResults.filter(
        (r) =>
          r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.status.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-6">
      
      {/* Banner & Multi-PDF Upload Action Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
              Multi-PDF Batch OCR Engine
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1 flex items-center space-x-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>Batch PDF University Result Ledger Analyzer & Scorecard Exporter</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Upload single or <strong>multiple university PDF result sheets at once</strong>. The system aggregates all files, analyzes student performance across courses, calculates ranks, and generates <strong>downloadable official PDF scorecards for every student</strong>.
          </p>
        </div>

        {/* Upload Button */}
        <label className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-3 rounded-xl cursor-pointer transition-colors shadow-lg shadow-indigo-600/30 shrink-0 focus-within:ring-2 focus-within:ring-indigo-400">
          <Upload className="w-4 h-4" />
          <span>Upload PDF Ledgers (Select All)</span>
          <input
            type="file"
            accept=".pdf,.txt,.csv"
            multiple
            onChange={handleFileUpload}
            className="sr-only"
            aria-label="Upload PDF result ledgers"
          />
        </label>
      </div>

      {/* Quick Preset Samples Selection */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
          Or Select a Pre-Loaded University Result Sheet Ledger to Test:
        </span>
        <div className="flex flex-wrap gap-3">
          {SAMPLE_UNIVERSITY_LEDGERS.map((samp, idx) => (
            <button
              key={idx}
              onClick={() => handleLoadSample(idx)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center space-x-2 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>{samp.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Processing Loader */}
      {isProcessing && (
        <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-bold text-white">Extracting & Analyzing {uploadedFileCount > 1 ? `${uploadedFileCount} PDF Ledgers` : 'PDF Ledger'}...</p>
          <p className="text-xs text-slate-400">Parsing seat numbers, internal/external marks, calculating SGPA, rankings, and generating PDF scorecards</p>
        </div>
      )}

      {/* Parsed Ledger Results */}
      {ledgerSummary && !isProcessing && (
        <div className="space-y-6">
          
          {/* Success Banner if Imported */}
          {importSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center space-x-2 shadow-lg">
              <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>Successfully imported {ledgerSummary.studentResults.length} parsed student scores and exam records into the master college database!</span>
            </div>
          )}

          {/* Top Metric Cards for Parsed College Results */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-1">
              <span className="text-xs text-slate-400 font-medium block">Total Candidates Analyzed</span>
              <p className="text-2xl font-black text-white">{ledgerSummary.totalStudents} Students</p>
              <p className="text-[11px] text-slate-400 truncate">{ledgerSummary.collegeName}</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-1">
              <span className="text-xs text-slate-400 font-medium block">Pass Percentage</span>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-black text-emerald-400">{ledgerSummary.passPercentage}%</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                  {ledgerSummary.passedCount} Passed
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Clear Pass without backlogs</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-1">
              <span className="text-xs text-slate-400 font-medium block">Failed / KT Candidates</span>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-black text-rose-400">{ledgerSummary.failedCount}</span>
                <span className="text-xs bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-bold">
                  {((ledgerSummary.failedCount / ledgerSummary.totalStudents) * 100).toFixed(1)}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Backlog re-examinations required</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-1">
              <span className="text-xs text-slate-400 font-medium block">Highest Score / Topper SGPA</span>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-black text-amber-300">
                  {ledgerSummary.toppers[0]?.sgpa.toFixed(2) || '10.00'}
                </span>
                <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                  {ledgerSummary.toppers[0]?.percentage.toFixed(1)}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">{ledgerSummary.toppers[0]?.name}</p>
            </div>

          </div>

          {/* Action Bar for PDF Downloads */}
          <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Export Official University PDF Documents</span>
              </h3>
              <p className="text-xs text-slate-300">Generate and download official PDF grade sheets and class result gazettes instantly</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => downloadBatchResultGazettePdf(ledgerSummary)}
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>Download Result Gazette PDF</span>
              </button>

              <button
                onClick={() => downloadAllStudentScorecardsBulkPdf(ledgerSummary.studentResults)}
                className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download All Student Scorecards (Bulk PDF)</span>
              </button>

              <button
                onClick={handleConfirmImport}
                className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md"
              >
                <Database className="w-4 h-4" />
                <span>Sync To Database</span>
              </button>
            </div>
          </div>

          {/* College Toppers Podium Section */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Parsed College Toppers Hall of Fame</span>
                </h3>
                <p className="text-xs text-slate-400">Highest ranked candidates calculated from uploaded PDF ledgers</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ledgerSummary.toppers.map((top, idx) => {
                const ranks = ['🥇 GOLD MEDALIST (RANK 1)', '🥈 SILVER MEDALIST (RANK 2)', '🥉 BRONZE MEDALIST (RANK 3)'];
                const badgeColors = [
                  'bg-amber-500/20 border-amber-500/40 text-amber-300',
                  'bg-slate-400/20 border-slate-400/40 text-slate-200',
                  'bg-amber-700/20 border-amber-700/40 text-amber-400',
                ];

                return (
                  <div key={idx} className={`p-4 rounded-xl border ${badgeColors[idx]} space-y-3 relative overflow-hidden bg-slate-950`}>
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold uppercase tracking-wider">{ranks[idx]}</span>
                      <span className="text-xs font-mono font-bold">{top.rollNumber}</span>
                    </div>
                    <h4 className="font-bold text-white text-base">{top.name}</h4>
                    <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-800 font-mono">
                      <span>SGPA: <strong className="text-amber-300">{top.sgpa}</strong></span>
                      <span>Marks: <strong className="text-emerald-400">{top.totalMarksObtained} / {top.totalMaxMarks}</strong></span>
                      <span>{top.percentage}%</span>
                    </div>
                    <button
                      onClick={() => downloadStudentScorecardPdf(top, idx + 1)}
                      className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-bold rounded-lg border border-slate-700 flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-400" />
                      <span>Download Topper PDF Scorecard</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Student Parsed Score Table */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-sm font-bold text-white">Parsed Student Examination Results ({filteredResults.length})</h3>
                <p className="text-xs text-slate-400">Score breakdown per candidate extracted from PDF ledger</p>
              </div>

              {/* Search filter */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter student or status..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Rank</th>
                    <th className="p-3">Seat / Roll No</th>
                    <th className="p-3">Candidate Name</th>
                    <th className="p-3">Obtained / Max</th>
                    <th className="p-3">Percentage</th>
                    <th className="p-3">SGPA</th>
                    <th className="p-3">Division</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Backlog Details</th>
                    <th className="p-3 text-right">PDF Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredResults.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-slate-400">
                        <p className="font-semibold text-sm text-slate-300">No student records found</p>
                        <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria</p>
                      </td>
                    </tr>
                  ) : (
                    filteredResults.map((sr, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-slate-400">#{idx + 1}</td>
                      <td className="p-3 font-mono font-bold text-indigo-300">{sr.rollNumber}</td>
                      <td className="p-3 font-medium text-white">{sr.name}</td>
                      <td className="p-3 font-mono">{sr.totalMarksObtained} / {sr.totalMaxMarks}</td>
                      <td className="p-3 font-mono font-bold text-slate-200">{sr.percentage}%</td>
                      <td className="p-3 font-mono font-bold text-amber-300">{sr.sgpa}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          sr.division === 'FIRST CLASS WITH DISTINCTION' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                          sr.division === 'FIRST CLASS' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                          sr.division === 'SECOND CLASS' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                          sr.division === 'PASS CLASS' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                          sr.division === 'ATKT' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
                          'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        }`}>
                          {sr.division || 'N/A'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          sr.status === 'PASS' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {sr.status}
                        </span>
                      </td>
                      <td className="p-3 text-[11px] text-slate-400 font-mono">
                        {sr.backlogCount > 0 ? (
                          <span className="text-rose-400 font-bold">{sr.backlogCount} Subject Backlogs ({sr.failedSubjectCodes.join(', ')})</span>
                        ) : (
                          <span className="text-emerald-400">Clear All Passed</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => downloadStudentScorecardPdf(sr, idx + 1)}
                          className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 rounded-lg text-[11px] font-semibold inline-flex items-center space-x-1 transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          <span>PDF Scorecard</span>
                        </button>
                      </td>
                    </tr>
                  )))
                }
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
