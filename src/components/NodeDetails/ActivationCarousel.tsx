import { ActivationDbRow } from "@/types";
import React, { useEffect, useRef, useState } from "react";
import TokenHeatmap from "../TokenHeatmap";
import { TokenAndScalar } from "@/client";
import { Spinner } from "../icons/spinners";
import { Button } from "../ui/button";
import { IconLeftArrowOutlined, IconRightArrowOutlined } from "../icons";

function normalizeArray(array: number[]) {
  const max = Math.max(...array);
  const min = Math.min(...array);
  return array.map((value) => (value - min) / (max - min));
}

type ActivationCarouselProps = {
  activationsPromise: Promise<ActivationDbRow[]>;
  minActivation: number | null;
  setMinActivation: React.Dispatch<React.SetStateAction<number | null>>;
  maxActivation: number | null;
  setMaxActivation: React.Dispatch<React.SetStateAction<number | null>>;
}

export const ActivationCarousel: React.FC<ActivationCarouselProps> = ({
  activationsPromise,
  minActivation,
  setMinActivation,
  maxActivation,
  setMaxActivation,
}) => {
  const carouselRef = useRef<HTMLDivElement>(null);

  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activations, setActivations] = useState<ActivationDbRow[] | null>(null);
  
  useEffect(() => {
    setLoading(true)
    activationsPromise.then((data) => {
      setLoading(false);
      setActivations(data);
      setMinActivation(null);
      setMaxActivation(null);
      
      data.forEach((row: ActivationDbRow) => {
        const min = Math.min(...row.activation_values);
        if (!minActivation || min < minActivation) {
          setMinActivation(min);
        }
      });
      data.forEach((row: ActivationDbRow) => {
        const max = Math.max(...row.activation_values);
        if (!maxActivation || max < maxActivation) {
          setMaxActivation(max);
        }
      });
    }).catch((error: Error) => {
      setError(error);
    });
  }, [activationsPromise]);

  if (loading) {
    return (
      <div className="flex h-20 justify-center items-center text-xl border border-slate-200 rounded-md">
        <Spinner />
      </div>
    );
  }

  if (error || !activations) {
    return (
      <div className="flex h-20 justify-center items-center border border-slate-200 rounded-md">
        <p className="text-red-800">Error</p>
      </div>  
    );
  }

  return (
    <>
      <div className="flex flex-col items-center">
        <div ref={carouselRef} className="flex flex-row flex-nowrap w-full overflow-x-auto gap-2">
          {activations.map((activation, index) => {
            const normalizedScalars = normalizeArray(activation.activation_values);

            const tokenSequence = activation.tokens.map((token: string, index: number) => {
              return {token: token, scalar: activation.activation_values[index], normalizedScalar: normalizedScalars[index]} as TokenAndScalar;
            });
            return (
              <div
                key={index} 
                className="flex min-w-fit max-w-full w-4/5 text-[0.8rem] p-1 border border-slate-200 rounded-md"
              >
                <TokenHeatmap tokenSequence={tokenSequence} />
              </div>
            );
          })}
        </div>
        {/* TODO: add next/prev buttons */}
        {/* <div className="">
          <Button
            className="aspect-square text-xl p-1 rounded-full"
          >
            <IconLeftArrowOutlined />
          </Button>
          <Button
            className="aspect-square text-xl p-1 rounded-full"
          >
            <IconRightArrowOutlined />
          </Button>
        </div> */}
      </div>
    </>
  );
}