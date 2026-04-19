import { useState, useRef, useEffect } from 'react';
import { 
  Send, Brain, RefreshCw, ChevronRight, 
  BookOpen, FlaskConical, Loader2, 
  Stethoscope, BarChart3, Menu, X
} from 'lucide-react';
import useChatStore from './store/chatStore';
import ContextModal from './components/ContextModal';
import MessageBubble from './components/MessageBubble';
import PublicationCard from './components/PublicationCard';
import ClinicalTrialCard from './components/ClinicalTrialCard';

export default function App() {
  const {
    messages, publications, clinicalTrials,
    isLoading, isContextSet, userContext,
    metadata, resetChat, sendMessage
  } = useChatStore();

  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState('publications');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const msg = input.trim();
    setInput('');
    await sendMessage(msg);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const SUGGESTED = [
    'Latest treatment options',
    'Current clinical trials',
    'Recent research findings',
    'Side effects of treatments',
  ];

  if (!isContextSet) return <ContextModal />;

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f8fafc', overflow: 'hidden' }}>

      {/* ── LEFT: Chat Panel ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        minWidth: 0, background: '#f8fafc'
      }}>

        {/* Header */}
        <div style={{
          background: 'white', borderBottom: '1px solid #e2e8f0',
          padding: '0 20px', height: '64px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px', height: '36px',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              borderRadius: '10px', display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}>
              <Brain size={20} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                Curalink
              </h1>
              <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                Medical Research Assistant
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* User context pill */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: '#eff6ff', padding: '6px 12px', borderRadius: '20px'
            }}>
              <Stethoscope size={13} color="#2563eb" />
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#2563eb' }}>
                {userContext.disease}
              </span>
              {userContext.patientName && (
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  · {userContext.patientName}
                </span>
              )}
            </div>

            {/* Reset */}
            <button onClick={resetChat} title="New Session" style={{
              background: 'none', border: '1px solid #e2e8f0',
              borderRadius: '8px', padding: '7px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', color: '#64748b',
              transition: 'all 0.2s'
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#fecaca'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
            >
              <RefreshCw size={15} />
            </button>

            {/* Toggle sidebar */}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
              background: 'none', border: '1px solid #e2e8f0',
              borderRadius: '8px', padding: '7px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', color: '#64748b'
            }}>
              {sidebarOpen ? <X size={15} /> : <Menu size={15} />}
            </button>
          </div>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '24px 20px',
          display: 'flex', flexDirection: 'column'
        }}>
          {messages.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              {/* Welcome */}
              <div style={{
                width: '72px', height: '72px',
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                borderRadius: '20px', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                marginBottom: '20px',
                boxShadow: '0 8px 24px rgba(37,99,235,0.3)'
              }}>
                <Brain size={36} color="white" />
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
                Hello{userContext.patientName ? `, ${userContext.patientName}` : ''}! 👋
              </h2>
              <p style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', maxWidth: '400px', lineHeight: '1.7' }}>
                I'm your AI medical research companion. Ask me anything about{' '}
                <strong style={{ color: '#2563eb' }}>{userContext.disease}</strong>.
                I'll search real publications and clinical trials to give you research-backed answers.
              </p>

              {/* Suggested queries */}
              <div style={{ marginTop: '32px', width: '100%', maxWidth: '500px' }}>
                <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px', textAlign: 'center', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Try asking
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {SUGGESTED.map((q, i) => (
                    <button key={i} onClick={() => { setInput(q); inputRef.current?.focus(); }}
                      style={{
                        background: 'white', border: '1px solid #e2e8f0',
                        borderRadius: '10px', padding: '12px 16px',
                        fontSize: '13px', color: '#374151', cursor: 'pointer',
                        textAlign: 'left', display: 'flex',
                        alignItems: 'center', justifyContent: 'space-between',
                        transition: 'all 0.2s', fontWeight: '500'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.color = '#2563eb'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#374151'; }}
                    >
                      {q} <ChevronRight size={14} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <MessageBubble key={i} message={msg} />
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '24px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Brain size={18} color="white" />
                  </div>
                  <div style={{
                    background: 'white', border: '1px solid #e2e8f0',
                    borderRadius: '4px 18px 18px 18px', padding: '16px 20px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Loader2 size={16} color="#2563eb" style={{ animation: 'spin 1s linear infinite' }} />
                      <span style={{ fontSize: '13px', color: '#64748b' }}>
                        Searching publications & clinical trials...
                      </span>
                    </div>
                    <div style={{ marginTop: '8px', display: 'flex', gap: '6px' }}>
                      {['PubMed', 'OpenAlex', 'ClinicalTrials'].map((src, i) => (
                        <span key={i} style={{
                          fontSize: '11px', padding: '2px 8px',
                          background: '#f1f5f9', borderRadius: '20px', color: '#64748b'
                        }}>
                          {src}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Metadata bar */}
        {metadata && (
          <div style={{
            background: 'white', borderTop: '1px solid #e2e8f0',
            padding: '8px 20px', display: 'flex', gap: '16px',
            alignItems: 'center', flexWrap: 'wrap'
          }}>
            <BarChart3 size={13} color="#94a3b8" />
            {[
              { label: 'Fetched', val: metadata.totalFetched },
              { label: 'Ranked', val: metadata.afterRanking },
              { label: 'PubMed', val: metadata.sources?.pubmed },
              { label: 'OpenAlex', val: metadata.sources?.openAlex },
              { label: 'Trials', val: metadata.sources?.clinicalTrials },
            ].map((item, i) => item.val !== undefined && (
              <span key={i} style={{ fontSize: '11px', color: '#64748b' }}>
                <strong style={{ color: '#374151' }}>{item.val}</strong> {item.label}
              </span>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{
          background: 'white', borderTop: '1px solid #e2e8f0',
          padding: '16px 20px'
        }}>
          <div style={{
            display: 'flex', gap: '10px', alignItems: 'flex-end',
            background: '#f8fafc', borderRadius: '14px',
            border: '2px solid #e2e8f0', padding: '8px 8px 8px 16px',
            transition: 'border 0.2s'
          }}
            onFocus={() => {}}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask about ${userContext.disease}...`}
              rows={1}
              style={{
                flex: 1, border: 'none', background: 'transparent',
                fontSize: '14px', color: '#0f172a', resize: 'none',
                outline: 'none', fontFamily: 'inherit', lineHeight: '1.6',
                maxHeight: '120px', overflowY: 'auto'
              }}
              onInput={e => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              style={{
                width: '38px', height: '38px', borderRadius: '10px',
                background: input.trim() && !isLoading
                  ? 'linear-gradient(135deg, #2563eb, #7c3aed)'
                  : '#e2e8f0',
                border: 'none', cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all 0.2s'
              }}
            >
              {isLoading
                ? <Loader2 size={16} color="#94a3b8" style={{ animation: 'spin 1s linear infinite' }} />
                : <Send size={16} color={input.trim() ? 'white' : '#94a3b8'} />
              }
            </button>
          </div>
          <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px', textAlign: 'center' }}>
            Powered by real PubMed · OpenAlex · ClinicalTrials.gov data · Llama 3.3 70B
          </p>
        </div>
      </div>

      {/* ── RIGHT: Research Panel ── */}
      {sidebarOpen && (
        <div style={{
          width: '380px', flexShrink: 0,
          background: 'white', borderLeft: '1px solid #e2e8f0',
          display: 'flex', flexDirection: 'column',
          boxShadow: '-4px 0 12px rgba(0,0,0,0.04)'
        }}>
          {/* Panel Header */}
          <div style={{
            padding: '0 20px', height: '64px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              Research Results
            </h3>
            {metadata && (
              <span style={{
                fontSize: '11px', color: '#64748b',
                background: '#f1f5f9', padding: '3px 8px', borderRadius: '20px'
              }}>
                {metadata.totalFetched} sources analyzed
              </span>
            )}
          </div>

          {/* Tabs */}
          <div style={{
            display: 'flex', borderBottom: '1px solid #e2e8f0',
            padding: '0 20px'
          }}>
            {[
              { id: 'publications', label: 'Publications', icon: BookOpen, count: publications.length },
              { id: 'trials', label: 'Clinical Trials', icon: FlaskConical, count: clinicalTrials.length }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1, padding: '12px 8px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  borderBottom: activeTab === tab.id ? '2px solid #2563eb' : '2px solid transparent',
                  color: activeTab === tab.id ? '#2563eb' : '#64748b',
                  fontSize: '13px', fontWeight: activeTab === tab.id ? '600' : '500',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '6px', transition: 'all 0.2s', marginBottom: '-1px'
                }}
              >
                <tab.icon size={14} />
                {tab.label}
                {tab.count > 0 && (
                  <span style={{
                    background: activeTab === tab.id ? '#eff6ff' : '#f1f5f9',
                    color: activeTab === tab.id ? '#2563eb' : '#64748b',
                    padding: '1px 6px', borderRadius: '10px',
                    fontSize: '11px', fontWeight: '700'
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Results */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            {activeTab === 'publications' ? (
              publications.length > 0 ? (
                publications.map((pub, i) => (
                  <PublicationCard key={i} pub={pub} index={i} />
                ))
              ) : (
                <EmptyState
                  icon={<BookOpen size={32} color="#94a3b8" />}
                  text="Publications will appear here after your first query"
                />
              )
            ) : (
              clinicalTrials.length > 0 ? (
                clinicalTrials.map((trial, i) => (
                  <ClinicalTrialCard key={i} trial={trial} index={i} />
                ))
              ) : (
                <EmptyState
                  icon={<FlaskConical size={32} color="#94a3b8" />}
                  text="Clinical trials will appear here after your first query"
                />
              )
            )}
          </div>
        </div>
      )}

      {/* Spinner CSS */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function EmptyState({ icon, text }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      height: '200px', gap: '12px'
    }}>
      {icon}
      <p style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', maxWidth: '200px', lineHeight: '1.6' }}>
        {text}
      </p>
    </div>
  );
}