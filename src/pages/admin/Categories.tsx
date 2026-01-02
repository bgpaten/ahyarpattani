
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../lib/types';
import { Edit2, Plus, Trash2, X, Save } from 'lucide-react';

type Category = Database['public']['Tables']['categories']['Row'];

export const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; slug: string; type: string }>({ name: '', slug: '', type: 'other' });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
    setLoading(false);
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditForm({ name: cat.name, slug: cat.slug, type: cat.type || 'other' });
    setIsCreating(false);
  };

  const startCreate = () => {
    setEditingId(null);
    setEditForm({ name: '', slug: '', type: 'other' });
    setIsCreating(true);
  };

  const handleSave = async () => {
    try {
      if (isCreating) {
        const { data, error } = await supabase.from('categories').insert([editForm as any] as any).select().single();
        if (error) throw error;
        setCategories([...categories, data]);
        setIsCreating(false);
      } else if (editingId) {
        const { error } = await supabase.from('categories').update(editForm as any).eq('id', editingId);
        if (error) throw error;
        setCategories(categories.map(c => c.id === editingId ? { ...c, ...editForm } as Category : c));
        setEditingId(null);
      }
    } catch (error: any) {
      alert('Error saving category: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? This will remove the category from all projects.')) return;
    try {
      await supabase.from('categories').delete().eq('id', id);
      setCategories(categories.filter(c => c.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button onClick={startCreate} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus size={18} className="mr-2" /> Add Category
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isCreating && (
          <div className="p-4 bg-blue-50 border-b border-blue-100 flex items-center gap-4">
             <input 
               placeholder="Name" 
               className="px-3 py-2 rounded border border-gray-300" 
               value={editForm.name} 
               onChange={e => setEditForm({ ...editForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
             />
             <input 
               placeholder="Slug" 
               className="px-3 py-2 rounded border border-gray-300 bg-white" 
               value={editForm.slug} 
               onChange={e => setEditForm({ ...editForm, slug: e.target.value })}
             />
             <select 
               className="px-3 py-2 rounded border border-gray-300 bg-white"
               value={editForm.type}
               onChange={e => setEditForm({ ...editForm, type: e.target.value })}
             >
               <option value="web">Web</option>
               <option value="mobile">Mobile</option>
               <option value="backend">Backend</option>
               <option value="devops">DevOps</option>
               <option value="other">Other</option>
             </select>
             <button onClick={handleSave} className="p-2 text-blue-600 hover:bg-blue-100 rounded"><Save size={18}/></button>
             <button onClick={() => setIsCreating(false)} className="p-2 text-gray-500 hover:bg-gray-200 rounded"><X size={18}/></button>
          </div>
        )}

        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Slug</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
             {loading ? <tr><td colSpan={4} className="p-6 text-center">Loading...</td></tr> : categories.map(cat => (
               <tr key={cat.id}>
                 {editingId === cat.id ? (
                   <>
                     <td className="px-6 py-4"><input className="w-full px-2 py-1 border rounded" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} /></td>
                     <td className="px-6 py-4"><input className="w-full px-2 py-1 border rounded" value={editForm.slug} onChange={e => setEditForm({...editForm, slug: e.target.value})} /></td>
                     <td className="px-6 py-4">
                       <select className="w-full px-2 py-1 border rounded" value={editForm.type} onChange={e => setEditForm({...editForm, type: e.target.value})}>
                         <option value="web">Web</option>
                         <option value="mobile">Mobile</option>
                         <option value="backend">Backend</option>
                         <option value="devops">DevOps</option>
                         <option value="other">Other</option>
                       </select>
                     </td>
                     <td className="px-6 py-4 text-right space-x-2">
                       <button onClick={handleSave} className="text-green-600"><Save size={18}/></button>
                       <button onClick={() => setEditingId(null)} className="text-gray-500"><X size={18}/></button>
                     </td>
                   </>
                 ) : (
                   <>
                     <td className="px-6 py-4 font-medium">{cat.name}</td>
                     <td className="px-6 py-4 text-gray-500">{cat.slug}</td>
                     <td className="px-6 py-4"><span className="px-2 py-1 rounded bg-gray-100 text-xs">{cat.type}</span></td>
                     <td className="px-6 py-4 text-right space-x-2">
                       <button onClick={() => startEdit(cat)} className="text-blue-600 hover:text-blue-800"><Edit2 size={18}/></button>
                       <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:text-red-800"><Trash2 size={18}/></button>
                     </td>
                   </>
                 )}
               </tr>
             ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
