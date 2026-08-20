import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(request) {
  const { password } = await request.json();

  const { data } = await supabase
    .from("configuracion")
    .select("admin_password")
    .eq("id", 1)
    .single();

  const stored = data?.admin_password;

  if (!password || !stored || password !== stored) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_session", stored, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}
