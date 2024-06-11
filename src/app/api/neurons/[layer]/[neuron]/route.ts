import { connect } from "@/app/api/db";
import { parseJsonColumnsForDbRow } from "@/app/api/parseJsonColumns";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { layer: string, neuron: string } }
) {
  const { layer: layerString, neuron: neuronString } = params;
  const layerIndex = Number(layerString);
  const neuronIndex = Number(neuronString);

  if (isNaN(layerIndex) || isNaN(neuronIndex)) {
    return NextResponse.json({ error: "Invalid layer or neuron index" }, { status: 400 });
  }

  const db = await connect().then((db) => db)
  
  if (!db) {
    return NextResponse.json({ error: "Failed to connect to database" }, { status: 500 });
  }

  const neuron = await db.get(
    "SELECT * FROM neurons WHERE layer_index = $layer_index AND neuron_index = $neuron_index", 
    {
      $layer_index: layerIndex,
      $neuron_index: neuronIndex,
    },
  );

  const parsedNeuron = parseJsonColumnsForDbRow(
    ["explanation_embedding"], 
    neuron,
  );

  return NextResponse.json(parsedNeuron);
}