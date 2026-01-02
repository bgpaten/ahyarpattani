
import { Routes, Route } from 'react-router-dom';
import { PublicLayout } from './components/layout/PublicLayout';
import { Home } from './pages/public/Home';
import { Projects } from './pages/public/Projects';
import { ProjectDetail } from './pages/public/ProjectDetail';
import { About } from './pages/public/About';
import { Contact } from './pages/public/Contact';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Login } from './pages/admin/Login';
import { AdminLayout } from './components/layout/AdminLayout';
import { Dashboard } from './pages/admin/Dashboard';
import { ProjectsList } from './pages/admin/ProjectsList';
import { ProjectForm } from './pages/admin/ProjectForm';
import { Categories } from './pages/admin/Categories';
import { Settings } from './pages/admin/Settings';
import { Media } from './pages/admin/Media';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:slug" element={<ProjectDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin">
        <Route path="login" element={<Login />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
             <Route index element={<Dashboard />} />
             <Route path="projects" element={<ProjectsList />} />
             <Route path="projects/new" element={<ProjectForm />} />
             <Route path="projects/:id/edit" element={<ProjectForm />} />
             <Route path="categories" element={<Categories />} />
             <Route path="settings" element={<Settings />} />
             <Route path="media" element={<Media />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
