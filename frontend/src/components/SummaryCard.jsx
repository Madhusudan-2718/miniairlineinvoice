import React from 'react';
import { Plane, DollarSign, FileText } from 'lucide-react';

const SummaryCard = ({ summary }) => {
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (!summary || summary.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No summary data available. Process some invoices to see airline-wise totals.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {summary.map((item, index) => (
        <div key={index} className="card card-hover p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                  <Plane className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{item.airline}</h3>
              </div>
              <div className="mt-5 grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Total Amount</span>
                  <span className="text-sm font-semibold text-gray-900">{formatAmount(item.total_amount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Invoice Count</span>
                  <span className="text-sm font-semibold text-gray-900">{item.invoice_count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Average Amount</span>
                  <span className="text-sm font-semibold text-gray-900">{formatAmount(item.total_amount / item.invoice_count)}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center text-blue-600">
              <DollarSign className="w-7 h-7 mb-2" />
              <FileText className="w-5 h-5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCard; 