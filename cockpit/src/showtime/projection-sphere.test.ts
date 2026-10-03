import { expect, spyOn, test } from "bun:test";
import { readFile } from "node:fs/promises";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { NullEngine, NullEngineOptions } from "@babylonjs/core/Engines/nullEngine";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData";
import { Scene } from "@babylonjs/core/scene";
import { createProjectionHaze } from "./projection-haze";
import {
  createClearFrontCaps,
  createProjectionSphere,
  fitProjectionRig,
  loadMoonTexture,
  loadProjectedLander,
  mapMoonSurface,
  setProjectionView,
} from "./projection-sphere";
import { createSquishAvatar } from "./squish-avatar";

const landerPath = new URL(
  "../../../deliveries/grant-3d-p059/zencelades-2p5m-lander.glb",
  import.meta.url,
);
const aerialPath = new URL(
  "../../../deliveries/grant-3d-p059/zencelades-2p5m-suspended.glb",
  import.meta.url,
);

test("both installation models load from the media base supplied by their host", async () => {
  const previousFetch = globalThis.fetch;
  const requestedUrls: string[] = [];
  globalThis.fetch = ((input: string | URL | Request) => {
    requestedUrls.push(String(input));
    return Promise.resolve(new Response(null, { status: 404 }));
  }) as typeof fetch;
  try {
    await expect(
      createProjectionSphere(
        {} as HTMLCanvasElement,
        {} as HTMLCanvasElement,
        undefined,
        "https://zencelades.test/film/film-media/",
      ),
    ).rejects.toThrow("HTTP 404");
    expect(requestedUrls).toEqual([
      "https://zencelades.test/film/film-media/zencelades-2p5m-lander.glb",
      "https://zencelades.test/film/film-media/zencelades-2p5m-suspended.glb",
    ]);
  } finally {
    globalThis.fetch = previousFetch;
  }
});

