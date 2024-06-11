import { connect } from "@/app/api/db";
import { NextResponse } from "next/server";
import { parseJsonColumnsForDbRows } from "../parseJsonColumns";

export async function GET(
  request: Request,
) {
  const db = await connect().then((db) => db)
  
  if (!db) {
    return NextResponse.json({ error: "Failed to connect to database" }, { status: 500 });
  }

  const topics = await db.all(
    "SELECT * FROM topics;",
  );

  const parsedTopics = parseJsonColumnsForDbRows(
    ["top_words"], 
    topics,
  );

  return NextResponse.json(parsedTopics);
}