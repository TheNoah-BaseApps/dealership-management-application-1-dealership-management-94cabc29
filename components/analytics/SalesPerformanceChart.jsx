'use client';

export default function SalesPerformanceChart({ data }) {
  if (!data || !data.salespersons || data.salespersons.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No sales performance data available</p>
      </div>
    );
  }

  const maxSales = Math.max(...data.salespersons.map(s => parseFloat(s.total_sales || 0)));

  return (
    <div className="space-y-4">
      {data.salespersons.map((salesperson, index) => {
        const percentage = maxSales > 0 ? ((salesperson.total_sales / maxSales) * 100).toFixed(1) : 0;
        
        return (
          <div key={index}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{salesperson.name}</span>
              <span className="text-sm text-gray-600">
                ${parseFloat(salesperson.total_sales || 0).toLocaleString()} ({salesperson.count} sales)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}