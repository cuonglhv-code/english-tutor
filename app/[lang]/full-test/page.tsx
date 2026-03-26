import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Full Test | Jaxtina IELTS Examiner',
  description: 'Take a full IELTS test on Jaxtina Exam',
};

export default function FullTestPage() {
  return (
    <div className="w-full h-[calc(100vh-3.5rem)] bg-background">
      <iframe 
        src="https://exam.jaxtina.com/en" 
        className="w-full h-full border-0"
        allowFullScreen
        title="Jaxtina Full Exam"
      />
    </div>
  );
}
