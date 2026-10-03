import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { LoadAssetContainerAsync } from "@babylonjs/core/Loading/sceneLoader";
import type { Material } from "@babylonjs/core/Materials/material";
import { ShaderMaterial } from "@babylonjs/core/Materials/shaderMaterial";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Quaternion, Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";
import "@babylonjs/loaders/glTF/2.0/glTFLoader";
import { HUMAN_PORTRAIT } from "../film/human";
import { createInstallationAccess } from "./installation-access";
import { AERIAL_ASSEMBLY_YAW, createInstallationSway } from "./installation-sway";
import { createInstallationView, type InstallationDisplayMode } from "./installation-view";
import type { MovementRoutinePose } from "./movement-routines";
import { createProjectionCaptures, projectionCaptureFragment } from "./projection-capture";
import { createProjectionEnvironment } from "./projection-environment";
import { createProjectionHaze } from "./projection-haze";
import { createSquishAvatar } from "./squish-avatar";

export interface ProjectionSphereFrame {
  seconds: number;
  motion: number;
  motionX: number;
  haze: number;
  internalHaze?: number;
  effects: number;
  brightness?: number;
  projectionEnabled?: boolean;
  filmBlend: number;
  avatarVisible: boolean;
  moonVisible?: boolean;
  personOpacity?: number;
  routinePose?: MovementRoutinePose;
}

export type ProjectionView = "left" | "rear" | "right" | "front";
export type ProjectionRig = "lander" | "aerial";

export interface ProjectionSphere {
  render: (frame?: Partial<ProjectionSphereFrame>) => void;
  resize: () => void;
  setView: (view: ProjectionView) => void;
  setRig: (rig: ProjectionRig) => void;
  setTimeOfDay: (hours: number) => void;
  setEnvironment: (enabled: boolean) => void;
  setDisplayMode: (mode: InstallationDisplayMode) => void;
  dispose: () => void;
}

interface ProjectedLander {
  center: Vector3;
  radius: number;
  innerRadius: number;
  lenses: Vector3[];
  meshes: readonly AbstractMesh[];
  setEnabled: (enabled: boolean) => void;
}

const projectionVertex = `
precision highp float;
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
attribute float projectionFade;
uniform mat4 world;
uniform mat4 worldViewProjection;
varying vec3 vWorldPosition;
varying vec3 vWorldNormal;
varying vec2 vMoonUV;
varying float vProjectionFade;
void main(void) {
  vec4 worldPosition = world * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  vWorldNormal = normalize(mat3(world) * normal);
  vMoonUV = uv;
  vProjectionFade = projectionFade;
  gl_Position = worldViewProjection * vec4(position, 1.0);
}`;

const projectionFragment = `
precision highp float;
varying vec3 vWorldPosition;
varying vec3 vWorldNormal;
varying vec2 vMoonUV;
varying float vProjectionFade;
uniform sampler2D projectionSampler;
uniform sampler2D moonSampler;
uniform vec3 sphereCenter;
uniform vec3 projector0;
uniform vec3 projector1;
uniform vec3 projector2;
uniform vec3 cameraPosition;
uniform float seconds;
uniform float motion;
uniform float motionX;
uniform float effects;
uniform float brightness;
uniform float filmBlend;
uniform float moonVisible;
${projectionCaptureFragment}

vec3 projectedSource(vec2 moonUV, vec2 filmUV) {
  if (moonVisible < 0.5) return texture2D(projectionSampler, filmUV).rgb;
  return mix(texture2D(moonSampler, moonUV).rgb,
    texture2D(projectionSampler, filmUV).rgb, filmBlend);
}

// SHORTCUT: conceptual photometry; use measured projector profiles before physical calibration.
float projectorGain(vec3 projector) {
  vec3 projectorToPoint = vWorldPosition - projector;
  float distanceToSurface = length(projectorToPoint);
  vec3 beamDirection = normalize(sphereCenter - projector);
  float cone = dot(normalize(projectorToPoint), beamDirection);
  float coneMask = smoothstep(0.905, 0.955, cone);
  float facing = max(dot(normalize(projector - vWorldPosition), vWorldNormal), 0.0);
  float falloff = 1.0 / (1.0 + 0.055 * distanceToSurface * distanceToSurface);
  return coneMask * pow(facing, 0.42) * falloff * 1.7;
}

void main(void) {
  vec3 radial = normalize(vWorldPosition - sphereCenter);
  vec2 curvedUV = vec2(0.5 + atan(radial.z, radial.x) / 6.2831853,
    0.5 + asin(clamp(radial.y, -1.0, 1.0)) / 3.1415927);
  curvedUV.x = fract(curvedUV.x + motionX * motion * 0.018);
  vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
  float grazing = 1.0 - clamp(abs(dot(viewDirection, normalize(vWorldNormal))), 0.0, 1.0);
  vec2 spread = vec2(0.0018, 0.0036) * (1.0 + grazing * 1.8);
  vec3 scattered = (
    projectedSource(vMoonUV + vec2(spread.x, 0.0), curvedUV + vec2(spread.x, 0.0)) +
    projectedSource(vMoonUV - vec2(spread.x, 0.0), curvedUV - vec2(spread.x, 0.0)) +
    projectedSource(vMoonUV + vec2(0.0, spread.y), curvedUV + vec2(0.0, spread.y)) +
    projectedSource(vMoonUV - vec2(0.0, spread.y), curvedUV - vec2(0.0, spread.y))
  ) * 0.25;
  // SHORTCUT: thin-shell transmission and diffuse scatter; measure the actual PVC before optical calibration.
  vec3 source = mix(projectedSource(vMoonUV, curvedUV), scattered, 0.22 + grazing * 0.3);
  float gain0 = projectorGain(projector0);
  float gain1 = projectorGain(projector1);
  float gain2 = projectorGain(projector2);
  source = projectCapturedAvatar(source, gain0, gain1, gain2);
  float coverage = min(1.28, gain0 + gain1 + gain2) * vProjectionFade;
  float overlap = min(gain0, gain1) + min(gain1, gain2) + min(gain2, gain0);
  float movementPulse = 1.0 + sin(seconds * 1.7 + vWorldPosition.y * 3.0) *
    motion * effects * 0.055;
  vec3 projected = source * (0.025 + coverage * 1.55) * movementPulse;
  projected += source * vec3(0.04, 0.08, 0.11) * min(overlap, 0.28) * vProjectionFade;
  float rim = pow(grazing, 3.5);
  projected += vec3(0.16, 0.19, 0.22) * rim;
  gl_FragColor = vec4(projected * brightness,
    0.025 + brightness * 0.48 * min(coverage, 1.0) + 0.045 * rim);
}`;

