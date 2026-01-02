
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '../../hooks/useProjects';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { cn } from '../../lib/utils';
import { Folder, Smartphone, Monitor, Terminal, Database } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Projects = () => {
  const { t } = useTranslation();
  useDocumentTitle(t('projects.title'));
  const [filter, setFilter] = useState('all');
  const { projects, loading, error } = useProjects(undefined, filter);

  const categories = [
    { id: 'all', name: t('projects.filter_all'), icon: Folder },
    { id: 'web', name: t('projects.filter_web'), icon: Monitor },
    { id: 'mobile', name: t('projects.filter_mobile'), icon: Smartphone },
    { id: 'backend', name: t('projects.filter_backend'), icon: Database },
    { id: 'devops', name: t('projects.filter_devops'), icon: Terminal },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">{t('projects.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {t('projects.subtitle')}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={cn(
                "flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                filter === cat.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
              )}
            >
              <Icon size={16} />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-gray-100 dark:bg-gray-800 h-96 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-12">
          Failed to load projects. Please try again later.
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
          <Folder className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('projects.no_projects')}</h3>
          <p className="text-gray-500 dark:text-gray-400">{t('projects.try_filter')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => {
            return (
              <Link 
                key={project.id} 
                to={`/projects/${project.slug}`}
                className="group block bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800 flex flex-col h-full"
              >
                {/* Thumbnail Area */}
                <div className={cn(
                  "aspect-[4/3] relative overflow-hidden",
                  "bg-gray-50 dark:bg-gray-800"
                )}>
                     {project.thumbnail_url ? (
                        <img 
                          src={project.thumbnail_url || undefined} 
                          alt={project.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-800">
                          <Monitor size={48} className="opacity-20" />
                        </div>
                      )}
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 dark:group-hover:bg-white/5 transition-colors duration-300" />
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex gap-2 mb-3 flex-wrap">
                    {project.categories.slice(0, 2).map((cat: any) => (
                      <span key={cat.id} className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 capitalize">
                        {cat.name}
                      </span>
                    ))}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {project.title}
                  </h3>
                  
                  <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4">
                    {project.summary}
                  </p>
                  
                  <div className="mt-auto pt-4 border-t border-gray-50 dark:border-gray-800 flex gap-2 flex-wrap">
                    {project.stack?.slice(0, 4).map((tech) => (
                      <span key={tech} className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
