"""Build and render nominal occupied-sphere assemblies with P055's external hazer."""

from __future__ import annotations

import json
import math
from pathlib import Path

import bpy
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output/grant-3d"
OUT.mkdir(parents=True, exist_ok=True)
TAU = math.tau
CENTER = 1.7
RING = 0.9144
CORNER = 1.8
ARM = 2.0
ANGLE = math.radians(30)
COLORS = {
    "frame": (0.16, 0.23, 0.28, 1),
    "padding": (0.07, 0.46, 0.48, 1),
    "shell": (0.69, 0.84, 0.88, 1),
    "inner": (0.83, 0.92, 0.94, 1),
    "ties": (0.43, 0.63, 0.68, 1),
    "webbing": (0.84, 0.48, 0.10, 1),
    "host": (0.51, 0.59, 0.64, 1),
    "person": (0.72, 0.32, 0.16, 1),
    "optic": (0.08, 0.12, 0.17, 1),
    "lens": (0.13, 0.70, 0.77, 1),
}


def finish(obj, name, color):
    obj.name = name
    obj.color = COLORS[color]
    material = bpy.data.materials.get(color)
    if material is None:
        material = bpy.data.materials.new(color)
        material.diffuse_color = COLORS[color]
        material.use_nodes = True
        material.node_tree.nodes.get("Principled BSDF").inputs[
            "Base Color"
        ].default_value = COLORS[color]
    obj.data.materials.append(material)
    return obj


def box(name, at, size, color="frame"):
    bpy.ops.mesh.primitive_cube_add(size=1, location=at)
    obj = finish(bpy.context.object, name, color)
    obj.scale = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    bevel = obj.modifiers.new("Display edge radius", "BEVEL")
    bevel.width = 0.012
    bevel.segments = 2
    return obj


def ellipsoid(name, at, size, color="person"):
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=24, ring_count=16, radius=1, location=at
    )
    obj = finish(bpy.context.object, name, color)
    obj.scale = size
    for face in obj.data.polygons:
        face.use_smooth = True
    return obj


def tube(name, points, radius=0.025, color="frame"):
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions = "3D"
    curve.bevel_depth = radius
    curve.bevel_resolution = 3
    spline = curve.splines.new("POLY")
    spline.points.add(len(points) - 1)
    for vertex, point in zip(spline.points, points, strict=True):
        vertex.co = (*point, 1)
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    return finish(obj, name, color)


def beam(name, a, b, radius=0.025, color="frame"):
    return tube(name, [a, b], radius, color)


def mesh(name, vertices, faces, color):
    data = bpy.data.meshes.new(name)
    data.from_pydata(vertices, [], faces)
    data.update()
    obj = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(obj)
    finish(obj, name, color)
    for face in data.polygons:
        face.use_smooth = True
    return obj


def ring(name, radius, z, thickness, color):
    return tube(
        name,
        [
            (radius * math.cos(t * TAU / 96), radius * math.sin(t * TAU / 96), z)
            for t in range(97)
        ],
        thickness,
        color,
    )


