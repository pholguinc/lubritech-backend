import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker/locale/es';

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando Seeding Masivo...');

  // 1. Configuración, Estados y Roles (Base)
  console.log('🔄 Creando configuración, estados y roles base...');
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

  await prisma.systemConfig.upsert({
    where: { clientName: 'Lubritech' },
    update: {},
    create: {
      clientName: 'Lubritech',
      expirationDate: oneYearFromNow,
      isActive: true,
    },
  });

  const statuses = [
    { name: 'Activo', description: 'Entidad activa' },
    { name: 'Inactivo', description: 'Entidad inactiva' },
    { name: 'Pendiente', description: 'Entidad pendiente' },
    { name: 'Completado', description: 'Entidad completada' },
    { name: 'Cancelado', description: 'Entidad cancelada' },
    { name: 'En Progreso', description: 'Entidad en progreso' },
  ];

  const statusMap: Record<string, string> = {};
  for (const s of statuses) {
    const created = await prisma.status.upsert({
      where: { name: s.name },
      update: {},
      create: s,
    });
    statusMap[s.name] = created.id;
  }

  const activeStatusId = statusMap['Activo'];
  const inactiveStatusId = statusMap['Inactivo'];
  const pendingStatusId = statusMap['Pendiente'];
  const completedStatusId = statusMap['Completado'];

  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMINISTRADOR' },
    update: {},
    create: { name: 'ADMINISTRADOR', description: 'Acceso total' },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'USUARIO' },
    update: {},
    create: { name: 'USUARIO', description: 'Acceso limitado' },
  });

  const passwordHash = await bcrypt.hash('Admin123!', 10);

  await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: { password: passwordHash, roleId: adminRole.id, statusId: activeStatusId },
    create: { email: 'admin@admin.com', password: passwordHash, name: 'Admin Lubritech', roleId: adminRole.id, statusId: activeStatusId },
  });

  await prisma.user.upsert({
    where: { email: 'usuario@usuario.com' },
    update: { password: passwordHash, roleId: userRole.id, statusId: activeStatusId },
    create: { email: 'usuario@usuario.com', password: passwordHash, name: 'Usuario Regular', roleId: userRole.id, statusId: activeStatusId },
  });

  // 2. Categorías
  console.log('📁 Generando Categorías...');
  const catNames = ['Aceites', 'Filtros', 'Líquidos', 'Baterías', 'Frenos', 'Accesorios', 'Servicios', 'Llantas', 'Bujías', 'Suspensión'];
  const categoryIds: string[] = [];
  for (const name of catNames) {
    const cat = await prisma.category.upsert({
      where: { id: faker.string.uuid() }, // Forzamos búsqueda manual abajo si queremos name unique, pero schema no tiene @unique en name para category.
      update: {},
      create: { name, description: faker.commerce.productDescription(), statusId: activeStatusId }
    }).catch(async () => {
      // Fallback
      let c = await prisma.category.findFirst({ where: { name } });
      if(!c) c = await prisma.category.create({ data: { name, description: faker.commerce.productDescription(), statusId: activeStatusId } });
      return c;
    });
    categoryIds.push(cat.id);
  }

  // 3. Productos y Servicios
  console.log('📦 Generando Productos y Servicios...');
  const productIds: string[] = [];
  const serviceProductIds: string[] = [];

  const serviceNames = [
    ...Array(45).fill('Cambio de Aceite'),
    ...Array(25).fill('Afinamiento'),
    ...Array(15).fill('Frenos'),
    ...Array(15).fill('Otros')
  ];

  for (let i = 0; i < 150; i++) {
    const isService = i >= 130; // 20 servicios, 130 productos
    const type = isService ? 'Service' : 'Product';
    const purchasePrice = isService ? 0 : parseFloat(faker.commerce.price({ min: 10, max: 200 }));
    const salePrice = isService ? parseFloat(faker.commerce.price({ min: 30, max: 150 })) : purchasePrice * faker.number.float({ min: 1.2, max: 2.5 });
    
    const prod = await prisma.product.create({
      data: {
        name: isService ? faker.helpers.arrayElement(serviceNames) : faker.commerce.productName(),
        type,
        purchasePrice,
        salePrice: parseFloat(salePrice.toFixed(2)),
        stock: isService ? 999 : faker.number.int({ min: 0, max: 100 }),
        statusId: faker.helpers.arrayElement([activeStatusId, activeStatusId, activeStatusId, inactiveStatusId]), // 75% activos
        categoryId: faker.helpers.arrayElement(categoryIds),
      }
    });

    if (isService) {
      serviceProductIds.push(prod.id);
    } else {
      productIds.push(prod.id);
    }
  }

  // 4. Clientes
  console.log('👥 Generando Clientes...');
  const customerIds: string[] = [];
  for (let i = 0; i < 100; i++) {
    const isCompany = faker.datatype.boolean();
    const documentType = isCompany ? 'RUC' : 'DNI';
    const documentNumber = isCompany ? `20${faker.string.numeric(9)}` : faker.string.numeric(8);

    const customer = await prisma.customer.create({
      data: {
        code: `CLI-${faker.string.numeric(5)}`,
        name: isCompany ? faker.company.name() : faker.person.fullName(),
        documentType,
        documentNumber,
        email: faker.internet.email(),
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
        district: faker.location.city(),
        province: faker.location.state(),
        department: faker.location.state(),
        ubigeo: faker.string.numeric(6),
        vehicleCount: faker.number.int({ min: 0, max: 5 }),
        statusId: activeStatusId,
      }
    });
    customerIds.push(customer.id);
  }

  // 5. Proveedores
  console.log('🏭 Generando Proveedores...');
  const supplierIds: string[] = [];
  for (let i = 0; i < 30; i++) {
    const supplier = await prisma.supplier.create({
      data: {
        company: faker.company.name(),
        documentType: 'RUC',
        documentNumber: `20${faker.string.numeric(9)}`,
        contact: faker.person.fullName(),
        phone: faker.phone.number(),
        email: faker.internet.email(),
        statusId: activeStatusId,
      }
    });
    supplierIds.push(supplier.id);
  }

  // Helper de fechas (últimos 6 meses)
  const getRandomDate = () => faker.date.recent({ days: 180 });

  // 6. Compras y Movimientos de Entrada
  console.log('🛒 Generando Compras e Inventario...');
  for (let i = 0; i < 200; i++) {
    const date = getRandomDate();
    const itemCount = faker.number.int({ min: 1, max: 10 });
    const items: any[] = [];
    let total = 0;

    for (let j = 0; j < itemCount; j++) {
      const prodId = faker.helpers.arrayElement(productIds);
      const quantity = faker.number.int({ min: 5, max: 50 });
      const unitPrice = parseFloat(faker.commerce.price({ min: 10, max: 100 }));
      const subtotal = quantity * unitPrice;
      total += subtotal;

      items.push({
        productId: prodId,
        quantity,
        unitPrice,
        subtotal
      });

      // Crear movimiento de entrada
      await prisma.movement.create({
        data: {
          date,
          type: 'In',
          quantity,
          reference: `Compra #${i+1}`,
          productId: prodId
        }
      });
    }

    await prisma.purchase.create({
      data: {
        date,
        document: `FACT-${faker.string.numeric(6)}`,
        total,
        statusId: completedStatusId,
        supplierId: faker.helpers.arrayElement(supplierIds),
        items: {
          create: items
        }
      }
    });
  }

  // 7. Ventas Directas y Movimientos de Salida
  console.log('💰 Generando Ventas Directas...');
  for (let i = 0; i < 400; i++) {
    const date = getRandomDate();
    const itemCount = faker.number.int({ min: 1, max: 5 });
    const items: any[] = [];
    let subtotal = 0;

    for (let j = 0; j < itemCount; j++) {
      // 90% productos, 10% servicios directos
      const prodId = faker.helpers.arrayElement(faker.datatype.boolean({ probability: 0.9 }) ? productIds : serviceProductIds);
      const quantity = faker.number.int({ min: 1, max: 4 });
      const unitPrice = parseFloat(faker.commerce.price({ min: 15, max: 200 }));
      const itemSub = quantity * unitPrice;
      subtotal += itemSub;

      items.push({
        productId: prodId,
        type: productIds.includes(prodId) ? 'Product' : 'Service',
        description: faker.commerce.productName(),
        quantity,
        unitPrice,
        subtotal: itemSub
      });

      if (productIds.includes(prodId)) {
        await prisma.movement.create({
          data: {
            date,
            type: 'Out',
            quantity: -quantity, // O usar Out sin signo dependiendo de lógica
            reference: `Venta #${i+1}`,
            productId: prodId
          }
        });
      }
    }

    const tax = subtotal * 0.18;
    const total = subtotal + tax;

    await prisma.sale.create({
      data: {
        date,
        documentType: faker.helpers.arrayElement(['Boleta', 'Factura', 'Ticket']),
        documentNumber: `B001-${faker.string.numeric(6)}`,
        origin: 'Direct',
        subtotal,
        tax,
        total,
        statusId: completedStatusId,
        customerId: faker.helpers.arrayElement(customerIds),
        items: {
          create: items
        }
      }
    });
  }

  // 8. Órdenes de Servicio (Mantenimiento) y Ventas Asociadas
  console.log('🔧 Generando Órdenes de Servicio (Mantenimientos)...');
  for (let i = 0; i < 150; i++) {
    const date = getRandomDate();
    const customerId = faker.helpers.arrayElement(customerIds);
    const itemCount = faker.number.int({ min: 2, max: 6 });
    const items: any[] = [];
    let subtotal = 0;

    for (let j = 0; j < itemCount; j++) {
      // 50% repuestos, 50% mano de obra
      const isPart = faker.datatype.boolean();
      const prodId = faker.helpers.arrayElement(isPart ? productIds : serviceProductIds);
      const quantity = isPart ? faker.number.int({ min: 1, max: 4 }) : 1;
      const unitPrice = parseFloat(faker.commerce.price({ min: 20, max: 300 }));
      const itemSub = quantity * unitPrice;
      subtotal += itemSub;

      items.push({
        productId: prodId,
        type: isPart ? 'Product' : 'Service',
        description: isPart ? 'Repuesto' : 'Mano de Obra',
        quantity,
        unitPrice,
        subtotal: itemSub
      });

      if (isPart) {
        await prisma.movement.create({
          data: {
            date,
            type: 'Out',
            quantity: -quantity,
            reference: `OS-${i+1}`,
            productId: prodId
          }
        });
      }
    }

    const tax = subtotal * 0.18;
    const total = subtotal + tax;

    // Crear la Venta asociada al Servicio
    const sale = await prisma.sale.create({
      data: {
        date,
        documentType: 'Factura',
        documentNumber: `F001-${faker.string.numeric(6)}`,
        origin: 'Service',
        subtotal,
        tax,
        total,
        statusId: completedStatusId,
        customerId,
        items: {
          create: items.map(it => ({
            productId: it.productId,
            type: it.type,
            description: it.description,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            subtotal: it.subtotal
          }))
        }
      }
    });

    // Crear la Orden de Servicio
    await prisma.serviceOrder.create({
      data: {
        date,
        plate: `${faker.string.alpha(3).toUpperCase()}-${faker.string.numeric(3)}`,
        vehicleModel: faker.vehicle.vehicle(),
        mileage: faker.number.int({ min: 1000, max: 150000 }),
        notes: faker.lorem.sentence(),
        orderStatus: 'Completado',
        total,
        statusId: completedStatusId,
        customerId,
        saleId: sale.id,
        items: {
          create: items
        }
      }
    });
  }

  console.log('✅ Seeding Masivo completado con éxito!');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
