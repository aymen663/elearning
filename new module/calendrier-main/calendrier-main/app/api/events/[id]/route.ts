import { NextResponse } from "next/server";
import { deleteEvent, updateEvent } from "@/lib/calendar/repository";
import type { EventUpdateInput } from "@/lib/calendar/types";

interface Context {
  params: { id: string };
}

export async function PATCH(request: Request, { params }: Context) {
  const payload = (await request.json()) as EventUpdateInput;
  const updated = await updateEvent(params.id, payload);

  if (!updated) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: Context) {
  await deleteEvent(params.id);
  return NextResponse.json({ ok: true });
}