test("render selects body-only or the default moon mix across the actual sides and rigs", async () => {
  // Isolate import-boundary mocks so the other real-model integration tests stay untouched.
  const moduleUrl = new URL("./projection-sphere.ts", import.meta.url).href;
  const child = Bun.spawn(
    [
      process.execPath,
      "--eval",
      `
import { expect, mock } from "bun:test";
import { readFile } from "node:fs/promises";
import { NullEngine } from "@babylonjs/core/Engines/nullEngine";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Matrix, Vector3 } from "@babylonjs/core/Maths/math.vector";
let engine;
class RenderEngine extends NullEngine {
  constructor() { super(); engine = this; }
}
class LoadedTexture extends Texture {
  constructor(url, scene, options) {
    super(null, scene, options);
    if (typeof options?.onLoad === "function") queueMicrotask(() => options.onLoad());
  }
}
mock.module("@babylonjs/core/Engines/engine", () => ({ Engine: RenderEngine }));
mock.module("@babylonjs/core/Materials/Textures/texture", () => ({ Texture: LoadedTexture }));
const context = {
  createRadialGradient: () => ({ addColorStop() {} }),
  fillRect() {},
};
const canvas = {
  width: 128, height: 128,
  getContext: () => context,
  addEventListener() {}, removeEventListener() {},
};
globalThis.window = { devicePixelRatio: 1, addEventListener() {}, removeEventListener() {} };
globalThis.document = { createElement: () => canvas, addEventListener() {}, removeEventListener() {} };
globalThis.fetch = async (input) => {
  const bytes = await readFile(new URL(String(input).endsWith("suspended.glb")
    ? ${JSON.stringify(aerialPath.href)} : ${JSON.stringify(landerPath.href)}));
  return new Response(bytes);
};
const { createProjectionSphere } = await import(${JSON.stringify(moduleUrl)});
const { routinePoseAt } = await import(${JSON.stringify(new URL("./movement-routines.ts", import.meta.url).href)});
const sphere = await createProjectionSphere(canvas, canvas, undefined, "https://showtime.test/media/");
const scene = engine.scenes[0];
const projection = scene.getMaterialByName("curved three projector blend");
const source = () => projection.serialize().floats;
const captures = scene.textures.filter((texture) => texture.name.startsWith("avatar capture feed "));
expect(captures).toHaveLength(3);
const avatar = scene.meshes.filter((mesh) => mesh.name.startsWith("squish avatar ") && !mesh.name.includes("futon topper"));
const orbit = scene.activeCamera;
const passes = [0, 0, 0];
for (const [index, capture] of captures.entries()) {
  capture.onAfterRenderObservable.add(() => passes[index]++);
  expect(capture.getRenderSize()).toBe(512);
  expect(capture.renderList).toEqual(avatar);
  expect(capture.clearColor.asArray()).toEqual([0, 0, 0, 0]);
  expect(capture.renderParticles || capture.renderSprites || capture.useCameraPostProcesses).toBe(false);
  const lens = scene.getMeshByName("Projector lens " + (index + 1));
  lens.computeWorldMatrix(true);
  expect(capture.activeCamera.position.subtract(lens.getAbsolutePosition()).length()).toBeLessThan(0.00001);
  const center = new Vector3(0, 1.7, 0);
  expect(capture.activeCamera.fov).toBeLessThan(2 * Math.asin(1.25 / 3.75) * 0.6);
  const wallMatrix = Matrix.FromArray(projection.serialize().matrices["captureMatrix" + index]);
  expect(Vector3.TransformCoordinates(center, wallMatrix).x).toBeCloseTo(0, 5);
  expect(Vector3.TransformCoordinates(center, wallMatrix).y).toBeCloseTo(0, 5);
  expect(capture.activeCamera.getProjectionMatrix().m[0]).toBe(capture.activeCamera.getProjectionMatrix().m[5]);
}
expect(new Set(captures.map((capture) => capture.activeCamera)).size).toBe(3);
expect(scene.customRenderTargets).toHaveLength(0);
try {
  sphere.render();
  expect(passes).toEqual([0, 0, 0]);
  expect(source().personOpacity).toBe(0);
  expect(source().moonVisible).toBe(1);
  expect(source().filmBlend).toBe(0.7);
  expect(source().brightness).toBe(1);
  sphere.render({ brightness: 0.3, effects: 0.9 });
  expect(source().brightness).toBeCloseTo(0.3);
  expect(source().effects).toBeCloseTo(0.9);
  sphere.render({ brightness: 1, effects: 0 });
  expect(source().brightness).toBe(1);
  expect(source().effects).toBe(0);
  sphere.render({ brightness: Number.NaN });
  expect(source().brightness).toBe(1);
  for (const filmBlend of [0, 0.35, 1]) {
    sphere.render({ moonVisible: false, filmBlend });
    expect(source().moonVisible).toBe(0);
    expect(source().filmBlend).toBe(filmBlend);
  }
  for (const rig of ["aerial", "lander"]) {
    sphere.setRig(rig);
    for (const view of ["left", "rear", "right"]) {
      sphere.setView(view);
      expect(source().moonVisible).toBe(0);
      sphere.render({ moonVisible: false, filmBlend: 0 });
      expect(source().moonVisible).toBe(0);
      const walls = scene.meshes.filter((mesh) => mesh.material === projection && mesh.isEnabled());
      expect(walls).toHaveLength(1);
      expect(scene.textures.filter((texture) => texture.name.startsWith("avatar capture feed "))).toEqual(captures);
    }
  }
  sphere.render({ moonVisible: true, filmBlend: 0.75 });
  expect(source().moonVisible).toBe(1);
  expect(source().filmBlend).toBe(0.75);
  sphere.render();
  expect(source().moonVisible).toBe(1);
  expect(source().filmBlend).toBe(0.7);
  sphere.render({ personOpacity: 0.8, avatarVisible: true, effects: 0 });
  expect(passes).toEqual([1, 1, 1]);
  expect(scene.activeCamera).toBe(orbit);
  const hand = scene.getMeshByName("squish avatar hand 1");
  const handUV = () => Vector3.TransformCoordinates(hand.getAbsolutePosition(), Matrix.FromArray(projection.serialize().matrices.captureMatrix0));
  const stillHand = handUV();
  for (let frame = 1; frame <= 12; frame++) {
    sphere.render({ seconds: frame / 60, motion: 1, motionX: 1, effects: 1, personOpacity: 0.8 });
  }
  expect(handUV().subtract(stillHand).length()).toBeGreaterThan(0.00001);
  expect(passes).toEqual([13, 13, 13]);
  expect(scene.activeCamera).toBe(orbit);
  sphere.render({ personOpacity: 1, avatarVisible: false });
  expect(source().personOpacity).toBe(0);
  sphere.render({ personOpacity: 0, avatarVisible: true });
  sphere.render({ personOpacity: Number.NaN, avatarVisible: true });
  expect(passes).toEqual([13, 13, 13]);
  expect(source().personOpacity).toBe(0);
  sphere.render({ projectionEnabled: false, personOpacity: 1, brightness: 1, haze: 1 });
  expect(source().brightness).toBe(0);
  expect(source().personOpacity).toBe(0);
  expect(passes).toEqual([13, 13, 13]);
  expect(scene.getLightByName("projection spill").intensity).toBe(0);
  expect(scene.meshes.filter(mesh => mesh.name.startsWith("soft projector beam ")).every(mesh => mesh.visibility === 0)).toBe(true);
  expect(hand.isEnabled()).toBe(true);
  sphere.render({ projectionEnabled: true });
  expect(source().brightness).toBe(1);
  expect(scene.getLightByName("projection spill").intensity).toBeGreaterThan(0);
  sphere.setDisplayMode("wireframe");
  expect(projection.wireframe).toBe(true);
  sphere.setDisplayMode("realistic");
  expect(projection.wireframe).toBe(false);
  sphere.setRig("aerial");
  const aerialWall = scene.meshes.find(mesh => mesh.material === projection && mesh.isEnabled());
  const host = scene.getMeshByName("Illustrative host crossbar");
  const hostRest = host.computeWorldMatrix(true).clone();
  const step = scene.getMeshByName("access tread 6");
  const stepRest = step.computeWorldMatrix(true).clone();
  const restWall = aerialWall.computeWorldMatrix(true).clone();
  const topper = scene.meshes.find(mesh => mesh.name.includes("futon topper"));
  const topperRest = topper.getAbsolutePosition().clone();
  for (let frame = 0; frame <= 60; frame++) {
    sphere.render({ seconds: 2 + frame / 60, motion: 1, motionX: 1, effects: 1 });
  }
  expect(aerialWall.computeWorldMatrix(true).equalsWithEpsilon(restWall, 0.000001)).toBe(false);
  expect(host.computeWorldMatrix(true).equalsWithEpsilon(hostRest, 0.000001)).toBe(true);
  expect(step.computeWorldMatrix(true).equalsWithEpsilon(stepRest, 0.000001)).toBe(true);
  const sway = scene.getTransformNodeByName("suspended installation sway");
  topper.computeWorldMatrix(true);
  expect(topper.getAbsolutePosition().subtract(Vector3.TransformCoordinates(topperRest, sway.getWorldMatrix())).length()).toBeLessThan(0.00001);
  const movingCenter = Vector3.FromArray(projection.serialize().vectors3.sphereCenter);
  for (const [index, capture] of captures.entries()) {
    const lens = scene.meshes.find(mesh => mesh.name === "Projector lens " + (index + 1) && mesh.isEnabled());
    lens.computeWorldMatrix(true);
    expect(capture.activeCamera.position.subtract(lens.getAbsolutePosition()).length()).toBeLessThan(0.00001);
    const mappedCenter = Vector3.TransformCoordinates(movingCenter, Matrix.FromArray(projection.serialize().matrices["captureMatrix" + index]));
    expect(Math.hypot(mappedCenter.x, mappedCenter.y)).toBeLessThan(0.00001);
  }
  sphere.render({ seconds: 3.1, motion: 1, effects: 1, avatarVisible: false });
  expect(topper.isEnabled()).toBe(true);
  sphere.setRig("lander");
  sphere.render({ motion: 1, effects: 1 });
  expect(aerialWall.computeWorldMatrix(true).equalsWithEpsilon(restWall, 0.000001)).toBe(true);
  const knee = scene.getTransformNodeByName("squish avatar knee joint 1");
  let chamberPeak = 0;
  const cameraPeaks = [0, 0, 0];
  const vertices = avatar.map(mesh => ({ mesh, positions: mesh.getVerticesData("position") }));
  const point = Vector3.Zero();
  const local = Vector3.Zero();
  const ndc = Vector3.Zero();
  const center = Vector3.Zero();
  const pose = routinePoseAt(0, 0);
  for (const rig of ["lander", "aerial"]) {
    sphere.setRig(rig);
    const poses = new Set();
    for (let frame = 0; frame <= 192; frame++) {
      const seconds = frame / 4;
      routinePoseAt(seconds, 0, pose);
      sphere.render({ seconds, motion: pose.motion, motionX: pose.motionX, effects: 1, routinePose: pose });
      if (frame % 32 === 16) {
        if (pose.routine === "look")
          expect(scene.getTransformNodeByName("squish avatar head joint").rotation.y).toBeGreaterThan(0.1);
        if (pose.routine === "tucked-crouch") expect(knee.rotation.x).toBeGreaterThan(0.15);
        const signature = [knee.rotation.x];
        for (const name of ["squish avatar hand 1", "squish avatar hand -1", "squish avatar head"]) {
          const landmark = scene.getMeshByName(name);
          landmark.computeWorldMatrix(true);
          signature.push(...landmark.getAbsolutePosition().asArray());
        }
        poses.add(signature.map(value => value.toFixed(5)).join(","));
      }
      center.set(0, 1.7, 0);
      if (rig === "aerial") Vector3.TransformCoordinatesToRef(center, sway.getWorldMatrix(), center);
      const matrices = captures.map(capture => capture.activeCamera.getViewMatrix().multiply(capture.activeCamera.getProjectionMatrix()));
      for (const { mesh, positions } of vertices) {
        const world = mesh.computeWorldMatrix(true);
        for (let offset = 0; offset < positions.length; offset += 3) {
          Vector3.FromArrayToRef(positions, offset, local);
          Vector3.TransformCoordinatesToRef(local, world, point);
          chamberPeak = Math.max(chamberPeak, Vector3.Distance(point, center));
          for (let index = 0; index < matrices.length; index++) {
            Vector3.TransformCoordinatesToRef(point, matrices[index], ndc);
            cameraPeaks[index] = Math.max(cameraPeaks[index], Math.abs(ndc.x), Math.abs(ndc.y));
          }
        }
      }
    }
    expect(poses.size).toBe(6);
  }
  expect(chamberPeak).toBeLessThanOrEqual(5 / 6 + 0.00001);
  for (const peak of cameraPeaks) expect(peak).toBeLessThan(1);
} finally {
  sphere.dispose();
}
expect(scene.textures).toHaveLength(0);
expect(scene.cameras).toHaveLength(0);
`,
    ],
    { stdout: "pipe", stderr: "pipe" },
  );
  const [exitCode, stdout, stderr] = await Promise.all([
    child.exited,
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
  ]);
  if (exitCode !== 0) throw new Error(`${stdout}\n${stderr}`.trim());
  expect(exitCode).toBe(0);
}, 15_000);

