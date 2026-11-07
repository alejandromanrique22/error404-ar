/* Minijuegos interactivos: Ta-Te-Ti, Adiviná el número, Más alto o más bajo, Piedra papel o tijera, Memoria, Snake */
(() => {
  const stage = document.getElementById('stage'), tabs = document.getElementById('arcadeTabs');
  const rnd = n => Math.floor(Math.random() * n);
  const store = { get: k => { try { return +localStorage.getItem(k) || 0; } catch (e) { return 0; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };
  const q = (el, s) => el.querySelector(s);

  /* ---------- Ta-Te-Ti ---------- */
  const L = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const win = b => { for (const [a, c, d] of L) if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a]; return b.includes('') ? null : 'T'; };
  const mm = (b, p) => { const w = win(b); if (w) return w === 'O' ? 1 : w === 'X' ? -1 : 0; let best = p === 'O' ? -2 : 2; for (let i = 0; i < 9; i++) if (!b[i]) { b[i] = p; const s = mm(b, p === 'O' ? 'X' : 'O'); b[i] = ''; best = p === 'O' ? Math.max(best, s) : Math.min(best, s); } return best; };
  function ttt(el) {
    el.innerHTML = '<h3>Ta-Te-Ti</h3><p class="hint">Vos jugás con ❌</p><select class="field mode" aria-label="Modo"><option value="easy">CPU fácil</option><option value="hard" selected>CPU imposible</option><option value="two">2 jugadores</option></select><div class="ttt"></div><div class="msg" aria-live="polite"></div><div class="score"></div><button class="download again" type="button">Nueva partida</button>';
    const grid = q(el, '.ttt'), msg = q(el, '.msg'), score = q(el, '.score'), sel = q(el, '.mode');
    let b, turn, over, sc = { X: 0, O: 0, T: 0 };
    const draw = () => { grid.innerHTML = ''; b.forEach((v, i) => { const c = document.createElement('button'); c.type = 'button'; c.textContent = v === 'X' ? '❌' : v === 'O' ? '⭕' : ''; c.disabled = over || !!v; c.setAttribute('aria-label', 'Casilla ' + (i + 1)); c.onclick = () => play(i); grid.append(c); }); score.textContent = `Vos: ${sc.X} · ${sel.value === 'two' ? 'Jugador 2' : 'CPU'}: ${sc.O} · Empates: ${sc.T}`; };
    const end = () => { const w = win(b); if (!w) return false; over = true; sc[w]++; msg.textContent = w === 'T' ? '¡Empate!' : w === 'X' ? '¡Ganó ❌!' : '¡Ganó ⭕!'; return true; };
    const cpu = () => { const e = [...b.keys()].filter(i => !b[i]); let m; if (sel.value === 'easy') m = e[rnd(e.length)]; else { let bs = -2; e.forEach(i => { b[i] = 'O'; const s = mm(b, 'X'); b[i] = ''; if (s > bs || (s === bs && Math.random() < .3)) { bs = s; m = i; } }); } b[m] = 'O'; if (!end()) { turn = 'X'; msg.textContent = 'Tu turno'; } };
    const play = i => { if (over || b[i]) return; b[i] = turn; if (!end()) { turn = turn === 'X' ? 'O' : 'X'; if (sel.value !== 'two' && turn === 'O') cpu(); else msg.textContent = 'Turno de ' + (turn === 'X' ? '❌' : '⭕'); } draw(); };
    const reset = () => { b = Array(9).fill(''); turn = 'X'; over = false; msg.textContent = 'Tu turno'; draw(); };
    q(el, '.again').onclick = reset; sel.onchange = () => { sc = { X: 0, O: 0, T: 0 }; reset(); }; reset();
  }

  /* ---------- Adiviná el número ---------- */
  function guess(el) {
    el.innerHTML = '<h3>Adiviná el número</h3><p class="hint">Pensé un número del 1 al 100. Tenés 7 intentos.</p><input class="field" type="number" min="1" max="100" inputmode="numeric" aria-label="Tu número"><button class="download go" type="button">Probar</button><div class="msg" aria-live="polite"></div><div class="score"></div><button class="opt pagebtn again" type="button">Nueva partida</button>';
    const inp = q(el, 'input'), msg = q(el, '.msg'), info = q(el, '.score'); let n, t, done;
    const reset = () => { n = 1 + rnd(100); t = 7; done = false; inp.value = ''; inp.disabled = false; msg.textContent = ''; info.textContent = 'Intentos restantes: 7'; inp.focus(); };
    const go = () => { if (done) return; const v = +inp.value; if (!Number.isInteger(v) || v < 1 || v > 100) { msg.textContent = 'Ingresá un número entre 1 y 100.'; return; } t--; if (v === n) { msg.textContent = `🎉 ¡Era ${n}! Lo lograste en ${7 - t} intento(s).`; done = true; } else if (!t) { msg.textContent = `Perdiste. Era el ${n}.`; done = true; } else msg.textContent = v < n ? '⬆ Más alto' : '⬇ Más bajo'; info.textContent = 'Intentos restantes: ' + t; inp.value = ''; if (done) inp.disabled = true; };
    q(el, '.go').onclick = go; inp.onkeydown = e => { if (e.key === 'Enter') go(); }; q(el, '.again').onclick = reset; reset();
  }

  /* ---------- Más alto o más bajo ---------- */
  function hl(el) {
    el.innerHTML = '<h3>Más alto o más bajo</h3><p class="hint">¿La próxima carta será mayor o menor? (A=1, J=11, Q=12, K=13)</p><div class="bigcard">?</div><div><button class="download up" type="button">⬆ Más alto</button><button class="download dn" type="button">⬇ Más bajo</button></div><div class="msg" aria-live="polite"></div><div class="score"></div>';
    const cardEl = q(el, '.bigcard'), msg = q(el, '.msg'), info = q(el, '.score'); let cur, streak = 0, best = store.get('hl');
    const c = () => 1 + rnd(13), nm = n => ({ 1: 'A', 11: 'J', 12: 'Q', 13: 'K' }[n] || n);
    const upd = () => { cardEl.textContent = nm(cur); info.textContent = `Racha: ${streak} · Récord: ${best}`; };
    const pick = up => { const nx = c(); if (nx === cur) msg.textContent = `Salió otro ${nm(nx)}: empate, seguís.`; else if ((nx > cur) === up) { streak++; msg.textContent = `¡Acertaste! Salió ${nm(nx)}.`; if (streak > best) { best = streak; store.set('hl', best); } } else { msg.textContent = `Fallaste. Salió ${nm(nx)}. Racha reiniciada.`; streak = 0; } cur = nx; upd(); };
    q(el, '.up').onclick = () => pick(true); q(el, '.dn').onclick = () => pick(false); cur = c(); upd();
  }

  /* ---------- Piedra, papel o tijera ---------- */
  function rps(el) {
    const O = ['🪨 Piedra', '📄 Papel', '✂️ Tijera'];
    el.innerHTML = '<h3>Piedra, papel o tijera</h3><p class="hint">Elegí tu jugada.</p><div>' + O.map((o, i) => `<button class="download" data-i="${i}" type="button">${o}</button>`).join('') + '</div><div class="msg" aria-live="polite"></div><div class="score"></div>';
    let s = [0, 0, 0]; const msg = q(el, '.msg'), info = q(el, '.score');
    el.querySelectorAll('[data-i]').forEach(b => b.onclick = () => { const p = +b.dataset.i, c = rnd(3), r = (p - c + 3) % 3; s[r === 0 ? 1 : r === 1 ? 0 : 2]++; msg.textContent = `Vos: ${O[p]} · CPU: ${O[c]} → ${r === 0 ? 'Empate' : r === 1 ? '¡Ganaste!' : 'Perdiste'}`; info.textContent = `Ganadas: ${s[0]} · Empates: ${s[1]} · Perdidas: ${s[2]}`; });
  }

  /* ---------- Memoria ---------- */
  function memory(el) {
    el.innerHTML = '<h3>Memoria</h3><p class="hint">Encontrá los 8 pares con la menor cantidad de movimientos.</p><div class="mem"></div><div class="msg" aria-live="polite"></div><div class="score"></div><button class="download again" type="button">Reiniciar</button>';
    const grid = q(el, '.mem'), msg = q(el, '.msg'), info = q(el, '.score'); let first, lock, moves, found;
    const reset = () => { const e = ['🚗','🎮','💾','🎧','⚔️','🌴','💥','📻']; const d = [...e, ...e].sort(() => Math.random() - .5); grid.innerHTML = ''; first = null; lock = false; moves = 0; found = 0; msg.textContent = ''; info.textContent = 'Movimientos: 0 · Récord: ' + (store.get('mem') || '—');
      d.forEach(v => { const b = document.createElement('button'); b.type = 'button'; b.textContent = '❔'; b.setAttribute('aria-label', 'Carta'); b.onclick = () => { if (lock || b.classList.contains('up') || b.classList.contains('done')) return; b.textContent = v; b.classList.add('up'); if (!first) { first = b; return; } moves++; info.textContent = 'Movimientos: ' + moves; const a = first; first = null;
        if (a.textContent === v) { a.className = b.className = 'done'; if (++found === 8) { const r = store.get('mem'); if (!r || moves < r) store.set('mem', moves); msg.textContent = `🎉 ¡Completado en ${moves} movimientos!`; } }
        else { lock = true; setTimeout(() => { a.textContent = b.textContent = '❔'; a.classList.remove('up'); b.classList.remove('up'); lock = false; }, 700); } }; grid.append(b); }); };
    q(el, '.again').onclick = reset; reset();
  }

  /* ---------- Snake ---------- */
  function snake(el) {
    el.innerHTML = '<h3>Snake</h3><p class="hint">Flechas, WASD, deslizar o botones. Comé 🍎 sin chocar.</p><canvas width="300" height="300"></canvas><div class="msg" aria-live="polite"></div><div class="dpad"><span></span><button data-d="u" type="button" aria-label="Arriba">▲</button><span></span><button data-d="l" type="button" aria-label="Izquierda">◀</button><button data-d="d" type="button" aria-label="Abajo">▼</button><button data-d="r" type="button" aria-label="Derecha">▶</button></div><button class="download again" type="button">Jugar de nuevo</button>';
    const cv = q(el, 'canvas'), x = cv.getContext('2d'), msg = q(el, '.msg'), N = 20, S = 15, D = { u: [0,-1], d: [0,1], l: [-1,0], r: [1,0] };
    let s, d, nd, f, sc, t, best = store.get('snake');
    const turn = k => { const v = D[k]; if (v && (v[0] !== -d[0] || v[1] !== -d[1])) nd = v; };
    const place = () => { do f = [rnd(N), rnd(N)]; while (s.some(p => p[0] === f[0] && p[1] === f[1])); };
    const paint = () => { x.fillStyle = '#020b20'; x.fillRect(0, 0, 300, 300); x.fillStyle = '#ff67dc'; x.fillRect(f[0]*S+1, f[1]*S+1, S-2, S-2); x.fillStyle = '#69edff'; s.forEach(p => x.fillRect(p[0]*S+1, p[1]*S+1, S-2, S-2)); };
    const tick = () => { d = nd; const h = [s[0][0]+d[0], s[0][1]+d[1]]; if (h[0] < 0 || h[1] < 0 || h[0] >= N || h[1] >= N || s.some(p => p[0] === h[0] && p[1] === h[1])) { clearInterval(t); if (sc > best) { best = sc; store.set('snake', sc); } msg.textContent = `Perdiste · Puntos: ${sc} · Récord: ${best}`; return; } s.unshift(h); if (h[0] === f[0] && h[1] === f[1]) { sc++; place(); } else s.pop(); msg.textContent = 'Puntos: ' + sc; paint(); };
    const start = () => { clearInterval(t); s = [[10,10],[9,10],[8,10]]; d = nd = [1,0]; sc = 0; place(); paint(); msg.textContent = 'Puntos: 0'; t = setInterval(tick, 120); };
    const key = e => { const k = { ArrowUp:'u', ArrowDown:'d', ArrowLeft:'l', ArrowRight:'r', w:'u', s:'d', a:'l', d:'r' }[e.key]; if (k) { turn(k); e.preventDefault(); } };
    let tx, ty; cv.addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
    cv.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty; if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return; turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'r' : 'l') : (dy > 0 ? 'd' : 'u')); });
    document.addEventListener('keydown', key);
    el.querySelectorAll('[data-d]').forEach(b => b.onclick = () => turn(b.dataset.d));
    q(el, '.again').onclick = start; start();
    return () => { clearInterval(t); document.removeEventListener('keydown', key); };
  }

  const G = [['❌ Ta-Te-Ti', ttt], ['🔢 Adiviná el número', guess], ['🃏 Más alto o más bajo', hl], ['✂️ Piedra, papel o tijera', rps], ['🧠 Memoria', memory], ['🐍 Snake', snake]];
  let stop = null;
  G.forEach(([n, fn], i) => {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = n;
    b.onclick = () => { if (stop) stop(); tabs.querySelectorAll('button').forEach(x => x.classList.toggle('active', x === b)); stage.innerHTML = ''; stop = fn(stage) || null; };
    tabs.append(b); if (!i) b.click();
  });
})();
