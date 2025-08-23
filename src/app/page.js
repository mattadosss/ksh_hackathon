"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";

export default function WeekCalendar() {
    return (
        <div className="p-6">
            <FullCalendar
                firstDay={1}
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
