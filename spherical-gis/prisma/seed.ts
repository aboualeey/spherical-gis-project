import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@spherical.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  const hashedPassword = await hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'System Administrator',
      email: adminEmail,
      password: hashedPassword,
      role: 'MANAGING_DIRECTOR',
      isActive: true,
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Add sample products - Fixed approach
  const products = [
    {
      name: 'GIS Mapping Software',
      description: 'Professional GIS mapping and analysis software',
      category: 'Software',
      price: 2500.00,
      stockQuantity: 10,
      lowStockAlert: 2
    },
    {
      name: 'GPS Survey Equipment',
      description: 'High-precision GPS equipment for surveying',
      category: 'Hardware',
      price: 15000.00,
      stockQuantity: 5,
      lowStockAlert: 1
    },
    {
      name: 'Drone Mapping Service',
      description: 'Professional drone mapping and surveying service',
      category: 'Service',
      price: 5000.00,
      stockQuantity: 100,
      lowStockAlert: 10
    }
  ];

  // Check if products already exist, if not create them
  for (const productData of products) {
    const existingProduct = await prisma.product.findFirst({
      where: { name: productData.name }
    });
    
    if (!existingProduct) {
      await prisma.product.create({
        data: productData,
      });
      console.log(`✅ Created product: ${productData.name}`);
    } else {
      console.log(`⏭️ Product already exists: ${productData.name}`);
    }
  }

  console.log('✅ Sample products processed');

  // Add default carousel items
  const carouselItems = [
    // Home page carousel items
    {
      title: 'Welcome to Spherical GIS',
      caption: 'Leading provider of GIS solutions and geospatial services',
      page: 'home',
      order: 1,
      externalUrl: '/placeholder-hero.jpg',
      type: 'image',
      isActive: true
    },
    {
      title: 'Advanced GIS Technology',
      caption: 'Cutting-edge mapping and spatial analysis solutions',
      page: 'home',
      order: 2,
      externalUrl: '/Geo-spatial1.jpeg',
      type: 'image',
      isActive: true
    },
    {
      title: 'Professional Services',
      caption: 'Expert consultation and implementation services',
      page: 'home',
      order: 3,
      externalUrl: '/Geo-spatial2.jpg',
      type: 'image',
      isActive: true
    },
    // About page carousel items
    {
      title: 'Our Story',
      caption: 'Decades of experience in geospatial technology',
      page: 'about',
      order: 1,
      externalUrl: '/Spherical-MD.jpg',
      type: 'image',
      isActive: true
    },
    {
      title: 'Our Team',
      caption: 'Expert professionals dedicated to excellence',
      page: 'about',
      order: 2,
      externalUrl: '/1st-Gis-day.jpg',
      type: 'image',
      isActive: true
    },
    // Products page carousel items
    {
      title: 'Solar Solutions',
      caption: 'Complete solar power systems and components',
      page: 'products',
      order: 1,
      externalUrl: '/solar-panel-1.jpg',
      type: 'image',
      isActive: true
    },
    {
      title: 'Battery Systems',
      caption: 'Reliable energy storage solutions',
      page: 'products',
      order: 2,
      externalUrl: '/Africell-lithium-B-5kWh.jpg',
      type: 'image',
      isActive: true
    },
    {
      title: 'Power Inverters',
      caption: 'High-efficiency power conversion systems',
      page: 'products',
      order: 3,
      externalUrl: '/hybrid-inverter.jpeg',
      type: 'image',
      isActive: true
    },
    // Services page carousel items
    {
      title: 'GIS Consulting',
      caption: 'Professional GIS consultation and planning services',
      page: 'services',
      order: 1,
      externalUrl: '/placeholder-product1.jpg',
      type: 'image',
      isActive: true
    },
    {
      title: 'System Integration',
      caption: 'Complete system design and implementation',
      page: 'services',
      order: 2,
      externalUrl: '/off-grid-solar-power-system-15-30kw-4.jpg',
      type: 'image',
      isActive: true
    },
    // Contact page carousel items
    {
      title: 'Get In Touch',
      caption: 'Contact us for your GIS and solar energy needs',
      page: 'contact',
      order: 1,
      externalUrl: '/contact-spherical-gis.jpg',
      type: 'image',
      isActive: true
    }
  ];

  // Check if carousel items already exist, if not create them
  for (const carouselData of carouselItems) {
    const existingCarousel = await prisma.carouselItem.findFirst({
      where: { 
        title: carouselData.title,
        page: carouselData.page
      }
    });
    
    if (!existingCarousel) {
      await prisma.carouselItem.create({
        data: carouselData,
      });
      console.log(`✅ Created carousel item: ${carouselData.title} for ${carouselData.page} page`);
    } else {
      console.log(`⏭️ Carousel item already exists: ${carouselData.title} for ${carouselData.page} page`);
    }
  }

  console.log('✅ Sample carousel items processed');
  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });