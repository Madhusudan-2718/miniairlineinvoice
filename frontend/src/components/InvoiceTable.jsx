import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import { ExternalLink, Flag, CheckCircle } from 'lucide-react';
import { invoiceAPI } from '../services/api';

const InvoiceTable = ({ invoices, onUpdate }) => {
  const [loadingStates, setLoadingStates] = useState({});

  const handleFlagToggle = async (invoiceId, currentFlag) => {
    setLoadingStates(prev => ({ ...prev, [`flag_${invoiceId}`]: true }));
    try {
      await invoiceAPI.flagForReview(invoiceId, !currentFlag);
      onUpdate();
    } catch (error) {
      console.error('Flag toggle failed:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [`flag_${invoiceId}`]: false }));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  const formatAmount = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const openPDF = (pdfPath) => {
    if (pdfPath) {
      window.open(`http://localhost:8000${pdfPath}`, '_blank');
    }
  };

  if (!invoices || invoices.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No invoices found. Download and parse some invoices to see them here.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Invoice No
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Airline
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              GSTIN
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              PDF Link
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Review Flag
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {invoice.invoice_number || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(invoice.invoice_date)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {invoice.airline || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {formatAmount(invoice.amount)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {invoice.gstin || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                {invoice.pdf_path ? (
                  <button
                    onClick={() => openPDF(invoice.pdf_path)}
                    className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    View PDF
                  </button>
                ) : (
                  <span className="text-gray-400">No PDF</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => handleFlagToggle(invoice.id, invoice.flag_for_review)}
                  disabled={loadingStates[`flag_${invoice.id}`]}
                  className={`inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md ${
                    invoice.flag_for_review
                      ? 'text-red-700 bg-red-100 hover:bg-red-200'
                      : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {loadingStates[`flag_${invoice.id}`] ? (
                    <div className="w-3 h-3 mr-1 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : invoice.flag_for_review ? (
                    <Flag className="w-3 h-3 mr-1" />
                  ) : (
                    <CheckCircle className="w-3 h-3 mr-1" />
                  )}
                  {invoice.flag_for_review ? 'Flagged' : 'Flag'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InvoiceTable; 