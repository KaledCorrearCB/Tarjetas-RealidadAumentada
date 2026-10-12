import './style.css';
import * as THREE from 'three';
import { MindARThree } from 'mind-ar/dist/mindar-image-three.prod.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const status = document.querySelector('#status');
const mindar = new MindARThree({ container: document.querySelector('#app'), imageTargetSrc: '/targets/tarjeta.mind' });
const {renderer, scene, camera} = mindar;
renderer.outputColorSpace = THREE.SRGBColorSpace;
scene.add(new THREE.HemisphereLight(0xffffff, 0x777799, 2));
const light = new THREE.DirectionalLight(0xffffff, 2); light.position.set(1, 2, 3); scene.add(light);
const anchor = mindar.addAnchor(0);
const pivot = new THREE.Group(); anchor.group.add(pivot);
const loader = new GLTFLoader();
let model;
try {
  const gltf = await loader.loadAsync('/models/modelo.glb');
  model = gltf.scene;
  // Centrar geometría y normalizar su dimensión mayor a 1 unidad de ancho/alto.
  const bounds = new THREE.Box3().setFromObject(model);
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  model.position.sub(center);
  const scale = 0.65 / Math.max(size.x, size.y, size.z);
  model.scale.setScalar(scale);
  pivot.add(model);
} catch (error) {
  console.warn('No se pudo cargar modelo.glb; se mostrará un objeto de prueba.', error);
  model = new THREE.Mesh(new THREE.IcosahedronGeometry(0.28, 1), new THREE.MeshStandardMaterial({color:0x55ddff, metalness:0.35, roughness:0.25}));
  pivot.add(model);
}
// MindAR usa coordenadas normalizadas sobre la imagen; z positivo sale de la tarjeta.
pivot.position.z = 0.22;
anchor.onTargetFound = () => {status.textContent = 'Tarjeta detectada';};
anchor.onTargetLost = () => {status.textContent = 'Apunta a la tarjeta';};
const clock = new THREE.Clock();
async function start() {
  try {
    await mindar.start();
    status.textContent = 'Apunta a la tarjeta';
    renderer.setAnimationLoop(() => {
      const t = clock.getElapsedTime();
      pivot.rotation.z = t * (Math.PI * 2 / 8); // 360 grados cada 8 segundos, eje perpendicular a la tarjeta.
      pivot.position.z = 0.22 + Math.sin(t * 1.5) * 0.035;
      renderer.render(scene, camera);
    });
  } catch (error) {console.error(error); status.textContent = 'No se pudo iniciar la cámara. Usa HTTPS o localhost y concede permiso.';}
}
start();
