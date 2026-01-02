
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../lib/types';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { getProjectDisplayMode, formatDate, cn } from '../../lib/utils';
import { ArrowLeft, ExternalLink, Github, Calendar, Layers } from 'lucide-react';

type ProjectDetail = Database['public']['Tables']['projects']['Row'] & {
  categories: Database['public']['Tables']['categories']['Row'][];
  media: Database['public']['Tables']['project_media']['Row'][];
};

export const ProjectDetail = () => {
  const { slug } = useParams();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [otherProjects, setOtherProjects] = useState<any[]>([]);
  useDocumentTitle(project?.title || 'Project Detail');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!slug) return;
      try {
        const { data, error } = await supabase
          .from('projects')
          .select(`
            *,
            project_categories (categories (*)),
            project_media (*)
          `)
          .eq('slug', slug)
          .single();

        if (error) throw error;
        
        // Explicit cast to avoid 'never' inference
        const typedData = data as any;

        // Transform
        const transformed: ProjectDetail = {
          ...typedData,
          categories: typedData.project_categories?.map((pc: any) => pc.categories) || [],
          media: typedData.project_media || [],
        };

        setProject(transformed);

        // Fetch other projects
        const { data: others } = await supabase
          .from('projects')
          .select('id, title, slug, thumbnail_url, summary')
          .neq('id', transformed.id)
          .eq('status', 'published')
          .limit(3);
        
        if (others) setOtherProjects(others);
        
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchProject();
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  if (error || !project) return <div className="min-h-screen flex items-center justify-center text-red-500">Project not found</div>;

  const mode = getProjectDisplayMode(project.categories);

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen pb-20">
      {/* Header / Breadcrumb */}
      <div className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-8">
           <Link to="/projects" className="inline-flex items-center text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 mb-4 transition-colors">
             <ArrowLeft size={16} className="mr-2" />
             Back to Projects
           </Link>
           <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">{project.title}</h1>
           <div className="flex flex-wrap gap-4 items-center text-gray-500 dark:text-gray-400 text-sm">
             <div className="flex items-center gap-1">
               <Calendar size={14} />
               <span>{formatDate(project.created_at)}</span>
             </div>
             <div className="flex gap-2">
               {project.categories.map(c => (
                 <span key={c.id} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-2 py-0.5 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300">
                   {c.name}
                 </span>
               ))}
             </div>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Content (Changes based on Mode) */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Adaptive Media Display */}
          <div className={cn(
            "rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm",
            mode === 'mobile' ? "bg-gray-50 dark:bg-gray-800 p-8 flex justify-center" : "bg-gray-100 dark:bg-gray-800"
          )}>
            {mode === 'mobile' ? (
              // Mobile Mockup
              <div className="flex gap-8 overflow-x-auto pb-4 px-4 snap-x">
                 {[project.thumbnail_url, ...project.media.map(m => m.url)].filter(Boolean).map((url, idx) => (
                   <div key={idx} className="flex-none w-[280px] snap-center">
                     <div className="relative aspect-[9/19] bg-black rounded-[2.5rem] border-8 border-gray-800 shadow-2xl overflow-hidden ring-1 ring-white/10">
                       <img src={url!} alt={`Screen ${idx}`} className="w-full h-full object-cover" />
                     </div>
                   </div>
                 ))}
              </div>
            ) : mode === 'web' ? (
              // Web Browser Mockup
              <div className="w-full">
                 <div className="bg-gray-800 rounded-t-xl p-3 flex gap-2 items-center">
                   <div className="flex gap-1.5 ">
                     <div className="w-3 h-3 rounded-full bg-red-400"></div>
                     <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                     <div className="w-3 h-3 rounded-full bg-green-400"></div>
                   </div>
                   <div className="ml-4 bg-gray-700/50 rounded flex-1 h-6 mx-auto max-w-xl"></div>
                 </div>
                 <div className="bg-white aspect-video relative">
                   {project.thumbnail_url && (
                     <img src={project.thumbnail_url} alt={project.title} className="w-full h-full object-cover" />
                   )}
                 </div>
              </div>
            ) : (
              // Default / Backend Card
              <div className="aspect-video relative bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-8">
                 {project.thumbnail_url ? (
                   <img src={project.thumbnail_url} alt={project.title} className="w-full h-full object-cover opacity-90" />
                 ) : (
                   <div className="text-center text-white/50">
                     <Layers size={64} className="mx-auto mb-4" />
                     <p>No Preview Available</p>
                   </div>
                 )}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About the Project</h2>
            <div dangerouslySetInnerHTML={{ __html: project.description || project.summary || '' }} /> 
            {/* Note: In prod, use a markdown parser. Using simple HTML injection for now assuming content is trusted or simple */}
          </div>


          {/* Gallery */}
          {project.media && project.media.length > 0 && (
            <section className="border-t border-gray-100 dark:border-gray-800 pt-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Project Gallery</h2>
              <div className="columns-1 md:columns-2 gap-8">
                {project.media.map((item: any) => (
                  <div key={item.id} className="relative break-inside-avoid mb-8 rounded-xl overflow-hidden shadow-sm bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                     <img src={item.url} alt={item.caption || 'Gallery Image'} className="w-full h-auto object-cover" />
                     {item.caption && (
                       <div className="absolute bottom-0 w-full bg-black/60 backdrop-blur-sm p-3 text-white text-sm">
                         {item.caption}
                       </div>
                     )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            {project.live_url && (
              <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                <ExternalLink size={18} className="mr-2" />
                Visit Live Site
              </a>
            )}
            {project.repo_url && (
              <a href={project.repo_url} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center px-6 py-3 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium">
                <Github size={18} className="mr-2" />
                View Source Code
              </a>
            )}
          </div>

          {/* Stack */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Layers size={18} className="mr-2" />
              Technologies Used
            </h3>
            <div className="flex flex-wrap gap-2">
              {project.stack?.map(tech => (
                <span key={tech} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1 rounded-md text-sm text-gray-600 dark:text-gray-300">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Other Projects */}
          {otherProjects.length > 0 && (
             <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
               <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Other Projects</h3>
               <div className="space-y-4">
                 {otherProjects.map(p => (
                   <Link key={p.id} to={`/projects/${p.slug}`} className="block group">
                     <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-2">
                       {p.thumbnail_url ? (
                         <img src={p.thumbnail_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-gray-400">
                           <Layers size={24} />
                         </div>
                       )}
                     </div>
                     <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">{p.title}</h4>
                     <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">{p.summary}</p>
                   </Link>
                 ))}
               </div>
               <Link to="/projects" className="block mt-6 text-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                 View All Projects
               </Link>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