def shell(radius, inner_radius):
    # Actual omitted mesh panels make a legible cutaway; these are not fabricated openings.
    azimuth = math.radians(350)
    mouth_z = 1.45
    axis = Vector(
        (math.cos(azimuth), math.sin(azimuth), (mouth_z - CENTER) / radius)
    ).normalized()
    mouth_radius = 0.34
    for r, name, color in [
        (radius, "Outer wall - front panel removed for drawing", "shell"),
        (inner_radius, "Inner wall - front panel removed for drawing", "inner"),
    ]:
        vertices = []
        faces = []
        lat_count, lon_count = 36, 72
        for i in range(lat_count + 1):
            theta = math.pi * i / lat_count
            for j in range(lon_count + 1):
                phi = TAU * j / lon_count
                vertices.append(
                    (
                        r * math.sin(theta) * math.cos(phi),
                        r * math.sin(theta) * math.sin(phi),
                        CENTER + r * math.cos(theta),
                    )
                )
        for i in range(lat_count):
            theta = math.pi * (i + 0.5) / lat_count
            for j in range(lon_count):
                phi = TAU * (j + 0.5) / lon_count
                direction = Vector(
                    (
                        math.sin(theta) * math.cos(phi),
                        math.sin(theta) * math.sin(phi),
                        math.cos(theta),
                    )
                )
                cutaway = 195 < math.degrees(phi) < 325 and i > 2
                entrance = direction.dot(axis) > math.cos(math.asin(mouth_radius / r))
                if cutaway or entrance:
                    continue
                a = i * (lon_count + 1) + j
                faces.append((a, a + 1, a + lon_count + 2, a + lon_count + 1))
        mesh(name, vertices, faces, color)
    # The physical entrance is distinct from the large drawing cutaway.
    u = axis.cross(Vector((0, 0, 1))).normalized()
    v = axis.cross(u).normalized()
    lips = []
    for r, label in [
        (radius + 0.055, "Outer entry lip"),
        (inner_radius, "Inner entry lip"),
    ]:
        center = Vector((0, 0, CENTER)) + axis * math.sqrt(
            r * r - mouth_radius * mouth_radius
        )
        points = [
            tuple(
                center
                + mouth_radius
                * (u * math.cos(t * TAU / 64) + v * math.sin(t * TAU / 64))
            )
            for t in range(65)
        ]
        tube(label + " - nominal 680 mm opening", points, 0.025, "padding")
        lips.append(points[:-1])
    mesh(
        "Open entry tunnel - nominal, product unselected",
        lips[0] + lips[1],
        [(n, (n + 1) % 64, (n + 1) % 64 + 64, n + 64) for n in range(64)],
        "inner",
    )
    for deg in range(0, 195, 30):
        phi = math.radians(deg)
        for lat in [-45, 0, 45]:
            theta = math.radians(lat)
            d = Vector(
                (
                    math.cos(theta) * math.cos(phi),
                    math.cos(theta) * math.sin(phi),
                    math.sin(theta),
                )
            )
            beam(
                f"Shell spacer tie {deg} {lat}",
                Vector((0, 0, CENTER)) + d * inner_radius,
                Vector((0, 0, CENTER)) + d * radius,
                0.008,
                "ties",
            )
    return tuple(Vector((0, 0, CENTER)) + axis * radius)


def occupant(inner_radius):
    bottom = CENTER - inner_radius + 0.09
    # Soft dished surface with a localized seating depression; no pressure or load model.
    verts, faces = [], []
    for i in range(17):
        r = 0.72 * i / 16
        for j in range(65):
            a = j * TAU / 64
            z = bottom + 0.28 * (r / 0.72) ** 2 + 0.018 * math.sin(6 * a) * (r / 0.72)
            verts.append((r * math.cos(a), r * math.sin(a), z))
    for i in range(16):
        for j in range(64):
            a = i * 65 + j
            faces.append((a, a + 1, a + 66, a + 65))
    mesh("Compliant floor - illustrative local deformation", verts, faces, "padding")
    ellipsoid("Seated participant hips", (0, -0.1, bottom + 0.15), (0.21, 0.2, 0.16))
    ellipsoid("Seated participant torso", (0, -0.06, bottom + 0.46), (0.22, 0.14, 0.33))
    ellipsoid("Seated participant head", (0, -0.09, bottom + 0.9), (0.135, 0.12, 0.17))
    beam(
        "Participant neck",
        (0, -0.07, bottom + 0.68),
        (0, -0.08, bottom + 0.83),
        0.07,
        "person",
    )
    for s in [-1, 1]:
        hip, knee, foot = (
            (s * 0.13, -0.12, bottom + 0.18),
            (s * 0.34, -0.47, bottom + 0.24),
            (s * 0.14, -0.63, bottom + 0.07),
        )
        beam(f"Participant thigh {s}", hip, knee, 0.095, "person")
        ellipsoid(f"Participant knee {s}", knee, (0.1, 0.1, 0.1))
        beam(f"Participant lower leg {s}", knee, foot, 0.065, "person")
        ellipsoid(f"Participant foot {s}", foot, (0.07, 0.14, 0.055))
        shoulder, elbow, hand = (
            (s * 0.19, -0.07, bottom + 0.6),
            (s * 0.31, -0.3, bottom + 0.35),
            (s * 0.15, -0.45, bottom + 0.32),
        )
        beam(f"Participant upper arm {s}", shoulder, elbow, 0.055, "person")
        beam(f"Participant forearm {s}", elbow, hand, 0.048, "person")


