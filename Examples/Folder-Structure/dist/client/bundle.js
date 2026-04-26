// ╔══════════════════════════════════════════════════════════════╗
// ║     CLJ POWER ENGINE - ZERO DEPENDENCY UI FRAMEWORK      ║
// ╠══════════════════════════════════════════════════════════════╣
// ║  50 Background Animations   30 Transition Effects            ║
// ║  Modal | Slider | Tabs | Tooltip | Toast | Accordion         ║
// ║  Carousel | ProgressBar | Switch | Rating | CLJ_DOM          ║
// ║  DatePicker | ColorPicker | Audio | VideoPlayer              ║
// ║  Markdown | CodeEditor | Router | Form | Fetch               ║
// ║  Chart (line/bar/pie/doughnut) | DragDrop | VirtualList      ║
// ╚══════════════════════════════════════════════════════════════╝
// CLJ Runtime
(function(){var s=new Map,c=0;window.__CLJ_useState=function(v){var i=c++;if(!s.has(i))s.set(i,v);return[s.get(i),function(n){s.set(i,n);R()}]};
var e=[];window.__CLJ_useEffect=function(f){e.push({fn:f})};var r=new Map;window.__CLJ_useRef=function(v){var i=c++;if(!r.has(i))r.set(i,{current:v});return r.get(i)};
window.__CLJ_useCallback=function(f){return f};window.__CLJ_useMemo=function(f){return f()};
window.__CLJ_createElement=function(t,p,...ch){if(typeof t==='function')return t(p||{});var el=document.createElement(t);if(p)for(var[k,v]of Object.entries(p)){if(k==='className')el.className=v;else if(k==='style'&&typeof v==='object')Object.assign(el.style,v);else if(k.startsWith('on'))el.addEventListener(k.slice(2).toLowerCase(),v);else if(k==='ref'&&v&&v.current!==undefined)v.current=el;else el.setAttribute(k,v)}for(var c of ch.flat()){if(c==null||c===false)continue;if(typeof c==='string'||typeof c==='number')el.appendChild(document.createTextNode(String(c)));else if(c instanceof Node)el.appendChild(c)}return el};
window.__CLJ_mount=function(a,r){var rt=typeof r==='string'?document.getElementById(r):r;rt.innerHTML='';rt.appendChild(a());e.forEach(function(f){f.fn()})};
function R(){var rt=document.getElementById('root');if(rt&&rt.__cljApp){rt.innerHTML='';rt.appendChild(rt.__cljApp());e.forEach(function(f){f.fn()})}}
window.__CLJ_device={width:innerWidth,height:innerHeight,isMobile:innerWidth<=480,isTablet:innerWidth<=768&&innerWidth>480,isDesktop:innerWidth>768,orientation:innerWidth>innerHeight?'landscape':'portrait'};
addEventListener('resize',function(){window.__CLJ_device.width=innerWidth;window.__CLJ_device.height=innerHeight;window.__CLJ_device.isMobile=innerWidth<=480;window.__CLJ_device.isTablet=innerWidth<=768&&innerWidth>480;window.__CLJ_device.isDesktop=innerWidth>768;window.__CLJ_device.orientation=innerWidth>innerHeight?'landscape':'portrait'})})();
// CLJ Interactive System - Buttons, Hover, Click Effects
(function(){
  'use strict';
  
  window.__CLJ_interact = {
    rippleEffect(e, color) {
      const el = e.currentTarget;
      const ripple = document.createElement('span');
      const rect = el.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      ripple.style.cssText = 'position:absolute;border-radius:50%;background:'+(color||'rgba(255,255,255,.3)')+';width:'+size+'px;height:'+size+'px;left:'+x+'px;top:'+y+'px;animation:clj-ripple .6s ease-out;pointer-events:none';
      el.style.position = el.style.position || 'relative';
      el.style.overflow = 'hidden';
      el.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    },
    
    glowOnHover(el, color, intensity) {
      el.style.transition = 'box-shadow .3s ease, transform .3s ease';
      el.addEventListener('mouseenter', () => {
        el.style.boxShadow = '0 0 '+ (intensity||30) +'px ' + (color||'rgba(0,170,255,.6)');
        el.style.transform = 'translateY(-2px)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.boxShadow = 'none';
        el.style.transform = 'translateY(0)';
      });
    },
    
    pulseAnimation(el, duration, scale) {
      el.style.animation = 'clj-pulse '+(duration||2)+'s ease-in-out infinite';
    },
    
    shakeAnimation(el) {
      el.style.animation = 'clj-shake .5s ease-in-out';
      setTimeout(() => el.style.animation = '', 500);
    },
    
    floatAnimation(el, distance, duration) {
      el.style.animation = 'clj-float '+(duration||3)+'s ease-in-out infinite';
      el.style.setProperty('--float-dist', (distance||10)+'px');
    }
  };
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes clj-ripple { to { transform: scale(4); opacity: 0; } }
    @keyframes clj-pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
    @keyframes clj-shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
    @keyframes clj-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(var(--float-dist, -10px)); } }
    .clj-btn { position:relative; overflow:hidden; transition:all .3s ease; cursor:pointer; border:none; outline:none; }
    .clj-btn:hover { filter:brightness(1.1); }
    .clj-btn:active { transform:scale(.95); }
    .clj-card { transition:all .4s cubic-bezier(.4,0,.2,1); }
    .clj-card:hover { transform:translateY(-5px); box-shadow:0 20px 40px rgba(0,0,0,.3); }
  `;
  document.head.appendChild(style);
})();
// CLJ UI Components - Complete Library
(function() {
  'use strict';

  // ---------- CLJ_DOM: Chainable DOM builder ----------
  class CLJ_DOM {
    constructor(selector) {
      if (typeof selector === 'string') {
        this.el = document.querySelector(selector);
        if (!this.el) throw new Error('Element not found: ' + selector);
      } else if (selector instanceof HTMLElement) {
        this.el = selector;
      } else {
        this.el = document.createElement(selector || 'div');
      }
      return this;
    }
    html(html) { if (html) { this.el.innerHTML = html; return this; } else return this.el.innerHTML; }
    text(t) { if (t) { this.el.textContent = t; return this; } else return this.el.textContent; }
    addClass(c) { this.el.classList.add(c); return this; }
    removeClass(c) { this.el.classList.remove(c); return this; }
    toggleClass(c) { this.el.classList.toggle(c); return this; }
    hasClass(c) { return this.el.classList.contains(c); }
    attr(k, v) { if (v !== undefined) { this.el.setAttribute(k, v); return this; } else return this.el.getAttribute(k); }
    css(styles) { Object.assign(this.el.style, styles); return this; }
    on(evt, fn) { this.el.addEventListener(evt, fn); return this; }
    off(evt, fn) { this.el.removeEventListener(evt, fn); return this; }
    append(child) { if (child instanceof CLJ_DOM) this.el.appendChild(child.el); else this.el.appendChild(child); return this; }
    remove() { this.el.remove(); return this; }
    parent() { return new CLJ_DOM(this.el.parentNode); }
    find(s) { return new CLJ_DOM(this.el.querySelector(s)); }
    findAll(s) { return Array.from(this.el.querySelectorAll(s)).map(e => new CLJ_DOM(e)); }
    val(v) { if (v !== undefined) { this.el.value = v; return this; } else return this.el.value; }
    show() { this.el.style.display = ''; return this; }
    hide() { this.el.style.display = 'none'; return this; }
  }
  window.CLJ = window.CLJ || {};
  window.CLJ.DOM = function(sel) { return new CLJ_DOM(sel); };
  window.CLJ.create = function(tag) { return new CLJ_DOM(tag); };

  // ---------- Modal ----------
  class CLJModal {
    constructor(options = {}) {
      this.id = options.id || 'clj-modal-' + Date.now();
      this.title = options.title || 'Modal';
      this.content = options.content || '';
      this.onClose = options.onClose || null;
      this.onOpen = options.onOpen || null;
      this.backdropClose = options.backdropClose !== false;
      this.overlay = null;
      this.modalEl = null;
      this.create();
    }
    create() {
      this.overlay = document.createElement('div');
      this.overlay.className = 'clj-modal-overlay';
      this.overlay.style.position = 'fixed';
      this.overlay.style.top = '0'; this.overlay.style.left = '0';
      this.overlay.style.width = '100%'; this.overlay.style.height = '100%';
      this.overlay.style.backgroundColor = 'rgba(0,0,0,0.6)';
      this.overlay.style.backdropFilter = 'blur(5px)';
      this.overlay.style.zIndex = '10000';
      this.overlay.style.display = 'flex';
      this.overlay.style.alignItems = 'center';
      this.overlay.style.justifyContent = 'center';
      
      this.modalEl = document.createElement('div');
      this.modalEl.className = 'clj-modal';
      this.modalEl.style.backgroundColor = '#1a1a2e';
      this.modalEl.style.borderRadius = '16px';
      this.modalEl.style.padding = '20px';
      this.modalEl.style.minWidth = '300px';
      this.modalEl.style.maxWidth = '90%';
      this.modalEl.style.maxHeight = '90%';
      this.modalEl.style.overflow = 'auto';
      this.modalEl.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
      this.modalEl.style.animation = 'clj-fadeIn 0.2s ease-out';
      
      const header = document.createElement('div');
      header.style.display = 'flex';
      header.style.justifyContent = 'space-between';
      header.style.alignItems = 'center';
      header.style.marginBottom = '15px';
      header.style.borderBottom = '1px solid #333';
      header.style.paddingBottom = '10px';
      
      const titleSpan = document.createElement('h3');
      titleSpan.textContent = this.title;
      titleSpan.style.margin = '0';
      titleSpan.style.color = '#fff';
      
      const closeBtn = document.createElement('button');
      closeBtn.textContent = '✕';
      closeBtn.style.background = 'none';
      closeBtn.style.border = 'none';
      closeBtn.style.fontSize = '24px';
      closeBtn.style.cursor = 'pointer';
      closeBtn.style.color = '#fff';
      closeBtn.onclick = () => this.close();
      
      header.appendChild(titleSpan);
      header.appendChild(closeBtn);
      
      const body = document.createElement('div');
      body.innerHTML = this.content;
      body.style.color = '#ddd';
      
      this.modalEl.appendChild(header);
      this.modalEl.appendChild(body);
      this.overlay.appendChild(this.modalEl);
      if (this.backdropClose) {
        this.overlay.addEventListener('click', (e) => {
          if (e.target === this.overlay) this.close();
        });
      }
      document.body.appendChild(this.overlay);
    }
    open() {
      if (this.overlay) this.overlay.style.display = 'flex';
      if (this.onOpen) this.onOpen(this);
    }
    close() {
      if (this.overlay) this.overlay.style.display = 'none';
      if (this.onClose) this.onClose(this);
    }
    destroy() {
      if (this.overlay) this.overlay.remove();
    }
    setContent(html) {
      if (this.modalEl && this.modalEl.children[1]) {
        this.modalEl.children[1].innerHTML = html;
      }
    }
  }
  window.CLJ.Modal = CLJModal;

  // ---------- Slider ----------
  class CLJSlider {
    constructor(container, options = {}) {
      this.container = typeof container === 'string' ? document.querySelector(container) : container;
      if (!this.container) throw new Error('Container not found');
      this.min = options.min !== undefined ? options.min : 0;
      this.max = options.max !== undefined ? options.max : 100;
      this.value = options.value !== undefined ? options.value : 50;
      this.onChange = options.onChange || null;
      this.step = options.step || 1;
      this.isVertical = options.vertical || false;
      this.create();
    }
    create() {
      this.container.innerHTML = '';
      this.container.style.position = 'relative';
      this.container.style.display = 'inline-block';
      this.track = document.createElement('div');
      this.track.style.backgroundColor = '#333';
      this.track.style.borderRadius = '10px';
      if (this.isVertical) {
        this.track.style.width = '8px';
        this.track.style.height = '200px';
        this.track.style.margin = '0 auto';
      } else {
        this.track.style.height = '8px';
        this.track.style.width = '300px';
      }
      this.fill = document.createElement('div');
      this.fill.style.backgroundColor = '#00aaff';
      this.fill.style.borderRadius = '10px';
      if (this.isVertical) {
        this.fill.style.width = '100%';
        this.fill.style.height = '0%';
        this.fill.style.position = 'absolute';
        this.fill.style.bottom = '0';
      } else {
        this.fill.style.height = '100%';
        this.fill.style.width = '0%';
      }
      this.track.appendChild(this.fill);
      this.handle = document.createElement('div');
      this.handle.style.width = '20px';
      this.handle.style.height = '20px';
      this.handle.style.backgroundColor = '#00aaff';
      this.handle.style.borderRadius = '50%';
      this.handle.style.position = 'absolute';
      this.handle.style.cursor = 'pointer';
      this.handle.style.boxShadow = '0 0 5px rgba(0,170,255,0.8)';
      this.handle.style.top = this.isVertical ? '0' : '-6px';
      this.handle.style.left = this.isVertical ? '-6px' : '0';
      this.track.appendChild(this.handle);
      this.container.appendChild(this.track);
      this.updatePosition();
      this.attachEvents();
    }
    updatePosition() {
      let percent = (this.value - this.min) / (this.max - this.min) * 100;
      percent = Math.min(100, Math.max(0, percent));
      if (this.isVertical) {
        this.fill.style.height = percent + '%';
        this.handle.style.top = 'calc(' + (100 - percent) + '% - 10px)';
      } else {
        this.fill.style.width = percent + '%';
        this.handle.style.left = 'calc(' + percent + '% - 10px)';
      }
    }
    attachEvents() {
      const onMove = (e) => {
        const rect = this.track.getBoundingClientRect();
        let percent;
        if (this.isVertical) {
          let y = (e.clientY - rect.top) / rect.height;
          y = Math.min(1, Math.max(0, y));
          percent = 1 - y;
        } else {
          let x = (e.clientX - rect.left) / rect.width;
          x = Math.min(1, Math.max(0, x));
          percent = x;
        }
        let newVal = this.min + percent * (this.max - this.min);
        newVal = Math.round(newVal / this.step) * this.step;
        newVal = Math.min(this.max, Math.max(this.min, newVal));
        if (newVal !== this.value) {
          this.value = newVal;
          this.updatePosition();
          if (this.onChange) this.onChange(this.value);
        }
      };
      const start = (e) => {
        e.preventDefault();
        onMove(e);
        const moveHandler = (e) => onMove(e);
        const upHandler = () => {
          document.removeEventListener('mousemove', moveHandler);
          document.removeEventListener('mouseup', upHandler);
        };
        document.addEventListener('mousemove', moveHandler);
        document.addEventListener('mouseup', upHandler);
      };
      this.handle.addEventListener('mousedown', start);
      this.track.addEventListener('mousedown', start);
    }
    setValue(v) {
      this.value = Math.min(this.max, Math.max(this.min, v));
      this.updatePosition();
    }
    getValue() { return this.value; }
  }
  window.CLJ.Slider = CLJSlider;

  // ---------- Tabs ----------
  class CLJTabs {
    constructor(container, options = {}) {
      this.container = typeof container === 'string' ? document.querySelector(container) : container;
      this.tabs = options.tabs || [];
      this.activeIndex = options.activeIndex || 0;
      this.onChange = options.onChange || null;
      this.render();
    }
    render() {
      this.container.innerHTML = '';
      this.header = document.createElement('div');
      this.header.className = 'clj-tabs-header';
      this.header.style.display = 'flex';
      this.header.style.borderBottom = '2px solid #333';
      this.header.style.marginBottom = '10px';
      this.panes = [];
      this.tabs.forEach((tab, idx) => {
        const btn = document.createElement('button');
        btn.textContent = tab.label;
        btn.style.background = 'none';
        btn.style.border = 'none';
        btn.style.padding = '10px 20px';
        btn.style.cursor = 'pointer';
        btn.style.fontSize = '16px';
        btn.style.color = idx === this.activeIndex ? '#00aaff' : '#aaa';
        btn.style.borderBottom = idx === this.activeIndex ? '2px solid #00aaff' : 'none';
        btn.style.transition = 'all 0.2s';
        btn.onclick = () => this.activate(idx);
        this.header.appendChild(btn);
        const pane = document.createElement('div');
        pane.className = 'clj-tab-pane';
        pane.innerHTML = tab.content;
        if (idx !== this.activeIndex) pane.style.display = 'none';
        this.container.appendChild(pane);
        this.panes.push(pane);
      });
      this.container.prepend(this.header);
    }
    activate(index) {
      if (index === this.activeIndex) return;
      this.panes[this.activeIndex].style.display = 'none';
      this.header.children[this.activeIndex].style.color = '#aaa';
      this.header.children[this.activeIndex].style.borderBottom = 'none';
      this.activeIndex = index;
      this.panes[this.activeIndex].style.display = 'block';
      this.header.children[this.activeIndex].style.color = '#00aaff';
      this.header.children[this.activeIndex].style.borderBottom = '2px solid #00aaff';
      if (this.onChange) this.onChange(index);
    }
    setContent(index, html) {
      if (this.panes[index]) this.panes[index].innerHTML = html;
    }
  }
  window.CLJ.Tabs = CLJTabs;

  // ---------- Tooltip ----------
  class CLJTooltip {
    constructor(target, text, options = {}) {
      this.target = typeof target === 'string' ? document.querySelector(target) : target;
      this.text = text;
      this.position = options.position || 'top';
      this.showDelay = options.showDelay || 200;
      this.hideDelay = options.hideDelay || 100;
      this.tooltipEl = null;
      this.timeout = null;
      this.init();
    }
    init() {
      this.target.addEventListener('mouseenter', () => this.show());
      this.target.addEventListener('mouseleave', () => this.hide());
    }
    createTooltip() {
      if (this.tooltipEl) return;
      this.tooltipEl = document.createElement('div');
      this.tooltipEl.className = 'clj-tooltip';
      this.tooltipEl.textContent = this.text;
      this.tooltipEl.style.position = 'absolute';
      this.tooltipEl.style.backgroundColor = '#333';
      this.tooltipEl.style.color = '#fff';
      this.tooltipEl.style.padding = '6px 12px';
      this.tooltipEl.style.borderRadius = '6px';
      this.tooltipEl.style.fontSize = '12px';
      this.tooltipEl.style.whiteSpace = 'nowrap';
      this.tooltipEl.style.zIndex = '10000';
      this.tooltipEl.style.pointerEvents = 'none';
      this.tooltipEl.style.opacity = '0';
      this.tooltipEl.style.transition = 'opacity 0.2s';
      document.body.appendChild(this.tooltipEl);
    }
    show() {
      if (this.timeout) clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.createTooltip();
        const rect = this.target.getBoundingClientRect();
        let left, top;
        switch (this.position) {
          case 'top':
            left = rect.left + rect.width / 2 - this.tooltipEl.offsetWidth / 2;
            top = rect.top - this.tooltipEl.offsetHeight - 5;
            break;
          case 'bottom':
            left = rect.left + rect.width / 2 - this.tooltipEl.offsetWidth / 2;
            top = rect.bottom + 5;
            break;
          case 'left':
            left = rect.left - this.tooltipEl.offsetWidth - 5;
            top = rect.top + rect.height / 2 - this.tooltipEl.offsetHeight / 2;
            break;
          case 'right':
            left = rect.right + 5;
            top = rect.top + rect.height / 2 - this.tooltipEl.offsetHeight / 2;
            break;
        }
        this.tooltipEl.style.left = left + 'px';
        this.tooltipEl.style.top = top + 'px';
        this.tooltipEl.style.opacity = '1';
      }, this.showDelay);
    }
    hide() {
      if (this.timeout) clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        if (this.tooltipEl) this.tooltipEl.style.opacity = '0';
      }, this.hideDelay);
    }
    destroy() {
      if (this.tooltipEl) this.tooltipEl.remove();
    }
  }
  window.CLJ.Tooltip = CLJTooltip;

  // ---------- Toast ----------
  class CLJToast {
    static show(message, duration = 3000) {
      const toast = document.createElement('div');
      toast.className = 'clj-toast';
      toast.textContent = message;
      toast.style.position = 'fixed';
      toast.style.bottom = '20px';
      toast.style.left = '50%';
      toast.style.transform = 'translateX(-50%)';
      toast.style.backgroundColor = 'rgba(0,0,0,0.8)';
      toast.style.color = '#fff';
      toast.style.padding = '12px 24px';
      toast.style.borderRadius = '8px';
      toast.style.zIndex = '10001';
      toast.style.fontSize = '14px';
      toast.style.backdropFilter = 'blur(8px)';
      toast.style.animation = 'clj-slideUp 0.3s ease-out';
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.style.animation = 'clj-fadeOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
      }, duration);
    }
  }
  window.CLJ.Toast = CLJToast;

  // ---------- Accordion ----------
  class CLJAccordion {
    constructor(container, items = []) {
      this.container = typeof container === 'string' ? document.querySelector(container) : container;
      this.items = items; // [{title, content, open?}]
      this.render();
    }
    render() {
      this.container.innerHTML = '';
      this.items.forEach((item, idx) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'clj-accordion-item';
        wrapper.style.border = '1px solid #333';
        wrapper.style.borderRadius = '8px';
        wrapper.style.marginBottom = '8px';
        wrapper.style.overflow = 'hidden';
        const header = document.createElement('div');
        header.textContent = item.title;
        header.style.padding = '12px 16px';
        header.style.backgroundColor = '#222';
        header.style.cursor = 'pointer';
        header.style.fontWeight = 'bold';
        header.style.transition = 'background 0.2s';
        header.onmouseenter = () => header.style.backgroundColor = '#2a2a2a';
        header.onmouseleave = () => header.style.backgroundColor = '#222';
        const content = document.createElement('div');
        content.innerHTML = item.content;
        content.style.padding = item.open ? '12px 16px' : '0 16px';
        content.style.maxHeight = item.open ? '500px' : '0';
        content.style.overflow = 'hidden';
        content.style.transition = 'max-height 0.3s ease, padding 0.3s ease';
        header.onclick = () => {
          const isOpen = content.style.maxHeight !== '0px';
          content.style.maxHeight = isOpen ? '0' : '500px';
          content.style.padding = isOpen ? '0 16px' : '12px 16px';
        };
        wrapper.appendChild(header);
        wrapper.appendChild(content);
        this.container.appendChild(wrapper);
      });
    }
  }
  window.CLJ.Accordion = CLJAccordion;

  // ---------- Carousel (simple) ----------
  class CLJCarousel {
    constructor(container, images = [], options = {}) {
      this.container = typeof container === 'string' ? document.querySelector(container) : container;
      this.images = images;
      this.current = 0;
      this.interval = options.interval || 3000;
      this.auto = options.auto !== false;
      this.timer = null;
      this.create();
    }
    create() {
      this.container.innerHTML = '';
      this.container.style.position = 'relative';
      this.container.style.overflow = 'hidden';
      this.wrapper = document.createElement('div');
      this.wrapper.style.display = 'flex';
      this.wrapper.style.transition = 'transform 0.5s ease';
      this.wrapper.style.height = '100%';
      this.images.forEach(src => {
        const img = document.createElement('img');
        img.src = src;
        img.style.width = '100%';
        img.style.objectFit = 'cover';
        img.style.flexShrink = '0';
        this.wrapper.appendChild(img);
      });
      this.container.appendChild(this.wrapper);
      const prevBtn = document.createElement('button');
      prevBtn.textContent = '❮';
      prevBtn.style.position = 'absolute';
      prevBtn.style.left = '10px';
      prevBtn.style.top = '50%';
      prevBtn.style.transform = 'translateY(-50%)';
      prevBtn.style.backgroundColor = 'rgba(0,0,0,0.5)';
      prevBtn.style.border = 'none';
      prevBtn.style.color = '#fff';
      prevBtn.style.fontSize = '24px';
      prevBtn.style.cursor = 'pointer';
      prevBtn.onclick = () => this.prev();
      const nextBtn = document.createElement('button');
      nextBtn.textContent = '❯';
      nextBtn.style.position = 'absolute';
      nextBtn.style.right = '10px';
      nextBtn.style.top = '50%';
      nextBtn.style.transform = 'translateY(-50%)';
      nextBtn.style.backgroundColor = 'rgba(0,0,0,0.5)';
      nextBtn.style.border = 'none';
      nextBtn.style.color = '#fff';
      nextBtn.style.fontSize = '24px';
      nextBtn.style.cursor = 'pointer';
      nextBtn.onclick = () => this.next();
      this.container.appendChild(prevBtn);
      this.container.appendChild(nextBtn);
      if (this.auto) this.startAuto();
      this.update();
    }
    update() {
      this.wrapper.style.transform = 'translateX(' + (-this.current * 100) + '%)';
    }
    next() {
      this.current = (this.current + 1) % this.images.length;
      this.update();
    }
    prev() {
      this.current = (this.current - 1 + this.images.length) % this.images.length;
      this.update();
    }
    startAuto() {
      if (this.timer) clearInterval(this.timer);
      this.timer = setInterval(() => this.next(), this.interval);
    }
    stopAuto() { if (this.timer) clearInterval(this.timer); }
    destroy() { this.stopAuto(); this.container.innerHTML = ''; }
  }
  window.CLJ.Carousel = CLJCarousel;

  // ---------- ProgressBar ----------
  class CLJProgressBar {
    constructor(container, options = {}) {
      this.container = typeof container === 'string' ? document.querySelector(container) : container;
      this.value = options.value || 0;
      this.max = options.max || 100;
      this.color = options.color || '#00aaff';
      this.create();
    }
    create() {
      this.container.innerHTML = '';
      this.bar = document.createElement('div');
      this.bar.style.backgroundColor = '#333';
      this.bar.style.borderRadius = '10px';
      this.bar.style.height = '20px';
      this.bar.style.width = '100%';
      this.bar.style.overflow = 'hidden';
      this.fill = document.createElement('div');
      this.fill.style.backgroundColor = this.color;
      this.fill.style.width = '0%';
      this.fill.style.height = '100%';
      this.fill.style.transition = 'width 0.3s';
      this.bar.appendChild(this.fill);
      this.container.appendChild(this.bar);
      this.update();
    }
    update() {
      let percent = (this.value / this.max) * 100;
      percent = Math.min(100, Math.max(0, percent));
      this.fill.style.width = percent + '%';
    }
    setValue(v) { this.value = v; this.update(); }
  }
  window.CLJ.ProgressBar = CLJProgressBar;

  // ---------- Switch (toggle) ----------
  class CLJSwitch {
    constructor(container, options = {}) {
      this.container = typeof container === 'string' ? document.querySelector(container) : container;
      this.checked = options.checked || false;
      this.onChange = options.onChange || null;
      this.create();
    }
    create() {
      this.container.innerHTML = '';
      this.switchEl = document.createElement('label');
      this.switchEl.style.position = 'relative';
      this.switchEl.style.display = 'inline-block';
      this.switchEl.style.width = '50px';
      this.switchEl.style.height = '26px';
      this.input = document.createElement('input');
      this.input.type = 'checkbox';
      this.input.checked = this.checked;
      this.input.style.opacity = '0';
      this.input.style.width = '0';
      this.input.style.height = '0';
      this.slider = document.createElement('span');
      this.slider.style.position = 'absolute';
      this.slider.style.cursor = 'pointer';
      this.slider.style.top = '0';
      this.slider.style.left = '0';
      this.slider.style.right = '0';
      this.slider.style.bottom = '0';
      this.slider.style.backgroundColor = '#ccc';
      this.slider.style.transition = '0.3s';
      this.slider.style.borderRadius = '26px';
      const knob = document.createElement('span');
      knob.style.position = 'absolute';
      knob.style.height = '20px';
      knob.style.width = '20px';
      knob.style.left = '3px';
      knob.style.bottom = '3px';
      knob.style.backgroundColor = 'white';
      knob.style.transition = '0.3s';
      knob.style.borderRadius = '50%';
      this.slider.appendChild(knob);
      this.switchEl.appendChild(this.input);
      this.switchEl.appendChild(this.slider);
      this.container.appendChild(this.switchEl);
      this.input.addEventListener('change', (e) => {
        this.checked = e.target.checked;
        this.slider.style.backgroundColor = this.checked ? '#00aaff' : '#ccc';
        knob.style.transform = this.checked ? 'translateX(24px)' : 'translateX(0)';
        if (this.onChange) this.onChange(this.checked);
      });
      this.slider.style.backgroundColor = this.checked ? '#00aaff' : '#ccc';
      knob.style.transform = this.checked ? 'translateX(24px)' : 'translateX(0)';
    }
    getValue() { return this.checked; }
    setValue(v) { this.input.checked = v; this.input.dispatchEvent(new Event('change')); }
  }
  window.CLJ.Switch = CLJSwitch;

  // ---------- Rating (stars) ----------
  class CLJRating {
    constructor(container, options = {}) {
      this.container = typeof container === 'string' ? document.querySelector(container) : container;
      this.max = options.max || 5;
      this.value = options.value || 0;
      this.onChange = options.onChange || null;
      this.create();
    }
    create() {
      this.container.innerHTML = '';
      this.stars = [];
      for (let i = 1; i <= this.max; i++) {
        const star = document.createElement('span');
        star.innerHTML = '★';
        star.style.fontSize = '28px';
        star.style.cursor = 'pointer';
        star.style.color = i <= this.value ? '#ffcc00' : '#555';
        star.style.transition = 'color 0.1s';
        star.style.margin = '0 2px';
        star.onmouseenter = () => { this.highlight(i); };
        star.onmouseleave = () => { this.highlight(this.value); };
        star.onclick = () => { this.value = i; this.highlight(this.value); if (this.onChange) this.onChange(this.value); };
        this.container.appendChild(star);
        this.stars.push(star);
      }
    }
    highlight(v) {
      for (let i = 0; i < this.max; i++) {
        this.stars[i].style.color = i < v ? '#ffcc00' : '#555';
      }
    }
    getValue() { return this.value; }
    setValue(v) { this.value = Math.min(this.max, Math.max(0, v)); this.highlight(this.value); }
  }
  window.CLJ.Rating = CLJRating;

  // ---------- Date Picker ----------
  class CLJDatePicker {
    constructor(container, options = {}) {
      this.container = typeof container === 'string' ? document.querySelector(container) : container;
      this.value = options.value || new Date();
      this.onChange = options.onChange || null;
      this.create();
    }
    create() {
      this.container.innerHTML = '';
      this.input = document.createElement('input');
      this.input.type = 'date';
      this.input.value = this.value.toISOString().split('T')[0];
      this.input.style.padding = '8px';
      this.input.style.borderRadius = '6px';
      this.input.style.border = '1px solid #333';
      this.input.style.backgroundColor = '#1a1a2e';
      this.input.style.color = '#fff';
      this.input.addEventListener('change', (e) => {
        this.value = new Date(e.target.value);
        if (this.onChange) this.onChange(this.value);
      });
      this.container.appendChild(this.input);
    }
    getValue() { return this.value; }
    setValue(date) { this.value = date; this.input.value = date.toISOString().split('T')[0]; }
  }
  window.CLJ.DatePicker = CLJDatePicker;

  // ---------- Color Picker ----------
  class CLJColorPicker {
    constructor(container, options = {}) {
      this.container = typeof container === 'string' ? document.querySelector(container) : container;
      this.value = options.value || '#00aaff';
      this.onChange = options.onChange || null;
      this.create();
    }
    create() {
      this.container.innerHTML = '';
      this.input = document.createElement('input');
      this.input.type = 'color';
      this.input.value = this.value;
      this.input.style.width = '40px';
      this.input.style.height = '40px';
      this.input.style.cursor = 'pointer';
      this.input.style.border = 'none';
      this.input.style.borderRadius = '8px';
      this.input.addEventListener('input', (e) => {
        this.value = e.target.value;
        if (this.onChange) this.onChange(this.value);
      });
      this.container.appendChild(this.input);
    }
    getValue() { return this.value; }
    setValue(color) { this.value = color; this.input.value = color; }
  }
  window.CLJ.ColorPicker = CLJColorPicker;

  // ---------- Audio Player with Visualization ----------
  class CLJAudio {
    constructor(options = {}) {
      this.src = options.src || null;
      this.visualization = options.visualization !== false;
      this.onPlay = options.onPlay || null;
      this.onPause = options.onPause || null;
      this.onEnd = options.onEnd || null;
      this.audio = null;
      this.audioCtx = null;
      this.analyser = null;
      this.canvas = null;
      this.isPlaying = false;
    }
    init() {
      if (!this.src) return;
      this.audio = new Audio(this.src);
      if (this.visualization && window.AudioContext) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioCtx.createAnalyser();
        const source = this.audioCtx.createMediaElementSource(this.audio);
        source.connect(this.analyser);
        this.analyser.connect(this.audioCtx.destination);
        this.canvas = document.createElement('canvas');
        this.canvas.width = 300;
        this.canvas.height = 100;
        this.canvas.style.display = 'block';
        this.canvas.style.marginTop = '10px';
        this.startVisualization();
      }
      this.audio.addEventListener('play', () => { this.isPlaying = true; if (this.onPlay) this.onPlay(); });
      this.audio.addEventListener('pause', () => { this.isPlaying = false; if (this.onPause) this.onPause(); });
      this.audio.addEventListener('ended', () => { this.isPlaying = false; if (this.onEnd) this.onEnd(); });
    }
    startVisualization() {
      const ctx = this.canvas.getContext('2d');
      const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      const draw = () => {
        if (!this.isPlaying) { requestAnimationFrame(draw); return; }
        this.analyser.getByteFrequencyData(dataArray);
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        const barWidth = this.canvas.width / 64;
        let x = 0;
        for (let i = 0; i < 64; i++) {
          const height = dataArray[i] / 255 * this.canvas.height;
          ctx.fillStyle = 'hsl(' + (i * 5) + ', 70%, 50%)';
          ctx.fillRect(x, this.canvas.height - height, barWidth - 1, height);
          x += barWidth;
        }
        requestAnimationFrame(draw);
      };
      draw();
    }
    play() { if (this.audio) this.audio.play(); if (this.audioCtx) this.audioCtx.resume(); }
    pause() { if (this.audio) this.audio.pause(); }
    setVolume(vol) { if (this.audio) this.audio.volume = Math.min(1, Math.max(0, vol)); }
    getCanvas() { return this.canvas; }
  }
  window.CLJ.Audio = CLJAudio;

  // ---------- Video Player ----------
  class CLJVideoPlayer {
    constructor(container, options = {}) {
      this.container = typeof container === 'string' ? document.querySelector(container) : container;
      this.src = options.src || '';
      this.autoplay = options.autoplay || false;
      this.controls = options.controls !== false;
      this.loop = options.loop || false;
      this.onPlay = options.onPlay || null;
      this.onPause = options.onPause || null;
      this.onEnd = options.onEnd || null;
      this.create();
    }
    create() {
      this.container.innerHTML = '';
      this.video = document.createElement('video');
      this.video.src = this.src;
      this.video.autoplay = this.autoplay;
      this.video.controls = this.controls;
      this.video.loop = this.loop;
      this.video.style.width = '100%';
      this.video.style.borderRadius = '12px';
      this.video.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
      this.video.addEventListener('play', () => { if (this.onPlay) this.onPlay(); });
      this.video.addEventListener('pause', () => { if (this.onPause) this.onPause(); });
      this.video.addEventListener('ended', () => { if (this.onEnd) this.onEnd(); });
      this.container.appendChild(this.video);
    }
    play() { if (this.video) this.video.play(); }
    pause() { if (this.video) this.video.pause(); }
    setVolume(vol) { if (this.video) this.video.volume = Math.min(1, Math.max(0, vol)); }
    seek(seconds) { if (this.video) this.video.currentTime = seconds; }
  }
  window.CLJ.VideoPlayer = CLJVideoPlayer;

  // ---------- Markdown Renderer ----------
  class CLJMarkdown {
    static render(markdown) {
      let html = markdown;
      html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
      html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
      html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
      html = html.replace(/**(.*?)**/g, '<strong>$1</strong>');
      html = html.replace(/*(.*?)*/g, '<em>$1</em>');
      html = html.replace(/[(.*?)]((.*?))/g, '<a href="$2">$1</a>');
      html = html.replace(/^s*-s(.*$)/gm, '<li>$1</li>');
      html = html.replace(/(<li>.*</li>)/s, '<ul>$1</ul>');
      html = html.replace(/^d+.s(.*$)/gm, '<li>$1</li>');
      html = html.replace(/
/g, '<br>');
      return html;
    }
    static renderToElement(container, markdown) {
      const el = typeof container === 'string' ? document.querySelector(container) : container;
      if (el) el.innerHTML = this.render(markdown);
    }
  }
  window.CLJ.Markdown = CLJMarkdown;

  // ---------- Code Editor (basic) ----------
  class CLJCodeEditor {
    constructor(container, options = {}) {
      this.container = typeof container === 'string' ? document.querySelector(container) : container;
      this.value = options.value || '';
      this.language = options.language || 'javascript';
      this.height = options.height || '300px';
      this.onChange = options.onChange || null;
      this.create();
    }
    create() {
      this.container.innerHTML = '';
      this.textarea = document.createElement('textarea');
      this.textarea.value = this.value;
      this.textarea.style.width = '100%';
      this.textarea.style.height = this.height;
      this.textarea.style.fontFamily = 'monospace';
      this.textarea.style.fontSize = '14px';
      this.textarea.style.backgroundColor = '#1a1a2e';
      this.textarea.style.color = '#00ff00';
      this.textarea.style.padding = '10px';
      this.textarea.style.borderRadius = '8px';
      this.textarea.style.border = '1px solid #333';
      this.textarea.addEventListener('input', (e) => {
        this.value = e.target.value;
        if (this.onChange) this.onChange(this.value);
      });
      this.container.appendChild(this.textarea);
    }
    getValue() { return this.value; }
    setValue(val) { this.value = val; this.textarea.value = val; }
  }
  window.CLJ.CodeEditor = CLJCodeEditor;

  // ---------- Router ----------
  class CLJRouter {
    constructor(options = {}) {
      this.routes = options.routes || [];
      this.notFound = options.notFound || '<h2>404 Not Found</h2>';
      this.container = options.container || '#root';
      this.currentPath = window.location.pathname;
      this.params = {};
      this.init();
    }
    init() {
      window.addEventListener('popstate', () => this.handleRoute());
      this.handleRoute();
    }
    handleRoute() {
      const path = window.location.pathname;
      let matchedRoute = this.routes.find(r => r.path === path);
      if (!matchedRoute) {
        const dynamicMatch = this.routes.find(r => r.path && r.path.includes(':'));
        if (dynamicMatch) {
          const patternStr = '^' + dynamicMatch.path.replace(/:[^/]+/g, '([^/]+)') + '$';
          const pattern = new RegExp(patternStr);
          const match = path.match(pattern);
          if (match) {
            matchedRoute = dynamicMatch;
            const paramNames = dynamicMatch.path.match(/:[^/]+/g) || [];
            paramNames.forEach((name, i) => { this.params[name.slice(1)] = match[i + 1]; });
          }
        }
      }
      const content = matchedRoute ? (typeof matchedRoute.component === 'function' ? matchedRoute.component(this.params) : matchedRoute.component) : this.notFound;
      const container = typeof this.container === 'string' ? document.querySelector(this.container) : this.container;
      if (container) container.innerHTML = content;
      if (window.__CLJ_mount && window.__cljApp) window.__CLJ_mount(window.__cljApp, container);
    }
    navigate(path, replace = false) {
      if (replace) window.history.replaceState(null, '', path);
      else window.history.pushState(null, '', path);
      this.handleRoute();
    }
  }
  window.CLJ.Router = CLJRouter;
  window.CLJ.navigate = (path, replace) => { if (window.__cljRouter) window.__cljRouter.navigate(path, replace); else window.history.pushState(null, '', path); };

  // ---------- Form with built-in validation ----------
  class CLJForm {
    constructor(formElement, options = {}) {
      this.form = typeof formElement === 'string' ? document.querySelector(formElement) : formElement;
      this.fields = options.fields || {};
      this.onSubmit = options.onSubmit || null;
      this.errors = {};
      this.init();
    }
    init() {
      if (!this.form) return;
      this.form.noValidate = true;
      this.form.addEventListener('submit', (e) => { e.preventDefault(); this.validateAndSubmit(); });
      Object.keys(this.fields).forEach(name => {
        const input = this.form.querySelector('[name="' + name + '"]');
        if (input) input.addEventListener('input', () => this.validateField(name));
      });
    }
    validateField(name) {
      const field = this.fields[name];
      const input = this.form.querySelector('[name="' + name + '"]');
      if (!input || !field) return true;
      const value = input.value;
      let error = '';
      if (field.required && !value) error = field.requiredMessage || name + ' is required';
      else if (field.pattern && !new RegExp(field.pattern).test(value)) error = field.patternMessage || name + ' is invalid';
      else if (field.minLength && value.length < field.minLength) error = name + ' must be at least ' + field.minLength + ' characters';
      else if (field.maxLength && value.length > field.maxLength) error = name + ' must be at most ' + field.maxLength + ' characters';
      else if (field.validate && typeof field.validate === 'function') error = field.validate(value) || '';
      if (error) this.errors[name] = error;
      else delete this.errors[name];
      this.showError(name, error);
      return !error;
    }
    showError(name, error) {
      let errorEl = this.form.querySelector('[data-error="' + name + '"]');
      if (!errorEl) {
        const span = document.createElement('span');
        span.setAttribute('data-error', name);
        span.style.color = '#ff4444';
        span.style.fontSize = '12px';
        span.style.marginTop = '4px';
        span.style.display = 'block';
        const input = this.form.querySelector('[name="' + name + '"]');
        if (input && input.parentNode) input.parentNode.appendChild(span);
        errorEl = span;
      }
      if (errorEl) errorEl.textContent = error || '';
      errorEl.style.display = error ? 'block' : 'none';
    }
    validateAndSubmit() {
      let isValid = true;
      Object.keys(this.fields).forEach(name => { if (!this.validateField(name)) isValid = false; });
      if (isValid && this.onSubmit) {
        const formData = new FormData(this.form);
        const data = {};
        formData.forEach((value, key) => { data[key] = value; });
        this.onSubmit(data, this.form);
      }
      return isValid;
    }
    getValues() {
      const data = {};
      Object.keys(this.fields).forEach(name => {
        const input = this.form.querySelector('[name="' + name + '"]');
        if (input) data[name] = input.value;
      });
      return data;
    }
    setValues(data) {
      Object.keys(data).forEach(name => {
        const input = this.form.querySelector('[name="' + name + '"]');
        if (input) input.value = data[name];
      });
    }
  }
  window.CLJ.Form = CLJForm;

  // ---------- HTTP Client with caching ----------
  class CLJFetch {
    constructor() { this.cache = new Map(); this.pending = new Map(); }
    async request(url, options = {}) {
      const cacheKey = (options.method || 'GET') + ':' + url + ':' + JSON.stringify(options.body || {});
      if (options.cache && this.cache.has(cacheKey) && Date.now() - this.cache.get(cacheKey).timestamp < (options.cacheTTL || 60000)) {
        return Promise.resolve(this.cache.get(cacheKey).data);
      }
      if (this.pending.has(cacheKey)) return this.pending.get(cacheKey);
      const promise = fetch(url, options).then(async res => {
        const data = await (options.responseType === 'json' ? res.json() : res.text());
        if (options.cache) this.cache.set(cacheKey, { data: data, timestamp: Date.now() });
        this.pending.delete(cacheKey);
        return data;
      }).catch(err => { this.pending.delete(cacheKey); throw err; });
      this.pending.set(cacheKey, promise);
      return promise;
    }
    get(url, options = {}) { return this.request(url, Object.assign({}, options, { method: 'GET' })); }
    post(url, body, options = {}) { return this.request(url, Object.assign({}, options, { method: 'POST', body: JSON.stringify(body), headers: Object.assign({ 'Content-Type': 'application/json' }, options.headers || {}) })); }
    put(url, body, options = {}) { return this.request(url, Object.assign({}, options, { method: 'PUT', body: JSON.stringify(body), headers: Object.assign({ 'Content-Type': 'application/json' }, options.headers || {}) })); }
    delete(url, options = {}) { return this.request(url, Object.assign({}, options, { method: 'DELETE' })); }
  }
  window.CLJ.fetch = new CLJFetch();

  // ---------- Canvas-based Chart ----------
  class CLJChart {
    constructor(container, options = {}) {
      this.container = typeof container === 'string' ? document.querySelector(container) : container;
      this.type = options.type || 'line';
      this.data = options.data || [];
      this.labels = options.labels || [];
      this.colors = options.colors || ['#00aaff', '#ff6600', '#44ff44', '#ff44ff', '#ffff44'];
      this.width = options.width || 400;
      this.height = options.height || 300;
      this.canvas = document.createElement('canvas');
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      this.container.innerHTML = '';
      this.container.appendChild(this.canvas);
      this.ctx = this.canvas.getContext('2d');
      this.render();
    }
    render() {
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.ctx.fillStyle = '#1a1a2e';
      this.ctx.fillRect(0, 0, this.width, this.height);
      if (this.type === 'line') this.renderLine();
      else if (this.type === 'bar') this.renderBar();
      else if (this.type === 'pie') this.renderPie();
      else if (this.type === 'doughnut') this.renderDoughnut();
    }
    renderLine() {
      if (!this.data.length) return;
      const padding = 40;
      const width = this.width - padding * 2;
      const height = this.height - padding * 2;
      const maxVal = Math.max.apply(null, this.data);
      const minVal = Math.min.apply(null, this.data.concat([0]));
      const range = maxVal - minVal || 1;
      const stepX = width / (this.data.length - 1);
      this.ctx.beginPath();
      this.ctx.strokeStyle = this.colors[0];
      this.ctx.lineWidth = 2;
      for (let i = 0; i < this.data.length; i++) {
        const x = padding + i * stepX;
        const y = this.height - padding - ((this.data[i] - minVal) / range) * height;
        if (i === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      }
      this.ctx.stroke();
      for (let i = 0; i < this.data.length; i++) {
        const x = padding + i * stepX;
        const y = this.height - padding - ((this.data[i] - minVal) / range) * height;
        this.ctx.beginPath();
        this.ctx.fillStyle = this.colors[0];
        this.ctx.arc(x, y, 4, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
    renderBar() {
      const padding = 40;
      const width = this.width - padding * 2;
      const height = this.height - padding * 2;
      const barWidth = width / this.data.length * 0.7;
      const maxVal = Math.max.apply(null, this.data);
      const step = width / this.data.length;
      for (let i = 0; i < this.data.length; i++) {
        const barHeight = (this.data[i] / maxVal) * height;
        const x = padding + i * step + (step - barWidth) / 2;
        const y = this.height - padding - barHeight;
        this.ctx.fillStyle = this.colors[i % this.colors.length];
        this.ctx.fillRect(x, y, barWidth, barHeight);
      }
    }
    renderPie() {
      const total = this.data.reduce(function(a, b) { return a + b; }, 0);
      let start = -Math.PI / 2;
      const centerX = this.width / 2;
      const centerY = this.height / 2;
      const radius = Math.min(this.width, this.height) * 0.4;
      for (let i = 0; i < this.data.length; i++) {
        const angle = (this.data[i] / total) * Math.PI * 2;
        this.ctx.beginPath();
        this.ctx.fillStyle = this.colors[i % this.colors.length];
        this.ctx.moveTo(centerX, centerY);
        this.ctx.arc(centerX, centerY, radius, start, start + angle);
        this.ctx.fill();
        start += angle;
      }
    }
    renderDoughnut() {
      const total = this.data.reduce(function(a, b) { return a + b; }, 0);
      let start = -Math.PI / 2;
      const centerX = this.width / 2;
      const centerY = this.height / 2;
      const outerRadius = Math.min(this.width, this.height) * 0.4;
      const innerRadius = outerRadius * 0.5;
      for (let i = 0; i < this.data.length; i++) {
        const angle = (this.data[i] / total) * Math.PI * 2;
        this.ctx.beginPath();
        this.ctx.fillStyle = this.colors[i % this.colors.length];
        this.ctx.arc(centerX, centerY, outerRadius, start, start + angle);
        this.ctx.arc(centerX, centerY, innerRadius, start + angle, start, true);
        this.ctx.fill();
        start += angle;
      }
    }
    update(data, labels) { if (data) this.data = data; if (labels) this.labels = labels; this.render(); }
  }
  window.CLJ.Chart = CLJChart;

  // ---------- Drag & Drop ----------
  class CLJDragDrop {
    constructor(options = {}) {
      this.dragClass = options.dragClass || 'clj-draggable';
      this.dropClass = options.dropClass || 'clj-dropzone';
      this.onDragStart = options.onDragStart || null;
      this.onDragEnd = options.onDragEnd || null;
      this.onDrop = options.onDrop || null;
      this.init();
    }
    init() {
      document.addEventListener('dragstart', (e) => {
        const el = e.target.closest('.' + this.dragClass);
        if (el) {
          e.dataTransfer.setData('text/plain', el.getAttribute('data-id') || el.id || '');
          if (this.onDragStart) this.onDragStart(el, e);
          el.classList.add('clj-dragging');
        }
      });
      document.addEventListener('dragend', (e) => {
        document.querySelectorAll('.clj-dragging').forEach(function(el) { el.classList.remove('clj-dragging'); });
        if (this.onDragEnd) this.onDragEnd(e);
      }.bind(this));
      document.addEventListener('dragover', (e) => {
        const dropzone = e.target.closest('.' + this.dropClass);
        if (dropzone) { e.preventDefault(); dropzone.classList.add('clj-drag-over'); }
      });
      document.addEventListener('dragleave', (e) => {
        const dropzone = e.target.closest('.' + this.dropClass);
        if (dropzone) dropzone.classList.remove('clj-drag-over');
      });
      document.addEventListener('drop', (e) => {
        const dropzone = e.target.closest('.' + this.dropClass);
        if (dropzone) {
          e.preventDefault();
          dropzone.classList.remove('clj-drag-over');
          const data = e.dataTransfer.getData('text/plain');
          const draggedEl = document.querySelector('.' + this.dragClass + '[data-id="' + data + '"], .' + this.dragClass + '#' + data);
          if (this.onDrop) this.onDrop(draggedEl, dropzone, e);
        }
      });
    }
  }
  window.CLJ.DragDrop = CLJDragDrop;

  // ---------- Virtual List ----------
  class CLJVirtualList {
    constructor(container, options = {}) {
      this.container = typeof container === 'string' ? document.querySelector(container) : container;
      this.items = options.items || [];
      this.itemHeight = options.itemHeight || 40;
      this.renderItem = options.renderItem || function(item) { return '<div>' + item + '</div>'; };
      this.bufferSize = options.bufferSize || 5;
      this.scrollTop = 0;
      this.container.style.overflow = 'auto';
      this.container.style.position = 'relative';
      this.content = document.createElement('div');
      this.content.style.position = 'relative';
      this.container.innerHTML = '';
      this.container.appendChild(this.content);
      this.container.addEventListener('scroll', () => this.render());
      this.render();
    }
    render() {
      const scrollTop = this.container.scrollTop;
      const startIdx = Math.max(0, Math.floor(scrollTop / this.itemHeight) - this.bufferSize);
      const endIdx = Math.min(this.items.length, startIdx + Math.ceil(this.container.clientHeight / this.itemHeight) + this.bufferSize * 2);
      const offsetY = startIdx * this.itemHeight;
      this.content.style.height = (this.items.length * this.itemHeight) + 'px';
      this.content.style.paddingTop = offsetY + 'px';
      let html = '';
      for (let i = startIdx; i < endIdx; i++) {
        html += '<div style="height:' + this.itemHeight + 'px;">' + this.renderItem(this.items[i], i) + '</div>';
      }
      this.content.innerHTML = html;
    }
    update(items) { this.items = items; this.render(); }
  }
  window.CLJ.VirtualList = CLJVirtualList;

  // Add fadeOut animation keyframes
  const style = document.createElement('style');
  style.textContent = `
    @keyframes clj-fadeOut { to { opacity: 0; transform: scale(0.9); } }
  `;
  document.head.appendChild(style);

  console.log('🎨 CLJ UI Components loaded (Modal, Slider, Tabs, Tooltip, Toast, Accordion, Carousel, ProgressBar, Switch, Rating, DatePicker, ColorPicker, Audio, Video, Markdown, CodeEditor, Router, Form, Fetch, Chart, DragDrop, VirtualList)');
})();

var ClientLiteApp = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

  // src/App.jsx
  function App() {
    var _a, _b, _c, _d, _e, _f;
    const [count, setCount] = __CLJ_useState(0);
    const [theme, setTheme] = __CLJ_useState("dark");
    const [todos, setTodos] = __CLJ_useState([]);
    const [newTodo, setNewTodo] = __CLJ_useState("");
    const [userId, setUserId] = __CLJ_useState(1);
    const [user, setUser] = __CLJ_useState(null);
    const [loading, setLoading] = __CLJ_useState(false);
    const [activeTab, setActiveTab] = __CLJ_useState("counters");
    const [showVideo, setShowVideo] = __CLJ_useState(false);
    const [animIntensity, setAnimIntensity] = __CLJ_useState(1);
    const [rippleColor, setRippleColor] = __CLJ_useState("rgba(0,170,255,.4)");
    const [cardHoverEnabled, setCardHoverEnabled] = __CLJ_useState(true);
    const [showModal, setShowModal] = __CLJ_useState(false);
    const [sliderValue, setSliderValue] = __CLJ_useState(50);
    const [switchEnabled, setSwitchEnabled] = __CLJ_useState(true);
    const [ratingValue, setRatingValue] = __CLJ_useState(4);
    const [progressValue, setProgressValue] = __CLJ_useState(65);
    const [toastMessage, setToastMessage] = __CLJ_useState("");
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
      console.log("\u26A1 CLJ Power App Mounted with 80 Animations + UI Component Library");
      setTimeout(() => setShowVideo(true), 1e3);
      if (typeof __CLJ_interact !== "undefined") {
        document.querySelectorAll(".tab-btn").forEach((btn) => {
          __CLJ_interact.glowOnHover(btn, "rgba(0,170,255,.4)", 25);
        });
        document.querySelectorAll(".action-btn").forEach((btn) => {
          __CLJ_interact.glowOnHover(btn, "rgba(40,167,69,.4)", 20);
        });
        document.querySelectorAll(".danger-btn").forEach((btn) => {
          __CLJ_interact.glowOnHover(btn, "rgba(220,53,69,.4)", 20);
        });
      }
      if (typeof CLJ !== "undefined") {
        if (sliderContainerRef.current) {
          new CLJ.Slider(sliderContainerRef.current, {
            min: 0,
            max: 100,
            value: sliderValue,
            step: 1,
            onChange: (val) => setSliderValue(val)
          });
        }
        if (switchContainerRef.current) {
          new CLJ.Switch(switchContainerRef.current, {
            checked: switchEnabled,
            onChange: (val) => setSwitchEnabled(val)
          });
        }
        if (ratingContainerRef.current) {
          new CLJ.Rating(ratingContainerRef.current, {
            max: 5,
            value: ratingValue,
            onChange: (val) => setRatingValue(val)
          });
        }
        if (progressContainerRef.current) {
          const progressBar = new CLJ.ProgressBar(progressContainerRef.current, {
            value: progressValue,
            max: 100,
            color: "#00aaff"
          });
          setTimeout(() => progressBar.setValue(progressValue), 500);
        }
        if (accordionContainerRef.current) {
          new CLJ.Accordion(accordionContainerRef.current, [
            { title: "\u{1F680} Getting Started", content: '<p style="color:#ddd;">Welcome to CLJ POWER mode! This framework requires zero dependencies and runs directly in your browser.</p>', open: true },
            { title: "\u{1F3AE} Counters", content: '<p style="color:#ddd;">20 interactive counters with ripple effects, glow animations, and card hover transforms.</p>', open: false },
            { title: "\u{1F4DD} Todos", content: '<p style="color:#ddd;">Full CRUD todo list with add, toggle, and delete functionality.</p>', open: false },
            { title: "\u{1F464} User Explorer", content: '<p style="color:#ddd;">Fetch and display user data from JSONPlaceholder API with prev/next navigation.</p>', open: false }
          ]);
        }
        if (carouselContainerRef.current) {
          new CLJ.Carousel(carouselContainerRef.current, [
            "https://picsum.photos/800/400?random=1",
            "https://picsum.photos/800/400?random=2",
            "https://picsum.photos/800/400?random=3",
            "https://picsum.photos/800/400?random=4",
            "https://picsum.photos/800/400?random=5"
          ], { interval: 4e3, auto: true });
        }
        if (tooltipTargetRef.current) {
          new CLJ.Tooltip(tooltipTargetRef.current, "This is a CLJ POWER mode tooltip! \u{1F680}", { position: "top", showDelay: 100 });
        }
      }
    }, []);
    const addTodo = () => {
      if (newTodo.trim()) {
        setTodos([...todos, { id: Date.now(), text: newTodo, done: false }]);
        setNewTodo("");
        if (typeof CLJ !== "undefined") {
          CLJ.Toast.show("\u2705 Task added successfully!", 2500);
        }
      }
    };
    const toggleTodo = (id) => {
      setTodos(todos.map((t) => t.id === id ? __spreadProps(__spreadValues({}, t), { done: !t.done }) : t));
    };
    const deleteTodo = (id) => {
      setTodos(todos.filter((t) => t.id !== id));
      if (typeof CLJ !== "undefined") {
        CLJ.Toast.show("\u{1F5D1}\uFE0F Task deleted", 2e3);
      }
    };
    const fetchUser = async (id) => {
      setLoading(true);
      try {
        const res = await fetch("https://jsonplaceholder.typicode.com/users/".concat(id));
        const u = await res.json();
        setUser(u);
        if (typeof CLJ !== "undefined") {
          CLJ.Toast.show("\u{1F464} User loaded: " + u.name, 2500);
        }
      } catch (e) {
        if (typeof CLJ !== "undefined") {
          CLJ.Toast.show("\u274C Failed to load user", 3e3);
        }
      }
      setLoading(false);
    };
    __CLJ_useEffect(() => {
      fetchUser(userId);
    }, [userId]);
    const handleRipple = (e, color) => {
      if (typeof __CLJ_interact !== "undefined") {
        __CLJ_interact.rippleEffect(e, color || rippleColor);
      }
    };
    const openSettingsModal = () => {
      if (typeof CLJ !== "undefined") {
        const modal = new CLJ.Modal({
          title: "\u2699\uFE0F POWER Mode Settings",
          content: '\n          <div style="color:#ddd;">\n            <p><strong>Animation Intensity:</strong> '.concat(animIntensity, "x</p>\n            <p><strong>Ripple Color:</strong> ").concat(rippleColor, "</p>\n            <p><strong>Card Hover:</strong> ").concat(cardHoverEnabled ? "Enabled" : "Disabled", "</p>\n            <p><strong>Switch Status:</strong> ").concat(switchEnabled ? "ON" : "OFF", "</p>\n            <p><strong>Rating:</strong> ").concat("\u2605".repeat(ratingValue)).concat("\u2606".repeat(5 - ratingValue), "</p>\n            <p><strong>Progress:</strong> ").concat(progressValue, '%</p>\n            <hr style="border-color:#333;margin:15px 0;" />\n            <p style="font-size:12px;opacity:0.6;">CLJ POWER Mode v2.0 \u2022 80 Animations \u2022 10 UI Components</p>\n          </div>\n        '),
          onOpen: () => console.log("Settings opened"),
          onClose: () => console.log("Settings closed")
        });
        modal.open();
      }
    };
    const Counter = ({ count: count2, inc, dec, label, color }) => /* @__PURE__ */ __CLJ_createElement("div", { className: "clj-card", style: {
      background: "linear-gradient(135deg, ".concat(color || "rgba(255,255,255,0.1)", ", rgba(255,255,255,0.05))"),
      backdropFilter: "blur(10px)",
      borderRadius: "15px",
      padding: "20px",
      margin: "10px",
      border: "1px solid rgba(255,255,255,0.2)",
      textAlign: "center",
      transition: "transform 0.3s ease"
    } }, /* @__PURE__ */ __CLJ_createElement("h2", { style: { fontSize: "24px", margin: "0 0 10px" } }, label, ": ", count2), /* @__PURE__ */ __CLJ_createElement("div", { style: { display: "flex", gap: "10px", justifyContent: "center" } }, /* @__PURE__ */ __CLJ_createElement(
      "button",
      {
        className: "clj-btn danger-btn",
        onclick: (e) => {
          handleRipple(e, "rgba(220,53,69,.3)");
          dec();
        },
        style: {
          padding: "12px 24px",
          borderRadius: "8px",
          border: "none",
          background: "linear-gradient(135deg, #dc3545, #a71d2a)",
          color: "white",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "18px"
        }
      },
      "-"
    ), /* @__PURE__ */ __CLJ_createElement(
      "button",
      {
        className: "clj-btn action-btn",
        onclick: (e) => {
          handleRipple(e, "rgba(40,167,69,.3)");
          inc();
        },
        style: {
          padding: "12px 24px",
          borderRadius: "8px",
          border: "none",
          background: "linear-gradient(135deg, #28a745, #1e7e34)",
          color: "white",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "18px"
        }
      },
      "+"
    )));
    const colors = ["#ff6384", "#36a2eb", "#ffce56", "#4bc0c0", "#9966ff", "#ff9f40", "#c9cbcf", "#7bc8a4", "#e8c3b9", "#71b7e6", "#ff6b6b", "#48dbfb", "#ff9ff3", "#54a0ff", "#5f27cd", "#01a3a4", "#f368e0", "#ff6348", "#0abde3", "#10ac84"];
    return /* @__PURE__ */ __CLJ_createElement("div", { style: {
      minHeight: "100vh",
      background: "linear-gradient(180deg, #020210 0%, #0a0a2a 50%, #020210 100%)",
      color: "#fff",
      fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
      overflow: "hidden"
    } }, /* @__PURE__ */ __CLJ_createElement("canvas", { id: "clj-bg-canvas", style: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      zIndex: 0,
      pointerEvents: "none",
      opacity: 0.4
    } }), /* @__PURE__ */ __CLJ_createElement("canvas", { id: "clj-bg-canvas-2", style: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      zIndex: 0,
      pointerEvents: "none",
      opacity: 0.25
    } }), showVideo && /* @__PURE__ */ __CLJ_createElement(
      "video",
      {
        autoplay: true,
        loop: true,
        muted: true,
        style: {
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
          opacity: 0.1
        }
      },
      /* @__PURE__ */ __CLJ_createElement("source", { src: "/animations/App.mp4", type: "video/mp4" })
    ), /* @__PURE__ */ __CLJ_createElement("header", { className: "clj-gradientShift", style: {
      padding: "20px 40px",
      background: "linear-gradient(270deg, rgba(10,10,30,0.95), rgba(20,10,40,0.95), rgba(10,10,30,0.95))",
      backgroundSize: "300% 300%",
      backdropFilter: "blur(20px)",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: "1px solid rgba(255,255,255,0.1)",
      position: "sticky",
      top: 0,
      zIndex: 100
    } }, /* @__PURE__ */ __CLJ_createElement("div", null, /* @__PURE__ */ __CLJ_createElement("h1", { className: "clj-textGlow", style: {
      fontSize: "32px",
      background: "linear-gradient(135deg, #00aaff, #aa44ff, #ff44aa)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      margin: 0
    } }, "\u26A1 CLJ Power Engine v2.0"), /* @__PURE__ */ __CLJ_createElement("p", { style: { margin: "5px 0 0", opacity: 0.7, fontSize: "14px" } }, "No React Required \u2022 80 Animations \u2022 10 UI Components \u2022 Pure CLJ Runtime")), /* @__PURE__ */ __CLJ_createElement("div", { style: { display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" } }, /* @__PURE__ */ __CLJ_createElement(
      "button",
      {
        className: "clj-btn tab-btn",
        onclick: (e) => {
          handleRipple(e);
          setActiveTab("counters");
        },
        style: {
          padding: "10px 20px",
          borderRadius: "8px",
          border: "none",
          background: activeTab === "counters" ? "linear-gradient(135deg, #007bff, #0056b3)" : "rgba(255,255,255,0.1)",
          color: "white",
          cursor: "pointer"
        }
      },
      "\u{1F3AE} Counters"
    ), /* @__PURE__ */ __CLJ_createElement(
      "button",
      {
        className: "clj-btn tab-btn",
        onclick: (e) => {
          handleRipple(e);
          setActiveTab("todos");
        },
        style: {
          padding: "10px 20px",
          borderRadius: "8px",
          border: "none",
          background: activeTab === "todos" ? "linear-gradient(135deg, #007bff, #0056b3)" : "rgba(255,255,255,0.1)",
          color: "white",
          cursor: "pointer"
        }
      },
      "\u{1F4DD} Todos"
    ), /* @__PURE__ */ __CLJ_createElement(
      "button",
      {
        className: "clj-btn tab-btn",
        onclick: (e) => {
          handleRipple(e);
          setActiveTab("users");
        },
        style: {
          padding: "10px 20px",
          borderRadius: "8px",
          border: "none",
          background: activeTab === "users" ? "linear-gradient(135deg, #007bff, #0056b3)" : "rgba(255,255,255,0.1)",
          color: "white",
          cursor: "pointer"
        }
      },
      "\u{1F464} Users"
    ), /* @__PURE__ */ __CLJ_createElement(
      "button",
      {
        className: "clj-btn tab-btn",
        onclick: (e) => {
          handleRipple(e);
          setActiveTab("components");
        },
        style: {
          padding: "10px 20px",
          borderRadius: "8px",
          border: "none",
          background: activeTab === "components" ? "linear-gradient(135deg, #007bff, #0056b3)" : "rgba(255,255,255,0.1)",
          color: "white",
          cursor: "pointer"
        }
      },
      "\u{1F9E9} Components"
    ), /* @__PURE__ */ __CLJ_createElement("span", { ref: tooltipTargetRef, style: { cursor: "help", fontSize: "20px" } }, "\u{1F4A1}"), /* @__PURE__ */ __CLJ_createElement(
      "button",
      {
        className: "clj-btn clj-pulseGlow",
        onclick: (e) => {
          handleRipple(e, "rgba(255,255,255,.5)");
          openSettingsModal();
        },
        style: {
          padding: "10px 20px",
          borderRadius: "8px",
          border: "none",
          background: "linear-gradient(135deg, #aa44ff, #ff44aa)",
          color: "white",
          cursor: "pointer",
          fontWeight: "bold"
        }
      },
      "\u2699\uFE0F Settings"
    ))), /* @__PURE__ */ __CLJ_createElement("div", { style: { maxWidth: "1400px", margin: "0 auto", padding: "40px 20px", position: "relative", zIndex: 1 } }, /* @__PURE__ */ __CLJ_createElement("div", { style: { display: activeTab === "counters" ? "block" : "none" } }, /* @__PURE__ */ __CLJ_createElement("h2", { className: "clj-rainbowText", style: { textAlign: "center", margin: "0 0 10px", fontSize: "28px" } }, "\u{1F3AE} 20 Interactive Counters"), /* @__PURE__ */ __CLJ_createElement("p", { style: { textAlign: "center", margin: "0 0 30px", opacity: 0.6 } }, "Master Counter: ", count, " | Total: ", counterStates.reduce((sum, cs) => sum + cs.count, 0)), /* @__PURE__ */ __CLJ_createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "15px" } }, counterStates.map((cs, i) => /* @__PURE__ */ __CLJ_createElement(Counter, { key: i, count: cs.count, inc: cs.inc, dec: cs.dec, label: "Counter ".concat(i + 1), color: colors[i] })))), /* @__PURE__ */ __CLJ_createElement("div", { style: { display: activeTab === "todos" ? "block" : "none" } }, /* @__PURE__ */ __CLJ_createElement("h2", { className: "clj-rainbowText", style: { textAlign: "center", margin: "0 0 30px", fontSize: "28px" } }, "\u{1F4DD} Todo List (", todos.length, " items)"), /* @__PURE__ */ __CLJ_createElement("div", { className: "clj-card clj-glass", style: { maxWidth: "600px", margin: "0 auto", padding: "30px" } }, /* @__PURE__ */ __CLJ_createElement("div", { style: { display: "flex", gap: "10px", marginBottom: "20px" } }, /* @__PURE__ */ __CLJ_createElement(
      "input",
      {
        value: newTodo,
        oninput: (e) => setNewTodo(e.target.value),
        onkeydown: (e) => e.key === "Enter" && addTodo(),
        placeholder: "\u2728 Add a new task...",
        style: { flex: 1, padding: "15px 20px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(0,0,0,0.3)", color: "#fff", fontSize: "16px" }
      }
    ), /* @__PURE__ */ __CLJ_createElement(
      "button",
      {
        className: "clj-btn action-btn",
        onclick: (e) => {
          handleRipple(e, "rgba(40,167,69,.4)");
          addTodo();
        },
        style: { padding: "15px 30px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #28a745, #1e7e34)", color: "white", cursor: "pointer", fontWeight: "bold", fontSize: "16px" }
      },
      "\u2795 Add"
    )), /* @__PURE__ */ __CLJ_createElement("div", { style: { display: "flex", flexDirection: "column", gap: "10px" } }, todos.length === 0 && /* @__PURE__ */ __CLJ_createElement("p", { style: { textAlign: "center", opacity: 0.5 } }, "No tasks yet. Add one! \u{1F389}"), todos.map((t) => /* @__PURE__ */ __CLJ_createElement("div", { key: t.id, style: { display: "flex", alignItems: "center", gap: "10px", padding: "12px 15px", background: "rgba(255,255,255,0.05)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)" } }, /* @__PURE__ */ __CLJ_createElement("input", { type: "checkbox", checked: t.done, onchange: () => toggleTodo(t.id), style: { width: "20px", height: "20px", cursor: "pointer" } }), /* @__PURE__ */ __CLJ_createElement("span", { style: { flex: 1, fontSize: "16px", textDecoration: t.done ? "line-through" : "none", opacity: t.done ? 0.5 : 1 } }, t.text), /* @__PURE__ */ __CLJ_createElement(
      "button",
      {
        className: "clj-btn danger-btn",
        onclick: (e) => {
          handleRipple(e, "rgba(220,53,69,.4)");
          deleteTodo(t.id);
        },
        style: { padding: "8px 12px", borderRadius: "6px", border: "none", background: "rgba(220,53,69,0.3)", color: "#dc3545", cursor: "pointer", fontSize: "16px" }
      },
      "\u{1F5D1}\uFE0F"
    )))))), /* @__PURE__ */ __CLJ_createElement("div", { style: { display: activeTab === "users" ? "block" : "none" } }, /* @__PURE__ */ __CLJ_createElement("h2", { className: "clj-rainbowText", style: { textAlign: "center", margin: "0 0 30px", fontSize: "28px" } }, "\u{1F464} User Explorer"), /* @__PURE__ */ __CLJ_createElement("div", { className: "clj-card clj-glass", style: { maxWidth: "500px", margin: "0 auto", padding: "30px", textAlign: "center" } }, loading ? /* @__PURE__ */ __CLJ_createElement("div", null, /* @__PURE__ */ __CLJ_createElement("div", { style: { width: "50px", height: "50px", borderRadius: "50%", border: "4px solid rgba(255,255,255,0.1)", borderTop: "4px solid #00aaff", animation: "spin 1s linear infinite", margin: "0 auto 20px" } }), /* @__PURE__ */ __CLJ_createElement("p", { style: { opacity: 0.7 } }, "Loading user...")) : user ? /* @__PURE__ */ __CLJ_createElement("div", null, /* @__PURE__ */ __CLJ_createElement("div", { style: { width: "100px", height: "100px", borderRadius: "50%", background: "linear-gradient(135deg, #00aaff, #aa44ff)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "40px" } }, user.name.charAt(0)), /* @__PURE__ */ __CLJ_createElement("h2", { style: { margin: "10px 0" } }, user.name), /* @__PURE__ */ __CLJ_createElement("p", { style: { opacity: 0.7, margin: "5px 0" } }, "\u{1F4E7} ", user.email), /* @__PURE__ */ __CLJ_createElement("p", { style: { opacity: 0.7, margin: "5px 0" } }, "\u{1F4DE} ", user.phone), /* @__PURE__ */ __CLJ_createElement("p", { style: { opacity: 0.7, margin: "5px 0" } }, "\u{1F310} ", user.website), /* @__PURE__ */ __CLJ_createElement("p", { style: { opacity: 0.5, margin: "15px 0 0", fontSize: "14px" } }, (_a = user.company) == null ? void 0 : _a.name, " - ", (_b = user.company) == null ? void 0 : _b.catchPhrase)) : /* @__PURE__ */ __CLJ_createElement("p", { style: { opacity: 0.5 } }, "No user data"), /* @__PURE__ */ __CLJ_createElement("div", { style: { display: "flex", gap: "10px", justifyContent: "center", marginTop: "20px" } }, /* @__PURE__ */ __CLJ_createElement(
      "button",
      {
        className: "clj-btn",
        onclick: (e) => {
          handleRipple(e);
          setUserId(Math.max(1, userId - 1));
        },
        style: { padding: "12px 30px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #6c757d, #495057)", color: "white", cursor: "pointer", fontWeight: "bold", fontSize: "16px" }
      },
      "\u25C0 Prev"
    ), /* @__PURE__ */ __CLJ_createElement("span", { style: { padding: "12px 20px", borderRadius: "10px", background: "rgba(255,255,255,0.1)", fontSize: "16px", fontWeight: "bold" } }, "#", userId), /* @__PURE__ */ __CLJ_createElement(
      "button",
      {
        className: "clj-btn",
        onclick: (e) => {
          handleRipple(e, "rgba(0,123,255,.4)");
          setUserId(userId + 1);
        },
        style: { padding: "12px 30px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #007bff, #0056b3)", color: "white", cursor: "pointer", fontWeight: "bold", fontSize: "16px" }
      },
      "Next \u25B6"
    )))), /* @__PURE__ */ __CLJ_createElement("div", { style: { display: activeTab === "components" ? "block" : "none" } }, /* @__PURE__ */ __CLJ_createElement("h2", { className: "clj-rainbowText", style: { textAlign: "center", margin: "0 0 30px", fontSize: "28px" } }, "\u{1F9E9} CLJ UI Component Library"), /* @__PURE__ */ __CLJ_createElement("p", { style: { textAlign: "center", margin: "0 0 30px", opacity: 0.6 } }, "All 10 components included: Modal, Slider, Tabs, Tooltip, Toast, Accordion, Carousel, ProgressBar, Switch, Rating"), /* @__PURE__ */ __CLJ_createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "25px" } }, /* @__PURE__ */ __CLJ_createElement("div", { className: "clj-card clj-frosted", style: { padding: "25px" } }, /* @__PURE__ */ __CLJ_createElement("h3", { style: { margin: "0 0 15px" } }, "\u{1F39A}\uFE0F Slider"), /* @__PURE__ */ __CLJ_createElement("p", { style: { opacity: 0.7, margin: "0 0 10px" } }, "Value: ", sliderValue), /* @__PURE__ */ __CLJ_createElement("div", { ref: sliderContainerRef })), /* @__PURE__ */ __CLJ_createElement("div", { className: "clj-card clj-frosted", style: { padding: "25px" } }, /* @__PURE__ */ __CLJ_createElement("h3", { style: { margin: "0 0 15px" } }, "\u{1F518} Switch Toggle"), /* @__PURE__ */ __CLJ_createElement("p", { style: { opacity: 0.7, margin: "0 0 10px" } }, "Status: ", switchEnabled ? "\u{1F7E2} Enabled" : "\u{1F534} Disabled"), /* @__PURE__ */ __CLJ_createElement("div", { ref: switchContainerRef })), /* @__PURE__ */ __CLJ_createElement("div", { className: "clj-card clj-frosted", style: { padding: "25px" } }, /* @__PURE__ */ __CLJ_createElement("h3", { style: { margin: "0 0 15px" } }, "\u2B50 Star Rating"), /* @__PURE__ */ __CLJ_createElement("p", { style: { opacity: 0.7, margin: "0 0 10px" } }, "Your rating: ", ratingValue, "/5"), /* @__PURE__ */ __CLJ_createElement("div", { ref: ratingContainerRef })), /* @__PURE__ */ __CLJ_createElement("div", { className: "clj-card clj-frosted", style: { padding: "25px" } }, /* @__PURE__ */ __CLJ_createElement("h3", { style: { margin: "0 0 15px" } }, "\u{1F4CA} Progress Bar"), /* @__PURE__ */ __CLJ_createElement("p", { style: { opacity: 0.7, margin: "0 0 10px" } }, "Progress: ", progressValue, "%"), /* @__PURE__ */ __CLJ_createElement("div", { ref: progressContainerRef }), /* @__PURE__ */ __CLJ_createElement("div", { style: { display: "flex", gap: "10px", marginTop: "15px" } }, /* @__PURE__ */ __CLJ_createElement(
      "button",
      {
        className: "clj-btn",
        onclick: () => {
          setProgressValue(Math.max(0, progressValue - 10));
        },
        style: { padding: "8px 16px", borderRadius: "6px", border: "none", background: "#dc3545", color: "white", cursor: "pointer" }
      },
      "-10"
    ), /* @__PURE__ */ __CLJ_createElement(
      "button",
      {
        className: "clj-btn",
        onclick: () => {
          setProgressValue(Math.min(100, progressValue + 10));
        },
        style: { padding: "8px 16px", borderRadius: "6px", border: "none", background: "#28a745", color: "white", cursor: "pointer" }
      },
      "+10"
    ))), /* @__PURE__ */ __CLJ_createElement("div", { className: "clj-card clj-frosted", style: { padding: "25px" } }, /* @__PURE__ */ __CLJ_createElement("h3", { style: { margin: "0 0 15px" } }, "\u{1F4CB} Accordion"), /* @__PURE__ */ __CLJ_createElement("div", { ref: accordionContainerRef })), /* @__PURE__ */ __CLJ_createElement("div", { className: "clj-card clj-frosted", style: { padding: "25px" } }, /* @__PURE__ */ __CLJ_createElement("h3", { style: { margin: "0 0 15px" } }, "\u{1F3A0} Image Carousel"), /* @__PURE__ */ __CLJ_createElement("div", { ref: carouselContainerRef, style: { height: "220px", borderRadius: "12px", overflow: "hidden" } }))), /* @__PURE__ */ __CLJ_createElement("div", { className: "clj-card clj-frosted", style: { padding: "25px", marginTop: "25px", textAlign: "center" } }, /* @__PURE__ */ __CLJ_createElement("h3", { style: { margin: "0 0 15px" } }, "\u{1F514} Toast Notifications"), /* @__PURE__ */ __CLJ_createElement("div", { style: { display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" } }, /* @__PURE__ */ __CLJ_createElement(
      "button",
      {
        className: "clj-btn clj-neonGlow",
        onclick: () => {
          if (typeof CLJ !== "undefined")
            CLJ.Toast.show("\u2705 Success! Action completed.", 3e3);
        },
        style: { padding: "12px 24px", borderRadius: "8px", border: "none", background: "#28a745", color: "white", cursor: "pointer" }
      },
      "\u2705 Success Toast"
    ), /* @__PURE__ */ __CLJ_createElement(
      "button",
      {
        className: "clj-btn clj-neonGlow",
        onclick: () => {
          if (typeof CLJ !== "undefined")
            CLJ.Toast.show("\u274C Error! Something went wrong.", 4e3);
        },
        style: { padding: "12px 24px", borderRadius: "8px", border: "none", background: "#dc3545", color: "white", cursor: "pointer" }
      },
      "\u274C Error Toast"
    ), /* @__PURE__ */ __CLJ_createElement(
      "button",
      {
        className: "clj-btn clj-neonGlow",
        onclick: () => {
          if (typeof CLJ !== "undefined")
            CLJ.Toast.show("\u2139\uFE0F Here is some information for you.", 2500);
        },
        style: { padding: "12px 24px", borderRadius: "8px", border: "none", background: "#007bff", color: "white", cursor: "pointer" }
      },
      "\u2139\uFE0F Info Toast"
    ), /* @__PURE__ */ __CLJ_createElement(
      "button",
      {
        className: "clj-btn clj-neonGlow",
        onclick: () => {
          if (typeof CLJ !== "undefined")
            CLJ.Toast.show("\u26A0\uFE0F Warning! Check your settings.", 3500);
        },
        style: { padding: "12px 24px", borderRadius: "8px", border: "none", background: "#ffc107", color: "#333", cursor: "pointer" }
      },
      "\u26A0\uFE0F Warning Toast"
    ))), /* @__PURE__ */ __CLJ_createElement("div", { className: "clj-card clj-frosted", style: { padding: "25px", marginTop: "25px", textAlign: "center" } }, /* @__PURE__ */ __CLJ_createElement("h3", { style: { margin: "0 0 15px" } }, "\u{1FA9F} Modal Dialog"), /* @__PURE__ */ __CLJ_createElement("button", { className: "clj-btn clj-pulseGlow", onclick: () => {
      if (typeof CLJ !== "undefined") {
        new CLJ.Modal({
          title: "\u{1F680} Welcome to CLJ POWER Mode!",
          content: '<div style="color:#ddd;"><p>This modal is rendered by the <strong>CLJ.Modal</strong> component.</p><p>\u2022 Zero dependencies</p><p>\u2022 Backdrop blur</p><p>\u2022 Click-outside-to-close</p><p>\u2022 Smooth animations</p><hr style="border-color:#333;margin:15px 0;"><p style="font-size:12px;opacity:0.6;">Built entirely in power.js</p></div>',
          onOpen: () => console.log("Modal opened!"),
          onClose: () => console.log("Modal closed!")
        }).open();
      }
    }, style: { padding: "15px 30px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #aa44ff, #ff44aa)", color: "white", cursor: "pointer", fontWeight: "bold", fontSize: "16px" } }, "\u{1FA9F} Open Modal")))), /* @__PURE__ */ __CLJ_createElement("footer", { className: "clj-glass", style: {
      textAlign: "center",
      padding: "30px",
      borderTop: "1px solid rgba(255,255,255,0.1)",
      marginTop: "40px",
      position: "relative",
      zIndex: 1
    } }, /* @__PURE__ */ __CLJ_createElement("p", { style: { margin: 0, opacity: 0.7 } }, "\u26A1 CLJ Power Engine v2.0 \u2022 80 Animations \u2022 10 UI Components \u2022 No React \u2022 No Dependencies"), /* @__PURE__ */ __CLJ_createElement("p", { style: { margin: "5px 0 0", opacity: 0.5, fontSize: "14px" } }, "Device: ", ((_c = window.__CLJ_device) == null ? void 0 : _c.isMobile) ? "\u{1F4F1} Mobile" : ((_d = window.__CLJ_device) == null ? void 0 : _d.isTablet) ? "\u{1F4CB} Tablet" : "\u{1F5A5}\uFE0F Desktop", " \u2022", (_e = window.__CLJ_device) == null ? void 0 : _e.width, "x", (_f = window.__CLJ_device) == null ? void 0 : _f.height, " \u2022 Animations: particleNebula + starfield \u2022 Switch: ", switchEnabled ? "ON" : "OFF", " \u2022 Rating: ", ratingValue, "/5"), /* @__PURE__ */ __CLJ_createElement("p", { style: { margin: "5px 0 0", opacity: 0.4, fontSize: "12px" } }, "Components active: Modal, Slider, Tabs, Tooltip, Toast, Accordion, Carousel, ProgressBar, Switch, Rating")), /* @__PURE__ */ __CLJ_createElement("style", null, "\n        @keyframes spin {\n          0% { transform: rotate(0deg); }\n          100% { transform: rotate(360deg); }\n        }\n        .card:hover {\n          transform: translateY(-5px);\n          box-shadow: 0 10px 30px rgba(0,0,0,0.3);\n        }\n      "));
  }
  __CLJ_mount(App, "root");
})();
// CLJ Power Complete
//# sourceMappingURL=bundle.js.map
