'use client';

import { useState } from 'react';
import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function LoggerTest() {
  const [shouldCrash, setShouldCrash] = useState(false);

  // 💥 This will crash the component and test the Global Error Boundary
  if (shouldCrash) {
    throw new Error('This is a TEST CRASH to verify the Global Error Boundary!');
  }

  const handleLogInfo = () => {
    logger.info('Test Info Log', {
      category: 'ui',
      metadata: { action: 'test_button_click' },
    });
    alert('Info log sent to console/Sentry');
  };

  const handleLogWarn = () => {
    logger.warn('Test Warning Log', {
      category: 'ui',
      metadata: { reason: 'user_testing' },
    });
    alert('Warning log sent to console/Sentry');
  };

  const handleHandledError = () => {
    try {
      // Simulate an error safely for TypeScript
      const dangerous: unknown = null;
      console.log((dangerous as { profile: { name: string } }).profile.name); // Will throw TypeError
    } catch (error) {
      logger.error('Test Handled Error', error, {
        category: 'ui',
        metadata: { component: 'LoggerTest', scenario: 'handled_exception' },
      });
      alert('Handled error sent to Sentry!');
    }
  };

  return (
    <Card className="mx-auto mt-8 w-full max-w-md">
      <CardHeader>
        <CardTitle>Logger Verification</CardTitle>
        <CardDescription>Test your Sentry integration from the client-side.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={handleLogInfo} variant="outline" className="w-full">
            Log Info
          </Button>
          <Button onClick={handleLogWarn} variant="secondary" className="w-full">
            Log Warn
          </Button>
        </div>

        <Button
          onClick={handleHandledError}
          variant="default"
          className="w-full bg-orange-500 hover:bg-orange-600"
        >
          Trigger Handled Error
        </Button>
        <p className="text-muted-foreground text-center text-xs">(Uses try/catch + logger.error)</p>

        <Button onClick={() => setShouldCrash(true)} variant="destructive" className="w-full">
          Trigger CRASH (Boundary)
        </Button>
        <p className="text-muted-foreground text-center text-xs">(Tests Global Error Boundary)</p>
      </CardContent>
    </Card>
  );
}