/** Give the real outer wall stable north-up, positive-east atlas UVs without seam smearing. */
export function mapMoonSurface(mesh: Mesh, center: Vector3): void {
  const positions = mesh.getVerticesData("position");
  const normals = mesh.getVerticesData("normal");
  const indices = mesh.getIndices();
  if (!positions || !normals || !indices)
    throw new Error("The lunar projection wall has no geometry.");
  const mappedPositions: number[] = [];
  const mappedNormals: number[] = [];
  const uv: number[] = [];
  const fade: number[] = [];
  const mappedIndices: number[] = [];
  const world = mesh.computeWorldMatrix(true);
  for (let offset = 0; offset < indices.length; offset += 3) {
    const triangleUV: number[] = [];
    for (let corner = 0; corner < 3; corner++) {
      const source = indices[offset + corner] * 3;
      const point = Vector3.FromArray(positions, source);
      const radial = Vector3.TransformCoordinates(point, world).subtract(center).normalize();
      const longitude = (((Math.atan2(-radial.z, radial.x) / (2 * Math.PI)) % 1) + 1) % 1;
      triangleUV.push(longitude, 0.5 - Math.asin(Math.max(-1, Math.min(1, radial.y))) / Math.PI);
      mappedPositions.push(point.x, point.y, point.z);
      const normal = Vector3.FromArray(normals, source);
      // The source CAD cutaway is wound inward; exterior projector incidence needs outward normals.
      if (Vector3.Dot(Vector3.TransformNormal(normal, world), radial) < 0) normal.scaleInPlace(-1);
      mappedNormals.push(normal.x, normal.y, normal.z);
      // Three elevated side lenses still leave the northern cap dim and translucent.
      const top = Math.max(0, Math.min(1, (radial.y - 0.35) / 0.55));
      fade.push(1 - top * top * (3 - 2 * top));
      mappedIndices.push(mappedIndices.length);
    }
    const longitudes = [triangleUV[0], triangleUV[2], triangleUV[4]];
    if (Math.max(...longitudes) - Math.min(...longitudes) > 0.5) {
      for (const index of [0, 2, 4]) if (triangleUV[index] < 0.5) triangleUV[index] += 1;
    }
    uv.push(...triangleUV);
  }
  mesh.setVerticesData("position", mappedPositions);
  mesh.setVerticesData("normal", mappedNormals);
  mesh.setVerticesData("uv", uv);
  mesh.setVerticesData("projectionFade", fade, false, 1);
  mesh.setIndices(mappedIndices);
  mesh.refreshBoundingInfo();
}