test("both rigs raise their three side lenses and extend the arms while keeping the wall throw", async () => {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  scene.useRightHandedSystem = true;
  try {
    for (const path of [landerPath, aerialPath]) {
      const model = await loadProjectedLander(
        scene,
        await readFile(path),
        new StandardMaterial("wall", scene),
      );
      expect(model.lenses).toHaveLength(3);
      for (const [index, lens] of model.lenses.entries()) {
        expect(lens.y - model.center.y).toBeCloseTo(0.65, 5);
        expect(lens.subtract(model.center).length() - model.radius).toBeCloseTo(2.5, 5);
        const head = model.meshes.find(
          (mesh) => mesh.name === `Projector head ${index + 1} - device unselected`,
        );
        const corner = model.meshes.find(
          (mesh) => mesh.name === `Corner plate ${index + 1} - not sized`,
        );
        if (!head || !corner) throw new Error("Expected optical support meshes.");
        head.computeWorldMatrix(true);
        corner.computeWorldMatrix(true);
        const behindLens = head.getAbsolutePosition().subtract(lens);
        expect(behindLens.length()).toBeCloseTo(0.16, 5);
        expect(
          Vector3.Dot(behindLens.normalize(), lens.subtract(model.center).normalize()),
        ).toBeGreaterThan(0.9999);
        expect(
          head.getAbsolutePosition().subtract(corner.getAbsolutePosition()).length(),
        ).toBeGreaterThan(2.45);
      }
      expect(model.lenses[0].z).toBeLessThan(-3.6);
      expect(model.lenses[1].x).toBeLessThan(-3);
      expect(model.lenses[2].x).toBeGreaterThan(3);
      // Rearward side coverage leaves the clear +Z entrance between the lenses.
      expect(model.lenses[1].z).toBeLessThan(0.8);
      expect(model.lenses[2].z).toBeLessThan(0.8);
    }
  } finally {
    scene.dispose();
    engine.dispose();
  }
});

