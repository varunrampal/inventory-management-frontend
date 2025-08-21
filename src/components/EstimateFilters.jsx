import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function EstimateFilters({ onFilterChange }) {
const [status, setStatus] = useState('All');
  const [dateRange, setDateRange] = useState('This Month');
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [estimateId, setEstimateId] = useState('');

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    onFilterChange({ status: newStatus, dateRange, customStartDate, customEndDate, customerName });
  };

  const handleDateChange = (e) => {
    const newRange = e.target.value;
    setDateRange(newRange);
    onFilterChange({ status, dateRange: newRange, customStartDate, customEndDate });
  };

  const handleCustomStartChange = (date) => {
    setCustomStartDate(date);
    onFilterChange({ status, dateRange, customStartDate: date, customEndDate });
  };

  const handleCustomEndChange = (date) => {
    setCustomEndDate(date);
    onFilterChange({ status, dateRange, customStartDate, customEndDate: date });
  };
  const handleEstimateIdChange = (e) => {
    setEstimateId(e.target.value);
    onFilterChange({ status, dateRange, customStartDate, customEndDate, customerName, estimateId: e.target.value });
  };
  const handleCustomerNameChange = (e) => {
    setCustomerName(e.target.value);
    onFilterChange({ status, dateRange, customStartDate, customEndDate, customerName: e.target.value, estimateId });
  };

  return (
     <div className="flex flex-wrap gap-6 mb-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={status}
              onChange={handleStatusChange}
              className="border px-3 py-2 rounded text-sm"
            >
              <option>All</option>
              <option>Accepted</option>
              <option>Pending</option>
              <option>Declined</option>
              <option>Closed</option>
            </select>
          </div>
    
        {/* <div>
          <label className="block text-sm">Estimate ID</label>
          <input
            type="text"
            name="estimateId"
            value={estimateId}
            onChange={handleEstimateIdChange}
            className="border px-2 py-1 rounded text-sm"
          />
        </div> */}
    

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estimate Date</label>
            <select
              value={dateRange}
              onChange={handleDateChange}
              className="border px-3 py-2 rounded text-sm"
            >
              <option>This Month</option>
              <option>Last Month</option>
              <option>Today</option>
              <option>Yesterday</option>
              <option>This Week</option>
              <option>Last Week</option>
              <option>This Year</option>
              <option>Last Year</option>
              <option>Custom</option>
            
            </select>
          </div>
    
          {dateRange === 'Custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <DatePicker
                  selected={customStartDate}
                  onChange={handleCustomStartChange}
                  className="border px-3 py-2 rounded text-sm"
                  placeholderText="Start"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <DatePicker
                  selected={customEndDate}
                  onChange={handleCustomEndChange}
                  className="border px-3 py-2 rounded text-sm"
                  placeholderText="End"
                />
              </div>
 
            </>
          )}
                         <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
          <input
            type="text"
            name="customerName"
            value={customerName}
            onChange={handleCustomerNameChange}
            className="border px-3 py-2 rounded text-sm"
          />
        </div>
        </div>
  );
}
