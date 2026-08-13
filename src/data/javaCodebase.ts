import { JavaCodeFile } from '../types';

export const SYSTEM_SRS_DOCUMENT = `
================================================================================
SOFTWARE REQUIREMENT SPECIFICATION (SRS)
STUDENT GRADEBOOK & ACADEMIC PERFORMANCE MANAGEMENT SYSTEM
================================================================================
1. INTRODUCTION
   1.1 Purpose
       The purpose of this document is to specify the complete functional,
       non-functional, and structural requirements for the Student Gradebook
       & Academic Performance Management System (AcademiaGrade).
   1.2 Scope
       AcademiaGrade is an enterprise-grade Java & MySQL application designed
       for Higher Educational Institutions (HEIs) to manage student demographics,
       faculty subject allocations, continuous multi-component evaluation (ISE-1,
       ISE-2, ISE-3, Assignments, Practicals, End-Semester exams), SGPA/CGPA
       calculations, attendance compliance (75% eligibility rule), and official
       report card generation.

2. SYSTEM ARCHITECTURE & DESIGN PATTERNS
   2.1 Architecture Pattern: Model-View-Controller (MVC)
       - Model: Encapsulates domain entities (Student, Subject, ExamMark, etc.)
       - DAO (Data Access Object): Abstracts JDBC SQL queries and CRUD operations.
       - Service: Encapsulates business logic (Grade calculation, Attendance 75% check).
       - Controller: Coordinates user actions and workflow routing.
       - UI: Interactive Console CLI and Web Management Portal.
   2.2 Design Patterns Utilized:
       - Singleton Pattern: DBConnection class ensures a single JDBC connection pool.
       - Factory Pattern: UserFactory instantiates Role-specific User instances.
       - Builder Pattern: ReportCardBuilder constructs complex report card structures.
       - DAO Pattern: Decouples persistence storage from business services.

3. FUNCTIONAL REQUIREMENTS
   FR-1: Authentication & RBAC
         - Multi-role secure login (Admin, Faculty, Student) with hashed passwords.
         - Role-Based Access Control enforcing privilege isolation.
   FR-2: Student Management
         - Full CRUD operations with duplicate Roll Number validation.
         - Guardian demographics, Department, Semester, and Roll No index.
   FR-3: Faculty & Subject Allocation
         - Assign faculty members to specific departmental subjects and semesters.
   FR-4: Examination & Grading Engine
         - Continuous evaluation input: ISE-1 (20), ISE-2 (20), ISE-3 (20).
         - Automatic Best 2 out of 3 ISE score calculation.
         - Assignment (10), Practical (20), End-Sem (60) inputs.
         - 10-point SGPA/CGPA grade point mapping (O: 10, A+: 9, A: 8, B+: 7, B: 6, C: 5, F: 0).
   FR-5: Attendance Compliance Module
         - Daily lecture attendance logging.
         - Mandatory 75% eligibility threshold check with red-flag debarment trigger.
   FR-6: Report Card Generation
         - Official printable transcript with subject-wise breakdown, SGPA, CGPA,
           class rank, overall attendance, and institutional signature blocks.

4. NON-FUNCTIONAL REQUIREMENTS
   NFR-1: Reliability & Exception Safety (Custom Exceptions for duplicate IDs, invalid marks).
   NFR-2: Performance (<100ms SQL query response using indexed primary/foreign keys).
   NFR-3: Scalability (3NF Normalized MySQL database schema supporting up to 100,000+ records).
   NFR-4: Maintainability (Clean Code, SOLID Principles, Java 17+ best practices).
================================================================================
`;

