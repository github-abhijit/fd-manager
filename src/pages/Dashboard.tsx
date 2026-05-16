import React from 'react';
import { useBanks, useFixedDeposits, useFirestoreMutations } from '../hooks/useFirestore';
import { useAuth } from '../hooks/useAuth';
import { 
  TrendingUp, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar,
  Wallet,
  Landmark,
  ShieldCheck,
  Database
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format, parseISO, addMonths, addYears, isAfter, isBefore } from 'date-fns';

const Dashboard: React.FC = () => {
  const { data: banks } = useBanks();
  const { data: fds, isLoading } = useFixedDeposits();
  const { user } = useAuth();
  const { addBank, addFD } = useFirestoreMutations();

  const totalPrincipal = fds?.reduce((acc, curr) => acc + curr.principalAmount, 0) || 0;
  const avgInterest = fds?.length 
    ? (fds.reduce((acc, curr) => acc + curr.interestRate, 0) / fds.length).toFixed(2)
    : 0;
  
  const maturingSoon = fds?.filter(fd => {
    const maturityDate = parseISO(fd.maturityDate);
    const thirtyDaysFromNow = addMonths(new Date(), 1);
    return isBefore(maturityDate, thirtyDaysFromNow) && isAfter(maturityDate, new Date());
  }) || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const seedTestData = async () => {
    if (!user) return;
    try {
      // Add Banks
      const hdfc = await addBank.mutateAsync("HDFC Bank");
      const sbi = await addBank.mutateAsync("State Bank of India");
      const icici = await addBank.mutateAsync("ICICI Bank");

      // Add FDs
      await addFD.mutateAsync({
        bankId: hdfc.id,
        holderName: "Abhijit Harry",
        accountNumber: "9901",
        principalAmount: 500000,
        interestRate: 7.2,
        startDate: format(new Date(), 'yyyy-MM-dd'),
        maturityDate: format(addYears(new Date(), 1), 'yyyy-MM-dd'),
        status: 'ACTIVE'
      });

      await addFD.mutateAsync({
        bankId: sbi.id,
        holderName: "Abhijit Harry",
        accountNumber: "4452",
        principalAmount: 250000,
        interestRate: 6.8,
        startDate: format(addMonths(new Date(), -6), 'yyyy-MM-dd'),
        maturityDate: format(addMonths(new Date(), 1), 'yyyy-MM-dd'), // Maturing soon
        status: 'ACTIVE'
      });

      await addFD.mutateAsync({
        bankId: icici.id,
        holderName: "Abhijit Harry",
        accountNumber: "1288",
        principalAmount: 1000000,
        interestRate: 7.5,
        startDate: format(new Date(), 'yyyy-MM-dd'),
        maturityDate: format(addYears(new Date(), 2), 'yyyy-MM-dd'),
        status: 'ACTIVE'
      });

      alert("Test data seeded successfully!");
    } catch (err) {
      console.error(err);
      alert("Error seeding data. Check console.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-bold tracking-tight">Financial Overview</h1>
          <p className="text-muted-foreground text-lg">Welcome back, {user?.displayName || 'Abhijit'}!</p>
        </motion.div>

        {(user?.email === 'abhijit.harry@gmail.com' || user?.email === 'testuser@arc.com') && (
          <button 
            onClick={seedTestData}
            className="flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-xl font-bold border border-accent/20 hover:bg-accent/20 transition-all interactive-scale"
          >
            <Database className="w-4 h-4" />
            Seed Test Data
          </button>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Principal" 
          value={formatCurrency(totalPrincipal)} 
          icon={<Wallet className="w-6 h-6" />}
          trend="+₹12,400"
          isUp={true}
          color="primary"
        />
        <StatCard 
          title="Avg. Interest" 
          value={`${avgInterest}%`} 
          icon={<TrendingUp className="w-6 h-6" />}
          trend="+0.2%"
          isUp={true}
          color="secondary"
        />
        <StatCard 
          title="Total Banks" 
          value={banks?.length || 0} 
          icon={<Landmark className="w-6 h-6" />}
          color="accent"
        />
        <StatCard 
          title="Security Score" 
          value="98/100" 
          icon={<ShieldCheck className="w-6 h-6" />}
          color="success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Maturity Alerts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-primary" />
              Maturity Alerts
            </h2>
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
              {maturingSoon.length} Pending
            </span>
          </div>

          {maturingSoon.length > 0 ? (
            <div className="space-y-4">
              {maturingSoon.map(fd => (
                <motion.div 
                  key={fd.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-5 border-l-4 border-l-primary flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">{fd.holderName}</p>
                      <p className="text-sm text-muted-foreground">
                        Maturing on {format(parseISO(fd.maturityDate), 'dd MMM yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs font-bold uppercase text-muted-foreground">Principal</p>
                      <p className="font-bold text-lg">{formatCurrency(fd.principalAmount)}</p>
                    </div>
                    <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 interactive-scale">
                      Action
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="glass-card p-12 text-center">
              <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4">
                <ShieldCheck className="w-10 h-10 text-primary" />
              </div>
              <p className="text-muted-foreground text-lg">No FDs maturing in the next 30 days. You're all set!</p>
            </div>
          )}
        </div>

        {/* Quick Insights */}
        <div className="space-y-6">
           <h2 className="text-2xl font-bold">Insights</h2>
           <div className="glass-card p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">Monthly Interest</span>
                  <span className="font-bold text-success">+₹6,200</span>
                </div>
                <div className="w-full h-2 bg-secondary/10 rounded-full overflow-hidden">
                  <div className="w-[70%] h-full bg-primary" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">Reinvestment Rate</span>
                  <span className="font-bold text-primary">85%</span>
                </div>
                <div className="w-full h-2 bg-secondary/10 rounded-full overflow-hidden">
                  <div className="w-[85%] h-full bg-secondary" />
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, trend, isUp, color }: any) => {
  const colorMap: any = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    accent: 'bg-accent/10 text-accent',
    success: 'bg-success/10 text-success',
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="glass-card p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-2xl ${colorMap[color]}`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-bold ${isUp ? 'text-success' : 'text-accent'}`}>
            {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-black mt-1 tracking-tight">{value}</p>
      </div>
    </motion.div>
  );
};

export default Dashboard;
