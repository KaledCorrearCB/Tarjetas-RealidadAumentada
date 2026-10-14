
import './style.css';

import * as THREE from 'three';
import { MindARThree } from 'mind-ar/dist/mindar-image-three.prod.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ==========================================
// CONFIGURACIÓN GENERAL
// ==========================================

const status = document.querySelector('#status');

const mindar = new MindARThree({
  container: document.querySelector('#app'),
  imageTargetSrc: '/targets/tarjeta.mind'
});

const { renderer, scene, camera } = mindar;

renderer.outputColorSpace = THREE.SRGBColorSpace;

// ==========================================
// ILUMINACIÓN
// ==========================================

const ambientLight = new THREE.HemisphereLight(
  0xffffff,
  0x777799,
  2
);

scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(
  0xffffff,
  2
);

directionalLight.position.set(1, 2, 3);

scene.add(directionalLight);

// ==========================================
// ANCLA DE MINDAR
// ==========================================

// El índice 0 corresponde a la primera imagen
// guardada en el archivo tarjeta.mind.

const anchor = mindar.addAnchor(0);

// Grupo principal unido al centro de la tarjeta.
const pivot = new THREE.Group();

anchor.group.add(pivot);

// Grupo que permite rotar el personaje
// sobre el eje perpendicular a la tarjeta.
const characterPivot = new THREE.Group();

pivot.add(characterPivot);

// ==========================================
// CONFIGURACIÓN DEL PERSONAJE
// ==========================================

// Tamaño máximo del personaje.
// Puedes aumentarlo o reducirlo posteriormente.

const MODEL_SIZE = 1.30;

// Velocidad de rotación en radianes por segundo.
const ROTATION_SPEED = 0.6;

// Orientación inicial del modelo.
// Se asume que el GLB tiene Y como eje vertical.

const MODEL_ROTATION_X = Math.PI / 2;

// ==========================================
// CARGA DEL MODELO 3D
// ==========================================

const loader = new GLTFLoader();

let model;

try {

  const gltf = await loader.loadAsync(
    '/models/modelo.glb'
  );

  model = gltf.scene;

  // Reiniciar las transformaciones externas.
  // No alteramos las transformaciones internas
  // de las piezas que componen el GLB.

  model.position.set(0, 0, 0);

  // ========================================
  // NORMALIZAR EL TAMAÑO
  // ========================================

  const originalBounds = new THREE.Box3().setFromObject(
    model
  );

  const originalSize = originalBounds.getSize(
    new THREE.Vector3()
  );

  const maxDimension = Math.max(
    originalSize.x,
    originalSize.y,
    originalSize.z
  );

  const scale = maxDimension > 0
    ? MODEL_SIZE / maxDimension
    : 1;

  model.scale.multiplyScalar(scale);

  // ========================================
  // COLOCAR EL PERSONAJE DE PIE
  // ========================================

  // El plano de la tarjeta utiliza X e Y.
  // Su dirección perpendicular es Z.
  //
  // Rotamos el personaje para que su eje
  // vertical original apunte hacia Z.

  model.rotation.x = MODEL_ROTATION_X;

  // Añadir el personaje a su pivote.
  characterPivot.add(model);

  // Actualizar las transformaciones antes
  // de calcular sus dimensiones finales.

  model.updateMatrixWorld(true);

  // ========================================
  // CENTRAR Y APOYAR SOBRE LA TARJETA
  // ========================================

  const bounds = new THREE.Box3().setFromObject(
    model
  );

  const center = bounds.getCenter(
    new THREE.Vector3()
  );

  // Centrar horizontalmente en la tarjeta.
  //
  // Usar -bounds.min.z permite que la parte
  // inferior del personaje quede en Z = 0.

  model.position.x -= center.x;
  model.position.y -= center.y;
  model.position.z -= bounds.min.z;

  model.updateMatrixWorld(true);

  console.log('Modelo 3D cargado correctamente.');

} catch (error) {

  console.warn(
    'No se pudo cargar modelo.glb. Se mostrará un objeto de prueba.',
    error
  );

  // ========================================
  // OBJETO DE PRUEBA
  // ========================================

  model = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.28, 1),
    new THREE.MeshStandardMaterial({
      color: 0x55ddff,
      metalness: 0.35,
      roughness: 0.25
    })
  );

  // El objeto tiene radio 0.28.
  // Lo elevamos esa distancia para que
  // no atraviese la tarjeta.

  model.position.z = 0.28;

  characterPivot.add(model);
}

// ==========================================
// POSICIÓN PRINCIPAL
// ==========================================

// Z = 0 corresponde al plano de la tarjeta.
// El modelo ya tiene compensada su altura.

pivot.position.set(0, 0, 0);

// ==========================================
// EVENTOS DE DETECCIÓN
// ==========================================

anchor.onTargetFound = () => {

  if (status) {
    status.textContent = 'Tarjeta detectada';
  }

};

anchor.onTargetLost = () => {

  if (status) {
    status.textContent = 'Apunta a la tarjeta';
  }

};

// ==========================================
// ANIMACIÓN
// ==========================================

const clock = new THREE.Clock();

async function start() {

  try {

    // Iniciar cámara y reconocimiento.
    await mindar.start();

    if (status) {
      status.textContent = 'Apunta a la tarjeta';
    }

    // Reiniciar el reloj al iniciar.
    clock.start();

    renderer.setAnimationLoop(() => {

      // Tiempo transcurrido entre fotogramas.
      const delta = clock.getDelta();

      // ====================================
      // ROTACIÓN SOBRE SU PROPIO EJE
      // ====================================

      // El eje Z es perpendicular al plano
      // de la imagen detectada.
      //
      // El personaje gira sobre sí mismo,
      // sin modificar la posición del pivot.

      characterPivot.rotation.z +=
        delta * ROTATION_SPEED;

      // Renderizar la escena.
      renderer.render(scene, camera);

    });

  } catch (error) {

    console.error(
      'Error al iniciar MindAR:',
      error
    );

    if (status) {
      status.textContent =
        'No se pudo iniciar la cámara. Comprueba los permisos.';
    }

  }

}

// ==========================================
// INICIAR APLICACIÓN
// ==========================================

start();
