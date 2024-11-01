import * as THREE from "three";

export default class Road {
  constructor(scene, start, end, width = 5) {
    this.scene = scene;
    this.start = start;
    this.end = end;
    this.width = width;
  }

  drawRoad() {
    const roadLength = this.start.distanceTo(this.end);
    const roadGeometry = new THREE.PlaneGeometry(this.width, roadLength);
    roadGeometry.rotateX(-Math.PI / 2);

    const roadMaterial = new THREE.MeshLambertMaterial({
      color: 0x808080,
      side: THREE.DoubleSide,
    });
    const roadMesh = new THREE.Mesh(roadGeometry, roadMaterial);
    roadMesh.position.copy(this.start.clone().add(this.end).divideScalar(2));
    roadMesh.position.y += 0.01;
    roadMesh.lookAt(this.end);
    this.scene.add(roadMesh);
    this.addRoadMarkings();
  }

  addRoadMarkings() {
    const dashLength = 0.5;
    const totalDashes = Math.floor(
      this.start.distanceTo(this.end) / dashLength
    );
    const markingMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

    for (let i = 0; i < totalDashes; i += 2) {
      const markingGeometry = new THREE.PlaneGeometry(0.1, dashLength);
      markingGeometry.rotateX(-Math.PI / 2);

      const marking = new THREE.Mesh(markingGeometry, markingMaterial);
      marking.position
        .copy(this.start.clone().lerp(this.end, i / totalDashes))
        .add(new THREE.Vector3(0, 0.02, 0));
      marking.lookAt(this.end);
      console.log("marking", marking);
      this.scene.add(marking);
    }
  }
}
