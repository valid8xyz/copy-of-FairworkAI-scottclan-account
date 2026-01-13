
import { Award, PenaltyRates, AwardDocument } from './types';

export const STANDARD_PENALTIES: PenaltyRates = {
  saturday: 1.25,
  sunday: 1.5,
  publicHoliday: 2.25,
  overtime: 1.5,
  nightShift: 1.15
};

// Simplified mock database of popular awards to ensure functionality without heavy API token usage for everything
export const MOCK_AWARDS: Award[] = [
  {
    code: 'MA000004',
    name: 'General Retail Industry Award',
    industry: 'Retail',
    penaltyRates: {
      saturday: 1.25,
      sunday: 1.5,
      publicHoliday: 2.25,
      overtime: 1.5,
      nightShift: 1.30 // Higher night shift for retail
    },
    allowances: [
      { name: 'Laundry Allowance', amount: 6.25 },
      { name: 'Meal Allowance', amount: 20.01 },
    ],
    classifications: [
      { id: 'R1', title: 'Retail Employee Level 1', baseRate: 25.27, casualLoading: 0.25, description: 'Shop assistant, entry level' },
      { id: 'R4', title: 'Retail Employee Level 4', baseRate: 28.50, casualLoading: 0.25, description: 'Team leader, supervisor' },
    ]
  },
  {
    code: 'MA000009',
    name: 'Hospitality Industry (General) Award',
    industry: 'Hospitality',
    penaltyRates: {
      saturday: 1.25,
      sunday: 1.50, // Standard hospitality
      publicHoliday: 2.25,
      overtime: 1.5,
      nightShift: 1.15 
    },
    allowances: [
       { name: 'Split Shift Allowance', amount: 4.87 },
       { name: 'Tool Allowance', amount: 12.50 },
    ],
    classifications: [
      { id: 'H2', title: 'Food & Beverage Attendant Grade 2', baseRate: 24.08, casualLoading: 0.25, description: 'Waiter, barista' },
      { id: 'H3', title: 'Food & Beverage Attendant Grade 3', baseRate: 25.12, casualLoading: 0.25, description: 'Senior waiter, bar attendant' },
      { id: 'C3', title: 'Cook Grade 3', baseRate: 26.15, casualLoading: 0.25, description: 'Qualified cook' },
    ]
  },
  {
    code: 'MA000010',
    name: 'Manufacturing and Associated Industries and Occupations Award',
    industry: 'Manufacturing',
    penaltyRates: {
      saturday: 1.50, // Higher sat rate in some trades
      sunday: 2.0,    // Double time sunday
      publicHoliday: 2.5,
      overtime: 1.5,
      nightShift: 1.15
    },
    allowances: [
      { name: 'Leading Hand Allowance', amount: 45.20 },
      { name: 'First Aid Allowance', amount: 19.36 },
    ],
    classifications: [
      { id: 'C10', title: 'Engineering/Production Employee Level C10', baseRate: 26.55, casualLoading: 0.25, description: 'Basic machine operator' },
      { id: 'C7', title: 'Engineering/Production Employee Level C7', baseRate: 30.15, casualLoading: 0.25, description: 'Tradesperson' },
    ]
  }
];

export const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

