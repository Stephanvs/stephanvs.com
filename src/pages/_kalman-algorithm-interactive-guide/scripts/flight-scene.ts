import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import type { Frame } from '../lib/aircraft';
import type { Pose, TruthSample } from '../lib/flight';
import type { Enu } from '../lib/geo';

export type CameraMode = 'chase' | 'overview' | 'top' | 'side';

const aircraftScale = 4;
const toWorld = (p: Enu, target = new THREE.Vector3()) => target.set(p.east, p.up, -p.north);

function resolveColor(value: string): THREE.Color {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const context = canvas.getContext('2d', { willReadFrequently: true })!;
  context.fillStyle = value.trim() || '#888';
  context.fillRect(0, 0, 1, 1);
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
  return new THREE.Color().setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace);
}

function buildAircraft(material: THREE.Material): THREE.Group {
  const group = new THREE.Group();
  const add = (geometry: THREE.BufferGeometry, x: number, y: number, z: number) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    group.add(mesh);
    return mesh;
  };
  const fuselage = add(new THREE.CylinderGeometry(1.5, 1.1, 28, 12), 0, 0, 0);
  fuselage.rotation.x = Math.PI / 2;
  const nose = add(new THREE.ConeGeometry(1.5, 4, 12), 0, 0, -16);
  nose.rotation.x = -Math.PI / 2;
  add(new THREE.BoxGeometry(32, 0.5, 4.5), 0, -0.4, -2);
  add(new THREE.BoxGeometry(11, 0.4, 2.6), 0, 0.4, 12.5);
  add(new THREE.BoxGeometry(0.45, 5.5, 3.4), 0, 3, 12.6);
  group.scale.setScalar(aircraftScale);
  group.rotation.order = 'YXZ';
  return group;
}

function orient(group: THREE.Object3D, pose: Pose) {
  toWorld(pose, group.position);
  group.rotation.set(pose.pitch, -pose.yaw, -pose.roll, 'YXZ');
}

function fatTrail(material: LineMaterial, points: Enu[]) {
  const geometry = new LineGeometry();
  geometry.setPositions(points.flatMap((p) => [p.east, p.up, -p.north]));
  return new Line2(geometry, material);
}

const showFirst = (line: Line2, count: number) => {
  line.geometry.instanceCount = Math.max(0, count - 1);
};

function trail(material: THREE.LineBasicMaterial, points: Enu[]) {
  const positions = new Float32Array(points.length * 3);
  points.forEach((p, i) => positions.set([p.east, p.up, -p.north], i * 3));
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  return new THREE.Line(geometry, material);
}

