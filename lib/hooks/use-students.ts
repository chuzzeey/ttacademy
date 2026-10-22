'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useStudentStore } from '@/lib/stores/student-store'
import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'
import type { Student } from '@/lib/stores/student-store'

export function useStudents() {
  const queryClient = useQueryClient()
  const { setStudents, addStudent } = useStudentStore()

  // Fetch students with TanStack Query
  const { data, isLoading, isFetching, error, refetch } = useQuery<Student[]>({
    queryKey: ['students'],
    queryFn: async () => {
      const res = await fetch('/api/registrations')
      const json: { data?: Student[]; error?: string } = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to fetch students')
      if (!Array.isArray(json.data)) {
        throw new Error('The registrations response did not contain a student list')
      }
      return json.data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  })
  const students = data ?? []

  // Sync data to Zustand store when it changes
  useEffect(() => {
    if (data !== undefined) {
      setStudents(data)
    }
  }, [data, setStudents])

  // Set up Supabase Realtime subscription
  const setupRealtimeSubscription = () => {
    const supabase = createClient()

    const channel = supabase
      .channel('students-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'students',
        },
        (payload) => {
          console.log('New student registered:', payload.new)
          addStudent(payload.new as any)
          queryClient.invalidateQueries({ queryKey: ['students'] })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'students',
        },
        (payload) => {
          console.log('Student updated:', payload.new)
          queryClient.invalidateQueries({ queryKey: ['students'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  return {
    students,
    isLoading,
    isFetching,
    error,
    refetch,
    setupRealtimeSubscription,
  }
}