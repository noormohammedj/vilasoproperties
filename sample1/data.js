/* Vilaso Properties - prototype content (sample1).
   Everything the site shows lives here, so it can be edited without touching the layout code.
   From Instagram (@vilaso_properties): Emirates Garden, La Evora, phone numbers, approvals, distances, banks.
   ILLUSTRATIVE: all prices, past rates and projections are placeholders until Vilaso shares real figures.
   Projects marked sample:true are made-up examples to show how more listings would look. */
window.VILASO = {
  brand: 'Vilaso Properties',
  tagline: 'Crafting spaces where your vilasam begins',
  city: 'Dindigul',
  phones: ['95972 15558', '99407 37230'],
  whatsapp: '919597215558',
  instagram: 'https://www.instagram.com/vilaso_properties/',
  banks: ['SBI', 'ICICI Bank', 'PNB', 'Federal Bank', 'Piramal Finance'],
  years: { y10: 2016, y5: 2021, y2: 2024, now: 2026, p2: 2028, p5: 2031, p10: 2036 },

  // Area rates (Rs per sq ft, plots) used in every comparison. Illustrative.
  localities: {
    'Kuttiyapatti Pirivu': 1350,
    'Trichy Road': 1650,
    'Old Karur Road': 1550,
    'Palani Road': 1400,
    'Natham Road': 1200,
    'Batlagundu Road': 1100,
    'Begampur': 1800,
    'Vedasandur Road': 950
  },
  // Built-up rates (Rs per sq ft, villas & apartments). Illustrative.
  localitiesBuilt: {
    'Old Karur Road': 4900,
    'Trichy Road': 5100,
    'Begampur': 5400,
    'Palani Road': 4600,
    'Natham Road': 4100,
    'Batlagundu Road': 3900,
    'Kuttiyapatti Pirivu': 4500
  },

  amenities: [
    { k: 'approved', t: 'DTCP & RERA approved', d: 'Layouts cleared by DTCP, registered under TN RERA. Clear title, legal check done for you.' },
    { k: 'road', t: 'Blacktop roads', d: 'Wide tar roads inside the layout, laid before you buy, not promised after.' },
    { k: 'light', t: 'Street lights', d: 'Every street lit from day one, so the layout feels lived-in and safe at night.' },
    { k: 'water', t: 'Water & drainage', d: 'Water line and underground drainage planned into the layout.' },
    { k: 'gate', t: 'Gated community', d: 'Compound wall, arch gate and a single secure entry.' },
    { k: 'park', t: 'Park & play area', d: 'Green park and children\u2019s play space inside the community.' },
    { k: 'bank', t: 'Bank loans arranged', d: 'Approved with SBI, ICICI, PNB, Federal Bank and Piramal. We handle the paperwork.' },
    { k: 'visit', t: 'Free site visit', d: 'Pick-up and drop for your family to see the plot before you decide.' },
    { k: 'reg', t: 'Registration support', d: 'Patta, registration and EB connection guided end to end.' },
    { k: 'resale', t: 'Resale help', d: 'When it\u2019s time to sell, we list and show your plot to our buyers.' }
  ],

  projects: [
    {
      slug: 'emirates-garden', name: 'Emirates Garden', kind: 'Plots', status: 'Now selling', tag: 'Best value',
      area: 'Kuttiyapatti Pirivu', address: 'Near Kuttiyapatti Pirivu, Dindigul \u2013 2 km from the new bus stand',
      approvals: ['DTCP', 'RERA'], sizes: '600 \u2013 2,400 sq ft', minSize: 1200,
      line: 'Premium DTCP & RERA approved plots inside city limits, minutes from the new bus stand.',
      price: { y10: 420, y5: 640, y2: 930, now: 1190, p2: 1420, p5: 1850, p10: 2750 },
      palette: ['#eef2e8', '#cddcc4', '#c8202a'], motif: 'plots',
      highlights: ['DTCP & RERA approved layout', 'Prime location within city limits', 'Fully gated community', 'Blacktop roads and street lights', 'Water, drainage and park', 'Limited plots \u2013 bank loans available'],
      why: [
        ['2 km from the new bus stand', 'The new Dindigul bus stand pulls shops, offices and homes toward this side of the city.'],
        ['Priced below the area', 'Plots nearby trade higher. You buy in before the gap closes.'],
        ['Ready to build', 'Roads, lights, water and drainage are in. Start your house when you want.'],
        ['Easy to finance', 'Approved by five banks, so a plot loan is a short conversation.']
      ],
      nearby: [['1 km', 'Kuttiyapatti Pirivu bus stop'], ['2 km', 'The Indian Public School'], ['2 km', 'New bus stand'], ['4 km', 'Reliance Smart Point'], ['6 km', 'Dindigul GH'], ['6 km', 'Dindigul Junction']],
      compare: ['Kuttiyapatti Pirivu', 'Begampur', 'Trichy Road', 'Old Karur Road', 'Palani Road', 'Natham Road']
    },
    {
      slug: 'la-evora', name: 'La Evora', kind: 'Villas', status: 'Launching soon', tag: 'Launching soon',
      area: 'Old Karur Road', address: 'RVS Nagar, Old Karur Road, Dindigul \u2013 near RVS College',
      approvals: ['DTCP', 'RERA applied'], sizes: '3 BHK villas \u00b7 1,450 \u2013 2,100 sq ft', minSize: 1450,
      line: 'Gated luxury villas on Old Karur Road. Where elegance meets everyday living.',
      price: { y10: 2100, y5: 2900, y2: 3700, now: 4300, p2: 4950, p5: 6000, p10: 8100 },
      palette: ['#f6ecdc', '#e2cba8', '#c8202a'], motif: 'villa',
      highlights: ['Independent 3 BHK villas', 'Grand arch entrance and landscaped avenue', 'Near RVS College, Old Karur Road', 'Clubhouse and walking track', 'Launch price for early buyers', 'Bank loans available'],
      why: [
        ['Launch-stage pricing', 'Early buyers lock the launch rate before the first price revision.'],
        ['A street that\u2019s already growing', 'RVS College and new homes keep demand high on Old Karur Road.'],
        ['Rent-ready', 'Faculty and families nearby make villas easy to rent out.'],
        ['Built to last', 'Vilaso builds, not just sells: one team from layout to handover.']
      ],
      nearby: [['0.5 km', 'RVS College of Engineering'], ['3 km', 'Old Karur Road junction'], ['5 km', 'Dindigul GH'], ['6 km', 'Dindigul Junction']],
      compare: ['Old Karur Road', 'Begampur', 'Trichy Road', 'Palani Road', 'Natham Road'],
      builtUp: true
    },
    {
      slug: 'vilaso-township', name: 'Vilaso Township', kind: 'Township', status: 'Sample listing', tag: 'High growth', sample: true,
      area: 'Palani Road', address: 'Palani Road, Dindigul (sample)',
      approvals: ['DTCP'], sizes: '800 \u2013 3,000 sq ft', minSize: 1000,
      line: 'A full township with schools, shops and parks planned in. Buy a plot in a ready neighbourhood.',
      price: { y10: 380, y5: 560, y2: 840, now: 1090, p2: 1330, p5: 1780, p10: 2700 },
      palette: ['#edf1f4', '#c9d5df', '#2c5d80'], motif: 'gate',
      highlights: ['120-acre planned township', 'Commercial street inside', 'School and hospital sites reserved', 'Avenue trees on every road'],
      why: [['Everything inside', 'Daily needs inside the gate.'], ['Big-layout safety', 'Hundreds of families, one security team.']],
      nearby: [['3 km', 'Palani Road bypass'], ['7 km', 'Dindigul Junction']],
      compare: ['Palani Road', 'Kuttiyapatti Pirivu', 'Natham Road', 'Batlagundu Road']
    },
    {
      slug: 'vilaso-residences', name: 'Vilaso Residences', kind: 'Apartments', status: 'Sample listing', tag: 'Rent ready', sample: true,
      area: 'Trichy Road', address: 'Trichy Road, Dindigul (sample)',
      approvals: ['DTCP', 'RERA'], sizes: '2 & 3 BHK \u00b7 1,050 \u2013 1,480 sq ft', minSize: 1050,
      line: 'Low-rise premium apartments with lift, parking and power backup.',
      price: { y10: 2400, y5: 3100, y2: 3900, now: 4500, p2: 5150, p5: 6200, p10: 8300 },
      palette: ['#f2edf3', '#d8cadf', '#7a4a8c'], motif: 'tower',
      highlights: ['G+4 with lift', 'Covered parking', '24\u00d77 power backup', 'Rooftop garden'],
      why: [['Steady rent', 'Close to offices on Trichy Road.'], ['Low upkeep', 'Maintenance handled by the association.']],
      nearby: [['1 km', 'Trichy Road bus stop'], ['4 km', 'Dindigul Junction']],
      compare: ['Trichy Road', 'Begampur', 'Old Karur Road'],
      builtUp: true
    },
    {
      slug: 'kodai-view-villas', name: 'Kodai View Villas', kind: 'Villas', status: 'Sample listing', tag: 'Hill view', sample: true,
      area: 'Batlagundu Road', address: 'Batlagundu Road, Dindigul (sample)',
      approvals: ['DTCP'], sizes: '2 & 3 BHK \u00b7 1,200 \u2013 1,800 sq ft', minSize: 1200,
      line: 'Quiet villas facing the Sirumalai hills, on the road to Kodaikanal.',
      price: { y10: 1700, y5: 2300, y2: 2950, now: 3400, p2: 3900, p5: 4750, p10: 6400 },
      palette: ['#edf3ee', '#c3d7c7', '#2e7a48'], motif: 'hills',
      highlights: ['Hill-facing villas', 'Private garden', 'Solar water heater', 'Gated with CCTV'],
      why: [['Holiday-home demand', 'Weekend buyers from Madurai and Coimbatore.'], ['Cool, green and calm', 'Hill air without leaving the city.']],
      nearby: [['8 km', 'Sirumalai foothills'], ['9 km', 'Dindigul Junction']],
      compare: ['Batlagundu Road', 'Palani Road', 'Natham Road'],
      builtUp: true
    },
    {
      slug: 'natham-road-plots', name: 'Natham Road Plots', kind: 'Plots', status: 'Sample listing', tag: 'Low entry', sample: true,
      area: 'Natham Road', address: 'Natham Road, Dindigul (sample)',
      approvals: ['DTCP'], sizes: '600 \u2013 1,500 sq ft', minSize: 800,
      line: 'Starter plots with the lowest entry price in a corridor that is just waking up.',
      price: { y10: 300, y5: 450, y2: 680, now: 890, p2: 1080, p5: 1450, p10: 2200 },
      palette: ['#f8ece6', '#e6c6b9', '#c8202a'], motif: 'field',
      highlights: ['Plots from under \u20b98 lakh', 'Corner plots available', 'Blacktop approach road'],
      why: [['Lowest ticket', 'Start investing with a small amount.'], ['Corridor growth', 'New road widening planned.']],
      nearby: [['2 km', 'Natham Road junction'], ['8 km', 'Dindigul Junction']],
      compare: ['Natham Road', 'Vedasandur Road', 'Batlagundu Road', 'Kuttiyapatti Pirivu']
    }
  ]
};
