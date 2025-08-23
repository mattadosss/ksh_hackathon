"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'


function roundUpToNextHour(d) {
  const x = new Date(d)
  x.setMinutes(0, 0, 0)
  if (x <= d) x.setHours(x.getHours() + 1)
  return x
}

function addHours(d, hours) {
  const x = new Date(d)
  x.setTime(x.getTime() + hours * 60 * 60 * 1000)
  return x
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function isOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd
}

function findFirstGap(windowStart, windowEnd, busyIntervals, minHours) {
  const minMs = minHours * 60 * 60 * 1000
  const start = new Date(windowStart)
  const end = new Date(windowEnd)
  if (start >= end) return null

  const intervals = busyIntervals
    .map((iv) => ({
      start: new Date(Math.max(start.getTime(), iv.start.getTime())),
      end: new Date(Math.min(end.getTime(), iv.end.getTime())),
    }))
    .filter((iv) => iv.start < iv.end)
    .sort((a, b) => a.start - b.start)

  const merged = []
  for (const iv of intervals) {
    if (!merged.length || merged[merged.length - 1].end < iv.start) {
      merged.push({ ...iv })
    } else {
      merged[merged.length - 1].end = new Date(Math.max(merged[merged.length - 1].end.getTime(), iv.end.getTime()))
    }
  }

  let cursor = new Date(start)
  for (const iv of merged) {
    if (iv.start.getTime() - cursor.getTime() >= minMs) {
      return new Date(cursor)
    }
    if (iv.end > cursor) cursor = new Date(iv.end)
  }
  if (end.getTime() - cursor.getTime() >= minMs) return new Date(cursor)
  return null
}

async function fetchEventsFromDB() {
  const { data, error } = await supabase.from('events').select('*')
  if (error) {
    console.error('Error loading events', error)
    return []
  }
  return data.map((ev) => {
    const start = new Date(ev.start)
    const end = ev.end ? new Date(ev.end) : addHours(start, 1)
    return {
      id: String(ev.id ?? `db_${Math.random().toString(36).slice(2)}`),
      title: ev.title,
      start: start.toISOString(),
      end: end.toISOString(),
      repeat_weekly: !!ev.repeat_weekly,
    }
  })
}

