import { useState, useEffect } from 'react';
import { Users, Edit2, Trash2 } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import SectionContainer from '../components/ui/SectionContainer';
import Button from '../components/ui/Button';
import SearchInput from '../components/ui/SearchInput';
import EmptyState from '../components/ui/EmptyState';
import TableContainer, { TableHead, TableRow, TableHeader, TableCell } from '../components/ui/TableContainer';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import CustomerModal from '../components/CustomerModal';
import DeleteModal from '../components/DeleteModal';
import Pagination from '../components/ui/Pagination';
import useDebounce from '../hooks/useDebounce';
import { customerService } from '../services/customerService';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, debouncedSearchQuery]);

  async function fetchCustomers() {
    setIsLoading(true);
    setError(null);
    try {
      // Create a URLSearchParams equivalent manually since our service might just take query strings
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/customers?page=${currentPage}&limit=10&search=${encodeURIComponent(debouncedSearchQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const response = await res.json();
      if (!res.ok) throw new Error(response.message || 'Failed to load customers');
      
      setCustomers(response.data || []);
      setTotalPages(response.meta?.totalPages || 1);
    } catch (err) {
      setError(err.message || 'Failed to load customers');
    } finally {
      setIsLoading(false);
    }
  }

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setIsCustomerModalOpen(true);
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setIsCustomerModalOpen(true);
  };

  const handleDeleteClick = (customer) => {
    setSelectedCustomer(customer);
    setIsDeleteModalOpen(true);
  };

  const handleSaveCustomer = async (formData) => {
    setIsSubmitting(true);
    try {
      if (selectedCustomer) {
        await customerService.update(selectedCustomer.id, formData);
      } else {
        await customerService.create(formData);
      }
      setIsCustomerModalOpen(false);
      fetchCustomers();
    } catch (err) {
      alert(err.message || 'Failed to save customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedCustomer) return;
    setIsSubmitting(true);
    try {
      await customerService.delete(selectedCustomer.id);
      setIsDeleteModalOpen(false);
      fetchCustomers();
    } catch (err) {
      alert(err.message || 'Failed to delete customer');
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="space-y-6">
      <PageHeader 
        title="Customers" 
        subtitle="Manage your clients and customer information."
        action={<Button variant="primary" onClick={handleAddCustomer}>Add Customer</Button>}
      />
      
      <SectionContainer>
        <div className="flex justify-between items-center mb-6 gap-4">
          <div className="w-full max-w-sm">
            <SearchInput 
              placeholder="Search customers..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="bg-danger/10 text-danger p-4 rounded-lg mb-6 border border-danger/20 flex items-center justify-between">
            <span>{error}</span>
            <Button variant="ghost" onClick={fetchCustomers}>Retry</Button>
          </div>
        )}

        {isLoading ? (
          <LoadingSkeleton rows={5} columns={6} />
        ) : customers.length > 0 ? (
          <>
            <TableContainer>
              <TableHead>
                <TableRow>
                  <TableHeader>Company Name</TableHeader>
                  <TableHeader>Contact Person</TableHeader>
                  <TableHeader>Email</TableHeader>
                  <TableHeader>Phone</TableHeader>
                  <TableHeader>City</TableHeader>
                  <TableHeader className="text-right">Actions</TableHeader>
                </TableRow>
              </TableHead>
              <tbody>
                {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium text-white">{customer.company_name}</TableCell>
                  <TableCell>{customer.contact_person || '-'}</TableCell>
                  <TableCell>{customer.email || '-'}</TableCell>
                  <TableCell>{customer.phone || '-'}</TableCell>
                  <TableCell>{customer.city || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEditCustomer(customer)}
                        className="p-2 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Edit Customer"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(customer)}
                        className="p-2 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                        title="Delete Customer"
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
            icon={Users}
            title={searchQuery ? "No matching customers found" : "No customers yet"}
            description={searchQuery ? "Try adjusting your search criteria." : "Create your first customer to get started."}
            action={!searchQuery && <Button variant="secondary" onClick={handleAddCustomer}>Create Customer</Button>}
          />
        )}
      </SectionContainer>

      <CustomerModal 
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSubmit={handleSaveCustomer}
        initialData={selectedCustomer}
        isLoading={isSubmitting}
      />

      <DeleteModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Customer"
        message={`Are you sure you want to delete ${selectedCustomer?.company_name}? This action cannot be undone.`}
        isLoading={isSubmitting}
      />
    </div>
  );
}
