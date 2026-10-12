# Tarjeta AR con MindAR y Three.js

## Preparación
1. Instala Node.js LTS.
2. Abre esta carpeta en Visual Studio Code y ejecuta `npm install`.
3. En el compilador de imágenes de MindAR (https://hiukim.github.io/mind-ar-js-doc/tools/compile/) carga la imagen exacta que imprimirás en la tarjeta, compila y descarga el archivo `.mind`.
4. Renómbralo `tarjeta.mind` y guárdalo en `public/targets/`.
5. Guarda tu modelo GLB en `public/models/modelo.glb`. Si falta, aparece un icosaedro de prueba.
6. Ejecuta `npm run dev` y abre la dirección local indicada.

## Prueba con móvil
La cámara exige un contexto seguro: localhost en el propio dispositivo o una URL HTTPS. La dirección IP local HTTP de Vite normalmente NO permite acceso a cámara desde otro dispositivo. Despliega `npm run build` (carpeta dist) en un hosting HTTPS como Netlify/Vercel, o usa un túnel HTTPS hacia Vite.

## Ajustes
En `src/main.js`, cambia `Math.PI * 2 / 8` para variar la duración del giro (8 segundos); cambia `0.22` para elevar el objeto y `0.035` para la amplitud de flotación. El eje Z es perpendicular al plano de la tarjeta. Si tu modelo tiene orientación distinta, ajusta la rotación de su contenedor o usa un grupo anidado.

## Consejos de seguimiento
Usa una imagen con detalles, contraste y textura distintivos; evita grandes áreas lisas o patrones repetidos. Compila la misma imagen que se imprimirá y prueba con luz uniforme sin reflejos.
