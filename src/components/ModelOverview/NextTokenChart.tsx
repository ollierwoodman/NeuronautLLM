import { MultipleTopKDerivedScalarsResponseData } from "@/client";
import { ChartColors } from "@/utils/colors";
import { Chart, GoogleChartOptions } from "react-google-charts";
import { Tree, TreeLeaf, TreeNode, Treemap } from "./TreeMapChart";
import { useObserveSize } from "@/hooks/observeSize";

type NextTokenChartProps = {
  topOutputTokenLogits: MultipleTopKDerivedScalarsResponseData;
  softmaxedLogits: number[];
};

export const NextTokenChart: React.FC<NextTokenChartProps> = ({
  topOutputTokenLogits,
  softmaxedLogits,
}) => {
  const { width: wrapperWidth, height: wrapperHeight, ref: wrapperRef} = useObserveSize();
  const nextTokenCandidates = topOutputTokenLogits.vocabTokenStringsForIndices;

  const treeData: TreeNode = {
    type: "node",
    name: "Token prediction distribution",
    value: 0,
    logit: 0,
    children: nextTokenCandidates?.map((token, index) => {
      return {
        type: "leaf",
        name: token,
        value: softmaxedLogits[index],
        logit: topOutputTokenLogits.activationsByGroupId["logits"][index],
      };
    }) || [] as Tree[],
  };
  
  return (
    <>
      <div ref={wrapperRef} className="flex flex-1">
        <Treemap
          data={treeData}
          width={wrapperWidth}
          height={wrapperHeight}
          margin={5}
        />
      </div>
    </>
  )
}