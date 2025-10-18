import { prisma } from "~/prisma/client";

async function main() {
    await prisma.company.createMany({
        data: {
            code: "BBCA",
            name: "PT Bank Central Asia Tbk",
            sector: "finance",
            listingDate: new Date("2000-05-31"),
            website: "https://www.bca.co.id",
        }
    })

    await prisma.document.createMany({
        data: {
            title: "Laporan Keuangan Tahunan 2024",
            category: "Laporan Keuangan",
            link: "https://www.idx.co.id/media/12345/laporan-bbca-2024.pdf",
            date: new Date("2025-03-10"),
            companyId: 1,
        },
    })

    console.log("✅ Seed data selesai!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
