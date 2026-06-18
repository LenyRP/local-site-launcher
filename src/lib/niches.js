export const NICHES = [
  { value: 'pressure-washing', label: 'Pressure Washing' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'roofing', label: 'Roofing' },
  { value: 'hvac', label: 'HVAC / Air Conditioning' },
  { value: 'landscaping', label: 'Landscaping / Lawn Care' },
  { value: 'pest-control', label: 'Pest Control' },
  { value: 'concrete-coatings', label: 'Concrete Coatings / Epoxy' },
  { value: 'pool-service', label: 'Pool Service & Repair' },
  { value: 'septic', label: 'Septic Service' },
  { value: 'tree-service', label: 'Tree Service' },
  { value: 'painting', label: 'Painting (Interior / Exterior)' },
  { value: 'flooring', label: 'Flooring' },
  { value: 'fence', label: 'Fence Installation' },
  { value: 'gutters', label: 'Gutters & Gutter Guards' },
  { value: 'windows', label: 'Window Installation & Repair' },
  { value: 'handyman', label: 'Handyman Services' },
  { value: 'junk-removal', label: 'Junk Removal' },
  { value: 'moving', label: 'Moving Services' },
  { value: 'cleaning', label: 'House Cleaning' },
]

const NICHE_DATA = {
  'pressure-washing': {
    displayName: 'Pressure Washing',
    services: [
      { slug: 'house-washing', title: 'House & Soft Washing', desc: 'Safe low-pressure soft washing removes mold, mildew, and algae from siding, stucco, and painted surfaces without damage.' },
      { slug: 'driveway-cleaning', title: 'Driveway & Concrete Cleaning', desc: 'High-pressure surface cleaning strips oil stains, rust, tire marks, and years of grime from concrete and pavers.' },
      { slug: 'roof-cleaning', title: 'Roof Soft Washing', desc: 'Non-pressure roof treatment kills black streaks (Gloeocapsa magma algae) and extends shingle life by 5–10 years.' },
      { slug: 'deck-fence-washing', title: 'Deck & Fence Cleaning', desc: 'Restore weathered wood and composite decks. Remove green mildew, gray oxidation, and embedded dirt before sealing.' },
      { slug: 'commercial-washing', title: 'Commercial Pressure Washing', desc: 'Storefronts, parking lots, drive-throughs, and fleet vehicles. Scheduled contracts available for property managers.' },
      { slug: 'concrete-sealing', title: 'Concrete Sealing & Paver Sealing', desc: 'Post-clean sealer application protects driveways and pavers from staining, UV fade, and freeze-thaw cracking.' },
    ],
    faqs: (city) => [
      { q: `How much does pressure washing cost in ${city}?`, a: `Most residential jobs in the ${city} area run $150–$400 depending on square footage and surface type. Driveways average $100–$175; full house washes $200–$400. We give free on-site quotes.` },
      { q: 'What is soft washing and when is it used?', a: 'Soft washing uses low pressure (under 500 PSI) combined with biodegradable cleaning solutions to kill mold, algae, and bacteria at the source. We use it on roofs, painted siding, stucco, and any surface that would be damaged by high pressure.' },
      { q: `How often should I pressure wash my home in ${city}?`, a: `Florida's humidity and heat accelerate mold and algae growth. Most ${city} homeowners benefit from a full exterior wash once a year, with driveways cleaned every 12–18 months.` },
      { q: 'Do you use bleach? Is it safe for plants?', a: 'We use sodium hypochlorite solutions at appropriate dilutions, which is industry-standard for killing biological growth. We pre-wet all landscaping before washing and rinse thoroughly afterward. Our mixes are plant-safe at application concentration.' },
      { q: 'Will pressure washing remove oil stains from my driveway?', a: 'Hot-water pressure washing with degreaser removes most oil and grease stains. Very old, deeply set stains may lighten but not fully disappear. We assess each driveway and set realistic expectations before starting.' },
    ],
  },
  'plumbing': {
    displayName: 'Plumbing',
    services: [
      { slug: 'drain-cleaning', title: 'Drain Cleaning & Unclogging', desc: 'Camera inspection and professional drain snaking or hydro-jetting for kitchen, bath, and main line clogs.' },
      { slug: 'water-heater', title: 'Water Heater Installation & Repair', desc: 'Tank and tankless water heater service, replacement, and flush. Same-day service available.' },
      { slug: 'leak-repair', title: 'Leak Detection & Repair', desc: 'Non-invasive leak detection finds hidden slab leaks, pipe leaks, and fixture leaks before they cause structural damage.' },
      { slug: 'repiping', title: 'Repiping Services', desc: 'Whole-home copper or PEX repiping for homes with corroded galvanized or polybutylene pipes.' },
      { slug: 'fixture-installation', title: 'Fixture Installation', desc: 'Faucet, toilet, shower, sink, and garbage disposal installation and replacement.' },
      { slug: 'emergency-plumbing', title: '24/7 Emergency Plumbing', desc: 'Burst pipes, sewage backups, and flooding don\'t wait for business hours. We\'re available around the clock.' },
    ],
    faqs: (city) => [
      { q: `How much does a plumber cost in ${city}?`, a: `Plumbing rates in the ${city} area typically run $75–$150 per hour, plus parts. Simple jobs like faucet replacement run $100–$200; drain cleaning $150–$300; water heater replacement $800–$1,500 installed.` },
      { q: 'How do I know if I have a slab leak?', a: 'Warning signs include unexplained increases in your water bill, hot spots on your floor, the sound of running water when nothing is on, and cracks in walls or floors. Call us immediately — slab leaks worsen quickly.' },
      { q: 'What causes low water pressure?', a: 'Common causes include corroded or partially closed shutoff valves, failing pressure regulators, mineral buildup in pipes or aerators, and municipal supply issues. We diagnose the cause before recommending repairs.' },
      { q: `Do you offer emergency plumbing in ${city}?`, a: `Yes. We provide 24/7 emergency plumbing throughout the ${city} area. Burst pipes, sewage backups, and active flooding require immediate response — call us any hour of the day or night.` },
      { q: 'How long does repiping a house take?', a: 'A typical single-family home takes 2–4 days depending on size and access. We work section by section to minimize time without water. We coordinate drywall repair and restore water service each night if needed.' },
    ],
  },
  'roofing': {
    displayName: 'Roofing',
    services: [
      { slug: 'roof-replacement', title: 'Roof Replacement', desc: 'Full tear-off and installation of architectural shingles, metal roofing, or tile systems with manufacturer warranty.' },
      { slug: 'roof-repair', title: 'Roof Repair', desc: 'Leak repair, missing shingles, flashing repair, and storm damage fixes. Fast response to prevent interior damage.' },
      { slug: 'roof-inspection', title: 'Roof Inspection', desc: 'Detailed photo inspection with written report. Ideal for home purchases, insurance renewals, and storm assessments.' },
      { slug: 'metal-roofing', title: 'Metal Roofing', desc: 'Standing seam and metal shingle systems with 40–50 year lifespans and superior Florida wind resistance.' },
      { slug: 'flat-roofing', title: 'Flat & Low-Slope Roofing', desc: 'TPO, EPDM, and modified bitumen systems for commercial buildings, additions, and flat-roof homes.' },
      { slug: 'storm-damage', title: 'Storm Damage Restoration', desc: 'Insurance claim assistance, wind and hail damage documentation, and coordinated restoration from inspection to final.' },
    ],
    faqs: (city) => [
      { q: `How much does a new roof cost in ${city}?`, a: `Roof replacement in the ${city} area typically runs $7,000–$18,000 for a standard home, depending on square footage, pitch, material, and decking condition. We provide detailed written estimates at no charge.` },
      { q: 'How long does a roof last in Florida?', a: 'Asphalt architectural shingles last 20–25 years in Florida\'s climate. Metal roofs last 40–50 years. Tile can last 50+ years. UV exposure and storm activity reduce lifespans compared to northern climates — regular inspections catch problems early.' },
      { q: 'Will my insurance cover a new roof?', a: 'Florida homeowner policies typically cover storm-related damage (wind, hail, falling objects). Coverage depends on your policy terms and the cause of damage. We provide detailed inspection reports and can assist with your insurance claim process.' },
      { q: `How long does roof replacement take in ${city}?`, a: `Most residential roofs in ${city} are completed in 1–3 days. Larger homes, complex rooflines, or material availability can extend this. We work to minimize disruption and clean up thoroughly each day.` },
      { q: 'What roofing material is best for Florida?', a: 'Metal roofing offers the best combination of wind resistance, longevity, and energy efficiency for Florida. Architectural shingles are the most cost-effective. Concrete tile is excellent for HOA-required aesthetics. We recommend based on your budget, HOA rules, and long-term plans.' },
    ],
  },
  'hvac': {
    displayName: 'HVAC',
    services: [
      { slug: 'ac-repair', title: 'AC Repair', desc: 'Fast diagnosis and repair of all AC brands. Refrigerant leaks, capacitor failures, compressor issues, and more.' },
      { slug: 'ac-installation', title: 'AC Installation & Replacement', desc: 'Energy-efficient system sizing and installation. We match equipment to your home\'s exact cooling load.' },
      { slug: 'ac-maintenance', title: 'AC Tune-Up & Maintenance', desc: 'Annual or bi-annual maintenance plans to maximize efficiency, catch failures early, and extend equipment life.' },
      { slug: 'duct-work', title: 'Ductwork Installation & Repair', desc: 'Leaky ducts waste 20–30% of cooling energy. We seal, repair, and replace ductwork for maximum efficiency.' },
      { slug: 'indoor-air-quality', title: 'Indoor Air Quality', desc: 'UV air purifiers, HEPA filtration, whole-home dehumidifiers, and ERV systems for healthier indoor air.' },
      { slug: 'heat-pump', title: 'Heat Pump Installation', desc: 'Modern inverter-driven heat pumps provide efficient year-round cooling and heating for Florida\'s mild winters.' },
    ],
    faqs: (city) => [
      { q: `How much does AC repair cost in ${city}?`, a: `Common AC repairs in the ${city} area run $150–$650 depending on the issue. Capacitor replacement: $150–$250. Refrigerant recharge: $200–$500. Compressor replacement: $1,200–$2,500. We diagnose before quoting.` },
      { q: 'Why is my AC not cooling?', a: 'The most common causes are low refrigerant (usually from a leak), a failed capacitor, a dirty evaporator or condenser coil, a frozen evaporator coil, or a failed compressor. We run a full diagnostic to identify the exact cause before any repair.' },
      { q: `How often should I service my AC in ${city}?`, a: `Florida AC systems run nearly year-round, so twice-annual maintenance is ideal — once before summer and once in fall. At minimum, change filters every 1–2 months and schedule one professional tune-up per year to catch issues before they become failures.` },
      { q: 'What size AC unit do I need?', a: 'Sizing is calculated using Manual J load calculations — square footage, ceiling height, insulation, window area, orientation, and local climate data. An oversized unit short-cycles, wastes energy, and fails to dehumidify. We size every system correctly.' },
      { q: 'How long does AC installation take?', a: 'A standard split system replacement takes 4–8 hours. New construction or complete system overhauls with ductwork can take 1–3 days. We protect your home and clean up completely.' },
    ],
  },
  'tree-service': {
    displayName: 'Tree Service',
    services: [
      { slug: 'tree-removal', title: 'Tree Removal', desc: 'Safe removal of dead, diseased, hazardous, or storm-damaged trees. Full cleanup and haul-away included.' },
      { slug: 'tree-trimming', title: 'Tree Trimming & Pruning', desc: 'Crown thinning, deadwood removal, and shape pruning to improve health, safety, and appearance.' },
      { slug: 'stump-grinding', title: 'Stump Grinding', desc: 'Stump ground 6–12 inches below grade. Grindings returned to fill hole or hauled away.' },
      { slug: 'storm-cleanup', title: 'Storm Damage Cleanup', desc: 'Emergency response for fallen trees, storm-damaged limbs, and debris blocking access. Available 24/7.' },
      { slug: 'palm-trimming', title: 'Palm Tree Trimming', desc: 'Proper hurricane cut and frond removal for sabal palms, royal palms, and cabbage palms. Prevents boot accumulation.' },
      { slug: 'lot-clearing', title: 'Land & Lot Clearing', desc: 'Complete lot clearing for new construction, overgrown properties, and invasive species removal.' },
    ],
    faqs: (city) => [
      { q: `How much does tree removal cost in ${city}?`, a: `Tree removal in the ${city} area typically runs $300–$2,000+ depending on tree size, location, and complexity. Small trees under 25 ft: $200–$500. Large trees over 60 ft: $1,000–$3,000. We provide free on-site estimates.` },
      { q: 'Do I need a permit to remove a tree in Florida?', a: 'It depends on your municipality and tree species. Many Florida cities require permits for removing protected trees (live oaks, certain palms) above a set diameter. We know local ordinances and can advise on permit requirements before starting any removal.' },
      { q: 'How do I know if a tree needs to come down?', a: 'Signs include large dead sections (>50% crown), fungal growth at the base, major trunk damage, root decay, severe lean, or contact with power lines or structures. When in doubt, a certified arborist assessment gives you a written recommendation.' },
      { q: `What is the best time of year for tree trimming in ${city}?`, a: `Late winter to early spring (January–March) is ideal for most trees — before new growth starts. For oaks, avoid trimming March–July when beetle-transmitted oak wilt is most active. Palms can be trimmed year-round but should be cut only when fronds are fully brown.` },
      { q: 'Is stump grinding included in tree removal?', a: 'Stump grinding is typically quoted separately. Many customers add it; some prefer to grind later or leave stumps for landscaping. We price each component so you can choose what works for your project and budget.' },
    ],
  },
  'septic': {
    displayName: 'Septic Service',
    services: [
      { slug: 'septic-pumping', title: 'Septic Tank Pumping', desc: 'Full pump-out with solids removal. Most tanks need pumping every 3–5 years depending on household size.' },
      { slug: 'septic-inspection', title: 'Septic Inspection', desc: 'DBPR-compliant inspection with written report. Required for real estate transactions and permit applications.' },
      { slug: 'drainfield-repair', title: 'Drainfield Repair & Restoration', desc: 'Aerobic treatment, jetting, and Terralift restoration before full replacement. Often saves thousands.' },
      { slug: 'septic-installation', title: 'New Septic Installation', desc: 'Complete engineered septic system design, permitting, installation, and inspection for new construction and replacements.' },
      { slug: 'lift-station', title: 'Lift Station Service', desc: 'Pump repair, replacement, and routine maintenance for residential and commercial lift stations.' },
      { slug: 'grease-trap', title: 'Grease Trap Cleaning', desc: 'Restaurant and commercial kitchen grease trap pumping, cleaning, and compliance documentation.' },
    ],
    faqs: (city) => [
      { q: `How much does septic pumping cost in ${city}?`, a: `Septic tank pumping in the ${city} area typically runs $250–$450 for a standard 1,000–1,500 gallon tank. Larger tanks, difficult access, or excessive solids buildup may cost more. Call us for an exact quote.` },
      { q: 'How often should I pump my septic tank?', a: 'The Florida Department of Health recommends pumping every 3–5 years for a typical household. Larger households, garbage disposals, or tanks smaller than 1,000 gallons may need more frequent service. We record service dates and can set up reminders.' },
      { q: 'What are signs my septic system is failing?', a: 'Warning signs include slow drains throughout the house, sewage odors indoors or in the yard, wet or spongy ground over the drainfield, unusually green or lush grass over the drainfield, and backups in the lowest drains first.' },
      { q: 'How long does a septic system last in Florida?', a: 'A properly maintained concrete tank typically lasts 40+ years. The drainfield lifespan is 20–30 years depending on soil conditions, usage, and maintenance. Sandy Florida soils can reduce drainfield life if the tank isn\'t pumped regularly.' },
      { q: `Do you service septic systems in all of ${city}?`, a: `Yes. We service residential and commercial septic systems throughout the ${city} area and surrounding communities. Call us to confirm coverage for your specific address — we dispatch same-day for most service calls.` },
    ],
  },
  'landscaping': {
    displayName: 'Landscaping',
    services: [
      { slug: 'lawn-maintenance', title: 'Lawn Mowing & Maintenance', desc: 'Weekly or bi-weekly mowing, edging, trimming, and blowing. Contracts available for residential and commercial.' },
      { slug: 'landscape-design', title: 'Landscape Design & Installation', desc: 'Custom planting plans with native and drought-tolerant species. From concept to installation.' },
      { slug: 'sod-installation', title: 'Sod Installation', desc: 'St. Augustine, Zoysia, and Bahia sod installed with proper grading and irrigation coordination.' },
      { slug: 'irrigation', title: 'Irrigation Installation & Repair', desc: 'Sprinkler system design, installation, and repair. Smart controller upgrades to reduce water bills.' },
      { slug: 'mulching', title: 'Mulching & Bed Maintenance', desc: 'Fresh mulch installation, weed control, bed edging, and annual color rotations.' },
      { slug: 'tree-shrub-care', title: 'Tree & Shrub Care', desc: 'Trimming, shaping, fertilization, and pest treatment for ornamental trees and shrubs.' },
    ],
    faqs: (city) => [
      { q: `How much does lawn care cost in ${city}?`, a: `Lawn maintenance in the ${city} area typically runs $35–$75 per visit for a standard residential lot, depending on size and service frequency. Monthly maintenance contracts start around $120–$200 and include mowing, edging, and blowing.` },
      { q: 'What type of grass grows best in Florida?', a: 'St. Augustine is the most common Florida lawn grass — it tolerates shade and establishes quickly. Zoysia handles drought and traffic well. Bahia is low-maintenance for large areas. We recommend based on your sun exposure, soil type, and irrigation situation.' },
      { q: 'When should I fertilize my lawn in Florida?', a: 'Florida\'s lawn fertilization windows are typically March–April and September–October, following county ordinances that restrict applications before heavy rain periods. We follow St. Johns, Duval, and Flagler county fertilizer ordinances to keep you compliant.' },
      { q: 'How often should I water my lawn?', a: 'Florida Water Management Districts restrict irrigation to 2 days per week. Most established lawns need about 3/4 inch of water per session, applied in early morning. Overwatering causes fungal problems and shallow root growth.' },
      { q: `Do you offer commercial lawn care in ${city}?`, a: `Yes. We service commercial properties including HOAs, office parks, retail centers, and multifamily communities throughout the ${city} area. We provide proof of insurance, detailed service logs, and dedicated account management.` },
    ],
  },
  'pest-control': {
    displayName: 'Pest Control',
    services: [
      { slug: 'general-pest', title: 'General Pest Control', desc: 'Quarterly or monthly treatment for ants, roaches, silverfish, earwigs, and common household pests.' },
      { slug: 'termite-treatment', title: 'Termite Treatment & Prevention', desc: 'Subterranean and drywood termite treatment using Termidor HE, Sentricon baiting, or fumigation.' },
      { slug: 'mosquito-control', title: 'Mosquito Control', desc: 'In2Care mosquito stations and barrier treatment to reduce mosquito populations on your property.' },
      { slug: 'rodent-control', title: 'Rodent Exclusion & Removal', desc: 'Inspection, trapping, and exclusion sealing for rats and mice. Attic sanitation and insulation replacement available.' },
      { slug: 'bed-bug-treatment', title: 'Bed Bug Treatment', desc: 'Heat treatment and chemical protocols for bed bugs in residential, hotel, and multi-family settings.' },
      { slug: 'lawn-pest', title: 'Lawn & Ornamental Pest Control', desc: 'Chinch bugs, sod webworms, grubs, and ornamental pest treatment to protect your landscape investment.' },
    ],
    faqs: (city) => [
      { q: `How much does pest control cost in ${city}?`, a: `General pest control in the ${city} area runs $50–$75 per quarterly service or $100–$150 for one-time treatments. Termite treatment varies widely: $500–$2,500 for localized treatment; $2,000–$6,000 for whole-home fumigation.` },
      { q: 'How often should I spray for pests in Florida?', a: 'Florida\'s warm, humid climate means pest pressure is year-round. Most homeowners benefit from quarterly pest control, with monthly service for higher pest pressure situations or active infestations. We tailor frequency to your specific needs.' },
      { q: 'Are pest control chemicals safe for pets and children?', a: 'We use EPA-registered products applied by licensed technicians at label-approved rates. We recommend keeping pets and children off treated surfaces until dry (typically 30–60 minutes). We use targeted application methods to minimize product use.' },
      { q: 'How do I know if I have termites?', a: 'Signs include mud tubes along foundation walls, hollow-sounding wood when tapped, discarded wings near windows (especially in spring swarm season), and small piles of frass (drywood termite droppings). Florida has some of the highest termite pressure in the U.S. — annual inspections are recommended.' },
      { q: `Do you offer a pest control warranty in ${city}?`, a: `Yes. Our quarterly and monthly service programs come with a service guarantee — if pests return between treatments, we re-treat at no charge. Termite treatment warranties vary by treatment type and are explained in detail before you sign.` },
    ],
  },
  'concrete-coatings': {
    displayName: 'Concrete Coatings',
    services: [
      { slug: 'garage-floor-coating', title: 'Garage Floor Coating', desc: 'Polyaspartic or epoxy garage floor systems with decorative flake, UV resistance, and 1-day installation.' },
      { slug: 'pool-deck-coating', title: 'Pool Deck Coatings', desc: 'Micro-topping, cool deck resurfacing, and textured overlay systems for pool decks — cooler underfoot and slip-resistant.' },
      { slug: 'patio-coating', title: 'Patio & Lanai Coatings', desc: 'Decorative overlays, stamped concrete resurfacing, and solid-color sealers for outdoor living spaces.' },
      { slug: 'commercial-flooring', title: 'Commercial Flooring Systems', desc: 'Industrial epoxy, quartz broadcast systems, and MMA coatings for warehouses, shops, and food service facilities.' },
      { slug: 'concrete-repair', title: 'Concrete Crack Repair', desc: 'Crack injection, grinding, and surface prep before coating application — proper prep is what makes coatings last.' },
      { slug: 'decorative-concrete', title: 'Decorative Concrete Overlays', desc: 'Stamped overlay, micro-topping, and metallic epoxy systems for a custom look over existing concrete.' },
    ],
    faqs: (city) => [
      { q: `How much does a garage floor coating cost in ${city}?`, a: `Garage floor coating in the ${city} area typically runs $3–$8 per square foot installed. A standard 2-car garage (500 sq ft) runs $1,500–$4,000 depending on the system (epoxy vs. polyaspartic) and prep required.` },
      { q: 'What is the difference between epoxy and polyaspartic?', a: 'Epoxy is thicker and more chemical-resistant but yellows under UV exposure and takes longer to cure (24–72 hours). Polyaspartic is UV-stable, cures in hours (often installed in one day), and handles Florida heat and humidity better. We typically use polyaspartic topcoats over epoxy base coats for the best result.' },
      { q: 'How long does a garage floor coating last?', a: 'A professionally installed polyaspartic system with proper surface prep lasts 15–20 years in a residential garage with normal use. The key is diamond-grinding the concrete to proper profile before application — adhesion failures come from skipping prep.' },
      { q: 'Can you coat a garage floor that has moisture problems?', a: 'Moisture vapor transmission can cause coating delamination. We test moisture levels before application and use moisture-mitigating primers where needed. Severe cases may require exterior drainage corrections first.' },
      { q: `How long does a garage floor coating take in ${city}?`, a: `Most garage floor jobs are completed in 1 day using polyaspartic systems. We apply the base coat, broadcast decorative flake, and apply the topcoat in a single visit. Light foot traffic is possible after 4–6 hours; vehicle traffic after 24 hours.` },
    ],
  },
  'pool-service': {
    displayName: 'Pool Service',
    services: [
      { slug: 'pool-cleaning', title: 'Weekly Pool Cleaning', desc: 'Chemical balancing, skimming, brushing, vacuuming, and basket cleaning on a weekly maintenance schedule.' },
      { slug: 'pool-repair', title: 'Pool Equipment Repair', desc: 'Pump, filter, heater, salt cell, and automation system repair. Most repairs completed same-day or next-day.' },
      { slug: 'pool-equipment', title: 'Pool Equipment Replacement', desc: 'Variable-speed pump installation, filter upgrades, heat pump installation, and automation system upgrades.' },
      { slug: 'green-pool', title: 'Green Pool Cleanup', desc: 'Algae treatment, shock, filter backwash, and multi-step chemical restoration to bring neglected pools back to clear.' },
      { slug: 'pool-opening-closing', title: 'Pool Opening & Closing', desc: 'Seasonal startup and winterization service including full equipment inspection and chemical startup treatment.' },
      { slug: 'pool-resurfacing', title: 'Pool Resurfacing', desc: 'Plaster, pebble, and quartz resurfacing to restore aged or stained pool shells.' },
    ],
    faqs: (city) => [
      { q: `How much does pool service cost in ${city}?`, a: `Weekly pool maintenance in the ${city} area typically runs $100–$175 per month, covering chemicals, cleaning, and equipment checks. One-time green pool cleanup runs $200–$500 depending on condition.` },
      { q: 'How often should a pool be serviced in Florida?', a: 'Weekly service is standard in Florida. Year-round heat and sun accelerate algae growth and chemical consumption. Pools left even 2 weeks without treatment can go green in summer. We offer weekly plans that keep pools swim-ready 365 days a year.' },
      { q: 'Why is my pool turning green?', a: 'Green pool water is almost always algae growth, triggered by low chlorine, high phosphates, poor filtration, or missed treatments. We treat with algaecide, shock the pool, and run the filter on extended cycles. Most pools clear within 3–5 days.' },
      { q: 'Should I get a variable-speed pool pump?', a: 'Yes. Variable-speed pumps (required in many Florida new installations) use 50–80% less electricity than single-speed pumps and typically pay for themselves in 2–3 years through energy savings. They also run quieter and extend filter and heater life.' },
      { q: `Do you service salt water pools in ${city}?`, a: `Yes. We service both chlorine and salt water pools. Salt water systems still require weekly maintenance — we test and balance all chemistry parameters including salt levels, pH, alkalinity, calcium hardness, and stabilizer.` },
    ],
  },
  'painting': {
    displayName: 'Painting',
    services: [
      { slug: 'exterior-painting', title: 'Exterior House Painting', desc: 'Full exterior paint jobs with pressure washing, caulking, priming, and two-coat finish. 5-year workmanship warranty.' },
      { slug: 'interior-painting', title: 'Interior Painting', desc: 'Walls, ceilings, trim, and cabinetry. We move furniture, protect floors, and clean up completely.' },
      { slug: 'cabinet-painting', title: 'Cabinet Refinishing', desc: 'Kitchen and bathroom cabinet painting with factory-smooth finish. Fraction of the cost of replacement.' },
      { slug: 'commercial-painting', title: 'Commercial Painting', desc: 'Office, retail, warehouse, and multi-family painting. Night and weekend scheduling available to minimize disruption.' },
      { slug: 'stucco-painting', title: 'Stucco Repair & Painting', desc: 'Stucco crack repair, Elastomeric coating application, and full repaints for Florida\'s predominant exterior surface.' },
      { slug: 'deck-painting', title: 'Deck & Fence Staining', desc: 'Wood and composite deck staining, sealing, and fence painting to restore and protect outdoor wood surfaces.' },
    ],
    faqs: (city) => [
      { q: `How much does exterior painting cost in ${city}?`, a: `Exterior painting in the ${city} area typically runs $3,000–$8,000 for a standard single-family home, depending on square footage, height, surface condition, and number of colors. We provide detailed written estimates at no charge.` },
      { q: 'How long does exterior paint last in Florida?', a: 'In Florida\'s climate, a quality exterior paint job lasts 5–8 years with proper surface prep and premium paint. Stucco surfaces may need recoating every 5–7 years. Dark colors absorb more UV and may fade faster. We use 100% acrylic latex paints rated for Florida conditions.' },
      { q: 'What is the best time to paint the exterior of a house in Florida?', a: 'The dry season (October–May) is ideal — lower humidity and minimal rain improve application and curing. Summer painting is possible but requires careful scheduling around afternoon thunderstorms. We monitor weather forecasts and adjust scheduling to protect your investment.' },
      { q: 'Do I need to be home during interior painting?', a: 'You don\'t need to be present the entire time, but we recommend being available at the start of each day to answer questions and at the end to review work. We\'ll need access to the areas being painted and clear walkways for our crew.' },
      { q: `Do you offer a painting warranty in ${city}?`, a: `Yes. We provide a 2-year workmanship warranty on exterior painting and a 1-year warranty on interior work. Paint manufacturer warranties (typically 10–15 years) apply to material defects. We stand behind our prep and application work.` },
    ],
  },
}