def build(diameter, suspended):
    radius = diameter / 2
    inner_radius = radius * 2 / 3
    ring_z = CENTER - math.sqrt(radius**2 - RING**2)
    triangle_z = ring_z - 0.09
    corners = [
        (CORNER * math.cos(a), CORNER * math.sin(a), triangle_z)
        for a in [math.pi / 6 + i * TAU / 3 for i in range(3)]
    ]
    ring("Nominal six-foot seating loop", RING, ring_z, 0.028, "frame")
    ring("Padded loop contact", RING, ring_z + 0.025, 0.052, "padding")
    collector_z = CENTER + radius + 0.22
    heads = []
    for i, corner in enumerate(corners):
        next_corner = corners[(i + 1) % 3]
        beam(f"Triangle member {i + 1}", corner, next_corner, 0.03)
        mid = Vector(corner).lerp(Vector(next_corner), 0.5)
        beam(
            f"Loop interface tab {i + 1}",
            mid,
            (mid.x * 1.14, mid.y * 1.14, ring_z),
            0.035,
            "padding",
        )
        box(f"Corner plate {i + 1} - not sized", corner, (0.22, 0.22, 0.07), "host")
        loop = [
            (
                corner[0] + 0.055 * math.cos(t * TAU / 32),
                corner[1],
                corner[2] + 0.09 + 0.065 * math.sin(t * TAU / 32),
            )
            for t in range(33)
        ]
        tube(f"Lifting attachment witness {i + 1}", loop, 0.014, "webbing")
        phi = math.atan2(corner[1], corner[0])
        head = (
            corner[0] + ARM * math.cos(ANGLE) * math.cos(phi),
            corner[1] + ARM * math.cos(ANGLE) * math.sin(phi),
            triangle_z + ARM * math.sin(ANGLE),
        )
        heads.append(head)
        beam(f"Two-metre optical arm {i + 1}", corner, head, 0.026)
        body = box(
            f"Projector head {i + 1} - device unselected",
            head,
            (0.34, 0.28, 0.16),
            "optic",
        )
        aim = (Vector((0, 0, CENTER)) - Vector(head)).normalized()
        body.rotation_euler = aim.to_track_quat("-Y", "Z").to_euler()
        lens = Vector(head) + aim * 0.16
        ellipsoid(f"Projector lens {i + 1}", lens, (0.052, 0.052, 0.052), "lens")
        box(
            f"Ventilated rain canopy {i + 1}",
            (head[0], head[1], head[2] + 0.19),
            (0.5, 0.46, 0.022),
            "host",
        )
        for side in [-1, 1]:
            beam(
                f"Canopy bracket {i + 1} {side}",
                (head[0] + side * 0.22, head[1], head[2] - 0.04),
                (head[0] + side * 0.22, head[1], head[2] + 0.18),
                0.008,
                "host",
            )
        if suspended:
            beam(
                f"Proposed arm stay {i + 1}",
                (head[0], head[1], head[2] - 0.06),
                (0, 0, collector_z + 0.08),
                0.006,
                "webbing",
            )
            display_radius = radius + 0.012
            start = math.atan2(triangle_z - CENTER, CORNER) + math.acos(
                display_radius / math.hypot(CORNER, triangle_z - CENTER)
            )
            end = math.asin(display_radius / (collector_z - CENTER))
            points = [corner]
            for n in range(49):
                t = start + (end - start) * n / 48
                points.append(
                    (
                        display_radius * math.cos(t) * math.cos(phi),
                        display_radius * math.cos(t) * math.sin(phi),
                        CENTER + display_radius * math.sin(t),
                    )
                )
            points.append((0, 0, collector_z))
            vertices = []
            for p in points:
                for side in [-1, 1]:
                    vertices.append(
                        (
                            p[0] - side * 0.045 * math.sin(phi),
                            p[1] + side * 0.045 * math.cos(phi),
                            p[2],
                        )
                    )
            mesh(
                f"Over-sphere webbing {i + 1} - illustrative width",
                vertices,
                [
                    (2 * n, 2 * n + 1, 2 * n + 3, 2 * n + 2)
                    for n in range(len(points) - 1)
                ],
                "webbing",
            )
        else:
            foot = (corner[0] * 1.2, corner[1] * 1.2, 0.065)
            beam(f"Detachable lander leg {i + 1}", corner, foot, 0.04, "host")
            beam(
                f"Lander brace {i + 1}",
                Vector(corner).lerp(Vector(next_corner), 0.23),
                foot,
                0.02,
                "host",
            )
            bpy.ops.mesh.primitive_cylinder_add(
                vertices=8,
                radius=0.26,
                depth=0.065,
                location=(foot[0], foot[1], 0.0325),
            )
            finish(bpy.context.object, f"Lander foot pad {i + 1}", "host")
    entry = shell(radius, inner_radius)
    occupant(inner_radius)
    # Display envelope only: Andrew owns the unit; model and clearances are unknown.
    hazer_at = (0, -1.25, 0.21)
    box(
        "Owned external hazer body - provisional envelope",
        hazer_at,
        (0.8, 0.6, 0.34),
        "optic",
    )
    for x in [-0.29, 0.29]:
        box("Hazer ground skid", (x, -1.25, 0.02), (0.09, 0.64, 0.04), "host")
    tube(
        "Hazer carry handle - provisional",
        [
            (-0.2, -1.25, 0.38),
            (-0.2, -1.25, 0.52),
            (0.2, -1.25, 0.52),
            (0.2, -1.25, 0.38),
        ],
        0.015,
        "host",
    )
    box(
        "Hazer outlet - no sphere connection",
        (0, -0.945, 0.22),
        (0.22, 0.015, 0.11),
        "padding",
    )
    for z in [0.13, 0.19, 0.25, 0.31]:
        box("Hazer ventilation grille", (0, -1.553, z), (0.6, 0.009, 0.016), "host")
    if suspended:
        tube(
            "Top collector ring - unselected",
            [
                (
                    0.09 * math.cos(t * TAU / 48),
                    0,
                    collector_z + 0.09 + 0.09 * math.sin(t * TAU / 48),
                )
                for t in range(49)
            ],
            0.014,
            "webbing",
        )
        beam(
            "Swivel envelope - unselected",
            (0, 0, collector_z + 0.2),
            (0, 0, collector_z + 0.36),
            0.032,
            "host",
        )
        beam(
            "Halyard route - unselected",
            (0, 0, collector_z + 0.36),
            (0, 0, 4.8),
            0.01,
            "webbing",
        )
        for x in [-2.4, 2.4]:
            for y in [-1.9, 1.9]:
                foot = (x * 1.2, y, 0.08)
                beam(f"Illustrative host leg {x} {y}", foot, (x, 0, 4.8), 0.045, "host")
                box(
                    f"Host pad {x} {y}",
                    (foot[0], foot[1], 0.04),
                    (0.6, 0.5, 0.08),
                    "host",
                )
            beam(
                f"Host spread-restraint envelope {x}",
                (x * 1.2, -1.9, 0.12),
                (x * 1.2, 1.9, 0.12),
                0.012,
                "webbing",
            )
        beam("Illustrative host crossbar", (-2.4, 0, 4.8), (2.4, 0, 4.8), 0.065, "host")
    return {
        "diameter_m": diameter,
        "centre_m": CENTER,
        "sphere_top_m": CENTER + radius,
        "ring_diameter_m": 2 * RING,
        "ring_elevation_m": ring_z,
        "triangle_elevation_m": triangle_z,
        "triangle_side_m": CORNER * math.sqrt(3),
        "corner_radius_m": CORNER,
        "arm_length_m": ARM,
        "arm_elevation_degrees": 30,
        "projector_centres_m": heads,
        "collector_elevation_m": collector_z,
        "mode": "suspended" if suspended else "lander",
        "entry_centre_m": entry,
        "entry_diameter_m": 0.68,
        "entry_size_provisional": True,
        "hazer": {
            "owned": True,
            "incremental_purchase_usd": 0,
            "position_m": hazer_at,
            "body_display_envelope_m": [0.8, 0.6, 0.34],
            "placement": "external, ground supported, offset below lower edge",
            "model_dimensions_power_fluid_clearances": "unconfirmed",
            "connected_to_sphere": False,
        },
        "inner_diameter_m": inner_radius * 2,
        "host_height_m": 4.8 if suspended else None,
        "member_sections": "display envelopes, not fabrication specifications",
        "up": "Z in Blender; Y in glTF",
    }


