
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/types';

type Project = Database['public']['Tables']['projects']['Row'] & {
  categories: Database['public']['Tables']['categories']['Row'][];
};

export const useProjects = (limit?: number, filterType?: string) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        let query = supabase
          .from('projects')
          .select(`
            *,
            project_categories (
              categories (*)
            )
          `)
          .eq('status', 'published')
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: false });

        if (limit) {
          query = query.limit(limit);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Transform data to flatten categories
        const transformedProjects = (data || []).map((p: any) => ({
          ...p,
          categories: p.project_categories?.map((pc: any) => pc.categories) || [],
        }));

        if (filterType && filterType !== 'all') {
             const filtered = transformedProjects.filter((p: Project) => 
               p.categories.some(c => c.type === filterType || c.slug === filterType)
             );
             setProjects(filtered);
        } else {
             setProjects(transformedProjects);
        }

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [limit, filterType]);

  return { projects, loading, error };
};
