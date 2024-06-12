import { MouseEventHandler, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import styles from "./treemap.module.css";
import { ChartColors } from "@/utils/colors";

function getOrdinalSuffix(index: number): string {
  const onesDigit = index % 10;
  if (onesDigit === 1) {
    return "st";
  } else if (onesDigit === 2) {
    return "nd";
  } else if (onesDigit === 3) {
    return "rd";
  } else {
    return "th";
  }
}

export type TreeNode = {
  type: 'node';
  value: number;
  logit: number;
  name: string;
  children: Tree[];
};
export type TreeLeaf = {
  type: 'leaf';
  name: string;
  value: number;
  logit: number;
};

export type Tree = TreeNode | TreeLeaf;

type TreemapProps = {
  width: number;
  height: number;
  margin: number;
  data: Tree;
};

export const Treemap = ({ width, height, margin, data }: TreemapProps) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipContent, setTooltipContent] = useState<JSX.Element | null>(null);

  const hierarchy = useMemo(() => {
    return d3.hierarchy(data).sum((d) => d.value);
  }, [data]);

  // List of item of level 1 (just under root) & related color scale
  const firstLevelGroups = hierarchy?.children?.map((child) => child.data.name);
  var colorScale = d3
    .scaleOrdinal<string>()
    .domain(firstLevelGroups || [])
    .range(ChartColors);

  const root = useMemo(() => {
    const treeGenerator = d3.treemap<Tree>().size([width, height]).padding(4);
    return treeGenerator(hierarchy);
  }, [hierarchy, width, height]);

  const allShapes = root.leaves().map((leaf, i) => {
    const parentName = leaf.parent?.data.name;

    const mouseOver: MouseEventHandler<SVGCircleElement | SVGRectElement> = (e) => {
      if (tooltipRef.current) {
        tooltipRef.current.style.setProperty("visibility", "visible");
        setTooltipContent(
          <div className="grid grid-cols-2 text-sm gap-1">
            <h3 className="font-bold">
              Token:
            </h3>
            <p className="text-right">
              {leaf.data.name}
            </p>
            <h3 className="font-bold">
              Probability:
            </h3>
            <p className="text-right">
              {`${(leaf.data.value * 100).toFixed(2)}%`}
            </p>
            <h3 className="font-bold">
              Rank:
            </h3>
            <p className="text-right">
              {`${i+1}${getOrdinalSuffix(i + 1)}`}
            </p>
            <h3 className="font-bold">
              Logit:
            </h3>
            <p className="text-right">
              {leaf.data.logit.toFixed(2)}
            </p>
          </div>
        );
      }
    }
    const mouseMove: MouseEventHandler<SVGCircleElement | SVGRectElement> = (e) => {
      if (tooltipRef.current) {
        tooltipRef.current.style.setProperty(
          "left", `${e.clientX + (margin)}px`
        );
        tooltipRef.current.style.setProperty(
          "top", `${e.clientY + (margin)}px`
        );
      }
    }
    const mouseOut: MouseEventHandler<SVGCircleElement | SVGRectElement> = (e) => {
      if (tooltipRef.current) {
        tooltipRef.current.style.setProperty("visibility", "hidden");
      }
    }

    return (
      <g 
        key={i} 
        className={styles.rectangle}
        onMouseOver={mouseOver}
        onMouseMove={mouseMove}
        onMouseOut={mouseOut}
      >
        <rect
          x={leaf.x0}
          y={leaf.y0}
          width={leaf.x1 - leaf.x0}
          height={leaf.y1 - leaf.y0}
          stroke="transparent"
          fill={colorScale(parentName)}
          className={"opacity-80 hover:opacity-100"}
        />
        {leaf.value > 0.005 && (
          <text
            x={leaf.x0 + margin}
            y={leaf.y0 + margin}
            textAnchor="start"
            dominantBaseline="hanging"
            fill="white"
            className="text-sm"
          >
            {leaf.data.name}
          </text>
        )}
        {leaf.value > 0.02 && (
          <text
            x={leaf.x0 + margin}
            y={leaf.y0 + margin + 18}
            textAnchor="start"
            dominantBaseline="hanging"
            fill="white"
            className="font-light"
          >
            {`${(leaf.data.value * 100).toFixed(2)}%`}
          </text>
        )}
      </g>
    );
  });

  return (
    <>
      <svg width={width} height={height} className={styles.container}>
        {allShapes}
      </svg>
      <div 
          ref={tooltipRef}
          style={{
            position: "absolute",
            visibility: "hidden",
            zIndex: 1000,
          }}
          className="border-2 bg-white bg-opacity-90 rounded-md p-2"
        >
          {tooltipContent}
        </div>
    </>
  );
};
