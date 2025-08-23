"use client";

import { useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";

export default function WeekCalendar() {
    // give each event a stable id so we can remove them when clicked
    const [events, setEvents] = useState([
        { id: "1", title: "Team Meeting", start: "2025-08-25T10:00:00", end: "2025-08-25T11:00:00" },
        { id: "2", title: "Workshop", start: "2025-08-27T14:00:00", end: "2025-08-27T16:00:00" },
    ]);
    const idRef = useRef(3);

    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState("");
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [repeatWeekly, setRepeatWeekly] = useState(false);

    function resetForm() {
        setTitle("");
        setStart("");
        setEnd("");
    }

    function handleEventClick(info) {
        // info.event.id corresponds to the id we set on the event objects
        const clickedId = String(info.event.id);
        const confirmDelete = window.confirm(`Delete event "${info.event.title}"?`);
        if (!confirmDelete) return;
        setEvents((prev) => prev.filter((ev) => String(ev.id) !== clickedId));
    }

    function handleAddEvent(e) {
        e.preventDefault();
        if (!title || !start) return;
    if (repeatWeekly) {
            // normalize datetime-local values to include seconds if missing
            const normalizedStart = start.length === 16 ? `${start}:00` : start;
            const datePart = normalizedStart.split("T")[0]; // YYYY-MM-DD
            const timePart = normalizedStart.split("T")[1]?.slice(0,8) ?? "00:00:00"; // HH:MM:SS

            let endTime;
            if (end) {
                const normalizedEnd = end.length === 16 ? `${end}:00` : end;
                endTime = normalizedEnd.split("T")[1]?.slice(0,8);
            }

            // determine weekday number for FullCalendar (0=Sunday .. 6=Saturday)
            const weekday = new Date(normalizedStart).getDay();

            const recurringEvent = {
                id: String(idRef.current++),
                title,
                daysOfWeek: [weekday],
                startTime: timePart,
                endTime: endTime,
                startRecur: datePart,
            };

            setEvents((prev) => [...prev, recurringEvent]);
        } else {
            const newEvent = {
                id: String(idRef.current++),
                title,
                start: start.length === 16 ? `${start}:00` : start,
                end: end ? (end.length === 16 ? `${end}:00` : end) : undefined,
            };

            setEvents((prev) => [...prev, newEvent]);
        }
        resetForm();
        setShowForm(false);
    }

    return (
        <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Calendar</h1>
                <div>
                    <button
                        onClick={() => setShowForm((s) => !s)}
                        className="rounded bg-blue-600 text-white px-3 py-1.5 hover:bg-blue-700"
                    >
                        {showForm ? "Cancel" : "Create Event"}
                    </button>
                </div>
            </div>

            {showForm && (
                <form onSubmit={handleAddEvent} className="mb-6 p-4 border rounded bg-white">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <label className="col-span-1">
                            <div className="text-sm">Title</div>
                            <input
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="mt-1 w-full border rounded px-2 py-1"
                                placeholder="Event title"
                            />
                        </label>

                        <label className="col-span-1">
                            <div className="text-sm">Start</div>
                            <input
                                required
                                type="datetime-local"
                                value={start}
                                onChange={(e) => setStart(e.target.value)}
                                className="mt-1 w-full border rounded px-2 py-1"
                            />
                        </label>

                        <label className="col-span-1">
                            <div className="text-sm">End (optional)</div>
                            <input
                                type="datetime-local"
                                value={end}
                                onChange={(e) => setEnd(e.target.value)}
                                className="mt-1 w-full border rounded px-2 py-1"
                            />
                        </label>
                        <label className="col-span-1 flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={repeatWeekly}
                                onChange={(e) => setRepeatWeekly(e.target.checked)}
                                className="w-4 h-4"
                            />
                            <span className="text-sm">Repeat weekly</span>
                        </label>
                    </div>

                    <div className="mt-3">
                        <button className="rounded bg-green-600 text-white px-3 py-1.5 hover:bg-green-700" type="submit">
                            Add Event
                        </button>
                    </div>
                </form>
            )}

            <FullCalendar
                firstDay={1}
                plugins={[dayGridPlugin, timeGridPlugin]}
                initialView="timeGridWeek"
                events={events}
                eventClick={handleEventClick}
                headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                height="auto"         // 👈 calendar resizes to fit content
                contentHeight="auto"
                // 👇 Add this block for 24-hour format



                eventTimeFormat={{


                    hour: "2-digit",


                    minute: "2-digit",


                    hour12: false, // ✅ 24-hour system


                }}


                // 👇 This controls the hour labels on the left in week/day views


                slotLabelFormat={{


                    hour: "2-digit",


                    minute: "2-digit",


                    hour12: false,


                }}


                dayHeaderFormat={{


                    day: "2-digit",   // 23


                    month: "2-digit",


                    weekday: 'long'  // 08


                  }}
            />
        </div>
    );
}
