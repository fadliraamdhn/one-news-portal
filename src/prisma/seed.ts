import fs from "fs";
import csv from "csv-parser";
import path from "path";
import { prisma } from "~/prisma/client";

type CompanyCSV = {
  code: string;
  name: string;
  listingDate: string;
};

async function main() {
  const results: CompanyCSV[] = [];
  const filePath = path.resolve(__dirname, "../seed-data/all.csv");

  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", resolve)
      .on("error", reject);
  });

  console.log(`Membaca ${results.length} baris dari CSV...`);
  const companies = results.map((row) => ({
    code: row.code?.trim(),
    name: row.name?.trim(),
    listingDate: row.listingDate ? new Date(row.listingDate) : null,
  }));

  await prisma.company.createMany({
    data: companies,
    skipDuplicates: true,
  });

  console.log(`Berhasil menambahkan ${companies.length} data perusahaan!`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error("Error saat seeding:", err);
    prisma.$disconnect();
    process.exit(1);
  });
