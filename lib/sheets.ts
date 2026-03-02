import { google } from "googleapis";

const HEADERS = [
  "Timestamp", "Name", "Age", "Address", "Mobile", "Email",
  "Current L", "Current R", "Current W", "Current S", "Target Band",
  "Task Type", "Task Number", "Question (excerpt)", "Word Count",
  "Band TA", "Band CC", "Band LR", "Band GRA", "Band Overall",
  "Feedback JSON", "Subscribed",
];

export async function appendToSheet(rowData: Record<string, unknown>): Promise<void> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!email || !key || !sheetId) {
    console.warn("Google Sheets env vars not configured — skipping sheet append.");
    return;
  }

  try {
    const auth = new google.auth.JWT({
      email,
      key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const check = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "Sheet1!A1:V1",
    });

    if (!check.data.values || check.data.values.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: "Sheet1!A1",
        valueInputOption: "RAW",
        requestBody: { values: [HEADERS] },
      });
    }

    const row = [
      new Date().toISOString(),
      rowData.name,
      rowData.age,
      rowData.address,
      rowData.mobile,
      rowData.email,
      rowData.currentBandL,
      rowData.currentBandR,
      rowData.currentBandW,
      rowData.currentBandS,
      rowData.targetBand,
      rowData.taskType,
      rowData.taskNumber,
      String(rowData.question || "").substring(0, 200),
      rowData.wordCount,
      rowData.bandTA,
      rowData.bandCC,
      rowData.bandLR,
      rowData.bandGRA,
      rowData.bandOverall,
      JSON.stringify(rowData.feedback || {}),
      rowData.subscribed ? "YES" : "NO",
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "Sheet1!A:V",
      valueInputOption: "RAW",
      requestBody: { values: [row] },
    });
  } catch (err) {
    console.error("Sheets append error:", err);
  }
}
