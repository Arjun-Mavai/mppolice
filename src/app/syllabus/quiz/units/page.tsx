import { getAvailableUnitTests } from '@/actions/quiz-actions';
import QuizUnitSelectionClient from './QuizUnitSelectionClient';

export default async function QuizUnitSelectionPage() {
    const availableTests = await getAvailableUnitTests();

    return (
        <QuizUnitSelectionClient availableTests={availableTests} />
    );
}
