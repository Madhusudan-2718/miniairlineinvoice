import React, { useState, useEffect } from 'react';
import { Plane, RefreshCw, AlertCircle } from 'lucide-react';
import { passengerAPI, invoiceAPI, summaryAPI } from './services/api';
import DataInput from './components/DataInput';
import PassengerTable from './components/PassengerTable';
import InvoiceTable from './components/InvoiceTable';
import SummaryCard from './components/SummaryCard';
import InvoiceImporter from './components/InvoiceImporter';

function App() {
  const [passengers, setPassengers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [passengersRes, invoicesRes, summaryRes] = await Promise.all([
        passengerAPI.getAll(),
        invoiceAPI.getAll(),
        summaryAPI.getSummary()
      ]);

      setPassengers(passengersRes.data);
      setInvoices(invoicesRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      setError('Failed to fetch data. Please check if the backend server is running.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Plane className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">
                Airline Invoice Workflow
              </h1>
            </div>
            <button
              onClick={fetchData}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Summary Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Airline Summary</h2>
          <SummaryCard summary={summary} />
        </div>

        {/* Import Invoice JSON */}
        <div className="mb-8">
          <InvoiceImporter onUpdate={fetchData} />
        </div>

        {/* Data Input Section */}
        <div className="mb-8">
          <DataInput onUpdate={fetchData} />
        </div>

        {/* Passenger Records Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Passenger Records</h2>
          <PassengerTable passengers={passengers} onUpdate={fetchData} />
        </div>

        {/* Parsed Invoices Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Parsed Invoices</h2>
          <InvoiceTable invoices={invoices} onUpdate={fetchData} />
        </div>
      </main>
    </div>
  );
}

export default App; 