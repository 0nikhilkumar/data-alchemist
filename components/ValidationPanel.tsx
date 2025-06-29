'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle, Lightbulb, Wand2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDataStore } from '@/lib/store';
import { DataValidator } from '@/lib/validators';
import { AIEngine } from '@/lib/ai-engine';
import { toast } from 'sonner';

export function ValidationPanel() {
  const { 
    clients, 
    workers, 
    tasks, 
    validationResults, 
    setValidationResults,
    updateClient,
    updateWorker,
    updateTask
  } = useDataStore();
  const [isValidating, setIsValidating] = useState(false);
  const [corrections, setCorrections] = useState<any[]>([]);
  const [isGeneratingCorrections, setIsGeneratingCorrections] = useState(false);
  const [appliedCorrections, setAppliedCorrections] = useState<Set<string>>(new Set());

  useEffect(() => {
    runValidation();
  }, [clients, workers, tasks]);

  const runValidation = async () => {
    setIsValidating(true);
    try {
      const validator = new DataValidator(clients, workers, tasks);
      const results = validator.validateAll();
      setValidationResults(results);
      
      if (results.some(r => r.type === 'error')) {
        await generateAICorrections(results);
      }
      
      toast.success(`Validation completed: ${results.length} issues found`);
    } catch (error) {
      console.error('Validation error:', error);
      toast.error('Validation failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsValidating(false);
    }
  };

  const generateAICorrections = async (validationResultsParam?: any[]) => {
    setIsGeneratingCorrections(true);
    try {
      const resultsToUse = validationResultsParam || validationResults;
      const allData = [...clients, ...workers, ...tasks];
      const aiCorrections = await AIEngine.suggestDataCorrections(allData, resultsToUse);
      setCorrections(aiCorrections);
      if (!validationResultsParam) {
        toast.success(`Generated ${aiCorrections.length} correction suggestions`);
      }
    } catch (error) {
      console.error('AI corrections error:', error);
      toast.error('Failed to generate corrections: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsGeneratingCorrections(false);
    }
  };

  const applyCorrection = async (correction: any, index: number) => {
    try {
      const { entityId, field, suggestedValue } = correction;
      
      const client = clients.find(c => c.ClientID === entityId);
      const worker = workers.find(w => w.WorkerID === entityId);
      const task = tasks.find(t => t.TaskID === entityId);
      
      if (client) {
        updateClient(entityId, { [field]: suggestedValue });
        toast.success(`Applied correction to client ${entityId}`);
      } else if (worker) {
        updateWorker(entityId, { [field]: suggestedValue });
        toast.success(`Applied correction to worker ${entityId}`);
      } else if (task) {
        updateTask(entityId, { [field]: suggestedValue });
        toast.success(`Applied correction to task ${entityId}`);
      } else {
        toast.error('Entity not found');
        return;
      }
      
      setAppliedCorrections(prev => new Set([...prev, `${entityId}-${field}`]));
      
      setCorrections(prev => prev.filter((_, i) => i !== index));
      
      setTimeout(() => {
        runValidation();
      }, 500);
      
    } catch (error) {
      console.error('Apply correction error:', error);
      toast.error('Failed to apply correction: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const dismissCorrection = (index: number) => {
    setCorrections(prev => prev.filter((_, i) => i !== index));
    toast.info('Correction dismissed');
  };

  const errorResults = validationResults.filter(r => r.type === 'error');
  const warningResults = validationResults.filter(r => r.type === 'warning');
  const infoResults = validationResults.filter(r => r.type === 'info');

  const getValidationIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
    }
  };

  const getValidationBadge = (type: string) => {
    switch (type) {
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800">Warning</Badge>;
      case 'info':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Info</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Data Validation</h2>
          <p className="text-gray-600">Comprehensive validation with AI-powered error detection</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={() => generateAICorrections()}
            disabled={isGeneratingCorrections || validationResults.length === 0}
            variant="outline"
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            {isGeneratingCorrections ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
            ) : (
              <Wand2 className="h-4 w-4" />
            )}
            AI Corrections
          </Button>
          <Button 
            onClick={runValidation}
            disabled={isValidating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isValidating ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            ) : null}
            Run Validation
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={validationResults.length === 0 ? 'border-emerald-200 bg-emerald-50' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              {validationResults.length === 0 ? (
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              ) : (
                <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm font-medium">{validationResults.length}</span>
                </div>
              )}
              <div>
                <p className="font-medium">Total Issues</p>
                <p className="text-2xl font-bold">{validationResults.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={errorResults.length > 0 ? 'border-red-200 bg-red-50' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-6 w-6 text-red-600" />
              <div>
                <p className="font-medium text-red-800">Errors</p>
                <p className="text-2xl font-bold text-red-900">{errorResults.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={warningResults.length > 0 ? 'border-amber-200 bg-amber-50' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800">Warnings</p>
                <p className="text-2xl font-bold text-amber-900">{warningResults.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={corrections.length > 0 ? 'border-blue-200 bg-blue-50' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Lightbulb className="h-6 w-6 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800">AI Suggestions</p>
                <p className="text-2xl font-bold text-blue-900">{corrections.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {validationResults.length === 0 ? (
        <Alert className="border-emerald-200 bg-emerald-50">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="text-emerald-800">
            🎉 All validation checks passed! Your data is ready for rule configuration.
          </AlertDescription>
        </Alert>
      ) : (
        <Tabs defaultValue="errors" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="errors" className="flex items-center space-x-2">
              <XCircle className="h-4 w-4" />
              <span>Errors ({errorResults.length})</span>
            </TabsTrigger>
            <TabsTrigger value="warnings" className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Warnings ({warningResults.length})</span>
            </TabsTrigger>
            <TabsTrigger value="info" className="flex items-center space-x-2">
              <Info className="h-4 w-4" />
              <span>Info ({infoResults.length})</span>
            </TabsTrigger>
            <TabsTrigger value="corrections" className="flex items-center space-x-2">
              <Lightbulb className="h-4 w-4" />
              <span>AI Suggestions ({corrections.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="errors">
            <ValidationResultsList results={errorResults} />
          </TabsContent>

          <TabsContent value="warnings">
            <ValidationResultsList results={warningResults} />
          </TabsContent>

          <TabsContent value="info">
            <ValidationResultsList results={infoResults} />
          </TabsContent>

          <TabsContent value="corrections">
            <CorrectionsList 
              corrections={corrections} 
              onApply={applyCorrection}
              onDismiss={dismissCorrection}
              appliedCorrections={appliedCorrections}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function ValidationResultsList({ results }: { results: any[] }) {
  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-500">No issues found in this category</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {results.map((result) => (
        <Card key={result.id}>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {result.type === 'error' && <XCircle className="h-4 w-4 text-red-600" />}
                {result.type === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-600" />}
                {result.type === 'info' && <Info className="h-4 w-4 text-blue-600" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="outline" className="capitalize">
                    {result.entityType}
                  </Badge>
                  <Badge variant="secondary">
                    {result.entityId}
                  </Badge>
                  {result.field && (
                    <Badge variant="outline" className="text-xs">
                      {result.field}
                    </Badge>
                  )}
                </div>
                <p className="text-gray-900 mb-2">{result.message}</p>
                {result.suggestion && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <div className="flex items-start space-x-2">
                      <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Suggestion:</p>
                        <p className="text-sm text-blue-800">{result.suggestion}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface CorrectionsListProps {
  corrections: any[];
  onApply: (correction: any, index: number) => void;
  onDismiss: (index: number) => void;
  appliedCorrections: Set<string>;
}

function CorrectionsList({ corrections, onApply, onDismiss, appliedCorrections }: CorrectionsListProps) {
  if (corrections.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Lightbulb className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">No AI corrections available</p>
          <p className="text-sm text-gray-400 mt-2">Run validation first to generate suggestions</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {corrections.map((correction, index) => {
        const correctionKey = `${correction.entityId}-${correction.field}`;
        const isApplied = appliedCorrections.has(correctionKey);
        
        return (
          <Card key={index} className={isApplied ? 'opacity-50 bg-gray-50' : ''}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="outline">{correction.entityId}</Badge>
                    <Badge variant="secondary">{correction.field}</Badge>
                    <Badge variant="outline" className="text-xs">
                      {Math.round(correction.confidence * 100)}% confidence
                    </Badge>
                    {isApplied && (
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                        Applied
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600">Current:</span>
                      <span className="ml-2 text-sm font-mono bg-red-50 px-2 py-1 rounded">
                        {correction.currentValue}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Suggested:</span>
                      <span className="ml-2 text-sm font-mono bg-emerald-50 px-2 py-1 rounded">
                        {Array.isArray(correction.suggestedValue) 
                          ? correction.suggestedValue.join(', ')
                          : correction.suggestedValue
                        }
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{correction.reason}</p>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <Button 
                    size="sm" 
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => onApply(correction, index)}
                    disabled={isApplied}
                  >
                    {isApplied ? 'Applied' : 'Apply'}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onDismiss(index)}
                    disabled={isApplied}
                  >
                    {isApplied ? 'Done' : 'Ignore'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}