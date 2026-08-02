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
import {
  syncUpsertUser,
  syncDeleteUser,
  syncUpsertDudi,
  syncDeleteDudi,
  syncUpsertTeacher,
  syncDeleteTeacher,
  syncUpsertStudent,
  syncDeleteStudent,
  syncUpsertClass,
  syncDeleteClass,
  syncUpsertJournal,
  syncUpsertAttendance,
  syncUpsertGrade,
  fetchAllDataFromSupabase,
  pushAllDataToSupabase
} from '../lib/supabase';

const STORE_KEY_PREFIX = 'sim_pkl_store_v2_';

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

    // Run initial sync from Master Data Siswa and Master Data Guru to Users
    this.syncMasterToUsers(false);

    // Asynchronously fetch latest dataset from Supabase Cloud if connected
    this.initCloudSync();
  }

  public syncMasterToUsers(notify: boolean = true) {
    let updated = false;

    // 1. Sync Students -> Users
    this.students.forEach((std) => {
      const existingIdx = this.users.findIndex(
        (u) => (u.nisn && u.nisn === std.nisn) || u.id === std.id
      );
      const generatedEmail = `${(std.nisn || std.id).toLowerCase()}@siswa.simpkl.com`;
      if (existingIdx >= 0) {
        const current = this.users[existingIdx];
        if (
          current.name !== std.name ||
          current.classMajor !== std.classMajor ||
          current.phone !== std.phone ||
          current.nisn !== std.nisn
        ) {
          this.users[existingIdx] = {
            ...current,
            name: std.name,
            nisn: std.nisn,
            classMajor: std.classMajor,
            phone: std.phone || current.phone,
            role: 'siswa'
          };
          syncUpsertUser(this.users[existingIdx]);
          updated = true;
        }
      } else {
        const newUser: User = {
          id: std.id.startsWith('usr-') ? std.id : `usr-std-${std.id}`,
          name: std.name,
          email: generatedEmail,
          role: 'siswa',
          nisn: std.nisn,
          phone: std.phone || '-',
          classMajor: std.classMajor,
          password: 'password123'
        };
        this.users.push(newUser);
        syncUpsertUser(newUser);
        updated = true;
      }
    });

    // 2. Sync Teachers -> Users
    this.teachers.forEach((tch) => {
      const existingIdx = this.users.findIndex(
        (u) =>
          (u.nip && u.nip === tch.nip) ||
          u.id === tch.id ||
          (u.email && u.email.toLowerCase() === tch.email?.toLowerCase())
      );
      const generatedEmail = tch.email || `${(tch.nip || tch.id).toLowerCase()}@guru.simpkl.com`;
      if (existingIdx >= 0) {
        const current = this.users[existingIdx];
        if (
          current.name !== tch.name ||
          current.nip !== tch.nip ||
          current.phone !== tch.phone ||
          current.email !== generatedEmail
        ) {
          this.users[existingIdx] = {
            ...current,
            name: tch.name,
            nip: tch.nip,
            email: generatedEmail,
            phone: tch.phone || current.phone,
            password: tch.password || current.password || 'guru@123',
            role: 'guru'
          };
          syncUpsertUser(this.users[existingIdx]);
          updated = true;
        }
      } else {
        const newUser: User = {
          id: tch.id.startsWith('usr-') ? tch.id : `usr-tch-${tch.id}`,
          name: tch.name,
          email: generatedEmail,
          role: 'guru',
          nip: tch.nip,
          phone: tch.phone || '-',
          password: tch.password || 'guru@123'
        };
        this.users.push(newUser);
        syncUpsertUser(newUser);
        updated = true;
      }
    });

    if (updated) {
      saveToStorage('users', this.users);
      if (notify) this.notify();
    }
  }

  private async initCloudSync() {
    try {
      const cloudData = await fetchAllDataFromSupabase();
      if (cloudData) {
        let hasNewDataFromCloud = false;

        if (Array.isArray(cloudData.users) && cloudData.users.length > 0) {
          this.users = cloudData.users;
          saveToStorage('users', this.users);
          hasNewDataFromCloud = true;
        } else if (this.users.length > 0) {
          pushAllDataToSupabase({ users: this.users });
        }

        if (Array.isArray(cloudData.dudis) && cloudData.dudis.length > 0) {
          this.dudis = cloudData.dudis;
          saveToStorage('dudis', this.dudis);
          hasNewDataFromCloud = true;
        } else if (this.dudis.length > 0) {
          pushAllDataToSupabase({ dudis: this.dudis });
        }

        if (Array.isArray(cloudData.teachers) && cloudData.teachers.length > 0) {
          this.teachers = cloudData.teachers;
          saveToStorage('teachers', this.teachers);
          hasNewDataFromCloud = true;
        } else if (this.teachers.length > 0) {
          pushAllDataToSupabase({ teachers: this.teachers });
        }

        if (Array.isArray(cloudData.students) && cloudData.students.length > 0) {
          this.students = cloudData.students;
          saveToStorage('students', this.students);
          hasNewDataFromCloud = true;
        } else if (this.students.length > 0) {
          pushAllDataToSupabase({ students: this.students });
        }

        if (Array.isArray(cloudData.classes) && cloudData.classes.length > 0) {
          this.classes = cloudData.classes;
          saveToStorage('classes', this.classes);
          hasNewDataFromCloud = true;
        } else if (this.classes.length > 0) {
          pushAllDataToSupabase({ classes: this.classes });
        }

        if (Array.isArray(cloudData.journals) && cloudData.journals.length > 0) {
          this.journals = cloudData.journals;
          saveToStorage('journals', this.journals);
          hasNewDataFromCloud = true;
        } else if (this.journals.length > 0) {
          pushAllDataToSupabase({ journals: this.journals });
        }

        if (Array.isArray(cloudData.attendances) && cloudData.attendances.length > 0) {
          this.attendances = cloudData.attendances;
          saveToStorage('attendances', this.attendances);
          hasNewDataFromCloud = true;
        } else if (this.attendances.length > 0) {
          pushAllDataToSupabase({ attendances: this.attendances });
        }

        if (Array.isArray(cloudData.grades) && cloudData.grades.length > 0) {
          this.grades = cloudData.grades;
          saveToStorage('grades', this.grades);
          hasNewDataFromCloud = true;
        } else if (this.grades.length > 0) {
          pushAllDataToSupabase({ grades: this.grades });
        }

        if (hasNewDataFromCloud) {
          this.notify();
        }
      }
    } catch (e) {
      console.warn('Initial cloud sync skipped or failed:', e);
    }
  }

  public async syncAllToCloud() {
    return await pushAllDataToSupabase({
      users: this.users,
      dudis: this.dudis,
      teachers: this.teachers,
      students: this.students,
      classes: this.classes,
      journals: this.journals,
      attendances: this.attendances,
      grades: this.grades
    });
  }

  public async reFetchFromCloud() {
    await this.initCloudSync();
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

    // Fallback search by role keywords or common demo emails (e.g. admin@simpkl.com)
    if (!matched) {
      if (term.includes('admin') || term.includes('koordinator') || term === 'admin@simpkl.com' || term === 'admin@smkn1.sch.id') {
        matched = this.users.find((u) => u.role === 'admin');
      } else if (term.includes('guru') || term === 'guru@smkn1.sch.id') {
        matched = this.users.find((u) => u.role === 'guru');
      } else if (term.includes('siswa') || term === 'siswa@smkn1.sch.id') {
        matched = this.users.find((u) => u.role === 'siswa');
      } else if (term.includes('dudi') || term === 'dudi@telkom.co.id') {
        matched = this.users.find((u) => u.role === 'dudi');
      }
    }

    if (!matched) {
      return { success: false, message: 'Akun dengan NISN / Email / NIP tersebut tidak ditemukan. Gunakan admin@simpkl.com, email terdaftar, atau NIP/NISN.' };
    }

    // Verify password if provided
    if (password && password.trim().length > 0) {
      const userPass = matched.password ? matched.password.trim() : 'password123';
      const inputPass = password.trim();
      // Allow user's password, 'password123', 'admin123', or '123456'
      if (inputPass !== userPass && inputPass !== 'password123' && inputPass !== 'admin123' && inputPass !== '123456') {
        return { success: false, message: 'Kata sandi salah. Gunakan kata sandi akun Anda atau "password123".' };
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
    this.syncMasterToUsers(false);
    return this.users;
  }

  public addUser(user: User) {
    this.users.unshift(user);
    saveToStorage('users', this.users);
    syncUpsertUser(user);

    // If added user is a student or teacher, also ensure presence in master data
    if (user.role === 'siswa' && user.nisn) {
      const exists = this.students.some((s) => s.nisn === user.nisn || s.id === user.id);
      if (!exists) {
        this.addStudent({
          id: user.id,
          name: user.name,
          nisn: user.nisn,
          classMajor: user.classMajor || 'XII',
          phone: user.phone || '-',
          statusPKL: 'belum_dapat'
        });
      }
    } else if (user.role === 'guru' && user.nip) {
      const exists = this.teachers.some((t) => t.nip === user.nip || t.id === user.id);
      if (!exists) {
        this.addTeacher({
          id: user.id,
          name: user.name,
          nip: user.nip,
          email: user.email,
          phone: user.phone || '-',
          assignedStudentCount: 0,
          password: user.password || 'guru@123'
        });
      }
    }

    this.notify();
  }

  public updateUser(user: User) {
    this.users = this.users.map((u) => (u.id === user.id ? user : u));
    saveToStorage('users', this.users);
    syncUpsertUser(user);

    // Sync back to student / teacher if applicable
    if (user.role === 'siswa' && user.nisn) {
      const std = this.students.find((s) => s.nisn === user.nisn || s.id === user.id);
      if (std) {
        this.updateStudent({
          ...std,
          name: user.name,
          classMajor: user.classMajor || std.classMajor,
          phone: user.phone || std.phone
        });
      }
    } else if (user.role === 'guru' && user.nip) {
      const tch = this.teachers.find((t) => t.nip === user.nip || t.id === user.id);
      if (tch) {
        this.updateTeacher({
          ...tch,
          name: user.name,
          email: user.email || tch.email,
          phone: user.phone || tch.phone,
          password: user.password || tch.password
        });
      }
    }

    this.notify();
  }

  public deleteUser(id: string) {
    this.users = this.users.filter((u) => u.id !== id);
    saveToStorage('users', this.users);
    syncDeleteUser(id);
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
    syncUpsertStudent(student);
    this.syncMasterToUsers(false);
    this.notify();
  }

  public updateStudent(student: Student) {
    this.students = this.students.map((s) => (s.id === student.id ? student : s));
    saveToStorage('students', this.students);
    syncUpsertStudent(student);
    this.syncMasterToUsers(false);
    this.notify();
  }

  public deleteStudent(id: string) {
    const std = this.students.find((s) => s.id === id);
    this.students = this.students.filter((s) => s.id !== id);
    saveToStorage('students', this.students);
    syncDeleteStudent(id);

    if (std) {
      this.users = this.users.filter((u) => u.nisn !== std.nisn && u.id !== std.id);
      saveToStorage('users', this.users);
    }
    this.notify();
  }

  // --- Teachers ---
  public getTeachers(): Teacher[] {
    return this.teachers;
  }

  public addTeacher(teacher: Teacher) {
    this.teachers.unshift(teacher);
    saveToStorage('teachers', this.teachers);
    syncUpsertTeacher(teacher);
    this.syncMasterToUsers(false);
    this.notify();
  }

  public updateTeacher(teacher: Teacher) {
    this.teachers = this.teachers.map((t) => (t.id === teacher.id ? teacher : t));
    saveToStorage('teachers', this.teachers);
    syncUpsertTeacher(teacher);
    this.syncMasterToUsers(false);
    this.notify();
  }

  public deleteTeacher(id: string) {
    this.teachers = this.teachers.filter((t) => t.id !== id);
    // Unassign teacher from students
    this.students = this.students.map((s) =>
      s.teacherId === id ? { ...s, teacherId: undefined, teacherName: undefined } : s
    );
    saveToStorage('teachers', this.teachers);
    saveToStorage('students', this.students);
    syncDeleteTeacher(id);
    this.notify();
  }

  // --- DUDIs ---
  public getDudis(): Dudi[] {
    return this.dudis;
  }

  public addDudi(dudi: Dudi) {
    this.dudis.unshift(dudi);
    saveToStorage('dudis', this.dudis);
    syncUpsertDudi(dudi);
    this.notify();
  }

  public updateDudi(dudi: Dudi) {
    this.dudis = this.dudis.map((d) => (d.id === dudi.id ? dudi : d));
    saveToStorage('dudis', this.dudis);
    syncUpsertDudi(dudi);
    this.notify();
  }

  public deleteDudi(id: string) {
    this.dudis = this.dudis.filter((d) => d.id !== id);
    // Unassign DUDI from students
    this.students = this.students.map((s) => {
      if (s.dudiId === id) {
        const updatedStudent = { ...s, dudiId: undefined, dudiName: undefined, statusPKL: 'belum_dapat' as const };
        syncUpsertStudent(updatedStudent);
        return updatedStudent;
      }
      return s;
    });
    saveToStorage('dudis', this.dudis);
    saveToStorage('students', this.students);
    syncDeleteDudi(id);
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
    syncUpsertJournal(journal);
    this.notify();
  }

  public updateJournal(journal: DailyJournal) {
    this.journals = this.journals.map((j) => (j.id === journal.id ? journal : j));
    saveToStorage('journals', this.journals);
    syncUpsertJournal(journal);
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
    let finalAtt = att;
    if (existingIndex >= 0) {
      finalAtt = { ...this.attendances[existingIndex], ...att };
      this.attendances[existingIndex] = finalAtt;
    } else {
      this.attendances.unshift(att);
    }
    saveToStorage('attendances', this.attendances);
    syncUpsertAttendance(finalAtt);
    this.notify();
  }

  public validateAttendance(attId: string, validated: boolean) {
    this.attendances = this.attendances.map((a) => {
      if (a.id === attId) {
        const updated = { ...a, validatedByDudi: validated };
        syncUpsertAttendance(updated);
        return updated;
      }
      return a;
    });
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
    syncUpsertGrade(grade);
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
    syncUpsertClass(cls);
    this.notify();
  }

  public updateClass(updated: ClassMajorItem) {
    this.classes = this.classes.map((c) => (c.id === updated.id ? updated : c));
    saveToStorage('classes', this.classes);
    syncUpsertClass(updated);
    this.notify();
  }

  public deleteClass(id: string) {
    this.classes = this.classes.filter((c) => c.id !== id);
    saveToStorage('classes', this.classes);
    syncDeleteClass(id);
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
