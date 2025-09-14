import { useState } from "react";
import Hero from "@/components/NotesHero";
import NotesUpload from "@/components/NotesUpload";
import NotesList from "@/components/NotesList";

const Index = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleNoteAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-primary">
      <Hero />
      
      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="space-y-8">
          <NotesUpload onNoteAdded={handleNoteAdded} />
          <NotesList refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  );
};

export default Index;