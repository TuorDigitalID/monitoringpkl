import {
  User,
  Student,
  Teacher,
  Dudi,
  DailyJournal,
  AttendanceRecord,
  EvaluationGrade,
  SupervisionLog,
  ApplicationLetter,
  UserRole,
  ClassMajorItem
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_STUDENTS,
  INITIAL_TEACHERS,
  INITIAL_DUDIS,
  INITIAL_JOURNALS,
  INITIAL_ATTENDANCES,
  INITIAL_SUPERVISIONS,
  INITIAL_GRADES,
  INITIAL_LETTERS,
  INITIAL_CLASSES
} from './initialData';

const STORE_KEY_PREFIX = 'sim_pkl_store_v1_';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(STORE_KEY_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(STORE_KEY_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export class DBStore {
  private users: User[];
  private students: Student[];
  private teachers: Teacher[];
  private dudis: Dudi[];
  private journals: DailyJournal[];
  private attendances: AttendanceRecord[];
  private supervisions: SupervisionLog[];
  private grades: EvaluationGrade[];
  private letters: ApplicationLetter[];
  private classes: ClassMajorItem[];
  private currentUser: User;

  private listeners: (() => void)[] = [];

  constructor() {
    this.users = loadFromStorage('users', INITIAL_USERS);
    this.students = loadFromStorage('students', INITIAL_STUDENTS);
    this.teachers = loadFromStorage('teachers', INITIAL_TEACHERS);
    this.dudis = loadFromStorage('dudis', INITIAL_DUDIS);
    this.journals = loadFromStorage('journals', INITIAL_JOURNALS);
    this.attendances = loadFromStorage('attendances', INITIAL_ATTENDANCES);
    this.supervisions = loadFromStorage('supervisions', INITIAL_SUPERVISIONS);
    this.grades = loadFromStorage('grades', INITIAL_GRADES);
    this.letters = loadFromStorage('letters', INITIAL_LETTERS);
    this.classes = loadFromStorage('classes', INITIAL_CLASSES);

    const savedUserRole = loadFromStorage<UserRole>('active_role', 'admin');
    const matchedUser = this.users.find((u) => u.role === savedUserRole) || this.users[0];
    this.currentUser = matchedUser;
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // --- Current User & Role & Authentication ---
  public getIsLoggedIn(): boolean {
    return loadFromStorage<boolean>('is_logged_in', false);
  }

  public login(identifier: string, password?: string): { success: boolean; message?: string; user?: User } {
    const term = identifier.trim().toLowerCase();
    
    // Find matching user by email, nisn, nip, or id
    let matched = this.users.find((u) => {
      if (u.email && u.email.toLowerCase() === term) return true;
      if (u.nisn && u.nisn.toLowerCase() === term) return true;
      if (u.nip && u.nip.toLowerCase() === term) return true;
      if (u.id.toLowerCase() === term) return true;
      return false;
    });

    // Fallback search by role name or name match if provided
    if (!matched) {
      if (term === 'admin' || term === 'koordinator') {
        matched = this.users.find((u) => u.role === 'admin');
      } else if (term === 'guru') {
        matched = this.users.find((u) => u.role === 'guru');
      } else if (term === 'siswa') {
        matched = this.users.find((u) => u.role === 'siswa');
      }
    }

    if (!matched) {
      return { success: false, message: 'Akun dengan NISN / Email / NIP tersebut tidak ditemukan.' };
    }

    // Verify password if provided
    if (password && password.trim().length > 0) {
      const userPass = matched.password ? matched.password.trim() : 'password123';
      if (password.trim() !== userPass) {
        return { success: false, message: 'Kata sandi yang Anda masukkan salah.' };
      }
    }

    this.currentUser = matched;
    saveToStorage('active_role', matched.role);
    saveToStorage('is_logged_in', true);
    this.notify();

    return { success: true, user: matched };
  }

  public logout() {
    saveToStorage('is_logged_in', false);
    this.notify();
  }

  public getCurrentUser(): User {
    return this.currentUser;
  }

  public getUsers(): User[] {
    return this.users;
  }

  public addUser(user: User) {
    this.users.unshift(user);
    saveToStorage('users', this.users);
    this.notify();
  }

  public updateUser(user: User) {
    this.users = this.users.map((u) => (u.id === user.id ? user : u));
    saveToStorage('users', this.users);
    this.notify();
  }

  public deleteUser(id: string) {
    this.users = this.users.filter((u) => u.id !== id);
    saveToStorage('users', this.users);
    this.notify();
  }

  public setCurrentRole(role: UserRole) {
    const found = this.users.find((u) => u.role === role);
    if (found) {
      this.currentUser = found;
      saveToStorage('active_role', role);
      this.notify();
    }
  }

  // --- Students ---
  public getStudents(): Student[] {
    return this.students;
  }

  public getStudentById(id: string): Student | undefined {
    return this.students.find((s) => s.id === id);
  }

  public addStudent(student: Student) {
    this.students.unshift(student);
    saveToStorage('students', this.students);
    this.notify();
  }

  public updateStudent(student: Student) {
    this.students = this.students.map((s) => (s.id === student.id ? student : s));
    saveToStorage('students', this.students);
    this.notify();
  }

  // --- Teachers ---
  public getTeachers(): Teacher[] {
    return this.teachers;
  }

  public addTeacher(teacher: Teacher) {
    this.teachers.unshift(teacher);
    saveToStorage('teachers', this.teachers);
    this.notify();
  }

  public updateTeacher(teacher: Teacher) {
    this.teachers = this.teachers.map((t) => (t.id === teacher.id ? teacher : t));
    saveToStorage('teachers', this.teachers);
    this.notify();
  }

  public deleteTeacher(id: string) {
    this.teachers = this.teachers.filter((t) => t.id !== id);
    saveToStorage('teachers', this.teachers);
    this.notify();
  }

  // --- DUDIs ---
  public getDudis(): Dudi[] {
    return this.dudis;
  }

  public addDudi(dudi: Dudi) {
    this.dudis.unshift(dudi);
    saveToStorage('dudis', this.dudis);
    this.notify();
  }

  public updateDudi(dudi: Dudi) {
    this.dudis = this.dudis.map((d) => (d.id === dudi.id ? dudi : d));
    saveToStorage('dudis', this.dudis);
    this.notify();
  }

  public deleteDudi(id: string) {
    this.dudis = this.dudis.filter((d) => d.id !== id);
    saveToStorage('dudis', this.dudis);
    this.notify();
  }

  // --- Journals ---
  public getJournals(): DailyJournal[] {
    return this.journals;
  }

  public getJournalsByStudent(studentId: string): DailyJournal[] {
    return this.journals.filter((j) => j.studentId === studentId);
  }

  public addJournal(journal: DailyJournal) {
    this.journals.unshift(journal);
    saveToStorage('journals', this.journals);
    this.notify();
  }

  public updateJournal(journal: DailyJournal) {
    this.journals = this.journals.map((j) => (j.id === journal.id ? journal : j));
    saveToStorage('journals', this.journals);
    this.notify();
  }

  // --- Attendances ---
  public getAttendances(): AttendanceRecord[] {
    return this.attendances;
  }

  public getAttendancesByStudent(studentId: string): AttendanceRecord[] {
    return this.attendances.filter((a) => a.studentId === studentId);
  }

  public addAttendance(att: AttendanceRecord) {
    // Check if already checked in today for student
    const existingIndex = this.attendances.findIndex(
      (a) => a.studentId === att.studentId && a.date === att.date
    );
    if (existingIndex >= 0) {
      this.attendances[existingIndex] = { ...this.attendances[existingIndex], ...att };
    } else {
      this.attendances.unshift(att);
    }
    saveToStorage('attendances', this.attendances);
    this.notify();
  }

  public validateAttendance(attId: string, validated: boolean) {
    this.attendances = this.attendances.map((a) =>
      a.id === attId ? { ...a, validatedByDudi: validated } : a
    );
    saveToStorage('attendances', this.attendances);
    this.notify();
  }

  // --- Supervisions ---
  public getSupervisions(): SupervisionLog[] {
    return this.supervisions;
  }

  public addSupervision(log: SupervisionLog) {
    this.supervisions.unshift(log);
    saveToStorage('supervisions', this.supervisions);
    this.notify();
  }

  // --- Grades ---
  public getGrades(): EvaluationGrade[] {
    return this.grades;
  }

  public getGradeByStudent(studentId: string): EvaluationGrade | undefined {
    return this.grades.find((g) => g.studentId === studentId);
  }

  public saveGrade(grade: EvaluationGrade) {
    const existing = this.grades.findIndex((g) => g.studentId === grade.studentId);
    if (existing >= 0) {
      this.grades[existing] = grade;
    } else {
      this.grades.unshift(grade);
    }
    saveToStorage('grades', this.grades);
    this.notify();
  }

  // --- Letters ---
  public getLetters(): ApplicationLetter[] {
    return this.letters;
  }

  public addLetter(letter: ApplicationLetter) {
    this.letters.unshift(letter);
    saveToStorage('letters', this.letters);
    this.notify();
  }

  // --- Classes & Majors ---
  public getClasses(): ClassMajorItem[] {
    return this.classes;
  }

  public addClass(cls: ClassMajorItem) {
    this.classes = [...this.classes, cls];
    saveToStorage('classes', this.classes);
    this.notify();
  }

  public updateClass(updated: ClassMajorItem) {
    this.classes = this.classes.map((c) => (c.id === updated.id ? updated : c));
    saveToStorage('classes', this.classes);
    this.notify();
  }

  public deleteClass(id: string) {
    this.classes = this.classes.filter((c) => c.id !== id);
    saveToStorage('classes', this.classes);
    this.notify();
  }

  // Reset to default sample dataset
  public resetToDefault() {
    this.users = INITIAL_USERS;
    this.students = INITIAL_STUDENTS;
    this.teachers = INITIAL_TEACHERS;
    this.dudis = INITIAL_DUDIS;
    this.journals = INITIAL_JOURNALS;
    this.attendances = INITIAL_ATTENDANCES;
    this.supervisions = INITIAL_SUPERVISIONS;
    this.grades = INITIAL_GRADES;
    this.letters = INITIAL_LETTERS;
    this.classes = INITIAL_CLASSES;

    saveToStorage('users', this.users);
    saveToStorage('students', this.students);
    saveToStorage('teachers', this.teachers);
    saveToStorage('dudis', this.dudis);
    saveToStorage('journals', this.journals);
    saveToStorage('attendances', this.attendances);
    saveToStorage('supervisions', this.supervisions);
    saveToStorage('grades', this.grades);
    saveToStorage('letters', this.letters);
    saveToStorage('classes', this.classes);

    this.notify();
  }
}

export const dbStore = new DBStore();