test("the aerial rig keeps its adapted arm stays joined to the heads and top collector", async () => {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  scene.useRightHandedSystem = true;
  try {
    await loadProjectedLander(
      scene,
      await readFile(aerialPath),
      new StandardMaterial("wall", scene),
    );
    for (const index of [1, 2, 3]) {
      const head = scene.getMeshByName(`Projector head ${index} - device unselected`);
      const stay = scene.getMeshByName(`Proposed arm stay ${index}`);
      const positions = stay?.getVerticesData("position");
      if (!head || !stay || !positions)
        throw new Error("Expected the actual aerial optical stays.");
      head.computeWorldMatrix(true);
      const movingEnd = head.getAbsolutePosition().subtract(new Vector3(0, 0.06, 0));
      const fixedEnd = new Vector3(0, 3.25, 0);
      let nearestHead = Infinity;
      let nearestCollector = Infinity;
      for (let offset = 0; offset < positions.length; offset += 3) {
        const point = Vector3.FromArray(positions, offset);
        nearestHead = Math.min(nearestHead, point.subtract(movingEnd).length());
        nearestCollector = Math.min(nearestCollector, point.subtract(fixedEnd).length());
      }
      expect(nearestHead).toBeLessThan(0.01);
      expect(nearestCollector).toBeLessThan(0.01);
    }
  } finally {
    scene.dispose();
    engine.dispose();
  }
});

test("switching the actual rigs preserves sphere geography and below-orb haze without projecting the rig", async () => {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  scene.useRightHandedSystem = true;
  const projection = new StandardMaterial("moon and person", scene);
  try {
    const lander = await loadProjectedLander(scene, await readFile(landerPath), projection);
    const aerial = await loadProjectedLander(scene, await readFile(aerialPath), projection);
    expect(aerial.center.subtract(lander.center).length()).toBeLessThan(0.00001);
    expect(aerial.radius).toBeCloseTo(1.25, 5);
    expect(aerial.innerRadius).toBeCloseTo(5 / 6, 5);
    for (const [index, lens] of aerial.lenses.entries()) {
      expect(lens.subtract(lander.lenses[index]).length()).toBeLessThan(0.00001);
      expect(lens.subtract(aerial.center).length() - aerial.radius).toBeCloseTo(2.5, 5);
    }
    const wall = aerial.meshes.find((mesh) => mesh.material === projection);
    const landerWall = lander.meshes.find((mesh) => mesh.material === projection);
    if (!wall || !landerWall) throw new Error("Expected the outer projection walls of both rigs.");
    expect(aerial.meshes.filter((mesh) => mesh.material === projection)).toEqual([wall]);
    expect(wall?.getVerticesData("uv")).toEqual(landerWall?.getVerticesData("uv"));
    expect(wall?.getVerticesData("projectionFade")).toEqual(
      landerWall?.getVerticesData("projectionFade"),
    );
    expect(aerial.meshes.filter((mesh) => /^Illustrative host leg /.test(mesh.name))).toHaveLength(
      4,
    );
    expect(aerial.meshes.filter((mesh) => /^Over-sphere webbing /.test(mesh.name))).toHaveLength(3);
    for (const name of [
      "Illustrative host crossbar",
      "Top collector ring - unselected",
      "Swivel envelope - unselected",
    ]) {
      const mesh = aerial.meshes.find((value) => value.name === name);
      expect(mesh?.isEnabled()).toBe(true);
      expect(mesh?.material).not.toBe(projection);
    }
    const outlet = aerial.meshes.find(
      (mesh) => mesh.name === "Hazer outlet - no sphere connection",
    );
    if (!outlet) throw new Error("Expected the actual aerial hazer outlet.");
    outlet.computeWorldMatrix(true);
    const origin = outlet.getBoundingInfo().boundingBox.centerWorld;
    expect(origin.x).toBeCloseTo(0, 5);
    expect(origin.y).toBeCloseTo(0.22, 5);
    expect(origin.z).toBeCloseTo(-0.945, 5);
    expect(origin.y).toBeLessThan(aerial.center.y - aerial.radius);
    const plume = createProjectionHaze(
      scene,
      outlet,
      new Texture(null, scene),
      aerial.lenses,
      aerial.center,
      aerial.radius,
    );
    const wisps = scene.meshes.filter((mesh) => mesh.name.startsWith("external hazer plume wisp "));
    lander.setEnabled(false);
    aerial.setEnabled(true);
    expect(lander.meshes.every((mesh) => !mesh.isEnabled())).toBe(true);
    expect(wall?.isEnabled()).toBe(true);
    expect(
      aerial.meshes
        .filter((mesh) => /participant/i.test(mesh.name))
        .every((mesh) => !mesh.isEnabled()),
    ).toBe(true);
    plume.update(1, 1, 0.5, 0.65);
    expect(wisps.every((mesh) => mesh.isEnabled())).toBe(true);
    expect(wisps.every((mesh) => mesh.position.y < aerial.center.y)).toBe(true);
    expect(wisps.every((mesh) => mesh.material !== projection)).toBe(true);
    aerial.setEnabled(false);
    lander.setEnabled(true);
    expect(aerial.meshes.every((mesh) => !mesh.isEnabled())).toBe(true);
    expect(landerWall?.isEnabled()).toBe(true);
    expect(
      lander.meshes
        .filter((mesh) => /participant/i.test(mesh.name))
        .every((mesh) => !mesh.isEnabled()),
    ).toBe(true);
    expect(wisps.every((mesh) => mesh.isEnabled())).toBe(true);
  } finally {
    scene.dispose();
    engine.dispose();
  }
});

