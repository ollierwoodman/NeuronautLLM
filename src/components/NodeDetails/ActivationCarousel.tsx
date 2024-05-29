import { UnparsedActivationDbRowCollection } from "@/types";
import React, { useEffect, useState } from "react";
import TokenHeatmap from "../TokenHeatmap";
import { TokenAndScalar } from "@/client";
import { Spinner } from "../icons/spinners";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../ui/carousel";

function normalizeArray(array: number[]) {
  const max = Math.max(...array);
  const min = Math.min(...array);
  return array.map((value) => (value - min) / (max - min));
}

type ActivationCarouselProps = {
  activationsPromise: Promise<UnparsedActivationDbRowCollection>;
}

export const ActivationCarousel: React.FC<ActivationCarouselProps> = ({
  activationsPromise,
}) => {
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activations, setActivations] = useState<UnparsedActivationDbRowCollection | null>(null);
  
  useEffect(() => {
    setLoading(true)
    activationsPromise.then((data) => {
      setLoading(false);
      setActivations(data);
    }).catch((error: Error) => {
      setError(error);
    });
  }, [activationsPromise]);

  if (loading) {
    return (
      <div className="flex flex-1 justify-center items-center bg-gray-100 rounded-md">
        <Spinner />
      </div>
    );
  }

  if (error || !activations) {
    return <p>Error</p>;
  }

  return (
    <>
      <Carousel className="flex justify-center items-center" opts={{ slidesToScroll: 1, align: "center" }}>
        <CarouselContent>
          {activations.map((activation, index) => {
            const tokens = JSON.parse(activation.tokens) as string[];
            const activationValues = JSON.parse(activation.activation_values) as number[];

            const normalizedScalars = normalizeArray(activationValues);

            const tokenSequence = tokens.map((token, index) => {
              return {token: token, scalar: activationValues[index], normalizedScalar: normalizedScalars[index]} as TokenAndScalar;
            });
            return (
              <CarouselItem
                key={index} 
                className="flex justify-center items-center p-1 border-1"
              >
                {/* <TokenHeatmap tokenSequence={tokenSequence} /> */}
                <div className="whitespace-pre-wrap font-mono">
                  This is an example of an activation heatmap.
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </>
  );
}