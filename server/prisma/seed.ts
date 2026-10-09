import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Sathuragiri Decoration database...');

  // Clean existing tables in reverse dependency order for idempotency
  await prisma.auditLog.deleteMany().catch(() => {});
  await prisma.notification.deleteMany().catch(() => {});
  await prisma.expense.deleteMany().catch(() => {});
  await prisma.payment.deleteMany().catch(() => {});
  await prisma.quotationItem.deleteMany().catch(() => {});
  await prisma.quotation.deleteMany().catch(() => {});
  await prisma.bookingAssignment.deleteMany().catch(() => {});
  await prisma.bookingService.deleteMany().catch(() => {});
  await prisma.booking.deleteMany().catch(() => {});
  await prisma.enquiryNote.deleteMany().catch(() => {});
  await prisma.enquiry.deleteMany().catch(() => {});
  await prisma.customer.deleteMany().catch(() => {});
  await prisma.portfolioProject.deleteMany().catch(() => {});
  await prisma.package.deleteMany().catch(() => {});
  await prisma.service.deleteMany().catch(() => {});
  await prisma.serviceCategory.deleteMany().catch(() => {});
  await prisma.vendor.deleteMany().catch(() => {});
  await prisma.staffProfile.deleteMany().catch(() => {});

  // 1. Business Settings
  await prisma.businessSettings.upsert({
    where: { id: 'default-settings' },
    update: {},
    create: {
      id: 'default-settings',
      businessName: 'Sathuragiri Decoration',
      tagline: 'Every Celebration, Beautifully Crafted.',
      logoUrl: '',
      phone: '+91 98421 87654',
      alternatePhone: '+91 94432 10987',
      whatsappNumber: '+919842187654',
      email: 'contact@sathuragiridecoration.com',
      address: 'Plot No. 45, Temple View Avenue, Near Ring Road',
      city: 'Madurai',
      state: 'Tamil Nadu',
      pincode: '625009',
      mapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125747.88722421375!2d78.04169722883301!3d9.92520074218841!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b00c582b1189633%3A0xdc955b7264f63933!2sMadurai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
      primaryGold: '#B8955A',
      gstNumber: '33AAHCS1234F1Z9',
      advancePercentageDefault: 30,
      currencySymbol: '₹',
      termsDefault: '1. 30% advance is required to confirm booking date.\n2. 50% payable 2 days prior to the event setup.\n3. 20% final balance payable on event day after completion.\n4. Customized flower arrangements must be finalized 7 days in advance.',
      socialInstagram: 'https://instagram.com/sathuragiridecoration',
      socialFacebook: 'https://facebook.com/sathuragiridecoration',
      socialYoutube: 'https://youtube.com/@sathuragiridecoration',
    },
  });

  // 2. Users (Admin, Manager, Staff)
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('Admin@12345', salt);
  const managerPassword = await bcrypt.hash('Manager@12345', salt);
  const staffPassword = await bcrypt.hash('Staff@12345', salt);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@sathuragiridecoration.com' },
    update: {},
    create: {
      email: 'admin@sathuragiridecoration.com',
      passwordHash: adminPassword,
      name: 'Muthukumar (Proprietor)',
      phone: '+91 98421 87654',
      role: 'OWNER',
      isActive: true,
    },
  });

  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@sathuragiridecoration.com' },
    update: {},
    create: {
      email: 'manager@sathuragiridecoration.com',
      passwordHash: managerPassword,
      name: 'Saravanan R (Operations Manager)',
      phone: '+91 94432 10987',
      role: 'MANAGER',
      isActive: true,
    },
  });

  const staffUser = await prisma.user.upsert({
    where: { email: 'staff@sathuragiridecoration.com' },
    update: {},
    create: {
      email: 'staff@sathuragiridecoration.com',
      passwordHash: staffPassword,
      name: 'Ramesh Kumar (Lead Decorator)',
      phone: '+91 97890 54321',
      role: 'STAFF',
      isActive: true,
    },
  });

  // Staff Profiles
  await prisma.staffProfile.upsert({
    where: { userId: staffUser.id },
    update: {},
    create: {
      userId: staffUser.id,
      name: 'Ramesh Kumar',
      phone: '+91 97890 54321',
      email: 'staff@sathuragiridecoration.com',
      roleTitle: 'Senior Mandapam & Stage Decorator',
      skills: 'Floral Arches, Traditional Temple Carvings, Fabric Draping, Canopy Setups',
      availabilityStatus: 'AVAILABLE',
      isActive: true,
    },
  });

  await prisma.staffProfile.createMany({
    data: [
      {
        name: 'Ganesh Pandian',
        phone: '+91 98765 11223',
        email: 'ganesh@sathuragiridecoration.com',
        roleTitle: 'Senior Lighting & Sound Engineer',
        skills: 'Moving Heads, Par Cans, Truss Architecture, Ambient Mood Lighting',
        availabilityStatus: 'AVAILABLE',
        isActive: true,
      },
      {
        name: 'Meenakshi Sundaram',
        phone: '+91 98765 44556',
        email: 'sundaram@sathuragiridecoration.com',
        roleTitle: 'Master Floral Stylist',
        skills: 'Jasmine Garlands, Exotic Orchids, Marigold Wall Art, Lotus Mandapam',
        availabilityStatus: 'AVAILABLE',
        isActive: true,
      },
    ],
  }).catch(() => {});

  // 3. Vendors
  const vendorFlowers = await prisma.vendor.create({
    data: {
      businessName: 'Madurai Flower Mart & Fragrance',
      contactPerson: 'K. Senthil Nathan',
      phone: '+91 94431 88776',
      email: 'senthilflowers@example.com',
      category: 'Flowers',
      servicesSupplied: 'Fresh Madurai Malli (Jasmine), Bangalore Roses, Orchids, Carnations, Lilies',
      agreedRates: 'Bulk market wholesale rate + 5% handling',
      notes: 'Reliable supplier, morning delivery guaranteed by 5:00 AM',
      isActive: true,
    },
  });

  const vendorLights = await prisma.vendor.create({
    data: {
      businessName: 'Apex Audio-Visual & Trussing Solutions',
      contactPerson: 'Murugesh V',
      phone: '+91 98402 33445',
      email: 'apexlights@example.com',
      category: 'Sound & Light',
      servicesSupplied: 'High-power LED Pars, Sharpies, Line Array Speakers, Smoke Machines',
      agreedRates: '₹25,000 per standard wedding stage setup',
      notes: 'Includes 2 dedicated on-site technicians',
      isActive: true,
    },
  });

  const vendorCatering = await prisma.vendor.create({
    data: {
      businessName: 'Sri Annapoorani Grand Feasts & Catering',
      contactPerson: 'Chef Ramanathan',
      phone: '+91 98422 66778',
      email: 'annapooranifeasts@example.com',
      category: 'Catering',
      servicesSupplied: 'Authentic 24-dish Banana Leaf Feast, Live Chaat, Tandoor & Dessert Counters',
      agreedRates: '₹350 - ₹650 per leaf/plate depending on menu',
      notes: 'Traditional cooks specialized in South Indian marriage menus',
      isActive: true,
    },
  });

  // 4. Service Categories
  const catWedding = await prisma.serviceCategory.create({
    data: {
      name: 'Marriage & Wedding Decoration',
      slug: 'wedding-decoration',
      description: 'Grand South Indian Muhurtham Mandapams, temple theme setups, floral pillars, and sacred backdrop decor.',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
      sortOrder: 1,
      isActive: true,
    },
  });

  const catReception = await prisma.serviceCategory.create({
    data: {
      name: 'Reception Stage Decoration',
      slug: 'reception-stages',
      description: 'Luxury backdrop concepts, floral walls, geometric arches, crystal chandeliers, and dynamic stage setups.',
      image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
      sortOrder: 2,
      isActive: true,
    },
  });

  const catEngagement = await prisma.serviceCategory.create({
    data: {
      name: 'Engagement, Haldi & Sangeet',
      slug: 'engagement-haldi-sangeet',
      description: 'Vibrant marigold photobooths, swing decorations, ring ceremony gazebos, and thematic pre-wedding decor.',
      image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
      sortOrder: 3,
      isActive: true,
    },
  });

  const catPhotoFilm = await prisma.serviceCategory.create({
    data: {
      name: 'Photography & Cinematic Films',
      slug: 'photography-videography',
      description: 'Candid wedding photography, cinematic 4K highlight films, drone captures, and pre-wedding shoots.',
      image: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1200&q=80',
      sortOrder: 4,
      isActive: true,
    },
  });

  const catCatering = await prisma.serviceCategory.create({
    data: {
      name: 'Catering & Live Food Stalls',
      slug: 'catering-food-stalls',
      description: 'Traditional South Indian banana leaf feasts, Chettinad specialties, live dosa stations, and chaat counters.',
      image: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80',
      sortOrder: 5,
      isActive: true,
    },
  });

  const catEntrance = await prisma.serviceCategory.create({
    data: {
      name: 'Entrance & Welcome Archways',
      slug: 'entrance-walkway-decoration',
      description: 'Grand royal gateway entrances, red carpet walkways, floral tunnels, and welcome board styling.',
      image: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80',
      sortOrder: 6,
      isActive: true,
    },
  });

  const catCorporate = await prisma.serviceCategory.create({
    data: {
      name: 'Corporate Events & Exhibition Stalls',
      slug: 'corporate-exhibition-stalls',
      description: 'Professional expo booth fabrications, corporate summit stages, product launch backdrops, and trussing.',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
      sortOrder: 7,
      isActive: true,
    },
  });

  const catBirthdays = await prisma.serviceCategory.create({
    data: {
      name: 'Birthday & Milestone Celebrations',
      slug: 'birthday-anniversary-parties',
      description: 'Thematic balloon styling, 3D character cutouts, cake table backdrops, and lighting setups.',
      image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80',
      sortOrder: 8,
      isActive: true,
    },
  });

  // 5. Services
  const s1 = await prisma.service.create({
    data: {
      categoryId: catWedding.id,
      name: 'Royal South Indian Muhurtham Mandapam',
      slug: 'royal-muhurtham-mandapam',
      shortDesc: 'Carved temple pillars, fresh Madurai Malli & rose hangings, lotus pond center, and traditional brass lamps.',
      detailedDesc: 'Our signature Muhurtham Mandapam is designed to bring the divine sanctity of South Indian temples into your wedding hall. Crafted with sculpted golden pillars, fresh fragrant Madurai jasmine, pink Bangalore roses, and golden brass kuthu vilakku lamps, it creates a breathtaking sacred sanctuary for your wedding rituals.',
      coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80'
      ]),
      startingPrice: 65000,
      pricingMethod: 'Starting price',
      availableAddons: JSON.stringify(['Brass Urli with Floating Flowers & Diyas', 'Live Shehnai & Nadaswaram Stage Setup', 'Pooja Thali & Coconut Carving Styling']),
      isFeatured: true,
      isActive: true,
      sortOrder: 1,
    },
  });

  const s2 = await prisma.service.create({
    data: {
      categoryId: catReception.id,
      name: 'Grand Floral Dream Reception Stage',
      slug: 'grand-floral-reception-stage',
      shortDesc: 'Lush 40ft floral wall backdrop with crystal chandeliers, golden frames, warm ambient backlighting, and royal sofa.',
      detailedDesc: 'An opulent reception stage with 3D layers of fresh orchids, white hydrangeas, champagne roses, and warm fairy lights. Includes custom velvet/leatherette bride & groom royal throne sofa, carpeted stage riser, and programmable mood lighting.',
      coverImage: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80'
      ]),
      startingPrice: 55000,
      pricingMethod: 'Starting price',
      availableAddons: JSON.stringify(['Dry Ice Smoke Effect for Couple Entry', 'Cold Fire / Pyro Sparklers Stage Blast', 'Personalized Acrylic Couple Name Monogram with Neon Glow']),
      isFeatured: true,
      isActive: true,
      sortOrder: 2,
    },
  });

  const s3 = await prisma.service.create({
    data: {
      categoryId: catEngagement.id,
      name: 'Vibrant Haldi & Mehndi Festive Setup',
      slug: 'haldi-mehndi-festive-setup',
      shortDesc: 'Bright marigold canopies, traditional painted jhoola (swing), colorful drapes, brass urli setup, and photo booths.',
      detailedDesc: 'Filled with joyful yellow and orange tones, our Haldi & Mehndi setup features genuine marigold flower strings, decorated wooden swings with bolster cushions, traditional umbrellas, brass water bowls, and vibrant rangoli accents.',
      coverImage: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80'
      ]),
      startingPrice: 35000,
      pricingMethod: 'Starting price',
      availableAddons: JSON.stringify(['Fresh Flower Jewellery for Bride', 'Floral Rain (Pushpa Vrushti) Setup', 'Organic Haldi & Phoolon Ki Holi Kit']),
      isFeatured: true,
      isActive: true,
      sortOrder: 3,
    },
  });

  const s4 = await prisma.service.create({
    data: {
      categoryId: catPhotoFilm.id,
      name: 'Cinematic Wedding Film & Candid Photography',
      slug: 'cinematic-wedding-film-photography',
      shortDesc: '2 Candid Photographers + 2 Cinematographers, 4K Sony FX3 cameras, aerial drone footage, teaser trailer & luxury album.',
      detailedDesc: 'Capture every priceless emotion, stolen glance, and ritual in cinema-grade quality. Our team of senior wedding photographers and cinematographers bring artistic storytelling with color-graded highlights and hardbound handcrafted photobooks.',
      coverImage: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1200&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=1200&q=80'
      ]),
      startingPrice: 75000,
      pricingMethod: 'Starting price',
      availableAddons: JSON.stringify(['Pre-Wedding Outdoor Photoshoot at Scenic Location', 'Same-Day Edit Video Reel for Reception', 'Parent Duplicate Premium Albums (Set of 2)']),
      isFeatured: true,
      isActive: true,
      sortOrder: 4,
    },
  });

  const s5 = await prisma.service.create({
    data: {
      categoryId: catCatering.id,
      name: 'Grand South Indian 24-Item Leaf Feast',
      slug: 'grand-south-indian-leaf-feast',
      shortDesc: 'Traditional banana leaf wedding feast with authentic delicacies, live ghee roast counters, payasam varieties, and warm hospitality.',
      detailedDesc: 'A culinary celebration fit for royalty. Prepared by master wedding chefs using cold-pressed oils, pure cow ghee, and hand-ground spices. Complete with uniformed serving staff, copper service vessels, and welcome drinks.',
      coverImage: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80'
      ]),
      startingPrice: 400,
      pricingMethod: 'Per person',
      availableAddons: JSON.stringify(['Live Tandoor & Chaat Stall', 'South Indian Filter Coffee & Tea Barista Stall', 'Ice Cream Sundae & Fresh Fruit Counter']),
      isFeatured: true,
      isActive: true,
      sortOrder: 5,
    },
  });

  const s6 = await prisma.service.create({
    data: {
      categoryId: catEntrance.id,
      name: 'Imperial Floral Tunnel & Gateway Entrance',
      slug: 'imperial-floral-tunnel-entrance',
      shortDesc: 'A majestic 60ft walk-through floral tunnel with hanging fairy lights, brass urlis, red carpet, and customized welcome signage.',
      detailedDesc: 'Make the first impression of your event an unforgettable royal entrance. Lush arches of fresh exotic flowers, gentle ambient lighting, aromatic floral hangings, and elegant couple welcome easel stand.',
      coverImage: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80'
      ]),
      startingPrice: 38000,
      pricingMethod: 'Starting price',
      availableAddons: JSON.stringify(['Rose Petal Shower Machine at Entrance', 'Traditional Welcome Aarti Girls & Attire', 'Custom Neon Name Board with Floral Frame']),
      isFeatured: false,
      isActive: true,
      sortOrder: 6,
    },
  });

  const s7 = await prisma.service.create({
    data: {
      categoryId: catCorporate.id,
      name: 'Corporate Expo Stall & Summit Stage Setup',
      slug: 'corporate-expo-stage-setup',
      shortDesc: 'Modular exhibition stall fabrication, high-resolution LED backdrop walls, podium branding, and premium sound systems.',
      detailedDesc: 'Tailored for corporate product launches, annual conventions, and exhibitions. We provide German hangar tenting, octanorm booth setups, acrylic laser cut lettering, stage audio-visuals, and seamless on-site technical coordination.',
      coverImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80'
      ]),
      startingPrice: 45000,
      pricingMethod: 'Starting price',
      availableAddons: JSON.stringify(['P3 Outdoor / Indoor High-Def LED Wall', 'Corporate Delegate Gift Hamper Stalls', 'Photography & Live Webcasting Crew']),
      isFeatured: false,
      isActive: true,
      sortOrder: 7,
    },
  });

  const s8 = await prisma.service.create({
    data: {
      categoryId: catBirthdays.id,
      name: 'Luxury Theme Birthday & Balloon Extravaganza',
      slug: 'luxury-theme-birthday-decor',
      shortDesc: 'Pastel organic balloon arches, customized 3D character cutouts, LED neon signage, dessert table styling, and mood lighting.',
      detailedDesc: 'Transform your baby’s first birthday or 50th golden jubilee into a magical wonderland. Complete with tailored themes (Jungle Safari, Royal Princess, Space Odyssey, Boho Chic), ring arches, marquee light numbers, and themed props.',
      coverImage: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80'
      ]),
      startingPrice: 22000,
      pricingMethod: 'Starting price',
      availableAddons: JSON.stringify(['Magic Show & Mascot Entertainer', 'Cotton Candy & Popcorn Live Stall', 'Custom Balloon Burst Pinata']),
      isFeatured: false,
      isActive: true,
      sortOrder: 8,
    },
  });

  // 6. Packages
  await prisma.package.createMany({
    data: [
      {
        name: 'Silver Elegance Package',
        slug: 'silver-elegance-package',
        description: 'Ideal for intimate family engagements, betrothals, and traditional housewarming or birthday ceremonies.',
        includedServices: JSON.stringify([
          '20ft Floral Stage Backdrop with Fabric Draping',
          'Couple Stage Chairs with Floral Accents',
          'Entrance Archway with Marigold & Rose Styling',
          'Standard Warm Halogen & LED Par Lighting Setup',
          'Welcome Easel Board with Floral Bunch'
        ]),
        packagePrice: 65000,
        pricingType: 'Starting price',
        optionalExtras: JSON.stringify(['Candid Photography Add-on', 'Live Mocktail Counter', 'Rose Petal Entry Pathway']),
        terms: 'Setup complete 4 hours before event. 30% advance to book.',
        isActive: true,
        isFeatured: false,
        sortOrder: 1,
      },
      {
        name: 'Royal Gold Wedding Package',
        slug: 'royal-gold-wedding-package',
        description: 'Our most sought-after complete wedding package encompassing traditional Muhurtham Mandapam and Grand Reception Stage.',
        includedServices: JSON.stringify([
          'Authentic Carved Temple Muhurtham Mandapam with Fresh Jasmine & Rose Garland Hangings',
          'Grand 35ft Reception Stage Floral Wall with Crystal Chandeliers & Warm Halo Glow',
          'Royal Couple Throne Sofa + VIP Seating Linen',
          '40ft Grand Floral Tunnel Entrance with Carpet',
          'Intelligent Stage Lighting, Sharpies & Fog Machines',
          'Brass Lamp (Kuthu Vilakku) & Urli Styling for Rituals'
        ]),
        packagePrice: 185000,
        pricingType: 'Starting price',
        optionalExtras: JSON.stringify(['4K Drone & Cinematic Video Upgrade', 'Cold Fire Pyro Sparklers Entry', 'Live Filter Coffee & Chaat Corner']),
        terms: 'Requires 30% advance on signing, 50% 2 days before event, balance on completion.',
        isActive: true,
        isFeatured: true,
        sortOrder: 2,
      },
      {
        name: 'Imperial Diamond Grand Wedding Experience',
        slug: 'imperial-diamond-grand-wedding',
        description: 'The pinnacle of luxury. Complete end-to-end wedding, reception, haldi, photography, and VIP hospitality.',
        includedServices: JSON.stringify([
          'Palatial Temple Mandapam with 100% Exotic Fresh Flora (Orchids, Carnations, Madurai Jasmine)',
          'Magnificent 50ft Multilevel 3D Reception Stage with Hanging Floral Ceiling & Crystal Chandeliers',
          'Full Venue Walkway, Dining Hall & VIP Lounge Thematic Décor',
          '60ft Royal Archway Entrance with Water Fountains & Flame Torches',
          'Complete 2-Day Photography & Cinematic 4K Drone Coverage (Teaser + 40-page Handcrafted Album)',
          'Dry Ice Low Fog + 6-Unit Pyro Sparkler Blast for Grand Couple Walk-in',
          'Full-Time Dedicated Event Coordinator & Technical Crew'
        ]),
        packagePrice: 375000,
        pricingType: 'Starting price',
        optionalExtras: JSON.stringify(['Celebrity Anchor & Live Nadaswaram Troupe', 'Royal Vintage Car Bridal Entry', 'Customized LED Wall Backdrop with Visuals']),
        terms: 'Dedicated event manager assigned. Advance booking minimum 3 weeks in advance recommended.',
        isActive: true,
        isFeatured: true,
        sortOrder: 3,
      },
      {
        name: 'Custom Bespoke Event Solution',
        slug: 'custom-bespoke-event-solution',
        description: 'Completely tailored to your vision, venue dimensions, and event type. You pick the exact elements.',
        includedServices: JSON.stringify([
          'Personalized 1-on-1 Consultation & 3D Stage Layout Mockup',
          'Custom Mix of Floral, Lighting, Photography & Catering',
          'Tailored Budget Options for Destination Weddings & Corporate Galas'
        ]),
        packagePrice: null,
        pricingType: 'Request a Quote',
        optionalExtras: JSON.stringify(['Custom Theme Architecture', 'Exhibition Booth Fabrication', 'Gourmet Catering Menu']),
        terms: 'Tailored payment schedule based on agreed quotation.',
        isActive: true,
        isFeatured: false,
        sortOrder: 4,
      }
    ],
  });

  // 7. Portfolio Projects
  await prisma.portfolioProject.createMany({
    data: [
      {
        title: 'The Royal Chettinad Palace Wedding - Karthik & Divya',
        slug: 'chettinad-palace-wedding-karthik-divya',
        category: 'Traditional Wedding',
        description: 'A breathtaking traditional Tamil Brahmin wedding executed at the historic Chettinad heritage palace. Featuring an authentic hand-carved lotus mandapam draped with 120 kgs of pure Madurai jasmine and fragrant marigolds.',
        clientName: 'Dr. Karthik & Dr. Divya',
        location: 'Heritage Palace Hall, Madurai',
        eventDate: new Date('2025-11-20'),
        coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80'
        ]),
        isFeatured: true,
        isPublished: true,
        sortOrder: 1,
      },
      {
        title: 'Starlit Crystal Grand Reception - Vignesh & Pooja',
        slug: 'starlit-crystal-reception-vignesh-pooja',
        category: 'Reception Stage',
        description: 'A modern fairytale reception stage constructed with geometric golden pillars, 5000+ imported white orchids, tiered chandeliers, and dynamic warm amber backlighting for 1,500 guests.',
        clientName: 'Vigneshwaran & Pooja',
        location: 'Grand Convention Center, Coimbatore',
        eventDate: new Date('2025-12-14'),
        coverImage: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80'
        ]),
        isFeatured: true,
        isPublished: true,
        sortOrder: 2,
      },
      {
        title: 'Golden Sunset Marigold Haldi & Sangeet - Arvind & Soundarya',
        slug: 'sunset-marigold-haldi-arvind-soundarya',
        category: 'Engagement & Haldi',
        description: 'An energizing outdoor poolside Haldi celebration. Draped in sunshine yellow silk drapes, bespoke swings, brass water vessels with yellow petals, and personalized photo backdrops.',
        clientName: 'Arvind & Soundarya',
        location: 'Riverview Resort, Tirunelveli',
        eventDate: new Date('2026-01-10'),
        coverImage: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1200&q=80'
        ]),
        isFeatured: true,
        isPublished: true,
        sortOrder: 3,
      },
      {
        title: 'Zoho Regional Tech Summit & Expo 2026',
        slug: 'zoho-regional-tech-summit-2026',
        category: 'Corporate Events',
        description: 'Complete AV and stage architecture for 800 delegates. Included 45ft high-definition LED curve wall, custom sponsor booth fabrications, registration zone styling, and professional gala dinner arrangement.',
        clientName: 'Zoho Corporation Enterprise Partner Meet',
        location: 'Trade Centre Expo Hall, Madurai',
        eventDate: new Date('2026-02-05'),
        coverImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80'
        ]),
        isFeatured: false,
        isPublished: true,
        sortOrder: 4,
      }
    ],
  });

  // 8. Customers
  const cust1 = await prisma.customer.create({
    data: {
      name: 'Karthik Rajan',
      phone: '+91 98401 12233',
      email: 'karthik.rajan@example.com',
      address: '12, Anna Nagar Main Road, Madurai',
      notes: 'VIP customer. Wants grand floral Muhurtham mandapam + cinematic video.',
    },
  });

  const cust2 = await prisma.customer.create({
    data: {
      name: 'Soundarya Swaminathan',
      phone: '+91 98765 43211',
      email: 'soundarya.s@example.com',
      address: '45, West Masi Street, Madurai',
      notes: 'Interested in Royal Gold Wedding Package for November.',
    },
  });

  const cust3 = await prisma.customer.create({
    data: {
      name: 'Annamalai Chettiar',
      phone: '+91 94433 22110',
      email: 'annamalai.c@example.com',
      address: '88, Palace Road, Karaikudi',
      notes: 'Looking for 3-day wedding celebration decor & catering coordination.',
    },
  });

  // 9. Enquiries
  const enq1 = await prisma.enquiry.create({
    data: {
      reference: 'ENQ-2026-0001',
      customerId: cust1.id,
      eventType: 'Wedding & Reception',
      eventTitle: 'Karthik & Divya Marriage Celebration',
      eventDate: new Date('2026-11-15T09:00:00.000Z'),
      endDate: new Date('2026-11-16T14:00:00.000Z'),
      venueName: 'Meenakshi Sundareswarar Thirumana Mahal',
      venueAddress: 'Kamarajar Salai, Madurai',
      venueCity: 'Madurai',
      guestCount: 1200,
      isOutdoor: false,
      selectedServiceIds: JSON.stringify([s1.id, s2.id, s4.id]),
      budgetRange: '₹2,50,000 - ₹5,00,000',
      preferredContactMethod: 'WhatsApp',
      consultationTime: 'Evening (5 PM - 8 PM)',
      additionalNotes: 'Need jasmine flower canopy for bride walk-in and stage cold fire entry.',
      status: 'CONVERTED',
      assignedToUserId: adminUser.id,
    },
  });

  const enq2 = await prisma.enquiry.create({
    data: {
      reference: 'ENQ-2026-0002',
      customerId: cust2.id,
      eventType: 'Engagement & Haldi',
      eventTitle: 'Soundarya & Arvind Ring Ceremony',
      eventDate: new Date('2026-12-05T10:00:00.000Z'),
      venueName: 'Heritage Madurai Resort Lawn',
      venueAddress: 'Kochadai, Madurai',
      venueCity: 'Madurai',
      guestCount: 350,
      isOutdoor: true,
      selectedServiceIds: JSON.stringify([s3.id, s6.id]),
      budgetRange: '₹1,00,000 - ₹2,50,000',
      preferredContactMethod: 'Phone',
      consultationTime: 'Morning (10 AM - 1 PM)',
      additionalNotes: 'Lawn event, need waterproof marquee draping and yellow marigold decor.',
      status: 'CONSULTATION_SCHEDULED',
      assignedToUserId: managerUser.id,
    },
  });

  const enq3 = await prisma.enquiry.create({
    data: {
      reference: 'ENQ-2026-0003',
      customerId: cust3.id,
      eventType: 'Traditional Marriage',
      eventTitle: 'Chettiar Family Grand Marriage',
      eventDate: new Date('2026-12-28T06:00:00.000Z'),
      venueName: 'MJM Grand Convention Hall',
      venueAddress: 'Bypass Road, Dindigul',
      venueCity: 'Dindigul',
      guestCount: 2000,
      isOutdoor: false,
      selectedServiceIds: JSON.stringify([s1.id, s2.id, s5.id]),
      budgetRange: '₹5,00,000+',
      preferredContactMethod: 'Phone',
      consultationTime: 'Anytime',
      additionalNotes: 'Requires complete mandapam, 24-dish leaf catering coordination, and photography.',
      status: 'NEW',
    },
  });

  // Enquiry Notes
  await prisma.enquiryNote.create({
    data: {
      enquiryId: enq1.id,
      userId: adminUser.id,
      note: 'Spoke with customer over phone. Discussed mandapam options. Converted to confirmed booking with ₹50,000 advance.',
      followUpDate: new Date('2026-10-15'),
    },
  });

  await prisma.enquiryNote.create({
    data: {
      enquiryId: enq2.id,
      userId: managerUser.id,
      note: 'Scheduled venue visit at Heritage Madurai lawn this Saturday 11:00 AM.',
      followUpDate: new Date('2026-10-18'),
    },
  });

  // 10. Bookings
  const bkg1 = await prisma.booking.create({
    data: {
      reference: 'BKG-2026-0001',
      customerId: cust1.id,
      enquiryId: enq1.id,
      eventName: 'Karthik & Divya Royal Wedding & Reception',
      eventType: 'Wedding & Reception',
      startDate: new Date('2026-11-15T06:00:00.000Z'),
      endDate: new Date('2026-11-16T15:00:00.000Z'),
      venueName: 'Meenakshi Sundareswarar Thirumana Mahal',
      venueAddress: 'Kamarajar Salai, Madurai',
      venueCity: 'Madurai',
      guestCount: 1200,
      status: 'CONFIRMED',
      totalAmount: 210000,
      discountAmount: 10000,
      taxAmount: 36000,
      finalAmount: 236000,
      internalNotes: 'VIP event. Setup team to arrive on 14th evening 7 PM. Madurai Malli fresh stock confirmed from vendor.',
      termsAndConditions: '30% advance received. 50% on Nov 13. Balance on event completion.',
    },
  });

  // Booking Services
  await prisma.bookingService.createMany({
    data: [
      {
        bookingId: bkg1.id,
        serviceId: s1.id,
        serviceName: 'Royal South Indian Muhurtham Mandapam',
        quantity: 1,
        unitPrice: 75000,
        notes: 'Temple pillar carving design with genuine Madurai jasmine strings',
      },
      {
        bookingId: bkg1.id,
        serviceId: s2.id,
        serviceName: 'Grand Floral Dream Reception Stage',
        quantity: 1,
        unitPrice: 65000,
        notes: '40ft Floral wall with dual color ambient wash and royal white sofa',
      },
      {
        bookingId: bkg1.id,
        serviceId: s4.id,
        serviceName: 'Cinematic Wedding Film & Candid Photography',
        quantity: 1,
        unitPrice: 70000,
        notes: 'Full 2-day coverage including drone & 40-page album',
      },
    ],
  });

  // Booking Assignments
  await prisma.bookingAssignment.createMany({
    data: [
      {
        bookingId: bkg1.id,
        staffId: (await prisma.staffProfile.findFirst({ where: { name: 'Ramesh Kumar' } }))?.id,
        role: 'Lead Decorator & Mandapam Supervisor',
        notes: 'Oversee mandapam fabrication from Nov 14 7 PM',
      },
      {
        bookingId: bkg1.id,
        vendorId: vendorFlowers.id,
        role: 'Fresh Flower Supplier',
        notes: 'Supply 100kg Madurai Malli + 500 bunches Bangalore roses by 5 AM Nov 15',
      },
      {
        bookingId: bkg1.id,
        vendorId: vendorLights.id,
        role: 'Stage Lighting & Cold Fire Effects',
        notes: 'Stage trussing + 4-unit cold fire sparkler machine setup',
      },
    ],
  });

  // 11. Quotations
  const qtn1 = await prisma.quotation.create({
    data: {
      quotationNumber: 'QTN-2026-0001',
      version: 1,
      customerId: cust1.id,
      bookingId: bkg1.id,
      enquiryId: enq1.id,
      validUntil: new Date('2026-11-01'),
      subtotal: 210000,
      discount: 10000,
      taxRate: 18,
      taxAmount: 36000,
      grandTotal: 236000,
      terms: '1. 30% advance on booking confirmation.\n2. 50% payable 2 days prior to event.\n3. 20% balance on event completion.',
      exclusions: 'Hall rental and power backup/diesel generator charges to be borne by client directly.',
      paymentSchedule: 'Advance: ₹70,800 | Stage 2: ₹1,18,000 | Final Settlement: ₹47,200',
      status: 'ACCEPTED',
      notes: 'Discount of ₹10,000 given as package combo offer.',
    },
  });

  await prisma.quotationItem.createMany({
    data: [
      {
        quotationId: qtn1.id,
        name: 'Royal South Indian Muhurtham Mandapam (Temple Theme)',
        description: 'Carved wooden pillars, brass kuthu vilakku, fresh jasmine & rose garlands, floral ceiling',
        quantity: 1,
        unit: 'Set',
        unitPrice: 75000,
        discount: 0,
        total: 75000,
      },
      {
        quotationId: qtn1.id,
        name: 'Grand Floral Dream Reception Stage (40ft)',
        description: 'Lush 3D flower wall, crystal chandeliers, royal bride & groom throne sofa, ambient lighting',
        quantity: 1,
        unit: 'Set',
        unitPrice: 65000,
        discount: 5000,
        total: 60000,
      },
      {
        quotationId: qtn1.id,
        name: 'Cinematic 4K Wedding Film & Candid Photography',
        description: '2 Candid Photographers + 2 Cinematographers + Aerial Drone + 40-page hand-bound leather album',
        quantity: 1,
        unit: 'Package',
        unitPrice: 70000,
        discount: 5000,
        total: 65000,
      },
    ],
  });

  // 12. Payments
  await prisma.payment.create({
    data: {
      receiptNumber: 'RCT-2026-0001',
      bookingId: bkg1.id,
      customerId: cust1.id,
      amount: 70800,
      paymentMethod: 'UPI',
      paymentType: 'ADVANCE',
      reference: 'UPI/20261009/9842187654/001928',
      paymentDate: new Date('2026-10-09'),
      notes: 'Initial 30% advance received via GPay/PhonePe business account.',
      status: 'PAID',
      recordedByUserId: adminUser.id,
    },
  });

  // 13. Expenses
  await prisma.expense.createMany({
    data: [
      {
        category: 'FLOWERS',
        description: 'Advance payment for Madurai Jasmine & Bangalore Roses for BKG-2026-0001',
        amount: 25000,
        expenseDate: new Date('2026-10-09'),
        bookingId: bkg1.id,
        vendorId: vendorFlowers.id,
        paymentMethod: 'UPI',
        recordedByUserId: adminUser.id,
      },
      {
        category: 'DECORATION_MATERIALS',
        description: 'Golden pillars maintenance, fabric polish, and brass vilakku cleaning',
        amount: 8500,
        expenseDate: new Date('2026-10-08'),
        bookingId: bkg1.id,
        paymentMethod: 'CASH',
        recordedByUserId: managerUser.id,
      },
      {
        category: 'LIGHTING_SOUND',
        description: 'Deposit for intelligent sharpie lights & smoke effect machines',
        amount: 10000,
        expenseDate: new Date('2026-10-09'),
        bookingId: bkg1.id,
        vendorId: vendorLights.id,
        paymentMethod: 'BANK_TRANSFER',
        recordedByUserId: adminUser.id,
      },
    ],
  });

  // 14. Notifications
  await prisma.notification.createMany({
    data: [
      {
        title: 'New Event Enquiry Received',
        message: 'Chettiar Family Grand Marriage (ENQ-2026-0003) submitted from public website.',
        type: 'ENQUIRY',
        isRead: false,
        link: '/admin/enquiries',
      },
      {
        title: 'Advance Payment Received',
        message: '₹70,800 received for Karthik & Divya Royal Wedding (BKG-2026-0001).',
        type: 'PAYMENT',
        isRead: false,
        link: '/admin/payments',
      },
      {
        title: 'Follow-up Reminder',
        message: 'Follow-up due for Soundarya & Arvind Ring Ceremony (ENQ-2026-0002).',
        type: 'FOLLOWUP',
        isRead: false,
        link: '/admin/enquiries',
      },
    ],
  });

  // 15. Audit Log
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: 'CONVERT',
      entity: 'ENQUIRY',
      entityId: enq1.id,
      details: JSON.stringify({ message: 'Converted enquiry ENQ-2026-0001 to booking BKG-2026-0001' }),
      ipAddress: '127.0.0.1',
    },
  });

  console.log('✅ Seeding completed successfully!');
  console.log('👑 Admin Login: admin@sathuragiridecoration.com / Admin@12345');
  console.log('👔 Manager Login: manager@sathuragiridecoration.com / Manager@12345');
  console.log('🛠️ Staff Login: staff@sathuragiridecoration.com / Staff@12345');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
