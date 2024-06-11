type dbRowType = { [key: string]: any };
type dbRowsType = dbRowType[];

export function parseJsonColumnsForDbRows(columns: string[], dbRows: dbRowsType): dbRowsType {
  return dbRows.map((row) => {
    columns.forEach(column => {
      row[column] = JSON.parse(row[column]);
    });
    return row;
  });
}

export function parseJsonColumnsForDbRow(columns: string[], dbRow: dbRowType): dbRowType {
  const parsedDbRow = { ...dbRow };

  columns.forEach(column => {
    parsedDbRow[column] = JSON.parse(parsedDbRow[column]);
  });

  return parsedDbRow;
}