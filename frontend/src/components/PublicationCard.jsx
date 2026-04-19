import { ExternalLink, Calendar, Users, BookOpen } from 'lucide-react';

export default function PublicationCard({ pub, index }) {
  return (
    <div style={{
      background: 'white', border: '1px solid #e2e8f0',
      borderRadius: '12px', padding: '16px', marginBottom: '12px',
      transition: 'all 0.2s', cursor: 'default',
      borderLeft: '4px solid #2563eb'
    }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.15)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Badge + Source */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{
          background: '#eff6ff', color: '#2563eb',
          padding: '2px 8px', borderRadius: '20px',
          fontSize: '11px', fontWeight: '700'
        }}>
          PUB{index + 1}
        </span>
        <span style={{
          background: pub.source === 'PubMed' ? '#ecfdf5' : '#f5f3ff',
          color: pub.source === 'PubMed' ? '#059669' : '#7c3aed',
          padding: '2px 8px', borderRadius: '20px',
          fontSize: '11px', fontWeight: '600'
        }}>
          {pub.source}
        </span>
      </div>

      {/* Title */}
      <h4 style={{
        fontSize: '13px', fontWeight: '600', color: '#0f172a',
        lineHeight: '1.5', marginBottom: '8px'
      }}>
        {pub.title}
      </h4>

      {/* Abstract */}
      {pub.abstract && pub.abstract !== 'No abstract available' && (
        <p style={{
          fontSize: '12px', color: '#64748b',
          lineHeight: '1.6', marginBottom: '10px',
          display: '-webkit-box', WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical', overflow: 'hidden'
        }}>
          {pub.abstract}
        </p>
      )}

      {/* Meta */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '10px' }}>
        {pub.year && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748b' }}>
            <Calendar size={11} /> {pub.year}
          </span>
        )}
        {pub.authors?.length > 0 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748b' }}>
            <Users size={11} />
            {Array.isArray(pub.authors) ? pub.authors.slice(0, 2).join(', ') : pub.authors}
            {Array.isArray(pub.authors) && pub.authors.length > 2 ? ' et al.' : ''}
          </span>
        )}
        {pub.citationCount > 0 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748b' }}>
            <BookOpen size={11} /> {pub.citationCount} citations
          </span>
        )}
      </div>

      {/* Score + Link */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          fontSize: '11px', color: '#94a3b8'
        }}>
          Relevance: {pub.relevanceScore}pts
        </span>
        {pub.url && (
          <a href={pub.url} target="_blank" rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              fontSize: '12px', color: '#2563eb', textDecoration: 'none',
              fontWeight: '500', padding: '4px 10px',
              background: '#eff6ff', borderRadius: '6px'
            }}
          >
            View Paper <ExternalLink size={11} />
          </a>
        )}
      </div>
    </div>
  );
}