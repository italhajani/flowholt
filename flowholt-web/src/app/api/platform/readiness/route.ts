import { NextResponse } from "next/server";

import { assessPlatformReadiness } from "@/lib/platform/readiness";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const report = await assessPlatformReadiness({
    supabase,
    includeAuthCheck: false,
  });

  return NextResponse.json(report);
}
