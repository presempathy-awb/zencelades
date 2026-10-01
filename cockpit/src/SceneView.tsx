import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Scene } from "@babylonjs/core/scene";
import { type JSX, useEffect, useRef, useState } from "react";
import "@babylonjs/core/Culling/ray";
import "@babylonjs/loaders/glTF/2.0/glTFLoader";
import { RotateCcw } from "lucide-react";
import { MODEL_STUDIES, selectableModelStudies } from "./models/model-spec";
import { buildModel, dimensionGuides } from "./models/support-models";
import type { Option } from "./scenario";
import { Button } from "./ui";
import {
  BASKET_MODEL_IDS,
  type CameraCount,
  type ProjectorCount,
  type SphereDiameter,
} from "./models/basket-model";

export default function SceneView({
  option,
  visible,
  model,
  onModelSelect,
  projectors,
  cameras,
  onProjectorCountChange,
  diameter,
  onDiameterChange,
}: {
  option: Option;
  visible: boolean;
  model: string;
  onModelSelect: (id: string) => void;
  projectors: ProjectorCount;
  cameras: CameraCount;
  onProjectorCountChange: (count: ProjectorCount) => void;
  diameter: SphereDiameter;
  onDiameterChange: (diameter: SphereDiameter) => void;
}): JSX.Element {
  const canvas = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef<ArcRotateCamera | null>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const guidesRef = useRef<TransformNode | null>(null);
  const visibleRef = useRef(visible);
  const wireframeRef = useRef(false);
  const showGuidesRef = useRef(true);
  const home = useRef({ target: Vector3.Zero(), radius: 12 });
  const [status, setStatus] = useState("Loading scene…");
  const [failed, setFailed] = useState(false);
  const [wireframe, setWireframe] = useState(false);
  const [guides, setGuides] = useState(true);
  const [dimensions, setDimensions] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState("");
  const [showTruck, setShowTruck] = useState(false);
  const selectedId = model === "scenario" ? option.id : model;
  const study = MODEL_STUDIES.find((value) => value.id === selectedId);
  const archive = ["a", "b", "v4"].includes(model);
  const configurable = BASKET_MODEL_IDS.includes(selectedId);
  const count = configurable ? projectors : undefined;
  const captureCount = configurable ? cameras : undefined;
  const sphereDiameter = configurable ? diameter : 3;
  const reset = (): void => {
    const camera = cameraRef.current;
    if (camera) {
      camera.alpha = -Math.PI / 2.8;
      camera.beta = Math.PI / 2.8;
      camera.radius = home.current.radius;
      camera.setTarget(home.current.target);
    }
  };
  useEffect(() => {
    if (!canvas.current) return;
    let engine: Engine;
    try {
      engine = new Engine(canvas.current, true, { adaptToDeviceRatio: true });
    } catch {
      setFailed(true);
      setStatus("WebGL is unavailable. Model downloads, dimensions and the budget still work.");
      return;
    }
    const scene = new Scene(engine);
    engineRef.current = engine;
    sceneRef.current = scene;
    let cancelled = false;
    setFailed(false);
    setStatus("Loading scene…");
    setDimensions([]);
    setExportStatus("");
    scene.clearColor = new Color4(0.83, 0.89, 0.92, 1);
    const camera = new ArcRotateCamera(
      "view",
      -Math.PI / 2.8,
      Math.PI / 2.8,
      12,
      new Vector3(0, 1.8, 0),
      scene,
    );
    cameraRef.current = camera;
    camera.attachControl(canvas.current, true);
    camera.lowerRadiusLimit = 0.15;
    camera.upperRadiusLimit = 55;
    camera.lowerBetaLimit = 0.05;
    camera.upperBetaLimit = Math.PI / 1.65;
    camera.wheelDeltaPercentage = 0.012;
    camera.panningSensibility = 180;
    camera.minZ = 0.01;
    new HemisphericLight("sky", new Vector3(0.5, 1, -0.4), scene).intensity = 1.25;
    const ground = MeshBuilder.CreateGround("Ground plane", { width: 26, height: 26 }, scene);
    ground.position.y = -0.09;
    const create = async (): Promise<void> => {
      if (archive) {
        const loaded = await SceneLoader.ImportMeshAsync(
          "",
          "/studio-data/",
          `original-${model}.glb`,
          scene,
        );
        if (cancelled) return;
        const bounds = loaded.meshes[0].getHierarchyBoundingVectors(true);
        camera.setTarget(bounds.min.add(bounds.max).scale(0.5));
        camera.radius = Vector3.Distance(bounds.min, bounds.max) * 1.15;
        setStatus(
          model === "v4"
            ? "v4 Fixed15 · untouched source GLB · 15 ft reach · unpriced, unrated"
            : `Original ${model.toUpperCase()} · untouched source GLB · metres / Y-up`,
        );
      } else {
        const built = buildModel(scene, selectedId, count, sphereDiameter, captureCount);
        guidesRef.current = dimensionGuides(scene, built);
        guidesRef.current.setEnabled(showGuidesRef.current);
        camera.setTarget(new Vector3(...built.target));
        camera.radius = built.radius;
        setDimensions(built.dimensions.map((value) => value.label));
        setStatus(
          "Concept layout study · read selected scope · no verified load capacity or fabrication fit",
        );
      }
      home.current = { target: camera.target.clone(), radius: camera.radius };
      for (const material of scene.materials) material.wireframe = wireframeRef.current;
    };
    void create().catch((error) => {
      if (!cancelled) {
        setFailed(true);
        setStatus(`Model load failed: ${error instanceof Error ? error.message : "unknown error"}`);
      }
    });
    const observer = new ResizeObserver(() => engine.resize());
    observer.observe(canvas.current);
    engine.runRenderLoop(() => {
      if (visibleRef.current) scene.render();
    });
    return () => {
      cancelled = true;
      observer.disconnect();
      cameraRef.current = null;
      sceneRef.current = null;
      engineRef.current = null;
      guidesRef.current = null;
      scene.dispose();
      engine.dispose();
    };
  }, [selectedId, archive, model, count, sphereDiameter, captureCount]);
  useEffect(() => {
    visibleRef.current = visible;
    if (visible) engineRef.current?.resize();
  }, [visible]);
  useEffect(() => {
    wireframeRef.current = wireframe;
    for (const mat of sceneRef.current?.materials ?? []) mat.wireframe = wireframe;
  }, [wireframe]);
  useEffect(() => {
    showGuidesRef.current = guides;
    guidesRef.current?.setEnabled(guides);
  }, [guides]);
  const view = (preset: "side" | "rear" | "top"): void => {
    const camera = cameraRef.current;
    if (!camera) return;
    camera.setTarget(home.current.target);
    camera.radius = home.current.radius;
    camera.alpha = preset === "rear" ? 0 : -Math.PI / 2;
    camera.beta = preset === "top" ? 0.05 : Math.PI / 2;
  };
  const zoom = (factor: number): void => {
    const camera = cameraRef.current;
    if (!camera) return;
    camera.radius = Math.min(
      camera.upperRadiusLimit ?? 55,
      Math.max(camera.lowerRadiusLimit ?? 0.15, camera.radius * factor),
    );
  };
  const rotate = (direction: number): void => {
    const camera = cameraRef.current;
    if (camera) camera.alpha += direction * (Math.PI / 6);
  };
  const downloadModel = async (): Promise<void> => {
    setExporting(true);
    setExportStatus("");
    const name = `${selectedId}-${diameter}m-${projectors}-heads-${cameras}-cameras`;
    try {
      const { exportModel } = await import("./models/model-export");
      const blob = await exportModel(selectedId, projectors, diameter, cameras);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${name}.glb`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setExportStatus(`Downloaded ${name}.glb · layout study, no rated capacity.`);
    } catch (error) {
      setExportStatus(
        `Download failed: ${error instanceof Error ? error.message : "unknown error"}`,
      );
    } finally {
      setExporting(false);
    }
  };
  return (
    <section className="scene" aria-label="3D scene">
      <canvas
        ref={canvas}
        aria-label="Interactive 3D study. Drag to orbit, wheel to zoom; preset views and dimensions below."
        tabIndex={0}
      />
      <div className="scene-heading">
        <span className="eyebrow">MODEL STUDY</span>
        <span>
          {study?.label ??
            (model === "v4" ? "v4 Fixed15 reference" : `Archive reference ${model.toUpperCase()}`)}
        </span>
      </div>
      <details className="model-evidence">
        <summary>Dimensions & accuracy</summary>
        <p>
          {study?.note ??
            "Original package geometry is preserved. Its truck and hardware envelopes are illustrative."}
        </p>
        {dimensions.length > 0 && (
          <ul>
            {dimensions.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
        )}
        <p>
          Choose one, two or three projector heads. The three-head drawings show an expanded option;
          fewer heads can deliberately cover selected viewing sides. Equipment and rain covers still
          need quotes within the $3,000 total.
        </p>
        {configurable && (
          <p>
            This common-holder study follows the selected sphere size, head count and camera count,
            using triangle arms. The six-foot ring and triangle footprint stay fixed; their
            elevation and the webbing route change with sphere size. The inner shell is a
            proportional placeholder, not measured usable space. Capture cameras are location
            witnesses, not measured hardware. Host and independent-stand selections remain separate
            procurement studies. Current-view GLB exports contain this size and these equipment
            counts; the gallery keeps its fixed studies.
          </p>
        )}
        <p>
          Owned hazer purchase is $0. Exact unit dimensions, power, fluid and operating clearances
          remain unconfirmed.
        </p>
        <a href="/attachments/Zencelades-3D-Schematics.pdf" target="_blank" rel="noreferrer">
          Dimensioned submission schematics
        </a>
        <p>
          <a href="/models/">Open rendered model images and source files</a>
        </p>
      </details>
      <div className="scene-status" role={failed ? "alert" : "status"}>
        {status}
        {configurable && (
          <strong>
            {" "}
            · {projectors} {projectors === 1 ? "head" : "heads"} on triangle arms · {diameter} m
            study · {cameras} capture {cameras === 1 ? "camera" : "cameras"}.
          </strong>
        )}
        {model !== "scenario" && (
          <strong> · Reference view only; budget remains {option.name}.</strong>
        )}
        {selectedId === "basket-truck" && (
          <strong>
            {" "}
            Truck support is an unpriced stretch goal, excluded from the Love Burn estimate.
          </strong>
        )}
        {exportStatus && <span> · {exportStatus}</span>}
      </div>
      <div className="scene-tools">
        <div className="holder-modes" role="group" aria-label="Common triangle and ring support">
          <span>Same triangle + ring</span>
          <Button
            variant="outline"
            aria-pressed={selectedId === "basket-lander"}
            onClick={() => onModelSelect("basket-lander")}
          >
            Lander
          </Button>
          <Button
            variant="outline"
            aria-pressed={["love-burn", "basket-aerial-rig"].includes(selectedId)}
            onClick={() => onModelSelect("basket-aerial-rig")}
          >
            Aerial rig
          </Button>
          {showTruck && (
            <Button
              variant="outline"
              aria-pressed={selectedId === "basket-truck"}
              onClick={() => onModelSelect("basket-truck")}
            >
              Truck
            </Button>
          )}
          <label className="check-field">
            <input
              type="checkbox"
              checked={showTruck}
              onChange={(event) => {
                setShowTruck(event.target.checked);
                if (!event.target.checked && selectedId === "basket-truck")
                  onModelSelect("basket-aerial-rig");
              }}
            />
            Show truck stretch goal
          </label>
        </div>
        {configurable && (
          <label>
            <span className="sr-only">Sphere diameter in model</span>
            <select
              aria-label="Sphere diameter in model"
              value={diameter}
              onChange={(event) => onDiameterChange(Number(event.target.value) as SphereDiameter)}
            >
              <option value={2.5}>2.5 m sphere</option>
              <option value={3}>3 m sphere</option>
            </select>
          </label>
        )}
        {configurable && (
          <label>
            <span className="sr-only">Projector heads in model</span>
            <select
              aria-label="Projector heads in model"
              value={projectors}
              onChange={(event) =>
                onProjectorCountChange(Number(event.target.value) as ProjectorCount)
              }
            >
              <option value={0}>No projector heads</option>
              <option value={1}>1 projector head</option>
              <option value={2}>2 projector heads</option>
              <option value={3}>3 projector heads</option>
            </select>
          </label>
        )}
        <label>
          <span className="sr-only">Model source</span>
          <select
            aria-label="Model source"
            value={model}
            onChange={(event) => onModelSelect(event.target.value)}
          >
            <option value="scenario">Selected budget option</option>
            {[
              "Common holder",
              "Seed concepts",
              "Budget options",
              "Mount studies",
              ...(showTruck ? ["Truck stretch goal"] : []),
            ].map((group) => (
              <optgroup key={group} label={group}>
                {selectableModelStudies(showTruck)
                  .filter((item) => item.group === group)
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </label>
        <Button
          variant="outline"
          onClick={reset}
          hint="Return the camera to the entrance view. Your draft choices stay unchanged."
        >
          <RotateCcw size={16} />
          Reset
        </Button>
        <details className="scene-move">
          <summary>Move view</summary>
          <div className="scene-move-actions" role="group" aria-label="Model camera controls">
            <Button variant="outline" disabled={failed} onClick={() => zoom(0.8)}>
              Zoom in
            </Button>
            <Button variant="outline" disabled={failed} onClick={() => zoom(1.25)}>
              Zoom out
            </Button>
            <Button variant="outline" disabled={failed} onClick={() => rotate(-1)}>
              Rotate left
            </Button>
            <Button variant="outline" disabled={failed} onClick={() => rotate(1)}>
              Rotate right
            </Button>
          </div>
        </details>
        <Button
          variant="outline"
          onClick={() => view("side")}
          hint="Inspect the holder and sphere from the side."
        >
          Side
        </Button>
        <Button
          variant="outline"
          onClick={() => view("rear")}
          hint="Look behind the sphere to inspect the rear support and hazer position."
        >
          Rear
        </Button>
        <Button
          variant="outline"
          onClick={() => view("top")}
          hint="Look down on the triangle, entrance clearance and projector layout."
        >
          Top
        </Button>
        <Button
          variant="outline"
          aria-pressed={wireframe}
          onClick={() => setWireframe(!wireframe)}
          hint="Show model mesh edges. These are study geometry, not fabrication drawings."
        >
          Wireframe
        </Button>
        {!archive && (
          <Button
            variant="outline"
            aria-pressed={guides}
            onClick={() => setGuides(!guides)}
            hint="Show the model's study dimensions. They do not certify a load rating or an occupied hang."
          >
            Dimensions
          </Button>
        )}
        {configurable ? (
          <Button
            variant="outline"
            disabled={exporting || failed}
            onClick={() => void downloadModel()}
            hint="Download the displayed sphere size and head count on triangle arms. This is not an approved fabrication model."
          >
            {exporting ? "Exporting GLB…" : "Download current GLB"}
          </Button>
        ) : (
          <a
            className="model-download"
            href={
              archive ? `/studio-data/original-${model}.glb` : `/studio-models/${selectedId}.glb`
            }
            download
          >
            Download GLB
          </a>
        )}
      </div>
    </section>
  );
}
