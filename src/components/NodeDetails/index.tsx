import { ActivationDbRow, NeuronDbRow, Node, Topic } from "@/types";
import { useMemo, useState } from "react";
import { ActivationCarousel } from "./ActivationCarousel";
import { LegendItem } from "../NodeView/TopicLegend";
import { POSITIVE_NEGATIVE_BOUNDARIES, POSITIVE_NEGATIVE_COLORS, colorToRgbString, getInterpolatedColor } from "@/utils/colors";

function updateMinMaxActivation(
  currMinActivation: number | null,
  setMinActivation: React.Dispatch<React.SetStateAction<number | null>>,
  currMaxActivation: number | null,
  setMaxActivation: React.Dispatch<React.SetStateAction<number | null>>,
  activations: number[],
): void {
  const newMinActivation = Math.min(...activations);
  const newMaxActivation = Math.max(...activations);

  if (currMinActivation === null || newMinActivation < currMinActivation) {
    setMinActivation(newMinActivation);
  }

  if (currMaxActivation === null || newMaxActivation > currMaxActivation) {
    setMaxActivation(newMaxActivation);
  }
}

type MetricKey = "explanation_ev_correlation_score" | "activation_mean" | "activation_variance" | "activation_skewness" | "activation_kurtosis";

function rankMetric(
  metricName: MetricKey, 
  metricValue: number, 
  neurons: NeuronDbRow[],
  metricIdeal: "low" | "zero" | "high" = "high",
): number {  
  // returns the decimal rank of a metric in a sample, 1 is highest, 0 is lowest
  return neurons.reduce((acc, neuron) => {
    if (metricIdeal === "low") {
      if (neuron[metricName] > metricValue) {
        return acc + 1;
      }
      return acc;
    }

    if (metricIdeal === "high") {
      if (neuron[metricName] < metricValue) {
        return acc + 1;
      }
      return acc;
    }

    if (metricIdeal === "zero") {
      if (Math.abs(neuron[metricName]) > Math.abs(metricValue)) {
        return acc + 1;
      }
      return acc;
    }
    return acc;
  }, 0) / neurons.length;
}

function buildMetricRankString(decimalRank: number): string {
  if (decimalRank >= 0.5) {
    return `Top ${Math.floor((1 - decimalRank) * 100)}%`;
  } else {
    return `Bottom ${Math.ceil(decimalRank * 100)}%`;
  }
}

export type NodeDetailsNode = {
  node: Node;
  neuronDb: NeuronDbRow;
  topic: Topic;
  topActivationsDb: Promise<ActivationDbRow[]>;
  randomActivationsDb: Promise<ActivationDbRow[]>;
}

type NodeDetailsProps = {
  responseData: any;
  selectedNode: Node | null;
  neuronDbSample: NeuronDbRow[];
  neuronTopics: Topic[];
};

