'use strict';
/* =========================================================
   ÓRBITA · sistema personal con equipo de agentes IA
   Vistas: Hoy · Semana · Órbitas · Progreso · Mapa (cerebro) · Equipo
   Estética: negro, blanco y grises. El mapa es lo memorable;
   todo lo demás, silencioso.
   ========================================================= */
const ob = require('obsidian');

/* ---------- Rutas ---------- */
const RAIZ = 'ORBITA';
const CARPETAS = {
  nucleo: RAIZ + '/0_NUCLEO', dinero: RAIZ + '/1_DINERO', cuerpo: RAIZ + '/2_CUERPO', mente: RAIZ + '/3_MENTE',
  relaciones: RAIZ + '/4_RELACIONES', estudios: RAIZ + '/5_ESTUDIOS', equipo: RAIZ + '/6_EQUIPO',
  diario: RAIZ + '/7_DIARIO', plantillas: RAIZ + '/8_PLANTILLAS', archivo: RAIZ + '/9_ARCHIVO', estudioEquipo: RAIZ + '/1_DINERO/contenido/equipo'
};
const NOTAS = {
  entreno: CARPETAS.cuerpo + '/ENTRENAMIENTO.md', ejercicios: CARPETAS.cuerpo + '/EJERCICIOS.md',
  voz: CARPETAS.mente + '/VOZ.md',
  calma: CARPETAS.mente + '/CALMA.md',
  skincare: CARPETAS.equipo + '/SKINCARE.md',
  inicio: CARPETAS.nucleo + '/INICIO.md', metas: CARPETAS.nucleo + '/METAS.md', rutinas: CARPETAS.nucleo + '/RUTINAS.md',
  citas: CARPETAS.nucleo + '/CITAS.md', sesiones: CARPETAS.nucleo + '/SESIONES.md', estado: CARPETAS.nucleo + '/ESTADO_EQUIPO.md',
  plantilla: CARPETAS.plantillas + '/DIA.md', calendario: CARPETAS.nucleo + '/CALENDARIO.md', fenix: CARPETAS.nucleo + '/FENIX.md', ingresos: CARPETAS.dinero + '/INGRESOS.md', guia: CARPETAS.nucleo + '/COMO_FUNCIONA.md', ideas: CARPETAS.dinero + '/contenido/IDEAS.md', contenido: CARPETAS.dinero + '/CONTENIDO.md', grabacion: CARPETAS.dinero + '/contenido/GRABACION.md', estilo: CARPETAS.dinero + '/contenido/ESTILO.md'
};
/* Anillos del mapa, de dentro afuera */
const ANILLOS = [
  { id: 'nucleo', nombre: 'Núcleo', carpeta: CARPETAS.nucleo },
  { id: 'dinero', nombre: 'Dinero', carpeta: CARPETAS.dinero, simbolo: '💰' },
  { id: 'cuerpo', nombre: 'Cuerpo', carpeta: CARPETAS.cuerpo, simbolo: '🏋️' },
  { id: 'mente', nombre: 'Mente', carpeta: CARPETAS.mente, simbolo: '🧠' },
  { id: 'relaciones', nombre: 'Relaciones', carpeta: CARPETAS.relaciones, simbolo: '🤝' },
  { id: 'estudios', nombre: 'Estudios', carpeta: CARPETAS.estudios, simbolo: '🎓' },
  { id: 'equipo', nombre: 'Equipo', carpeta: CARPETAS.equipo },
  { id: 'diario', nombre: 'Diario', carpeta: CARPETAS.diario },
  { id: 'archivo', nombre: 'Archivo', carpeta: CARPETAS.archivo }
];
const ORBITAS_VIDA = ANILLOS.filter((a) => a.simbolo);
let NOMBRE = 'Tú'; // se cambia en la Bienvenida o en Ajustes › ÓRBITA › Tu nombre
const V = { fenix: 'orbita-fenix', inicio: 'orbita-inicio', casas: 'orbita-casas', hoy: 'orbita-hoy', semana: 'orbita-semana', orbitas: 'orbita-orbitas', progreso: 'orbita-progreso', mapa: 'orbita-mapa', equipo: 'orbita-equipo', estudio: 'orbita-estudio', estudioEquipo: 'orbita-estudio-equipo', voz: 'orbita-voz', gimnasio: 'orbita-gimnasio', calma: 'orbita-calma' };
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const DIAS_CORTOS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
const AJUSTES_BASE = { nombre: '', sonido: true, modoApp: true, intro: true, introSiempre: false, ultimaIntro: '', blancoNegro: true, mapaInclinacion: 64, tema: 'crema', bloqueo: false, clave: null, ia: 'claude-code', iaClave: '', iaModelo: '', bienvenida: false, entrevista: false, autoActualizar: true };

/* ---------- Utilidades ---------- */
const p2 = (n) => String(n).padStart(2, '0');
const iso = (d) => d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate());
const hoyISO = () => iso(new Date());
const sumarDias = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const deISO = (s) => { const [a, m, d] = s.split('-').map(Number); return new Date(a, m - 1, d); };
const sinAcentos = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const limpiar = (s) => String(s || '').replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2').replace(/\[\[([^\]]+)\]\]/g, (m, a) => a.split('/').pop()).replace(/\*\*|__|`/g, '').replace(/<!--.*?-->/g, '').trim();
const limitar = (v, a, b) => Math.max(a, Math.min(b, v));
const capital = (s) => s.charAt(0).toUpperCase() + s.slice(1);
function saludo() { const h = new Date().getHours(); return h >= 6 && h < 14 ? 'Buenos días' : h >= 14 && h < 21 ? 'Buenas tardes' : 'Buenas noches'; }
function fechaLarga(d) { d = d || new Date(); return capital(d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })); }
function lunesDe(d) { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); const w = (x.getDay() + 6) % 7; return sumarDias(x, -w); }
function rutaDia(fecha) { return CARPETAS.diario + '/' + fecha + '.md'; }
function archivo(app, ruta) { const f = app.vault.getAbstractFileByPath(ruta); return f instanceof ob.TFile ? f : null; }
async function leer(app, ruta) { const f = archivo(app, ruta); return f ? app.vault.cachedRead(f) : null; }
function aviso(texto, ms) { new ob.Notice(texto, ms || 3500); }

/* ---------- Lectura de la nota del día ---------- */
function seccionDe(h) {
  const s = sinAcentos(h);
  if (s.includes('mensaje')) return 'mensaje';
  if (s.includes('rana')) return 'rana';
  if (s.includes('top')) return 'top';
  if (s.includes('rutina')) return 'rutinas';
  if (s.includes('como estoy')) return 'estado';
  if (s.includes('cierre')) return 'cierre';
  if (s.includes('fenix')) return 'fenix';
  return 'otra';
}
function parsearDia(texto) {
  const d = { meta: '', aplico: '', mensaje: '', rana: null, top: [], rutinas: [], otras: [], tareas: [], animo: null, energia: null, bueno: '', hecho: '', pendiente: '', balance: '' };
  if (!texto) return null;
  let sec = '';
  texto.split('\n').forEach((l, i) => {
    if (/^## /.test(l)) { sec = seccionDe(l.slice(3)); return; }
    const t = l.match(/^\s*- \[( |x|X)\]\s?(.*)$/);
    if (t) {
      const tarea = { linea: i, hecha: t[1] !== ' ', texto: limpiar(t[2]), seccion: sec };
      if (!tarea.texto) return;
      d.tareas.push(tarea);
      if (sec === 'rana' && !d.rana) d.rana = tarea;
      else if (sec === 'top') d.top.push(tarea);
      else if (sec === 'rutinas') d.rutinas.push(tarea);
      else if (sec !== 'rana') d.otras.push(tarea);
      return;
    }
    if (sec === 'mensaje' && /^>/.test(l)) { const m = limpiar(l.replace(/^>\s?/, '')); if (m) d.mensaje += (d.mensaje ? ' ' : '') + m; return; }
    if (sec === 'estado') {
      const v = (re) => { const m = l.match(re); return m ? m[1].trim() : null; };
      const a = v(/^\s*- Ánimo[^:]*:\s*(.*)$/i); if (a !== null) { const n = parseFloat(a.replace(',', '.')); d.animo = isNaN(n) ? null : n; return; }
      const e = v(/^\s*- Energía[^:]*:\s*(.*)$/i); if (e !== null) { const n = parseFloat(e.replace(',', '.')); d.energia = isNaN(n) ? null : n; return; }
      const b = v(/^\s*- Una cosa buena[^:]*:\s*(.*)$/i); if (b !== null) { d.bueno = limpiar(b); return; }
    }
    if (sec === 'fenix') { const m = l.match(/^\s*- ([^:]+):\s*(.*)$/); if (m) { const k = sinAcentos(m[1]); if (k.includes('meta')) d.meta = limpiar(m[2]); else if (k.includes('aplico')) d.aplico = limpiar(m[2]); } return; }
    if (sec === 'cierre') {
      const m = l.match(/^\s*- (Hecho|Pendiente[^:]*|Balance):\s*(.*)$/i);
      if (m) { const k = sinAcentos(m[1]); const val = limpiar(m[2]); if (k.startsWith('hecho')) d.hecho = val; else if (k.startsWith('pendiente')) d.pendiente = val; else d.balance = val; }
    }
  });
  d.total = d.tareas.length;
  d.hechas = d.tareas.filter((t) => t.hecha).length;
  return d;
}
async function leerDia(app, fecha) { const t = await leer(app, rutaDia(fecha || hoyISO())); return t == null ? null : parsearDia(t); }

async function alternarTarea(app, fecha, linea) {
  const f = archivo(app, rutaDia(fecha)); if (!f) return;
  await app.vault.process(f, (t) => {
    const ls = t.split('\n'); const l = ls[linea] || '';
    if (/- \[ \]/.test(l)) ls[linea] = l.replace('- [ ]', '- [x]');
    else if (/- \[(x|X)\]/.test(l)) ls[linea] = l.replace(/- \[(x|X)\]/, '- [ ]');
    return ls.join('\n');
  });
}
async function ponerValor(app, fecha, etiqueta, valor) {
  const f = archivo(app, rutaDia(fecha)); if (!f) return;
  await app.vault.process(f, (t) => {
    const re = new RegExp('^(\\s*- ' + etiqueta + '[^:]*:).*$', 'mi');
    return re.test(t) ? t.replace(re, (m, a) => a + ' ' + valor) : t;
  });
}
// Abre el chat en directo (plugin Claudian). Si se pasa un agente, copia «Agente, » al portapapeles para pegarlo.
function abrirClaudian(app, agente) {
  const ok = app.plugins && app.plugins.enabledPlugins && app.plugins.enabledPlugins.has('realclaudian');
  if (!ok) { new ob.Notice('Activa el plugin Claudian para hablar en directo con el equipo.'); return; }
  const ws = app.workspace; const der = ws.rightSplit;
  const hojas = ws.getLeavesOfType('claudian-view');
  // Si ya está abierto y visible, se cierra y se esconde la barra derecha para dejar ÓRBITA a pantalla completa
  if (!agente && der && !der.collapsed && hojas.length) { hojas.forEach((h) => { try { h.detach(); } catch (e) { /* */ } }); try { der.collapse(); } catch (e) { /* */ } return; }
  try { app.commands.executeCommandById('realclaudian:open-view'); } catch (e) { new ob.Notice('No se pudo abrir Claudian.'); return; }
  try { if (der && der.collapsed) der.expand(); } catch (e) { /* */ }
  if (agente) { try { navigator.clipboard.writeText(agente + ', '); new ob.Notice('Escribe en Claudian: «' + agente + ', …» (ya está copiado, pega con Ctrl+V).'); } catch (e) { /* */ } }
}
async function crearDia(app, fecha) {
  fecha = fecha || hoyISO();
  const ruta = rutaDia(fecha);
  if (archivo(app, ruta)) return archivo(app, ruta);
  const plantilla = (await leer(app, NOTAS.plantilla)) || '# {{date:YYYY-MM-DD}}\n\n## 🐸 La rana de hoy\n- [ ] \n';
  const d = deISO(fecha);
  let cuerpo = plantilla.replace(/\{\{date:YYYY-MM-DD\}\}/g, fecha + ' · ' + capital(DIAS[d.getDay()]));
  try { cuerpo = await rellenarDia(app, fecha, cuerpo); } catch (e) { console.error('ÓRBITA rellenarDia', e); }
  if (!app.vault.getAbstractFileByPath(CARPETAS.diario)) await app.vault.createFolder(CARPETAS.diario);
  if (archivo(app, ruta)) return archivo(app, ruta);
  return app.vault.create(ruta, cuerpo);
}
// La nota nueva sale ya preparada: meta de ayer, piel de ese día según el plan, entreno del día y citas.
async function rellenarDia(app, fecha, t) {
  const d = deISO(fecha); const wd = d.getDay();
  const ls = t.split('\n');
  const sust = (re, nueva) => { const i = ls.findIndex((l) => re.test(l)); if (i >= 0) ls[i] = nueva; return i; };
  // 1) Meta principal: la de la última nota
  const prev = app.vault.getMarkdownFiles().filter((f) => f.path.startsWith(CARPETAS.diario + '/') && /^\d{4}-\d{2}-\d{2}$/.test(f.basename) && f.basename < fecha).sort((a, b) => b.basename.localeCompare(a.basename))[0];
  if (prev) {
    const pt = await app.vault.cachedRead(prev); const m = pt.match(/^\s*-\s*Mi meta principal[^:]*:\s*(.+)$/mi);
    if (m && m[1].trim()) { const i = ls.findIndex((l) => /^\s*-\s*Mi meta principal[^:]*:\s*$/i.test(l)); if (i >= 0) ls[i] = ls[i].replace(/:\s*$/, ': ' + m[1].trim()); }
  }
  // 2) Piel: lo que toca ese día, en orden de uso
  const plan = await leerPlanPiel(app);
  if (plan.length) {
    const peso = (it) => { const n = sinAcentos(it.nombre + ' ' + it.tipo).toLowerCase();
      return /champu|acondicion|ducha/.test(n) ? 0 : /limpia/.test(n) ? 1 : /hidrat/.test(n) ? 3 : /protector|solar/.test(n) ? 4 : /comprim|lorata|pastill/.test(n) ? 5 : /spray|nasonex|nasal/.test(n) ? 6 : 2; };
    const lista = (k) => plan.filter((it) => tocaPiel(it, fecha, plan) && (it.momento.includes(k) || (k === 'noche' && it.momento.includes('ducha'))))
      .map((it, i) => [it, i]).sort((a, b) => peso(a[0]) - peso(b[0]) || a[1] - b[1]).map((x) => x[0].nombre);
    const y = (a) => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' y ' + a[a.length - 1];
    const ma = lista('manana'), no = lista('noche');
    if (ma.length) sust(/^\s*- \[ \] (Piel )?ma[ñn]ana\b/i, '- [ ] Mañana: ' + y(ma));
    if (no.length) sust(/^\s*- \[ \] (Piel )?noche\b/i, '- [ ] Noche: ' + y(no));
  }
  // 3) Entreno del día (plan de ENTRENAMIENTO)
  try {
    const { dias } = await leerGimnasio(app); const g = dias[sinAcentos(DIAS[wd]).toLowerCase()];
    const linea = g ? (/descanso/i.test(g.titulo) ? '- [ ] Entreno: descanso activo (caminar y movilidad)' : '- [ ] Entreno: ' + g.titulo.replace(/\s*\(.*\)\s*$/, '') + ' (si no puedo, caminar 20 min)') : '- [ ] Entreno: moverme 20 min (paseo)';
    sust(/^\s*- \[ \] Entreno\b/i, linea);
    // La rana, si está vacía y es día de gimnasio: el entreno a las 10:00
    if (g) { const r = ls.findIndex((l) => /^## /.test(l) && /rana/i.test(l)); const j = ls.findIndex((l, k) => k > r && /^\s*- \[ \]\s*$/.test(l)); if (r >= 0 && j === r + 1) ls[j] = /descanso/i.test(g.titulo) ? '- [ ] Descanso activo: caminar 30 min y movilidad' : '- [ ] Gimnasio a las 10:00 · ' + g.titulo.replace(/\s*\(.*\)\s*$/, '') + ' (si no puedo, caminar 20 min)'; }
    // Sin gimnasio ese día: fuera el clip de TikTok de los días de gym
    if (!g || /descanso/i.test(g.titulo)) { const k = ls.findIndex((l) => /^\s*- \[ \] Clip de 10 s/i.test(l)); if (k >= 0) ls.splice(k, 1); }
  } catch (e) { /* sin plan de gimnasio */ }
  // 4) Citas del día en el Top 3 (huecos vacíos)
  try {
    const citas = (await leerCitas(app)).filter((c) => c.fecha === fecha && !/d[ií]a libre/i.test(c.que || ''));
    const top = ls.findIndex((l) => /^## /.test(l) && /top/i.test(l));
    citas.forEach((c) => {
      const txt = '- [ ] ' + limpiar(c.que) + (c.inicio ? ' a las ' + c.inicio : '');
      const j = ls.findIndex((l, k) => k > top && /^\s*- \[ \]\s*$/.test(l));
      if (top >= 0 && j > top) ls[j] = txt;
    });
  } catch (e) { /* sin citas */ }
  return ls.join('\n');
}
// Que la nota de hoy exista siempre (y la de mañana, si es de noche)
async function asegurarDias(app) {
  const ahora = new Date(); const hoy = hoyISO();
  if (!archivo(app, rutaDia(hoy))) await crearDia(app, hoy);
  if (ahora.getHours() >= 21) { const m = new Date(ahora); m.setDate(m.getDate() + 1); const f = iso(m); if (!archivo(app, rutaDia(f))) await crearDia(app, f); }
}
async function escribirCierre(app, extra) {
  extra = extra || {};
  const fecha = extra.fecha || hoyISO();
  const d = await leerDia(app, fecha);
  if (!d) { aviso('Hoy no hay nota del día. Créala desde Hoy.'); return; }
  const hechas = d.tareas.filter((t) => t.hecha).map((t) => t.texto);
  const pend = d.tareas.filter((t) => !t.hecha).map((t) => t.texto);
  const balance = d.hechas + ' de ' + d.total + ' · rana ' + (d.rana && d.rana.hecha ? 'hecha' : 'sin hacer') + ' · cerrado a las ' + p2(new Date().getHours()) + ':' + p2(new Date().getMinutes());
  const f = archivo(app, rutaDia(fecha));
  await app.vault.process(f, (t) => {
    const ls = t.split('\n').filter((l) => !/<!--orbita-->/.test(l));
    let i = ls.findIndex((l) => /^## /.test(l) && seccionDe(l.slice(3)) === 'cierre');
    if (i < 0) { ls.push('', '## Cierre del día'); i = ls.length - 1; }
    const fija = (clave, valor) => {
      const j = ls.findIndex((l, k) => k > i && new RegExp('^\\s*- ' + clave, 'i').test(l));
      if (j >= 0) { if (!limpiar(ls[j].split(':').slice(1).join(':'))) ls[j] = '- ' + clave + ': ' + valor; }
      else ls.splice(i + 1, 0, '- ' + clave + ': ' + valor);
    };
    fija('Hecho', hechas.join(' · ') || 'nada marcado');
    fija('Pendiente para mañana', pend.join(' · ') || 'nada');
    const pon = (clave, valor) => { if (!valor) return; const j = ls.findIndex((l, k) => k > i && new RegExp('^\\s*- ' + clave, 'i').test(l)); const nueva = '- ' + clave + ': ' + valor.replace(/\n+/g, ' '); if (j >= 0) ls[j] = nueva; else { let fin = i + 1; while (fin < ls.length && !/^## /.test(ls[fin]) && ls[fin].trim()) fin++; ls.splice(fin, 0, nueva); } };
    pon('Mejor mañana', extra.mejor); pon('Para el equipo', extra.equipo);
    let fin = i + 1; while (fin < ls.length && !/^## /.test(ls[fin])) fin++;
    ls.splice(fin, 0, '- Balance: ' + balance + ' <!--orbita-->');
    return ls.join('\n');
  });
  return d;
}
// «Cerrar el día» desde Obsidian: todo en una ventana, se guarda en la nota y deja mañana preparado.
async function fijarLineaEstado(app, fecha, clave, valor) {
  const f = archivo(app, rutaDia(fecha)); if (!f) return;
  await app.vault.process(f, (t) => {
    const ls = t.split('\n'); const nueva = '- ' + clave + ': ' + valor;
    const j = ls.findIndex((l) => new RegExp('^\\s*- ' + clave + '[^:]*:', 'i').test(l)); if (j >= 0) { ls[j] = nueva; return ls.join('\n'); }
    let i = ls.findIndex((l) => /^## /.test(l) && seccionDe(l.slice(3)) === 'estado');
    if (i < 0) { ls.push('', '## Cómo estoy'); i = ls.length - 1; }
    let k = i + 1; while (k < ls.length && !/^## /.test(ls[k]) && ls[k].trim()) k++;
    ls.splice(k, 0, nueva); return ls.join('\n');
  });
}
function cerrarDia(app) { new CierreModal(app).open(); }
class CierreModal extends ob.Modal {
  constructor(app) { super(app); this.v = {}; }
  async onOpen() {
    const fecha = hoyISO(); this.fecha = fecha;
    this.modalEl.addClass('orb-cierre-modal'); const c = this.contentEl; c.empty();
    const d = await leerDia(this.app, fecha);
    if (!d) { c.createDiv({ cls: 'orb-ci-tit', text: 'Hoy no hay nota del día' }); const b = c.createEl('button', { cls: 'orb-ci-ok', text: 'Crearla ahora' }); b.addEventListener('click', async () => { await crearDia(this.app, fecha); this.onOpen(); }); return; }
    this.v = { animo: d.animo, energia: d.energia, bueno: d.bueno || '', mejor: '', equipo: '' };
    const cab = c.createDiv('orb-ci-cab'); const ic = cab.createDiv('orb-ci-ic'); ob.setIcon(ic, 'moon');
    const ct = cab.createDiv(); ct.createDiv({ cls: 'orb-ci-k', text: capital(DIAS[deISO(fecha).getDay()]) + ' ' + deISO(fecha).getDate() + ' · cierre del día' });
    ct.createDiv({ cls: 'orb-ci-tit', text: d.hechas + ' de ' + d.total + (d.rana ? (d.rana.hecha ? ' · rana hecha' : ' · rana sin hacer') : '') });
    const bar = c.createDiv('orb-ci-barra'); const bi = bar.createDiv('orb-ci-barra-in'); bi.style.width = (d.total ? Math.round(d.hechas / d.total * 100) : 0) + '%';
    const pend = d.tareas.filter((t) => !t.hecha);
    if (pend.length) { const p = c.createDiv('orb-ci-pend'); p.createSpan({ cls: 'orb-ci-pend-k', text: 'Sin marcar: ' }); p.createSpan({ text: pend.map((t) => t.texto.replace(/\s*\(.*?\)\s*/g, ' ').trim()).slice(0, 6).join(' · ') + (pend.length > 6 ? '…' : '') }); }
    const escala = (clave, nombre) => {
      const f = c.createDiv('orb-ci-fila'); f.createDiv({ cls: 'orb-ci-n', text: nombre });
      const pts = f.createDiv('orb-ci-pts');
      for (let i = 1; i <= 10; i++) { const p = pts.createEl('button', { cls: 'orb-ci-p' + (this.v[clave] && i <= this.v[clave] ? ' on' : ''), text: String(i) });
        p.addEventListener('click', () => { this.v[clave] = i; pts.querySelectorAll('.orb-ci-p').forEach((x, j) => x.toggleClass('on', j < i)); try { SON.nivel(i); } catch (e) { /* sin sonido */ } }); }
    };
    escala('animo', 'Ánimo'); escala('energia', 'Energía');
    const sue = c.createDiv('orb-ci-fila'); sue.createDiv({ cls: 'orb-ci-n', text: 'Sueño' });
    const hs = sue.createDiv('orb-ci-sue');
    const hora = (txt, clave, def) => { const l = hs.createEl('label', { cls: 'orb-ci-hora' }); l.createSpan({ text: txt }); const i = l.createEl('input', { cls: 'orb-ci-time', attr: { type: 'time' } }); i.value = def || ''; this.v[clave] = i.value; i.addEventListener('input', () => { this.v[clave] = i.value; }); };
    hora('Me acosté anoche', 'acoste', ''); hora('Me levanté hoy', 'levante', '');
    const campo = (clave, nombre, ph) => { const f = c.createDiv('orb-ci-campo'); f.createDiv({ cls: 'orb-ci-n', text: nombre }); const t = f.createEl('textarea', { cls: 'orb-ci-txt', attr: { rows: '2', placeholder: ph } }); t.value = this.v[clave] || ''; t.addEventListener('input', () => { this.v[clave] = t.value.trim(); }); return t; };
    const t1 = campo('bueno', 'Una cosa buena de hoy', 'Aunque sea pequeña');
    campo('mejor', 'Mañana haría mejor…', 'Opcional · una sola cosa');
    campo('equipo', 'Para el equipo', 'Opcional · algo que quieras que sepamos (lo leemos en el chat)');
    // Mañana
    const m = new Date(deISO(fecha)); m.setDate(m.getDate() + 1); const fm = iso(m);
    const man = c.createDiv('orb-ci-man'); man.createDiv({ cls: 'orb-ci-k', text: 'Mañana · ' + capital(DIAS[m.getDay()]) + ' ' + m.getDate() });
    try { const evs = (await eventosDe(this.app, [fm]))[fm] || []; const l = man.createDiv('orb-ci-evs');
      evs.filter((e) => e.tipo !== 'nucleo' || /gimnas|entren/i.test(e.titulo)).slice(0, 5).forEach((e) => { const r = l.createDiv('orb-ci-ev'); r.createSpan({ cls: 'orb-ci-h', text: hm(e.ini) }); r.createSpan({ text: e.titulo }); });
      try { const { dias } = await leerGimnasio(this.app); const g = dias[sinAcentos(DIAS[m.getDay()]).toLowerCase()]; const r = l.createDiv('orb-ci-ev'); r.createSpan({ cls: 'orb-ci-h', text: g && !/descanso/i.test(g.titulo) ? '10:00' : '—' }); r.createSpan({ text: g ? (/descanso/i.test(g.titulo) ? 'Descanso activo: caminar y movilidad' : 'Gimnasio · ' + g.titulo.replace(/\s*\(.*\)\s*$/, '')) : 'Moverme 20 min (paseo)' }); } catch (e) { /* sin plan */ }
      if (!l.childElementCount) l.createDiv({ cls: 'orb-ci-vacio', text: 'Sin citas ni sesiones' }); } catch (e) { /* sin agenda */ }
    const pie = c.createDiv('orb-ci-pie');
    const ok = pie.createEl('button', { cls: 'orb-ci-ok', text: 'Cerrar el día' });
    pie.createDiv({ cls: 'orb-ci-nota', text: 'Se guarda en tu nota de hoy y deja preparada la de mañana.' });
    ok.addEventListener('click', async () => {
      ok.disabled = true; ok.setText('Guardando…');
      try {
        if (this.v.animo) await ponerValor(this.app, fecha, 'Ánimo', String(this.v.animo));
        if (this.v.energia) await ponerValor(this.app, fecha, 'Energía', String(this.v.energia));
        if (this.v.bueno) await ponerValor(this.app, fecha, 'Una cosa buena', this.v.bueno.replace(/\n+/g, ' '));
        if (this.v.acoste || this.v.levante) {
          let txt = (this.v.acoste ? 'me acosté ' + this.v.acoste : '') + (this.v.acoste && this.v.levante ? ' · ' : '') + (this.v.levante ? 'me levanté ' + this.v.levante : '');
          if (this.v.acoste && this.v.levante) { const [a1, a2] = this.v.acoste.split(':').map(Number), [b1, b2] = this.v.levante.split(':').map(Number); let m = (b1 * 60 + b2) - (a1 * 60 + a2); if (m < 0) m += 1440; txt += ' (' + Math.floor(m / 60) + ' h ' + p2(m % 60) + ')'; }
          await fijarLineaEstado(this.app, fecha, 'Sueño', txt);
        }
        await escribirCierre(this.app, { fecha, mejor: this.v.mejor, equipo: this.v.equipo });
        if (!archivo(this.app, rutaDia(fm))) await crearDia(this.app, fm);
        try { SON.completo(); } catch (e) { /* sin sonido */ }
        this.close(); aviso('Día cerrado y guardado. Mañana ya está preparado. Buenas noches, ' + NOMBRE + '.', 6000);
      } catch (e) { console.error(e); ok.disabled = false; ok.setText('Cerrar el día'); aviso('No se pudo guardar: ' + e.message); }
    });
    window.setTimeout(() => { if (!this.v.bueno) t1.focus(); }, 60);
  }
  onClose() { this.contentEl.empty(); }
}

/* ---------- Otras fuentes ---------- */
function filasTabla(texto, encabezado) {
  if (!texto) return [];
  const ls = texto.split('\n'); let dentro = !encabezado; const out = [];
  for (const l of ls) {
    if (encabezado && /^#{2,3} /.test(l)) { dentro = sinAcentos(l).includes(sinAcentos(encabezado)); continue; }
    if (!dentro || !/^\|/.test(l.trim()) || /^\|\s*-/.test(l.trim())) continue;
    const c = l.trim().replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map((x) => limpiar(x.replace(/\\\|/g, '|')));
    out.push(c);
  }
  return out.slice(1);
}

// ---------- Plan de piel y pelo (pestaña «Cuidado» del calendario) ----------
const DIAS_PIEL = { dom: 0, lun: 1, mar: 2, mie: 3, jue: 4, vie: 5, sab: 6 };
async function leerPlanPiel(app) {
  const t = await leer(app, NOTAS.skincare);
  return filasTabla(t, 'Plan del calendario').filter((c) => c[0]).map((c) => ({
    nombre: c[0], tipo: sinAcentos(c[1] || 'rutina').toLowerCase(), momento: sinAcentos(c[2] || '').toLowerCase(), frec: sinAcentos(c[3] || 'diario').toLowerCase(),
    desde: /^\d{4}-\d{2}-\d{2}$/.test(c[4] || '') ? c[4] : '', hasta: /^\d{4}-\d{2}-\d{2}$/.test(c[5] || '') ? c[5] : '', como: c[6] || '' }));
}
function tocaPiel(it, fecha, plan, prof) {
  if (it.desde && fecha < it.desde) return false;
  if (it.hasta && fecha > it.hasta) return false;
  const f = it.frec;
  if (!f || f.startsWith('diario') || f.includes('cada dia')) return true;
  const m = f.match(/cada\s+(\d+)\s*d/);
  if (m) { const base = deISO(it.desde || '2026-01-01'); const d = Math.round((deISO(fecha) - base) / 864e5); return d % (+m[1]) === 0; }
  const c = f.match(/^con\s+(.+)$/);
  if (c && (prof || 0) < 3) { const o = plan.find((x) => sinAcentos(x.nombre).toLowerCase() === c[1].trim()); return o ? tocaPiel(o, fecha, plan, (prof || 0) + 1) : false; }
  const ds = f.split(/[ ,y]+/).map((x) => x.slice(0, 3)).filter((x) => x in DIAS_PIEL);
  if (ds.length) return ds.some((x) => DIAS_PIEL[x] === deISO(fecha).getDay());
  return true;
}

async function leerCitas(app) {
  return filasTabla(await leer(app, NOTAS.citas)).filter((c) => /^\d{4}-\d{2}-\d{2}$/.test(c[0])).map((c) => ({ fecha: c[0], inicio: c[1], fin: c[2], que: c[3], detalle: c[4] || '' }));
}
async function leerSesiones(app) {
  return filasTabla(await leer(app, NOTAS.sesiones), 'Calendario fijo').map((c) => ({ dia: sinAcentos(c[0]), hora: c[1], quien: c[2], dur: Math.max(10, ...((c[3] || '').match(/\d+/g) || ['15']).map(Number)), para: c[4], clave: sinAcentos(c[5] || '') }));
}
async function leerGimnasioRutinas(app) {
  return filasTabla(await leer(app, NOTAS.rutinas), 'Gimnasio').map((c) => ({ dia: sinAcentos(c[0]), que: c[1] }));
}

/* ---------- Calendario: una sola fuente de eventos ---------- */
const ORDEN_LETRAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const LETRA_A_DIA = { L: 1, M: 2, X: 3, J: 4, V: 5, S: 6, D: 0 };
function diasDe(spec) {
  const out = new Set();
  String(spec || '').toUpperCase().replace(/\s/g, '').split(',').forEach((p) => {
    const m = p.match(/^([LMXJVSD])-([LMXJVSD])$/);
    if (m) { let k = ORDEN_LETRAS.indexOf(m[1]); const fin = ORDEN_LETRAS.indexOf(m[2]); for (let n = 0; n < 7; n++) { out.add(LETRA_A_DIA[ORDEN_LETRAS[k]]); if (k === fin) break; k = (k + 1) % 7; } }
    else if (LETRA_A_DIA[p] != null) out.add(LETRA_A_DIA[p]);
    else { const d = DIAS.findIndex((x) => sinAcentos(x) === sinAcentos(p)); if (d >= 0) out.add(d); }
  });
  return out;
}
function minutos(h) { const m = String(h || '').match(/(\d{1,2})[:.h](\d{2})/); if (!m) return null; let v = +m[1] * 60 + +m[2]; if (v < 5 * 60) v += 24 * 60; return v; }
const hm = (v) => p2(Math.floor(v / 60) % 24) + ':' + p2(v % 60);
async function eventosDe(app, fechas) {
  const [cal, citas, sesiones] = await Promise.all([leer(app, NOTAS.calendario), leerCitas(app), leerSesiones(app)]);
  const fijos = filasTabla(cal, 'Semana fija').map((c) => ({ dias: diasDe(c[0]), ini: minutos(c[1]), fin: minutos(c[2]), titulo: c[3], tipo: sinAcentos(c[4] || 'nucleo') })).filter((e) => e.ini != null);
  const notas = await Promise.all(fechas.map((f) => leerDia(app, f)));
  const out = {};
  fechas.forEach((f, i) => {
    const wd = deISO(f).getDay(); const lista = [];
    fijos.filter((e) => e.dias.has(wd)).forEach((e) => lista.push({ fecha: f, ini: e.ini, fin: Math.max(e.fin || e.ini, e.ini + 15), titulo: e.titulo, tipo: e.tipo, fuente: NOTAS.calendario }));
    const libre = citas.some((c) => c.fecha === f && /d[ií]a libre/i.test(c.que || '')); // un «Día libre» en CITAS anula las sesiones de ese día
    if (!libre) sesiones.filter((x) => x.dia === sinAcentos(DIAS[wd])).forEach((x) => { const ini = minutos(x.hora); if (ini != null) lista.push({ fecha: f, ini, fin: ini + x.dur, titulo: x.clave === 'revision' ? 'Revisión semanal' : 'Sesión con el ' + limpiar(x.quien).split(' + ')[0], detalle: x.para, tipo: 'sesion', fuente: NOTAS.sesiones }); });
    citas.filter((c) => c.fecha === f && !/d[ií]a libre/i.test(c.que || '')).forEach((c) => { const ini = minutos(c.inicio); if (ini != null) lista.push({ fecha: f, ini, fin: Math.max(minutos(c.fin) || ini + 45, ini + 15), titulo: c.que, detalle: c.detalle, tipo: 'cita', fuente: NOTAS.citas }); });
    const d = notas[i];
    if (d) d.tareas.forEach((t) => { const m = t.texto.match(/^(\d{1,2}:\d{2})\s*[·\-–]?\s*(.*)$/); if (m) { const ini = minutos(m[1]); lista.push({ fecha: f, ini, fin: ini + 30, titulo: m[2] || t.texto, tipo: 'tarea', hecha: t.hecha, fuente: rutaDia(f) }); } });
    lista.sort((a, b) => a.ini - b.ini || b.fin - a.fin);
    out[f] = lista;
  });
  return { eventos: out, notas };
}
function ahoraYLuego(lista) {
  const n = new Date(); let v = n.getHours() * 60 + n.getMinutes(); if (v < 5 * 60) v += 24 * 60;
  const ahora = lista.filter((e) => e.ini <= v && v < e.fin).pop() || null;
  const luego = lista.find((e) => e.ini > v) || null;
  return { ahora, luego, v };
}
function bloqueAhora(parent, lista, plugin) {
  const { ahora, luego, v } = ahoraYLuego(lista);
  const b = parent.createDiv('orb-ahora');
  const c1 = b.createDiv('orb-ahora-col');
  c1.createDiv({ cls: 'orb-etq', text: 'Ahora' });
  c1.createDiv({ cls: 'orb-ahora-t', text: ahora ? ahora.titulo : 'Tiempo libre' });
  if (ahora) c1.createDiv({ cls: 'orb-ahora-s', text: 'hasta las ' + hm(ahora.fin) + ' · quedan ' + (ahora.fin - v) + ' min' });
  const c2 = b.createDiv('orb-ahora-col');
  c2.createDiv({ cls: 'orb-etq', text: 'Luego' });
  c2.createDiv({ cls: 'orb-ahora-t', text: luego ? luego.titulo : 'Nada más hoy' });
  if (luego) c2.createDiv({ cls: 'orb-ahora-s', text: 'a las ' + hm(luego.ini) + ' · en ' + duracion(luego.ini - v) });
  b.addEventListener('click', () => plugin.abrir(V.semana));
  return b;
}
function duracion(min) { if (min < 60) return min + ' min'; const h = Math.floor(min / 60), m = min % 60; return h + ' h' + (m ? ' ' + m + ' min' : ''); }

async function leerFenix(app) {
  const t = await leer(app, NOTAS.fenix); if (!t) return null;
  const filas = filasTabla(t, 'Los 27 módulos');
  const hechos = filas.filter((c) => /\[x\]/i.test(c[2] || '')).length;
  const m = t.match(/\*\*Módulo actual:\*\*\s*(\d+)/);
  const actual = m ? Number(m[1]) : hechos + 1;
  const fila = filas.find((c) => Number(c[0]) === actual);
  const principios = filasTabla(t, 'Los 9 principios').map((c) => c[1]).filter(Boolean);
  return { hechos, total: filas.length || 27, actual, titulo: fila ? fila[1] : '', principios };
}
async function leerModoTormenta(app) {
  const t = await leer(app, NOTAS.estado); if (!t) return false;
  const l = t.split('\n').find((x) => /Estado general/i.test(x)) || '';
  return /modo tormenta/i.test(l) && !/salimos/i.test(l);
}
function seccionMarkdown(texto, titulo, nivel) {
  if (!texto) return '';
  const h = '#'.repeat(nivel || 2) + ' ';
  const ls = texto.split('\n'); let i = ls.findIndex((l) => l.startsWith(h) && sinAcentos(l).includes(sinAcentos(titulo)));
  if (i < 0) return '';
  const out = [];
  for (let k = i + 1; k < ls.length; k++) { if (/^#{1,3} /.test(ls[k]) && ls[k].split(' ')[0].length <= (nivel || 2)) break; out.push(ls[k]); }
  return out.join('\n');
}
function casillas(texto) { return (texto || '').split('\n').map((l) => l.match(/^\s*- \[( |x|X)\]\s?(.*)$/)).filter((m) => m && limpiar(m[2])).map((m) => ({ hecha: m[1] !== ' ', texto: limpiar(m[2]) })); }

async function datosOrbitas(app) {
  const metas = await leer(app, NOTAS.metas) || '';
  const bloque = seccionMarkdown(metas, 'Las 5 órbitas', 2);
  const hitos = casillas(seccionMarkdown(metas, 'Hitos del trimestre', 2));
  const ingresos = filasTabla(await leer(app, NOTAS.ingresos), 'Ingresos');
  const mes = hoyISO().slice(0, 7);
  const euros = ingresos.filter((c) => (c[0] || '').startsWith(mes)).reduce((s, c) => s + (parseFloat(String(c[3] || '').replace(',', '.').replace(/[^\d.-]/g, '')) || 0), 0);
  const out = ORBITAS_VIDA.map((o) => {
    const sub = (bloque.split(/\n(?=### )/).find((s) => sinAcentos(s.split('\n')[0]).includes(sinAcentos(o.nombre))) || '');
    const campo = (k) => { const l = sub.split('\n').find((x) => sinAcentos(x).includes(sinAcentos(k))); return l ? limpiar(l.replace(/^\s*- \*\*[^*]+\*\*\s*/, '').replace(/^\s*-\s*/, '')) : ''; };
    const hs = hitos.filter((h) => h.texto.startsWith(o.simbolo) || h.texto.startsWith(o.simbolo.replace('️', ''))).map((h) => ({ hecha: h.hecha, texto: h.texto.replace(o.simbolo, '').replace('️', '').trim() }));
    const n = app.vault.getMarkdownFiles().filter((f) => f.path.startsWith(o.carpeta + '/')).length;
    return { ...o, meta: capital(campo('Meta del año')), acciones: capital(campo('Acciones semanales')), prioritaria: /prioritaria/i.test(sub.split('\n')[0]), hitos: hs, notas: n };
  });
  return { orbitas: out, mes: casillas(seccionMarkdown(metas, 'Este mes', 2)), semana: casillas(seccionMarkdown(metas, 'Esta semana', 2)), euros, vision: limpiar(seccionMarkdown(metas, 'Visión', 2).trim()) };
}

function agentes(app, carpeta) {
  const dir = (carpeta || CARPETAS.equipo) + '/';
  return app.vault.getMarkdownFiles().filter((f) => f.path.startsWith(dir) && f.path.slice(dir.length).indexOf('/') < 0 && f.basename !== 'CHAT').map((f) => {
    const fm = (app.metadataCache.getFileCache(f) || {}).frontmatter || {};
    return { archivo: f, nombre: capital(String(fm.nombre || f.basename).toLowerCase()), rol: fm.rol || '', estado: fm.estado || 'esperando', tarea: fm.tarea || '', mensaje: fm.mensaje || '', actualizado: String(fm.actualizado || ''), orden: Number(fm.orden || 99) };
  }).sort((a, b) => a.orden - b.orden);
}

/* ---------- Sonido minimalista (Web Audio, sin archivos) ---------- */
/* ---------- Tema: claro (crema) u oscuro, para las escenas dibujadas ---------- */
const esClaro = () => document.body.classList.contains('orbita-crema');
function mezclar(hex, otro, k) { const a = RGB(hex), b = RGB(otro); return 'rgb(' + Math.round(a[0] + (b[0] - a[0]) * k) + ',' + Math.round(a[1] + (b[1] - a[1]) * k) + ',' + Math.round(a[2] + (b[2] - a[2]) * k) + ')'; }

/* ---------- Sonido · estilo Apple (Web Audio, sin archivos) ----------
   Timbre de cristal/marimba, envolventes cortas, un poco de sala (reverberación) y un compresor suave. */
const SON = {
  ctx: null, on: true, vol: 0.6, salida: null, sala: null,
  a() {
    if (!this.ctx) {
      const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; const c = this.ctx = new C();
      const comp = c.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3; comp.attack.value = 0.003; comp.release.value = 0.15;
      const master = c.createGain(); master.gain.value = this.vol; master.connect(comp); comp.connect(c.destination); this.salida = master;
      // sala: respuesta de impulso generada (1,4 s, estéreo, cola suave)
      const largo = Math.floor(c.sampleRate * 1.4), ir = c.createBuffer(2, largo, c.sampleRate);
      for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let k = 0; k < largo; k++) d[k] = (Math.random() * 2 - 1) * Math.pow(1 - k / largo, 3.2) * 0.6; }
      const conv = c.createConvolver(); conv.buffer = ir; const humedo = c.createGain(); humedo.gain.value = 0.22; conv.connect(humedo); humedo.connect(master); this.sala = conv;
    }
    if (this.ctx.state === 'suspended') this.ctx.resume(); return this.ctx;
  },
  // una nota de «cristal»: fundamental + parciales inarmónicos que se apagan antes
  nota(f, t0, dur, g, brillo) {
    const c = this.a(); if (!c) return; const t = c.currentTime + (t0 || 0); const pico = (g || 0.12);
    const bus = c.createGain(); bus.connect(this.salida); bus.connect(this.sala);
    [[1, 1, dur], [2.76, 0.32 * (brillo == null ? 1 : brillo), dur * 0.35], [5.4, 0.12 * (brillo == null ? 1 : brillo), dur * 0.18]].forEach(([m, a, d]) => {
      if (!(a > 0.001)) return;
      const o = c.createOscillator(), v = c.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(f * m, t);
      v.gain.setValueAtTime(0.0001, t); v.gain.exponentialRampToValueAtTime(Math.max(0.0002, pico * a), t + 0.004); v.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(v); v.connect(bus); o.start(t); o.stop(t + d + 0.05);
    });
  },
  ruido(t0, dur, f, q, g) { // golpecito de ruido filtrado (el «tic» de las teclas)
    const c = this.a(); if (!c) return; const t = c.currentTime + (t0 || 0); const n = Math.floor(c.sampleRate * dur);
    const b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0); for (let k = 0; k < n; k++) d[k] = (Math.random() * 2 - 1) * Math.pow(1 - k / n, 4);
    const src = c.createBufferSource(); src.buffer = b; const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = q || 1.2;
    const v = c.createGain(); v.gain.value = g || 0.2; src.connect(bp); bp.connect(v); v.connect(this.salida); src.start(t);
  },
  barrido(t0, dur, f1, f2, g) { // «fuuh» suave para los cambios de pestaña
    const c = this.a(); if (!c) return; const t = c.currentTime + (t0 || 0); const n = Math.floor(c.sampleRate * dur);
    const b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0); for (let k = 0; k < n; k++) d[k] = (Math.random() * 2 - 1) * Math.sin(Math.PI * k / n);
    const src = c.createBufferSource(); src.buffer = b; const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 0.9;
    bp.frequency.setValueAtTime(f1, t); bp.frequency.exponentialRampToValueAtTime(f2, t + dur);
    const v = c.createGain(); v.gain.value = g || 0.05; src.connect(bp); bp.connect(v); v.connect(this.salida); v.connect(this.sala); src.start(t);
  },
  tono(f, t0, dur, tipo, g) { this.nota(f, t0, dur, g); }, // compatibilidad
  clic() { if (!this.on) return; this.ruido(0, 0.018, 3200, 1.4, 0.09); this.nota(1760, 0, 0.05, 0.02, 0); },
  desliza() { if (!this.on) return; this.barrido(0, 0.2, 900, 2600, 0.045); this.ruido(0.17, 0.014, 2600, 1.6, 0.05); },
  ok() { if (!this.on) return; this.nota(1046.5, 0, 0.45, 0.11); this.nota(1568, 0.065, 0.6, 0.09); },
  quitar() { if (!this.on) return; this.nota(659.3, 0, 0.18, 0.06, 0.3); this.nota(523.3, 0.05, 0.22, 0.05, 0.3); },
  rana() { if (!this.on) return; [783.99, 987.77, 1174.66, 1567.98].forEach((f, i) => this.nota(f, i * 0.075, 0.9 - i * 0.1, 0.1 - i * 0.012)); this.nota(3135.96, 0.3, 0.5, 0.025, 0.2); this.nota(130.8, 0, 0.25, 0.08, 0); },
  completo() { if (!this.on) return; [523.25, 659.26, 783.99, 1174.66].forEach((f, i) => this.nota(f, i * 0.03, 1.6, 0.055)); this.nota(2093, 0.25, 1.2, 0.025, 0.3); },
  arranque() { if (!this.on) return; [349.23, 523.25, 659.26, 783.99, 1046.5].forEach((f, i) => this.nota(f, 0.25 + i * 0.09, 2.4 - i * 0.2, 0.045, 0.4)); this.barrido(0.05, 0.9, 400, 3200, 0.03); this.nota(2093, 1.0, 1.6, 0.018, 0.2); },
  desbloqueo() { if (!this.on) return; this.nota(880, 0, 0.5, 0.07); this.nota(1318.5, 0.07, 0.7, 0.06); this.barrido(0, 0.35, 1200, 4000, 0.03); },
  error() { if (!this.on) return; this.nota(311.1, 0, 0.16, 0.08, 0.2); this.nota(293.7, 0.11, 0.2, 0.08, 0.2); },
  nivel(i) { if (!this.on) return; const esc = [392, 440, 493.88, 587.33, 659.26, 783.99, 880, 987.77, 1174.66, 1318.51]; this.nota(esc[Math.max(0, Math.min(9, i - 1))] || 659, 0, 0.3, 0.08); }
};
function estallido(el, grande) {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const r = el.getBoundingClientRect(); const n = grande ? 16 : 9;
  for (let i = 0; i < n; i++) {
    const p = document.body.createDiv('orb-chispa'); const a = (i / n) * Math.PI * 2 + Math.random() * 0.4; const d = (grande ? 46 : 26) + Math.random() * (grande ? 30 : 14);
    p.style.left = (r.left + r.width / 2) + 'px'; p.style.top = (r.top + r.height / 2) + 'px';
    p.style.setProperty('--dx', Math.cos(a) * d + 'px'); p.style.setProperty('--dy', Math.sin(a) * d + 'px');
    if (grande && i % 3 === 0) p.addClass('grande');
    setTimeout(() => p.remove(), 700);
  }
}

/* =========================================================
   MOTOR DEL MAPA · órbitas, estrellas y globo de alambre
   ========================================================= */
function textura(r, fn) { const c = document.createElement('canvas'); c.width = c.height = r * 2; fn(c.getContext('2d'), r); return c; }
const BRILLO = textura(32, (g, r) => { const gr = g.createRadialGradient(r, r, 0, r, r, r); gr.addColorStop(0, 'rgba(255,255,255,0.95)'); gr.addColorStop(0.18, 'rgba(255,255,255,0.55)'); gr.addColorStop(0.45, 'rgba(255,255,255,0.12)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, r * 2, r * 2); });
function azar(semilla) { let h = 2166136261; const s = String(semilla); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return () => { h += 0x6D2B79F5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/* (Escena del mapa antiguo eliminada en la limpieza del 15-11) */
const FUENTE_MONO = '"JetBrains Mono", "IBM Plex Mono", "SF Mono", Consolas, ui-monospace, monospace';
const FUENTE_SANS = '"Inter", "Segoe UI Variable Text", "Segoe UI", -apple-system, system-ui, sans-serif';

/* ---------- Intro ---------- */
/* =========================================================
   INTRO «LIQUID» + PANTALLA DE BLOQUEO (al abrir Obsidian)
   Con los colores de ÓRBITA: crema en el tema claro, café en el oscuro.
   La contraseña se guarda solo como huella (SHA-256 con sal), nunca en claro.
   Es un bloqueo de la vista: las notas siguen siendo archivos normales.
   ========================================================= */
const FONDOS_INTRO = {};
function fondoIntro(claro) { // manchas de color muy difuminadas, pintadas pequeñas (rápido) y escaladas por CSS
  const k = claro ? 'claro' : 'oscuro'; if (FONDOS_INTRO[k]) return FONDOS_INTRO[k];
  const W = 480, H = 300; const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  const capa = document.createElement('canvas'); capa.width = W; capa.height = H; const m = capa.getContext('2d');
  const mancha = (x, y, r, rgb, a) => { const gr = m.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(1, `rgba(${rgb},0)`); m.fillStyle = gr; m.beginPath(); m.arc(x, y, r, 0, 6.3); m.fill(); };
  if (claro) {
    g.fillStyle = '#ebe6de'; g.fillRect(0, 0, W, H);
    mancha(W * .2, H * .25, W * .45, '255,253,248', .9); mancha(W * .82, H * .2, W * .38, '233,196,106', .32); mancha(W * .7, H * .85, W * .45, '79,168,137', .26);
    mancha(W * .12, H * .9, W * .35, '232,128,95', .2); mancha(W * .5, H * .5, W * .3, '216,203,184', .5);
  } else {
    g.fillStyle = '#111113'; g.fillRect(0, 0, W, H);
    mancha(W * .25, H * .28, W * .55, '38,38,42', .95); mancha(W * .78, H * .72, W * .5, '30,30,33', .9); mancha(W * .5, H * .45, W * .32, '58,56,60', .45);
    mancha(W * .82, H * .2, W * .3, '52,46,42', .35); mancha(W * .15, H * .9, W * .3, '24,24,27', .8);
  }
  if ('filter' in g) g.filter = 'blur(28px)'; g.drawImage(capa, 0, 0); if ('filter' in g) g.filter = 'none';
  return (FONDOS_INTRO[k] = c.toDataURL('image/jpeg', 0.9));
}
async function huella(texto, sal) {
  try { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(sal + '·' + texto)); return Array.from(new Uint8Array(b)).map((x) => x.toString(16).padStart(2, '0')).join(''); }
  catch (e) { let h = 2166136261; const s = sal + '·' + texto; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return 'f' + (h >>> 0).toString(16); }
}
// Portada: se pone en el primer instante del arranque (antes de que Obsidian pinte nada) y la intro la sustituye
function portadaArranque() {
  if (document.body.querySelector('.orb-portada')) return;
  let claro = true; try { claro = window.localStorage.getItem('orbita-tema') !== 'oscuro'; } catch (e) { /* nada */ }
  const p = document.body.createDiv('orb-portada'); p.style.background = claro ? '#ebe6de' : '#111113';
}
function quitarPortada() { document.querySelectorAll('.orb-portada').forEach((p) => { p.addClass('fuera'); setTimeout(() => p.remove(), 450); }); }
async function introApple(plugin, bloquear) {
  if (document.body.querySelector('.orb-lg')) { quitarPortada(); return; }
  const aj = plugin.ajustes; const crear = bloquear && !aj.clave; const claro = esClaro();
  const reducido = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ov = document.body.createDiv('orb-lg ' + (claro ? 'claro' : 'oscuro')); if (reducido) ov.addClass('quieto');
  const fondo = ov.createDiv('orb-lg-fondo'); try { fondo.style.backgroundImage = 'url(' + fondoIntro(claro) + ')'; } catch (e) { /* color liso */ }
  // Escena: esfera de cristal + órbitas + marca
  const esc = ov.createDiv('orb-lg-escena');
  const NS = 'http://www.w3.org/2000/svg'; const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '-220 -220 440 440'); svg.setAttribute('class', 'orb-lg-orbitas'); esc.appendChild(svg);
  const elipse = (rx, ry, rot, cls) => { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', `M ${-rx} 0 A ${rx} ${ry} 0 1 0 ${rx} 0 A ${rx} ${ry} 0 1 0 ${-rx} 0`); p.setAttribute('transform', `rotate(${rot})`); p.setAttribute('class', cls); p.setAttribute('pathLength', '1'); svg.appendChild(p); };
  elipse(200, 62, -16, 'orb-lg-anillo r1'); elipse(168, 102, 24, 'orb-lg-anillo r2');
  const grupo = document.createElementNS(NS, 'g'); grupo.setAttribute('transform', 'rotate(-16)'); svg.appendChild(grupo);
  const luna = document.createElementNS(NS, 'circle'); luna.setAttribute('r', '5'); luna.setAttribute('class', 'orb-lg-luna'); grupo.appendChild(luna);
  const mov = document.createElementNS(NS, 'animateMotion'); mov.setAttribute('dur', '6s'); mov.setAttribute('repeatCount', 'indefinite'); mov.setAttribute('path', 'M -200 0 A 200 62 0 1 0 200 0 A 200 62 0 1 0 -200 0'); luna.appendChild(mov);
  const marca = esc.createDiv('orb-lg-marca'); 'ÓRBITA'.split('').forEach((l, i) => { const s = marca.createSpan({ text: l }); s.style.animationDelay = (i * 0.06) + 's'; });
  // La esfera es un solo elemento que pasa de la intro al avatar
  const orbe = ov.createDiv('orb-lg-orbe'); orbe.createDiv('orb-lg-brillo'); orbe.createDiv({ cls: 'orb-lg-inicial', text: NOMBRE.charAt(0) });
  const aro = ov.createDiv('orb-lg-aro'); // anillo fino que gira alrededor del avatar
  // Bloqueo: saludo, nombre, contraseña
  const login = ov.createDiv('orb-lg-login');
  login.createDiv({ cls: 'orb-lg-hola', text: saludo() });
  login.createDiv({ cls: 'orb-lg-nombre', text: NOMBRE });
  const campo = login.createEl('form', { cls: 'orb-lg-campo' });
  const inp = campo.createEl('input', { attr: { type: 'password', autocomplete: 'off', spellcheck: 'false', placeholder: crear ? 'Elige tu contraseña' : 'Contraseña' } });
  const ir = campo.createEl('button', { cls: 'orb-lg-ir', attr: { type: 'submit', 'aria-label': 'Entrar' } }); ob.setIcon(ir, 'arrow-right');
  const pista = login.createDiv({ cls: 'orb-lg-pista', text: crear ? 'Es la primera vez: la que escribas será tu contraseña.' : '' });
  const olvido = login.createEl('button', { cls: 'orb-lg-olvido', text: '¿La has olvidado?' });
  olvido.addEventListener('click', (e) => { e.preventDefault(); pista.setText('Díselo al Director en el chat y te la quita.'); });
  if (crear) olvido.style.display = 'none';
  ov.createDiv({ cls: 'orb-lg-pie', text: 'Ó R B I T A' });
  inp.addEventListener('input', () => { campo.toggleClass('con-texto', !!inp.value); campo.removeClass('error'); });

  let fase = 'intro'; let cerrado = false; const tiempos = [];
  const teclas = (e) => {
    if (fase === 'intro') { e.preventDefault(); e.stopPropagation(); siguiente(); return; }
    if (e.target !== inp) { e.stopPropagation(); if (e.key.length === 1 || e.key === 'Backspace') inp.focus(); }
  };
  window.addEventListener('keydown', teclas, true);
  const salir = () => {
    if (cerrado) return; cerrado = true; tiempos.forEach(clearTimeout); window.removeEventListener('keydown', teclas, true);
    if (bloquear) { try { window.localStorage.setItem('orbita-desbloqueo', String(Date.now())); } catch (e) { /* */ } }
    if (SON && SON.desbloqueo) SON.desbloqueo();
    ov.addClass('saliendo'); document.body.addClass('orb-lg-entra');
    setTimeout(() => { ov.remove(); document.body.removeClass('orb-lg-entra'); if (plugin.ajustarCapa) plugin.ajustarCapa(); }, reducido ? 50 : 950);
  };
  const bloqueo = () => { if (fase === 'bloqueo') return; fase = 'bloqueo'; tiempos.forEach(clearTimeout); ov.addClass('a1', 'a2', 'a3', 'fase-bloqueo'); setTimeout(() => inp.focus(), reducido ? 0 : 700); };
  const siguiente = () => { if (fase !== 'intro') return; if (bloquear) bloqueo(); else salir(); };
  ov.addEventListener('click', (e) => { if (fase === 'intro') siguiente(); else if (!login.contains(e.target)) inp.focus(); });

  campo.addEventListener('submit', async (e) => {
    e.preventDefault(); const v = inp.value; if (!v) return;
    const mal = (texto) => { campo.removeClass('error'); void campo.offsetWidth; campo.addClass('error'); inp.value = ''; campo.removeClass('con-texto'); if (texto) pista.setText(texto); if (SON && SON.error) SON.error(); };
    if (crear && !aj.clave) {
      if (v.length < 4) { mal('Mínimo 4 caracteres.'); return; }
      const sal = Array.from(crypto.getRandomValues(new Uint8Array(12))).map((x) => x.toString(16).padStart(2, '0')).join('');
      aj.clave = { sal, h: await huella(v, sal) }; await plugin.guardar(); salir(); return;
    }
    if (await huella(v, aj.clave.sal) === aj.clave.h) salir(); else mal('Contraseña incorrecta.');
  });

  // Línea de tiempo (empieza cuando Obsidian ya ha pintado, para que no dé tirones)
  const empezar = () => {
    quitarPortada();
    if (SON && SON.arranque) SON.arranque();
    if (reducido) { ov.addClass('a1', 'a2', 'a3'); tiempos.push(setTimeout(siguiente, 700)); return; }
    ov.addClass('a1');
    tiempos.push(setTimeout(() => ov.addClass('a2'), 500));
    tiempos.push(setTimeout(() => ov.addClass('a3'), 1350));
    tiempos.push(setTimeout(siguiente, 3300));
  };
  requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(empezar, 120)));
}



/* =========================================================
   VISTAS
   ========================================================= */
class VistaBase extends ob.ItemView {
  constructor(leaf, plugin) { super(leaf); this.plugin = plugin; this.navigation = false; }
  async onOpen() {
    this.contentEl.addClass('orb-vista');
    const re = () => { clearTimeout(this._t); this._t = setTimeout(() => { if (Date.now() - (this._silencio || 0) < 1500) return; this.pintar(); }, 250); };
    this.registerEvent(this.app.vault.on('modify', re));
    this.registerEvent(this.app.vault.on('create', re));
    this.registerEvent(this.app.vault.on('delete', re));
    this.registerEvent(this.app.vault.on('rename', re));
    await this.pintar();
  }
  async onClose() { clearTimeout(this._t); const h = this.containerEl; if (h && h.querySelectorAll) h.querySelectorAll(':scope > .orb-dock, :scope > .orb-rail').forEach((e) => e.remove()); }
  cabecera(raiz, titulo, sub) {
    const h = raiz.createDiv('orb-cab');
    const izq = h.createDiv('orb-cab-izq');
    izq.createDiv({ cls: 'orb-cab-sub', text: sub || fechaLarga() });
    izq.createEl('h1', { cls: 'orb-cab-titulo', text: titulo });
    this.barraSuperior(raiz, h);
    this.dock();
    return h;
  }
  // Barra superior oscura: saludo, qué toca ahora y acceso al calendario
  barraSuperior(raiz, antesDe) {
    const b = createDiv('orb-sup'); raiz.insertBefore(b, antesDe);
    const izq = b.createDiv('orb-sup-izq'); izq.createDiv({ cls: 'orb-sup-av', text: NOMBRE.charAt(0) }); izq.createSpan({ text: 'Hola, ' + NOMBRE });
    const centro = b.createDiv('orb-sup-centro'); centro.createSpan('orb-sup-orbe'); const txt = centro.createSpan({ cls: 'orb-sup-txt', text: '…' });
    centro.addEventListener('click', () => this.plugin.abrir(V.semana));
    const oscuro = this.plugin.ajustes && this.plugin.ajustes.tema === 'oscuro';
    const der = b.createEl('button', { cls: 'orb-sup-btn', attr: { 'aria-label': 'Tema claro u oscuro' } }); ob.setIcon(der, oscuro ? 'sun' : 'moon');
    der.addEventListener('click', () => { if (this.plugin.alternarTema) this.plugin.alternarTema(); });
    eventosDe(this.app, [hoyISO()]).then((cal) => { const { ahora, luego } = ahoraYLuego(cal.eventos[hoyISO()] || []); txt.setText(ahora ? 'Ahora · ' + ahora.titulo : luego ? 'A las ' + hm(luego.ini) + ' · ' + luego.titulo : 'Nada más por hoy'); }).catch(() => txt.setText(''));
  }
  // Pestañas de abajo y barra lateral: son fijas (del plugin), así la pastilla se desliza sin parpadeo
  dock() { if (this.plugin.nav) this.plugin.nav(this.getViewType()); }

  entrada(w) { if (!this._entrado) { w.addClass('orb-entra'); this._entrado = true; } }
  enlace(el, ruta) { el.addClass('orb-enlace'); el.addEventListener('click', (e) => { e.stopPropagation(); this.app.workspace.openLinkText(ruta, '', false); }); }
}

/* Colores de cada bloque de Hoy (los mismos en toda la app) */
const PALETA = { dia: '#e9c46a', cuerpo: '#7fc8a0', mente: '#b9a3e3', estudios: '#86aee8', calma: '#6fd0d0', relaciones: '#f08a6c', noche: '#8a7ff0', dinero: '#e0a458' };
const COLOR = { rana: PALETA.dia, top: PALETA.estudios, rutinas: PALETA.cuerpo, otras: '#c9c9c9', estado: PALETA.mente, agenda: PALETA.calma, fenix: PALETA.relaciones };
function tarjeta(parent, clave, icono, titulo, extra) {
  const c = parent.createDiv('orb-card'); c.style.setProperty('--c', COLOR[clave] || '#ccc'); c.dataset.clave = clave;
  const h = c.createDiv('orb-card-cab');
  const i = h.createSpan('orb-card-ic'); ob.setIcon(i, icono);
  h.createSpan({ cls: 'orb-card-t', text: titulo });
  const der = h.createSpan('orb-card-der'); if (extra) der.setText(extra);
  c.der = der; c.cuerpo = c.createDiv('orb-card-body');
  return c;
}

// ---------- «El equipo te pregunta»: avisos de la revisión de la noche, con respuesta desde Obsidian ----------
async function leerAvisos(app, fechas) {
  const out = [];
  for (const fecha of fechas) {
    const t = await leer(app, rutaDia(fecha)); if (!t) continue;
    const ls = t.split('\n'); let en = false;
    ls.forEach((l, i) => {
      if (/^## /.test(l)) { en = /avisos del equipo/i.test(sinAcentos(l)); return; }
      if (!en) return;
      const m = l.match(/^- (\d{1,2}:\d{2}) · ([^·]+?) · (.*)$/); if (!m) return;
      const sub = []; for (let k = i + 1; k < ls.length && /^\s+- /.test(ls[k]); k++) sub.push(ls[k].trim().replace(/^- /, ''));
      const pq = m[3].match(/Pregunta: «([^»]+)»/);
      const visto = m[3].split(' · Pregunta:')[0].trim();
      const prop = sub.filter((x) => /^Propuesta/i.test(x) && /¿te vale\?/.test(x)).pop();
      const pendiente = /pendiente de respuesta/i.test(m[3]);
      out.push({ fecha, i, hora: m[1], agente: m[2].trim(), visto, pregunta: pq ? pq[1] : '', pendiente, propuesta: prop ? prop.replace(/^Propuesta[^:]*:\s*/, '').replace(/\s*·\s*¿te vale\?.*$/, '').replace(/^«|»$/g, '') : '', respuestas: sub.filter((x) => /^(Mi respuesta|Respuesta de )/i.test(x)) });
    });
  }
  return out;
}
async function responderAviso(app, av, texto, acepta) {
  const f = archivo(app, rutaDia(av.fecha)); if (!f) return;
  const ahora = new Date(); const h = p2(ahora.getHours()) + ':' + p2(ahora.getMinutes());
  await app.vault.process(f, (t) => {
    const ls = t.split('\n'); const l = ls[av.i]; if (!l || !l.startsWith('- ' + av.hora)) return t;
    let k = av.i + 1; while (k < ls.length && /^\s+- /.test(ls[k])) k++;
    ls.splice(k, 0, '  - Mi respuesta (' + h + '): ' + texto.replace(/\n+/g, ' '));
    if (acepta) {
      ls[av.i] = l.replace(/ · (pendiente de respuesta|respondido)\s*$/, '') + ' · acordado: «' + av.propuesta + '»';
      for (let j = av.i + 1; j < k + 1; j++) if (/¿te vale\?/.test(ls[j])) ls[j] = ls[j].replace(/\s*·\s*¿te vale\?/, ' · aceptada');
    } else ls[av.i] = l.replace(/pendiente de respuesta\s*$/, 'respondido');
    return ls.join('\n');
  });
}
const COLOR_AGENTE = { director: PALETA.noche, mentor: PALETA.dia, entrenador: PALETA.estudios, skincare: PALETA.cuerpo, coach: PALETA.mente, estudio: PALETA.relaciones, estratega: PALETA.dinero };

// ---------- Rachas: días seguidos cumpliendo cada cosa ----------
function claveTarea(texto) {
  const t = sinAcentos(limpiar(texto)).toLowerCase().split(/[:(«]/)[0].replace(/[^a-z0-9ñ ]/g, ' ').trim();
  return t.split(/\s+/).slice(0, 3).join(' ');
}
async function calcularRachas(app, fecha, dias) {
  dias = dias || 30;
  const fechas = []; for (let i = 1; i <= dias; i++) fechas.push(iso(sumarDias(deISO(fecha), -i)));
  const notas = await Promise.all(fechas.map((f) => leerDia(app, f)));
  const mapa = (d) => { const m = {}; if (!d) return m; if (d.rana) m.rana = d.rana.hecha; d.tareas.forEach((x) => { if (x === d.rana) return; const k = claveTarea(x.texto); if (k) m[k] = m[k] || x.hecha; }); return m; };
  const ms = notas.map(mapa);
  return (clave) => { let n = 0; for (const m of ms) { if (m[clave]) n++; else break; } return n; };
}

// ---------- Revisión de la semana (domingo) ----------
function revisarSemana(app) { new RevisionModal(app).open(); }
class RevisionModal extends ob.Modal {
  constructor(app) { super(app); this.v = { mejor: '', cambio: '', rana: '' }; }
  async onOpen() {
    const hoy = hoyISO(); const c = this.contentEl; c.empty(); this.modalEl.addClass('orb-cierre-modal', 'orb-rev-modal');
    const fechas = []; for (let i = 6; i >= 0; i--) fechas.push(iso(sumarDias(deISO(hoy), -i)));
    const ds = await Promise.all(fechas.map((f) => leerDia(this.app, f)));
    const cab = c.createDiv('orb-ci-cab'); const ic = cab.createDiv('orb-ci-ic'); ob.setIcon(ic, 'calendar-check');
    const ct = cab.createDiv(); ct.createDiv({ cls: 'orb-ci-k', text: 'Revisión de la semana · ' + deISO(fechas[0]).getDate() + '-' + deISO(hoy).getDate() + '/' + (deISO(hoy).getMonth() + 1) });
    const hechas = ds.reduce((a, d) => a + (d ? d.hechas : 0), 0), total = ds.reduce((a, d) => a + (d ? d.total : 0), 0);
    const ranas = ds.filter((d) => d && d.rana && d.rana.hecha).length; const conNota = ds.filter(Boolean).length;
    const an = ds.filter((d) => d && d.animo).map((d) => d.animo); const media = an.length ? (an.reduce((a, b) => a + b, 0) / an.length) : null;
    ct.createDiv({ cls: 'orb-ci-tit', text: (total ? Math.round(hechas / total * 100) : 0) + '% cumplido · ' + ranas + ' de 7 ranas' });
    // barras por día
    const bars = c.createDiv('orb-rev-bars');
    ds.forEach((d, i) => { const col = bars.createDiv('orb-rev-col'); const p = d && d.total ? d.hechas / d.total : 0; const b = col.createDiv('orb-rev-bar' + (d ? '' : ' vacia')); b.style.height = Math.max(4, Math.round(p * 70)) + 'px'; if (d && d.rana && d.rana.hecha) b.addClass('rana');
      col.createDiv({ cls: 'orb-rev-pct', text: d ? Math.round(p * 100) + '%' : '—' }); col.createDiv({ cls: 'orb-rev-dia', text: capital(DIAS[deISO(fechas[i]).getDay()]).slice(0, 3) }); });
    const dat = c.createDiv('orb-rev-datos');
    const dato = (n, t) => { const x = dat.createDiv('orb-rev-dato'); x.createDiv({ cls: 'orb-rev-n', text: n }); x.createDiv({ cls: 'orb-rev-t', text: t }); };
    dato(conNota + '/7', 'días con nota'); dato(media ? media.toFixed(1).replace('.', ',') : '—', 'ánimo medio'); dato(String(ds.filter((d) => d && d.balance).length), 'cierres hechos');
    // lo que más se cae / lo más constante
    const cuenta = {}; ds.forEach((d) => { if (!d) return; d.rutinas.forEach((x) => { const k = claveTarea(x.texto); cuenta[k] = cuenta[k] || { t: limpiar(x.texto).split(/[:(«]/)[0].trim(), si: 0, n: 0 }; cuenta[k].n++; if (x.hecha) cuenta[k].si++; }); });
    const arr = Object.values(cuenta).filter((x) => x.n >= 3).sort((a, b) => a.si / a.n - b.si / b.n);
    if (arr.length) { const l = c.createDiv('orb-rev-lista');
      const fila = (x, k) => { const r = l.createDiv('orb-rev-fila ' + k); r.createSpan({ cls: 'orb-rev-fila-t', text: x.t }); r.createSpan({ cls: 'orb-rev-fila-v', text: x.si + '/' + x.n }); };
      l.createDiv({ cls: 'orb-ci-k', text: 'Lo que más se cae' }); arr.slice(0, 2).forEach((x) => fila(x, 'baja'));
      l.createDiv({ cls: 'orb-ci-k', text: 'Lo más constante' }); arr.slice(-2).reverse().forEach((x) => fila(x, 'alta')); }
    const campo = (clave, nombre, ph) => { const f = c.createDiv('orb-ci-campo'); f.createDiv({ cls: 'orb-ci-n', text: nombre }); const t = f.createEl('textarea', { cls: 'orb-ci-txt', attr: { rows: '2', placeholder: ph } }); t.addEventListener('input', () => { this.v[clave] = t.value.trim(); }); };
    campo('mejor', 'Lo mejor de la semana', 'Aunque sea pequeño');
    campo('cambio', 'Una cosa que cambio la semana que viene', 'Una sola, concreta');
    campo('rana', 'La rana de la semana', 'Lo más importante que quieres sacar adelante');
    const pie = c.createDiv('orb-ci-pie'); const ok = pie.createEl('button', { cls: 'orb-ci-ok', text: 'Guardar la revisión' });
    pie.createDiv({ cls: 'orb-ci-nota', text: 'Se guarda en 7_DIARIO/semanas y el Mentor la usa el lunes.' });
    ok.addEventListener('click', async () => {
      ok.disabled = true;
      const carpeta = CARPETAS.diario + '/semanas'; if (!this.app.vault.getAbstractFileByPath(carpeta)) await this.app.vault.createFolder(carpeta);
      const ruta = carpeta + '/semana_' + hoy + '.md';
      const txt = '# Semana ' + fechas[0] + ' → ' + hoy + '\n\n- Cumplido: ' + hechas + ' de ' + total + ' · ranas ' + ranas + '/7 · ánimo medio ' + (media ? media.toFixed(1) : '—') + '\n' + (arr.length ? '- Lo que más se cae: ' + arr.slice(0, 2).map((x) => x.t + ' ' + x.si + '/' + x.n).join(' · ') + '\n- Lo más constante: ' + arr.slice(-2).reverse().map((x) => x.t + ' ' + x.si + '/' + x.n).join(' · ') + '\n' : '') + '\n## Lo mejor\n' + (this.v.mejor || '—') + '\n\n## Cambio para la semana que viene\n' + (this.v.cambio || '—') + '\n\n## Rana de la semana\n' + (this.v.rana || '—') + '\n';
      const f = archivo(this.app, ruta); if (f) await this.app.vault.modify(f, txt); else await this.app.vault.create(ruta, txt);
      try { SON.completo(); } catch (e) { /* */ } this.close(); aviso('Revisión guardada. Buena semana, ' + NOMBRE + '.', 5000);
    });
  }
  onClose() { this.contentEl.empty(); }
}

function esMovil() { try { return !!(ob.Platform && ob.Platform.isPhone) || document.body.classList.contains('is-phone'); } catch (e) { return false; } }
class MasSheet extends ob.Modal {
  constructor(app, plugin) { super(app); this.plugin = plugin; }
  onOpen() {
    this.modalEl.addClass('orb-sheet'); const c = this.contentEl; c.empty();
    c.createDiv('orb-sheet-asa');
    c.createDiv({ cls: 'orb-sheet-t', text: 'Todo ÓRBITA' });
    const ir = (v) => { this.close(); this.plugin.irA(v); };
    const grupo = (titulo, items) => { c.createDiv({ cls: 'orb-sheet-k', text: titulo }); const g = c.createDiv('orb-sheet-grid');
      items.forEach(([n, ic, col, fn]) => { const b = g.createEl('button', { cls: 'orb-sheet-it' }); b.style.setProperty('--c', col); const i = b.createDiv('orb-sheet-ic'); ob.setIcon(i, ic); b.createDiv({ cls: 'orb-sheet-n', text: n }); b.addEventListener('click', fn); }); };
    grupo('Tu día', [['Progreso', 'activity', PALETA.cuerpo, () => ir(V.progreso)], ['Cerrar el día', 'moon', PALETA.noche, () => { this.close(); cerrarDia(this.app); }], ['Semana', 'calendar-check', PALETA.noche, () => { this.close(); revisarSemana(this.app); }]]);
    grupo('Cuerpo y mente', [['Calma', 'wind', PALETA.calma, () => ir(V.calma)], ['Voz', 'mic', PALETA.relaciones, () => ir(V.voz)], ['Formación', 'flame', PALETA.relaciones, () => ir(V.fenix)]]);
    grupo('Proyectos', [['Órbitas', 'target', PALETA.estudios, () => ir(V.orbitas)], ['Cerebro', 'brain', PALETA.mente, () => ir(V.mapa)], ['Equipo', 'users', PALETA.mente, () => ir(V.casas)], ['Guía', 'help-circle', '#c9c9c9', () => { this.close(); this.app.workspace.openLinkText(NOTAS.guia, '', false); }]]);
    const pie = c.createDiv('orb-sheet-pie');
    const tema = pie.createEl('button', { cls: 'orb-sheet-btn', text: this.plugin.ajustes.tema === 'oscuro' ? 'Tema claro' : 'Tema oscuro' }); tema.addEventListener('click', async () => { await this.plugin.alternarTema(); this.close(); });
    const notas = pie.createEl('button', { cls: 'orb-sheet-btn', text: 'Mis notas' }); notas.addEventListener('click', () => { this.close(); try { this.app.commands.executeCommandById('file-explorer:open'); } catch (e) { /* */ } });
  }
  onClose() { this.contentEl.empty(); }
}
class HoyView extends VistaBase {
  getViewType() { return V.hoy; } getDisplayText() { return 'Hoy'; } getIcon() { return 'sun'; }
  async pintar() {
    const fecha = hoyISO();
    const [d, tormenta, cal, fx] = await Promise.all([leerDia(this.app, fecha), leerModoTormenta(this.app), eventosDe(this.app, [fecha]), leerFenix(this.app)]);
    const evs = cal.eventos[fecha] || [];
    if (esMovil()) return this.pintarMovil(fecha, d, tormenta, evs);
    const raiz = this.contentEl; const scroll = raiz.scrollTop; raiz.empty();
    const w = raiz.createDiv('orb-hoja ancha orb-hoy'); this.entrada(w);
    this.cabecera(w, saludo() + ', ' + NOMBRE);
    if (deISO(fecha).getDay() === 0) { const rv = w.createDiv('orb-rev-aviso'); rv.createSpan({ text: 'Hoy es domingo: toca la revisión de la semana (10 min).' }); const b = rv.createEl('button', { cls: 'orb-btn principal', text: 'Hacer la revisión' }); b.addEventListener('click', () => revisarSemana(this.app)); }
    if (tormenta) { const t = w.createDiv('orb-tormenta'); t.createSpan({ cls: 'orb-tormenta-t', text: 'Modo tormenta' }); t.createSpan({ text: ' · Hoy cuenta como cumplido si te levantas, te mueves 20 minutos, comes y duermes a tu hora.' }); }
    if (!d) {
      const v = w.createDiv('orb-vacio');
      v.createDiv({ cls: 'orb-vacio-t', text: 'Todavía no hay nota de hoy' });
      v.createDiv({ cls: 'orb-vacio-s', text: 'Créala y empieza por la rana.' });
      const b = v.createEl('button', { cls: 'orb-btn principal', text: 'Crear la nota de hoy' });
      b.addEventListener('click', async () => { await crearDia(this.app, fecha); this.pintar(); });
      return;
    }
    // 1 · Resumen del día: lo hecho, de un vistazo
    this.grupos = {};
    const res = w.createDiv('orb-resumen');
    const anillo = res.createDiv('orb-anillo-dia'); this.anillo = anillo;
    anillo.createDiv('orb-anillo-n'); anillo.createDiv({ cls: 'orb-anillo-l', text: 'del día' });
    const chips = res.createDiv('orb-res-chips');
    const chip = (clave, nombre, tareas) => {
      const c = chips.createDiv('orb-res-chip'); c.style.setProperty('--c', COLOR[clave]);
      c.createDiv({ cls: 'orb-res-chip-n', text: nombre }); const v = c.createDiv('orb-res-chip-v');
      this.grupos[clave] = { tareas, v }; return c;
    };
    chip('rana', 'Rana', d.rana ? [d.rana] : []);
    chip('top', 'Prioridades', d.top);
    chip('rutinas', 'Rutinas', d.rutinas);
    const ce = chips.createDiv('orb-res-chip'); ce.style.setProperty('--c', COLOR.estado); ce.createDiv({ cls: 'orb-res-chip-n', text: 'Ánimo' }); this.animoV = ce.createDiv({ cls: 'orb-res-chip-v', text: d.animo ? d.animo + '/10' : '—' });
    this.todas = d.tareas; this.refrescarResumen();
    await this.equipoPregunta(w, fecha);
    // 2 · Dos columnas: hacer (izquierda) y saber (derecha)
    const cols = w.createDiv('orb-hoy-cols');
    const izq = cols.createDiv('orb-hoy-col'); const der = cols.createDiv('orb-hoy-col');
    let racha = () => 0; try { racha = await calcularRachas(this.app, fecha); } catch (e) { /* sin historial */ }
    const insignia = (padre, clave, hecha) => { const n = racha(clave) + (hecha ? 1 : 0); if (n >= 2) { const b = padre.createSpan({ cls: 'orb-racha' + (n >= 7 ? ' alta' : ''), attr: { title: n + ' días seguidos' } }); const ic = b.createSpan('orb-racha-i'); ob.setIcon(ic, 'flame'); b.createSpan({ text: String(n) }); } else if (!hecha && racha(clave) >= 2) { /* nada */ } };
    // Rana
    const rc = tarjeta(izq, 'rana', 'star', 'La rana', 'lo primero del día');
    if (d.rana) {
      const fila = rc.cuerpo.createDiv('orb-rana-fila' + (d.rana.hecha ? ' hecha' : ''));
      const c = fila.createDiv('orb-check grande' + (d.rana.hecha ? ' on' : ''));
      fila.createDiv({ cls: 'orb-rana-txt', text: d.rana.texto });
      insignia(fila, 'rana', d.rana.hecha);
      fila.addEventListener('click', () => this.marcar(fecha, d.rana, fila, c, true));
    } else rc.cuerpo.createDiv({ cls: 'orb-tenue', text: 'Sin rana. Escríbela en la nota de hoy.' });
    // Listas
    const lista = (clave, icono, titulo, tareas) => {
      if (!tareas.length) return;
      const t = tarjeta(izq, clave, icono, titulo); this.grupos[clave] = this.grupos[clave] || { tareas }; this.grupos[clave].der = t.der;
      tareas.forEach((x) => {
        const f = t.cuerpo.createDiv('orb-tarea' + (x.hecha ? ' hecha' : ''));
        const ck = f.createDiv('orb-check' + (x.hecha ? ' on' : ''));
        f.createDiv({ cls: 'orb-tarea-txt', text: x.texto });
        if (clave === 'rutinas') insignia(f, claveTarea(x.texto), x.hecha);
        f.addEventListener('click', () => this.marcar(fecha, x, f, ck, false));
      });
    };
    lista('top', 'flag', 'Prioridades', d.top); lista('rutinas', 'repeat', 'Rutinas', d.rutinas); lista('otras', 'list', 'Otras tareas', d.otras);
    this.refrescarResumen();
    // Derecha: ahora, agenda, cómo estoy, Fénix
    bloqueAhora(der, evs, this.plugin);
    if (evs.length) {
      const ag = tarjeta(der, 'agenda', 'calendar-days', 'Agenda de hoy');
      const ver = ag.der.createEl('button', { cls: 'orb-mini-btn', text: 'Calendario' }); ver.addEventListener('click', () => this.plugin.abrir(V.semana));
      const { v } = ahoraYLuego(evs);
      evs.forEach((e) => { const f = ag.cuerpo.createDiv('orb-agenda tipo-' + e.tipo + (e.fin <= v ? ' pasado' : e.ini <= v ? ' ahora' : '')); f.createDiv({ cls: 'orb-agenda-h', text: hm(e.ini) }); f.createDiv({ cls: 'orb-agenda-marca' }); f.createDiv({ cls: 'orb-agenda-t', text: e.titulo }); });
    }
    const est = tarjeta(der, 'estado', 'heart', 'Cómo estoy');
    const escala = (nombre, etiqueta, valor) => {
      const fila = est.cuerpo.createDiv('orb-escala'); fila.createDiv({ cls: 'orb-escala-n', text: nombre });
      const pts = fila.createDiv('orb-escala-pts');
      for (let i = 1; i <= 10; i++) {
        const p = pts.createEl('button', { cls: 'orb-punto' + (valor && i <= valor ? ' on' : '') + (valor === i ? ' actual' : ''), text: String(i) });
        p.setAttr('aria-label', nombre + ' ' + i);
        p.addEventListener('click', async () => {
          pts.querySelectorAll('.orb-punto').forEach((x, j) => { x.toggleClass('on', j < i); x.toggleClass('actual', j === i - 1); });
          p.removeClass('pulso'); void p.offsetWidth; p.addClass('pulso'); SON.nivel(i);
          if (etiqueta === 'Ánimo' && this.animoV) this.animoV.setText(i + '/10');
          this._silencio = Date.now(); await ponerValor(this.app, fecha, etiqueta, String(i));
        });
      }
    };
    escala('Ánimo', 'Ánimo', d.animo); escala('Energía', 'Energía', d.energia);
    const fxc = tarjeta(der, 'fenix', 'flame', 'Formación', fx ? 'módulo ' + fx.actual + '/' + fx.total : '');
    fxc.cuerpo.createDiv({ cls: 'orb-meta-t' + (d.meta ? '' : ' vacia'), text: d.meta || 'Escribe tu meta principal en presente («Gano 40 € al mes con mis encargos»).' });
    if (fx && fx.principios.length) {
      const hoyN = Math.floor((deISO(fecha) - new Date(2026, 0, 1)) / 864e5); const k = ((hoyN % fx.principios.length) + fx.principios.length) % fx.principios.length;
      const pr = fxc.cuerpo.createDiv('orb-principio'); pr.createSpan({ cls: 'orb-principio-k', text: 'Principio de hoy · ' }); pr.createSpan({ text: fx.principios[k] });
    }
    fxc.addClass('orb-enlace'); fxc.addEventListener('click', () => this.app.workspace.openLinkText(rutaDia(fecha), '', false));
    if (d.mensaje) { const m = der.createDiv('orb-mensaje'); m.setText(d.mensaje); }
    // Acciones
    const acc = w.createDiv('orb-acciones');
    const nota = acc.createEl('button', { cls: 'orb-btn', text: 'Abrir la nota de hoy' }); nota.addEventListener('click', () => this.app.workspace.openLinkText(rutaDia(fecha), '', false));
    const cierre = acc.createEl('button', { cls: 'orb-btn principal', text: 'Cerrar el día' }); cierre.addEventListener('click', () => cerrarDia(this.app));
    raiz.scrollTop = scroll;
  }
  // ---------- Versión móvil de Hoy ----------
  async pintarMovil(fecha, d, tormenta, evs) {
    const raiz = this.contentEl; const scroll = raiz.scrollTop; raiz.empty();
    const w = raiz.createDiv('orb-hoja orb-m'); this.entrada(w);
    const f = deISO(fecha);
    const cab = w.createDiv('m-cab'); cab.createDiv({ cls: 'm-fecha', text: capital(DIAS[f.getDay()]) + ' ' + f.getDate() + ' · ' + saludo() });
    cab.createDiv({ cls: 'm-titulo', text: 'Hoy' });
    if (tormenta) { const t = w.createDiv('m-aviso'); t.createSpan({ cls: 'm-aviso-k', text: 'Modo tormenta' }); t.createSpan({ text: 'Levantarte, moverte, comer y dormir ya es cumplir.' }); }
    if (f.getDay() === 0) { const rv = w.createEl('button', { cls: 'm-aviso m-aviso-btn' }); rv.createSpan({ cls: 'm-aviso-k', text: 'Domingo' }); rv.createSpan({ text: 'Toca la revisión de la semana →' }); rv.addEventListener('click', () => revisarSemana(this.app)); }
    if (!d) { const v = w.createDiv('m-vacio'); v.createDiv({ text: 'Todavía no hay nota de hoy' }); const b = v.createEl('button', { cls: 'm-btn', text: 'Crearla' }); b.addEventListener('click', async () => { await crearDia(this.app, fecha); this.pintar(); }); return; }
    this.grupos = {}; this.todas = d.tareas;
    // Resumen
    const hero = w.createDiv('m-hero');
    const an = hero.createDiv('orb-anillo-dia m-anillo'); this.anillo = an; an.createDiv('orb-anillo-n'); an.createDiv({ cls: 'orb-anillo-l', text: 'hecho' });
    const hd = hero.createDiv('m-hero-d');
    const stat = (clave, nombre, tareas, txt) => { const c = hd.createDiv('m-stat'); c.style.setProperty('--c', COLOR[clave]); c.createSpan({ cls: 'm-stat-n', text: nombre }); const v = c.createSpan({ cls: 'm-stat-v', text: txt || '' }); if (tareas) this.grupos[clave] = { tareas, v }; return v; };
    stat('rana', 'Rana', d.rana ? [d.rana] : []); stat('top', 'Prioridades', d.top); stat('rutinas', 'Rutinas', d.rutinas);
    this.animoV = stat('estado', 'Ánimo', null, d.animo ? d.animo + '/10' : '—');
    this.refrescarResumen();
    // Ahora / luego
    const { ahora, luego, v: vmin } = ahoraYLuego(evs);
    const al = w.createEl('button', { cls: 'm-ahora' }); al.addEventListener('click', () => this.plugin.irA(V.semana));
    const l1 = al.createDiv('m-ahora-f'); l1.createSpan({ cls: 'm-punto vivo' }); l1.createSpan({ cls: 'm-ahora-k', text: 'Ahora' }); l1.createSpan({ cls: 'm-ahora-t', text: ahora ? ahora.titulo : 'Tiempo libre' });
    const l2 = al.createDiv('m-ahora-f'); l2.createSpan({ cls: 'm-punto' }); l2.createSpan({ cls: 'm-ahora-k', text: luego ? hm(luego.ini) : 'Luego' }); l2.createSpan({ cls: 'm-ahora-t', text: luego ? luego.titulo : 'Nada más hoy' });
    if (luego) l2.createSpan({ cls: 'm-ahora-en', text: 'en ' + duracion(luego.ini - vmin) });
    // El equipo te pregunta
    await this.equipoPregunta(w, fecha);
    // Rachas
    let racha = () => 0; try { racha = await calcularRachas(this.app, fecha); } catch (e) { /* */ }
    const llama = (padre, clave, hecha) => { const n = racha(clave) + (hecha ? 1 : 0); if (n >= 2) { const b = padre.createSpan({ cls: 'orb-racha' + (n >= 7 ? ' alta' : '') }); const ic = b.createSpan('orb-racha-i'); ob.setIcon(ic, 'flame'); b.createSpan({ text: String(n) }); } };
    // Rana
    if (d.rana) {
      const rc = w.createDiv('m-rana' + (d.rana.hecha ? ' hecha' : ''));
      const top = rc.createDiv('m-rana-top'); const ic = top.createSpan('m-rana-ic'); ob.setIcon(ic, 'star'); top.createSpan({ cls: 'm-rana-k', text: 'La rana · lo primero' }); llama(top, 'rana', d.rana.hecha);
      const fila = rc.createDiv('m-rana-fila'); const ck = fila.createDiv('orb-check grande' + (d.rana.hecha ? ' on' : '')); fila.createDiv({ cls: 'm-rana-t', text: d.rana.texto });
      rc.addEventListener('click', () => { this.marcar(fecha, d.rana, rc, ck, true); });
    }
    // Listas estilo app
    const lista = (clave, titulo, tareas) => {
      if (!tareas.length) return;
      const sec = w.createDiv('m-sec'); const sc = sec.createDiv('m-sec-cab'); sc.createSpan({ text: titulo }); const cnt = sc.createSpan({ cls: 'm-sec-n' });
      this.grupos[clave] = this.grupos[clave] || { tareas }; this.grupos[clave].der = cnt;
      const g = sec.createDiv('m-grupo'); g.style.setProperty('--c', COLOR[clave] || COLOR.otras);
      tareas.forEach((x) => {
        const r = g.createDiv('m-fila' + (x.hecha ? ' hecha' : '')); const ck = r.createDiv('orb-check' + (x.hecha ? ' on' : ''));
        r.createDiv({ cls: 'm-fila-t', text: x.texto });
        if (clave === 'rutinas') llama(r, claveTarea(x.texto), x.hecha);
        r.addEventListener('click', () => this.marcar(fecha, x, r, ck, false));
      });
    };
    lista('top', 'Prioridades', d.top); lista('rutinas', 'Rutinas', d.rutinas); lista('otras', 'Otras', d.otras);
    this.refrescarResumen();
    // Cómo estoy
    const est = w.createDiv('m-sec'); est.createDiv('m-sec-cab').createSpan({ text: 'Cómo estoy' });
    const eg = est.createDiv('m-grupo m-estado');
    const escala = (nombre, etiqueta, valor) => {
      const fila = eg.createDiv('m-esc'); fila.createDiv({ cls: 'm-esc-n', text: nombre }); const pts = fila.createDiv('m-esc-pts');
      for (let i = 1; i <= 10; i++) { const p = pts.createEl('button', { cls: 'm-esc-p' + (valor === i ? ' on' : ''), text: String(i) });
        p.addEventListener('click', async () => { pts.querySelectorAll('.m-esc-p').forEach((x, j) => x.toggleClass('on', j === i - 1)); try { SON.nivel(i); } catch (e) { /* */ } if (etiqueta === 'Ánimo' && this.animoV) this.animoV.setText(i + '/10'); this._silencio = Date.now(); await ponerValor(this.app, fecha, etiqueta, String(i)); }); }
    };
    escala('Ánimo', 'Ánimo', d.animo); escala('Energía', 'Energía', d.energia);
    // Cerrar el día
    const cb = w.createEl('button', { cls: 'm-btn grande' }); const ci = cb.createSpan(); ob.setIcon(ci, 'moon'); cb.createSpan({ text: 'Cerrar el día' }); cb.addEventListener('click', () => cerrarDia(this.app));
    raiz.scrollTop = scroll;
  }
  async equipoPregunta(w, fecha) {
    try {
      const ay = new Date(deISO(fecha)); ay.setDate(ay.getDate() - 1);
      const avs = (await leerAvisos(this.app, [iso(ay), fecha])).filter((a) => a.pendiente || a.propuesta);
      if (avs.length) {
        const eq = w.createDiv('orb-eq'); const cab = eq.createDiv('orb-eq-cab'); const ic = cab.createSpan('orb-eq-ic'); ob.setIcon(ic, 'message-circle');
        cab.createSpan({ cls: 'orb-eq-t', text: 'El equipo te pregunta' });
        avs.slice(-3).forEach((a) => {
          const col = COLOR_AGENTE[sinAcentos(a.agente).toLowerCase().split(' ')[0]] || '#c9c9c9';
          const c = eq.createDiv('orb-eq-item'); c.style.setProperty('--c', col);
          const q = c.createDiv('orb-eq-q'); const av = q.createDiv({ cls: 'orb-eq-av', text: a.agente.charAt(0) });
          const tx = q.createDiv('orb-eq-tx'); tx.createDiv({ cls: 'orb-eq-quien', text: a.agente + (a.fecha === fecha ? ' · hoy ' : ' · ayer ') + a.hora });
          if (a.visto) tx.createDiv({ cls: 'orb-eq-visto', text: a.visto });
          if (a.pregunta) tx.createDiv({ cls: 'orb-eq-preg', text: a.pregunta });
          a.respuestas.forEach((r) => c.createDiv({ cls: 'orb-eq-resp', text: 'Tú: ' + r.replace(/^(Mi respuesta|Respuesta de [^(]+) \([^)]*\):\s*/, '') }));
          if (a.propuesta) { const p = c.createDiv('orb-eq-prop'); p.createSpan({ cls: 'orb-eq-prop-k', text: 'Propuesta: ' }); p.createSpan({ text: a.propuesta }); }
          const f = c.createDiv('orb-eq-form');
          const ta = f.createEl('textarea', { cls: 'orb-eq-in', attr: { rows: '2', placeholder: a.propuesta ? 'Si prefieres otra cosa, cuéntalo aquí…' : 'Cuéntale qué ha pasado, sin filtro…' } });
          const bs = f.createDiv('orb-eq-bs');
          if (a.propuesta) { const si = bs.createEl('button', { cls: 'orb-eq-btn si', text: 'Me vale' }); si.addEventListener('click', async () => { await responderAviso(this.app, a, ta.value.trim() || 'me vale', true); try { SON.ok(); } catch (e) { /* */ } aviso('Acordado. ' + a.agente + ' lo apunta.'); this.pintar(); }); }
          const env = bs.createEl('button', { cls: 'orb-eq-btn', text: 'Responder' });
          env.addEventListener('click', async () => { const v = ta.value.trim(); if (!v) { ta.focus(); return; } await responderAviso(this.app, a, v, false); try { SON.ok(); } catch (e) { /* */ } aviso('Enviado. ' + a.agente + ' te contesta en la revisión de esta noche.'); this.pintar(); });
        });
      }
    } catch (e) { console.error('ÓRBITA avisos', e); }
  }
  refrescarResumen() {
    const todas = this.todas || []; const h = todas.filter((t) => t.hecha).length, tot = todas.length;
    const pct = tot ? Math.round(h / tot * 100) : 0;
    if (this.anillo) { this.anillo.style.setProperty('--p', pct); this.anillo.querySelector('.orb-anillo-n').setText(pct + '%'); }
    for (const k in (this.grupos || {})) {
      const g = this.grupos[k]; if (!g.tareas) continue; const gh = g.tareas.filter((t) => t.hecha).length;
      const txt = k === 'rana' ? (g.tareas.length ? (gh ? 'Hecha ✓' : 'Pendiente') : '—') : gh + ' de ' + g.tareas.length;
      if (g.v) { g.v.setText(txt); g.v.parentElement.toggleClass('completo', g.tareas.length > 0 && gh === g.tareas.length); }
      if (g.der) g.der.setText(gh + '/' + g.tareas.length);
    }
  }
  async marcar(fecha, t, fila, ck, esRana) {
    const on = !ck.hasClass('on'); t.hecha = on;
    ck.toggleClass('on', on); fila.toggleClass('hecha', on);
    ck.removeClass('recien'); void ck.offsetWidth; ck.addClass('recien');
    this.refrescarResumen();
    const todas = this.todas || [];
    if (on && todas.length && todas.every((x) => x.hecha)) setTimeout(() => { SON.completo(); aviso('Día completo. Buen trabajo, ' + NOMBRE + '.'); }, 380);
    if (on) { (esRana ? SON.rana() : SON.ok()); estallido(ck, esRana); } else SON.quitar();
    this._silencio = Date.now();
    await alternarTarea(this.app, fecha, t.linea);
    this.plugin.barraEstado && this.plugin.barraEstado();
  }
  agenda(w, evs) {
    if (!evs.length) return;
    const s = w.createDiv('orb-seccion'); const t = s.createDiv('orb-sec-cab'); t.createDiv({ cls: 'orb-etq', text: 'Agenda de hoy' });
    const ver = t.createEl('button', { cls: 'orb-mini-btn', text: 'Ver calendario' }); ver.addEventListener('click', () => this.plugin.abrir(V.semana));
    const { v } = ahoraYLuego(evs);
    evs.forEach((e) => { const f = s.createDiv('orb-agenda tipo-' + e.tipo + (e.fin <= v ? ' pasado' : e.ini <= v ? ' ahora' : '')); f.createDiv({ cls: 'orb-agenda-h', text: hm(e.ini) }); f.createDiv({ cls: 'orb-agenda-marca' }); f.createDiv({ cls: 'orb-agenda-t', text: e.titulo }); });
  }
}

const H_INI = 7 * 60, H_FIN = 25 * 60; // de 07:00 a 01:00
const NOMBRE_TIPO = { dinero: 'Dinero', cuerpo: 'Cuerpo', mente: 'Mente', relaciones: 'Relaciones', estudios: 'Estudios', nucleo: 'Núcleo', sesion: 'Sesión', cita: 'Cita', tarea: 'Tarea del día' };
class SemanaView extends VistaBase {
  getViewType() { return V.semana; } getDisplayText() { return 'Calendario'; } getIcon() { return 'calendar-days'; }
  // ---------- Versión móvil: agenda de un día, se desliza de lado ----------
  async pintarMovil() {
    const hoy = hoyISO(); if (!this.diaSel) this.diaSel = hoy; if (!this.pestana) this.pestana = 'semana';
    const lun = lunesDe(deISO(this.diaSel)); const fechas = Array.from({ length: 7 }, (_, i) => iso(sumarDias(lun, i)));
    const { eventos, notas } = await eventosDe(this.app, fechas);
    const raiz = this.contentEl; raiz.empty();
    const w = raiz.createDiv('orb-hoja orb-m orb-m-cal'); this.entrada(w);
    const sel = deISO(this.diaSel);
    const cab = w.createDiv('m-cab'); cab.createDiv({ cls: 'm-fecha', text: capital(sel.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })) }); cab.createDiv({ cls: 'm-titulo', text: 'Calendario' });
    const seg = w.createDiv('m-seg');
    [['semana', 'Agenda'], ['cuidado', 'Cuidado · piel y pelo']].forEach(([k, t]) => { const b = seg.createEl('button', { cls: 'm-seg-b' + (this.pestana === k ? ' on' : ''), text: t }); b.addEventListener('click', () => { if (this.pestana === k) return; this.pestana = k; try { SON.desliza(); } catch (e) { /* */ } this.pintar(); }); });
    if (this.pestana === 'cuidado') { await this.cuidado(w, fechas); return; }
    // tira de la semana
    const tira = w.createDiv('m-tira');
    const flecha = (ic, n) => { const b = tira.createEl('button', { cls: 'm-tira-fl' }); ob.setIcon(b, ic); b.addEventListener('click', () => { this.diaSel = iso(sumarDias(deISO(this.diaSel), n)); try { SON.desliza(); } catch (e) { /* */ } this.pintar(); }); };
    flecha('chevron-left', -7);
    const dias = tira.createDiv('m-tira-dias');
    fechas.forEach((f, i) => { const fd = deISO(f); const d = notas[i];
      const b = dias.createEl('button', { cls: 'm-dia' + (f === this.diaSel ? ' on' : '') + (f === hoy ? ' hoy' : '') });
      b.createSpan({ cls: 'm-dia-l', text: capital(DIAS[fd.getDay()]).slice(0, 1) }); b.createSpan({ cls: 'm-dia-n', text: String(fd.getDate()) });
      b.createSpan({ cls: 'm-dia-p' + (d && d.total ? (d.hechas === d.total ? ' lleno' : d.hechas ? ' medio' : '') : ' nada') });
      b.addEventListener('click', () => { this.diaSel = f; try { SON.clic(); } catch (e) { /* */ } this.pintar(); }); });
    flecha('chevron-right', 7);
    // resumen del día elegido
    const di = fechas.indexOf(this.diaSel); const nd = notas[di];
    const tit = w.createDiv('m-dia-cab'); tit.createSpan({ cls: 'm-dia-tit', text: (this.diaSel === hoy ? 'Hoy · ' : '') + capital(DIAS[sel.getDay()]) + ' ' + sel.getDate() });
    if (nd) { const r = tit.createEl('button', { cls: 'm-dia-nota', text: (nd.rana && nd.rana.hecha ? '★ ' : '') + nd.hechas + '/' + nd.total + ' tareas' }); r.addEventListener('click', () => this.app.workspace.openLinkText(rutaDia(this.diaSel), '', false)); }
    // agenda
    const evs = (eventos[this.diaSel] || []).slice().sort((a, b) => a.ini - b.ini);
    const ag = w.createDiv('m-agenda');
    const ahoraMin = (() => { const n = new Date(); let m = n.getHours() * 60 + n.getMinutes(); if (m < 5 * 60) m += 1440; return m; })();
    if (!evs.length) ag.createDiv({ cls: 'm-vacio', text: 'Nada en el calendario este día.' });
    let marcado = false;
    evs.forEach((e) => {
      if (this.diaSel === hoy && !marcado && e.ini > ahoraMin) { const ya = ag.createDiv('m-ya'); ya.createSpan({ text: 'Ahora · ' + hm(ahoraMin) }); marcado = true; }
      const r = ag.createDiv('m-ev tipo-' + e.tipo + (this.diaSel === hoy && e.fin <= ahoraMin ? ' pasado' : '') + (this.diaSel === hoy && e.ini <= ahoraMin && e.fin > ahoraMin ? ' vivo' : ''));
      const h = r.createDiv('m-ev-h'); h.createDiv({ text: hm(e.ini) }); h.createDiv({ cls: 'm-ev-fin', text: hm(e.fin) });
      r.createDiv('m-ev-barra');
      const t = r.createDiv('m-ev-tx'); t.createDiv({ cls: 'm-ev-t', text: e.titulo }); if (e.detalle) t.createDiv({ cls: 'm-ev-d', text: limpiar(e.detalle) });
      t.createDiv({ cls: 'm-ev-tipo', text: NOMBRE_TIPO[e.tipo] || '' });
    });
    // deslizar de lado para cambiar de día
    let x0 = null, y0 = null;
    ag.addEventListener('touchstart', (ev) => { x0 = ev.touches[0].clientX; y0 = ev.touches[0].clientY; }, { passive: true });
    ag.addEventListener('touchend', (ev) => { if (x0 == null) return; const dx = ev.changedTouches[0].clientX - x0, dy = ev.changedTouches[0].clientY - y0; x0 = null;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) { this.diaSel = iso(sumarDias(deISO(this.diaSel), dx < 0 ? 1 : -1)); try { SON.desliza(); } catch (e) { /* */ } this.pintar(); } }, { passive: true });
    const pie = w.createDiv('m-pie-btns');
    const hb = pie.createEl('button', { cls: 'm-btn cafe', text: 'Ir a hoy' }); hb.addEventListener('click', () => { this.diaSel = hoy; this.pintar(); });
    const eb = pie.createEl('button', { cls: 'm-btn', text: 'Editar horario' }); eb.addEventListener('click', () => this.app.workspace.openLinkText(NOTAS.calendario, '', false));
  }
  async pintar() {
    if (this.desplaz == null) this.desplaz = 0;
    if (esMovil()) return this.pintarMovil();
    const lun = sumarDias(lunesDe(new Date()), this.desplaz * 7); const fechas = Array.from({ length: 7 }, (_, i) => iso(sumarDias(lun, i)));
    const { eventos, notas } = await eventosDe(this.app, fechas);
    const raiz = this.contentEl; const scroll = this.rejilla ? this.rejilla.scrollTop : null; raiz.empty();
    const w = raiz.createDiv('orb-hoja ancha orb-cal-hoja'); this.entrada(w);
    const dom = sumarDias(lun, 6);
    const rango = lun.getDate() + ' ' + lun.toLocaleDateString('es-ES', { month: 'short' }) + ' – ' + dom.getDate() + ' ' + dom.toLocaleDateString('es-ES', { month: 'long' });
    const cab = this.cabecera(w, 'Calendario', rango);
    if (!this.pestana) this.pestana = 'semana';
    const tabs = w.createDiv('orb-cal-tabs');
    [['semana', 'Semana', 'calendar-days'], ['cuidado', 'Cuidado · piel y pelo', 'droplet']].forEach(([k, txt, ic]) => {
      const b = tabs.createEl('button', { cls: 'orb-cal-tab' + (this.pestana === k ? ' activo' : '') }); const i = b.createSpan('orb-cal-tab-i'); ob.setIcon(i, ic); b.createSpan({ text: txt });
      b.addEventListener('click', () => { if (this.pestana === k) return; this.pestana = k; try { SON.desliza(); } catch (e) {} this.pintar(); });
    });
    const ctr = w.createDiv('orb-cal-ctr');
    const bt = (txt, fn, cls) => { const b = ctr.createEl('button', { cls: 'orb-mini-btn ' + (cls || ''), text: txt }); b.addEventListener('click', fn); return b; };
    bt('‹ Semana anterior', () => { this.desplaz--; this.pintar(); });
    bt('Esta semana', () => { this.desplaz = 0; this.pintar(); }, this.desplaz === 0 ? 'activo' : '');
    bt('Semana siguiente ›', () => { this.desplaz++; this.pintar(); });
    const ed = this.pestana === 'cuidado' ? bt('Editar plan', () => this.app.workspace.openLinkText(NOTAS.skincare, '', false), 'derecha')
      : bt('Editar horario', () => this.app.workspace.openLinkText(NOTAS.calendario, '', false), 'derecha');
    void cab; void ed;
    if (this.pestana === 'cuidado') { await this.cuidado(w, fechas); return; }
    // leyenda
    const ley = w.createDiv('orb-cal-ley');
    ['cuerpo', 'estudios', 'dinero', 'mente', 'relaciones', 'sesion', 'cita'].forEach((t) => { const l = ley.createDiv('orb-cal-ley-i'); l.createDiv('orb-cal-muestra tipo-' + t); l.createSpan({ text: NOMBRE_TIPO[t] }); });
    // rejilla
    const cuerpo = w.createDiv('orb-cal');
    const cabDias = cuerpo.createDiv('orb-cal-dias');
    cabDias.createDiv('orb-cal-esquina');
    fechas.forEach((f, i) => {
      const fd = deISO(f); const d = notas[i];
      const c = cabDias.createDiv('orb-cal-dia' + (f === hoyISO() ? ' hoy' : ''));
      c.createDiv({ cls: 'orb-cal-dia-n', text: capital(DIAS[fd.getDay()]).slice(0, 3) });
      c.createDiv({ cls: 'orb-cal-dia-num', text: String(fd.getDate()) });
      const est = c.createDiv('orb-cal-dia-est');
      if (d) { est.setText((d.rana && d.rana.hecha ? '● rana · ' : '○ rana · ') + d.hechas + '/' + d.total); this.enlace(c, rutaDia(f)); }
      else est.setText(f <= hoyISO() ? 'sin nota' : '');
    });
    const PX = 1.35; const alto = (H_FIN - H_INI) * PX;
    const rej = cuerpo.createDiv('orb-cal-rejilla'); this.rejilla = rej;
    const horas = rej.createDiv('orb-cal-horas'); horas.style.height = alto + 'px';
    for (let h = H_INI; h <= H_FIN; h += 60) { const l = horas.createDiv({ cls: 'orb-cal-hora', text: hm(h) }); l.style.top = ((h - H_INI) * PX) + 'px'; }
    const det = w.createDiv('orb-cal-det');
    fechas.forEach((f) => {
      const col = rej.createDiv('orb-cal-col' + (f === hoyISO() ? ' hoy' : '')); col.style.height = alto + 'px';
      for (let h = H_INI; h <= H_FIN; h += 60) col.createDiv('orb-cal-linea').style.top = ((h - H_INI) * PX) + 'px';
      const lista = (eventos[f] || []).filter((e) => e.fin > H_INI && e.ini < H_FIN);
      // carriles para eventos que se solapan
      const carriles = [];
      lista.forEach((e) => { let k = carriles.findIndex((fin) => fin <= e.ini); if (k < 0) { k = carriles.length; carriles.push(0); } carriles[k] = e.fin; e.carril = k; });
      lista.forEach((e) => {
        const n = Math.max(1, carriles.length > 1 ? lista.filter((x) => x.ini < e.fin && e.ini < x.fin).reduce((m, x) => Math.max(m, x.carril + 1), 1) : 1);
        const b = col.createDiv('orb-ev tipo-' + e.tipo + (e.hecha ? ' hecha' : '') + (e.fin - e.ini < 30 ? ' corto' : ''));
        b.style.top = ((Math.max(e.ini, H_INI) - H_INI) * PX) + 'px'; b.style.height = Math.max(16, (Math.min(e.fin, H_FIN) - Math.max(e.ini, H_INI)) * PX - 2) + 'px';
        b.style.left = (e.carril / n * 100) + '%'; b.style.width = 'calc(' + (100 / n) + '% - 3px)';
        b.createDiv({ cls: 'orb-ev-h', text: hm(e.ini) + (e.fin - e.ini >= 30 ? ' – ' + hm(e.fin) : '') });
        b.createDiv({ cls: 'orb-ev-t', text: e.titulo });
        b.addEventListener('click', () => this.detalle(det, e));
      });
      if (f === hoyISO()) { const { v } = ahoraYLuego([]); if (v >= H_INI && v <= H_FIN) { const ln = col.createDiv('orb-cal-ahora'); ln.style.top = ((v - H_INI) * PX) + 'px'; } }
    });
    // posición inicial: una hora antes de ahora
    const { v } = ahoraYLuego([]);
    rej.scrollTop = scroll != null ? scroll : Math.max(0, (v - H_INI - 60) * PX);
  }
  async cuidado(w, fechas) {
    const [plan, citas] = await Promise.all([leerPlanPiel(this.app), leerCitas(this.app)]);
    const hoy = hoyISO(); const raiz = w.createDiv('orb-cui');
    if (!plan.length) { raiz.createDiv({ cls: 'orb-vacio', text: 'No encuentro la tabla «Plan del calendario» en SKINCARE.' }); return; }
    const clase = (it) => it.tipo.startsWith('derma') ? 'derma' : it.tipo.startsWith('champu') ? 'pelo' : 'rutina';
    // --- HOY ---
    const hoyB = raiz.createDiv('orb-cui-hoy');
    const ft = deISO(hoy); hoyB.createDiv({ cls: 'orb-cui-tit', text: 'Hoy · ' + capital(DIAS[ft.getDay()]) + ' ' + ft.getDate() });
    const cols = hoyB.createDiv('orb-cui-cols');
    [['manana', 'Mañana', 'sun'], ['noche', 'Noche', 'moon']].forEach(([k, txt, ic]) => {
      const c = cols.createDiv('orb-cui-col'); const h = c.createDiv('orb-cui-col-h'); const i = h.createSpan(); ob.setIcon(i, ic); h.createSpan({ text: txt });
      // orden real de uso: ducha → limpiar → cremas del médico → hidratar → proteger → pastilla → spray
      const peso = (it) => { const n = sinAcentos(it.nombre + ' ' + it.tipo).toLowerCase();
        return /champu|acondicion|ducha/.test(n) ? 0 : /limpia/.test(n) ? 1 : /hidrat/.test(n) ? 3 : /protector|solar/.test(n) ? 4 : /comprim|lorata|pastill/.test(n) ? 5 : /spray|nasonex|nasal/.test(n) ? 6 : 2; };
      const items = plan.filter((it) => tocaPiel(it, hoy, plan) && (it.momento.includes(k) || (k === 'noche' && it.momento.includes('ducha'))))
        .map((it, i) => [it, i]).sort((a, b) => peso(a[0]) - peso(b[0]) || a[1] - b[1]).map((x) => x[0]);
      if (!items.length) { const prox = plan.map((x) => x.desde).filter((d) => d && d > hoy).sort()[0];
        c.createDiv({ cls: 'orb-cui-nada', text: prox ? 'Aún no: el tratamiento empieza el ' + capital(DIAS[deISO(prox).getDay()]) + ' ' + deISO(prox).getDate() + '.' : 'Nada' }); }
      items.forEach((it, n) => {
        const r = c.createDiv('orb-cui-paso ' + clase(it)); r.createDiv({ cls: 'orb-cui-n', text: String(n + 1) });
        const tx = r.createDiv('orb-cui-tx'); tx.createDiv({ cls: 'orb-cui-nom', text: it.nombre });
        if (it.como) {
          const pasos = it.como.split(/\s*→\s*/).filter(Boolean);
          if (pasos.length > 1) { const ol = tx.createEl('ol', { cls: 'orb-cui-pasos' }); pasos.forEach((p) => ol.createEl('li', { text: p.charAt(0).toUpperCase() + p.slice(1) })); }
          else tx.createDiv({ cls: 'orb-cui-como', text: it.como });
        }
        if (it.hasta === hoy) r.createDiv({ cls: 'orb-cui-chip', text: 'último día' });
      });
    });
    // --- SEMANA ---
    const sem = raiz.createDiv('orb-cui-sem'); sem.createDiv({ cls: 'orb-cui-tit', text: 'Esta semana' });
    const tabla = sem.createDiv('orb-cui-tabla');
    const cab = tabla.createDiv('orb-cui-fila cab'); cab.createDiv('orb-cui-prod');
    fechas.forEach((f) => { const d = deISO(f); const c = cab.createDiv('orb-cui-celda' + (f === hoy ? ' hoy' : '')); c.createDiv({ cls: 'orb-cui-dn', text: capital(DIAS[d.getDay()]).slice(0, 3) }); c.createDiv({ cls: 'orb-cui-dnum', text: String(d.getDate()) }); });
    plan.filter((it) => fechas.some((f) => tocaPiel(it, f, plan))).forEach((it) => {
      const fila = tabla.createDiv('orb-cui-fila ' + clase(it));
      const pr = fila.createDiv('orb-cui-prod'); pr.createDiv({ cls: 'orb-cui-nom', text: it.nombre });
      pr.createDiv({ cls: 'orb-cui-mom', text: it.momento.replace('manana', 'mañana') + (it.hasta ? ' · hasta ' + deISO(it.hasta).getDate() + '/' + (deISO(it.hasta).getMonth() + 1) : '') });
      fechas.forEach((f) => {
        const c = fila.createDiv('orb-cui-celda' + (f === hoy ? ' hoy' : ''));
        if (tocaPiel(it, f, plan)) { const p = c.createDiv('orb-cui-punto' + (f < hoy ? ' pasado' : '') + (it.hasta === f ? ' ultimo' : ''));
          const i = p.createSpan(); ob.setIcon(i, it.momento.includes('manana') && it.momento.includes('noche') ? 'sun-moon' : it.momento.includes('manana') ? 'sun' : it.momento.includes('ducha') ? 'droplet' : 'moon'); }
      });
    });
    // --- AVISOS ---
    const av = raiz.createDiv('orb-cui-avisos'); av.createDiv({ cls: 'orb-cui-tit', text: 'Avisos' });
    const lim = iso(sumarDias(deISO(hoy), 7)); const avisos = [];
    const diaTxt = (f) => DIAS[deISO(f).getDay()] + ' ' + deISO(f).getDate() + (deISO(f).getMonth() !== deISO(hoy).getMonth() ? '/' + (deISO(f).getMonth() + 1) : '');
    const agrupa = (campo, desde, hasta) => { const g = {}; plan.forEach((it) => { const f = it[campo]; if (f && f >= desde && f <= hasta) (g[f] = g[f] || []).push(it.nombre); }); return Object.keys(g).sort().map((f) => [f, g[f]]); };
    agrupa('desde', iso(sumarDias(deISO(hoy), 1)), iso(sumarDias(deISO(hoy), 30))).forEach(([f, ns]) => avisos.push(['calendar-plus', `Empieza el ${diaTxt(f)}: ${ns.join(', ')}.`]));
    agrupa('hasta', hoy, lim).forEach(([f, ns]) => avisos.push(['flag', `Último día el ${diaTxt(f)}: ${ns.join(', ')}.`]));
    const derm = citas.filter((c) => /dermat/i.test(sinAcentos(c.que)) && c.fecha >= hoy).sort((a, b) => a.fecha < b.fecha ? -1 : 1)[0];
    avisos.push(['stethoscope', derm ? `Dermatólogo: ${deISO(derm.fecha).getDate()}/${deISO(derm.fecha).getMonth() + 1} a las ${derm.inicio}.` : 'Dermatólogo: no hay próxima revisión apuntada (añádela en CITAS cuando te la den).']);
    avisos.forEach(([ic, tx]) => { const r = av.createDiv('orb-cui-aviso'); const i = r.createSpan(); ob.setIcon(i, ic); r.createSpan({ text: tx }); });
    const pie = raiz.createDiv('orb-cui-pie'); pie.setText('Para cambiar productos, días o fechas: «Editar plan» (tabla «Plan del calendario» en SKINCARE). Manda lo que diga el médico.');
  }

  detalle(det, e) {
    det.empty(); det.addClass('abierto');
    const x = det.createEl('button', { cls: 'orb-cal-det-x', text: '×' }); x.setAttr('aria-label', 'Cerrar'); x.addEventListener('click', () => det.removeClass('abierto'));
    det.createDiv({ cls: 'orb-etq', text: NOMBRE_TIPO[e.tipo] || 'Evento' });
    det.createDiv({ cls: 'orb-cal-det-t', text: e.titulo });
    det.createDiv({ cls: 'orb-cal-det-s', text: fechaLarga(deISO(e.fecha)) + ' · ' + hm(e.ini) + (e.fin > e.ini ? ' – ' + hm(e.fin) : '') });
    if (e.detalle) det.createDiv({ cls: 'orb-cal-det-d', text: limpiar(e.detalle) });
    const b = det.createEl('button', { cls: 'orb-btn', text: e.tipo === 'tarea' ? 'Abrir la nota del día' : e.tipo === 'cita' ? 'Editar citas' : e.tipo === 'sesion' ? 'Ver sesiones' : 'Editar horario' });
    b.addEventListener('click', () => this.app.workspace.openLinkText(e.fuente, '', false));
  }
}

class OrbitasView extends VistaBase {
  getViewType() { return V.orbitas; } getDisplayText() { return 'Órbitas'; } getIcon() { return 'target'; }
  async pintar() {
    const o = await datosOrbitas(this.app);
    const raiz = this.contentEl; raiz.empty();
    const w = raiz.createDiv('orb-hoja'); this.entrada(w);
    this.cabecera(w, 'Órbitas', 'Plan maestro');
    if (o.vision) { const v = w.createDiv('orb-vision'); v.setText(o.vision); this.enlace(v, NOTAS.metas); }
    const lista = w.createDiv('orb-orbitas-lista');
    const din = o.orbitas.find((x) => x.id === 'dinero'); if (din) din.euros = o.euros;
    o.orbitas.forEach((x) => {
      const it = lista.createDiv('orb-orbita' + (x.prioritaria ? ' prioritaria' : ''));
      const cab = it.createDiv('orb-orbita-cab');
      cab.createDiv({ cls: 'orb-orbita-nombre', text: x.nombre });
      if (x.prioritaria) cab.createDiv({ cls: 'orb-chip', text: 'Prioritaria' });
      if (x.id === 'dinero') cab.createDiv({ cls: 'orb-orbita-dato', text: (Math.round(x.euros * 100) / 100) + ' € este mes' });
      if (x.meta) it.createDiv({ cls: 'orb-orbita-meta', text: x.meta });
      if (x.acciones) it.createDiv({ cls: 'orb-orbita-acc', text: x.acciones });
      if (x.hitos.length) {
        const h = it.createDiv('orb-hitos');
        const hechos = x.hitos.filter((y) => y.hecha).length;
        h.createDiv({ cls: 'orb-hitos-t', text: 'Hitos ' + hechos + '/' + x.hitos.length });
        x.hitos.forEach((y) => { const f = h.createDiv('orb-hito' + (y.hecha ? ' on' : '')); f.createDiv('orb-check peq' + (y.hecha ? ' on' : '')); f.createDiv({ text: y.texto }); });
      }
      const carpeta = x.carpeta; const primera = this.app.vault.getMarkdownFiles().find((f) => f.path.startsWith(carpeta + '/'));
      if (primera) this.enlace(cab, primera.path);
    });
    const listas = (titulo, cs) => { if (!cs.length) return; const s = w.createDiv('orb-seccion'); s.createDiv({ cls: 'orb-etq', text: titulo }); cs.forEach((c) => { const f = s.createDiv('orb-tarea' + (c.hecha ? ' hecha' : '')); f.createDiv('orb-check' + (c.hecha ? ' on' : '')); f.createDiv({ cls: 'orb-tarea-txt', text: c.texto }); }); };
    listas('Esta semana', o.semana); listas('Este mes', o.mes);
    const ed = w.createEl('button', { cls: 'orb-btn', text: 'Editar el plan maestro' }); ed.addEventListener('click', () => this.app.workspace.openLinkText(NOTAS.metas, '', false));
  }
}

class ProgresoView extends VistaBase {
  getViewType() { return V.progreso; } getDisplayText() { return 'Progreso'; } getIcon() { return 'activity'; }
  async pintar() {
    const hoy = new Date(); const N = 35;
    const fechas = Array.from({ length: N }, (_, i) => iso(sumarDias(hoy, i - N + 1)));
    const dias = await Promise.all(fechas.map((f) => leerDia(this.app, f)));
    const raiz = this.contentEl; raiz.empty();
    const w = raiz.createDiv('orb-hoja ancha orb-progreso'); this.entrada(w);
    this.cabecera(w, 'Progreso', 'Tus últimas 5 semanas');
    // datos
    let racha = 0; for (let i = N - 1; i >= 0; i--) { const d = dias[i]; if (d && d.rana && d.rana.hecha) racha++; else if (i === N - 1) continue; else break; }
    let mejor = 0, cur = 0; dias.forEach((d) => { if (d && d.rana && d.rana.hecha) { cur++; mejor = Math.max(mejor, cur); } else cur = 0; });
    const con = dias.filter(Boolean); const ranas = con.filter((d) => d.rana && d.rana.hecha).length;
    const th = con.reduce((s, d) => s + d.hechas, 0), tt = con.reduce((s, d) => s + d.total, 0);
    const an = dias.map((d) => (d && d.animo) || null), en = dias.map((d) => (d && d.energia) || null);
    const media = (arr) => { const v = arr.filter((x) => x != null); return v.length ? (v.reduce((s, x) => s + x, 0) / v.length) : null; };
    // tarjetas de cifras
    const kpis = w.createDiv('orb-kpis');
    const kpi = (color, icono, n, l, sub) => { const k = kpis.createDiv('orb-kpi'); k.style.setProperty('--c', color); const i = k.createDiv('orb-kpi-ic'); ob.setIcon(i, icono); k.createDiv({ cls: 'orb-kpi-n', text: n }); k.createDiv({ cls: 'orb-kpi-l', text: l }); if (sub) k.createDiv({ cls: 'orb-kpi-s', text: sub }); };
    kpi(COLOR.rana, 'flame', String(racha), racha === 1 ? 'día de racha' : 'días de racha', 'mejor racha: ' + mejor);
    kpi(COLOR.top, 'star', con.length ? Math.round(ranas / con.length * 100) + '%' : '—', 'ranas hechas', ranas + ' de ' + con.length + ' días con nota');
    kpi(COLOR.rutinas, 'check-circle', tt ? Math.round(th / tt * 100) + '%' : '—', 'tareas hechas', th + ' de ' + tt);
    const ma = media(an); kpi(COLOR.estado, 'heart', ma != null ? ma.toFixed(1) : '—', 'ánimo medio', media(en) != null ? 'energía media ' + media(en).toFixed(1) : 'sin datos de energía');
    // mapa de días grande
    const sec = tarjeta(w, 'rutinas', 'calendar-days', 'Cada día', 'toca un día para abrir su nota');
    const cab = sec.cuerpo.createDiv('orb-calor-cab'); ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].forEach((l) => cab.createDiv({ text: l }));
    const grid = sec.cuerpo.createDiv('orb-calor');
    const desfase = (deISO(fechas[0]).getDay() + 6) % 7; for (let i = 0; i < desfase; i++) grid.createDiv('orb-celda hueco');
    fechas.forEach((f, i) => {
      const d = dias[i]; const pct = d && d.total ? d.hechas / d.total : 0;
      const c = grid.createDiv('orb-celda' + (d ? '' : ' vacia') + (d && pct >= 0.5 ? ' claro' : '') + (f === hoyISO() ? ' hoy' : ''));
      c.style.setProperty('--a', d ? (0.15 + pct * 0.85).toFixed(2) : 0);
      c.createDiv({ cls: 'orb-celda-num', text: String(deISO(f).getDate()) });
      if (d) { c.createDiv({ cls: 'orb-celda-pct', text: Math.round(pct * 100) + '%' }); if (d.rana && d.rana.hecha) c.createDiv('orb-celda-rana'); this.enlace(c, rutaDia(f)); }
      c.setAttr('aria-label', f + (d ? ' · ' + d.hechas + '/' + d.total : ' · sin nota'));
    });
    const ley = sec.cuerpo.createDiv('orb-leyenda-p');
    [['orb-ley-cuadro baja', 'Pocas tareas'], ['orb-ley-cuadro alta', 'Muchas tareas'], ['orb-ley-punto', 'Rana hecha'], ['orb-ley-cuadro vacia', 'Sin nota']].forEach(([cl, t]) => { const x = ley.createDiv('orb-ley-i'); x.createDiv(cl); x.createSpan({ text: t }); });
    // gráficas: ánimo y energía + por semana
    const fila = w.createDiv('orb-graficas');
    const g1 = tarjeta(fila, 'estado', 'heart', 'Ánimo y energía', '');
    const W = 600, H = 200, pad = 26;
    const svg = g1.cuerpo.createSvg('svg', { cls: 'orb-grafica', attr: { viewBox: '0 0 ' + W + ' ' + H, preserveAspectRatio: 'none' } });
    [2, 4, 6, 8, 10].forEach((v) => { const y = H - pad - (v / 10) * (H - pad * 1.6); svg.createSvg('line', { cls: 'orb-guia', attr: { x1: pad, x2: W, y1: y, y2: y } }); const t = svg.createSvg('text', { cls: 'orb-eje', attr: { x: 2, y: y + 4 } }); t.textContent = String(v); });
    const linea = (arr, color) => {
      const pts = arr.map((v, i) => v == null ? null : [pad + (i / (N - 1)) * (W - pad - 6), H - pad - (v / 10) * (H - pad * 1.6)]).filter(Boolean);
      if (pts.length >= 2) svg.createSvg('polyline', { cls: 'orb-trazo', attr: { points: pts.map((p) => p.join(',')).join(' ') } }).style.stroke = color;
      pts.forEach((p) => { svg.createSvg('circle', { cls: 'orb-nodo', attr: { cx: p[0], cy: p[1], r: 3.4 } }).style.stroke = color; });
      return pts.length;
    };
    const na = linea(an, COLOR.estado), ne = linea(en, COLOR.agenda);
    const lg = g1.cuerpo.createDiv('orb-leyenda-p'); [[COLOR.estado, 'Ánimo'], [COLOR.agenda, 'Energía']].forEach(([c, t]) => { const x = lg.createDiv('orb-ley-i'); const p = x.createDiv('orb-ley-linea'); p.style.background = c; x.createSpan({ text: t }); });
    if (!na && !ne) g1.cuerpo.createDiv({ cls: 'orb-tenue', text: 'Aún no hay datos. Marca tu ánimo y energía en Hoy cada día.' });
    const g2 = tarjeta(fila, 'top', 'bar-chart-3', 'Tareas por semana', '');
    const semanas = [0, 1, 2, 3, 4].map((k) => { const tramo = dias.slice(k * 7, k * 7 + 7).filter(Boolean); const h = tramo.reduce((s, d) => s + d.hechas, 0), t = tramo.reduce((s, d) => s + d.total, 0); return { pct: t ? Math.round(h / t * 100) : null, ini: fechas[k * 7] }; });
    const barras = g2.cuerpo.createDiv('orb-barras');
    semanas.forEach((x, i) => { const col = barras.createDiv('orb-barra-col'); const v = col.createDiv({ cls: 'orb-barra-v', text: x.pct == null ? '—' : x.pct + '%' }); void v; const b = col.createDiv('orb-barra-b'); b.style.height = (x.pct || 0) + '%'; if (i === 4) b.addClass('actual'); col.createDiv({ cls: 'orb-barra-l', text: i === 4 ? 'Esta' : 'Sem. ' + deISO(x.ini).getDate() + '/' + (deISO(x.ini).getMonth() + 1) }); });
    // Mapa de calor: cada hábito, cada día (fase 3)
    const filas = [{ k: 'rana', t: 'La rana', c: COLOR.rana }]; const vistos = {};
    dias.forEach((d) => { if (!d) return; d.rutinas.forEach((x) => { const k = claveTarea(x.texto); vistos[k] = vistos[k] || { n: 0, t: limpiar(x.texto).split(/[:(«]/)[0].trim() }; vistos[k].n++; }); });
    Object.entries(vistos).filter(([, v]) => v.n >= 4).forEach(([k, v]) => filas.push({ k, t: v.t, c: COLOR.rutinas }));
    const hm2 = tarjeta(w, 'rutinas', 'grid-3x3', 'Mapa de hábitos', 'últimos ' + N + ' días'); hm2.addClass('orb-heat-card');
    const tabla = hm2.cuerpo.createDiv('orb-heat'); tabla.style.setProperty('--n', N);
    const cabH = tabla.createDiv('orb-heat-fila cab'); cabH.createDiv('orb-heat-t');
    fechas.forEach((f) => { const dd = deISO(f); cabH.createDiv({ cls: 'orb-heat-d' + (dd.getDay() === 1 ? ' lunes' : ''), text: dd.getDay() === 1 || dd.getDate() === 1 ? String(dd.getDate()) : '' }); });
    filas.forEach((fi) => {
      const r = tabla.createDiv('orb-heat-fila'); r.style.setProperty('--c', fi.c); r.createDiv({ cls: 'orb-heat-t', text: fi.t });
      let si = 0, tot = 0;
      dias.forEach((d, i) => {
        let est = 'nada';
        if (d) { if (fi.k === 'rana') est = d.rana ? (d.rana.hecha ? 'si' : 'no') : 'nada'; else { const x = d.rutinas.find((y) => claveTarea(y.texto) === fi.k); est = x ? (x.hecha ? 'si' : 'no') : 'nada'; } }
        if (est !== 'nada') { tot++; if (est === 'si') si++; }
        r.createDiv({ cls: 'orb-heat-c ' + est + (deISO(fechas[i]).getDay() === 1 ? ' lunes' : ''), attr: { title: fechas[i] + ' · ' + (est === 'si' ? 'hecho' : est === 'no' ? 'sin hacer' : 'sin dato') } });
      });
      r.createDiv({ cls: 'orb-heat-pct', text: tot ? Math.round(si / tot * 100) + '%' : '—' });
    });
    const leyH = hm2.cuerpo.createDiv('orb-heat-ley'); [['si', 'hecho'], ['no', 'sin hacer'], ['nada', 'sin nota']].forEach(([k, t]) => { const x = leyH.createDiv('orb-heat-ley-i'); x.createDiv('orb-heat-c ' + k); x.createSpan({ text: t }); });
  }
}

/* =========================================================
   CEREBRO · tus notas como un cerebro de partículas
   Cada órbita es una región; el diario es la médula (una vértebra por día).
   ========================================================= */
const REGIONES = [
  { id: 'nucleo', nombre: 'Núcleo', carpeta: CARPETAS.nucleo, color: '#e8eef2', c: [0, -1.0, 0.05], r: 0.62 },
  { id: 'dinero', nombre: 'Dinero', carpeta: CARPETAS.dinero, color: '#e9c46a', c: [0, -1.05, 1.05], r: 0.55 },
  { id: 'cuerpo', nombre: 'Cuerpo', carpeta: CARPETAS.cuerpo, color: '#7fd6a4', c: [0, -1.78, 0.15], r: 0.55 },
  { id: 'mente', nombre: 'Mente', carpeta: CARPETAS.mente, color: '#b9a3e3', c: [0, -1.5, -0.75], r: 0.55 },
  { id: 'relaciones', nombre: 'Relaciones', carpeta: CARPETAS.relaciones, color: '#f29bbb', c: [1.0, -0.85, 0.2], r: 0.5, espejo: true },
  { id: 'estudios', nombre: 'Estudios', carpeta: CARPETAS.estudios, color: '#86aee8', c: [0, -0.95, -1.2], r: 0.5 },
  { id: 'equipo', nombre: 'Equipo', carpeta: CARPETAS.equipo, color: '#6fe0d8', c: [0, -0.32, -0.78], r: 0.45 },
  { id: 'diario', nombre: 'Diario', carpeta: CARPETAS.diario, color: '#9ff0e0', c: [0, 1.4, -0.3], r: 0 }
];
const RGB = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const SPRITES = {};
function sprite(color) { // halo suave precalculado por color
  if (SPRITES[color]) return SPRITES[color];
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
  const [r, gg, b] = RGB(color); const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, `rgba(${r},${gg},${b},1)`); gr.addColorStop(0.22, `rgba(${r},${gg},${b},0.45)`); gr.addColorStop(0.55, `rgba(${r},${gg},${b},0.1)`); gr.addColorStop(1, `rgba(${r},${gg},${b},0)`);
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64); SPRITES[color] = c; return c;
}
const CEREBRO_BASE = { girar: true, velocidad: 0.5, brillo: 0.75, tam: 0.5, fibras: true, etiquetas: true };

class Cerebro {
  constructor(contenedor, app, opts) {
    this.app = app; this.opts = opts || {};
    this.cfg = Object.assign({}, CEREBRO_BASE, this.opts.cfg || {});
    this.canvas = contenedor.createEl('canvas', { cls: 'orb-lienzo' }); this.ctx = this.canvas.getContext('2d');
    this.reducido = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.ang = 0.5; this.incl = -0.22; this.zoom = 1; this.foco = null; this.sobre = null; this.busca = '';
    this.vivo = true; this.t0 = performance.now(); this.tUlt = this.t0; this.quieto = 0;
    this.polvo = []; this.notas = []; this.fibras = []; this.nervios = []; this.vertebras = [];
    this.ajustar = this.ajustar.bind(this); this.cuadro = this.cuadro.bind(this);
    this.ro = new ResizeObserver(this.ajustar); this.ro.observe(this.canvas);
    this.ajustar(); this.construir(); this.eventos();
    requestAnimationFrame(this.cuadro);
  }
  ajustar() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2); const w = this.canvas.clientWidth || 800, h = this.canvas.clientHeight || 600;
    this.w = w; this.h = h; this.dpr = dpr; this.canvas.width = Math.round(w * dpr); this.canvas.height = Math.round(h * dpr);
  }
  region(id) { return REGIONES.find((r) => r.id === id); }
  regionDe(ruta) { return REGIONES.find((r) => ruta.startsWith(r.carpeta + '/')); }
  // Polvo del cerebro: corteza densa, cisura central, cerebelo, tronco y médula
  construir() {
    const rnd = azar('cerebro-orbita'); const P = [];
    const tinte = (x, y, z) => { // color de la región más cercana
      let mejor = null, dmin = 9;
      for (const R of REGIONES) { if (!R.r) continue; const cx = R.espejo ? Math.sign(x || 1) * R.c[0] : R.c[0]; const d = Math.hypot(x - cx, y - R.c[1], z - R.c[2]) / R.r; if (d < dmin) { dmin = d; mejor = R; } }
      return dmin < 1.25 ? { reg: mejor.id, k: Math.max(0, 1 - dmin / 1.25) } : { reg: null, k: 0 };
    };
    const punto = (x, y, z, tam, base) => { const t = tinte(x, y, z); P.push({ x, y, z, tam, base, reg: t.reg, k: t.k, ti: rnd() * 6.28 }); };
    // Hemisferios
    for (let i = 0; i < 7000; i++) {
      const u = rnd() * 2 - 1, th = rnd() * Math.PI * 2, s = Math.sqrt(1 - u * u);
      let x = s * Math.cos(th), y = u, z = s * Math.sin(th);
      const capa = 0.72 + 0.28 * Math.pow(rnd(), 0.35); // casi todo en la corteza
      x *= 1.12 * capa; y *= 0.9 * capa; z *= 1.32 * capa;
      if (Math.abs(x) < 0.05 && y < 0.25) x += Math.sign(x || 1) * 0.07; // cisura
      if (y > 0.55 && Math.abs(z) < 0.5) continue; // base plana
      const surco = 0.035 * Math.sin(z * 9 + y * 7) * Math.cos(x * 8); // circunvoluciones
      punto(x * (1 + surco), y * (1 + surco) - 1.0, z * (1 + surco), 0.6 + rnd() * 0.9, 0.35 + rnd() * 0.5);
    }
    // Cerebelo
    for (let i = 0; i < 900; i++) {
      const u = rnd() * 2 - 1, th = rnd() * Math.PI * 2, s = Math.sqrt(1 - u * u); const c = 0.8 + 0.2 * rnd();
      punto(s * Math.cos(th) * 0.62 * c, -0.3 + u * 0.28 * c, -0.78 + s * Math.sin(th) * 0.38 * c, 0.5 + rnd() * 0.7, 0.3 + rnd() * 0.4);
    }
    // Tronco y médula: columna con vértebras
    const curva = (y) => -0.3 + 0.12 * Math.sin((y - 0.2) * 1.4); // ligera S
    for (let i = 0; i < 1400; i++) {
      const y = -0.45 + rnd() * 3.45; const a = rnd() * Math.PI * 2; const rr = (y < 0.3 ? 0.16 : 0.07) * Math.sqrt(rnd());
      punto(Math.cos(a) * rr, y, curva(y) + Math.sin(a) * rr, 0.5 + rnd() * 0.6, 0.45 + rnd() * 0.45);
    }
    // Color de cada partícula, calculado una sola vez (rendimiento)
    for (const q of P) {
      let r = 225, gg = 228, bb = 232;
      if (q.reg) { const c = RGB(REGIONES.find((R) => R.id === q.reg).color); const k = q.k * 0.95; r += (c[0] - r) * k; gg += (c[1] - gg) * k; bb += (c[2] - bb) * k; }
      q.css = `rgb(${r | 0},${gg | 0},${bb | 0})`;
      q.cssClaro = q.reg ? mezclar(REGIONES.find((R) => R.id === q.reg).color, '#2b2420', 0.45 - q.k * 0.2) : 'rgb(92,78,66)';
    }
    this.polvo = P;
    // Vértebras: anillos y apófisis cada 0,13
    this.vertebras = [];
    for (let y = 0.35; y < 3.0; y += 0.12) this.vertebras.push({ y, z: curva(y), ancho: 0.2 + 0.05 * Math.sin(y * 3) });
    // Nervios: de cada vértebra salen dos fibras hacia los lados
    this.nervios = this.vertebras.filter((v, i) => i % 2 === 0).map((v) => ({ y: v.y, z: v.z, largo: 0.5 + rnd() * 0.5, caida: 0.25 + rnd() * 0.3 }));
    // Fibras decorativas entre puntos cercanos de la corteza
    this.fibras = [];
    for (let i = 0; i < 820; i++) {
      const a = P[Math.floor(rnd() * 7000)]; let b = null, d = 1;
      for (let k = 0; k < 14; k++) { const c = P[Math.floor(rnd() * 7000)]; const dd = Math.hypot(a.x - c.x, a.y - c.y, a.z - c.z); if (dd < d && dd > 0.08) { d = dd; b = c; } }
      if (b && d < 0.42) this.fibras.push([a, b]);
    }
    this.datos();
  }
  async datos() {
    const rnd = azar('notas-orbita');
    const archivos = this.app.vault.getMarkdownFiles().filter((f) => f.path.startsWith(RAIZ + '/') && !f.path.startsWith(CARPETAS.archivo + '/') && !f.path.startsWith(CARPETAS.plantillas + '/'));
    const resolved = (this.app.metadataCache && this.app.metadataCache.resolvedLinks) || {};
    const grado = {}; for (const a in resolved) for (const b in resolved[a]) { grado[a] = (grado[a] || 0) + 1; grado[b] = (grado[b] || 0) + 1; }
    const dias = archivos.filter((f) => f.path.startsWith(CARPETAS.diario + '/')).sort((a, b) => a.basename.localeCompare(b.basename));
    const notas = [];
    for (const f of archivos) {
      const R = this.regionDe(f.path); if (!R) continue;
      let x, y, z;
      if (R.id === 'diario') { // una vértebra por día, de arriba (primero) hacia abajo (hoy)
        const i = dias.indexOf(f); const v = this.vertebras[Math.min(this.vertebras.length - 1, 1 + i * 2)] || this.vertebras[0];
        x = 0; y = v.y; z = v.z;
      } else {
        const lado = R.espejo ? (rnd() < 0.5 ? -1 : 1) : 1; const cx = R.c[0] * lado;
        const u = rnd() * 2 - 1, th = rnd() * Math.PI * 2, s = Math.sqrt(1 - u * u), rr = R.r * (0.25 + 0.6 * rnd());
        x = cx + s * Math.cos(th) * rr * 0.8; y = R.c[1] + u * rr * 0.7; z = R.c[2] + s * Math.sin(th) * rr * 0.8;
      }
      notas.push({ f, reg: R.id, color: R.color, x, y, z, tam: 2.2 + Math.min(4, (grado[f.path] || 0) * 0.35), pct: null, mtime: (f.stat && f.stat.mtime) || 0 });
    }
    // Días: brillo según lo cumplido
    for (const n of notas.filter((n) => n.reg === 'diario')) {
      try { const d = parsearDia(await this.app.vault.cachedRead(n.f)); n.pct = d && d.total ? d.hechas / d.total : 0; } catch (e) { n.pct = 0; }
    }
    // Enlaces reales entre notas
    const porRuta = {}; notas.forEach((n) => { porRuta[n.f.path] = n; });
    this.enlaces = []; for (const a in resolved) for (const b in resolved[a]) if (porRuta[a] && porRuta[b] && a !== b) this.enlaces.push([porRuta[a], porRuta[b]]);
    this.notas = notas;
    // Recuento por región y palabras
    this.cuenta = {}; REGIONES.forEach((R) => { this.cuenta[R.id] = notas.filter((n) => n.reg === R.id).length; });
    let palabras = 0; for (const n of notas) { try { const t = await this.app.vault.cachedRead(n.f); palabras += (t.match(/\S+/g) || []).length; } catch (e) { /* nada */ } }
    this.palabras = palabras;
    if (this.opts.alDatos) this.opts.alDatos(this);
  }
  // Movimiento vivo: la médula ondula como una onda que sube y el cerebro «respira»
  fluir(x, y, z) {
    const t = this.tt || 0; if (this.reducido) return [x, y, z];
    if (y > -0.25) { const k = Math.min(1, (y + 0.25) / 1.2); x += (0.055 * Math.sin(y * 2.3 - t * 1.7) + 0.022 * Math.sin(y * 5.1 - t * 2.9)) * k; z += 0.03 * Math.sin(y * 1.7 - t * 1.3 + 1) * k; }
    else { const b = 1 + 0.014 * Math.sin(t * 0.9); x *= b; z *= b; y = -1 + (y + 1) * b; }
    return [x, y, z];
  }
  proyectar(x0, y0, z0) {
    const [x, y, z] = this.fluir(x0, y0, z0);
    const ca = Math.cos(this.ang), sa = Math.sin(this.ang), ci = Math.cos(this.incl), si = Math.sin(this.incl);
    let X = x * ca + z * sa, Z = -x * sa + z * ca; // giro vertical
    const yc = y - 0.55; let Y = yc * ci - Z * si; Z = yc * si + Z * ci; // inclinación, centrado en el conjunto
    const esc = Math.min(this.w * 0.42, this.h / 5.9) * this.zoom; const f = 5.5; const s = f / (f + Z);
    return { x: this.w * 0.5 + X * s * esc, y: this.h * 0.5 + Y * s * esc, s, z: Z };
  }
  eventos() {
    const c = this.canvas; let arr = null;
    const pos = (e) => { const r = c.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    c.addEventListener('pointerdown', (e) => { arr = { ...pos(e), a: this.ang, i: this.incl, mov: 0 }; c.setPointerCapture(e.pointerId); });
    c.addEventListener('pointermove', (e) => {
      const p = pos(e); this.raton = p;
      if (arr) { const dx = p.x - arr.x, dy = p.y - arr.y; arr.mov = Math.max(arr.mov, Math.abs(dx) + Math.abs(dy)); this.ang = arr.a + dx * 0.008; this.incl = limitar(arr.i + dy * 0.004, -0.7, 0.5); this.quieto = performance.now(); }
    });
    c.addEventListener('pointerup', () => { if (arr && arr.mov < 5 && this.sobre && this.opts.alAbrir) this.opts.alAbrir(this.sobre.f); arr = null; });
    c.addEventListener('pointerleave', () => { this.raton = null; });
    c.addEventListener('wheel', (e) => { e.preventDefault(); this.zoom = limitar(this.zoom * (e.deltaY > 0 ? 0.92 : 1.08), 0.55, 3); }, { passive: false });
    c.addEventListener('dblclick', () => { this.zoom = 1; this.incl = -0.22; this.foco = null; if (this.opts.alFoco) this.opts.alFoco(); });
  }
  cuadro(ahora) {
    if (!this.vivo) return; requestAnimationFrame(this.cuadro);
    if (!this.canvas.isConnected || !this.w || this.canvas.clientWidth === 0) return;
    const dt = Math.min(0.05, (ahora - this.tUlt) / 1000); this.tUlt = ahora; const t = (ahora - this.t0) / 1000; this.tt = t;
    if (this.cfg.girar && !this.reducido && ahora - this.quieto > 2500) this.ang += dt * 0.25 * this.cfg.velocidad;
    const g = this.ctx; g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0); const CL = esClaro(); this.claro = CL;
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.fillStyle = CL ? '#ebe7e0' : '#000'; g.fillRect(0, 0, this.w, this.h);
    g.globalCompositeOperation = CL ? 'source-over' : 'lighter';
    const B = 0.45 + this.cfg.brillo * 1.1, T = 0.6 + this.cfg.tam * 1.1;
    const atenuado = (reg) => (this.foco && reg !== this.foco) ? 0.18 : 1;
    // Resplandor de cada región (late suave)
    for (const R of REGIONES) {
      if (!R.r) continue; const lados = R.espejo ? [-1, 1] : [1];
      for (const l of lados) {
        const p = this.proyectar(R.c[0] * l, R.c[1], R.c[2]); const foco = this.foco === R.id;
        const rad = R.r * p.s * Math.min(this.w * 0.42, this.h / 5.9) * this.zoom * (foco ? 2.4 : 1.8);
        g.globalAlpha = ((foco ? 0.55 : 0.2) + (R.destello || 0) * 0.45) * (CL ? 0.75 : 1) * B * (0.85 + 0.15 * Math.sin(t * 0.9 + R.c[2] * 3)) * atenuado(R.id) * (0.7 + 0.3 * (p.z < 0 ? 1 : 0.6));
        g.drawImage(sprite(R.color), p.x - rad, p.y - rad, rad * 2, rad * 2);
      }
    }
    // Polvo
    for (const q of this.polvo) {
      const p = this.proyectar(q.x, q.y, q.z); const prof = limitar(0.55 - p.z * 0.28, 0.15, 1);
      const tw = 0.8 + 0.2 * Math.sin(t * 1.7 + q.ti);
      g.globalAlpha = Math.min(1, q.base * prof * tw * B * (CL ? 0.85 : 1.05) * (q.reg ? atenuado(q.reg) : (this.foco ? 0.35 : 1)));
      g.fillStyle = CL ? q.cssClaro : q.css; const s = q.tam * T * p.s * 1.15 * Math.sqrt(this.zoom);
      g.fillRect(p.x - s / 2, p.y - s / 2, s, s);
    }
    // Fibras
    if (this.cfg.fibras) {
      g.lineWidth = 0.6; g.strokeStyle = CL ? '#6b5a4c' : '#dfe6ea';
      for (const [a, b] of this.fibras) { const p = this.proyectar(a.x, a.y, a.z), q = this.proyectar(b.x, b.y, b.z); g.globalAlpha = 0.09 * B * (this.foco ? 0.4 : 1); g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(q.x, q.y); g.stroke(); }
      // nervios de la médula
      for (const n of this.nervios) for (const l of [-1, 1]) {
        const p = this.proyectar(0, n.y, n.z), m = this.proyectar(l * n.largo * 0.55, n.y + n.caida * 0.35, n.z + 0.05), q = this.proyectar(l * n.largo, n.y + n.caida, n.z + 0.1);
        g.globalAlpha = 0.12 * B * atenuado('diario'); g.beginPath(); g.moveTo(p.x, p.y); g.quadraticCurveTo(m.x, m.y, q.x, q.y); g.stroke();
      }
    }
    // Vértebras
    g.lineWidth = 0.9; g.strokeStyle = CL ? '#5f5045' : '#e9f4f2';
    for (const v of this.vertebras) {
      const a = this.proyectar(-v.ancho, v.y, v.z), b = this.proyectar(v.ancho, v.y, v.z), c = this.proyectar(0, v.y, v.z + 0.09), d = this.proyectar(0, v.y, v.z - 0.09);
      const luz = (this.impulsos || []).reduce((m, p) => p.tipo === 'medula' ? Math.max(m, Math.max(0, 1 - Math.abs(p.y - v.y) / 0.18)) : m, 0);
      g.globalAlpha = (0.32 + luz * 0.6) * B * atenuado('diario'); g.lineWidth = 0.9 + luz * 1.2; g.beginPath(); g.moveTo(a.x, a.y); g.quadraticCurveTo(c.x, c.y, b.x, b.y); g.quadraticCurveTo(d.x, d.y, a.x, a.y); g.stroke();
    }
    // Enlaces reales
    if (this.cfg.fibras && this.enlaces) {
      g.lineWidth = 0.8;
      for (const [a, b] of this.enlaces) {
        const p = this.proyectar(a.x, a.y, a.z), q = this.proyectar(b.x, b.y, b.z); const m = this.proyectar((a.x + b.x) / 2 * 0.6, (a.y + b.y) / 2 - 0.15, (a.z + b.z) / 2 * 0.6);
        const activo = this.sobre && (this.sobre === a || this.sobre === b);
        g.globalAlpha = (activo ? 0.6 : 0.08) * B * (this.foco && a.reg !== this.foco && b.reg !== this.foco ? 0.3 : 1); g.strokeStyle = activo ? (CL ? '#2b2420' : '#ffffff') : (CL ? mezclar(a.color, '#2b2420', 0.35) : a.color);
        g.beginPath(); g.moveTo(p.x, p.y); g.quadraticCurveTo(m.x, m.y, q.x, q.y); g.stroke();
      }
    }
    // Impulsos: suben por la médula, se reparten a las regiones y viajan por los enlaces
    this.impulsar(g, t, dt, CL, B);
    // Notas
    let mejor = null, dmin = 16; const proy = [];
    for (const n of this.notas) {
      const p = this.proyectar(n.x, n.y, n.z); proy.push([n, p]);
      if (this.raton) { const d = Math.hypot(p.x - this.raton.x, p.y - this.raton.y); if (d < dmin) { dmin = d; mejor = n; } }
    }
    this.sobre = mejor;
    const busca = sinAcentos(this.busca || '');
    for (const [n, p] of proy) {
      const coincide = !busca || sinAcentos(n.f.basename).includes(busca);
      let alfa = atenuado(n.reg) * (coincide ? 1 : 0.12) * limitar(0.75 - p.z * 0.2, 0.35, 1) * (n.reg === 'nucleo' ? 0.6 : 1);
      let color = n.color, tam = n.tam * T * p.s * Math.sqrt(this.zoom);
      if (n.reg === 'diario') { const k = n.pct == null ? 0 : n.pct; color = k >= 0.5 ? (CL ? '#3f9a78' : '#7fe8c0') : (CL ? '#b3aca3' : '#9aa7a6'); alfa *= 0.35 + 0.65 * k; tam *= 0.9 + k * 0.6; }
      const hoyF = n.reg === 'diario' && n.f.basename === hoyISO();
      const tw = 0.85 + 0.15 * Math.sin(t * 2 + n.x * 5);
      const halo = tam * (n === this.sobre || hoyF ? 9 : 6);
      g.globalAlpha = alfa * 0.9 * tw * B * (CL ? 0.55 : 1); g.drawImage(sprite(color), p.x - halo, p.y - halo, halo * 2, halo * 2);
      g.globalAlpha = alfa; g.fillStyle = CL ? mezclar(color, '#2b2420', 0.25) : '#ffffff'; g.beginPath(); g.arc(p.x, p.y, Math.max(0.8, tam * 0.45), 0, Math.PI * 2); g.fill();
    }
    g.globalCompositeOperation = 'source-over';
    // Rótulos de región
    if (this.cfg.etiquetas) {
      g.font = '500 11px ' + FUENTE_MONO; g.textAlign = 'center';
      for (const R of REGIONES) {
        if (!this.cuenta || !this.cuenta[R.id]) continue; if (this.foco && this.foco !== R.id) continue;
        const p = R.id === 'diario' ? this.proyectar(0.55, 1.2, -0.2) : this.proyectar(R.c[0], R.c[1] - R.r * 0.9, R.c[2]);
        g.globalAlpha = CL ? 0.9 : 0.75; g.fillStyle = CL ? mezclar(R.color, '#2b2420', 0.45) : R.color; g.fillText(R.nombre.toUpperCase(), p.x, p.y);
      }
      g.textAlign = 'start';
    }
    if (this.sobre) { const p = this.proyectar(this.sobre.x, this.sobre.y, this.sobre.z); const R = this.region(this.sobre.reg); this.etiqueta(p, this.sobre.f.basename, R.nombre + (this.sobre.pct != null ? ' · ' + Math.round(this.sobre.pct * 100) + ' % hecho' : '')); }
    this.canvas.style.cursor = this.sobre ? 'pointer' : 'grab';
    g.globalAlpha = 1;
  }
  impulsar(g, t, dt, CL, B) {
    if (this.reducido) return; this.impulsos = this.impulsos || []; const lista = this.impulsos;
    REGIONES.forEach((R) => { if (R.destello) R.destello = Math.max(0, R.destello - dt * 1.4); });
    this.reloj = (this.reloj || 0) + dt;
    if (this.reloj > 0.75) { this.reloj = 0; lista.push({ tipo: 'medula', y: 3.0, v: 1.5 + Math.random() * 0.5 }); }
    if (this.enlaces && this.enlaces.length && Math.random() < dt * 2.2) { const [a, b] = this.enlaces[Math.floor(Math.random() * this.enlaces.length)]; lista.push({ tipo: 'enlace', a, b, k: 0, v: 0.8 + Math.random() * 0.6 }); }
    if (Math.random() < dt * 1.2 && this.nervios.length) { const n = this.nervios[Math.floor(Math.random() * this.nervios.length)]; lista.push({ tipo: 'nervio', n, l: Math.random() < 0.5 ? -1 : 1, k: 0, v: 1.2 }); }
    const curva = (curva0) => curva0;
    const dibuja = (x, y, z, color, tam, fuerza) => {
      const p = this.proyectar(x, y, z); const s = tam * p.s * Math.sqrt(this.zoom);
      g.globalAlpha = Math.min(1, fuerza * B * (CL ? 0.6 : 1)); g.drawImage(sprite(color), p.x - s, p.y - s, s * 2, s * 2);
      g.globalAlpha = Math.min(1, fuerza * (CL ? 0.9 : 1)); g.fillStyle = CL ? mezclar(color, '#2b2420', 0.3) : '#ffffff'; g.beginPath(); g.arc(p.x, p.y, Math.max(0.8, s * 0.14), 0, 6.3); g.fill();
    };
    const vivos = [];
    for (const p of lista) {
      if (p.tipo === 'medula') {
        p.y -= p.v * dt;
        for (let k = 0; k < 6; k++) { const yy = p.y + k * 0.05; if (yy > 3.05) continue; dibuja(0, yy, -0.3 + 0.12 * Math.sin((yy - 0.2) * 1.4), CL ? '#3f9a8a' : '#9ff0e0', 13 - k * 1.6, 0.9 - k * 0.14); }
        if (p.y < -0.42) { // llega al tronco: se reparte a 2-3 regiones
          const destinos = REGIONES.filter((R) => R.r && this.cuenta && this.cuenta[R.id]);
          for (let i = 0; i < 2 + Math.floor(Math.random() * 2) && destinos.length; i++) { const R = destinos[Math.floor(Math.random() * destinos.length)]; const lado = R.espejo ? (Math.random() < 0.5 ? -1 : 1) : 1; lista.push({ tipo: 'axon', R, x2: R.c[0] * lado, k: 0, v: 1.1 + Math.random() * 0.5 }); }
          continue;
        }
      } else if (p.tipo === 'axon') {
        p.k += p.v * dt; const k = Math.min(1, p.k), R = p.R; const x0 = 0, y0 = -0.45, z0 = -0.3; const cx = p.x2 * 0.4, cy = -1.25, cz = (R.c[2] + z0) * 0.3;
        const u = 1 - k; const x = u * u * x0 + 2 * u * k * cx + k * k * p.x2, y = u * u * y0 + 2 * u * k * cy + k * k * R.c[1], z = u * u * z0 + 2 * u * k * cz + k * k * R.c[2];
        dibuja(x, y, z, R.color, 11, 0.85);
        if (p.k >= 1) { R.destello = 1; continue; }
      } else if (p.tipo === 'enlace') {
        p.k += p.v * dt; const k = Math.min(1, p.k), a = p.a, b = p.b; const mx = (a.x + b.x) / 2 * 0.6, my = (a.y + b.y) / 2 - 0.15, mz = (a.z + b.z) / 2 * 0.6; const u = 1 - k;
        dibuja(u * u * a.x + 2 * u * k * mx + k * k * b.x, u * u * a.y + 2 * u * k * my + k * k * b.y, u * u * a.z + 2 * u * k * mz + k * k * b.z, a.color, 8, 0.7);
        if (p.k >= 1) continue;
      } else if (p.tipo === 'nervio') {
        p.k += p.v * dt; const k = Math.min(1, p.k), n = p.n, l = p.l; const u = 1 - k;
        const x = 2 * u * k * l * n.largo * 0.55 + k * k * l * n.largo, y = u * u * n.y + 2 * u * k * (n.y + n.caida * 0.35) + k * k * (n.y + n.caida), z = u * u * n.z + 2 * u * k * (n.z + 0.05) + k * k * (n.z + 0.1);
        dibuja(x, y, z, CL ? '#3f9a8a' : '#c8fff4', 7, 0.6 * (1 - k * 0.6));
        if (p.k >= 1) continue;
      }
      vivos.push(p);
    }
    this.impulsos = vivos.slice(-60); g.globalAlpha = 1;
  }
  etiqueta(p, titulo, sub) {
    const g = this.ctx; g.font = '600 12px ' + FUENTE_MONO; const w1 = g.measureText(titulo).width; g.font = '11px ' + FUENTE_MONO; const w2 = g.measureText(sub).width;
    const ancho = Math.max(w1, w2) + 24, x = limitar(p.x + 16, 8, this.w - ancho - 8), y = limitar(p.y - 46, 8, this.h - 52);
    const CL = this.claro; g.globalAlpha = 0.95; g.fillStyle = CL ? 'rgba(255,253,250,0.97)' : 'rgba(14,16,18,0.92)'; g.strokeStyle = CL ? 'rgba(70,52,36,0.14)' : 'rgba(255,255,255,0.18)'; g.lineWidth = 1;
    g.beginPath(); if (g.roundRect) g.roundRect(x, y, ancho, 42, 8); else g.rect(x, y, ancho, 42); g.fill(); g.stroke();
    g.globalAlpha = 1; g.fillStyle = CL ? '#1f1b18' : '#f2f2f2'; g.font = '600 12px ' + FUENTE_MONO; g.fillText(titulo, x + 12, y + 18);
    g.fillStyle = CL ? '#78716a' : '#9aa0a6'; g.font = '11px ' + FUENTE_MONO; g.fillText(sub, x + 12, y + 33);
  }
  destruir() { this.vivo = false; this.ro.disconnect(); }
}

/* =========================================================
   CEREBRO · GALAXIA (WebGL)
   Tus notas como una galaxia espiral. En el centro, un agujero negro: HOY.
   Cinco brazos = cinco órbitas (dinero, cuerpo, mente, relaciones, estudios).
   Lo que has tocado hace poco brilla cerca del centro; lo viejo se va hacia fuera.
   Los días del diario giran en espiral alrededor del hoy: más brillo = más cumplido.
   Si el equipo no tiene WebGL, se usa el cerebro clásico.
   ========================================================= */
const BRAZOS = ['dinero', 'cuerpo', 'mente', 'relaciones', 'estudios'];
const TONO = { dinero: [0.95, 0.80, 0.52], cuerpo: [0.64, 0.86, 0.72], mente: [0.78, 0.74, 0.94], relaciones: [0.96, 0.72, 0.74], estudios: [0.64, 0.78, 0.97], nucleo: [1.0, 0.92, 0.80], equipo: [0.72, 0.92, 0.90], diario: [1.0, 0.95, 0.88] };
const FUENTE_SIS = '-apple-system, "SF Pro Text", "Inter", "Segoe UI Variable Text", "Segoe UI", system-ui, sans-serif';
const espiral = (k, r) => k * Math.PI * 2 / 5 + 2.15 * Math.log(r / 0.28);
// Color por distancia al centro (como una galaxia real): blanco cálido → melocotón → rosa → violeta → azul
const PALETA_RADIO = [[0.0, [1.0, 0.96, 0.92]], [0.55, [1.0, 0.80, 0.72]], [1.1, [1.0, 0.56, 0.74]], [1.8, [0.78, 0.50, 1.0]], [2.6, [0.50, 0.56, 1.0]], [3.6, [0.42, 0.66, 1.0]]];
function colorRadio(r, azarK) {
  let a = PALETA_RADIO[0], b = PALETA_RADIO[PALETA_RADIO.length - 1];
  for (let i = 0; i < PALETA_RADIO.length - 1; i++) if (r >= PALETA_RADIO[i][0] && r <= PALETA_RADIO[i + 1][0]) { a = PALETA_RADIO[i]; b = PALETA_RADIO[i + 1]; break; }
  const k = Math.min(1, Math.max(0, (r - a[0]) / ((b[0] - a[0]) || 1))); const c = a[1].map((v, i) => v + (b[1][i] - v) * k);
  const blanco = azarK < 0.22 ? 0.55 : 0; return c.map((v) => v + (1 - v) * blanco); // algunas estrellas jóvenes, casi blancas
}
const GAL_VS = `
attribute vec3 aP; attribute vec4 aC; attribute vec2 aS;
uniform mat4 uM; uniform float uG, uPx, uT, uFoco, uB, uCielo; uniform mediump float uClaro, uEstrella;
varying vec4 vC;
void main(){
  float r = aP.x; float ph = aP.y + (uCielo > 0.5 ? 0.0 : uG / pow(r + 0.3, 1.1));
  vec3 p = vec3(r * cos(ph), aP.z, r * sin(ph));
  gl_Position = uM * vec4(p, 1.0);
  float tw = 0.84 + 0.16 * sin(uT * (1.1 + fract(aP.y * 7.3)) + aP.y * 17.0 + r * 9.0);
  float f = 1.0; if (uFoco > -0.5) { f = abs(aS.y - uFoco) < 0.5 ? 1.2 : 0.16; }
  vec3 tinta = aC.rgb * vec3(0.36, 0.32, 0.28);
  vC = vec4(mix(aC.rgb, tinta, uClaro), aC.a * tw * f * uB * mix(1.0, 0.75, uClaro));
  float s = uCielo > 0.5 ? aS.x * uPx : aS.x * uPx / gl_Position.w;
  gl_PointSize = max(uEstrella > 0.5 ? 3.0 : 1.0, s);
}`;
const GAL_FS = `
precision mediump float;
varying vec4 vC; uniform float uEstrella, uClaro;
void main(){
  vec2 d = gl_PointCoord - 0.5; float dd = dot(d, d);
  if (dd > 0.25) discard;
  float k;
  if (uEstrella > 0.5) { k = exp(-dd * 90.0) * 1.4 + exp(-dd * 12.0) * 0.34 + exp(-dd * 4.0) * 0.08; }
  else { k = exp(-dd * 26.0); }
  vec3 c = vC.rgb;
  if (uEstrella > 0.5) c = mix(c, mix(vec3(1.0), c * 0.6, uClaro), exp(-dd * 140.0) * 0.85);
  float a = k * vC.a;
  gl_FragColor = vec4(c * a, a);
}`;
const GAL_QUAD = 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }';
// Nebulosa del cielo (se calcula UNA vez en una textura panorámica 2048×1024; luego cada cuadro solo se lee)
const GAL_NEBULOSA = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;
float hash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float ruido(vec3 x){ vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z); }
float fbm(vec3 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 6; i++) { s += a * ruido(p); p = p * 2.03 + vec3(1.7, 9.2, 3.1); a *= 0.5; } return s; }
void main(){
  vec2 uv = gl_FragCoord.xy / uRes; float lon = uv.x * 6.2831853 - 3.1415926; float lat = (uv.y - 0.5) * 3.1415926;
  vec3 d = vec3(cos(lat) * cos(lon), sin(lat), cos(lat) * sin(lon));
  vec3 eje = normalize(vec3(0.69, 0.25, -0.47));
  float banda = exp(-pow(dot(d, eje) / 0.42, 2.0));
  float q = fbm(d * 2.1 + 4.0);
  float det = fbm(d * 5.5 + q * 1.8);
  float polvo = smoothstep(0.48, 0.78, fbm(d * 7.0 + q * 2.5 + 11.0));
  vec3 azul = vec3(0.10, 0.16, 0.46), violeta = vec3(0.34, 0.14, 0.52), rosa = vec3(0.70, 0.26, 0.50), melocoton = vec3(0.95, 0.62, 0.52);
  vec3 c = mix(azul, violeta, smoothstep(0.3, 0.7, q));
  c = mix(c, rosa, smoothstep(0.5, 0.85, det) * (0.35 + 0.65 * banda));
  float nucleoBanda = exp(-pow(length(d - normalize(vec3(-0.62, -0.42, -0.66))), 2.0) * 2.2);
  c = mix(c, melocoton, nucleoBanda * banda * smoothstep(0.4, 0.8, det));
  float luz = 0.09 + 0.26 * pow(q, 2.0) + 0.85 * banda * pow(det, 1.6) + 0.35 * nucleoBanda * banda;
  c *= luz; c *= 1.0 - polvo * (0.25 + 0.6 * banda);
  gl_FragColor = vec4(c, 1.0);
}`;
const GAL_FONDO = `
precision mediump float;
uniform vec2 uRes, uC; uniform float uR, uTilt, uT, uClaro, uB, uNebK; uniform sampler2D uNeb; uniform vec3 uDr, uDu, uDf; uniform vec2 uTan;
float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main(){
  vec2 fc = gl_FragCoord.xy; vec2 uv = fc / uRes - 0.5; uv.x *= uRes.x / uRes.y;
  vec3 bg = mix(vec3(0.004, 0.004, 0.006), vec3(0.925, 0.905, 0.872), uClaro);
  float vig = 1.0 - dot(uv, uv) * mix(0.75, 0.22, uClaro);
  vec3 col = bg * mix(1.0, vig, uClaro) ;
  vec2 q = (fc - uC) / uR; float d = length(vec2(q.x, q.y / max(0.2, uTilt)));
  float glow = 0.12 * exp(-d * 0.06) + 0.3 * exp(-d * 0.3);
  col += (1.0 - uClaro) * vec3(1.0, 0.80, 0.60) * glow * uB * 0.42;
  col -= uClaro * vec3(0.05, 0.055, 0.06) * glow * 1.4;
  col *= mix(vig, 1.0, uClaro);
  if (uNebK > 0.0) { vec2 n = gl_FragCoord.xy / uRes * 2.0 - 1.0; vec3 dir = normalize(uDf + n.x * uTan.x * uDr + n.y * uTan.y * uDu);
    vec2 tuv = vec2((atan(dir.z, dir.x) + 3.1415926) / 6.2831853, asin(clamp(dir.y, -1.0, 1.0)) / 3.1415926 + 0.5);
    col += texture2D(uNeb, tuv).rgb * uNebK * vig; }
  col += (h(fc + fract(uT * 0.37) * 97.0) - 0.5) * mix(0.022, 0.03, uClaro);
  gl_FragColor = vec4(col, 1.0);
}`;
const GAL_NUCLEO = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uC, uJ; uniform float uR, uTilt, uT, uClaro, uB, uJL;
float h2(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h2(i), h2(i + vec2(1, 0)), f.x), mix(h2(i + vec2(0, 1)), h2(i + vec2(1, 1)), f.x), f.y); }
float fb(vec2 p){ return n2(p) * 0.55 + n2(p * 2.3 + 7.1) * 0.3 + n2(p * 5.1 + 3.3) * 0.15; }
// Gargantua: sombra, anillo de fotones, disco de acreción delante y su imagen curvada por la gravedad (arco de arriba y de abajo)
void main(){
  vec2 q = (gl_FragCoord.xy - uC) / uR; float r = length(q);
  // Chorros relativistas: dos haces azules que salen por los polos
  float largo = dot(q, uJ); float lado = abs(q.x * uJ.y - q.y * uJ.x); float al = abs(largo);
  float ancho = 0.16 + al * 0.045;
  float chorro = exp(-pow(lado / ancho, 2.0)) * smoothstep(uJL, uJL * 0.15, al) * smoothstep(0.9, 1.6, al);
  chorro *= 0.55 + 0.45 * n2(vec2(al * 1.3 - uT * 3.0, lado * 6.0)); chorro *= largo > 0.0 ? 1.0 : 0.55;
  vec3 colChorro = mix(vec3(0.35, 0.5, 1.0), vec3(0.9, 0.95, 1.0), exp(-pow(lado / (ancho * 0.35), 2.0)));
  if (r > 10.0 && chorro < 0.002) { gl_FragColor = vec4(0.0); return; }
  float tilt = max(0.1, uTilt);
  vec2 e = vec2(q.x, q.y / tilt); float re = length(e); float ang = atan(e.y, e.x);
  float giro = uT * 0.35;
  // textura turbulenta que gira (más rápido cerca del centro)
  float tex = fb(vec2(ang * 4.0 - giro * 4.0 / max(re, 1.2) + re * 1.5, re * 3.4));
  float rayas = 0.78 + 0.22 * sin(re * 7.0 + tex * 11.0 + ang * 2.0);
  float disco = smoothstep(1.45, 1.9, re) * smoothstep(9.0, 2.2, re) * (0.25 + 0.95 * tex * tex) * rayas;
  float dop = 0.42 + 0.58 * smoothstep(1.0, -1.0, e.x / max(re, 0.001)); // el lado que se acerca brilla más
  float temp = smoothstep(3.0, 1.5, re); // cerca del centro, más caliente (más blanco)
  vec3 colDisco = mix(mix(vec3(0.55, 0.14, 0.04), vec3(1.0, 0.45, 0.12), smoothstep(9.0, 4.0, re)), vec3(1.0, 0.92, 0.78), temp * temp);
  // imagen lensada: anillo casi circular alrededor de la sombra, más fuerte arriba (la parte de atrás del disco)
  float sobre = smoothstep(-0.15, 0.85, q.y / max(r, 0.001));
  float lente = smoothstep(1.0, 1.1, r) * exp(-(r - 1.1) * 3.2) * (0.25 + 0.95 * sobre) * (0.6 + 0.5 * fb(vec2(atan(q.y, q.x) * 4.0 + giro * 2.0, r * 3.0)));
  float fotones = exp(-pow((r - 1.035) / 0.022, 2.0)) * 1.4;
  float sombra = 1.0 - smoothstep(0.985, 1.015, r);
  float delante = step(q.y, 0.0); // la mitad delantera del disco pasa por delante de la sombra
  float vis = mix(1.0 - sombra, 1.0, delante);
  float resplandor = exp(-max(r - 1.0, 0.0) * 0.55) * 0.18;
  vec3 luz = colChorro * chorro * 0.9 * (1.0 - sombra * (1.0 - delante)) + colDisco * disco * dop * 1.5 * vis + vec3(1.0, 0.86, 0.66) * (lente + fotones) * (1.0 - sombra) + vec3(1.0, 0.7, 0.45) * resplandor * (1.0 - sombra);
  luz *= uB;
  float aOsc = sombra * (1.0 - delante * clamp(disco * 1.4, 0.0, 1.0));
  vec3 tinta = vec3(0.16, 0.12, 0.10); float s = clamp(dot(luz, vec3(0.33)) * 0.6, 0.0, 0.9);
  gl_FragColor = vec4(mix(luz, tinta * s + vec3(0.06, 0.05, 0.05) * sombra, uClaro), mix(aOsc, clamp(s + sombra, 0.0, 1.0), uClaro));
}`;
// Galaxias lejanas: pequeñas espirales y elípticas en el cielo, cada una distinta
const GAL_LEJ_VS = `
attribute vec3 aP; attribute vec4 aC; attribute vec2 aS; uniform mat4 uM; uniform float uPx, uMaxPt; varying vec4 vC; varying vec2 vX;
void main(){ vec3 p = vec3(aP.x * cos(aP.y), aP.z, aP.x * sin(aP.y)); gl_Position = uM * vec4(p, 1.0); vC = aC; vX = aS; gl_PointSize = min(uMaxPt, aS.x * uPx); }`;
const GAL_LEJ_FS = `
precision mediump float; varying vec4 vC; varying vec2 vX; uniform float uT;
void main(){
  vec2 q = gl_PointCoord - 0.5; float s = vX.y; float a0 = s * 6.283 + uT * 0.004 * (fract(s * 3.1) - 0.5);
  q = mat2(cos(a0), -sin(a0), sin(a0), cos(a0)) * q;
  float tilt = 0.22 + 0.78 * fract(s * 7.31); q.y /= tilt;
  float r = length(q) * 2.0; if (r > 1.0) discard;
  float a = atan(q.y, q.x); float tipo = fract(s * 13.7);
  float brazos = tipo < 0.72 ? pow(0.5 + 0.5 * cos(2.0 * a - 7.0 * log(r + 0.04) + s * 20.0), 2.5) : 0.35;
  float nucleo = exp(-r * r * 60.0);
  float disco = exp(-r * 4.0) * (0.25 + 0.75 * brazos);
  float k = (nucleo * 1.5 + disco) * smoothstep(1.0, 0.55, r);
  vec3 col = mix(vC.rgb, vec3(1.0, 0.93, 0.82), clamp(nucleo * 1.3 + (1.0 - r) * 0.25, 0.0, 1.0));
  gl_FragColor = vec4(col * k * vC.a, k * vC.a);
}`;

class CerebroGalaxia {
  constructor(contenedor, app, opts) {
    this.app = app; this.opts = opts || {};
    this.cfg = Object.assign({}, CEREBRO_BASE, this.opts.cfg || {});
    this.canvas = contenedor.createEl('canvas', { cls: 'orb-lienzo orb-galaxia' });
    const gl = this.canvas.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: true, powerPreference: 'high-performance' });
    if (!gl) { this.canvas.remove(); throw new Error('sin WebGL'); }
    this.gl = gl;
    this.capa = contenedor.createEl('canvas', { cls: 'orb-lienzo orb-galaxia-capa' }); this.ctx = this.capa.getContext('2d');
    this.reducido = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.yaw = 0.6; this.pitch = 0.58; this.zoom = 1; this.foco = null; this.sobre = null; this.busca = ''; this.giro = 0;
    this.vivo = true; this.t0 = performance.now(); this.tUlt = this.t0; this.quieto = 0; this.notas = []; this.enlaces = []; this.pulsos = [];
    this.calidad = 1; this.lentos = 0; this.rapidos = 0;
    this.ajustar = this.ajustar.bind(this); this.cuadro = this.cuadro.bind(this);
    this.programas(); this.polvo();
    this.ro = new ResizeObserver(this.ajustar); this.ro.observe(this.canvas);
    this.ajustar(); this.eventos(); this.datos();
    requestAnimationFrame(this.cuadro);
  }
  region(id) { return REGIONES.find((r) => r.id === id); }
  regionDe(ruta) { return REGIONES.find((r) => ruta.startsWith(r.carpeta + '/')); }
  programas() {
    const gl = this.gl;
    const prog = (vs, fs) => {
      const p = gl.createProgram();
      [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]].forEach(([t, src]) => { const s = gl.createShader(t); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); gl.attachShader(p, s); });
      gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
      const u = {}; const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); for (let i = 0; i < n; i++) { const a = gl.getActiveUniform(p, i); u[a.name] = gl.getUniformLocation(p, a.name); }
      return { p, u };
    };
    this.pGal = prog(GAL_VS, GAL_FS); this.pFondo = prog(GAL_QUAD, GAL_FONDO); this.pNucleo = prog(GAL_QUAD, GAL_NUCLEO); this.pLej = prog(GAL_LEJ_VS, GAL_LEJ_FS);
    this.maxPt = (gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE) || [1, 64])[1];
    try { // nebulosa: se pinta una sola vez en una textura
      const pn = prog(GAL_QUAD, GAL_NEBULOSA); const W = 2048, H = 1024; const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, W, H, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const fb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fb); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      const bq = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bq); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.viewport(0, 0, W, H); gl.useProgram(pn.p); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0); gl.uniform2f(pn.u.uRes, W, H); gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.deleteFramebuffer(fb); gl.deleteProgram(pn.p); this.texNeb = tex;
    } catch (e) { this.texNeb = null; }
    this.aP = gl.getAttribLocation(this.pGal.p, 'aP'); this.aC = gl.getAttribLocation(this.pGal.p, 'aC'); this.aS = gl.getAttribLocation(this.pGal.p, 'aS');
    this.bQuad = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, this.bQuad); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    this.bPolvo = gl.createBuffer(); this.bNotas = gl.createBuffer();
  }
  // Polvo: brazos espirales, disco difuso y bulbo central (una sola vez, con semilla fija)
  polvo() {
    const rnd = azar('galaxia-orbita'); const gauss = () => { let u = 0, v = 0; while (u === 0) u = rnd(); v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.2832 * v); };
    const N = Math.round(80000); const D = new Float32Array(N * 9); let o = 0;
    const blanco = [1.0, 0.95, 0.88];
    for (let i = 0; i < N; i++) {
      const tipo = rnd(); let r, ph, y, reg, c, a, s;
      if (tipo < 0.06) { // ramas entre brazos (como plumas que salen hacia fuera)
        const k = Math.floor(rnd() * 5); const r0 = 0.8 + 2.2 * rnd(); const l = rnd() * 0.5; r = r0 + l; ph = espiral(k, r0) + l * 0.9 + gauss() * 0.03; y = gauss() * 0.03; reg = k;
        c = colorRadio(r, rnd()); a = (0.2 + 0.4 * rnd()) * (1 - l * 1.4);
      } else if (tipo < 0.09) { // cúmulos donde nacen estrellas: rosas y azules, brillantes
        const k = Math.floor(rnd() * 5); r = 0.9 + 2.3 * rnd(); ph = espiral(k, r) + gauss() * 0.05; y = gauss() * 0.02; reg = k;
        c = rnd() < 0.6 ? [1.0, 0.45 + 0.15 * rnd(), 0.72] : [0.62, 0.74, 1.0]; a = 0.55 + 0.4 * rnd();
      } else if (tipo < 0.76) { // brazos
        const k = Math.floor(rnd() * 5); r = 0.55 + 2.9 * Math.pow(rnd(), 0.85);
        ph = espiral(k, r) + gauss() * (0.07 + 0.035 * r) / Math.max(0.55, r * 0.6);
        y = gauss() * (0.035 + 0.02 * r); reg = k;
        const g0 = colorRadio(r, rnd()); const t = TONO[BRAZOS[k]]; const m = 0.12;
        c = [g0[0] + (t[0] - g0[0]) * m, g0[1] + (t[1] - g0[1]) * m, g0[2] + (t[2] - g0[2]) * m];
        a = (0.28 + 0.62 * rnd()) * (1.2 - r / 4.2) * (0.4 + 0.6 * Math.min(1, r / 1.3));
      } else if (tipo < 0.92) { // disco difuso
        r = 0.65 + Math.min(3.6, -Math.log(1 - rnd() * 0.97) * 1.05); ph = rnd() * 6.2832; y = gauss() * 0.06; reg = 6;
        c = colorRadio(r, rnd()); a = 0.08 + 0.22 * rnd();
      } else { // bulbo
        r = Math.abs(gauss()) * 0.5 + 0.5; ph = rnd() * 6.2832; y = gauss() * 0.12 * (1 - Math.min(1, r)); reg = 5;
        c = colorRadio(r, rnd()); a = 0.05 + 0.14 * rnd();
      }
      s = 0.7 + rnd() * 1.2; if (rnd() < 0.012) { s *= 2.6; a = Math.min(1, a * 1.8); }
      D[o++] = r; D[o++] = ph; D[o++] = y; D[o++] = c[0]; D[o++] = c[1]; D[o++] = c[2]; D[o++] = a; D[o++] = s; D[o++] = reg;
    }
    this.nPolvo = N; const gl = this.gl; gl.bindBuffer(gl.ARRAY_BUFFER, this.bPolvo); gl.bufferData(gl.ARRAY_BUFFER, D, gl.STATIC_DRAW);
    const NN = 2600; const Q = new Float32Array(NN * 9); o = 0;
    for (let i = 0; i < NN; i++) {
      const enBrazo = rnd() < 0.93; const k = Math.floor(rnd() * 5); const r = enBrazo ? 0.35 + 3.0 * Math.pow(rnd(), 0.9) : Math.abs(gauss()) * 0.55 + 0.12;
      const ph = enBrazo ? espiral(k, r) + gauss() * 0.11 : rnd() * 6.2832; const t = colorRadio(r, 1);
      Q[o++] = r; Q[o++] = ph; Q[o++] = gauss() * 0.03; Q[o++] = t[0]; Q[o++] = t[1]; Q[o++] = t[2];
      Q[o++] = (enBrazo ? (0.09 + 0.09 * rnd()) * (0.35 + 0.65 * Math.min(1, r / 1.3)) : 0.05 + 0.04 * rnd()) * (1.2 - r / 4.2); Q[o++] = (enBrazo ? 12 + rnd() * 22 : 16 + rnd() * 20) * (0.65 + 0.35 * (1 - r / 3.5)); Q[o++] = enBrazo ? k : 5;
    }
    this.nNubes = NN; this.bNubes = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, this.bNubes); gl.bufferData(gl.ARRAY_BUFFER, Q, gl.STATIC_DRAW);
    // Cielo: estrellas lejanas con colores reales (azuladas, blancas, amarillas y naranjas) y una banda más densa
    const NC = 14000; const C = new Float32Array(NC * 9); o = 0;
    const tipos = [[0.72, 0.8, 1.0], [0.88, 0.92, 1.0], [1.0, 1.0, 1.0], [1.0, 0.95, 0.84], [1.0, 0.84, 0.66], [1.0, 0.74, 0.58]];
    for (let i = 0; i < NC; i++) {
      let x = gauss(), y = gauss(), z = gauss(); if (i < NC * 0.6) { y *= 0.14; const a = 0.5; const yy = y * Math.cos(a) - z * Math.sin(a); z = y * Math.sin(a) + z * Math.cos(a); y = yy; }
      const l = Math.hypot(x, y, z) || 1; x = x / l * 40; y = y / l * 40; z = z / l * 40;
      const t = tipos[Math.floor(Math.pow(rnd(), 0.8) * tipos.length)]; const brillo = Math.pow(rnd(), 3);
      C[o++] = Math.hypot(x, z); C[o++] = Math.atan2(z, x); C[o++] = y; C[o++] = t[0]; C[o++] = t[1]; C[o++] = t[2];
      C[o++] = 0.25 + 0.75 * brillo; C[o++] = 0.8 + brillo * 2.2 + (rnd() < 0.01 ? 1.6 : 0); C[o++] = 7;
    }
    // Galaxias lejanas (espirales y elípticas) repartidas por el cielo
    const NL = 26; const L = new Float32Array(NL * 9); o = 0; const tonosL = [[0.75, 0.82, 1.0], [1.0, 0.86, 0.72], [0.92, 0.78, 1.0], [1.0, 0.75, 0.85], [0.8, 0.95, 1.0]];
    for (let i = 0; i < NL; i++) { let x = gauss(), y = gauss(), z = gauss(); const l = Math.hypot(x, y, z) || 1; x = x / l * 38; y = y / l * 38; z = z / l * 38; const t = tonosL[i % tonosL.length]; const grande = i < 3;
      L[o++] = Math.hypot(x, z); L[o++] = Math.atan2(z, x); L[o++] = y; L[o++] = t[0]; L[o++] = t[1]; L[o++] = t[2]; L[o++] = grande ? 0.9 : 0.45 + 0.4 * rnd(); L[o++] = grande ? 70 + rnd() * 50 : 14 + rnd() * 26; L[o++] = rnd(); }
    this.nLej = NL; this.bLej = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, this.bLej); gl.bufferData(gl.ARRAY_BUFFER, L, gl.STATIC_DRAW);
    this.nCielo = NC; this.bCielo = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, this.bCielo); gl.bufferData(gl.ARRAY_BUFFER, C, gl.STATIC_DRAW);
    // Bandas de polvo oscuro por el borde interior de cada brazo (dan profundidad, como en las fotos reales)
    const NO = 5200; const Z = new Float32Array(NO * 9); o = 0;
    for (let i = 0; i < NO; i++) { const k = Math.floor(rnd() * 5); const r = 0.5 + 2.6 * Math.pow(rnd(), 0.9); Z[o++] = r; Z[o++] = espiral(k, r) - 0.16 + gauss() * 0.05; Z[o++] = gauss() * 0.02; Z[o++] = 0; Z[o++] = 0; Z[o++] = 0; Z[o++] = 0.035 + 0.05 * rnd(); Z[o++] = 8 + rnd() * 12; Z[o++] = k; }
    this.nOscuro = NO; this.bOscuro = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, this.bOscuro); gl.bufferData(gl.ARRAY_BUFFER, Z, gl.STATIC_DRAW);
  }
  async datos() {
    const rnd = azar('notas-galaxia'); const gauss = () => { let u = 0; while (u === 0) u = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.2832 * rnd()); };
    const archivos = this.app.vault.getMarkdownFiles().filter((f) => f.path.startsWith(RAIZ + '/') && !f.path.startsWith(CARPETAS.archivo + '/') && !f.path.startsWith(CARPETAS.plantillas + '/'));
    const resolved = (this.app.metadataCache && this.app.metadataCache.resolvedLinks) || {};
    const grado = {}; for (const a in resolved) for (const b in resolved[a]) { grado[a] = (grado[a] || 0) + 1; grado[b] = (grado[b] || 0) + 1; }
    const porReg = {}; for (const f of archivos) { const R = this.regionDe(f.path); if (!R) continue; (porReg[R.id] = porReg[R.id] || []).push(f); }
    const notas = [];
    for (const id in porReg) {
      const lista = porReg[id];
      if (id === 'diario') { // espiral de días alrededor del hoy: el más reciente, pegado al centro
        lista.sort((a, b) => b.basename.localeCompare(a.basename));
        lista.forEach((f, i) => notas.push({ f, reg: id, r: 0.5 + i * 0.006, ph0: -i * 0.33 - 1.2, y: 0, tam: f.basename === hoyISO() ? 8 : 3.6, pct: null, mtime: (f.stat && f.stat.mtime) || 0 }));
        continue;
      }
      lista.sort((a, b) => ((b.stat && b.stat.mtime) || 0) - ((a.stat && a.stat.mtime) || 0));
      const k = BRAZOS.indexOf(id);
      lista.forEach((f, i) => {
        let r, ph, y;
        if (k < 0) { r = 0.72 + rnd() * 0.32; ph = rnd() * 6.2832; y = gauss() * 0.05; } // núcleo y equipo, en el bulbo
        else { const u = lista.length > 1 ? i / (lista.length - 1) : 0; r = 1.0 + 2.2 * Math.pow(u, 0.8) + gauss() * 0.09; ph = espiral(k, r) + gauss() * (0.14 / Math.max(0.8, r * 0.5)); y = gauss() * 0.04; }
        notas.push({ f, reg: id, r, ph0: ph, y, tam: 4.6 + Math.min(6, (grado[f.path] || 0) * 0.6), pct: null, mtime: (f.stat && f.stat.mtime) || 0 });
      });
    }
    for (const n of notas.filter((n) => n.reg === 'diario')) { try { const d = parsearDia(await this.app.vault.cachedRead(n.f)); n.pct = d && d.total ? d.hechas / d.total : 0; } catch (e) { n.pct = 0; } }
    const porRuta = {}; notas.forEach((n) => { porRuta[n.f.path] = n; });
    this.enlaces = []; for (const a in resolved) for (const b in resolved[a]) if (porRuta[a] && porRuta[b] && a !== b) this.enlaces.push([porRuta[a], porRuta[b]]);
    this.vecinos = new Map(); for (const [a, b] of this.enlaces) { if (!this.vecinos.has(a)) this.vecinos.set(a, new Set()); if (!this.vecinos.has(b)) this.vecinos.set(b, new Set()); this.vecinos.get(a).add(b); this.vecinos.get(b).add(a); }
    this.notas = notas; this.bufNotas = new Float32Array(notas.length * 9);
    this.cuenta = {}; REGIONES.forEach((R) => { this.cuenta[R.id] = notas.filter((n) => n.reg === R.id).length; });
    let palabras = 0; for (const n of notas) { try { const t = await this.app.vault.cachedRead(n.f); palabras += (t.match(/\S+/g) || []).length; } catch (e) { /* nada */ } }
    this.palabras = palabras;
    if (this.opts.alDatos) this.opts.alDatos(this);
  }
  ajustar() {
    const q = this.calidad; const dpr = Math.min(window.devicePixelRatio || 1, q > 0.8 ? 1.5 : 1);
    const w = this.canvas.clientWidth || 800, h = this.canvas.clientHeight || 600;
    this.w = w; this.h = h; this.dpr = dpr;
    this.canvas.width = Math.round(w * dpr); this.canvas.height = Math.round(h * dpr);
    const d2 = Math.min(window.devicePixelRatio || 1, 2); this.capa.width = Math.round(w * d2); this.capa.height = Math.round(h * d2); this.d2 = d2;
  }
  // Cámara: órbita alrededor del centro (yaw, inclinación y distancia)
  matriz() {
    const D = 9.6 / this.zoom; const cp = Math.cos(this.pitch), sp = Math.sin(this.pitch), cy = Math.cos(this.yaw), sy = Math.sin(this.yaw);
    const ex = D * cp * sy, ey = D * sp, ez = D * cp * cy;
    let fx = -ex, fy = -ey, fz = -ez; let l = Math.hypot(fx, fy, fz); fx /= l; fy /= l; fz /= l;
    const lh = Math.hypot(fx, fz) || 1; const rx = -fz / lh, ry = 0, rz = fx / lh; // derecha = f × arriba
    const ux = ry * fz - rz * fy, uy = rz * fx - rx * fz, uz = rx * fy - ry * fx; this.base = { r: [rx, ry, rz], u: [ux, uy, uz], f: [fx, fy, fz] };
    const V = [rx, ux, -fx, 0, ry, uy, -fy, 0, rz, uz, -fz, 0, -(rx * ex + ry * ey + rz * ez), -(ux * ex + uy * ey + uz * ez), (fx * ex + fy * ey + fz * ez), 1];
    const fov = 0.62, asp = this.w / this.h, n = 0.05, f = 60, t = 1 / Math.tan(fov / 2);
    const off = this.fondo || this.w < 900 ? 0 : (2 * 130) / this.w; this.desp = (this.desp == null ? off : this.desp + (off - this.desp) * 0.08); // deja sitio a los paneles de la izquierda
    const P = [t / asp, 0, 0, 0, 0, t, 0, 0, -this.desp, 0, (f + n) / (n - f), -1, 0, 0, (2 * f * n) / (n - f), 0];
    const M = new Float32Array(16);
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) { let s = 0; for (let k = 0; k < 4; k++) s += P[k * 4 + r] * V[c * 4 + k]; M[c * 4 + r] = s; }
    this.M = M; this.esc = (this.h / 2) * t; return M;
  }
  pos(r, ph0, y) { const ph = ph0 + this.giro / Math.pow(r + 0.3, 1.1); return [r * Math.cos(ph), y, r * Math.sin(ph)]; }
  proyectar(x, y, z) {
    const M = this.M; const cx = M[0] * x + M[4] * y + M[8] * z + M[12], cy = M[1] * x + M[5] * y + M[9] * z + M[13], cw = M[3] * x + M[7] * y + M[11] * z + M[15];
    return { x: (cx / cw * 0.5 + 0.5) * this.w, y: (1 - (cy / cw * 0.5 + 0.5)) * this.h, w: cw, s: this.esc / cw };
  }
  eventos() {
    const c = this.canvas; let arr = null;
    const pos = (e) => { const r = c.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    c.addEventListener('pointerdown', (e) => { arr = { ...pos(e), a: this.yaw, i: this.pitch, mov: 0 }; c.setPointerCapture(e.pointerId); });
    c.addEventListener('pointermove', (e) => {
      const p = pos(e); this.raton = p;
      if (arr) { const dx = p.x - arr.x, dy = p.y - arr.y; arr.mov = Math.max(arr.mov, Math.abs(dx) + Math.abs(dy)); this.yawObj = null; this.yaw = arr.a - dx * 0.006; this.pitch = limitar(arr.i + dy * 0.004, 0.08, 1.45); this.quieto = performance.now(); }
    });
    c.addEventListener('pointerup', () => {
      if (arr && arr.mov < 5) {
        if (this.sobre && this.opts.alAbrir) this.opts.alAbrir(this.sobre.f);
        else if (this.etiquetaSobre) { this.foco = this.foco === this.etiquetaSobre ? null : this.etiquetaSobre; if (this.opts.alFoco) this.opts.alFoco(); }
      }
      arr = null;
    });
    c.addEventListener('pointerleave', () => { this.raton = null; });
    c.addEventListener('wheel', (e) => { e.preventDefault(); this.zoomObj = limitar((this.zoomObj || this.zoom) * (e.deltaY > 0 ? 0.9 : 1.11), 0.5, 3.2); }, { passive: false });
    c.addEventListener('dblclick', () => { this.zoomObj = 1; this.pitchObj = 0.58; this.foco = null; if (this.opts.alFoco) this.opts.alFoco(); });
  }
  cuadro(ahora) {
    if (!this.vivo) return; requestAnimationFrame(this.cuadro);
    if (document.hidden || !this.canvas.isConnected || this.canvas.clientWidth === 0) { this.tUlt = ahora; return; }
    const dt = Math.min(0.05, (ahora - this.tUlt) / 1000); this.tUlt = ahora; const t = (ahora - this.t0) / 1000;
    // Calidad adaptativa: si va lento, menos polvo y menos resolución
    const ms = dt * 1000; if (ms > 24) { this.lentos++; this.rapidos = 0; } else if (ms < 14) { this.rapidos++; this.lentos = 0; }
    if (this.lentos > 40 && this.calidad > 0.35) { this.calidad = Math.max(0.35, this.calidad - 0.2); this.lentos = 0; this.ajustar(); }
    if (this.rapidos > 240 && this.calidad < 1) { this.calidad = Math.min(1, this.calidad + 0.1); this.rapidos = 0; this.ajustar(); }
    // Movimiento: giro de la galaxia, deriva lenta de la cámara y suavizado del zoom
    const vel = 0.05 + this.cfg.velocidad * 0.16;
    if (this.cfg.girar && !this.reducido) this.giro += dt * vel;
    const libre = ahora - this.quieto > 3000;
    if (!this.fondo && !this.reducido && ahora - this.quieto > 6000) this.yaw += dt * 0.012; // la cámara respira despacio cuando no la tocas
    if (this.fondo && libre && !this.reducido) { this.yaw += dt * 0.035; this.pitch += (0.5 + 0.22 * Math.sin(t * 0.05) - this.pitch) * dt * 0.3; }
    if (this.zoomObj) { this.zoom += (this.zoomObj - this.zoom) * Math.min(1, dt * 7); if (Math.abs(this.zoomObj - this.zoom) < 0.001) this.zoomObj = null; }
    if (this.pitchObj) { this.pitch += (this.pitchObj - this.pitch) * Math.min(1, dt * 4); if (Math.abs(this.pitchObj - this.pitch) < 0.002) this.pitchObj = null; }
    const CL = esClaro(); this.claro = CL; const B = 0.45 + this.cfg.brillo * 1.1, T = 0.55 + this.cfg.tam * 1.1;
    const gl = this.gl; const W = this.canvas.width, H = this.canvas.height; gl.viewport(0, 0, W, H);
    const M = this.matriz(); const centro = this.proyectar(0, 0, 0); const rNuc = 0.12 * centro.s * this.dpr;
    const cx = centro.x * this.dpr, cy = (this.h - centro.y) * this.dpr, tilt = Math.abs(Math.sin(this.pitch));
    const quad = (pr) => { gl.useProgram(pr.p); gl.bindBuffer(gl.ARRAY_BUFFER, this.bQuad); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      const u = pr.u; if (u.uRes) gl.uniform2f(u.uRes, W, H);
      if (u.uJ) { const pj = this.proyectar(0, 1.6, 0); let jx = pj.x - centro.x, jy = -(pj.y - centro.y); const lj = Math.hypot(jx, jy) || 1; gl.uniform2f(u.uJ, jx / lj, jy / lj); gl.uniform1f(u.uJL, Math.max(1.5, lj * this.dpr / rNuc)); }
      if (u.uNebK) { gl.uniform1f(u.uNebK, this.texNeb && !CL ? 0.55 + 0.6 * this.cfg.brillo : 0); if (this.texNeb) { gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.texNeb); gl.uniform1i(u.uNeb, 0); }
        const k = this.base; gl.uniform3f(u.uDr, k.r[0], k.r[1], k.r[2]); gl.uniform3f(u.uDu, k.u[0], k.u[1], k.u[2]); gl.uniform3f(u.uDf, k.f[0], k.f[1], k.f[2]); gl.uniform2f(u.uTan, Math.tan(0.31) * this.w / this.h, Math.tan(0.31)); } gl.uniform2f(u.uC, cx, cy); gl.uniform1f(u.uR, rNuc); gl.uniform1f(u.uTilt, tilt); gl.uniform1f(u.uT, t); gl.uniform1f(u.uClaro, CL ? 1 : 0); gl.uniform1f(u.uB, B); gl.drawArrays(gl.TRIANGLES, 0, 3); };
    gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND); quad(this.pFondo);
    // Partículas
    gl.enable(gl.BLEND); if (CL) gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); else gl.blendFunc(gl.ONE, gl.ONE);
    const pg = this.pGal; gl.useProgram(pg.p); const u = pg.u;
    gl.uniformMatrix4fv(u.uM, false, M); gl.uniform1f(u.uG, this.giro); gl.uniform1f(u.uT, this.reducido ? 0 : t); gl.uniform1f(u.uClaro, CL ? 1 : 0); gl.uniform1f(u.uB, B);
    const focoN = this.foco ? (BRAZOS.indexOf(this.foco) >= 0 ? BRAZOS.indexOf(this.foco) : 5) : -1; gl.uniform1f(u.uFoco, focoN);
    const atrib = (buf) => { gl.bindBuffer(gl.ARRAY_BUFFER, buf); [[this.aP, 3, 0], [this.aC, 4, 12], [this.aS, 2, 28]].forEach(([l, n, off]) => { gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, n, gl.FLOAT, false, 36, off); }); };
    gl.uniform1f(u.uCielo, 1); gl.uniform1f(u.uFoco, -1); atrib(this.bCielo); gl.uniform1f(u.uPx, this.dpr * 0.95); gl.uniform1f(u.uEstrella, 0);
    gl.drawArrays(gl.POINTS, 0, Math.floor(this.nCielo * (0.5 + 0.5 * this.calidad)));
    if (!CL) { const pl = this.pLej; gl.useProgram(pl.p); gl.uniformMatrix4fv(pl.u.uM, false, M); gl.uniform1f(pl.u.uPx, this.dpr); gl.uniform1f(pl.u.uMaxPt, this.maxPt); gl.uniform1f(pl.u.uT, t); atrib(this.bLej); gl.drawArrays(gl.POINTS, 0, this.nLej); gl.useProgram(pg.p); }
    gl.uniform1f(u.uCielo, 0); gl.uniform1f(u.uFoco, focoN);
    atrib(this.bPolvo); gl.uniform1f(u.uPx, T * this.dpr * this.esc * 0.011 / Math.pow(this.zoom, 0.65)); gl.uniform1f(u.uEstrella, 0);
    gl.drawArrays(gl.POINTS, 0, Math.floor(this.nPolvo * (0.45 + 0.55 * this.calidad)));
    // Nubes de gas: pocas, grandes y muy suaves (dan el cuerpo luminoso de la galaxia)
    if (!CL) { gl.blendFunc(gl.ZERO, gl.ONE_MINUS_SRC_ALPHA); atrib(this.bOscuro); gl.uniform1f(u.uPx, this.dpr * this.esc * 0.011 / Math.pow(this.zoom, 0.4)); gl.drawArrays(gl.POINTS, 0, this.nOscuro); gl.blendFunc(gl.ONE, gl.ONE); }
    atrib(this.bNubes); gl.uniform1f(u.uPx, this.dpr * this.esc * 0.011 / Math.pow(this.zoom, 0.4)); gl.drawArrays(gl.POINTS, 0, this.nNubes);
    // Notas (se recalculan cada cuadro: brillo, búsqueda, foco y la que está bajo el ratón)
    const busca = sinAcentos(this.busca || ''); const cerca = this.sobre && this.vecinos ? this.vecinos.get(this.sobre) : null;
    const B9 = this.bufNotas; let o = 0; let mejor = null, dmin = 15; this.proy = [];
    for (const n of this.notas) {
      const [x, y, z] = this.pos(n.r, n.ph0, n.y); const p = this.proyectar(x, y, z); this.proy.push([n, p]);
      if (this.raton && p.w > 0) { const d = Math.hypot(p.x - this.raton.x, p.y - this.raton.y); if (d < dmin) { dmin = d; mejor = n; } }
      const coincide = !busca || sinAcentos(n.f.basename).includes(busca);
      const tono = TONO[n.reg] || TONO.nucleo; let a = 0.95, s = n.tam;
      if (n.reg === 'diario') { const k = n.pct == null ? 0 : n.pct; a = 0.25 + 0.75 * k; s *= 0.85 + 0.5 * k; }
      if (!coincide) a *= 0.12; else if (busca) { a = 1; s *= 1.5; }
      if (this.foco) { const fx = BRAZOS.indexOf(this.foco) >= 0 ? this.foco : null; const dentro = fx ? n.reg === fx : BRAZOS.indexOf(n.reg) < 0; if (!dentro) a *= 0.15; }
      if (this.sobre === n) { a = 1; s *= 1.7; } else if (cerca && cerca.has(n)) { a = Math.max(a, 0.9); s *= 1.25; }
      B9[o++] = n.r; B9[o++] = n.ph0; B9[o++] = n.y; B9[o++] = tono[0]; B9[o++] = tono[1]; B9[o++] = tono[2]; B9[o++] = a; B9[o++] = s; B9[o++] = BRAZOS.indexOf(n.reg) >= 0 ? BRAZOS.indexOf(n.reg) : 5;
    }
    this.sobre = mejor || this.resaltar || null;
    if (this.notas.length) { gl.bindBuffer(gl.ARRAY_BUFFER, this.bNotas); gl.bufferData(gl.ARRAY_BUFFER, B9, gl.DYNAMIC_DRAW); atrib(this.bNotas); gl.uniform1f(u.uPx, T * this.dpr * this.esc * 0.02 / Math.pow(this.zoom, 0.6)); gl.uniform1f(u.uEstrella, 1); gl.uniform1f(u.uFoco, -1); gl.drawArrays(gl.POINTS, 0, this.notas.length); }
    // Núcleo: agujero negro con disco y anillo de luz (tapa lo que hay detrás)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); quad(this.pNucleo);
    this.dibujarCapa(t, dt, CL, B, centro);
    this.capa.style.cursor = this.sobre || this.etiquetaSobre ? 'pointer' : 'grab'; this.canvas.style.cursor = this.capa.style.cursor;
  }
  // Capa 2D: enlaces, pulsos, nombres de los brazos, «HOY» y la ficha de la nota
  dibujarCapa(t, dt, CL, B, centro) {
    const g = this.ctx; g.setTransform(this.d2, 0, 0, this.d2, 0, 0); g.clearRect(0, 0, this.w, this.h);
    const pos = new Map(this.proy || []);
    // Vida: estrellas fugaces cruzando el cielo y estrellas que nacen en los brazos
    if (!this.reducido && !CL) {
      this.fugaces = this.fugaces || []; this.nacen = this.nacen || [];
      if (Math.random() < dt / 5.5) { const a = Math.random() * Math.PI * 2; const v = 520 + Math.random() * 420; this.fugaces.push({ x: Math.random() * this.w, y: Math.random() * this.h * 0.7, vx: Math.cos(a) * v, vy: Math.abs(Math.sin(a)) * v * 0.5 + 60, t: 0, d: 0.7 + Math.random() * 0.5 }); }
      if (Math.random() < dt * 1.4) { const k = Math.floor(Math.random() * 5); const r = 0.8 + Math.random() * 2.4; this.nacen.push({ r, ph: espiral(k, r) + (Math.random() - 0.5) * 0.12, t: 0, d: 1.6 + Math.random() * 1.2, c: Math.random() < 0.6 ? '255,150,205' : '160,190,255' }); }
      g.globalCompositeOperation = 'lighter';
      this.fugaces = this.fugaces.filter((f) => { f.t += dt; if (f.t > f.d) return false; f.x += f.vx * dt; f.y += f.vy * dt; const k = Math.sin(Math.PI * f.t / f.d);
        const largo = 0.09; const gr = g.createLinearGradient(f.x, f.y, f.x - f.vx * largo, f.y - f.vy * largo); gr.addColorStop(0, `rgba(255,250,240,${0.85 * k})`); gr.addColorStop(1, 'rgba(255,250,240,0)');
        g.globalAlpha = 1; g.strokeStyle = gr; g.lineWidth = 1.3; g.beginPath(); g.moveTo(f.x, f.y); g.lineTo(f.x - f.vx * largo, f.y - f.vy * largo); g.stroke(); return true; });
      this.nacen = this.nacen.filter((n) => { n.t += dt; if (n.t > n.d) return false; const [x, y, z] = this.pos(n.r, n.ph, 0); const p = this.proyectar(x, y, z); if (p.w <= 0) return true;
        const k = Math.sin(Math.PI * n.t / n.d); const rad = (4 + 14 * k) * Math.min(2, p.s / 120 + 0.6); const gr = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad);
        gr.addColorStop(0, `rgba(255,255,255,${0.9 * k})`); gr.addColorStop(0.25, `rgba(${n.c},${0.45 * k})`); gr.addColorStop(1, `rgba(${n.c},0)`); g.globalAlpha = 1; g.fillStyle = gr; g.fillRect(p.x - rad, p.y - rad, rad * 2, rad * 2); return true; });
      g.globalCompositeOperation = 'source-over';
    }
    const curva = (p, q, alfa, color, ancho) => { const mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2; const kx = mx + (centro.x - mx) * 0.28, ky = my + (centro.y - my) * 0.28;
      g.globalAlpha = alfa; g.strokeStyle = color; g.lineWidth = ancho; g.beginPath(); g.moveTo(p.x, p.y); g.quadraticCurveTo(kx, ky, q.x, q.y); g.stroke(); return [kx, ky]; };
    g.lineCap = 'round';
    if (this.cfg.fibras && this.enlaces.length) {
      g.globalCompositeOperation = CL ? 'source-over' : 'lighter';
            if (this.sobre && this.vecinos && this.vecinos.get(this.sobre)) { const p = pos.get(this.sobre); for (const v of this.vecinos.get(this.sobre)) { const q = pos.get(v); if (p && q) curva(p, q, 0.55, CL ? '#2b2420' : '#ffffff', 1.1); } }
      // Pulsos: pequeñas luces que viajan por los enlaces, como pensamientos
      if (!this.reducido && Math.random() < dt * 1.6 && this.enlaces.length) { const [a, b] = this.enlaces[Math.floor(Math.random() * this.enlaces.length)]; this.pulsos.push({ a, b, k: 0, v: 0.45 + Math.random() * 0.4 }); }
      const vivos = [];
      for (const pu of this.pulsos) {
        pu.k += pu.v * dt; if (pu.k >= 1) continue; vivos.push(pu);
        const p = pos.get(pu.a), q = pos.get(pu.b); if (!p || !q) continue;
        const mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2; const kx = mx + (centro.x - mx) * 0.28, ky = my + (centro.y - my) * 0.28; const k = pu.k, w = 1 - k;
        const x = w * w * p.x + 2 * w * k * kx + k * k * q.x, y = w * w * p.y + 2 * w * k * ky + k * k * q.y; const tono = TONO[pu.a.reg] || TONO.nucleo;
        const r = 7; const gr = g.createRadialGradient(x, y, 0, x, y, r); const c = CL ? '43,36,32' : `${tono[0] * 255 | 0},${tono[1] * 255 | 0},${tono[2] * 255 | 0}`;
        gr.addColorStop(0, `rgba(${c},${0.9 * Math.sin(k * Math.PI)})`); gr.addColorStop(1, `rgba(${c},0)`); g.globalAlpha = 1; g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
      }
      this.pulsos = vivos.slice(-40);
    }
    g.globalCompositeOperation = 'source-over'; this.etiquetaSobre = null;
    if (this.cfg.etiquetas) {
      g.font = '600 11px ' + FUENTE_SIS; g.textAlign = 'center'; g.textBaseline = 'middle'; if (g.letterSpacing !== undefined) g.letterSpacing = '0.2px';
      BRAZOS.forEach((id, k) => {
        const R = this.region(id); if (!R) return; const r = 3.55; const [x, y, z] = this.pos(r, espiral(k, r), 0); const p = this.proyectar(x, y, z); if (p.w <= 0) return;
        const n = (this.cuenta && this.cuenta[id]) || 0; const txt = R.nombre + '  ' + n; const ancho = g.measureText(txt).width;
        const encima = this.raton && Math.abs(this.raton.x - p.x) < ancho / 2 + 8 && Math.abs(this.raton.y - p.y) < 11; if (encima) this.etiquetaSobre = id;
        const apagado = this.foco && this.foco !== id; const tono = TONO[id];
        g.globalAlpha = apagado ? 0.22 : encima || this.foco === id ? 1 : 0.78; const col = CL ? `rgb(${tono[0] * 150 | 0},${tono[1] * 150 | 0},${tono[2] * 150 | 0})` : `rgb(${tono[0] * 255 | 0},${tono[1] * 255 | 0},${tono[2] * 255 | 0})`;
        if (!CL) { g.shadowColor = 'rgba(0,0,0,0.95)'; g.shadowBlur = 10; }
        g.fillStyle = col; g.beginPath(); g.arc(p.x - ancho / 2 - 9, p.y, 2.6, 0, 6.3); g.fill();
        g.fillStyle = CL ? '#3b322b' : '#f3ece2'; g.fillText(txt, p.x, p.y); g.shadowBlur = 0;
        if (encima || this.foco === id) { g.globalAlpha *= 0.5; g.fillRect(p.x - ancho / 2, p.y + 9, ancho, 1); }
      });
      // HOY, debajo del agujero negro
      const rN = 0.12 * centro.s; g.globalAlpha = CL ? 0.75 : 0.85; g.fillStyle = CL ? '#3b322b' : '#fff7ea'; g.font = '600 10.5px ' + FUENTE_SIS; if (g.letterSpacing !== undefined) g.letterSpacing = '1.6px';
      if (!CL) { g.shadowColor = 'rgba(0,0,0,0.9)'; g.shadowBlur = 8; }
      g.fillText('HOY', centro.x, centro.y + Math.max(22, rN * 5.5 * Math.abs(Math.sin(this.pitch)) + 18)); g.shadowBlur = 0;
      g.textAlign = 'start'; g.textBaseline = 'alphabetic'; if (g.letterSpacing !== undefined) g.letterSpacing = '0px';
    }
    if (this.sobre) { const p = (this.proy.find((x) => x[0] === this.sobre) || [])[1]; if (p) { const R = this.region(this.sobre.reg); const nv = this.vecinos && this.vecinos.get(this.sobre) ? this.vecinos.get(this.sobre).size : 0; this.etiqueta(p, this.sobre.f.basename, R.nombre + (this.sobre.pct != null ? ' · ' + Math.round(this.sobre.pct * 100) + ' % hecho' : '') + (nv ? ' · ' + nv + (nv === 1 ? ' enlace' : ' enlaces') : '')); } }
    g.globalAlpha = 1;
  }
  etiqueta(p, titulo, sub) {
    const g = this.ctx; g.font = '600 13px ' + FUENTE_SIS; const w1 = g.measureText(titulo).width; g.font = '11.5px ' + FUENTE_SIS; const w2 = g.measureText(sub).width;
    const ancho = Math.max(w1, w2) + 26, x = limitar(p.x + 18, 8, this.w - ancho - 8), y = limitar(p.y - 50, 8, this.h - 54);
    const CL = this.claro; g.globalAlpha = 1; g.fillStyle = CL ? 'rgba(252,249,244,0.94)' : 'rgba(22,20,30,0.78)'; g.strokeStyle = CL ? 'rgba(60,45,30,0.14)' : 'rgba(255,255,255,0.14)'; g.lineWidth = 1;
    g.beginPath(); if (g.roundRect) g.roundRect(x, y, ancho, 44, 12); else g.rect(x, y, ancho, 44); g.fill(); g.stroke();
    g.fillStyle = CL ? '#1f1b18' : '#f6efe4'; g.font = '600 13px ' + FUENTE_SIS; g.fillText(titulo, x + 13, y + 19);
    g.fillStyle = CL ? '#7a7068' : '#a39b90'; g.font = '11.5px ' + FUENTE_SIS; g.fillText(sub, x + 13, y + 34);
  }
  destruir() { this.vivo = false; this.ro.disconnect(); try { const e = this.gl.getExtension('WEBGL_lose_context'); if (e) e.loseContext(); } catch (e) { /* nada */ } }
}
const colorReg = (id) => { const t = TONO[id] || TONO.nucleo; const k = esClaro() ? 0.6 : 1; return 'rgb(' + t.map((v) => Math.round(v * 255 * k)).join(',') + ')'; };
function crearCerebro(raiz, app, opts) {
  try { return new CerebroGalaxia(raiz, app, opts); } catch (e) { console.warn('ÓRBITA: cerebro en modo clásico', e); raiz.querySelectorAll('.orb-galaxia, .orb-galaxia-capa').forEach((x) => x.remove()); return new Cerebro(raiz, app, opts); }
}

class MapaView extends VistaBase {
  getViewType() { return V.mapa; } getDisplayText() { return 'Cerebro'; } getIcon() { return 'brain'; }
  async onOpen() {
    this.contentEl.addClass('orb-vista', 'orb-mapa', 'orb-cerebro');
    this.montar();
    const re = () => { clearTimeout(this._t); this._t = setTimeout(() => { if (this.cerebro) this.cerebro.datos(); }, 900); };
    ['create', 'delete', 'rename', 'modify'].forEach((ev) => this.registerEvent(this.app.vault.on(ev, re)));
    this.registerEvent(this.app.metadataCache.on('resolved', re));
  }
  montar() {
    const raiz = this.contentEl; raiz.empty();
    const cfg = Object.assign({}, CEREBRO_BASE, this.plugin.ajustes.cerebro || {});
    this.cerebro = crearCerebro(raiz, this.app, {
      cfg, alAbrir: (f) => this.app.workspace.getLeaf('tab').openFile(f),
      alDatos: () => this.paneles(), alFoco: () => this.regiones()
    });
    // Panel izquierdo
    const izq = raiz.createDiv('orb-cb-izq');
    const bus = izq.createDiv('orb-cb-buscar'); const ic = bus.createSpan('orb-cb-ic'); ob.setIcon(ic, 'search');
    const inp = bus.createEl('input', { attr: { type: 'text', placeholder: 'Buscar notas', spellcheck: 'false' } });
    inp.addEventListener('input', () => { this.cerebro.busca = inp.value; });
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { const q = sinAcentos(inp.value); const n = this.cerebro.notas.find((x) => sinAcentos(x.f.basename).includes(q)); if (q && n) this.app.workspace.getLeaf('tab').openFile(n.f); }
      if (e.key === 'Escape') { inp.value = ''; this.cerebro.busca = ''; }
    });
    this.stats = izq.createDiv('orb-cb-stats');
    this.log = izq.createDiv('orb-cb-log');
    this.regCaja = raiz.createDiv('orb-cb-regiones');
    // Panel derecho: Vista
    const der = raiz.createDiv('orb-cb-der');
    const bt = der.createEl('button', { cls: 'orb-cb-vista-btn', text: 'Vista' });
    const pan = der.createDiv('orb-cb-vista'); pan.style.display = 'none';
    bt.addEventListener('click', () => { const ab = pan.style.display === 'none'; pan.style.display = ab ? '' : 'none'; bt.toggleClass('activo', ab); });
    const guardar = async () => { this.plugin.ajustes.cerebro = Object.assign({}, this.cerebro.cfg); if (this.plugin.guardar) await this.plugin.guardar(); };
    const sec = (t) => pan.createDiv({ cls: 'orb-cb-sec', text: t });
    const interruptor = (k, n) => {
      const f = pan.createDiv('orb-cb-fila'); f.createSpan({ text: n }); const s = f.createDiv('orb-cb-sw' + (this.cerebro.cfg[k] ? ' on' : ''));
      f.addEventListener('click', () => { this.cerebro.cfg[k] = !this.cerebro.cfg[k]; s.toggleClass('on', this.cerebro.cfg[k]); guardar(); });
    };
    const deslizador = (k, n) => {
      const f = pan.createDiv('orb-cb-fila'); f.createSpan({ text: n });
      const r = f.createEl('input', { attr: { type: 'range', min: '0', max: '1', step: '0.01' } }); r.value = String(this.cerebro.cfg[k]);
      r.addEventListener('input', () => { this.cerebro.cfg[k] = Number(r.value); }); r.addEventListener('change', guardar);
    };
    sec('Movimiento'); interruptor('girar', 'Girar'); deslizador('velocidad', 'Velocidad');
    sec('Aspecto'); deslizador('brillo', 'Brillo'); deslizador('tam', 'Tamaño de las estrellas'); interruptor('fibras', 'Enlaces y pulsos'); interruptor('etiquetas', 'Nombres de las órbitas');
    // Modo fondo: solo la galaxia, girando despacio (para dejarla de fondo). Esc o clic en «Salir» para volver
    const fondo = der.createEl('button', { cls: 'orb-cb-vista-btn orb-cb-fondo-btn', text: 'Modo fondo' });
    const salir = raiz.createEl('button', { cls: 'orb-cb-salir', text: 'Salir del modo fondo' });
    const ponerFondo = (on) => { raiz.toggleClass('orb-cb-fondo', on); document.body.toggleClass('orb-fondo-activo', on); this.cerebro.fondo = on; if (on) { this.cerebro.zoomObj = 1.05; this.cerebro.foco = null; } };
    fondo.addEventListener('click', () => ponerFondo(true)); salir.addEventListener('click', () => ponerFondo(false));
    this.registerDomEvent(document, 'keydown', (e) => { if (e.key === 'Escape' && raiz.hasClass('orb-cb-fondo')) ponerFondo(false); });
    this._quitarFondo = () => ponerFondo(false);
    this.dock();
    const ay = raiz.createDiv({ cls: 'orb-mapa-ayuda', text: 'Arrastra para girar · rueda para acercar · clic en una estrella para abrir la nota · clic en el nombre de una órbita para destacarla' });
    ay.setAttr('aria-hidden', 'true');
  }
  paneles() { this.estadisticas(); this.actividad(); this.regiones(); }
  estadisticas() {
    const c = this.cerebro; if (!this.stats) return; this.stats.empty();
    const hoyIni = new Date(); hoyIni.setHours(0, 0, 0, 0); const cambios = c.notas.filter((n) => n.mtime >= hoyIni.getTime()).length;
    const fila = this.stats.createDiv('orb-cb-cifras');
    [[c.notas.length, 'notas'], [(c.palabras || 0).toLocaleString('es-ES'), 'palabras'], [cambios, 'hoy']].forEach(([v, t]) => { const d = fila.createDiv('orb-cb-cifra'); d.createDiv({ cls: 'orb-cb-cifra-v', text: String(v) }); d.createDiv({ cls: 'orb-cb-cifra-t', text: t }); });
    const ley = this.stats.createDiv('orb-cb-leyenda');
    [['El centro', 'es hoy'], ['Cada brazo', 'es una órbita'], ['Cerca del centro', 'lo más reciente']].forEach(([a, b]) => { const l = ley.createDiv(); l.createEl('b', { text: a }); l.appendText(' ' + b); });
  }
  actividad() {
    const c = this.cerebro; if (!this.log) return; this.log.empty();
    const cab = this.log.createDiv('orb-cb-log-cab'); const v = cab.createSpan('orb-cb-vivo'); v.createSpan('orb-cb-punto'); v.appendText('Actividad'); cab.createSpan({ text: 'Últimos cambios' });
    const hace = (ms) => { const m = Math.round((Date.now() - ms) / 60000); if (m < 1) return 'ahora'; if (m < 60) return m + ' min'; const h = Math.round(m / 60); if (h < 24) return h + ' h'; const d = Math.round(h / 24); return d === 1 ? 'ayer' : d + ' d'; };
    const color = typeof colorReg === 'function' ? colorReg : () => '#ccc';
    c.notas.slice().sort((a, b) => b.mtime - a.mtime).slice(0, 5).forEach((n) => {
      const it = this.log.createDiv('orb-cb-item'); const pt = it.createSpan('orb-cb-pt'); pt.style.background = color(n.reg);
      const tx = it.createDiv('orb-cb-item-tx'); tx.createDiv({ cls: 'orb-cb-nombre', text: n.f.basename.replace(/_/g, ' ') });
      const R = c.region(n.reg); tx.createDiv({ cls: 'orb-cb-sub', text: R ? R.nombre : '' });
      it.createSpan({ cls: 'orb-cb-hora', text: hace(n.mtime) });
      it.addEventListener('click', () => this.app.workspace.getLeaf('tab').openFile(n.f));
      it.addEventListener('mouseenter', () => { c.resaltar = n; }); it.addEventListener('mouseleave', () => { c.resaltar = null; });
    });
  }
  regiones() {
    const c = this.cerebro; if (!this.regCaja || !c.cuenta) return; this.regCaja.empty();
    const cab = this.regCaja.createDiv('orb-cb-log-cab'); cab.createSpan({ text: 'Órbitas' }); cab.createSpan({ text: c.foco ? 'Toca otra vez para ver todo' : 'Toca para destacar' });
    const color = typeof colorReg === 'function' ? colorReg : (id) => (c.region(id) || {}).color;
    const max = Math.max(1, ...REGIONES.map((R) => c.cuenta[R.id] || 0));
    REGIONES.forEach((R) => {
      const n = c.cuenta[R.id] || 0; const col = color(R.id);
      const f = this.regCaja.createEl('button', { cls: 'orb-cb-reg' + (c.foco === R.id ? ' activo' : '') + (c.foco && c.foco !== R.id ? ' apagado' : '') });
      const pt = f.createSpan('orb-cb-pt'); pt.style.background = col; pt.style.color = col;
      f.createSpan({ cls: 'orb-cb-reg-n', text: R.nombre });
      const bar = f.createSpan('orb-cb-barra'); const b = bar.createSpan(); b.style.width = Math.max(4, Math.round(n / max * 100)) + '%'; b.style.background = col;
      f.createSpan({ cls: 'orb-cb-reg-c', text: String(n) });
      f.addEventListener('click', () => { c.foco = c.foco === R.id ? null : R.id; this.regiones(); });
    });
  }
  async pintar() { /* el lienzo se pinta solo */ }
  async onClose() { if (this._quitarFondo) this._quitarFondo(); if (this.cerebro) this.cerebro.destruir(); }
}


/* =========================================================
   FÉNIX · el camino de los 27 módulos hacia el fénix
   ========================================================= */
const FASES = [
  { n: 'Fundamentos', de: 1, a: 4 },
  { n: 'Mente y emociones', de: 5, a: 12 },
  { n: 'Aprender y lograr metas', de: 13, a: 17 },
  { n: 'Rendimiento y energía', de: 18, a: 23 },
  { n: 'Personas y propósito', de: 24, a: 27 }
];
const faseDe = (n) => FASES.findIndex((f) => n >= f.de && n <= f.a);
async function leerModulos(app) {
  const t = await leer(app, NOTAS.fenix); if (!t) return null;
  const filas = filasTabla(t, 'Los 27 módulos').map((c) => ({ n: Number(c[0]), titulo: (c[1] || '').replace(/^\*|\*$/g, ''), hecho: /\[x\]/i.test(c[2] || ''), idea: c[3] || '', accion: c[4] || '' })).filter((m) => m.n);
  const m = t.match(/\*\*Módulo actual:\*\*\s*(\d+)/);
  const principios = filasTabla(t, 'Los 9 principios').map((c) => c[1]).filter(Boolean);
  return { modulos: filas, actual: m ? Number(m[1]) : (filas.find((x) => !x.hecho) || {}).n || 1, principios };
}
function enTablaModulos(ls) { const i = ls.findIndex((l) => /^##\s.*27 módulos/i.test(l)); if (i < 0) return () => false; let j = ls.findIndex((l, k) => k > i && /^##\s/.test(l)); if (j < 0) j = ls.length; return (k) => k > i && k < j; }
async function marcarModulo(app, n, hecho, actual) {
  const f = archivo(app, NOTAS.fenix); if (!f) return;
  await app.vault.process(f, (t) => {
    let ls = t.split('\n'); const dentro = enTablaModulos(ls);
    ls = ls.map((l, k) => { if (!dentro(k)) return l; const m = l.match(/^\|\s*(\d+)\s*\|/); if (m && Number(m[1]) === n && l.split('|').length >= 5) { const c = l.split('|'); c[3] = ' ' + (hecho ? '[x]' : '[ ]') + ' '; return c.join('|'); } return l; });
    let out = ls.join('\n');
    if (actual != null) out = out.replace(/\*\*Módulo actual:\*\*\s*\d+[^\n]*/, '**Módulo actual:** ' + actual);
    return out;
  });
}
async function guardarCampoModulo(app, n, col, valor) {
  const f = archivo(app, NOTAS.fenix); if (!f) return; const v = String(valor || '').replace(/\|/g, '/').replace(/\s*\n\s*/g, ' ').trim();
  await app.vault.process(f, (t) => { const ls = t.split('\n'); const dentro = enTablaModulos(ls); return ls.map((l, k) => { const m = dentro(k) && l.match(/^\|\s*(\d+)\s*\|/); if (m && Number(m[1]) === n) { const c = l.split('|'); while (c.length < 7) c.splice(c.length - 1, 0, ' '); c[col] = ' ' + v + ' '; return c.join('|'); } return l; }).join('\n'); });
}
class FenixView extends VistaBase {
  getViewType() { return V.fenix; } getDisplayText() { return 'Formación'; } getIcon() { return 'flame'; }
  async onOpen() {
    this.contentEl.addClass('orb-vista');
    await this.pintar();
    const re = () => { clearTimeout(this._t); this._t = setTimeout(() => { if (Date.now() - (this._silencio || 0) > 1500) this.pintar(); }, 400); };
    this.registerEvent(this.app.vault.on('modify', (f) => { if (f.path === NOTAS.fenix) re(); }));
  }
  async pintar() {
    const d = await leerModulos(this.app); const raiz = this.contentEl; const scroll = raiz.scrollTop; raiz.empty();
    const w = raiz.createDiv('orb-hoja orb-fx4'); this.entrada(w);
    this.cabecera(w, 'Formación', 'Tu curso o libro, módulo a módulo');
    if (!d) { w.createDiv({ cls: 'orb-vacio-t', text: 'No encuentro la nota FENIX.' }); return; }
    this.d = d; const tot = d.modulos.length || 27;
    if (!this.sel) this.sel = d.actual;
    const m = d.modulos.find((x) => x.n === this.sel) || d.modulos[0]; const esActual = m.n === d.actual;
    // Cómo funciona, en una línea
    const como = w.createDiv('orb-fx4-como');
    [['headphones', 'Escucha'], ['lightbulb', 'Apunta una idea'], ['target', 'Elige una acción'], ['arrow-right', 'Siguiente módulo']].forEach(([ic, t], i) => {
      if (i) como.createSpan({ cls: 'orb-fx4-flecha', text: '→' }); const s = como.createSpan('orb-fx4-paso-c'); const x = s.createSpan('orb-fx4-ic'); ob.setIcon(x, ic); s.createSpan({ text: t });
    });
    // Tarjeta principal: el módulo y sus tres pasos
    const c = w.createDiv('orb-card orb-fx4-mod'); c.style.setProperty('--c', COLOR.fenix);
    const fk = faseDe(m.n); const fa = FASES[fk];
    const top = c.createDiv('orb-fx4-top');
    top.createSpan({ cls: 'orb-fx4-chip' + (esActual ? ' actual' : m.hecho ? ' hecho' : ''), text: esActual ? 'Tu módulo ahora' : m.hecho ? 'Ya escuchado' : m.n < d.actual ? 'Pendiente' : 'Más adelante' });
    top.createSpan({ cls: 'orb-fx4-donde', text: 'Módulo ' + m.n + ' de ' + tot + ' · Fase ' + (fk + 1) + ': ' + (fa ? fa.n : '') });
    if (!esActual) { const v = top.createEl('button', { cls: 'orb-fx4-volver', text: 'Volver a mi módulo' }); v.addEventListener('click', () => { this.sel = d.actual; SON.clic(); this.pintar(); }); }
    c.createEl('h2', { cls: 'orb-fx4-titulo', text: m.titulo });
    const pasos = c.createDiv('orb-fx4-pasos');
    const paso = (n, hecho, titulo, ayuda) => { const p = pasos.createDiv('orb-fx4-paso' + (hecho ? ' hecho' : '')); const num = p.createDiv('orb-fx4-num'); if (hecho) ob.setIcon(num, 'check'); else num.setText(String(n)); const b = p.createDiv('orb-fx4-cuerpo'); b.createDiv({ cls: 'orb-fx4-paso-t', text: titulo }); if (ayuda) b.createDiv({ cls: 'orb-fx4-paso-a', text: ayuda }); return b; };
    // 1. Escuchar
    const p1 = paso(1, m.hecho, 'Escúchalo', m.hecho ? 'Hecho. Muy bien.' : 'En el bus o caminando, sin prisa.');
    const b1 = p1.createEl('button', { cls: 'orb-btn' + (m.hecho ? ' orb-fx4-sutil' : ' principal'), text: m.hecho ? 'Deshacer' : 'Ya lo he escuchado' });
    b1.addEventListener('click', async () => { this._silencio = Date.now(); const nuevo = !m.hecho; if (nuevo) { SON.ok(); estallido(b1, false); } else SON.quitar(); await marcarModulo(this.app, m.n, nuevo, null); m.hecho = nuevo; this.pintar(); });
    // 2 y 3. Idea y acción, escritas aquí mismo
    const campo = (n, col, valor, titulo, ph) => {
      const b = paso(n, !!valor, titulo, null); const ta = b.createEl('textarea', { cls: 'orb-fx4-campo', attr: { rows: '2', placeholder: ph } }); ta.value = valor || '';
      const ok = b.createDiv({ cls: 'orb-fx4-ok', text: '' });
      const guardar = async () => { const v = ta.value.trim(); if (v === (valor || '')) return; this._silencio = Date.now(); await guardarCampoModulo(this.app, m.n, col, v); valor = v; if (col === 4) m.idea = v; else m.accion = v; ok.setText('Guardado ✓'); ok.addClass('ve'); SON.ok(); setTimeout(() => this.pintar(), 700); };
      ta.addEventListener('blur', guardar); ta.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ta.blur(); } });
    };
    campo(2, 4, m.idea, 'Una idea que te quedas', 'Escribe con tus palabras lo que más te ha servido…');
    campo(3, 5, m.accion, 'Una acción para esta semana', 'Algo concreto, con día y hora. Ej.: «El martes a las 10 hago…»');
    // Siguiente módulo
    const listo = m.hecho && m.idea && m.accion; const sig = d.modulos.find((x) => x.n === m.n + 1);
    const pie = c.createDiv('orb-fx4-pie');
    if (esActual && sig) {
      const bs = pie.createEl('button', { cls: 'orb-btn principal orb-fx4-sig', text: 'Empezar el módulo ' + sig.n + ' · ' + sig.titulo + '  →' }); if (!listo) bs.setAttr('disabled', 'true');
      pie.createDiv({ cls: 'orb-fx4-nota', text: listo ? 'Lo has aplicado: puedes pasar al siguiente.' : 'Completa los 3 pasos para pasar al siguiente. Escuchar sin aplicar no cambia nada.' });
      bs.addEventListener('click', async () => { if (!listo) return; this._silencio = Date.now(); SON.rana(); estallido(bs, true); await marcarModulo(this.app, m.n, true, sig.n); this.sel = sig.n; setTimeout(() => this.pintar(), 450); });
    } else if (!esActual) {
      const be = pie.createEl('button', { cls: 'orb-btn principal orb-fx4-sig', text: 'Empezar por este módulo' });
      pie.createDiv({ cls: 'orb-fx4-nota', text: 'Ahora tu módulo es el ' + d.actual + '. Pulsa aquí para que sea este.' });
      be.addEventListener('click', async () => { this._silencio = Date.now(); SON.ok(); await marcarModulo(this.app, m.n, m.hecho, m.n); this.sel = m.n; this.pintar(); });
    } else if (esActual && !sig) pie.createDiv({ cls: 'orb-fx4-nota', text: listo ? '¡Has terminado el seminario!' : 'Es el último módulo.' });
    // Dónde estás: los 27 módulos en una línea
    const hechos = d.modulos.filter((x) => x.hecho).length;
    const pr = w.createDiv('orb-card orb-fx4-camino'); pr.style.setProperty('--c', COLOR.fenix);
    const pc = pr.createDiv('orb-fx4-camino-cab'); pc.createSpan({ text: 'Tu camino' }); pc.createSpan({ cls: 'orb-fx4-cuenta', text: hechos + ' de ' + tot + ' escuchados' });
    const pista = pr.createDiv('orb-fx4-pista');
    FASES.forEach((f, k) => {
      const g = pista.createDiv('orb-fx4-grupo' + (k === faseDe(d.actual) ? ' ahora' : '')); const pts = g.createDiv('orb-fx4-puntos');
      d.modulos.filter((x) => x.n >= f.de && x.n <= f.a).forEach((x) => {
        const p = pts.createEl('button', { cls: 'orb-fx4-punto' + (x.hecho ? ' hecho' : '') + (x.n === d.actual ? ' actual' : '') + (x.n === m.n ? ' sel' : ''), attr: { 'aria-label': 'Módulo ' + x.n + ': ' + x.titulo, title: x.n + '. ' + x.titulo } });
        p.addEventListener('click', () => { SON.clic(); this.sel = x.n; this.pintar(); });
      });
      g.createDiv({ cls: 'orb-fx4-grupo-n', text: (k + 1) + '. ' + f.n });
    });
    // Lista completa, plegada
    const det = w.createEl('details', { cls: 'orb-fx4-todos' }); if (this.listaAbierta) det.setAttr('open', '');
    det.createEl('summary', { text: 'Ver los 27 módulos' }); det.addEventListener('toggle', () => { this.listaAbierta = det.open; });
    FASES.forEach((f, k) => {
      det.createDiv({ cls: 'orb-fx4-lista-f', text: 'Fase ' + (k + 1) + ' · ' + f.n });
      d.modulos.filter((x) => x.n >= f.de && x.n <= f.a).forEach((x) => {
        const r = det.createDiv('orb-fx4-fila' + (x.hecho ? ' hecho' : '') + (x.n === d.actual ? ' actual' : ''));
        const num = r.createSpan('orb-fx4-mini'); if (x.hecho) ob.setIcon(num, 'check'); else num.setText(String(x.n));
        r.createSpan({ cls: 'orb-fx4-fila-t', text: x.titulo });
        r.addEventListener('click', () => { SON.clic(); this.sel = x.n; this.pintar().then(() => raiz.scrollTo({ top: 0, behavior: 'smooth' })); });
      });
    });
    raiz.scrollTop = scroll;
  }
}

/* ---------- Menú lateral (la app) ---------- */
const MENU = [
  ['', [['Hoy', V.hoy, 'sun'], ['Calendario', V.semana, 'calendar-days'], ['Órbitas', V.orbitas, 'target'], ['Equipo', V.casas, 'users'], ['Progreso', V.progreso, 'activity']]],
  ['Más', [['Inicio', V.inicio, 'layout-grid'], ['Gimnasio', V.gimnasio, 'dumbbell'], ['Formación', V.fenix, 'flame'], ['Cerebro', V.mapa, 'brain']]]
];
class EquipoView extends VistaBase {
  getViewType() { return V.equipo; } getDisplayText() { return 'Menú'; } getIcon() { return 'menu'; }
  async pintar() {
    const raiz = this.contentEl; raiz.empty();
    const w = raiz.createDiv('orb-lateral'); this.entrada(w);
    const cab = w.createDiv('orb-lat-cab orb-enlace');
    const g = cab.createDiv('orb-lat-globo'); globoSVG(g);
    const t = cab.createDiv(); t.createDiv({ cls: 'orb-lat-marca', text: 'ÓRBITA' }); t.createDiv({ cls: 'orb-lat-sub', text: fechaLarga() });
    cab.addEventListener('click', () => this.plugin.abrir(V.hoy));
    const d = await leerDia(this.app); const tormenta = await leerModoTormenta(this.app);
    const hoy = w.createDiv('orb-lat-hoy');
    if (tormenta) hoy.createDiv({ cls: 'orb-chip', text: 'Modo tormenta' });
    if (d) {
      hoy.createDiv({ cls: 'orb-lat-rana' + (d.rana && d.rana.hecha ? ' on' : ''), text: d.rana ? d.rana.texto : 'Sin rana' });
      const b = hoy.createDiv('orb-barra'); b.createDiv('orb-barra-fill').style.width = (d.total ? Math.round(d.hechas / d.total * 100) : 0) + '%';
      hoy.createDiv({ cls: 'orb-lat-meta', text: d.hechas + ' de ' + d.total + ' hechas' });
    } else hoy.createDiv({ cls: 'orb-lat-meta', text: 'Sin nota de hoy · toca para crearla' });
    hoy.addEventListener('click', () => this.plugin.abrir(V.hoy));
    const activa = this.plugin.vistaActiva || '';
    const cal = await eventosDe(this.app, [hoyISO()]); const { ahora, luego } = ahoraYLuego(cal.eventos[hoyISO()] || []);
    const ah = w.createDiv('orb-lat-ahora'); ah.createDiv({ cls: 'orb-lat-ahora-k', text: ahora ? 'Ahora' : 'Luego' }); ah.createDiv({ cls: 'orb-lat-ahora-t', text: ahora ? ahora.titulo : luego ? hm(luego.ini) + ' · ' + luego.titulo : 'Nada más hoy' }); ah.addEventListener('click', () => this.plugin.abrir(V.semana));
    MENU.forEach(([titulo, items]) => {
      const sec = w.createDiv('orb-lat-sec');
      if (titulo) sec.createDiv({ cls: 'orb-lat-sec-t', text: titulo });
      items.forEach(([n, destino, ic]) => {
        const b = sec.createEl('button', { cls: 'orb-lat-btn' + (destino === activa ? ' activo' : '') }); const i = b.createSpan('orb-lat-ic'); ob.setIcon(i, ic); b.createSpan({ text: n });
        b.addEventListener('click', () => { if (destino.endsWith('.md')) this.app.workspace.openLinkText(destino, '', false); else this.plugin.abrir(destino); });
      });
    });
    void activa;
    const eq = w.createDiv('orb-lat-sec'); eq.createDiv({ cls: 'orb-lat-sec-t', text: 'Equipo' });
    const fila = eq.createDiv('orb-lat-caras');
    agentes(this.app).forEach((a) => {
      const c = fila.createDiv({ cls: 'orb-avatar' + (a.estado === 'trabajando' ? ' on' : ''), text: a.nombre.charAt(0) });
      c.setAttr('aria-label', a.nombre + ' · ' + (a.estado === 'trabajando' ? 'trabajando' : 'en espera'));
      c.addEventListener('click', () => this.plugin.abrir(V.casas));
    });
    const pie = w.createDiv('orb-lat-pie');
    const ex = pie.createEl('button', { cls: 'orb-lat-link', text: 'Todas las notas' }); ex.addEventListener('click', () => this.app.commands && this.app.commands.executeCommandById('file-explorer:open'));
    const aj = pie.createEl('button', { cls: 'orb-lat-link', text: this.plugin.ajustes.modoApp ? 'Ver Obsidian normal' : 'Volver al modo app' }); aj.addEventListener('click', async () => { await this.plugin.alternarApp(); this.pintar(); });
  }
}

/* ---------- Inicio: el lanzador de la app ---------- */
class InicioView extends VistaBase {
  getViewType() { return V.inicio; } getDisplayText() { return 'Inicio'; } getIcon() { return 'layout-grid'; }
  async pintar() {
    const [d, o, tormenta] = await Promise.all([leerDia(this.app), datosOrbitas(this.app), leerModoTormenta(this.app)]);
    const lun = lunesDe(new Date()); const sem = await Promise.all(Array.from({ length: 7 }, (_, i) => leerDia(this.app, iso(sumarDias(lun, i)))));
    const sh = sem.reduce((s, x) => s + (x ? x.hechas : 0), 0), st = sem.reduce((s, x) => s + (x ? x.total : 0), 0);
    const eq = agentes(this.app); const trabajando = eq.filter((a) => a.estado === 'trabajando').length;
    const nNotas = this.app.vault.getMarkdownFiles().filter((f) => f.path.startsWith(RAIZ + '/')).length;
    const cal = await eventosDe(this.app, [hoyISO()]);
    const fx = await leerFenix(this.app);
    const raiz = this.contentEl; raiz.empty();
    const w = raiz.createDiv('orb-hoja ancha orb-inicio'); this.entrada(w);
    const hero = w.createDiv('orb-ini-hero'); this.barraSuperior(w, hero); this.dock();
    const g = hero.createDiv('orb-ini-globo'); globoSVG(g);
    const tx = hero.createDiv();
    tx.createDiv({ cls: 'orb-cab-sub', text: fechaLarga() });
    tx.createEl('h1', { cls: 'orb-cab-titulo', text: saludo() + ', ' + NOMBRE });
    tx.createDiv({ cls: 'orb-ini-estado', text: tormenta ? 'Modo tormenta: hoy basta con lo mínimo.' : d && d.rana ? (d.rana.hecha ? 'Rana hecha. Lo demás es extra.' : 'Tu rana: ' + d.rana.texto) : 'Todavía no hay nota de hoy.' });
    bloqueAhora(w, cal.eventos[hoyISO()] || [], this.plugin);
    const din = o.orbitas.find((x) => x.id === 'dinero');
    const tiles = [
      ['Hoy', 'sun', d ? d.hechas + ' de ' + d.total + ' hechas' : 'Crear la nota de hoy', () => this.plugin.abrir(V.hoy), true],
      ['Calendario', 'calendar-days', st ? Math.round(sh / st * 100) + ' % de la semana hecho' : 'Tu semana hora a hora', () => this.plugin.abrir(V.semana)],
      ['Progreso', 'activity', 'Rachas y ánimo', () => this.plugin.abrir(V.progreso)],
      ['Gimnasio', 'dumbbell', 'Hoy: ejercicios, series y técnica', () => this.plugin.abrir(V.gimnasio)],
      ['Calma', 'wind', 'Ansiedad y estrés: respira y ordena', () => this.plugin.abrir(V.calma)],
      ['Voz', 'mic', 'Hablar claro y con calma', () => this.plugin.abrir(V.voz)],
      ['Formación', 'flame', fx ? 'Módulo ' + fx.actual + ' de ' + fx.total + (fx.titulo ? ' · ' + fx.titulo : '') : 'Tu curso o formación', () => this.plugin.abrir(V.fenix), 'ancho'],
      ['Mente', 'brain', 'Sueño, calma y apoyo', () => this.app.workspace.openLinkText(CARPETAS.mente + '/MENTE.md', '', false)],
      ['Relaciones', 'heart-handshake', 'Amigos, familia y pareja', () => this.app.workspace.openLinkText(CARPETAS.relaciones + '/RELACIONES.md', '', false)],
      ['Estudios', 'graduation-cap', 'Tus estudios y cursos', () => this.app.workspace.openLinkText(CARPETAS.estudios + '/ESTUDIOS.md', '', false)],
      ['Imagen', 'scan-face', 'Pelo, barba, piel y físico', () => this.app.workspace.openLinkText(CARPETAS.cuerpo + '/IMAGEN.md', '', false)],
      ['Dinero', 'wallet', (din ? Math.round(o.euros * 100) / 100 : 0) + ' € este mes', () => this.app.workspace.openLinkText(CARPETAS.dinero + '/PLAN_DINERO.md', '', false)],
      ['Órbitas', 'target', 'Plan maestro · 5 órbitas', () => this.plugin.abrir(V.orbitas)],
      ['Cerebro', 'brain', nNotas + ' notas · tu mapa vivo', () => this.plugin.abrir(V.mapa)],
      ['Equipo', 'users', eq.length + ' agentes · ' + trabajando + ' trabajando', () => this.plugin.abrir(V.casas)],
      ['Guía', 'help-circle', 'Cómo se usa ÓRBITA', () => this.app.workspace.openLinkText(NOTAS.guia, '', false)]
    ];
    const grid = w.createDiv('orb-ini-grid');
    tiles.forEach(([n, ic, sub, fn, grande]) => {
      const t = grid.createEl('button', { cls: 'orb-tile' + (grande === true ? ' grande' : grande === 'ancho' ? ' ancho' : '') });
      const i = t.createDiv('orb-tile-ic'); ob.setIcon(i, ic);
      t.createDiv({ cls: 'orb-tile-n', text: n });
      t.createDiv({ cls: 'orb-tile-s', text: sub });
      t.addEventListener('click', fn);
    });
    const acc = w.createDiv('orb-acciones');
    const c = acc.createEl('button', { cls: 'orb-btn principal', text: d ? 'Cerrar el día' : 'Crear la nota de hoy' });
    c.addEventListener('click', async () => { if (d) cerrarDia(this.app); else { await crearDia(this.app); this.plugin.abrir(V.hoy); } });
    const intro = acc.createEl('button', { cls: 'orb-btn', text: 'Ver la intro' }); intro.addEventListener('click', () => introApple(this.plugin, false));
  }
}

/* ---------- Equipo: el barrio de los agentes ---------- */
const CASAS = {
  director: { lema: 'Coordina, planifica y cierra el día', simbolo: 'brujula' },
  mentor: { lema: 'Metas, disciplina y la rana', simbolo: 'diana' },
  estratega: { lema: 'Dinero, trabajo y carrera', simbolo: 'moneda' },
  entrenador: { lema: 'Gimnasio, peso y progreso', simbolo: 'pesa' },
  skincare: { lema: 'Piel, pelo y tratamiento', simbolo: 'gota' },
  coach: { lema: 'Ánimo, sueño y relaciones', simbolo: 'luna' },
  guionista: { lema: 'Ideas y guiones', simbolo: 'pluma' },
  editor: { lema: 'Grabación y edición', simbolo: 'claqueta' },
  crecimiento: { lema: 'Publicación, comunidad y métricas', simbolo: 'grafica' }
};
class Barrio {
  constructor(contenedor, app, alElegir, fuente) {
    this.app = app; this.alElegir = alElegir; this.fuente = fuente || ((a) => agentes(a));
    this.canvas = contenedor.createEl('canvas', { cls: 'orb-lienzo' }); this.ctx = this.canvas.getContext('2d');
    this.vivo = true; this.t0 = performance.now(); this.sel = null; this.sobre = null;
    this.reducido = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const r = azar('barrio'); this.estrellas = Array.from({ length: 260 }, () => ({ x: r(), y: r() * 0.55, m: 0.5 + r() * 1.1, a: 0.15 + r() * 0.5, f: r() * 6.28 }));
    this.datos(); this.cuadro = this.cuadro.bind(this);
    this.ro = new ResizeObserver(() => this.ajustar()); this.ro.observe(this.canvas); this.ajustar();
    this.canvas.addEventListener('pointermove', (e) => { const b = this.canvas.getBoundingClientRect(); this.raton = { x: e.clientX - b.left, y: e.clientY - b.top }; });
    this.canvas.addEventListener('pointerleave', () => { this.raton = null; });
    this.canvas.addEventListener('click', () => { if (this.sobre) { this.sel = this.sobre; this.alElegir(this.sobre.a); } });
    requestAnimationFrame(this.cuadro);
  }
  datos() {
    const lista = this.fuente(this.app);
    this.casas = lista.map((a, i) => ({ a, i, clave: sinAcentos(a.nombre), fase: i * 1.7 }));
  }
  ajustar() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2); const w = this.canvas.clientWidth || 800, h = this.canvas.clientHeight || 600;
    this.w = w; this.h = h; this.canvas.width = Math.round(w * dpr); this.canvas.height = Math.round(h * dpr); this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.s = limitar(Math.min(w / 980, h / 640), 0.55, 1.6);
  }
  iso(x, y, z) { const s = this.s * 30; return { x: this.w / 2 + (x - y) * s * 0.866, y: this.h * 0.56 + (x + y) * s * 0.5 - (z || 0) * s }; }
  poligono(pts, relleno, trazo, ancho) { const g = this.ctx; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)); g.closePath(); if (relleno) { g.fillStyle = relleno; g.fill(); } if (trazo) { g.strokeStyle = trazo; g.lineWidth = ancho || 1; g.stroke(); } }
  posicion(i, n) { // en círculo alrededor de la plaza del globo
    const a = Math.PI * 0.75 + (i / n) * Math.PI * 2; const r = 6.4;
    return { x: Math.cos(a) * r - 1.1, y: Math.sin(a) * r - 1.1 };
  }
  casa(c, t) {
    const g = this.ctx; const n = this.casas.length; const p = this.posicion(c.i, n);
    const W = 2.2, D = 2.2, H = 1.7, R = 1.15; const x = p.x, y = p.y;
    const on = c.a.estado === 'trabajando'; const resal = this.sobre === c || this.sel === c; const CL = this.claro;
    const linea = CL ? (resal ? '#1f1b18' : 'rgba(43,36,32,0.62)') : (resal ? '#ffffff' : 'rgba(255,255,255,0.78)');
    const P = CL ? { sombra: 'rgba(70,52,36,0.09)', izq: '#fdfbf8', der: '#ece6dd', tejado: '#3b332e', hastial: '#4a413b', puerta: '#d9cfc2', apagada: '#e3dcd2', simbolo: '#f3efe9' }
      : { sombra: 'rgba(255,255,255,0.025)', izq: '#050505', der: '#0b0b0b', tejado: '#000', hastial: '#070707', puerta: '#000', apagada: '#000', simbolo: linea };
    // sombra
    this.poligono([this.iso(x - .3, y - .3, 0), this.iso(x + W + .5, y - .3, 0), this.iso(x + W + .5, y + D + .5, 0), this.iso(x - .3, y + D + .5, 0)], P.sombra);
    // paredes (izq = cara y+D, der = cara x+W)
    this.poligono([this.iso(x, y + D, 0), this.iso(x + W, y + D, 0), this.iso(x + W, y + D, H), this.iso(x, y + D, H)], P.izq, linea, 1);
    this.poligono([this.iso(x + W, y, 0), this.iso(x + W, y + D, 0), this.iso(x + W, y + D, H), this.iso(x + W, y, H)], P.der, linea, 1);
    // tejado a dos aguas
    const cum1 = this.iso(x + W / 2, y, H + R), cum2 = this.iso(x + W / 2, y + D, H + R);
    this.poligono([this.iso(x + W, y, H), this.iso(x + W, y + D, H), cum2, cum1], P.tejado, linea, 1);
    this.poligono([this.iso(x, y + D, H), this.iso(x + W, y + D, H), cum2], P.hastial, linea, 1);
    // puerta en la cara izquierda
    this.poligono([this.iso(x + .85, y + D, 0), this.iso(x + 1.35, y + D, 0), this.iso(x + 1.35, y + D, .95), this.iso(x + .85, y + D, .95)], P.puerta, linea, 1);
    // ventana en la cara derecha: encendida si trabaja
    const brillo = on ? 0.85 + 0.15 * Math.sin(t * 2 + c.fase) : 0;
    this.poligono([this.iso(x + W, y + .55, .7), this.iso(x + W, y + 1.45, .7), this.iso(x + W, y + 1.45, 1.3), this.iso(x + W, y + .55, 1.3)], on ? (CL ? 'rgba(244,201,93,' + brillo + ')' : 'rgba(255,255,255,' + brillo + ')') : P.apagada, linea, 1);
    if (on) { const v = this.iso(x + W, y + 1, 1); g.globalAlpha = CL ? 0.45 : 0.35; g.drawImage(CL ? sprite('#f4c95d') : BRILLO, v.x - 40, v.y - 40, 80, 80); g.globalAlpha = 1; }
    // símbolo en el hastial
    const sp = this.iso(x + W / 2, y + D, H + R * 0.42); this.simbolo(CASAS[c.clave] ? CASAS[c.clave].simbolo : '', sp.x, sp.y, 7 * this.s, P.simbolo);
    // muñeco: pasea delante de su casa si está en espera; asoma en la ventana si trabaja
    if (!on) {
      const paseo = this.reducido ? 0 : Math.sin(t * 0.6 + c.fase) * 0.7;
      const m = this.iso(x + W / 2 + paseo, y + D + 0.9, 0); this.muneco(m.x, m.y, t + c.fase, resal);
    } else {
      const v = this.iso(x + W, y + 1, .78); g.fillStyle = CL ? '#3b332e' : '#000'; g.beginPath(); g.arc(v.x, v.y - 5 * this.s, 3.2 * this.s, 0, Math.PI * 2); g.fill(); g.fillRect(v.x - 3.5 * this.s, v.y - 2 * this.s, 7 * this.s, 6 * this.s);
    }
    c.rotulo = this.iso(x + W / 2 + .2, y + D + 1.9, 0); c.resal = resal; c.on = on;
    const cen = this.iso(x + W / 2, y + D / 2, H / 2); c.cx = cen.x; c.cy = cen.y; c.rad = 62 * this.s;
  }
  rotulo(c) {
    const g = this.ctx; const lb = c.rotulo; const resal = c.resal, on = c.on;
    const CL = this.claro;
    g.globalAlpha = CL ? 0.95 : 0.75; g.fillStyle = CL ? '#fffdfa' : '#000'; g.font = '600 ' + Math.round(11 * Math.max(this.s, .85)) + 'px ' + FUENTE_MONO;
    const ancho = g.measureText(c.a.nombre.toUpperCase()).width + 22;
    if (CL) { g.shadowColor = 'rgba(70,50,30,.18)'; g.shadowBlur = 8; g.shadowOffsetY = 2; }
    g.beginPath(); if (g.roundRect) g.roundRect(lb.x - ancho / 2, lb.y - 14, ancho, 34, 9); else g.rect(lb.x - ancho / 2, lb.y - 14, ancho, 34); g.fill(); g.shadowBlur = 0; g.shadowOffsetY = 0; g.globalAlpha = 1;
    g.textAlign = 'center'; g.font = '600 ' + Math.round(11 * Math.max(this.s, .85)) + 'px ' + FUENTE_MONO; g.fillStyle = CL ? (resal ? '#1f1b18' : '#3b332e') : (resal ? '#fff' : '#d0d0d0'); g.fillText(c.a.nombre.toUpperCase(), lb.x, lb.y);
    g.font = Math.round(9.5 * Math.max(this.s, .85)) + 'px ' + FUENTE_MONO; g.fillStyle = on ? (CL ? '#3f8f74' : '#fff') : (CL ? '#a59e96' : '#6e6e6e'); g.fillText(on ? '● trabajando' : '○ en espera', lb.x, lb.y + 15);
    g.textAlign = 'start';
  }
  muneco(x, y, t, resal) {
    const g = this.ctx, s = this.s; const paso = this.reducido ? 0 : Math.sin(t * 3.2) * 2.2 * s;
    const CL = this.claro; g.strokeStyle = CL ? (resal ? '#1f1b18' : '#3b332e') : (resal ? '#fff' : '#e0e0e0'); g.fillStyle = CL ? '#fdfbf8' : '#000'; g.lineWidth = 1.3; g.lineCap = 'round';
    g.beginPath(); g.moveTo(x, y - 9 * s); g.lineTo(x - paso, y); g.moveTo(x, y - 9 * s); g.lineTo(x + paso, y); g.stroke(); // piernas
    g.beginPath(); g.moveTo(x, y - 9 * s); g.lineTo(x, y - 19 * s); g.stroke(); // cuerpo
    g.beginPath(); g.moveTo(x, y - 16 * s); g.lineTo(x - 4 * s + paso * .5, y - 11 * s); g.moveTo(x, y - 16 * s); g.lineTo(x + 4 * s - paso * .5, y - 11 * s); g.stroke(); // brazos
    g.beginPath(); g.arc(x, y - 23 * s, 4 * s, 0, Math.PI * 2); g.fill(); g.stroke(); // cabeza
    g.globalAlpha = CL ? 0.18 : 0.3; g.fillStyle = CL ? '#3b2a1e' : '#fff'; g.beginPath(); g.ellipse(x, y + 1, 5 * s, 1.6 * s, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
  }
  simbolo(tipo, x, y, r, color) {
    const g = this.ctx; g.strokeStyle = color; g.fillStyle = color; g.lineWidth = 1.1; g.beginPath();
    if (tipo === 'brujula') { g.arc(x, y, r, 0, Math.PI * 2); g.moveTo(x, y - r * .7); g.lineTo(x + r * .3, y); g.lineTo(x, y + r * .7); g.lineTo(x - r * .3, y); g.closePath(); }
    else if (tipo === 'diana') { g.arc(x, y, r, 0, Math.PI * 2); g.moveTo(x + r * .55, y); g.arc(x, y, r * .55, 0, Math.PI * 2); g.moveTo(x + r * .15, y); g.arc(x, y, r * .15, 0, Math.PI * 2); }
    else if (tipo === 'moneda') { g.arc(x, y, r, 0, Math.PI * 2); g.moveTo(x, y - r * .6); g.lineTo(x, y + r * .6); g.moveTo(x + r * .35, y - r * .3); g.lineTo(x - r * .35, y - r * .3); g.lineTo(x + r * .35, y + r * .3); g.lineTo(x - r * .35, y + r * .3); }
    else if (tipo === 'pesa') { g.moveTo(x - r, y); g.lineTo(x + r, y); g.rect(x - r, y - r * .5, r * .35, r); g.rect(x + r * .65, y - r * .5, r * .35, r); }
    else if (tipo === 'gota') { g.moveTo(x, y - r); g.quadraticCurveTo(x + r * .9, y + r * .1, x, y + r * .8); g.quadraticCurveTo(x - r * .9, y + r * .1, x, y - r); }
    else if (tipo === 'luna') { g.arc(x, y, r, Math.PI * .35, Math.PI * 1.65); g.quadraticCurveTo(x - r * .1, y, x + r * .58, y + r * .8); }
    else if (tipo === 'pluma') { g.moveTo(x - r * .7, y + r * .7); g.quadraticCurveTo(x - r * .1, y - r * .1, x + r * .75, y - r * .75); g.quadraticCurveTo(x + r * .2, y + r * .1, x - r * .7, y + r * .7); g.moveTo(x - r * .2, y + r * .2); g.lineTo(x + r * .35, y - r * .35); }
    else if (tipo === 'claqueta') { g.rect(x - r * .8, y - r * .25, r * 1.6, r * 1.05); g.moveTo(x - r * .8, y - r * .25); g.lineTo(x - r * .65, y - r * .75); g.lineTo(x + r * .75, y - r * .75); g.lineTo(x + r * .8, y - r * .25); g.moveTo(x - r * .25, y - r * .75); g.lineTo(x - r * .4, y - r * .25); g.moveTo(x + r * .25, y - r * .75); g.lineTo(x + r * .1, y - r * .25); }
    else if (tipo === 'grafica') { g.moveTo(x - r * .8, y + r * .7); g.lineTo(x - r * .8, y - r * .8); g.moveTo(x - r * .8, y + r * .7); g.lineTo(x + r * .8, y + r * .7); g.moveTo(x - r * .55, y + r * .3); g.lineTo(x - r * .1, y - r * .1); g.lineTo(x + r * .2, y + r * .1); g.lineTo(x + r * .7, y - r * .55); }
    else g.arc(x, y, r * .5, 0, Math.PI * 2);
    g.stroke();
  }
  cuadro(ahora) {
    if (!this.vivo) return; requestAnimationFrame(this.cuadro);
    if (!this.canvas.isConnected || !this.canvas.offsetParent) return;
    const t = (ahora - this.t0) / 1000; const g = this.ctx, w = this.w, h = this.h; const CL = esClaro(); this.claro = CL;
    if (CL) { const fg = g.createLinearGradient(0, 0, 0, h); fg.addColorStop(0, '#f2eee8'); fg.addColorStop(1, '#e4ded4'); g.fillStyle = fg; } else g.fillStyle = '#000';
    g.fillRect(0, 0, w, h);
    if (!CL) for (const s of this.estrellas) { g.globalAlpha = s.a * (0.65 + 0.35 * Math.sin(t + s.f)); g.fillStyle = '#fff'; g.fillRect(s.x * w, s.y * h, s.m, s.m); }
    g.globalAlpha = 1;
    // horizonte con un planeta enorme detrás
    const pr = Math.max(w, h) * 1.1; const pc = { x: w * 0.5, y: h * 0.62 + pr };
    const gr = g.createRadialGradient(pc.x, pc.y - pr, 0, pc.x, pc.y - pr, pr * 0.5); gr.addColorStop(0, CL ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.05)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    // suelo: rejilla isométrica que se desvanece
    g.lineWidth = 1;
    for (let i = -9; i <= 9; i++) {
      const a1 = this.iso(i, -8, 0), a2 = this.iso(i, 8, 0), b1 = this.iso(-9, i, 0), b2 = this.iso(9, i, 0);
      g.strokeStyle = (CL ? 'rgba(70,52,36,' : 'rgba(255,255,255,') + ((CL ? 0.1 : 0.06) - Math.abs(i) * (CL ? 0.006 : 0.004)) + ')';
      g.beginPath(); g.moveTo(a1.x, a1.y); g.lineTo(a2.x, a2.y); g.moveTo(b1.x, b1.y); g.lineTo(b2.x, b2.y); g.stroke();
    }
    // plaza central: el globo de ÓRBITA
    const pl = this.iso(0, 0, 0); g.strokeStyle = CL ? 'rgba(70,52,36,0.3)' : 'rgba(255,255,255,0.25)'; g.beginPath(); g.ellipse(pl.x, pl.y, 60 * this.s, 30 * this.s, 0, 0, Math.PI * 2); g.stroke();
    const gp = { x: pl.x, y: pl.y - 34 * this.s }; const R = 15 * this.s;
    if (!CL) { g.globalAlpha = .35; g.drawImage(BRILLO, gp.x - R * 3, gp.y - R * 3, R * 6, R * 6); g.globalAlpha = 1; }
    if (CL) { g.shadowColor = 'rgba(70,50,30,.25)'; g.shadowBlur = 10; g.shadowOffsetY = 3; }
    g.fillStyle = CL ? '#fdfbf8' : '#000'; g.strokeStyle = CL ? '#2b2420' : '#fff'; g.beginPath(); g.arc(gp.x, gp.y, R, 0, Math.PI * 2); g.fill(); g.shadowBlur = 0; g.shadowOffsetY = 0; g.stroke();
    g.strokeStyle = CL ? 'rgba(43,36,32,.55)' : 'rgba(255,255,255,.55)'; for (let k = 0; k < 4; k++) { const a = (this.reducido ? 0 : t * .5) + k * Math.PI / 4; g.beginPath(); g.ellipse(gp.x, gp.y, Math.max(.5, Math.abs(Math.cos(a)) * R), R, 0, 0, Math.PI * 2); g.stroke(); }
    g.beginPath(); g.ellipse(gp.x, gp.y, R, R * .2, 0, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.moveTo(gp.x, gp.y + R); g.lineTo(pl.x, pl.y); g.stroke();
    // ¿sobre qué casa está el ratón?
    this.sobre = null;
    if (this.raton) { let dm = 1e9; for (const c of this.casas) { if (c.cx == null) continue; const d = Math.hypot(c.cx - this.raton.x, c.cy - this.raton.y); if (d < c.rad && d < dm) { dm = d; this.sobre = c; } } }
    // casas de atrás hacia delante
    this.casas.slice().sort((a, b) => { const pa = this.posicion(a.i, this.casas.length), pb = this.posicion(b.i, this.casas.length); return (pa.x + pa.y) - (pb.x + pb.y); }).forEach((c) => this.casa(c, t));
    this.casas.forEach((c) => { if (c.rotulo) this.rotulo(c); });
    this.canvas.style.cursor = this.sobre ? 'pointer' : 'default';
  }
  destruir() { this.vivo = false; this.ro.disconnect(); }
}
/* ---------- Equipo · la oficina (21-11-2026): cada agente en su mesa y un chat por agente ---------- */
const OFICINA = {
  director: { color: PALETA.noche, puesto: 'Despacho central', icono: 'compass' },
  mentor: { color: PALETA.dia, puesto: 'Mesa de metas', icono: 'target' },
  estratega: { color: PALETA.dinero, puesto: 'Mesa de dinero', icono: 'coins' },
  entrenador: { color: PALETA.cuerpo, puesto: 'Zona de entreno', icono: 'dumbbell' },
  skincare: { color: PALETA.calma, puesto: 'Rincón de cuidado', icono: 'droplet' },
  coach: { color: PALETA.mente, puesto: 'Sala tranquila', icono: 'moon' }
};
function claveAg(n) { return sinAcentos(String(n || '')).toLowerCase(); }
async function leerChat(app, ruta) {
  const t = (await leer(app, ruta || (RAIZ + '/6_EQUIPO/CHAT.md'))) || '';
  const hilos = [];
  t.split('\n').forEach((l) => {
    l = l.replace(/\s*<!--[^>]*-->\s*$/, '');
    const ag = l.match(/^- (\d{4}-\d{2}-\d{2} \d{2}:\d{2}) · ([^:→]+?) → Yo: (.*)$/);
    if (ag) { hilos.push({ cuando: ag[1], para: claveAg(ag[2].trim()), quien: ag[2].trim(), txt: ag[3], inicio: true, pend: false, resp: [] }); return; }
    const m = l.match(/^- (\d{4}-\d{2}-\d{2} \d{2}:\d{2}) · Yo → ([^:]+): (.*)$/);
    if (m) { const pend = /\s*·\s*pendiente\s*$/.test(m[3]); hilos.push({ cuando: m[1], para: claveAg(m[2].trim()), txt: m[3].replace(/\s*·\s*pendiente\s*$/, ''), pend, resp: [] }); return; }
    const r = l.match(/^\s+- (\d{4}-\d{2}-\d{2} \d{2}:\d{2}) · ([^:]+): (.*)$/);
    if (r && hilos.length) hilos[hilos.length - 1].resp.push({ cuando: r[1], quien: r[2].trim(), txt: r[3] });
  });
  return hilos;
}
function proximaRespuesta() { const d = new Date(); const m = d.getHours() * 60 + d.getMinutes(); if (m < 570) return 'hoy a las 09:30'; if (m < 1395) return 'hoy a las 23:15'; return 'mañana a las 09:30'; }
async function proximaCita(app, nombre) {
  const k = claveAg(nombre); const ahora = new Date(); let mejor = null;
  try {
    (await leerSesiones(app)).forEach((s) => {
      if (!claveAg(s.quien).includes(k)) return;
      const wd = DIAS.findIndex((d) => sinAcentos(d) === claveAg(s.dia)); if (wd < 0) return;
      const f = new Date(); f.setHours(0, 0, 0, 0); f.setDate(f.getDate() + ((wd - f.getDay() + 7) % 7));
      const hm2 = String(s.hora || '00:00').split(':').map(Number); f.setHours(hm2[0] || 0, hm2[1] || 0);
      if (f < ahora) f.setDate(f.getDate() + 7);
      if (!mejor || f < mejor.f) mejor = { f, txt: 'Sesión' };
    });
    (await leerCitas(app)).forEach((c) => {
      if (!claveAg((c.detalle || '') + ' ' + (c.que || '')).includes(k)) return;
      const f = deISO(c.fecha); const hm2 = String(c.inicio || '00:00').split(':').map(Number); f.setHours(hm2[0] || 0, hm2[1] || 0);
      if (f < ahora) return;
      if (!mejor || f < mejor.f) mejor = { f, txt: limpiar(c.que) };
    });
  } catch (e) { /* sin sesiones */ }
  if (!mejor) return '';
  return mejor.txt + ' · ' + capital(DIAS[mejor.f.getDay()]) + ' ' + mejor.f.getDate() + ' · ' + p2(mejor.f.getHours()) + ':' + p2(mejor.f.getMinutes());
}
// Respuesta en directo (solo PC): usa Claude Code instalado en el ordenador, con tu cuenta, y solo puede leer notas
function claudeBin() {
  if (ob.Platform.isMobile) return null;
  try {
    const fs = require('fs'); const path = require('path'); const casa = process.env.USERPROFILE || process.env.HOME || ''; const win = process.platform === 'win32';
    const c = [path.join(casa, '.local', 'bin', win ? 'claude.exe' : 'claude'), path.join(casa, '.claude', 'local', win ? 'claude.exe' : 'claude'),
      path.join(process.env.APPDATA || path.join(casa, 'AppData', 'Roaming'), 'npm', 'claude.cmd'), path.join(process.env.LOCALAPPDATA || path.join(casa, 'AppData', 'Local'), 'Programs', 'claude', 'claude.exe'),
      '/opt/homebrew/bin/claude', '/usr/local/bin/claude', path.join(casa, '.npm-global', 'bin', 'claude')];
    // y cualquier carpeta del PATH del sistema
    (process.env.PATH || '').split(path.delimiter).forEach((d) => { if (d) (win ? ['claude.exe', 'claude.cmd'] : ['claude']).forEach((n) => c.push(path.join(d, n))); });
    for (const x of c) if (x && fs.existsSync(x)) return x;
  } catch (e) { /* */ }
  return null;
}
// Abre una ventana de terminal con Claude Code para iniciar sesión (sin tener que escribir nada)
function abrirLoginClaude() {
  const bin = claudeBin(); if (!bin) { aviso('No encuentro Claude Code en este ordenador.'); return; }
  try { const { spawn } = require('child_process');
    if (process.platform === 'win32') spawn('cmd.exe', ['/c', 'start', '"Claude"', '"' + bin + '"'], { shell: true, detached: true, windowsHide: false }).unref();
    else if (process.platform === 'darwin') spawn('open', ['-a', 'Terminal', bin], { detached: true }).unref();
    else spawn('x-terminal-emulator', ['-e', bin], { detached: true }).unref();
  } catch (e) { aviso('No he podido abrir la ventana: ' + e.message); }
}
// Explica en cristiano por qué no ha contestado y cómo arreglarlo
function motivoError(e) {
  const t = String((e && e.message) || e || '');
  if (/login|log in|api key|authenticat|unauthori|401|credential|not logged/i.test(t)) return 'Claude Code no tiene la sesión iniciada (o tu plan de Claude no incluye Claude Code: hace falta Pro o superior). Ve a Ajustes › ÓRBITA › Bienvenida › Tu IA y pulsa «Iniciar sesión en Claude».';
  if (/ENOENT|EINVAL|no está instalado|not recognized/i.test(t)) return 'No encuentro Claude Code en este ordenador. Instálalo desde la Bienvenida (Ajustes › ÓRBITA › Bienvenida) y pulsa «Comprobar».';
  if (/demasiado|timeout/i.test(t)) return 'Ha tardado demasiado. Vuelve a intentarlo en un momento.';
  if (/credit|saldo|billing|429|quota|insufficient/i.test(t)) return 'Tu clave de API no tiene saldo o has llegado al límite. Revisa la web de tu proveedor.';
  if (/503|high demand|overloaded|unavailable/i.test(t)) return 'El servidor de la IA está saturado ahora mismo (le pasa a Google a ratos). Espera un minuto y vuelve a probar.';
  if (/usage limit|limit reached|rate/i.test(t)) return 'Has llegado al límite de uso de tu plan de Claude por ahora. Prueba más tarde.';
  return 'No he podido contestar: ' + t.slice(0, 160);
}
function respuestaEnVivo(app, agente, previos, texto, ctx) {
  ctx = ctx || { grupo: 'del equipo ÓRBITA', pantalla: 'Equipo', ficha: 'ORBITA/6_EQUIPO/', area: 'la nota de tu área', adj: RAIZ + '/6_EQUIPO/adjuntos' };
  if (CON_CLAVE(IA.modo)) return respuestaAPI(app, agente, previos, texto, ctx);
  const bin = claudeBin(); if (!bin) return Promise.reject(new Error('Claude Code no está instalado en este ordenador'));
  const { spawn } = require('child_process'); const cwd = app.vault.adapter.getBasePath();
  const prompt = ['Eres el ' + agente + ' ' + ctx.grupo + ' de ' + NOMBRE + '. Te escribe desde la pantalla ' + ctx.pantalla + ' de Obsidian, como en un chat.',
    'Sigue CLAUDE.md. Para ahorrar, no leas nada si no hace falta para contestar; si hace falta, como mucho 2 archivos y solo la parte útil (la nota de hoy ORBITA/7_DIARIO/' + hoyISO() + '.md, tu ficha en ' + ctx.ficha + ' o ' + ctx.area + ').' + (ctx.permitir ? ' Puedes editar las notas que indican las reglas.' : ' Si te pide apuntar, cambiar o crear algo (una cita, una hora, una tarea, su entreno, una meta), HAZLO tú editando con Edit la nota que toque y respetando su formato: citas o eventos de un día concreto, una fila en la tabla de ORBITA/0_NUCLEO/CITAS.md (Fecha AAAA-MM-DD | Inicio HH:MM | Fin HH:MM | Qué | Detalle); algo que se repite cada semana, una fila en la tabla «Semana fija» de ORBITA/0_NUCLEO/CALENDARIO.md; una tarea de hoy, una línea «- [ ] …» en «Top 3» de la nota de hoy; metas en ORBITA/0_NUCLEO/METAS.md; entreno en ORBITA/2_CUERPO/ENTRENAMIENTO.md. Después dile en media frase qué has apuntado y dónde. Si falta un dato (día u hora), pregúntalo antes. Nunca borres archivos ni toques .obsidian.') + ' No inventes datos. Hoy es ' + DIAS[new Date().getDay()] + ' ' + hoyISO() + '.',
    previos ? 'Conversación reciente contigo:\n' + previos : '',
    ctx.reglas || '',
    'Mensaje nuevo de ' + NOMBRE + ': «' + texto + '»',
    'Si el mensaje trae adjuntos como ![[ruta]], ábrelos con Read antes de contestar (las imágenes las puedes ver). Si trae enlaces http, puedes abrirlos con WebFetch. Si te pide crear algo (un guion, una lista, un plan, un texto largo), guárdalo como archivo .md en ' + ctx.adj + '/ con un nombre claro y menciónalo en tu respuesta como [[ruta completa sin extensión]]; nunca crees ni modifiques archivos fuera de esa carpeta. Puedes pegar enlaces útiles en tu respuesta.',
    'Contesta SOLO con tu respuesta, en español de España, de 1 a 4 frases, como un amigo franco por WhatsApp (tono de TRATO.md): si algo está mal o es una excusa, díselo claro y dile qué toca hacer; si está bien, celébralo. Con ánimo bajo, cercano y sin exigir. Sin firmar, sin títulos, sin listas ni markdown.'].filter(Boolean).join('\n\n');
  return new Promise((ok, mal) => {
    let out = '', err = '';
    const esCmd = /\.(cmd|bat)$/i.test(bin);
    const p = spawn(esCmd ? '"' + bin + '"' : bin, ['-p', '--model', 'sonnet', '--max-turns', '8', '--allowedTools', 'Read,Glob,Grep,LS,WebFetch,WebSearch,Write,Edit', '--output-format', 'text'], { cwd, windowsHide: true, shell: esCmd, env: Object.assign({}, process.env) });
    const t = setTimeout(() => { try { p.kill(); } catch (e) { /* */ } mal(new Error('Ha tardado demasiado')); }, 240000);
    p.stdout.on('data', (d) => { out += d; }); p.stderr.on('data', (d) => { err += d; });
    p.on('error', (e) => { clearTimeout(t); mal(e); });
    p.on('close', (code) => { clearTimeout(t); const r = out.trim(); if (code === 0 && r && !/^(Invalid API key|Please run \/login)/i.test(r)) ok(r); else mal(new Error(((err || '') + ' ' + (r || '')).trim().slice(0, 300) || 'Sin respuesta')); });
    p.stdin.write(prompt); p.stdin.end();
  });
}
/* ---------- IA: Claude Code (tu cuenta de Claude), clave de Anthropic o clave de OpenAI ---------- */
// IA se rellena con los ajustes al arrancar. La clave se guarda solo en este dispositivo (data.json del plugin), nunca en las notas.
const IA = { modo: 'claude-code', clave: '', modelo: '' };
const IA_MODELO_BASE = { anthropic: 'claude-haiku-4-5', openai: 'gpt-5-mini', gemini: 'gemini-flash-latest' };
const CON_CLAVE = (m) => m === 'anthropic' || m === 'openai' || m === 'gemini';
function iaDisponible() {
  if (CON_CLAVE(IA.modo)) return !!IA.clave;
  if (IA.modo === 'ninguna') return false;
  return !!claudeBin();
}
function iaNombre() {
  return { 'claude-code': 'Claude (tu cuenta, con Claude Code)', anthropic: 'Clave de API de Anthropic', openai: 'Clave de API de OpenAI', gemini: 'Google Gemini (gratis)', ninguna: 'Sin IA' }[IA.modo] || 'Sin IA';
}
async function leerCorto(app, ruta, max) { const t = await leer(app, ruta); return t ? String(t).slice(0, max || 2500) : ''; }
// Llamada directa a la API (funciona también en el móvil). Sin herramientas: le pasamos las notas útiles en el mensaje.
async function llamarAPI(sistema, mensaje, maxTokens) {
  const modelo = IA.modelo || IA_MODELO_BASE[IA.modo];
  if (IA.modo === 'anthropic') {
    const r = await ob.requestUrl({ url: 'https://api.anthropic.com/v1/messages', method: 'POST', throw: false, contentType: 'application/json',
      headers: { 'x-api-key': IA.clave, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: modelo, max_tokens: maxTokens || 1200, system: sistema, messages: [{ role: 'user', content: mensaje }] }) });
    if (r.status >= 400) throw new Error('Anthropic ' + r.status + ': ' + ((r.json && r.json.error && r.json.error.message) || 'error'));
    return (r.json.content || []).map((c) => c.text || '').join('').trim();
  }
  if (IA.modo === 'openai') {
    const r = await ob.requestUrl({ url: 'https://api.openai.com/v1/chat/completions', method: 'POST', throw: false, contentType: 'application/json',
      headers: { Authorization: 'Bearer ' + IA.clave },
      body: JSON.stringify({ model: modelo, max_completion_tokens: (maxTokens || 1200) * 3, messages: [{ role: 'system', content: sistema }, { role: 'user', content: mensaje }] }) });
    if (r.status >= 400) throw new Error('OpenAI ' + r.status + ': ' + ((r.json && r.json.error && r.json.error.message) || 'error'));
    return ((r.json.choices || [])[0] || {}).message ? r.json.choices[0].message.content.trim() : '';
  }
  if (IA.modo === 'gemini') {
    const pedir = (mod) => ob.requestUrl({ url: 'https://generativelanguage.googleapis.com/v1beta/models/' + mod + ':generateContent', method: 'POST', throw: false, contentType: 'application/json',
      headers: { 'x-goog-api-key': IA.clave },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: sistema }] }, contents: [{ role: 'user', parts: [{ text: mensaje }] }], generationConfig: { maxOutputTokens: (maxTokens || 1200) * 2 } }) });
    // Si un modelo está saturado (503/429) o no existe (404), prueba otro y reintenta con una pequeña espera
    let cola = IA.modelo ? [modelo, modelo] : ['gemini-flash-latest', 'gemini-flash-lite-latest'];
    // Además, los modelos «flash» que tu clave tiene disponibles de verdad (se piden a Google una vez y se guardan)
    if (!IA.modelo) {
      if (!IA.geminiLista) { try { const lm = await ob.requestUrl({ url: 'https://generativelanguage.googleapis.com/v1beta/models?pageSize=200', headers: { 'x-goog-api-key': IA.clave }, throw: false });
        IA.geminiLista = ((lm.json && lm.json.models) || []).filter((m) => (m.supportedGenerationMethods || []).includes('generateContent') && /flash/i.test(m.name) && !/image|tts|audio|live|thinking|exp|preview/i.test(m.name)).map((m) => m.name.replace(/^models\//, ''))
          .sort((x, y) => (/lite/.test(y) ? 1 : 0) - (/lite/.test(x) ? 1 : 0) || y.localeCompare(x)); } catch (e) { IA.geminiLista = []; } }
      cola = cola.concat(IA.geminiLista.filter((m) => !cola.includes(m)).slice(0, 5));
      cola = cola.concat(cola.slice(0, 2));
    }
    let r = null;
    for (let i = 0; i < cola.length; i++) { r = await pedir(cola[i]); if (![404, 429, 500, 503].includes(r.status)) break; await new Promise((ok) => setTimeout(ok, 600 + 400 * i)); }
    if (r.status >= 400) throw new Error('Gemini ' + r.status + ': ' + ((r.json && r.json.error && r.json.error.message) || 'error'));
    const c = ((r.json.candidates || [])[0] || {}).content; return ((c && c.parts) || []).map((p) => p.text || '').join('').trim();
  }
  throw new Error('No hay IA configurada');
}
// Guardado seguro: el modelo devuelve bloques <<<GUARDAR ruta>>> ... <<<FIN>>> y solo se escriben dentro de ORBITA/
async function aplicarGuardados(app, txt, permitidas, completas) {
  const hechos = [];
  const limpio = String(txt).replace(/<<<GUARDAR\s+([^>\n]+)>>>\n?([\s\S]*?)<<<FIN>>>/g, (m0, ruta) => { hechos.push({ ruta: ruta.trim(), cont: m0.replace(/^<<<GUARDAR[^>]*>>>\n?/, '').replace(/<<<FIN>>>$/, '') }); return ''; }).trim();
  const escritos = [];
  for (const h of hechos) {
    const ruta = h.ruta.replace(/^\/+/, '');
    if (!ruta.startsWith(RAIZ + '/') || ruta.includes('..') || !/\.md$/.test(ruta)) continue;
    if (permitidas && !permitidas.some((p) => ruta.startsWith(p))) continue;
    if (!archivo(app, ruta) && ruta.startsWith(RAIZ + '/7_DIARIO/')) continue; // la nota del día la crea ÓRBITA con su plantilla
    const f = archivo(app, ruta);
    if (f && completas && !completas.has(ruta)) continue; // solo se reescribe una nota que el modelo ha visto entera
    try {
      if (f) await app.vault.modify(f, h.cont.trim() + '\n');
      else { const dir = ruta.split('/').slice(0, -1).join('/'); if (dir && !app.vault.getAbstractFileByPath(dir)) await app.vault.createFolder(dir); await app.vault.create(ruta, h.cont.trim() + '\n'); }
      escritos.push(ruta);
    } catch (e) { console.error('ÓRBITA guardar', ruta, e); }
  }
  return { texto: limpio, escritos };
}
async function respuestaAPI(app, agente, previos, texto, ctx) {
  const nf = quitarAcentos(agente).toUpperCase() + '.md'; const ficha = archivo(app, RAIZ + '/6_EQUIPO/' + nf) ? RAIZ + '/6_EQUIPO/' + nf : RAIZ + '/1_DINERO/contenido/equipo/' + nf;
  const notas = [['TRATO (cómo hablarle)', RAIZ + '/0_NUCLEO/TRATO.md', 1500], ['PERFIL', RAIZ + '/0_NUCLEO/PERFIL.md', 2500], ['TU FICHA', ficha, 2500],
    ['METAS', RAIZ + '/0_NUCLEO/METAS.md', 6000], ['NOTA DE HOY', RAIZ + '/7_DIARIO/' + hoyISO() + '.md', 6000],
    ['CITAS (eventos de un día concreto)', RAIZ + '/0_NUCLEO/CITAS.md', 6000], ['CALENDARIO (horario fijo semanal)', RAIZ + '/0_NUCLEO/CALENDARIO.md', 6000]].concat(ctx.extra || []);
  let contexto = ''; const completas = new Set();
  for (const [t, r, mx] of notas) { const full = await leer(app, r); if (!full) continue; const c = String(full).slice(0, mx); if (c.length === String(full).length) completas.add(r); contexto += '\n\n=== ' + t + ' (' + r + ')' + (completas.has(r) ? '' : ' [RECORTADA: no la reescribas]') + ' ===\n' + c; }
  const permitidas = (ctx.permitir || [RAIZ + '/0_NUCLEO/CITAS.md', RAIZ + '/0_NUCLEO/CALENDARIO.md', RAIZ + '/0_NUCLEO/METAS.md', RAIZ + '/7_DIARIO/' + hoyISO() + '.md']).concat([ctx.adj + '/']);
  const sistema = ['Eres el ' + agente + ' ' + ctx.grupo + ' de ' + NOMBRE + '. Te escribe desde la pantalla ' + ctx.pantalla + ' de Obsidian, como en un chat. Hoy es ' + DIAS[new Date().getDay()] + ' ' + hoyISO() + '. No inventes datos: si algo no está en las notas, pregúntalo.',
    ctx.reglas ? '' : 'Si te pide apuntar o cambiar algo (una cita de un día concreto: fila en CITAS.md; algo que se repite cada semana: fila en «Semana fija» de CALENDARIO.md; una tarea de hoy: línea «- [ ] …» en «Top 3» de la nota de hoy; una meta: METAS.md), HAZLO guardando la nota completa con el bloque GUARDAR de abajo, respetando su formato, y dile en media frase qué has apuntado. Si falta el día o la hora, pregúntalo antes.',
    ctx.reglas || '',
    'Para guardar o actualizar una nota, añade AL FINAL de tu respuesta uno o varios bloques exactamente así (con la nota COMPLETA, no solo el cambio):\n<<<GUARDAR ruta/de/la/nota.md>>>\ncontenido\n<<<FIN>>>\nSolo puedes escribir en: ' + permitidas.join(', ') + '. Un texto largo que te pida (guion, plan, lista) guárdalo en ' + ctx.adj + '/ y menciónalo como [[ruta sin extensión]].',
    'Tu respuesta visible: en español de España, de 1 a 4 frases, como un amigo franco por WhatsApp (tono de TRATO): si algo está mal, díselo claro y dile qué toca; si está bien, celébralo. Con ánimo bajo, cercano y sin exigir. Sin firmar, sin títulos, sin listas ni markdown.',
    'Notas útiles:' + contexto].filter(Boolean).join('\n\n');
  const msg = (previos ? 'Conversación reciente contigo:\n' + previos + '\n\n' : '') + 'Mensaje nuevo de ' + NOMBRE + ': «' + texto + '»';
  const r = await llamarAPI(sistema, msg, ctx.reglas ? 2500 : 900);
  const g = await aplicarGuardados(app, r, permitidas, completas);
  return g.texto + (g.escritos.length ? ' (Guardado en ' + g.escritos.map((x) => '[[' + x.replace(/\.md$/, '') + ']]').join(', ') + ')' : '');
}
function quitarAcentos(s) { return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }

/* ---------- Bienvenida: la primera vez que se abre ÓRBITA ---------- */
// Entrevista del Director después del asistente: puede rellenar el perfil, metas y horario
const CTX_ENTREVISTA = { grupo: 'del equipo ÓRBITA', pantalla: 'Equipo', ficha: 'ORBITA/6_EQUIPO/', area: 'ORBITA/0_NUCLEO/PERFIL.md', adj: RAIZ + '/6_EQUIPO/adjuntos',
  permitir: [RAIZ + '/0_NUCLEO/', RAIZ + '/2_CUERPO/', RAIZ + '/6_EQUIPO/', RAIZ + '/3_MENTE/', RAIZ + '/5_ESTUDIOS/', RAIZ + '/1_DINERO/'],
  extra: [['CALENDARIO (horario)', RAIZ + '/0_NUCLEO/CALENDARIO.md', 2500]],
  reglas: 'ESTÁS EN LA ENTREVISTA DE BIENVENIDA. ' + 'Objetivo: dejar ÓRBITA configurado a su medida. Haz UNA pregunta cada vez, corta y concreta, en este orden y saltando lo que ya esté en PERFIL/METAS/CALENDARIO: ' +
    '1) semana tipo: clases o trabajo con días y horas; 2) entreno: días, hora y qué rutina hace (o si quiere que el Entrenador le proponga una); 3) cuidado personal: qué usa mañana y noche (si no usa nada, apúntalo); 4) dinero: ingresos, ahorro y meta; 5) qué le cuesta más y cómo quiere que le hablen (más suave o más exigente); 6) libro o curso que esté siguiendo. ' +
    'Cada vez que te dé un dato, actualiza la nota que toque (PERFIL.md, METAS.md, la tabla «Semana fija» de CALENDARIO.md respetando sus columnas Días|Inicio|Fin|Qué|Órbita, 2_CUERPO/ENTRENAMIENTO.md, la tabla «Plan del calendario» de 6_EQUIPO/SKINCARE.md, 1_DINERO/PLAN_DINERO.md, 0_NUCLEO/TRATO.md) y dile en media frase qué has apuntado. ' +
    'Cuando ya esté todo, despídete diciendo que ya está listo, que mañana tendrá su nota del día preparada, y escribe al final la marca [FIN_ENTREVISTA].'
};
function mesNombre(d) { return ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'][(d || new Date()).getMonth()]; }
async function escribirNota(app, ruta, cont) { const f = archivo(app, ruta); if (f) await app.vault.modify(f, cont); else await app.vault.create(ruta, cont); }

/* ---------- Actualizaciones automáticas desde GitHub ---------- */
const REPO_RAW = 'https://raw.githubusercontent.com/Fatalyy/ORBITA/main/vault/.obsidian/plugins/orbita/';
const verNum = (v) => String(v || '0').split('.').map((x) => parseInt(x, 10) || 0).reduce((a, x) => a * 1000 + x, 0);
async function buscarActualizacion(plugin, manual) {
  if (ob.Platform.isMobile && !manual) return; // en el móvil, solo si lo pides (lo normal es que llegue por la sincronización)
  try {
    const r = await ob.requestUrl({ url: REPO_RAW + 'manifest.json?t=' + Date.now(), throw: false });
    if (r.status !== 200) { if (manual) aviso('No he podido comprobar las actualizaciones ahora.'); return; }
    const remoto = JSON.parse(r.text); const actual = plugin.manifest.version;
    if (verNum(remoto.version) <= verNum(actual)) { if (manual) aviso('Tienes la última versión de ÓRBITA (' + actual + ').'); return; }
    const [js, css] = await Promise.all([ob.requestUrl({ url: REPO_RAW + 'main.js?t=' + Date.now(), throw: false }), ob.requestUrl({ url: REPO_RAW + 'styles.css?t=' + Date.now(), throw: false })]);
    if (js.status !== 200 || css.status !== 200 || js.text.length < 100000 || !/module\.exports/.test(js.text)) { if (manual) aviso('La descarga de la actualización ha fallado. Prueba más tarde.'); return; }
    const ad = plugin.app.vault.adapter; const dir = plugin.manifest.dir;
    try { await ad.write(dir + '/main.js.anterior', await ad.read(dir + '/main.js')); } catch (e) { /* copia de seguridad opcional */ }
    await ad.write(dir + '/styles.css', css.text); await ad.write(dir + '/main.js', js.text); await ad.write(dir + '/manifest.json', r.text);
    new ob.Notice('ÓRBITA se ha actualizado a la versión ' + remoto.version + '. Se recarga sola en unos segundos.', 8000);
  } catch (e) { console.warn('ÓRBITA actualizar', e); if (manual) aviso('No he podido actualizar: ' + e.message); }
}

class BienvenidaModal extends ob.Modal {
  constructor(app, plugin) { super(app); this.plugin = plugin; this.paso = 0; this.d = { nombre: plugin.ajustes.nombre || '', edad: '', ciudad: '', dedico: '', cuesta: '', trato: 'directo', levantar: '08:00', dormir: '23:30', gymDias: ['L', 'X', 'V'], gymHora: '18:00', ocupDias: 'L-V', ocupIni: '09:00', ocupFin: '14:00', ocupQue: 'Clase o trabajo', metas: { dinero: '', cuerpo: '', mente: '', relaciones: '', estudios: '' }, mes: ['', '', ''] }; }
  onOpen() { this.modalEl.addClass('orb-bv'); this.pintar(); }
  onClose() { this.contentEl.empty(); }
  campo(el, etq, valor, alCambiar, opts) {
    const f = el.createDiv('orb-bv-campo'); f.createEl('label', { text: etq });
    const i = f.createEl(opts && opts.area ? 'textarea' : 'input', { attr: Object.assign({ type: (opts && opts.tipo) || 'text', placeholder: (opts && opts.ph) || '' }, opts && opts.area ? { rows: 2 } : {}) });
    i.value = valor || ''; i.addEventListener('input', () => alCambiar(i.value)); return i;
  }
  pintar() {
    const c = this.contentEl; c.empty();
    const pasos = ['Hola', 'Tu IA', 'Sobre ti', 'Tu semana', 'Tus metas', 'Listo'];
    const barra = c.createDiv('orb-bv-pasos'); pasos.forEach((p, i) => barra.createDiv({ cls: 'orb-bv-paso' + (i === this.paso ? ' on' : i < this.paso ? ' hecho' : ''), text: p }));
    const cuerpo = c.createDiv('orb-bv-cuerpo'); const d = this.d;
    if (this.paso === 0) {
      cuerpo.createEl('h2', { text: 'Bienvenido a ÓRBITA' });
      cuerpo.createEl('p', { text: 'En 3 minutos lo dejamos listo. Luego el Director te hace unas preguntas en el chat y termina de configurarlo todo por ti.' });
      const i = this.campo(cuerpo, '¿Cómo te llamas?', d.nombre, (v) => { d.nombre = v; }, { ph: 'Tu nombre' }); setTimeout(() => i.focus(), 50);
      const ft = cuerpo.createDiv('orb-bv-campo'); ft.createEl('label', { text: 'Aspecto' });
      const gt = ft.createDiv('orb-bv-chips'); const osc = this.plugin.ajustes.tema === 'oscuro';
      [['crema', '☀️ Claro', !osc], ['oscuro', '🌙 Oscuro', osc]].forEach(([k, t, on]) => { const b = gt.createEl('button', { cls: 'orb-bv-chip' + (on ? ' on' : ''), text: t }); b.onclick = async () => { d.nombre = i.value; if ((this.plugin.ajustes.tema === 'oscuro') !== (k === 'oscuro')) await this.plugin.alternarTema(); this.pintar(); }; });
    } else if (this.paso === 1) this.pasoIA(cuerpo);
    else if (this.paso === 2) {
      cuerpo.createEl('h2', { text: 'Sobre ti' }); cuerpo.createEl('p', { cls: 'orb-bv-sub', text: 'Todo se queda en tus notas, en tu ordenador. Puedes dejar cosas en blanco.' });
      this.campo(cuerpo, 'Edad', d.edad, (v) => { d.edad = v; }, { ph: '23' });
      this.campo(cuerpo, 'Ciudad', d.ciudad, (v) => { d.ciudad = v; });
      this.campo(cuerpo, 'A qué te dedicas (estudios, trabajo)', d.dedico, (v) => { d.dedico = v; });
      this.campo(cuerpo, 'Lo que más te cuesta', d.cuesta, (v) => { d.cuesta = v; }, { ph: 'Levantarme, ser constante, el móvil…' });
      const f = cuerpo.createDiv('orb-bv-campo'); f.createEl('label', { text: 'Cómo quieres que te hable el equipo' });
      const g = f.createDiv('orb-bv-chips'); [['suave', 'Suave'], ['directo', 'Directo'], ['exigente', 'Exigente']].forEach(([k, t]) => { const b = g.createEl('button', { cls: 'orb-bv-chip' + (d.trato === k ? ' on' : ''), text: t }); b.onclick = () => { d.trato = k; this.pintar(); }; });
    } else if (this.paso === 3) {
      cuerpo.createEl('h2', { text: 'Tu semana' }); cuerpo.createEl('p', { cls: 'orb-bv-sub', text: 'Lo básico. El resto (citas, horarios raros) se lo cuentas al Director.' });
      const fila = cuerpo.createDiv('orb-bv-fila');
      this.campo(fila, 'Me levanto a las', d.levantar, (v) => { d.levantar = v; }, { tipo: 'time' });
      this.campo(fila, 'Me acuesto a las', d.dormir, (v) => { d.dormir = v; }, { tipo: 'time' });
      const f = cuerpo.createDiv('orb-bv-campo'); f.createEl('label', { text: 'Días de gimnasio o deporte' });
      const g = f.createDiv('orb-bv-chips'); DIAS_CORTOS.slice(1).concat(['D']).forEach((k) => { const b = g.createEl('button', { cls: 'orb-bv-chip' + (d.gymDias.includes(k) ? ' on' : ''), text: k }); b.onclick = () => { d.gymDias = d.gymDias.includes(k) ? d.gymDias.filter((x) => x !== k) : d.gymDias.concat(k); this.pintar(); }; });
      this.campo(cuerpo, 'Hora del entreno', d.gymHora, (v) => { d.gymHora = v; }, { tipo: 'time' });
      const f2 = cuerpo.createDiv('orb-bv-fila');
      this.campo(f2, 'Clase o trabajo (qué)', d.ocupQue, (v) => { d.ocupQue = v; });
      this.campo(f2, 'Días', d.ocupDias, (v) => { d.ocupDias = v; }, { ph: 'L-V' });
      const f3 = cuerpo.createDiv('orb-bv-fila');
      this.campo(f3, 'Desde', d.ocupIni, (v) => { d.ocupIni = v; }, { tipo: 'time' });
      this.campo(f3, 'Hasta', d.ocupFin, (v) => { d.ocupFin = v; }, { tipo: 'time' });
    } else if (this.paso === 4) {
      cuerpo.createEl('h2', { text: 'Tus metas' }); cuerpo.createEl('p', { cls: 'orb-bv-sub', text: 'Una meta para este año en cada órbita. Si no lo tienes claro, déjalo vacío y lo vemos con el Mentor.' });
      [['dinero', '💰 Dinero'], ['cuerpo', '🏋️ Cuerpo'], ['mente', '🧠 Mente'], ['relaciones', '🤝 Relaciones'], ['estudios', '🎓 Estudios']].forEach(([k, t]) => this.campo(cuerpo, t, d.metas[k], (v) => { d.metas[k] = v; }));
      cuerpo.createEl('h3', { text: 'Este mes (' + mesNombre() + ')' });
      d.mes.forEach((m, i) => this.campo(cuerpo, 'Meta ' + (i + 1) + ' del mes', m, (v) => { d.mes[i] = v; }));
    } else {
      cuerpo.createEl('h2', { text: 'Todo listo, ' + (d.nombre || 'crack') });
      const ul = cuerpo.createEl('ul'); ['Tu perfil, tus metas y tu horario se guardan en tus notas.', iaDisponible() ? 'Ahora el Director te escribe en el chat para terminar de configurarlo.' : 'Sin IA conectada, el equipo funciona igual (avisos, nota del día). Puedes conectarla luego en Ajustes › ÓRBITA.', 'Mañana tendrás tu nota del día preparada.'].forEach((t) => ul.createEl('li', { text: t }));
      const px = cuerpo.createDiv('orb-bv-det'); px.createEl('h3', { text: 'Opcional: tu proyecto ÓRBITA en la app de Claude' });
      px.createDiv({ cls: 'orb-bv-sub', text: 'Para hablar con el equipo también desde la app de Claude (y el móvil) y recibir avisos de buenos días y de noche. Son 2 minutos.' });
      const ol = px.createEl('ol'); ['En la app de Claude: Proyectos → Nuevo proyecto → «ÓRBITA».', 'Pega las instrucciones (botón de abajo).', 'Sube CONSTITUCION.md y BUZON.md al conocimiento del proyecto, y los 7 zip de skills-zip en Ajustes → Skills.', 'En la app de escritorio, conecta la carpeta de tu bóveda.'].forEach((t) => ol.createEl('li', { text: t }));
      const bx = px.createDiv('orb-bv-chips');
      const b1 = bx.createEl('button', { text: 'Copiar instrucciones' }); b1.onclick = async () => { const t = await this.app.vault.adapter.read('.claude-proyecto/INSTRUCCIONES_PROYECTO.txt').catch(() => ''); if (t) { navigator.clipboard.writeText(t); aviso('Instrucciones copiadas. Pégalas en tu proyecto.'); } else aviso('No encuentro .claude-proyecto en tu bóveda.'); };
      if (!ob.Platform.isMobile) { const b2 = bx.createEl('button', { text: 'Abrir la carpeta con los archivos' }); b2.onclick = () => { try { require('electron').shell.openPath(require('path').join(this.app.vault.adapter.getBasePath(), '.claude-proyecto')); } catch (e) { aviso('Ábrela a mano: carpeta .claude-proyecto de tu bóveda'); } }; }
    }
    const pie = c.createDiv('orb-bv-pie');
    if (this.paso > 0) { const a = pie.createEl('button', { text: 'Atrás' }); a.onclick = () => { this.paso--; this.pintar(); }; }
    pie.createDiv('orb-bv-hueco');
    if (this.paso < 5) { const s = pie.createEl('button', { cls: 'mod-cta', text: this.paso === 0 ? 'Empezar' : 'Siguiente' }); s.onclick = () => { if (this.paso === 0 && !d.nombre.trim()) { aviso('Dime cómo te llamas'); return; } this.paso++; this.pintar(); }; }
    else { const s = pie.createEl('button', { cls: 'mod-cta', text: 'Abrir ÓRBITA' }); s.onclick = () => this.terminar(); }
  }
  pasoIA(el) {
    el.createEl('h2', { text: 'Conecta tu IA' });
    el.createEl('p', { cls: 'orb-bv-sub', text: 'Es lo que hace que el equipo te conteste. Elige una. Puedes cambiarla cuando quieras en Ajustes › ÓRBITA.' });
    const ops = [['claude-code', 'Claude con tu cuenta (recomendado)', 'Si pagas Claude Pro. Sin coste extra. Solo en el ordenador.'],
      ['anthropic', 'Clave de API de Anthropic', 'Pagas por uso (céntimos al día). Funciona también en el móvil.'],
      ['gemini', 'Google Gemini (gratis)', 'Sin pagar nada: solo una clave gratuita de Google. Funciona también en el móvil.'],
      ['openai', 'Clave de API de OpenAI (ChatGPT)', 'Pagas por uso. Funciona también en el móvil.'],
      ['ninguna', 'Ahora no', 'Todo funciona menos las respuestas del chat.']];
    const g = el.createDiv('orb-bv-ops');
    ops.forEach(([k, t, s]) => { const b = g.createDiv({ cls: 'orb-bv-op' + (IA.modo === k ? ' on' : '') }); b.createDiv({ cls: 'orb-bv-op-t', text: t }); b.createDiv({ cls: 'orb-bv-op-s', text: s }); b.onclick = async () => { IA.modo = k; this.plugin.ajustes.ia = k; await this.plugin.guardar(); this.pintar(); }; });
    const det = el.createDiv('orb-bv-det');
    if (IA.modo === 'claude-code') {
      const ok = !!claudeBin();
      det.createDiv({ cls: 'orb-bv-estado ' + (ok ? 'ok' : 'no'), text: ok ? '✓ Claude Code está instalado en este ordenador' : (ob.Platform.isMobile ? 'En el móvil no se puede: configúralo en el ordenador o usa una clave de API.' : 'Todavía no está instalado') });
      if (ok) { const ini = det.createEl('button', { text: 'Iniciar sesión en Claude (se abre una ventana)' }); ini.onclick = () => abrirLoginClaude();
        det.createDiv({ cls: 'orb-bv-sub', text: 'En la ventana negra, sigue los pasos para entrar con tu cuenta de Claude (Pro o superior). Cuando termine, ciérrala y pulsa «Probar que contesta».' }); }
      if (ok) { const pr = det.createEl('button', { text: 'Probar que contesta' }); const res = det.createDiv('orb-bv-estado'); res.setText('Pruébalo: comprueba también que tienes la sesión iniciada.');
        pr.onclick = async () => { res.className = 'orb-bv-estado'; res.setText('Probando… (unos segundos)');
          try { const r = await respuestaEnVivo(this.app, 'Director', '', 'Contesta solo con la palabra: listo', { grupo: 'del equipo ÓRBITA', pantalla: 'Bienvenida', ficha: 'ORBITA/6_EQUIPO/', area: '', adj: RAIZ + '/6_EQUIPO/adjuntos' }); res.setText('✓ Funciona: «' + r.slice(0, 40) + '»'); res.addClass('ok'); }
          catch (e) { res.setText(motivoError(e)); res.addClass('no'); } }; }
      if (!ok && !ob.Platform.isMobile) {
        const ol = det.createEl('ol');
        ol.createEl('li', { text: 'Abre «PowerShell» (Windows) o «Terminal» (Mac).' });
        const li = ol.createEl('li'); li.appendText('Pega esto y pulsa Enter: '); const code = li.createEl('code', { text: process.platform === 'win32' ? 'irm https://claude.ai/install.ps1 | iex' : 'curl -fsSL https://claude.ai/install.sh | bash' });
        const cp = li.createEl('button', { cls: 'orb-bv-mini', text: 'Copiar' }); cp.onclick = () => { navigator.clipboard.writeText(code.textContent); aviso('Copiado'); };
        ol.createEl('li', { text: 'Cuando acabe, escribe claude, pulsa Enter e inicia sesión con tu cuenta de Claude.' });
        ol.createEl('li', { text: 'Vuelve aquí y pulsa «Comprobar».' });
        const b = det.createEl('button', { text: 'Comprobar' }); b.onclick = () => this.pintar();
      }
    } else if (CON_CLAVE(IA.modo)) {
      const web = { anthropic: 'https://console.anthropic.com/settings/keys', openai: 'https://platform.openai.com/api-keys', gemini: 'https://aistudio.google.com/apikey' }[IA.modo];
      const p = det.createEl('p'); p.appendText('1. Crea una clave en '); p.createEl('a', { text: web.replace('https://', ''), href: web }); p.appendText(IA.modo === 'gemini' ? ' con tu cuenta de Google (pulsa «Create API key»; es gratis, sin tarjeta). 2. Pégala aquí:' : ' (necesitas añadir saldo, con 5 € sobra para empezar). 2. Pégala aquí:');
      if (IA.modo === 'gemini') det.createDiv({ cls: 'orb-bv-sub', text: 'Ojo: en el plan gratuito, Google puede usar lo que escribes para mejorar sus modelos. Si te importa, usa Claude o una clave de pago.' });
      const i = det.createEl('input', { attr: { type: 'password', placeholder: { anthropic: 'sk-ant-…', openai: 'sk-…', gemini: 'AIza…' }[IA.modo] } }); i.value = IA.clave || '';
      i.addEventListener('change', async () => { IA.clave = i.value.trim(); this.plugin.ajustes.iaClave = IA.clave; await this.plugin.guardar(); });
      det.createDiv({ cls: 'orb-bv-sub', text: 'Se guarda solo en este dispositivo, fuera de tus notas. Nunca se sube a ningún sitio.' });
      const b = det.createEl('button', { text: 'Probar' }); const res = det.createDiv('orb-bv-estado');
      b.onclick = async () => { IA.clave = i.value.trim(); this.plugin.ajustes.iaClave = IA.clave; await this.plugin.guardar(); res.setText('Probando…'); res.className = 'orb-bv-estado';
        try { const r = await llamarAPI('Responde solo: listo', 'Hola', 20); res.setText('✓ Funciona (' + (r || 'ok').slice(0, 30) + ')'); res.addClass('ok'); } catch (e) { res.setText(motivoError(e)); res.addClass('no'); } };
    }
  }
  async terminar() {
    const d = this.d; const app = this.app; const p = this.plugin;
    try {
      p.ajustes.nombre = d.nombre.trim(); NOMBRE = p.ajustes.nombre || 'Tú';
      const perfil = '# PERFIL\n*Lo que el equipo sabe de ti. Cámbialo cuando quieras (o díselo al Director).*\n\n' +
        '- **Nombre:** ' + d.nombre + '\n- **Edad y ciudad:** ' + [d.edad, d.ciudad].filter(Boolean).join(', ') + '\n- **A qué me dedico (estudios, trabajo):** ' + d.dedico +
        '\n- **Lo que quiero conseguir este año:** ' + Object.values(d.metas).filter(Boolean).join('; ') + '\n- **Lo que más me cuesta:** ' + d.cuesta +
        '\n- **Lo que me motiva:** \n- **Cómo prefiero que me hablen:** ' + d.trato + '\n- **Libro, curso o referente que me inspira:** \n- **Horario base:** me levanto a las ' + d.levantar + ' y me acuesto a las ' + d.dormir + '\n';
      await escribirNota(app, RAIZ + '/0_NUCLEO/PERFIL.md', perfil);
      // Metas: rellena «Meta del año» de cada órbita y las metas del mes
      let metas = await leer(app, RAIZ + '/0_NUCLEO/METAS.md');
      if (metas) {
        const titulos = { dinero: 'Dinero', cuerpo: 'Cuerpo', mente: 'Mente', relaciones: 'Relaciones', estudios: 'Estudios' };
        Object.keys(titulos).forEach((k) => { if (!d.metas[k]) return; metas = metas.replace(new RegExp('(### [^\\n]*' + titulos[k] + '\\n- \\*\\*Meta del año:\\*\\*)[^\\n]*'), '$1 ' + d.metas[k].replace(/\$/g, '')); });
        const mm = d.mes.filter(Boolean);
        if (mm.length) metas = metas.replace(/## Este mes · \(mes\)\n(- \[ \] [^\n]*\n)+/, '## Este mes · ' + mesNombre() + '\n' + mm.map((m) => '- [ ] ' + m.replace(/\$/g, '')).join('\n') + '\n');
        await escribirNota(app, RAIZ + '/0_NUCLEO/METAS.md', metas);
      }
      // Horario: la tabla «Semana fija» del calendario
      const masTarde = (h, min) => { const [a, b] = h.split(':').map(Number); const t = a * 60 + b + min; return p2(Math.floor(t / 60) % 24) + ':' + p2(t % 60); };
      const filas = ['| L-D | ' + d.levantar + ' | ' + masTarde(d.levantar, 20) + ' | Levantarme · luz, agua y cuidado personal | mente |'];
      if (d.ocupQue && d.ocupDias) filas.push('| ' + d.ocupDias + ' | ' + d.ocupIni + ' | ' + d.ocupFin + ' | ' + d.ocupQue + ' | estudios |');
      if (d.gymDias.length) filas.push('| ' + ['L', 'M', 'X', 'J', 'V', 'S', 'D'].filter((x) => d.gymDias.includes(x)).join(',') + ' | ' + d.gymHora + ' | ' + masTarde(d.gymHora, 60) + ' | Gimnasio | cuerpo |');
      filas.push('| L-D | ' + masTarde(d.dormir, -30) + ' | ' + masTarde(d.dormir, -20) + ' | Cierre del día | nucleo |', '| L-D | ' + d.dormir + ' | ' + d.dormir + ' | A dormir | mente |');
      let cal = await leer(app, RAIZ + '/0_NUCLEO/CALENDARIO.md');
      if (cal) { cal = cal.replace(/(\| Días \| Inicio \| Fin \| Qué \| Órbita \|\n\|[-|]+\|\n)((\|[^\n]*\n?)*)/, '$1' + filas.join('\n') + '\n').replace(/\n\*Ejemplo: cámbialo por tu horario real\.\*/, ''); await escribirNota(app, RAIZ + '/0_NUCLEO/CALENDARIO.md', cal); }
      // Tono del equipo
      if (d.trato !== 'directo') { const t = await leer(app, RAIZ + '/0_NUCLEO/TRATO.md'); if (t != null) await escribirNota(app, RAIZ + '/0_NUCLEO/TRATO.md', t.replace(/\s*$/, '') + '\n\n## Preferencia\n' + (d.trato === 'suave' ? 'Prefiere un trato suave: anima más de lo que exige.' : 'Prefiere un trato exigente: sin paños calientes, siempre con respeto.') + '\n'); }
      // El Director abre la entrevista en el chat
      if (iaDisponible()) {
        const ahora = new Date(); const sello = hoyISO() + ' ' + p2(ahora.getHours()) + ':' + p2(ahora.getMinutes());
        const linea = '- ' + sello + ' · Director → Yo: Hola, ' + d.nombre + '. Soy el Director, el que coordina al equipo. Ya tengo lo básico; ahora te hago unas preguntas cortas para dejarlo todo a tu medida. Para empezar: ¿cómo es tu semana normal? Dime clases o trabajo, con días y horas. <!--bienvenida-->';
        const rc = RAIZ + '/6_EQUIPO/CHAT.md'; const t = (await leer(app, rc)) || CONF_EQUIPO.cabecera; await escribirNota(app, rc, t.replace(/\s*$/, '') + '\n' + linea + '\n');
        p.ajustes.entrevista = true;
      }
      p.ajustes.bienvenida = true; await p.guardar();
      this.close(); try { SON.completo(); } catch (e) { /* */ }
      aviso(iaDisponible() ? 'Listo. El Director te está esperando en el chat.' : 'Listo, ' + NOMBRE + '. Ya puedes usar ÓRBITA.', 5000);
      p.abrir(iaDisponible() ? V.casas : V.hoy);
    } catch (e) { console.error('ÓRBITA bienvenida', e); aviso('Algo ha fallado al guardar: ' + e.message, 6000); }
  }
}

/* ---------- El equipo te escribe (21-11-2026): mensajes que inician los agentes y avisos de chat en Obsidian ---------- */
const PINGS = [
  { id: 'levantarse', ag: 'Mentor', hora: 630, linea: /levantarme/i, txt: ['Buenos días. ¿Te has levantado a tu hora? Si es que sí, márcalo, que cuenta.', '¿Qué tal el despertar? ¿A tu hora o se te ha ido la mañana? Dímelo sin rollos.'] },
  { id: 'piel-manana', ag: 'Skincare', hora: 720, linea: /^mañana:/i, txt: ['Oye, ¿te has echado la crema y el protector solar esta mañana?', '¿Rutina de piel de la mañana hecha? El protector no se salta, aunque esté nublado.'] },
  { id: 'entreno', ag: 'Entrenador', hora: 810, linea: /^entreno/i, txt: ['¿Qué tal el entreno de hoy ({entreno})? Si está hecho, márcalo; si no, dime cuándo lo haces.', 'Hoy toca {entreno}. ¿Hecho o pendiente? Si no puedes, 30 minutos igualmente.'] },
  { id: 'rana', ag: 'Mentor', hora: 1080, rana: true, txt: ['La rana sigue ahí sin hacer: «{rana}». ¿A qué hora te la comes hoy?', 'Oye, la rana de hoy («{rana}») sigue pendiente. Antes de cenar, ¿vale?'] },
  { id: 'fenix', ag: 'Mentor', hora: 1170, linea: /^formación|^formacion|^fénix|^fenix/i, txt: ['¿Has avanzado hoy en tu formación? Vas por el módulo {modulo}. Aunque sean 10 minutos, y luego me cuentas qué idea te llevas.', 'Hoy toca formación: módulo {modulo}. Dime una idea que te sirva.'] },
  { id: 'animo', ag: 'Coach', hora: 1260, animo: true, txt: ['¿Qué tal el día? Cuando puedas, pon en Hoy cómo estás. Aunque sea un número.', 'Ey, ¿cómo ha ido hoy? Cuéntame si te apetece, aquí o en «Cómo estoy».'] },
  { id: 'piel-noche', ag: 'Skincare', hora: 1335, linea: /^noche:/i, txt: ['Antes de dormir, la rutina de noche: {noche}. ¿Te pones ahora?', '¿Rutina de noche hecha? {noche}. Cinco minutos y listo.'] },
  { id: 'libro', ag: 'Mentor', hora: 1410, linea: /^leer/i, txt: ['Antes de dormir: tu rato de lectura, en papel y sin móvil. Mañana me cuentas qué idea te llevas.', 'Venga, tu ratito de libro. Apunta una idea en la nota del libro y a dormir.'] },
  { id: 'cierre', ag: 'Director', hora: 1365, cierre: true, txt: ['Venga, cierre del día: 2 minutos en Hoy (Cerrar el día) y a dormir.', 'Antes de acostarte, cierra el día en Hoy. Son 2 minutos y mañana lo agradeces.'] }
];
function tareaDe(d, re) { return (d.tareas || []).concat(d.rutinas || []).find((t) => re.test(t.texto || '')); }
async function archivarChat(app) {
  const ruta = RAIZ + '/6_EQUIPO/CHAT.md'; const f = archivo(app, ruta); if (!f) return;
  const t = await app.vault.cachedRead(f); const ls = t.split('\n'); if (ls.length < 120) return;
  const lim = new Date(); lim.setDate(lim.getDate() - 7); const corte = iso(lim);
  const cab = [], viejo = [], nuevo = []; let actual = null;
  ls.forEach((l) => { const m = l.match(/^- (\d{4}-\d{2}-\d{2}) /); if (m) { actual = (m[1] < corte && !/·\s*pendiente\s*$/.test(l)) ? viejo : nuevo; actual.push(l); } else if (actual && /^\s+- /.test(l)) actual.push(l); else if (!actual) cab.push(l); else nuevo.push(l); });
  if (!viejo.length) return;
  const dest = RAIZ + '/9_ARCHIVO/chat/CHAT_' + hoyISO().slice(0, 7) + '.md';
  if (!app.vault.getAbstractFileByPath(RAIZ + '/9_ARCHIVO/chat')) await app.vault.createFolder(RAIZ + '/9_ARCHIVO/chat');
  const fd = archivo(app, dest); if (fd) await app.vault.append(fd, '\n' + viejo.join('\n') + '\n'); else await app.vault.create(dest, '# Chat del equipo · archivo\n' + viejo.join('\n') + '\n');
  await app.vault.process(f, () => cab.concat(nuevo).join('\n').replace(/\s*$/, '') + '\n');
}
async function revisarPings(plugin) {
  const app = plugin.app; const hoy = hoyISO(); const d = await leerDia(app, hoy); if (!d) return;
  const ahora = new Date(); const min = ahora.getHours() * 60 + ahora.getMinutes();
  const texto = (await leer(app, RAIZ + '/6_EQUIPO/CHAT.md')) || '';
  const nuevos = [];
  for (const [i, p] of PINGS.entries()) {
    if (min < p.hora || min > p.hora + 120) continue;
    if (texto.includes('<!--p:' + hoy + ':' + p.id + '-->')) continue;
    let vars = {};
    if (p.linea) { const t = tareaDe(d, p.linea); if (!t || t.hecha) continue; vars = { entreno: limpiar(t.texto.replace(/^entreno:\s*/i, '')), noche: limpiar(t.texto.replace(/^noche:\s*/i, '')) }; }
    if (p.id === 'fenix') { try { const fx = await leerFenix(app); vars.modulo = fx ? fx.actual + (fx.titulo ? ' («' + limpiar(fx.titulo) + '»)' : '') : ''; } catch (e) { /* */ } }
    if (p.rana) { if (!d.rana || d.rana.hecha || !limpiar(d.rana.texto)) continue; vars.rana = limpiar(d.rana.texto); }
    if (p.animo && d.animo != null) continue;
    if (p.cierre && d.balance) continue;
    const base = p.txt[(Number(hoy.slice(8, 10)) + i) % p.txt.length];
    const msg = base.replace(/\{(\w+)\}/g, (m, k) => vars[k] || '');
    nuevos.push('- ' + hoy + ' ' + p2(ahora.getHours()) + ':' + p2(ahora.getMinutes()) + ' · ' + p.ag + ' → Yo: ' + msg + ' <!--p:' + hoy + ':' + p.id + '-->');
  }
  if (!nuevos.length) return;
  const ruta = RAIZ + '/6_EQUIPO/CHAT.md'; let f = archivo(app, ruta);
  if (!f) f = await app.vault.create(ruta, '# CHAT DEL EQUIPO\n*Escribe desde Obsidian (pantalla Equipo). Cada agente contesta debajo.*\n');
  await app.vault.process(f, (t0) => { const fil = nuevos.filter((l) => !t0.includes(l.match(/<!--p:[^>]+-->/)[0])); return fil.length ? t0.replace(/\s*$/, '') + '\n' + fil.join('\n') + '\n' : t0; });
}
// Mensajes de cada agente (los que inicia y sus respuestas), en orden; y cuántos has visto
function msgsAgente(hilos, k) { const out = []; hilos.filter((h) => h.para === k).forEach((h) => { if (h.inicio) out.push({ k, quien: h.quien, cuando: h.cuando, txt: h.txt }); h.resp.forEach((r) => out.push({ k, quien: r.quien, cuando: r.cuando, txt: r.txt })); }); return out; }
function vistosDe(visto, k, ms) { const v = visto[k]; if (typeof v === 'number') return v; if (typeof v === 'string') return ms.filter((m) => m.cuando <= v).length; return 0; }
function claveMsg(x) { return x.k + '|' + x.cuando + '|' + String(x.txt).slice(0, 40); }
async function avisosChat(plugin) {
  const app = plugin.app; const hilos = await leerChat(app); const aj = plugin.ajustes; const visto = aj.chatVisto || (aj.chatVisto = {});
  const ks = Array.from(new Set(hilos.map((h) => h.para)));
  const msgs = []; ks.forEach((k) => msgsAgente(hilos, k).forEach((m) => msgs.push(m)));
  const claves = msgs.map(claveMsg);
  if (!Array.isArray(aj.chatAvisados)) { aj.chatAvisados = claves.slice(-300); await plugin.guardar(); }
  else {
    const ya = new Set(aj.chatAvisados);
    const abierta = app.workspace.getLeavesOfType(V.casas).map((l) => l.view).find((v) => v && v.sel && document.body.contains(v.contentEl) && v.contentEl.offsetParent && !(v.contentEl.hasClass('orb-of-movil') && v.modoMovil !== 'chat'));
    const nuevos = msgs.filter((x) => !ya.has(claveMsg(x)));
    const avisar = nuevos.filter((x) => !(abierta && abierta.sel === x.k));
    if (avisar.length) {
      avisar.slice(-4).forEach((x) => { const n = new ob.Notice('', 9000); const el = n.noticeEl || n.messageEl; if (el) { el.empty(); el.addClass('orb-notice'); const cab = el.createDiv('orb-notice-cab'); const c = (OFICINA[x.k] || {}).color || '#8c8c8c'; const av = cab.createDiv('orb-notice-av'); av.style.background = c; av.setText(String(x.quien || '?').charAt(0)); cab.createEl('b', { text: x.quien }); el.createDiv({ cls: 'orb-notice-txt', text: x.txt.length > 120 ? x.txt.slice(0, 120) + '…' : x.txt }); el.createDiv({ cls: 'orb-notice-pie', text: 'Toca para contestar' }); el.addEventListener('click', () => { plugin.abrir(V.casas).then(() => { const vista = app.workspace.getLeavesOfType(V.casas).map((l) => l.view)[0]; if (vista && vista.elegir) { if (vista.contentEl.hasClass('orb-of-movil')) { vista.sel = x.k; vista.modoMovil = 'chat'; vista.pintar(); } else vista.elegir(x.k); } }); }); } });
      try { SON.ok(); } catch (e) { /* */ }
    }
    if (nuevos.length) { aj.chatAvisados = claves.slice(-300); await plugin.guardar(); }
  }
  // Globo en el botón Equipo con lo que tienes sin leer
  let total = 0; ks.forEach((k) => { const ms = msgsAgente(hilos, k); total += Math.max(0, ms.length - vistosDe(visto, k, ms)); });
  const nav = plugin._nav; if (nav && nav.rbtns && nav.rbtns[V.casas]) nav.rbtns[V.casas].removeAttribute('data-sinleer');
  [nav && nav.btns && nav.btns[V.casas], plugin._tab && plugin._tab.btns && plugin._tab.btns[V.casas]].forEach((b) => { if (!b) return; if (total) b.setAttr('data-sinleer', String(total)); else b.removeAttribute('data-sinleer'); });
  app.workspace.getLeavesOfType(V.casas).forEach((l) => { const v = l.view; if (v && v.refrescarTodas && !v.escribiendoAlgo()) v.refrescarTodas(hilos); });
}

class OficinaView extends VistaBase {
  get C() { return CONF_EQUIPO; }
  getViewType() { return this.C.tipo; } getDisplayText() { return this.C.nombre; } getIcon() { return this.C.icono; }
  claveHoy() { return hoyISO(); }
  async datos() {
    this.lista = this.C.lista(this.app).filter((a) => this.C.mapa[claveAg(a.nombre)]).sort((x, y) => (claveAg(x.nombre) === this.C.jefe ? -1 : claveAg(y.nombre) === this.C.jefe ? 1 : 0));
    this.hilos = await leerChat(this.app, this.C.chat);
    this.visto = this.plugin.ajustes[this.C.visto] || (this.plugin.ajustes[this.C.visto] = {});
    this.citas = {}; for (const a of this.lista) this.citas[claveAg(a.nombre)] = await proximaCita(this.app, a.nombre);
    this.escribiendo = this.escribiendo || {};
  }
  sinLeer(k) { const ms = msgsAgente(this.hilos, k); return Math.max(0, ms.length - vistosDe(this.visto, k, ms)); }
  estado(a) {
    const k = claveAg(a.nombre);
    if (this.escribiendo[k]) return { txt: 'Escribiendo…', cls: 'vivo' };
    if (k !== this.sel && this.sinLeer(k)) return { txt: 'Te ha contestado', cls: 'nuevo' };
    if (this.hilos.some((h) => h.para === k && h.pend && !h.resp.length)) return { txt: 'Tiene tu mensaje', cls: 'pend' };
    if (String(a.actualizado || '').startsWith(this.claveHoy())) return { txt: 'Activo hoy', cls: 'on' };
    return { txt: 'En espera', cls: '' };
  }
  marcarVisto(k) { const n = msgsAgente(this.hilos, k).length; if (n !== this.visto[k]) { this.visto[k] = n; this.plugin.guardar(); if (this.plugin.avisarChat) this.plugin.avisarChat(); } }
  escribiendoAlgo() { return Object.values(this.escribiendo || {}).some(Boolean); }
  async refrescarTodas(hilos) { if (!this.lista || !this.mesas) return; this.hilos = hilos || await leerChat(this.app, this.C.chat); Object.keys(this.mesas).forEach((k) => this.refrescarMesa(k)); }
  async pintar() {
    const raiz = this.contentEl; this.borradores = this.borradores || {};
    const ta0 = raiz.querySelector('.orb-of-input'); if (ta0 && this.sel) this.borradores[this.sel] = ta0.value;
    await this.datos();
    if (!this.sel || !this.lista.find((a) => claveAg(a.nombre) === this.sel)) this.sel = this.lista.length ? claveAg(this.lista[0].nombre) : null;
    if (this.sel && !(ob.Platform.isMobile && this.modoMovil !== 'chat')) this.marcarVisto(this.sel);
    const primera = !this._pintado; this._pintado = true;
    const scroll = raiz.scrollTop;
    raiz.empty(); raiz.addClass('orb-oficina'); raiz.toggleClass('orb-of-quieto', !primera);
    const movil = ob.Platform.isMobile || (raiz.clientWidth && raiz.clientWidth < 640);
    raiz.toggleClass('orb-of-movil', !!movil);
    if (movil) { if (this.modoMovil !== 'chat') { const ul = (this.lista.find((x) => claveAg(x.nombre) === this.sel) || {}); void ul; } this.pintarMovil(raiz); return; }
    const w = raiz.createDiv('orb-of');
    const cab = w.createDiv('orb-of-cab');
    cab.createDiv({ cls: 'orb-cab-sub', text: this.C.sub });
    cab.createEl('h1', { cls: 'orb-cab-titulo', text: this.C.titulo });
    cab.createDiv({ cls: 'orb-of-ayuda', text: iaDisponible() ? this.C.ayudaPC : this.C.ayudaMovil });
    if (this.C.semana) { const sem = cab.createDiv('orb-sem'); pintarSemana(this.app, sem); }
    if (this.C.carpetas && !ob.Platform.isMobile) { const fila = cab.createDiv('orb-of-carpetas'); this.C.carpetas.forEach(([txt, ic, rel]) => { const b = fila.createEl('button', { cls: 'orb-of-carpeta' }); const i = b.createSpan(); ob.setIcon(i, ic); b.createSpan({ text: txt }); b.addEventListener('click', () => abrirCarpeta(this.app, rel)); }); }
    const cuerpo = w.createDiv('orb-of-cuerpo');
    this.sala = cuerpo.createDiv('orb-of-sala'); this.mesas = {};
    this.lista.forEach((a, i) => this.pintarMesa(a, i));
    this.panel = cuerpo.createDiv('orb-of-panel');
    this.pintarPanel();
    raiz.scrollTop = scroll;
    this.dock();
  }
  // ---------- Móvil: lista de chats y chat a pantalla completa (como WhatsApp) ----------
  ultimo(k) { const hs = this.hilos.filter((h) => h.para === k); const h = hs[hs.length - 1]; if (!h) return null; if (h.resp.length) { const r = h.resp[h.resp.length - 1]; return { txt: r.txt, cuando: r.cuando, suyo: true }; } return { txt: h.txt, cuando: h.cuando, suyo: !!h.inicio }; }
  cuandoCorto(c) { if (!c) return ''; return c.slice(0, 10) === hoyISO() ? c.slice(11) : c.slice(8, 10) + '/' + c.slice(5, 7); }
  pintarMovil(raiz) {
    raiz.addClass('orb-of-movil');
    if (this.modoMovil !== 'chat') {
      const w = raiz.createDiv('orb-ofm-lista');
      const cab = w.createDiv('orb-ofm-cab'); cab.createDiv({ cls: 'orb-ofm-titulo', text: this.C.nombre }); cab.createDiv({ cls: 'orb-ofm-sub', text: 'Toca a alguien para hablar' });
      this.lista.forEach((a, i) => {
        const k = claveAg(a.nombre); const cfg = this.C.mapa[k]; const e = this.estado(a); const u = this.ultimo(k); const n = this.sinLeer(k);
        const f = w.createDiv('orb-ofm-fila' + (n ? ' nuevo' : '') + (e.cls ? ' est-' + e.cls : '')); f.style.setProperty('--c', cfg.color); f.style.animationDelay = (i * 40) + 'ms';
        const av = f.createDiv('orb-of-av'); av.createSpan({ text: a.nombre.charAt(0) });
        const mid = f.createDiv('orb-ofm-mid');
        const l1 = mid.createDiv('orb-ofm-l1'); l1.createSpan({ cls: 'orb-ofm-n', text: a.nombre }); if (k === this.C.jefe) l1.createSpan({ cls: 'orb-ofm-jefe', text: 'Jefe' });
        mid.createDiv({ cls: 'orb-ofm-prev', text: e.cls === 'vivo' ? 'Escribiendo…' : u ? (u.suyo ? '' : 'Tú: ') + u.txt : e.txt + ' · ' + (a.tarea || cfg.puesto) });
        const der = f.createDiv('orb-ofm-der'); der.createDiv({ cls: 'orb-ofm-hora', text: u ? this.cuandoCorto(u.cuando) : '' }); if (n) der.createDiv({ cls: 'orb-ofm-badge', text: String(n) });
        f.addEventListener('click', () => { try { SON.clic(); } catch (x) { /* */ } this.sel = k; this.modoMovil = 'chat'; this.marcarVisto(k); this.pintar(); });
      });
      this.dock(); return;
    }
    const a = this.lista.find((x) => claveAg(x.nombre) === this.sel); if (!a) { this.modoMovil = 'lista'; return this.pintar(); }
    const k = this.sel; const cfg = this.C.mapa[k]; const e = this.estado(a);
    const w = raiz.createDiv('orb-ofm-chat'); w.style.setProperty('--c', cfg.color);
    const bar = w.createDiv('orb-ofm-bar');
    const atras = bar.createEl('button', { cls: 'orb-ofm-atras', attr: { 'aria-label': 'Volver' } }); ob.setIcon(atras, 'chevron-left');
    atras.addEventListener('click', () => { const ta = this.contentEl.querySelector('.orb-of-input'); if (ta) this.borradores[k] = ta.value; this.modoMovil = 'lista'; this.pintar(); });
    const av = bar.createDiv('orb-of-av'); av.createSpan({ text: a.nombre.charAt(0) });
    const tt = bar.createDiv('orb-ofm-bar-tt'); tt.createDiv({ cls: 'orb-ofm-n', text: a.nombre }); tt.createDiv({ cls: 'orb-ofm-est', text: e.txt });
    const fi = bar.createEl('button', { cls: 'orb-ofm-atras', attr: { 'aria-label': 'Su ficha' } }); ob.setIcon(fi, 'file-text'); fi.addEventListener('click', () => this.app.workspace.openLinkText(a.archivo.path, '', false));
    if (a.tarea) w.createDiv({ cls: 'orb-ofm-tarea', text: a.tarea });
    const hilo = w.createDiv('orb-of-hilo orb-ofm-hilo'); this.hiloEl = hilo;
    const mios = this.hilos.filter((h) => h.para === k);
    if (!mios.length) hilo.createDiv({ cls: 'orb-of-vacio', text: 'Aún no habéis hablado. Escríbele lo que quieras.' });
    mios.slice(-30).forEach((h) => {
      if (h.inicio) { this.burbuja(hilo, 'el', h.txt, h.cuando); return; }
      this.burbuja(hilo, 'yo', h.txt, h.cuando);
      h.resp.forEach((r) => this.burbuja(hilo, 'el', r.txt, r.cuando));
      if (!h.resp.length && !this.escribiendo[k]) this.espera(hilo, a.nombre);
    });
    if (this.escribiendo[k]) this.puntos(hilo);
    const caja = w.createDiv('orb-of-caja orb-ofm-caja');
    const ta = caja.createEl('textarea', { cls: 'orb-of-input', attr: { rows: '1', placeholder: 'Mensaje a ' + a.nombre } });
    ta.value = this.borradores[k] || '';
    const crece = () => { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'; }; ta.addEventListener('input', crece); setTimeout(crece, 0);
    this.prepAdjuntos(caja, ta, k);
    const env = caja.createEl('button', { cls: 'orb-of-enviar', attr: { 'aria-label': 'Enviar' } }); ob.setIcon(env, 'send');
    env.addEventListener('click', () => this.enviar(a, ta).then(() => { ta.style.height = ''; }));
    setTimeout(() => { hilo.scrollTop = hilo.scrollHeight; }, 20);
    this.dock();
  }
  pintarMesa(a, i) {
    const k = claveAg(a.nombre); const cfg = this.C.mapa[k]; const jefe = k === this.C.jefe;
    const d = this.sala.createDiv('orb-of-mesa' + (jefe ? ' jefe' : '')); this.mesas[k] = d;
    d.style.setProperty('--c', cfg.color); d.style.animationDelay = (i * 70) + 'ms';
    d.addEventListener('click', () => this.elegir(k));
    this.rellenarMesa(a, d);
  }
  rellenarMesa(a, d) {
    const k = claveAg(a.nombre); const cfg = this.C.mapa[k]; const jefe = k === this.C.jefe; const e = this.estado(a);
    d.empty(); d.className = 'orb-of-mesa' + (jefe ? ' jefe' : '') + (k === this.sel ? ' sel' : '') + (e.cls ? ' est-' + e.cls : '');
    const top = d.createDiv('orb-of-mesa-top');
    const av = top.createDiv('orb-of-av'); av.createSpan({ text: a.nombre.charAt(0) });
    const n = k === this.sel ? 0 : this.sinLeer(k); if (n) top.createDiv({ cls: 'orb-of-badge', text: String(n) });
    const tt = top.createDiv('orb-of-mesa-tt'); tt.createDiv({ cls: 'orb-of-nombre', text: a.nombre }); tt.createDiv({ cls: 'orb-of-puesto', text: jefe ? 'Jefe del equipo · coordina a todos' : cfg.puesto });
    const ic = top.createDiv('orb-of-ic'); ob.setIcon(ic, jefe ? 'crown' : cfg.icono);
    const es = d.createDiv('orb-of-estado'); es.createSpan('orb-of-punto'); es.createSpan({ text: e.txt });
    d.createDiv({ cls: 'orb-of-tarea', text: a.tarea || 'Sin tarea ahora' });
    const c = this.citas[k]; if (c) { const ci = d.createDiv('orb-of-cita'); const ii = ci.createSpan('orb-of-cita-ic'); ob.setIcon(ii, 'calendar'); ci.createSpan({ text: c }); }
    d.createDiv('orb-of-tablero');
  }
  refrescarMesa(k) { const a = this.lista.find((x) => claveAg(x.nombre) === k); const d = this.mesas[k]; if (a && d) this.rellenarMesa(a, d); }
  elegir(k) {
    if (k === this.sel) return; try { SON.clic(); } catch (e) { /* */ }
    const ta = this.contentEl.querySelector('.orb-of-input'); if (ta && this.sel) this.borradores[this.sel] = ta.value;
    const antes = this.sel; this.sel = k; this.marcarVisto(k);
    this.refrescarMesa(antes); this.refrescarMesa(k);
    this.panel.empty(); this.panel.removeClass('entra'); void this.panel.offsetWidth; this.panel.addClass('entra');
    this.pintarPanel();
    if (ob.Platform.isMobile) this.panel.scrollIntoView({ behavior: 'smooth' });
  }
  hora(c) { return c.slice(8, 10) + '/' + c.slice(5, 7) + ' ' + c.slice(11); }
  burbuja(hilo, tipo, txt, cuando, quien) {
    const b = hilo.createDiv('orb-of-burbuja ' + tipo);
    if (quien) b.createDiv({ cls: 'orb-of-quien', text: quien });
    textoRico(this.app, b.createDiv('orb-of-txt'), txt); if (cuando) b.createDiv({ cls: 'orb-of-hora', text: this.hora(cuando) });
    return b;
  }
  pintarPanel() {
    const panel = this.panel; const a = this.lista.find((x) => claveAg(x.nombre) === this.sel);
    if (!a) { panel.createDiv({ cls: 'orb-tenue', text: 'No hay agentes en ' + this.C.carpeta + '.' }); return; }
    const k = this.sel; const cfg = this.C.mapa[k]; panel.style.setProperty('--c', cfg.color);
    const ph = panel.createDiv('orb-of-p-cab');
    const av = ph.createDiv('orb-of-av grande'); av.createSpan({ text: a.nombre.charAt(0) });
    const tt = ph.createDiv('orb-of-p-tt'); tt.createDiv({ cls: 'orb-of-p-n', text: a.nombre }); tt.createDiv({ cls: 'orb-of-p-r', text: (CASAS[k] || {}).lema || a.rol || cfg.puesto });
    const ficha = ph.createEl('button', { cls: 'orb-of-mini', attr: { 'aria-label': 'Abrir su ficha' } }); ob.setIcon(ficha, 'file-text'); ficha.addEventListener('click', () => this.app.workspace.openLinkText(a.archivo.path, '', 'tab'));
    const info = panel.createDiv('orb-of-p-info');
    const fila = (ico, etq, txt) => { if (!txt) return; const f = info.createDiv('orb-of-p-fila'); const i = f.createSpan('orb-of-p-ic'); ob.setIcon(i, ico); const t = f.createDiv(); t.createDiv({ cls: 'orb-etq', text: etq }); t.createDiv({ cls: 'orb-of-p-txt', text: txt }); };
    fila('briefcase', 'Lo que lleva', a.tarea);
    fila('calendar', 'Próxima cita', this.citas[k]);
    if (a.mensaje) { const q = panel.createDiv('orb-of-nota'); q.createDiv({ cls: 'orb-etq', text: 'Te dice' }); q.createDiv({ text: '«' + a.mensaje + '»' }); }
    const hilo = panel.createDiv('orb-of-hilo'); this.hiloEl = hilo;
    const mios = this.hilos.filter((h) => h.para === k);
    if (!mios.length) hilo.createDiv({ cls: 'orb-of-vacio', text: 'Aún no habéis hablado. Escríbele lo que quieras: una duda, cómo te ha ido o algo que quieras cambiar.' });
    mios.slice(-15).forEach((h) => {
      if (h.inicio) { this.burbuja(hilo, 'el', h.txt, h.cuando, h.quien); return; }
      this.burbuja(hilo, 'yo', h.txt, h.cuando);
      h.resp.forEach((r) => this.burbuja(hilo, 'el', r.txt, r.cuando, r.quien));
      if (!h.resp.length && !this.escribiendo[k]) this.espera(hilo, a.nombre);
    });
    if (this.escribiendo[k]) this.puntos(hilo);
    const caja = panel.createDiv('orb-of-caja');
    const ta = caja.createEl('textarea', { cls: 'orb-of-input', attr: { rows: '2', placeholder: 'Escribe a ' + a.nombre + '…' } });
    ta.value = this.borradores[k] || '';
    this.prepAdjuntos(caja, ta, k);
    const env = caja.createEl('button', { cls: 'orb-of-enviar', attr: { 'aria-label': 'Enviar' } }); ob.setIcon(env, 'send');
    env.addEventListener('click', () => this.enviar(a, ta));
    ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey && !ob.Platform.isMobile) { e.preventDefault(); this.enviar(a, ta); } });
    panel.createDiv({ cls: 'orb-of-pie', text: iaDisponible() ? 'Enter para enviar · Mayús+Enter para otra línea' : 'Sin IA conectada: conéctala en Ajustes › ÓRBITA para que te conteste' });
    setTimeout(() => { hilo.scrollTop = hilo.scrollHeight; }, 20);
  }
  espera(hilo, nombre) { const p = hilo.createDiv('orb-of-espera'); const i = p.createSpan(); ob.setIcon(i, 'clock'); p.createSpan({ text: nombre + ' te contesta ' + proximaRespuesta() }); return p; }
  puntos(hilo) { const b = hilo.createDiv('orb-of-burbuja el orb-of-puntos'); b.createSpan(); b.createSpan(); b.createSpan(); return b; }
  async escribirChat(fn) {
    const ruta = this.C.chat; let f = archivo(this.app, ruta);
    this._silencio = Date.now();
    if (!f) f = await this.app.vault.create(ruta, this.C.cabecera);
    await this.app.vault.process(f, fn); this._silencio = Date.now();
  }
  prepAdjuntos(caja, ta, k) {
    this.adj = this.adj || {}; const lista = this.adj[k] || (this.adj[k] = []);
    const chips = caja.createDiv('orb-of-chips'); caja.prepend(chips);
    const pinta = () => { chips.empty(); lista.forEach((ruta, i) => { const c = chips.createDiv('orb-of-chip'); const f = this.app.vault.getAbstractFileByPath(ruta);
      if (f && /^(png|jpe?g|gif|webp)$/i.test(f.extension)) c.createEl('img', { attr: { src: this.app.vault.getResourcePath(f) } }); else c.createSpan({ text: '📄 ' + ruta.split('/').pop() });
      const x = c.createEl('button', { cls: 'orb-of-chip-x', text: '×', attr: { 'aria-label': 'Quitar' } }); x.addEventListener('click', () => { lista.splice(i, 1); pinta(); }); }); chips.toggleClass('vacio', !lista.length); };
    const subir = async (files) => { for (const f of [...files]) { try { lista.push(await guardarAdjunto(this.app, this.C.adj, f)); } catch (e) { new ob.Notice('No he podido adjuntar ' + (f.name || 'el archivo')); } } pinta(); };
    const inp = caja.createEl('input', { attr: { type: 'file', multiple: '', accept: 'image/*,.pdf,.md,.txt,.csv' } }); inp.style.display = 'none'; inp.addEventListener('change', () => { subir(inp.files); inp.value = ''; });
    const clip = caja.createEl('button', { cls: 'orb-of-clip', attr: { 'aria-label': 'Adjuntar foto o archivo' } }); ob.setIcon(clip, 'paperclip'); clip.addEventListener('click', () => inp.click());
    caja.insertBefore(clip, ta);
    ta.addEventListener('paste', (e) => { const fs = e.clipboardData && e.clipboardData.files; if (fs && fs.length) { e.preventDefault(); subir(fs); } });
    caja.addEventListener('dragover', (e) => { e.preventDefault(); caja.addClass('drop'); }); caja.addEventListener('dragleave', () => caja.removeClass('drop'));
    caja.addEventListener('drop', (e) => { e.preventDefault(); caja.removeClass('drop'); if (e.dataTransfer && e.dataTransfer.files.length) subir(e.dataTransfer.files); });
    pinta();
  }
  async enviar(a, ta) {
    const k0 = claveAg(a.nombre); const adj = (this.adj && this.adj[k0]) || [];
    const v = ((ta.value || '').replace(/\s+/g, ' ').trim() + ' ' + adj.map((r) => '![[' + r + ']]').join(' ')).trim(); if (!v) return;
    if (adj.length) { adj.length = 0; const ch = ta.parentElement && ta.parentElement.querySelector('.orb-of-chips'); if (ch) { ch.empty(); ch.addClass('vacio'); } }
    const k = claveAg(a.nombre); const d = new Date(); const sello = iso(d) + ' ' + p2(d.getHours()) + ':' + p2(d.getMinutes());
    const linea = '- ' + sello + ' · Yo → ' + a.nombre + ': ' + v;
    ta.value = ''; this.borradores[k] = ''; try { SON.ok(); } catch (e) { /* */ }
    await this.escribirChat((t0) => t0.replace(/\s*$/, '') + '\n' + linea + ' · pendiente\n');
    const previos = this.hilos.filter((h) => h.para === k).slice(-5).map((h) => (h.inicio ? h.quien + ' (te escribió primero): ' : NOMBRE + ': ') + h.txt + h.resp.map((r) => '\n' + r.quien + ': ' + r.txt).join('')).join('\n');
    const h = { cuando: sello, para: k, txt: v, pend: true, resp: [] }; this.hilos.push(h);
    const hilo = this.hiloEl; const vacio = hilo && hilo.querySelector('.orb-of-vacio'); if (vacio) vacio.remove();
    if (hilo) this.burbuja(hilo, 'yo', v, sello);
    if (!iaDisponible()) { if (hilo) { this.espera(hilo, a.nombre); hilo.scrollTop = hilo.scrollHeight; } this.refrescarMesa(k); return; }
    this.escribiendo[k] = true; this.refrescarMesa(k);
    let pts = hilo ? this.puntos(hilo) : null; if (hilo) hilo.scrollTop = hilo.scrollHeight;
    try {
      const entrevista = !this.C.ctx && a.nombre === 'Director' && this.plugin.ajustes.entrevista;
      let r = (await respuestaEnVivo(this.app, a.nombre, previos, v, entrevista ? CTX_ENTREVISTA : this.C.ctx)).replace(/\s*\n+\s*/g, ' ').trim();
      if (/\[FIN_ENTREVISTA\]/.test(r)) { r = r.replace(/\s*\[FIN_ENTREVISTA\]\s*/g, ' ').trim(); this.plugin.ajustes.entrevista = false; }
      const d2 = new Date(); const s2 = iso(d2) + ' ' + p2(d2.getHours()) + ':' + p2(d2.getMinutes());
      await this.escribirChat((t0) => t0.replace(linea + ' · pendiente', linea + '\n  - ' + s2 + ' · ' + a.nombre + ': ' + r));
      h.pend = false; h.resp.push({ cuando: s2, quien: a.nombre, txt: r });
      if (this.sel === k) this.visto[k] = msgsAgente(this.hilos, k).length; this.plugin.guardar();
      if (pts) pts.remove();
      const hiloAct = this.sel === k ? this.hiloEl : null;
      if (hiloAct && hiloAct.isConnected) { this.burbuja(hiloAct, 'el', r, s2, a.nombre); hiloAct.scrollTop = hiloAct.scrollHeight; try { SON.ok(); } catch (e) { /* */ } }
    } catch (e) {
      if (pts) pts.remove();
      const hiloAct = this.sel === k ? this.hiloEl : null;
      const motivo = motivoError(e); console.warn('ÓRBITA chat', e);
      if (hiloAct && hiloAct.isConnected) { const p = hiloAct.createDiv('orb-of-espera error'); const ic = p.createSpan(); ob.setIcon(ic, 'alert-circle'); p.createSpan({ text: motivo }); hiloAct.scrollTop = hiloAct.scrollHeight; }
      new ob.Notice(motivo, 9000);
    } finally { this.escribiendo[k] = false; this.refrescarMesa(k); }
  }
}


/* Configuración de cada «oficina»: el Equipo y el Estudio de contenido (chats separados) */
const CONF_EQUIPO = { tipo: V.casas, nombre: 'Equipo', icono: 'users', sub: 'Tu equipo', titulo: 'La oficina', chat: RAIZ + '/6_EQUIPO/CHAT.md', jefe: 'director', mapa: OFICINA, visto: 'chatVisto', carpeta: '6_EQUIPO',
  lista: (app) => agentes(app),
  ayudaPC: 'Toca una mesa y escríbele: te contesta al momento. Si no sabes a quién, escribe al Director.',
  ayudaMovil: 'Toca una mesa y escríbele. Para que conteste al momento, conecta tu IA en Ajustes › ÓRBITA. Si no sabes a quién, escribe al Director.',
  cabecera: '# CHAT DEL EQUIPO\n*Escribe desde Obsidian (pantalla Equipo). Cada agente contesta debajo.*\n', ctx: null, adj: RAIZ + '/6_EQUIPO/adjuntos' };
const ESTUDIO_MAPA = {
  estratega: { color: PALETA.dinero, puesto: 'Dirección del estudio', icono: 'clapperboard' },
  guionista: { color: PALETA.dia, puesto: 'Mesa de guiones', icono: 'pen-line' },
  editor: { color: PALETA.estudios, puesto: 'Sala de edición', icono: 'scissors' },
  crecimiento: { color: PALETA.cuerpo, puesto: 'Mesa de métricas', icono: 'trending-up' }
};
const CONF_ESTUDIO = { tipo: V.estudioEquipo, nombre: 'Contenido', icono: 'clapperboard', sub: 'Estudio de contenido', titulo: 'El estudio', chat: RAIZ + '/1_DINERO/contenido/CHAT.md', jefe: 'estratega', mapa: ESTUDIO_MAPA, visto: 'chatVistoEstudio', carpeta: '1_DINERO/contenido/equipo',
  lista: (app) => agentesEstudio(app),
  ayudaPC: 'Tu equipo de contenido, aparte del Equipo. Toca una mesa y escríbele: en el PC te contesta al momento. Si no sabes a quién, escribe al Estratega.',
  ayudaMovil: 'Tu equipo de contenido, aparte del Equipo. Desde el móvil puedes leer el chat; para que te contesten al momento, escríbeles desde el PC.',
  semana: true,
  carpetas: [['Subir clips', 'upload', 'Videos/brutos'], ['Vídeos listos', 'film', 'Videos/editados'], ['Publicados', 'check-circle', 'Videos/publicados']],
  cabecera: '# CHAT DEL ESTUDIO DE CONTENIDO\n*Escribe desde Obsidian (pantalla Contenido). Cada agente contesta debajo. Separado del chat del Equipo.*\n',
  ctx: { grupo: 'del estudio de contenido de ÓRBITA (TikTok y vídeos)', pantalla: 'Contenido', ficha: 'ORBITA/1_DINERO/contenido/equipo/ (el Estratega en ORBITA/6_EQUIPO/)', area: 'ORBITA/1_DINERO/contenido/CALENDARIO_CONTENIDO.md (plan de la semana) y ORBITA/1_DINERO/contenido/TABLERO.md (notas entre el estudio)', reglas: 'Eres parte de un estudio coordinado: Estratega decide qué vídeo toca y cuándo (según CALENDARIO_CONTENIDO y METRICAS), Guionista escribe guiones en contenido/guiones/, Editor edita los clips de Videos/brutos y Crecimiento mide y aconseja publicar. Habla SOLO de lo tuyo y solo de contenido (nada de dinero, gym ni otros temas); si es cosa de otro, dile a quién preguntar. Sé concreto: nada de teorías. Termina SIEMPRE con una frase que empiece por «Tu siguiente paso:» con UNA acción clara y cuándo hacerla. Si cambias el plan o el estado de un vídeo, puedes actualizar CALENDARIO_CONTENIDO.md y dejar una nota en TABLERO.md (son los únicos archivos del estudio que puedes editar, además de la carpeta de adjuntos y contenido/guiones/).', adj: RAIZ + '/1_DINERO/contenido/adjuntos' }, adj: RAIZ + '/1_DINERO/contenido/adjuntos' };
async function guardarAdjunto(app, carpeta, file) {
  if (!app.vault.getAbstractFileByPath(carpeta)) { try { await app.vault.createFolder(carpeta); } catch (e) { /* ya existe */ } }
  const d = new Date(); const ext = ((file.name || '').match(/\.([a-z0-9]{1,5})$/i) || [null, (file.type || 'image/png').split('/')[1] || 'png'])[1].toLowerCase().replace('jpeg', 'jpg');
  const base = sinAcentos(String(file.name || 'adjunto').replace(/\.[^.]+$/, '')).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30) || 'adjunto';
  let ruta = carpeta + '/' + iso(d) + '_' + p2(d.getHours()) + p2(d.getMinutes()) + p2(d.getSeconds()) + '_' + base + '.' + ext; let n = 1;
  while (app.vault.getAbstractFileByPath(ruta)) ruta = ruta.replace(/(\.[a-z0-9]+)$/, '-' + (n++) + '$1');
  await app.vault.createBinary(ruta, await file.arrayBuffer()); return ruta;
}
const RE_RICO = /(!?\[\[[^\]]+\]\]|https?:\/\/[^\s<>»"]+)/g;
function textoRico(app, el, txt) {
  String(txt).split(RE_RICO).forEach((part) => {
    if (!part) return;
    const emb = part.match(/^!?\[\[([^\]|]+)(?:\|[^\]]*)?\]\]$/);
    if (emb) {
      const dest = app.metadataCache.getFirstLinkpathDest(emb[1], '') || app.vault.getAbstractFileByPath(emb[1]);
      if (dest && /^(png|jpe?g|gif|webp|bmp|svg)$/i.test(dest.extension || '')) { const img = el.createEl('img', { cls: 'orb-of-img', attr: { src: app.vault.getResourcePath(dest), alt: dest.name } }); img.addEventListener('click', () => app.workspace.getLeaf(true).openFile(dest)); return; }
      const ch = el.createEl('a', { cls: 'orb-of-arch', text: '📄 ' + (dest ? dest.basename : emb[1].split('/').pop()) }); ch.addEventListener('click', (e) => { e.preventDefault(); app.workspace.openLinkText(emb[1], '', true); }); return;
    }
    if (/^https?:\/\//.test(part)) { const url = part.replace(/[.,;:)]+$/, ''); const a = el.createEl('a', { cls: 'orb-of-link', text: url.replace(/^https?:\/\/(www\.)?/, '').slice(0, 48) + (url.length > 56 ? '…' : ''), attr: { href: url, target: '_blank', rel: 'noopener' } }); if (url.length < part.length) el.appendText(part.slice(url.length)); void a; return; }
    el.appendText(part);
  });
}
const RUTA_CAL_CONT = RAIZ + '/1_DINERO/contenido/CALENDARIO_CONTENIDO.md';
async function leerSemanaContenido(app) {
  const t = (await leer(app, RUTA_CAL_CONT)) || ''; const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const secs = []; let cur = null;
  t.split('\n').forEach((l) => { const m = l.match(/^##\s+Semana del (\d{4}-\d{2}-\d{2})/); if (m) { cur = { lunes: m[1], filas: [] }; secs.push(cur); return; }
    if (cur && /^\|/.test(l) && !/^\|\s*-/.test(l) && !/^\|\s*Día\s*\|/i.test(l)) { const c = l.split('|').slice(1, -1).map((x) => x.trim()); if (c.length >= 6) cur.filas.push({ dia: c[0], hora: c[1], video: c[2], tipo: c[3], guion: c[4], estado: c[5].toLowerCase() }); } });
  const ref = new Date(hoy); const dw = (ref.getDay() + 6) % 7; ref.setDate(ref.getDate() - dw); const lunes = iso(ref);
  const prox = new Date(ref); prox.setDate(prox.getDate() + 7);
  return secs.find((x) => x.lunes === lunes) || secs.find((x) => x.lunes === iso(prox)) || secs[secs.length - 1] || null;
}
async function pintarSemana(app, el) {
  const s = await leerSemanaContenido(app); el.empty(); if (!s) { el.createDiv({ cls: 'orb-sem-vacio', text: 'Sin plan esta semana: el Estratega lo prepara el sábado por la noche.' }); return; }
  const top = el.createDiv('orb-sem-top'); top.createSpan({ cls: 'orb-sem-t', text: 'Semana del ' + Number(s.lunes.slice(8, 10)) + '/' + Number(s.lunes.slice(5, 7)) });
  const abrir = top.createEl('a', { cls: 'orb-sem-abrir', text: 'Abrir calendario' }); abrir.addEventListener('click', () => app.workspace.openLinkText(RUTA_CAL_CONT, '', false));
  const hoyN = new Date().getDate(); const fila = el.createDiv('orb-sem-fila'); let sig = null;
  s.filas.forEach((f) => { const c = fila.createDiv('orb-sem-c est-' + sinAcentos(f.estado).replace(/[^a-z]/g, ''));
    const n = Number((f.dia.match(/\d+/) || [0])[0]); if (n === hoyN) c.addClass('hoy');
    c.createDiv({ cls: 'orb-sem-d', text: f.dia + (f.hora && f.hora !== '—' ? ' · ' + f.hora : '') }); c.createDiv({ cls: 'orb-sem-v', text: f.video });
    c.createDiv({ cls: 'orb-sem-e', text: f.estado || '—' });
    const g = (f.guion.match(/\[\[([^\]|]+)/) || [])[1]; if (g) { c.addClass('con-guion'); c.addEventListener('click', () => app.workspace.openLinkText(g, RUTA_CAL_CONT, true)); }
    if (!sig && !/publicado|hecho/.test(f.estado)) sig = f; });
  if (sig) el.createDiv({ cls: 'orb-sem-sig', text: 'Ahora toca: ' + sig.video + ' (' + sig.dia + ', ' + (sig.estado || 'pendiente') + ')' });
}
// Avisos del estudio (sin IA): grabar, subir clips y publicar
const PINGS_ESTUDIO = [
  { id: 'grabar', ag: 'Guionista', dias: [0], hora: 630, txt: 'Hoy grabas los vídeos de la semana a las 11:00. Los guiones están arriba, en el calendario de Contenido. Léelos en voz alta una vez y a grabar.' },
  { id: 'subir', ag: 'Editor', dias: [0], hora: 780, txt: '¿Ya has grabado? Mete los clips en una carpeta por vídeo con el botón «Subir clips» (por ejemplo 2026-11-23_dia-1) y luego dime en Claude «Editor, edita los vídeos de hoy».' },
  { id: 'publicar', ag: 'Crecimiento', dias: [1, 3, 5], hora: 1250, txt: 'A las 21:00 toca publicar «{video}». Está en «Vídeos listos». Súbelo, pon el texto del guion y luego muévelo a Publicados. Contesta tú a los primeros comentarios.' }
];
async function revisarPingsEstudio(plugin) {
  const app = plugin.app; const d = new Date(); const min = d.getHours() * 60 + d.getMinutes(); const hoy = iso(d);
  const ruta = CONF_ESTUDIO.chat; const texto = (await leer(app, ruta)) || ''; const nuevos = [];
  let sem = null; try { sem = await leerSemanaContenido(app); } catch (e) { /* */ }
  for (const p of PINGS_ESTUDIO) {
    if (!p.dias.includes(d.getDay()) || min < p.hora || min > p.hora + 120) continue;
    if (texto.includes('<!--pe:' + hoy + ':' + p.id + '-->')) continue;
    let video = '';
    if (p.id === 'publicar') { const f = sem && sem.filas.find((x) => Number((x.dia.match(/\d+/) || [0])[0]) === d.getDate()); if (!f || /publicado/.test(f.estado)) continue; video = f.video; }
    nuevos.push('- ' + hoy + ' ' + p2(d.getHours()) + ':' + p2(d.getMinutes()) + ' · ' + p.ag + ' → Yo: ' + p.txt.replace('{video}', video) + ' <!--pe:' + hoy + ':' + p.id + '-->');
  }
  if (!nuevos.length) return;
  let f = archivo(app, ruta); if (!f) f = await app.vault.create(ruta, CONF_ESTUDIO.cabecera);
  await app.vault.process(f, (t0) => t0.replace(/\s*$/, '') + '\n' + nuevos.join('\n') + '\n');
  try { new ob.Notice(nuevos.length === 1 ? 'Estudio: tienes un mensaje nuevo' : 'Estudio: ' + nuevos.length + ' mensajes nuevos', 8000); } catch (e) { /* */ }
}
function abrirCarpeta(app, rel) {
  try { const path = require('path'); const fs = require('fs'); const abs = path.join(app.vault.adapter.getBasePath(), rel); if (!fs.existsSync(abs)) fs.mkdirSync(abs, { recursive: true }); require('electron').shell.openPath(abs); }
  catch (e) { new ob.Notice('No he podido abrir la carpeta ' + rel); }
}
// El Editor avisa en el chat del estudio cuando subes clips o cuando un vídeo queda listo
async function avisoEditor(app, txt, id) {
  const ruta = CONF_ESTUDIO.chat; let f = archivo(app, ruta); const d = new Date(); const hoy = iso(d);
  const linea = '- ' + hoy + ' ' + p2(d.getHours()) + ':' + p2(d.getMinutes()) + ' · Editor → Yo: ' + txt + ' <!--e:' + id + '-->';
  if (!f) f = await app.vault.create(ruta, CONF_ESTUDIO.cabecera);
  await app.vault.process(f, (t0) => t0.includes('<!--e:' + id + '-->') ? t0 : t0.replace(/\s*$/, '') + '\n' + linea + '\n');
  try { new ob.Notice('Editor: ' + txt, 8000); } catch (e) { /* */ }
  app.workspace.getLeavesOfType(V.estudioEquipo).forEach((l) => { const v = l.view; if (v && v.refrescarTodas && !v.escribiendoAlgo()) v.refrescarTodas(); });
}
function vigilarVideos(plugin) {
  const app = plugin.app; let listo = false; setTimeout(() => { listo = true; }, 8000);
  plugin.registerEvent(app.vault.on('create', (f) => {
    if (!listo || !f || !f.path) return;
    let m = f.path.match(/^Videos\/brutos\/([^/]+)\/[^/]+\.(mp4|mov|m4v)$/i);
    if (m) { clearTimeout(plugin._tVid); plugin._tVid = setTimeout(() => avisoEditor(app, 'He visto clips nuevos en «' + m[1] + '». Cuando termines de subirlos, en Claude dime «Editor, edita el vídeo ' + m[1] + '» y me pongo.', 'b:' + m[1]), 20000); return; }
    m = f.path.match(/^Videos\/editados\/([^/]+)\.mp4$/i);
    if (m && !/^demo|^prueba/i.test(m[1])) avisoEditor(app, 'Vídeo listo: «' + m[1] + '». Está en Vídeos listos con su portada. Míralo y dime qué cambio; si te gusta, súbelo y muévelo a Publicados.', 'l:' + m[1]);
  }));
}
class EstudioOficinaView extends OficinaView { get C() { return CONF_ESTUDIO; } }
class CasasView extends VistaBase {
  getViewType() { return V.casas; } getDisplayText() { return 'Equipo'; } getIcon() { return 'users'; }
  async onOpen() {
    this.contentEl.addClass('orb-vista', 'orb-mapa', 'orb-casas');
    const raiz = this.contentEl; raiz.empty();
    const estudio = this.getViewType() === V.estudioEquipo; const fuente = estudio ? agentesEstudio : (a) => agentes(a); this.fuente = fuente;
    this.barrio = new Barrio(raiz, this.app, (a) => this.ficha(a), fuente);
    const cab = raiz.createDiv('orb-casas-cab');
    cab.createDiv({ cls: 'orb-cab-sub', text: estudio ? 'Estudio de contenido' : 'Tu equipo' });
    cab.createEl('h1', { cls: 'orb-cab-titulo', text: estudio ? 'Equipo de contenido' : 'Equipo' });
    cab.createDiv({ cls: 'orb-casas-ayuda', text: estudio ? 'Los que te ayudan con TikTok e Instagram. Toca una casa.' : 'Toca una casa para ver qué está haciendo cada agente.' });
    this.panel = raiz.createDiv('orb-casas-panel');
    this.dock();
    const lista = fuente(this.app); const primero = lista.find((a) => a.estado === 'trabajando') || lista[0];
    if (primero) this.ficha(primero);
    const re = () => { clearTimeout(this._t); this._t = setTimeout(() => { this.barrio.datos(); if (this.actual) { const a = this.fuente(this.app).find((x) => x.archivo.path === this.actual.archivo.path); if (a) this.ficha(a); } }, 400); };
    this.registerEvent(this.app.metadataCache.on('changed', re));
  }
  ficha(a) {
    this.actual = a; const p = this.panel; p.empty();
    const c = CASAS[sinAcentos(a.nombre)] || {};
    const top = p.createDiv('orb-casas-top');
    top.createDiv({ cls: 'orb-avatar grande' + (a.estado === 'trabajando' ? ' on' : ''), text: a.nombre.charAt(0) });
    const t = top.createDiv(); t.createDiv({ cls: 'orb-casas-n', text: a.nombre }); t.createDiv({ cls: 'orb-casas-r', text: c.lema || a.rol });
    p.createDiv({ cls: 'orb-etq', text: a.estado === 'trabajando' ? 'Trabajando en' : 'Lo siguiente' });
    p.createDiv({ cls: 'orb-casas-tarea', text: a.tarea || 'Sin tarea' });
    if (a.mensaje) { p.createDiv({ cls: 'orb-etq', text: 'Te dice' }); p.createDiv({ cls: 'orb-casas-msg', text: '«' + a.mensaje + '»' }); }
    if (a.actualizado) p.createDiv({ cls: 'orb-casas-fecha', text: 'Actualizado ' + a.actualizado });
    const b = p.createEl('button', { cls: 'orb-btn principal', text: 'Abrir su ficha' }); b.addEventListener('click', () => this.app.workspace.openLinkText(a.archivo.path, '', false));
    this.chat(p, a).catch((e) => console.error('ÓRBITA chat', e));
  }
  // Chat con cada agente desde Obsidian: los mensajes van a 6_EQUIPO/CHAT.md y el equipo contesta a las 09:30 y a las 23:15
  async chat(p, a) {
    const RUTA = RAIZ + '/6_EQUIPO/CHAT.md'; const n = a.nombre;
    const caja = p.createDiv('orb-seccion'); caja.createDiv({ cls: 'orb-etq', text: 'Hablar con ' + n });
    const texto = (await leer(this.app, RUTA)) || '';
    const ls = texto.split('\n'); const hilos = [];
    ls.forEach((l) => { const m = l.match(/^- (\S+ \S+) · Yo → ([^:]+): (.*)$/); if (m) { hilos.push({ cuando: m[1], para: m[2].trim(), txt: m[3], resp: [] }); return; }
      const r = l.match(/^\s+- (\S+ \S+) · ([^:]+): (.*)$/); if (r && hilos.length) hilos[hilos.length - 1].resp.push({ cuando: r[1], quien: r[2].trim(), txt: r[3] }); });
    const mios = hilos.filter((h) => sinAcentos(h.para).toLowerCase() === sinAcentos(n).toLowerCase()).slice(-5);
    if (!mios.length) caja.createDiv({ cls: 'orb-tenue', text: 'Todavía no habéis hablado aquí.' });
    mios.forEach((h) => {
      const yo = caja.createDiv('orb-casas-msg'); yo.setText('Tú (' + h.cuando.slice(5) + '): ' + h.txt.replace(/\s*·\s*pendiente\s*$/, ''));
      if (h.resp.length) h.resp.forEach((r) => caja.createDiv({ cls: 'orb-casas-r', text: r.quien + ' (' + r.cuando.slice(5) + '): ' + r.txt }));
      else caja.createDiv({ cls: 'orb-casas-fecha', text: 'Te contesta a las 09:30 o a las 23:15' });
    });
    if (!ob.Platform.isMobile) { const vivo = caja.createEl('button', { cls: 'orb-btn', text: 'Hablar ahora con ' + n + ' (en directo)' }); vivo.addEventListener('click', () => abrirClaudian(this.app, n)); }
    const ta = caja.createEl('textarea', { cls: 'orb-ci-txt', attr: { rows: '3', placeholder: 'Escribe a ' + n + '… (te contesta a las 09:30 o a las 23:15)' } });
    const b = caja.createEl('button', { cls: 'orb-btn principal', text: 'Enviar a ' + n });
    b.addEventListener('click', async () => {
      const v = (ta.value || '').replace(/\s+/g, ' ').trim(); if (!v) return;
      const d = new Date(); const sello = iso(d) + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
      const linea = '- ' + sello + ' · Yo → ' + n + ': ' + v + ' · pendiente';
      let f = archivo(this.app, RUTA);
      if (!f) f = await this.app.vault.create(RUTA, '# CHAT DEL EQUIPO\n*Escribe desde Obsidian (pantalla Equipo). Cada agente contesta debajo a las 09:30 y a las 23:15.*\n');
      await this.app.vault.process(f, (t0) => t0.replace(/\s*$/, '') + '\n' + linea + '\n');
      ta.value = ''; this.ficha(a);
    });
  }
  async pintar() {}
  async onClose() { if (this.barrio) this.barrio.destruir(); }
}

function globoSVG(el) {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = el.createSvg('svg', { cls: 'orb-globo', attr: { viewBox: '0 0 100 100' } });
  svg.createSvg('circle', { cls: 'orb-g-borde', attr: { cx: 50, cy: 50, r: 44 } });
  [-30, -15, 0, 15, 30].forEach((y) => { const yy = y * 1.25; const rx = Math.sqrt(44 * 44 - yy * yy); svg.createSvg('ellipse', { cls: 'orb-g-par', attr: { cx: 50, cy: 50 + yy, rx, ry: rx * 0.16 } }); });
  for (let i = 0; i < 6; i++) { const e = svg.createSvg('ellipse', { cls: 'orb-g-mer', attr: { cx: 50, cy: 50, rx: 44, ry: 44 } }); e.style.animationDelay = (-i * 1.5) + 's'; }
  void NS; return svg;
}

/* =========================================================
   AJUSTES
   ========================================================= */
/* =========================================================
   ESTUDIO DE CONTENIDO · TikTok e Instagram
   ========================================================= */
const ESTADOS_VIDEO = [['idea', 'Ideas', 'lightbulb'], ['guion', 'Guion', 'pen-line'], ['grabado', 'Grabado', 'video'], ['editado', 'Editado', 'scissors'], ['publicado', 'Publicado', 'send']];
const TIPOS_VIDEO = [['Aprendo', 'Lo que aprendo en 40 s', 'Una idea de tu curso o libro y cómo la aplicas tú.', 'flame'], ['Día N', 'Día N', 'Clips cortos de cómo cumples lo que te prometes.', 'calendar-check'], ['Para ti', 'Para ti que…', '20-30 s a cámara: no estás solo.', 'heart']];
async function leerIdeas(app) {
  const t = await leer(app, NOTAS.ideas); if (t == null) return null;
  return filasTabla(t).map((c) => ({ n: Number(c[0]), idea: c[1] || '', tipo: c[2] || '', estado: (sinAcentos(c[3] || 'idea').toLowerCase().trim() || 'idea'), guion: (c[4] || '').trim(), publicado: (c[5] || '').trim() })).filter((x) => x.n);
}
async function cambiarIdea(app, n, cambios) {
  const f = archivo(app, NOTAS.ideas); if (!f) return;
  await app.vault.process(f, (t) => t.split('\n').map((l) => { const m = l.match(/^\|\s*(\d+)\s*\|/); if (!m || Number(m[1]) !== n) return l; const c = l.split('|'); while (c.length < 8) c.splice(c.length - 1, 0, ' '); if (cambios.estado != null) c[4] = ' ' + cambios.estado + ' '; if (cambios.publicado != null) c[6] = ' ' + cambios.publicado + ' '; return c.join('|'); }).join('\n'));
}
async function nuevaIdea(app, texto, tipo) {
  const f = archivo(app, NOTAS.ideas); if (!f) return; const v = String(texto).replace(/\|/g, '/').trim(); if (!v) return;
  await app.vault.process(f, (t) => { const ns = (t.match(/^\|\s*(\d+)\s*\|/gm) || []).map((x) => Number(x.replace(/\D/g, ''))); const n = (ns.length ? Math.max(...ns) : 0) + 1; return t.replace(/\s*$/, '') + '\n| ' + n + ' | ' + v + ' | ' + (tipo || '—') + ' | idea | | |\n'; });
}
function agentesEstudio(app) { return agentes(app).filter((a) => sinAcentos(a.nombre).toLowerCase() === 'estratega').concat(agentes(app, CARPETAS.estudioEquipo)); }

// ---------- GIMNASIO: el plan del Entrenador, ejercicio a ejercicio ----------
const DIAS_GYM = [['lunes', 'Lun', 1], ['martes', 'Mar', 2], ['miercoles', 'Mié', 3], ['jueves', 'Jue', 4], ['viernes', 'Vie', 5]];
async function leerGimnasio(app) {
  const t = await leer(app, NOTAS.entreno) || ''; const g = await leer(app, NOTAS.ejercicios) || '';
  const dias = {}; let cur = null; const cal = [];
  t.split('\n').forEach((l) => {
    const h = l.match(/^##\s+(Lunes|Martes|Mi[ée]rcoles|Jueves|Viernes)\s*·\s*(.+)$/i);
    if (h) { cur = sinAcentos(h[1]).toLowerCase(); dias[cur] = { titulo: h[2].trim(), ejercicios: [], notas: [] }; return; }
    if (/^##\s/.test(l)) { cur = /calentamiento/i.test(l) ? 'cal' : null; return; }
    if (cur === 'cal') { const b = l.match(/^\s*-\s+(.+)$/); if (b) cal.push(limpiar(b[1])); return; }
    if (!cur) return;
    const c = l.trim().match(/^\|(.+)\|$/);
    if (c && !/^\|\s*-/.test(l.trim())) { const k = c[1].split('|').map((x) => limpiar(x.trim())); if (k[0] && !/^ejercicio$/i.test(k[0])) dias[cur].ejercicios.push({ nombre: k[0], series: k[1] || '' }); return; }
    const b = l.match(/^\s*-\s+(.+)$/); if (b) dias[cur].notas.push(limpiar(b[1]));
  });
  const tec = {}; let n = null;
  g.split('\n').forEach((l) => {
    const h = l.match(/^###\s+(.+)$/); if (h) { n = h[1].trim(); tec[n] = {}; return; }
    const m = n && l.match(/^\s*-\s*(Cómo|Como|Ojo|Si no está|Si no esta):\s*(.+)$/i);
    if (m) tec[n][sinAcentos(m[1]).toLowerCase().startsWith('si no') ? 'alt' : sinAcentos(m[1]).toLowerCase().startsWith('ojo') ? 'ojo' : 'como'] = m[2].trim();
  });
  const reglas = (t.match(/\*\*Cómo:\*\*\s*(.+)/) || [])[1] || '';
  return { dias, cal, tec, reglas };
}
function tecnicaDe(tec, nombre) {
  if (tec[nombre]) return tec[nombre];
  const k = sinAcentos(nombre).toLowerCase(); const e = Object.keys(tec).find((x) => sinAcentos(x).toLowerCase().split(/[ (/]/)[0] === k.split(/[ (/]/)[0] && k.includes(sinAcentos(x).toLowerCase().split(' ')[1] || ''));
  return e ? tec[e] : null;
}
async function apuntarRegistroGym(app, fecha, dia, filas) {
  const f = archivo(app, NOTAS.entreno); if (!f || !filas.length) return;
  await app.vault.process(f, (t) => {
    if (!/## Registro de pesos/.test(t)) t = t.replace(/\s*$/, '') + '\n\n## Registro de pesos\n*Lo apunta la pantalla Gimnasio al pulsar «Entreno hecho».*\n| Fecha | Día | Ejercicio | Peso (kg) | Series hechas |\n|---|---|---|---|---|\n';
    const nuevas = filas.map((r) => `| ${fecha} | ${dia} | ${r[0]} | ${r[1] || '—'} | ${r[2]} |`).join('\n');
    return t.replace(/(\| Fecha \| Día \| Ejercicio \| Peso \(kg\) \| Series hechas \|\n\|---\|---\|---\|---\|---\|\n)/, '$1' + nuevas + '\n');
  });
}
class GimnasioView extends VistaBase {
  getViewType() { return V.gimnasio; } getDisplayText() { return 'Gimnasio'; } getIcon() { return 'dumbbell'; }
  async onClose() { clearInterval(this._crono); return super.onClose(); }
  async pintar() {
    const { dias, cal, tec } = await leerGimnasio(this.app); const hoy = hoyISO(); const wd = deISO(hoy).getDay();
    if (!this.dia) this.dia = (DIAS_GYM.find((d) => d[2] === wd) || DIAS_GYM[0])[0];
    const aj = this.plugin.ajustes; aj.gym = aj.gym || {}; aj.gym.hist = aj.gym.hist || {};
    const clave = hoy + '|' + this.dia; const est = aj.gym[clave] = aj.gym[clave] || { ej: {}, cal: [] };
    const raiz = this.contentEl; const scroll = raiz.scrollTop; raiz.empty();
    const w = raiz.createDiv('orb-hoja orb-gym'); this.entrada(w);
    this.cabecera(w, 'Gimnasio', 'Fase 1 · arranque · 10:00');
    // pestañas de días
    const tabs = w.createDiv('orb-gym-dias');
    DIAS_GYM.forEach(([k, n, d]) => {
      const info = dias[k]; const b = tabs.createEl('button', { cls: 'orb-gym-dia' + (this.dia === k ? ' activo' : '') + (d === wd ? ' hoy' : '') });
      b.createDiv({ cls: 'orb-gym-dia-n', text: n + (d === wd ? ' · hoy' : '') }); b.createDiv({ cls: 'orb-gym-dia-t', text: info ? info.titulo.replace(/\s*\(.*\)/, '') : '' });
      b.addEventListener('click', () => { if (this.dia === k) return; this.dia = k; try { SON.desliza(); } catch (e) {} this.pintar(); });
    });
    const D = dias[this.dia];
    if (!D) { w.createDiv({ cls: 'orb-vacio-t', text: 'No encuentro este día en ENTRENAMIENTO.' }); return; }
    // cabecera del día + reglas + cronómetro
    const top = w.createDiv('orb-card orb-gym-top'); top.style.setProperty('--c', COLOR.rutinas);
    top.createDiv({ cls: 'orb-gym-k', text: capital(this.dia.replace('miercoles', 'miércoles')) });
    top.createEl('h2', { cls: 'orb-gym-tit', text: D.titulo });
    const reg = top.createDiv('orb-gym-reglas');
    [['repeat', '3 series', 'por ejercicio'], ['battery-medium', 'Deja 2-3 reps', 'en la recámara: cansado, con buena técnica'], ['timer', '1:30 – 2:00', 'de descanso entre series'], ['trending-up', 'Cada semana', 'un poco más de peso o una rep más']].forEach(([ic, a, b]) => {
      const r = reg.createDiv('orb-gym-regla'); const i = r.createDiv('orb-gym-regla-i'); ob.setIcon(i, ic); const tx = r.createDiv(); tx.createDiv({ cls: 'orb-gym-regla-a', text: a }); tx.createDiv({ cls: 'orb-gym-regla-b', text: b }); });
    const crono = top.createDiv('orb-gym-crono'); const cr = crono.createDiv({ cls: 'orb-gym-crono-t', text: '1:30' }); const cb = crono.createEl('button', { cls: 'orb-btn principal', text: 'Descanso 1:30' });
    const arrancar = (seg) => { clearInterval(this._crono); let r = seg; crono.addClass('activo'); const f = () => { cr.setText(Math.floor(r / 60) + ':' + p2(r % 60)); if (r <= 0) { clearInterval(this._crono); crono.removeClass('activo'); cr.setText('¡Serie!'); try { SON.ok(); } catch (e) {} } r--; }; f(); this._crono = setInterval(f, 1000); };
    cb.addEventListener('click', () => arrancar(90));
    // calentamiento
    if (D.ejercicios.length) {
      const cc = w.createDiv('orb-card orb-gym-cal'); cc.style.setProperty('--c', COLOR.rana);
      cc.createDiv({ cls: 'orb-gym-k', text: 'Calentamiento · 8 min' });
      const ul = cc.createDiv('orb-gym-cal-l');
      cal.forEach((t, i) => { const x = ul.createDiv('orb-gym-cal-i' + (est.cal[i] ? ' hecho' : '')); const ck = x.createDiv('orb-gym-ck'); ob.setIcon(ck, 'check'); x.createSpan({ text: t });
        x.addEventListener('click', async () => { est.cal[i] = !est.cal[i]; await this.plugin.guardar(); try { est.cal[i] ? SON.clic() : SON.quitar(); } catch (e) {} this.pintar(); }); });
    }
    // ejercicios
    const lista = w.createDiv('orb-gym-lista');
    if (!D.ejercicios.length) {
      const c = lista.createDiv('orb-card orb-gym-desc'); c.style.setProperty('--c', COLOR.agenda); c.createDiv({ cls: 'orb-gym-k', text: 'Hoy toca' });
      D.notas.forEach((t) => c.createDiv({ cls: 'orb-gym-desc-i', text: '• ' + t }));
    }
    D.ejercicios.forEach((e, i) => {
      const nS = parseInt(e.series) || 3; const st = est.ej[e.nombre] = est.ej[e.nombre] || { s: [], kg: '' };
      const hechas = st.s.filter(Boolean).length; const t = tecnicaDe(tec, e.nombre);
      const c = lista.createDiv('orb-card orb-gym-ej' + (hechas >= nS ? ' completo' : '')); c.style.setProperty('--c', hechas >= nS ? COLOR.rutinas : COLOR.top);
      const cab = c.createDiv('orb-gym-ej-cab');
      cab.createDiv({ cls: 'orb-gym-num', text: String(i + 1) });
      const tx = cab.createDiv('orb-gym-ej-tx'); tx.createDiv({ cls: 'orb-gym-ej-n', text: e.nombre }); tx.createDiv({ cls: 'orb-gym-ej-s', text: e.series.replace('×', '×').replace(/x/i, '×') + ' reps' });
      const hist = aj.gym.hist[e.nombre] || []; const ult = hist[hist.length - 1];
      if (ult) tx.createDiv({ cls: 'orb-gym-ult', text: 'Última vez: ' + ult.kg + ' kg (' + ult.f.slice(8) + '/' + ult.f.slice(5, 7) + ')' });
      const pts = hist.slice(-8).map((h) => parseFloat(String(h.kg).replace(',', '.'))).filter((v) => !isNaN(v));
      if (pts.length >= 2) {
        const W = 120, H = 28, mn = Math.min(...pts), mx = Math.max(...pts), rg = (mx - mn) || 1;
        const xy = pts.map((v, k) => [4 + k * (W - 8) / (pts.length - 1), H - 4 - (v - mn) / rg * (H - 8)]);
        const tend = tx.createDiv('orb-gym-tend'); const svg = tend.createSvg('svg', { attr: { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H } });
        svg.createSvg('polyline', { cls: 'orb-gym-tend-l', attr: { points: xy.map((p) => p.join(',')).join(' ') } });
        const lp = xy[xy.length - 1]; svg.createSvg('circle', { cls: 'orb-gym-tend-p', attr: { cx: lp[0], cy: lp[1], r: 3 } });
        const dif = pts[pts.length - 1] - pts[0]; tend.createSpan({ cls: 'orb-gym-tend-t' + (dif > 0 ? ' sube' : ''), text: (dif > 0 ? '+' : '') + String(Math.round(dif * 10) / 10).replace('.', ',') + ' kg en ' + pts.length + ' entrenos' });
      }
      const der = cab.createDiv('orb-gym-ej-der');
      const kg = der.createEl('input', { cls: 'orb-gym-kg', attr: { type: 'text', inputmode: 'decimal', placeholder: ult ? String(ult.kg) : '—' } }); kg.value = st.kg || '';
      kg.addEventListener('keydown', (ev) => ev.stopPropagation());
      kg.addEventListener('change', async () => { st.kg = kg.value.replace(',', '.').trim(); await this.plugin.guardar(); });
      der.createSpan({ cls: 'orb-gym-kg-u', text: 'kg' });
      const ser = c.createDiv('orb-gym-series');
      for (let k = 0; k < nS; k++) {
        const b = ser.createEl('button', { cls: 'orb-gym-serie' + (st.s[k] ? ' on' : ''), text: st.s[k] ? '✓' : 'Serie ' + (k + 1) });
        b.addEventListener('click', async () => { st.s[k] = !st.s[k]; await this.plugin.guardar(); if (st.s[k]) { try { SON.ok(); } catch (er) {} if (st.s.filter(Boolean).length < nS) arrancar(90); else estallido(b, false); } else { try { SON.quitar(); } catch (er) {} } this.pintar(); });
      }
      if (t) {
        const det = c.createEl('details', { cls: 'orb-gym-tec' }); if (i === 0 && !hechas) det.setAttr('open', '');
        det.createEl('summary', { text: 'Cómo se hace' });
        if (t.como) { const ol = det.createEl('ol'); t.como.split(/\s*→\s*/).forEach((p) => ol.createEl('li', { text: capital(p) })); }
        if (t.ojo) { const o = det.createDiv('orb-gym-ojo'); const ii = o.createSpan(); ob.setIcon(ii, 'alert-triangle'); o.createSpan({ text: capital(t.ojo) }); }
        if (t.alt) { const o = det.createDiv('orb-gym-alt'); const ii = o.createSpan(); ob.setIcon(ii, 'shuffle'); o.createSpan({ text: 'Si está ocupado: ' + t.alt }); }
      }
    });
    // terminar
    if (D.ejercicios.length) {
      const total = D.ejercicios.reduce((n, e) => n + (parseInt(e.series) || 3), 0), hechas = D.ejercicios.reduce((n, e) => n + ((est.ej[e.nombre] || { s: [] }).s.filter(Boolean).length), 0);
      const fin = w.createDiv('orb-card orb-gym-fin'); fin.style.setProperty('--c', COLOR.fenix);
      const bar = fin.createDiv('orb-gym-barra'); bar.createDiv('orb-gym-barra-in').style.width = Math.round(100 * hechas / total) + '%';
      fin.createDiv({ cls: 'orb-gym-fin-t', text: hechas + ' de ' + total + ' series' + (est.hecho ? ' · entreno guardado ✓' : '') });
      const bt = fin.createEl('button', { cls: 'orb-btn principal', text: est.hecho ? 'Guardado' : 'Entreno hecho' });
      bt.addEventListener('click', async () => {
        const filas = D.ejercicios.map((e) => { const s = est.ej[e.nombre] || { s: [], kg: '' }; return [e.nombre, s.kg, s.s.filter(Boolean).length + '/' + (parseInt(e.series) || 3)]; }).filter((r) => r[2][0] !== '0' || r[1]);
        D.ejercicios.forEach((e) => { const s = est.ej[e.nombre]; if (s && s.kg) { const h = aj.gym.hist[e.nombre] = aj.gym.hist[e.nombre] || []; if (!h.length || h[h.length - 1].f !== hoy) h.push({ f: hoy, kg: s.kg }); if (h.length > 12) h.shift(); } });
        const ya = est.hecho; est.hecho = true;
        Object.keys(aj.gym).filter((k) => k !== 'hist' && k.slice(0, 10) < iso(sumarDias(deISO(hoy), -21))).forEach((k) => delete aj.gym[k]);
        await this.plugin.guardar(); this._silencio = Date.now();
        if (!ya) { await apuntarRegistroGym(this.app, hoy, D.titulo.replace(/\s*\(.*\)/, ''), filas); await marcarLineaDia(this.app, hoy, 'entreno', true); await marcarLineaDia(this.app, hoy, 'gimnasio', true); }
        try { SON.rana(); } catch (er) {} estallido(bt, true); setTimeout(() => this.pintar(), 600);
      });
      fin.createDiv({ cls: 'orb-gym-pie', text: 'Al pulsarlo se apuntan tus pesos en ENTRENAMIENTO y se marcan el entreno y la rana en tu nota del día. Si algo duele (no confundir con cansancio), para y cambia el ejercicio.' });
    }
    const pie = w.createDiv('orb-voz-pie'); const ab = pie.createEl('button', { cls: 'orb-btn', text: 'Abrir el plan' }); ab.addEventListener('click', () => this.app.workspace.openLinkText(NOTAS.entreno, '', 'tab'));
    const ab2 = pie.createEl('button', { cls: 'orb-btn', text: 'Guía de ejercicios' }); ab2.addEventListener('click', () => this.app.workspace.openLinkText(NOTAS.ejercicios, '', 'tab'));
    raiz.scrollTop = scroll;
  }
}

// ---------- VOZ: hablar claro y con calma ----------
const VOZ_PASOS = [
  ['wind', 'Respirar', '1 min', 'Aire por la nariz en 3 s, suéltalo por la boca en 6 s. Tres veces.'],
  ['pen-line', 'Bolígrafo', '3 min', 'Lee un párrafo con un boli entre los dientes, exagerando cada sílaba. Luego sin él.'],
  ['repeat', 'Trabalenguas', '3 min', 'Dos o tres, despacio. Que se oiga cada sílaba.'],
  ['book-open', 'Leer con pausas', '3 min', 'En voz alta, parando en cada coma y en cada punto.'],
];
const VOZ_GRABAR = [['wind', 'Respira 3 veces'], ['smile', '«Estoy con ganas»'], ['mic', 'Cuéntalo sin grabar'], ['user', 'Háblale a un amigo'], ['copy', '2-3 tomas por frase']];
async function leerVoz(app) {
  const t = await leer(app, NOTAS.voz) || '';
  const tr = (seccionMarkdown(t, 'Trabalenguas', 2) || '').split('\n').map((l) => l.replace(/^\s*-\s*/, '').trim()).filter((l) => l && !l.startsWith('#'));
  const med = filasTabla(t).filter((c) => /^\d{4}-\d{2}-\d{2}$/.test(c[0])).map((c) => ({ fecha: c[0], sil: parseFloat(String(c[1]).replace(',', '.')), pau: parseFloat(String(c[2]).replace(',', '.')), nota: c[4] || '' })).filter((x) => !isNaN(x.sil)).sort((a, b) => a.fecha < b.fecha ? -1 : 1);
  return { trabalenguas: tr, medidas: med };
}
async function marcarLineaDia(app, fecha, empieza, hecho) {
  const f = archivo(app, rutaDia(fecha)); if (!f) return;
  await app.vault.process(f, (t) => t.split('\n').map((l) => l.replace(/^(\s*- )\[( |x|X)\]( .*)$/, (m, a, b, c) => sinAcentos(c).trim().toLowerCase().startsWith(empieza) ? a + (hecho ? '[x]' : '[ ]') + c : m)).join('\n'));
}

// ---------- CALMA: ansiedad y estrés (con el Coach) ----------
const CALMA_RESP = {
  suspiro: { n: 'Suspiro', d: 'Dos tomas de aire por la nariz y una salida muy larga por la boca. Lo más rápido para bajar revoluciones.', fases: [['Coge aire', 2, 0.85], ['Un poco más', 1, 1], ['Suéltalo despacio', 6, 0]] },
  r46: { n: '4 · 6', d: 'Entra en 4, sale en 6. Sacar el aire más largo que meterlo calma el cuerpo.', fases: [['Coge aire', 4, 1], ['Suéltalo', 6, 0]] },
  caja: { n: 'Caja', d: '4 dentro, 4 aguanta, 4 fuera, 4 aguanta. Para centrar la cabeza.', fases: [['Coge aire', 4, 1], ['Aguanta', 4, 1], ['Suéltalo', 4, 0], ['Aguanta', 4, 0]] }
};
const CALMA_SENTIDOS = [['5', 'cosas que VES', 'eye'], ['4', 'cosas que puedes TOCAR', 'hand'], ['3', 'cosas que OYES', 'ear'], ['2', 'cosas que HUELES', 'flower-2'], ['1', 'cosa que SABOREAS (o un trago de agua)', 'cup-soda']];
async function leerCalma(app) {
  return filasTabla(await leer(app, NOTAS.calma), 'Registro').filter((c) => /^\d{4}-\d{2}-\d{2}$/.test(c[0])).map((c) => ({ fecha: c[0], hora: c[1], antes: +c[2], despues: +c[3], que: c[4] || '' }));
}
async function apuntarCalma(app, fila) {
  let f = archivo(app, NOTAS.calma);
  const cab = '| Fecha | Hora | Antes | Después | Qué hice | Me preocupa | Paso pequeño |\n|---|---|---|---|---|---|---|';
  if (!f) { if (!app.vault.getAbstractFileByPath(CARPETAS.mente)) await app.vault.createFolder(CARPETAS.mente); f = await app.vault.create(NOTAS.calma, '---\norbita: mente\nresponsable: Coach\n---\n# CALMA\n*Lo que haces en la pantalla Calma se apunta aquí. El Coach lo lee para ver qué te funciona.*\n\n## Registro\n' + cab + '\n'); }
  const lim = (x) => String(x || '').replace(/\|/g, '/').replace(/\n+/g, ' ').trim();
  const linea = '| ' + [fila.fecha, fila.hora, fila.antes, fila.despues, fila.que, fila.preocupa, fila.paso].map(lim).join(' | ') + ' |';
  await app.vault.process(f, (t) => {
    if (!/## Registro/.test(t)) t = t.trimEnd() + '\n\n## Registro\n' + cab + '\n';
    const ls = t.split('\n'); let i = ls.findIndex((l) => /^## Registro/.test(l)); let k = i + 1;
    while (k < ls.length && (/^\|/.test(ls[k]) || !ls[k].trim()) && !/^## /.test(ls[k])) { if (/^\|/.test(ls[k])) i = k; k++; }
    ls.splice(i + 1, 0, linea); return ls.join('\n');
  });
}
class CalmaView extends VistaBase {
  getViewType() { return V.calma; } getDisplayText() { return 'Calma'; } getIcon() { return 'wind'; }
  async onClose() { cancelAnimationFrame(this._raf); return super.onClose(); }
  async pintar() {
    cancelAnimationFrame(this._raf); const reg = await leerCalma(this.app);
    this.s = this.s || { antes: null, despues: null, hecho: [], preocupa: '', depende: '', paso: '', modo: 'suspiro', sentido: 0 };
    const st = this.s;
    const raiz = this.contentEl; const scroll = raiz.scrollTop; raiz.empty();
    const w = raiz.createDiv('orb-hoja orb-calma'); this.entrada(w);
    this.cabecera(w, 'Calma', 'Para cuando sube la ansiedad o el estrés');
    const intro = w.createDiv('orb-calma-intro'); intro.setText('No tienes que hacerlo todo. Elige una cosa, la que te pida el cuerpo. Lo que sientes es una alarma del cuerpo: es desagradable, pero baja.');
    const escala = (padre, clave, txt) => {
      const f = padre.createDiv('orb-calma-esc'); f.createDiv({ cls: 'orb-calma-esc-t', text: txt });
      const pts = f.createDiv('orb-calma-pts');
      for (let i = 0; i <= 10; i++) { const b = pts.createEl('button', { cls: 'orb-calma-p' + (st[clave] === i ? ' on' : ''), text: String(i) });
        b.addEventListener('click', () => { st[clave] = i; pts.querySelectorAll('.orb-calma-p').forEach((x, j) => x.toggleClass('on', j === i)); try { SON.nivel(Math.max(1, i)); } catch (e) { /* */ } }); }
      const l = f.createDiv('orb-calma-esc-l'); l.createSpan({ text: '0 · tranquilo' }); l.createSpan({ text: '10 · a tope' });
    };
    // 1 · Antes
    const a = w.createDiv('orb-card orb-calma-c'); a.style.setProperty('--c', PALETA.mente);
    a.createDiv({ cls: 'orb-calma-k', text: '1 · Ahora mismo' }); escala(a, 'antes', '¿Cuánto agobio sientes ahora?');
    // 2 · Respirar
    const r = w.createDiv('orb-card orb-calma-c orb-calma-resp'); r.style.setProperty('--c', PALETA.calma);
    r.createDiv({ cls: 'orb-calma-k', text: '2 · Respira conmigo' });
    const modos = r.createDiv('orb-calma-modos');
    Object.entries(CALMA_RESP).forEach(([k, m]) => { const b = modos.createEl('button', { cls: 'orb-calma-modo' + (st.modo === k ? ' on' : ''), text: m.n }); b.addEventListener('click', () => { cancelAnimationFrame(this._raf); st.modo = k; this.pintar(); }); });
    const M = CALMA_RESP[st.modo]; r.createDiv({ cls: 'orb-calma-sub', text: M.d });
    const esc = r.createDiv('orb-calma-escena'); const halo = esc.createDiv('orb-calma-halo'); const bola = esc.createDiv('orb-calma-bola'); const bt = bola.createDiv({ cls: 'orb-calma-bola-t', text: 'Empezar' });
    const info = r.createDiv({ cls: 'orb-calma-sub c', text: 'Toca la bola · 1 minuto' });
    const durs = r.createDiv('orb-calma-durs'); let mins = this._mins || 1;
    [1, 3, 5].forEach((mn) => { const b = durs.createEl('button', { cls: 'orb-calma-dur' + (mn === mins ? ' on' : ''), text: mn + ' min' }); b.addEventListener('click', () => { this._mins = mn; mins = mn; durs.querySelectorAll('.orb-calma-dur').forEach((x) => x.toggleClass('on', x === b)); info.setText('Toca la bola · ' + mn + (mn === 1 ? ' minuto' : ' minutos')); }); });
    const ciclo = M.fases.reduce((x, f) => x + f[1], 0);
    bola.addEventListener('click', () => {
      cancelAnimationFrame(this._raf); const t0 = performance.now(); const total = mins * 60; let fase = -1;
      const tick = (now) => {
        const t = (now - t0) / 1000;
        if (t >= total) { bola.style.transform = 'scale(.7)'; halo.style.opacity = '0'; bt.setText('Bien hecho'); info.setText('Fíjate en cómo está ahora tu cuerpo'); if (!st.hecho.includes('respirar')) st.hecho.push('respirar'); try { SON.completo(); } catch (e) { /* */ } return; }
        let u = t % ciclo, i = 0, ini = 1; const prev = (j) => (j === 0 ? M.fases[M.fases.length - 1][2] : M.fases[j - 1][2]);
        while (u >= M.fases[i][1]) { u -= M.fases[i][1]; i++; }
        const [nom, dur, fin] = M.fases[i]; ini = prev(i); const k = u / dur; const e = 0.5 - 0.5 * Math.cos(Math.PI * k);
        const v = ini + (fin - ini) * e; bola.style.transform = 'scale(' + (0.55 + 0.45 * v).toFixed(3) + ')'; halo.style.opacity = (0.15 + 0.5 * v).toFixed(2);
        if (i !== fase) { fase = i; bt.setText(nom); try { SON.clic(); } catch (e2) { /* */ } }
        info.setText(Math.ceil(dur - u) + ' s · quedan ' + Math.ceil((total - t) / 60) + ' min');
        this._raf = requestAnimationFrame(tick);
      };
      this._raf = requestAnimationFrame(tick);
    });
    // 3 · 5-4-3-2-1
    const g = w.createDiv('orb-card orb-calma-c'); g.style.setProperty('--c', PALETA.cuerpo);
    g.createDiv({ cls: 'orb-calma-k', text: '3 · Vuelve al momento (5-4-3-2-1)' });
    g.createDiv({ cls: 'orb-calma-sub', text: 'Cuando la cabeza va a mil. Míralo y nómbralo en voz baja.' });
    const pasos = g.createDiv('orb-calma-sent');
    CALMA_SENTIDOS.forEach(([n, t, ic], i) => { const p = pasos.createDiv('orb-calma-sp' + (i < st.sentido ? ' ya' : i === st.sentido ? ' on' : '')); const c = p.createDiv('orb-calma-sp-n'); if (i < st.sentido) ob.setIcon(c, 'check'); else c.setText(n); const x = p.createDiv('orb-calma-sp-t'); const ii = x.createSpan('orb-calma-sp-i'); ob.setIcon(ii, ic); x.createSpan({ text: t }); });
    const sb = g.createDiv('orb-calma-bs');
    const sig = sb.createEl('button', { cls: 'orb-btn principal', text: st.sentido >= 5 ? 'Otra vez' : st.sentido === 4 ? 'Hecho' : 'Siguiente' });
    sig.addEventListener('click', () => { if (st.sentido >= 5) st.sentido = 0; else { st.sentido++; try { SON.ok(); } catch (e) { /* */ } if (st.sentido === 5 && !st.hecho.includes('5-4-3-2-1')) st.hecho.push('5-4-3-2-1'); } this.pintar(); });
    // 4 · Ordenar la cabeza
    const o = w.createDiv('orb-card orb-calma-c'); o.style.setProperty('--c', PALETA.dia);
    o.createDiv({ cls: 'orb-calma-k', text: '4 · Saca lo que te da vueltas' });
    const campo = (clave, txt, ph) => { const f = o.createDiv('orb-calma-campo'); f.createDiv({ cls: 'orb-calma-campo-t', text: txt }); const ta = f.createEl('textarea', { cls: 'orb-calma-in', attr: { rows: '2', placeholder: ph } }); ta.value = st[clave]; ta.addEventListener('input', () => { st[clave] = ta.value; }); };
    campo('preocupa', '¿Qué me preocupa?', 'Escríbelo tal cual, sin ordenar');
    campo('depende', '¿Qué parte depende de mí?', 'Lo que no depende de ti, por ahora, se suelta');
    campo('paso', 'Un paso pequeño para hoy', 'Algo de 5 minutos o menos');
    // 5 · Después + guardar
    const d = w.createDiv('orb-card orb-calma-c'); d.style.setProperty('--c', PALETA.estudios);
    d.createDiv({ cls: 'orb-calma-k', text: '5 · ¿Y ahora?' }); escala(d, 'despues', '¿Cuánto agobio sientes ahora?');
    const gb = d.createDiv('orb-calma-bs'); const gu = gb.createEl('button', { cls: 'orb-btn principal', text: 'Guardar' });
    gu.addEventListener('click', async () => {
      if (st.antes == null && st.despues == null && !st.preocupa.trim()) { aviso('Marca al menos cómo estás o escribe algo.'); return; }
      const ahora = new Date(); if (st.preocupa.trim() && !st.hecho.includes('escribir')) st.hecho.push('escribir');
      await apuntarCalma(this.app, { fecha: hoyISO(), hora: p2(ahora.getHours()) + ':' + p2(ahora.getMinutes()), antes: st.antes ?? '', despues: st.despues ?? '', que: st.hecho.join(', ') || '—', preocupa: st.preocupa, paso: [st.depende, st.paso].filter((x) => x.trim()).join(' → ') });
      const baja = st.antes != null && st.despues != null && st.despues < st.antes;
      try { SON.completo(); } catch (e) { /* */ } aviso(baja ? 'Guardado. Has bajado de ' + st.antes + ' a ' + st.despues + '. Eso lo has hecho tú.' : 'Guardado. Bien por pararte a cuidarte.', 6000);
      this.s = null; this.pintar();
    });
    // 6 · Si es demasiado
    const sos = w.createDiv('orb-calma-sos');
    sos.createDiv({ cls: 'orb-calma-sos-t', text: 'Si es demasiado' });
    sos.createDiv({ cls: 'orb-calma-sos-x', text: 'Habla con alguien ahora: tu hermana, un amigo, o escribe al Coach. Si dura días, tu psicólogo te puede ayudar mucho. Y si en algún momento piensas en hacerte daño, llama al 024 (gratis, 24 horas) o al 112.' });
    // 7 · Registro
    if (reg.length) {
      const h = w.createDiv('orb-card orb-calma-c'); h.style.setProperty('--c', '#c9c9c9');
      h.createDiv({ cls: 'orb-calma-k', text: 'Lo que te ha funcionado' });
      reg.slice(-6).reverse().forEach((x) => { const f = h.createDiv('orb-calma-reg'); f.createSpan({ cls: 'orb-calma-reg-f', text: deISO(x.fecha).getDate() + '/' + (deISO(x.fecha).getMonth() + 1) + ' ' + x.hora });
        f.createSpan({ cls: 'orb-calma-reg-v', text: (isNaN(x.antes) ? '—' : x.antes) + ' → ' + (isNaN(x.despues) ? '—' : x.despues) }); f.createSpan({ cls: 'orb-calma-reg-q', text: x.que }); });
    }
    raiz.scrollTop = scroll;
  }
}
class VozView extends VistaBase {
  getViewType() { return V.voz; } getDisplayText() { return 'Voz'; } getIcon() { return 'mic'; }
  async onClose() { cancelAnimationFrame(this._resp); clearInterval(this._lect); return super.onClose(); }
  async pintar() {
    const { trabalenguas, medidas } = await leerVoz(this.app); const hoy = hoyISO();
    const aj = this.plugin.ajustes; aj.voz = aj.voz || {}; const hecho = aj.voz[hoy] || [false, false, false, false];
    const raiz = this.contentEl; const scroll = raiz.scrollTop; raiz.empty();
    const w = raiz.createDiv('orb-hoja orb-voz'); this.entrada(w);
    this.cabecera(w, 'Voz', 'Hablar claro y con calma');
    // 1. La regla de oro
    const oro = w.createDiv('orb-card orb-voz-oro'); oro.style.setProperty('--c', COLOR.fenix);
    oro.createDiv({ cls: 'orb-voz-k', text: 'Si solo recuerdas una cosa' });
    const fr = oro.createDiv('orb-voz-frase'); fr.createSpan({ text: 'Pausa en cada ' }); fr.createSpan({ cls: 'orb-voz-acento', text: 'punto' }); fr.createSpan({ text: ' y en cada ' }); fr.createSpan({ cls: 'orb-voz-acento', text: 'coma.' });
    oro.createDiv({ cls: 'orb-voz-sub', text: 'No intentes «hablar lento»: haz paradas. En los vídeos el Editor las recorta.' });
    // 2. Hoy: 10 minutos (4 pasos)
    const n = hecho.filter(Boolean).length;
    const hoyC = w.createDiv('orb-card orb-voz-hoy'); hoyC.style.setProperty('--c', COLOR.rutinas);
    const hc = hoyC.createDiv('orb-voz-cab'); hc.createSpan({ cls: 'orb-voz-k', text: 'Hoy · 10 minutos' });
    const prog = hc.createDiv('orb-voz-prog'); for (let i = 0; i < 4; i++) prog.createSpan('orb-voz-prog-p' + (hecho[i] ? ' on' : '')); hc.createSpan({ cls: 'orb-voz-cuenta', text: n === 4 ? 'Hecho ✓' : n + ' de 4' });
    const grid = hoyC.createDiv('orb-voz-pasos');
    VOZ_PASOS.forEach(([ic, tit, t, txt], i) => {
      const c = grid.createDiv('orb-voz-paso' + (hecho[i] ? ' hecho' : ''));
      const top = c.createDiv('orb-voz-paso-top'); const ico = top.createDiv('orb-voz-ico'); ob.setIcon(ico, hecho[i] ? 'check' : ic); top.createSpan({ cls: 'orb-voz-min', text: t });
      c.createDiv({ cls: 'orb-voz-paso-t', text: (i + 1) + '. ' + tit }); c.createDiv({ cls: 'orb-voz-paso-x', text: txt });
      c.addEventListener('click', async () => {
        hecho[i] = !hecho[i]; aj.voz[hoy] = hecho; Object.keys(aj.voz).filter((k) => k < iso(sumarDias(deISO(hoy), -30))).forEach((k) => delete aj.voz[k]);
        await this.plugin.guardar(); if (hecho[i]) { SON.ok(); estallido(c, hecho.every(Boolean)); } else SON.quitar();
        this._silencio = Date.now(); await marcarLineaDia(this.app, hoy, 'voz 10 min', hecho.every(Boolean)); this.pintar();
      });
    });
    // 3. Respiración guiada + trabalenguas con ritmo
    const fila = w.createDiv('orb-voz-fila');
    const rc = fila.createDiv('orb-card orb-voz-resp'); rc.style.setProperty('--c', COLOR.agenda);
    rc.createDiv({ cls: 'orb-voz-k', text: 'Respira conmigo' });
    const esc = rc.createDiv('orb-voz-esc'); const bola = esc.createDiv('orb-voz-bola'); const txtB = bola.createDiv({ cls: 'orb-voz-bola-t', text: 'Empezar' }); const cnt = rc.createDiv({ cls: 'orb-voz-sub c', text: '3 s dentro · 6 s fuera · 3 veces' });
    const respirar = () => {
      cancelAnimationFrame(this._resp); const t0 = performance.now(); let fase = '';
      const tick = (ahora) => {
        const t = (ahora - t0) / 1000, ciclo = Math.floor(t / 9), u = t % 9;
        if (ciclo >= 3) { bola.style.transform = 'scale(1)'; txtB.setText('Listo'); cnt.setText('Así, antes de hablar o de grabar'); SON.ok(); return; }
        const dentro = u < 3; const k = dentro ? u / 3 : 1 - (u - 3) / 6;
        bola.style.transform = 'scale(' + (0.62 + 0.38 * (0.5 - 0.5 * Math.cos(Math.PI * k))).toFixed(3) + ')';
        const f = dentro ? 'Coge aire' : 'Suéltalo'; if (f !== fase) { fase = f; txtB.setText(f); try { SON.clic(); } catch (e) {} }
        cnt.setText('Vuelta ' + (ciclo + 1) + ' de 3 · ' + Math.ceil(dentro ? 3 - u : 9 - u) + ' s');
        this._resp = requestAnimationFrame(tick);
      };
      this._resp = requestAnimationFrame(tick);
    };
    bola.addEventListener('click', respirar);
    const tc = fila.createDiv('orb-card orb-voz-trab'); tc.style.setProperty('--c', COLOR.estado);
    const tcab = tc.createDiv('orb-voz-cab'); tcab.createSpan({ cls: 'orb-voz-k', text: 'Trabalenguas' });
    const lista = trabalenguas.length ? trabalenguas : ['Tres tristes tigres tragaban trigo en un trigal.'];
    if (this._tri == null || this._tri >= lista.length) this._tri = 0;
    const caja = tc.createDiv('orb-voz-tl'); lista[this._tri].split(/\s+/).forEach((p) => caja.createSpan({ cls: 'orb-voz-pal', text: p + ' ' }));
    const bt = tc.createDiv('orb-voz-bts');
    const lento = bt.createEl('button', { cls: 'orb-btn principal', text: 'Leer a ritmo' });
    const otro = bt.createEl('button', { cls: 'orb-btn', text: 'Otro' });
    tc.createDiv({ cls: 'orb-voz-sub', text: 'Las palabras se encienden despacio: léelas a la vez. Cuando te salga limpio, otro.' });
    otro.addEventListener('click', () => { clearInterval(this._lect); this._tri = (this._tri + 1) % lista.length; SON.desliza && SON.desliza(); this.pintar(); });
    lento.addEventListener('click', () => {
      clearInterval(this._lect); const ps = caja.querySelectorAll('.orb-voz-pal'); ps.forEach((x) => x.classList.remove('on', 'ya')); let i = 0;
      this._lect = setInterval(() => { if (i > 0) { ps[i - 1].classList.remove('on'); ps[i - 1].classList.add('ya'); } if (i >= ps.length) { clearInterval(this._lect); SON.ok(); return; } ps[i].classList.add('on'); i++; }, 650);
    });
    // 4. Antes de grabar
    const gc = w.createDiv('orb-card orb-voz-grabar'); gc.style.setProperty('--c', COLOR.top);
    gc.createDiv({ cls: 'orb-voz-k', text: 'Antes de grabar · 3 minutos' });
    const ch = gc.createDiv('orb-voz-chips'); VOZ_GRABAR.forEach(([ic, t], i) => { const x = ch.createDiv('orb-voz-chip'); const ii = x.createSpan('orb-voz-chip-i'); ob.setIcon(ii, ic); x.createSpan({ cls: 'orb-voz-chip-n', text: String(i + 1) }); x.createSpan({ text: t }); });
    // 5. Progreso (lo mide el Editor cada domingo)
    const pc = w.createDiv('orb-card orb-voz-prog-c'); pc.style.setProperty('--c', COLOR.rana);
    const pcab = pc.createDiv('orb-voz-cab'); pcab.createSpan({ cls: 'orb-voz-k', text: 'Tu progreso' });
    if (!medidas.length) {
      pc.createDiv({ cls: 'orb-voz-vacio', text: 'Aún sin medir. El domingo, cuando grabes, el Editor mide tu velocidad y la apunta aquí.' });
    } else {
      const ult = medidas[medidas.length - 1];
      const big = pc.createDiv('orb-voz-big'); big.createSpan({ cls: 'orb-voz-num', text: String(ult.sil).replace('.', ',') }); big.createSpan({ cls: 'orb-voz-ud', text: 'sílabas por segundo' });
      big.createSpan({ cls: 'orb-voz-estado ' + (ult.sil <= 6 ? 'bien' : ult.sil <= 7 ? 'medio' : 'rapido'), text: ult.sil <= 6 ? 'Con calma' : ult.sil <= 7 ? 'Algo rápido' : 'Rápido: más pausas' });
      const W2 = 600, H2 = 120, x = (i) => 20 + i * (W2 - 40) / Math.max(1, medidas.length - 1), y = (v) => H2 - 12 - (Math.min(8.5, Math.max(4, v)) - 4) / 4.5 * (H2 - 24);
      const svg = pc.createSvg('svg', { cls: 'orb-voz-svg', attr: { viewBox: `0 0 ${W2} ${H2}`, preserveAspectRatio: 'none' } });
      svg.createSvg('rect', { cls: 'orb-voz-banda', attr: { x: 0, y: y(6), width: W2, height: y(5) - y(6) } });
      if (medidas.length > 1) svg.createSvg('polyline', { cls: 'orb-voz-linea', attr: { points: medidas.map((m, i) => x(i) + ',' + y(m.sil)).join(' ') } });
      medidas.forEach((m, i) => svg.createSvg('circle', { cls: 'orb-voz-pt', attr: { cx: x(i), cy: y(m.sil), r: 5 } }));
      pc.createDiv({ cls: 'orb-voz-sub', text: 'La franja es la zona de calma (5-6). ' + medidas.length + (medidas.length === 1 ? ' medida' : ' medidas') + ' · pausas por minuto la última vez: ' + (isNaN(ult.pau) ? '—' : ult.pau) });
    }
    const pie = w.createDiv('orb-voz-pie'); const ab = pie.createEl('button', { cls: 'orb-btn', text: 'Abrir la nota Voz' }); ab.addEventListener('click', () => this.app.workspace.openLinkText(NOTAS.voz, '', 'tab'));
    pie.createSpan({ cls: 'orb-voz-sub', text: 'Si en unas semanas no notas cambio, un logopeda trabaja justo esto.' });
    raiz.scrollTop = scroll;
  }
}

class EstudioView extends VistaBase {
  getViewType() { return V.estudio; } getDisplayText() { return 'Estudio'; } getIcon() { return 'clapperboard'; }
  async pintar() {
    const ideas = await leerIdeas(this.app); const raiz = this.contentEl; const scroll = raiz.scrollTop; raiz.empty();
    const w = raiz.createDiv('orb-hoja orb-est2'); this.entrada(w);
    this.cabecera(w, 'Estudio', 'TikTok e Instagram');
    if (!ideas) { w.createDiv({ cls: 'orb-vacio-t', text: 'No encuentro el banco de ideas (1_DINERO/contenido/IDEAS.md).' }); return; }
    const idx = (e) => Math.max(0, ESTADOS_VIDEO.findIndex((x) => x[0] === e));
    const QUE = { idea: ['Escribir el guion', 'Ya tiene guion'], guion: ['Grabarlo', 'Ya lo he grabado'], grabado: ['Editarlo', 'Ya está editado'], editado: ['Publicarlo', 'Ya lo he publicado'] };
    const avanzar = async (x, b) => { const k = idx(x.estado); const sig = ESTADOS_VIDEO[k + 1]; if (!sig) return; const pub = sig[0] === 'publicado'; if (pub) { SON.rana(); estallido(b, true); } else SON.ok(); await cambiarIdea(this.app, x.n, { estado: sig[0], publicado: pub ? hoyISO() : null }); setTimeout(() => this.pintar(), pub ? 450 : 250); };
    // 1. Lo siguiente: un solo vídeo, el más avanzado sin publicar
    const pendientes = ideas.filter((x) => x.estado !== 'publicado').sort((a, b) => idx(b.estado) - idx(a.estado) || a.n - b.n);
    const foco = pendientes[0];
    const c = w.createDiv('orb-card orb-est2-foco'); c.style.setProperty('--c', COLOR.fenix);
    c.createDiv({ cls: 'orb-est2-k', text: 'Lo siguiente' });
    if (foco) {
      const q = QUE[foco.estado] || QUE.idea;
      c.createEl('h2', { cls: 'orb-est2-accion', text: q[0] });
      c.createDiv({ cls: 'orb-est2-video', text: '«' + foco.idea + '»' });
      const pasos = c.createDiv('orb-est2-pasos'); const k = idx(foco.estado);
      ESTADOS_VIDEO.forEach(([e, n], i) => { if (i) pasos.createDiv('orb-est2-linea' + (i <= k ? ' hecha' : '')); const p = pasos.createDiv('orb-est2-paso' + (i <= k ? ' hecho' : i === k + 1 ? ' ahora' : '')); const pt = p.createDiv('orb-est2-pt'); if (i <= k) ob.setIcon(pt, 'check'); else pt.setText(String(i + 1)); p.createDiv({ cls: 'orb-est2-paso-n', text: i === 0 ? 'Idea' : n }); });
      const acc = c.createDiv('orb-est2-botones');
      const b = acc.createEl('button', { cls: 'orb-btn principal', text: q[1] }); b.addEventListener('click', () => avanzar(foco, b));
      if (foco.guion) { const g = acc.createEl('button', { cls: 'orb-btn', text: 'Ver el guion' }); g.addEventListener('click', () => this.app.workspace.openLinkText(foco.guion, NOTAS.ideas, 'tab')); }
      else if (foco.estado === 'idea') acc.createDiv({ cls: 'orb-est2-ayuda', text: 'Pídeselo al Guionista: «Guionista, guion para: ' + foco.idea + '».' });
    } else { c.createEl('h2', { cls: 'orb-est2-accion', text: 'Todo publicado' }); c.createDiv({ cls: 'orb-est2-video', text: 'Añade una idea nueva abajo para el siguiente vídeo.' }); }
    // 2. Esta semana, en una línea
    const lunes = new Date(); lunes.setHours(0, 0, 0, 0); lunes.setDate(lunes.getDate() - ((lunes.getDay() + 6) % 7)); const isoL = lunes.getFullYear() + '-' + p2(lunes.getMonth() + 1) + '-' + p2(lunes.getDate());
    const hechos = ideas.filter((x) => x.estado === 'publicado' && x.publicado >= isoL).length;
    const sem = w.createDiv('orb-card orb-est2-semana'); sem.style.setProperty('--c', COLOR.top);
    const sc = sem.createDiv('orb-est2-sem-cab'); sc.createSpan({ cls: 'orb-est2-k', text: 'Esta semana' }); sc.createSpan({ cls: 'orb-est2-sem-n', text: hechos + ' de 2 vídeos publicados' });
    const dias = sem.createDiv('orb-est2-dias'); const hoyD = new Date().getDay();
    [[0, 'Dom', 'Grabar'], [2, 'Mar', 'Editar'], [3, 'Mié', 'Publicar'], [6, 'Sáb', 'Publicar']].forEach(([d, n, que]) => { const x = dias.createDiv('orb-est2-dia' + (d === hoyD ? ' hoy' : '')); x.createDiv({ cls: 'orb-est2-dia-n', text: n }); x.createDiv({ cls: 'orb-est2-dia-q', text: que }); });
    // 3. Todos tus vídeos, en una lista sencilla
    const lc = w.createDiv('orb-card orb-est2-lista'); lc.style.setProperty('--c', COLOR.rutinas);
    lc.createDiv({ cls: 'orb-est2-k', text: 'Tus vídeos' });
    ideas.slice().sort((a, b) => (a.estado === 'publicado') - (b.estado === 'publicado') || idx(b.estado) - idx(a.estado) || a.n - b.n).forEach((x) => {
      const k = idx(x.estado); const r = lc.createDiv('orb-est2-fila' + (x.estado === 'publicado' ? ' publicado' : '') + (foco && x.n === foco.n ? ' foco' : ''));
      const tx = r.createDiv('orb-est2-fila-tx'); tx.createDiv({ cls: 'orb-est2-fila-t', text: x.idea }); tx.createDiv({ cls: 'orb-est2-fila-s', text: (x.tipo || 'Vídeo') + ' · ' + (x.estado === 'publicado' ? 'publicado' + (x.publicado ? ' el ' + x.publicado.split('-').reverse().slice(0, 2).join('/') : '') : ESTADOS_VIDEO[k][1].toLowerCase()) });
      const pts = r.createDiv('orb-est2-mini'); ESTADOS_VIDEO.forEach((e, i) => pts.createSpan('orb-est2-mpt' + (i <= k ? ' on' : '')));
      if (x.guion) { const g = r.createEl('button', { cls: 'orb-est2-icono', attr: { 'aria-label': 'Ver el guion' } }); ob.setIcon(g, 'file-text'); g.addEventListener('click', () => this.app.workspace.openLinkText(x.guion, NOTAS.ideas, 'tab')); }
      if (x.estado !== 'publicado') { const s = r.createEl('button', { cls: 'orb-est2-icono sig', attr: { 'aria-label': 'Siguiente paso: ' + (ESTADOS_VIDEO[k + 1] || [])[1] } }); ob.setIcon(s, 'arrow-right'); s.addEventListener('click', () => avanzar(x, s)); }
    });
    const nueva = lc.createDiv('orb-est2-nueva'); const inp = nueva.createEl('input', { attr: { type: 'text', placeholder: '+ Nueva idea de vídeo (Enter para añadir)' } });
    inp.addEventListener('keydown', async (e) => { e.stopPropagation(); if (e.key === 'Enter' && inp.value.trim()) { SON.ok(); await nuevaIdea(this.app, inp.value, '—'); inp.value = ''; setTimeout(() => this.pintar(), 300); } });
    // 4. Accesos, discretos
    const pie = w.createDiv('orb-est2-pie');
    [['Equipo de contenido', 'sparkles', () => this.plugin.abrir(V.estudioEquipo)], ['El plan', 'map', () => this.app.workspace.openLinkText(NOTAS.contenido, '', 'tab')], ['Estilo: ángulos, ganchos y edición', 'camera', () => this.app.workspace.openLinkText(NOTAS.estilo, '', 'tab')]].forEach(([n, ic, fn]) => { const b = pie.createEl('button', { cls: 'orb-btn' }); const i = b.createSpan('orb-est-ic'); ob.setIcon(i, ic); b.createSpan({ text: n }); b.addEventListener('click', fn); });
    raiz.scrollTop = scroll;
  }
}
class EstudioEquipoView extends CasasView {
  getViewType() { return V.estudioEquipo; } getDisplayText() { return 'Equipo de contenido'; } getIcon() { return 'clapperboard'; }
}

/* ---------- Dictado por voz en el chat del Equipo (22-11-2026) ----------
   En el PC abre el dictado de Windows (Windows + H) sobre la caja de texto.
   En el móvil, el micrófono del teclado. */
function dictarWindows() {
  const ps = "$s='[DllImport(\"user32.dll\")] public static extern void keybd_event(byte b, byte s, uint f, UIntPtr e);'; Add-Type -MemberDefinition $s -Name K -Namespace W; [W.K]::keybd_event(0x5B,0,0,[UIntPtr]::Zero); [W.K]::keybd_event(0x48,0,0,[UIntPtr]::Zero); [W.K]::keybd_event(0x48,0,2,[UIntPtr]::Zero); [W.K]::keybd_event(0x5B,0,2,[UIntPtr]::Zero)";
  const enc = Buffer.from(ps, 'utf16le').toString('base64');
  require('child_process').execFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-WindowStyle', 'Hidden', '-EncodedCommand', enc], { windowsHide: true }, (err) => { if (err) { console.error('ÓRBITA dictado', err); aviso('No he podido abrir el dictado. Pulsa Windows + H.'); } });
}
function prepararEscribir(ta) {
  if (ta.dataset.orbDictado) return; ta.dataset.orbDictado = '1';
  let fila = ta.parentElement; while (fila && fila !== document.body && fila.querySelectorAll('button').length < 2) fila = fila.parentElement;
  if (!fila || fila === document.body || fila.querySelectorAll('button').length > 4) return;
  fila.addClass('orb-escribir-fila');
  const botones = Array.from(fila.querySelectorAll('button')); botones.forEach((b) => b.addClass('orb-escribir-btn'));
  let caja = ta; while (caja.parentElement && caja.parentElement !== fila) caja = caja.parentElement; caja.addClass('orb-escribir-caja');
  let tope = botones[botones.length - 1]; while (tope.parentElement && tope.parentElement !== fila) tope = tope.parentElement;
  const mic = createEl('button', { cls: 'orb-escribir-btn orb-escribir-mic', attr: { 'aria-label': 'Hablar (dictado por voz)', type: 'button' } }); ob.setIcon(mic, 'mic');
  fila.insertBefore(mic, tope);
  mic.addEventListener('click', (e) => {
    e.preventDefault(); e.stopPropagation(); ta.focus(); try { const n = ta.value.length; ta.setSelectionRange(n, n); } catch (x) { /* */ }
    if (ob.Platform.isMobile) { aviso('Pulsa el micrófono del teclado y habla.'); return; }
    if (typeof process !== 'undefined' && process.platform === 'win32') { mic.addClass('on'); setTimeout(() => mic.removeClass('on'), 5000); setTimeout(dictarWindows, 120); return; }
    aviso('Usa el dictado de tu sistema para hablar.');
  });
}
function instalarDictado(plugin) {
  const buscar = () => document.querySelectorAll('textarea[placeholder^="Escribe a"], input[placeholder^="Escribe a"]').forEach((t) => { try { prepararEscribir(t); } catch (e) { console.error('ÓRBITA dictado', e); } });
  const mo = new MutationObserver(() => { clearTimeout(plugin._tDict); plugin._tDict = setTimeout(buscar, 150); });
  mo.observe(document.body, { childList: true, subtree: true }); plugin.register(() => mo.disconnect()); buscar();
}

class Ajustes extends ob.PluginSettingTab {
  constructor(app, plugin) { super(app, plugin); this.plugin = plugin; }
  display() {
    const c = this.containerEl; c.empty();
    c.createEl('h2', { text: 'ÓRBITA' });
    new ob.Setting(c).setName('Tu nombre').setDesc('Cómo te llama el equipo.').addText((tx) => tx.setValue(this.plugin.ajustes.nombre || '').onChange(async (v) => { this.plugin.ajustes.nombre = v.trim(); NOMBRE = v.trim() || 'Tú'; await this.plugin.guardar(); }));
    new ob.Setting(c).setName('Bienvenida').setDesc('Vuelve a pasar el asistente de inicio (nombre, IA, horario y metas).').addButton((b) => b.setButtonText('Abrir').onClick(() => new BienvenidaModal(this.app, this.plugin).open()));
    new ob.Setting(c).setName('Actualizaciones automáticas').setDesc('ÓRBITA se actualiza solo cuando hay una versión nueva (solo el programa; tus notas no se tocan). Versión actual: ' + this.plugin.manifest.version)
      .addToggle((t) => t.setValue(this.plugin.ajustes.autoActualizar !== false).onChange(async (v) => { this.plugin.ajustes.autoActualizar = v; await this.plugin.guardar(); }))
      .addButton((b) => b.setButtonText('Buscar ahora').onClick(() => buscarActualizacion(this.plugin, true)));
    c.createEl('h3', { text: 'Inteligencia artificial' });
    new ob.Setting(c).setName('Con qué contesta el equipo').setDesc('Claude con tu cuenta (Claude Code, solo ordenador) o una clave de API (ordenador y móvil).').addDropdown((dd) => dd.addOptions({ 'claude-code': 'Claude con tu cuenta (Claude Code)', gemini: 'Google Gemini (gratis)', anthropic: 'Clave de API de Anthropic', openai: 'Clave de API de OpenAI', ninguna: 'Sin IA' }).setValue(IA.modo).onChange(async (v) => { IA.modo = v; this.plugin.ajustes.ia = v; await this.plugin.guardar(); this.display(); }));
    if (CON_CLAVE(IA.modo)) {
      new ob.Setting(c).setName('Clave de API').setDesc('Se guarda solo en este dispositivo (no va en tus notas ni se sincroniza con GitHub).').addText((tx) => { tx.inputEl.type = 'password'; tx.setValue(IA.clave).onChange(async (v) => { IA.clave = v.trim(); this.plugin.ajustes.iaClave = IA.clave; await this.plugin.guardar(); }); });
      new ob.Setting(c).setName('Modelo').setDesc('Vacío = ' + IA_MODELO_BASE[IA.modo] + ' (barato y rápido).').addText((tx) => tx.setPlaceholder(IA_MODELO_BASE[IA.modo]).setValue(IA.modelo).onChange(async (v) => { IA.modelo = v.trim(); this.plugin.ajustes.iaModelo = IA.modelo; await this.plugin.guardar(); }));
    } else if (IA.modo === 'claude-code') new ob.Setting(c).setName('Estado').setDesc(claudeBin() ? '✓ Claude Code encontrado en este ordenador.' : 'No encuentro Claude Code. Abre la Bienvenida para ver cómo instalarlo.');
    c.createEl('h3', { text: 'Aspecto y seguridad' });
    new ob.Setting(c).setName('Tema').setDesc('Claro (crema) u oscuro.').addDropdown((dd) => dd.addOptions({ crema: 'Claro', oscuro: 'Oscuro' }).setValue(this.plugin.ajustes.tema === 'oscuro' ? 'oscuro' : 'crema').onChange(async (v) => { if ((this.plugin.ajustes.tema === 'oscuro') !== (v === 'oscuro')) await this.plugin.alternarTema(); }));
    const s = (nombre, desc, clave, alCambiar) => new ob.Setting(c).setName(nombre).setDesc(desc).addToggle((t) => t.setValue(!!this.plugin.ajustes[clave]).onChange(async (v) => { this.plugin.ajustes[clave] = v; await this.plugin.guardar(); if (alCambiar) alCambiar(v); }));
    s('Intro al abrir Obsidian', 'La esfera de cristal, las órbitas y tu saludo.', 'intro');
    s('Pedir contraseña al abrir', 'Pantalla de bloqueo después de la intro. Solo bloquea la vista: las notas siguen siendo archivos normales.', 'bloqueo');
    new ob.Setting(c).setName('Cambiar la contraseña').setDesc(this.plugin.ajustes.clave ? 'Borra la actual; la próxima vez que abras Obsidian eliges una nueva.' : 'Todavía no hay contraseña: la eliges la próxima vez que abras Obsidian.')
      .addButton((b) => b.setButtonText('Borrar la contraseña').onClick(async () => { this.plugin.ajustes.clave = null; await this.plugin.guardar(); aviso('Contraseña borrada. Elige una nueva al abrir Obsidian.'); this.display(); }));
    s('Todo en blanco y negro', 'Quita el color de las imágenes.', 'blancoNegro', (v) => document.body.toggleClass('orbita-bn', v));
    s('Sonidos', 'Sonidos suaves al marcar tareas y pulsar botones.', 'sonido', (v) => { SON.on = v; });
  }
}

/* =========================================================
   PLUGIN
   ========================================================= */
module.exports = class OrbitaPlugin extends ob.Plugin {
  async onload() {
    portadaArranque();
    this.ajustes = Object.assign({}, AJUSTES_BASE, (await this.loadData()) || {});
    if (this.ajustes.nombre) NOMBRE = String(this.ajustes.nombre);
    IA.modo = this.ajustes.ia || 'claude-code'; IA.clave = this.ajustes.iaClave || ''; IA.modelo = this.ajustes.iaModelo || '';
    try { window.localStorage.setItem('orbita-tema', this.ajustes.tema === 'oscuro' ? 'oscuro' : 'crema'); } catch (e) { /* nada */ }
    document.body.addClass('orbita');
    document.body.toggleClass('orbita-bn', !!this.ajustes.blancoNegro);
    document.body.toggleClass('orbita-app', !!this.ajustes.modoApp);
    document.body.toggleClass('orbita-crema', this.ajustes.tema !== 'oscuro');
    this.registerView(V.hoy, (l) => new HoyView(l, this));
    this.registerView(V.semana, (l) => new SemanaView(l, this));
    this.registerView(V.orbitas, (l) => new OrbitasView(l, this));
    this.registerView(V.progreso, (l) => new ProgresoView(l, this));
    this.registerView(V.mapa, (l) => new MapaView(l, this));
    this.registerView(V.equipo, (l) => new EquipoView(l, this));
    this.registerView(V.inicio, (l) => new InicioView(l, this));
    this.registerView(V.casas, (l) => new OficinaView(l, this));
    this.registerView(V.fenix, (l) => new FenixView(l, this));
    this.registerView(V.estudio, (l) => new EstudioView(l, this));
    this.registerView(V.voz, (l) => new VozView(l, this));
    this.registerView(V.calma, (l) => new CalmaView(l, this));
    this.registerView(V.gimnasio, (l) => new GimnasioView(l, this));
    this.registerView(V.estudioEquipo, (l) => new EstudioOficinaView(l, this));
    this.addRibbonIcon('layout-grid', 'Inicio', () => this.abrir(V.inicio));
    this.addRibbonIcon('sun', 'Hoy', () => this.abrir(V.hoy));
    this.addRibbonIcon('calendar-days', 'Calendario', () => this.abrir(V.semana));
    this.addRibbonIcon('target', 'Órbitas (plan maestro)', () => this.abrir(V.orbitas));
    this.addRibbonIcon('activity', 'Progreso', () => this.abrir(V.progreso));
    this.addRibbonIcon('brain', 'Cerebro de ÓRBITA', () => this.abrir(V.mapa));
    this.addRibbonIcon('users', 'Equipo', () => this.abrir(V.casas));
    const cmd = (id, name, fn, tecla) => this.addCommand(Object.assign({ id, name, callback: fn }, tecla ? { hotkeys: [{ modifiers: ['Alt'], key: tecla }] } : {}));
    cmd('bienvenida', 'Bienvenida: configurar ÓRBITA', () => new BienvenidaModal(this.app, this).open());
    cmd('actualizar', 'Buscar actualizaciones de ÓRBITA', () => buscarActualizacion(this, true));
    cmd('abrir-inicio', 'Abrir Inicio', () => this.abrir(V.inicio), '0');
    cmd('abrir-hoy', 'Abrir Hoy', () => this.abrir(V.hoy), '1');
    cmd('abrir-casas', 'Abrir el equipo', () => this.abrir(V.casas), '6');
    cmd('abrir-fenix', 'Abrir Fénix', () => this.abrir(V.fenix), '7');
    cmd('abrir-estudio', 'Abrir el Estudio de contenido', () => this.abrir(V.estudio), '8');
    cmd('abrir-voz', 'Abrir Voz (hablar claro y con calma)', () => this.abrir(V.voz));
    cmd('abrir-calma', 'Abrir Calma (ansiedad y estrés)', () => this.abrir(V.calma));
    cmd('abrir-gimnasio', 'Abrir Gimnasio', () => this.abrir(V.gimnasio));
    cmd('abrir-estudio-equipo', 'Abrir el equipo de contenido', () => this.abrir(V.estudioEquipo), '9');
    cmd('modo-app', 'Alternar modo aplicación', () => this.alternarApp());
    cmd('abrir-semana', 'Abrir el calendario', () => this.abrir(V.semana), '2');
    cmd('abrir-orbitas', 'Abrir Órbitas', () => this.abrir(V.orbitas), '3');
    cmd('abrir-progreso', 'Abrir Progreso', () => this.abrir(V.progreso), '4');
    cmd('abrir-mapa', 'Abrir el cerebro', () => this.abrir(V.mapa), '5');
    cmd('abrir-equipo', 'Mostrar el menú de ÓRBITA', () => this.panelLateral(true));
    cmd('hablar-equipo', 'Hablar con el equipo en directo (Claude)', () => abrirClaudian(this.app), 'C');
    cmd('crear-hoy', 'Crear la nota de hoy', async () => { const f = await crearDia(this.app); this.app.workspace.getLeaf(false).openFile(f); });
    cmd('cerrar-dia', 'Cerrar el día', () => cerrarDia(this.app));
    cmd('revision-semana', 'Revisión de la semana', () => revisarSemana(this.app));
    cmd('ver-intro', 'Ver la intro', () => introApple(this, false));
    cmd('bloquear', 'Bloquear ÓRBITA', () => { try { window.localStorage.removeItem('orbita-desbloqueo'); } catch (e) { /* */ } introApple(this, true); });
    cmd('blanco-negro', 'Alternar blanco y negro', async () => { this.ajustes.blancoNegro = !this.ajustes.blancoNegro; document.body.toggleClass('orbita-bn', this.ajustes.blancoNegro); await this.guardar(); });
    SON.on = this.ajustes.sonido !== false;
    this.registerDomEvent(document, 'pointerdown', (e) => { const b = e.target.closest && e.target.closest('.orb-vista button, .orb-lateral button, .orb-tile, .orb-ahora, .orb-lat-hoy'); if (b) SON.clic(); });
    cmd('tema', 'Cambiar entre tema claro y oscuro', () => this.alternarTema());
    cmd('sonido', 'Activar o quitar los sonidos', async () => { this.ajustes.sonido = this.ajustes.sonido === false; SON.on = this.ajustes.sonido; await this.guardar(); aviso(SON.on ? 'Sonidos activados' : 'Sonidos quitados'); });
    this.addSettingTab(new Ajustes(this.app, this));
    try { instalarDictado(this); } catch (e) { console.error('ÓRBITA dictado', e); }
    this.estado = this.addStatusBarItem(); this.estado.addClass('orb-estado');
    const refrescar = () => { clearTimeout(this._e); this._e = setTimeout(() => this.barraEstado(), 400); };
    this.registerEvent(this.app.vault.on('modify', refrescar));
    this.registerEvent(this.app.workspace.on('active-leaf-change', (leaf) => {
      const t = leaf && leaf.getViewState ? leaf.getViewState().type : '';
      if (t && t !== V.equipo) { if (Object.values(V).includes(t)) this.nav(t); else if (leaf.getRoot && leaf.getRoot() === this.app.workspace.rootSplit) { if (this.ajustes.modoApp) this.nav(null); else this.ocultarNav(); } }
      if (t && t !== V.equipo && t !== this.vistaActiva) { this.vistaActiva = t; this.app.workspace.getLeavesOfType(V.equipo).forEach((l) => l.view && l.view.pintar && l.view.pintar()); }
    }));
    this.registerInterval(window.setInterval(() => { this.app.workspace.getLeavesOfType(V.equipo).forEach((l) => l.view && l.view.pintar && l.view.pintar()); }, 5 * 60 * 1000));
    this.app.workspace.onLayoutReady(async () => {
      const prep = () => asegurarDias(this.app).catch((e) => console.error('ÓRBITA asegurarDias', e));
      // Esperar a que Remotely Save traiga lo último antes de crear notas (si no, una nota vacía del móvil pisaba la buena)
      window.setTimeout(prep, 60000);
      this.registerInterval(window.setInterval(prep, 10 * 60 * 1000));
      // El equipo te escribe y te avisa en Obsidian
      this.avisarChat = () => avisosChat(this).catch((e) => console.error('ÓRBITA avisos', e));
      const vida = () => { revisarPingsEstudio(this).catch((e) => console.error('ÓRBITA pings estudio', e)); return revisarPings(this).then(this.avisarChat).catch((e) => console.error('ÓRBITA pings', e)); };
      window.setTimeout(() => archivarChat(this.app).catch((e) => console.error('ÓRBITA archivar chat', e)), 20000);
      window.setTimeout(vida, 8000); this.registerInterval(window.setInterval(vida, 60 * 1000));
      try { vigilarVideos(this); } catch (e) { console.error('vigilarVideos', e); }
      const actualizar = () => { if (this.ajustes.autoActualizar !== false) buscarActualizacion(this, false); };
      window.setTimeout(actualizar, 45000); this.registerInterval(window.setInterval(actualizar, 6 * 3600 * 1000));
      this.registerEvent(this.app.vault.on('modify', (f) => { if (f && f.path === RAIZ + '/6_EQUIPO/CHAT.md') { clearTimeout(this._tAv); this._tAv = setTimeout(this.avisarChat, 1500); } }));
      this.limpiarPestanasAntiguas();
      this.barraEstado();
      this.panelLateral(false);
      // Cada vez que se abre Obsidian: intro «liquid» y, si está activado, la contraseña
      const recarga = window.__orbitaRecarga && Date.now() - window.__orbitaRecarga < 60000;
      let reciente = false; try { reciente = Date.now() - Number(window.localStorage.getItem('orbita-desbloqueo') || 0) < 12 * 3600 * 1000; } catch (e) { /* */ }
      if (!this.ajustes.bienvenida) { quitarPortada(); setTimeout(() => new BienvenidaModal(this.app, this).open(), 600); }
      else if (recarga || reciente) quitarPortada();
      else if (this.ajustes.intro || this.ajustes.bloqueo) introApple(this, this.ajustes.bloqueo !== false); else quitarPortada();
      // Se actualiza solo: si cambia el plugin (por la sincronización), se recarga sin reiniciar Obsidian
      const vigilar = async () => { try { const ad = this.app.vault.adapter; const d0 = this.manifest.dir; const a1 = await ad.stat(d0 + '/main.js'); const a2 = await ad.stat(d0 + '/styles.css'); const firma = (a1 ? a1.mtime + ':' + a1.size : '') + '|' + (a2 ? a2.mtime + ':' + a2.size : ''); if (!this._firma) { this._firma = firma; return; } if (firma !== this._firma) { this._firma = firma; window.__orbitaRecarga = Date.now(); new ob.Notice('ÓRBITA se ha actualizado'); const id = this.manifest.id; await this.app.plugins.disablePlugin(id); await this.app.plugins.enablePlugin(id); } } catch (e) { console.error('ÓRBITA vigilar', e); } };
      vigilar(); this.registerInterval(window.setInterval(vigilar, 30000));
    });
  }
  onunload() { document.querySelectorAll('.orb-portada').forEach((p) => p.remove()); document.body.removeClass('orbita-crema'); document.querySelectorAll('.orb-dock, .orb-rail, .orb-capa-nav, .orb-tabbar').forEach((e) => e.remove()); document.body.removeClass('orb-en-app'); if (this._roCapa) this._roCapa.disconnect(); try { const r = this.app.workspace.leftRibbon; if (r && r.containerEl) r.containerEl.style.display = ''; } catch (e) { /* nada */ } document.body.removeClass('orbita-app'); document.body.removeClass('orbita'); document.body.removeClass('orbita-bn'); const i = document.body.querySelector('.orb-intro'); if (i) i.remove(); }
  async guardar() { await this.saveData(this.ajustes); }
  // Cierra las pestañas del plugin antiguo (VIDA) y deja Hoy abierto
  limpiarPestanasAntiguas() {
    const ws = this.app.workspace; const viejas = [];
    ws.iterateAllLeaves((leaf) => { const t = (leaf.getViewState && leaf.getViewState().type) || ''; if (/^(cuartel|vida-)/.test(t)) viejas.push(leaf); });
    viejas.forEach((l) => l.detach());
    if (this.ajustes.modoApp) { // como una app: una sola pestaña de ÓRBITA en el centro
      const propiasRaiz = []; ws.iterateRootLeaves((l) => { const t = l.getViewState().type; if (Object.values(V).includes(t) && t !== V.equipo) propiasRaiz.push(l); });
      propiasRaiz.slice(1).forEach((l) => l.detach());
    }
    const propias = Object.values(V).some((t) => ws.getLeavesOfType(t).some((l) => l.getRoot && l.getRoot() === ws.rootSplit));
    // Al abrir Obsidian se empieza siempre por Hoy (la pantalla de cada día)
    if (viejas.length || !propias || this.ajustes.modoApp) setTimeout(() => this.abrir(this.ajustes.modoApp ? V.hoy : V.inicio), 50);
  }
  async abrir(tipo) {
    const ws = this.app.workspace; let leaf = ws.getLeavesOfType(tipo).find((l) => !l.getRoot || l.getRoot() === ws.rootSplit);
    if (!leaf && this.ajustes.modoApp) { // como una app: una sola pestaña que cambia de pantalla
      const propias = Object.values(V).filter((t) => t !== V.equipo);
      ws.iterateRootLeaves((l) => { if (!leaf && propias.includes(l.getViewState().type)) leaf = l; });
      if (leaf) await leaf.setViewState({ type: tipo, active: true });
    }
    if (!leaf && this.ajustes.modoApp && ws.getMostRecentLeaf) { const rec = ws.getMostRecentLeaf(ws.rootSplit); if (rec) { leaf = rec; await leaf.setViewState({ type: tipo, active: true }); } }
    if (!leaf) { leaf = ws.getLeaf('tab'); await leaf.setViewState({ type: tipo, active: true }); }
    ws.revealLeaf(leaf); ws.setActiveLeaf(leaf, { focus: true });
  }
  async panelLateral(revelar) {
    const ws = this.app.workspace; let leaf = ws.getLeavesOfType(V.equipo)[0];
    if (leaf && leaf.getRoot && leaf.getRoot() !== ws.leftSplit) { leaf.detach(); leaf = null; }
    if (!leaf) { leaf = ws.getLeftLeaf(false); if (!leaf) return; await leaf.setViewState({ type: V.equipo, active: true }); }
    // Modo app a pantalla completa: el panel lateral se recoge (la navegación va en la barra izquierda y en las pestañas de abajo)
    if (revelar) { if (ws.leftSplit && ws.leftSplit.expand) ws.leftSplit.expand(); ws.revealLeaf(leaf); }
    else if (this.ajustes.modoApp && ws.leftSplit && ws.leftSplit.collapse) ws.leftSplit.collapse();
    this.ribbon();
  }
  /* ---------- Navegación fija: pestañas de abajo y barra lateral ---------- */
  nav(actual) {
    if (esMovil()) { this.tabbar(actual); document.body.addClass('orb-en-app'); }
    const host = this.capaNav();
    if (!this._nav || !this._nav.dock.isConnected || this._nav.host !== host) this.crearNav(host);
    this._nav.dock.removeClass('oculto'); this._nav.rail.removeClass('oculto');
    this.marcarNav(actual);
  }
  // Capa fija encima del área central (no dentro de los paneles de Obsidian, que la deformaban)
  capaNav() {
    if (this._capa && this._capa.isConnected) { this.ajustarCapa(); return this._capa; }
    const capa = document.body.createDiv('orb-capa-nav'); this._capa = capa; this.ajustarCapa();
    const ws = this.app.workspace; const raiz = ws.rootSplit && ws.rootSplit.containerEl;
    if (raiz && window.ResizeObserver) { this._roCapa = new ResizeObserver(() => this.ajustarCapa()); this._roCapa.observe(raiz); }
    this.registerDomEvent(window, 'resize', () => this.ajustarCapa());
    this.registerEvent(ws.on('layout-change', () => this.ajustarCapa()));
    this.registerInterval(window.setInterval(() => this.ajustarCapa(), 3000));
    return capa;
  }
  ajustarCapa() {
    const c = this._capa; if (!c) return; const ws = this.app.workspace; const raiz = ws.rootSplit && ws.rootSplit.containerEl;
    let r = { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
    if (raiz && raiz.offsetWidth) { let x = 0, y = 0, e = raiz; while (e) { x += e.offsetLeft || 0; y += e.offsetTop || 0; e = e.offsetParent; } r = { left: x, top: y, width: raiz.offsetWidth, height: raiz.offsetHeight }; }
    const clave = [r.left, r.top, r.width, r.height].map(Math.round).join(','); if (clave === this._capaClave) return; this._capaClave = clave;
    c.style.left = r.left + 'px'; c.style.top = r.top + 'px'; c.style.width = r.width + 'px'; c.style.height = r.height + 'px';
    if (this._nav && this._nav.actual) { const v = this._nav.actual; this._nav.primera = true; this.marcarNav(v); }
  }
  crearNav(host) {
    host.querySelectorAll(':scope > .orb-dock, :scope > .orb-rail').forEach((e) => e.remove());
    const dock = host.createDiv('orb-dock oculto'); const pista = dock.createDiv('orb-dock-pista'); const ind = pista.createDiv('orb-dock-ind');
    const btns = {};
    [['Hoy', V.hoy], ['Calendario', V.semana], ['Órbitas', V.orbitas], ['Equipo', V.casas], ['Más', V.inicio]].forEach(([n, v]) => {
      const b = pista.createEl('button', { cls: 'orb-dock-btn', text: n }); btns[v] = b; b.addEventListener('click', () => this.irA(v));
    });
    const mas = dock.createEl('button', { cls: 'orb-dock-mas', attr: { 'aria-label': 'Cerrar el día' } }); ob.setIcon(mas, 'moon'); mas.addEventListener('click', () => cerrarDia(this.app));
    // Hablar con el equipo en directo (Claudian, solo en el PC)
    if (!ob.Platform.isMobile && this.app.plugins && this.app.plugins.enabledPlugins && this.app.plugins.enabledPlugins.has('realclaudian')) { const ch = dock.createEl('button', { cls: 'orb-dock-mas', attr: { 'aria-label': 'Hablar con el equipo (Claude)' } }); ob.setIcon(ch, 'message-circle'); ch.addEventListener('click', () => abrirClaudian(this.app)); }
    const rail = host.createDiv('orb-rail oculto'); const rind = rail.createDiv('orb-rail-ind'); const rbtns = {};
    const conClaudian = this.app.plugins && this.app.plugins.enabledPlugins && this.app.plugins.enabledPlugins.has('realclaudian');
    // Menú lateral por grupos: tu día · tu equipo · cuerpo y mente · sistema
    [['Inicio', V.inicio, 'layout-grid'], ['Hoy', V.hoy, 'sun'], ['Calendario', V.semana, 'calendar-days'], ['Órbitas', V.orbitas, 'target'], ['Progreso', V.progreso, 'activity'], null,
      ['Equipo', V.casas, 'users']].concat(conClaudian ? [['Hablar con el equipo (Claude)', 'cmd:claudian', 'message-circle']] : []).concat([null,
      ['Gimnasio', V.gimnasio, 'dumbbell'], ['Formación', V.fenix, 'flame'], ['Voz', V.voz, 'mic'], ['Calma', V.calma, 'wind'], null,
      ['Cerebro', V.mapa, 'brain'], ['Guía', NOTAS.guia, 'help-circle']]).forEach((it) => {
      if (!it) { rail.createDiv('orb-rail-sep'); return; }
      const [n, v, ic] = it; const b = rail.createEl('button', { cls: 'orb-rail-btn', attr: { 'data-tip': n } }); ob.setIcon(b, ic); rbtns[v] = b;
      b.addEventListener('click', () => { if (v === 'cmd:claudian') { abrirClaudian(this.app); return; } if (String(v).endsWith('.md')) { if (SON) SON.clic(); this.app.workspace.openLinkText(v, '', 'tab'); } else this.irA(v); });
    });
    this._nav = { host, dock, pista, ind, btns, rail, rind, rbtns, actual: null, primera: true };
  }
  irA(v) { if (this._nav && this._nav.actual === v) return; this.marcarNav(v); if (SON && SON.desliza) SON.desliza(); this.abrir(v); }
  marcarNav(v) {
    if (this._tab && esMovil()) this.tabbar(v);
    const N = this._nav; if (!N) return; const prev = N.actual; N.actual = v;
    const orden = [V.inicio, V.hoy, V.semana, V.fenix, V.progreso, V.orbitas, V.mapa, V.casas, V.estudio, V.estudioEquipo];
    if (prev && prev !== v) document.body.dataset.orbDir = orden.indexOf(v) >= orden.indexOf(prev) ? 'der' : 'izq';
    Object.keys(N.btns).forEach((k) => N.btns[k].toggleClass('activo', k === v));
    Object.keys(N.rbtns).forEach((k) => N.rbtns[k].toggleClass('activo', k === v));
    const colocar = () => {
      const sin = N.primera; if (sin) { N.ind.style.transition = 'none'; N.rind.style.transition = 'none'; }
      const b = N.btns[v]; if (b && b.offsetWidth) { N.ind.style.opacity = '1'; N.ind.style.width = b.offsetWidth + 'px'; N.ind.style.transform = 'translateX(' + b.offsetLeft + 'px)'; } else N.ind.style.opacity = '0';
      const rb = N.rbtns[v]; if (rb && rb.offsetHeight) { N.rind.style.opacity = '1'; N.rind.style.transform = 'translateY(' + rb.offsetTop + 'px)'; } else N.rind.style.opacity = '0';
      if (sin) { void N.ind.offsetWidth; N.ind.style.transition = ''; N.rind.style.transition = ''; N.primera = false; }
    };
    if (N.primera) requestAnimationFrame(colocar); else colocar();
  }
  ocultarNav() { if (this._nav) { this._nav.dock.addClass('oculto'); this._nav.rail.addClass('oculto'); } document.body.removeClass('orb-en-app'); if (this._tab) this._tab.bar.addClass('oculto'); }
  /* ---------- Móvil: barra de pestañas como una app ---------- */
  tabbar(actual) {
    if (!this._tab || !this._tab.bar.isConnected) {
      document.querySelectorAll('.orb-tabbar').forEach((e) => e.remove());
      const bar = document.body.createDiv('orb-tabbar'); const ind = bar.createDiv('orb-tab-ind'); const btns = {};
      [['Hoy', V.hoy, 'sun'], ['Calendario', V.semana, 'calendar-days'], ['Gimnasio', V.gimnasio, 'dumbbell'], ['Equipo', V.casas, 'users'], ['Más', 'mas', 'menu']].forEach(([n, v, ic]) => {
        const b = bar.createEl('button', { cls: 'orb-tab' }); const i = b.createSpan('orb-tab-i'); ob.setIcon(i, ic); b.createSpan({ cls: 'orb-tab-n', text: n }); btns[v] = b;
        b.addEventListener('click', () => {
          if (v === 'mas') { try { SON.clic(); } catch (e) { /* */ } new MasSheet(this.app, this).open(); return; }
          this.tabbar(v); // se marca al instante, sin esperar a que cargue la pantalla
          if (this._nav && this._nav.actual === v) { const l = this.app.workspace.getLeavesOfType(v)[0]; if (l) { this.app.workspace.revealLeaf(l); this.app.workspace.setActiveLeaf(l, { focus: true }); } return; }
          this.irA(v);
        });
      });
      this._tab = { bar, ind, btns, primera: true };
      this.registerDomEvent(window, 'resize', () => this._tab && this.colocarTab());
    }
    this._tab.bar.removeClass('oculto');
    const enBarra = [V.inicio, V.hoy, V.semana, V.gimnasio];
    this._tab.actual = enBarra.includes(actual) ? actual : 'mas';
    Object.entries(this._tab.btns).forEach(([k, b]) => b.toggleClass('activo', k === this._tab.actual));
    this.colocarTab();
  }
  colocarTab() {
    const T2 = this._tab; if (!T2) return; const b = T2.btns[T2.actual];
    const poner = () => { if (!b || !b.offsetWidth) { T2.ind.style.opacity = '0'; return; }
      if (T2.primera) { T2.ind.style.transition = 'none'; }
      T2.ind.style.opacity = '1'; T2.ind.style.width = b.offsetWidth + 'px'; T2.ind.style.transform = 'translateX(' + b.offsetLeft + 'px)';
      if (T2.primera) { void T2.ind.offsetWidth; T2.ind.style.transition = ''; T2.primera = false; } };
    requestAnimationFrame(poner);
  }
  ribbon() { // la columna de iconos de Obsidian se oculta en modo app
    try { const r = this.app.workspace.leftRibbon; if (r && r.containerEl) r.containerEl.style.display = this.ajustes.modoApp ? 'none' : ''; } catch (e) { /* nada */ }
  }
  async alternarTema() {
    this.ajustes.tema = this.ajustes.tema === 'oscuro' ? 'crema' : 'oscuro'; document.body.toggleClass('orbita-crema', this.ajustes.tema !== 'oscuro'); await this.guardar();
    try { this.app.changeTheme(this.ajustes.tema === 'oscuro' ? 'obsidian' : 'moonstone'); } catch (e) { /* API interna de Obsidian: si no existe, solo cambia ÓRBITA */ }
    try { window.localStorage.setItem('orbita-tema', this.ajustes.tema); } catch (e) { /* nada */ }
    document.querySelectorAll('.orb-sup-btn').forEach((b) => { b.empty(); ob.setIcon(b, this.ajustes.tema === 'oscuro' ? 'sun' : 'moon'); });
    if (SON && SON.clic) SON.clic();
  }
  async alternarApp() {
    this.ajustes.modoApp = !this.ajustes.modoApp; document.body.toggleClass('orbita-app', this.ajustes.modoApp); await this.guardar();
    if (this.ajustes.modoApp) { this.panelLateral(false); this.abrir(V.hoy); } else { const ws = this.app.workspace; if (ws.leftSplit && ws.leftSplit.expand) ws.leftSplit.expand(); this.panelLateral(true); this.ribbon(); }
    aviso(this.ajustes.modoApp ? 'Modo aplicación activado' : 'Modo aplicación desactivado: vuelve la interfaz normal de Obsidian');
  }
  async barraEstado() {
    if (!this.estado) return;
    const d = await leerDia(this.app); this.estado.empty();
    this.estado.createSpan({ cls: 'orb-estado-punto' });
    this.estado.createSpan({ text: d ? ('rana ' + (d.rana && d.rana.hecha ? 'hecha' : 'pendiente') + ' · ' + d.hechas + '/' + d.total) : 'sin nota de hoy' });
    this.estado.onclick = () => this.abrir(V.hoy);
  }
};