test("the actual lander receives imagery only on its cut-away outer wall", async () => {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  scene.useRightHandedSystem = true;
  const projection = new StandardMaterial("test projected imagery", scene);
  try {
    const model = await loadProjectedLander(scene, await readFile(landerPath), projection);
    // Imported PBR supports must not depend on a data: image blocked by the site's CSP.
    expect(new URL((scene.environmentBRDFTexture as Texture).url ?? "").protocol).toBe(
      new URL(import.meta.url).protocol,
    );
    const wall = scene.getMeshByName("Outer wall - front panel removed for drawing");
    if (!wall) throw new Error("Expected the original lander outer wall.");
    expect(wall?.material).toBe(projection);
    expect(scene.meshes.filter((mesh) => mesh.material === projection)).toEqual([wall]);
    const wallBounds = wall.getBoundingInfo().boundingBox;
    expect(wallBounds.maximumWorld.z).toBeCloseTo(0.7169706, 5);
    expect(model.center.x).toBe(0);
    expect(model.center.y).toBeCloseTo(1.7, 5);
    expect(model.center.z).toBe(0);
    expect(model.radius).toBeCloseTo(1.25, 5);
    expect(model.innerRadius).toBeCloseTo(5 / 6, 5);
    for (const [name, radius] of [
      ["Outer wall - front panel removed for drawing", model.radius],
      ["Inner wall - front panel removed for drawing", model.innerRadius],
    ] as const) {
      const shell = scene.getMeshByName(name);
      const positions = shell?.getVerticesData("position");
      const indices = shell?.getIndices();
      if (!positions || !indices) throw new Error("Expected actual indexed double-wall geometry.");
      let highestUsedY = 0;
      let northQuadrants = 0;
      for (let offset = 0; offset < indices.length; offset += 3) {
        const centroid = Vector3.Zero();
        for (let corner = 0; corner < 3; corner++) {
          const point = Vector3.FromArray(positions, indices[offset + corner] * 3);
          highestUsedY = Math.max(highestUsedY, point.y);
          centroid.addInPlace(point);
        }
        centroid.scaleInPlace(1 / 3).subtractInPlace(model.center);
        if (centroid.y > radius * 0.97) {
          northQuadrants |= 1 << ((centroid.x >= 0 ? 2 : 0) + (centroid.z >= 0 ? 1 : 0));
        }
      }
      expect(highestUsedY).toBeCloseTo(model.center.y + radius, 5);
      expect(northQuadrants).toBe(15);
    }
    expect(wall.isVerticesDataPresent("uv")).toBe(true);
    expect(wall.isVerticesDataPresent("projectionFade")).toBe(true);
    const surfacePositions = wall.getVerticesData("position");
    const surfaceNormals = wall.getVerticesData("normal");
    if (!surfacePositions || !surfaceNormals)
      throw new Error("Expected actual outer-wall geometry.");
    let leastOutward = 1;
    for (let offset = 0; offset < surfacePositions.length; offset += 3) {
      const radial = Vector3.FromArray(surfacePositions, offset).subtract(model.center).normalize();
      leastOutward = Math.min(
        leastOutward,
        Vector3.Dot(radial, Vector3.FromArray(surfaceNormals, offset)),
      );
    }
    expect(leastOutward).toBeGreaterThan(0.99);
    expect(model.lenses[0].y - model.center.y).toBeCloseTo(0.65, 5);
    for (const lens of model.lenses) {
      expect(lens.subtract(model.center).length() - model.radius).toBeCloseTo(2.5, 5);
    }
    expect(model.lenses[0].z).toBeLessThan(-3.69);
    expect(model.lenses[1].x).toBeLessThan(-3.19);
    expect(model.lenses[2].x).toBeGreaterThan(3.19);
    for (const index of [1, 2, 3]) {
      const head = scene.getMeshByName(`Projector head ${index} - device unselected`);
      const lens = scene.getMeshByName(`Projector lens ${index}`);
      const canopy = scene.getMeshByName(`Ventilated rain canopy ${index}`);
      const arm = scene.getMeshByName(`Two-metre optical arm ${index}`);
      if (!head || !lens || !canopy || !arm)
        throw new Error("Expected the original optical assembly.");
      for (const mesh of [head, lens, canopy, arm]) mesh.computeWorldMatrix(true);
      expect(head.getAbsolutePosition().subtract(lens.getAbsolutePosition()).length()).toBeCloseTo(
        0.16,
        5,
      );
      expect(canopy.getAbsolutePosition().y - head.getAbsolutePosition().y).toBeCloseTo(0.19, 5);
      const armBounds = arm.getBoundingInfo().boundingBox;
      const headPosition = head.getAbsolutePosition();
      expect(armBounds.minimumWorld.y).toBeLessThan(0.76);
      expect(armBounds.maximumWorld.y).toBeGreaterThan(headPosition.y);
      expect(headPosition.x).toBeGreaterThanOrEqual(armBounds.minimumWorld.x);
      expect(headPosition.x).toBeLessThanOrEqual(armBounds.maximumWorld.x);
      expect(headPosition.z).toBeGreaterThanOrEqual(armBounds.minimumWorld.z);
      expect(headPosition.z).toBeLessThanOrEqual(armBounds.maximumWorld.z);
    }
    for (const mesh of scene.meshes) {
      if (/participant/i.test(mesh.name)) expect(mesh.isEnabled()).toBe(false);
    }
    for (const name of [
      "Triangle member 1",
      "Detachable lander leg 2",
      "Two-metre optical arm 3",
      "Open entry tunnel - nominal, product unselected",
      "Owned external hazer body - provisional envelope",
    ]) {
      const mesh = scene.getMeshByName(name);
      expect(mesh?.isEnabled()).toBe(true);
      expect(mesh?.material).not.toBe(projection);
    }
  } finally {
    scene.dispose();
    engine.dispose();
  }
});

