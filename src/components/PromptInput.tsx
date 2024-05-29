import { PromptInferenceParams } from "@/types";
import { Textarea } from "./ui/textarea";
import { MultiTokenInput } from "./MultiTokenInput";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export const PromptInput: React.FC<{
  promptInferenceParams: PromptInferenceParams;
  setPromptInferenceParams: React.Dispatch<React.SetStateAction<PromptInferenceParams | null>>;
  fetchInferenceData: () => void;
  side: "Left" | "Right" | null;
}> = ({ promptInferenceParams, setPromptInferenceParams, fetchInferenceData, side }) => {
  const { prompt, targetTokens, distractorTokens } = promptInferenceParams;
  return (
    <>
      <Input
        title="prompt input"
        placeholder="prompt"
        className="flex-1 font-mono"
        value={prompt}
        onChange={(e) => {
          setPromptInferenceParams({ ...promptInferenceParams, prompt: e.target.value })
        }}
      />
      <MultiTokenInput
        className="flex flex-1"
        tokens={targetTokens}
        onChange={(newTokens) =>
          setPromptInferenceParams({
            ...promptInferenceParams,
            targetTokens: newTokens,
          })
        }
      />
      <MultiTokenInput
        className="flex flex-1"
        tokens={distractorTokens}
        onChange={(newTokens) =>
          setPromptInferenceParams({
            ...promptInferenceParams,
            distractorTokens: newTokens,
          })
        }
        allowLengthZero={true}
      />
      <Button 
        className="flex-initial" 
        title="Submit"
        onClick={(e) => {
          e.preventDefault();
          fetchInferenceData();
        }}
      >
        Analyze
      </Button>
    </>
  );
}

export default PromptInput;