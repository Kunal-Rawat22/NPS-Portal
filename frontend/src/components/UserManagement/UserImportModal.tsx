import React, { useRef, useState } from 'react';
import { Upload, X, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import { BulkImportResult } from '../../api/users';

type ImportMode = 'users' | 'hierarchy';

interface Props {
  open: boolean;
  mode: ImportMode;
  title: string;
  description: string;
  template: string;
  columns: string[];
  onClose: () => void;
  onParse: (file: File) => Promise<Record<string, string>[]>;
  onImport: (rows: Record<string, string>[]) => Promise<BulkImportResult>;
  onSuccess: () => void;
}

const UserImportModal: React.FC<Props> = ({
  open,
  mode,
  title,
  description,
  template,
  columns,
  onClose,
  onParse,
  onImport,
  onSuccess,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<BulkImportResult | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const reset = () => {
    setRows([]);
    setFileName('');
    setError('');
    setResult(null);
    setIsParsing(false);
    setIsImporting(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setResult(null);
    setIsParsing(true);

    try {
      const parsed = await onParse(file);
      if (parsed.length === 0) {
        throw new Error('No data rows found in the file');
      }
      setRows(parsed);
      setFileName(file.name);
    } catch (err: unknown) {
      setRows([]);
      setFileName('');
      setError(err instanceof Error ? err.message : 'Failed to parse file');
    } finally {
      setIsParsing(false);
    }
  };

  const handleImport = async () => {
    setError('');
    setIsImporting(true);
    try {
      const importResult = await onImport(rows);
      setResult(importResult);
      if (importResult.failed === 0) {
        onSuccess();
      }
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([`${template}\n`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = mode === 'users' ? 'user-import-template.csv' : 'hierarchy-import-template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!open) return null;

  const previewKeys = rows.length > 0 ? Object.keys(rows[0]) : columns;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close dialog" onClick={handleClose} />
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-lg border border-gray-200 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          </div>
          <button type="button" onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary flex items-center gap-2"
              disabled={isParsing || isImporting}
            >
              <Upload size={16} />
              {isParsing ? 'Reading file...' : 'Choose CSV / Excel file'}
            </button>
            <button type="button" onClick={downloadTemplate} className="btn-secondary flex items-center gap-2 text-sm">
              <Download size={16} /> Download template
            </button>
            {fileName && <span className="text-sm text-gray-500">{fileName} ({rows.length} rows)</span>}
          </div>

          <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
            Expected columns: {columns.join(', ')}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <div className={`border rounded-lg p-3 text-sm ${result.failed > 0 ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
              <div className="flex items-center gap-2 font-medium text-gray-900">
                {result.failed === 0 ? <CheckCircle2 size={16} className="text-green-600" /> : <AlertCircle size={16} className="text-amber-600" />}
                Import complete: {result.created} created, {result.updated} updated, {result.failed} failed
              </div>
              {result.errors.length > 0 && (
                <ul className="mt-2 space-y-1 text-gray-700 max-h-32 overflow-y-auto">
                  {result.errors.map((err, idx) => (
                    <li key={idx}>Row {err.row} ({err.email}): {err.message}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {rows.length > 0 && (
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 text-left text-gray-500">
                    {previewKeys.map(key => (
                      <th key={key} className="px-3 py-2 font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.slice(0, 10).map((row, idx) => (
                    <tr key={idx}>
                      {previewKeys.map(key => (
                        <td key={key} className="px-3 py-2 text-gray-700">{row[key] || '—'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length > 10 && (
                <p className="text-xs text-gray-400 px-3 py-2 border-t border-gray-100">
                  Showing first 10 of {rows.length} rows
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 p-5 border-t border-gray-100">
          <button type="button" onClick={handleClose} className="btn-secondary">Close</button>
          <button
            type="button"
            onClick={handleImport}
            className="btn-primary"
            disabled={rows.length === 0 || isImporting || isParsing}
          >
            {isImporting ? 'Importing...' : 'Import'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserImportModal;
