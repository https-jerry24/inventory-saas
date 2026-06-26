import { PrismaClient, Prisma } from '@prisma/client'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

const TENANTS = [
  {
    name: 'Al-Kareem Electronics Lahore',
    slug: 'al-kareem-electronics',
    plan: 'pro',
  },
  {
    name: 'Bano Qabil Traders Karachi',
    slug: 'bano-qabil-traders',
    plan: 'pro',
  },
  {
    name: 'Faisal Supermart Islamabad',
    slug: 'faisal-supermart',
    plan: 'enterprise',
  },
  {
    name: 'Gulshan Foods',
    slug: 'gulshan-foods',
    plan: 'free',
  },
  {
    name: 'Pak Digital Solutions',
    slug: 'pak-digital-solutions',
    plan: 'pro',
  },
]

const ELECTRONICS_CATEGORIES = [
  'Smartphones',
  'Laptops',
  'Tablets',
  'Audio',
  'Accessories',
]

const FOOD_CATEGORIES = [
  'Rice',
  'Oil',
  'Spices',
  'Beverages',
  'Dairy',
]

const GENERAL_CATEGORIES = [
  'Electronics',
  'Clothing',
  'Groceries',
  'Stationery',
  'Sports',
]

function electronicsProduct() {
  const brands = [
    'Samsung',
    'Apple',
    'Huawei',
    'Xiaomi',
    'Oppo',
    'Vivo',
    'Dell',
    'HP',
  ]

  const products = [
    'Phone',
    'Laptop',
    'Tablet',
    'Earbuds',
    'Power Bank',
  ]

  return `${faker.helpers.arrayElement(brands)} ${faker.helpers.arrayElement(products)}`
}

function foodProduct() {
  const brands = [
    'Shan',
    'National',
    'Nestle',
    'Tapal',
    'Mitchells',
  ]

  const products = [
    'Tea',
    'Rice',
    'Juice',
    'Biscuits',
    'Spice Mix',
  ]

  return `${faker.helpers.arrayElement(brands)} ${faker.helpers.arrayElement(products)}`
}

async function main() {
  console.log('Starting seed...')
  console.log('Keeping existing data...')

  for (const tenantData of TENANTS) {
    console.log(`Creating tenant: ${tenantData.name}`)

    let tenant

try {
  tenant = await prisma.tenants.upsert({
    where: {
      slug: tenantData.slug,
    },
    update: {},
    create: {
      name: tenantData.name,
      slug: tenantData.slug,
      plan: tenantData.plan,
    },
  })
} catch (error) {
  console.log(`Skipping ${tenantData.name}`)
  console.error(error)
  continue
}

    const isFood =
      tenantData.slug.includes('food') ||
      tenantData.slug.includes('supermart')

    const isElectronics =
      tenantData.slug.includes('electronics') ||
      tenantData.slug.includes('digital')

    const categoryNames = isFood
      ? FOOD_CATEGORIES
      : isElectronics
      ? ELECTRONICS_CATEGORIES
      : GENERAL_CATEGORIES

    const categories = []

    for (const categoryName of categoryNames) {
      let category = await prisma.categories.findFirst({
        where: {
          tenant_id: tenant.id,
          name: categoryName,
        },
      })

      if (!category) {
        category = await prisma.categories.create({
          data: {
            tenant_id: tenant.id,
            name: categoryName,
          },
        })
      }

      categories.push(category)
    }

    const suppliers = []

    for (let i = 1; i <= 3; i++) {
      const supplierName = `Supplier ${i}`

      let supplier = await prisma.suppliers.findFirst({
        where: {
          tenant_id: tenant.id,
          name: supplierName,
        },
      })

      if (!supplier) {
        supplier = await prisma.suppliers.create({
          data: {
            tenant_id: tenant.id,
            name: supplierName,
            email: faker.internet.email(),
            phone: `03${faker.number.int({
              min: 100000000,
              max: 999999999,
            })}`,
          },
        })
      }

      suppliers.push(supplier)
    }

    const warehouseCount = await prisma.warehouses.count({
      where: {
        tenant_id: tenant.id,
      },
    })

    if (warehouseCount === 0) {
      await prisma.warehouses.createMany({
        data: [
          {
            tenant_id: tenant.id,
            name: 'Main Warehouse',
            location: `${faker.location.city()}, Pakistan`,
          },
          {
            tenant_id: tenant.id,
            name: 'Secondary Warehouse',
            location: `${faker.location.city()}, Pakistan`,
          },
        ],
      })
    }

    const existingProducts = await prisma.products.count({
      where: {
        tenant_id: tenant.id,
      },
    })

    if (existingProducts >= 100) {
      console.log(
        `✓ ${tenant.name}: already has ${existingProducts} products`
      )
      continue
    }

    const products: Prisma.productsCreateManyInput[] = []

    for (let i = existingProducts; i < 100; i++) {
      const category =
        faker.helpers.arrayElement(categories)

      const supplier =
        faker.helpers.arrayElement(suppliers)

      const productName = isFood
        ? foodProduct()
        : isElectronics
        ? electronicsProduct()
        : faker.commerce.productName()

      const price = isElectronics
        ? faker.number.int({
            min: 2000,
            max: 350000,
          })
        : isFood
        ? faker.number.int({
            min: 100,
            max: 5000,
          })
        : faker.number.int({
            min: 500,
            max: 50000,
          })

      products.push({
        tenant_id: tenant.id,
        category_id: category.id,
        supplier_id: supplier.id,
        name: productName,
        sku: `${tenant.slug
          .slice(0, 4)
          .toUpperCase()}-${String(i + 1).padStart(4, '0')}`,
        barcode: faker.string.numeric(13),
        unit_price: new Prisma.Decimal(price),
        quantity_on_hand: faker.number.int({
          min: 0,
          max: 500,
        }),
        reorder_point: faker.number.int({
          min: 5,
          max: 50,
        }),
      })
    }

    if (products.length > 0) {
      for (let i = 0; i < products.length; i += 25) {
  await prisma.products.createMany({
    data: products.slice(i, i + 25),
  })
}
    }

    console.log(
      `✓ ${tenant.name}: added ${products.length} products`
    )
  }

  const totalTenants = await prisma.tenants.count()
  const totalProducts = await prisma.products.count()

  console.log('\nSeed Complete')
  console.log(`Tenants: ${totalTenants}`)
  console.log(`Products: ${totalProducts}`)
}

main()
  .then(async () => {
    console.log('Database seeded successfully')
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error('Seed failed:')
    console.error(error)

    await prisma.$disconnect()
    process.exit(1)
  })