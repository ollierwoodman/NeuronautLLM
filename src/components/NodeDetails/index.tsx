import { UnparsedActivationDbRow, UnparsedActivationDbRowCollection, NeuronDbRow, Node } from "@/types";
import { useMemo } from "react";
import { ActivationCarousel } from "./ActivationCarousel";

export type NodeDetailsNode = {
  node: Node;
  neuronDb: Promise<NeuronDbRow>;
  topActivationsDb: Promise<UnparsedActivationDbRow[]>;
  randomActivationsDb: Promise<UnparsedActivationDbRow[]>;
}

type NodeDetailsProps = {
  responseData: any;
  selectedNode: Node | null;
};

export const NodeDetails: React.FC<NodeDetailsProps> = ({
  responseData,
  selectedNode,
}) => {
  const node: NodeDetailsNode | null = useMemo(() => {
    if (!selectedNode) {
      return null;
    }
    return {
      node: selectedNode,
      neuronDb: fetch(`/api/neurons/${selectedNode.layerIndex}/${selectedNode.nodeIndex}`)
      .then((res) => res.json())
      .catch((e) => {
        console.error(e);
      }) as Promise<NeuronDbRow>,
      topActivationsDb: fetch(`/api/activations/${selectedNode.layerIndex}/${selectedNode.nodeIndex}`)
        .then((res) => res.json())
        .catch((e) => {
          console.error(e);
        }) as Promise<UnparsedActivationDbRowCollection>,
      randomActivationsDb: fetch(`/api/activations/${selectedNode.layerIndex}/${selectedNode.nodeIndex}?category=random`)
        .then((res) => res.json())
        .catch((e) => {
          console.error(e);
        }) as Promise<UnparsedActivationDbRowCollection>,
    } as NodeDetailsNode;
  }, [selectedNode]);

  return (
    <>
      <div className="flex flex-col justify-center flex-1 overflow-y-scroll w-full">
        {node && (
          <>
            <h3 className="text-xl">Activations</h3>
            <h4 className="text-lg">Top</h4>
            <ActivationCarousel activationsPromise={node.topActivationsDb} />
            <h4 className="text-lg">Random</h4>
            <ActivationCarousel activationsPromise={node.randomActivationsDb} />
          </>
        ) || (
          <p className="text-center">No node selected</p>
        )}
      </div>
    </>
  )
}