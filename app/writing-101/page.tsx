import { readTask1Csv, readTask2Csv } from "@/lib/readCsv";
import { Writing101Client } from "./Writing101Client";

export const metadata = {
  title: "Writing 101 | Jaxtina IELTS",
  description: "IELTS Writing reference guide — structures, tips, and common mistakes for Task 1 and Task 2.",
};

export default function Writing101Page() {
  const task1 = readTask1Csv();
  const task2 = readTask2Csv();

  return <Writing101Client task1={task1} task2={task2} />;
}
