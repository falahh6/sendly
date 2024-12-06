import Papa from "papaparse";

export const parseCSV = (
  csvFile: File,
  selectedColumns: string[]
): Promise<Record<string, string>[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvFile, {
      header: true, // Parse the first row as column names
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as Record<string, string>[];
        const filteredData = data.map((row) =>
          selectedColumns.reduce((acc, col) => {
            acc[col] = row[col];
            return acc;
          }, {} as Record<string, string>)
        );
        resolve(filteredData);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};
