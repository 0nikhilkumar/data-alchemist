'use client';

import { useState } from 'react';
import { DataUpload } from '@/components/DataUpload';
import { DataViewer } from '@/components/DataViewer';
import { RuleBuilder } from '@/components/RuleBuilder';
import { ValidationPanel } from '@/components/ValidationPanel';
import { PrioritySettings } from '@/components/PrioritySettings';
import { ExportPanel } from '@/components/ExportPanel';
import { Header } from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDataStore } from '@/lib/store';

export default function Home() {
  const { clients, workers, tasks, validationResults } = useDataStore();
  const [activeTab, setActiveTab] = useState('upload');

  const hasData = clients.length > 0 || workers.length > 0 || tasks.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🚀 Data Alchemist
          </h1>
          <p className="text-xl text-gray-600">
            Forge Your Own AI Resource‑Allocation Configurator
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="upload">Upload Data</TabsTrigger>
            <TabsTrigger value="view" disabled={!hasData}>View & Edit</TabsTrigger>
            <TabsTrigger value="validate" disabled={!hasData}>Validation</TabsTrigger>
            <TabsTrigger value="rules" disabled={!hasData}>Business Rules</TabsTrigger>
            <TabsTrigger value="priorities" disabled={!hasData}>Priorities</TabsTrigger>
            <TabsTrigger value="export" disabled={!hasData}>Export</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <DataUpload onComplete={() => setActiveTab('view')} />
          </TabsContent>

          <TabsContent value="view" className="space-y-6">
            <DataViewer />
          </TabsContent>

          <TabsContent value="validate" className="space-y-6">
            <ValidationPanel />
          </TabsContent>

          <TabsContent value="rules" className="space-y-6">
            <RuleBuilder />
          </TabsContent>

          <TabsContent value="priorities" className="space-y-6">
            <PrioritySettings />
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <ExportPanel />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}