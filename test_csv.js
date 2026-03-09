const fs = require('fs');

function parseCsv(text) {
    const rows = [];
    let i = 0;
    const len = text.length;

    while (i < len) {
        const row = [];

        while (i < len) {
            if (text[i] === '"') {
                // Quoted field
                i++; // skip opening quote
                let field = "";
                while (i < len) {
                    if (text[i] === '"') {
                        if (i + 1 < len && text[i + 1] === '"') {
                            field += '"';
                            i += 2;
                        } else {
                            i++; // skip closing quote
                            break;
                        }
                    } else {
                        field += text[i++];
                    }
                }
                row.push(field);
                if (i < len && text[i] === ",") i++;
                else break; // comma or end-of-row
            } else if (text[i] === "\r" || text[i] === "\n") {
                break; // end of row
            } else {
                // Unquoted field
                let field = "";
                while (i < len && text[i] !== "," && text[i] !== "\r" && text[i] !== "\n") {
                    field += text[i++];
                }
                row.push(field.trim());
                if (i < len && text[i] === ",") i++;
                else break;
            }
        }

        // Skip line ending
        if (i < len && text[i] === "\r") i++;
        if (i < len && text[i] === "\n") i++;

        if (row.length > 0 && row.some((f) => f !== "")) rows.push(row);
    }

    return rows;
}

const file = fs.readFileSync("ielts_writing_vocab_by_band_with_examples.csv", "utf8");
const rows = parseCsv(file);
console.log("Total rows:", rows.length);
console.log("Line 452 (index 451):", rows[451]);
console.log("Line 901:", rows[901]);
