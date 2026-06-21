import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { Calendar, DollarSign, FileText, AlertCircle, CheckCircle, Clock, PieChart } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import SectionContainer from '../components/ui/SectionContainer';
import Card, { CardContent, CardHeader } from '../components/ui/Card';
import TableContainer, { TableHeader, TableRow, TableHead, TableCell } from '../components/ui/TableContainer';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import EmptyState from '../components/ui/EmptyState';
import { api } from '../services/api';

const COLORS = ['#8B3DFF', '#EAB308', '#22C55E', '#EF4444', '#6B7280'];

export default function Reports() {
  const [reportsData, setReportsData] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [dateFilter, setDateFilter] = useState('This Year');
  const [customRange, setCustomRange] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFilter, customRange]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let queryStr = '';
      if (dateFilter !== 'All Time') {
        const dates = getDatesForFilter(dateFilter);
        if (dates.startDate && dates.endDate) {
          queryStr = `?startDate=${dates.startDate}&endDate=${dates.endDate}`;
        } else if (dateFilter === 'Custom Range' && customRange.startDate && customRange.endDate) {
          queryStr = `?startDate=${customRange.startDate}&endDate=${customRange.endDate}`;
        } else if (dateFilter === 'Custom Range') {
          // Don't fetch if custom range is incomplete
          setIsLoading(false);
          return;
        }
      }

      const [reports, revenue] = await Promise.all([
        api.get(`/reports${queryStr}`),
        api.get('/reports/revenue') // Revenue is always current year
      ]);

      setReportsData(reports);
      setRevenueData(revenue);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getDatesForFilter = (filter) => {
    const today = new Date();
    const formatDate = (d) => d.toISOString().split('T')[0];
    
    let startDate, endDate;
    
    switch (filter) {
      case 'Today':
        startDate = formatDate(today);
        endDate = formatDate(today);
        break;
      case 'This Week':
        const firstDay = new Date(today.setDate(today.getDate() - today.getDay() + 1));
        const lastDay = new Date(today.setDate(today.getDate() - today.getDay() + 7));
        startDate = formatDate(firstDay);
        endDate = formatDate(lastDay);
        break;
      case 'This Month':
        startDate = formatDate(new Date(today.getFullYear(), today.getMonth(), 1));
        endDate = formatDate(new Date(today.getFullYear(), today.getMonth() + 1, 0));
        break;
      case 'This Year':
        startDate = formatDate(new Date(today.getFullYear(), 0, 1));
        endDate = formatDate(new Date(today.getFullYear(), 11, 31));
        break;
      default:
        startDate = null;
        endDate = null;
    }
    return { startDate, endDate };
  };

  const formatCurrency = (amount, currency = 'CAD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (isLoading && !reportsData) {
    return (
      <div className="space-y-6">
        <PageHeader title="Reports & Analytics" subtitle="Track invoice performance and business activity." />
        <SectionContainer>
          <LoadingSkeleton rows={10} columns={3} />
        </SectionContainer>
      </div>
    );
  }

  if (error && !reportsData) {
    return (
      <div className="space-y-6">
        <PageHeader title="Reports & Analytics" subtitle="Track invoice performance and business activity." />
        <SectionContainer>
          <EmptyState icon={AlertCircle} title="Error loading reports" description={error} />
        </SectionContainer>
      </div>
    );
  }

  const { summary, statistics, topCustomers, currency } = reportsData || {};

  const statusPieData = statistics ? [
    { name: 'Paid', value: statistics.paid_count },
    { name: 'Pending', value: statistics.pending_count },
    { name: 'Overdue', value: statistics.overdue_count },
    { name: 'Draft', value: statistics.draft_count }
  ].filter(d => d.value > 0) : [];

  return (
    <div className="space-y-8 pb-12 w-full max-w-[1400px] mx-auto">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <PageHeader 
          title="Reports & Analytics" 
          subtitle="Track invoice performance and business activity."
        />
        
        {/* Filter Bar */}
        <div className="bg-secondary/80 p-1 rounded-lg border border-border flex flex-wrap items-center gap-1">
          {['Today', 'This Week', 'This Month', 'This Year', 'Custom Range'].map(filter => (
            <button
              key={filter}
              onClick={() => setDateFilter(filter)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${dateFilter === filter ? 'bg-primary text-white shadow-soft-purple' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {dateFilter === 'Custom Range' && (
        <div className="flex items-center gap-4 bg-secondary/30 p-4 rounded-lg border border-border">
          <div className="flex flex-col">
            <label className="text-xs text-text-secondary mb-1">Start Date</label>
            <input 
              type="date" 
              className="bg-card border border-border rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
              value={customRange.startDate}
              onChange={(e) => setCustomRange(prev => ({ ...prev, startDate: e.target.value }))}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-text-secondary mb-1">End Date</label>
            <input 
              type="date" 
              className="bg-card border border-border rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
              value={customRange.endDate}
              onChange={(e) => setCustomRange(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </div>
        </div>
      )}

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Revenue', value: summary?.total_revenue, icon: DollarSign, color: 'text-success' },
          { label: 'Outstanding Amount', value: summary?.outstanding_amount, icon: AlertCircle, color: 'text-warning' },
          { label: 'Paid Amount', value: summary?.paid_amount, icon: CheckCircle, color: 'text-success' },
          { label: 'Pending Amount', value: summary?.pending_amount, icon: Clock, color: 'text-primary' },
          { label: 'Overdue Amount', value: summary?.overdue_amount, icon: AlertCircle, color: 'text-danger' }
        ].map((card, idx) => (
          <Card key={idx} className="bg-card">
            <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-text-secondary">{card.label}</span>
                <card.icon size={18} className={card.color} />
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                {formatCurrency(card.value || 0, currency)}
              </h3>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Monthly Revenue Chart */}
        <Card className="h-96 flex flex-col">
          <CardHeader>
            <h2 className="text-lg font-medium text-white flex items-center">
              <Calendar size={18} className="mr-2 text-primary" />
              Revenue Breakdown (Current Year)
            </h2>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 pt-4">
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(val) => `$${val/1000}k`} />
                  <Tooltip 
                    cursor={{ fill: '#ffffff05' }}
                    contentStyle={{ backgroundColor: '#0B0416', border: '1px solid #ffffff1a', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value) => formatCurrency(value, currency)}
                  />
                  <Bar dataKey="revenue" fill="#8B3DFF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No Data" description="No revenue data for the current year." />
            )}
          </CardContent>
        </Card>

        {/* Invoice Status Distribution Chart */}
        <Card className="h-96 flex flex-col">
          <CardHeader>
            <h2 className="text-lg font-medium text-white flex items-center">
              <PieChart size={18} className="mr-2 text-primary" />
              Invoice Status Distribution
            </h2>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 flex items-center justify-center">
            {statusPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0B0416', border: '1px solid #ffffff1a', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No Data" description="No invoices found for this period." />
            )}
          </CardContent>
        </Card>

      </div>

      {/* Stats and Top Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Invoice Statistics */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-white flex items-center">
              <FileText size={18} className="mr-2 text-primary" />
              Invoice Statistics
            </h2>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {[
                { label: 'Invoices Created', value: statistics?.total_created, color: 'text-white' },
                { label: 'Paid Invoices', value: statistics?.paid_count, color: 'text-success' },
                { label: 'Pending Invoices', value: statistics?.pending_count, color: 'text-primary' },
                { label: 'Overdue Invoices', value: statistics?.overdue_count, color: 'text-danger' },
                { label: 'Draft Invoices', value: statistics?.draft_count, color: 'text-text-secondary' },
              ].map((stat, idx) => (
                <div key={idx} className="flex justify-between items-center p-5 hover:bg-white/5 transition-colors">
                  <span className="text-sm font-medium text-text-secondary">{stat.label}</span>
                  <span className={`text-lg font-bold ${stat.color}`}>{stat.value || 0}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-white flex items-center">
              <DollarSign size={18} className="mr-2 text-primary" />
              Top Customers
            </h2>
          </CardHeader>
          <TableContainer>
            <TableHead>
              <TableRow>
                <TableHeader>Customer Name</TableHeader>
                <TableHeader>Invoices</TableHeader>
                <TableHeader className="text-right">Revenue</TableHeader>
              </TableRow>
            </TableHead>
            <tbody>
              {topCustomers && topCustomers.length > 0 ? (
                topCustomers.map((customer, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium text-white">{customer.company_name}</TableCell>
                    <TableCell>{customer.invoices_count}</TableCell>
                    <TableCell className="text-right text-white font-medium">
                      {formatCurrency(customer.revenue_generated, currency)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-32 text-center text-text-secondary">
                    No customer data available for this period.
                  </TableCell>
                </TableRow>
              )}
            </tbody>
          </TableContainer>
        </Card>

      </div>
    </div>
  );
}
