import React, { useState } from 'react';
import { SYSTEM_SRS_DOCUMENT, MYSQL_SCHEMA_SQL, JAVA_FILES } from '../../data/javaCodebase';
import {
  Code2,
  FileText,
  Database,
  FolderTree,
  Copy,
  Check,
  Download,
  Sparkles,
  Layers,
  Table,
  KeyRound,
  FileCode
} from 'lucide-react';

export const ArchitectureHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'SRS' | 'ERD' | 'SQL' | 'JAVA'>('SRS');
  const [selectedJavaIndex, setSelectedJavaIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const activeJavaFile = JAVA_FILES[selectedJavaIndex];

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

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Code2 className="w-5 h-5 text-indigo-400" />
            <span>Java System Architecture & Developer Suite</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Software Requirement Specification (SRS), Normalized ER Diagram, MySQL DDL, and Production-Grade Java MVC Codebase
          </p>
        </div>

        <button
          onClick={() => handleDownloadCode('schema.sql', MYSQL_SCHEMA_SQL)}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors shadow-md shadow-indigo-600/30"
        >
          <Download className="w-4 h-4" />
          <span>Export MySQL Schema (.sql)</span>
        </button>
      </div>

      {/* Architecture Tabs */}
      <div className="border-b border-slate-800 flex space-x-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('SRS')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'SRS' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Software Requirement Specification (SRS)</span>
        </button>

        <button
          onClick={() => setActiveTab('ERD')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'ERD' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Normalized ER Diagram & Database Design</span>
        </button>

        <button
          onClick={() => setActiveTab('SQL')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'SQL' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Table className="w-4 h-4" />
          <span>MySQL DDL Schema Script</span>
        </button>

        <button
          onClick={() => setActiveTab('JAVA')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'JAVA' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>Java MVC Code Explorer ({JAVA_FILES.length} Files)</span>
        </button>
      </div>

      {/* TAB 1: SRS DOCUMENTATION */}
      {activeTab === 'SRS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <pre className="font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-950 p-6 rounded-xl border border-slate-800">
            {SYSTEM_SRS_DOCUMENT}
          </pre>
        </div>
      )}

      {/* TAB 2: INTERACTIVE ER DIAGRAM & SCHEMA VISUALIZER */}
      {activeTab === 'ERD' && (
        <div className="space-y-6">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center space-x-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Relational Entity Relationship Diagram (3NF Normalized Schema)</span>
            </h3>

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
                    <span>{"GENERATED (>=75%)"}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MYSQL DDL SCRIPT */}
      {activeTab === 'SQL' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono text-slate-400">academia_gradebook_schema.sql</span>
            <button
              onClick={() => handleCopyCode(MYSQL_SCHEMA_SQL)}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono flex items-center space-x-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy SQL'}</span>
            </button>
          </div>
          <pre className="font-mono text-xs text-indigo-300 leading-relaxed whitespace-pre-wrap bg-slate-950 p-6 rounded-xl border border-slate-800 overflow-x-auto">
            {MYSQL_SCHEMA_SQL}
          </pre>
        </div>
      )}

      {/* TAB 4: JAVA CODE EXPLORER */}
      {activeTab === 'JAVA' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* File Tree Sidebar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-2">Java Package Directory</h3>
            <div className="space-y-1">
              {JAVA_FILES.map((file, idx) => (
                <button
                  key={file.path}
                  onClick={() => setSelectedJavaIndex(idx)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                    selectedJavaIndex === idx
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <FileCode className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{file.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Code Viewer */}
          <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-mono text-sm font-bold text-indigo-300">{activeJavaFile.name}</h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">{activeJavaFile.package}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCopyCode(activeJavaFile.code)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono flex items-center space-x-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
              {activeJavaFile.description}
            </p>

            <pre className="font-mono text-xs text-indigo-200 leading-relaxed whitespace-pre bg-slate-950 p-6 rounded-xl border border-slate-800 overflow-x-auto max-h-[600px]">
              {activeJavaFile.code}
            </pre>
          </div>

        </div>
      )}

    </div>
  );
};
