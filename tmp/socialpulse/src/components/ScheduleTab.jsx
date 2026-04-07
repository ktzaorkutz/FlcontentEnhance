import { useState } from 'react';
import { PLATFORMS } from '../data.js';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const BEST_TIMES = [
  { time: '7:00 AM',  label: 'Morning commute', score: '↑ 92% reach' },
  { time: '12:30 PM', label: 'Lunch break',      score: '↑ 85% reach' },
  { time: '6:00 PM',  label: 'After work',       score: '↑ 97% reach' },
  { time: '9:00 PM',  label: 'Night wind-down',  score: '↑ 88% reach' },
];

export default function ScheduleTab() {
  const [freq, setFreq] = useState(6);

  return (
    <div style={{ animation: 'slideUp 0.35s ease' }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#fff', marginBottom: 8 }}>
        Posting Schedule
      </h2>
      <p style={{ color: 'var(--muted)', marginBottom: 32, fontSize: 14 }}>
        Set your frequency. Let SocialPulse handle the consistency.
      </p>

      <div className="card">
        <div className="card-title">Weekly Post Frequency</div>
        <div className="freq-grid">
          {[5, 6, 7, 8].map(n => (
            <button
              key={n}
              className={`freq-btn${freq === n ? ' active' : ''}`}
              onClick={() => setFreq(n)}
            >
              {n}
            </button>
          ))}
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 10 }}>
          Posts per week · Auto-distributed for optimal reach times (Lagos TZ)
        </p>
      </div>

      <div className="card">
        <div className="card-title">Platform Schedule</div>
        <div className="schedule-grid">
          {PLATFORMS.map(p => {
            const assignedDays = DAYS.slice(0, freq);
            return (
              <div key={p.id} className="sched-row">
                <div className="sched-left">
                  <span style={{ fontSize: 18 }}>{p.icon}</span>
                  <span>{p.label}</span>
                </div>
                <div className="sched-tags">
                  {assignedDays.map(d => (
                    <span
                      key={d}
                      className="sched-tag"
                      style={{
                        background: `color-mix(in srgb, ${p.color} 13%, transparent)`,
                        border: `1px solid color-mix(in srgb, ${p.color} 27%, transparent)`,
                        color: p.color,
                      }}
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          Best Times to Post
          <span className="card-sub" style={{ marginLeft: 6 }}>Nigerian audience</span>
        </div>
        <div className="time-grid">
          {BEST_TIMES.map(t => (
            <div key={t.time} className="time-card">
              <div className="time-val">{t.time}</div>
              <div className="time-label">{t.label}</div>
              <div className="time-score">{t.score}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
