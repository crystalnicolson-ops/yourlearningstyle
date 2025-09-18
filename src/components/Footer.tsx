import { Mail, ExternalLink } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-background border-t border-border mt-auto py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-muted-foreground text-sm">
            © 2024 Learning Style. All rights reserved.
          </div>
          
          <div className="flex items-center gap-6">
            <a 
              href="mailto:support@learningstyle.app"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              <Mail className="h-4 w-4" />
              Support
            </a>
            
            <a 
              href="https://docs.lovable.dev/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              <ExternalLink className="h-4 w-4" />
              Help Center
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};