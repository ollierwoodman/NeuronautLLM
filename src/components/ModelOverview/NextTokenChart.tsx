import { MultipleTopKDerivedScalarsResponseData } from "@/client";
import { ChartColors } from "@/utils/colors";
import { Chart, GoogleChartOptions } from "react-google-charts";

type NextTokenChartProps = {
  topOutputTokenLogits: MultipleTopKDerivedScalarsResponseData;
  softmaxedLogits: number[];
};

export const NextTokenChart: React.FC<NextTokenChartProps> = ({
  topOutputTokenLogits,
  softmaxedLogits,
}) => {
  const nextTokenCandidates = topOutputTokenLogits.vocabTokenStringsForIndices;

  const data = [
    ["Token", "Probability"],
  ] as any[][];

  nextTokenCandidates?.forEach((token, index) => {
    data.push([token, softmaxedLogits[index]])
  });
  
  const options: GoogleChartOptions = {
    chartArea: {
      left: 10,
      right: 10,
      top: 10,
      bottom: 10,
    },
    backgroundColor: "white",
    legend: "none",
    tooltip: {
      text: "percentage",
    },
    pieSliceText: "label",
    pieResidueSliceLabel: "(other)",
    sliceVisibilityThreshold: 0.01,
    colors: ChartColors,
  };

  return (
    <>
      <div className="flex flex-1">
        <Chart
          chartType="PieChart"
          data={data}
          options={options}
          width={"100%"}
          height={"100%"}
        />
      </div>
    </>
  )
}