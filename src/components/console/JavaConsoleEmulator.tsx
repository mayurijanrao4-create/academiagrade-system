import React, { useState, useRef, useEffect } from 'react';
import { calculateBestIse, evaluateAttendance75Rule } from '../../utils/gradeCalculator';
import { Terminal, Play, RotateCcw, Sparkles } from 'lucide-react';

interface TerminalLog {
  id: string;
  type: 'OUTPUT' | 'INPUT' | 'SUCCESS' | 'ERROR' | 'INFO';
  text: string;
}

export const JavaConsoleEmulator: React.FC = () => {
  const [logs, setLogs] = useState<TerminalLog[]>([
    { id: '1', type: 'INFO', text: '==================================================================' },
    { id: '2', type: 'SUCCESS', text: '  ACADEMIAGRADE - JAVA VIRTUAL MACHINE & JDBC DRIVER LOADED' },
    { id: '3', type: 'INFO', text: '==================================================================' },
    { id: '4', type: 'OUTPUT', text: '[JVM] Initializing com.academic.gradebook.ui.ConsoleMenuApp.main()' },
    { id: '5', type: 'OUTPUT', text: '[JDBC] Connected to MySQL Server at localhost:3306/academia_gradebook' },
    { id: '6', type: 'OUTPUT', text: '\nMAIN MENU:' },
    { id: '7', type: 'OUTPUT', text: '1. Login (Admin / Faculty / Student)' },
    { id: '8', type: 'OUTPUT', text: '2. View Class Topper & Rankings' },
    { id: '9', type: 'OUTPUT', text: '3. Execute Best 2 of 3 ISE Calculator' },
    { id: '10', type: 'OUTPUT', text: '4. Check 75% Attendance Eligibility' },
    { id: '11', type: 'OUTPUT', text: '5. Query Student Database Table' },
    { id: '12', type: 'INFO', text: '\nEnter choice (1-5) or type "help":' },
  ]);

  const [inputVal, setInputVal] = useState('');
  const [interactiveMode, setInteractiveMode] = useState<'IDLE' | 'ISE_1' | 'ISE_2' | 'ATT_TOTAL'>('IDLE');
  const [tempIse1, setTempIse1] = useState(0);
  const [tempIse2, setTempIse2] = useState(0);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (text: string, type: TerminalLog['type'] = 'OUTPUT') => {
    setLogs((prev) => [...prev, { id: Math.random().toString(), type, text }]);
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const cmd = inputVal.trim();
    addLog(`> ${cmd}`, 'INPUT');
    setInputVal('');

    // Handle interactive state machines
    if (interactiveMode === 'ISE_1') {
      const v = Number(cmd);
      setTempIse1(v);
      addLog(`[INPUT] ISE-1 = ${v}. Now enter ISE-2 Marks (out of 20):`, 'INFO');
      setInteractiveMode('ISE_2');
      return;
    } else if (interactiveMode === 'ISE_2') {
      const v = Number(cmd);
      setTempIse2(v);
      addLog(`[INPUT] ISE-2 = ${v}. Now enter ISE-3 Marks (out of 20):`, 'INFO');
      setInteractiveMode('ATT_TOTAL'); // repurposed for ISE_3 step
      return;
    } else if (interactiveMode === 'ATT_TOTAL') {
      const v = Number(cmd);
      const best = calculateBestIse(tempIse1, tempIse2, v);
      addLog(`=======================================================`, 'SUCCESS');
      addLog(`[GRADECALC] ISE-1: ${tempIse1}, ISE-2: ${tempIse2}, ISE-3: ${v}`, 'SUCCESS');
      addLog(`[RESULT] Computed Best 2 of 3 ISE Average Score = ${best.toFixed(2)} / 20.00`, 'SUCCESS');
      addLog(`=======================================================`, 'SUCCESS');
      setInteractiveMode('IDLE');
      return;
    }

    // Default Main Menu Handlers
    switch (cmd) {
      case '1':
        addLog('[LOGIN] Authenticating as Admin Dr. Sarah Jenkins...', 'INFO');
        addLog('[SUCCESS] Welcome Admin! Full CRUD permissions granted.', 'SUCCESS');
        break;
      case '2':
        addLog('\n=== OFFICIAL CLASS RANKINGS (SEMESTER 4) ===', 'INFO');
        addLog('🥇 Rank 1: Ananya Iyer (2024-CSE-002) - CGPA: 9.92 (CLASS TOPPER)', 'SUCCESS');
        addLog('🥈 Rank 2: Aaryav Kapoor (2024-CSE-001) - CGPA: 9.38', 'SUCCESS');
        addLog('🥉 Rank 3: Rohan Deshmukh (2024-CSE-003) - CGPA: 7.84', 'OUTPUT');
        break;
      case '3':
        addLog('[ISE CALCULATOR] Please enter ISE-1 Marks (out of 20):', 'INFO');
        setInteractiveMode('ISE_1');
        break;
      case '4':
        addLog('[ATTENDANCE TEST] Executing 75% Rule Evaluation...', 'INFO');
        const res = evaluateAttendance75Rule(42, 48);
        addLog(`Total Lectures: 48, Attended: 42 -> Percentage: ${res.percentage}%`, 'OUTPUT');
        addLog(`[STATUS] ${res.isEligible ? 'ELIGIBLE FOR EXAMINATIONS' : 'DEBARRED (<75%)'}`, 'SUCCESS');
        break;
      case '5':
        addLog('\nSELECT * FROM students LIMIT 3;', 'INFO');
        addLog('STU1001 | 2024-CSE-001 | Aaryav Kapoor | CSE | Sem 4 | ACTIVE', 'OUTPUT');
        addLog('STU1002 | 2024-CSE-002 | Ananya Iyer  | CSE | Sem 4 | ACTIVE', 'OUTPUT');
        addLog('STU1003 | 2024-CSE-003 | Rohan Desh   | CSE | Sem 4 | ACTIVE', 'OUTPUT');
        break;
      case 'clear':
        setLogs([]);
        break;
      case 'help':
        addLog('Available Choices: 1 (Login), 2 (Topper), 3 (ISE Calc), 4 (75% Attendance), 5 (DB Query), "clear"');
        break;
      default:
        addLog(`[JVM ERROR] Unknown command: '${cmd}'. Type 1-5 or 'help'.`, 'ERROR');
        break;
    }
  };

  const handleResetTerminal = () => {
    setLogs([
      { id: '1', type: 'INFO', text: '==================================================================' },
      { id: '2', type: 'SUCCESS', text: '  ACADEMIAGRADE - JAVA VIRTUAL MACHINE RESET' },
      { id: '3', type: 'INFO', text: '==================================================================' },
      { id: '4', type: 'OUTPUT', text: '[JVM] ConsoleMenuApp ready. Enter 1-5:' },
    ]);
    setInteractiveMode('IDLE');
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[650px] font-mono text-xs">
      
      {/* Terminal Titlebar */}
      <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
          <span className="text-slate-400 font-bold ml-2">java -cp bin com.academic.gradebook.ui.ConsoleMenuApp</span>
        </div>

        <button
          onClick={handleResetTerminal}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center space-x-1"
          title="Reset JVM State"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset JVM</span>
        </button>
      </div>

      {/* Terminal Logs Output Area */}
      <div className="flex-1 p-5 overflow-y-auto space-y-1.5 leading-relaxed bg-slate-950">
        {logs.map((log) => {
          let color = 'text-slate-300';
          if (log.type === 'INPUT') color = 'text-indigo-400 font-bold';
          if (log.type === 'SUCCESS') color = 'text-emerald-400 font-bold';
          if (log.type === 'ERROR') color = 'text-rose-400 font-bold';
          if (log.type === 'INFO') color = 'text-sky-300';

          return (
            <div key={log.id} className={`${color} whitespace-pre-wrap`}>
              {log.text}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Terminal Input Line */}
      <form onSubmit={handleCommandSubmit} className="bg-slate-900 p-3 border-t border-slate-800 flex items-center space-x-2">
        <span className="text-indigo-400 font-bold">$java_app&gt;</span>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Type choice (1-5) or command..."
          className="flex-1 bg-transparent text-white font-mono focus:outline-none placeholder-slate-600"
          autoFocus
        />
        <button
          type="submit"
          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold text-[11px]"
        >
          Execute
        </button>
      </form>

    </div>
  );
};
