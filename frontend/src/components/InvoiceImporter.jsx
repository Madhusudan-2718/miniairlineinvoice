import React, { useState } from 'react';
import { FileJson, Import, CheckCircle2, AlertCircle, Play } from 'lucide-react';
import { passengerAPI, invoiceAPI } from '../services/api';

const InvoiceImporter = ({ onUpdate }) => {
  const [jsonData, setJsonData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [autoDownload, setAutoDownload] = useState(true);
  const [autoParse, setAutoParse] = useState(true);

  const extractPnrs = (arr) => arr.map((inv) => String(inv['Invoice Number'] ?? inv.invoice_number ?? inv.invoiceNumber ?? inv.number));

  const normalizeName = (raw, fallback) => {
    const name = String(raw || '').trim();
    if (!name) return fallback;
    // Pattern like: LAST / FIRST TITLE or LAST / FIRST MID TITLE
    if (name.includes('/')) {
      const [lastPart, rest] = name.split('/').map(s => s.trim());
      const parts = rest.split(/\s+/);
      let title = '';
      const titles = ['MR', 'MS', 'MRS', 'MSTR', 'MISS', 'DR'];
      if (parts.length > 1 && titles.includes(parts[parts.length - 1].toUpperCase())) {
        title = parts.pop().toUpperCase();
      }
      const first = parts.join(' ');
      const full = `${title ? title + ' ' : ''}${first} ${lastPart}`.trim();
      return full;
    }
    return name;
  };

  const extractName = (inv, fallback) => normalizeName(inv['Name'] ?? inv.name, fallback);

  const handleImport = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const parsed = JSON.parse(jsonData);
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Provide a non-empty array of invoice objects');

      // Seed backend invoice metadata exactly as provided
      await invoiceAPI.seed(parsed);

      const pnrs = extractPnrs(parsed);
      const passengers = pnrs.map((pnr, i) => ({ name: extractName(parsed[i], `INV ${pnr}`), pnr }));

      let createdCount = 0;
      try {
        const res = await passengerAPI.createBulk(passengers);
        createdCount = res?.data?.passengers?.length ?? 0;
      } catch (_) {}

      let processed = 0;
      if (autoDownload) {
        for (const pnr of pnrs) {
          try {
            const d = await invoiceAPI.download(pnr);
            if (autoParse && d?.data?.status === 'Success') await invoiceAPI.parse(pnr);
            processed++;
          } catch (_) {}
        }
      }

      setSuccess(`Imported ${createdCount} new passengers. Processed ${processed} PNRs.`);
      setJsonData('');
      onUpdate?.();
    } catch (err) {
      setError(err?.message || 'Failed to import invoice data');
    } finally {
      setIsLoading(false);
    }
  };

  const sampleInvoices = [
    { 'Invoice Number': '07P2407IV014983', Date: '2024-07-19', Airline: 'Thai Airways', Name: 'SAINI / VIKAS MR', Amount: 98535, GSTIN: '07AAAJT0025A1ZT' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <FileJson className="w-5 h-5 text-purple-600 mr-2" />
        <h2 className="text-lg font-semibold text-gray-900">Import Invoice JSON</h2>
      </div>

      <form onSubmit={handleImport} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Data (JSON)</label>
            <textarea
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
              placeholder="Paste array of invoice objects..."
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={autoDownload} onChange={(e) => setAutoDownload(e.target.checked)} />
                <span className="text-sm text-gray-700">Auto-download after import</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={autoParse} onChange={(e) => setAutoParse(e.target.checked)} disabled={!autoDownload} />
                <span className={`text-sm ${!autoDownload ? 'text-gray-400' : 'text-gray-700'}`}>Auto-parse after download</span>
              </label>
              <button
                type="button"
                onClick={() => setJsonData(JSON.stringify(sampleInvoices, null, 2))}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                disabled={isLoading}
              >
                <Import className="w-4 h-4 mr-2" /> Load Sample
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={isLoading || !jsonData.trim()}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
              isLoading || !jsonData.trim() ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Import and Process
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex">
            <CheckCircle2 className="w-5 h-5 text-green-400 mr-2" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        </div>
      )}

      <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
        <p className="text-xs text-gray-600">
          Creates passengers with name from the invoice <strong>Name</strong> field (normalized to "TITLE FIRST LAST") and PNR from <strong>Invoice Number</strong>.
        </p>
      </div>
    </div>
  );
};

export default InvoiceImporter; 