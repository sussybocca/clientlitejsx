// @clj-animate particleField3D

function ChatApp() {
  const [messages, setMessages] = __CLJ_useState([
    { id: 1, user: 'QuantumBot', text: 'Welcome to 4D Chat! ✨', time: new Date(), isOwn: false },
    { id: 2, user: 'System', text: 'Your messages are encrypted quantumly', time: new Date(), isOwn: false }
  ]);
  const [input, setInput] = __CLJ_useState('');
  const [username, setUsername] = __CLJ_useState('Traveler');
  const [usernameModal, setUsernameModal] = __CLJ_useState(true);
  const [onlineUsers, setOnlineUsers] = __CLJ_useState(['QuantumBot', 'System', 'Alice', 'Bob', 'Charlie']);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg = {
      id: Date.now(),
      user: username,
      text: input,
      time: new Date(),
      isOwn: true
    };
    setMessages([...messages, newMsg]);
    setInput('');
    
    setTimeout(() => {
      const replies = ['Interesting! 🤔', 'Tell me more!', '✨ Quantum vibes!', '4D thinking! 🌌', 'Awesome! 🚀'];
      const reply = {
        id: Date.now() + 1,
        user: 'QuantumBot',
        text: replies[Math.floor(Math.random() * replies.length)],
        time: new Date(),
        isOwn: false
      };
      setMessages(prev => [...prev, reply]);
    }, 1000);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {usernameModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="clj-card" style={{ padding: '30px', borderRadius: '20px', width: '90%', maxWidth: '400px', textAlign: 'center' }}>
            <h2>✨ Enter the 4D Chat</h2>
            <input 
              value={username} 
              onInput={(e) => setUsername(e.target.value)}
              placeholder="Your quantum name..."
              style={{ width: '100%', padding: '12px', margin: '20px 0', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', border: '1px solid #667eea', color: '#fff' }}
            />
            <button onClick={() => setUsernameModal(false)} className="clj-btn" style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg,#667eea,#764ba2)' }}>Enter Chat</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
        <div className="clj-glass" style={{ padding: '15px 20px', borderBottom: '1px solid rgba(102,126,234,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px' }}>🌌 4D Quantum Chat</h1>
            <p style={{ margin: 0, fontSize: '12px', opacity: 0.7 }}>Welcome, {username}!</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {onlineUsers.slice(0, 3).map(user => (
              <span key={user} style={{ padding: '4px 12px', background: 'rgba(102,126,234,0.2)', borderRadius: '20px', fontSize: '12px' }}>{user}</span>
            ))}
            {onlineUsers.length > 3 && <span>+{onlineUsers.length - 3}</span>}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {messages.map(msg => (
            <div key={msg.id} style={{ display: 'flex', justifyContent: msg.isOwn ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '70%' }}>
                {!msg.isOwn && <div style={{ fontSize: '12px', marginBottom: '4px', opacity: 0.7 }}>{msg.user}</div>}
                <div className={msg.isOwn ? 'clj-btn' : 'clj-card'} style={{ 
                  padding: '10px 15px', 
                  borderRadius: '18px',
                  background: msg.isOwn ? 'linear-gradient(135deg,#667eea,#764ba2)' : 'rgba(255,255,255,0.1)',
                  wordWrap: 'break-word'
                }}>
                  {msg.text}
                </div>
                <div style={{ fontSize: '10px', marginTop: '4px', opacity: 0.5, textAlign: msg.isOwn ? 'right' : 'left' }}>{formatTime(msg.time)}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="clj-glass" style={{ padding: '15px 20px', borderTop: '1px solid rgba(102,126,234,0.3)', display: 'flex', gap: '10px' }}>
          <input 
            value={input}
            onInput={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a quantum message..."
            style={{ flex: 1, padding: '12px', borderRadius: '25px', background: 'rgba(255,255,255,0.1)', border: '1px solid #667eea', color: '#fff' }}
          />
          <button onClick={sendMessage} className="clj-btn" style={{ padding: '12px 25px', borderRadius: '25px', background: 'linear-gradient(135deg,#667eea,#ff44aa)' }}>Send ✨</button>
        </div>
      </div>
    </div>
  );
}

__CLJ_mount(ChatApp, 'root');