import { useState } from "react";
import Hero from "@/components/Hero";
import NotesUpload from "@/components/NotesUpload";
import NotesList from "@/components/NotesList";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen">
      <Hero />
      
      {/* Notes Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Learning Notes
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload and organize your study materials to enhance your learning experience
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="upload">Upload Notes</TabsTrigger>
                <TabsTrigger value="notes">My Notes</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upload" className="space-y-4">
                <NotesUpload onUploadSuccess={handleUploadSuccess} />
              </TabsContent>
              
              <TabsContent value="notes" className="space-y-4">
                <NotesList refreshTrigger={refreshTrigger} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Authentication Notice */}
          <Card className="mt-12 p-6 bg-muted/50 border-0 max-w-2xl mx-auto">
            <div className="text-center">
              <h3 className="font-semibold text-foreground mb-2">
                Authentication Required
              </h3>
              <p className="text-sm text-muted-foreground">
                To use the notes feature, you'll need to implement user authentication. 
                The database is ready with secure Row Level Security policies.
              </p>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;
