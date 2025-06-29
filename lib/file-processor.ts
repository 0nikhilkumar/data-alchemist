import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { FileUploadResult } from './types';

export class FileProcessor {
  async processFile(file: File, type: 'clients' | 'workers' | 'tasks'): Promise<FileUploadResult> {
    try {
      const data = await this.parseFile(file);
      const mappedData = this.mapAndValidateData(data, type);
      
      return {
        data: mappedData.data,
        headers: data.headers,
        mappedHeaders: mappedData.mappedHeaders,
        errors: mappedData.errors
      };
    } catch (error) {
      return {
        data: [],
        headers: [],
        mappedHeaders: {},
        errors: [error instanceof Error ? error.message : 'Unknown error occurred']
      };
    }
  }

  private async parseFile(file: File): Promise<{ data: any[], headers: string[] }> {
    return new Promise((resolve, reject) => {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (fileExtension === 'csv') {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            resolve({
              data: results.data,
              headers: results.meta.fields || []
            });
          },
          error: (error) => reject(error)
        });
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            if (jsonData.length === 0) {
              reject(new Error('Empty file'));
              return;
            }

            const headers = jsonData[0] as string[];
            const rows = jsonData.slice(1).map(row => {
              const obj: any = {};
              headers.forEach((header, index) => {
                obj[header] = (row as any[])[index] || '';
              });
              return obj;
            });

            resolve({ data: rows, headers });
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsArrayBuffer(file);
      } else {
        reject(new Error('Unsupported file format'));
      }
    });
  }

  private mapAndValidateData(
    rawData: { data: any[], headers: string[] },
    type: 'clients' | 'workers' | 'tasks'
  ): { data: any[], mappedHeaders: Record<string, string>, errors: string[] } {
    const errors: string[] = [];
    const mappedHeaders: Record<string, string> = {};
    
    // AI-powered column mapping
    const expectedFields = this.getExpectedFields(type);
    const mapping = this.intelligentColumnMapping(rawData.headers, expectedFields);
    
    // Validate that all required fields are mapped
    const requiredFields = this.getRequiredFields(type);
    const missingFields = requiredFields.filter(field => !mapping[field]);
    
    if (missingFields.length > 0) {
      errors.push(`Missing required columns: ${missingFields.join(', ')}`);
    }

    // Map and transform data
    const mappedData = rawData.data.map((row, index) => {
      const mappedRow: any = {};
      
      Object.entries(mapping).forEach(([expectedField, actualField]) => {
        if (actualField && row[actualField] !== undefined) {
          mappedRow[expectedField] = this.transformValue(row[actualField], expectedField, type);
          mappedHeaders[expectedField] = actualField;
        }
      });

      // Validate row data
      const rowErrors = this.validateRowData(mappedRow, type, index + 1);
      errors.push(...rowErrors);

      return mappedRow;
    }).filter((row: any) => Object.keys(row).length > 0);

    return { data: mappedData, mappedHeaders, errors };
  }

  private getExpectedFields(type: 'clients' | 'workers' | 'tasks'): string[] {
    switch (type) {
      case 'clients':
        return ['ClientID', 'ClientName', 'PriorityLevel', 'RequestedTaskIDs', 'GroupTag', 'AttributesJSON'];
      case 'workers':
        return ['WorkerID', 'WorkerName', 'Skills', 'AvailableSlots', 'MaxLoadPerPhase', 'WorkerGroup', 'QualificationLevel'];
      case 'tasks':
        return ['TaskID', 'TaskName', 'Category', 'Duration', 'RequiredSkills', 'PreferredPhases', 'MaxConcurrent'];
      default:
        return [];
    }
  }

  private getRequiredFields(type: 'clients' | 'workers' | 'tasks'): string[] {
    switch (type) {
      case 'clients':
        return ['ClientID', 'ClientName', 'PriorityLevel'];
      case 'workers':
        return ['WorkerID', 'WorkerName', 'Skills'];
      case 'tasks':
        return ['TaskID', 'TaskName', 'Duration'];
      default:
        return [];
    }
  }

  private intelligentColumnMapping(actualHeaders: string[], expectedFields: string[]): Record<string, string> {
    const mapping: Record<string, string> = {};
    
    expectedFields.forEach(expectedField => {
      // Direct match
      let match = actualHeaders.find(header => 
        header.toLowerCase() === expectedField.toLowerCase()
      );
      
      if (!match) {
        // Fuzzy matching
        match = actualHeaders.find(header => {
          const headerLower = header.toLowerCase().replace(/[^a-z0-9]/g, '');
          const expectedLower = expectedField.toLowerCase().replace(/[^a-z0-9]/g, '');
          
          // Check if headers contain similar words
          return headerLower.includes(expectedLower) || expectedLower.includes(headerLower);
        });
      }
      
      if (!match) {
        // Semantic mapping
        match = this.semanticMapping(expectedField, actualHeaders);
      }
      
      if (match) {
        mapping[expectedField] = match;
      }
    });
    
    return mapping;
  }

  private semanticMapping(expectedField: string, actualHeaders: string[]): string | undefined {
    const semanticMappings: Record<string, string[]> = {
      'ClientID': ['id', 'client_id', 'clientid', 'client'],
      'ClientName': ['name', 'client_name', 'clientname', 'title'],
      'PriorityLevel': ['priority', 'level', 'importance', 'priority_level'],
      'WorkerID': ['id', 'worker_id', 'workerid', 'employee_id'],
      'WorkerName': ['name', 'worker_name', 'workername', 'employee_name'],
      'Skills': ['skill', 'skills', 'abilities', 'competencies'],
      'TaskID': ['id', 'task_id', 'taskid', 'task'],
      'TaskName': ['name', 'task_name', 'taskname', 'title'],
      'Duration': ['duration', 'time', 'length', 'phases'],
    };

    const alternatives = semanticMappings[expectedField] || [];
    
    return actualHeaders.find(header => {
      const headerLower = header.toLowerCase();
      return alternatives.some(alt => headerLower.includes(alt));
    });
  }

  private transformValue(value: any, field: string, type: string): any {
    if (value === null || value === undefined || value === '') {
      return this.getDefaultValue(field, type);
    }

    // Transform based on field type
    switch (field) {
      case 'PriorityLevel':
      case 'Duration':
      case 'MaxLoadPerPhase':
      case 'MaxConcurrent':
      case 'QualificationLevel':
        return parseInt(value) || 0;
      
      case 'RequestedTaskIDs':
      case 'Skills':
      case 'RequiredSkills':
        if (typeof value === 'string') {
          return value.split(',').map(s => s.trim()).filter(s => s.length > 0);
        }
        return Array.isArray(value) ? value : [];
      
      case 'AvailableSlots':
      case 'PreferredPhases':
        if (typeof value === 'string') {
          // Handle different formats: "1,2,3", "[1,2,3]", "1-3"
          if (value.includes('-')) {
            const [start, end] = value.split('-').map(s => parseInt(s.trim()));
            return Array.from({ length: end - start + 1 }, (_, i) => start + i);
          }
          const cleaned = value.replace(/[\[\]]/g, '');
          return cleaned.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
        }
        return Array.isArray(value) ? value : [];
      
      case 'AttributesJSON':
        if (typeof value === 'string') {
          try {
            JSON.parse(value);
            return value;
          } catch {
            return '{}';
          }
        }
        return JSON.stringify(value);
      
      default:
        return value;
    }
  }

  private getDefaultValue(field: string, type: string): any {
    switch (field) {
      case 'PriorityLevel':
        return 3;
      case 'Duration':
      case 'MaxLoadPerPhase':
      case 'MaxConcurrent':
      case 'QualificationLevel':
        return 1;
      case 'RequestedTaskIDs':
      case 'Skills':
      case 'RequiredSkills':
      case 'AvailableSlots':
      case 'PreferredPhases':
        return [];
      case 'AttributesJSON':
        return '{}';
      case 'GroupTag':
      case 'WorkerGroup':
      case 'Category':
        return 'default';
      default:
        return '';
    }
  }

  private validateRowData(row: any, type: string, rowNumber: number): string[] {
    const errors: string[] = [];
    
    // Basic validation
    const requiredFields = this.getRequiredFields(type);
    requiredFields.forEach(field => {
      if (!row[field] || (typeof row[field] === 'string' && row[field].trim() === '')) {
        errors.push(`Row ${rowNumber}: Missing required field '${field}'`);
      }
    });

    // Type-specific validation
    if (type === 'clients' && row.PriorityLevel) {
      if (row.PriorityLevel < 1 || row.PriorityLevel > 5) {
        errors.push(`Row ${rowNumber}: PriorityLevel must be between 1-5`);
      }
    }

    if (type === 'tasks' && row.Duration) {
      if (row.Duration < 1) {
        errors.push(`Row ${rowNumber}: Duration must be at least 1`);
      }
    }

    return errors;
  }
}