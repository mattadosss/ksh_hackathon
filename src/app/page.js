"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";

export default function WeekCalendar() {
    return (
        <div className="p-6">
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin]}
                initialView="timeGridWeek" // 👈 week view
                events={[
                    { title: "Team Meeting", start: "2025-08-25T10:00:00", end: "2025-08-25T11:00:00" },
                    { title: "Workshop", start: "2025-08-27T14:00:00", end: "2025-08-27T16:00:00" },
                ]}
                headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
            />
        </div>
    );
}
