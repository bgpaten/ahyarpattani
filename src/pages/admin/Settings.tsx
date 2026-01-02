
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Loader2 } from 'lucide-react';
import type { Database } from '../../lib/types';

type SiteSettings = Database['public']['Tables']['site_settings']['Insert'];

export const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>({
    full_name: '',
    headline: '',
    location: '',
    email: '',
    phone: '',
    cv_url: '',
    socials: {}
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();
        
      if (data) {
        setSettings(data);
      } else if (error && error.code !== 'PGRST116') { // PGRST116 is no rows
         throw error;
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Let's assume we maintain one row.
      const { data: existing } = await supabase.from('site_settings').select('id').single();
      
      let error;
      if (existing) {
        const { error: err } = await supabase
          .from('site_settings')
          .update(settings as any)
          .eq('id', existing.id);
        error = err;
      } else {
        const { error: err } = await supabase
          .from('site_settings')
          .insert([settings as any]);
        error = err;
      }

      if (error) throw error;
      alert('Settings saved!');
    } catch (error: any) {
      alert('Error saving settings: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save size={18} className="mr-2" />}
          Save Changes
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
              value={settings.full_name || ''}
              onChange={e => setSettings({...settings, full_name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
            <input 
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
              value={settings.headline || ''}
              onChange={e => setSettings({...settings, headline: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input 
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
              value={settings.location || ''}
              onChange={e => setSettings({...settings, location: e.target.value})}
            />
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">CV URL</label>
             <input 
               className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
               value={settings.cv_url || ''}
               onChange={e => setSettings({...settings, cv_url: e.target.value})}
             />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Contact Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                value={settings.email || ''}
                onChange={e => setSettings({...settings, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input 
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                value={settings.phone || ''}
                onChange={e => setSettings({...settings, phone: e.target.value})}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
