import { InferenceAndTokenData, ModelInfoResponse } from "@/client";
import { CommonInferenceParams, PromptInferenceParams } from "@/types";
import PromptInput from "./PromptInput";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { IconChevronDown } from "./icons";

export type InferenceParamsDisplayProps = {
  commonInferenceParams: CommonInferenceParams;
  setCommonInferenceParams: React.Dispatch<React.SetStateAction<CommonInferenceParams>>;
  leftPromptInferenceParams: PromptInferenceParams;
  setLeftPromptInferenceParams: React.Dispatch<React.SetStateAction<PromptInferenceParams | null>>;
  rightPromptInferenceParams: PromptInferenceParams | null;
  setRightPromptInferenceParams: React.Dispatch<React.SetStateAction<PromptInferenceParams | null>>;
  twoPromptsMode: boolean;
  setTwoPromptsMode: React.Dispatch<React.SetStateAction<boolean>>;
  modelInfo: ModelInfoResponse | null;
  fetchInferenceData: () => void;
  inferenceAndTokenData: InferenceAndTokenData | null;
};

export const PromptForm: React.FC<InferenceParamsDisplayProps> = ({
  commonInferenceParams,
  setCommonInferenceParams,
  leftPromptInferenceParams,
  setLeftPromptInferenceParams,
  rightPromptInferenceParams,
  setRightPromptInferenceParams,
  twoPromptsMode,
  setTwoPromptsMode,
  modelInfo,
  fetchInferenceData,
  inferenceAndTokenData,
}) => {
  return <>
    <Collapsible defaultOpen={true} className="flex flex-col items-center w-full">
      <CollapsibleTrigger className="group flex flex-row justify-between items-center w-full aria-expanded:mb-2">
        <h2 className="flex-none text-xl">Prompt input</h2>
        <div className="group-aria-expanded:hidden flex flex-row font-mono gap-2">
          <p className="bg-gray-300 rounded-md px-2 py-1" title="prompt tokens">{leftPromptInferenceParams.prompt}</p>
          <p className="bg-gray-300 rounded-md px-2 py-1" title="target tokens">{leftPromptInferenceParams.targetTokens.reduce((acc, token) => { return acc + ", " + token })}</p>
          {leftPromptInferenceParams.distractorTokens.length > 0 && (
            <p className="bg-gray-300 rounded-md px-2 py-1" title="distractor tokens">{leftPromptInferenceParams.distractorTokens.reduce((acc, token) => { return acc + ", " + token }, "")}</p>
          )}
        </div>
        <div className="text-xl">
          <IconChevronDown />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="flex flex-row justify-start gap-2 w-full">
        <PromptInput
          promptInferenceParams={leftPromptInferenceParams}
          setPromptInferenceParams={setLeftPromptInferenceParams}
          fetchInferenceData={fetchInferenceData}
          side={twoPromptsMode ? "Left" : null}
        />
      </CollapsibleContent>
    </Collapsible>
    {/* No second/right prompt support at this stage */}
  </>
}

export default PromptForm;