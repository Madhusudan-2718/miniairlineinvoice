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
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center">
                <Plane className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">{item.airline}</h3>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Total Amount:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatAmount(item.total_amount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Invoice Count:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {item.invoice_count}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Average Amount:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatAmount(item.total_amount / item.invoice_count)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <DollarSign className="w-8 h-8 text-green-600 mb-1" />
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCard; 