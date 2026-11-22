# Manual de ÓRBITA

## 1. Instalar (5 minutos)

**Windows**
1. Descarga [ORBITA.zip](https://github.com/Fatalyy/ORBITA/archive/refs/heads/main.zip) y descomprímelo (clic derecho → *Extraer todo*).
2. Doble clic en **`INSTALAR_WINDOWS.bat`**. Si Windows avisa («Windows protegió su PC»), pulsa *Más información → Ejecutar de todas formas*.
3. El instalador:
   - instala Obsidian si no lo tienes (gratis),
   - copia tu bóveda a `Documentos\ORBITA` (si ya existe, no toca nada),
   - abre Obsidian con ella.
4. En Obsidian, pulsa **«Confiar en el autor y activar plugins»**.

**Mac**
1. Descarga y descomprime el zip.
2. Clic derecho en **`INSTALAR_MAC.command`** → *Abrir* (la primera vez macOS lo pide así).
3. Si no tienes Obsidian, descárgalo de [obsidian.md](https://obsidian.md) y vuelve a abrir el instalador.

**A mano (cualquier sistema)**
Copia la carpeta `vault` donde quieras y en Obsidian elige *Abrir carpeta como bóveda*. Luego *Ajustes → Plugins de la comunidad → Activar* y enciende **ÓRBITA**.

## 2. La Bienvenida (3 minutos)

Se abre sola la primera vez. Cinco pantallas:

1. **Tu nombre.**
2. **Tu IA** (ver punto 3).
3. **Sobre ti:** edad, ciudad, a qué te dedicas, qué te cuesta y si quieres que el equipo sea suave, directo o exigente.
4. **Tu semana:** a qué hora te levantas y te acuestas, días de gimnasio y tu horario de clase o trabajo.
5. **Tus metas:** una por órbita para este año y hasta 3 para este mes.

Al terminar, el **Director te escribe en el chat** y te hace unas preguntas cortas (semana tipo, entreno, cuidado personal, dinero, libro o curso). Con cada respuesta rellena tus notas. Cuando acaba, te avisa.

Puedes repetirla cuando quieras: *Ajustes › ÓRBITA › Bienvenida*.

## 3. Conectar la IA

Elige una opción en la Bienvenida o en *Ajustes › ÓRBITA › Inteligencia artificial*.

### A) Claude con tu cuenta (recomendado si pagas Claude Pro)
Sin coste extra. Funciona en el ordenador.
1. Abre **PowerShell** (Windows) o **Terminal** (Mac).
2. Pega esto y pulsa Enter:
   - Windows: `irm https://claude.ai/install.ps1 | iex`
   - Mac/Linux: `curl -fsSL https://claude.ai/install.sh | bash`
3. Escribe `claude`, pulsa Enter e inicia sesión con tu cuenta de Claude.
4. En la Bienvenida, pulsa **Comprobar**. Debe salir «✓ Claude Code está instalado».

*Consejo:* si en Claude Code ves «API Usage Billing», estás usando una clave de API y te cobrará aparte. Cierra sesión (`/logout`) y entra con tu cuenta.

### B) Google Gemini: GRATIS (si no pagas ningún plan)
Funciona en el ordenador **y en el móvil**, sin pagar nada.
1. Entra en [aistudio.google.com/apikey](https://aistudio.google.com/apikey) con tu cuenta de Google.
2. Pulsa **Create API key** y cópiala (empieza por `AIza…`). No pide tarjeta.
3. En la Bienvenida elige **Google Gemini (gratis)**, pégala y pulsa **Probar**.

Tiene un límite de mensajes al día (de sobra para el uso normal). En el plan gratuito, Google puede usar lo que escribes para mejorar sus modelos: si no te gusta, usa Claude o una clave de pago.

### C) Clave de API de Anthropic o de OpenAI
Funciona en el ordenador **y en el móvil**. Pagas por uso; con 5 € tienes para mucho tiempo.
1. Crea la clave:
   - Anthropic: [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
   - OpenAI: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Añade saldo en esa misma web (*Billing*).
3. Pega la clave en la Bienvenida y pulsa **Probar**.

La clave se guarda solo en ese dispositivo (no va en tus notas ni se sincroniza). En el móvil tendrás que pegarla otra vez.
Modelo por defecto: el más barato y rápido de cada marca. Puedes cambiarlo en Ajustes.

### D) Sin IA
Todo funciona (nota del día, avisos del equipo, metas, calendario) menos las respuestas del chat.

## 4. Hablar con el equipo también desde la app de Claude (opcional)

**Ya viene configurado.** Tu bóveda trae las instrucciones del equipo (`CLAUDE.md`) y el método de cada agente (`.claude/skills/`). Claude Code los lee solo, así que el chat de Obsidian ya los usa.

**Desde la app de Claude en el ordenador (lo más fácil):** abre la pestaña **Code**, elige la carpeta `Documentos/ORBITA` y escribe, por ejemplo, «Director, ¿qué toca hoy?». Ya sabe quién es cada agente y lee tus notas. No hay que crear nada.

**Si además quieres un Proyecto en claude.ai** (para el móvil y los avisos de buenos días y de noche), se hace a mano una vez, en 2 minutos. Claude no deja que un programa lo cree por ti. Todo está en la carpeta oculta `.claude-proyecto` de tu bóveda; la última pantalla de la Bienvenida tiene botones para copiar y abrirla:
1. App de Claude → **Proyectos → Nuevo proyecto** → «ÓRBITA».
2. **Instrucciones:** pega `INSTRUCCIONES_PROYECTO.txt`.
3. **Conocimiento:** sube `CONSTITUCION.md` y `BUZON.md`.
4. **Skills:** Ajustes → Skills → sube los 7 zip de `skills-zip/`.
5. **Avisos al móvil:** crea dos tareas programadas con los textos de `rutinas/`.

## 5. El día a día

- **Hoy:** marca lo que haces. La rana va primero.
- **Cerrar el día (2 min):** pantalla Hoy → *Cerrar el día*.
- **Equipo:** escribe a cualquier agente. Si no sabes a quién, al Director. Puedes adjuntar fotos con el clip 📎 o pegarlas.
- **Domingo:** revisión de la semana y seguimiento de las metas del mes.
- **Semana dura:** pon «modo tormenta» en `ESTADO_EQUIPO.md`; lo mínimo cuenta como cumplido.

| Agente | Para qué |
|---|---|
| Director | Coordina, plan del día y de la semana |
| Mentor | Metas, disciplina, la rana y tu formación |
| Estratega | Dinero, trabajo y carrera |
| Entrenador | Gimnasio, técnica y progreso |
| Skincare | Cuidado personal |
| Coach | Ánimo, estrés, sueño y lo personal |

El equipo te escribe solo si algo está sin marcar (levantarte, entreno, rana, formación, cierre…) y solo con Obsidian abierto. Esos avisos no gastan IA.

## 6. Móvil y sincronización

- **Obsidian Sync** (de pago, lo más fácil), o
- **Remotely Save** (gratis) con Dropbox, OneDrive o similar: en sus ajustes, «sincronizar cada 1 minuto» y «al guardar».
- En el móvil, el chat contesta al momento solo con clave de API. Con Claude Code, te contesta cuando abras el ordenador.

## 7. Personalizar

Todo son notas normales en `ORBITA/`:
- Horario: `0_NUCLEO/CALENDARIO.md` · Citas: `CITAS.md` · Metas: `METAS.md` · Perfil: `PERFIL.md`
- Cómo te habla el equipo: `0_NUCLEO/TRATO.md`
- Entreno: `2_CUERPO/ENTRENAMIENTO.md` · Cuidado personal: `6_EQUIPO/SKINCARE.md`
- Formación (curso o libro): `0_NUCLEO/FENIX.md` y `3_MENTE/LIBRO.md`
- Tema, sonidos, intro y contraseña: *Ajustes › ÓRBITA*

O, más fácil: díselo al Director en el chat.

## 8. Problemas frecuentes

- **No sale la Bienvenida:** *Ajustes › ÓRBITA › Bienvenida › Abrir*, o paleta de comandos (Ctrl/Cmd+P) → «Bienvenida».
- **No veo ÓRBITA:** *Ajustes → Plugins de la comunidad*: desactiva el modo restringido y enciende ÓRBITA.
- **El chat no contesta:** mira *Ajustes › ÓRBITA › Inteligencia artificial*. Con Claude Code debe poner «✓ encontrado»; con clave, pulsa Probar en la Bienvenida.
- **Error 401:** la clave está mal copiada. **Error 429 o «credit»:** falta saldo en la web de la API.
- **No aparece la nota de hoy:** espera 1 minuto o pulsa «Crearla» en Hoy.

## 9. Actualizar ÓRBITA

**Es automático.** Cada vez que abres Obsidian (y cada 6 horas), ÓRBITA mira si hay una versión nueva en GitHub. Si la hay, se descarga sola, te avisa y se recarga en unos segundos. Solo cambia el programa: **tus notas no se tocan nunca**.

- Para comprobarlo a mano: *Ajustes › ÓRBITA › Actualizaciones automáticas › Buscar ahora*.
- Para desactivarlo: el mismo interruptor.
- En el móvil, la actualización llega con la sincronización desde el ordenador.
