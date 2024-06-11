import { TokenSequenceAndScalars } from "../types";
import { Color, DEFAULT_BOUNDARIES, DEFAULT_COLORS, getInterpolatedColor } from "../utils/colors";
import { formatToken } from "./TokenRendering";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

type TokenTooltipProps = {
  tokenSequence: TokenSequenceAndScalars;
  scalar: number;
  index: number;
  token: string;
}

const TokenTooltip: React.FC<TokenTooltipProps & { children: React.ReactNode }> = ({ 
  scalar,
  index,
  token,
  children,
}) => {
  return (
    <TooltipProvider
      delayDuration={0}
    >
      <Tooltip>
        <TooltipTrigger>
          {children}
        </TooltipTrigger>
        <TooltipContent
          style={{
            zIndex: 100,
          }}
        >
          <p>{`Activation: ${scalar.toFixed(2)} Index: ${index}`}</p>
        </TooltipContent>
      </Tooltip>  
    </TooltipProvider>
  );
};

type TokenHeatmapProps = {
  tokenSequence?: TokenSequenceAndScalars; // undefined means we're rendering an empty box while loading.
  onClick?: (index: number) => void;
  colors?: Color[];
  boundaries?: number[];
};

const TokenHeatmap: React.FC<TokenHeatmapProps> = ({
  tokenSequence,
  onClick,
  colors,
  boundaries,
}) => {
  return (
    <div className="flex flex-wrap font-mono">
      {tokenSequence &&
        tokenSequence.map(({ token, scalar, normalizedScalar }, i) => {
          const color = getInterpolatedColor(
            colors || DEFAULT_COLORS,
            boundaries || DEFAULT_BOUNDARIES,
            normalizedScalar || scalar
          );
          return (
            <TokenTooltip 
              key={i}
              tokenSequence={tokenSequence}
              scalar={scalar}
              index={i}
              token={token}
            >
              <span
                key={i}
                className=""
                style={{
                  transition: "500ms ease-in all",
                  background: `rgba(${color.r}, ${color.g}, ${color.b}, 0.5)`,
                }}
                // onClick={() => onClick && onClick(i)}
              >
                {formatToken(token, true)}
              </span>
            </TokenTooltip>
          );
        })}
    </div>
  );
};
export default TokenHeatmap;