const DEFAULT_NICHE = {
  displayName: 'Home Services',
  services: [
    { slug: 'service-1', title: 'Residential Services', desc: 'Professional services for homeowners throughout the area.' },
    { slug: 'service-2', title: 'Commercial Services', desc: 'Reliable service for businesses and commercial properties.' },
    { slug: 'service-3', title: 'Emergency Services', desc: 'Fast response when you need help most.' },
    { slug: 'service-4', title: 'Inspections', desc: 'Thorough inspection and assessment services.' },
    { slug: 'service-5', title: 'Maintenance Plans', desc: 'Scheduled maintenance to prevent costly repairs.' },
    { slug: 'service-6', title: 'Free Estimates', desc: 'No-obligation quotes on all services.' },
  ],
  faqs: (city) => [
    { q: `How much do your services cost in ${city}?`, a: `Pricing varies by job type and scope. We provide free on-site estimates so you know exactly what to expect before any work begins.` },
    { q: 'Are you licensed and insured?', a: 'Yes. We are fully licensed and carry general liability and workers compensation insurance. We\'re happy to provide documentation on request.' },
    { q: `Do you serve all of ${city}?`, a: `We serve ${city} and the surrounding communities. Call us to confirm we cover your address — we dispatch same-day for most service calls.` },
    { q: 'What payment methods do you accept?', a: 'We accept cash, check, and all major credit cards. Financing options are available for larger projects.' },
    { q: 'Do you offer any warranties?', a: 'Yes. All our work is backed by a satisfaction guarantee. Specific warranty terms depend on the service type — we explain these in detail before starting any job.' },
  ],
}

export function getNicheData(nicheSlug) {
  return NICHE_DATA[nicheSlug] || DEFAULT_NICHE
}

export function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50)
}