def setup():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    scene = bpy.context.scene
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.length_unit = "METERS"
    scene.render.engine = "BLENDER_WORKBENCH"
    scene.render.resolution_x = 1600
    scene.render.resolution_y = 1400
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.film_transparent = False
    shading = scene.display.shading
    shading.light = "STUDIO"
    shading.color_type = "MATERIAL"
    shading.background_type = "WORLD"
    scene.world.color = (0.94, 0.96, 0.97)
    shading.show_shadows = True
    shading.show_cavity = True
    shading.cavity_type = "BOTH"
    shading.show_object_outline = True
    shading.object_outline_color = (0.17, 0.25, 0.30)
    shading.show_specular_highlight = True
    scene.view_settings.view_transform = "Standard"
    return scene


def render(scene, stem, view, target, bounds, info, suffix=""):
    scene.render.resolution_x = 1600
    scene.render.resolution_y = 900 if view in ["front", "side"] else 1400
    camera_data = bpy.data.cameras.new("Orthographic " + view)
    camera = bpy.data.objects.new("Orthographic " + view, camera_data)
    scene.collection.objects.link(camera)
    directions = {
        "iso": (8, -11, 7),
        "front": (0, -14, 0),
        "side": (14, 0, 0),
        "top": (0, 0, 14),
    }
    camera.location = Vector(target) + Vector(directions[view])
    camera.rotation_euler = (
        (Vector(target) - camera.location).to_track_quat("-Z", "Y").to_euler()
    )
    camera_data.type = "ORTHO"
    camera_data.ortho_scale = bounds
    scene.camera = camera
    bpy.context.view_layer.update()
    corners = [
        obj.matrix_world @ Vector(corner)
        for obj in scene.objects
        if obj.type == "MESH" and not obj.hide_render
        for corner in obj.bound_box
    ]
    projected = [world_to_camera_view(scene, camera, v) for v in corners]
    low = Vector((min(v.x for v in projected), min(v.y for v in projected)))
    high = Vector((max(v.x for v in projected), max(v.y for v in projected)))
    offset = (low + high) * 0.5 - Vector((0.5, 0.5))
    rotation = camera.rotation_euler.to_quaternion()
    camera.location += rotation @ Vector(
        (
            offset.x * bounds,
            offset.y * bounds * scene.render.resolution_y / scene.render.resolution_x,
            0,
        )
    )
    camera_data.ortho_scale *= max(high.x - low.x, high.y - low.y) / 0.83
    bpy.context.view_layer.update()
    scene.render.filepath = str(OUT / f"{stem}{suffix}-{view}.png")
    bpy.ops.render.render(write_still=True)
    r = info["diameter_m"] / 2
    z = info["triangle_elevation_m"]
    anchors = {
        "sphere_left": (-r, 0, CENTER),
        "sphere_right": (r, 0, CENTER),
        "sphere_top": (0, 0, CENTER + r),
        "sphere_bottom": (0, 0, CENTER - r),
        "ground": (0, 0, 0),
        "centre": (0, 0, CENTER),
        "ring_left": (-RING, 0, info["ring_elevation_m"]),
        "ring_right": (RING, 0, info["ring_elevation_m"]),
        "entry": info["entry_centre_m"],
        "collector": (0, 0, info["collector_elevation_m"] + 0.09),
        "host_top": (0, 0, 4.8),
        "hazer": info["hazer"]["position_m"],
    }
    anchors["width_left"] = (min(v.x for v in corners), 0, 0)
    anchors["width_right"] = (max(v.x for v in corners), 0, 0)
    for i, a in enumerate([math.pi / 6 + n * TAU / 3 for n in range(3)]):
        anchors[f"corner{i}"] = (CORNER * math.cos(a), CORNER * math.sin(a), z)
        anchors[f"head{i}"] = info["projector_centres_m"][i]
    coords = {
        key: list(world_to_camera_view(scene, camera, Vector(value)))[:2]
        for key, value in anchors.items()
    }
    return {
        "file": Path(scene.render.filepath).name,
        "view": view,
        "target": target,
        "orthographic_scale": camera_data.ortho_scale,
        "pixels": [scene.render.resolution_x, scene.render.resolution_y],
        "projected_anchors": coords,
    }


