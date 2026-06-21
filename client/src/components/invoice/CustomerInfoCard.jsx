import { User, Mail, Phone, MapPin } from 'lucide-react';

export default function CustomerInfoCard({ customer }) {
  if (!customer) return null;

  return (
    <div className="mt-4 text-sm">
      <h3 className="text-base font-bold text-white mb-2">{customer.company_name}</h3>
      <div className="space-y-1.5 text-text-secondary">
        {customer.contact_person && (
          <div className="flex items-start gap-2">
            <User size={14} className="mt-0.5 shrink-0 opacity-70" />
            <span>{customer.contact_person}</span>
          </div>
        )}
        {customer.email && (
          <div className="flex items-start gap-2">
            <Mail size={14} className="mt-0.5 shrink-0 opacity-70" />
            <span className="break-all">{customer.email}</span>
          </div>
        )}
        {customer.phone && (
          <div className="flex items-start gap-2">
            <Phone size={14} className="mt-0.5 shrink-0 opacity-70" />
            <span>{customer.phone}</span>
          </div>
        )}
        {(customer.address || customer.city) && (
          <div className="flex items-start gap-2">
            <MapPin size={14} className="mt-0.5 shrink-0 opacity-70" />
            <span>
              {[customer.address, customer.city, customer.province, customer.country, customer.postal_code].filter(Boolean).join(', ')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
