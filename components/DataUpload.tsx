'use client';

import { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDataStore } from '@/lib/store';
import { FileProcessor } from '@/lib/file-processor';
import { toast } from 'sonner';

interface DataUploadProps {
  onComplete: () => void;
}

export function DataUpload({ onComplete }: DataUploadProps) {
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [processingStatus, setProcessingStatus] = useState<Record<string, 'idle' | 'processing' | 'success' | 'error'>>({});
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  
  const { setClients, setWorkers, setTasks } = useDataStore();

  const handleFileUpload = useCallback(async (file: File, type: 'clients' | 'workers' | 'tasks') => {
    setProcessingStatus(prev => ({ ...prev, [type]: 'processing' }));
    setUploadProgress(prev => ({ ...prev, [type]: 0 }));
    
    try {
      const processor = new FileProcessor();
      
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => ({
          ...prev,
          [type]: Math.min((prev[type] || 0) + Math.random() * 20, 90)
        }));
      }, 200);

      const result = await processor.processFile(file, type);
      
      clearInterval(progressInterval);
      setUploadProgress(prev => ({ ...prev, [type]: 100 }));
      
      if (result.errors.length > 0) {
        setErrors(prev => ({ ...prev, [type]: result.errors }));
        setProcessingStatus(prev => ({ ...prev, [type]: 'error' }));
        toast.error(`${type} file has errors`);
        return;
      }

      switch (type) {
        case 'clients':
          setClients(result.data);
          break;
        case 'workers':
          setWorkers(result.data);
          break;
        case 'tasks':
          setTasks(result.data);
          break;
      }

      setProcessingStatus(prev => ({ ...prev, [type]: 'success' }));
      toast.success(`${type} data loaded successfully`);
      
    } catch (error) {
      setProcessingStatus(prev => ({ ...prev, [type]: 'error' }));
      setErrors(prev => ({ 
        ...prev, 
        [type]: [`Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`] 
      }));
      toast.error(`Failed to process ${type} file`);
    }
  }, [setClients, setWorkers, setTasks]);

  const handleDrop = useCallback((e: React.DragEvent, type: 'clients' | 'workers' | 'tasks') => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file, type);
    }
  }, [handleFileUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>, type: 'clients' | 'workers' | 'tasks') => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, type);
    }
  }, [handleFileUpload]);

  const allUploaded = ['clients', 'workers', 'tasks'].every(type => 
    processingStatus[type] === 'success'
  );

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Data Files</h2>
        <p className="text-gray-600">
          Upload your CSV or XLSX files for clients, workers, and tasks. Our AI will intelligently map columns and validate data.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(['clients', 'workers', 'tasks'] as const).map((type) => (
          <FileUploadCard
            key={type}
            type={type}
            status={processingStatus[type] || 'idle'}
            progress={uploadProgress[type] || 0}
            errors={errors[type] || []}
            onDrop={(e) => handleDrop(e, type)}
            onFileSelect={(e) => handleFileSelect(e, type)}
          />
        ))}
      </div>

      {allUploaded && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
                <div>
                  <h3 className="font-semibold text-emerald-900">All Files Uploaded Successfully!</h3>
                  <p className="text-emerald-700">Ready to view and validate your data</p>
                </div>
              </div>
              <Button onClick={onComplete} className="bg-emerald-600 hover:bg-emerald-700">
                Continue to Data View
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface FileUploadCardProps {
  type: 'clients' | 'workers' | 'tasks';
  status: 'idle' | 'processing' | 'success' | 'error';
  progress: number;
  errors: string[];
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function FileUploadCard({ type, status, progress, errors, onDrop, onFileSelect }: FileUploadCardProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />;
      case 'success':
        return <CheckCircle className="h-6 w-6 text-emerald-600" />;
      case 'error':
        return <AlertCircle className="h-6 w-6 text-red-600" />;
      default:
        return <FileSpreadsheet className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'border-emerald-200 bg-emerald-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'processing':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 hover:border-blue-300';
    }
  };

  return (
    <Card className={`${getStatusColor()} transition-colors`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 capitalize">
          {getStatusIcon()}
          <span>{type} Data</span>
        </CardTitle>
        <CardDescription>
          Upload {type}.csv or {type}.xlsx file
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => document.getElementById(`file-${type}`)?.click()}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-sm text-gray-600 mb-2">
            Drop your {type} file here or click to browse
          </p>
          <p className="text-xs text-gray-500">
            Supports CSV and XLSX files
          </p>
          <input
            id={`file-${type}`}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={onFileSelect}
            className="hidden"
          />
        </div>

        {status === 'processing' && (
          <div className="mt-4">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-gray-600 mt-2">Processing file... {Math.round(progress)}%</p>
          </div>
        )}

        {errors.length > 0 && (
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm">{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}