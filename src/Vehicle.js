import Utils from "./utils/Utils";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";

export default class Vehicle {
  constructor(scene, startNode, roadNetwork, speed) {
    this.scene = scene;
    this.roadNetwork = roadNetwork;
    this.path = this.generateRandomPath(Utils.pointToKey(startNode));
    this.currentIndex = 0;
    this.mesh = this.loadModel(startNode);
    this.speed = speed;
    this.stepProgress = 0;
    this.laneOffset = 1.25;
  }

  loadModel() {
    const loader = new GLTFLoader();
    const cars = ["2021_lamborghini_countach.glb", "1991_porsche_944.glb"];
    const car = cars[Math.floor(Math.random() * cars.length)];
    loader.load(`assets/${car}`, (gltf) => {
      this.mesh = gltf.scene;
      this.mesh.scale.set(0.2, 0.2, 0.2);
      // console.log(this.mesh);

      this.scene.add(this.mesh);
    });
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
      const direction = new THREE.Vector3().subVectors(end, start).normalize();
      //   const bb = new THREE.Box3().setFromObject(this.mesh);
      //   const carHeight = bb.max.y - bb.min.y;
      //   console.log(this.mesh.position);
      const perpendicular = new THREE.Vector3(
        -direction.z,
        0,
        direction.x
      ).normalize();
      const offsetPosition = start
        .clone()
        .add(perpendicular.multiplyScalar(this.laneOffset));
      console.log(this.mesh);
      this.mesh.position.lerpVectors(
        offsetPosition,
        end.clone().add(perpendicular.multiplyScalar(this.laneOffset)),
        this.stepProgress
      );
      //   console.log(this.mesh.position);
      this.mesh.lookAt(
        end.clone().add(perpendicular.multiplyScalar(this.laneOffset))
      ); // Rotate vehicle to look towards the end point
      this.stepProgress += this.speed;
      if (this.stepProgress >= 1) {
        this.currentIndex++;
        this.stepProgress = 0;
      }
    }
  }
}
