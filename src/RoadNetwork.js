import * as THREE from "three";
// import Bezier from "bezier-js";
import Utils from "./utils/Utils";
import Road from "./Road";

export default class RoadNetwork {
  constructor(scene) {
    this.scene = scene;
    this.points = [];
    this.roads = [];
    this.graph = new Map();
    this.maxRoads = 1000;
    this.plane = this.createGroundPlane();
  }

  createGroundPlane() {
    const planeGeometry = new THREE.PlaneGeometry(100, 100);
    const planeMaterial = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    this.scene.add(plane);
    return plane;
  }

  addPoint(point) {
    if (this.points.length >= this.maxRoads) return;
    this.points.push(point);
    this.addGraphNode(point);
    if (this.points.length > 1) {
      const start = this.points[this.points.length - 2];
      const end = this.points[this.points.length - 1];
      const road = new Road(this.scene, start, end);
      road.drawRoad();
      this.roads.push(road);
      this.addGraphEdge(start, end);
    }
  }

  addGraphNode(point) {
    const key = Utils.pointToKey(point);
    if (!this.graph[key]) this.graph[key] = [];
  }

  addGraphEdge(start, end) {
    const startKey = Utils.pointToKey(start);
    const endKey = Utils.pointToKey(end);
    if (!this.graph[startKey].includes(endKey))
      this.graph[startKey].push(endKey);
    if (!this.graph[endKey].includes(startKey))
      this.graph[endKey].push(startKey);
  }

  addRoadMarkings(start, end, roadWidth) {
    const dashLength = 0.5;
    const totalDashes = Math.floor(start.distanceTo(end) / dashLength);
    const markingMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

    for (let i = 0; i < totalDashes; i += 2) {
      const markingGeometry = new THREE.PlaneGeometry(0.1, dashLength);
      markingGeometry.rotateX(-Math.PI / 2);

      const marking = new THREE.Mesh(markingGeometry, markingMaterial);
      marking.position
        .copy(start.clone().lerp(end, i / totalDashes))
        .add(new THREE.Vector3(0, 0.02, 0));
      marking.lookAt(end);
      console.log("marking", marking);
      this.scene.add(marking);
    }
  }

  detectIntersections() {
    const checkedPairs = new Set(); // Set to store already checked pairs

    for (let i = 0; i < this.roads.length; i++) {
      for (let j = i + 1; j < this.roads.length; j++) {
        const road1 = this.roads[i];
        const road2 = this.roads[j];
        const key = `${road1.start.x.toFixed(2)},${road1.start.z.toFixed(
          2
        )}-${road1.end.x.toFixed(2)},${road1.end.z.toFixed(
          2
        )}-${road2.start.x.toFixed(2)},${road2.start.z.toFixed(
          2
        )}-${road2.end.x.toFixed(2)},${road2.end.z.toFixed(2)}`;

        if (!checkedPairs.has(key)) {
          const intersection = Utils.checkIntersection(
            road1.start,
            road1.end,
            road2.start,
            road2.end
          );
          if (
            intersection &&
            !this.points.find((p) => p.distanceTo(intersection) < 0.1)
          ) {
            // Check for existing point
            this.addPoint(intersection);
          }
          checkedPairs.add(key); // Add checked pair to the set
        }
      }
    }
  }

  getRandomPoint() {
    return this.points[Math.floor(Math.random() * this.points.length)];
  }
}
