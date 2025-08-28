import React, { useState } from 'react';
import { Upload, Users, AlertCircle } from 'lucide-react';
import { passengerAPI } from '../services/api';

const DataInput = ({ onUpdate }) => {
  const [jsonData, setJsonData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const sampleData = [
    { "name": "John Doe", "pnr": "ABC123" },
    { "name": "Jane Smith", "pnr": "XYZ789" },
    { "name": "Bob Johnson", "pnr": "DEF456" }
  ];

  // Safe example string for rendering in JSX
  const exampleJson = '[{"name": "John Doe", "pnr": "ABC123"}]';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const parsedData = JSON.parse(jsonData);
      
      if (!Array.isArray(parsedData)) {
        throw new Error('Data must be an array of passenger objects');
      }

      if (parsedData.length === 0) {
        throw new Error('Data array cannot be empty');
      }

      // Validate each passenger object
      for (let i = 0; i < parsedData.length; i++) {
        const passenger = parsedData[i];
        if (!passenger.name || !passenger.pnr) {
          throw new Error(`Passenger at index ${i} must have both 'name' and 'pnr' fields`);
        }
      }

      const response = await passengerAPI.createBulk(parsedData);
      setSuccess(response.data.message);
      setJsonData('');
      onUpdate();
    } catch (err) {
      setError(err.message || 'Failed to create passengers');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSampleData = () => {
    setJsonData(JSON.stringify(sampleData, null, 2));
    setError('');
    setSuccess('');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <Users className="w-5 h-5 text-blue-600 mr-2" />
        <h2 className="text-lg font-semibold text-gray-900">Add Passenger Data</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="jsonData" className="block text-sm font-medium text-gray-700 mb-2">
            Passenger Data (JSON Format)
          </label>
          <textarea
            id="jsonData"
            value={jsonData}
            onChange={(e) => setJsonData(e.target.value)}
            placeholder="Enter passenger data in JSON format..."
            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={loadSampleData}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            <Upload className="w-4 h-4 mr-2" />
            Load Sample Data
          </button>

          <button
            type="submit"
            disabled={isLoading || !jsonData.trim()}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
              isLoading || !jsonData.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Users className="w-4 h-4 mr-2" />
                Add Passengers
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
            <Users className="w-5 h-5 text-green-400 mr-2" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        </div>
      )}

      <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
        <p className="text-xs text-gray-600">
          <strong>Format:</strong> Array of objects with "name" and "pnr" fields. Example: <code>{exampleJson}</code>
        </p>
      </div>
    </div>
  );
};

export default DataInput; 