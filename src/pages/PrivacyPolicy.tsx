import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border p-4">
        <div className="container mx-auto flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Privacy Policy</h1>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h1>Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2>Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as when you create an account, 
            use our services, or contact us for support.
          </p>
          
          <h3>Personal Information</h3>
          <ul>
            <li>Email address</li>
            <li>Display name</li>
            <li>Learning materials you upload</li>
            <li>Usage data and preferences</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide and improve our learning transformation services</li>
            <li>Process and transform your uploaded learning materials</li>
            <li>Send you important service updates</li>
            <li>Respond to your questions and provide customer support</li>
          </ul>

          <h2>Information Sharing</h2>
          <p>
            We do not sell, trade, or otherwise transfer your personal information to third parties 
            without your consent, except as described in this policy.
          </p>

          <h2>Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information against 
            unauthorized access, alteration, disclosure, or destruction.
          </p>

          <h2>Data Retention</h2>
          <p>
            We retain your information for as long as your account is active or as needed to 
            provide you services. You may delete your account and data at any time.
          </p>

          <h2>Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Delete your information</li>
            <li>Export your data</li>
          </ul>

          <h2>Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at{" "}
            <a href="mailto:personalitytraitsoffice@gmail.com" className="text-primary hover:underline">
              personalitytraitsoffice@gmail.com
            </a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;