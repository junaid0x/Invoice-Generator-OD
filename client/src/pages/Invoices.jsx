import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Trash2, Copy, Eye } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import SectionContainer from '../components/ui/SectionContainer';
import Button from '../components/ui/Button';
import SearchInput from '../components/ui/SearchInput';
import EmptyState from '../components/ui/EmptyState';
import TableContainer, { TableHead, TableRow, TableHeader, TableCell } from '../components/ui/TableContainer';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import DeleteModal from '../components/DeleteModal';
import Pagination from '../components/ui/Pagination';
import useDebounce from '../hooks/useDebounce';
import { invoiceService } from '../services/invoiceService';
import { api } from '../services/api';
import { formatCurrency } from '../utils/calculations';

export default function Invoices() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, statusFilter]);

  useEffect(() => {
    fetchInvoices();
  }, [currentPage, debouncedSearchQuery, statusFilter]);

  async function fetchInvoices() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/invoices?page=${currentPage}&limit=10&search=${encodeURIComponent(debouncedSearchQuery)}&status=${encodeURIComponent(statusFilter)}`);
      
      setInvoices(response.data || []);
      setTotalPages(response.meta?.totalPages || 1);
    } catch (err) {
      setError(err.message || 'Failed to load invoices');
    } finally {
      setIsLoading(false);
    }
  }

  const handleCreateInvoice = () => {
    navigate('/invoice-builder');
  };

  const handleViewEdit = (id) => {
    navigate(`/invoice-builder/${id}`);
  };

  const handleDeleteClick = (invoice) => {
    setSelectedInvoice(invoice);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedInvoice) return;
    setIsSubmitting(true);
    try {
      await invoiceService.delete(selectedInvoice.id);
      setIsDeleteModalOpen(false);
      fetchInvoices();
    } catch (err) {
      alert(err.message || 'Failed to delete invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await invoiceService.duplicate(id);
      fetchInvoices();
    } catch (err) {
      alert(err.message || 'Failed to duplicate invoice');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await invoiceService.update(id, { status: newStatus });
      fetchInvoices();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };



  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const statusOptions = ['All', 'Draft', 'Pending', 'Paid', 'Overdue', 'Cancelled'];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Invoices" 
        subtitle="Manage all invoices."
        action={<Button variant="primary" onClick={handleCreateInvoice}>Create Invoice</Button>}
      />
      
      <SectionContainer>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="w-full max-w-sm">
            <SearchInput 
              placeholder="Search invoices..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            {statusOptions.map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  statusFilter === status 
                    ? 'bg-primary text-white shadow-soft-purple' 
                    : 'bg-secondary text-text-secondary hover:text-white hover:bg-secondary/80'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-danger/10 text-danger p-4 rounded-lg mb-6 border border-danger/20 flex items-center justify-between">
            <span>{error}</span>
            <Button variant="ghost" onClick={fetchInvoices}>Retry</Button>
          </div>
        )}

        {isLoading ? (
          <LoadingSkeleton rows={5} columns={7} />
        ) : invoices.length > 0 ? (
          <>
            <TableContainer>
              <TableHead>
                <TableRow>
                  <TableHeader>Invoice Number</TableHeader>
                  <TableHeader>Customer</TableHeader>
                  <TableHeader>Invoice Date</TableHeader>
                  <TableHeader>Due Date</TableHeader>
                  <TableHeader>Total</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader className="text-right">Actions</TableHeader>
                </TableRow>
              </TableHead>
              <tbody>
                {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium text-white">{invoice.invoice_number}</TableCell>
                  <TableCell>{invoice.customer_name || '-'}</TableCell>
                  <TableCell>{formatDate(invoice.invoice_date)}</TableCell>
                  <TableCell>{formatDate(invoice.due_date)}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(invoice.total, invoice.currency)}</TableCell>
                  <TableCell>
                    <select 
                      value={invoice.status || 'draft'}
                      onChange={(e) => handleStatusChange(invoice.id, e.target.value)}
                      className="bg-secondary/50 border border-border rounded-lg text-xs font-medium px-2 py-1 outline-none focus:border-primary text-text-primary capitalize"
                    >
                      <option value="draft">Draft</option>
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => handleViewEdit(invoice.id)}
                        className="p-2 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="View / Edit"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleDuplicate(invoice.id)}
                        className="p-2 text-text-secondary hover:text-white hover:bg-secondary/80 rounded-lg transition-colors"
                        title="Duplicate"
                      >
                        <Copy size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(invoice)}
                        className="p-2 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </TableContainer>
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
        ) : (
          <EmptyState 
            icon={FileText}
            title={searchQuery || statusFilter !== 'All' ? "No matching invoices found" : "No invoices yet"}
            description={searchQuery || statusFilter !== 'All' ? "Try adjusting your search or filters." : "Create your first invoice to get started."}
            action={!(searchQuery || statusFilter !== 'All') && <Button variant="secondary" onClick={handleCreateInvoice}>Create Invoice</Button>}
          />
        )}
      </SectionContainer>

      <DeleteModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Invoice"
        message={`Are you sure you want to delete invoice ${selectedInvoice?.invoice_number}? This action cannot be undone.`}
        isLoading={isSubmitting}
      />
    </div>
  );
}
