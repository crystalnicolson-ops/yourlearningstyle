import { useState } from "react";
import Hero from "@/components/NotesHero";
import NotesUpload from "@/components/NotesUpload";
import NotesList from "@/components/NotesList";

const Index = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [hasNotes, setHasNotes] = useState(false);

  const handleNoteAdded = () => {
    setRefreshTrigger(prev => prev + 1);
    setHasNotes(true);
  };

  const handleNotesLoaded = (noteCount: number) => {
    setHasNotes(noteCount > 0);
  };

  return (
    <div className="min-h-screen bg-gradient-primary">
      {/* Show hero only when no notes */}
      {!hasNotes && <Hero />}
      
      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="space-y-8">
          {/* Notes List - becomes center focus when notes exist */}
          <div className={hasNotes ? "mt-8" : ""}>
            <NotesList 
              refreshTrigger={refreshTrigger} 
              onNotesLoaded={handleNotesLoaded}
            />
          </div>
          
          {/* Upload always stays at bottom */}
          <NotesUpload onNoteAdded={handleNoteAdded} />
        </div>
      </div>
    </div>
  );
};

export default Index;