# Manual de ÓRBITA

## 1. Primeros pasos (10 minutos)
1. **Abre la bóveda** en Obsidian y activa el plugin ÓRBITA (ver README).
2. **Tu nombre:** Ajustes → ÓRBITA → Tu nombre.
3. **Tu perfil:** abre `ORBITA/0_NUCLEO/PERFIL.md` y rellénalo. Es lo que el equipo sabe de ti.
4. **Tu horario:** edita la tabla de `ORBITA/0_NUCLEO/CALENDARIO.md` con tu semana real.
5. **Tus metas:** rellena `ORBITA/0_NUCLEO/METAS.md` (meta del año por órbita y las metas de este mes).
6. **Tu entreno:** cambia `ORBITA/2_CUERPO/ENTRENAMIENTO.md`. Cada día de entreno es un encabezado `## Lunes · Rutina`.
7. **Tu cuidado personal:** tabla «Plan del calendario» de `ORBITA/6_EQUIPO/SKINCARE.md` (productos, mañana/noche y frecuencia).
8. **Tu formación:** `ORBITA/0_NUCLEO/FENIX.md` (los módulos de tu curso) y `ORBITA/3_MENTE/LIBRO.md` (tu libro).
9. **Contraseña (opcional):** la primera vez que abras ÓRBITA te pide elegir una. Se puede quitar en Ajustes → ÓRBITA.

## 2. El día a día
- **Hoy:** tu nota del día, ya preparada. Marca lo que haces. La rana va primero.
- **Cierre (2 min):** pantalla Hoy → Cerrar el día. Qué hiciste y cómo estás.
- **Equipo:** escribe a cualquier agente. Si no sabes a quién, al Director.
- **Domingo:** revisión de la semana y seguimiento de las metas del mes.
- **Semana dura:** pon «modo tormenta» en el Estado general de `ESTADO_EQUIPO.md`; lo mínimo cuenta como cumplido.

## 3. El equipo
| Agente | Para qué |
|---|---|
| Director | El jefe: coordina, plan del día y de la semana |
| Mentor | Metas, disciplina, la rana, tu formación |
| Estratega | Dinero, ahorro, trabajo y carrera |
| Entrenador | Gimnasio, técnica y progreso |
| Skincare | Cuidado personal (piel, pelo) |
| Coach | Ánimo, estrés, sueño y lo personal |

Cómo te hablan se decide en `ORBITA/0_NUCLEO/TRATO.md`. Si los quieres más suaves o más exigentes, edítalo.

**Mensajes del equipo durante el día** (solo si está sin marcar en tu nota): 10:30 levantarte, 12:00 cuidado de mañana, 13:30 entreno, 18:00 rana, 19:30 formación, 21:00 cómo estás, 22:15 cuidado de noche, 22:45 cierre, 23:30 lectura. Solo aparecen con Obsidian abierto.

## 4. Que el equipo conteste al momento (opcional, PC)
1. Instala **Claude Code**: en Windows, abre PowerShell y ejecuta `irm https://claude.ai/install.ps1 | iex` (en Mac o Linux, sigue la [guía oficial](https://code.claude.com)).
2. Escribe `claude` y elige **iniciar sesión con tu cuenta de Claude** (Pro o superior). No uses claves de API si no quieres pagar aparte.
3. Comprueba que arriba pone tu plan y no «API Usage Billing».
4. Listo: en la pantalla Equipo, escribe y pulsa Enter. El agente responde en unos segundos con el modelo Sonnet (el más económico) y **solo puede leer** tus notas.

*Consejo:* si tienes un `settings.json` de Claude Code con un proxy o una clave de API, quítalo o te cobrará por uso.

## 5. Chat en directo dentro de Obsidian (opcional, PC)
Instala el plugin de la comunidad **Claudian**. Usa tu Claude Code. La bóveda trae un `CLAUDE.md` con las normas del equipo. En Ajustes → Claudian → Proveedores, activa Sonnet y Opus.

## 6. Avisos al móvil con rutinas programadas (opcional, avanzado)
En la app de Claude puedes crear tareas programadas que lean tu bóveda (con el PC encendido y la app de Claude enlazada a tu carpeta) y te manden un aviso al móvil. En `prompts/` tienes dos de ejemplo: **buenos días** (09:30) y **revisión de la noche** (23:15). Cambia las rutas por las tuyas.

## 7. Sincronizar PC y móvil
- **Obsidian Sync** (de pago, lo más sencillo), o
- **Remotely Save** (gratis) con Dropbox: en sus ajustes, «sincronizar cada 1 minuto» y «sincronizar al guardar». Cada dispositivo sincroniza **solo con Obsidian abierto**.
- ÓRBITA espera 1 minuto al abrir antes de crear la nota del día, para que primero llegue lo último.

## 8. Personalizar
- **Horario:** `CALENDARIO.md`. **Citas:** `CITAS.md`. **Sesiones fijas:** `SESIONES.md`.
- **Plantilla del día:** `ORBITA/8_PLANTILLAS/DIA.md`.
- **Agentes:** sus fichas en `ORBITA/6_EQUIPO/` (lo que hacen, su mensaje y su registro).
- **Tema claro/oscuro, sonidos, intro:** Ajustes → ÓRBITA.

## 9. Preguntas frecuentes
- **No me aparece la nota de hoy:** espera 1 minuto tras abrir o pulsa «Crearla» en Hoy.
- **El chat no contesta al momento:** ¿Claude Code está instalado y con sesión iniciada? Sin él, solo contestan las rutinas programadas.
- **¿Gasta mucho?** Los mensajes automáticos y todas las pantallas son gratis. Solo gasta el chat con IA, y usa el modelo más económico.

## 10. Limitaciones conocidas (versión 0.1)
- Algunas pantallas de «Más» (Voz, Calma, Estudio de contenido) necesitan notas que la plantilla aún no trae; se irán añadiendo.
- El chat al momento solo funciona en el ordenador.
