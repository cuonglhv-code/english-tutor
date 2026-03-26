import { readVocabCsv } from "@/lib/readCsv";
import { VocabClient } from "./VocabClient";

export const metadata = {
    title: "Key Vocabulary | Jaxtina IELTS",
    description: "IELTS Writing Key Vocabulary by Band and Task.",
};

export const dynamic = "force-dynamic";

export default function Writing101VocabPage() {
    const vocab = readVocabCsv();

    return <VocabClient vocab={vocab} />;
}
