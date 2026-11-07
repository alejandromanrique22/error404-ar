/* Layout único: cabecera, menús, banners, barra móvil y pie se generan desde acá.
   Así TODAS las páginas son idénticas. Para cambiar un enlace, se edita solo este archivo. */
(() => {
  const B = document.body, base = B.dataset.base || '', cur = B.dataset.page;
  const nav = [['inicio','🏠','Inicio','index.html'],['programas','🖥️','Programas','programas/index.html'],['juegos','🕹️','Juegos','juegos/index.html'],['sistemas','🌐','Sistemas','sistemas/index.html']];
  const si = (s, c) => `https://cdn.simpleicons.org/${s}/${c}`;
  const left = [['Microsoft Store','https://apps.microsoft.com/','https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg'],['Discord','https://discord.com/',si('discord','5865F2')],['Twitch','https://www.twitch.tv/',si('twitch','9146FF')],['Kick','https://kick.com/',si('kick','53FC18')],['Spotify','https://open.spotify.com/',si('spotify','1DB954')],['YouTube','https://www.youtube.com/',si('youtube','FF0000')],['Epic Games','https://store.epicgames.com/',si('epicgames','FFFFFF')]];
  const right = [['Steam','https://store.steampowered.com/',si('steam','66C0F4')],['Xbox','https://www.xbox.com/',base + 'images/xbox.png'],['Ubisoft','https://connect.ubisoft.com/',si('ubisoft','FFFFFF')],['EA App','https://www.ea.com/ea-app',si('ea','FFFFFF')],['Battle.net','https://battle.net/',si('battledotnet','00AEFF')],['Roblox','https://www.roblox.com/',si('roblox','FFFFFF')],['Ninja Kiwi','https://ninjakiwi.com/','https://ninjakiwi.com/favicon.ico']];
  const link = (n, cls = '') => `<a ${cls}href="${base + n[3]}"${n[0] === cur ? ' aria-current="page"' : ''}>`;
  const rail = (side, title, items) => `<nav class="platform-rail rail-${side}" aria-label="Plataformas (${side === 'left' ? 'izquierda' : 'derecha'})"><div class="rail-title">${title}</div>${items.map(i => `<a class="brand-card" href="${i[1]}" target="_blank" rel="noopener noreferrer"><img src="${i[2]}" alt="" loading="lazy" onerror="this.style.display='none'"><span>${i[0]}</span></a>`).join('')}</nav>`;

  document.getElementById('site-header').outerHTML = `<header class="top"><div class="topin"><a class="brand" href="${base}index.html">ERROR <span>404</span><small>${B.dataset.tagline || ''}</small></a><nav class="nav" aria-label="Navegación principal">${nav.map(n => `<a href="${base + n[3]}"${n[0] === cur ? ' aria-current="page"' : ''}>${n[1]} ${n[2]}</a>`).join('')}</nav></div></header>`;

  document.querySelector('.page-wrapper').insertAdjacentHTML('afterbegin', rail('left', '✦ PLATAFORMAS ✦', left) + rail('right', '✦ GAMING + MÁS ✦', right));

  document.getElementById('side').innerHTML = `<div class="bar"><span>▤ ${B.dataset.menu || 'Menú'}</span><span>✦</span></div><div id="cats"></div><div class="sidesec"><div class="sidehead">Secciones</div>${nav.map(n => `<a href="${base + n[3]}"${n[0] === cur ? ' aria-current="page"' : ''}>${n[1]} ${n[2]}</a>`).join('')}</div>${cur === 'inicio' ? '<div class="sidehead">Widgets</div><a href="#radio">📻 Radio en vivo</a><a href="#relojes">🕒 Relojes mundiales</a>' : ''}`;

  document.getElementById('foot').innerHTML = `ERROR 404 · ${B.dataset.foot || 'Portal'}<br>${nav.map(n => `<a href="${base + n[3]}">${n[2]}</a>`).join(' · ')} · <a href="#" id="toTop">Volver arriba ↑</a>`;
  document.getElementById('toTop').onclick = e => { e.preventDefault(); scrollTo({ top: 0, behavior: 'smooth' }); };

  /* ---- Aviso flotante reutilizable ---- */
  window.e404toast = msg => { const o = document.querySelector('.toast'); if (o) o.remove(); const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg; document.body.append(t); setTimeout(() => t.remove(), 3500); };

  /* ---- Pie de página de época: mejor visto, favoritos, última actualización, peso ---- */
  const lm = new Date(document.lastModified), fecha = isNaN(lm) ? '' : lm.toLocaleDateString('es-AR');
  document.getElementById('foot').insertAdjacentHTML('beforeend', `<div class="retro-foot">Mejor visto en 1024x768 · <a href="#" id="favLink">⭐ Agregame a favoritos</a>${fecha ? ' · Última actualización: ' + fecha : ''}<br><span id="weight">Calculando peso…</span><br>Usted no usa Internet Explorer 6: algunas funciones podrían no estar disponibles (mentira, anda todo).</div>`);
  document.getElementById('favLink').onclick = e => { e.preventDefault(); const mac = /Mac|iPhone|iPad/i.test(navigator.userAgent), touch = matchMedia('(pointer:coarse)').matches; e404toast(touch ? '⭐ Abrí el menú del navegador y tocá «Agregar a favoritos»' : `⭐ Presioná ${mac ? '⌘' : 'Ctrl'}+D para agregar a favoritos`); };
  addEventListener('load', () => setTimeout(() => {
    let b = 0; const nv = performance.getEntriesByType('navigation')[0];
    if (nv) b += nv.encodedBodySize || nv.transferSize || 0;
    performance.getEntriesByType('resource').forEach(r => { if (r.name.startsWith(location.origin)) b += r.encodedBodySize || r.transferSize || 0; });
    if (!b) b = document.documentElement.outerHTML.length;
    const w = document.getElementById('weight'); if (w) w.textContent = `Esta página pesa ~${Math.max(1, Math.round(b / 1024))} kB (archivos propios, sin íconos externos)`;
  }, 400));

  /* ---- Código Konami ---- */
  const KC = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a']; let ki = 0;
  addEventListener('keydown', e => {
    if (/INPUT|SELECT|TEXTAREA/.test((e.target.tagName || ''))) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    ki = k === KC[ki] ? ki + 1 : (k === KC[0] ? 1 : 0);
    if (ki !== KC.length) return;
    ki = 0; e404toast('★ Código Konami activado: +30 vidas ★');
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    for (let i = 0; i < 40; i++) { const s = document.createElement('span'); s.className = 'rain'; s.textContent = '★'; s.style.left = Math.random() * 100 + 'vw'; s.style.fontSize = 14 + Math.random() * 16 + 'px'; s.style.animationDuration = 2.5 + Math.random() * 2 + 's'; s.style.animationDelay = Math.random() * 1.2 + 's'; document.body.append(s); setTimeout(() => s.remove(), 6000); }
  });

  B.insertAdjacentHTML('beforeend', `<nav class="tabbar" aria-label="Navegación móvil">${nav.map(n => `<a href="${base + n[3]}"${n[0] === cur ? ' aria-current="page"' : ''}><span>${n[1]}</span>${n[2]}</a>`).join('')}</nav>`);
})();
