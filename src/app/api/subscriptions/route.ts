import { NextResponse } from "next/server";
import { subscriptions } from "@/lib/mock-data";

export function GET() {
  return NextResponse.json(subscriptions);
}