test("both rigs keep the shared seated avatar and floor inside an unchanged spherical chamber", async () => {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  scene.useRightHandedSystem = true;
  try {
    const projection = new StandardMaterial("surface", scene);
    const rigs = [
      await loadProjectedLander(scene, await readFile(landerPath), projection),
      await loadProjectedLander(scene, await readFile(aerialPath), projection),
    ];
    const avatar = createSquishAvatar(scene, rigs[0].center, rigs[0].innerRadius);
    avatar.root.rotation.y = Math.PI / 12;
    for (const [selected, rig] of rigs.entries()) {
      for (const [index, value] of rigs.entries()) value.setEnabled(index === selected);
      avatar.update(2.5 + selected, 1, selected === 0 ? -1 : 1, 1);
      expect(avatar.meshes.every((mesh) => mesh.isEnabled())).toBe(true);
      const floor = rig.meshes.find((mesh) => mesh.name.startsWith("Compliant floor"));
      if (!floor) throw new Error("Expected the actual compliant floor.");
      for (const mesh of [floor, ...avatar.meshes]) {
        const world = mesh.computeWorldMatrix(true);
        const positions = mesh.getVerticesData("position");
        if (!positions) throw new Error("Expected occupant and floor geometry.");
        let farthest = 0;
        for (let index = 0; index < positions.length; index += 3)
          farthest = Math.max(
            farthest,
            Vector3.TransformCoordinates(Vector3.FromArray(positions, index), world)
              .subtract(rig.center)
              .length(),
          );
        expect(farthest).toBeLessThanOrEqual(rig.innerRadius + 1e-6);
      }
      for (const [name, radius] of [
        ["Outer wall - front panel removed for drawing", rig.radius],
        ["Inner wall - front panel removed for drawing", rig.innerRadius],
      ] as const) {
        const shell = rig.meshes.find((mesh) => mesh.name === name);
        const positions = shell?.getVerticesData("position");
        const indices = shell?.getIndices();
        if (!shell || !positions || !indices) throw new Error("Expected spherical shell.");
        const world = shell.computeWorldMatrix(true);
        let error = 0;
        for (const index of indices)
          error = Math.max(
            error,
            Math.abs(
              Vector3.TransformCoordinates(Vector3.FromArray(positions, index * 3), world)
                .subtract(rig.center)
                .length() - radius,
            ),
          );
        expect(error).toBeLessThan(1e-5);
        expect(shell.scaling.asArray()).toEqual([1, 1, 1]);
      }
    }
  } finally {
    scene.dispose();
    engine.dispose();
  }
});

