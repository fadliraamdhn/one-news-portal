import fs from "fs";
import csv from "csv-parser";
import path from "path";
import { prisma } from "~/prisma/client";

type DocumentCSV = {
    title: string;
    category: string;
    link: string;
    date: string;
    companyCode: string;
};

async function main() {
    const results: DocumentCSV[] = [];
    const filePath = path.resolve(__dirname, "../seed-data/laporankeuangan2021.csv");

    await new Promise<void>((resolve, reject) => {
        fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", resolve)
        .on("error", reject);
    });

    console.log(`📖 Membaca ${results.length} baris dari CSV...`);


    const invalidRows = results.filter((row) => {
        const d = new Date(row.date?.trim());
        return isNaN(d.getTime());
    });

    if (invalidRows.length > 0) {
        console.log("⚠️ Ditemukan baris dengan tanggal invalid:");
        invalidRows.forEach((r, i) => {
        console.log(`${i + 1}. companyCode: ${r.companyCode}, raw date: "${r.date}"`);
        });
    } else {
        console.log("✅ Semua tanggal valid!");
    }

    const documents = results.map((row) => ({
        title: row.title?.trim(),
        category: row.category?.trim(),
        link: row.link?.trim(),
        date: new Date(row.date?.trim()),
        companyCode: row.companyCode?.trim(),
    }));

    await prisma.document.createMany({
        data: documents,
        skipDuplicates: true,
    });

    console.log(`✅ Berhasil menambahkan ${documents.length} dokumen!`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error("❌ Error saat seeding:", err);
    prisma.$disconnect();
    process.exit(1);
  });
