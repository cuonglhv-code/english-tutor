import { readTask1Csv, readTask2Csv } from "@/lib/readCsv";
import { TaskExplanationClient } from "./TaskExplanationClient";

export const metadata = {
  title: "Task Explanation | Jaxtina IELTS",
  description: "IELTS Writing Task Explanation reference guide.",
};

export const dynamic = "force-dynamic";

export default function Writing101Page() {
  const task1 = readTask1Csv();
  const task2 = readTask2Csv();

  return <TaskExplanationClient task1={task1} task2={task2} />;
}
