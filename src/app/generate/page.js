"use client"

import React, { useState } from 'react'

function pad(n) { return n < 10 ? '0' + n : '' + n }

function toISODateTime(d) {
  return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + '00Z'
}

function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd
}

export default function GeneratePage() {
  const [examAt, setExamAt] = useState('')
  const [hours, setHours] = useState(10)
  const [sessionLength, setSessionLength] = useState(1)
  const [startHour, setStartHour] = useState(8)
  const [endHour, setEndHour] = useState(22)
  const [busySlots, setBusySlots] = useState([])
  const [busyStart, setBusyStart] = useState('')
  const [busyEnd, setBusyEnd] = useState('')
  const [generated, setGenerated] = useState([])
  const [message, setMessage] = useState('')

  function addBusySlot(e) {
    e.preventDefault()
    if (!busyStart || !busyEnd) return
    const s = new Date(busyStart)
    const en = new Date(busyEnd)
    if (isNaN(s) || isNaN(en) || s >= en) {
      setMessage('Invalid busy slot')
      return
    }
    setBusySlots([...busySlots, { start: s.toISOString(), end: en.toISOString() }])
    setBusyStart('')
    setBusyEnd('')
    setMessage('')
  }

  function clearBusySlots() {
    setBusySlots([])
  }

  function generate(e) {
    e && e.preventDefault()
    setMessage('')
    setGenerated([])

    const exam = new Date(examAt)
    const now = new Date()
    if (isNaN(exam) || exam <= now) {
      setMessage('Please choose an exam date in the future')
      return
    }

    // build candidate hourly slots between now and exam
    const candidates = []
    const sessionMs = Math.round(sessionLength * 60 * 60 * 1000)

    const busy = busySlots.map(b => ({ start: new Date(b.start), end: new Date(b.end) }))

    // iterate days
    const cursor = new Date(now)
    cursor.setMinutes(0,0,0)
    while (cursor < exam) {
      const day = new Date(cursor)
      const dayStart = new Date(day)
      dayStart.setHours(startHour,0,0,0)
      const dayEnd = new Date(day)
      dayEnd.setHours(endHour,0,0,0)

      for (let t = new Date(dayStart); t.getTime() + sessionMs <= dayEnd.getTime(); t.setHours(t.getHours() + 1)) {
        const slotStart = new Date(t)
        const slotEnd = new Date(t.getTime() + sessionMs)
        if (slotStart <= now) continue
        if (slotEnd > exam) continue
        // exclude if overlaps any busy
        const blocked = busy.some(b => rangesOverlap(slotStart, slotEnd, b.start, b.end))
        if (!blocked) candidates.push({ start: new Date(slotStart), end: new Date(slotEnd) })
      }

      cursor.setDate(cursor.getDate() + 1)
      cursor.setHours(0,0,0,0)
    }

    if (candidates.length === 0) {
      setMessage('No available free slots found in the given range and daily hours')
      return
    }

    const neededSessions = Math.ceil(hours / sessionLength)
    const picked = candidates.slice(0, neededSessions)

    if (picked.length < neededSessions) {
      setMessage(`Only found ${picked.length} free session(s) — fewer than requested ${neededSessions}`)
    } else {
      setMessage(`Scheduled ${picked.length} session(s)`) 
    }

    setGenerated(picked)
  }

  function downloadICS() {
    if (!generated.length) return
    const uid = Date.now()
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ksh-hackathon//study-scheduler//EN'
    ]
    generated.forEach((ev, i) => {
      lines.push('BEGIN:VEVENT')
      lines.push('UID:' + (uid + i) + '@ksh-hackathon')
      lines.push('DTSTAMP:' + toISODateTime(new Date()))
      lines.push('DTSTART:' + toISODateTime(new Date(ev.start)))
      lines.push('DTEND:' + toISODateTime(new Date(ev.end)))
      lines.push('SUMMARY:Study session')
      lines.push('END:VEVENT')
    })
    lines.push('END:VCALENDAR')

    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'study-sessions.ics'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ padding: 20, fontFamily: 'system-ui, sans-serif', maxWidth: 880 }}>
      <h1>Study Scheduler</h1>
      <p>Enter an exam date and total hours to study; add busy slots so the scheduler avoids them. It will fill free hourly slots between now and the exam.</p>

      <form onSubmit={generate} style={{ display: 'grid', gap: 12 }}>
        <label>
          Exam date & time
          <input type="datetime-local" value={examAt} onChange={e => setExamAt(e.target.value)} required style={{ display: 'block', marginTop: 6 }} />
        </label>

        <label>
          Total study hours
          <input type="number" min={1} value={hours} onChange={e => setHours(Number(e.target.value))} style={{ display: 'block', marginTop: 6 }} />
        </label>

        <label>
          Session length (hours)
          <input type="number" min={0.25} step={0.25} value={sessionLength} onChange={e => setSessionLength(Number(e.target.value))} style={{ display: 'block', marginTop: 6 }} />
        </label>

        <div style={{ display: 'flex', gap: 12 }}>
          <label style={{ flex: 1 }}>
            Daily start hour
            <input type="number" min={0} max={23} value={startHour} onChange={e => setStartHour(Number(e.target.value))} style={{ display: 'block', marginTop: 6 }} />
          </label>
          <label style={{ flex: 1 }}>
            Daily end hour
            <input type="number" min={1} max={24} value={endHour} onChange={e => setEndHour(Number(e.target.value))} style={{ display: 'block', marginTop: 6 }} />
          </label>
        </div>

        <div style={{ border: '1px solid #ddd', padding: 10 }}>
          <h3 style={{ marginTop: 0 }}>Busy slots</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="datetime-local" value={busyStart} onChange={e => setBusyStart(e.target.value)} />
            <input type="datetime-local" value={busyEnd} onChange={e => setBusyEnd(e.target.value)} />
            <button onClick={addBusySlot}>Add busy</button>
            <button type="button" onClick={clearBusySlots}>Clear</button>
          </div>

          <ul>
            {busySlots.map((b, i) => (
              <li key={i}>{new Date(b.start).toLocaleString()} → {new Date(b.end).toLocaleString()}</li>
            ))}
          </ul>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit">Generate study sessions</button>
          <button type="button" onClick={() => { setGenerated([]); setMessage(''); }}>Reset</button>
          <button type="button" onClick={downloadICS} disabled={generated.length===0}>Download .ics</button>
        </div>
      </form>

      {message && <p style={{ marginTop: 12 }}>{message}</p>}

      {generated.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <h3>Generated sessions ({generated.length})</h3>
          <ol>
            {generated.map((g, i) => (
              <li key={i}>{new Date(g.start).toLocaleString()} — {new Date(g.end).toLocaleString()}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