/** Close the CAD drawing sections with clear plastic while preserving the physical entrance. */
export function createClearFrontCaps(
  scene: Scene,
  center: Vector3,
  outerRadius: number,
  innerRadius: number,
  skin: Material,
): Mesh[] {
  const mouthAxis = new Vector3(0, (1.45 - center.y) / outerRadius, 1).normalize();
  return [outerRadius, innerRadius].map((radius, layer) => {
    const positions: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];
    // Match the source Blender grid and only restore its explicitly omitted drawing faces.
    for (let latitude = 0; latitude <= 36; latitude++) {
      const theta = (Math.PI * latitude) / 36;
      for (let longitude = 0; longitude <= 72; longitude++) {
        const phi = (2 * Math.PI * longitude) / 72;
        const direction = new Vector3(
          Math.sin(theta) * Math.cos(phi),
          Math.cos(theta),
          -Math.sin(theta) * Math.sin(phi),
        );
        const point = center.add(direction.scale(radius));
        positions.push(point.x, point.y, point.z);
        normals.push(direction.x, direction.y, direction.z);
      }
    }
    const mouthThreshold = Math.cos(Math.asin(0.34 / radius));
    for (let latitude = 3; latitude < 36; latitude++) {
      for (let longitude = 0; longitude < 72; longitude++) {
        const degrees = ((longitude + 0.5) * 360) / 72;
        if (degrees <= 195 || degrees >= 325) continue;
        const a = latitude * 73 + longitude;
        for (const triangle of [
          [a, a + 1, a + 74],
          [a, a + 74, a + 73],
        ]) {
          const midpoint = Vector3.Zero();
          for (const index of triangle)
            midpoint.addInPlace(Vector3.FromArray(positions, index * 3));
          const direction = midpoint
            .scale(1 / 3)
            .subtract(center)
            .normalize();
          if (Vector3.Dot(direction, mouthAxis) >= mouthThreshold) continue;
          indices.push(triangle[0], triangle[2], triangle[1]);
        }
      }
    }
    const cap = new Mesh(`Unprojected clear ${layer === 0 ? "outer" : "inner"} front cap`, scene);
    const data = new VertexData();
    data.positions = positions;
    data.normals = normals;
    data.indices = indices;
    data.applyToMesh(cap);
    cap.material = skin;
    return cap;
  });
}

/** Look down onto the sphere from each projection side or clear entrance. */
export function setProjectionView(
  camera: ArcRotateCamera,
  view: ProjectionView,
  center: Vector3,
  lenses: readonly Vector3[],
  aerialMeshes?: readonly AbstractMesh[],
): void {
  const index = view === "left" ? 1 : view === "rear" ? 0 : 2;
  // The clear entrance is opposite the rear head, including the aerial assembly's fixed turn.
  const direction = view === "front" ? center.subtract(lenses[0]) : lenses[index].subtract(center);
  direction.y = 0;
  camera.setPosition(
    camera.target.add(direction.normalize().scale(8.6)).add(new Vector3(0, 6.5, 0)),
  );
  if (aerialMeshes) fitProjectionRig(camera, aerialMeshes);
}

/** Widen the current orbit just enough to include the actual aerial rig with a ten-percent margin. */
export function fitProjectionRig(camera: ArcRotateCamera, meshes: readonly AbstractMesh[]): void {
  const view = camera.getViewMatrix(true);
  const vertical = Math.tan(camera.fov / 2) * 0.9;
  const horizontal = vertical * camera.getEngine().getAspectRatio(camera);
  let distance = camera.radius;
  for (const mesh of meshes) {
    if (!mesh.getTotalVertices() || /participant/i.test(mesh.name)) continue;
    mesh.computeWorldMatrix(true);
    for (const corner of mesh.getBoundingInfo().boundingBox.vectorsWorld) {
      const point = Vector3.TransformNormal(corner.subtract(camera.target), view);
      distance = Math.max(
        distance,
        point.z + Math.max(Math.abs(point.x) / horizontal, Math.abs(point.y) / vertical),
      );
    }
  }
  camera.radius = distance;
  camera.upperRadiusLimit = Math.max(camera.upperRadiusLimit ?? distance, distance);
}

/** Load the north-up Cassini atlas and release it when loading fails or startup is aborted. */
export async function loadMoonTexture(
  scene: Scene,
  signal?: AbortSignal,
  mediaBase?: string,
): Promise<Texture> {
  // The USGS image stores north in its first row; geographic UV v=0 is north.
  return loadProjectionTexture(
    scene,
    "enceladus-cassini-global-2024-1024.jpg",
    "Enceladus map",
    false,
    signal,
    mediaBase,
  );
}

async function loadProjectionTexture(
  scene: Scene,
  filename: string,
  label: string,
  invertY: boolean,
  signal?: AbortSignal,
  mediaBase?: string,
): Promise<Texture> {
  signal?.throwIfAborted();
  return new Promise<Texture>((resolve, reject) => {
    let texture: Texture;
    let settled = false;
    const cleanup = (): void => {
      signal?.removeEventListener("abort", aborted);
      scene.onDisposeObservable.remove(disposed);
    };
    const fail = (error: unknown): void => {
      if (settled) return;
      settled = true;
      cleanup();
      texture?.dispose();
      reject(error);
    };
    const aborted = (): void => fail(signal?.reason ?? new DOMException("Aborted", "AbortError"));
    const disposed = scene.onDisposeObservable.add(() => {
      fail(new Error(`The projection scene closed while the ${label} was loading.`));
    });
    signal?.addEventListener("abort", aborted, { once: true });
    texture = new Texture(
      mediaBase
        ? new URL(filename, mediaBase).href
        : `${import.meta.env.BASE_URL}film-media/${filename}`,
      scene,
      {
        invertY,
        onLoad: () => {
          if (settled) return;
          settled = true;
          cleanup();
          resolve(texture);
        },
        onError: (message) =>
          fail(new Error(`The ${label} could not load: ${message ?? "image unavailable"}`)),
      },
    );
    texture.wrapU = Texture.WRAP_ADDRESSMODE;
    texture.wrapV = Texture.CLAMP_ADDRESSMODE;
  });
}

