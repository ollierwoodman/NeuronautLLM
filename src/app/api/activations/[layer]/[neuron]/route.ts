import { connect } from "@/app/api/db";
import { NextRequest, NextResponse } from "next/server";

const QUERY_PARAM_DEFAULTS = {
  limit: 10,
  category: "top",
}

export async function GET(
  request: NextRequest,
  { params }: { params: { layer: string, neuron: string } }
) {
  const searchParams = request.nextUrl.searchParams;
  const limit = searchParams.get("limit") || QUERY_PARAM_DEFAULTS.limit;
  const category = searchParams.get("category") || QUERY_PARAM_DEFAULTS.category;

  const { layer: layerString, neuron: neuronString } = params;
  const layerIndex = Number(layerString);
  const neuronIndex = Number(neuronString);

  if (isNaN(layerIndex) || isNaN(neuronIndex)) {
    return NextResponse.json({ error: "Invalid layer or neuron index" }, { status: 400 });
  }

  const db = await connect().catch((e: Error) => {
    return NextResponse.json({ error: e.message }, { status: 500 });
  });

  const activations = await db.all(
    "SELECT * FROM activations WHERE neuron_id = (SELECT id FROM neurons WHERE layer_index = $layer_index AND neuron_index = $neuron_index) AND category = $category LIMIT $limit OFFSET 0", 
    {
      $layer_index: layerIndex,
      $neuron_index: neuronIndex,
      $limit: limit,
      $category: category,
    },
  );

  return NextResponse.json(activations)
}