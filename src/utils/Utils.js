import * as THREE from "three";

export default class Utils {
  static pointToKey(point) {
    return `${point.x.toFixed(2)},${point.z.toFixed(2)}`;
  }

  static keyToPoint(key) {
    const [x, z] = key.split(",").map(Number);
    return new THREE.Vector3(x, 0, z);
  }

  static checkIntersection(p1, p2, p3, p4) {
    const denominator =
      (p1.x - p2.x) * (p3.z - p4.z) - (p1.z - p2.z) * (p3.x - p4.x);
    if (denominator === 0) return null;

    const t =
      ((p1.x - p3.x) * (p3.z - p4.z) - (p1.z - p3.z) * (p3.x - p4.x)) /
      denominator;
    const u =
      -((p1.x - p2.x) * (p1.z - p3.z) - (p1.z - p2.z) * (p1.x - p3.x)) /
      denominator;

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return new THREE.Vector3(
        p1.x + t * (p2.x - p1.x),
        0,
        p1.z + t * (p2.z - p1.z)
      );
    }
    return null;
  }
}
