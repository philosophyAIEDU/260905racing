import {
  Box3,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Vector3,
  type Object3D,
  type Material,
} from 'three';

export interface CarAsset {
  body: Group;
  wheels: Group[];
}
const cache = new WeakMap<Object3D, CarAsset>();
const wheelNames = ['wheel_fl', 'wheel_fr', 'wheel_rl', 'wheel_rr'];
function finishMaterial(material: Material, name: string): Material {
  if (!(material instanceof MeshStandardMaterial)) return material.clone();
  const m = material.clone();
  if (name === 'body')
    return new MeshPhysicalMaterial({
      color: '#d71932',
      metalness: 0.7,
      roughness: 0.24,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
    });
  if (/lights_red/.test(name)) {
    m.emissive.set('#a90011');
    m.emissiveIntensity = 1.5;
    return m;
  }
  if (name === 'leds') {
    m.emissive.set('#d8f1ff');
    m.emissiveIntensity = 1.2;
    return m;
  }
  if (name === 'glass' || /glass/i.test(m.name)) {
    return new MeshPhysicalMaterial({
      color: '#91adbb',
      metalness: 0.2,
      roughness: 0.08,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
      clearcoat: 1,
    });
  }
  if (/rim|trim/i.test(name)) {
    m.metalness = 0.9;
    m.roughness = 0.28;
  }
  if (/tire|rubber/i.test(m.name + name)) {
    m.color.set('#15171a');
    m.metalness = 0;
    m.roughness = 0.9;
  }
  return m;
}

export function prepareCar(source: Group): CarAsset {
  const existing = cache.get(source);
  if (existing) return existing;
  const root = source.clone(true);
  root.updateMatrixWorld(true);
  let wheelNodes = wheelNames.map((name) => root.getObjectByName(name));
  if (wheelNodes.some((node) => !node)) throw new Error('Car wheel hierarchy is missing');
  const center = (node: Object3D): Vector3 =>
    new Box3().setFromObject(node).getCenter(new Vector3());
  if (center(wheelNodes[0]!).z < center(wheelNodes[2]!).z) root.rotateY(Math.PI);
  root.updateMatrixWorld(true);
  wheelNodes = wheelNames.map((name) => root.getObjectByName(name));
  const centers = wheelNodes.map((node) => center(node!));
  const front = centers[0]!.clone().add(centers[1]!).multiplyScalar(0.5);
  const rear = centers[2]!.clone().add(centers[3]!).multiplyScalar(0.5);
  const mid = front.clone().add(rear).multiplyScalar(0.5);
  const wheelSize = new Box3().setFromObject(wheelNodes[0]!).getSize(new Vector3());
  const sx = 1.88 / Math.abs(centers[0]!.x - centers[1]!.x);
  const sy = 0.72 / wheelSize.y;
  const sz = 2.5 / Math.abs(front.z - rear.z);
  const body = new Group();
  const wheels = Array.from({ length: 4 }, () => new Group());
  root.traverse((node) => {
    if (!(node instanceof Mesh)) return;
    const wheelIndex = wheelNodes.findIndex((wheel) => {
      let parent: Object3D | null = node;
      while (parent) {
        if (parent === wheel) return true;
        parent = parent.parent;
      }
      return false;
    });
    const geometry = node.geometry.clone().applyMatrix4(node.matrixWorld);
    geometry.translate(-mid.x, -front.y, -mid.z).scale(sx, sy, sz).translate(0, -0.42, 0);
    const materials = Array.isArray(node.material)
      ? node.material.map((m: Material) => finishMaterial(m, node.name))
      : finishMaterial(node.material, node.name);
    const mesh = new Mesh(geometry, materials);
    mesh.name = node.name;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    if (wheelIndex >= 0) {
      const c = centers[wheelIndex]!;
      geometry.translate(-(c.x - mid.x) * sx, 0.42 - (c.y - front.y) * sy, -(c.z - mid.z) * sz);
      // The physical wheel order is local -X front, +X front, -X rear, +X rear.
      const index = (c.z > mid.z ? 0 : 2) + (c.x > mid.x ? 1 : 0);
      wheels[index]!.add(mesh);
    } else body.add(mesh);
  });
  const asset = { body, wheels };
  cache.set(source, asset);
  return asset;
}
