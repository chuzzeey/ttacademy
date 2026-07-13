'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useStudentStore } from '@/lib/stores/student-store'
import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'

export function useStudents() {
  const queryClient = useQueryClient()
  const { setStudents, addStudent } = useStudentStore()

  // Fetch students with TanStack Query
  const { data: students = [], isLoading, error, refetch } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const res = await fetch('/api/registrations')
      if (!res.ok) throw new Error('Failed to fetch students')
      const json = await res.json()
      return json.data || []
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  })

  // Sync data to Zustand store when it changes
  useEffect(() => {
    if (students.length > 0) {
      setStudents(students)
    }
  }, [students, setStudents])

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
    error,
    refetch,
    setupRealtimeSubscription,
  }
}