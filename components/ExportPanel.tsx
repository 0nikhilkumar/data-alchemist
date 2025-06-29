'use client';

import { useState } from 'react';
import { Download, FileText, Settings, CheckCircle, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useDataStore } from '@/lib/store';
import { toast } from 'sonner';
import Papa from 'papaparse';

export function ExportPanel() {
  const { clients, workers, tasks, businessRules, priorityWeights, validationResults } = useDataStore();
  const [exportOptions, setExportOptions] = useState({
    clients: true,
    workers: true,
    tasks: true,
    rules: true,
    priorities: true,
    validation: false
  });
  const [isExporting, setIsExporting] = useState(false);

  const hasErrors = validationResults.some(result => result.type === 'error');

  const handleExportOptionChange = (option: string, checked: boolean) => {
    setExportOptions(prev => ({ ...prev, [option]: checked }));
  };

  const exportToCSV = (data: any[], filename: string) => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToJSON = (data: any, filename: string) => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAll = async () => {
    setIsExporting(true);
    
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      
      // Export data files
      if (exportOptions.clients && clients.length > 0) {
        exportToCSV(clients, `clients-cleaned-${timestamp}.csv`);
      }
      
      if (exportOptions.workers && workers.length > 0) {
        exportToCSV(workers, `workers-cleaned-${timestamp}.csv`);
      }
      
      if (exportOptions.tasks && tasks.length > 0) {
        exportToCSV(tasks, `tasks-cleaned-${timestamp}.csv`);
      }
      
      // Export configuration files
      if (exportOptions.rules) {
        const rulesConfig = {
          rules: businessRules.filter(rule => rule.enabled),
          metadata: {
            totalRules: businessRules.length,
            enabledRules: businessRules.filter(rule => rule.enabled).length,
            exportedAt: new Date().toISOString(),
            version: '1.0'
          }
        };
        exportToJSON(rulesConfig, `rules-config-${timestamp}.json`);
      }
      
      if (exportOptions.priorities) {
        const prioritiesConfig = {
          weights: priorityWeights,
          metadata: {
            exportedAt: new Date().toISOString(),
            version: '1.0'
          }
        };
        exportToJSON(prioritiesConfig, `priorities-config-${timestamp}.json`);
      }
      
      if (exportOptions.validation) {
        const validationReport = {
          summary: {
            totalIssues: validationResults.length,
            errors: validationResults.filter(r => r.type === 'error').length,
            warnings: validationResults.filter(r => r.type === 'warning').length,
            info: validationResults.filter(r => r.type === 'info').length
          },
          issues: validationResults,
          metadata: {
            exportedAt: new Date().toISOString(),
            dataStats: {
              clients: clients.length,
              workers: workers.length,
              tasks: tasks.length
            }
          }
        };
        exportToJSON(validationReport, `validation-report-${timestamp}.json`);
      }
      
      toast.success('Export completed successfully');
    } catch (error) {
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const getFileCount = () => {
    let count = 0;
    if (exportOptions.clients) count++;
    if (exportOptions.workers) count++;
    if (exportOptions.tasks) count++;
    if (exportOptions.rules) count++;
    if (exportOptions.priorities) count++;
    if (exportOptions.validation) count++;
    return count;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Export Configuration</h2>
          <p className="text-gray-600">Download your cleaned data and configuration files</p>
        </div>
        <Button 
          onClick={exportAll}
          disabled={isExporting || getFileCount() === 0}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {isExporting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
          ) : (
            <Package className="h-4 w-4 mr-2" />
          )}
          Export All ({getFileCount()} files)
        </Button>
      </div>

      {hasErrors && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertDescription className="text-amber-800">
            ⚠️ Your data still contains validation errors. Consider fixing these issues before export for optimal results.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data Files */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>Cleaned Data Files</span>
            </CardTitle>
            <CardDescription>
              Export your validated and cleaned CSV data files
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Checkbox 
                id="clients-export"
                checked={exportOptions.clients}
                onCheckedChange={(checked) => handleExportOptionChange('clients', checked as boolean)}
              />
              <label htmlFor="clients-export" className="flex-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <span>Clients Data</span>
                  <Badge variant="secondary">{clients.length} records</Badge>
                </div>
                <p className="text-sm text-gray-600">clients-cleaned-{new Date().toISOString().split('T')[0]}.csv</p>
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox 
                id="workers-export"
                checked={exportOptions.workers}
                onCheckedChange={(checked) => handleExportOptionChange('workers', checked as boolean)}
              />
              <label htmlFor="workers-export" className="flex-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <span>Workers Data</span>
                  <Badge variant="secondary">{workers.length} records</Badge>
                </div>
                <p className="text-sm text-gray-600">workers-cleaned-{new Date().toISOString().split('T')[0]}.csv</p>
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox 
                id="tasks-export"
                checked={exportOptions.tasks}
                onCheckedChange={(checked) => handleExportOptionChange('tasks', checked as boolean)}
              />
              <label htmlFor="tasks-export" className="flex-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <span>Tasks Data</span>
                  <Badge variant="secondary">{tasks.length} records</Badge>
                </div>
                <p className="text-sm text-gray-600">tasks-cleaned-{new Date().toISOString().split('T')[0]}.csv</p>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Configuration Files */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-purple-600" />
              <span>Configuration Files</span>
            </CardTitle>
            <CardDescription>
              Export your business rules and priority configurations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Checkbox 
                id="rules-export"
                checked={exportOptions.rules}
                onCheckedChange={(checked) => handleExportOptionChange('rules', checked as boolean)}
              />
              <label htmlFor="rules-export" className="flex-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <span>Business Rules</span>
                  <Badge variant="secondary">{businessRules.filter(r => r.enabled).length} active</Badge>
                </div>
                <p className="text-sm text-gray-600">rules-config-{new Date().toISOString().split('T')[0]}.json</p>
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox 
                id="priorities-export"
                checked={exportOptions.priorities}
                onCheckedChange={(checked) => handleExportOptionChange('priorities', checked as boolean)}
              />
              <label htmlFor="priorities-export" className="flex-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <span>Priority Weights</span>
                  <Badge variant="secondary">5 criteria</Badge>
                </div>
                <p className="text-sm text-gray-600">priorities-config-{new Date().toISOString().split('T')[0]}.json</p>
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox 
                id="validation-export"
                checked={exportOptions.validation}
                onCheckedChange={(checked) => handleExportOptionChange('validation', checked as boolean)}
              />
              <label htmlFor="validation-export" className="flex-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <span>Validation Report</span>
                  <Badge variant="secondary">{validationResults.length} issues</Badge>
                </div>
                <p className="text-sm text-gray-600">validation-report-{new Date().toISOString().split('T')[0]}.json</p>
              </label>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Summary */}
      <Card className="border-emerald-200 bg-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <span>Export Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-emerald-900">{clients.length}</div>
              <div className="text-sm text-emerald-700">Clients</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-900">{workers.length}</div>
              <div className="text-sm text-emerald-700">Workers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-900">{tasks.length}</div>
              <div className="text-sm text-emerald-700">Tasks</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-900">{businessRules.filter(r => r.enabled).length}</div>
              <div className="text-sm text-emerald-700">Active Rules</div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="text-center">
            <p className="text-emerald-800 font-medium">Ready for Resource Allocation</p>
            <p className="text-sm text-emerald-700 mt-1">
              Your data has been processed and is ready for downstream allocation systems
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}