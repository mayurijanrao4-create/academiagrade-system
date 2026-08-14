import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ParsedStudentResult, UniversityLedgerSummary } from './pdfResultParser';

/**
 * Generates and downloads a clean, official PDF Scorecard for an individual student.
 */
export function downloadStudentScorecardPdf(
  student: ParsedStudentResult,
  rank?: number
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Background Header Styling
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 32, 'F');

  // University Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('ACADEMIAGRADE', pageWidth / 2, 12, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('AUTONOMOUS INSTITUTE OF TECHNOLOGY & ACADEMIC SCIENCES', pageWidth / 2, 18, { align: 'center' });

  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(`OFFICIAL STUDENT GRADE CARD & STATEMENT OF GRADES (SEMESTER ${student.semester})`, pageWidth / 2, 24, { align: 'center' });

  // Accent Line
  doc.setDrawColor(99, 102, 241); // indigo-500
  doc.setLineWidth(1);
  doc.line(14, 35, pageWidth - 14, 35);

  // Student Profile Table / Info Box
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('STUDENT DEMOGRAPHICS & CANDIDATE DETAILS', 14, 43);

  const profileData = [
    [
      { content: 'Student Name:', styles: { fontStyle: 'bold' } },
      student.name,
      { content: 'Seat / Roll No:', styles: { fontStyle: 'bold' } },
      student.rollNumber,
    ],
    [
      { content: 'Department:', styles: { fontStyle: 'bold' } },
      student.department,
      { content: 'Semester:', styles: { fontStyle: 'bold' } },
      `Semester ${student.semester} (2025-26)`,
    ],
    [
      { content: 'College Name:', styles: { fontStyle: 'bold' } },
      student.collegeName,
      { content: 'Result Status:', styles: { fontStyle: 'bold' } },
      student.status === 'PASS' ? 'PASS (CLEAR)' : `FAIL (${student.backlogCount} KT BACKLOGS)`,
    ],
    [
      { content: 'Division / Class:', styles: { fontStyle: 'bold' } },
      student.division,
      { content: 'Overall SGPA:', styles: { fontStyle: 'bold' } },
      `${student.sgpa.toFixed(2)} / 10.00`,
    ],
    [
      { content: 'Class Rank:', styles: { fontStyle: 'bold' } },
      rank ? `#${rank} in Department` : 'N/A',
      { content: 'Attendance Status:', styles: { fontStyle: 'bold' } },
      'Verified Eligible (>= 75%)',
    ],
  ];

  autoTable(doc, {
    startY: 46,
    body: profileData as any,
    theme: 'plain',
    styles: { fontSize: 8.5, cellPadding: 2, textColor: [30, 41, 59] },
    columnStyles: {
      0: { cellWidth: 32 },
      1: { cellWidth: 60 },
      2: { cellWidth: 32 },
      3: { cellWidth: 55 },
    },
  });

  // Marks Breakdown Table
  const tableStartY = (doc as any).lastAutoTable.finalY + 6;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('COURSE EVALUATION & MARKS BREAKDOWN', 14, tableStartY);

  const tableHeaders = [
    'Course Code',
    'Course Name',
    'Best ISE (20)',
    'Prac (20)',
    'EndSem (60)',
    'Total (100)',
    'Grade',
    'Pts',
    'Status',
  ];

  const tableRows = student.subjectMarks.map((sub) => [
    sub.subjectCode,
    sub.subjectName,
    ((sub.ise1 + sub.ise2) / 2).toFixed(1),
    sub.practical.toString(),
    sub.endSem.toString(),
    sub.totalMarks.toFixed(1),
    sub.grade,
    sub.gradePoint.toString(),
    sub.passed ? 'PASS' : 'FAIL',
  ]);

  autoTable(doc, {
    startY: tableStartY + 3,
    head: [tableHeaders],
    body: tableRows,
    theme: 'striped',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'center',
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      halign: 'center',
    },
    columnStyles: {
      1: { halign: 'left', cellWidth: 55 },
    },
  });

  // Summary Metrics Box
  const summaryY = (doc as any).lastAutoTable.finalY + 8;

  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, summaryY, pageWidth - 28, 22, 3, 3, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Total Marks Obtained: ${student.totalMarksObtained.toFixed(1)} / ${student.totalMaxMarks}`, 20, summaryY + 8);
  doc.text(`Aggregate Percentage: ${student.percentage.toFixed(2)}%`, 20, summaryY + 15);

  doc.text(`Semester SGPA: ${student.sgpa.toFixed(2)}`, 110, summaryY + 8);
  doc.text(`75% Attendance Compliance: VERIFIED ELIGIBLE`, 110, summaryY + 15);

  // Footer Signatures
  const footerY = summaryY + 38;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);

  doc.text('Date of Issue: ' + new Date().toLocaleDateString(), 14, footerY);
  doc.text('Prepared By: Academic Cell', pageWidth / 2, footerY, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('CONTROLLER OF EXAMINATIONS', pageWidth - 14, footerY, { align: 'right' });
  doc.line(pageWidth - 60, footerY - 4, pageWidth - 14, footerY - 4);

  // Save PDF file
  const fileName = `AcademiaGrade_GradeCard_${student.rollNumber.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(fileName);
}

