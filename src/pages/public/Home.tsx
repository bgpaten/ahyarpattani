
import { ArrowRight, Download, Github, Linkedin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { useProjects } from '../../hooks/useProjects';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { cn, getProjectDisplayMode } from '../../lib/utils';

export const Home = () => {
  const { t } = useTranslation();
  useDocumentTitle(t('nav.home'));
  const { projects, loading, error } = useProjects(3); // Fetch top 3 projects

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-white dark:bg-gray-900 pt-20 pb-20 md:pt-32 md:pb-32 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
            <Trans 
              i18nKey="hero.title" 
              components={{ 
                br: <br className="hidden md:block" />,
                highlight: <span className="text-blue-600 dark:text-blue-400" />
              }}
            />
          </h1>
          <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t('hero.subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/projects"
              className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors md:text-lg"
            >
              {t('hero.cta_projects')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <a 
              href="https://jacnqhhwehmlrtbmjozs.supabase.co/storage/v1/object/public/portfolio-media/cv.pdf" // Placeholder CV link
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors md:text-lg"
            >
              {t('hero.cta_cv')}
              <Download className="ml-2 h-5 w-5" />
            </a>
          </div>

          <div className="mt-12 flex justify-center gap-6">
            <a href="https://github.com/bgpaten" target='_blank' rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
               <Github className="h-6 w-6" />
            </a>
            <a href="https://www.linkedin.com/in/kukuh-ahyar-pattani-24879728a/" target='_blank' rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
               <Linkedin className="h-6 w-6" />
            </a>
            <a href="mailto:ahyarpattani@gmail.com" className="p-2 text-gray-400 hover:text-red-500 transition-colors">
               <Mail className="h-6 w-6" />
            </a>
          </div>
        </div>
      </section>

      {/* Skills Summary */}
      <section className="bg-gray-50 dark:bg-gray-950 py-16 px-4 transition-colors duration-300">
        <div className="max-w-7xl mx-auto text-center">
           <h2 className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-4">{t('home.tech_stack')}</h2>
           <div className="flex flex-wrap justify-center gap-4 text-gray-600 dark:text-gray-300 font-medium">
             {['React', 'TypeScript', 'Node.js', 'Next.js', 'TailwindCSS', 'Supabase', 'PostgreSQL', 'Docker'].map(skill => (
               <span key={skill} className="px-4 py-2 bg-white dark:bg-gray-900 rounded-full shadow-sm border border-gray-100 dark:border-gray-800">
                 {skill}
               </span>
             ))}
           </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('home.featured_projects')}</h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">{t('home.latest_works')}</p>
          </div>
          <Link to="/projects" className="hidden md:flex items-center text-blue-600 dark:text-blue-400 font-medium hover:underline">
            {t('home.view_all')} <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        {loading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {[1,2,3].map(i => (
               <div key={i} className="bg-gray-100 dark:bg-gray-800 h-96 rounded-xl animate-pulse"></div>
             ))}
           </div>
        ) : error ? (
           <div className="text-center text-red-500">Failed to load projects</div>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {projects.map((project) => {
               const mode = getProjectDisplayMode(project.categories);
               
               return (
                 <Link 
                   key={project.id} 
                   to={`/projects/${project.slug}`}
                   className="group block relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800 flex flex-col h-full"
                 >
                   <div className={cn(
                     "aspect-[4/3] overflow-hidden relative",
                     mode === 'mobile' ? "bg-gray-900" : "bg-gray-50 dark:bg-gray-800"
                   )}>
                     {project.thumbnail_url ? (
                       <img 
                         src={project.thumbnail_url} 
                         alt={project.title} 
                         className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                       />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center text-gray-400">
                         No Image
                       </div>
                     )}
                   </div>
                   
                   <div className="p-6 flex-1 flex flex-col">
                     <div className="flex gap-2 mb-3 flex-wrap">
                       {project.categories.slice(0, 2).map((cat: any) => (
                         <span key={cat.id} className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                           {cat.name}
                         </span>
                       ))}
                     </div>
                     <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                       {project.title}
                     </h3>
                     <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4 flex-1">
                       {project.summary}
                     </p>
                     
                     <div className="flex gap-2 mt-auto pt-4 border-t border-gray-50 dark:border-gray-800">
                       {project.stack?.slice(0, 3).map((tech) => (
                         <span key={tech} className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                           {tech}
                         </span>
                       ))}
                       {project.stack && project.stack.length > 3 && (
                         <span className="text-xs text-gray-500 dark:text-gray-400 px-1 py-1">+{(project.stack.length - 3)}</span>
                       )}
                     </div>
                   </div>
                 </Link>
               );
             })}
           </div>
        )}

        <div className="mt-12 text-center md:hidden">
          <Link to="/projects" className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium hover:underline">
            {t('home.view_all')} <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};
