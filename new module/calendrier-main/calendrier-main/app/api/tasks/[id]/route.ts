import { NextResponse } from "next/server";
import { CalendarConflictError, deleteTask, updateTask } from "@/lib/calendar/repository";
import type { TaskUpdateInput } from "@/lib/calendar/types";

interface Context {
  params: { id: string };
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    const payload = (await request.json()) as TaskUpdateInput;
    const task = await updateTask(params.id, payload);

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    if (error instanceof CalendarConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: "Unable to update task right now." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  await deleteTask(params.id);
  return NextResponse.json({ ok: true });
}
