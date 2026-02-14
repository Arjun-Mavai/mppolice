'use client';

import { useState } from 'react';
import { uploadSyllabusData } from '@/features/syllabus/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function SyllabusUploadPage() {
  const [jsonInput, setJsonInput] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; msg: string }>({
    type: null,
    msg: '',
  });
  const [loading, setLoading] = useState(false);

  async function handleUpload() {
    if (!jsonInput || !secretKey) {
      setStatus({ type: 'error', msg: 'Please provide JSON and Secret Key' });
      return;
    }

    setLoading(true);
    setStatus({ type: null, msg: '' });

    try {
      const result = await uploadSyllabusData(jsonInput, secretKey);
      if (result.success) {
        setStatus({ type: 'success', msg: result.message });
        setJsonInput(''); // Clear on success
      } else {
        setStatus({ type: 'error', msg: result.message });
      }
    } catch (e: any) {
      setStatus({ type: 'error', msg: e.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto max-w-2xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>Bulk Upload Syllabus Topics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Admin Secret Key</label>
            <Input
              type="password"
              placeholder="Enter Admin Key"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">JSON Data</label>
            <Textarea
              placeholder='{ "unitId": "unit_1", "topics": [...] }'
              className="min-h-[300px] font-mono text-sm"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
            />
            <p className="text-muted-foreground text-xs">
              Format must match the <code>TOPIC_DATA_FORMAT.md</code> specification.
            </p>
          </div>

          {status.type && (
            <Alert
              variant={status.type === 'error' ? 'destructive' : 'default'}
              className={status.type === 'success' ? 'border-green-500 text-green-600' : ''}
            >
              <AlertTitle>{status.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
              <AlertDescription>{status.msg}</AlertDescription>
            </Alert>
          )}

          <Button onClick={handleUpload} disabled={loading} className="w-full">
            {loading ? 'Uploading...' : 'Upload Data'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
