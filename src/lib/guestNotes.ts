export type GuestNote = {
  id: string;
  title: string;
  content: string | null;
  file_data_url: string | null;
  file_name: string | null;
  file_type: string | null;
  created_at: string;
  updated_at: string;
};

const STORAGE_KEY = "guest_notes_v1";

export const getGuestNotes = (): GuestNote[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const addGuestNote = (note: GuestNote) => {
  const notes = getGuestNotes();
  notes.unshift(note);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
};

export const deleteGuestNote = (id: string) => {
  const notes = getGuestNotes().filter((n) => n.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
};

export const updateGuestNote = (id: string, updates: Partial<GuestNote>) => {
  const notes = getGuestNotes();
  const idx = notes.findIndex((n) => n.id === id);
  if (idx !== -1) {
    notes[idx] = { ...notes[idx], ...updates, updated_at: new Date().toISOString() } as GuestNote;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }
};
