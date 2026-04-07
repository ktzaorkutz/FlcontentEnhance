export default function Header({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'studio',    label: '🎨 Studio'    },
    { id: 'schedule',  label: '📅 Schedule'  },
    { id: 'dashboard', label: '📊 Dashboard' },
  ];

  return (
    <header>
      <div>
        <span className="logo">SocialPulse</span>
        <span className="logo-badge">Africa Edition</span>
      </div>
      <nav className="nav">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`nav-btn${activeTab === t.id ? ' active' : ''}`}
            onClick={() => onTabChange(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>
      <div className="header-loc">Lagos, NG 🇳🇬</div>
    </header>
  );
}
