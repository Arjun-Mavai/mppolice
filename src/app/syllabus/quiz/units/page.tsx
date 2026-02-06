import { getAvailableUnitTests } from '@/features/tests/actions/quiz';
import QuizUnitSelectionClient from './QuizUnitSelectionClient';

export default async function QuizUnitSelectionPage() {
    const availableTests = await getAvailableUnitTests();

    return (
        <QuizUnitSelectionClient availableTests={availableTests} />
    );
}
