
import './style.css';
import * as THREE from 'three';
import { MindARThree } from 'mind-ar/dist/mindar-image-three.prod.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const status = document.querySelector('#status');

console.log(
  'URL del archivo:',
  new URL('/targets/tarjeta.mind', location.origin).href
);

const mindar = new MindARThree({
  container: document.querySelector('#app'),
  imageTargetSrc: '/targets/tarjeta.mind'
});

const { renderer, scene, camera } = mindar;

renderer.outputColorSpace = THREE.SRGBColorSpace;

scene.add(
  new THREE.HemisphereLight(0xffffff, 0x777799, 2)
);

const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(1, 2, 3);
scene.add(light);

const anchor = mindar.addAnchor(0);

// Pivote principal: permanece unido a la tarjeta.
const pivot = new THREE.Group();
anchor.group.add(pivot);

// Pivote del personaje: permite girarlo sobre su centro.
const characterPivot = new THREE.Group();
pivot.add(characterPivot);

const loader = new GLTFLoader();
let model;

try {
  const gltf = await loader.loadAsync('/models/modelo.glb');
  model = gltf.scene;

  // Calcular el centro y las dimensiones del modelo.
  const bounds = new THREE.Box3().setFromObject(model);
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());

  // Centrar el modelo respecto a su propio pivote.
  model.position.sub(center);

  // Normalizar su tamaño.
  const maxDimension = Math.max(size.x, size.y, size.z);
  const scale = maxDimension > 0 ? 0.65 / maxDimension : 1;
  model.scale.setScalar(scale);

  // Orientación inicial: prueba poner el personaje de pie.
  // Si queda tumbado, habrá que ajustar el eje según el GLB.
  model.rotation.x = -Math.PI / 2;

  characterPivot.add(model);

} catch (error) {
  console.warn(
    'No se pudo cargar modelo.glb; se mostrará un objeto de prueba.',
    error
  );

  model = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.28, 1),
    new THREE.MeshStandardMaterial({
      color: 0x55ddff,
      metalness: 0.35,
      roughness: 0.25
    })
  );

  characterPivot.add(model);
}

// Altura sobre la tarjeta.
pivot.position.z = 0.22;

anchor.onTargetFound = () => {
  status.textContent = 'Tarjeta detectada';
};

anchor.onTargetLost = () => {
  status.textContent = 'Apunta a la tarjeta';
};

const clock = new THREE.Clock();

async function start() {
  try {
    await mindar.start();

    status.textContent = 'Apunta a la tarjeta';

    renderer.setAnimationLoop(() => {
      const t = clock.getElapsedTime();

      // Girar el personaje sobre su propio eje vertical.
      characterPivot.rotation.y = t * (Math.PI * 2 / 8);

      // Pequeño movimiento vertical del conjunto.
      pivot.position.z = 0.22 + Math.sin(t * 1.5) * 0.035;

      renderer.render(scene, camera);
    });

  } catch (error) {
    console.error('Error al iniciar MindAR:', error);
    status.textContent =
      'No se pudo iniciar la cámara. Comprueba los permisos.';
  }
}

start();
