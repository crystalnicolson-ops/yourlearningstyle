import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Hero from "@/components/Hero";
import NotesUpload from "@/components/NotesUpload";
import NotesList from "@/components/NotesList";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

const Index = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  const handleNoteAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <Hero />
        
        {/* Auth prompt section */}
        <div className="bg-background py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Ready to Upload Your Notes?
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Sign in or create an account to start uploading and organizing your learning materials
              </p>
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')}
                className="min-w-48"
              >
                <User className="mr-2 h-5 w-5" />
                Sign In / Sign Up
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Hero />
      
      {/* User info bar */}
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Signed in as {user.email}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
      
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