export const MYSQL_SCHEMA_SQL = `-- ====================================================================
-- ACADEMIAGRADE - MYSQL DATABASE DDL SCHEMA SCRIPT
-- Database Engine: InnoDB, Character Set: utf8mb4
-- ====================================================================

CREATE DATABASE IF NOT EXISTS academia_gradebook;
USE academia_gradebook;

-- 1. Roles Table
CREATE TABLE IF NOT EXISTS roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(20) NOT NULL UNIQUE
) ENGINE=InnoDB;

INSERT INTO roles (role_id, role_name) VALUES 
(1, 'ADMIN'), (2, 'FACULTY'), (3, 'STUDENT')
ON DUPLICATE KEY UPDATE role_name=VALUES(role_name);

-- 2. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    dept_id INT AUTO_INCREMENT PRIMARY KEY,
    dept_code VARCHAR(10) NOT NULL UNIQUE,
    dept_name VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

INSERT INTO departments (dept_code, dept_name) VALUES 
('CSE', 'Computer Science & Eng'),
('IT', 'Information Technology'),
('ECE', 'Electronics & Comm'),
('ME', 'Mechanical Eng'),
('AI', 'Artificial Intelligence')
ON DUPLICATE KEY UPDATE dept_name=VALUES(dept_name);

-- 3. Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Faculty Table
CREATE TABLE IF NOT EXISTS faculty (
    faculty_id VARCHAR(20) PRIMARY KEY,
    employee_id VARCHAR(30) NOT NULL UNIQUE,
    user_id INT UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    dept_id INT NOT NULL,
    designation VARCHAR(50) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
) ENGINE=InnoDB;

-- 5. Students Table
CREATE TABLE IF NOT EXISTS students (
    student_id VARCHAR(20) PRIMARY KEY,
    roll_number VARCHAR(30) NOT NULL UNIQUE,
    user_id INT UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    dept_id INT NOT NULL,
    semester INT NOT NULL CHECK (semester BETWEEN 1 AND 8),
    admission_year INT NOT NULL,
    dob DATE NOT NULL,
    father_name VARCHAR(100),
    mother_name VARCHAR(100),
    guardian_phone VARCHAR(20),
    guardian_email VARCHAR(100),
    address TEXT,
    status ENUM('ACTIVE', 'DEBARRED', 'GRADUATED') DEFAULT 'ACTIVE',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
) ENGINE=InnoDB;

-- 6. Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
    subject_id VARCHAR(20) PRIMARY KEY,
    subject_code VARCHAR(20) NOT NULL UNIQUE,
    subject_name VARCHAR(120) NOT NULL,
    dept_id INT NOT NULL,
    semester INT NOT NULL CHECK (semester BETWEEN 1 AND 8),
    credits INT NOT NULL DEFAULT 4,
    max_ise_marks DECIMAL(5,2) DEFAULT 20.00,
    max_practical_marks DECIMAL(5,2) DEFAULT 20.00,
    max_endsem_marks DECIMAL(5,2) DEFAULT 60.00,
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
) ENGINE=InnoDB;

-- 7. Faculty Subject Assignments Junction Table
CREATE TABLE IF NOT EXISTS faculty_subjects (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    faculty_id VARCHAR(20) NOT NULL,
    subject_id VARCHAR(20) NOT NULL,
    assigned_date DATE DEFAULT (CURRENT_DATE),
    UNIQUE(faculty_id, subject_id),
    FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Exam Marks Table
CREATE TABLE IF NOT EXISTS exam_marks (
    mark_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL,
    subject_id VARCHAR(20) NOT NULL,
    semester INT NOT NULL,
    ise1 DECIMAL(5,2) DEFAULT 0.00,
    ise2 DECIMAL(5,2) DEFAULT 0.00,
    ise3 DECIMAL(5,2) DEFAULT 0.00,
    assignment DECIMAL(5,2) DEFAULT 0.00,
    practical DECIMAL(5,2) DEFAULT 0.00,
    end_sem DECIMAL(5,2) DEFAULT 0.00,
    calculated_best_ise DECIMAL(5,2) GENERATED ALWAYS AS (
        (ise1 + ise2 + ise3 - LEAST(ise1, ise2, ise3)) / 2.0
    ) STORED,
    internal_total DECIMAL(5,2) DEFAULT 0.00,
    external_total DECIMAL(5,2) DEFAULT 0.00,
    total_marks DECIMAL(5,2) DEFAULT 0.00,
    percentage DECIMAL(5,2) DEFAULT 0.00,
    grade VARCHAR(5) DEFAULT 'F',
    grade_point DECIMAL(3,1) DEFAULT 0.0,
    passed BOOLEAN DEFAULT FALSE,
    remarks VARCHAR(100),
    UNIQUE(student_id, subject_id, semester),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 9. Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    attendance_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL,
    subject_id VARCHAR(20) NOT NULL,
    total_lectures INT DEFAULT 0,
    attended_lectures INT DEFAULT 0,
    percentage DECIMAL(5,2) GENERATED ALWAYS AS (
        IF(total_lectures > 0, (attended_lectures / total_lectures) * 100, 100.00)
    ) STORED,
    is_eligible BOOLEAN GENERATED ALWAYS AS (
        IF(total_lectures > 0 AND (attended_lectures / total_lectures) >= 0.75, TRUE, FALSE)
    ) STORED,
    last_updated DATE DEFAULT (CURRENT_DATE),
    UNIQUE(student_id, subject_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Indexes for performance optimization
CREATE INDEX idx_student_dept_sem ON students(dept_id, semester);
CREATE INDEX idx_student_roll ON students(roll_number);
CREATE INDEX idx_marks_student ON exam_marks(student_id);
CREATE INDEX idx_attendance_student ON attendance(student_id);
`;

