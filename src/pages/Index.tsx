import { useState } from "react";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      {/* Header with Home Button */}
      <header className="sticky top-0 z-50 bg-gradient-primary/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-3">
          <Button
            variant="ghost"
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 text-white hover:bg-white/10"
          >
            <Home className="h-4 w-4" />
            <span className="font-medium">LearningStyle</span>
          </Button>
        </div>
      </header>

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