
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../lib/types';
import { Edit2, Eye, Plus, Trash2, Search } from 'lucide-react';
import { formatDate } from '../../lib/utils';

type Project = Database['public']['Tables']['projects']['Row'];

export const ProjectsList = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
     if (!confirm('Are you sure you want to delete this project?')) return;
     
     try {
       const { error } = await supabase
         .from('projects')
         .delete()
         .eq('id', id);
         
       if (error) throw error;
       setProjects(projects.filter(p => p.id !== id));
     } catch (error) {
       console.error('Error deleting project:', error);
       alert('Failed to delete project');
     }
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500">Manage your portfolio projects</p>
        </div>
        <Link
          to="/admin/projects/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus size={18} className="mr-2" />
          Add Project
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search projects..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Created</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                   <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : filteredProjects.length === 0 ? (
                <tr>
                   <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No projects found</td>
                </tr>
              ) : (
                filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{project.title}</div>
                      <div className="text-gray-500 text-xs text-blue-600">/{project.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        project.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {formatDate(project.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                       <Link 
                         to={`/projects/${project.slug}`} 
                         target="_blank"
                         className="text-gray-400 hover:text-gray-600 inline-block"
                         title="View Live"
                       >
                         <Eye size={18} />
                       </Link>
                       <Link 
                         to={`/admin/projects/${project.id}/edit`} 
                         className="text-blue-600 hover:text-blue-800 inline-block"
                         title="Edit"
                       >
                         <Edit2 size={18} />
                       </Link>
                       <button 
                         onClick={() => handleDelete(project.id)}
                         className="text-red-600 hover:text-red-800 inline-block"
                         title="Delete"
                       >
                         <Trash2 size={18} />
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
