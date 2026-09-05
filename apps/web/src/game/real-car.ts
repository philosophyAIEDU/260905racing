import {
  Group,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Vector3,
  type Material,
  type Object3D,
} from 'three';
export interface CarAsset {
  model: Group;
  wheels: Object3D[];
  scale: number;
  wheelY: number[];
  paint: MeshPhysicalMaterial;
}
export function prepareCar(source: Group): CarAsset {
  const model = source.clone(true);
  const wheels = ['wheel_fr', 'wheel_fl', 'wheel_rr', 'wheel_rl'].map((name) => {
    const wheel = model.getObjectByName(name);
    if (!wheel) throw new Error(`Missing vehicle part: ${name}`);
    return wheel;
  });
  const front = wheels[0]!.position.clone().add(wheels[1]!.position).multiplyScalar(0.5);
  const rear = wheels[2]!.position.clone().add(wheels[3]!.position).multiplyScalar(0.5);
  const scale = 2.5 / Math.abs(front.z - rear.z);
  const mid = front.clone().add(rear).multiplyScalar(0.5);
  const paint = new MeshPhysicalMaterial({
    color: '#d71932',
    metalness: 0.65,
    roughness: 0.25,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
  });
  const glass = new MeshPhysicalMaterial({
    color: '#718997',
    metalness: 0.15,
    roughness: 0.12,
    transparent: true,
    opacity: 0.32,
    depthWrite: false,
  });
  const materials = new Map<Material, Material>();
  model.traverse((node) => {
    if (!(node instanceof Mesh)) return;
    const original = node.material;
    if (!(original instanceof MeshStandardMaterial)) return;
    if (!materials.has(original)) {
      const material = original.clone();
      if (/metal|chrome/i.test(material.name)) {
        material.metalness = 0.85;
        material.roughness = 0.3;
      }
      if (/Tires|Leather|Carpet|Carbon/i.test(material.name)) {
        material.metalness = 0;
        material.roughness = 0.8;
        material.color.multiplyScalar(0.45);
      }
      if (/Taillight/.test(material.name)) {
        material.emissive.set('#730010');
        material.emissiveIntensity = 0.7;
      }
      materials.set(original, material);
    }
    node.material =
      node.name === 'body' ? paint : node.name === 'glass' ? glass : materials.get(original)!;
    node.castShadow = true;
    node.receiveShadow = true;
  });
  model.rotation.y = Math.PI;
  model.scale.setScalar(scale);
  model.position.copy(new Vector3(mid.x * scale, -0.42 - front.y * scale, mid.z * scale));
  return { model, wheels, scale, wheelY: wheels.map((wheel) => wheel.position.y), paint };
}
