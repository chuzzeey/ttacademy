import { create } from 'zustand'

export interface Student {
  id: string
  name: string
  email: string
  phone: string
  course: string
  sex: string
  country: string
  state?: string | null
  employment_status: string
  has_laptop: string
  reason?: string
  payment_status: string
  reg_date: string
  reg_time: string
  created_at?: string
  updated_at?: string
}

interface StudentStore {
  students: Student[]
  setStudents: (students: Student[]) => void
  addStudent: (student: Student) => void
  updateStudent: (id: string, data: Partial<Student>) => void
  removeStudent: (id: string) => void
  clearStudents: () => void
}

export const useStudentStore = create<StudentStore>((set) => ({
  students: [],
  setStudents: (students) => set({ students }),
  addStudent: (student) => set((state) => ({ 
    students: [student, ...state.students] 
  })),
  updateStudent: (id, data) => set((state) => ({
    students: state.students.map((s) => 
      s.id === id ? { ...s, ...data } : s
    ),
  })),
  removeStudent: (id) => set((state) => ({
    students: state.students.filter((s) => s.id !== id),
  })),
  clearStudents: () => set({ students: [] }),
}))
