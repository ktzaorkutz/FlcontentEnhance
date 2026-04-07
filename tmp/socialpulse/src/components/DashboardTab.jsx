import { useState, useEffect, useRef } from 'react';
import { PLATFORMS, POSTS } from '../data.js';

const MAX_LIKES = 2100;

export default function DashboardTab() {
  const [filterPlatform, setFilterPlatform] = useState('all');
  const barsRef = useRef(null);

  // animate bars after mount / filter change
  useEffect(() => {
    const timer = setTimeout(() => {
      barsRef.current?.querySelectorAll('.bar-fill').forEach(bar => {
        bar.style.width = bar.dataset.target + '%';
      });
    }, 80);
    return () => clearTimeout(timer);
  }, [filterPlatform]);

  const filtered = filterPlatform === 'all'
    ? POSTS
    : POSTS.filter(p => p.platform === filterPlatform);

  const sortedByLikes = [...POSTS].sort((a, b) => b.likes - a.likes);

  return (
    <div style={{ animation: 'slideUp 0.35s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 30, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#fff', marginBottom: 4 }}>
            Engagement Dashboard
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Last 7 days — Apr 01–06, 2026</p>
        </div>
        <div className="filter-bar">
          {['all', ...PLATFORMS.map(p => p.id)].map(id => {
            const plat = PLATFORMS.find(p => p.id === id);
            return (
              <button
                key={id}
                className={`filter-btn${filterPlatform === id ? ' active' : ''}`}
                onClick={() => setFilterPlatform(id)}
              >
                {id === 'all' ? 'All' : plat?.icon}
              </button>
            );
          })}
        </div>
      </div>

      {/* STATS */}
      <div className="stats-grid">
        <div className="stat-card" style={{ borderLeft: '3px solid var(--gold)' }}>
          <div className="stat-label">Total Reach</div>
          <div className="stat-val">33.3K</div>
          <div className="stat-sub" style={{ color: 'var(--gold)' }}>↑ 34% vs last week</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid var(--orange)' }}>
          <div className="stat-label">Engagements</div>
          <div className="stat-val">7,446</div>
          <div className="stat-sub" style={{ color: 'var(--orange)' }}>Likes + Comments + Shares</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid var(--tk)' }}>
          <div className="stat-label">Best Platform</div>
          <div className="stat-val">TikTok</div>
          <div className="stat-sub" style={{ color: 'var(--tk)' }}>15.4K reach on 1 post</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '3px solid var(--green)' }}>
          <div className="stat-label">Posts This Week</div>
          <div className="stat-val">5 / 6</div>
          <div className="stat-sub" style={{ color: 'var(--green)' }}>1 scheduled</div>
        </div>
      </div>

      {/* TOP POST + PLATFORM BARS */}
      <div className="dash-grid">
        <div className="card">
          <div className="card-title">🏆 Top Post</div>
          <div className="top-post-quote">
            "Omo, see upgrade! 👀 When you invest in yourself, the returns dey show on your face."
          </div>
          <div className="top-stats">
            <div className="top-stat">
              <div className="top-stat-icon">💛</div>
              <span className="top-stat-val">1,204</span>
              <div className="top-stat-label">Likes</div>
            </div>
            <div className="top-stat">
              <div className="top-stat-icon">💬</div>
              <span className="top-stat-val">187</span>
              <div className="top-stat-label">Comments</div>
            </div>
            <div className="top-stat">
              <div className="top-stat-icon">🔁</div>
              <span className="top-stat-val">445</span>
              <div className="top-stat-label">Shares</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">📊 Engagement by Platform</div>
          <div ref={barsRef}>
            {sortedByLikes.map(post => {
              const p = PLATFORMS.find(x => x.id === post.platform);
              const pct = Math.round((post.likes / MAX_LIKES) * 100);
              return (
                <div key={post.id} className="plat-bar-wrap">
                  <div className="plat-bar-header">
                    <span className="plat-bar-name">{p?.icon} {p?.label}</span>
                    <span className="plat-bar-val">{post.likes.toLocaleString()} 💛</span>
                  </div>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{ width: 0, background: `linear-gradient(90deg, ${p?.color}, var(--gold))` }}
                      data-target={pct}
                    />
                  </div>
                  <div className="plat-bar-caption">{post.caption.slice(0, 58)}…</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ALL POSTS TABLE */}
      <div className="card">
        <div className="card-title" style={{ justifyContent: 'space-between' }}>All Posts</div>
        <div className="posts-table-header">
          <span>Caption</span>
          <span>Platform</span>
          <span>Likes</span>
          <span>Comments</span>
          <span>Reach</span>
        </div>
        {filtered.map(post => {
          const p = PLATFORMS.find(x => x.id === post.platform);
          return (
            <div key={post.id} className="post-row">
              <span className="post-caption">{post.caption}</span>
              <span className="post-plat" style={{ color: p?.color }}>{p?.icon} {p?.label}</span>
              <span className="post-num post-num-hi">{post.likes.toLocaleString()}</span>
              <span className="post-num">{post.comments}</span>
              <span className="post-num">{post.reach.toLocaleString()}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
