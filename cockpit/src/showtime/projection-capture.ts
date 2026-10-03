import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { RenderTargetTexture } from "@babylonjs/core/Materials/Textures/renderTargetTexture";
import { Color4 } from "@babylonjs/core/Maths/math.color";
import { Matrix, Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Scene } from "@babylonjs/core/scene";

export interface ProjectionCapture {
  camera: FreeCamera;
  texture: RenderTargetTexture;
  viewProjection: Matrix;
  updateTransform: (transform: Matrix) => void;
}

export const projectionCaptureFragment = `
uniform sampler2D capture0;
uniform sampler2D capture1;
uniform sampler2D capture2;
uniform mat4 captureMatrix0;
uniform mat4 captureMatrix1;
uniform mat4 captureMatrix2;
uniform float personOpacity;

vec4 capturedAvatar(sampler2D feed, mat4 viewProjection) {
  vec4 clip = viewProjection * vec4(vWorldPosition, 1.0);
  if (clip.w <= 0.0) return vec4(0.0);
  vec3 ndc = clip.xyz / clip.w;
  if (any(lessThan(ndc, vec3(-1.0))) || any(greaterThan(ndc, vec3(1.0)))) return vec4(0.0);
  return texture2D(feed, ndc.xy * 0.5 + 0.5);
}

vec3 projectCapturedAvatar(vec3 source, float gain0, float gain1, float gain2) {
  if (personOpacity <= 0.0) return source;
  vec4 first = capturedAvatar(capture0, captureMatrix0);
  vec4 second = capturedAvatar(capture1, captureMatrix1);
  vec4 third = capturedAvatar(capture2, captureMatrix2);
  float weight0 = first.a * gain0;
  float weight1 = second.a * gain1;
  float weight2 = third.a * gain2;
  float weight = weight0 + weight1 + weight2;
  vec3 person = (first.rgb * weight0 + second.rgb * weight1 + third.rgb * weight2) /
    max(weight, 0.0001);
  return mix(source, person, clamp(personOpacity * weight, 0.0, 1.0));
}`;

/** Frame the posed body from each side and map that enlarged feed over the spherical wall. */
export function createProjectionCaptures(
  scene: Scene,
  meshes: readonly Mesh[],
  lenses: readonly Vector3[],
  center: Vector3,
  radius: number,
): readonly ProjectionCapture[] {
  const viewer = scene.activeCamera;
  const points: Vector3[] = [];
  const minimum = new Vector3(Infinity, Infinity, Infinity);
  const maximum = new Vector3(-Infinity, -Infinity, -Infinity);
  for (const mesh of meshes) {
    const world = mesh.computeWorldMatrix(true);
    const positions = mesh.getVerticesData("position");
    if (!positions) throw new Error("The projected body has no capture geometry.");
    for (let offset = 0; offset < positions.length; offset += 3) {
      const point = Vector3.TransformCoordinates(Vector3.FromArray(positions, offset), world);
      points.push(point);
      minimum.minimizeInPlace(point);
      maximum.maximizeInPlace(point);
    }
  }
  if (points.length === 0) throw new Error("The projected body has no capture geometry.");
  const bodyCenter = minimum.add(maximum).scale(0.5);
  const captures = lenses.map((lens, index) => {
    const camera = new FreeCamera(`avatar capture camera ${index + 1}`, lens.clone(), scene);
    camera.setTarget(bodyCenter);
    const view = camera.getViewMatrix(true);
    let tangent = 0;
    for (const point of points) {
      const local = Vector3.TransformCoordinates(point, view);
      tangent = Math.max(tangent, Math.max(Math.abs(local.x), Math.abs(local.y)) / -local.z);
    }
    // The measured six-routine envelope needs 1.094 of the rest tangent; retain 2.4% breathing room.
    // SHORTCUT: concept pose envelope; recalibrate from measured body limits before hardware use.
    camera.fov = 2 * Math.atan(tangent * 1.12);
    camera.minZ = 0.05;
    camera.maxZ = lens.subtract(center).length() + radius * 2;
    camera.freezeProjectionMatrix(Matrix.PerspectiveFovRH(camera.fov, 1, camera.minZ, camera.maxZ));
    const texture = new RenderTargetTexture(`avatar capture feed ${index + 1}`, 512, scene);
    texture.activeCamera = camera;
    texture.renderList = [...meshes];
    texture.clearColor = new Color4(0, 0, 0, 0);
    texture.renderParticles = false;
    texture.renderSprites = false;
    texture.useCameraPostProcesses = false;
    texture.ignoreCameraViewport = true;
    const wallFov =
      2 * Math.atan(Math.tan(Math.asin(radius / lens.subtract(center).length())) * 1.35);
    const restProjection = Matrix.LookAtRH(lens, center, Vector3.Up()).multiply(
      Matrix.PerspectiveFovRH(wallFov, 1, camera.minZ, camera.maxZ),
    );
    const viewProjection = restProjection.clone();
    const inverse = Matrix.Identity();
    const restLens = lens.clone();
    const target = Vector3.Zero();
    const up = Vector3.Up();
    return {
      camera,
      texture,
      viewProjection,
      updateTransform: (transform: Matrix) => {
        Vector3.TransformCoordinatesToRef(restLens, transform, camera.position);
        Vector3.TransformCoordinatesToRef(bodyCenter, transform, target);
        Vector3.TransformNormalToRef(up, transform, camera.upVector);
        camera.setTarget(target);
        camera.getViewMatrix(true);
        transform.invertToRef(inverse);
        inverse.multiplyToRef(restProjection, viewProjection);
      },
    };
  });
  if (scene.activeCamera !== viewer) scene.activeCamera = viewer;
  return captures;
}
