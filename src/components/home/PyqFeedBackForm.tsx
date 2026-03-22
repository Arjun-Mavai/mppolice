'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TestSeriesFeedbackModal } from '@/components/test-series-feedback-modal';
import type { FeedbackFormType } from '@/lib/schemas/feedback';

export default function Home() {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [submittedData, setSubmittedData] = useState<FeedbackFormType | null>(null);

  const handleFeedbackSubmit = async (data: FeedbackFormType) => {
    console.log('Feedback submitted:', data);
    setSubmittedData(data);

    // Example: Send to your API
    // const response = await fetch('/api/feedback', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     ...data,
    //     testSeriesId: 'series-123',
    //     timestamp: new Date().toISOString(),
    //   }),
    // })
    // if (!response.ok) throw new Error('Failed to submit feedback')
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-white p-4">
      <div className="w-full max-w-md space-y-8">
        {/* DEMO SECTION */}
        <div className="space-y-4 rounded-lg border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-black">Test Series Demo</h1>
          <p className="text-sm text-gray-600">
            Click the button below to open the feedback modal after completing your test series.
          </p>

          <Button
            onClick={() => setFeedbackOpen(true)}
            className="w-full bg-black text-white hover:bg-gray-900"
          >
            Open Feedback Modal
          </Button>
        </div>

        {/* FEEDBACK MODAL */}
        <TestSeriesFeedbackModal
          isOpen={feedbackOpen}
          onClose={() => setFeedbackOpen(false)}
          onSubmit={handleFeedbackSubmit}
          testSeriesId="demo-series"
        />

        {/* SUBMITTED DATA DISPLAY */}
        {submittedData && (
          <div className="space-y-4 rounded-lg border border-gray-200 p-6">
            <h2 className="font-semibold text-black">Submitted Feedback</h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-black">Overall Rating:</span>
                <span className="ml-2 text-gray-600">{submittedData.overallRating} / 5 stars</span>
              </div>
              <div>
                <span className="font-medium text-black">Difficulty Level:</span>
                <span className="ml-2 text-gray-600">{submittedData.difficultyLevel}</span>
              </div>
              <div>
                <span className="font-medium text-black">Would Recommend:</span>
                <span className="ml-2 text-gray-600">{submittedData.wouldRecommend}</span>
              </div>
              {submittedData.comments && (
                <div>
                  <span className="font-medium text-black">Comments:</span>
                  <span className="ml-2 text-gray-600">{submittedData.comments}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* INTEGRATION GUIDE */}
        <div className="space-y-3 rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-black">Quick Integration Guide</h3>
          <div className="space-y-2 text-xs text-gray-600">
            <p>
              <strong>1. Add new fields:</strong> Edit{' '}
              <code className="bg-gray-100 px-1">lib/schemas/feedback.ts</code>
            </p>
            <p>
              <strong>2. Handle submission:</strong> Update{' '}
              <code className="bg-gray-100 px-1">onSubmit</code> callback
            </p>
            <p>
              <strong>3. Save to DB:</strong> Create API route at{' '}
              <code className="bg-gray-100 px-1">app/api/feedback</code>
            </p>
            <p>All changes are properly commented in the code for easy customization.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
