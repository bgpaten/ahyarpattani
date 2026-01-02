
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../lib/types';
import { MediaUploader } from '../../components/admin/MediaUploader';
import { ArrowLeft, Save, X, CircleDashed, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';

type Project = Database['public']['Tables']['projects']['Insert'];
type Category = Database['public']['Tables']['categories']['Row'];
type ProjectMedia = Database['public']['Tables']['project_media']['Row'];

export const ProjectForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id && id !== 'new';
  
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // State for form
  const [formData, setFormData] = useState<Project>({
    title: '',
    slug: '',
    summary: '',
    description: '',
    stack: [],
    status: 'draft',
    sort_order: 0,
    thumbnail_url: '',
    featured: false,
    live_url: '',
    repo_url: ''
  });
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [gallery, setGallery] = useState<ProjectMedia[]>([]);
  
  // Stack input state
  const [stackInput, setStackInput] = useState('');

  // Initial ID for new projects to allow uploads before save
  const [tempId] = useState(isEditing ? id : crypto.randomUUID());

  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      fetchProject();
    } else {
      setLoading(false);
    }
  }, [id]); // eslint-disable-line

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*');
    if (data) setCategories(data);
  };

  const fetchProject = async () => {
    try {
      // Get Project
      const { data: project, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id!)
        .single();
        
      if (error) throw error;
      if (project) setFormData(project);

      // Get Categories
      const { data: projCats } = await supabase
        .from('project_categories')
        .select('category_id')
        .eq('project_id', id!);
      
      if (projCats) {
        // cast to any to avoid never issue if inference fails
        setSelectedCategories((projCats as any[]).map(pc => pc.category_id));
      }

      // Get Media
      const { data: media } = await supabase
        .from('project_media')
        .select('*')
        .eq('project_id', id!)
        .order('sort_order', { ascending: true });
        
      if (media) setGallery(media);

    } catch (error) {
      console.error(error);
      alert('Error fetching project');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // 1. Upsert Project
      const projectPayload = {
        ...formData,
        id: tempId, // Use the ID we've been using for uploads
        updated_at: new Date().toISOString(),
      };

      const { error: projectError } = await supabase
        .from('projects')
        .upsert(projectPayload as any);

      if (projectError) throw projectError;

      // 2. Handle Categories (Delete all and re-insert)
      // Note: In a real app with concurrent users, this is risky. Better to diff.
      // But for single admin, it's fine.
      if (isEditing) {
         await supabase.from('project_categories').delete().eq('project_id', tempId!);
      }
      
      if (selectedCategories.length > 0) {
        const catInserts = selectedCategories.map(catId => ({
          project_id: tempId!,
          category_id: catId
        }));
        await supabase.from('project_categories').insert(catInserts as any);
      }
      
      // 3. Handle Gallery
      // We need to sync the gallery state to the DB.
      // Simplest strategy: Delete all existing interactions for this project's media/sort order?
      // Or just Insert new ones?
      // Since we don't track detailed updates safely, let's just Upsert everything or Delete/Insert.
      // Delete/Insert is safest for ensuring order and consistency with state.
      
      await supabase.from('project_media').delete().eq('project_id', tempId!);

      if (gallery.length > 0) {
        const mediaInserts = gallery.map((item, index) => ({
          project_id: tempId!,
          url: item.url,
          type: item.type || 'image',
          caption: item.caption,
          sort_order: index, // Use current array order
          orientation: item.orientation || 'landscape'
        }));
        
        const { error: mediaError } = await supabase.from('project_media').insert(mediaInserts as any);
        if (mediaError) throw mediaError;
      }
      
      navigate('/admin/projects');
      
    } catch (error: any) {
      console.error(error);
      alert('Error saving project: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStackAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && stackInput.trim()) {
      e.preventDefault();
      setFormData(prev => ({
         ...prev,
         stack: [...(prev.stack || []), stackInput.trim()]
      }));
      setStackInput('');
    }
  };

  const removeStack = (item: string) => {
    setFormData(prev => ({
       ...prev,
       stack: (prev.stack || []).filter(s => s !== item)
    }));
  };

  const toggleCategory = (catId: string) => {
    setSelectedCategories(prev => 
      prev.includes(catId) 
        ? prev.filter(id => id !== catId)
        : [...prev, catId]
    );
  };

  // Add new media to DB immediately upon upload
  const onGalleryUpload = async (url: string) => {
    // We can only insert if project exists.
    // So if it's new, we must save the project placeholder first?
    // Or we just store in state and insert on save?
    // Let's store in state and insert on save for "new" flow? 
    // But then we need ID for storage path. We used tempId.
    // So we can insert rows using tempId IF we ensure project is created before media rows.
    // To solve this: Auto-save draft project on first upload?
    // Or just let SQL fail?
    // Safer: Just add to local state, and insert rows during handleSave.
    
    const newMedia: any = {
      project_id: tempId!,
      url,
      type: 'image',
      orientation: 'landscape' // Default
    };
    
    // If we're editing, we can insert directly to be safe?
    // No, let's keep it consistent. Add to state.
    // Wait, 'gallery' state typings have 'id'. New ones won't.
    // Let's fake ID.
    setGallery(prev => [...prev, { ...newMedia, id: `temp-${Date.now()}` }]);
    
    // ACTUALLY: We need to insert these rows on Save.
    // I'll update handleSave to process gallery items without real IDs.
  };

  // Helper to handle gallery save
  // This needs to be called inside handleSave
  /* 
     // Filter items starting with 'temp-' and insert them.
     const newItems = gallery.filter(m => m.id.startsWith('temp-'));
     if (newItems.length) { 
        await supabase.from('project_media').insert(newItems.map(({id, ...rest}) => rest));
     }
  */
  // I will add this logic to handleSave below.

  if (loading) return <div className="p-8"><CircleDashed className="animate-spin text-gray-400" /></div>;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/projects')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
             <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{isEditing ? 'Edit Project' : 'New Project'}</h1>
            <p className="text-gray-500 text-sm">Fill in the details below</p>
          </div>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium shadow-sm"
        >
          {saving ? 'Saving...' : <><Save size={18} className="mr-2" /> Save Project</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 font-mono text-sm"
                value={formData.slug}
                onChange={e => setFormData({ ...formData, slug: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Summary (Short)</label>
              <textarea 
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                value={formData.summary || ''}
                onChange={e => setFormData({ ...formData, summary: e.target.value })}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description (Markdown)</label>
            <textarea 
              rows={15}
              className="w-full px-4 py-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm leading-relaxed"
              value={formData.description || ''}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="# Project Details..."
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-4">Gallery Images</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              {gallery.map((item) => (
                <div key={item.id} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
                  <img src={item.url} alt="" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => setGallery(prev => prev.filter(i => i.id !== item.id))}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              <div className="aspect-square flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 hover:bg-gray-100 transition-colors relative">
                 <MediaUploader 
                   projectId={tempId!}
                   onUploadComplete={onGalleryUpload}
                   className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                 />
                 <Plus className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select 
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.status || 'draft'}
                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="featured"
                checked={formData.featured || false}
                onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="featured" className="text-sm text-gray-700">Featured Project</label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
              <input 
                type="number"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.sort_order || 0}
                onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail</label>
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-3 relative">
              {formData.thumbnail_url ? (
                <img src={formData.thumbnail_url} alt="Thumbnail" className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-gray-400 text-sm">No Image</div>
              )}
            </div>
            <MediaUploader 
               projectId={tempId!}
               folder="thumbnail"
               onUploadComplete={(url) => setFormData(prev => ({ ...prev, thumbnail_url: url }))}
               className="w-full"
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium transition-colors border",
                    selectedCategories.includes(cat.id)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tech Stack</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.stack?.map(tech => (
                <span key={tech} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs flex items-center gap-1">
                  {tech}
                  <button onClick={() => removeStack(tech)} className="hover:text-red-500"><X size={12} /></button>
                </span>
              ))}
            </div>
            <input 
              type="text" 
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              placeholder="Add tech (Press Enter)"
              value={stackInput}
              onChange={e => setStackInput(e.target.value)}
              onKeyDown={handleStackAdd}
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Live URL</label>
               <input 
                 type="url" 
                 className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none text-sm"
                 value={formData.live_url || ''}
                 onChange={e => setFormData({ ...formData, live_url: e.target.value })}
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Repo URL</label>
               <input 
                 type="url" 
                 className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none text-sm"
                 value={formData.repo_url || ''}
                 onChange={e => setFormData({ ...formData, repo_url: e.target.value })}
               />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
