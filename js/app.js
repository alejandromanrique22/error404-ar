"use strict";

const CONFIG = { catalogo: "./data/programas.json" };
const state = { programas: [], categoria: "", busqueda: "", sistema: "", precio: "", orden: "nombre" };

const $ = (id) => document.getElementById(id);
const elements = {
  searchForm: $("searchForm"),
  search: $("search"),
  categories: $("categories"),
  system: $("systemFilter"),
  price: $("priceFilter"),
  sort: $("sortFilter"),
  clear: $("clearFilters"),
  reset: $("resetSearch"),
  list: $("programList"),
  count: $("resultsCount"),
  total: $("totalProgramas"),
  totalCategories: $("totalCategorias"),
  empty: $("emptyState"),
  error: $("errorState")
};

function createElement(tag, className, content) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content !== undefined) node.textContent = content;
  return node;
}

function safeUrl(value) {
  if (typeof value !== "string" || !value.trim()) return "";
  const raw = value.trim();
  try {
    const url = new URL(raw, window.location.href);
    if (!["http:", "https:"].includes(url.protocol)) return "";
    return raw;
  } catch {
    return "";
  }
}

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function formatDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return "Fecha no disponible";
  const date = new Date(value + "T12:00:00");
  return Number.isNaN(date.getTime())
    ? "Fecha no disponible"
    : new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function renderInstaladores(programa) {
  if (!Array.isArray(programa.instaladores) || programa.instaladores.length === 0) return null;
  const wrapper = createElement("div", "download-options");
  
  programa.instaladores.forEach((instalador) => {
    if (!instalador || typeof instalador !== "object") return;
    const url = safeUrl(instalador.url);
    const nombre = typeof instalador.nombre === "string" && instalador.nombre.trim() 
      ? instalador.nombre 
      : "Instalador";
      
    if (url) {
      wrapper.appendChild(createExternalLink(url, "download-button", `↓ ${nombre}`));
    }
  });
  
  return wrapper.childElementCount ? wrapper : null;
}

function validatePrograms(data) {
  if (!Array.isArray(data)) throw new Error("El catálogo debe ser una lista.");
  const slugs = new Set();
  
  return data.filter((program) => {
    if (
      !program ||
      typeof program.nombre !== "string" ||
      !program.nombre.trim() ||
      typeof program.slug !== "string" ||
      !/^[a-z0-9-]+$/.test(program.slug) ||
      slugs.has(program.slug)
    ) return false;
    
    slugs.add(program.slug);
    program.categoria = typeof program.categoria === "string" && program.categoria.trim() ? program.categoria : "Otros";
    program.descripcion = typeof program.descripcion === "string" ? program.descripcion : "";
    program.editor = typeof program.editor === "string" ? program.editor : "";
    program.sistemas = Array.isArray(program.sistemas) ? program.sistemas.filter(x => typeof x === "string") : [];
    program.precio = ["Gratis", "Freemium", "De pago"].includes(program.precio) ? program.precio : "No especificado";
    program.version = String(program.version || "No disponible");
    program.tamaño = String(program.tamaño || "No especificado");
    program.fecha = String(program.fecha || "");
    program.descargas = Number.isFinite(Number(program.descargas)) ? Number(program.descargas) : 0;
    program.destacado = program.destacado === true;
    program.imagen = safeUrl(program.imagen);
    program.detalles = safeUrl(program.detalles);
    program.descarga = safeUrl(program.descarga);
    
    program.instaladores = Array.isArray(program.instaladores)
      ? program.instaladores.map((item) => ({
          nombre: typeof item?.nombre === "string" ? item.nombre : "Instalador",
          sistema: typeof item?.sistema === "string" ? item.sistema : "",
          arquitectura: typeof item?.arquitectura === "string" ? item.arquitectura : "",
          url: safeUrl(item?.url)
        })).filter((item) => item.url)
      : [];
      
    program.sha256 = typeof program.sha256 === "string" && /^[a-f\d]{64}$/i.test(program.sha256) 
      ? program.sha256.toUpperCase() 
      : "";
      
    return true;
  });
}

function updateStatistics() {
  elements.total.textContent = state.programas.length.toLocaleString("es-AR");
  elements.totalCategories.textContent = new Set(state.programas.map(p => p.categoria)).size.toLocaleString("es-AR");
}

