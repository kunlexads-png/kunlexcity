import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'ADMIN' | 'CLIENT';
  phone?: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
}

export interface Property {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  listingType: 'SALE' | 'RENT' | 'LEASE';
  price: number;
  currency: string;
  country: string;
  state: string;
  city: string;
  area: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  toilets: number;
  parkingSpaces: number;
  propertySize: number; // in sqm
  landSize?: number; // in sqm
  amenities: string[];
  images: string[];
  status: 'AVAILABLE' | 'UNDER_OFFER' | 'SOLD' | 'RENTED';
  approvalStatus: 'APPROVED' | 'PENDING' | 'REJECTED';
  featured: boolean;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Inquiry {
  id: string;
  propertyId: string;
  propertyTitle: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  preferredContactMethod: 'WHATSAPP' | 'CALL' | 'EMAIL';
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  responseNotes?: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  propertyId: string;
  propertyTitle: string;
  userId?: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  inspectionDate: string;
  inspectionTime: string;
  inspectionType: 'IN_PERSON' | 'VIRTUAL_TOUR';
  notes?: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

export interface Transaction {
  id: string;
  propertyId: string;
  propertyTitle: string;
  transactionType: 'SALE' | 'RENTAL' | 'LEASE';
  amount: number;
  currency: string;
  buyerOrTenantName: string;
  buyerOrTenantEmail: string;
  buyerOrTenantPhone?: string;
  paymentStatus: 'PAID' | 'PENDING' | 'PARTIAL'; // Admin can see paid or pending to buy!
  referenceNumber: string;
  notes?: string;
  transactionDate: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  userName?: string;
  action: string;
  details: string;
  timestamp: string;
}

// In-Memory Database Store
class DataStore {
  users: User[] = [];
  properties: Property[] = [];
  inquiries: Inquiry[] = [];
  appointments: Appointment[] = [];
  transactions: Transaction[] = [];
  favourites: { userId: string; propertyId: string }[] = [];
  auditLogs: AuditLog[] = [];

  constructor() {
    this.seed();
  }

  seed() {
    // Admin user: email kunlex4star@gmail.com, password School42
    const adminPasswordHash = bcrypt.hashSync('School42', 10);
    const clientPasswordHash = bcrypt.hashSync('Client123!', 10);

    this.users = [
      {
        id: 'usr_admin',
        email: 'kunlex4star@gmail.com',
        passwordHash: adminPasswordHash,
        name: 'Kunle Alabi (Administrator)',
        role: 'ADMIN',
        phone: '+234 812 654 9870',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        bio: 'Managing Director & Chief Administrator, KunlexCity PrimeNest Realty.',
        createdAt: '2024-01-10T08:00:00Z',
      },
      {
        id: 'usr_client1',
        email: 'buyer.chinedu@investments.ng',
        passwordHash: clientPasswordHash,
        name: 'Chinedu Eze',
        role: 'CLIENT',
        phone: '+234 803 444 8899',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
        bio: 'Diaspora Private Buyer looking for luxury waterfront properties in Lagos.',
        createdAt: '2024-05-18T16:45:00Z',
      },
      {
        id: 'usr_client2',
        email: 'aisha.bello@capitalventures.ng',
        passwordHash: clientPasswordHash,
        name: 'Aisha Bello',
        role: 'CLIENT',
        phone: '+234 809 222 3344',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
        bio: 'Corporate investor acquiring diplomatic mansions in Maitama Abuja.',
        createdAt: '2024-06-01T12:00:00Z',
      },
    ];

    this.properties = [
      {
        id: 'prop-001',
        title: 'The Sovereign: 6-Bedroom Ultra-Luxury Waterfront Villa',
        slug: 'the-sovereign-waterfront-villa-banana-island',
        description: 'An architectural tour de force situated along the private shoreline of Banana Island, Ikoyi. Features an infinity-edge pool overlooking the Lagos Lagoon, temperature-controlled private wine cellar, bespoke marble finishing imported from Carrara, smart home automation by Savant, high-capacity hybrid solar & soundproof generator power backup, 2 private jetties, and expansive 4-room staff quarters.',
        category: 'Luxury Villa',
        listingType: 'SALE',
        price: 1850000000, // ₦1.85 Billion
        currency: 'NGN',
        country: 'Nigeria',
        state: 'Lagos',
        city: 'Lagos',
        area: 'Banana Island, Ikoyi',
        address: 'Zone B, Shoreline Drive, Banana Island, Ikoyi, Lagos',
        bedrooms: 6,
        bathrooms: 7,
        toilets: 8,
        parkingSpaces: 6,
        propertySize: 1250,
        landSize: 2200,
        amenities: [
          'Lagoon Waterfront',
          'Private Jetty',
          'Infinity Pool',
          '24/7 Smart Solar & Gen',
          'Smart Home Automation',
          'CCTV & Biometric Access',
          'Private Cinema',
          'Gym & Spa Suite',
          'Elevator',
          '4-Room BQ',
        ],
        images: [
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        ],
        status: 'AVAILABLE',
        approvalStatus: 'APPROVED',
        featured: true,
        viewsCount: 1420,
        createdAt: '2025-01-05T09:00:00Z',
        updatedAt: '2025-01-10T14:30:00Z',
      },
      {
        id: 'prop-002',
        title: 'Maitama Presidential Heights: 5-Bedroom Ambassadorial Mansion',
        slug: 'maitama-presidential-heights-abuja',
        description: 'Commanding an elevated vantage point in the prestigious diplomatic enclave of Maitama, Abuja. Boasts bullet-resistant security glazing, private perimeter sensor grid, Olympic-length swimming pool, banquet dining hall accommodating 30 guests, rooftop cigar lounge with panoramic Aso Rock views, and state-of-the-art climate control.',
        category: 'Mansion',
        listingType: 'SALE',
        price: 1450000000, // ₦1.45 Billion
        currency: 'NGN',
        country: 'Nigeria',
        state: 'FCT Abuja',
        city: 'Abuja',
        area: 'Maitama',
        address: '14 Gana Street Extension, Maitama, Abuja',
        bedrooms: 5,
        bathrooms: 6,
        toilets: 7,
        parkingSpaces: 8,
        propertySize: 980,
        landSize: 1800,
        amenities: [
          'Panoramic Aso Rock Views',
          'Olympic Swimming Pool',
          'Bullet-Resistant Glazing',
          'Perimeter Motion Sensors',
          'Rooftop Lounge',
          '24/7 Redundant Power',
          'Banquet Dining Room',
          'Fully Fitted Gourmet Kitchen',
          'Smart Access Control',
        ],
        images: [
          'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
        ],
        status: 'AVAILABLE',
        approvalStatus: 'APPROVED',
        featured: true,
        viewsCount: 980,
        createdAt: '2025-01-12T10:15:00Z',
        updatedAt: '2025-01-15T12:00:00Z',
      },
      {
        id: 'prop-003',
        title: 'Blue Horizon Oceanfront Penthouse',
        slug: 'blue-horizon-oceanfront-penthouse-vi',
        description: 'Luxurious duplex penthouse on the 18th floor offering unmatched 270-degree Atlantic Ocean vistas. Features soaring double-height floor-to-ceiling curtain walls, custom Italian Poliform cabinetry, private wraparound sky deck with heated jacuzzi, direct elevator keycard access, and automated motorized blinds.',
        category: 'Penthouse',
        listingType: 'RENT',
        price: 45000000, // ₦45 Million / year
        currency: 'NGN',
        country: 'Nigeria',
        state: 'Lagos',
        city: 'Lagos',
        area: 'Victoria Island',
        address: 'Ahmadu Bello Way, Victoria Island, Lagos',
        bedrooms: 4,
        bathrooms: 4,
        toilets: 5,
        parkingSpaces: 3,
        propertySize: 520,
        amenities: [
          'Direct Oceanfront View',
          'Wraparound Sky Deck',
          'Private Jacuzzi',
          'Direct Elevator Access',
          '24/7 Concierge Service',
          'State-of-the-art Gym',
          'Underground Parking',
          'Uninterrupted Power 24/7',
        ],
        images: [
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
        ],
        status: 'AVAILABLE',
        approvalStatus: 'APPROVED',
        featured: true,
        viewsCount: 2150,
        createdAt: '2024-11-20T08:00:00Z',
        updatedAt: '2025-01-02T11:00:00Z',
      },
      {
        id: 'prop-004',
        title: 'The Haven: 5-Bedroom Contemporary Smart Duplex',
        slug: 'the-haven-contemporary-smart-duplex-lekki-1',
        description: 'Brand new contemporary masterpiece located in a secure gated street in Lekki Phase 1. Features high ceilings, floating cantilever staircase, fully fitted open-concept chef kitchen with Miele appliances, private swimming pool, bespoke walk-in closets, cinema room, stamped concrete driveway, and treated clean borehole water system.',
        category: 'Contemporary Duplex',
        listingType: 'SALE',
        price: 420000000, // ₦420 Million
        currency: 'NGN',
        country: 'Nigeria',
        state: 'Lagos',
        city: 'Lagos',
        area: 'Lekki Phase 1',
        address: 'Admiralty Way Enclave, Lekki Phase 1, Lagos',
        bedrooms: 5,
        bathrooms: 5,
        toilets: 6,
        parkingSpaces: 4,
        propertySize: 650,
        landSize: 600,
        amenities: [
          'Swimming Pool',
          'Private Cinema',
          'Fitted Chef Kitchen',
          'Smart Lighting & Sound',
          'Clean Industrial Water Filter',
          'CCTV Security Systems',
          'BQ Attached',
          'Automated Gate',
        ],
        images: [
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1200&q=80',
        ],
        status: 'UNDER_OFFER',
        approvalStatus: 'APPROVED',
        featured: true,
        viewsCount: 1870,
        createdAt: '2025-01-18T14:00:00Z',
        updatedAt: '2025-01-22T09:30:00Z',
      },
      {
        id: 'prop-005',
        title: 'Bourdillon Smart Residences: 4-Bedroom Luxury Terraced Duplex',
        slug: 'bourdillon-smart-residence-ikoyi-lagos',
        description: 'Exquisite multi-level terrace located on prestigious Bourdillon Road, Ikoyi. Features state-of-the-art smart lighting, marble flooring, private rooftop lounge, communal swimming pool and gym, 24/7 dedicated generator power, and full Governor’s Consent title.',
        category: 'Terrace Duplex',
        listingType: 'SALE',
        price: 280000000, // ₦280 Million
        currency: 'NGN',
        country: 'Nigeria',
        state: 'Lagos',
        city: 'Lagos',
        area: 'Ikoyi',
        address: 'Bourdillon Corridor, Ikoyi, Lagos',
        bedrooms: 4,
        bathrooms: 4,
        toilets: 5,
        parkingSpaces: 3,
        propertySize: 450,
        landSize: 500,
        amenities: [
          'Communal Swimming Pool',
          'Rooftop Terrace',
          'Smart Home Controls',
          '24/7 Dedicated Power',
          'Modern Gym',
          'Uniformed Security',
          'Governor’s Consent',
        ],
        images: [
          'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',
        ],
        status: 'AVAILABLE',
        approvalStatus: 'APPROVED',
        featured: true,
        viewsCount: 1320,
        createdAt: '2025-01-22T10:00:00Z',
        updatedAt: '2025-01-25T11:00:00Z',
      },
      {
        id: 'prop-006',
        title: 'Guzape Crest: 5-Bedroom Hilltop Architectural Villa',
        slug: 'guzape-crest-hilltop-villa-abuja',
        description: 'Stunning contemporary hillside villa in Guzape, Abuja, offering commanding panoramic views over the city. Built with an infinity lap pool overlooking the valley, double-volume living room, German-fitted kitchen, elevator, private basement cinema, and high-security solar backup.',
        category: 'Luxury Villa',
        listingType: 'SALE',
        price: 680000000, // ₦680 Million
        currency: 'NGN',
        country: 'Nigeria',
        state: 'FCT Abuja',
        city: 'Abuja',
        area: 'Guzape',
        address: 'Hilltop Crest Enclave, Guzape District, Abuja',
        bedrooms: 5,
        bathrooms: 6,
        toilets: 7,
        parkingSpaces: 6,
        propertySize: 850,
        landSize: 1200,
        amenities: [
          'Infinity Lap Pool',
          'Panoramic Valley Views',
          'Private Elevator',
          'Underground Cinema',
          'Solar Inverter Redundancy',
          'Smart Access Gate',
          'C of O Title',
        ],
        images: [
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
        ],
        status: 'AVAILABLE',
        approvalStatus: 'APPROVED',
        featured: false,
        viewsCount: 890,
        createdAt: '2025-01-24T15:30:00Z',
        updatedAt: '2025-01-26T14:15:00Z',
      },
      {
        id: 'prop-007',
        title: 'Eko Atlantic Marina: 3-Bedroom Oceanfront Executive Suite',
        slug: 'eko-atlantic-marina-suite-lagos',
        description: 'Ultra-modern 3-bedroom luxury apartment overlooking the new marina in Eko Atlantic City. Designed for global executives, offering round-the-clock district cooling, independent city clean water and 100% uninterrupted power grid, infinity ocean pool, and coastal promenade access.',
        category: 'Apartment',
        listingType: 'RENT',
        price: 28000000, // ₦28 Million / year
        currency: 'NGN',
        country: 'Nigeria',
        state: 'Lagos',
        city: 'Lagos',
        area: 'Eko Atlantic City',
        address: 'Marina Boulevard, Eko Atlantic City, Victoria Island, Lagos',
        bedrooms: 3,
        bathrooms: 3,
        toilets: 4,
        parkingSpaces: 2,
        propertySize: 310,
        amenities: [
          'Marina & Oceanfront Views',
          'Independent City Power Grid',
          'District Cooling',
          'Concierge & Valet',
          'Olympic Pool & Tennis Court',
          'High-Speed Fiber Optic',
        ],
        images: [
          'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
        ],
        status: 'AVAILABLE',
        approvalStatus: 'APPROVED',
        featured: false,
        viewsCount: 1640,
        createdAt: '2025-01-27T08:00:00Z',
        updatedAt: '2025-01-29T10:00:00Z',
      },
      {
        id: 'prop-008',
        title: 'Ikeja GRA Executive Haven: 5-Bedroom Detached Manor',
        slug: 'ikeja-gra-executive-manor-lagos',
        description: 'Immaculately constructed 5-bedroom detached residence nestled in quiet, tree-lined Ikeja GRA. Perfectly situated 10 minutes from Murtala Muhammed International Airport. Features a swimming pool, private gazebo, 2-bedroom staff quarters, borehole with industrial filtration, and solar hybrid backup.',
        category: 'Detached Duplex',
        listingType: 'SALE',
        price: 310000000, // ₦310 Million
        currency: 'NGN',
        country: 'Nigeria',
        state: 'Lagos',
        city: 'Lagos',
        area: 'Ikeja GRA',
        address: 'Isaac John Corridor, Ikeja GRA, Lagos',
        bedrooms: 5,
        bathrooms: 5,
        toilets: 6,
        parkingSpaces: 5,
        propertySize: 620,
        landSize: 800,
        amenities: [
          'Private Swimming Pool',
          'Gazebo & Manicured Lawn',
          '10 Mins to International Airport',
          'Solar Hybrid Inverter',
          '2-Room Staff Quarters',
          'Perimeter CCTV Grid',
          'Governor’s Consent',
        ],
        images: [
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1200&q=80',
        ],
        status: 'AVAILABLE',
        approvalStatus: 'APPROVED',
        featured: false,
        viewsCount: 1110,
        createdAt: '2025-01-28T12:00:00Z',
        updatedAt: '2025-01-30T16:00:00Z',
      },
      {
        id: 'prop-009',
        title: 'Lekki Phase 1 Waterfront: 4-Bedroom Luxury Townhouse',
        slug: 'lekki-phase-1-waterfront-townhouse',
        description: 'Contemporary waterfront 4-bedroom townhouse in prime Lekki Phase 1 near Admiralty Way. Features lagoon breezes, fully fitted kitchen, swimming pool, soundproof generator, and 24/7 security patrol.',
        category: 'Townhouse',
        listingType: 'RENT',
        price: 18000000, // ₦18 Million / year
        currency: 'NGN',
        country: 'Nigeria',
        state: 'Lagos',
        city: 'Lagos',
        area: 'Lekki Phase 1',
        address: 'Admiralty Enclave, Lekki Phase 1, Lagos',
        bedrooms: 4,
        bathrooms: 4,
        toilets: 5,
        parkingSpaces: 3,
        propertySize: 380,
        amenities: [
          'Lagoon Breeze View',
          'Communal Swimming Pool',
          'Fully Fitted Kitchen',
          'Soundproof Generator',
          '24/7 Armed Patrol',
        ],
        images: [
          'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
        ],
        status: 'AVAILABLE',
        approvalStatus: 'APPROVED',
        featured: false,
        viewsCount: 1450,
        createdAt: '2025-01-29T14:00:00Z',
        updatedAt: '2025-01-31T09:00:00Z',
      },
      {
        id: 'prop-010',
        title: 'Old GRA Diplomatic Estate: 6-Bedroom Executive Compound',
        slug: 'old-gra-diplomatic-compound-port-harcourt',
        description: 'Majestic 6-bedroom executive residence located in the heart of Old GRA, Port Harcourt. Built on an expansive plot with swimming pool, security sentry post, industrial water borehole, and executive boardroom suite.',
        category: 'Mansion',
        listingType: 'SALE',
        price: 450000000, // ₦450 Million
        currency: 'NGN',
        country: 'Nigeria',
        state: 'Rivers',
        city: 'Port Harcourt',
        area: 'Old GRA',
        address: 'Forces Avenue Corridor, Old GRA, Port Harcourt',
        bedrooms: 6,
        bathrooms: 6,
        toilets: 7,
        parkingSpaces: 8,
        propertySize: 920,
        landSize: 1600,
        amenities: [
          'Swimming Pool & Pool House',
          'Executive Boardroom Suite',
          'Security Sentry Post',
          'Industrial Water Filtration',
          '24/7 Redundant Power',
          'Title: C of O',
        ],
        images: [
          'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
        ],
        status: 'AVAILABLE',
        approvalStatus: 'APPROVED',
        featured: true,
        viewsCount: 780,
        createdAt: '2025-01-30T10:00:00Z',
        updatedAt: '2025-02-01T15:00:00Z',
      },
    ];

    this.inquiries = [
      {
        id: 'inq-001',
        propertyId: 'prop-001',
        propertyTitle: 'The Sovereign: 6-Bedroom Ultra-Luxury Waterfront Villa',
        userId: 'usr_client1',
        name: 'Chinedu Eze',
        email: 'buyer.chinedu@investments.ng',
        phone: '+234 803 444 8899',
        message: 'Hello, I want to confirm legal Governor’s Consent status and arrange payment escrow.',
        preferredContactMethod: 'WHATSAPP',
        status: 'IN_PROGRESS',
        responseNotes: 'Governor’s Consent verified. Draft sales agreement sent.',
        createdAt: '2025-01-20T14:10:00Z',
      },
      {
        id: 'inq-002',
        propertyId: 'prop-004',
        propertyTitle: 'The Haven: 5-Bedroom Contemporary Smart Duplex',
        userId: 'usr_client2',
        name: 'Aisha Bello',
        email: 'aisha.bello@capitalventures.ng',
        phone: '+234 809 222 3344',
        message: 'I am ready to proceed with purchasing this duplex. Please confirm deposit requirements.',
        preferredContactMethod: 'EMAIL',
        status: 'NEW',
        createdAt: '2025-01-28T16:00:00Z',
      },
    ];

    this.appointments = [
      {
        id: 'apt-001',
        propertyId: 'prop-001',
        propertyTitle: 'The Sovereign: 6-Bedroom Ultra-Luxury Waterfront Villa',
        userId: 'usr_client1',
        clientName: 'Chinedu Eze',
        clientEmail: 'buyer.chinedu@investments.ng',
        clientPhone: '+234 803 444 8899',
        inspectionDate: '2025-02-15',
        inspectionTime: '11:00 AM',
        inspectionType: 'IN_PERSON',
        notes: 'Client requests gate security pass and structural survey report.',
        status: 'CONFIRMED',
        createdAt: '2025-01-22T09:00:00Z',
      },
      {
        id: 'apt-002',
        propertyId: 'prop-004',
        propertyTitle: 'The Haven: 5-Bedroom Contemporary Smart Duplex',
        userId: 'usr_client2',
        clientName: 'Aisha Bello',
        clientEmail: 'aisha.bello@capitalventures.ng',
        clientPhone: '+234 809 222 3344',
        inspectionDate: '2025-02-18',
        inspectionTime: '03:30 PM',
        inspectionType: 'VIRTUAL_TOUR',
        notes: 'Virtual walkthrough via WhatsApp video.',
        status: 'PENDING',
        createdAt: '2025-01-29T11:45:00Z',
      },
    ];

    // Client/Buyer purchase records (both PAID and PENDING to buy)
    this.transactions = [
      {
        id: 'tx-001',
        propertyId: 'prop-004',
        propertyTitle: 'The Haven: 5-Bedroom Contemporary Smart Duplex',
        transactionType: 'SALE',
        amount: 420000000,
        currency: 'NGN',
        buyerOrTenantName: 'Chinedu Eze',
        buyerOrTenantEmail: 'buyer.chinedu@investments.ng',
        buyerOrTenantPhone: '+234 803 444 8899',
        paymentStatus: 'PAID', // Buyer has PAID
        referenceNumber: 'PNR-2025-PAID-9014',
        notes: 'Full payment confirmed via bank escrow. Deed of assignment executed.',
        transactionDate: '2025-01-26T11:00:00Z',
      },
      {
        id: 'tx-002',
        propertyId: 'prop-001',
        propertyTitle: 'The Sovereign: 6-Bedroom Ultra-Luxury Waterfront Villa',
        transactionType: 'SALE',
        amount: 1850000000,
        currency: 'NGN',
        buyerOrTenantName: 'Aisha Bello',
        buyerOrTenantEmail: 'aisha.bello@capitalventures.ng',
        buyerOrTenantPhone: '+234 809 222 3344',
        paymentStatus: 'PENDING', // Buyer is PENDING to buy / pending escrow clearance
        referenceNumber: 'PNR-2025-PEND-1022',
        notes: 'Offer letter signed. Pending final wire transfer clearance.',
        transactionDate: '2025-01-30T15:30:00Z',
      },
      {
        id: 'tx-003',
        propertyId: 'prop-003',
        propertyTitle: 'Blue Horizon Oceanfront Penthouse',
        transactionType: 'RENTAL',
        amount: 45000000,
        currency: 'NGN',
        buyerOrTenantName: 'Dr. Kunle Alabi',
        buyerOrTenantEmail: 'kunlex4star@gmail.com',
        buyerOrTenantPhone: '+234 812 654 9870',
        paymentStatus: 'PAID',
        referenceNumber: 'PNR-2025-RENT-7712',
        notes: 'Annual executive tenancy payment completed.',
        transactionDate: '2025-01-15T10:00:00Z',
      },
    ];

    this.favourites = [
      { userId: 'usr_client1', propertyId: 'prop-001' },
      { userId: 'usr_client1', propertyId: 'prop-004' },
      { userId: 'usr_client2', propertyId: 'prop-002' },
    ];

    this.auditLogs = [
      {
        id: 'log-001',
        userId: 'usr_admin',
        userName: 'Kunle Alabi (Admin)',
        action: 'PROPERTY_PUBLISHED',
        details: 'Admin published "The Sovereign Waterfront Villa"',
        timestamp: '2025-01-10T14:30:00Z',
      },
      {
        id: 'log-002',
        userId: 'usr_admin',
        userName: 'Kunle Alabi (Admin)',
        action: 'PAYMENT_CONFIRMED',
        details: 'Confirmed payment PNR-2025-PAID-9014 for Chinedu Eze (₦420,000,000)',
        timestamp: '2025-01-26T11:30:00Z',
      },
    ];
  }

  findUserByEmail(email: string) {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string) {
    return this.users.find((u) => u.id === id);
  }

  logActivity(userId: string | undefined, userName: string | undefined, action: string, details: string) {
    this.auditLogs.unshift({
      id: 'log-' + Date.now(),
      userId,
      userName,
      action,
      details,
      timestamp: new Date().toISOString(),
    });
  }
}

export const db = new DataStore();
