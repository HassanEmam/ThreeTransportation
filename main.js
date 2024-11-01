import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls";

import "./style.css";

import RoadNetwork from "./src/RoadNetwork";
import Vehicle from "./src/Vehicle";
import Utils from "./src/utils/Utils";

class App {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      logarithmicDepthBuffer: true,
    });
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.roadNetwork = new RoadNetwork(this.scene);
    this.vehicles = [];
    this.maxVehicles = 10; // Limit vehicle count
    this.vehicleSpeed = 0.005;
    this.vehiclesPlaced = false;

    this.setupRenderer();
    this.addEventListeners();
    this.animate();
  }

  setupRenderer() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
    this.camera.position.set(0, 50, 100);
    this.camera.lookAt(0, 0, 0);
    this.renderer.setClearColor(0xffffff);

    const ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(10, 10, 10).normalize();
    this.scene.add(directionalLight);
  }

  addEventListeners() {
    window.addEventListener("click", (event) => this.onMouseClick(event));
    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
    const finishButton = document.createElement("button");
    finishButton.innerText = "Finish Drawing";
    finishButton.style.position = "absolute";
    finishButton.style.top = "10px";
    finishButton.style.left = "10px";
    finishButton.addEventListener("click", () => this.finishDrawing());
    document.body.appendChild(finishButton);
  }

  onMouseClick(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObject(this.roadNetwork.plane);

    if (intersects.length > 0) {
      const point = intersects[0].point.clone();
      this.roadNetwork.addPoint(point);
    }
  }

  finishDrawing() {
    this.roadNetwork.detectIntersections();
    console.log(this.roadNetwork.graph);
    this.placeVehicles();
    this.vehiclesPlaced = true;
  }

  placeVehicles() {
    for (let i = 0; i < this.maxVehicles; i++) {
      const startNode = this.roadNetwork.getRandomPoint();
      const vehicle = new Vehicle(
        this.scene,
        startNode,
        this.roadNetwork,
        this.vehicleSpeed
      );
      this.vehicles.push(vehicle);
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    if (this.vehiclesPlaced) {
      this.vehicles.forEach((vehicle) => vehicle.move());
    }
    this.renderer.render(this.scene, this.camera);
  }
}

new App();