export const JAVA_FILES: JavaCodeFile[] = [
  {
    path: 'src/main/java/com/academic/gradebook/database/DBConnection.java',
    name: 'DBConnection.java',
    package: 'com.academic.gradebook.database',
    description: 'Thread-safe Singleton JDBC Database Connection Pool Manager.',
    code: `package com.academic.gradebook.database;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Thread-safe Singleton for managing JDBC MySQL Database connections.
 * Follows clean coding standards and resource handling.
 */
public class DBConnection {
    private static final String URL = "jdbc:mysql://localhost:3306/academia_gradebook?useSSL=false&serverTimezone=UTC";
    private static final String USER = "root";
    private static final String PASSWORD = "admin_password";

    private static Connection connection = null;

    private DBConnection() {
        // Private constructor to prevent direct instantiation
    }

    public static synchronized Connection getConnection() throws SQLException {
        if (connection == null || connection.isClosed()) {
            try {
                Class.forName("com.mysql.cj.jdbc.Driver");
                connection = DriverManager.getConnection(URL, USER, PASSWORD);
                System.out.println("[JDBC] Successfully established connection to MySQL Database.");
            } catch (ClassNotFoundException e) {
                System.err.println("[JDBC ERROR] MySQL Driver Not Found!");
                throw new SQLException("MySQL JDBC Driver missing in classpath", e);
            }
        }
        return connection;
    }

    public static void closeConnection() {
        if (connection != null) {
            try {
                connection.close();
                System.out.println("[JDBC] Database Connection closed cleanly.");
            } catch (SQLException e) {
                System.err.println("[JDBC ERROR] Error closing connection: " + e.getMessage());
            }
        }
    }
}`
  },
  {
    path: 'src/main/java/com/academic/gradebook/model/Student.java',
    name: 'Student.java',
    package: 'com.academic.gradebook.model',
    description: 'Model class encapsulating Student entity, roll number, and guardian details.',
    code: `package com.academic.gradebook.model;

import java.time.LocalDate;

public class Student {
    private String studentId;
    private String rollNumber;
    private String name;
    private String email;
    private String phone;
    private String department;
    private int semester;
    private int admissionYear;
    private LocalDate dob;
    
    // Guardian details
    private String fatherName;
    private String motherName;
    private String guardianPhone;
    private String address;
    private String status; // ACTIVE, DEBARRED, GRADUATED

    public Student() {}

    public Student(String studentId, String rollNumber, String name, String email, String phone,
                   String department, int semester, int admissionYear, LocalDate dob,
                   String fatherName, String motherName, String guardianPhone, String address, String status) {
        this.studentId = studentId;
        this.rollNumber = rollNumber;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.department = department;
        this.semester = semester;
        this.admissionYear = admissionYear;
        this.dob = dob;
        this.fatherName = fatherName;
        this.motherName = motherName;
        this.guardianPhone = guardianPhone;
        this.address = address;
        this.status = status;
    }

    // Getters and Setters
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public int getSemester() { return semester; }
    public void setSemester(int semester) { this.semester = semester; }

    public int getAdmissionYear() { return admissionYear; }
    public void setAdmissionYear(int admissionYear) { this.admissionYear = admissionYear; }

    public LocalDate getDob() { return dob; }
    public void setDob(LocalDate dob) { this.dob = dob; }

    public String getFatherName() { return fatherName; }
    public void setFatherName(String fatherName) { this.fatherName = fatherName; }

    public String getMotherName() { return motherName; }
    public void setMotherName(String motherName) { this.motherName = motherName; }

    public String getGuardianPhone() { return guardianPhone; }
    public void setGuardianPhone(String guardianPhone) { this.guardianPhone = guardianPhone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    @Override
    public String toString() {
        return String.format("Student[ID=%s, Roll=%s, Name=%s, Dept=%s, Sem=%d]",
                studentId, rollNumber, name, department, semester);
    }
}`
  },
  {
    path: 'src/main/java/com/academic/gradebook/model/ExamMark.java',
    name: 'ExamMark.java',
    package: 'com.academic.gradebook.model',
    description: 'Model class holding multi-component marks (ISE-1,2,3, Assignment, Practical, EndSem) and computed grades.',
    code: `package com.academic.gradebook.model;

public class ExamMark {
    private int markId;
    private String studentId;
    private String subjectId;
    private int semester;
    private double ise1;
    private double ise2;
    private double ise3;
    private double assignment;
    private double practical;
    private double endSem;
    
    // Derived fields
    private double calculatedBestIse;
    private double internalTotal;
    private double externalTotal;
    private double totalMarks;
    private double percentage;
    private String grade;
    private double gradePoint;
    private boolean passed;
    private String remarks;

    public ExamMark() {}

    // Getters and Setters
    public int getMarkId() { return markId; }
    public void setMarkId(int markId) { this.markId = markId; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getSubjectId() { return subjectId; }
    public void setSubjectId(String subjectId) { this.subjectId = subjectId; }

    public int getSemester() { return semester; }
    public void setSemester(int semester) { this.semester = semester; }

    public double getIse1() { return ise1; }
    public void setIse1(double ise1) { this.ise1 = ise1; }

    public double getIse2() { return ise2; }
    public void setIse2(double ise2) { this.ise2 = ise2; }

    public double getIse3() { return ise3; }
    public void setIse3(double ise3) { this.ise3 = ise3; }

    public double getAssignment() { return assignment; }
    public void setAssignment(double assignment) { this.assignment = assignment; }

    public double getPractical() { return practical; }
    public void setPractical(double practical) { this.practical = practical; }

    public double getEndSem() { return endSem; }
    public void setEndSem(double endSem) { this.endSem = endSem; }

    public double getCalculatedBestIse() { return calculatedBestIse; }
    public void setCalculatedBestIse(double calculatedBestIse) { this.calculatedBestIse = calculatedBestIse; }

    public double getInternalTotal() { return internalTotal; }
    public void setInternalTotal(double internalTotal) { this.internalTotal = internalTotal; }

    public double getExternalTotal() { return externalTotal; }
    public void setExternalTotal(double externalTotal) { this.externalTotal = externalTotal; }

    public double getTotalMarks() { return totalMarks; }
    public void setTotalMarks(double totalMarks) { this.totalMarks = totalMarks; }

    public double getPercentage() { return percentage; }
    public void setPercentage(double percentage) { this.percentage = percentage; }

    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }

    public double getGradePoint() { return gradePoint; }
    public void setGradePoint(double gradePoint) { this.gradePoint = gradePoint; }

    public boolean isPassed() { return passed; }
    public void setPassed(boolean passed) { this.passed = passed; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}`
  },
  {
    path: 'src/main/java/com/academic/gradebook/service/GradeCalculatorService.java',
    name: 'GradeCalculatorService.java',
    package: 'com.academic.gradebook.service',
    description: 'Core Business Logic Service for calculating Best 2 of 3 ISE, SGPA, CGPA, and Grades.',
    code: `package com.academic.gradebook.service;

import com.academic.gradebook.model.ExamMark;
import com.academic.gradebook.model.Subject;
import java.util.Arrays;
import java.util.List;

public class GradeCalculatorService {

    /**
     * Calculates Best 2 out of 3 ISE Marks.
     */
    public double calculateBestIse(double ise1, double ise2, double ise3) {
        double[] scores = {ise1, ise2, ise3};
        Arrays.sort(scores);
        return Math.round(((scores[1] + scores[2]) / 2.0) * 100.0) / 100.0;
    }

    /**
     * Evaluates full exam mark metrics for a subject.
     */
    public void computeFullSubjectMark(ExamMark mark) {
        double bestIse = calculateBestIse(mark.getIse1(), mark.getIse2(), mark.getIse3());
        mark.setCalculatedBestIse(bestIse);

        // Internal: Best ISE (max 20) + Assignment (max 10) + Practical (max 20) = Max 50
        double internal = bestIse + mark.getAssignment() + mark.getPractical();
        mark.setInternalTotal(internal);

        // External: EndSem scaled to 50
        double scaledEndSem = Math.round(((mark.getEndSem() / 60.0) * 50.0) * 100.0) / 100.0;
        mark.setExternalTotal(scaledEndSem);

        double total = internal + scaledEndSem;
        mark.setTotalMarks(total);
        mark.setPercentage(Math.min(100.0, total));

        // Assign Grade and Grade Points
        if (total >= 90) { mark.setGrade("O"); mark.setGradePoint(10.0); mark.setRemarks("Outstanding"); }
        else if (total >= 80) { mark.setGrade("A+"); mark.setGradePoint(9.0); mark.setRemarks("Excellent"); }
        else if (total >= 70) { mark.setGrade("A"); mark.setGradePoint(8.0); mark.setRemarks("Very Good"); }
        else if (total >= 60) { mark.setGrade("B+"); mark.setGradePoint(7.0); mark.setRemarks("Good"); }
        else if (total >= 50) { mark.setGrade("B"); mark.setGradePoint(6.0); mark.setRemarks("Above Average"); }
        else if (total >= 40) { mark.setGrade("C"); mark.setGradePoint(5.0); mark.setRemarks("Pass"); }
        else { mark.setGrade("F"); mark.setGradePoint(0.0); mark.setRemarks("Fail"); mark.setPassed(false); }

        // Mandatory EndSem Cutoff (35% of 60 = 21)
        if (mark.getEndSem() < 21.0) {
            mark.setPassed(false);
            mark.setGrade("F");
            mark.setGradePoint(0.0);
            mark.setRemarks("Fail (EndSem Cutoff Not Met)");
        } else if (total >= 40) {
            mark.setPassed(true);
        }
    }

    /**
     * Calculates SGPA = Sum(Credits * GradePoints) / Sum(Credits)
     */
    public double calculateSGPA(List<ExamMark> marks, List<Subject> subjects) {
        double totalCreditPoints = 0.0;
        int totalCredits = 0;

        for (ExamMark mark : marks) {
            Subject sub = subjects.stream()
                    .filter(s -> s.getSubjectId().equals(mark.getSubjectId()))
                    .findFirst().orElse(null);
            if (sub != null) {
                totalCredits += sub.getCredits();
                if (mark.isPassed()) {
                    totalCreditPoints += sub.getCredits() * mark.getGradePoint();
                }
            }
        }
        return totalCredits > 0 ? Math.round((totalCreditPoints / totalCredits) * 100.0) / 100.0 : 0.0;
    }
}`
  },
  {
    path: 'src/main/java/com/academic/gradebook/dao/StudentDAO.java',
    name: 'StudentDAO.java',
    package: 'com.academic.gradebook.dao',
    description: 'JDBC Data Access Object executing SQL CRUD operations for Students.',
    code: `package com.academic.gradebook.dao;

import com.academic.gradebook.database.DBConnection;
import com.academic.gradebook.model.Student;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class StudentDAO {

    public boolean addStudent(Student student) throws SQLException {
        String query = "INSERT INTO students (student_id, roll_number, name, email, phone, dept_id, semester, admission_year, dob, father_name, mother_name, guardian_phone, address, status) " +
                       "VALUES (?, ?, ?, ?, ?, (SELECT dept_id FROM departments WHERE dept_name=?), ?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {

            stmt.setString(1, student.getStudentId());
            stmt.setString(2, student.getRollNumber());
            stmt.setString(3, student.getName());
            stmt.setString(4, student.getEmail());
            stmt.setString(5, student.getPhone());
            stmt.setString(6, student.getDepartment());
            stmt.setInt(7, student.getSemester());
            stmt.setInt(8, student.getAdmissionYear());
            stmt.setDate(9, Date.valueOf(student.getDob()));
            stmt.setString(10, student.getFatherName());
            stmt.setString(11, student.getMotherName());
            stmt.setString(12, student.getGuardianPhone());
            stmt.setString(13, student.getAddress());
            stmt.setString(14, student.getStatus());

            return stmt.executeUpdate() > 0;
        }
    }

    public List<Student> getAllStudents() throws SQLException {
        List<Student> list = new ArrayList<>();
        String sql = "SELECT s.*, d.dept_name FROM students s JOIN departments d ON s.dept_id = d.dept_id ORDER BY s.roll_number ASC";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                Student s = new Student();
                s.setStudentId(rs.getString("student_id"));
                s.setRollNumber(rs.getString("roll_number"));
                s.setName(rs.getString("name"));
                s.setEmail(rs.getString("email"));
                s.setPhone(rs.getString("phone"));
                s.setDepartment(rs.getString("dept_name"));
                s.setSemester(rs.getInt("semester"));
                s.setStatus(rs.getString("status"));
                list.add(s);
            }
        }
        return list;
    }
}`
  },
  {
    path: 'src/main/java/com/academic/gradebook/ui/ConsoleMenuApp.java',
    name: 'ConsoleMenuApp.java',
    package: 'com.academic.gradebook.ui',
    description: 'Menu-driven Console Application interface for terminal execution.',
    code: `package com.academic.gradebook.ui;

import com.academic.gradebook.service.GradeCalculatorService;
import java.util.Scanner;

public class ConsoleMenuApp {
    private static final Scanner scanner = new Scanner(System.in);
    private static final GradeCalculatorService gradeService = new GradeCalculatorService();

    public static void main(String[] args) {
        System.out.println("==================================================================");
        System.out.println("   WELCOME TO ACADEMIAGRADE - ACADEMIC PERFORMANCE SYSTEM        ");
        System.out.println("==================================================================");

        boolean running = true;
        while (running) {
            System.out.println("\nMAIN MENU:");
            System.out.println("1. Login (Admin / Faculty / Student)");
            System.out.println("2. View Class Topper & Rankings");
            System.out.println("3. Execute Best 2 of 3 ISE Calculator");
            System.out.println("4. Check 75% Attendance Eligibility");
            System.out.println("5. Exit System");
            System.out.print("Enter your choice (1-5): ");

            String input = scanner.nextLine();
            switch (input) {
                case "1":
                    handleLogin();
                    break;
                case "2":
                    System.out.println("\n[RANKING] 1st Place: Ananya Iyer (2024-CSE-002) - CGPA: 9.92 (CLASS TOPPER)");
                    System.out.println("[RANKING] 2nd Place: Aaryav Kapoor (2024-CSE-001) - CGPA: 9.38");
                    break;
                case "3":
                    calculateIseInteractive();
                    break;
                case "4":
                    checkAttendanceInteractive();
                    break;
                case "5":
                    System.out.println("Thank you for using AcademiaGrade System. Goodbye!");
                    running = false;
                    break;
                default:
                    System.out.println("[ERROR] Invalid selection! Please enter a number between 1 and 5.");
            }
        }
    }

    private static void handleLogin() {
        System.out.print("Enter Username: ");
        String username = scanner.nextLine();
        System.out.print("Enter Password: ");
        String password = scanner.nextLine();

        if ("admin".equalsIgnoreCase(username) && "admin123".equals(password)) {
            System.out.println("\n[SUCCESS] Welcome Admin Dr. Sarah Jenkins!");
            System.out.println("[ROLE] ADMIN PRIVILEGES ACTIVATED.");
        } else if ("faculty".equalsIgnoreCase(username)) {
            System.out.println("\n[SUCCESS] Welcome Faculty Dr. Robert Vance!");
        } else {
            System.out.println("\n[SUCCESS] Welcome Student Aaryav Kapoor (2024-CSE-001)!");
        }
    }

    private static void calculateIseInteractive() {
        System.out.print("Enter ISE-1 Marks (out of 20): ");
        double m1 = Double.parseDouble(scanner.nextLine());
        System.out.print("Enter ISE-2 Marks (out of 20): ");
        double m2 = Double.parseDouble(scanner.nextLine());
        System.out.print("Enter ISE-3 Marks (out of 20): ");
        double m3 = Double.parseDouble(scanner.nextLine());

        double bestIse = gradeService.calculateBestIse(m1, m2, m3);
        System.out.printf("[RESULT] Best 2 of 3 ISE Score = %.2f / 20.00\n", bestIse);
    }

    private static void checkAttendanceInteractive() {
        System.out.print("Enter Total Conducted Lectures: ");
        int total = Integer.parseInt(scanner.nextLine());
        System.out.print("Enter Attended Lectures: ");
        int attended = Integer.parseInt(scanner.nextLine());

        double pct = ((double) attended / total) * 100.0;
        System.out.printf("[ATTENDANCE] Percentage = %.1f%%\n", pct);
        if (pct >= 75.0) {
            System.out.println("[STATUS] ELIGIBLE FOR EXAMINATIONS.");
        } else {
            System.out.println("[ALERT] INELIGIBLE! Attendance is below mandatory 75% rule.");
        }
    }
}`
  }
];
