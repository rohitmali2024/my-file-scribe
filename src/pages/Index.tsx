import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileText, Upload, Lock, Search } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-primary rounded-2xl">
              <FileText className="h-16 w-16 text-primary-foreground" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Welcome to <span className="text-primary">FileScribe</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your secure document management system. Upload, organize, and access your files anytime, anywhere.
          </p>

          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/auth')}>
              Get Started
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16 text-left">
            <div className="p-6 rounded-lg bg-card border">
              <Upload className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Easy Upload</h3>
              <p className="text-muted-foreground">
                Upload PDFs, Word documents, PowerPoint presentations, and images with ease.
              </p>
            </div>
            
            <div className="p-6 rounded-lg bg-card border">
              <Search className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Quick Search</h3>
              <p className="text-muted-foreground">
                Find your documents instantly with powerful search and sorting capabilities.
              </p>
            </div>
            
            <div className="p-6 rounded-lg bg-card border">
              <Lock className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Secure Storage</h3>
              <p className="text-muted-foreground">
                Your documents are safely stored and accessible only to you.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
