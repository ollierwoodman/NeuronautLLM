import { GroupId, InferenceAndTokenData, InferenceResponseAndResponseDict, MirroredNodeIndex, MultipleTopKDerivedScalarsResponseData, NodeType } from "@/client";
import { useObserveSize } from "@/hooks/observeSize";
import { ActivationDbRow, NeuronDbRow, Node, Topic } from "@/types";
import { nodeFromNodeIndex } from "@/utils/nodes";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { UMAP } from 'umap-js';
import { Spinner } from "../icons/spinners";
import { NodeTooltipContent, NodeViewNode } from "./node";
import { getInferenceAndTokenData, getSubResponse } from "@/requests/inferenceResponseUtils";
import TopicLegend from "./TopicLegend";

const MARGIN = 50;

const METRICS = ["WriteNorm", "DirectionWrite", "ActTimesGrad", "Activation"] as const;
type Metric = typeof METRICS[number];

const GROUP_ID_BY_METRIC: Record<Metric, GroupId> = {
  WriteNorm: GroupId.WRITE_NORM,
  DirectionWrite: GroupId.DIRECTION_WRITE,
  ActTimesGrad: GroupId.ACT_TIMES_GRAD,
  Activation: GroupId.ACTIVATION,
};

export function isNodeSelected(selectedNode: Node | null, nodeToCheck: Node): boolean {
  return (
    selectedNode !== null &&
    selectedNode.nodeType === nodeToCheck.nodeType &&
    selectedNode.layerIndex === nodeToCheck.layerIndex &&
    selectedNode.nodeIndex === nodeToCheck.nodeIndex
  );
}

function updateMinMaxActivation(
  currMinActivation: number,
  setMinActivation: React.Dispatch<React.SetStateAction<number>>,
  currMaxActivation: number,
  setMaxActivation: React.Dispatch<React.SetStateAction<number>>,
  value: number,
): void {
  if (value < currMinActivation) {
    setMinActivation(value);
  }
  if (value > currMaxActivation) {
    setMaxActivation(value);
  }
}

function normalize2dCoordinates(coordinates: number[][]): number[][] {
  const minX = Math.min(...coordinates.map(point => point[0]));
  const minY = Math.min(...coordinates.map(point => point[1]));
  const maxX = Math.max(...coordinates.map(point => point[0]));
  const maxY = Math.max(...coordinates.map(point => point[1]));

  const width = maxX - minX;
  const height = maxY - minY;

  const normalizedCoordinates = coordinates.map(point => {
    const x = (point[0] - minX) / width;
    const y = (point[1] - minY) / height;
    return [x, y];
  });

  return normalizedCoordinates;
}

export type NodeViewNodeType = {
  x: number; // 0 - 1
  y: number; // 0 - 1
  node: Node;
  neuronDb: NeuronDbRow;
  topic: Topic;
  writeNorm: number;
  directionWrite: number;
  actTimesGrad: number;
  activation: number;
}

type NodeViewProps = {
  leftResponse: InferenceResponseAndResponseDict | null;
  selectedNode: Node | null;
  handleNodeClickCallback: (node: Node) => void;
  setNeuronDbSample: React.Dispatch<React.SetStateAction<NeuronDbRow[]>>;
  neuronTopics: Topic[];
};

