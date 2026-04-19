import { ExternalLink, MapPin, Users, Activity } from 'lucide-react';

const STATUS_CONFIG = {
  'RECRUITING': { bg: '#ecfdf5', color: '#059669', dot: '#10b981', label: 'Recruiting' },
  'ACTIVE_NOT_RECRUITING': { bg: '#eff6ff', color: '#2563eb', dot: '#3b82f6', label: 'Active' },
  'COMPLETED': { bg: '#f8fafc', color: '#64748b', dot: '#94a3b8', label: 'Completed' },
  'ENROLLING_BY_INVITATION': { bg: '#fefce8', color: '#ca8a04', dot: '#eab308', label: 'By Invitation' },
  'TERMINATED': { bg: '#fef2f2', color: '#dc2626', dot: '#ef4444', label: 'Terminated' },
};

export default function ClinicalTrialCard({ trial, index }) {
  const status = STATUS_CONFIG[trial.status] || STATUS_CONFIG['COMPLETED'];

  return (
    <div style={{
      background: 'white', border: '1px solid #e2e8f0',
      borderRadius: '12px', padding: '16px', marginBottom: '12px',
      borderLeft: '4px solid #10b981', transition: 'all 0.2s'
    }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(16,185,129,0.15)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Badge + Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{
          background: '#ecfdf5', color: '#059669',
          padding: '2px 8px', borderRadius: '20px',
          fontSize: '11px', fontWeight: '700'
        }}>
          TRIAL{index + 1}
        </span>
        <span style={{
          background: status.bg, color: status.color,
          padding: '2px 10px', borderRadius: '20px',
          fontSize: '11px', fontWeight: '600',
          display: 'flex', alignItems: 'center', gap: '5px'
        }}>
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: status.dot, display: 'inline-block'
          }} />
          {status.label}
        </span>
      </div>

      {/* Title */}
      <h4 style={{
        fontSize: '13px', fontWeight: '600', color: '#0f172a',
        lineHeight: '1.5', marginBottom: '10px'
      }}>
        {trial.title}
      </h4>

      {/* Meta */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '10px' }}>
        {trial.phase && trial.phase !== 'N/A' && (
          <span style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            fontSize: '11px', color: '#64748b'
          }}>
            <Activity size={11} /> {trial.phase}
          </span>
        )}
        {trial.eligibility?.minAge && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748b' }}>
            <Users size={11} />
            {trial.eligibility.minAge} - {trial.eligibility.maxAge || 'Any'}
          </span>
        )}
        {trial.locations?.length > 0 && trial.locations[0].country && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748b' }}>
            <MapPin size={11} />
            {trial.locations[0].city ? `${trial.locations[0].city}, ` : ''}
            {trial.locations[0].country}
          </span>
        )}
      </div>

      {/* NCT ID + Link */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>
          {trial.nctId}
        </span>
        <a href={trial.url} target="_blank" rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            fontSize: '12px', color: '#059669', textDecoration: 'none',
            fontWeight: '500', padding: '4px 10px',
            background: '#ecfdf5', borderRadius: '6px'
          }}
        >
          View Trial <ExternalLink size={11} />
        </a>
      </div>
    </div>
  );
}