import * as THREE from 'three';

export const createShape = (scene) => {
const geometry = new THREE.TetrahedronGeometry(2, 0);
const material = new THREE.LineBasicMaterial( { color: 0xffff00 } );
const tetrahedron = new THREE.Line( geometry, material );
scene.add( tetrahedron );
}