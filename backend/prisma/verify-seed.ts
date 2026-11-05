import { prisma } from "../src/db/prisma.js";

async function main() {
  console.log("\n========== KUNLEXCITY DATABASE CHECK ==========");

  console.log("Users:", await prisma.user.count());
  console.log("Properties:", await prisma.property.count());
  console.log("Inquiries:", await prisma.inquiry.count());
  console.log("Appointments:", await prisma.appointment.count());
  console.log("Transactions:", await prisma.transaction.count());
  console.log("Favourites:", await prisma.favourite.count());
  console.log("Audit logs:", await prisma.auditLog.count());

  console.log("===============================================\n");
}

main()
  .catch((error) => {
    console.error("DATABASE CHECK FAILED:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
