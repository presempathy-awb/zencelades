import { expect, test } from "bun:test";
import { exportModel } from "./model-export";

test("custom GLB retains selected heads and excludes the viewer camera and ground", async () => {
  const blob = await exportModel("basket-aerial-rig", 1);
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
  expect(names).not.toContain("Ground plane");
  expect(document.cameras ?? []).toEqual([]);
  expect(
    document.nodes.find((node: { name: string }) => node.name === "study-basket-aerial-rig").extras
      .projectorCount,
  ).toBe(1);
});
