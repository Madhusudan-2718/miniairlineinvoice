import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import { Download, FileText, RefreshCw } from 'lucide-react';
import { passengerAPI, invoiceAPI } from '../services/api';

const PassengerTable = ({ passengers, onUpdate }) => {
  const [loadingStates, setLoadingStates] = useState({});

  const handleDownload = async (pnr) => {
    setLoadingStates(prev => ({ ...prev, [`download_${pnr}`]: true }));
    try {
      await invoiceAPI.download(pnr);
      onUpdate();
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [`download_${pnr}`]: false }));
    }
  };

  const handleParse = async (pnr) => {
    setLoadingStates(prev => ({ ...prev, [`parse_${pnr}`]: true }));
    try {
      await invoiceAPI.parse(pnr);
      onUpdate();
    } catch (error) {
      console.error('Parse failed:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [`parse_${pnr}`]: false }));
    }
  };

  const isDownloadLoading = (pnr) => loadingStates[`download_${pnr}`];
  const isParseLoading = (pnr) => loadingStates[`parse_${pnr}`];

  if (!passengers || passengers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No passengers found. Add some passenger data to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Passenger Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              PNR
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Download Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Parse Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {passengers.map((passenger) => (
            <tr key={passenger.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {passenger.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {passenger.pnr}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={passenger.download_status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={passenger.parse_status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDownload(passenger.pnr)}
                    disabled={isDownloadLoading(passenger.pnr)}
                    className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white ${
                      isDownloadLoading(passenger.pnr)
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isDownloadLoading(passenger.pnr) ? (
                      <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Download className="w-3 h-3 mr-1" />
                    )}
                    Download
                  </button>
                  
                  <button
                    onClick={() => handleParse(passenger.pnr)}
                    disabled={
                      isParseLoading(passenger.pnr) ||
                      passenger.download_status !== 'Success'
                    }
                    className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white ${
                      isParseLoading(passenger.pnr) || passenger.download_status !== 'Success'
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {isParseLoading(passenger.pnr) ? (
                      <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <FileText className="w-3 h-3 mr-1" />
                    )}
                    Parse
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PassengerTable; 