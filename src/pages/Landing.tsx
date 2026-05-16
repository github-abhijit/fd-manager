import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { LogIn, PiggyBank, ShieldCheck, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const Landing: React.FC = () => {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-success/10 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full text-center z-10"
      >
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center shadow-inner">
            <PiggyBank className="w-10 h-10 text-primary" />
          </div>
        </div>

        <h1 className="text-4xl font-bold tracking-tight mb-4 text-foreground sm:text-5xl">
          FD <span className="text-primary">Manager</span>
        </h1>
        <p className="text-lg text-muted-foreground mb-10">
          Securely track your fixed deposits across multiple banks with ease. Stay ahead of maturity schedules.
        </p>

        <div className="grid grid-cols-1 gap-4 mb-12">
          <FeatureItem 
            icon={<ShieldCheck className="w-5 h-5 text-success" />}
            title="Secure Tracking"
            desc="Multi-tenant isolation ensures your data is only yours."
          />
          <FeatureItem 
            icon={<TrendingUp className="w-5 h-5 text-primary" />}
            title="Maturity Alerts"
            desc="Never miss a renewal with automated alerts."
          />
        </div>

        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-3 bg-foreground text-background hover:bg-foreground/90 py-4 px-6 rounded-2xl font-semibold text-lg transition-all shadow-xl interactive-scale"
        >
          <LogIn className="w-5 h-5" />
          Sign in with Google
        </button>
      </motion.div>

      <footer className="mt-auto py-8 text-muted-foreground text-sm">
        &copy; {new Date().getFullYear()} FD Manager. All rights reserved.
      </footer>
    </div>
  );
};

const FeatureItem = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="flex items-start gap-4 p-4 glass-card text-left">
    <div className="mt-1">{icon}</div>
    <div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  </div>
);

export default Landing;
