import { NextResponse } from "next/server";
import { customers } from "@/lib/mock-data";

export function GET() {
  return NextResponse.json(customers);
}
