import { useState } from 'react';
import { User, Stethoscope, MapPin, ArrowRight, Brain } from 'lucide-react';
import useChatStore from '../store/chatStore';

export default function ContextModal() {
  const { setUserContext } = useChatStore();
  const [form, setForm] = useState({
    patientName: '',
    disease: '',
    location: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!form.disease.trim()) {
      setError('Please enter a disease or condition');
      return;
    }
    setUserContext(form);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #7c3aed 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px'
    }}>
      <div style={{
        background: 'white', borderRadius: '24px',
        padding: '48px', maxWidth: '480px', width: '100%',
        boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px', height: '64px',
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            borderRadius: '16px', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Brain size={32} color="white" />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a' }}>
            Curalink
          </h1>
          <p style={{ color: '#64748b', marginTop: '8px', fontSize: '15px' }}>
            AI-powered medical research assistant
          </p>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Name */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>
              Your Name (Optional)
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="John Smith"
                value={form.patientName}
                onChange={e => setForm({ ...form, patientName: e.target.value })}
                style={{
                  width: '100%', padding: '12px 12px 12px 36px',
                  border: '2px solid #e2e8f0', borderRadius: '10px',
                  fontSize: '14px', outline: 'none', transition: 'border 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={e => e.target.style.border = '2px solid #2563eb'}
                onBlur={e => e.target.style.border = '2px solid #e2e8f0'}
              />
            </div>
          </div>

          {/* Disease */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>
              Disease / Condition <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Stethoscope size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="e.g. Lung Cancer, Parkinson's, Diabetes"
                value={form.disease}
                onChange={e => { setForm({ ...form, disease: e.target.value }); setError(''); }}
                style={{
                  width: '100%', padding: '12px 12px 12px 36px',
                  border: `2px solid ${error ? '#ef4444' : '#e2e8f0'}`, borderRadius: '10px',
                  fontSize: '14px', outline: 'none', transition: 'border 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={e => e.target.style.border = '2px solid #2563eb'}
                onBlur={e => e.target.style.border = `2px solid ${error ? '#ef4444' : '#e2e8f0'}`}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>
            {error && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{error}</p>}
          </div>

          {/* Location */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>
              Location (Optional)
            </label>
            <div style={{ position: 'relative' }}>
              <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="e.g. Mumbai, India"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                style={{
                  width: '100%', padding: '12px 12px 12px 36px',
                  border: '2px solid #e2e8f0', borderRadius: '10px',
                  fontSize: '14px', outline: 'none', transition: 'border 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={e => e.target.style.border = '2px solid #2563eb'}
                onBlur={e => e.target.style.border = '2px solid #e2e8f0'}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            style={{
              width: '100%', padding: '14px',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              color: 'white', border: 'none', borderRadius: '10px',
              fontSize: '15px', fontWeight: '600', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '8px', marginTop: '8px', transition: 'opacity 0.2s'
            }}
            onMouseEnter={e => e.target.style.opacity = '0.9'}
            onMouseLeave={e => e.target.style.opacity = '1'}
          >
            Start Research Session
            <ArrowRight size={18} />
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8', marginTop: '20px' }}>
          🔒 Your data is used only to personalize research results
        </p>
      </div>
    </div>
  );
}