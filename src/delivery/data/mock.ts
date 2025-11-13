export type Product = 'Buffalo Milk' | 'Cow Milk';

export type Customer = {
  id: string;
  userId: string;
  name: string;
  phone: string;
  address?: string;
  product: Product;
  rate: number; // per liter in INR
  plan: string;
  planType: string;
  preferredShift?: 'morning' | 'evening';
  createdAt: string;
  updatedAt: string;
};

export type DeliveryAgent = {
  id: string;
  ownerId: string;
  name: string;
  phone: string;
  area?: string;
  loginId?: string;
  createdAt: string;
  updatedAt: string;
};

export type Assignment = {
  id: string;
  ownerId: string;
  customerId: string;
  deliveryAgentId: string;
  date: string; // yyyy-mm-dd
  shift: 'morning' | 'evening';
  liters: number;
  delivered: boolean;
  assignedAt: string;
  unassignedAt?: string | null;
};

export const PRODUCTS: Record<Product, { price: number }> = {
  'Buffalo Milk': { price: 70 },
  'Cow Milk': { price: 60 },
};

const isoDate = (offsetDays = 0) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

const timestamp = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString();
};

export const OWNER_ID = 'owner-001';
export const USER_ID = 'user-001';

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    userId: USER_ID,
    name: 'Nikunj Gami',
    phone: '9876543210',
    address: 'Samvaad Sonnet',
    product: 'Buffalo Milk',
    rate: 70,
    plan: '1.0 L / day',
    planType: 'Daily',
    createdAt: timestamp(-10),
    updatedAt: timestamp(-1),
  },
  {
    id: 'c2',
    userId: USER_ID,
    name: 'Paresh Gami',
    phone: '9726502930',
    address: 'Near City Mall',
    product: 'Cow Milk',
    rate: 68,
    plan: '0.5 L / day',
    planType: 'Daily',
    createdAt: timestamp(-14),
    updatedAt: timestamp(-2),
  },
  {
    id: 'c3',
    userId: USER_ID,
    name: 'Chetan Gami',
    phone: '9898989898',
    address: 'Sunrise Residency',
    product: 'Buffalo Milk',
    rate: 70,
    plan: '2.0 L / day',
    planType: 'Daily',
    createdAt: timestamp(-30),
    updatedAt: timestamp(-3),
  },
  {
    id: 'c4',
    userId: USER_ID,
    name: 'Denis',
    phone: '9623456780',
    address: 'Lake View',
    product: 'Buffalo Milk',
    rate: 65,
    plan: '1.5 L / day',
    planType: 'Daily',
    createdAt: timestamp(-5),
    updatedAt: timestamp(-1),
  },
];

export const INITIAL_DELIVERY_AGENTS: DeliveryAgent[] = [
  {
    id: 'd1',
    ownerId: OWNER_ID,
    name: 'Mahesh Patel',
    phone: '9988776655',
    area: 'Sector 1',
    loginId: 'mahesh.p',
    createdAt: timestamp(-60),
    updatedAt: timestamp(-1),
  },
  {
    id: 'd2',
    ownerId: OWNER_ID,
    name: 'Ravi Sharma',
    phone: '9876501234',
    area: 'Sector 2',
    loginId: 'ravi.s',
    createdAt: timestamp(-45),
    updatedAt: timestamp(-2),
  },
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'a1',
    ownerId: OWNER_ID,
    customerId: 'c1',
    deliveryAgentId: 'd1',
    date: isoDate(),
    shift: 'morning',
    liters: 1.0,
    delivered: true,
    assignedAt: timestamp(-1),
    unassignedAt: null,
  },
  {
    id: 'a2',
    ownerId: OWNER_ID,
    customerId: 'c2',
    deliveryAgentId: 'd1',
    date: isoDate(),
    shift: 'morning',
    liters: 0.5,
    delivered: true,
    assignedAt: timestamp(-1),
    unassignedAt: null,
  },
  {
    id: 'a3',
    ownerId: OWNER_ID,
    customerId: 'c3',
    deliveryAgentId: 'd2',
    date: isoDate(),
    shift: 'evening',
    liters: 2,
    delivered: false,
    assignedAt: timestamp(-1),
    unassignedAt: null,
  },
  {
    id: 'a4',
    ownerId: OWNER_ID,
    customerId: 'c4',
    deliveryAgentId: 'd2',
    date: isoDate(-1),
    shift: 'morning',
    liters: 1.5,
    delivered: true,
    assignedAt: timestamp(-2),
    unassignedAt: null,
  },
];

export function formatINR(n: number) {
  return '₹' + n.toFixed(0);
}

export function litersToAmount(product: Product, liters: number) {
  const price = PRODUCTS[product].price;
  return price * liters;
}
