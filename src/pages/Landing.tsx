import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Globe, ArrowRight, Wallet, TrendingUp, ShieldCheck } from 'lucide-react';

const Landing: React.FC = () => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [isEmailLogin, setIsEmailLogin] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 overflow-hidden relative">
      {/* Animated Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[100px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], x: [0, -40, 0], y: [0, -50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/20 rounded-full blur-[100px]" 
        />
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Side: Marketing Content */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm"
            >
              <TrendingUp className="w-4 h-4" />
              Secure Portfolio Tracking
            </motion.div>
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-tight">
              Grow Your <span className="text-primary italic">Wealth</span> Securely.
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Track, manage, and optimize your fixed deposits with our premium dashboard. Smart alerts and rolling wizards at your fingertips.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 glass-card">
              <div className="p-2 rounded-xl bg-primary/20 text-primary">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm">Military Grade</p>
                <p className="text-xs text-muted-foreground">End-to-end security</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 glass-card">
              <div className="p-2 rounded-xl bg-secondary/20 text-secondary">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm">Smart Tracking</p>
                <p className="text-xs text-muted-foreground">Automated insights</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Auth Forms */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-8 relative overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {!isEmailLogin ? (
              <motion.div
                key="social"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold">Welcome Back</h2>
                  <p className="text-muted-foreground">Choose your preferred login method</p>
                </div>

                <button 
                  onClick={() => signInWithGoogle()}
                  className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all interactive-scale"
                >
                  <Globe className="w-6 h-6 text-primary" />
                  Continue with Google
                </button>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t"></div></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-4 text-muted-foreground">Or continue with email</span></div>
                </div>

                <button 
                  onClick={() => setIsEmailLogin(true)}
                  className="w-full flex items-center justify-center gap-3 bg-secondary text-secondary-foreground py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all interactive-scale"
                >
                  <Mail className="w-5 h-5" />
                  Sign in with Email
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="email"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <button 
                    onClick={() => setIsEmailLogin(false)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ← Back to options
                  </button>
                </div>

                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold">{isSignUp ? 'Create Account' : 'Email Login'}</h2>
                  <p className="text-muted-foreground">
                    {isSignUp ? 'Join our secure platform today' : 'Access your dashboard securely'}
                  </p>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
                    {error}
                  </div>
                )}

                <form onSubmit={handleEmailAuth} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium ml-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all interactive-scale disabled:opacity-50"
                  >
                    {loading ? 'Authenticating...' : isSignUp ? 'Create Account' : 'Sign In'}
                    {!loading && <ArrowRight className="w-5 h-5" />}
                  </button>
                </form>

                <p className="text-center text-sm text-muted-foreground">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button 
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-primary font-bold hover:underline"
                  >
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default Landing;
