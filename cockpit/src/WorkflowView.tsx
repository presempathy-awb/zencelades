import {
  Background,
  Controls,
  type Edge,
  type Node,
  ReactFlow,
  useNodesState,
} from "@xyflow/react";
import { type JSX, useEffect, useMemo, useState } from "react";
import "@xyflow/react/dist/style.css";
import { type Scenario, shortNames, workflow } from "./scenario";

export default function WorkflowView({ scenario }: { scenario: Scenario }): JSX.Element {
  const {
    selected: support,
    haze,
    settings: { capture },
  } = scenario;
  const steps = useMemo(
    () => workflow({ selected: support, haze, settings: { capture } }),
    [support, haze, capture],
  );
  const initial = useMemo<Node[]>(
    () =>
      steps.map((step, index) => ({
        id: step.id,
        position: { x: index % 2 ? 290 : 30, y: index * 110 },
        data: { label: `${index + 1}. ${step.title}` },
        ariaLabel: step.title,
      })),
    [steps],
  );
  const [nodes, setNodes, onNodesChange] = useNodesState(initial);
  const [selected, setSelected] = useState("scope");
  useEffect(() => {
    setNodes(initial);
    setSelected("scope");
  }, [initial, setNodes]);
  const edges: Edge[] = steps.slice(1).map((step, index) => ({
    id: `${steps[index].id}-${step.id}`,
    source: steps[index].id,
    target: step.id,
    type: "smoothstep",
  }));
  const step = steps.find((item) => item.id === selected) ?? steps[0];
  return (
    <section className="flow-panel" aria-label="Project workflow">
      <div className="pane-intro">
        <span className="eyebrow">FROM IDEA TO INSTALLATION</span>
        <h2>{shortNames[support]} · setup sequence</h2>
        <p>
          Select a step for its requirements. All steps are planned; this graph records no
          approvals.
        </p>
      </div>
      <div className="flow-canvas">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onNodeClick={(_, node) => setSelected(node.id)}
          nodesConnectable={false}
          edgesReconnectable={false}
          deleteKeyCode={null}
          fitView
          minZoom={0.3}
          maxZoom={1.5}
          aria-label="Dependencies for the selected support"
        >
          <Background color="#b2c4cc" gap={24} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
      <div className="flow-detail" aria-live="polite">
        <h3>{step.title}</h3>
        <p>{step.detail}</p>
      </div>
    </section>
  );
}
