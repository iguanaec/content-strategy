# Motion 3D v10

Escena Three.js (`scene5.html` = `head5.html props5.js rig5.js sets5.js main5a-d.js`), renderizada cuadro a cuadro con Playwright y ensamblada con Remotion (voz + efectos, sin música).

- Personajes: `rig5.js`. Dani con barba completa y peinado con degradado y copete; los demás con ropa de cualquier color. Los textos y elementos gráficos usan los colores de Iguana.
- Sets: `sets5.js` (tienda con ventana a la calle, puerta, caja registradora y estantes; fachada y casa de noche; comedor).
- Planos: `main5c.js`, todos con corte seco y sincronizados por palabra con `assets/timeline6.json`. Subtítulos: `main5b.js`.
- Render: servir esta carpeta (`python3 -m http.server 8765`), `node render.js`, luego Remotion (`../remotion`) y masterización a −14 LUFS.

## v11
- Iluminación: luz ambiental suave (entorno) + luz principal con sombra muy tenue + luces de relleno y contraluz; tone mapping neutro. Sin zonas oscuras ni sombras duras.
- Fondos con poco ruido visual: estantes con pocos objetos en tonos suaves, ventana con edificios lisos, sin pósters ni plantas.
- El 22 % ocupa el cuadro sobre un fondo verde bosque (su ancho se ajusta solo al encuadre).
- Peinado de Dani pegado a la cabeza; tarjeta final con fondo blanco.
- Subtítulos con velo inferior neutro para leerse sobre fondos claros.

## v12
- Barba nueva (volumétrica, mandíbula + bigote) y peinado con raya al lado; sin mejillas rosadas.
- Cierre: la voz dice "Con Iguana, recupera tus horas." y la tarjeta blanca entra con disolvencia suave (sin corte). El botón "Agenda tu demo gratis" queda solo en pantalla.
- Duración 35,9 s. Voz del cierre = empalme del clon (pronunciación de "Iguana" no verificada de oído).
