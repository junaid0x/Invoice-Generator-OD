import PageHeader from '../components/ui/PageHeader';
import SectionContainer from '../components/ui/SectionContainer';
import Card, { CardContent, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import SearchInput from '../components/ui/SearchInput';
import Badge from '../components/ui/Badge';
import TableContainer, { TableHead, TableRow, TableHeader, TableCell } from '../components/ui/TableContainer';
import EmptyState from '../components/ui/EmptyState';
import { Palette } from 'lucide-react';

export default function DesignPreview() {
  return (
    <div>
      <PageHeader 
        title="Design System Preview" 
        subtitle="A playground displaying the Ocean Developers premium corporate UI language."
        action={<Button variant="primary">Primary Action</Button>}
      />

      <SectionContainer>
        <Card>
          <CardHeader>
            <h2 className="text-xl">Buttons & Badges</h2>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-6 items-center">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="danger">Danger Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            
            <div className="h-8 w-px bg-border mx-2"></div>
            
            <Badge variant="primary">Primary Badge</Badge>
            <Badge variant="success">Success Badge</Badge>
            <Badge variant="danger">Danger Badge</Badge>
            <Badge variant="neutral">Neutral Badge</Badge>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h2 className="text-xl">Inputs</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input label="Email Address" placeholder="admin@oceandevelopers.com" />
              <Input label="Password" type="password" placeholder="••••••••" error="Password must be at least 8 characters" />
              <SearchInput placeholder="Search records..." />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl">Empty State</h2>
            </CardHeader>
            <CardContent>
              <EmptyState 
                icon={Palette} 
                title="No items found" 
                description="There are currently no items matching your criteria. Try adjusting your filters."
                action={<Button variant="secondary">Clear Filters</Button>}
              />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-xl">Table Container</h2>
          </CardHeader>
          <TableContainer>
            <TableHead>
              <TableRow>
                <TableHeader>Invoice ID</TableHeader>
                <TableHeader>Customer</TableHeader>
                <TableHeader>Amount</TableHeader>
                <TableHeader>Status</TableHeader>
              </TableRow>
            </TableHead>
            <tbody>
              <TableRow>
                <TableCell className="font-medium text-white">#INV-001</TableCell>
                <TableCell>Acme Corp</TableCell>
                <TableCell>$1,250.00</TableCell>
                <TableCell><Badge variant="success">Paid</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-white">#INV-002</TableCell>
                <TableCell>Globex Inc</TableCell>
                <TableCell>$3,400.00</TableCell>
                <TableCell><Badge variant="neutral">Pending</Badge></TableCell>
              </TableRow>
            </tbody>
          </TableContainer>
        </Card>
      </SectionContainer>
    </div>
  );
}
