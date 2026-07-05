import { NextResponse } from "next/server";
import { CARD_TEMPLATES, auditCardTemplates, cardTemplateSummary } from "@/game/cards";

export function GET() {
  return NextResponse.json({
    summary: cardTemplateSummary(),
    audit: auditCardTemplates(CARD_TEMPLATES),
  });
}
