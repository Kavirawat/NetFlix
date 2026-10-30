'use client';

export default function Toast({ message, isVisible }) {
  if (!isVisible || !message) return null;

  return (
    <div className={`toast-notification ${isVisible ? 'show' : ''}`}>
      {message}
    </div>
  );
}
