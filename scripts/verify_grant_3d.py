"""Read exported P053 GLBs back through Blender and check their model facts."""

import json
import math
from pathlib import Path

import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output/grant-3d"
models = json.loads((OUT / "geometry.json").read_text())["models"]
results = []
for model in models:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    bpy.ops.import_scene.gltf(filepath=str(OUT / f"{model['stem']}.glb"))
    bpy.context.view_layer.update()
    meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    heads = [obj for obj in meshes if obj.name.startswith("Projector head")]
    covers = [obj for obj in meshes if obj.name.startswith("Ventilated rain canopy")]
    straps = [obj for obj in meshes if obj.name.startswith("Over-sphere webbing")]
    legs = [obj for obj in meshes if obj.name.startswith("Detachable lander leg")]
    assert len(heads) == len(covers) == 3
    assert len(straps) == (3 if model["mode"] == "suspended" else 0)
    assert len(legs) == (3 if model["mode"] == "lander" else 0)
    hazers = [obj for obj in meshes if obj.name.startswith("Owned external hazer body")]
    assert len(hazers) == 1, "Expected the owned external hazer below the sphere"
    hazer = hazers[0]
    hazer_bounds = [hazer.matrix_world @ Vector(p) for p in hazer.bound_box]
    assert max(p.z for p in hazer_bounds) < model["centre_m"]
    # A sphere/AABB separation check rejects penetration even between vertices.
    nearest = Vector(
        [
            max(
                min(p[n] for p in hazer_bounds), min(c, max(p[n] for p in hazer_bounds))
            )
            for n, c in enumerate((0, 0, model["centre_m"]))
        ]
    )
    assert (nearest - Vector((0, 0, model["centre_m"]))).length > model[
        "diameter_m"
    ] / 2
    pads = [
        obj for obj in meshes if obj.name.startswith(("Lander foot pad", "Host pad"))
    ]
    assert pads
    for pad in pads:
        bottom = min((pad.matrix_world @ v.co).z for v in pad.data.vertices)
        assert math.isclose(bottom, 0, abs_tol=0.00001), (
            f"Foot pad floats above ground: {bottom}"
        )
    outer = next(obj for obj in meshes if obj.name.startswith("Outer wall"))
    vertices = [outer.matrix_world @ v.co for v in outer.data.vertices]
    top = max(v.z for v in vertices)
    assert math.isclose(top, model["sphere_top_m"], abs_tol=0.00001)
    assert math.isclose(
        max(v.x for v in vertices) - min(v.x for v in vertices),
        model["diameter_m"],
        abs_tol=0.00001,
    )
    assert all(
        math.isfinite(n) for obj in meshes for v in obj.data.vertices for n in v.co
    )
    for index, head in enumerate(sorted(heads, key=lambda obj: obj.name)):
        actual = head.matrix_world.translation
        expected = Vector(model["projector_centres_m"][index])
        assert (actual - expected).length < 0.00001
    results.append(
        {
            "model": model["stem"],
            "meshes": len(meshes),
            "heads": len(heads),
            "rain_covers": len(covers),
            "webbing_paths": len(straps),
            "lander_legs": len(legs),
            "external_owned_hazers": len(hazers),
            "sphere_top_m": top,
            "glb_readback": "pass",
        }
    )
(OUT / "verification.json").write_text(
    json.dumps({"blender": bpy.app.version_string, "results": results}, indent=2) + "\n"
)
print(
    f"PASS: {len(results)} exported GLBs imported; dimensions, 3 heads/covers and configuration counts verified"
)
