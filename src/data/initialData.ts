import { User, Student, Teacher, Dudi, DailyJournal, AttendanceRecord, EvaluationGrade, SupervisionLog, ApplicationLetter, ClassMajorItem } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-1',
    name: 'SUPER ADMIN KOORDINATOR',
    email: 'admin@simpkl.com',
    role: 'admin',
    nip: '198501012010011001',
    phone: '08123456789'
  }
];

export const INITIAL_DUDIS: Dudi[] = [];

export const INITIAL_STUDENTS: Student[] = [];

export const INITIAL_TEACHERS: Teacher[] = [];

export const INITIAL_ATTENDANCES: AttendanceRecord[] = [];

export const INITIAL_JOURNALS: DailyJournal[] = [];

export const INITIAL_SUPERVISIONS: SupervisionLog[] = [];

export const INITIAL_GRADES: EvaluationGrade[] = [];

export const INITIAL_LETTERS: ApplicationLetter[] = [];

export const INITIAL_CLASSES: ClassMajorItem[] = [];
