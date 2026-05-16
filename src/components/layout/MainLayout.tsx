import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggle from './ThemeToggle';
import { LayoutDashboard, Library, LogOut, PlusCircle, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout, user } = useAuth();
  const location = useLocation();

  const navItems = [
    { icon: <LayoutDashboard />, label: 'Dashboard', path: '/' },
    { icon: <Library />, label: 'Inventory', path: '/inventory' },
    { icon: <User />, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-card border-r p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">FD</span>
          </div>
          <span className="font-display font-bold text-xl">FD Manager</span>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                location.pathname === item.path
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {React.cloneElement(item.icon as any, { className: 'w-5 h-5' })}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden border">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between px-2">
            <ThemeToggle />
            <button
              onClick={logout}
              className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all interactive-scale"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-background/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">FD</span>
          </div>
          <span className="font-display font-bold">FD Manager</span>
        </div>
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t px-6 py-3 flex justify-between items-center z-50">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 transition-all ${
              location.pathname === item.path ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            {React.cloneElement(item.icon as any, { className: 'w-6 h-6' })}
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
        
        {/* Floating Action Button Placeholder */}
        <button className="bg-primary text-primary-foreground p-3 rounded-full shadow-lg shadow-primary/30 -mt-10 interactive-scale border-4 border-background">
          <PlusCircle className="w-6 h-6" />
        </button>

        <Link
          to="/profile"
          className={`flex flex-col items-center gap-1 transition-all ${
            location.pathname === '/profile' ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <User className="w-6 h-6" />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
        
        <button
          onClick={logout}
          className="flex flex-col items-center gap-1 text-muted-foreground"
        >
          <LogOut className="w-6 h-6" />
          <span className="text-[10px] font-medium">Exit</span>
        </button>
      </nav>
    </div>
  );
};

export default MainLayout;
