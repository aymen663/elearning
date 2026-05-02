import { Calendar } from "@/components/calendar/Calendar";
import { TodoList } from "@/components/calendar/TodoList";

export default function CalendarPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto grid max-w-[1500px] gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section>
          <Calendar />
        </section>
        <section>
          <TodoList />
        </section>
      </div>
    </main>
  );
}
