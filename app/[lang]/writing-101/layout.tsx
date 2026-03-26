import { BookOpen } from "lucide-react";
import { Writing101Nav } from "./Writing101Nav";

const labels = {
    pageTitle: { en: "Writing 101", vi: "Writing 101" },
    subtitle: { en: "IELTS Writing reference guide — structures, tips, and common mistakes.", vi: "Tài liệu tham khảo Writing IELTS — cấu trúc, mẹo viết và lỗi thường gặp." },
};

export default function Writing101Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-jaxtina-red" />
                    <h1 className="text-2xl font-black tracking-tight">{labels.pageTitle.en}</h1>
                </div>
                <p className="text-sm text-muted-foreground">{labels.subtitle.en} / <em className="vi" lang="vi">{labels.subtitle.vi}</em></p>
                <p className="text-xs text-muted-foreground pt-1 bg-muted/50 p-2 rounded-md inline-block mt-2">
                    EN = English | VI = Tiếng Việt. English comes first, Vietnamese follows in italics.
                </p>
            </div>

            <Writing101Nav />

            {children}
        </div>
    );
}
