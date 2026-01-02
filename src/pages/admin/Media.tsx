
import { MediaUploader } from '../../components/admin/MediaUploader';

export const Media = () => {
  const handleUpload = (url: string) => {
    // Add to list?
    alert(`File uploaded: ${url}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-medium mb-4">Upload New File</h2>
        <div className="max-w-xs">
           <MediaUploader 
             projectId="global" // specific folder
             folder="gallery"
             onUploadComplete={handleUpload}
             className="w-full h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50"
           />
        </div>
      </div>
      
      <div className="bg-yellow-50 p-4 rounded-lg text-yellow-800 text-sm">
        Note: Full media browsing is not implemented in this version. You can manage project-specific media directly in the Project Edit form.
      </div>
    </div>
  );
};
