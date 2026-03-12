import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
// await RAPIER.init();
// export const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });

export const platformSize = { x: 1, y: 0.05, z: 2 };

export const platform = () => {
    const geometry = new THREE.BoxGeometry(platformSize.x, platformSize.y, platformSize.z, 1, 1, 1);
    // const material = new THREE.MeshNormalMaterial();
    const edges = new THREE.WireframeGeometry(geometry);
    const material = new THREE.LineBasicMaterial({ color: 0xffffff });
    const platform = new THREE.LineSegments(edges, material);
    return platform;
}
//     const platform = new THREE.Mesh(geometry, material);
//     return platform;
// };

export const rigidPlatform = (mesh) => {
    const body = world.createRigidBody(
        RAPIER.RigidBodyDesc.fixed()
            .setTranslation(mesh.position.x, mesh.position.y, mesh.position.z)
    );
    const colliderDesc = RAPIER.ColliderDesc.cuboid(platformSize.x / 2, platformSize.y / 2, platformSize.z / 2);
    world.createCollider(colliderDesc, body);
};