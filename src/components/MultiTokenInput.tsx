import { IconAdd, IconSubtract } from "./icons";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export const MultiTokenInput: React.FC<{
  tokens: string[];
  onChange: (tokens: string[]) => void;
  className?: string;
  allowLengthZero?: boolean;
}> = ({ tokens, onChange, className, allowLengthZero }) => {
  // display a row of text inputs with one token per input, + button to add more tokens, - button to remove last token
  // when token is changed, call onChange with new tokens
  const allowRemovingTokens = tokens.length > 1 || (allowLengthZero && tokens.length === 1);

  return (
    <div className={`flex flex-row gap-2 ${className}`}>
      {tokens.map((token, index) => (
        <Input
          className="flex-1 font-mono"
          key={index}
          type="text"
          value={token}
          onChange={(e) => {
            const newTokens = [...tokens];
            newTokens[index] = e.target.value;
            onChange(newTokens);
          }}
        />
      ))}
      <Button
        className="aspect-square text-xl p-1 rounded-full"
        title="add token"
        onClick={(e) => {
          e.preventDefault();
          onChange([...tokens, ""]);
        }}
      >
        <IconAdd />
      </Button>
      <Button
        className="aspect-square text-xl p-1 rounded-full disabled:opacity-50"
        disabled={!allowRemovingTokens}
        title="remove last token"
        onClick={(e) => {
          e.preventDefault();
          if (!allowRemovingTokens) {
            return;
          }
          onChange(tokens.slice(0, tokens.length - 1));
        }}
      >
        <IconSubtract />
      </Button>
    </div>
  );
};
