export const CATEGORIES = [
  { id: 'all', label: 'All', icon: 'LayoutGrid' },
  { id: 'Laptop Parts', label: 'Laptop Parts', icon: 'Laptop' },
  { id: 'Desktop Parts', label: 'Desktop Parts', icon: 'Monitor' },
  { id: 'RAM & SSD', label: 'RAM & SSD', icon: 'MemoryStick' },
  { id: 'Motherboards', label: 'Motherboards', icon: 'CircuitBoard' },
  { id: 'Displays', label: 'Displays', icon: 'Tv' },
  { id: 'Chargers', label: 'Chargers', icon: 'Zap' },
  { id: 'Processors', label: 'Processors', icon: 'Cpu' },
  { id: 'Accessories', label: 'Accessories', icon: 'Package' },
  { id: 'Printers', label: 'Printers', icon: 'Printer' },
  { id: 'Networking', label: 'Networking', icon: 'Wifi' },
  { id: 'Other', label: 'Other', icon: 'MoreHorizontal' },
];

export const CONDITIONS = ['New', 'Used', 'Refurbished', 'Any'];

export const DURATIONS = [
  { value: 24, label: '24 Hours', description: 'Standard' },
  { value: 48, label: '48 Hours', description: 'Extended' },
  { value: 72, label: '72 Hours', description: 'Maximum' },
];

export const BUSINESS_TYPES = [
  'Laptop & Computer Retailer',
  'Computer Hardware Wholesaler',
  'Laptop Repair & Service',
  'Computer Accessories Retailer',
  'IT Equipment Supplier',
  'Spare Parts Supplier',
  'Computer Hardware Retailer',
  'Other',
];

export const SPECIALIZATIONS = [
  'Laptop Parts',
  'Desktop Parts',
  'RAM & SSD',
  'Motherboards',
  'Displays',
  'Chargers',
  'Processors',
  'Accessories',
  'Printers',
  'Networking',
];

export const CATEGORY_COLORS = {
  'Laptop Parts': { bg: '#EAF3F9', text: '#176FA9' },
  'Desktop Parts': { bg: '#EDE9FE', text: '#7C3AED' },
  'RAM & SSD': { bg: '#E7F8F5', text: '#21AFA9' },
  'Motherboards': { bg: '#FEF3C7', text: '#D97706' },
  'Displays': { bg: '#FCE7F3', text: '#DB2777' },
  'Chargers': { bg: '#FEF9C3', text: '#CA8A04' },
  'Processors': { bg: '#DCFCE7', text: '#16A34A' },
  'Accessories': { bg: '#F3F4F6', text: '#4B5563' },
  'Printers': { bg: '#FFF7ED', text: '#EA580C' },
  'Networking': { bg: '#EFF6FF', text: '#2563EB' },
  'Other': { bg: '#F9FAFB', text: '#6B7280' },
};
