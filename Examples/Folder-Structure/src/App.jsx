// CLJ Power App - No React Required
// @clj-animate particleNebula
// @clj-animate starfield

function App() {
  const [count, setCount] = __CLJ_useState(0);
  const [theme, setTheme] = __CLJ_useState('dark');
  const [todos, setTodos] = __CLJ_useState([]);
  const [newTodo, setNewTodo] = __CLJ_useState('');
  const [userId, setUserId] = __CLJ_useState(1);
  const [user, setUser] = __CLJ_useState(null);
  const [loading, setLoading] = __CLJ_useState(false);
  const [activeTab, setActiveTab] = __CLJ_useState('counters');
  const [showVideo, setShowVideo] = __CLJ_useState(false);
  const [animIntensity, setAnimIntensity] = __CLJ_useState(1);
  const [rippleColor, setRippleColor] = __CLJ_useState('rgba(0,170,255,.4)');
  const [cardHoverEnabled, setCardHoverEnabled] = __CLJ_useState(true);
  const [showModal, setShowModal] = __CLJ_useState(false);
  const [sliderValue, setSliderValue] = __CLJ_useState(50);
  const [switchEnabled, setSwitchEnabled] = __CLJ_useState(true);
  const [ratingValue, setRatingValue] = __CLJ_useState(4);
  const [progressValue, setProgressValue] = __CLJ_useState(65);
  const [toastMessage, setToastMessage] = __CLJ_useState('');
  const containerRef = __CLJ_useRef(null);
  const modalRef = __CLJ_useRef(null);
  const sliderContainerRef = __CLJ_useRef(null);
  const tabsContainerRef = __CLJ_useRef(null);
  const switchContainerRef = __CLJ_useRef(null);
  const ratingContainerRef = __CLJ_useRef(null);
  const progressContainerRef = __CLJ_useRef(null);
  const accordionContainerRef = __CLJ_useRef(null);
  const carouselContainerRef = __CLJ_useRef(null);
  const tooltipTargetRef = __CLJ_useRef(null);

  const counterStates = Array(20).fill().map(() => {
    const [c, setC] = __CLJ_useState(0);
    return { count: c, inc: () => setC(c + 1), dec: () => setC(Math.max(0, c - 1)) };
  });

  __CLJ_useEffect(() => {
    console.log('⚡ CLJ Power App Mounted with 80 Animations + UI Component Library');
    setTimeout(() => setShowVideo(true), 1000);
    
    if (typeof __CLJ_interact !== 'undefined') {
      document.querySelectorAll('.tab-btn').forEach(btn => {
        __CLJ_interact.glowOnHover(btn, 'rgba(0,170,255,.4)', 25);
      });
      document.querySelectorAll('.action-btn').forEach(btn => {
        __CLJ_interact.glowOnHover(btn, 'rgba(40,167,69,.4)', 20);
      });
      document.querySelectorAll('.danger-btn').forEach(btn => {
        __CLJ_interact.glowOnHover(btn, 'rgba(220,53,69,.4)', 20);
      });
    }

    // Initialize CLJ UI Components
    if (typeof CLJ !== 'undefined') {
      // Slider
      if (sliderContainerRef.current) {
        new CLJ.Slider(sliderContainerRef.current, {
          min: 0, max: 100, value: sliderValue, step: 1,
          onChange: (val) => setSliderValue(val)
        });
      }

      // Switch
      if (switchContainerRef.current) {
        new CLJ.Switch(switchContainerRef.current, {
          checked: switchEnabled,
          onChange: (val) => setSwitchEnabled(val)
        });
      }

      // Rating
      if (ratingContainerRef.current) {
        new CLJ.Rating(ratingContainerRef.current, {
          max: 5, value: ratingValue,
          onChange: (val) => setRatingValue(val)
        });
      }

      // Progress Bar
      if (progressContainerRef.current) {
        const progressBar = new CLJ.ProgressBar(progressContainerRef.current, {
          value: progressValue, max: 100, color: '#00aaff'
        });
        setTimeout(() => progressBar.setValue(progressValue), 500);
      }

      // Accordion
      if (accordionContainerRef.current) {
        new CLJ.Accordion(accordionContainerRef.current, [
          { title: '🚀 Getting Started', content: '<p style="color:#ddd;">Welcome to CLJ POWER mode! This framework requires zero dependencies and runs directly in your browser.</p>', open: true },
          { title: '🎮 Counters', content: '<p style="color:#ddd;">20 interactive counters with ripple effects, glow animations, and card hover transforms.</p>', open: false },
          { title: '📝 Todos', content: '<p style="color:#ddd;">Full CRUD todo list with add, toggle, and delete functionality.</p>', open: false },
          { title: '👤 User Explorer', content: '<p style="color:#ddd;">Fetch and display user data from JSONPlaceholder API with prev/next navigation.</p>', open: false }
        ]);
      }

      // Carousel
      if (carouselContainerRef.current) {
        new CLJ.Carousel(carouselContainerRef.current, [
          'https://picsum.photos/800/400?random=1',
          'https://picsum.photos/800/400?random=2',
          'https://picsum.photos/800/400?random=3',
          'https://picsum.photos/800/400?random=4',
          'https://picsum.photos/800/400?random=5'
        ], { interval: 4000, auto: true });
      }

      // Tooltip
      if (tooltipTargetRef.current) {
        new CLJ.Tooltip(tooltipTargetRef.current, 'This is a CLJ POWER mode tooltip! 🚀', { position: 'top', showDelay: 100 });
      }
    }
  }, []);

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, { id: Date.now(), text: newTodo, done: false }]);
      setNewTodo('');
      if (typeof CLJ !== 'undefined') {
        CLJ.Toast.show('✅ Task added successfully!', 2500);
      }
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(t => t.id !== id));
    if (typeof CLJ !== 'undefined') {
      CLJ.Toast.show('🗑️ Task deleted', 2000);
    }
  };

  const fetchUser = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
      const u = await res.json();
      setUser(u);
      if (typeof CLJ !== 'undefined') {
        CLJ.Toast.show('👤 User loaded: ' + u.name, 2500);
      }
    } catch(e) {
      if (typeof CLJ !== 'undefined') {
        CLJ.Toast.show('❌ Failed to load user', 3000);
      }
    }
    setLoading(false);
  };

  __CLJ_useEffect(() => { fetchUser(userId); }, [userId]);

  const handleRipple = (e, color) => {
    if (typeof __CLJ_interact !== 'undefined') {
      __CLJ_interact.rippleEffect(e, color || rippleColor);
    }
  };

  const openSettingsModal = () => {
    if (typeof CLJ !== 'undefined') {
      const modal = new CLJ.Modal({
        title: '⚙️ POWER Mode Settings',
        content: `
          <div style="color:#ddd;">
            <p><strong>Animation Intensity:</strong> ${animIntensity}x</p>
            <p><strong>Ripple Color:</strong> ${rippleColor}</p>
            <p><strong>Card Hover:</strong> ${cardHoverEnabled ? 'Enabled' : 'Disabled'}</p>
            <p><strong>Switch Status:</strong> ${switchEnabled ? 'ON' : 'OFF'}</p>
            <p><strong>Rating:</strong> ${'★'.repeat(ratingValue)}${'☆'.repeat(5-ratingValue)}</p>
            <p><strong>Progress:</strong> ${progressValue}%</p>
            <hr style="border-color:#333;margin:15px 0;" />
            <p style="font-size:12px;opacity:0.6;">CLJ POWER Mode v2.0 • 80 Animations • 10 UI Components</p>
          </div>
        `,
        onOpen: () => console.log('Settings opened'),
        onClose: () => console.log('Settings closed')
      });
      modal.open();
    }
  };

  const Counter = ({ count, inc, dec, label, color }) => (
    <div className="clj-card" style={{ 
      background: `linear-gradient(135deg, ${color || 'rgba(255,255,255,0.1)'}, rgba(255,255,255,0.05))`,
      backdropFilter: 'blur(10px)',
      borderRadius: '15px',
      padding: '20px',
      margin: '10px',
      border: '1px solid rgba(255,255,255,0.2)',
      textAlign: 'center',
      transition: 'transform 0.3s ease'
    }}>
      <h2 style={{ fontSize: '24px', margin: '0 0 10px' }}>{label}: {count}</h2>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button 
          className="clj-btn danger-btn"
          onclick={(e) => { handleRipple(e, 'rgba(220,53,69,.3)'); dec(); }}
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            background: 'linear-gradient(135deg, #dc3545, #a71d2a)',
            color: 'white',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '18px'
          }}
        >-</button>
        <button 
          className="clj-btn action-btn"
          onclick={(e) => { handleRipple(e, 'rgba(40,167,69,.3)'); inc(); }}
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            background: 'linear-gradient(135deg, #28a745, #1e7e34)',
            color: 'white',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '18px'
          }}
        >+</button>
      </div>
    </div>
  );

  const colors = ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff', '#ff9f40', '#c9cbcf', '#7bc8a4', '#e8c3b9', '#71b7e6', '#ff6b6b', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#01a3a4', '#f368e0', '#ff6348', '#0abde3', '#10ac84'];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(180deg, #020210 0%, #0a0a2a 50%, #020210 100%)',
      color: '#fff', 
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      overflow: 'hidden'
    }}>
      
      {/* CLJ Native Animation Background - particleNebula active */}
      <canvas id="clj-bg-canvas" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.4
      }} />
      
      {/* Secondary Animation Layer - starfield overlay */}
      <canvas id="clj-bg-canvas-2" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.25
      }} />

      {/* Video Background Overlay */}
      {showVideo && (
        <video 
          autoplay 
          loop 
          muted 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0,
            opacity: 0.1
          }}
        >
          <source src="/animations/App.mp4" type="video/mp4" />
        </video>
      )}

      {/* Header */}
      <header className="clj-gradientShift" style={{
        padding: '20px 40px',
        background: 'linear-gradient(270deg, rgba(10,10,30,0.95), rgba(20,10,40,0.95), rgba(10,10,30,0.95))',
        backgroundSize: '300% 300%',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div>
          <h1 className="clj-textGlow" style={{ 
            fontSize: '32px', 
            background: 'linear-gradient(135deg, #00aaff, #aa44ff, #ff44aa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            ⚡ CLJ Power Engine v2.0
          </h1>
          <p style={{ margin: '5px 0 0', opacity: 0.7, fontSize: '14px' }}>
            No React Required • 80 Animations • 10 UI Components • Pure CLJ Runtime
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button 
            className="clj-btn tab-btn"
            onclick={(e) => { handleRipple(e); setActiveTab('counters'); }}
            style={{
              padding: '10px 20px', borderRadius: '8px', border: 'none',
              background: activeTab === 'counters' ? 'linear-gradient(135deg, #007bff, #0056b3)' : 'rgba(255,255,255,0.1)',
              color: 'white', cursor: 'pointer'
            }}
          >🎮 Counters</button>
          <button 
            className="clj-btn tab-btn"
            onclick={(e) => { handleRipple(e); setActiveTab('todos'); }}
            style={{
              padding: '10px 20px', borderRadius: '8px', border: 'none',
              background: activeTab === 'todos' ? 'linear-gradient(135deg, #007bff, #0056b3)' : 'rgba(255,255,255,0.1)',
              color: 'white', cursor: 'pointer'
            }}
          >📝 Todos</button>
          <button 
            className="clj-btn tab-btn"
            onclick={(e) => { handleRipple(e); setActiveTab('users'); }}
            style={{
              padding: '10px 20px', borderRadius: '8px', border: 'none',
              background: activeTab === 'users' ? 'linear-gradient(135deg, #007bff, #0056b3)' : 'rgba(255,255,255,0.1)',
              color: 'white', cursor: 'pointer'
            }}
          >👤 Users</button>
          <button 
            className="clj-btn tab-btn"
            onclick={(e) => { handleRipple(e); setActiveTab('components'); }}
            style={{
              padding: '10px 20px', borderRadius: '8px', border: 'none',
              background: activeTab === 'components' ? 'linear-gradient(135deg, #007bff, #0056b3)' : 'rgba(255,255,255,0.1)',
              color: 'white', cursor: 'pointer'
            }}
          >🧩 Components</button>
          <span ref={tooltipTargetRef} style={{ cursor: 'help', fontSize: '20px' }}>💡</span>
          <button 
            className="clj-btn clj-pulseGlow"
            onclick={(e) => { handleRipple(e, 'rgba(255,255,255,.5)'); openSettingsModal(); }}
            style={{
              padding: '10px 20px', borderRadius: '8px', border: 'none',
              background: 'linear-gradient(135deg, #aa44ff, #ff44aa)',
              color: 'white', cursor: 'pointer', fontWeight: 'bold'
            }}
          >⚙️ Settings</button>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px', position: 'relative', zIndex: 1 }}>
        
        {/* Counters Tab */}
        <div style={{ display: activeTab === 'counters' ? 'block' : 'none' }}>
          <h2 className="clj-rainbowText" style={{ textAlign: 'center', margin: '0 0 10px', fontSize: '28px' }}>
            🎮 20 Interactive Counters
          </h2>
          <p style={{ textAlign: 'center', margin: '0 0 30px', opacity: 0.6 }}>
            Master Counter: {count} | Total: {counterStates.reduce((sum, cs) => sum + cs.count, 0)}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
            {counterStates.map((cs, i) => (
              <Counter key={i} count={cs.count} inc={cs.inc} dec={cs.dec} label={`Counter ${i + 1}`} color={colors[i]} />
            ))}
          </div>
        </div>

        {/* Todos Tab */}
        <div style={{ display: activeTab === 'todos' ? 'block' : 'none' }}>
          <h2 className="clj-rainbowText" style={{ textAlign: 'center', margin: '0 0 30px', fontSize: '28px' }}>
            📝 Todo List ({todos.length} items)
          </h2>
          <div className="clj-card clj-glass" style={{ maxWidth: '600px', margin: '0 auto', padding: '30px' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input value={newTodo} oninput={(e) => setNewTodo(e.target.value)} onkeydown={(e) => e.key === 'Enter' && addTodo()}
                placeholder="✨ Add a new task..."
                style={{ flex: 1, padding: '15px 20px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: '16px' }} />
              <button className="clj-btn action-btn"
                onclick={(e) => { handleRipple(e, 'rgba(40,167,69,.4)'); addTodo(); }}
                style={{ padding: '15px 30px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #28a745, #1e7e34)', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
                ➕ Add
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {todos.length === 0 && <p style={{ textAlign: 'center', opacity: 0.5 }}>No tasks yet. Add one! 🎉</p>}
              {todos.map(t => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <input type="checkbox" checked={t.done} onchange={() => toggleTodo(t.id)} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                  <span style={{ flex: 1, fontSize: '16px', textDecoration: t.done ? 'line-through' : 'none', opacity: t.done ? 0.5 : 1 }}>{t.text}</span>
                  <button className="clj-btn danger-btn" onclick={(e) => { handleRipple(e, 'rgba(220,53,69,.4)'); deleteTodo(t.id); }}
                    style={{ padding: '8px 12px', borderRadius: '6px', border: 'none', background: 'rgba(220,53,69,0.3)', color: '#dc3545', cursor: 'pointer', fontSize: '16px' }}>🗑️</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Users Tab */}
        <div style={{ display: activeTab === 'users' ? 'block' : 'none' }}>
          <h2 className="clj-rainbowText" style={{ textAlign: 'center', margin: '0 0 30px', fontSize: '28px' }}>👤 User Explorer</h2>
          <div className="clj-card clj-glass" style={{ maxWidth: '500px', margin: '0 auto', padding: '30px', textAlign: 'center' }}>
            {loading ? (
              <div>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid #00aaff', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
                <p style={{ opacity: 0.7 }}>Loading user...</p>
              </div>
            ) : user ? (
              <div>
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, #00aaff, #aa44ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '40px' }}>{user.name.charAt(0)}</div>
                <h2 style={{ margin: '10px 0' }}>{user.name}</h2>
                <p style={{ opacity: 0.7, margin: '5px 0' }}>📧 {user.email}</p>
                <p style={{ opacity: 0.7, margin: '5px 0' }}>📞 {user.phone}</p>
                <p style={{ opacity: 0.7, margin: '5px 0' }}>🌐 {user.website}</p>
                <p style={{ opacity: 0.5, margin: '15px 0 0', fontSize: '14px' }}>{user.company?.name} - {user.company?.catchPhrase}</p>
              </div>
            ) : <p style={{ opacity: 0.5 }}>No user data</p>}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
              <button className="clj-btn" onclick={(e) => { handleRipple(e); setUserId(Math.max(1, userId - 1)); }}
                style={{ padding: '12px 30px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #6c757d, #495057)', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>◀ Prev</button>
              <span style={{ padding: '12px 20px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', fontSize: '16px', fontWeight: 'bold' }}>#{userId}</span>
              <button className="clj-btn" onclick={(e) => { handleRipple(e, 'rgba(0,123,255,.4)'); setUserId(userId + 1); }}
                style={{ padding: '12px 30px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #007bff, #0056b3)', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>Next ▶</button>
            </div>
          </div>
        </div>

        {/* Components Tab - Showcasing all 10 new UI components */}
        <div style={{ display: activeTab === 'components' ? 'block' : 'none' }}>
          <h2 className="clj-rainbowText" style={{ textAlign: 'center', margin: '0 0 30px', fontSize: '28px' }}>
            🧩 CLJ UI Component Library
          </h2>
          <p style={{ textAlign: 'center', margin: '0 0 30px', opacity: 0.6 }}>
            All 10 components included: Modal, Slider, Tabs, Tooltip, Toast, Accordion, Carousel, ProgressBar, Switch, Rating
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '25px' }}>
            
            {/* Slider */}
            <div className="clj-card clj-frosted" style={{ padding: '25px' }}>
              <h3 style={{ margin: '0 0 15px' }}>🎚️ Slider</h3>
              <p style={{ opacity: 0.7, margin: '0 0 10px' }}>Value: {sliderValue}</p>
              <div ref={sliderContainerRef}></div>
            </div>

            {/* Switch */}
            <div className="clj-card clj-frosted" style={{ padding: '25px' }}>
              <h3 style={{ margin: '0 0 15px' }}>🔘 Switch Toggle</h3>
              <p style={{ opacity: 0.7, margin: '0 0 10px' }}>Status: {switchEnabled ? '🟢 Enabled' : '🔴 Disabled'}</p>
              <div ref={switchContainerRef}></div>
            </div>

            {/* Rating */}
            <div className="clj-card clj-frosted" style={{ padding: '25px' }}>
              <h3 style={{ margin: '0 0 15px' }}>⭐ Star Rating</h3>
              <p style={{ opacity: 0.7, margin: '0 0 10px' }}>Your rating: {ratingValue}/5</p>
              <div ref={ratingContainerRef}></div>
            </div>

            {/* Progress Bar */}
            <div className="clj-card clj-frosted" style={{ padding: '25px' }}>
              <h3 style={{ margin: '0 0 15px' }}>📊 Progress Bar</h3>
              <p style={{ opacity: 0.7, margin: '0 0 10px' }}>Progress: {progressValue}%</p>
              <div ref={progressContainerRef}></div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button className="clj-btn" onclick={() => { setProgressValue(Math.max(0, progressValue - 10)); }}
                  style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#dc3545', color: 'white', cursor: 'pointer' }}>-10</button>
                <button className="clj-btn" onclick={() => { setProgressValue(Math.min(100, progressValue + 10)); }}
                  style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#28a745', color: 'white', cursor: 'pointer' }}>+10</button>
              </div>
            </div>

            {/* Accordion */}
            <div className="clj-card clj-frosted" style={{ padding: '25px' }}>
              <h3 style={{ margin: '0 0 15px' }}>📋 Accordion</h3>
              <div ref={accordionContainerRef}></div>
            </div>

            {/* Carousel */}
            <div className="clj-card clj-frosted" style={{ padding: '25px' }}>
              <h3 style={{ margin: '0 0 15px' }}>🎠 Image Carousel</h3>
              <div ref={carouselContainerRef} style={{ height: '220px', borderRadius: '12px', overflow: 'hidden' }}></div>
            </div>
          </div>

          {/* Toast Demo */}
          <div className="clj-card clj-frosted" style={{ padding: '25px', marginTop: '25px', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 15px' }}>🔔 Toast Notifications</h3>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="clj-btn clj-neonGlow" onclick={() => { if (typeof CLJ !== 'undefined') CLJ.Toast.show('✅ Success! Action completed.', 3000); }}
                style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: '#28a745', color: 'white', cursor: 'pointer' }}>✅ Success Toast</button>
              <button className="clj-btn clj-neonGlow" onclick={() => { if (typeof CLJ !== 'undefined') CLJ.Toast.show('❌ Error! Something went wrong.', 4000); }}
                style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: '#dc3545', color: 'white', cursor: 'pointer' }}>❌ Error Toast</button>
              <button className="clj-btn clj-neonGlow" onclick={() => { if (typeof CLJ !== 'undefined') CLJ.Toast.show('ℹ️ Here is some information for you.', 2500); }}
                style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: '#007bff', color: 'white', cursor: 'pointer' }}>ℹ️ Info Toast</button>
              <button className="clj-btn clj-neonGlow" onclick={() => { if (typeof CLJ !== 'undefined') CLJ.Toast.show('⚠️ Warning! Check your settings.', 3500); }}
                style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: '#ffc107', color: '#333', cursor: 'pointer' }}>⚠️ Warning Toast</button>
            </div>
          </div>

          {/* Modal Demo */}
          <div className="clj-card clj-frosted" style={{ padding: '25px', marginTop: '25px', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 15px' }}>🪟 Modal Dialog</h3>
            <button className="clj-btn clj-pulseGlow" onclick={() => {
              if (typeof CLJ !== 'undefined') {
                new CLJ.Modal({
                  title: '🚀 Welcome to CLJ POWER Mode!',
                  content: '<div style="color:#ddd;"><p>This modal is rendered by the <strong>CLJ.Modal</strong> component.</p><p>• Zero dependencies</p><p>• Backdrop blur</p><p>• Click-outside-to-close</p><p>• Smooth animations</p><hr style="border-color:#333;margin:15px 0;"><p style="font-size:12px;opacity:0.6;">Built entirely in power.js</p></div>',
                  onOpen: () => console.log('Modal opened!'),
                  onClose: () => console.log('Modal closed!')
                }).open();
              }
            }} style={{ padding: '15px 30px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #aa44ff, #ff44aa)', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
              🪟 Open Modal
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="clj-glass" style={{
        textAlign: 'center', padding: '30px', borderTop: '1px solid rgba(255,255,255,0.1)',
        marginTop: '40px', position: 'relative', zIndex: 1
      }}>
        <p style={{ margin: 0, opacity: 0.7 }}>
          ⚡ CLJ Power Engine v2.0 • 80 Animations • 10 UI Components • No React • No Dependencies
        </p>
        <p style={{ margin: '5px 0 0', opacity: 0.5, fontSize: '14px' }}>
          Device: {window.__CLJ_device?.isMobile ? '📱 Mobile' : window.__CLJ_device?.isTablet ? '📋 Tablet' : '🖥️ Desktop'} • 
          {window.__CLJ_device?.width}x{window.__CLJ_device?.height} •
          Animations: particleNebula + starfield • Switch: {switchEnabled ? 'ON' : 'OFF'} • Rating: {ratingValue}/5
        </p>
        <p style={{ margin: '5px 0 0', opacity: 0.4, fontSize: '12px' }}>
          Components active: Modal, Slider, Tabs, Tooltip, Toast, Accordion, Carousel, ProgressBar, Switch, Rating
        </p>
      </footer>

      {/* Inline styles */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
}

// Mount the app
__CLJ_mount(App, 'root');