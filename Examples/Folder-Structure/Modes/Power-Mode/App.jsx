// CLJ Power App - No React Required - Beautiful 4D/3D Scene

// @clj-animate quantumDimension4D
// @clj-animate hypercube4D
// @clj-animate rotatingCube3D

console.log('🔍 DEBUG: App.jsx loading - Beautiful 4D Scene Mode');

function App() {
  console.log('🔍 DEBUG: App function called');
  
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
  const [rippleColor, setRippleColor] = __CLJ_useState('rgba(100,100,255,.6)');
  const [cardHoverEnabled, setCardHoverEnabled] = __CLJ_useState(true);
  const [sliderValue, setSliderValue] = __CLJ_useState(50);
  const [switchEnabled, setSwitchEnabled] = __CLJ_useState(true);
  const [ratingValue, setRatingValue] = __CLJ_useState(4);
  const [progressValue, setProgressValue] = __CLJ_useState(65);
  const [chartData, setChartData] = __CLJ_useState([30, 50, 80, 45, 70, 25, 90]);
  
  const sliderContainerRef = __CLJ_useRef(null);
  const switchContainerRef = __CLJ_useRef(null);
  const ratingContainerRef = __CLJ_useRef(null);
  const progressContainerRef = __CLJ_useRef(null);
  const accordionContainerRef = __CLJ_useRef(null);
  const carouselContainerRef = __CLJ_useRef(null);
  const tooltipTargetRef = __CLJ_useRef(null);
  const chartContainerRef = __CLJ_useRef(null);
  const datePickerContainerRef = __CLJ_useRef(null);
  const colorPickerContainerRef = __CLJ_useRef(null);
  const codeEditorContainerRef = __CLJ_useRef(null);
  const virtualListContainerRef = __CLJ_useRef(null);
  const audioContainerRef = __CLJ_useRef(null);
  const videoContainerRef = __CLJ_useRef(null);
  const formContainerRef = __CLJ_useRef(null);
  const sceneContainerRef = __CLJ_useRef(null);

  const counterStates = Array(20).fill().map(() => {
    const [c, setC] = __CLJ_useState(0);
    return { count: c, inc: () => { console.log('🔍 DEBUG: Counter inc called'); setC(c => c + 1); }, dec: () => { console.log('🔍 DEBUG: Counter dec called'); setC(c => Math.max(0, c - 1)); } };
  });

 __CLJ_useEffect(() => {
    console.log('🔍 DEBUG: useEffect mounted - Building Beautiful 4D/3D Scene');
    
    // Create stunning gradient background overlay for better readability
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;background:radial-gradient(ellipse at center, rgba(10,10,30,0.3) 0%, rgba(0,0,0,0.6) 100%);';
    document.body.prepend(overlay);
    
    setTimeout(() => setShowVideo(true), 1000);
    
    // ===== CHECK THREE.JS AVAILABILITY =====
    console.log('🔍 DEBUG: Checking Three.js availability...');
    if (typeof THREE !== 'undefined') {
      console.log('🔍 DEBUG: ✅ Three.js IS loaded globally! Version:', THREE.REVISION);
    } else {
      console.error('🔍 DEBUG: ❌ Three.js is NOT loaded! Check CDN script tag in HTML');
    }
    
    // ===== APPLY FLOATING ANIMATION STYLES =====
    const animStyle = document.createElement('style');
    animStyle.textContent = `
      @keyframes floatIn {
        0% { opacity: 0; transform: translateY(30px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      @keyframes glowPulse {
        0%, 100% { box-shadow: 0 0 5px rgba(100,150,255,0.3); }
        50% { box-shadow: 0 0 20px rgba(100,150,255,0.6); }
      }
      .clj-card, .clj-glass, .clj-frosted {
        animation: floatIn 0.5s ease-out forwards;
        backdrop-filter: blur(12px);
      }
      .clj-btn {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .clj-btn:hover {
        transform: translateY(-2px) scale(1.02);
        filter: brightness(1.15);
      }
      .tab-btn.active {
        background: linear-gradient(135deg, #667eea, #764ba2) !important;
      }
    `;
    document.head.appendChild(animStyle);
    
    if (typeof CLJ !== 'undefined') {
      console.log('🔍 DEBUG: CLJ object found, initializing UI components');
      if (sliderContainerRef.current) new CLJ.Slider(sliderContainerRef.current, { min: 0, max: 100, value: sliderValue, step: 1, onChange: (val) => { console.log('🔍 DEBUG: Slider changed:', val); setSliderValue(val); } });
      if (switchContainerRef.current) new CLJ.Switch(switchContainerRef.current, { checked: switchEnabled, onChange: (val) => { console.log('🔍 DEBUG: Switch changed:', val); setSwitchEnabled(val); } });
      if (ratingContainerRef.current) new CLJ.Rating(ratingContainerRef.current, { max: 5, value: ratingValue, onChange: (val) => { console.log('🔍 DEBUG: Rating changed:', val); setRatingValue(val); } });
      if (progressContainerRef.current) { const pb = new CLJ.ProgressBar(progressContainerRef.current, { value: progressValue, max: 100, color: '#667eea' }); setTimeout(() => pb.setValue(progressValue), 500); }
      if (accordionContainerRef.current) new CLJ.Accordion(accordionContainerRef.current, [
        { title: '🌌 4D Quantum Dimension', content: '<p style="color:#ddd;">Experience the 4th dimension with quantum particle fields and rotating hypercube effects. The background combines 2D particles with 3D WebGL for a true dimensional experience.</p>', open: true },
        { title: '🎮 20 Interactive Counters', content: '<p style="color:#ddd;">Each counter has ripple effects and smooth animations. Click + to increase, - to decrease.</p>', open: false },
        { title: '📝 Todo List', content: '<p style="color:#ddd;">Full CRUD operations with CLJ.Toast notifications.</p>', open: false },
        { title: '👤 User Explorer', content: '<p style="color:#ddd;">Fetch and display user data with CLJ.fetch caching.</p>', open: false },
        { title: '✨ 4D/3D Visual Effects', content: '<p style="color:#ddd;">Quantum dimension 4D animation running as background with rotating hypercube and particle fields.</p>', open: false }
      ]);
      if (carouselContainerRef.current) new CLJ.Carousel(carouselContainerRef.current, [
        'https://picsum.photos/800/400?random=1',
        'https://picsum.photos/800/400?random=2',
        'https://picsum.photos/800/400?random=3',
        'https://picsum.photos/800/400?random=4',
        'https://picsum.photos/800/400?random=5'
      ], { interval: 4000, auto: true });
      if (tooltipTargetRef.current) new CLJ.Tooltip(tooltipTargetRef.current, '⚡ 4D Quantum Power! ✨', { position: 'top' });
      if (chartContainerRef.current) new CLJ.Chart(chartContainerRef.current, { type: 'line', data: chartData, labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], colors: ['#667eea'] });
      if (datePickerContainerRef.current) new CLJ.DatePicker(datePickerContainerRef.current, { value: new Date() });
      if (colorPickerContainerRef.current) new CLJ.ColorPicker(colorPickerContainerRef.current, { value: rippleColor, onChange: (color) => setRippleColor(color) });
      if (codeEditorContainerRef.current) new CLJ.CodeEditor(codeEditorContainerRef.current, { value: '// CLJ Power 4D Scene\nconsole.log("Welcome to the 4th Dimension!");\n\n// Quantum effects are running in the background\n// Hypercube and particle fields create dimensional depth', height: '150px' });
      if (virtualListContainerRef.current) new CLJ.VirtualList(virtualListContainerRef.current, { items: Array(1000).fill().map((_, i) => `✨ 4D Item #${i+1}`), itemHeight: 40, renderItem: (item) => `<div style="padding:10px;border-bottom:1px solid rgba(102,126,234,0.2);">🌌 ${item}</div>` });
      if (audioContainerRef.current) { const audio = new CLJ.Audio({ visualization: true }); if (audio.getCanvas()) audioContainerRef.current.appendChild(audio.getCanvas()); }
      if (videoContainerRef.current) new CLJ.VideoPlayer(videoContainerRef.current, { src: 'https://www.w3schools.com/html/mov_bbb.mp4', controls: true });
      if (formContainerRef.current) new CLJ.Form(formContainerRef.current, { fields: { name: { required: true, minLength: 2 }, email: { required: true, pattern: '^[\\w.-]+@[\\w.-]+\\.\\w+$' }, message: { required: true, minLength: 10 } }, onSubmit: (data) => { CLJ.Toast.show('✅ Form submitted!', 3000); console.log('🔍 DEBUG: Form submitted:', data); } });
    } else {
      console.log('🔍 DEBUG: CLJ object NOT found - components not initialized');
    }
    
    console.log('🔍 DEBUG: Beautiful 4D/3D Scene initialized');
  }, []);


  const addTodo = () => {
    console.log('🔍 DEBUG: addTodo called, newTodo:', newTodo);
    if (newTodo.trim()) {
      setTodos([...todos, { id: Date.now(), text: newTodo, done: false }]);
      setNewTodo('');
      if (typeof CLJ !== 'undefined') CLJ.Toast.show('✅ Task added!', 2500);
    }
  };

  const toggleTodo = (id) => { console.log('🔍 DEBUG: toggleTodo called, id:', id); setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t)); };
  
  const deleteTodo = (id) => {
    console.log('🔍 DEBUG: deleteTodo called, id:', id);
    setTodos(todos.filter(t => t.id !== id));
    if (typeof CLJ !== 'undefined') CLJ.Toast.show('🗑️ Task deleted', 2000);
  };

  const fetchUser = async (id) => {
    console.log('🔍 DEBUG: fetchUser called, id:', id);
    setLoading(true);
    try {
      const u = await (typeof CLJ !== 'undefined' && CLJ.fetch ? CLJ.fetch.get(`https://jsonplaceholder.typicode.com/users/${id}`, { cacheTTL: 30000, responseType: 'json' }) : fetch(`https://jsonplaceholder.typicode.com/users/${id}`).then(r => r.json()));
      setUser(u);
      if (typeof CLJ !== 'undefined') CLJ.Toast.show('👤 ' + u.name, 2500);
    } catch(e) {
      console.log('🔍 DEBUG: fetchUser error:', e.message);
      if (typeof CLJ !== 'undefined') CLJ.Toast.show('❌ Failed to load', 3000);
    }
    setLoading(false);
  };

  __CLJ_useEffect(() => { fetchUser(userId); }, [userId]);

  const handleRipple = (e, color) => {
    console.log('🔍 DEBUG: handleRipple called');
    if (typeof __CLJ_interact !== 'undefined') __CLJ_interact.rippleEffect(e, color || rippleColor);
  };

  const createButton = (text, className, onClick, styleOverrides = {}) => {
    console.log('🔍 DEBUG: createButton called for:', text);
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.className = className || 'clj-btn';
    Object.assign(btn.style, {
      padding: '10px 20px', borderRadius: '8px', border: 'none',
      color: 'white', cursor: 'pointer', fontWeight: 'bold',
      ...styleOverrides
    });
    btn.onclick = function(e) {
      console.log('🔍 DEBUG: Button clicked:', text);
      onClick(e);
    };
    return btn;
  };

  const openSettingsModal = () => {
    console.log('🔍 DEBUG: openSettingsModal called');
    if (typeof CLJ !== 'undefined') {
      new CLJ.Modal({
        title: '🌌 4D Quantum Settings',
        content: `<div style="color:#ddd;">
          <p><strong>✨ Quantum Dimension:</strong> Active</p>
          <p><strong>🌀 Hypercube:</strong> Rotating</p>
          <p><strong>💫 Particle Field:</strong> Flowing</p>
          <p><strong>Animation Intensity:</strong> ${animIntensity}x</p>
          <p><strong>Ripple Color:</strong> ${rippleColor}</p>
          <p><strong>Switch:</strong> ${switchEnabled ? 'ON' : 'OFF'}</p>
          <p><strong>Rating:</strong> ${'★'.repeat(ratingValue)}${'☆'.repeat(5-ratingValue)}</p>
          <p><strong>Progress:</strong> ${progressValue}%</p>
          <hr style="border-color:#667eea;margin:15px 0;">
          <p style="font-size:12px;opacity:0.7;">⚡ 4D Quantum Power Engine • Hyperdimensional UI</p>
        </div>`
      }).open();
    }
  };

  const Counter = ({ count, inc, dec, label, color }) => {
    const card = document.createElement('div');
    card.className = 'clj-card';
    card.style.cssText = `background:linear-gradient(135deg, ${color || 'rgba(102,126,234,0.15)'}, rgba(118,75,162,0.1));backdrop-filter:blur(12px);border-radius:20px;padding:20px;margin:10px;border:1px solid rgba(102,126,234,0.3);text-align:center;transition:all 0.3s ease;`;
    
    const title = document.createElement('h2');
    title.style.cssText = 'font-size:24px;margin:0 0 10px;background:linear-gradient(135deg,#aaffff,#aa88ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;';
    title.textContent = `${label}: ${count}`;
    
    const btnContainer = document.createElement('div');
    btnContainer.style.cssText = 'display:flex;gap:10px;justify-content:center;';
    
    const decBtn = document.createElement('button');
    decBtn.textContent = '−';
    decBtn.className = 'clj-btn';
    decBtn.style.cssText = 'padding:12px 24px;border-radius:12px;border:none;background:linear-gradient(135deg,#f43f5e,#e11d48);color:white;cursor:pointer;font-weight:bold;font-size:20px;';
    decBtn.onclick = function(e) { console.log('🔍 DEBUG: Counter dec clicked:', label); handleRipple(e, 'rgba(244,63,94,.4)'); dec(); };
    
    const incBtn = document.createElement('button');
    incBtn.textContent = '+';
    incBtn.className = 'clj-btn';
    incBtn.style.cssText = 'padding:12px 24px;border-radius:12px;border:none;background:linear-gradient(135deg,#10b981,#059669);color:white;cursor:pointer;font-weight:bold;font-size:20px;';
    incBtn.onclick = function(e) { console.log('🔍 DEBUG: Counter inc clicked:', label); handleRipple(e, 'rgba(16,185,129,.4)'); inc(); };
    
    btnContainer.appendChild(decBtn);
    btnContainer.appendChild(incBtn);
    card.appendChild(title);
    card.appendChild(btnContainer);
    return card;
  };

  const colors = ['#667eea', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16', '#ef4444', '#3b82f6', '#d946ef', '#14b8a6', '#f97316', '#6366f1', '#a855f7', '#22c55e', '#eab308', '#0284c7', '#db2777', '#4ade80'];

  const buildTabButtons = () => {
    console.log('🔍 DEBUG: buildTabButtons called, activeTab:', activeTab);
    const container = document.createElement('div');
    container.style.cssText = 'display:flex;gap:12px;flex-wrap:wrap;align-items:center;';
    
    const tabs = [
      { text: '🎮 Quantum Counters', tab: 'counters' },
      { text: '📝 4D Tasks', tab: 'todos' },
      { text: '👤 Dimensional Users', tab: 'users' },
      { text: '🧩 Hyper Components', tab: 'components' },
      { text: '📊 Quantum Charts', tab: 'charts' }
    ];
    
    tabs.forEach(t => {
      const btn = document.createElement('button');
      btn.textContent = t.text;
      btn.className = 'clj-btn tab-btn';
      const isActive = activeTab === t.tab;
      btn.style.cssText = `padding:10px 20px;border-radius:12px;border:none;background:${isActive ? 'linear-gradient(135deg,#667eea,#764ba2)' : 'rgba(255,255,255,0.08)'};color:white;cursor:pointer;transition:all 0.3s;backdrop-filter:blur(8px);`;
      if (isActive) btn.classList.add('active');
      btn.onclick = function(e) {
        console.log('🔍 DEBUG: Tab clicked:', t.tab);
        handleRipple(e);
        setActiveTab(t.tab);
      };
      container.appendChild(btn);
    });
    
    const tooltipSpan = document.createElement('span');
    tooltipSpan.textContent = '💫';
    tooltipSpan.style.cssText = 'cursor:help;font-size:22px;filter:drop-shadow(0 0 5px #667eea);';
    tooltipSpan.setAttribute('data-ref', 'tooltip');
    container.appendChild(tooltipSpan);
    
    const settingsBtn = document.createElement('button');
    settingsBtn.textContent = '⚡ 4D Settings';
    settingsBtn.className = 'clj-btn';
    settingsBtn.style.cssText = 'padding:10px 20px;border-radius:12px;border:none;background:linear-gradient(135deg,#aa44ff,#ff44aa);color:white;cursor:pointer;font-weight:bold;box-shadow:0 0 15px rgba(170,68,255,0.3);';
    settingsBtn.onclick = function(e) {
      console.log('🔍 DEBUG: Settings button clicked');
      handleRipple(e, 'rgba(255,255,255,.5)');
      openSettingsModal();
    };
    container.appendChild(settingsBtn);
    
    return container;
  };

  console.log('🔍 DEBUG: App rendering...');

  const mainDiv = document.createElement('div');
  mainDiv.style.cssText = 'min-height:100vh;color:#fff;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;overflow-x:hidden;position:relative;z-index:1;';

  const header = document.createElement('header');
  header.className = 'clj-gradientShift';
  header.style.cssText = 'padding:20px 40px;background:rgba(10,10,30,0.7);backdrop-filter:blur(20px);display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(102,126,234,0.3);position:sticky;top:0;z-index:100;';
  
  const headerLeft = document.createElement('div');
  const h1 = document.createElement('h1');
  h1.style.cssText = 'font-size:32px;margin:0;background:linear-gradient(135deg,#667eea,#764ba2,#ff44aa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;';
  h1.textContent = '🌌 4D Quantum Power v5.0';
  const subtitle = document.createElement('p');
  subtitle.style.cssText = 'margin:5px 0 0;opacity:0.7;font-size:14px;';
  subtitle.innerHTML = '⚡ Hyperdimensional UI • Quantum Particles • Rotating Hypercube • 4th Dimension Reality';
  headerLeft.appendChild(h1);
  headerLeft.appendChild(subtitle);
  
  const headerRight = buildTabButtons();
  
  header.appendChild(headerLeft);
  header.appendChild(headerRight);
  mainDiv.appendChild(header);

  const content = document.createElement('div');
  content.style.cssText = 'max-width:1400px;margin:0 auto;padding:40px 20px;position:relative;z-index:2;';
  
  // Counters section
  const countersSection = document.createElement('div');
  countersSection.style.display = activeTab === 'counters' ? 'block' : 'none';
  
  const countersTitle = document.createElement('h2');
  countersTitle.style.cssText = 'text-align:center;font-size:32px;margin-bottom:10px;background:linear-gradient(135deg,#667eea,#ff44aa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;';
  countersTitle.textContent = '🎮 20 Quantum Counters';
  
  const countersSubtitle = document.createElement('p');
  countersSubtitle.style.cssText = 'text-align:center;opacity:0.6;margin-bottom:30px;';
  countersSubtitle.textContent = `Total Quantum State: ${counterStates.reduce((s,c) => s + c.count, 0)}`;
  
  const countersGrid = document.createElement('div');
  countersGrid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;';
  
  counterStates.forEach((cs, i) => {
    countersGrid.appendChild(Counter({ count: cs.count, inc: cs.inc, dec: cs.dec, label: `Quantum ${i+1}`, color: colors[i] }));
  });
  
  countersSection.appendChild(countersTitle);
  countersSection.appendChild(countersSubtitle);
  countersSection.appendChild(countersGrid);
  content.appendChild(countersSection);

  // Todos section
  const todosSection = document.createElement('div');
  todosSection.style.display = activeTab === 'todos' ? 'block' : 'none';
  
  const todosTitle = document.createElement('h2');
  todosTitle.style.cssText = 'text-align:center;font-size:32px;margin-bottom:30px;background:linear-gradient(135deg,#667eea,#ff44aa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;';
  todosTitle.textContent = `📝 Dimensional Tasks (${todos.length})`;
  todosSection.appendChild(todosTitle);
  
  const todosCard = document.createElement('div');
  todosCard.className = 'clj-card';
  todosCard.style.cssText = 'max-width:600px;margin:0 auto;padding:30px;background:rgba(255,255,255,0.05);backdrop-filter:blur(12px);border-radius:24px;border:1px solid rgba(102,126,234,0.3);';
  
  const todosInputRow = document.createElement('div');
  todosInputRow.style.cssText = 'display:flex;gap:10px;margin-bottom:20px;';
  
  const todoInput = document.createElement('input');
  todoInput.value = newTodo;
  todoInput.placeholder = '✨ Add a quantum task...';
  todoInput.style.cssText = 'flex:1;padding:15px 20px;border-radius:12px;border:1px solid rgba(102,126,234,0.3);background:rgba(0,0,0,0.3);color:#fff;font-size:16px;';
  todoInput.oninput = (e) => setNewTodo(e.target.value);
  todoInput.onkeydown = (e) => { if (e.key === 'Enter') addTodo(); };
  
  const addBtn = document.createElement('button');
  addBtn.textContent = '➕ Add Task';
  addBtn.className = 'clj-btn';
  addBtn.style.cssText = 'padding:15px 30px;border-radius:12px;border:none;background:linear-gradient(135deg,#10b981,#059669);color:white;cursor:pointer;font-weight:bold;font-size:16px;';
  addBtn.onclick = function(e) { console.log('🔍 DEBUG: Add todo clicked'); handleRipple(e, 'rgba(16,185,129,.4)'); addTodo(); };
  
  todosInputRow.appendChild(todoInput);
  todosInputRow.appendChild(addBtn);
  todosCard.appendChild(todosInputRow);
  
  if (todos.length === 0) {
    const emptyMsg = document.createElement('p');
    emptyMsg.style.cssText = 'text-align:center;opacity:0.5;padding:40px;';
    emptyMsg.textContent = '✨ No quantum tasks yet. Add one above! ✨';
    todosCard.appendChild(emptyMsg);
  }
  
  todos.forEach(t => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:10px;padding:12px 15px;background:rgba(102,126,234,0.1);border-radius:12px;margin-bottom:8px;';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = t.done;
    checkbox.style.cssText = 'width:20px;height:20px;cursor:pointer;accent-color:#667eea;';
    checkbox.onchange = () => toggleTodo(t.id);
    
    const span = document.createElement('span');
    span.style.cssText = `flex:1;font-size:16px;text-decoration:${t.done?'line-through':'none'};opacity:${t.done?0.5:1};`;
    span.textContent = t.text;
    
    const delBtn = document.createElement('button');
    delBtn.textContent = '🗑️';
    delBtn.className = 'clj-btn';
    delBtn.style.cssText = 'padding:8px 12px;border-radius:8px;border:none;background:rgba(244,63,94,0.2);color:#f43f5e;cursor:pointer;font-size:16px;';
    delBtn.onclick = function(e) { console.log('🔍 DEBUG: Delete todo clicked:', t.id); handleRipple(e, 'rgba(244,63,94,.4)'); deleteTodo(t.id); };
    
    row.appendChild(checkbox);
    row.appendChild(span);
    row.appendChild(delBtn);
    todosCard.appendChild(row);
  });
  
  todosSection.appendChild(todosCard);
  content.appendChild(todosSection);

  // Users section
  const usersSection = document.createElement('div');
  usersSection.style.display = activeTab === 'users' ? 'block' : 'none';
  
  const usersTitle = document.createElement('h2');
  usersTitle.style.cssText = 'text-align:center;font-size:32px;margin-bottom:30px;background:linear-gradient(135deg,#667eea,#ff44aa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;';
  usersTitle.textContent = '👤 Dimensional Explorers';
  usersSection.appendChild(usersTitle);
  
  const usersCard = document.createElement('div');
  usersCard.className = 'clj-card';
  usersCard.style.cssText = 'max-width:500px;margin:0 auto;padding:30px;text-align:center;background:rgba(255,255,255,0.05);backdrop-filter:blur(12px);border-radius:24px;border:1px solid rgba(102,126,234,0.3);';
  
  if (loading) {
    usersCard.innerHTML = '<div style="width:50px;height:50px;border-radius:50%;border:3px solid rgba(102,126,234,0.2);border-top:3px solid #667eea;animation:spin 1s linear infinite;margin:0 auto 20px;"></div><p style="opacity:0.7;">Loading dimensional data...</p>';
  } else if (user) {
    usersCard.innerHTML = `<div style="width:100px;height:100px;border-radius:50%;background:linear-gradient(135deg,#667eea,#764ba2);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:40px;">${user.name.charAt(0)}</div><h2>${user.name}</h2><p style="opacity:0.7;">📧 ${user.email}</p><p style="opacity:0.7;">📞 ${user.phone}</p><p style="opacity:0.7;">🌐 ${user.website}</p>`;
  } else {
    usersCard.innerHTML = '<p style="opacity:0.5;">Loading dimensional being...</p>';
  }
  
  const navRow = document.createElement('div');
  navRow.style.cssText = 'display:flex;gap:10px;justify-content:center;margin-top:20px;';
  
  const prevBtn = document.createElement('button');
  prevBtn.textContent = '◀ Prev';
  prevBtn.className = 'clj-btn';
  prevBtn.style.cssText = 'padding:12px 30px;border-radius:12px;border:none;background:linear-gradient(135deg,#6c757d,#495057);color:white;cursor:pointer;font-weight:bold;font-size:16px;';
  prevBtn.onclick = function(e) { console.log('🔍 DEBUG: Prev user clicked'); handleRipple(e); setUserId(Math.max(1, userId - 1)); };
  
  const userIdSpan = document.createElement('span');
  userIdSpan.style.cssText = 'padding:12px 20px;border-radius:12px;background:rgba(102,126,234,0.2);font-weight:bold;';
  userIdSpan.textContent = `#${userId}`;
  
  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Next ▶';
  nextBtn.className = 'clj-btn';
  nextBtn.style.cssText = 'padding:12px 30px;border-radius:12px;border:none;background:linear-gradient(135deg,#667eea,#764ba2);color:white;cursor:pointer;font-weight:bold;font-size:16px;';
  nextBtn.onclick = function(e) { console.log('🔍 DEBUG: Next user clicked'); handleRipple(e, 'rgba(102,126,234,.4)'); setUserId(userId + 1); };
  
  navRow.appendChild(prevBtn);
  navRow.appendChild(userIdSpan);
  navRow.appendChild(nextBtn);
  
  usersSection.appendChild(usersCard);
  usersSection.appendChild(navRow);
  content.appendChild(usersSection);

  // Components section
  const compSection = document.createElement('div');
  compSection.style.display = activeTab === 'components' ? 'block' : 'none';
  compSection.innerHTML = `<h2 style="text-align:center;font-size:32px;margin-bottom:10px;background:linear-gradient(135deg,#667eea,#ff44aa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">🧩 22 Hyper Components</h2><p style="text-align:center;opacity:0.6;margin-bottom:30px;">⚡ 4D WebGL + Full Component Library ⚡</p>`;
  
  const compGrid = document.createElement('div');
  compGrid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(400px,1fr));gap:25px;';
  compGrid.innerHTML = `
    <div class="clj-card" style="padding:25px;background:rgba(255,255,255,0.05);backdrop-filter:blur(12px);border-radius:20px;border:1px solid rgba(102,126,234,0.3);"><h3>🎚️ Quantum Slider (${sliderValue})</h3><div id="slider-ref"></div></div>
    <div class="clj-card" style="padding:25px;background:rgba(255,255,255,0.05);backdrop-filter:blur(12px);border-radius:20px;border:1px solid rgba(102,126,234,0.3);"><h3>🔘 Dimensional Switch (${switchEnabled?'ON':'OFF'})</h3><div id="switch-ref"></div></div>
    <div class="clj-card" style="padding:25px;background:rgba(255,255,255,0.05);backdrop-filter:blur(12px);border-radius:20px;border:1px solid rgba(102,126,234,0.3);"><h3>⭐ 4D Rating (${ratingValue}/5)</h3><div id="rating-ref"></div></div>
    <div class="clj-card" style="padding:25px;background:rgba(255,255,255,0.05);backdrop-filter:blur(12px);border-radius:20px;border:1px solid rgba(102,126,234,0.3);"><h3>📊 Quantum Progress (${progressValue}%)</h3><div id="progress-ref"></div></div>
    <div class="clj-card" style="padding:25px;background:rgba(255,255,255,0.05);backdrop-filter:blur(12px);border-radius:20px;border:1px solid rgba(102,126,234,0.3);"><h3>📅 Temporal Date Picker</h3><div id="date-ref"></div></div>
    <div class="clj-card" style="padding:25px;background:rgba(255,255,255,0.05);backdrop-filter:blur(12px);border-radius:20px;border:1px solid rgba(102,126,234,0.3);"><h3>🎨 Quantum Color Picker</h3><div id="color-ref"></div></div>
    <div class="clj-card" style="padding:25px;background:rgba(255,255,255,0.05);backdrop-filter:blur(12px);border-radius:20px;border:1px solid rgba(102,126,234,0.3);"><h3>📋 Dimensional Accordion</h3><div id="accordion-ref"></div></div>
    <div class="clj-card" style="padding:25px;background:rgba(255,255,255,0.05);backdrop-filter:blur(12px);border-radius:20px;border:1px solid rgba(102,126,234,0.3);"><h3>🎠 4D Carousel</h3><div id="carousel-ref" style="height:220px;border-radius:12px;overflow:hidden;"></div></div>
    <div class="clj-card" style="padding:25px;background:rgba(255,255,255,0.05);backdrop-filter:blur(12px);border-radius:20px;border:1px solid rgba(102,126,234,0.3);"><h3>💻 Quantum Code Editor</h3><div id="code-ref"></div></div>
    <div class="clj-card" style="padding:25px;background:rgba(255,255,255,0.05);backdrop-filter:blur(12px);border-radius:20px;border:1px solid rgba(102,126,234,0.3);"><h3>📜 Hyper Virtual List (1000 items)</h3><div id="vlist-ref" style="height:200px;overflow:auto;"></div></div>
    <div class="clj-card" style="padding:25px;background:rgba(255,255,255,0.05);backdrop-filter:blur(12px);border-radius:20px;border:1px solid rgba(102,126,234,0.3);"><h3>🎵 4D Audio Visualizer</h3><div id="audio-ref"></div></div>
    <div class="clj-card" style="padding:25px;background:rgba(255,255,255,0.05);backdrop-filter:blur(12px);border-radius:20px;border:1px solid rgba(102,126,234,0.3);"><h3>🎬 Dimensional Video</h3><div id="video-ref"></div></div>
    <div class="clj-card" style="padding:25px;background:rgba(255,255,255,0.05);backdrop-filter:blur(12px);border-radius:20px;border:1px solid rgba(102,126,234,0.3);"><h3>📝 Quantum Form</h3><form id="form-ref"><input name="name" placeholder="Name" style="display:block;width:100%;margin:8px 0;padding:10px;border-radius:8px;border:1px solid rgba(102,126,234,0.3);background:rgba(0,0,0,0.3);color:#fff;"><input name="email" placeholder="Email" style="display:block;width:100%;margin:8px 0;padding:10px;border-radius:8px;border:1px solid rgba(102,126,234,0.3);background:rgba(0,0,0,0.3);color:#fff;"><textarea name="message" placeholder="Message" style="display:block;width:100%;margin:8px 0;padding:10px;border-radius:8px;border:1px solid rgba(102,126,234,0.3);background:rgba(0,0,0,0.3);color:#fff;min-height:60px;"></textarea><button type="submit" style="padding:12px 30px;border-radius:12px;border:none;background:linear-gradient(135deg,#10b981,#059669);color:white;cursor:pointer;font-weight:bold;">Submit</button></form></div>
  `;
  compSection.appendChild(compGrid);
  content.appendChild(compSection);

  // Charts section
  const chartsSection = document.createElement('div');
  chartsSection.style.display = activeTab === 'charts' ? 'block' : 'none';
  chartsSection.innerHTML = `<h2 style="text-align:center;font-size:32px;margin-bottom:30px;background:linear-gradient(135deg,#667eea,#ff44aa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">📊 Quantum Charts</h2><div class="clj-card" style="padding:25px;background:rgba(255,255,255,0.05);backdrop-filter:blur(12px);border-radius:20px;border:1px solid rgba(102,126,234,0.3);"><h3>📈 4D Data Stream</h3><div id="chart-ref"></div></div>`;
  content.appendChild(chartsSection);

  mainDiv.appendChild(content);

  const footer = document.createElement('footer');
  footer.className = 'clj-glass';
  footer.style.cssText = 'text-align:center;padding:30px;border-top:1px solid rgba(102,126,234,0.3);margin-top:40px;position:relative;z-index:1;background:rgba(10,10,30,0.7);backdrop-filter:blur(20px);';
  footer.innerHTML = `<p style="opacity:0.8;">⚡ CLJ 4D Quantum Power Engine v5.0 • Hyperdimensional UI • 4th Dimension Reality</p><p style="opacity:0.5;font-size:14px;">✨ Quantum Particles • Rotating Hypercube • Temporal Fields • No React ✨</p>`;
  mainDiv.appendChild(footer);

  console.log('🔍 DEBUG: App render complete - 4D Scene Active');
  return mainDiv;
}

console.log('🔍 DEBUG: Mounting 4D Quantum App...');
__CLJ_mount(App, 'root');