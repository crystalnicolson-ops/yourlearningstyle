import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Download } from "lucide-react";
import { Link } from "react-router-dom";

// Import all generated images
import uploadInterface from "@/assets/upload-clean.webp";
import flashcardQuestion from "@/assets/flashcard-clean.webp";
import enhancedNotes from "@/assets/enhanced-clean.webp";
import audioVoiceSelector from "@/assets/audio-clean.webp";
import landingPage from "@/assets/landing-clean.webp";

const AppStoreImages = () => {
  const screenshots = [
    { src: uploadInterface, title: "File Upload Interface", filename: "upload-clean.webp" },
    { src: flashcardQuestion, title: "Flashcard Study Mode", filename: "flashcard-clean.webp" },
    { src: enhancedNotes, title: "Enhanced Notes with Extra Context", filename: "enhanced-clean.webp" },
    { src: audioVoiceSelector, title: "Audio Player with Voice Selection", filename: "audio-clean.webp" },
    { src: landingPage, title: "Marketing Landing Page", filename: "landing-clean.webp" },
  ];

  const downloadImage = async (src: string, filename: string) => {
    try {
      // For imported images, we need to fetch the blob first
      const response = await fetch(src);
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: try direct download
      const link = document.createElement('a');
      link.href = src;
      link.download = filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to App
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-white">App Store Images</h1>
        </div>

        {/* App Store Screenshots */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">App Store Screenshots</h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {screenshots.map((image, index) => (
              <Card key={index} className="p-4 bg-white/10 backdrop-blur-sm border-white/20">
                <div className="aspect-[9/16] mb-4 overflow-hidden rounded-lg">
                  <img 
                    src={image.src} 
                    alt={image.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-white font-medium mb-2 text-sm">{image.title}</h3>
                <Button
                  onClick={() => downloadImage(image.src, image.filename)}
                  size="sm"
                  variant="secondary"
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </Card>
            ))}
          </div>
        </section>

        {/* Instructions */}
        <Card className="mt-12 p-6 bg-white/10 backdrop-blur-sm border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">How to Use These Images</h3>
          <div className="text-white/90 space-y-2">
            <p><strong>1. File Upload:</strong> Clean interface for uploading study documents (DOCX, TXT, MD, JSON supported).</p>
            <p><strong>2. Flashcards:</strong> Interactive study cards generated from your content with question/answer format.</p>
            <p><strong>3. Enhanced Notes:</strong> Original content plus AI-added context and bullet points for better understanding.</p>
            <p><strong>4. Audio Player:</strong> Text-to-speech with voice selection (Alloy, Echo, Fable, Nova, etc.).</p>
            <p><strong>5. Landing Page:</strong> Marketing page showing VARK learning styles and app features.</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AppStoreImages;