export const NodeView: React.FC<NodeViewProps> = ({
  leftResponse,
  selectedNode,
  handleNodeClickCallback,
  setNeuronDbSample,
  neuronTopics,
}) => {
  const { width: svgWidth, height: svgHeight, ref: svgRef } = useObserveSize();
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipContent, setTooltipContent] = useState<ReactNode | null>(null);

  const [minActivation, setMinActivation] = useState<number>(0);
  const [maxActivation, setMaxActivation] = useState<number>(0);

  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [nodes, setNodes] = useState<NodeViewNodeType[]>([]);

  const leftResponseData = getSubResponse<MultipleTopKDerivedScalarsResponseData>(
    leftResponse,
    "topKComponents"
  )!;
  const leftInferenceAndTokenData = getInferenceAndTokenData(leftResponse)!;

  const activationsByGroupId = leftResponseData.activationsByGroupId;
  const nodeIndices = leftResponseData.nodeIndices;

  useEffect(() => {
    setLoading(true);
    let active = true;
    retrieveNodes();
    return () => { 
      active = false
    }

    async function retrieveNodes() {
      if (!nodeIndices) {
        return;
      }

      const groupIds: number[] = [];
      const mlpNeuronNodes = nodeIndices.filter((node, index) => {
        groupIds.push(index);
        return node.nodeType === NodeType.MLP_NEURON;
      });
      const nodeDbRows = mlpNeuronNodes.map((value, index) => {
        const node = nodeFromNodeIndex(value);
        return fetch(`/api/neurons/${node.layerIndex}/${node.nodeIndex}`)
          .then((res) => res.json())
          .catch((e) => {
            setError(e);
            return null;
          }) as Promise<NeuronDbRow | null>;
      });

      const nodeDbRowsResolved = (await Promise.all([...nodeDbRows])) as (NeuronDbRow | null)[];
      
      const umap = new UMAP({
        nComponents: 2,
        nNeighbors: 15,
        minDist: 0.1,
        spread: 1,
      });

      setNeuronDbSample(nodeDbRowsResolved.filter((row) => row !== null) as NeuronDbRow[]);

      const nodeDbEmbeddings = nodeDbRowsResolved.map((row) => row?.explanation_embedding as number[]);
      
      const umapCoords: number[][] = umap.fit(nodeDbEmbeddings);
      const normCoords: number[][] = normalize2dCoordinates(umapCoords);
      
      const nodeSizeMetricValues: number[] = [];
      const nodeViewNodes = nodeDbRowsResolved.map((nodeDbRow, index) => {
        const nodeId = nodeFromNodeIndex(mlpNeuronNodes[index]);
        const nodeTopic = neuronTopics.find((topic) => topic.id.toString() === nodeDbRow?.explanation_topic_id.toString());

        // updateMinMaxActivation(
        //   minActivation,
        //   setMinActivation,
        //   maxActivation,
        //   setMaxActivation,
        //   activationsByGroupId["write_norm"][groupIds[index]]
        // )
        nodeSizeMetricValues.push(activationsByGroupId["act_times_grad"][groupIds[index]]);

        return {
          x: normCoords[index][0],
          y: normCoords[index][1],
          node: nodeId,
          neuronDb: nodeDbRow,
          topic: nodeTopic ? nodeTopic : neuronTopics[0],
          writeNorm: activationsByGroupId["write_norm"][groupIds[index]],
          directionWrite: activationsByGroupId["direction_write"][groupIds[index]],
          actTimesGrad: activationsByGroupId["act_times_grad"][groupIds[index]],
          activation: activationsByGroupId["activation"][groupIds[index]],
        } as NodeViewNodeType;
      });

      setMinActivation(Math.min(...nodeSizeMetricValues))
      setMaxActivation(Math.max(...nodeSizeMetricValues))
      setNodes(nodeViewNodes);
      setLoading(false);
    }
  }, [activationsByGroupId, nodeIndices]);
  
  return (
    <>
      <div className="flex flex-col flex-1 p-2">
        <div className="flex flex-col justify-center items-center">
          <h2 className="text-xl">Neuron space</h2>
          <h2 className="text-sm text-gray-600">showing <span className="font-mono">{nodes.length}</span> neurons</h2>
        </div>
        <svg
          ref={svgRef}
          className="relative flex-1"
          preserveAspectRatio="xMidYMid meet"
        >
          {nodes.map((nodeViewNode, i) => {
            return (
              <NodeViewNode
                key={i}
                nodeViewNode={nodeViewNode}
                isSelected={isNodeSelected(selectedNode, nodeViewNode.node)}
                handleNodeClickCallback={handleNodeClickCallback}
                tooltipRef={tooltipRef}
                setTooltipContent={setTooltipContent}
                svgWidth={svgWidth}
                svgHeight={svgHeight}
                svgMargin={MARGIN}
                minActivation={minActivation || -1}
                maxActivation={maxActivation || 1}
              />
            );
          })}
        </svg>
        {/* TODO: add fade on tooltip using opacity https://greywyvern.com/337 */}
        <div 
          ref={tooltipRef}
          style={{
            position: "absolute",
            visibility: "hidden",
            zIndex: 1000,
          }}
          className="w-72 border-2 bg-white bg-opacity-90 rounded-md p-2"
        >
          {tooltipContent}
        </div>
        <TopicLegend topics={neuronTopics} />
        {loading && (
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center items-center`}>
            <Spinner className="text-7xl" />
          </div>
        )}
      </div>
    </>
  );
}

export default NodeView;