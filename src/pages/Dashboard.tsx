import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { api, Document } from '@/lib/api';
import { FileText, Upload, Search, Download, Trash2, LogOut, SortAsc } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!api.isAuthenticated()) {
      navigate('/auth');
      return;
    }
    fetchDocuments();
  }, [search, sortBy]);

  const fetchDocuments = async () => {
    try {
      const docs = await api.getDocuments(search, sortBy);
      setDocuments(docs);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch documents. Please check your backend connection.',
        variant: 'destructive',
      });
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png',
      'image/gif',
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload PDF, Word, PowerPoint, or image files.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await api.uploadDocument(file);
      toast({ title: 'Success', description: 'Document uploaded successfully.' });
      fetchDocuments();
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload document. Please check your backend.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteDocument(id);
      toast({ title: 'Success', description: 'Document deleted successfully.' });
      fetchDocuments();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete document.',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = async (id: string, name: string) => {
    try {
      await api.downloadDocument(id, name);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download document.',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = () => {
    api.logout();
    navigate('/auth');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary rounded-lg">
              <FileText className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">FileScribe</h1>
          </div>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={sortBy} onValueChange={(value: 'name' | 'date') => setSortBy(value)}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SortAsc className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Recently Uploaded</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
            </SelectContent>
          </Select>

          <label>
            <input
              type="file"
              className="hidden"
              onChange={handleUpload}
              disabled={isLoading}
              accept=".pdf,.doc,.docx,.ppt,.pptx,image/*"
            />
            <Button disabled={isLoading} asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                {isLoading ? 'Uploading...' : 'Upload'}
              </span>
            </Button>
          </label>
        </div>

        {documents.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No documents yet</h3>
            <p className="text-muted-foreground mb-4">Upload your first document to get started</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <Card key={doc.id} className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{doc.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(doc.size)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleDownload(doc.id, doc.name)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(doc.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
