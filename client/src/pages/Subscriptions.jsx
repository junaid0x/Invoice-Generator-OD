import { useState, useEffect } from 'react';
import PageHeader from '../components/ui/PageHeader';
import SectionContainer from '../components/ui/SectionContainer';
import Card, { CardContent } from '../components/ui/Card';
import TableContainer, { TableHead, TableRow, TableHeader, TableCell } from '../components/ui/TableContainer';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { subscriptionService } from '../services/subscriptionApi';
import { customerService } from '../services/customerService';
import { Repeat, Plus, Search, Edit2, Trash2, Calendar, CheckCircle } from 'lucide-react';
import AddEditSubscriptionModal from '../components/subscriptions/AddEditSubscriptionModal';
import RenewSubscriptionModal from '../components/subscriptions/RenewSubscriptionModal';
import MaintenanceContractModal from '../components/subscriptions/MaintenanceContractModal';

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [serviceFilter, setServiceFilter] = useState('All');
  
  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  
  const [selectedSub, setSelectedSub] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subsRes, custRes] = await Promise.all([
        subscriptionService.getAll(),
        customerService.getAll()
      ]);
      setSubscriptions(subsRes);
      setCustomers(custRes.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
      case 'Active Contract':
        return <Badge variant="success">{status}</Badge>;
      case 'Free Maintenance':
        return <Badge variant="primary">{status}</Badge>;
      case 'Expiring Soon':
        return <Badge variant="warning">{status}</Badge>;
      case 'Expired':
      case 'Maintenance Contract Expired':
      case 'No Active Contract':
        return <Badge variant="danger">{status}</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subscription?')) return;
    try {
      await subscriptionService.delete(id);
      fetchData();
    } catch (error) {
      alert('Failed to delete subscription');
    }
  };

  const filteredSubs = subscriptions.filter(sub => {
    const matchesSearch = 
      (sub.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub.service_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub.service_identifier || '').toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'All' || sub.status === statusFilter;
    const matchesService = serviceFilter === 'All' || sub.service_type === serviceFilter;
    
    return matchesSearch && matchesStatus && matchesService;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader 
          title="Subscriptions" 
          subtitle="Manage recurring services and maintenance contracts."
        />
        <button 
          onClick={() => { setSelectedSub(null); setIsAddEditModalOpen(true); }}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-soft-purple hover:shadow-lg hover:-translate-y-0.5"
        >
          <Plus size={18} />
          Add Subscription
        </button>
      </div>

      <SectionContainer>
        <Card>
          <div className="p-4 border-b border-border flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
              <input
                type="text"
                placeholder="Search clients, services, domains..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-secondary/50 border border-border rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            
            <div className="flex gap-4">
              <div className="relative">
                <select
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
                  className="appearance-none cursor-pointer bg-secondary/80 border border-border/60 hover:border-border rounded-xl pl-4 pr-10 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                >
                  <option value="All" className="bg-background text-white">All Services</option>
                  <option value="Hosting" className="bg-background text-white">Hosting</option>
                  <option value="Business Email" className="bg-background text-white">Business Email</option>
                  <option value="Website Maintenance" className="bg-background text-white">Website Maintenance</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-text-secondary">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none cursor-pointer bg-secondary/80 border border-border/60 hover:border-border rounded-xl pl-4 pr-10 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                >
                  <option value="All" className="bg-background text-white">All Statuses</option>
                  <option value="Active" className="bg-background text-white">Active</option>
                  <option value="Expiring Soon" className="bg-background text-white">Expiring Soon</option>
                  <option value="Expired" className="bg-background text-white">Expired</option>
                  <option value="Free Maintenance" className="bg-background text-white">Free Maintenance</option>
                  <option value="Active Contract" className="bg-background text-white">Active Contract</option>
                  <option value="No Active Contract" className="bg-background text-white">No Active Contract</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-text-secondary">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </div>

          <CardContent className="p-0">
            {loading ? (
              <LoadingSkeleton rows={5} columns={6} />
            ) : filteredSubs.length > 0 ? (
              <div className="overflow-x-auto">
                <TableContainer className="border-none rounded-none">
                  <TableHead>
                    <TableRow>
                      <TableHeader>Client</TableHeader>
                      <TableHeader>Service</TableHeader>
                      <TableHeader>Identifier</TableHeader>
                      <TableHeader>Date / Expiry</TableHeader>
                      <TableHeader>Status</TableHeader>
                      <TableHeader className="text-right">Actions</TableHeader>
                    </TableRow>
                  </TableHead>
                  <tbody>
                    {filteredSubs.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell>
                          <div className="font-medium text-white">{sub.customer_name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-white font-medium">{sub.service_type}</div>
                          <div className="text-xs text-text-secondary">{sub.service_name}</div>
                        </TableCell>
                        <TableCell>
                          <span className="text-text-secondary">{sub.service_identifier || '-'}</span>
                        </TableCell>
                        <TableCell>
                          {sub.service_type === 'Website Maintenance' ? (
                            <div className="text-sm">
                              {sub.contract_end ? (
                                <span>Expires: {new Date(sub.contract_end).toLocaleDateString()}</span>
                              ) : (
                                <span>Purchased: {new Date(sub.purchase_date).toLocaleDateString()}</span>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm">
                              {sub.renewal_date ? (
                                <span>Renews: {new Date(sub.renewal_date).toLocaleDateString()}</span>
                              ) : '-'}
                            </div>
                          )}
                          {sub.days_remaining !== null && (
                            <div className="text-xs text-text-secondary">
                              {sub.days_remaining > 0 ? `${sub.days_remaining} days left` : 'Expired'}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(sub.status)}
                        </TableCell>
                        <TableCell className="text-right space-x-3">
                          {sub.service_type === 'Website Maintenance' ? (
                            <button
                              onClick={() => { setSelectedSub(sub); setIsMaintenanceModalOpen(true); }}
                              className="text-primary hover:text-white transition-colors"
                              title="Activate Contract"
                            >
                              <CheckCircle size={18} />
                            </button>
                          ) : (
                            <button
                              onClick={() => { setSelectedSub(sub); setIsRenewModalOpen(true); }}
                              className="text-success hover:text-white transition-colors"
                              title="Renew"
                            >
                              <Calendar size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => { setSelectedSub(sub); setIsAddEditModalOpen(true); }}
                            className="text-text-secondary hover:text-white transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(sub.id)}
                            className="text-text-secondary hover:text-danger transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </tbody>
                </TableContainer>
              </div>
            ) : (
              <div className="p-8">
                <EmptyState 
                  icon={Repeat} 
                  title="No subscriptions found" 
                  description="Try adjusting your filters or add a new subscription."
                />
              </div>
            )}
          </CardContent>
        </Card>
      </SectionContainer>

      {isAddEditModalOpen && (
        <AddEditSubscriptionModal
          subscription={selectedSub}
          customers={customers}
          onClose={() => setIsAddEditModalOpen(false)}
          onSuccess={() => { setIsAddEditModalOpen(false); fetchData(); }}
        />
      )}

      {isRenewModalOpen && selectedSub && (
        <RenewSubscriptionModal
          subscription={selectedSub}
          onClose={() => setIsRenewModalOpen(false)}
          onSuccess={() => { setIsRenewModalOpen(false); fetchData(); }}
        />
      )}

      {isMaintenanceModalOpen && selectedSub && (
        <MaintenanceContractModal
          subscription={selectedSub}
          onClose={() => setIsMaintenanceModalOpen(false)}
          onSuccess={() => { setIsMaintenanceModalOpen(false); fetchData(); }}
        />
      )}
    </div>
  );
}
