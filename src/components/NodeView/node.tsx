import { MouseEventHandler } from "react";
import { NodeViewNodeType } from ".";
import { Node } from "@/types";
import { LegendItem } from "./TopicLegend";

function interpolateSize(value: number, valueRange: number[], sizeRange: number[]): number {
  return ((value - valueRange[0]) / (valueRange[1] - valueRange[0]) * (sizeRange[1] - sizeRange[0]) + (sizeRange[0]));
}

export const NodeTooltipContent = ({ nodeViewNode }: { nodeViewNode: NodeViewNodeType }) => {
  return (
    <>
      <h4 className="text-xl font-bold text-center">MLP Neuron</h4>
      <p className="text-sm text-center text-gray-600">
        layer{' '}
        <span className="font-mono">
          {nodeViewNode.node.layerIndex}
        </span>
        {' '}neuron{' '} 
        <span className="font-mono">
          {nodeViewNode.node.nodeIndex}
        </span>
      </p>
      <div className="flex flex-row justify-between my-2">
        <div className="flex flex-col items-start">
          <h4 className="font-bold text-left">Explanation</h4>
          <p className="text-sm text-left">{nodeViewNode.neuronDb.explanation_text}</p>
        </div>
        <div className="flex flex-col items-end">
          <h4 className="font-bold text-right">Influence</h4>
          <p className="text-2xl font-light text-right">{nodeViewNode.actTimesGrad.toFixed(2)}</p>
        </div>
      </div>
      <LegendItem topic={nodeViewNode.topic} />
    </>
  );
}

type NodeViewNodeProps = {
  nodeViewNode: NodeViewNodeType;
  isSelected: boolean;
  tooltipRef: React.RefObject<HTMLDivElement>;
  setTooltipContent: React.Dispatch<React.SetStateAction<React.ReactNode>>;
  handleNodeClickCallback: (node: Node) => void;
  svgWidth: number;
  svgHeight: number;
  svgMargin: number;
  minActivation: number;
  maxActivation: number;
}

export const NodeViewNode: React.FC<NodeViewNodeProps> = ({ nodeViewNode, isSelected, tooltipRef, setTooltipContent, handleNodeClickCallback, svgWidth, svgHeight, svgMargin, minActivation, maxActivation }) => {
  const mouseOver: MouseEventHandler<SVGCircleElement | SVGRectElement> = (e) => {
    if (tooltipRef.current) {
      tooltipRef.current.style.setProperty("visibility", "visible");
      setTooltipContent(
        <NodeTooltipContent
          nodeViewNode={nodeViewNode}
        />
      );
    }
  }
  const mouseMove: MouseEventHandler<SVGCircleElement | SVGRectElement> = (e) => {
    if (tooltipRef.current) {
      tooltipRef.current.style.setProperty(
        "left", `${e.clientX + (svgMargin / 4)}px`
      );
      tooltipRef.current.style.setProperty(
        "top", `${e.clientY + (svgMargin / 4)}px`
      );
    }
  }
  const mouseOut: MouseEventHandler<SVGCircleElement | SVGRectElement> = (e) => {
    if (tooltipRef.current) {
      tooltipRef.current.style.setProperty("visibility", "hidden");
    }
  }

  const x = nodeViewNode.x * (svgWidth - (2 * svgMargin)) + svgMargin;
  const y = nodeViewNode.y * (svgHeight - (2 * svgMargin)) + svgMargin;

  const size = interpolateSize(
    Math.abs(nodeViewNode.actTimesGrad), 
    [0, Math.max(Math.abs(minActivation), maxActivation)], 
    [0.3, 1.2]
  );

  const topicColorString = `rgb(${nodeViewNode.topic.color.r}, ${nodeViewNode.topic.color.g}, ${nodeViewNode.topic.color.b})`;
  
  return (
    <>
      { nodeViewNode.actTimesGrad >= 0 && (
        <circle
          className="cursor-pointer"
          cx={x}
          cy={y}
          r={`${size}em`}
          data-selected={isSelected}
          fill={topicColorString}
          stroke={"#000"}
          strokeWidth={isSelected ? 3 : 1}
          onClick={(e) => {
            handleNodeClickCallback(nodeViewNode.node);
          }}
          onMouseOver={mouseOver}
          onMouseMove={mouseMove}
          onMouseOut={mouseOut}
        />
      ) || (
        <rect
          className="cursor-pointer"
          x={x}
          y={y}
          width={`${size * 2}em`}
          height={`${size * 2}em`}
          transform={`rotate(45, ${x}, ${y})`}
          data-selected={isSelected}
          fill={topicColorString}
          stroke={"#000"}
          strokeWidth={isSelected ? 3 : 1}
          onClick={(e) => {
            handleNodeClickCallback(nodeViewNode.node);
          }}
          onMouseOver={mouseOver}
          onMouseMove={mouseMove}
          onMouseOut={mouseOut}
        />
      )}
    </>
  );
}