import { useState } from "react";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Hero from "@/components/NotesHero";
import NotesUpload from "@/components/NotesUpload";
import NotesList from "@/components/NotesList";
import { Link } from "react-router-dom";

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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => window.location.reload()}
            className="text-white hover:bg-white/20 flex items-center gap-2 h-11 px-4 text-base sm:text-sm"
          >
            <Home className="h-5 w-5 sm:h-4 sm:w-4" />
            <span className="font-medium">LearningStyle</span>
          </Button>
          
          <Link to="/landing">
            <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 h-11 px-4 text-base sm:text-sm">
              About
            </Button>
          </Link>
        </div>
      </header>

      {/* Show hero only when no notes */}
      {!hasNotes && <Hero />}
      
      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="space-y-6 sm:space-y-8">
          {/* Notes List - becomes center focus when notes exist */}
          <div className={hasNotes ? "mt-6 sm:mt-8" : ""}>
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