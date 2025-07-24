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
    console.log(err);
    res.status(500).send("Error reading data");
  }
};

const getSiteInfo = async (req, res) => {
  try {
    const siteName = req.params.siteName;
    const spreadsheetId = SHEET_ID; // Replace with your sheet ID
    const range = "F3:AJ123"; // Adjust the range as needed
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
    console.log(resArr);
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
    const spreadsheetId = SHEET_ID; // Replace with your sheet ID
    let range = "C3:Q12"; // Adjust the range as needed
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
    console.log(err);
    return res.status(500).send(err);
  }
};

// async function findCellContainingValue(spreadsheetId, range, searchValue) {
//   const response = await sheets.spreadsheets.values.get({
//     spreadsheetId,
//     range: range,
//   });

//   const values = response.data.values;
//   console.log(values);
//   for (let rowIndex = 0; rowIndex < values.length; rowIndex++) {
//     for (let colIndex = 0; colIndex < values[rowIndex].length; colIndex++) {
//       if (values[rowIndex][colIndex] === searchValue) {
//         const cellAddress = `${String.fromCharCode(65 + colIndex)}${
//           rowIndex + 1
//         }`;
//         return cellAddress;
//       }
//     }
//   }

//   return null;
// }

// replace with your actual sheet ID

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
  console.log(monthCol);
  const add = `${index[date]}${monthCol}`;
  console.log(add);
  return add;
}

function splitCellAddress(cellAddress) {
  // Use regular expression to match the letter part and numeric part separately
  const match = cellAddress.match(/^([A-Z]+)(\d+)$/);

  if (match) {
    // match[1] is the letter part, match[2] is the numeric part
    const str = match[1];
    const num = parseInt(match[2], 10);
    return [str, num];
  } else {
    // Return null values if the cell address is invalid
    return [null, null];
  }
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
    console.log(
      siteName,
      date,
      piles,
      StaffMember,
      Opretor,
      Labour,
      Mechanic,
      Welder,
      Fitter,
      Diesel
    );
    const cellAddress = await findCellContainingValue(
      SHEET_ID,
      `${siteName}!F1:F387`,
      `${date}`
    );
    console.log(cellAddress);
    if (!cellAddress) {
      return res.status(404).send("Value not found");
    }

    // console.log(`Cell containing ${date}: ${cellAddress}`);

    // Split the cell address into column and row
    const [column, rowNumber] = splitCellAddress(cellAddress);

    // Calculate the next row to append data
    const nextRow = rowNumber + 1;

    // Prepare data to append (single column of data)
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

    // Fetch the sheet ID
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID,
    });

    // console.log(spreadsheet, SHEET_ID);

    const sheet = spreadsheet.data.sheets.find(
      (sheet) => sheet.properties.title === siteName
    );

    if (!sheet) {
      return res.status(404).send("Sheet not found");
    }

    const sheetId = sheet.properties.sheetId;

    // Create requests for batchUpdate
    const requests = dataToAppend.map((data, index) => ({
      updateCells: {
        range: {
          sheetId: sheetId,
          startRowIndex: nextRow + index - 1,
          endRowIndex: nextRow + index,
          startColumnIndex: column.charCodeAt(0) - 65,
          endColumnIndex: column.charCodeAt(0) - 64,
        },
        rows: [
          {
            values: [
              {
                userEnteredValue: { stringValue: data[0] },
              },
            ],
          },
        ],
        fields: "userEnteredValue",
      },
    }));

    // Batch update request
    const batchUpdateRequest = {
      spreadsheetId: SHEET_ID,
      resource: {
        requests,
      },
    };

    const result = await sheets.spreadsheets.batchUpdate(batchUpdateRequest);

    return res.send("updated successfully").status(200);
  } catch (error) {
    console.error("Error appending data:", error);
    return res.status(500).send("Error appending data");
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
