import { connect } from "@/app/api/db";
import { NextResponse } from "next/server";
import { Database, Statement } from "sqlite3";

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

  const neurons = await db.get(
    "SELECT * FROM neurons WHERE layer_index = $layer_index AND neuron_index = $neuron_index", 
    {
      $layer_index: layerIndex,
      $neuron_index: neuronIndex,
    },
  );

  return NextResponse.json(neurons)
}