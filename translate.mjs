import fs from "fs";
import path from "path";

async function translate(text) {
    if (!text) return "";
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(text)}`;
    try {
        const res = await fetch(url);
        const json = await res.json();
        return json[0].map(x => x[0]).join('');
    } catch (e) {
        console.error("Error translating", e);
        return text;
    }
}

function parseCsv(text) {
    const rows = [];
    let i = 0;
    const len = text.length;

    while (i < len) {
        const row = [];
        while (i < len) {
            if (text[i] === '"') {
                i++;
                let field = "";
                while (i < len) {
                    if (text[i] === '"') {
                        if (i + 1 < len && text[i + 1] === '"') {
                            field += '"';
                            i += 2;
                        } else {
                            i++;
                            break;
                        }
                    } else {
                        field += text[i++];
                    }
                }
                row.push(field);
                if (i < len && text[i] === ",") i++;
                else break;
            } else if (text[i] === "\r" || text[i] === "\n") {
                break;
            } else {
                let field = "";
                while (i < len && text[i] !== "," && text[i] !== "\r" && text[i] !== "\n") {
                    field += text[i++];
                }
                row.push(field.trim());
                if (i < len && text[i] === ",") i++;
                else break;
            }
        }
        if (i < len && text[i] === "\r") i++;
        if (i < len && text[i] === "\n") i++;
        if (row.length > 0 && row.some((f) => f !== "")) rows.push(row);
    }
    return rows;
}

async function main() {
    const t1 = fs.readFileSync("Task 1.csv", "utf-8");
    const t2 = fs.readFileSync("Task 2.csv", "utf-8");

    const rows1 = parseCsv(t1).slice(1);
    const rows2 = parseCsv(t2).slice(1);

    const translations = {};
    let count = 0;

    const allRows = [...rows1, ...rows2];
    for (const row of allRows) {
        for (let c = 0; c < 4; c++) {
            const en = row[c] || "";
            if (en && !translations[en]) {
                count++;
                console.log(`Translating ${count}...`);
                translations[en] = await translate(en);
            }
        }
    }

    const fileContent = `export const viTranslations: Record<string, string> = ${JSON.stringify(translations, null, 2)};\n`;
    fs.writeFileSync("lib/translations.ts", fileContent, "utf-8");
    console.log("Done");
}

main();
