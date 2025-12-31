'use client';

export default function LeadSourceChart({ data }) {
  if (!data || !data.sources || data.sources.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No lead source data available</p>
      </div>
    );
  }

  const total = data.sources.reduce((sum, source) => sum + parseInt(source.count || 0), 0);

  return (
    <div className="space-y-4">
      {data.sources.map((source, index) => {
        const percentage = total > 0 ? ((source.count / total) * 100).toFixed(1) : 0;
        
        return (
          <div key={index}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium capitalize">{source.source}</span>
              <span className="text-sm text-gray-600">{source.count} ({percentage}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}