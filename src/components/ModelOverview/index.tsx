import { MultipleTopKDerivedScalarsResponseData } from "@/client";
import { getInferenceAndTokenData, getSubResponse } from "@/requests/inferenceResponseUtils";
import { BySequenceTokenDisplay } from "./BySequenceTokenDisplay";
import { NextTokenChart } from "./NextTokenChart";
import { TokenOutputTable } from "./TokenOutputTable";

function softmaxArr(arr: number[]) {
  return arr.map(function(value, index) { 
    return Math.exp(value) / arr.map( function(y /*value*/){ return Math.exp(y) } ).reduce( function(a,b){ return a+b })
  })
}

type ModelOverviewProps = {
  leftResponse: any;
  leftPromptInferenceParams: any;
};

export const ModelOverview: React.FC<ModelOverviewProps> = ({
  leftResponse,
  leftPromptInferenceParams,
}) => {
  const topOutputTokenLogits = getSubResponse<MultipleTopKDerivedScalarsResponseData>(
    leftResponse,
    "topOutputTokenLogits"
  )!

  const bestNextTokenCandidate = topOutputTokenLogits?.vocabTokenStringsForIndices?.at(0);
  
  const softmaxedLogits = topOutputTokenLogits ? softmaxArr(topOutputTokenLogits.activationsByGroupId["logits"]) : [];

  return (
    <>
      <div className="flex flex-col w-full p-2">
        <h2 className="text-xl text-center">Token effect and prediction</h2>
        {bestNextTokenCandidate && (
          <h2 className="text-sm text-center text-gray-600">predicted next token:{' '}
            <span className="font-mono">
              {bestNextTokenCandidate}
            </span>
          </h2>
        ) || (
          <h2 className="text-sm text-center text-gray-600">loading...</h2>
        )}
        {leftResponse && (
          <>
            <BySequenceTokenDisplay
              responseData={
                getSubResponse<MultipleTopKDerivedScalarsResponseData>(
                  leftResponse,
                  "componentSumsForTokenDisplay"
                )!
              }
              inferenceAndTokenData={getInferenceAndTokenData(leftResponse)!}
            />
            <h3 className="text-lg text-center mt-2">Next token prediction results</h3>
            <NextTokenChart 
              topOutputTokenLogits={
                topOutputTokenLogits
              }
              softmaxedLogits={softmaxedLogits}
            />
            <TokenOutputTable
              topOutputTokenLogits={
                topOutputTokenLogits
              }
              softmaxedLogits={softmaxedLogits}
            />
          </>
        )}
      </div>
    </>
  )
}