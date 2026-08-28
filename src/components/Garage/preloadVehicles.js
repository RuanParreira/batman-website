import { useGLTF } from "@react-three/drei";

/**
 * Pre-carrega os .glb ja registrados em vehicles.js.
 * No-op enquanto todos os `model` forem null.
 */
export function preloadVehicles(vehicles) {
  vehicles.forEach((vehicle) => {
    if (vehicle.model) useGLTF.preload(vehicle.model);
  });
}
