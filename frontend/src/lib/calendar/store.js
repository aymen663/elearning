import { create } from 'zustand';
import { format } from 'date-fns';

export function createEmptyEventDraft() {
  return {
    title: "",
    date: format(new Date(), "yyyy-MM-dd"),
    startTime: "10:00",
    endTime: "11:00",
    type: "course",
    color: "#75C46B",
    description: "",
    location: "",
    reminderMinutes: 60,
  };
}

export function createEmptyTaskDraft() {
  return {
    title: "",
    date: format(new Date(), "yyyy-MM-dd"),
    startTime: "17:00",
    endTime: "18:00",
    priority: "medium",
    details: "",
    linkToCalendar: false,
  };
}

export const useCalendarStore = create((set) => ({
  overview: null,
  filter: "all",
  search: "",
  eventDraft: createEmptyEventDraft(),
  taskDraft: createEmptyTaskDraft(),
  selectedEvent: null,
  selectedTaskId: null,

  setOverview: (overview) => set({ overview }),
  setFilter: (filter) => set({ filter }),
  setSearch: (search) => set({ search }),

  updateEventDraft: (key, value) =>
    set((state) => ({
      eventDraft: { ...state.eventDraft, [key]: value },
    })),

  updateTaskDraft: (key, value) =>
    set((state) => ({
      taskDraft: { ...state.taskDraft, [key]: value },
    })),

  setEventDraft: (draft) => set({ eventDraft: draft }),
  setTaskDraft: (draft) => set({ taskDraft: draft }),
  setSelectedEvent: (event) => set({ selectedEvent: event }),
  setSelectedTaskId: (id) => set({ selectedTaskId: id }),

  resetEventForm: () =>
    set({
      eventDraft: createEmptyEventDraft(),
      selectedEvent: null,
    }),
}));
