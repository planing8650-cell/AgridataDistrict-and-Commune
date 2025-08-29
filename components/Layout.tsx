
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const navigationLinks = [
    { to: '/', label: 'គ្រប់គ្រងឃុំ/ភូមិ', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
    { to: '/planting-entry', label: 'បញ្ចូលទិន្នន័យដាំដុះ', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6' },
    { to: '/planting-annual-report', label: 'របាយការណ៍ដាំដុះប្រចាំឆ្នាំ', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { to: '/planting-5year-report', label: 'របាយការណ៍ដាំដុះ៥ឆ្នាំ', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { to: '/harvest-entry', label: 'បញ្ចូលទិន្នន័យប្រមូលផល', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { to: '/harvest-annual-report', label: 'របាយការណ៍ប្រមូលផលប្រចាំឆ្នាំ', icon: 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6' },
    { to: '/harvest-5year-report', label: 'របាយការណ៍ប្រមូលផល៥ឆ្នាំ', icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z' },
    { to: '/combined-5year-report', label: 'របាយការណ៍ដាំដុះនិងប្រមូលផល៥ឆ្នាំ', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
];

const Sidebar: React.FC = () => (
    <div className="w-72 bg-white shadow-lg h-screen fixed top-0 left-0 overflow-y-auto">
        <div className="p-6">
            <h1 className="text-3xl text-primary-700 font-heading">កសិកម្ម</h1>
            <p className="text-gray-500 text-sm">ប្រព័ន្ធតាមដានដំណាំ</p>
        </div>
        <nav className="mt-4">
            <ul>
                {navigationLinks.map(link => (
                    <li key={link.to}>
                        <NavLink
                            to={link.to}
                            end
                            className={({ isActive }) =>
                                `flex items-center px-6 py-3 text-gray-700 hover:bg-primary-100 hover:text-primary-700 transition-colors duration-200 ${
                                    isActive ? 'bg-primary-100 text-primary-700 border-r-4 border-primary-500' : ''
                                }`
                            }
                        >
                            <svg className="w-6 h-6 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={link.icon}></path></svg>
                            <span className="text-sm font-medium">{link.label}</span>
                        </NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    </div>
);

const Layout: React.FC = () => {
    return (
        <div className="flex bg-gray-50">
            <Sidebar />
            <main className="flex-1 ml-72 p-8 overflow-y-auto h-screen">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
