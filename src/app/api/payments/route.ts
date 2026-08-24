import { NextResponse } from "next/server";
import { payments } from "@/lib/mock-data";

export function GET() {
  return NextResponse.json(payments);
}