def main():
    records = []
    for diameter, suspended in [(3.0, False), (3.0, True), (2.5, False), (2.5, True)]:
        scene = setup()
        info = build(diameter, suspended)
        stem = f"zencelades-{str(diameter).replace('.', 'p')}m-{info['mode']}"
        info["stem"] = stem
        # Curve meshes must be converted before glTF export; preserve their names.
        bpy.ops.object.select_all(action="DESELECT")
        for obj in scene.objects:
            if obj.type == "CURVE":
                obj.select_set(True)
        if bpy.context.selected_objects:
            bpy.context.view_layer.objects.active = bpy.context.selected_objects[0]
            bpy.ops.object.convert(target="MESH")
        bpy.ops.object.select_all(action="DESELECT")
        bpy.ops.export_scene.gltf(
            filepath=str(OUT / f"{stem}.glb"), export_format="GLB", export_apply=True
        )
        views = ["iso", "front"] if suspended else ["iso", "front", "side", "top"]
        if diameter == 2.5:
            views = ["iso"]
        info["views"] = [
            render(
                scene,
                stem,
                view,
                (0, 0, 2.25 if suspended else 1.5),
                8.7 if suspended else 8.2,
                info,
            )
            for view in views
        ]
        if diameter == 3.0 and not suspended:
            hidden = [
                obj
                for obj in scene.objects
                if obj.name.startswith(
                    (
                        "Outer",
                        "Inner",
                        "Open entry",
                        "Shell",
                        "Compliant",
                        "Participant",
                        "Seated",
                    )
                )
            ]
            for obj in hidden:
                obj.hide_render = True
            info["frame_views"] = [
                render(scene, stem, view, (0, 0, 0.8), 8.2, info, "-frame")
                for view in ["iso", "top"]
            ]
            for obj in hidden:
                obj.hide_render = False
        bpy.context.view_layer.update()
        bounds = [
            obj.matrix_world @ Vector(corner)
            for obj in scene.objects
            if obj.type == "MESH"
            for corner in obj.bound_box
        ]
        info["overall_bounds_m"] = {
            "min": [min(v[n] for v in bounds) for n in range(3)],
            "max": [max(v[n] for v in bounds) for n in range(3)],
        }
        info["mesh_count"] = sum(o.type == "MESH" for o in scene.objects)
        info["vertex_count"] = sum(
            len(o.data.vertices) for o in scene.objects if o.type == "MESH"
        )
        assert info["mesh_count"] > 50
        assert sum(o.name.startswith("Projector head") for o in scene.objects) == 3
        assert all(
            math.isfinite(v)
            for o in scene.objects
            if o.type == "MESH"
            for vert in o.data.vertices
            for v in vert.co
        )
        scene.camera = next(
            obj
            for obj in scene.objects
            if obj.type == "CAMERA" and obj.name.startswith("Orthographic iso")
        )
        bpy.ops.wm.save_as_mainfile(filepath=str(OUT / f"{stem}.blend"))
        records.append(info)
    (OUT / "geometry.json").write_text(
        json.dumps(
            {
                "status": "nominal layout models; no structural or occupied-use approval",
                "models": records,
            },
            indent=2,
        )
        + "\n"
    )
    print(f"P053 complete: {len(records)} model assemblies with orthographic renders")


if __name__ == "__main__":
    main()
