export default function LoadingOverlay({ visible, message }) {
  if (!visible) return null;
  return (
    <div className="loading-overlay">
      <div className="spinner spinner-gold" style={{ width: 32, height: 32, borderWidth: 3 }} />
      <div className="loading-text">{message || 'Loading…'}</div>
    </div>
  );
}
