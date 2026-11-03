'use client';

import { useState, useEffect } from 'react';
import { getBackendUrl } from '../utils/apiConfig';

export default function AuthModal({
  isOpen,
  initialMode = 'signin',
  prefillEmail = '',
  onClose,
  onAuthSuccess,
}) {
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ message: '', type: '' });

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setEmail(prefillEmail || '');
      setPassword('');
      setName('');
      setAlert({ message: '', type: '' });
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, initialMode, prefillEmail]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ message: '', type: '' });

    if (!email) {
      setAlert({ message: 'Please enter a valid email address.', type: 'error' });
      return;
    }

    if (password.length < 6) {
      setAlert({ message: 'Password must be at least 6 characters.', type: 'error' });
      return;
    }

    if (mode === 'signup' && !name.trim()) {
      setAlert({ message: 'Please enter your name.', type: 'error' });
      return;
    }

    setLoading(true);

    try {
      const apiBase = `${getBackendUrl()}/api/auth`;
      const endpoint = mode === 'signup' ? `${apiBase}/register` : `${apiBase}/login`;
      const payload = mode === 'signup' ? { name, email, password } : { email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('netflix_token', data.token);
        localStorage.setItem('netflix_user', JSON.stringify(data.user));

        setAlert({
          message: data.message || 'Success!',
          type: 'success',
        });

        setTimeout(() => {
          onAuthSuccess(data.user, mode === 'signup' ? 'Registered successfully' : 'Signed in successfully');
          onClose();
        }, 600);
      } else {
        setAlert({
          message: data.message || 'Authentication failed. Please check credentials.',
          type: 'error',
        });
      }
    } catch (err) {
      console.error('Auth error:', err);
      setAlert({
        message: 'Could not connect to backend server. Make sure it is running on port 5000.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="auth-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="auth-modal">
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close modal"
        >
          &times;
        </button>

        <div className="auth-box">
          <h2>{mode === 'signup' ? 'Sign Up' : 'Sign In'}</h2>

          {alert.message && (
            <div className={`auth-alert ${alert.type}`}>{alert.message}</div>
          )}

          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            )}

            <div className="form-group">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus={mode !== 'signup'}
              />
            </div>

            <div className="form-group password-group">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password (minimum 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                <i className={showPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'}></i>
              </button>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading
                ? mode === 'signup'
                  ? 'Creating Account...'
                  : 'Signing In...'
                : mode === 'signup'
                ? 'Sign Up'
                : 'Sign In'}
            </button>
          </form>

          <div className="auth-switch">
            {mode === 'signup' ? (
              <p>
                Already have an account?
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setAlert({ message: '', type: '' });
                  }}
                >
                  Sign In now.
                </button>
              </p>
            ) : (
              <p>
                New to Music?
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setAlert({ message: '', type: '' });
                  }}
                >
                  Sign up now.
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
