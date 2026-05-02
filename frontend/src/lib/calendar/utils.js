import {
  addDays,
  addMinutes,
  differenceInMinutes,
  endOfWeek,
  format,
  isSameDay,
  parseISO,
  set,
  startOfWeek,
} from "date-fns";

export function createId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function startOfCalendarWeek(date) {
  return startOfWeek(date, { weekStartsOn: 1 });
}

export function endOfCalendarWeek(date) {
  return endOfWeek(date, { weekStartsOn: 1 });
}

export function getWeekDays(anchorDate) {
  const start = startOfCalendarWeek(anchorDate);
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

export function combineDateTime(date, time) {
  const [hours, minutes] = time.split(":").map(Number);
  return set(new Date(`${date}T00:00:00`), {
    hours,
    minutes,
    seconds: 0,
    milliseconds: 0,
  }).toISOString();
}

export function timeSlotsOverlap(startA, endA, startB, endB) {
  return parseISO(startA) < parseISO(endB) && parseISO(startB) < parseISO(endA);
}

export function findConflictingTask(tasks, startAt, endAt, excludeTaskId) {
  return (
    tasks.find(
      (task) =>
        task.id !== excludeTaskId &&
        timeSlotsOverlap(task.startAt, task.endAt, startAt, endAt)
    ) ?? null
  );
}

export function splitIsoToForm(isoString) {
  const date = parseISO(isoString);
  return {
    date: format(date, "yyyy-MM-dd"),
    time: format(date, "HH:mm"),
  };
}

export function formatTimeRange(startAt, endAt) {
  return `${format(parseISO(startAt), "HH:mm")} - ${format(parseISO(endAt), "HH:mm")}`;
}

export function minutesSinceDayStart(isoString) {
  const value = parseISO(isoString);
  return value.getHours() * 60 + value.getMinutes();
}

export function eventLayout(event, dayStartHour = 7) {
  const startMinute = minutesSinceDayStart(event.startAt) - dayStartHour * 60;
  const duration = Math.max(differenceInMinutes(parseISO(event.endAt), parseISO(event.startAt)), 30);
  return {
    top: `${(startMinute / 30) * 64}px`,
    height: `${(duration / 30) * 64 - 8}px`,
  };
}

export function groupEventsByDay(events, days) {
  return days.map((day) =>
    events.filter((event) => isSameDay(parseISO(event.startAt), day))
  );
}

export function nextReminderAt(event) {
  return addMinutes(parseISO(event.startAt), -event.reminderMinutes).toISOString();
}

export function buildTaskLinkedEvent(task) {
  const deadline = parseISO(task.deadline);
  return {
    title: task.title,
    description: task.details ?? "Task synced from the todo list",
    type: "task",
    color: "#7CA6FF",
    date: format(deadline, "yyyy-MM-dd"),
    startTime: "17:00",
    endTime: "18:00",
    location: "Linked from Todo",
    reminderMinutes: 120,
  };
}

export function typeLabel(type) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function isEventUpcoming(event, hours = 48) {
  const now = new Date();
  const threshold = addMinutes(now, hours * 60);
  const start = parseISO(event.startAt);
  return start >= now && start <= threshold;
}