test("the atlas loads north-up and releases its texture on abort, scene closure, or image failure", async () => {
  for (const outcome of ["ready", "abort", "closed", "missing"] as const) {
    const engine = new NullEngine();
    const scene = new Scene(engine);
    const controller = new AbortController();
    const originalCreate = engine.createTexture.bind(engine);
    const failure =
      outcome === "missing"
        ? spyOn(engine, "createTexture").mockImplementation((...args) => {
            const onError = args[6];
            args[5] = null;
            queueMicrotask(() => onError?.("HTTP 404", new Error("image absent")));
            return originalCreate(...args);
          })
        : undefined;
    try {
      const pending = loadMoonTexture(scene, controller.signal);
      if (outcome === "ready") {
        const texture = await pending;
        expect(texture.invertY).toBe(false);
        expect(texture.wrapU).toBe(Texture.WRAP_ADDRESSMODE);
        expect(texture.wrapV).toBe(Texture.CLAMP_ADDRESSMODE);
        expect(scene.textures).toEqual([texture]);
      } else {
        if (outcome === "abort") controller.abort();
        if (outcome === "closed") scene.dispose();
        await expect(pending).rejects.toThrow(
          outcome === "abort" ? "abort" : outcome === "closed" ? "scene closed" : "HTTP 404",
        );
        expect(scene.textures).toEqual([]);
      }
    } finally {
      failure?.mockRestore();
      scene.dispose();
      engine.dispose();
    }
  }
});

test("north-up east-longitude UVs preserve landmarks and unwrap the geographic seam", () => {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  try {
    const mesh = new Mesh("worked geographic landmarks", scene);
    const data = new VertexData();
    const angle = Math.PI / 18;
    data.positions = [
      1,
      0,
      0,
      0,
      0,
      -1,
      -1,
      0,
      0,
      0,
      0,
      1,
      0,
      1,
      0,
      0,
      -1,
      0,
      Math.cos(angle),
      0,
      -Math.sin(angle),
      Math.cos(angle),
      0,
      Math.sin(angle),
      Math.sqrt(1 - 0.625 ** 2),
      0.625,
      0,
    ];
    data.indices = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    data.normals = [...data.positions];
    data.applyToMesh(mesh);
    mapMoonSurface(mesh, Vector3.Zero());
    const uv = mesh.getVerticesData("uv");
    const fade = mesh.getVerticesData("projectionFade");
    if (!uv || !fade) throw new Error("The production mapping must provide UVs and top fade.");
    const longitude = (index: number): number => ((uv[index * 2] % 1) + 1) % 1;
    expect(longitude(0)).toBeCloseTo(0, 6);
    expect(longitude(1)).toBeCloseTo(0.25, 6);
    expect(longitude(2)).toBeCloseTo(0.5, 6);
    expect(longitude(3)).toBeCloseTo(0.75, 6);
    expect(uv[9]).toBeCloseTo(0, 6);
    expect(uv[11]).toBeCloseTo(1, 6);
    expect(fade[0]).toBe(1);
    expect(fade[4]).toBe(0);
    expect(fade[5]).toBe(1);
    expect(fade[8]).toBeCloseTo(0.5, 6);
    expect(Math.max(uv[12], uv[14], uv[16]) - Math.min(uv[12], uv[14], uv[16])).toBeLessThan(0.06);
    expect(mesh.getVerticesData("position")).toEqual(data.positions);
  } finally {
    scene.dispose();
    engine.dispose();
  }
});

test("the restored clear front closes both drawing sections while leaving the entrance open", async () => {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  scene.useRightHandedSystem = true;
  const projection = new StandardMaterial("image-bearing outer skin", scene);
  const clear = new StandardMaterial("unprojected clear plastic", scene);
  try {
    const model = await loadProjectedLander(scene, await readFile(landerPath), projection);
    const caps = createClearFrontCaps(scene, model.center, model.radius, model.innerRadius, clear);
    const mouthAxis = new Vector3(0, -0.2, 1).normalize();
    for (const [index, cap] of caps.entries()) {
      expect(cap.material).toBe(clear);
      expect(cap.material).not.toBe(projection);
      const radius = index === 0 ? 1.25 : 5 / 6;
      const positions = cap.getVerticesData("position");
      const indices = cap.getIndices();
      if (!positions || !indices) throw new Error("Expected clear spherical cap geometry.");
      let largestRadialError = 0;
      let furthestUsedFrontZ = 0;
      let leastFrontDirection = 1;
      let greatestEntranceDot = -1;
      let leastOutwardWinding = 1;
      for (const index of new Set(indices)) {
        const point = Vector3.FromArray(positions, index * 3).subtract(model.center);
        largestRadialError = Math.max(largestRadialError, Math.abs(point.length() - radius));
        furthestUsedFrontZ = Math.max(furthestUsedFrontZ, point.z);
      }
      for (let offset = 0; offset < indices.length; offset += 3) {
        const a = Vector3.FromArray(positions, indices[offset] * 3);
        const b = Vector3.FromArray(positions, indices[offset + 1] * 3);
        const c = Vector3.FromArray(positions, indices[offset + 2] * 3);
        const direction = a
          .add(b)
          .add(c)
          .scale(1 / 3)
          .subtract(model.center)
          .normalize();
        leastFrontDirection = Math.min(leastFrontDirection, direction.z);
        greatestEntranceDot = Math.max(greatestEntranceDot, Vector3.Dot(direction, mouthAxis));
        const normal = Vector3.Cross(b.subtract(a), c.subtract(a));
        if (normal.lengthSquared() > 1e-12) {
          leastOutwardWinding = Math.min(
            leastOutwardWinding,
            Vector3.Dot(normal.normalize(), direction),
          );
        }
      }
      expect(largestRadialError).toBeLessThan(0.00001);
      expect(furthestUsedFrontZ).toBeGreaterThan(radius * 0.95);
      expect(leastFrontDirection).toBeGreaterThan(0);
      expect(greatestEntranceDot).toBeLessThan(Math.cos(Math.asin(0.34 / radius)));
      expect(leastOutwardWinding).toBeGreaterThan(0.99);
    }
    expect(
      scene.meshes.filter((mesh) => mesh.material === projection).map((mesh) => mesh.name),
    ).toEqual(["Outer wall - front panel removed for drawing"]);
    expect(
      scene.getMeshByName("Open entry tunnel - nominal, product unselected")?.isEnabled(),
    ).toBe(true);
  } finally {
    scene.dispose();
    engine.dispose();
  }
});

