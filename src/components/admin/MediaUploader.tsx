
import { useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Upload, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface MediaUploaderProps {
  projectId: string; // If 'new', we might need to handle temp uploads or wait for ID. 
                     // Strategy: Upload to temporary folder or require save first?
                     // Easier: Require Project ID. Create project as 'draft' first? 
                     // Or just upload to 'temp/{random}' and move later? 
                     // Simplest for now: Use a fixed folder structure or just allow upload after project creation?
                     // Let's assume projectId is passed, if 'new' we generate a UUID for it in the form state before saving to DB.
  onUploadComplete: (url: string) => void;
  className?: string;
  folder?: 'thumbnail' | 'gallery';
}

export const MediaUploader = ({ projectId, onUploadComplete, className, folder = 'gallery' }: MediaUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      setUploading(true);

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `projects/${projectId}/${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio-media') // Bucket name
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('portfolio-media')
        .getPublicUrl(filePath);

      onUploadComplete(data.publicUrl);
    } catch (error: any) {
      alert('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={cn("relative", className)}>
      <input
        type="file"
        id={`upload-${folder}`}
        className="hidden"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
        ref={fileInputRef}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 disabled:opacity-50 transition-colors shadow-sm"
      >
        {uploading ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <Upload className="w-4 h-4 mr-2" />
        )}
        {uploading ? 'Uploading...' : 'Upload Image'}
      </button>
    </div>
  );
};
