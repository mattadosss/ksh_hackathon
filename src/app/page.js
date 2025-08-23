"use client";

import { useState, useRef, useEffect  } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { supabase } from "../lib/supabaseClient";

export default function WeekCalendar() {
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
    const [selectedDays, setSelectedDays] = useState([]); // NEU: Wochentage für Weekly

    function resetForm() {
        setTitle("");
        setStart("");
        setEnd("");
        setSelectedDays([]);
        setRepeatWeekly(false);
    }

    async function loadEvents() {
        try {
            const { data, error } = await supabase.from("events").select("*");
            if (error) {
                console.error("Error fetching events:", error);
                return;
            }

            const calendarEvents = data.map(ev => {
                if (ev.repeat_weekly) {
                    return {
                        id: ev.id,
                        title: ev.title,
                        daysOfWeek: ev.days_of_week || [],
                        startTime: new Date(ev.start).toTimeString().slice(0,5),
                        endTime: ev.end ? new Date(ev.end).toTimeString().slice(0,5) : undefined,
                        startRecur: ev.start.split("T")[0],
                        repeat_weekly: true
                    };
                } else {
                    return {
                        id: ev.id,
                        title: ev.title,
                        start: ev.start,
                        end: ev.end,
                        repeat_weekly: false
                    };
                }
            });

            setEvents(calendarEvents);
        } catch (err) {
            console.error("Unexpected error fetching events:", err);
        }
    }

    function handleEventClick(info) {
        const clickedId = String(info.event.id);
        const confirmDelete = window.confirm(`Delete event "${info.event.title}"?`);
        if (!confirmDelete) return;

        setEvents((prev) => prev.filter((ev) => String(ev.id) !== clickedId));
        deleteEventFromDB(clickedId);
    }

    async function deleteEventFromDB(id) {
        const { error } = await supabase.from("events").delete().eq("id", id);
        if (error) {
            console.error("Error deleting event:", error);
        } else {
            console.log(`Event ${id} deleted successfully`);
        }
    }

    function handleAddEvent(e) {
        e.preventDefault();
        if (!title || !start) return;

        let newEvent;

        if (repeatWeekly) {
            if (selectedDays.length === 0) {
                alert("Bitte wähle mindestens einen Wochentag aus.");
                return;
            }

            const normalizedStart = start.length === 16 ? `${start}:00` : start;
            const datePart = normalizedStart.split("T")[0];
            const timePart = normalizedStart.split("T")[1]?.slice(0, 8) ?? "00:00:00";

            newEvent = {
                id: String(idRef.current++),
                title,
                daysOfWeek: selectedDays,
                startTime: timePart,
                endTime: end ? (end.length === 16 ? `${end}:00` : end).split("T")[1]?.slice(0,8) : undefined,
                startRecur: datePart,
                repeat_weekly: true,
            };

            setEvents(prev => [...prev, newEvent]);

            supabase
                .from('events')
                .insert([{
                    title: newEvent.title,
                    start: newEvent.startRecur + "T" + newEvent.startTime,
                    end: newEvent.endTime ? newEvent.startRecur + "T" + newEvent.endTime : null,
                    repeat_weekly: true,
                    days_of_week: newEvent.daysOfWeek // NEU: mehrere Wochentage speichern
                }])
                .then(({ error }) => {
                    if (error) console.error('Error saving event:', error);
                });

        } else {
            newEvent = {
                id: String(idRef.current++),
                title,
                start: start.length === 16 ? `${start}:00` : start,
                end: end ? (end.length === 16 ? `${end}:00` : end) : undefined,
                repeat_weekly: false
            };

            setEvents(prev => [...prev, newEvent]);

            supabase
                .from('events')
                .insert([{
                    title: newEvent.title,
                    start: newEvent.start,
                    end: newEvent.end || null,
                    repeat_weekly: false
                }])
                .then(({ error }) => {
                    if (error) console.error('Error saving event:', error);
                });
        }

        resetForm();
        setShowForm(false);
    }

    useEffect(() => {
        loadEvents();
    }, []);

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

                        {/* NEU: Wochentage auswählen */}
                        {repeatWeekly && (
                            <div className="col-span-3 mt-2 grid grid-cols-7 gap-1">
                                {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((day, idx) => (
                                    <label key={idx} className="flex flex-col items-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedDays.includes(idx)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedDays([...selectedDays, idx]);
                                                } else {
                                                    setSelectedDays(selectedDays.filter(d => d !== idx));
                                                }
                                            }}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-xs">{day}</span>
                                    </label>
                                ))}
                            </div>
                        )}
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
                height="auto"
                contentHeight="auto"
                eventTimeFormat={{
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                }}
                slotLabelFormat={{
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                }}
                dayHeaderFormat={{
                    day: "2-digit",
                    month: "2-digit",
                    weekday: 'long'
                }}
            />
        </div>
    );
}