test("elevated views reveal the sphere top while following the lenses and clear entrance", async () => {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  scene.useRightHandedSystem = true;
  const projection = new StandardMaterial("projected skin", scene);
  try {
    const model = await loadProjectedLander(scene, await readFile(landerPath), projection);
    const camera = new ArcRotateCamera("view test", 0, 1.4, 8.6, model.center, scene);
    for (const [view, lensIndex] of [
      ["left", 1],
      ["rear", 0],
      ["right", 2],
    ] as const) {
      setProjectionView(camera, view, model.center, model.lenses);
      const cameraDirection = camera.position.subtract(model.center);
      const elevation =
        (Math.atan2(cameraDirection.y, Math.hypot(cameraDirection.x, cameraDirection.z)) * 180) /
        Math.PI;
      expect(elevation).toBeGreaterThan(15);
      expect(elevation).toBeLessThan(25);
      cameraDirection.y = 0;
      const lensDirection = model.lenses[lensIndex].subtract(model.center);
      lensDirection.y = 0;
      expect(Vector3.Dot(cameraDirection.normalize(), lensDirection.normalize())).toBeCloseTo(1, 6);
    }
    setProjectionView(camera, "front", model.center, model.lenses);
    expect(camera.position.x).toBeCloseTo(0, 6);
    expect(camera.position.z).toBeGreaterThan(8);
    expect(camera.position.y - model.center.y).toBeGreaterThan(2.3);
  } finally {
    scene.dispose();
    engine.dispose();
  }
});

test("aerial side presets keep the entire actual support frame inside the stage", async () => {
  const engine = new NullEngine({
    ...new NullEngineOptions(),
    renderWidth: 1422,
    renderHeight: 800,
  });
  const scene = new Scene(engine);
  scene.useRightHandedSystem = true;
  try {
    const model = await loadProjectedLander(
      scene,
      await readFile(aerialPath),
      new StandardMaterial("aerial wall", scene),
    );
    const camera = new ArcRotateCamera(
      "aerial framing",
      0,
      1.4,
      8.6,
      model.center.subtract(new Vector3(0, 0.18, 0)),
      scene,
    );
    for (const view of ["right", "left", "rear", "front"] as const) {
      setProjectionView(camera, view, model.center, model.lenses, model.meshes);
      const transform = camera.getViewMatrix(true).multiply(camera.getProjectionMatrix(true));
      let furthestEdge = 0;
      for (const mesh of model.meshes) {
        if (!mesh.getTotalVertices() || /participant/i.test(mesh.name)) continue;
        mesh.computeWorldMatrix(true);
        for (const point of mesh.getBoundingInfo().boundingBox.vectorsWorld) {
          const screen = Vector3.TransformCoordinates(point, transform);
          furthestEdge = Math.max(furthestEdge, Math.abs(screen.x), Math.abs(screen.y));
        }
      }
      expect(furthestEdge).toBeLessThanOrEqual(0.90001);
    }
    camera.alpha = 0.7;
    camera.beta = 1.3;
    camera.radius = 5;
    camera.upperRadiusLimit = 13;
    camera.getViewMatrix(true);
    const target = camera.target.clone();
    fitProjectionRig(camera, model.meshes);
    expect(camera.radius).toBeGreaterThan(5);
    expect(camera.upperRadiusLimit).toBeGreaterThanOrEqual(camera.radius);
    expect(camera.alpha).toBeCloseTo(0.7, 6);
    expect(camera.beta).toBeCloseTo(1.3, 6);
    expect(camera.target).toEqual(target);
  } finally {
    scene.dispose();
    engine.dispose();
  }
});

test("aborting a pending lander import leaves no imported meshes or materials", async () => {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  const projection = new StandardMaterial("retained caller material", scene);
  const controller = new AbortController();
  try {
    const pending = loadProjectedLander(
      scene,
      await readFile(landerPath),
      projection,
      controller.signal,
    );
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
    expect(scene.meshes).toEqual([]);
    expect(scene.materials).toEqual([projection]);
  } finally {
    scene.dispose();
    engine.dispose();
  }
});

test("a model without the projection wall is rejected without leaving a substitute sphere", async () => {
  const engine = new NullEngine();
  const scene = new Scene(engine);
  const projection = new StandardMaterial("retained caller material", scene);
  try {
    const bytes = await readFile(landerPath);
    const originalName = "Outer wall - front panel removed for drawing";
    const nameOffset = bytes.indexOf(originalName);
    expect(nameOffset).toBeGreaterThan(0);
    bytes.write("Other wall - front panel removed for drawing", nameOffset);
    await expect(loadProjectedLander(scene, bytes, projection)).rejects.toThrow(
      "Outer wall - front panel removed for drawing",
    );
    expect(scene.meshes).toEqual([]);
    expect(scene.materials).toEqual([projection]);
  } finally {
    scene.dispose();
    engine.dispose();
  }
});
