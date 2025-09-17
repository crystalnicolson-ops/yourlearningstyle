import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Download } from "lucide-react";
import { Link } from "react-router-dom";

// Import all generated images
import appPreview1 from "@/assets/app-preview-1-real.webp";
import appPreview2 from "@/assets/app-preview-2-real.webp";
import appPreview3 from "@/assets/app-preview-3-real.webp";
import screenshot1 from "@/assets/screenshot-1-real.webp";
import screenshot2 from "@/assets/screenshot-2-real.webp";
import screenshot3 from "@/assets/screenshot-3-real.webp";
import screenshot4 from "@/assets/screenshot-4-real.webp";
import screenshot5 from "@/assets/screenshot-5-real.webp";

const AppStoreImages = () => {
  const appPreviews = [
    { src: appPreview1, title: "App Preview 1 - Note Transformation", filename: "app-preview-1-real.webp" },
    { src: appPreview2, title: "App Preview 2 - AI Enhancement", filename: "app-preview-2-real.webp" },
    { src: appPreview3, title: "App Preview 3 - Audio & Flashcards", filename: "app-preview-3-real.webp" },
  ];

  const screenshots = [
    { src: screenshot1, title: "Screenshot 1 - Enhanced Notes", filename: "screenshot-1-real.webp" },
    { src: screenshot2, title: "Screenshot 2 - Audio Player", filename: "screenshot-2-real.webp" },
    { src: screenshot3, title: "Screenshot 3 - Flashcards", filename: "screenshot-3-real.webp" },
    { src: screenshot4, title: "Screenshot 4 - Upload & Transform", filename: "screenshot-4-real.webp" },
    { src: screenshot5, title: "Screenshot 5 - Notes List", filename: "screenshot-5-real.webp" },
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
            <p><strong>App Preview Images:</strong> Use these 3 marketing images to showcase your app's real functionality - note enhancement, audio generation, and flashcards.</p>
            <p><strong>Screenshots:</strong> Upload all 5 screenshots showing the actual features users will see - enhanced notes, audio player, flashcards, upload interface, and notes list.</p>
            <p><strong>Features Highlighted:</strong> Enhanced notes with AI formatting, audio note generation, interactive flashcards, and note transformation tools.</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AppStoreImages;