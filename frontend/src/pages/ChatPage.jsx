import { useState, useRef, useEffect } from 'react';
import { chatStream } from '../lib/api';

const SUGGESTIONS = [
  'What should I train today?',
  'How is my chest recovery?',
  'Give me an overload tip',
  'Analyze my recent workouts',
];

function now() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "I have your workout history and recovery data loaded. Ask me anything about your training.",
      time: now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const threadRef = useRef(null);

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages]);

  async function send(text) {
    const userMsg = (text || input).trim();
    if (!userMsg || loading) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', text: userMsg, time: now() }]);
    setLoading(true);

    let aiText = '';
    const t = now();
    setMessages(m => [...m, { role: 'assistant', text: '', time: t, streaming: true }]);

    try {
      await chatStream(
        userMsg,
        (chunk) => {
          aiText += chunk;
          setMessages(m => m.map((msg, i) => i === m.length - 1 ? { ...msg, text: aiText } : msg));
        },
        () => {
          setMessages(m => m.map((msg, i) => i === m.length - 1 ? { ...msg, streaming: false } : msg));
          setLoading(false);
        }
      );
    } catch {
      setMessages(m => m.map((msg, i) => i === m.length - 1
        ? { role: 'assistant', text: 'Something went wrong. Please try again.', time: t, streaming: false }
        : msg));
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  const showSuggestions = messages.length <= 1;

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-head" style={{ marginBottom: '24px' }}>
        <div>
          <div className="page-eyebrow"><span className="num">03</span>AI Coach</div>
          <h1 className="page-title">Speak with <em>Claude.</em></h1>
        </div>
        <div className="page-aside">Sonnet 4 · knows your history</div>
      </div>

      <div className="chat-shell" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {showSuggestions && (
          <div className="suggestions">
            {SUGGESTIONS.map(s => (
              <button key={s} className="sugg" onClick={() => send(s)}>{s}</button>
            ))}
          </div>
        )}

        <div
          className="chat-thread"
          ref={threadRef}
          style={{ flex: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 360px)' }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`msg ${msg.role === 'user' ? 'user' : 'coach'}${msg.streaming ? ' streaming' : ''}`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="msg-meta">
                {msg.role === 'assistant' && <span className="dot" />}
                {msg.role === 'assistant' ? `Coach · ${msg.time}` : `You · ${msg.time}`}
                {msg.role === 'user' && <span className="dot" />}
              </div>
              <div
                className="msg-body"
                dangerouslySetInnerHTML={{
                  __html: (msg.text || '').replace(
                    /\*\*(.*?)\*\*/g,
                    '<em>$1</em>'
                  ),
                }}
              />
            </div>
          ))}
        </div>

        <div className="chat-input">
          <span className="prompt">›</span>
          <input
            type="text"
            placeholder="Ask about your programming, fatigue, or anything else…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
}
