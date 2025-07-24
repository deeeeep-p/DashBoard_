const { date } = require("zod");
const { sheets, SHEET_ID, client } = require("../Auth/startup");
const { GaxiosError } = require("gaxios"); // Import GaxiosError

const retrieveSites = async (req, res) => {
  try {
    const sheet = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
    const sites = sheet.data.sheets
      .map((siteObj) => {
        return siteObj.properties.title;
      })
      .splice(2);
    res.send(sites);
  } catch (err) {
    console.log("errorwhat", err);
    res.status(500).send("Error reading data");
  }
};

const getSiteInfo = async (req, res) => {
  try {
    const siteName = req.params.siteName;
    const spreadsheetId = SHEET_ID;
    const range = "F3:AJ123";
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${siteName}!${range}`,
    });
    const resArr = response.data.values;
    const findPilesIndex =
      resArr.findIndex((eleArr) => {
        return (
          eleArr[0] &&
          typeof eleArr[0] === "string" &&
          eleArr[0].includes(`${req.params.month}`)
        );
      }) + 1;
    console.log("reswhat", resArr, resArr[findPilesIndex]);
    return res.send(resArr[findPilesIndex]);
  } catch (err) {
    if (err instanceof GaxiosError) {
      return res.status(404).send("Site not found");
    }
    console.log(err);
    return res.status(500).send(err);
  }
};

const getMonthlyInfo = async (req, res) => {
  try {
    const siteName = req.params.siteName;
    const spreadsheetId = SHEET_ID;
    let range = "C3:Q12";
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `Monthly!${range}`,
    });
    console.log(response.data.values);
    return res.send(response.data.values);
  } catch (err) {
    if (err instanceof GaxiosError) {
      return res.status(404).send("Site not found");
    }
    console.log("resError", err);
    return res.status(500).send(err);
  }
};

async function findCellContainingValue(spreadsheetId, range, searchValue) {
  const index = [
    "",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "AA",
    "AB",
    "AC",
    "AD",
    "AE",
    "AF",
    "AG",
    "AH",
    "AI",
    "AJ",
  ];
  console.time("time");
  const [date, month] = searchValue.split("-");
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });
  console.timeEnd("time");
  const values = response.data.values;
  const flattenedVal = values.map((item) => item[0]);
  const monthCol = flattenedVal.findIndex((el) => el && el.includes(month)) + 1;
  const add = `${index[date]}${monthCol}`;
  console.log("res", add, flattenedVal);
  return add;
}

function splitCellAddress(cellAddress) {
  const match = cellAddress.match(/^([A-Z]+)(\d+)$/);
  if (match) {
    const str = match[1];
    const num = parseInt(match[2], 10);
    return [str, num];
  } else {
    return [null, null];
  }
}

// ✨ NEW HELPER FUNCTION to correctly convert column names like 'A', 'Z', 'AC' to a 0-based index.
function getColumnIndex(columnName) {
  let index = 0;
  for (let i = 0; i < columnName.length; i++) {
    const charValue = columnName.charCodeAt(i) - 64; // A=1, B=2, ...
    index = index * 26 + charValue;
  }
  return index - 1; // Return 0-based index
}

const updateSiteInfor = async (req, res) => {
  try {
    const {
      siteName,
      date,
      piles,
      StaffMember,
      Opretor,
      Labour,
      Mechanic,
      Welder,
      Fitter,
      Diesel,
    } = req.body;

    const cellAddress = await findCellContainingValue(
      SHEET_ID,
      `${siteName}!F1:F387`,
      `${date}`
    );
    console.log(cellAddress);

    if (!cellAddress) {
      return res.status(404).send("Value not found");
    }

    const [column, rowNumber] = splitCellAddress(cellAddress);
    if (!column) {
      return res.status(400).send("Invalid cell address found");
    }

    const nextRow = rowNumber + 1;
    const dataToAppend = [
      [piles],
      [StaffMember],
      [Opretor],
      [Labour],
      [Mechanic],
      [Welder],
      [Fitter],
      [Diesel],
    ];

    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID,
    });
    const sheet = spreadsheet.data.sheets.find(
      (s) => s.properties.title === siteName
    );
    if (!sheet) {
      return res.status(404).send("Sheet not found");
    }
    const sheetId = sheet.properties.sheetId;

    // ✨ CORRECTED LOGIC: Use the getColumnIndex function
    const columnIndex = getColumnIndex(column);

    const requests = dataToAppend.map((data, index) => {
      return {
        updateCells: {
          range: {
            sheetId: sheetId,
            startRowIndex: nextRow + index - 1,
            endRowIndex: nextRow + index,
            startColumnIndex: columnIndex, // Use the correctly calculated index
            endColumnIndex: columnIndex + 1, // End index is start + 1 for a single column
          },
          rows: [
            {
              values: [
                {
                  userEnteredValue: { stringValue: String(data[0]) }, // Ensure value is a string
                },
              ],
            },
          ],
          fields: "userEnteredValue",
        },
      };
    });

    const batchUpdateRequest = {
      spreadsheetId: SHEET_ID,
      resource: { requests },
    };

    await sheets.spreadsheets.batchUpdate(batchUpdateRequest);
    return res.status(200).send("Updated successfully");
  } catch (error) {
    console.error("Error updating data:", error);
    return res.status(500).send("Error updating data");
  }
};

module.exports = {
  sheets,
  SHEET_ID,
  retrieveSites,
  getSiteInfo,
  getMonthlyInfo,
  updateSiteInfor,
};
