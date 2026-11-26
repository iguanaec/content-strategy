# Motion 3D v10

Escena Three.js (`scene5.html` = `head5.html props5.js rig5.js sets5.js main5a-d.js`), renderizada cuadro a cuadro con Playwright y ensamblada con Remotion (voz + efectos, sin música).

- Personajes: `rig5.js`. Dani con barba completa y peinado con degradado y copete; los demás con ropa de cualquier color. Los textos y elementos gráficos usan los colores de Iguana.
- Sets: `sets5.js` (tienda con ventana a la calle, puerta, caja registradora y estantes; fachada y casa de noche; comedor).
- Planos: `main5c.js`, todos con corte seco y sincronizados por palabra con `assets/timeline6.json`. Subtítulos: `main5b.js`.
- Render: servir esta carpeta (`python3 -m http.server 8765`), `node render.js`, luego Remotion (`../remotion`) y masterización a −14 LUFS.
