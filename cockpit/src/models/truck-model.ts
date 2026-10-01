import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Scene } from "@babylonjs/core/scene";
import { geometry, type Geometry, type Point } from "./geometry";
import { RAM, REAR_END, BED_FRONT, BED_REAR, RECEIVER, ANDERSEN } from "./model-spec";

const paint = "#f2f1e9", chrome = "#b2bdc4", rubber = "#202b31", glass = "#244352";
/** Dimensioned receiver aperture; its unmeasured exterior is a layout envelope. */
export function receiver(g: Geometry, x = 0, y = 0): void {
  const a = RECEIVER.aperture, t = RECEIVER.wall, d = RECEIVER.length;
  for (const sign of [-1, 1]) {
    g.box(`receiver-horizontal-${sign}`, [d, t, a+2*t], [x-d/2, y+sign*(a+t)/2, 0], rubber);
    g.box(`receiver-vertical-${sign}`, [d, a, t], [x-d/2, y, sign*(a+t)/2], rubber);
    g.box(`receiver-lip-h-${sign}`, [0.025, 0.012, a+0.045], [x-0.0125, y+sign*(a+0.032)/2, 0], chrome);
    g.box(`receiver-lip-v-${sign}`, [0.025, a+0.02, 0.012], [x-0.0125, y, sign*(a+0.032)/2], chrome);
    g.tube(`receiver-chain-loop-${sign}`, [[x-0.10,y-0.025,sign*0.07],[x-0.10,y-0.065,sign*0.09],[x-0.20,y-0.065,sign*0.09],[x-0.20,y-0.025,sign*0.07]], 0.007, rubber);
    g.box(`receiver-frame-bracket-${sign}`, [0.28, 0.17, 0.008], [x-0.29,y+0.065,sign*0.48], rubber);
  }
  g.box("receiver-crossmember-unmeasured", [0.09,0.09,1.04], [x-0.28,y,0], rubber);
  // Pin is deliberately removed to leave the receiver open in the inspection model.
  g.beam("receiver-pin-unmeasured", [x-0.13,y+0.16,-0.08], [x-0.13,y+0.16,0.08], 0.015875, chrome);
}

/** Pre-Gen-3 standard base. Members are visual, not manufacturing dimensions. */
export function andersen(g: Geometry, at: Point = [0,0,0]): void {
  const [x,y,z] = at, a = ANDERSEN, w = a.width/2, tube = 0.038;
  const near = a.frontEdge, far = a.rearEdge;
  for (const side of [-1,1]) {
    g.box(`andersen-side-${side}`, [a.length,tube,tube], [x+(near+far)/2,y+tube/2,z+side*(w-tube/2)], chrome);
    g.box(`andersen-end-${side}`, [tube,tube,a.width-2*tube], [x+(side<0?near+ tube/2:far-tube/2),y+tube/2,z], chrome);
    for (const end of [near+tube,far-tube])
      g.beam(`andersen-brace-${side}-${end}`, [x+end,y+tube,z+side*(w-tube)], [x+(end>0?a.ballOffset:0),y+a.baseHeight-0.04,z], 0.035, chrome);
    g.box(`andersen-crossbar-${side}`, [tube,0.022,a.width-2*tube], [x+(side<0?near+0.14:far-0.14),y+0.013,z], chrome);
  }
  g.box("andersen-gooseneck-clamp", [0.075,0.22,0.075], [x,y+0.22/2,z], chrome);
  g.beam("andersen-coupler-top-bolt", [x,y+0.20,z], [x,y+0.255,z], 0.016, rubber);
  g.box("andersen-ball-sleeve", [0.065,0.15,0.065], [x+a.ballOffset,y+a.baseHeight-0.075,z], chrome);
  g.beam("andersen-top-bridge", [x,y+0.2,z], [x+a.ballOffset,y+a.baseHeight-0.06,z], 0.055, chrome);
  g.beam("andersen-ball-stem", [x+a.ballOffset,y+a.baseHeight-0.11,z], [x+a.ballOffset,y+a.lowBallTop-a.ballDiameter/2,z], 0.038, chrome);
  g.sphere("andersen-2-5-16-ball", a.ballDiameter, [x+a.ballOffset,y+a.lowBallTop-a.ballDiameter/2,z], chrome);
  g.beam("andersen-height-pin", [x+a.ballOffset,y+a.baseHeight-0.055,z-0.06], [x+a.ballOffset,y+a.baseHeight-0.055,z+0.06], 0.0095, rubber);
  // Detached trailer-side coupler is an exploded reference, not attached to the boom.
  g.box("andersen-coupler-block-exploded", [0.2032,0.0762,0.1016], [x+a.ballOffset+0.05,y+0.63,z], chrome);
  const funnel = g.box("andersen-red-funnel-envelope", [0.13,0.02,0.13], [x+a.ballOffset,y+0.58,z], "#b83931");
  funnel.metadata = { accuracy: "illustrative external shape; socket not machined" };
}