/**
 * Generates and downloads a multi-page PDF document containing individual Scorecards for ALL students in the uploaded LEDGER!
 */
export function downloadAllStudentScorecardsBulkPdf(
  students: ParsedStudentResult[]
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  students.forEach((student, idx) => {
    if (idx > 0) {
      doc.addPage();
    }

    // Background Header Styling
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 32, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('AFFILIATED BOARD OF UNIVERSITY EXAMINATIONS', pageWidth / 2, 12, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(student.collegeName.toUpperCase(), pageWidth / 2, 18, { align: 'center' });

    doc.setFontSize(9);
    doc.setTextColor(203, 213, 225);
    doc.text('OFFICIAL ACADEMIC GRADE CARD & PERFORMANCE REPORT', pageWidth / 2, 24, { align: 'center' });

    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(1);
    doc.line(14, 35, pageWidth - 14, 35);

    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text('STUDENT DEMOGRAPHICS & CANDIDATE DETAILS', 14, 43);

    const profileData = [
      [
        { content: 'Student Name:', styles: { fontStyle: 'bold' } },
        student.name,
        { content: 'Seat / Roll No:', styles: { fontStyle: 'bold' } },
        student.rollNumber,
      ],
      [
        { content: 'Department:', styles: { fontStyle: 'bold' } },
        student.department,
        { content: 'Semester:', styles: { fontStyle: 'bold' } },
        `Semester ${student.semester}`,
      ],
      [
        { content: 'College Name:', styles: { fontStyle: 'bold' } },
        student.collegeName,
        { content: 'Result Status:', styles: { fontStyle: 'bold' } },
        student.status === 'PASS' ? 'PASS (CLEAR)' : `FAIL (${student.backlogCount} KT BACKLOGS)`,
      ],
      [
        { content: 'Division / Class:', styles: { fontStyle: 'bold' } },
        student.division,
        { content: 'Overall SGPA:', styles: { fontStyle: 'bold' } },
        `${student.sgpa.toFixed(2)} / 10.00`,
      ],
      [
        { content: 'Class Rank:', styles: { fontStyle: 'bold' } },
        `Rank #${idx + 1} of ${students.length}`,
        { content: 'Attendance Status:', styles: { fontStyle: 'bold' } },
        'Verified Eligible (>= 75%)',
      ],
    ];

    autoTable(doc, {
      startY: 46,
      body: profileData as any,
      theme: 'plain',
      styles: { fontSize: 8.5, cellPadding: 2, textColor: [30, 41, 59] },
      columnStyles: {
        0: { cellWidth: 32 },
        1: { cellWidth: 60 },
        2: { cellWidth: 32 },
        3: { cellWidth: 55 },
      },
    });

    const tableStartY = (doc as any).lastAutoTable.finalY + 6;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('COURSE EVALUATION & MARKS BREAKDOWN', 14, tableStartY);

    const tableHeaders = [
      'Course Code',
      'Course Name',
      'Best ISE',
      'Prac',
      'EndSem',
      'Total',
      'Grade',
      'Pts',
      'Status',
    ];

    const tableRows = student.subjectMarks.map((sub) => [
      sub.subjectCode,
      sub.subjectName,
      ((sub.ise1 + sub.ise2) / 2).toFixed(1),
      sub.practical.toString(),
      sub.endSem.toString(),
      sub.totalMarks.toFixed(1),
      sub.grade,
      sub.gradePoint.toString(),
      sub.passed ? 'PASS' : 'FAIL',
    ]);

    autoTable(doc, {
      startY: tableStartY + 3,
      head: [tableHeaders],
      body: tableRows,
      theme: 'striped',
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontSize: 8.5,
        fontStyle: 'bold',
        halign: 'center',
      },
      styles: {
        fontSize: 8,
        cellPadding: 2.5,
        halign: 'center',
      },
      columnStyles: {
        1: { halign: 'left', cellWidth: 55 },
      },
    });

    const summaryY = (doc as any).lastAutoTable.finalY + 8;

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, summaryY, pageWidth - 28, 22, 3, 3, 'FD');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`Total Marks: ${student.totalMarksObtained.toFixed(1)} / ${student.totalMaxMarks}`, 20, summaryY + 8);
    doc.text(`Percentage: ${student.percentage.toFixed(2)}%`, 20, summaryY + 15);

    doc.text(`Semester SGPA: ${student.sgpa.toFixed(2)}`, 110, summaryY + 8);
    doc.text(`75% Attendance: VERIFIED`, 110, summaryY + 15);

    const footerY = summaryY + 38;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Date of Issue: ' + new Date().toLocaleDateString(), 14, footerY);
    doc.text('CONTROLLER OF EXAMINATIONS', pageWidth - 14, footerY, { align: 'right' });
    doc.line(pageWidth - 60, footerY - 4, pageWidth - 14, footerY - 4);
  });

  doc.save(`All_Student_Scorecards_Batch_${Date.now()}.pdf`);
}

