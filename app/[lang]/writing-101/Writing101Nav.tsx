"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Writing101Nav() {
    const pathname = usePathname();

    const isVocab = pathname.includes("/vocab");

    return (
        <div className="flex gap-4 mb-6 border-b border-border pb-2">
            <Link
                href="/writing-101"
                className={`pb-2 px-1 text-sm font-semibold border-b-2 transition-colors ${!isVocab
                        ? "border-jaxtina-red text-jaxtina-red"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
            >
                Task Explanation
            </Link>
            <Link
                href="/writing-101/vocab"
                className={`pb-2 px-1 text-sm font-semibold border-b-2 transition-colors ${isVocab
                        ? "border-jaxtina-red text-jaxtina-red"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
            >
                Key Vocabulary
            </Link>
        </div>
    );
}
