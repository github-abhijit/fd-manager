import React from 'react';
import { useFixedDeposits } from '../hooks/useFirestore';
import { PiggyBank, Calendar, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react';
import { format, addDays, isBefore, parseISO } from 'date-fns';
import { motion } from 'framer-motion';

const Dashboard: React.FC = () => {
  const { data: fds, isLoading } = useFixedDeposits();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  const activeFDs = fds?.filter(fd => fd.status === 'ACTIVE') || [];
  const totalPrincipal = activeFDs.reduce((acc, fd) => acc + fd.principalAmount, 0);
  
  // Calculate maturity alerts (next 30 days)
  const today = new Date();
  const thirtyDaysFromNow = addDays(today, 30);
  const alerts = activeFDs.filter(fd => {
    const maturityDate = parseISO(fd.maturityDate);
    return isBefore(maturityDate, thirtyDaysFromNow);
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">Welcome back! Here's your portfolio summary.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard 
          title="Total Principal" 
          value={formatCurrency(totalPrincipal)} 
          icon={< PiggyBank className="w-6 h-6 text-primary" />}
          description={`${activeFDs.length} Active Deposits`}
        />
        <MetricCard 
          title="Maturing Soon" 
          value={alerts.length.toString()} 
          icon={<Calendar className="w-6 h-6 text-warning" />}
          description="In the next 30 days"
          status={alerts.length > 0 ? 'warning' : 'neutral'}
        />
        <MetricCard 
          title="Avg. Interest Rate" 
          value={activeFDs.length > 0 
            ? `${(activeFDs.reduce((acc, fd) => acc + fd.interestRate, 0) / activeFDs.length).toFixed(1)}%`
            : '0.0%'
          } 
          icon={<TrendingUp className="w-6 h-6 text-success" />}
          description="Annualized return"
        />
      </div>

      {/* Maturity Alert Banner */}
      {alerts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-warning" />
            <h2 className="text-xl font-semibold">Maturity Alerts</h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {alerts.map((fd, index) => (
              <motion.div
                key={fd.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-4 flex items-center justify-between border-l-4 border-l-warning"
              >
                <div>
                  <h3 className="font-semibold">{fd.holderName}</h3>
                  <p className="text-sm text-muted-foreground">Maturity: {format(parseISO(fd.maturityDate), 'dd MMM yyyy')}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-warning">{formatCurrency(fd.principalAmount)}</p>
                  <button className="text-xs text-primary font-medium flex items-center gap-1 hover:underline mt-1">
                    Manage <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Quick Actions / Recent Activity Placeholder */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-6 h-64 flex flex-col items-center justify-center text-center space-y-4 border-dashed">
          <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">Portfolio Growth</h3>
            <p className="text-sm text-muted-foreground">Visualization coming soon.</p>
          </div>
        </div>
        <div className="glass-card p-6 h-64 flex flex-col items-center justify-center text-center space-y-4 border-dashed">
          <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">Recent Changes</h3>
            <p className="text-sm text-muted-foreground">Transaction logs coming soon.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
  status?: 'neutral' | 'warning' | 'success';
}

const MetricCard = ({ title, value, icon, description, status = 'neutral' }: MetricCardProps) => (
  <div className={`glass-card p-6 flex flex-col gap-4 border-t-4 ${
    status === 'warning' ? 'border-t-warning' : status === 'success' ? 'border-t-success' : 'border-t-primary'
  }`}>
    <div className="flex justify-between items-start">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
  </div>
);

export default Dashboard;
