import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(request) {
  const { currentPassword, newPassword } = await request.json();

  const { data } = await supabase
    .from("configuracion")
    .select("admin_password")
    .eq("id", 1)
    .single();

  const stored = data?.admin_password;

  if (!stored || currentPassword !== stored) {
    return NextResponse.json({ ok: false, error: "La contraseña actual no es correcta." }, { status: 401 });
  }

  if (!newPassword || newPassword.length < 4) {
    return NextResponse.json({ ok: false, error: "La nueva contraseña es muy corta." }, { status: 400 });
  }

  const { error } = await supabase
    .from("configuracion")
    .update({ admin_password: newPassword })
    .eq("id", 1);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_session", newPassword, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}