export default function GeneratePage() {
  const router = useRouter()
  const [examName, setExamName] = useState('')
  const [examDate, setExamDate] = useState('') 
  const [totalHours, setTotalHours] = useState(10)
  const [dayStartHour, setDayStartHour] = useState(8)
  const [dayEndHour, setDayEndHour] = useState(22)
  const [status, setStatus] = useState('')

  const [existingEvents, setExistingEvents] = useState([]) 
  const [generatedEvents, setGeneratedEvents] = useState([]) 

  useEffect(() => {
    ;(async () => {
      const evs = await fetchEventsFromDB()
      setExistingEvents(evs)
    })()
  }, [])

  const upcomingEvents = useMemo(() => {
    const now = new Date()
    return [...generatedEvents]
      .filter((e) => new Date(e.end) >= now)
      .sort((a, b) => new Date(a.start) - new Date(b.start))
  }, [generatedEvents])

  async function generateSchedule(e) {
    e.preventDefault()
    setStatus('')
    const now = new Date()
    const exam = examDate ? new Date(examDate) : null
    if (!exam || isNaN(exam.getTime())) {
      setStatus('Please provide a valid exam date and time.')
      return
    }
    if (exam <= now) {
      setStatus('Exam date must be in the future.')
      return
    }
    const total = Number(totalHours)
    const block = 1
    if (!Number.isFinite(total) || total <= 0) {
      setStatus('Total study hours must be greater than 0.')
      return
    }
    if (total % 1 !== 0) {
      setStatus('Total study hours must be a whole number (full hours).')
      return
    }
    if (dayEndHour <= dayStartHour) {
      setStatus('Day end hour must be after start hour.')
      return
    }

    const existingExpanded = []
  for (const ev of existingEvents) {
      const s = new Date(ev.start)
      const e = new Date(ev.end)
      if (!ev.repeat_weekly) {
        existingExpanded.push({ start: new Date(s), end: new Date(e) })
      } else {
        let occ = new Date(s)
        while (occ < now) {
          occ = addHours(occ, 24 * 7)
        }
        while (occ < exam) {
          const occEnd = new Date(occ.getTime() + (e - s))
          existingExpanded.push({ start: new Date(occ), end: new Date(occEnd) })
          occ = addHours(occ, 24 * 7)
        }
      }
    }

  const newEvents = []
    let remaining = total

    const startOfToday = new Date(now)
    startOfToday.setHours(0, 0, 0, 0)
    const days = []
    for (let d = new Date(startOfToday); d <= exam; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d))
    }

    // Round-robin with per-day cap: try up to 2 sessions per day per pass
    const perDayCap = 2
    let safety = 0
    while (remaining > 0 && safety < 10000) {
      safety++
      let placedThisRound = 0
      for (const day of days) {
        if (remaining <= 0) break

        const dayStart = new Date(day)
        dayStart.setHours(dayStartHour, 0, 0, 0)
        const dayEnd = new Date(day)
        dayEnd.setHours(dayEndHour, 0, 0, 0)

        let windowStart = dayStart
        let windowEnd = dayEnd
        if (sameDay(day, now)) windowStart = new Date(Math.max(windowStart, now))
        if (sameDay(day, exam)) windowEnd = new Date(Math.min(windowEnd, exam))
        if (windowStart >= windowEnd) continue

        let hourStart = roundUpToNextHour(windowStart)
        let placedToday = 0
        while (remaining > 0 && placedToday < perDayCap && addHours(hourStart, block) <= windowEnd) {
          const hourEnd = addHours(hourStart, block)
          // Build busy intervals without buffer to allow back-to-back sessions
          const busy = existingExpanded
            .concat(newEvents.map((n) => ({ start: new Date(n.start), end: new Date(n.end) })))
            .concat(generatedEvents.map((n) => ({ start: new Date(n.start), end: new Date(n.end) })))
            .map((iv) => ({ start: new Date(iv.start), end: new Date(iv.end) }))

          const conflict = busy.some((iv) => isOverlap(iv.start, iv.end, hourStart, hourEnd))
          if (!conflict) {
            const ev = {
              title: `Study: ${examName || 'Exam'}`,
              start: hourStart.toISOString(),
              end: hourEnd.toISOString(),
              repeat_weekly: false,
            }
            newEvents.push(ev)
            remaining = Math.max(0, remaining - block)
            placedToday++
            placedThisRound++
          }
          hourStart = addHours(hourStart, 1)
        }
      }
      if (placedThisRound === 0) break // nowhere to place more
    }

    if (newEvents.length === 0) {
      setStatus('No available slots found before the exam within your daily window.')
      return
    }

    // Save to Supabase so they appear on the home calendar
    const { data, error } = await supabase
      .from('events')
      .insert(newEvents.map((ev) => ({ title: ev.title, start: ev.start, end: ev.end, repeat_weekly: false })))
      .select('*')
    if (error) {
      console.error('Error saving generated events', error)
      setStatus('Failed to save generated events. Please try again.')
      return
    }

    const inserted = (data || []).map((ev) => ({
      id: String(ev.id),
      title: ev.title,
      start: ev.start,
      end: ev.end ?? addHours(new Date(ev.start), 1).toISOString(),
      repeat_weekly: !!ev.repeat_weekly,
    }))
    setGeneratedEvents((prev) => [...prev, ...inserted].sort((a, b) => new Date(a.start) - new Date(b.start)))
    setExistingEvents((prev) => [...prev, ...inserted])

    if (remaining > 0) {
      setStatus(`Scheduled ${total - remaining}h. Could not fit ${remaining}h before the exam.`)
    } else {
      setStatus(`Scheduled ${total}h across ${inserted.length} session(s). Added to calendar.`)
    }
    // Redirect to main calendar
    router.push('/')
  }

  async function clearAll() {
    if (!confirm('Clear generated study sessions from the calendar?')) return
    try {
      const { error } = await supabase.from('events').delete().like('title', 'Study:%')
      if (error) throw error
      setGeneratedEvents([])
      const evs = await fetchEventsFromDB()
      setExistingEvents(evs)
      setStatus('Cleared generated study sessions from the calendar.')
    } catch (err) {
      console.error('Failed to clear study sessions', err)
      setStatus('Failed to clear study sessions from the calendar.')
    }
  }


  const grouped = useMemo(() => {
    const map = new Map()
    for (const ev of upcomingEvents) {
      const d = new Date(ev.start)
      const key = d.toLocaleDateString()
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(ev)
    }
    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) => new Date(a.start) - new Date(b.start))
    }
    return map
  }, [upcomingEvents])

  return (
    <div className="p-6 font-sans leading-relaxed">
  <h1 className="text-2xl font-bold mb-4">Study Scheduler</h1>

  <form onSubmit={generateSchedule} className="max-w-2xl grid gap-4">
    {/* Exam name */}
    <div>
      <label className="block font-semibold">Exam name</label>
      <input
        type="text"
        value={examName}
        onChange={(e) => setExamName(e.target.value)}
        placeholder="e.g., Calculus Midterm"
        required
        className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
      />
    </div>

    {/* Exam date */}
    <div>
      <label className="block font-semibold">Exam date and time</label>
      <input
        type="datetime-local"
        value={examDate}
        onChange={(e) => setExamDate(e.target.value)}
        required
        className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
      />
    </div>

    {/* Study settings */}
    <div className="flex flex-wrap gap-4">
      <label className="flex-1 min-w-[180px]">
        <span className="block font-semibold">Total study hours</span>
        <input
          type="number"
          min={1}
          step={1}
          value={totalHours}
          onChange={(e) => setTotalHours(e.target.value)}
          className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
        />
      </label>
      <label className="flex-1 min-w-[140px]">
        <span className="block font-semibold">Day start hour</span>
        <input
          type="number"
          min={0}
          max={23}
          step={1}
          value={dayStartHour}
          onChange={(e) => setDayStartHour(Number(e.target.value))}
          className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
        />
      </label>
      <label className="flex-1 min-w-[140px]">
        <span className="block font-semibold">Day end hour</span>
        <input
          type="number"
          min={0}
          max={23}
          step={1}
          value={dayEndHour}
          onChange={(e) => setDayEndHour(Number(e.target.value))}
          className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200"
        />
      </label>
    </div>

    {/* Buttons */}
    <div className="flex gap-3 items-center">
      <button
        type="submit"
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
      >
        Generate schedule
      </button>
      <button
        type="button"
        onClick={clearAll}
        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg shadow hover:bg-gray-300 transition"
      >
        Clear all
      </button>
      <button
        className="ml-5 rounded bg-blue-600 text-white px-3 py-1.5 hover:bg-blue-700"
        onClick={() => (window.location.href = "/")}>
                Get Back
            </button>
    </div>

    {/* Status message */}
    {status ? (
      <div className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg">
        {status}
      </div>
    ) : null}
  </form>

  {/* Upcoming schedule */}
  <div className="mt-8">
    <h2 className="text-xl font-semibold mb-3">Upcoming schedule</h2>
    {upcomingEvents.length === 0 ? (
      <div className="text-gray-500">No events scheduled yet.</div>
    ) : (
      <div className="grid gap-4">
        {[...grouped.entries()].map(([dateLabel, list]) => (
          <div
            key={dateLabel}
            className="border border-gray-200 rounded-lg overflow-hidden shadow-sm"
          >
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 font-semibold">
              {dateLabel}
            </div>
            <ul className="list-none m-0 p-3 space-y-2">
              {list.map((ev) => {
                const s = new Date(ev.start)
                const e = new Date(ev.end)
                const time =
                  s.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
                  ' - ' +
                  e.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

                return (
                  <li
                    key={ev.id}
                    className="flex justify-between items-center py-1"
                  >
                    <span>{ev.title}</span>
                    <span className="text-gray-600 text-sm">{time}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    )}
  </div>
</div>

  )
}
