import Utils from "./utils/Utils";
import * as THREE from "three";

export default class Vehicle {
  constructor(scene, startNode, roadNetwork, speed) {
    this.scene = scene;
    this.roadNetwork = roadNetwork;
    this.path = this.generateRandomPath(Utils.pointToKey(startNode));
    this.currentIndex = 0;
    this.mesh = this.createVehicleMesh(startNode);
    this.speed = speed;
    this.stepProgress = 0;
  }

  createVehicleMesh(position) {
    const geometry = new THREE.BoxGeometry(1, 1, 2);
    const material = new THREE.MeshBasicMaterial({
      color: Math.random() * 0xffffff,
    });
    const box = new THREE.Mesh(geometry, material);
    box.position.copy(position).add(new THREE.Vector3(0, 0.5, 0));
    this.scene.add(box);
    return box;
  }

  generateRandomPath(startKey) {
    const path = [startKey];
    let currentKey = startKey;

    for (let i = 0; i < 10; i++) {
      // Shorter path for memory efficiency
      const neighbors = this.roadNetwork.graph[currentKey];
      if (!neighbors || !neighbors.length) break;

      currentKey = neighbors[Math.floor(Math.random() * neighbors.length)];
      path.push(currentKey);
    }
    return path;
  }

  move() {
    if (this.currentIndex < this.path.length - 1) {
      const start = Utils.keyToPoint(this.path[this.currentIndex]);
      const end = Utils.keyToPoint(this.path[this.currentIndex + 1]);

      this.mesh.position.lerpVectors(start, end, this.stepProgress);
      this.stepProgress += this.speed;

      if (this.stepProgress >= 1) {
        this.currentIndex++;
        this.stepProgress = 0;
      }
    }
  }
}