export function createFlightScene(stage: HTMLElement, truth: TruthSample[]) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  stage.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 16 / 9, 5, 80000);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.maxPolarAngle = Math.PI / 2 - 0.02;

  const bounds = new THREE.Box3();
  truth.forEach((s) => bounds.expandByPoint(toWorld(s)));
  const centre = bounds.getCenter(new THREE.Vector3()).setY(0);
  const extent = bounds.getSize(new THREE.Vector3());
  const radius = Math.max(extent.x, extent.z);

  const materials = {
    truth: new LineMaterial({ linewidth: 1.5, transparent: true, opacity: 0.85 }),
    plan: new THREE.LineBasicMaterial({ transparent: true, opacity: 0.25 }),
    estimate: new LineMaterial({ linewidth: 2.5 }),
    drop: new THREE.LineBasicMaterial({ transparent: true, opacity: 0.35 }),
    fixes: new THREE.PointsMaterial({ size: 5, sizeAttenuation: false, transparent: true, opacity: 0.85 }),
    body: new THREE.MeshLambertMaterial(),
    ghost: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.28, depthWrite: false }),
    ellipsoid: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.16, depthWrite: false }),
    runway: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.5 })
  };

  const grid = new THREE.GridHelper(Math.ceil(radius / 1000 + 4) * 1000, Math.ceil(radius / 1000 + 4), 0x888888, 0x888888);
  grid.position.copy(centre);
  (grid.material as THREE.LineBasicMaterial).transparent = true;
  (grid.material as THREE.LineBasicMaterial).opacity = 0.5;
  const runway = new THREE.Mesh(new THREE.PlaneGeometry(2200, 45), materials.runway);
  runway.rotation.x = -Math.PI / 2;
  runway.position.set(900, 0.5, 0);

  const plan = trail(materials.plan, truth);
  const truthTrail = fatTrail(materials.truth, truth);
  let estimateTrail = fatTrail(materials.estimate, truth.slice(0, 2));
  let fixes = new THREE.Points(new THREE.BufferGeometry(), materials.fixes);
  const drop = trail(materials.drop, [truth[0], truth[0]]);
  const ghost = buildAircraft(materials.ghost);
  const aircraft = buildAircraft(materials.body);
  const ellipsoid = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), materials.ellipsoid);

  scene.add(grid, runway, plan, truthTrail, estimateTrail, fixes, drop, ghost, aircraft, ellipsoid);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x777777, 2.2));
  const sun = new THREE.DirectionalLight(0xffffff, 1.4);
  sun.position.set(-1, 2, 1);
  scene.add(sun);

  let frames: Frame[] = [];
  let fixTimes: number[] = [];
  let mode: CameraMode = 'chase';
  let index = 0;
  const chaseOffset = new THREE.Vector3();
  const lookAt = new THREE.Vector3();

  function applyColors() {
    const style = getComputedStyle(stage);
    const ink = resolveColor(style.getPropertyValue('--kf-truth'));
    const faint = resolveColor(style.getPropertyValue('--kf-reading'));
    const accent = resolveColor(style.getPropertyValue('--kf-estimate'));
    const line = resolveColor(style.getPropertyValue('--kf-grid'));
    materials.truth.color.copy(ink);
    materials.plan.color.copy(ink);
    materials.ghost.color.copy(ink);
    materials.drop.color.copy(accent);
    materials.estimate.color.copy(accent);
    materials.body.color.copy(accent);
    materials.ellipsoid.color.copy(accent);
    materials.fixes.color.copy(faint);
    materials.runway.color.copy(faint);
    (grid.material as THREE.LineBasicMaterial).color.copy(line);
    render();
  }

  function setRun(next: Frame[], gpsFixes: { t: number; point: Enu }[]) {
    frames = next;
    scene.remove(estimateTrail, fixes);
    estimateTrail.geometry.dispose();
    fixes.geometry.dispose();
    estimateTrail = fatTrail(materials.estimate, frames.map((f) => f.estimate));
    const positions = new Float32Array(gpsFixes.length * 3);
    gpsFixes.forEach(({ point }, i) => positions.set([point.east, point.up, -point.north], i * 3));
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    fixes = new THREE.Points(geometry, materials.fixes);
    fixTimes = gpsFixes.map((f) => f.t);
    scene.add(estimateTrail, fixes);
    show(Math.min(index, frames.length - 1), true);
  }

  function placeCamera(snap: boolean) {
    const frame = frames[index];
    if (!frame) return;
    const target = toWorld(frame.estimate, new THREE.Vector3());
    if (mode === 'chase') {
      const heading = frame.estimate.yaw;
      chaseOffset.set(-Math.sin(heading) * 240 + Math.cos(heading) * 110, 75, Math.cos(heading) * 240 + Math.sin(heading) * 110);
      const desired = target.clone().add(chaseOffset);
      const ahead = target.clone().add(new THREE.Vector3(Math.sin(heading) * 120, 0, -Math.cos(heading) * 120));
      if (snap) camera.position.copy(desired);
      else camera.position.lerp(desired, 0.08);
      lookAt.lerp(ahead, snap ? 1 : 0.25);
      camera.lookAt(lookAt);
      return;
    }
    if (!snap) return;
    if (mode === 'overview') camera.position.set(centre.x - radius * 0.3, radius * 0.32, centre.z + radius * 0.55);
    if (mode === 'top') camera.position.set(centre.x, radius * 0.95, centre.z + 1);
    if (mode === 'side') camera.position.set(centre.x, 350, centre.z + radius * 0.85);
    controls.target.set(centre.x, mode === 'side' ? 350 : 0, centre.z);
    controls.update();
  }

  function show(next: number, snap = false) {
    index = next;
    const frame = frames[index];
    if (!frame) return;
    const sample = Math.round(frame.t * 50);
    showFirst(truthTrail, sample + 1);
    showFirst(estimateTrail, index + 1);
    let fixCount = 0;
    while (fixCount < fixTimes.length && fixTimes[fixCount] <= frame.t) fixCount++;
    fixes.geometry.setDrawRange(0, fixCount);
    orient(ghost, frame.truth);
    orient(aircraft, frame.estimate);
    toWorld(frame.estimate, ellipsoid.position);
    ellipsoid.scale.set(2 * frame.sigma.east, 2 * frame.sigma.up, 2 * frame.sigma.north);
    const positions = drop.geometry.getAttribute('position') as THREE.BufferAttribute;
    positions.setXYZ(0, frame.estimate.east, frame.estimate.up, -frame.estimate.north);
    positions.setXYZ(1, frame.estimate.east, 0, -frame.estimate.north);
    positions.needsUpdate = true;
    drop.geometry.computeBoundingSphere();
    placeCamera(snap);
  }

  function setCamera(next: CameraMode) {
    mode = next;
    controls.enabled = mode !== 'chase';
    placeCamera(true);
    render();
  }

  function resize() {
    const { clientWidth: width, clientHeight: height } = stage;
    renderer.setSize(width, height, false);
    materials.truth.resolution.set(width, height);
    materials.estimate.resolution.set(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    render();
  }

  function render() {
    if (mode !== 'chase') controls.update();
    renderer.render(scene, camera);
  }

  controls.addEventListener('change', () => {
    if (mode !== 'chase') renderer.render(scene, camera);
  });
  new ResizeObserver(resize).observe(stage);
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyColors);
  resize();
  applyColors();
  setCamera('chase');

  return { setRun, show, setCamera, render };
}
