import { expect, test } from "bun:test";
import { exportModel } from "./model-export";

test.each(["basket-lander", "basket-aerial-rig", "basket-truck"])(
  "%s GLB retains selected heads and capture witnesses without a viewer camera",
  async (id) => {
    const blob = await exportModel(id, 1, 2.5, 2);
    const bytes = await blob.arrayBuffer();
    const header = new DataView(bytes);
    expect(header.getUint32(0, true)).toBe(0x46546c67);
    expect(header.getUint32(8, true)).toBe(bytes.byteLength);
    const length = header.getUint32(12, true);
    const document = JSON.parse(new TextDecoder().decode(bytes.slice(20, 20 + length)));
    const names = document.nodes.map((node: { name: string }) => node.name);
    expect(names.filter((name: string) => name.startsWith("triangle-projector-head-"))).toEqual([
      "triangle-projector-head-1",
    ]);
    expect(names.filter((name: string) => name.startsWith("arm-rain-cover-"))).toEqual([
      "arm-rain-cover-1",
    ]);
    expect(names).toContain("seat-loop-nominal-six-foot-unrated");
    expect(names).toContain("double-wall-cutaway-2.5");
    expect(names).not.toContain("double-wall-cutaway-3");
    expect(names).not.toContain("Ground plane");
    expect(names.filter((name: string) => name.startsWith("inside-camera-witness-"))).toHaveLength(
      2,
    );
    expect(document.cameras ?? []).toEqual([]);
    expect(
      document.nodes.find((node: { name: string }) => node.name === `study-${id}`).extras
        .projectorCount,
    ).toBe(1);
    expect(
      document.nodes.find((node: { name: string }) => node.name === `study-${id}`).extras
        .sphereDiameter,
    ).toBe(2.5);
    expect(
      document.nodes.find((node: { name: string }) => node.name === `study-${id}`).extras
        .cameraCount,
    ).toBe(2);
  },
);
