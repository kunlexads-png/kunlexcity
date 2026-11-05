
import { db } from "../src/db/store.js";
import { prisma } from "../src/db/prisma.js";

async function main() {
  console.log("Starting KunlexCity database seeding...");

  // Seed records individually to avoid Neon transaction timeouts.
    // 1. USERS
    for (const user of db.users) {
      await prisma.user.upsert({
        where: { id: user.id },
        update: {},
        create: {
          id: user.id,
          email: user.email,
          passwordHash: user.passwordHash,
          name: user.name,
          role: user.role,
          phone: user.phone ?? null,
          avatar: user.avatar ?? null,
          bio: user.bio ?? null,
          createdAt: new Date(user.createdAt),
        },
      });
    }

    console.log("Users processed:", db.users.length);

    // 2. PROPERTIES
    for (const property of db.properties) {
      await prisma.property.upsert({
        where: { id: property.id },
        update: {},
        create: {
          id: property.id,
          title: property.title,
          slug: property.slug,
          description: property.description,
          category: property.category,
          listingType: property.listingType,
          price: property.price,
          currency: property.currency,
          country: property.country,
          state: property.state,
          city: property.city,
          area: property.area,
          address: property.address,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          toilets: property.toilets,
          parkingSpaces: property.parkingSpaces,
          propertySize: property.propertySize,
          landSize: property.landSize ?? null,
          amenities: property.amenities,
          images: property.images,
          status: property.status,
          approvalStatus: property.approvalStatus,
          featured: property.featured,
          viewsCount: property.viewsCount,
          createdAt: new Date(property.createdAt),
          updatedAt: new Date(property.updatedAt),
        },
      });
    }

    console.log("Properties processed:", db.properties.length);

    // 3. INQUIRIES
    for (const inquiry of db.inquiries) {
      await prisma.inquiry.upsert({
        where: { id: inquiry.id },
        update: {},
        create: {
          id: inquiry.id,
          propertyId: inquiry.propertyId,
          userId: inquiry.userId ?? null,
          name: inquiry.name,
          email: inquiry.email,
          phone: inquiry.phone,
          message: inquiry.message,
          preferredContactMethod: inquiry.preferredContactMethod,
          status: inquiry.status,
          responseNotes: inquiry.responseNotes ?? null,
          createdAt: new Date(inquiry.createdAt),
        },
      });
    }

    console.log("Inquiries processed:", db.inquiries.length);

    // 4. APPOINTMENTS
    for (const appointment of db.appointments) {
      await prisma.appointment.upsert({
        where: { id: appointment.id },
        update: {},
        create: {
          id: appointment.id,
          propertyId: appointment.propertyId,
          userId: appointment.userId ?? null,
          clientName: appointment.clientName,
          clientEmail: appointment.clientEmail,
          clientPhone: appointment.clientPhone,
          inspectionDate: new Date(
            `${appointment.inspectionDate}T00:00:00.000Z`
          ),
          inspectionTime: appointment.inspectionTime,
          inspectionType: appointment.inspectionType,
          notes: appointment.notes ?? null,
          status: appointment.status,
          createdAt: new Date(appointment.createdAt),
        },
      });
    }

    console.log("Appointments processed:", db.appointments.length);

    // 5. TRANSACTIONS
    for (const transaction of db.transactions) {
      await prisma.transaction.upsert({
        where: { id: transaction.id },
        update: {},
        create: {
          id: transaction.id,
          propertyId: transaction.propertyId,
          transactionType: transaction.transactionType,
          amount: transaction.amount,
          currency: transaction.currency,
          buyerOrTenantName: transaction.buyerOrTenantName,
          buyerOrTenantEmail: transaction.buyerOrTenantEmail,
          buyerOrTenantPhone: transaction.buyerOrTenantPhone ?? null,
          paymentStatus: transaction.paymentStatus,
          referenceNumber: transaction.referenceNumber,
          notes: transaction.notes ?? null,
          transactionDate: new Date(transaction.transactionDate),
        },
      });
    }

    console.log("Transactions processed:", db.transactions.length);

    // 6. FAVOURITES
    for (const favourite of db.favourites) {
      await prisma.favourite.upsert({
        where: {
          userId_propertyId: {
            userId: favourite.userId,
            propertyId: favourite.propertyId,
          },
        },
        update: {},
        create: {
          userId: favourite.userId,
          propertyId: favourite.propertyId,
        },
      });
    }

    console.log("Favourites processed:", db.favourites.length);

    // 7. AUDIT LOGS
    for (const log of db.auditLogs) {
      await prisma.auditLog.upsert({
        where: { id: log.id },
        update: {},
        create: {
          id: log.id,
          userId: log.userId ?? null,
          userName: log.userName ?? null,
          action: log.action,
          details: log.details,
          timestamp: new Date(log.timestamp),
        },
      });
    }

    console.log("Audit logs processed:", db.auditLogs.length);


  console.log("\n========== DATABASE SEEDING COMPLETE ==========");
  console.log("Original KunlexCity records processed successfully.");
}

main()
  .catch((error) => {
    console.error("DATABASE SEEDING FAILED:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();



  });
