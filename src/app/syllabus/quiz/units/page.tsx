import React from 'react';
import { getUnitStats } from '@/actions/quiz-actions';
import QuizUnitSelectionClient from './QuizUnitSelectionClient';

export default async function QuizUnitSelectionPage() {
    const stats = await getUnitStats();

    return (
        <QuizUnitSelectionClient stats={stats} />
    );
}
