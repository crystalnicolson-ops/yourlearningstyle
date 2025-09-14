import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Hero from "@/components/NotesHero";
import NotesUpload from "@/components/NotesUpload";
import NotesList from "@/components/NotesList";

const Index = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { user, session, loading, signOut, subscribed, subscriptionLoading } = useAuth();
  const navigate = useNavigate();

  const handleNoteAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/landing');
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      console.error('Error opening customer portal:', error);
    }
  };

  if (loading || subscriptionLoading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // If no user, redirect to auth
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      <Hero />
      
      {/* User Info Bar */}
      <div className="bg-gradient-card border-b border-white/10 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="text-foreground">
            Welcome back, <span className="font-semibold">{user.email}</span>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleManageSubscription} 
              variant="outline"
              className="text-sm"
            >
              Manage Subscription
            </Button>
            <Button 
              onClick={handleSignOut} 
              variant="outline"
              className="text-sm"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>

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