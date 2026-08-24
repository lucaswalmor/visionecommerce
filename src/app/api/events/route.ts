import { NextResponse } from "next/server";
import { events } from "@/lib/mock-data";

export function GET() {
  return NextResponse.json(events);
}
