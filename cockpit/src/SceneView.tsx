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
import { MODEL_STUDIES } from "./models/model-spec";
import { buildModel, dimensionGuides } from "./models/support-models";
import type { Option } from "./scenario";
import { Button } from "./ui";

export default function SceneView({ option, visible }: { option: Option; visible: boolean }): JSX.Element {
  const canvas = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef<ArcRotateCamera | null>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const guidesRef = useRef<TransformNode | null>(null);
  const visibleRef = useRef(visible);
  const wireframeRef = useRef(false);
  const showGuidesRef = useRef(true);
  const home = useRef({ target: Vector3.Zero(), radius: 12 });
  const [model, setModel] = useState("scenario");
  const [status, setStatus] = useState("Loading scene…");
  const [failed, setFailed] = useState(false);
  const [wireframe, setWireframe] = useState(false);
  const [guides, setGuides] = useState(true);
  const [dimensions, setDimensions] = useState<string[]>([]);
  const selectedId = model === "scenario" ? option.id : model;
  const study = MODEL_STUDIES.find(value => value.id === selectedId);
  const archive = ["a","b","v4"].includes(model);
  const reset = (): void => {
    const camera = cameraRef.current;
    if (camera) {
      camera.alpha = -Math.PI / 2.8; camera.beta = Math.PI / 2.8;
      camera.radius = home.current.radius; camera.setTarget(home.current.target);
    }
  };
  useEffect(() => {
    if (!canvas.current) return;
    let engine: Engine;
    try { engine = new Engine(canvas.current, true, { adaptToDeviceRatio: true }); }
    catch {
      setFailed(true); setStatus("WebGL is unavailable. Model downloads, dimensions and the budget still work."); return;
    }
    const scene = new Scene(engine);
    engineRef.current = engine; sceneRef.current = scene;
    let cancelled = false;
    setFailed(false); setStatus("Loading scene…"); setDimensions([]);
    scene.clearColor = new Color4(0.83,0.89,0.92,1);
    const camera = new ArcRotateCamera("view",-Math.PI/2.8,Math.PI/2.8,12,new Vector3(0,1.8,0),scene);
    cameraRef.current = camera; camera.attachControl(canvas.current,true);
    camera.lowerRadiusLimit = 0.15; camera.upperRadiusLimit = 55;
    camera.lowerBetaLimit = 0.05; camera.upperBetaLimit = Math.PI/1.65;
    camera.wheelDeltaPercentage = 0.012; camera.panningSensibility = 180;
    camera.minZ = 0.01;
    new HemisphericLight("sky",new Vector3(0.5,1,-0.4),scene).intensity = 1.25;
    const ground = MeshBuilder.CreateGround("Ground plane",{width:26,height:26},scene);
    ground.position.y = -0.09;
    const create = async (): Promise<void> => {
      if (archive) {
        const loaded = await SceneLoader.ImportMeshAsync("","/studio-data/",`original-${model}.glb`,scene);
        if(cancelled) return;
        const bounds=loaded.meshes[0].getHierarchyBoundingVectors(true);
        camera.setTarget(bounds.min.add(bounds.max).scale(0.5));
        camera.radius=Vector3.Distance(bounds.min,bounds.max)*1.15;
        setStatus(model==="v4" ? "v4 Fixed15 · untouched source GLB · 15 ft reach · unpriced, unrated" : `Original ${model.toUpperCase()} · untouched source GLB · metres / Y-up`);
      } else {
        const built=buildModel(scene,selectedId);
        guidesRef.current=dimensionGuides(scene,built);
        guidesRef.current.setEnabled(showGuidesRef.current);
        camera.setTarget(new Vector3(...built.target)); camera.radius=built.radius;
        setDimensions(built.dimensions.map(value=>value.label));
        setStatus("Dimensioned layout study · unoccupied · no verified load capacity or fabrication fit");
      }
      home.current={ target:camera.target.clone(),radius:camera.radius };
      for(const material of scene.materials) material.wireframe=wireframeRef.current;
    };
    void create().catch(error=>{
      if(!cancelled){setFailed(true);setStatus(`Model load failed: ${error instanceof Error ? error.message : "unknown error"}`);}
    });
    const observer=new ResizeObserver(()=>engine.resize());observer.observe(canvas.current);
    engine.runRenderLoop(()=>{if(visibleRef.current)scene.render();});
    return ()=>{
      cancelled=true;observer.disconnect();
      cameraRef.current=null;sceneRef.current=null;engineRef.current=null;guidesRef.current=null;
      scene.dispose();engine.dispose();
    };
  },[selectedId,archive,model]);
  useEffect(()=>{visibleRef.current=visible;if(visible)engineRef.current?.resize();},[visible]);
  useEffect(()=>{wireframeRef.current=wireframe;for(const mat of sceneRef.current?.materials??[])mat.wireframe=wireframe;},[wireframe]);
  useEffect(()=>{showGuidesRef.current=guides;guidesRef.current?.setEnabled(guides);},[guides]);
  const view=(preset:"side"|"rear"|"top"):void=>{
    const camera=cameraRef.current;if(!camera)return;
    camera.setTarget(home.current.target);camera.radius=home.current.radius;
    camera.alpha=preset==="rear"?0:-Math.PI/2;
    camera.beta=preset==="top"?0.05:Math.PI/2;
  };
  return <section className="scene" aria-label="3D scene">
    <canvas ref={canvas} aria-label="Interactive 3D study. Drag to orbit, wheel to zoom; preset views and dimensions below." tabIndex={0}/>
    <div className="scene-heading"><span className="eyebrow">MODEL STUDY</span><span>{study?.label??(model==="v4"?"v4 Fixed15 reference":`Archive reference ${model.toUpperCase()}`)}</span></div>
    <details className="model-evidence">
      <summary>Dimensions & accuracy</summary>
      <p>{study?.note??"Original package geometry is preserved. Its truck and hardware envelopes are illustrative."}</p>
      {dimensions.length>0&&<ul>{dimensions.map(label=><li key={label}>{label}</li>)}</ul>}
      <p>Truck: 2021 Ram 2500 Laramie Mega Cab 4x4. Factory receiver and original Ultimate confirmed by Andrew.</p>
      <p>Receiver height, pin inset, gooseneck location, installed ball height, wheels and body surfaces still need measurements.</p>
      <a href="/studio-data/truck-and-option-models.md" target="_blank" rel="noreferrer">Sources, model coverage & library decisions</a>
    </details>
    <div className="scene-status" role={failed?"alert":"status"}>
      {status}
      {model!=="scenario"&&<strong> · Reference view only; budget remains {option.name}.</strong>}
    </div>
    <div className="scene-tools">
      <label><span className="sr-only">Model source</span><select aria-label="Model source" value={model} onChange={event=>setModel(event.target.value)}>
        <option value="scenario">Selected budget option</option>
        {["Budget options","Mount studies","Hardware"].map(group=><optgroup key={group} label={group}>{MODEL_STUDIES.filter(item=>item.group===group).map(item=><option key={item.id} value={item.id}>{item.label}</option>)}</optgroup>)}
        <optgroup label="Untouched source models"><option value="a">v3 A · dual hitch</option><option value="b">v3 B · chassis saddle</option><option value="v4">v4 Fixed15 · source GLB</option></optgroup>
      </select></label>
      <Button variant="outline" onClick={reset}><RotateCcw size={16}/>Reset</Button>
      <Button variant="outline" onClick={()=>view("side")}>Side</Button>
      <Button variant="outline" onClick={()=>view("rear")}>Rear</Button>
      <Button variant="outline" onClick={()=>view("top")}>Top</Button>
      <Button variant="outline" aria-pressed={wireframe} onClick={()=>setWireframe(!wireframe)}>Wireframe</Button>
      {!archive&&<Button variant="outline" aria-pressed={guides} onClick={()=>setGuides(!guides)}>Dimensions</Button>}
      <a className="model-download" href={archive?`/studio-data/original-${model}.glb`:`/studio-models/${selectedId}.babylon`} download>Download {archive?"GLB":"3D scene"}</a>
    </div>
  </section>;
}
