import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Save } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getAuth, updateProfile } from 'firebase/auth';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    setMessage('');
    try {
      const auth = getAuth();
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName });
        setMessage('Profile updated successfully! Refresh the page to see changes.');
      }
    } catch (error: any) {
      setMessage('Error updating profile: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto pb-20 pt-8">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <User className="w-10 h-10 text-primary" />
          Profile Settings
        </h1>
        <p className="text-muted-foreground text-lg mt-2">Manage your account details and preferences.</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 border-l-4 border-l-primary"
      >
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Email Address</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 text-muted-foreground outline-none opacity-70 cursor-not-allowed font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-lg"
            />
            <p className="text-xs font-medium text-muted-foreground mt-1">This name will be displayed on your dashboard to welcome you.</p>
          </div>

          {message && (
            <div className={`p-4 rounded-xl text-sm font-bold ${message.includes('Error') ? 'bg-destructive/10 text-destructive border border-destructive/20' : 'bg-success/10 text-success border border-success/20'}`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 interactive-scale flex items-center justify-center gap-2 text-lg mt-8"
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Profile;
