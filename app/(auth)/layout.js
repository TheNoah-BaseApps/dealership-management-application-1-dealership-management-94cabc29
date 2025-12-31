import { Car } from 'lucide-react';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Car className="h-10 w-10 text-blue-600" />
            <span className="text-3xl font-bold text-gray-900">DealerPro</span>
          </div>
          <p className="text-gray-600">Dealership Management System</p>
        </div>
        {children}
      </div>
    </div>
  );
}