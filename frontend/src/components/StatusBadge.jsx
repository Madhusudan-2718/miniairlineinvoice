import React from 'react';

const StatusBadge = ({ status, className = '' }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'Success':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          icon: '✅'
        };
      case 'Pending':
        return {
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          icon: '⏳'
        };
      case 'Error':
        return {
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          icon: '❌'
        };
      case 'Not Found':
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          icon: '🔍'
        };
      default:
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          icon: '❓'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} ${className}`}>
      <span className="mr-1">{config.icon}</span>
      {status}
    </span>
  );
};

export default StatusBadge; 