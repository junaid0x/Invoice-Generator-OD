import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader';
import SectionContainer from '../components/ui/SectionContainer';
import Card, { CardContent, CardHeader } from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import Badge from '../components/ui/Badge';
import TableContainer, { TableHead, TableRow, TableHeader, TableCell } from '../components/ui/TableContainer';
import { Users, FileText, Clock, AlertCircle, DollarSign, Plus, Eye } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount, currency = 'CAD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid': return <Badge variant="success">Paid</Badge>;
      case 'pending': return <Badge variant="neutral">Pending</Badge>;
      case 'overdue': return <Badge variant="danger">Overdue</Badge>;
      case 'draft': return <Badge variant="neutral">Draft</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Dashboard" subtitle="Overview of your business activity and metrics." />
        <SectionContainer>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {[...Array(5)].map((_, i) => (
              <Card key={i}><CardContent className="h-24 animate-pulse bg-secondary/20" /></Card>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <LoadingSkeleton rows={5} columns={5} />
            <LoadingSkeleton rows={5} columns={4} />
          </div>
        </SectionContainer>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Dashboard" subtitle="Overview of your business activity and metrics." />
        <SectionContainer>
          <EmptyState icon={AlertCircle} title="Error loading dashboard" description={error} />
        </SectionContainer>
      </div>
    );
  }

  const { topStats, recent_invoices, recent_customers } = data;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Overview of your business activity and metrics." />
      
      <SectionContainer>
        {/* TOP STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="hover:border-primary/50 transition-colors">
            <CardContent className="py-6 flex items-center gap-4 min-w-0">
              <div className="p-3 bg-primary/10 text-primary rounded-full shrink-0">
                <Users size={24} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-secondary mb-1 truncate">Total Customers</p>
                <h3 className="text-2xl font-bold text-white truncate">{topStats.total_customers}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:border-primary/50 transition-colors">
            <CardContent className="py-6 flex items-center gap-4 min-w-0">
              <div className="p-3 bg-primary/10 text-primary rounded-full shrink-0">
                <FileText size={24} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-secondary mb-1 truncate">Total Invoices</p>
                <h3 className="text-2xl font-bold text-white truncate">{topStats.total_invoices}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:border-primary/50 transition-colors">
            <CardContent className="py-6 flex items-center gap-4 min-w-0">
              <div className="p-3 bg-secondary text-text-primary rounded-full border border-border shrink-0">
                <Clock size={24} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-secondary mb-1 truncate">Pending Invoices</p>
                <h3 className="text-2xl font-bold text-white truncate">{topStats.pending_invoices}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:border-danger/50 transition-colors">
            <CardContent className="py-6 flex items-center gap-4 min-w-0">
              <div className="p-3 bg-danger/10 text-danger rounded-full shrink-0">
                <AlertCircle size={24} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-secondary mb-1 truncate">Overdue Invoices</p>
                <h3 className="text-2xl font-bold text-white truncate">{topStats.overdue_invoices}</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* REVENUE BANNER (Full Width) */}
        <div className="mb-8">
          <Card className="hover:border-success/50 transition-colors bg-gradient-to-r from-card to-card/50">
            <CardContent className="py-8 px-8 flex items-center justify-between gap-6">
              <div>
                <p className="text-sm font-medium text-text-secondary mb-2 uppercase tracking-wider">Total Revenue</p>
                <h3 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight break-all">
                  {formatCurrency(topStats.total_revenue, topStats.currency)}
                </h3>
              </div>
              <div className="p-5 bg-success/10 text-success rounded-full shrink-0">
                <DollarSign size={40} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SECOND & THIRD ROWS (2 columns on lg) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Invoices */}
          <Card>
            <CardHeader className="flex justify-between items-center py-4">
              <h3 className="text-lg font-medium text-white">Recent Invoices</h3>
              <Link to="/invoices" className="text-sm text-primary hover:text-primary-hover flex items-center gap-1">
                View all <Eye size={14} />
              </Link>
            </CardHeader>
            <CardContent className="p-0 overflow-hidden">
              {recent_invoices.length > 0 ? (
                <TableContainer className="border-none rounded-none">
                  <TableHead>
                    <TableRow>
                      <TableHeader>Invoice</TableHeader>
                      <TableHeader>Customer</TableHeader>
                      <TableHeader>Date</TableHeader>
                      <TableHeader>Amount</TableHeader>
                      <TableHeader>Status</TableHeader>
                    </TableRow>
                  </TableHead>
                  <tbody>
                    {recent_invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium text-white">{invoice.invoice_number}</TableCell>
                        <TableCell>{invoice.customer || 'Unknown'}</TableCell>
                        <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                        <TableCell>{formatCurrency(invoice.amount, topStats.currency)}</TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      </TableRow>
                    ))}
                  </tbody>
                </TableContainer>
              ) : (
                <div className="p-8">
                  <EmptyState icon={FileText} title="No invoices yet" description="Create your first invoice to get started." />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Customers */}
          <Card>
            <CardHeader className="flex justify-between items-center py-4">
              <h3 className="text-lg font-medium text-white">Recent Customers</h3>
              <Link to="/customers" className="text-sm text-primary hover:text-primary-hover flex items-center gap-1">
                View all <Eye size={14} />
              </Link>
            </CardHeader>
            <CardContent className="p-0 overflow-hidden">
              {recent_customers.length > 0 ? (
                <TableContainer className="border-none rounded-none">
                  <TableHead>
                    <TableRow>
                      <TableHeader>Company</TableHeader>
                      <TableHeader>Contact</TableHeader>
                      <TableHeader>Email</TableHeader>
                    </TableRow>
                  </TableHead>
                  <tbody>
                    {recent_customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium text-white">{customer.company_name}</TableCell>
                        <TableCell>{customer.contact_person || '-'}</TableCell>
                        <TableCell>{customer.email || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </tbody>
                </TableContainer>
              ) : (
                <div className="p-8">
                  <EmptyState icon={Users} title="No customers yet" description="Add customers to your database." />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* FOURTH ROW: Quick Actions */}
        <h3 className="text-lg font-medium text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/invoice-builder">
            <Card className="hover:bg-secondary/50 hover:border-primary/50 transition-all cursor-pointer group">
              <CardContent className="py-6 flex flex-col items-center justify-center gap-3">
                <div className="p-3 bg-primary/10 text-primary rounded-full group-hover:scale-110 transition-transform">
                  <Plus size={24} />
                </div>
                <span className="font-medium text-white">Create Invoice</span>
              </CardContent>
            </Card>
          </Link>
          <Link to="/customers">
            <Card className="hover:bg-secondary/50 hover:border-primary/50 transition-all cursor-pointer group">
              <CardContent className="py-6 flex flex-col items-center justify-center gap-3">
                <div className="p-3 bg-primary/10 text-primary rounded-full group-hover:scale-110 transition-transform">
                  <Users size={24} />
                </div>
                <span className="font-medium text-white">Add Customer</span>
              </CardContent>
            </Card>
          </Link>
          <Link to="/invoices">
            <Card className="hover:bg-secondary/50 hover:border-primary/50 transition-all cursor-pointer group">
              <CardContent className="py-6 flex flex-col items-center justify-center gap-3">
                <div className="p-3 bg-secondary text-text-primary border border-border rounded-full group-hover:scale-110 transition-transform">
                  <FileText size={24} />
                </div>
                <span className="font-medium text-white">View Invoices</span>
              </CardContent>
            </Card>
          </Link>
          <Link to="/customers">
            <Card className="hover:bg-secondary/50 hover:border-primary/50 transition-all cursor-pointer group">
              <CardContent className="py-6 flex flex-col items-center justify-center gap-3">
                <div className="p-3 bg-secondary text-text-primary border border-border rounded-full group-hover:scale-110 transition-transform">
                  <Users size={24} />
                </div>
                <span className="font-medium text-white">View Customers</span>
              </CardContent>
            </Card>
          </Link>
        </div>
      </SectionContainer>
    </div>
  );
}
