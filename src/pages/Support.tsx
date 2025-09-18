import { Mail, MessageCircle, FileText, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Support = () => {
  return (
    <div className="min-h-screen bg-gradient-primary">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-primary/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-white hover:text-white/80 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            Back to App
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Support Center</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Need help? We're here to assist you with any questions or issues you might have.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Mail className="h-6 w-6" />
                Email Support
              </CardTitle>
              <CardDescription className="text-white/70">
                Get personalized help from our support team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-white/80 mb-4">
                Send us an email and we'll get back to you within 24 hours.
              </p>
              <Button asChild variant="secondary">
                <a href="mailto:personalitytraitsoffice@gmail.com">
                  Contact Support
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <FileText className="h-6 w-6" />
                Documentation
              </CardTitle>
              <CardDescription className="text-white/70">
                Find answers in our comprehensive guides
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-white/80 mb-4">
                Browse our detailed documentation for step-by-step instructions.
              </p>
              <Button asChild variant="secondary">
                <a href="https://docs.lovable.dev/" target="_blank" rel="noopener noreferrer">
                  View Docs
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">How do I transform my notes into different learning styles?</h3>
              <p className="text-white/80">
                Upload your notes using the upload button, then select the learning style transformation you need. 
                Our AI will convert your content to match your preferred learning approach.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">What file formats are supported?</h3>
              <p className="text-white/80">
                We support PDF, DOC, DOCX, TXT, and image files. You can also paste text directly into the interface.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">How do I generate quizzes from my notes?</h3>
              <p className="text-white/80">
                After uploading your notes, click on any note and select "Generate Quiz" to create practice questions 
                based on your content.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Can I download my transformed notes?</h3>
              <p className="text-white/80">
                Yes! All transformed content can be copied or downloaded for offline use.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Support;