/* Motor único de catálogo para Programas, Juegos y Sistemas. Lee body[data-json]. */
(() => {
  const $ = id => document.getElementById(id), B = document.body, per = 6;
  let all = [], list = [], page = 1;
  const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };

  async function load() {
    try {
      try {
        const r = await fetch(B.dataset.json);
        if (!r.ok) throw new Error(r.status);
        all = await r.json();
      } catch (err) {
        if (!window.CATALOG_DATA) throw err;
        all = window.CATALOG_DATA; /* abierto como archivo local (file://) */
      }
      cats(); filter();
    } catch (e) {
      console.error(e);
      $('catalogo').innerHTML = `<div class="empty">No se pudo cargar el catálogo. Verificá que exista ${B.dataset.json}.</div>`;
    }
  }

  function sync() {
    document.querySelectorAll('[data-category]').forEach(a => a.classList.toggle('active', a.dataset.category === $('category').value));
  }

  function cats() {
    const cs = [...new Set(all.map(x => x.category))];
    $('category').append(...cs.map(c => new Option(c, c)));
    const box = $('cats');
    box.innerHTML = '<div class="sidehead">Categorías</div>';
    [['Todos', '▦ Todos']].concat(cs.map(c => [c, '⚙ ' + c])).forEach(([c, l], i) => {
      const a = el('a', i ? '' : 'active', l);
      a.href = '#catalogo'; a.dataset.category = c;
      a.onclick = () => { $('category').value = c; sync(); filter(); };
      box.append(a);
    });
  }

  function filter() {
    const q = $('search').value.trim().toLocaleLowerCase('es'), c = $('category').value;
    list = all.filter(p => (c === 'Todos' || p.category === c) && [p.name, p.category, p.desc, p.os, p.arch, vtext(p)].join(' ').toLocaleLowerCase('es').includes(q));
    const s = $('sort').value;
    if (s === 'az') list.sort((a, b) => a.name.localeCompare(b.name, 'es'));
    if (s === 'za') list.sort((a, b) => b.name.localeCompare(a.name, 'es'));
    page = 1; render();
  }

  /* Texto buscable de las versiones (nombres + "32 bits" / "64 bits") */
  function vtext(p) {
    return (p.versions || []).map(v => v.name + ' ' + Object.keys(v.files || {}).map(b => b + ' bits').join(' ')).join(' ');
  }

  /* Selector de versión + arquitectura (32/64) para items con "versions". Devuelve [selector, pie de tarjeta]. */
  function picker(p) {
    const vs = p.versions, wrap = el('div', 'picker'), lab = el('label', 'pk-label', 'Versión'), sel = el('select', 'field');
    sel.setAttribute('aria-label', 'Versión de ' + p.name);
    vs.forEach((v, i) => sel.append(new Option(v.name, i)));
    lab.append(sel);
    const bits = el('div', 'pk-bits'), bb = {}; bits.setAttribute('role', 'group'); bits.setAttribute('aria-label', 'Arquitectura');
    let cur = '64';
    ['32', '64'].forEach(b => { const x = el('button', 'pagebtn', b + ' bits'); x.type = 'button'; x.onclick = () => { cur = b; upd(); }; bb[b] = x; bits.append(x); });
    wrap.append(lab, bits);
    const size = el('span', 'size'), box = el('div', 'dls'), foot = el('div', 'cardfoot'); foot.append(size, box);
    function upd() {
      const v = vs[sel.value], f = v.files || {};
      ['32', '64'].forEach(b => { bb[b].disabled = !f[b]; });
      if (!f[cur]) cur = f['64'] ? '64' : (f['32'] ? '32' : cur); /* conserva la elección si existe; si no, la disponible */
      ['32', '64'].forEach(b => { bb[b].classList.toggle('active', b === cur && !!f[b]); bb[b].setAttribute('aria-pressed', String(b === cur && !!f[b])); });
      const file = f[cur];
      size.textContent = (file && file.size) || 'Pendiente';
      box.replaceChildren();
      if (file && file.url) {
        const label = '⬇ Descargar ' + cur + ' bits', a = el('a', 'download', label);
        a.href = file.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
        a.onclick = e => { if (e.ctrlKey || e.metaKey || e.shiftKey || e.button) return; e.preventDefault(); dlDialog(p.name + ' ' + v.name, file.url, cur + ' bits'); };
        box.append(a);
      } else box.append(el('span', 'download disabled', 'Próximamente'));
    }
    sel.onchange = upd; upd();
    return [wrap, foot];
  }

  function dl(p) {
    const box = el('div', 'dls');
    const items = Array.isArray(p.download) ? p.download : (typeof p.download === 'string' && p.download.trim() ? [{ url: p.download }] : []);
    if (!items.length) { box.append(el('span', 'download disabled', 'Próximamente')); return box; }
    items.forEach(d => {
      const a = el('a', 'download', d.label || '⬇ Descargar');
      a.href = d.url || '#'; a.target = '_blank'; a.rel = 'noopener noreferrer';
      if (d.url) a.onclick = e => { if (e.ctrlKey || e.metaKey || e.shiftKey || e.button) return; e.preventDefault(); dlDialog(p.name, d.url, d.label); };
      box.append(a);
    });
    return box;
  }


  /* Ritual de descarga: diálogo con barra verde. El archivo real se baja con el botón; siempre se puede saltear. */
  function dlDialog(name, url, label) {
    const old = document.querySelector('.overlay.dl'); if (old) old.remove();
    const file = decodeURIComponent((url.split('/').pop() || name).split('?')[0]);
    const ov = el('div', 'overlay dl'), box = el('div', 'dialogbox'), bar = el('div', 'bar'), body = el('div', 'dbody');
    ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', 'Descarga de ' + name);
    bar.append(el('span', '', '⬇ Descarga de archivo'), el('span', '', '✦'));
    const title = el('h3', '', 'Descargando ' + name + (label ? ' (' + label.replace('⬇ ', '') + ')' : '')), fn = el('p', '', file);
    const xp = el('div', 'xpbar'), fill = el('i'); xp.append(fill);
    const info = el('p', '', 'Tiempo estimado: calculando…'), tiny = el('p', 'tiny', 'Simulación de época: el archivo real se baja con el botón. Podés saltearla cuando quieras.');
    const btns = el('div', 'dbtns'), go = el('a', 'download', 'Saltear y descargar'), cancel = el('button', 'pagebtn', 'Cancelar');
    go.href = url; go.target = '_blank'; go.rel = 'noopener noreferrer'; cancel.type = 'button';
    btns.append(go, cancel); body.append(title, fn, xp, info, tiny, btns); box.append(bar, body); ov.append(box); document.body.append(ov);
    let pct = 0, tm; const close = () => { clearInterval(tm); document.removeEventListener('keydown', esc); ov.remove(); };
    const esc = e => { if (e.key === 'Escape') close(); };
    const done = () => { clearInterval(tm); fill.style.width = '100%'; title.textContent = '✔ Descarga completa: ' + name; info.textContent = 'Listo. Ahora podés guardar el archivo.'; go.textContent = '✔ Guardar archivo'; go.classList.add('ready'); };
    document.addEventListener('keydown', esc); cancel.onclick = close; ov.onclick = e => { if (e.target === ov) close(); }; go.onclick = () => setTimeout(close, 400); go.focus();
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { done(); return; }
    let stall = 0;
    tm = setInterval(() => {
      if (pct >= 99) { if (++stall > 10) done(); return; } /* se queda en 99% un ratito, como siempre */
      pct = Math.min(99, pct + 3 + Math.random() * 6); fill.style.width = pct + '%';
      const kb = (3.5 + Math.random() * 2).toFixed(1).replace('.', ','), left = Math.max(1, Math.round((100 - pct) / 100 * 200));
      info.textContent = `Tiempo estimado: ${Math.floor(left / 60)} min ${left % 60} s · Velocidad: ${kb} KB/seg`;
    }, 130);
  }

  function render() {
    $('count').textContent = list.length;
    const cat = $('catalogo'), vis = list.slice((page - 1) * per, page * per);
    cat.replaceChildren();
    if (!vis.length) cat.innerHTML = '<div class="empty">No encontramos resultados con esos filtros.</div>';
    vis.forEach(p => {
      const card = el('article', 'card'), top = el('div', 'cardtop'), icon = el('div', 'appicon'), name = el('div', 'appname');
      if (p.icon && /\.(png|jpe?g|svg|webp|gif)$/i.test(p.icon)) { const i = el('img'); i.src = p.icon; i.alt = 'Icono de ' + p.name; i.loading = 'lazy'; i.onerror = () => { icon.textContent = '📦'; }; icon.append(i); }
      else icon.textContent = p.icon || '📦';
      name.append(el('h2', '', p.name), el('span', 'category', p.category));
      top.append(icon, name);
      const specs = el('div', 'specs');
      const vs = Array.isArray(p.versions) && p.versions.length;
      [p.os, p.arch, vs ? p.versions.length + (p.versions.length > 1 ? ' versiones' : ' versión') : ''].forEach(t => t && specs.append(el('span', 'spec', t)));
      if (vs) { const [pk, foot] = picker(p); card.append(top, el('p', 'desc', p.desc), specs, pk, foot); }
      else {
        const foot = el('div', 'cardfoot');
        foot.append(el('span', 'size', p.size || 'Pendiente'), dl(p));
        card.append(top, el('p', 'desc', p.desc), specs, foot);
      }
      cat.append(card);
    });
    pages();
  }

  function pages() {
    const w = $('pagination'); w.replaceChildren();
    const t = Math.ceil(list.length / per);
    if (t <= 1) return;
    const btn = (l, n, dis, act) => {
      const b = el('button', 'pagebtn' + (act ? ' active' : ''), l);
      b.type = 'button'; b.disabled = !!dis;
      b.onclick = () => { page = n; render(); $('catalogo').scrollIntoView({ behavior: 'smooth', block: 'start' }); };
      w.append(b);
    };
    btn('← Anterior', page - 1, page === 1);
    for (let i = 1; i <= t; i++) btn(String(i), i, false, i === page);
    btn('Siguiente →', page + 1, page === t);
  }

  $('search').addEventListener('input', filter);
  $('category').addEventListener('change', () => { sync(); filter(); });
  $('sort').addEventListener('change', filter);
  load();
})();
