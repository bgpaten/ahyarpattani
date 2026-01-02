import { useSiteSettings } from '../../hooks/useSiteSettings';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Download, MapPin, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const About = () => {
  const { t } = useTranslation();
  useDocumentTitle(t('nav.about'));
  const { settings, loading } = useSiteSettings();

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      {!loading && settings ? (
        <>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">{t('about.title')}</h1>
          
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm mb-12 transition-colors">
            <h2 className="text-2xl font-bold mb-4 dark:text-white">{settings.full_name || 'Me'}</h2>
            <p className="text-xl text-blue-600 dark:text-blue-400 mb-6">{settings.headline || 'Full Stack Developer'}</p>
            
            <div className="space-y-3 text-gray-600 dark:text-gray-300 mb-8">
              {settings.location && (
                <div className="flex items-center gap-2">
                  <MapPin size={18} />
                  <span>{settings.location}</span>
                </div>
              )}
              {settings.email && (
                <div className="flex items-center gap-2">
                  <Mail size={18} />
                  <a href={`mailto:${settings.email}`} className="hover:text-blue-600 dark:hover:text-blue-400">{settings.email}</a>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              {settings.cv_url && (
                <a href={settings.cv_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
                  <Download size={16} className="mr-2" />
                  {t('about.download_cv')}
                </a>
              )}
              {/* Parse JSON social links if complex, simplified here */}
              <div className="flex gap-4 items-center px-2">
                 {/* Icons would go here based on settings.socials */}
              </div>
            </div>
          </div>
        </>
      ) : (
        // Static Fallback if no settings (db empty initially)
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm mb-12">
           <div className="h-40 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl mb-4"></div>
           <p className="text-gray-400 text-center">Loading profile...</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <h3 className="text-xl font-bold mb-4 dark:text-white">{t('about.experience')}</h3>
          <div className="space-y-8 border-l-2 border-gray-100 dark:border-gray-800 pl-8 relative">
            {/* Example Experience Items */}
            <div className="relative">
              <span className="absolute -left-[39px] top-1 w-5 h-5 rounded-full bg-blue-600 border-4 border-white dark:border-gray-950 shadow-sm"></span>
              <h4 className="font-bold text-gray-900 dark:text-white">Senior Frontend Engineer</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">2022 - Present</p>
              <p className="text-gray-600 dark:text-gray-300">Building scalable web applications and design systems.</p>
            </div>
            <div className="relative">
              <span className="absolute -left-[39px] top-1 w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 border-4 border-white dark:border-gray-950"></span>
              <h4 className="font-bold text-gray-900 dark:text-white">Full Stack Developer</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">2019 - 2022</p>
              <p className="text-gray-600 dark:text-gray-300">Developed end-to-end solutions for various clients.</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4 dark:text-white">{t('about.skills')}</h3>
          <div className="flex flex-wrap gap-2">
            {['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'AWS', 'Figma', 'Git'].map(tool => (
              <span key={tool} className="bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg text-gray-700 dark:text-gray-300 font-medium text-sm border border-transparent dark:border-gray-700">
                {tool}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
