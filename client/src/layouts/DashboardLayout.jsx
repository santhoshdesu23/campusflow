import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { isAdmin } = useAuth();

  // Dynamically compute clickable breadcrumbs and page title
  const getPageInfo = () => {
    const path = location.pathname;
    if (path === '/student') return { title: 'Dashboard Overview', crumbs: [{ label: 'Student', path: '/student' }, { label: 'Overview' }] };
    if (path === '/student/request') return { title: 'New Document Request', crumbs: [{ label: 'Student', path: '/student' }, { label: 'Requests', path: '/student/requests' }, { label: 'New' }] };
    if (path === '/student/requests') return { title: 'My Document Requests', crumbs: [{ label: 'Student', path: '/student' }, { label: 'Requests' }] };
    if (path.startsWith('/student/requests/')) return { title: 'Request Tracking', crumbs: [{ label: 'Student', path: '/student' }, { label: 'Requests', path: '/student/requests' }, { label: 'Detail' }] };
    if (path === '/student/certificates') return { title: 'Issued Certificates', crumbs: [{ label: 'Student', path: '/student' }, { label: 'Certificates' }] };
    if (path.startsWith('/student/certificate/')) return { title: 'Official Certificate', crumbs: [{ label: 'Student', path: '/student' }, { label: 'Certificates', path: '/student/certificates' }, { label: 'View' }] };

    if (path === '/admin') return { title: 'Operations Dashboard', crumbs: [{ label: 'Admin', path: '/admin' }, { label: 'Overview' }] };
    if (path === '/admin/requests') return { title: 'Institutional Request Queue', crumbs: [{ label: 'Admin', path: '/admin' }, { label: 'Requests' }] };
    if (path.startsWith('/admin/requests/')) return { title: 'Exception Triage & Decision', crumbs: [{ label: 'Admin', path: '/admin' }, { label: 'Requests', path: '/admin/requests' }, { label: 'Decision Console' }] };
    if (path === '/admin/certificates') return { title: 'University Certificates Registry', crumbs: [{ label: 'Admin', path: '/admin' }, { label: 'Certificates' }] };
    if (path === '/admin/audit' || path === '/admin/audit-logs') return { title: 'Institutional Audit Trail', crumbs: [{ label: 'Admin', path: '/admin' }, { label: 'Audit Logs' }] };

    return { title: 'CampusFlow AI', crumbs: [{ label: 'App' }] };
  };

  const { title, crumbs } = getPageInfo();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          title={title}
          breadcrumbs={crumbs}
        />

        {/* Page View Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