export const NodeDetails: React.FC<NodeDetailsProps> = ({
  responseData,
  selectedNode,
  neuronDbSample,
  neuronTopics,
}) => {
  const [minActivation, setMinActivation] = useState<number | null>(null);
  const [maxActivation, setMaxActivation] = useState<number | null>(null);

  const node: NodeDetailsNode | null = useMemo(() => {
    if (!selectedNode) {
      return null;
    }

    const neuronDbRow = neuronDbSample?.find((row) => {
      if (!row) {
        return false;
      }

      return (
        // neuron type is same
        row.layer_index === selectedNode.layerIndex &&
        row.neuron_index === selectedNode.nodeIndex
      );
    }) || null;

    return {
      node: selectedNode,
      neuronDb: neuronDbRow,
      topic: neuronTopics.find((topic) => topic.id.toString() === neuronDbRow?.explanation_topic_id.toString()),
      topActivationsDb: fetch(`/api/activations/${selectedNode.layerIndex}/${selectedNode.nodeIndex}`)
        .then((res) => res.json())
        .catch((e) => {
          console.error(e);
        }) as Promise<ActivationDbRow[]>,
      randomActivationsDb: fetch(`/api/activations/${selectedNode.layerIndex}/${selectedNode.nodeIndex}?category=random`)
        .then((res) => res.json())
        .catch((e) => {
          console.error(e);
        }) as Promise<ActivationDbRow[]>,
    } as NodeDetailsNode;
  }, [selectedNode, neuronDbSample]);

  return (
    <>
      <div className="flex flex-1 flex-col w-full p-2">
        <h2 className="text-xl text-center font-bold">Neuron explanation</h2>
        { selectedNode && (
          <p className="text-sm text-center text-gray-600">
            layer{' '}
            <span className="font-mono">
              {selectedNode.layerIndex}
            </span>
            {' '}neuron{' '} 
            <span className="font-mono">
              {selectedNode.nodeIndex}
            </span>
          </p>
        )  || (
          <p className="text-sm text-center text-gray-600">
            no neuron selected
          </p>
        )}
        <div className="flex flex-1 flex-col w-full">
          {node && (
            <>
              <h3 className="text-lg text-center mt-2 mb-1">Explanation</h3>
              <div className="flex flex-row border rounded-md">
                <div className="flex flex-col flex-1 justify-around items-center gap-1 p-2">
                  <p
                    className="text-lg text-center text-balance font-light"
                  >
                    {node.neuronDb.explanation_text}
                  </p>
                  <div className="">
                    <LegendItem topic={node.topic} />
                  </div>
                </div>
                <div 
                  style={{ backgroundColor: 
                    colorToRgbString(getInterpolatedColor(
                      POSITIVE_NEGATIVE_COLORS,
                      POSITIVE_NEGATIVE_BOUNDARIES,
                      rankMetric(
                        "explanation_ev_correlation_score", 
                        node.neuronDb.explanation_ev_correlation_score, 
                        neuronDbSample
                      ),
                    ))
                  }}
                  className="flex flex-col flex-none justify-center items-center rounded-md p-2 m-2"
                >
                  <p className="text-xs">
                    Score
                  </p>
                  <p className="text-2xl font-light">
                    {node.neuronDb.explanation_ev_correlation_score.toFixed(2)}
                  </p>
                  <p className="text-xs">
                    {
                      buildMetricRankString(
                        rankMetric(
                          "explanation_ev_correlation_score", 
                          node.neuronDb.explanation_ev_correlation_score, 
                          neuronDbSample
                        )
                      )
                    }
                  </p>
                </div>
              </div>
              <h3 className="text-lg text-center mt-2">Activations</h3>
              <h4 className="text-sm text-gray-600 text-center mb-1">Top samples</h4>
              <ActivationCarousel 
                activationsPromise={node.topActivationsDb} 
                minActivation={minActivation} 
                setMinActivation={setMinActivation} 
                maxActivation={maxActivation} 
                setMaxActivation={setMaxActivation}
              />
              <h4 className="text-sm text-gray-600 text-center my-1">Random samples</h4>
              <ActivationCarousel 
                activationsPromise={node.randomActivationsDb}
                minActivation={minActivation} 
                setMinActivation={setMinActivation} 
                maxActivation={maxActivation} 
                setMaxActivation={setMaxActivation}
              />
              <h4 className="text-sm text-gray-600 text-center mt-1 mb-1">Activation statistics</h4>
              <div className="flex flex-row gap-2 justify-between border rounded-md p-2">
                {
                  [
                    { metric: "activation_mean", label: "Mean", ideal: "high" },
                    { metric: "activation_variance", label: "Variance", ideal: "low" },
                    { metric: "activation_skewness", label: "Skewness", ideal: "zero" },
                    { metric: "activation_kurtosis", label: "Kurtosis", ideal: "zero" },
                  ].map(({metric, label, ideal}, index) => {
                    return (
                      <div 
                        key={index}
                        style={{ backgroundColor: 
                          colorToRgbString(getInterpolatedColor(
                            POSITIVE_NEGATIVE_COLORS,
                            POSITIVE_NEGATIVE_BOUNDARIES,
                            rankMetric(
                              metric as MetricKey, 
                              node.neuronDb[metric as MetricKey] as number,
                              neuronDbSample,
                              ideal as "low" | "zero" | "high",
                            ),
                          ))
                        }}
                        className="flex flex-col flex-none justify-center items-center rounded-md p-2"
                      >
                        <p className="text-xs">
                          {label}
                        </p>
                        <p className="text-2xl font-light">
                          {node.neuronDb[metric as MetricKey].toFixed(2)}
                        </p>
                        <p className="text-xs">
                          {
                            buildMetricRankString(
                              rankMetric(
                                metric as MetricKey, 
                                node.neuronDb[metric as MetricKey] as number,
                                neuronDbSample,
                                ideal as "low" | "zero" | "high",
                              )
                            )
                          }
                        </p>
                      </div>
                    );
                  })
                }
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}