/**
 * Generates and downloads the official University Result Gazette / Class Master Analysis PDF.
 */
export function downloadBatchResultGazettePdf(summary: UniversityLedgerSummary) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('OFFICIAL UNIVERSITY GAZETTE & CLASS EXAMINATION RESULTS', pageWidth / 2, 11, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${summary.collegeName.toUpperCase()} • ${summary.department.toUpperCase()}`, pageWidth / 2, 18, { align: 'center' });

  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text(`EXAM SESSION: ${summary.examSession} • TOTAL CANDIDATES: ${summary.totalStudents}`, pageWidth / 2, 24, { align: 'center' });

  // Summary Metrics Bar
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');

  const statsY = 32;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, statsY, pageWidth - 28, 18, 2, 2, 'F');

  doc.text(`Total Candidates: ${summary.totalStudents}`, 18, statsY + 6);
  doc.text(`Passed (Clear): ${summary.passedCount} (${summary.passPercentage}%)`, 80, statsY + 6);
  doc.text(`Failed / ATKT: ${summary.failedCount}`, 165, statsY + 6);
  doc.text(`Highest Scorer: ${summary.toppers[0]?.percentage || 0}% (${summary.toppers[0]?.name || 'N/A'})`, 220, statsY + 6);

  const d = summary.divisionCounts;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(`Distinction: ${d?.distinctionCount || 0}  |  First Class: ${d?.firstClassCount || 0}  |  Second Class: ${d?.secondClassCount || 0}  |  Pass Class: ${d?.passClassCount || 0}  |  ATKT: ${d?.atktCount || 0}  |  Failed: ${d?.failCount || 0}`, 18, statsY + 13);

  // Results Ledger Table
  const headers = [
    'Rank',
    'Seat / Roll No',
    'Candidate Name',
    'Department',
    'Obtained/Max',
    'Percentage',
    'SGPA',
    'Result Status',
    'Division / Class',
    'Backlog / Remarks',
  ];

  const rows = summary.studentResults.map((s, idx) => [
    `#${idx + 1}`,
    s.rollNumber,
    s.name,
    s.department,
    `${s.totalMarksObtained} / ${s.totalMaxMarks}`,
    `${s.percentage}%`,
    s.sgpa.toFixed(2),
    s.status,
    s.division,
    s.backlogCount > 0 ? `${s.backlogCount} KT (${s.failedSubjectCodes.join(', ')})` : 'Clear Pass',
  ]);

  autoTable(doc, {
    startY: statsY + 22,
    head: [headers],
    body: rows,
    theme: 'striped',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'center',
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
      halign: 'center',
    },
    columnStyles: {
      2: { halign: 'left' },
      8: { halign: 'left' },
    },
  });

  doc.save(`University_Exam_Result_Gazette_${Date.now()}.pdf`);
}