/** Import either real rig, adapt its optical throw, and project only on its outer wall. */
export async function loadProjectedLander(
  scene: Scene,
  bytes: ArrayBufferView,
  projection: Material,
  signal?: AbortSignal,
): Promise<ProjectedLander> {
  signal?.throwIfAborted();
  if (!scene.environmentBRDFTexture) {
    // Same Babylon lookup, served locally: the site's CSP deliberately blocks data: images.
    const brdf = new Texture(new URL("./environment-brdf.png", import.meta.url).href, scene, {
      noMipmap: true,
      invertY: false,
      samplingMode: Texture.BILINEAR_SAMPLINGMODE,
    });
    brdf.isRGBD = true;
    brdf.wrapU = brdf.wrapV = Texture.CLAMP_ADDRESSMODE;
    scene.environmentBRDFTexture = brdf;
  }
  const container = await LoadAssetContainerAsync(bytes, scene, { pluginExtension: ".glb" });
  try {
    signal?.throwIfAborted();
    if (scene.isDisposed)
      throw new Error("The projection scene closed while the lander was loading.");
    const required = (name: string): Mesh => {
      const matches = container.meshes.filter((mesh) => mesh.name === name);
      if (matches.length !== 1 || !(matches[0] instanceof Mesh)) {
        throw new Error(`The lander model must contain one mesh named ${name}.`);
      }
      return matches[0];
    };
    const wall = required("Outer wall - front panel removed for drawing");
    const innerWall = required("Inner wall - front panel removed for drawing");
    wall.computeWorldMatrix(true);
    const bounds = wall.getBoundingInfo().boundingBox;
    const radius = (bounds.maximumWorld.x - bounds.minimumWorld.x) / 2;
    const center = new Vector3(
      (bounds.maximumWorld.x + bounds.minimumWorld.x) / 2,
      (bounds.maximumWorld.y + bounds.minimumWorld.y) / 2,
      bounds.minimumWorld.z + radius,
    );
    if (Math.abs(radius - 1.25) > 0.001) {
      throw new Error("The projection lander must contain the requested 2.5 m orb.");
    }
    innerWall.computeWorldMatrix(true);
    const innerBounds = innerWall.getBoundingInfo().boundingBox;
    const originalInnerRadius = (innerBounds.maximumWorld.x - innerBounds.minimumWorld.x) / 2;
    // SHORTCUT: 250 mm visual air gap; use the selected zorb's measured inner diameter before fabrication.
    const innerRadius = radius - 0.25;
    const chamberExpansion = innerRadius - originalInnerRadius;
    const innerLip = required("Inner entry lip - nominal 680 mm opening");
    const entryTunnel = required("Open entry tunnel - nominal, product unselected");
    entryTunnel.computeWorldMatrix(true);
    // The straight tunnel is symmetric; the faceted torus lip has a biased bounding-box center.
    const entryAxis = entryTunnel
      .getBoundingInfo()
      .boundingBox.centerWorld.subtract(center)
      .normalize();
    const originalEntryDepth = Math.sqrt(originalInnerRadius ** 2 - 0.34 ** 2);
    const entryDepth = Math.sqrt(innerRadius ** 2 - 0.34 ** 2);
    const outerEntryDepth = Math.sqrt((radius + 0.055) ** 2 - 0.34 ** 2);
    for (const mesh of container.meshes) {
      const isTie = mesh.name.startsWith("Shell spacer tie ");
      const isTunnel = mesh.name.startsWith("Open entry tunnel ");
      const isFloor = mesh.name.startsWith("Compliant floor");
      if (mesh !== innerWall && mesh !== innerLip && !isTie && !isTunnel && !isFloor) continue;
      const positions = mesh.getVerticesData("position");
      const indices = mesh.getIndices();
      if (!positions || !indices) throw new Error("The inner chamber has no usable geometry.");
      const world = mesh.computeWorldMatrix(true);
      const inverse = world.clone().invert();
      for (let offset = 0; offset < positions.length; offset += 3) {
        const radial = Vector3.TransformCoordinates(
          Vector3.FromArray(positions, offset),
          world,
        ).subtract(center);
        if (mesh === innerWall) radial.scaleInPlace(innerRadius / originalInnerRadius);
        else if (isTie) {
          const distance = radial.length();
          const weight = Math.max(
            0,
            Math.min(1, (radius - distance) / (radius - originalInnerRadius)),
          );
          radial.scaleInPlace((distance + chamberExpansion * weight) / distance);
        } else if (isFloor) radial.y -= chamberExpansion;
        else {
          const weight = isTunnel
            ? Math.max(
                0,
                Math.min(
                  1,
                  (outerEntryDepth - Vector3.Dot(radial, entryAxis)) /
                    (outerEntryDepth - originalEntryDepth),
                ),
              )
            : 1;
          radial.addInPlace(entryAxis.scale((entryDepth - originalEntryDepth) * weight));
        }
        Vector3.TransformCoordinates(radial.add(center), inverse).toArray(positions, offset);
      }
      const normals: number[] = [];
      VertexData.ComputeNormals(positions, indices, normals);
      mesh.setVerticesData("position", positions);
      mesh.setVerticesData("normal", normals);
      mesh.refreshBoundingInfo({});
    }
    mapMoonSurface(wall, center);
    const heads = [1, 2, 3].map((index) => ({
      head: required(`Projector head ${index} - device unselected`),
      lens: required(`Projector lens ${index}`),
      arm: required(`Two-metre optical arm ${index}`),
      corner: required(`Corner plate ${index} - not sized`),
      canopy: required(`Ventilated rain canopy ${index}`),
      brackets: [1, -1].map((side) => required(`Canopy bracket ${index} ${side}`)),
      stay: container.meshes.some((mesh) => mesh.name === `Proposed arm stay ${index}`)
        ? required(`Proposed arm stay ${index}`)
        : undefined,
    }));
    const lenses = heads.map(({ head, lens, arm, corner, canopy, brackets, stay }) => {
      for (const mesh of [head, lens, arm, corner]) mesh.computeWorldMatrix(true);
      const originalLens = lens.getAbsolutePosition().clone();
      const horizontal = new Vector3(originalLens.x - center.x, 0, originalLens.z - center.z);
      if (Math.abs(horizontal.x) > 0.1) {
        // Turn the side arms twenty degrees rearward, keeping the entrance between them.
        const angle = Math.atan2(horizontal.z, Math.abs(horizontal.x)) - Math.PI / 9;
        horizontal.set(Math.sign(horizontal.x) * Math.cos(angle), 0, Math.sin(angle));
      }
      // SHORTCUT: artistic side-camera height; survey the actual optical arms before hardware calibration.
      const dy = 1.65;
      const horizontalRadius = Math.sqrt((radius + 2.5) ** 2 - dy ** 2);
      const movedLens = center.add(horizontal.normalize().scale(horizontalRadius));
      movedLens.y = center.y + dy;
      const lensDelta = movedLens.subtract(originalLens);
      const originalHead = head.getAbsolutePosition().clone();
      const outward = movedLens.subtract(center).normalize();
      const originalOutward = originalHead.subtract(originalLens).normalize();
      const movedHead = movedLens.add(outward.scale(originalHead.subtract(originalLens).length()));
      const headDelta = movedHead.subtract(originalHead);
      const anchor = corner.getAbsolutePosition();
      const oldAxis = head.getAbsolutePosition().subtract(anchor);
      const extendBeam = (mesh: Mesh, fixedEnd: Vector3, axis: Vector3): void => {
        const positions = mesh.getVerticesData("position");
        const indices = mesh.getIndices();
        const lengthSquared = axis.lengthSquared();
        if (!positions || !indices || lengthSquared === 0) {
          throw new Error("The imported optical support has no usable geometry.");
        }
        // P059 beam vertices are baked in metres; retain the rig end and move the head end.
        for (let offset = 0; offset < positions.length; offset += 3) {
          const point = Vector3.FromArray(positions, offset);
          const along = Vector3.Dot(point.subtract(fixedEnd), axis) / lengthSquared;
          point.addInPlace(headDelta.scale(along)).toArray(positions, offset);
        }
        const normals: number[] = [];
        VertexData.ComputeNormals(positions, indices, normals);
        mesh.setVerticesData("position", positions);
        mesh.setVerticesData("normal", normals);
        mesh.refreshBoundingInfo();
      };
      extendBeam(arm, anchor, oldAxis);
      if (stay) {
        // The P059 collector attachment is .22 m above the orb plus its .08 m ring offset.
        const collector = center.add(new Vector3(0, radius + 0.3, 0));
        const headUnderside = head.getAbsolutePosition().subtract(new Vector3(0, 0.06, 0));
        extendBeam(stay, collector, headUnderside.subtract(collector));
      }
      const tiltAxis = Vector3.Cross(originalOutward, outward);
      if (tiltAxis.lengthSquared() > 1e-12) {
        const tilt = Quaternion.RotationAxis(
          tiltAxis.normalize(),
          Math.acos(Math.max(-1, Math.min(1, Vector3.Dot(originalOutward, outward)))),
        );
        head.rotationQuaternion = tilt.multiply(head.rotationQuaternion ?? Quaternion.Identity());
      }
      lens.position.addInPlace(lensDelta);
      for (const mesh of [head, canopy, ...brackets]) mesh.position.addInPlace(headDelta);
      return movedLens;
    });
    wall.material = projection;
    const floor = container.meshes.find((mesh) => mesh.name.startsWith("Compliant floor"));
    const floorPositions = floor?.getVerticesData("position");
    const floorIndices = floor?.getIndices();
    if (floor instanceof Mesh && floorPositions && floorIndices) {
      const world = floor.computeWorldMatrix(true);
      const inverse = world.clone().invert();
      for (let index = 0; index < floorPositions.length; index += 3) {
        const radial = Vector3.TransformCoordinates(
          Vector3.FromArray(floorPositions, index),
          world,
        ).subtract(center);
        if (radial.length() > innerRadius * 0.99) {
          const local = Vector3.TransformCoordinates(
            center.add(radial.normalize().scale(innerRadius * 0.99)),
            inverse,
          );
          local.toArray(floorPositions, index);
        }
      }
      const normals: number[] = [];
      VertexData.ComputeNormals(floorPositions, floorIndices, normals);
      floor.setVerticesData("position", floorPositions);
      floor.setVerticesData("normal", normals);
      floor.refreshBoundingInfo();
    }
    for (const mesh of container.meshes) {
      if (/participant/i.test(mesh.name)) mesh.setEnabled(false);
    }
    container.addAllToScene();
    return {
      center,
      radius,
      innerRadius,
      lenses,
      meshes: container.meshes,
      setEnabled: (enabled) => {
        if (scene.isDisposed) return;
        for (const mesh of container.meshes)
          mesh.setEnabled(enabled && !/participant/i.test(mesh.name));
      },
    };
  } catch (error) {
    container.dispose();
    throw error;
  }
}