function renderCategories() {
  elements.categories.replaceChildren();
  const categories = ["", ...new Set(state.programas.map(p => p.categoria))].sort((a, b) => a.localeCompare(b, "es"));
  
  categories.forEach(category => {
    const label = category || "Todas";
    const button = createElement("button", "category-button" + (state.categoria === category ? " active" : ""), label);
    button.type = "button";
    button.dataset.category = category;
    button.setAttribute("aria-pressed", String(state.categoria === category));
    button.addEventListener("click", () => {
      state.categoria = category;
      renderCategories();
      renderPrograms();
      $("catalogo").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    elements.categories.appendChild(button);
  });
}

function getFilteredPrograms() {
  let results = [...state.programas];
  if (state.busqueda) {
    const q = normalize(state.busqueda);
    results = results.filter(p => normalize([p.nombre, p.descripcion, p.categoria, p.editor, ...p.sistemas].join(" ")).includes(q));
  }
  if (state.categoria) results = results.filter(p => p.categoria === state.categoria);
  if (state.sistema) results = results.filter(p => p.sistemas.includes(state.sistema));
  if (state.precio) results = results.filter(p => p.precio === state.precio);
  
  if (state.orden === "recientes") results.sort((a, b) => b.fecha.localeCompare(a.fecha));
  else if (state.orden === "descargas") results.sort((a, b) => b.descargas - a.descargas);
  else results.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  
  return results;
}

function createProgramImage(program) {
  const wrapper = createElement("div", "program-image");
  const placeholder = createElement("span", "image-placeholder", program.nombre.charAt(0).toUpperCase());
  wrapper.appendChild(placeholder);
  
  if (program.imagen) {
    const img = document.createElement("img");
    img.src = program.imagen;
    img.alt = "Imagen de " + program.nombre;
    img.loading = "lazy";
    img.decoding = "async";
    img.addEventListener("load", () => placeholder.remove(), { once: true });
    img.addEventListener("error", () => img.remove(), { once: true });
    wrapper.appendChild(img);
  }
  
  if (program.destacado) wrapper.appendChild(createElement("span", "featured-label", "RECOMENDADO"));
  return wrapper;
}

function createExternalLink(href, className, label) {
  const link = createElement("a", className, label);
  link.href = href;
  if (/^https?:\/\//i.test(href)) { 
    link.target = "_blank"; 
    link.rel = "noopener noreferrer"; 
  }
  return link;
}

function createProgramCard(program) {
  const article = createElement("article", "program-card");
  article.appendChild(createProgramImage(program));
  
  const content = createElement("div", "program-content");
  content.appendChild(createElement("span", "program-category", program.categoria));
  content.appendChild(createElement("h3", "", program.nombre));
  content.appendChild(createElement("p", "program-meta", `Versión ${program.version} · ${program.tamaño} · ${formatDate(program.fecha)}`));
  content.appendChild(createElement("p", "program-description", program.descripcion));
  
  const badges = createElement("div", "badges");
  const priceClass = program.precio === "Gratis" ? "badge badge-free" : program.precio === "De pago" ? "badge badge-paid" : "badge";
  badges.appendChild(createElement("span", priceClass, program.precio));
  program.sistemas.forEach(system => badges.appendChild(createElement("span", "badge", system)));
  content.appendChild(badges);
  
  const actions = createElement("div", "program-actions");
  
  const optionsWrapper = renderInstaladores(program);
  if (optionsWrapper) {
    actions.appendChild(optionsWrapper);
  } else if (program.descarga) {
    actions.appendChild(createExternalLink(program.descarga, "download-button", "↓ Descargar"));
  } else {
    actions.appendChild(createElement("span", "download-button disabled", "Descarga próximamente"));
  }
  
  if (program.detalles) {
    actions.appendChild(createExternalLink(program.detalles, "details-button", "Ver detalles"));
  }
  
  content.appendChild(actions);
  article.appendChild(content);
  return article;
}

function renderPrograms() {
  const programs = getFilteredPrograms();
  elements.list.replaceChildren();
  elements.list.hidden = programs.length === 0;
  elements.empty.hidden = programs.length !== 0;
  elements.error.hidden = true;
  programs.forEach(program => elements.list.appendChild(createProgramCard(program)));
  elements.count.textContent = `Mostrando ${programs.length} de ${state.programas.length} programas`;
}

function resetFilters() {
  Object.assign(state, { busqueda: "", categoria: "", sistema: "", precio: "", orden: "nombre" });
  elements.search.value = "";
  elements.system.value = "";
  elements.price.value = "";
  elements.sort.value = "nombre";
  renderCategories();
  renderPrograms();
}

async function loadPrograms() {
  try {
    const response = await fetch(CONFIG.catalogo, { cache: "no-cache" });
    if (!response.ok) throw new Error(`Error HTTP ${response.status}`);
    state.programas = validatePrograms(await response.json());
    updateStatistics();
    renderCategories();
    renderPrograms();
  } catch (error) {
    console.error("No se pudo cargar el catálogo:", error);
    elements.list.hidden = true;
    elements.error.hidden = false;
    elements.count.textContent = "No se pudo cargar el catálogo.";
    elements.total.textContent = "—";
    elements.totalCategories.textContent = "—";
  }
}

elements.search.addEventListener("input", e => { state.busqueda = e.target.value; renderPrograms(); });
elements.searchForm.addEventListener("submit", e => {
  e.preventDefault();
  state.busqueda = elements.search.value;
  renderPrograms();
  $("catalogo").scrollIntoView({ behavior: "smooth", block: "start" });
});
elements.system.addEventListener("change", e => { state.sistema = e.target.value; renderPrograms(); });
elements.price.addEventListener("change", e => { state.precio = e.target.value; renderPrograms(); });
elements.sort.addEventListener("change", e => { state.orden = e.target.value; renderPrograms(); });
elements.clear.addEventListener("click", resetFilters);
elements.reset.addEventListener("click", resetFilters);

$("currentYear").textContent = new Date().getFullYear();
loadPrograms();