/** Detailed layout mesh constrained by published 2021 Mega Cab dimensions. */
export function truck(scene: Scene, parent: TransformNode, position: Point = [0,0,0]): TransformNode {
  const root = new TransformNode("ram-2021-laramie-mega-cab-4x4", scene);
  root.parent = parent; root.position.set(...position); const g = geometry(scene,root);
  const front = -RAM.wheelbase-RAM.frontOverhang, half = RAM.bodyWidth/2;
  const cabRear = BED_FRONT-0.075, cabFront = -3.57;
  const section = (x:number, bottom:number, top:number, lowerWidth:number, upperWidth:number): Point[] =>
    [[x,bottom,-lowerWidth/2],[x,top,-upperWidth/2],[x,top,upperWidth/2],[x,bottom,lowerWidth/2]];
  // Shoulder, greenhouse and hood surfaces are visually reconstructed, not OEM CAD.
  g.loft("ram-cab-lower", [section(cabFront,0.66,1.41,1.92,2.00),section(cabRear,0.66,1.41,1.92,2.00)],paint);
  g.loft("ram-mega-cab-roof", [section(cabFront,1.40,1.43,2.00,1.90),section(-3.01,1.40,RAM.height,2.00,1.76),section(cabRear-0.12,1.40,RAM.height,2.00,1.76),section(cabRear,1.40,1.93,2.00,1.81)],paint);
  g.loft("ram-hood", [section(front+0.13,1.05,1.36,1.89,1.63),section(-4.64,1.06,1.48,1.95,1.80),section(cabFront,1.08,1.48,1.96,1.80)],paint);
  // Wheel arches use ribbons instead of solid boxes intersecting the tyres.
  for (const side of [-1,1]) for (const [axle,start,end] of [[-RAM.wheelbase,front+0.05,cabFront],[0,BED_FRONT,REAR_END-0.10]]) {
    const upper: Vector3[] = [], lower: Vector3[] = [];
    for(let i=0;i<=48;i++) {
      const x=start+(end-start)*i/48, dx=x-axle;
      const low = Math.abs(dx)<0.49 ? Math.max(0.60,0.42+Math.sqrt(0.49**2-dx**2)) : 0.60;
      lower.push(new Vector3(x,low,side*half)); upper.push(new Vector3(x,1.47,side*half));
    }
    g.finish(MeshBuilder.CreateRibbon(`ram-arched-panel-${side}-${axle}`, {pathArray:[lower,upper],sideOrientation:Mesh.DOUBLESIDE}, scene),[0,0,0],paint);
    const arch: Point[] = [];
    for(let a=0;a<=24;a++){const angle=Math.PI*a/24;arch.push([axle+0.50*Math.cos(angle),0.42+0.50*Math.sin(angle),side*(half+0.009)]);}
    g.tube(`ram-arch-trim-${side}-${axle}`,arch,0.021,chrome);
  }
  // Open 6'4" bed, wheel tubs and ribs. Bed-floor height is not measured.
  g.box("ram-bed-floor",[RAM.bedLength,0.04,RAM.bedWidth],[(BED_FRONT+BED_REAR)/2,RAM.bedFloor-0.02,0],rubber);
  for(let z=-0.75;z<0.8;z+=0.1) g.box(`ram-bed-rib-${z}`,[RAM.bedLength,0.012,0.018],[(BED_FRONT+BED_REAR)/2,RAM.bedFloor+0.006,z],"#3c464b");
  for (const side of [-1,1]) {
    g.box(`ram-bed-inner-wall-${side}`,[RAM.bedLength,RAM.bedDepth,0.035],[(BED_FRONT+BED_REAR)/2,RAM.bedFloor+RAM.bedDepth/2,side*(RAM.bedWidth/2+0.0175)],rubber);
    const tub = (RAM.bedWidth-RAM.wheelhouseGap)/2;
    g.box(`ram-wheel-tub-${side}`,[0.85,0.27,tub],[0,RAM.bedFloor+0.135,side*(RAM.wheelhouseGap/2+tub/2)],rubber);
    g.box(`ram-bed-rail-${side}`,[RAM.bedLength+0.06,0.04,0.15],[(BED_FRONT+BED_REAR)/2,RAM.bedFloor+RAM.bedDepth,side*(half-0.07)],paint);
    g.box(`ram-running-board-${side}`,[2.65,0.06,0.18],[(cabRear+cabFront)/2,0.53,side*1.04],chrome);
    // Distinct four doors and the additional Mega Cab volume behind rear seats.
    for (const [x1,x2,roof] of [[-3.45,-2.36,1.96],[-2.29,-1.10,1.96]]) {
      g.loft(`ram-window-${side}-${x1}`,[[[x1,1.48,side*0.997],[x1+0.36,roof,side*0.894],[x2,roof,side*0.894],[x2,1.48,side*0.997]],[[x1,1.48,side*1.003],[x1+0.36,roof,side*0.900],[x2,roof,side*0.900],[x2,1.48,side*1.003]]],glass);
      g.box(`ram-door-handle-${side}-${x2}`,[0.15,0.027,0.024],[x2-0.10,1.35,side*1.012],chrome);
      g.tube(`ram-door-gap-${side}-${x2}`,[[x2+0.03,0.70,side*1.005],[x2+0.03,1.43,side*1.005]],0.004,rubber);
    }
    g.beam(`ram-mirror-arm-${side}`,[-3.3,1.53,side*0.97],[-3.35,1.55,side*1.19],0.045,rubber);
    g.box(`ram-towing-mirror-${side}`,[0.14,0.23,0.24],[-3.35,1.62,side*1.22],rubber);
    g.box(`ram-mirror-glass-${side}`,[0.006,0.19,0.20],[-3.273,1.62,side*1.22],chrome);
    g.box(`ram-taillight-${side}`,[0.08,0.35,0.17],[REAR_END-0.11,1.28,side*(half-0.09)],"#a7272c");
    g.box(`ram-headlight-${side}`,[0.09,0.20,0.38],[front+0.09,1.24,side*0.78],"#e4f4fc");
    g.box(`ram-frame-rail-${side}`,[5.4,0.16,0.075],[-1.75,0.60,side*0.46],rubber);
  }
  g.loft("ram-windshield",[[[-3.53,1.48,-0.88],[-3.01,1.98,-0.81],[-3.01,1.98,0.81],[-3.53,1.48,0.88]],[[-3.538,1.48,-0.88],[-3.018,1.98,-0.81],[-3.018,1.98,0.81],[-3.538,1.48,0.88]]],glass);
  g.box("ram-rear-glass",[0.018,0.38,1.50],[cabRear+0.005,1.70,0],glass);
  g.box("ram-sliding-window",[0.021,0.35,0.4],[cabRear+0.01,1.70,0],rubber);
  g.box("ram-bed-front",[0.04,RAM.bedDepth,RAM.bedWidth],[BED_FRONT-0.02,RAM.bedFloor+RAM.bedDepth/2,0],rubber);
  g.box("ram-tailgate",[0.10,RAM.bedDepth,RAM.bodyWidth-0.16],[BED_REAR+0.05,RAM.bedFloor+RAM.bedDepth/2,0],paint);
  g.box("ram-tailgate-handle",[0.02,0.06,0.19],[BED_REAR+0.11,1.43,0],rubber);
  g.box("ram-front-bumper",[0.15,0.21,RAM.bodyWidth],[front+0.075,0.83,0],chrome);
  g.box("ram-rear-step-bumper",[0.14,0.18,RAM.bodyWidth],[REAR_END-0.07,0.83,0],chrome);
  g.box("ram-grille-surround",[0.08,0.43,1.19],[front+0.09,1.21,0],chrome);
  g.box("ram-grille-insert",[0.01,0.34,1.03],[front+0.045,1.21,0],rubber);
  for(let y=1.08;y<1.37;y+=0.075) g.box(`ram-grille-slat-${y}`,[0.013,0.022,1.03],[front+0.034,y,0],chrome);
  g.box("ram-grille-badge-envelope",[0.018,0.08,0.28],[front+0.021,1.24,0],chrome);
  for (const [axle,track,name] of [[-RAM.wheelbase,RAM.frontTrack,"front"],[0,RAM.rearTrack,"rear"]] as const) {
    const axis=g.beam(`ram-${name}-axle`,[axle,0.40,-track/2],[axle,0.40,track/2],0.105,rubber);
    axis.metadata={datum:"published axle spacing; vertical shape illustrative"};
    g.sphere(`ram-${name}-differential`,0.23,[axle,0.40,0],rubber);
    for (const side of [-1,1]) {
      const cy=RAM.tireDiameter/2, z=side*track/2;
      const tire=g.finish(MeshBuilder.CreateCylinder(`ram-${name}-tire-${side}`,{diameter:RAM.tireDiameter,height:RAM.tireWidth,tessellation:48},scene),[axle,cy,z],rubber);tire.rotation.x=Math.PI/2;
      const rim=g.finish(MeshBuilder.CreateTorus(`ram-${name}-rim-${side}`,{diameter:RAM.wheelDiameter,thickness:0.023,tessellation:40},scene),[axle,cy,z+side*0.142],chrome);rim.rotation.x=Math.PI/2;
      g.sphere(`ram-${name}-hub-${side}`,0.13,[axle,cy,z+side*0.15],chrome);
      for(let k=0;k<8;k++) {
        const a=k*Math.PI/4;
        g.beam(`ram-${name}-spoke-${side}-${k}`,[axle+0.058*Math.cos(a),cy+0.058*Math.sin(a),z+side*0.146],[axle+0.217*Math.cos(a+0.12),cy+0.217*Math.sin(a+0.12),z+side*0.146],0.030,chrome);
      }
    }
  }
  receiver(g,REAR_END,RAM.receiverHeight);
  andersen(g,[RAM.gooseneckAxleOffset,RAM.bedFloor,0]);
  root.metadata = { model:"2021 Ram 2500 Laramie Mega Cab 4x4", units:"metres", evidence:"manufacturer dimensions plus illustrative surfaces; not OEM CAD", unknowns:["body surface","wheel equipment","suspension condition","receiver height and pin inset","gooseneck location","underbed hardware"] };
  return root;
}