function material(
  name: string,
  scene: Scene,
  color: Color3,
  emissive = Color3.Black(),
): StandardMaterial {
  const value = new StandardMaterial(name, scene);
  value.diffuseColor = color;
  value.emissiveColor = emissive;
  value.specularColor = new Color3(0.38, 0.43, 0.46);
  value.specularPower = 96;
  return value;
}

function cone(
  name: string,
  scene: Scene,
  from: Vector3,
  to: Vector3,
  coneMaterial: StandardMaterial,
  diameter: number,
): Mesh {
  const direction = to.subtract(from);
  const volume = MeshBuilder.CreateCylinder(
    name,
    { height: direction.length(), diameterTop: diameter, diameterBottom: 0.1, tessellation: 48 },
    scene,
  );
  volume.position.copyFrom(from.add(to).scale(0.5));
  volume.rotationQuaternion = Quaternion.FromUnitVectorsToRef(
    Vector3.Up(),
    direction.normalize(),
    new Quaternion(),
  );
  volume.material = coneMaterial;
  return volume;
}

function createSoftNoise(scene: Scene): DynamicTexture {
  const texture = new DynamicTexture("projector air texture", 128, scene, false);
  const context = texture.getContext();
  const gradient = context.createRadialGradient(64, 64, 5, 64, 64, 64);
  gradient.addColorStop(0, "rgba(255,255,255,0.9)");
  gradient.addColorStop(0.42, "rgba(210,235,255,0.35)");
  gradient.addColorStop(1, "rgba(145,190,220,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  texture.update(false);
  return texture;
}

/** Map one live film onto the ground or aerial 2.5 m zorb in the same night scene. */
export async function createProjectionSphere(
  canvas: HTMLCanvasElement,
  source: HTMLCanvasElement,
  signal?: AbortSignal,
  mediaBase?: string,
): Promise<ProjectionSphere> {
  const [landerBytes, aerialBytes] = await Promise.all(
    ["zencelades-2p5m-lander.glb", "zencelades-2p5m-suspended.glb"].map(async (filename) => {
      const modelUrl = mediaBase
        ? new URL(filename, mediaBase).href
        : `${import.meta.env.BASE_URL}film-media/${filename}`;
      const response = await fetch(modelUrl, { signal });
      if (!response.ok)
        throw new Error(
          `The installation model ${filename} could not load (HTTP ${response.status}).`,
        );
      return new Uint8Array(await response.arrayBuffer());
    }),
  );
  signal?.throwIfAborted();
  const engine = new Engine(canvas, true, { preserveDrawingBuffer: true });
  let scene: Scene | undefined;
  try {
    engine.setHardwareScalingLevel(Math.max(1, window.devicePixelRatio / 1.5));
    scene = new Scene(engine);
    const activeScene = scene;
    scene.useRightHandedSystem = true;
    const environment = createProjectionEnvironment(scene);
    const texture = new DynamicTexture("live projection", source, scene, false);
    const moonTexture = await loadMoonTexture(scene, signal, mediaBase);
    const projectedSkin = new ShaderMaterial(
      "curved three projector blend",
      scene,
      { vertexSource: projectionVertex, fragmentSource: projectionFragment },
      {
        attributes: ["position", "normal", "uv", "projectionFade"],
        uniforms: [
          "world",
          "worldViewProjection",
          "sphereCenter",
          "projector0",
          "projector1",
          "projector2",
          "cameraPosition",
          "seconds",
          "motion",
          "motionX",
          "effects",
          "brightness",
          "filmBlend",
          "moonVisible",
          "personOpacity",
          "captureMatrix0",
          "captureMatrix1",
          "captureMatrix2",
        ],
        samplers: ["projectionSampler", "moonSampler", "capture0", "capture1", "capture2"],
        needAlphaBlending: true,
      },
    );
    projectedSkin.backFaceCulling = false;
    projectedSkin.disableDepthWrite = true;
    projectedSkin.setTexture("projectionSampler", texture);
    projectedSkin.setTexture("moonSampler", moonTexture);
    const model = await loadProjectedLander(scene, landerBytes, projectedSkin, signal);
    const aerial = await loadProjectedLander(scene, aerialBytes, projectedSkin, signal);
    aerial.setEnabled(false);
    const models = { lander: model, aerial };
    const { center, radius, innerRadius, lenses } = model;
    const projectedCenter = center.clone();
    const projectedLenses = lenses.map((position) => position.clone());
    let portraitTexture: Texture | undefined;
    try {
      portraitTexture = await loadProjectionTexture(
        scene,
        HUMAN_PORTRAIT,
        "Andrew portrait",
        true,
        signal,
        mediaBase,
      );
    } catch (error) {
      if (signal?.aborted || scene.isDisposed) throw error;
      console.warn(
        "The avatar is using its untextured face because the reference portrait failed.",
        error,
      );
    }
    const avatar = createSquishAvatar(scene, center, innerRadius, portraitTexture);
    // Turn the seated legs toward the clear entrance, away from the side host legs.
    avatar.root.rotation.y = Math.PI / 12;
    projectedSkin.setVector3("sphereCenter", center);
    lenses.forEach((position, index) => {
      projectedSkin.setVector3(`projector${index}`, position);
    });
    const camera = new ArcRotateCamera(
      "zorb installation view",
      0.22,
      1.4,
      8.6,
      center.subtract(new Vector3(0, 0.18, 0)),
      scene,
    );
    camera.lowerRadiusLimit = 4.8;
    camera.upperRadiusLimit = 13;
    camera.upperBetaLimit = Math.PI / 2 - 0.025;
    camera.wheelPrecision = 45;
    camera.panningSensibility = 0;
    camera.attachControl(canvas, true);
    setProjectionView(camera, "right", center, lenses);
    const bodyMeshes = avatar.meshes.filter((mesh) => !avatar.furnishings.includes(mesh));
    const captures = createProjectionCaptures(scene, bodyMeshes, lenses, center, radius);
    captures.forEach((capture, index) => {
      projectedSkin.setTexture(`capture${index}`, capture.texture);
      projectedSkin.setMatrix(`captureMatrix${index}`, capture.viewProjection);
    });
    const spill = new PointLight("projection spill", center, scene);
    spill.diffuse = new Color3(0.18, 0.48, 0.72);
    spill.intensity = 0.34;
    spill.range = 6;
    const clearSkin = material(
      "unprojected clear inner skin",
      scene,
      new Color3(0.05, 0.08, 0.095),
    );
    clearSkin.alpha = 0.065;
    clearSkin.specularColor = new Color3(0.92, 0.97, 1);
    clearSkin.specularPower = 192;
    clearSkin.backFaceCulling = false;
    clearSkin.disableDepthWrite = true;
    const clearNames = [
      "Inner wall - front panel removed for drawing",
      "Open entry tunnel - nominal, product unselected",
      "Inner entry lip - nominal 680 mm opening",
      "Outer entry lip - nominal 680 mm opening",
    ];
    for (const mesh of scene.meshes) if (clearNames.includes(mesh.name)) mesh.material = clearSkin;
    const tieSkin = material("translucent radial spacer ties", scene, new Color3(0.4, 0.52, 0.58));
    tieSkin.alpha = 0.24;
    tieSkin.specularColor = new Color3(0.9, 0.96, 1);
    tieSkin.disableDepthWrite = true;
    for (const mesh of scene.meshes)
      if (mesh.name.startsWith("Shell spacer tie ")) mesh.material = tieSkin;
    const frontCaps = createClearFrontCaps(scene, center, radius, innerRadius, clearSkin);
    const outerFront = frontCaps[0];
    outerFront.name = "Projected outer front cap";
    mapMoonSurface(outerFront, center);
    outerFront.material = projectedSkin;
    const access = createInstallationAccess(scene, center, [
      ...model.meshes,
      ...aerial.meshes,
      ...avatar.meshes,
      ...frontCaps,
    ]);
    const installationView = createInstallationView(
      [...model.meshes, ...aerial.meshes, ...avatar.meshes, ...frontCaps, ...access.meshes],
      [
        ...avatar.meshes,
        outerFront,
        ...model.meshes.filter((mesh) => mesh.material === projectedSkin),
        ...aerial.meshes.filter((mesh) => mesh.material === projectedSkin),
      ],
    );
    const beamTexture = createSoftNoise(scene);
    const beamMaterial = material(
      "volumetric projector beams",
      scene,
      Color3.Black(),
      new Color3(0.16, 0.48, 0.72),
    );
    beamMaterial.alpha = 0.072;
    beamMaterial.backFaceCulling = false;
    beamMaterial.disableDepthWrite = true;
    beamMaterial.opacityTexture = beamTexture;
    beamMaterial.alphaMode = Engine.ALPHA_ADD;
    const beamVolumes = lenses.map((position, index) => {
      const direction = center.subtract(position).normalize();
      const to = center.add(direction.scale(radius * 1.35));
      const originalLength = center
        .subtract(direction.scale(radius * 0.25))
        .subtract(position)
        .length();
      return cone(
        `soft projector beam ${index + 1}`,
        activeScene,
        position,
        to,
        beamMaterial,
        (radius * 2.25 * to.subtract(position).length()) / originalLength,
      );
    });
    const outlet = scene.getMeshByName("Hazer outlet - no sphere connection");
    if (!(outlet instanceof Mesh)) throw new Error("The imported lander has no hazer outlet.");
    const risingHaze = createProjectionHaze(
      scene,
      outlet,
      beamTexture,
      projectedLenses,
      projectedCenter,
      radius,
    );
    const sway = createInstallationSway(scene, aerial.meshes, center);
    for (const node of [
      avatar.root,
      ...avatar.furnishings.filter((mesh) => !mesh.parent),
      ...frontCaps,
      ...beamVolumes,
    ])
      node.setParent(sway.root, true);
    spill.parent = sway.root;
    const updateProjectionPose = (): void => {
      Vector3.TransformCoordinatesToRef(center, sway.matrix, projectedCenter);
      projectedSkin.setVector3("sphereCenter", projectedCenter);
      for (const [index, position] of lenses.entries()) {
        Vector3.TransformCoordinatesToRef(position, sway.matrix, projectedLenses[index]);
        projectedSkin.setVector3(`projector${index}`, projectedLenses[index]);
        captures[index].updateTransform(sway.matrix);
        projectedSkin.setMatrix(`captureMatrix${index}`, captures[index].viewProjection);
      }
    };
    let disposed = false;
    let selectedRig: ProjectionRig = "lander";
    return {
      render: (frame = {}) => {
        if (disposed) return;
        const seconds = frame.seconds ?? 0;
        const motion = Math.max(0, Math.min(1, frame.motion ?? 0));
        const motionX = Math.max(-1, Math.min(1, frame.motionX ?? 0));
        const effects = Math.max(0, Math.min(1, frame.effects ?? 0));
        const brightnessValue = frame.brightness ?? 1;
        const projectionEnabled = frame.projectionEnabled !== false;
        const brightness =
          projectionEnabled && Number.isFinite(brightnessValue)
            ? Math.max(0, Math.min(1, brightnessValue))
            : projectionEnabled
              ? 1
              : 0;
        const haze = Math.max(0, Math.min(1, frame.haze ?? 0.8));
        sway.update(seconds, motion, motionX, effects, selectedRig === "aerial");
        updateProjectionPose();
        const filmBlend = Math.max(0, Math.min(1, frame.filmBlend ?? 0.7));
        const opacity = frame.personOpacity ?? 0;
        const personOpacity =
          projectionEnabled && frame.avatarVisible !== false && Number.isFinite(opacity)
            ? Math.max(0, Math.min(1, opacity))
            : 0;
        texture.update();
        projectedSkin.setVector3("cameraPosition", camera.position);
        projectedSkin.setFloat("seconds", seconds);
        projectedSkin.setFloat("motion", motion);
        projectedSkin.setFloat("motionX", motionX);
        projectedSkin.setFloat("effects", effects);
        projectedSkin.setFloat("brightness", brightness);
        projectedSkin.setFloat("filmBlend", filmBlend);
        projectedSkin.setFloat("moonVisible", frame.moonVisible === false ? 0 : 1);
        projectedSkin.setFloat("personOpacity", personOpacity);
        spill.intensity = projectionEnabled ? brightness * 0.42 : 0;
        beamMaterial.alpha = haze * (0.06 + effects * 0.08);
        risingHaze.update(
          seconds,
          haze,
          motion,
          effects,
          projectionEnabled ? brightness : 0,
          frame.internalHaze ?? 0,
        );
        avatar.update(
          seconds,
          motion,
          motionX,
          effects,
          frame.avatarVisible ?? true,
          frame.routinePose,
        );
        if (personOpacity > 0) for (const capture of captures) capture.texture.render(false);
        for (const volume of beamVolumes)
          volume.visibility = projectionEnabled
            ? brightness * haze * (0.6 + effects * (0.12 + motion * 0.12))
            : 0;
        activeScene.render();
      },
      resize: () => {
        if (!disposed) engine.resize();
      },
      setView: (view) => {
        if (!disposed)
          setProjectionView(
            camera,
            view,
            projectedCenter,
            projectedLenses,
            selectedRig === "aerial" ? aerial.meshes : undefined,
          );
      },
      setRig: (rig) => {
        if (disposed) return;
        for (const [name, value] of Object.entries(models)) value.setEnabled(name === rig);
        selectedRig = rig;
        sway.reset(rig === "aerial");
        access.setHeading(rig === "aerial" ? AERIAL_ASSEMBLY_YAW : 0);
        updateProjectionPose();
        if (rig === "aerial") fitProjectionRig(camera, aerial.meshes);
      },
      setTimeOfDay: (hours) => {
        if (!disposed) {
          environment.setTimeOfDay(hours);
          access.setTimeOfDay(hours);
        }
      },
      setEnvironment: (enabled) => {
        if (!disposed) environment.setEnvironment(enabled);
      },
      setDisplayMode: (mode) => {
        if (!disposed) installationView.setMode(mode);
      },
      dispose: () => {
        if (disposed) return;
        disposed = true;
        camera.detachControl();
        activeScene.dispose();
        engine.dispose();
      },
    };
  } catch (error) {
    scene?.dispose();
    engine.dispose();
    throw error;
  }
}
