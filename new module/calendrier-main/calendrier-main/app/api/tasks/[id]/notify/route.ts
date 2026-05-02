import { NextResponse } from "next/server";
import { getOverview } from "@/lib/calendar/repository";
import { sendReminderEmail } from "@/lib/calendar/email";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const overview = await getOverview();
    const task = overview.tasks.find((t) => t.id === params.id);

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const deadline = new Date(task.deadline).toLocaleString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    const result = await sendReminderEmail({
      user: overview.user,
      task,
      title: `⏰ Tâche arrivée à échéance : ${task.title}`,
      body: `Votre tâche "<strong>${task.title}</strong>" a atteint son échéance le <strong>${deadline}</strong>. Veuillez la compléter ou la mettre à jour dès que possible.`,
      scheduledFor: task.deadline
    });

    return NextResponse.json({
      delivered: result.delivered,
      to: overview.user.email,
      task: { id: task.id, title: task.title, deadline: task.deadline },
      ...("preview" in result ? { preview: result.preview } : {})
    });
  } catch (error) {
    console.error("[notify] Error sending task email:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send email" },
      { status: 500 }
    );
  }
}
