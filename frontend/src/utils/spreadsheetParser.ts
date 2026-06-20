import * as XLSX from 'xlsx';

export type UserImportRow = {
  name: string;
  email: string;
  role: string;
  businessUnit: string;
  status: string;
};

export type HierarchyImportRow = {
  email: string;
  hrbpEmail: string;
  rmEmail: string;
};

const normalizeHeader = (header: string) =>
  header.trim().toLowerCase().replace(/[\s_-]+/g, '');

const USER_HEADER_MAP: Record<string, keyof UserImportRow> = {
  name: 'name',
  fullname: 'name',
  email: 'email',
  emailaddress: 'email',
  role: 'role',
  businessunit: 'businessUnit',
  bu: 'businessUnit',
  status: 'status',
};

const HIERARCHY_HEADER_MAP: Record<string, keyof HierarchyImportRow> = {
  email: 'email',
  useremail: 'email',
  employeeemail: 'email',
  hrbpemail: 'hrbpEmail',
  hrbp: 'hrbpEmail',
  hr: 'hrbpEmail',
  rmemail: 'rmEmail',
  rm: 'rmEmail',
  reportingmanageremail: 'rmEmail',
  reportingmanager: 'rmEmail',
  manageremail: 'rmEmail',
};

function parseWorkbook(file: File): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
        const normalized = rows.map((row) => {
          const mapped: Record<string, string> = {};
          Object.entries(row).forEach(([key, value]) => {
            mapped[normalizeHeader(key)] = String(value ?? '').trim();
          });
          return mapped;
        });
        resolve(normalized);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

function mapRows<T extends Record<string, string>>(
  rawRows: Record<string, string>[],
  headerMap: Record<string, keyof T>,
  requiredFields: (keyof T)[],
): T[] {
  if (rawRows.length === 0) {
    throw new Error('The file is empty');
  }

  const availableHeaders = Object.keys(rawRows[0]);
  const fieldToHeader: Partial<Record<keyof T, string>> = {};

  availableHeaders.forEach((header) => {
    const field = headerMap[header];
    if (field) {
      fieldToHeader[field] = header;
    }
  });

  const missing = requiredFields.filter((field) => !fieldToHeader[field]);
  if (missing.length > 0) {
    throw new Error(`Missing required column(s): ${missing.join(', ')}`);
  }

  return rawRows
    .map((row) => {
      const mapped = {} as T;
      (Object.keys(fieldToHeader) as (keyof T)[]).forEach((field) => {
        const header = fieldToHeader[field]!;
        mapped[field] = (row[header] ?? '') as T[keyof T];
      });
      return mapped;
    })
    .filter((row) => Object.values(row).some((value) => String(value).trim() !== ''));
}

export async function parseUserImportFile(file: File): Promise<UserImportRow[]> {
  const rawRows = await parseWorkbook(file);
  return mapRows<UserImportRow>(rawRows, USER_HEADER_MAP, ['name', 'email', 'role']);
}

export async function parseHierarchyImportFile(file: File): Promise<HierarchyImportRow[]> {
  const rawRows = await parseWorkbook(file);
  return mapRows<HierarchyImportRow>(rawRows, HIERARCHY_HEADER_MAP, ['email']);
}

export const USER_IMPORT_TEMPLATE = 'Name,Email,Role,Business Unit,Status';
export const HIERARCHY_IMPORT_TEMPLATE = 'Email,HRBP Email,RM Email';
