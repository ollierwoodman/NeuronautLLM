import { GroupId, InferenceAndTokenData, MirroredNodeIndex, MultipleTopKDerivedScalarsResponseData, NodeType } from "@/client";
import { useObserveSize } from "@/hooks/observeSize";
import { UnparsedActivationDbRow, NeuronDbRow, Node, UnparsedNeuronDbRow } from "@/types";
import { nodeFromNodeIndex } from "@/utils/nodes";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { UMAP } from 'umap-js';
import { Spinner } from "../icons/spinners";

const MARGIN = 50;

function isNodeSelected(selectedNode: Node | null, nodeToCheck: Node): boolean {
  return (
    selectedNode !== null &&
    selectedNode.nodeType === nodeToCheck.nodeType &&
    selectedNode.layerIndex === nodeToCheck.layerIndex &&
    selectedNode.nodeIndex === nodeToCheck.nodeIndex
  );
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

export type NodeViewNode = {
  x: number; // 0 - 1
  y: number; // 0 - 1
  node: Node;
  neuronDb: NeuronDbRow;
}

type NodeViewProps = {
  responseData: MultipleTopKDerivedScalarsResponseData;
  inferenceAndTokenData: InferenceAndTokenData;
  selectedNode: Node | null;
  handleNodeClickCallback: Function;
};

const NodeTooltipContent = ({ nodeViewNode }: { nodeViewNode: NodeViewNode }) => {
  return (
    <>
      <h4 className="text-lg">{nodeViewNode.node.nodeType}</h4>
      <p className="text-sm">Layer {nodeViewNode.node.layerIndex}</p>
      <p className="text-sm">Node {nodeViewNode.node.nodeIndex}</p>
    </>
  );
}

export const NodeView: React.FC<NodeViewProps> = ({
  responseData,
  inferenceAndTokenData,
  selectedNode,
  handleNodeClickCallback,
}) => {
  const { width: svgWidth, height: svgHeight, ref: svgRef } = useObserveSize();
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipContent, setTooltipContent] = useState<ReactNode | null>(null);

  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [nodes, setNodes] = useState<NodeViewNode[]>([]);

  const activationsByGroupId = responseData?.activationsByGroupId;
  const nodeIndices = responseData?.nodeIndices;

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

      const mlpNeuronNodes = nodeIndices.filter(node => node.nodeType === NodeType.MLP_NEURON);
      const nodeDbRows = mlpNeuronNodes.map((value, index) => {
        const node = nodeFromNodeIndex(value);
        return fetch(`/api/neurons/${node.layerIndex}/${node.nodeIndex}`)
          .then((res) => res.json())
          .then((row: UnparsedNeuronDbRow) => {
            const parsedEmbedding = JSON.parse(row.explanation_embedding) as number[];
            return {
              ...row,
              explanation_embedding: parsedEmbedding,
            } as NeuronDbRow;
          })
          .catch((e) => {
            setError(e);
            return null;
          }) as Promise<NeuronDbRow | null>;
      });

      const nodeDbRowsResolved = (await Promise.all([...nodeDbRows])).filter((row) => row !== null);
      
      const umap = new UMAP({
        nComponents: 2,
        nNeighbors: 10,
        minDist: 0.1,
        spread: 1.5,
      });

      const nodeDbEmbeddings = nodeDbRowsResolved.map((row) => row?.explanation_embedding as number[]);
      
      const umapCoords: number[][] = umap.fit(nodeDbEmbeddings);
      const normCoords: number[][] = normalize2dCoordinates(umapCoords);

      console.log("normCoords", normCoords);
      
      const nodeViewNodes = nodeDbRowsResolved.map((nodeDbRow, index) => {
        const nodeId = nodeFromNodeIndex(mlpNeuronNodes[index]);
        return {
          x: normCoords[index][0],
          y: normCoords[index][1],
          node: nodeId,
          neuronDb: nodeDbRow,
        } as NodeViewNode;
      });

      setNodes(nodeViewNodes);
      setLoading(false);
    }
  }, [activationsByGroupId, nodeIndices]);
  
  return (
    <>
      <svg
        ref={svgRef}
        className="relative flex-1"
        preserveAspectRatio="xMidYMid meet"
      >
        {nodes.map((nodeViewNode, i) => {
          return (
            <circle
              key={i}
              className="cursor-pointer"
              cx={nodeViewNode.x * (svgWidth - 2 * MARGIN) + MARGIN}
              cy={nodeViewNode.y * (svgHeight - 2 * MARGIN) + MARGIN}
              r={`${0.5}em`}
              data-selected={isNodeSelected(selectedNode, nodeViewNode.node)}
              fill={isNodeSelected(selectedNode, nodeViewNode.node) ? "#0b0" : "#b00"}
              stroke={isNodeSelected(selectedNode, nodeViewNode.node) ? "#000" : "#800"}
              strokeWidth={isNodeSelected(selectedNode, nodeViewNode.node) ? 5 : 2}
              onClick={(e) => {
                handleNodeClickCallback(nodeViewNode.node);
              }}
              onMouseOver={
                (e) => {
                  if (tooltipRef.current) {
                    tooltipRef.current.style.setProperty("visibility", "visible");
                    setTooltipContent(
                      <NodeTooltipContent
                        nodeViewNode={nodeViewNode}
                      />
                    );
                  }
                }
              }
              onMouseMove={
                (e) => {
                  if (tooltipRef.current) {
                    tooltipRef.current.style.setProperty(
                      "left", `${e.clientX + (MARGIN / 2)}px`
                    );
                    tooltipRef.current.style.setProperty(
                      "top", `${e.clientY + (MARGIN / 2)}px`
                    );
                  }
                }
              } 
              onMouseOut={
                (e) => {
                  if (tooltipRef.current) {
                    tooltipRef.current.style.setProperty("visibility", "hidden");
                  }
                }
              }
            />
          );
        })}
      </svg>
      {loading && (
        <div className="absolute top-1/2 left-1/2 flex justify-center items-center flex-1">
          <Spinner className="text-3xl" />
        </div>
      )}
      {/* TODO: add fade on tooltip using opacity https://greywyvern.com/337 */}
      <div 
        ref={tooltipRef}
        style={{
          position: "absolute",
          visibility: "hidden",
          zIndex: 1000,
        }}
        className="border border-black bg-white bg-opacity-75 p-2"
      >
        {tooltipContent}
      </div>
    </>
  );
}

export default NodeView;