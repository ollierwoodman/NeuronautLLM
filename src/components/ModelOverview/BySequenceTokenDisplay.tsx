import {
  MultipleTopKDerivedScalarsResponseData,
  InferenceAndTokenData,
  GroupId,
} from "../../client";
import React, { useMemo } from "react";
import { TokenAndScalar, DerivedScalarType } from "../../client";
import TokenHeatmap from "../TokenHeatmap";
import { POSITIVE_NEGATIVE_BOUNDARIES, POSITIVE_NEGATIVE_COLORS } from "../../utils/colors";

function makeTokenAndScalarList(tokensAsStrings: string[], scalars: number[]): TokenAndScalar[] {
  const scalarsMax = Math.max(...scalars);
  const scalarsMin = Math.min(...scalars);
  const scale = Math.max(Math.abs(scalarsMax), Math.abs(scalarsMin));
  // console.log("scale", scale);
  const normalizedScalars = scalars.map((scalar) => scalar / (scale * 2) + 0.5);
  // console.log("normalizedScalars", normalizedScalars);
  let tokenAndScalarList: TokenAndScalar[] = [];
  for (let i = 0; i < tokensAsStrings.length; i++) {
    tokenAndScalarList.push({
      token: tokensAsStrings[i],
      scalar: scalars[i],
      normalizedScalar: normalizedScalars[i],
    });
  }
  return tokenAndScalarList;
}

function sumOverFirstDim(values: number[][]): number[] {
  let result = new Array(values.length).fill(0);
  for (let i = 0; i < values.length; i++) {
    for (let j = 0; j < values[i].length; j++) {
      result[i] += values[i][j];
    }
  }
  return result;
}

function sumOverSecondDim(values: number[][]): number[] {
  let result = new Array(values[0].length).fill(0);
  for (let i = 0; i < values.length; i++) {
    for (let j = 0; j < values[i].length; j++) {
      result[j] += values[i][j];
    }
  }
  return result;
}

type BySequenceTokenDisplayProps = {
  responseData: MultipleTopKDerivedScalarsResponseData;
  inferenceAndTokenData: InferenceAndTokenData;
};
export const BySequenceTokenDisplay: React.FC<BySequenceTokenDisplayProps> = ({
  responseData,
  inferenceAndTokenData,
}) => {
  const intermediateSumActivations = responseData.intermediateSumActivationsByDstByGroupId;
  const tokensAsStrings: string[] = inferenceAndTokenData.tokensAsStrings;

  const embActTimesGrad = useMemo(
    () =>
      makeTokenAndScalarList(
        tokensAsStrings,
        intermediateSumActivations[GroupId.ACT_TIMES_GRAD][DerivedScalarType.TOKEN_ATTRIBUTION]
          .value as unknown as number[]
      ),
    [tokensAsStrings, intermediateSumActivations]
  );

  const mlpActTimesGrad = useMemo(
    () =>
      makeTokenAndScalarList(
        tokensAsStrings,
        intermediateSumActivations[GroupId.ACT_TIMES_GRAD][DerivedScalarType.MLP_ACT_TIMES_GRAD]
          .value as unknown as number[]
      ),
    [tokensAsStrings, intermediateSumActivations]
  );

  const attendedFromToken = useMemo(
    () =>
      makeTokenAndScalarList(
        tokensAsStrings,
        sumOverFirstDim(
          intermediateSumActivations[GroupId.ACT_TIMES_GRAD][
            DerivedScalarType.UNFLATTENED_ATTN_ACT_TIMES_GRAD
          ].value as unknown as number[][]
        )
      ),
    [tokensAsStrings, intermediateSumActivations]
  );

  const attendedToToken = useMemo(
    () =>
      makeTokenAndScalarList(
        tokensAsStrings,
        sumOverSecondDim(
          intermediateSumActivations[GroupId.ACT_TIMES_GRAD][
            DerivedScalarType.UNFLATTENED_ATTN_ACT_TIMES_GRAD
          ].value as unknown as number[][]
        )
      ),
    [tokensAsStrings, intermediateSumActivations]
  );

  const heatmapData = [
    {
      heading: "embeddings",
      tokenSequence: embActTimesGrad,
    },
    {
      heading: "MLP layers",
      tokenSequence: mlpActTimesGrad,
    },
    {
      heading: "attention layers, from token",
      tokenSequence: attendedFromToken,
    },
    {
      heading: "attention layers, to token",
      tokenSequence: attendedToToken,
    },
  ];

  return (
    <>
      <h3 className="text-lg text-center mt-2 mb-1">Input token effects</h3>
      <div className="flex flex-col gap-1">
        {
          heatmapData.map(({ heading, tokenSequence }) => {
            return <>
              <div className="flex flex-row justify-between items-center gap-1">
                <h3 className="flex-none text-sm text-gray-600">{heading}</h3>
                <div className="flex justify-center text-xs border border-slate-300 rounded-md p-1">
                  <TokenHeatmap
                    tokenSequence={tokenSequence}
                    colors={POSITIVE_NEGATIVE_COLORS}
                    boundaries={POSITIVE_NEGATIVE_BOUNDARIES}
                  />
                </div>
              </div>
            </>
          })
        }
      </div>
    </>
  );
};
