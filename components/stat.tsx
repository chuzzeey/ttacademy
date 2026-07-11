'use client'
import React, { useState, useEffect } from 'react'

const Stat = () => {
    const [coursesCount, setCoursesCount] = useState(0)
    const [studentsCount, setStudentsCount] = useState(0)
    const [startCounting, setStartCounting] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setStartCounting(true)
        }, 2000)
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        if (!startCounting) return

        const coursesDuration = 2000
        const coursesInterval = 50
        const coursesSteps = coursesDuration / coursesInterval
        const coursesIncrement = 56 / coursesSteps

        const coursesTimer = setInterval(() => {
            setCoursesCount(prev => {
                const next = prev + coursesIncrement
                return next >= 56 ? 56 : next
            })
        }, coursesInterval)

        const studentsDuration = 2000
        const studentsInterval = 50
        const studentsSteps = studentsDuration / studentsInterval
        const studentsIncrement = 800 / studentsSteps

        const studentsTimer = setInterval(() => {
            setStudentsCount(prev => {
                const next = prev + studentsIncrement
                return next >= 800 ? 800 : next
            })
        }, studentsInterval)

        return () => {
            clearInterval(coursesTimer)
            clearInterval(studentsTimer)
        }
    }, [startCounting])

    return (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 w-full">
            <div className="flex flex-col items-start justify-center rounded-2xl bg-white/90 backdrop-blur-md py-4 px-6 shadow-sm border border-white/50 h-14 lg:h-[7.5rem] animate-[slideUp_0.6s_ease-out_0.9s_forwards]">
                <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 tabular-nums">{Math.floor(coursesCount)}</h3>
                <p className="text-gray-500 text-sm">Online courses</p>
            </div>
            <div className="flex flex-col items-start justify-center rounded-2xl bg-white/90 backdrop-blur-md py-4 px-6 shadow-sm border border-white/50 h-14 lg:h-[7.5rem] animate-[slideUp_0.6s_ease-out_1.0s_forwards]">
                <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 tabular-nums">{Math.floor(studentsCount)}+</h3>
                <p className="text-gray-500 text-sm">Happy students</p>
            </div>
            <div className="flex flex-col items-start justify-center rounded-2xl bg-white/90 backdrop-blur-md py-4 px-6 shadow-sm border border-white/50 h-14 lg:h-[7.5rem] animate-[slideUp_0.6s_ease-out_1.1s_forwards]">
                <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 tabular-nums">24<span className="font-light">/7</span></h3>
                <p className="text-gray-500 text-sm">Learning access</p>
            </div>
            <div className="flex flex-col items-start justify-center rounded-2xl bg-gradient-to-br from-[#dc2626] to-[#991b1b] py-4 px-6 shadow-sm h-14 lg:h-[7.5rem] animate-[slideUp_0.6s_ease-out_1.2s_forwards]">
                <h3 className="text-3xl lg:text-4xl font-bold text-white tabular-nums">98%</h3>
                <p className="text-white/80 text-sm">Satisfaction rate</p>
            </div>
        </div>
    )
}

export default Stat