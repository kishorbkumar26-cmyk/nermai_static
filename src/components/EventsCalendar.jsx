import { useState, useEffect } from 'react'
import { fbFirestore } from '../firebase/firestore'

export default function EventsCalendar({ eventsData }) {
  const [events, setEvents] = useState([])

  useEffect(() => {
    if (eventsData) {
      setEvents(eventsData.filter(e => e.visible !== false))
    } else {
      fbFirestore.getSettings().then(s => {
        if (s.homeContent?.events?.length) {
          setEvents(s.homeContent.events.filter(e => e.visible !== false))
        }
      })
    }
  }, [eventsData])

  if (events.length === 0) return null

  return (
    <div className="events-calendar-container reveal" style={{ '--reveal-delay': '200ms' }}>
      <div className="events-header">
        <h3>UPCOMING EVENTS</h3>
        <button aria-label="Pause"><i className="fa-solid fa-pause" /></button>
      </div>
      
      <div className="events-body">
        <div className="events-list">
          {events.map((ev, i) => (
            <div key={i} className="event-item">
              <div className="event-date">
                <span className="event-date-month">{ev.dateLine1}</span>
                <span className="event-date-day">{ev.dateLine2}</span>
              </div>
              <div className="event-content">
                {ev.url ? (
                  <a href={ev.url} target="_blank" rel="noopener noreferrer" className="event-title link-title">{ev.title}</a>
                ) : (
                  <span className="event-title text-title">{ev.title}</span>
                )}
                <p className="event-subtitle">{ev.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
