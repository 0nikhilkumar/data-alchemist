import { Brain, Zap } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-emerald-600 p-2 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Data Alchemist</h1>
              <p className="text-sm text-gray-600">AI Resource Allocation Platform</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            <Zap className="h-4 w-4" />
            <span className="font-medium">AI Powered</span>
          </div>
        </div>
      </div>
    </header>
  );
}