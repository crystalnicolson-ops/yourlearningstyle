import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Download } from "lucide-react";
import { Link } from "react-router-dom";

// Import all generated images
import appPreview1 from "@/assets/preview-history-1.webp";
import appPreview2 from "@/assets/preview-history-2.webp";
import appPreview3 from "@/assets/preview-history-3.webp";
import screenshot1 from "@/assets/screenshot-main-real.webp";
import screenshot2 from "@/assets/screenshot-upload.webp";
import screenshot3 from "@/assets/screenshot-flashcard-real.webp";
import screenshot4 from "@/assets/screenshot-audio-real.webp";
import screenshot5 from "@/assets/screenshot-notes-real.webp";

const AppStoreImages = () => {
  const appPreviews = [
    { src: appPreview1, title: "Turn Study Notes into Flashcards", filename: "preview-history-1.webp" },
    { src: appPreview2, title: "Listen to Your Study Notes", filename: "preview-history-2.webp" },
    { src: appPreview3, title: "Upload Documents • Create Study Tools", filename: "preview-history-3.webp" },
  ];

  const screenshots = [
    { src: screenshot1, title: "Main App Screen", filename: "screenshot-main-real.webp" },
    { src: screenshot2, title: "File Upload Interface", filename: "screenshot-upload.webp" },
    { src: screenshot3, title: "Flashcard Study Mode", filename: "screenshot-flashcard-real.webp" },
    { src: screenshot4, title: "Audio Player", filename: "screenshot-audio-real.webp" },
    { src: screenshot5, title: "Notes Library", filename: "screenshot-notes-real.webp" },
  ];

  const downloadImage = (src: string, filename: string) => {
    const link = document.createElement('a');
    link.href = src;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

        {/* App Preview Images */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">App Preview Images (Marketing)</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {appPreviews.map((image, index) => (
              <Card key={index} className="p-4 bg-white/10 backdrop-blur-sm border-white/20">
                <div className="aspect-[9/16] mb-4 overflow-hidden rounded-lg">
                  <img 
                    src={image.src} 
                    alt={image.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-white font-medium mb-2">{image.title}</h3>
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

        {/* Screenshots */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">App Screenshots (Interface)</h2>
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
            <p><strong>App Preview Images:</strong> Marketing images showing real study content - your actual history notes about Jamestown, Plymouth Colony, and colonial settlements.</p>
            <p><strong>Screenshots:</strong> Real interface screenshots showing your uploaded "History Study Guide" document being turned into flashcards and audio.</p>
            <p><strong>What Users See:</strong> Upload study documents → Create flashcards from real content → Generate audio from notes → Study effectively.</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AppStoreImages;