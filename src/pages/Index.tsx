import { useState } from "react";
import Hero from "@/components/Hero";
import NotesUpload from "@/components/NotesUpload";
import NotesList from "@/components/NotesList";

const Index = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleNoteAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div>
      <Hero />
      
      {/* Notes Section */}
      <div className="bg-background py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Your Learning Notes
              </h2>
              <p className="text-muted-foreground text-lg">
                Upload and organize your study materials and notes
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <NotesUpload onNoteAdded={handleNoteAdded} />
              </div>
              
              <div>
                <NotesList refreshTrigger={refreshTrigger} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;