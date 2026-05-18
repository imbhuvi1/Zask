import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  /**
   * Exports an array of objects to a CSV file and triggers a browser download.
   * @param data The data to export
   * @param fileName The name of the file (without extension)
   */
  exportToCsv(data: any[], fileName: string): void {
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    const separator = ',';
    const keys = Object.keys(data[0]);

    // Create header row
    const header = keys.join(separator);

    // Create data rows
    const csvRows = data.map(row => {
      return keys.map(key => {
        let value = row[key];
        
        // Handle null/undefined
        if (value === null || value === undefined) value = '';
        
        // Escape quotes and wrap in quotes if contains separator or newline
        const stringValue = String(value).replace(/"/g, '""');
        if (stringValue.includes(separator) || stringValue.includes('\n') || stringValue.includes('\r')) {
          return `"${stringValue}"`;
        }
        return stringValue;
      }).join(separator);
    });

    const csvContent = [header, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