// Metadata for popular awards to facilitate dynamic searching
// Based on the Fair Work list of 122 Modern Awards
export const POPULAR_AWARDS_METADATA: AwardDocument[] = [
  // Retail & Hospitality
  {
    title: 'General Retail Industry Award',
    awardCode: 'MA000004',
    description: 'Definitive pay guide for retail employees, including penalty rates and allowances.',
    industry: 'Retail',
    source: 'static'
  },
  {
    title: 'Hospitality Industry (General) Award',
    awardCode: 'MA000009',
    description: 'Pay rates for hotels, restaurants, and bars, including casual loading and split shifts.',
    industry: 'Hospitality',
    source: 'static'
  },
  {
    title: 'Restaurant Industry Award',
    awardCode: 'MA000119',
    description: 'Specific rates for standalone restaurants, cafes, and roadhouses.',
    industry: 'Hospitality',
    source: 'static'
  },
  {
    title: 'Fast Food Industry Award',
    awardCode: 'MA000003',
    description: 'For employees in the fast food industry.',
    industry: 'Hospitality',
    source: 'static'
  },
  {
    title: 'Registered and Licensed Clubs Award',
    awardCode: 'MA000058',
    description: 'Covers employees in registered and licensed clubs.',
    industry: 'Hospitality',
    source: 'static'
  },

  // Health & Care
  {
    title: 'Aged Care Award',
    awardCode: 'MA000018',
    description: 'Covers aged care employees.',
    industry: 'Health & Care',
    source: 'static'
  },
  {
    title: 'Social, Community, Home Care and Disability Services Industry Award',
    awardCode: 'MA000100',
    description: 'SCHADS award for community and disability services.',
    industry: 'Health & Care',
    source: 'static'
  },
  {
    title: 'Health Professionals and Support Services Award',
    awardCode: 'MA000027',
    description: 'For health professionals and support staff.',
    industry: 'Health & Care',
    source: 'static'
  },
  {
    title: 'Nurses Award',
    awardCode: 'MA000034',
    description: 'Covers nursing professionals.',
    industry: 'Health & Care',
    source: 'static'
  },
  {
    title: 'Children\'s Services Award',
    awardCode: 'MA000120',
    description: 'For childcare workers and early childhood educators.',
    industry: 'Education',
    source: 'static'
  },
  {
    title: 'Educational Services (Teachers) Award',
    awardCode: 'MA000077',
    description: 'For teachers in the school education industry.',
    industry: 'Education',
    source: 'static'
  },

  // Trades & Construction
  {
    title: 'Building and Construction General On-site Award',
    awardCode: 'MA000020',
    description: 'Covers general building and construction industry.',
    industry: 'Construction',
    source: 'static'
  },
  {
    title: 'Electrical, Electronic and Communications Contracting Award',
    awardCode: 'MA000025',
    description: 'For electrical and communications trades.',
    industry: 'Trades',
    source: 'static'
  },
  {
    title: 'Plumbing and Fire Sprinklers Award',
    awardCode: 'MA000036',
    description: 'Covers plumbing and fire sprinkler fitting.',
    industry: 'Trades',
    source: 'static'
  },
  {
    title: 'Manufacturing and Associated Industries and Occupations Award',
    awardCode: 'MA000010',
    description: 'Broad coverage for manufacturing industries.',
    industry: 'Manufacturing',
    source: 'static'
  },
  {
    title: 'Vehicle Repair, Services and Retail Award',
    awardCode: 'MA000089',
    description: 'For vehicle repair, service, and retail sectors.',
    industry: 'Trades',
    source: 'static'
  },

  // Admin & Professional
  {
    title: 'Clerks — Private Sector Award',
    awardCode: 'MA000002',
    description: 'Covers administrative and clerical employees in the private sector.',
    industry: 'Admin & Clerical',
    source: 'static'
  },
  {
    title: 'Professional Employees Award',
    awardCode: 'MA000065',
    description: 'Covers information technology, engineering and science professionals.',
    industry: 'Professional',
    source: 'static'
  },
  {
    title: 'Banking, Finance and Insurance Award',
    awardCode: 'MA000019',
    description: 'For banking, finance and insurance sectors.',
    industry: 'Finance',
    source: 'static'
  },
  {
    title: 'Real Estate Industry Award',
    awardCode: 'MA000106',
    description: 'For employees in the real estate industry.',
    industry: 'Real Estate',
    source: 'static'
  },
  {
    title: 'Legal Services Award',
    awardCode: 'MA000116',
    description: 'For law firms and legal services.',
    industry: 'Professional',
    source: 'static'
  },

  // Services
  {
    title: 'Cleaning Services Award',
    awardCode: 'MA000022',
    description: 'For contract cleaning services.',
    industry: 'Services',
    source: 'static'
  },
  {
    title: 'Hair and Beauty Industry Award',
    awardCode: 'MA000005',
    description: 'For employees in the hair and beauty industry.',
    industry: 'Beauty',
    source: 'static'
  },
  {
    title: 'Security Services Industry Award',
    awardCode: 'MA000016',
    description: 'For security guards and crowd controllers.',
    industry: 'Services',
    source: 'static'
  },
  {
    title: 'Transport (Cash in Transit) Award',
    awardCode: 'MA000042',
    description: 'For cash in transit transport.',
    industry: 'Transport',
    source: 'static'
  },
  {
    title: 'Road Transport and Distribution Award',
    awardCode: 'MA000038',
    description: 'For road transport and distribution.',
    industry: 'Transport',
    source: 'static'
  },
  {
    title: 'Passenger Vehicle Transportation Award',
    awardCode: 'MA000063',
    description: 'For bus and coach drivers.',
    industry: 'Transport',
    source: 'static'
  },

  // Other
  {
    title: 'Pastoral Award',
    awardCode: 'MA000035',
    description: 'Agriculture and farming.',
    industry: 'Agriculture',
    source: 'static'
  },
  {
    title: 'Horticulture Award',
    awardCode: 'MA000028',
    description: 'Fruit and vegetable growing.',
    industry: 'Agriculture',
    source: 'static'
  },
  {
    title: 'Mining Industry Award',
    awardCode: 'MA000011',
    description: 'For the mining industry.',
    industry: 'Mining',
    source: 'static'
  },
  {
    title: 'Miscellaneous Award',
    awardCode: 'MA000104',
    description: 'Catch-all award for employees not covered by other awards.',
    industry: 'General',
    source: 'static'
  }
];
