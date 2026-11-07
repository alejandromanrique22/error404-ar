document.addEventListener('DOMContentLoaded', () => {
  const $ = id => document.getElementById(id);

  // 1. Lógica de Relojes Mundiales
  function updateClocks() {
    const now = new Date();
    const timezones = [
      ['ba', 'America/Argentina/Buenos_Aires'],
      ['uy', 'America/Montevideo'],
      ['cl', 'America/Santiago'],
      ['py', 'America/Asuncion'],
      ['mx', 'America/Mexico_City'],
      ['es', 'Europe/Madrid']
    ];

    timezones.forEach(([id, tz]) => {
      const el = $(id);
      if (el) {
        el.textContent = new Intl.DateTimeFormat('es-AR', {
          timeZone: tz,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hourCycle: 'h23'
        }).format(now);
      }
    });
  }

  updateClocks();
  setInterval(updateClocks, 1000);

  // Utilidades compartidas por los extras
  const mk = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
  const rnd = n => Math.floor(Math.random() * n);
  const ls = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };
  const ss = { get: k => { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) {} } };
  const copy = async txt => {
    try { await navigator.clipboard.writeText(txt); }
    catch (e) { const t = document.createElement('textarea'); t.value = txt; t.style.cssText = 'position:fixed;opacity:0'; document.body.append(t); t.select(); try { document.execCommand('copy'); } catch (_) {} t.remove(); }
    if (window.e404toast) e404toast('📋 ¡Copiado!');
  };

  // 3. Pantalla «Conectando…» (una vez por sesión, siempre salteable)
  (function connecting() {
    if (ss.get('e404_conn') || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    ss.set('e404_conn', '1');
    const ov = mk('div', 'overlay'), box = mk('div', 'dialogbox'), bar = mk('div', 'bar'), body = mk('div', 'dbody');
    ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', 'Conectando');
    bar.append(mk('span', '', '📞 Conectando a Error 404'), mk('span', '', '✦'));
    const step = mk('p', '', 'Marcando…'), xp = mk('div', 'xpbar'), fill = mk('i'), skip = mk('button', 'download', 'Saltar »');
    skip.type = 'button'; xp.append(fill);
    const btns = mk('div', 'dbtns'); btns.append(skip);
    body.append(step, xp, btns); box.append(bar, body); ov.append(box); document.body.append(ov);
    const steps = [[0, 'Marcando…', 8], [900, 'Verificando nombre de usuario y contraseña…', 35], [1900, 'Registrando su equipo en la red…', 70], [2900, 'Conectado a 48,0 Kbps', 100]], timers = [];
    const close = () => { timers.forEach(clearTimeout); document.removeEventListener('keydown', esc); ov.remove(); };
    const esc = e => { if (e.key === 'Escape') close(); };
    steps.forEach(([t, txt, p]) => timers.push(setTimeout(() => { step.textContent = txt; fill.style.width = p + '%'; }, t + 30)));
    timers.push(setTimeout(close, 3700));
    skip.onclick = close; document.addEventListener('keydown', esc); skip.focus();
  })();

  // 4. Contador de visitas (simulado: crece con la fecha y con tus visitas) + visitantes en línea
  const cd = $('counter');
  if (cd) {
    const days = Math.max(0, Math.floor((Date.now() - Date.UTC(2026, 0, 1)) / 864e5));
    let v = +(ls.get('e404_visits') || 0);
    if (!ss.get('e404_counted')) { v++; ls.set('e404_visits', v); ss.set('e404_counted', '1'); }
    const n = 4511 + days * 37 + v;
    cd.replaceChildren(...String(n).padStart(6, '0').split('').map(d => mk('span', 'digit', d)));
    cd.setAttribute('aria-label', 'Visita número ' + n);
  }
  const on = $('online');
  if (on) { let o = 6 + rnd(9); on.textContent = o; setInterval(() => { o = Math.min(24, Math.max(3, o + rnd(3) - 1)); on.textContent = o; }, 4000); }

  // 5. Zona MSN: generador de nicks y estados
  const nName = $('nickName'), nList = $('nickList'), nSt = $('nickStatus'), nMsg = $('nickMsg'), nPrev = $('nickPreview');
  if (nName && nList && nSt && nMsg && nPrev) {
    const STATES = [['Conectado', '#8dffb2'], ['Ocupado', '#ff5d5d'], ['Ausente', '#ffc94d'], ['Vuelvo enseguida', '#ffc94d'], ['Al teléfono', '#ff5d5d'], ['Salí a comer', '#ffc94d'], ['Apareces como desconectado', '#8a97ad']];
    const MSGS = ['(volvé en 5 min)', 'estudiando (no molestar)', 'c/ la fla', 'spoiler: no estoy', '♫ escuchando algo ♫', 'me quedé sin pulsos'];
    STATES.forEach(([s], i) => nSt.append(new Option(s, i)));
    MSGS.forEach((s, i) => nMsg.append(new Option(s, i)));
    const leet = s => s.replace(/[aá]/gi, '@').replace(/[eé]/gi, '3').replace(/[ií]/gi, '!').replace(/[oó]/gi, '0');
    const alt = s => [...s].map((c, i) => i % 2 ? c.toUpperCase() : c.toLowerCase()).join('');
    const nicks = n => [`*¨¨¨¨* ${n} *¨¨¨¨*`, `★☆ ${n} ☆★`, leet(n), alt(n), `${n} (L) ando de pasada`, `.:: ${n} ::.`, `♫ ${n} ♫`];
    const draw = () => {
      const n = nName.value.trim() || 'Martín', list = nicks(n), [sn, col] = STATES[nSt.value];
      nList.replaceChildren(...list.map(t => { const li = mk('li'), sp = mk('span', '', t), b = mk('button', 'download', 'Copiar'); b.type = 'button'; b.onclick = () => copy(t); li.append(sp, b); return li; }));
      const dot = mk('span', 'dot'); dot.style.background = col;
      nPrev.replaceChildren(dot, document.createTextNode(list[1] + ' '), mk('small', '', `(${sn}) — ${MSGS[nMsg.value]}`));
    };
    [nName, nSt, nMsg].forEach(e => e.addEventListener('input', draw)); draw();
  }

  // 6. Conversor de tiempo de descarga
  const dSz = $('dlSize'), dSp = $('dlSpeed'), dOut = $('dlOut');
  if (dSz && dSp && dOut) {
    const fmt = s => {
      if (s < 1) return 'menos de 1 s'; s = Math.round(s);
      if (s < 60) return s + ' s';
      const m = Math.floor(s / 60); if (m < 60) return m + ' min' + (s % 60 ? ' ' + (s % 60) + ' s' : '');
      const h = Math.floor(m / 60); if (h < 24) return h + ' h' + (m % 60 ? ' ' + (m % 60) + ' min' : '');
      const d = Math.floor(h / 24); return d + (d > 1 ? ' días' : ' día') + (h % 24 ? ' ' + (h % 24) + ' h' : '');
    };
    const calc = () => {
      const mb = +dSz.value, kbs = +dSp.value;
      dOut.replaceChildren(mk('strong', '', fmt(mb * 1024 / kbs)), document.createTextNode(' en esa conexión.'), mk('br'), document.createTextNode('Hoy, con una fibra de 100 Mb: ' + fmt(mb / 12) + '.'));
    };
    dSz.addEventListener('change', calc); dSp.addEventListener('change', calc); calc();
  }

  // 7. Frases de la época
  const qEl = $('quote'), qBtn = $('quoteBtn');
  if (qEl && qBtn) {
    const Q = ['«Salí de la PC que me tengo que conectar.»', '«No cortes que me estoy bajando un tema.»', '«Me quedé sin pulsos.»', '«Apagá el módem que se calienta.»', '«¿Quién está en el teléfono?»', '«¿Cuánto pesa?»', '«Agregame al msn.»', '«Pasale el antivirus.»', '«Reiniciá la compu y probá de nuevo.»', '«El eMule se quedó pegado.»'];
    let last = -1; const next = () => { let i; do i = rnd(Q.length); while (i === last); last = i; qEl.textContent = Q[i]; };
    qBtn.onclick = next; next();
  }

  // 8. Línea de tiempo 2000–2009
  const tlTabs = $('tlTabs'), tlBox = $('tlBox');
  if (tlTabs && tlBox) {
    const T = { 2000: 'Pico y caída de la burbuja puntocom. Portales como El Sitio y Terra en auge; Flash y los intros de moda.', 2001: 'Sale Windows XP (octubre), IE6, nace Wikipedia, Kazaa. La crisis argentina estalla a fin de año.', 2002: 'Llega eMule, Flash MX, la devaluación y las primeras páginas personales masivas.', 2003: 'Skype, MySpace, Safari y Winamp 5. El ciber se consolida.', 2004: 'Gmail por invitación, Firefox 1.0, Facebook (en EE. UU.) y nace Taringa. El fotolog en auge.', 2005: 'YouTube, Messenger 7 con winks, Google Maps. Los blogs explotan.', 2006: 'Twitter, IE7, Windows Live Messenger 8. Hi5 y MySpace a pleno; llegan los floggers.', 2007: 'iPhone, Windows Vista y Messenger 8.5. Facebook empieza a expandirse.', 2008: 'Chrome, Android y Facebook en español. El ADSL se extiende y el ciber empieza a declinar.', 2009: 'Cuevana, Windows 7 (octubre), cierra GeoCities (octubre) y sale Messenger 2009. Asoman los smartphones.' };
    const show = (y, b) => { tlTabs.querySelectorAll('button').forEach(x => x.classList.toggle('active', x === b)); tlBox.replaceChildren(mk('b', '', y), mk('br'), document.createTextNode(T[y])); };
    Object.keys(T).forEach((y, i) => { const b = mk('button', '', y); b.type = 'button'; b.onclick = () => show(y, b); tlTabs.append(b); if (i === 5) show(y, b); });
  }

  // 2. Lógica de la Radio Online
  const radioAudio = $('radioAudio');
  const radioSelect = $('radioSelect');
  const radioPlay = $('radioPlay');
  const radioStop = $('radioStop');
  const radioTitle = $('radioTitle');
  const radioStatus = $('radioStatus');
  const radioDisc = $('radioDisc');

  if (!radioAudio || !radioSelect || !radioPlay || !radioStop) return;

  radioPlay.addEventListener('click', () => {
    const opt = radioSelect.options[radioSelect.selectedIndex];
    const streamUrl = opt.value;

    if (radioTitle) radioTitle.textContent = opt.dataset.name || opt.textContent;
    if (radioStatus) radioStatus.textContent = 'Conectando con la transmisión…';

    radioAudio.src = streamUrl;
    radioAudio.load();

    const playPromise = radioAudio.play();

    if (playPromise !== undefined) {
      playPromise.then(() => {
        if (radioStatus) radioStatus.textContent = 'En directo · ' + (opt.dataset.name || opt.textContent);
        if (radioDisc) radioDisc.style.animation = 'spin 6s linear infinite';
        radioPlay.classList.add('disabled');
        radioStop.classList.remove('disabled');
      }).catch(error => {
        console.error('Error de reproducción:', error);
        if (radioStatus) radioStatus.textContent = 'Error al conectar. Probá de nuevo o elegí otra radio.';
        if (radioDisc) radioDisc.style.animation = 'none';
        radioPlay.classList.remove('disabled');
        radioStop.classList.add('disabled');
      });
    }
  });

  radioStop.addEventListener('click', () => {
    radioAudio.pause();
    radioAudio.removeAttribute('src');
    radioAudio.load();
    if (radioStatus) radioStatus.textContent = 'Radio detenida';
    if (radioDisc) radioDisc.style.animation = 'none';
    radioPlay.classList.remove('disabled');
    radioStop.classList.add('disabled');
  });

  radioSelect.addEventListener('change', () => {
    if (!radioAudio.paused) {
      radioPlay.click();
    }
  });
});