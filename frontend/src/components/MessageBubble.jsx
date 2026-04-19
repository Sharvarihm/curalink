import ReactMarkdown from 'react-markdown';
import { Brain, User } from 'lucide-react';

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <div style={{
      display: 'flex',
      flexDirection: isUser ? 'row-reverse' : 'row',
      gap: '12px',
      marginBottom: '24px',
      alignItems: 'flex-start'
    }}>
      {/* Avatar */}
      <div style={{
        width: '36px', height: '36px', borderRadius: '50%',
        background: isUser
          ? 'linear-gradient(135deg, #2563eb, #7c3aed)'
          : 'linear-gradient(135deg, #10b981, #059669)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
      }}>
        {isUser
          ? <User size={18} color="white" />
          : <Brain size={18} color="white" />
        }
      </div>

      {/* Bubble */}
      <div style={{
        maxWidth: '80%',
        background: isUser
          ? 'linear-gradient(135deg, #2563eb, #7c3aed)'
          : 'white',
        color: isUser ? 'white' : '#0f172a',
        padding: '16px 20px',
        borderRadius: isUser ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        border: isUser ? 'none' : '1px solid #e2e8f0'
      }}>
        {isUser ? (
          <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6' }}>
            {message.content}
          </p>
        ) : (
          <div className="markdown-content" style={{ fontSize: '14px', lineHeight: '1.8' }}>
            <ReactMarkdown
              components={{
                h2: ({children}) => (
                  <h2 style={{
                    fontSize: '16px', fontWeight: '700', color: '#1e40af',
                    margin: '20px 0 10px', paddingBottom: '6px',
                    borderBottom: '2px solid #eff6ff',
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}>{children}</h2>
                ),
                h3: ({children}) => (
                  <h3 style={{ fontSize: '14px', fontWeight: '600', margin: '12px 0 6px' }}>
                    {children}
                  </h3>
                ),
                p: ({children}) => (
                  <p style={{ margin: '8px 0', lineHeight: '1.8' }}>{children}</p>
                ),
                ul: ({children}) => (
                  <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>{children}</ul>
                ),
                li: ({children}) => (
                  <li style={{ margin: '6px 0', lineHeight: '1.7' }}>{children}</li>
                ),
                strong: ({children}) => (
                  <strong style={{ color: '#1e40af', fontWeight: '600' }}>{children}</strong>
                ),
                a: ({href, children}) => (
                  <a href={href} target="_blank" rel="noopener noreferrer"
                    style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}
                    onMouseEnter={e => e.target.style.textDecoration = 'underline'}
                    onMouseLeave={e => e.target.style.textDecoration = 'none'}
                  >{children}</a>
                ),
                table: ({children}) => (
                  <div style={{ overflowX: 'auto', margin: '12px 0' }}>
                    <table style={{
                      width: '100%', borderCollapse: 'collapse',
                      fontSize: '13px'
                    }}>{children}</table>
                  </div>
                ),
                th: ({children}) => (
                  <th style={{
                    padding: '8px 12px', background: '#eff6ff',
                    border: '1px solid #bfdbfe', textAlign: 'left',
                    fontWeight: '600', color: '#1e40af', fontSize: '12px'
                  }}>{children}</th>
                ),
                td: ({children}) => (
                  <td style={{
                    padding: '8px 12px', border: '1px solid #e2e8f0',
                    fontSize: '12px', color: '#374151'
                  }}>{children}</td>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {/* Timestamp */}
        <p style={{
          fontSize: '11px',
          color: isUser ? 'rgba(255,255,255,0.6)' : '#94a3b8',
          margin: '8px 0 0', textAlign: 'right'
        }}>
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit', minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  );
}