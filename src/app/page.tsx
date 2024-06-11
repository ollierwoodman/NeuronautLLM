"use client";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import NodeView from "@/components/NodeView";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import { CommonInferenceParams, NeuronDbRow, Node, PromptInferenceParams, Topic, TopicDbRow } from "@/types";
import React, { useState, useMemo, useEffect } from "react";
import {
  type MultipleTopKDerivedScalarsResponseData,
  type ModelInfoResponse,
  InferenceResponseAndResponseDict,
  TdbRequestSpec,
  ComponentTypeForAttention,
  ComponentTypeForMlp,
  MirroredNodeIndex,
} from "../client";
import { getInferenceAndTokenData, getSubResponse } from "@/requests/inferenceResponseUtils";
import { InferenceDataFetcher, fetchModelInfo } from "@/requests/inferenceDataFetcher";
import { queryToInferenceParams, updateQueryFromInferenceParams } from "@/utils/urlParams";
import { useSearchParams, useRouter } from "next/navigation";
import PromptForm from "@/components/PromptForm";
import { NodeDetails } from "@/components/NodeDetails";
import { TopicColors } from "@/utils/colors";
import { ModelOverview } from "@/components/ModelOverview";

const Home: React.FC = () => {
  // Top level component, should manage all state and pass it down to children
  const router = useRouter();
  const searchParams = useSearchParams();
  const query: URLSearchParams = useMemo(() => new URLSearchParams(searchParams.toString()), [searchParams]);
  const {
    commonParams: commonParamsFromUrl,
    leftPromptParams: leftPromptParamsFromUrl,
    rightPromptParams: rightPromptParamsFromUrl,
  } = queryToInferenceParams(query);
  const [commonInferenceParams, setCommonInferenceParams] =
    useState<CommonInferenceParams>(commonParamsFromUrl);
  const [leftPromptInferenceParams, setLeftPromptInferenceParams] =
    useState<PromptInferenceParams | null>(leftPromptParamsFromUrl);
  const [rightPromptInferenceParams, setRightPromptInferenceParams] =
    useState<PromptInferenceParams | null>(rightPromptParamsFromUrl);
  const [twoPromptsMode, setTwoPromptsMode] = React.useState(rightPromptInferenceParams !== null);
  const [modelInfo, setModelInfo] = useState<ModelInfoResponse | null>(null);

  if (!leftPromptInferenceParams) {
    throw new Error("leftPromptInferenceParams should never be null");
  }

  useEffect(() => {
    const updatedQuery = updateQueryFromInferenceParams(
      query,
      commonInferenceParams,
      leftPromptInferenceParams,
      rightPromptInferenceParams
    );
    router.push(`?${updatedQuery.toString()}`);
  }, [
    commonInferenceParams,
    leftPromptInferenceParams,
    rightPromptInferenceParams,
    router,
    query,
  ]);

  // TDB has a concept of left and right requests and responses. In cases where one request is a
  // "test" request and the other is a baseline, the left request is the test request and the right
  // request is the baseline request. In cases where there's only one request, it's the left
  // request. In other cases, left vs. right is arbitrary.
  const [rightRequest, setRightRequest] = useState<TdbRequestSpec | null>(null);
  const [rightResponse, setRightResponse] = useState<InferenceResponseAndResponseDict | null>(null);
  const [leftRequest, setLeftRequest] = useState<TdbRequestSpec | null>(null);
  const [leftResponse, setLeftResponse] = useState<InferenceResponseAndResponseDict | null>(null);
  const [activationServerErrorMessage, setActivationServerErrorMessage] = useState<string | null>(
    null
  );

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [neuronDbSample, setNeuronDbSample] = useState<NeuronDbRow[]>([]);

  function handleNodeClick(node: Node | null): Node | null {
    if (node) {
      setSelectedNode(node);
      return node;
    }
    setSelectedNode(null);      
    return null;
  };


  const [neuronTopics, setNeuronTopics] = useState<Topic[]>([]);

  useEffect(() => {
    fetch(`/api/topics`)
      .then((res) => res.json() as Promise<TopicDbRow[]>)
      .then((dbTopics) => {
        setNeuronTopics(dbTopics.map((row) => {
          return {
            id: row.id,
            title: row.title,
            topWords: row.top_words,
            color: TopicColors[row.id],
          }
        }));
      })
      .catch((e) => {
        console.error(e);
      });
  }, []);

  const inferenceDataFetcher = new InferenceDataFetcher();
  const fetchInferenceData = React.useCallback(async () => {
    setSelectedNode(null);
    inferenceDataFetcher.fetch(
      modelInfo,
      commonInferenceParams,
      leftPromptInferenceParams,
      rightPromptInferenceParams,
      setRightResponse,
      setLeftResponse,
      setRightRequest,
      setLeftRequest,
      setActivationServerErrorMessage
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commonInferenceParams, leftPromptInferenceParams, rightPromptInferenceParams, modelInfo]);

  useEffect(() => {
    fetchModelInfo(setModelInfo, setActivationServerErrorMessage);
  }, []);

  const prevCommonInferenceParamsRef = React.useRef<CommonInferenceParams>();
  const prevLeftPromptInferenceParamsRef = React.useRef<PromptInferenceParams>();
  const prevRightPromptInferenceParamsRef = React.useRef<PromptInferenceParams | null>();

  // Call fetchInferenceData once on mount and whenever specific inference parameters change.
  useEffect(() => {
    const shouldFetch = inferenceDataFetcher.shouldFetch(
      commonInferenceParams,
      leftPromptInferenceParams,
      rightPromptInferenceParams,
      prevCommonInferenceParamsRef,
      prevLeftPromptInferenceParamsRef,
      prevRightPromptInferenceParamsRef
    );

    if (shouldFetch) {
      fetchInferenceData();
    }

    prevCommonInferenceParamsRef.current = commonInferenceParams;
    prevLeftPromptInferenceParamsRef.current = leftPromptInferenceParams;
    prevRightPromptInferenceParamsRef.current = rightPromptInferenceParams;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    commonInferenceParams,
    leftPromptInferenceParams,
    rightPromptInferenceParams,
    twoPromptsMode,
  ]);

  // Fetch inference data any time the modelInfo changes.
  useEffect(() => {
    fetchInferenceData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelInfo]);

  return (
    <main className="flex min-h-screen w-screen flex-col items-center justify-between p-4">
      <Header />
      <div className="flex flex-col flex-1 w-full p-4 m-4 gap-4 border-2 rounded-md">
        <div className="flex flex-row items-center border-2 p-2 gap-2 rounded-md">
          <PromptForm
            commonInferenceParams={commonInferenceParams}
            setCommonInferenceParams={setCommonInferenceParams}
            leftPromptInferenceParams={leftPromptInferenceParams}
            setLeftPromptInferenceParams={setLeftPromptInferenceParams}
            rightPromptInferenceParams={rightPromptInferenceParams}
            setRightPromptInferenceParams={setRightPromptInferenceParams}
            twoPromptsMode={twoPromptsMode}
            setTwoPromptsMode={setTwoPromptsMode}
            modelInfo={modelInfo}
            fetchInferenceData={fetchInferenceData}
            inferenceAndTokenData={getInferenceAndTokenData(leftResponse)}
          />
        </div>
        <div className="flex flex-col flex-1 border-2 rounded-md">
          <ResizablePanelGroup direction="horizontal" className="w-full flex-1">
            <ResizablePanel defaultSize={25} className="flex">
              <ModelOverview
                leftResponse={leftResponse}
                leftPromptInferenceParams={leftPromptInferenceParams}
              />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={50} className="flex">
              {
                getSubResponse<MultipleTopKDerivedScalarsResponseData>(leftResponse, "topKComponents") &&
                getInferenceAndTokenData(leftResponse) && (
                  <NodeView
                    leftResponse={leftResponse}
                    selectedNode={selectedNode}
                    handleNodeClickCallback={handleNodeClick}
                    setNeuronDbSample={setNeuronDbSample}
                    neuronTopics={neuronTopics}
                  />
                )
              }
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={25} className="flex">
              <NodeDetails
                responseData={leftResponse}
                selectedNode={selectedNode}
                neuronDbSample={neuronDbSample}
                neuronTopics={neuronTopics}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
      {/* <Footer /> */}
    </main>
  );
}

export default Home;