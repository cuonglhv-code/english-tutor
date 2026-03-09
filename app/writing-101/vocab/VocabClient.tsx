"use client";

import { useState } from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { VocabRow } from "@/lib/readCsv";

export function VocabClient({ vocab }: { vocab: VocabRow[] }) {
    const [activeTask, setActiveTask] = useState<"all" | "1" | "2">("all");
    const [activeBand, setActiveBand] = useState<"all" | "5" | "6" | "7" | "8" | "9">("all");

    const filteredVocab = vocab.filter(v => {
        if (activeTask !== "all" && v.task !== parseInt(activeTask)) return false;
        if (activeBand !== "all" && v.band !== parseInt(activeBand)) return false;
        return true;
    });

    const grouped = filteredVocab.reduce((acc, row) => {
        if (!acc[row.category]) acc[row.category] = [];
        acc[row.category].push(row);
        return acc;
    }, {} as Record<string, VocabRow[]>);

    const categories = Object.keys(grouped).sort();

    return (
        <div className="space-y-6">
            <div className="flex gap-4 flex-wrap items-center">
                {/* Dropdown 1: Task */}
                <div className="w-40">
                    <Select value={activeTask} onValueChange={(v: any) => setActiveTask(v)}>
                        <SelectTrigger className="font-semibold bg-white">
                            <SelectValue placeholder="Select task..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Tasks</SelectItem>
                            <SelectItem value="1">Task 1</SelectItem>
                            <SelectItem value="2">Task 2</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Dropdown 2: Band */}
                <div className="w-40">
                    <Select value={activeBand} onValueChange={(v: any) => setActiveBand(v)}>
                        <SelectTrigger className="font-semibold bg-white">
                            <SelectValue placeholder="Select band..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Bands</SelectItem>
                            <SelectItem value="5">Band 5+</SelectItem>
                            <SelectItem value="6">Band 6+</SelectItem>
                            <SelectItem value="7">Band 7+</SelectItem>
                            <SelectItem value="8">Band 8+</SelectItem>
                            <SelectItem value="9">Band 9+</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Accordion type="single" collapsible className="w-full">
                {categories.map((cat, idx) => (
                    <AccordionItem key={cat} value={`cat-${idx}`} className="border rounded-xl mb-3 px-4 last:mb-0">
                        <AccordionTrigger className="hover:no-underline py-3 text-left">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-jaxtina-blue border-jaxtina-blue/30">
                                    {cat.toUpperCase()}
                                </Badge>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-0">
                            <div className="border-t pt-2 grid gap-1">
                                {grouped[cat].sort((a, b) => b.band - a.band).map((v, i) => (
                                    <div key={i} className="flex flex-col gap-1 p-3 hover:bg-muted/50 rounded-lg border-b last:border-0 border-border/50">
                                        <div className="flex flex-wrap items-center justify-between">
                                            <span className="font-medium text-sm text-foreground">{v.vocabItem}</span>
                                            <div className="flex gap-2 items-center">
                                                <Badge variant="secondary" className="text-[10px] bg-jaxtina-red/10 text-jaxtina-red">
                                                    Task {v.task}
                                                </Badge>
                                                <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-0 text-[10px]">
                                                    Band {v.band}+
                                                </Badge>
                                            </div>
                                        </div>
                                        {v.exampleSentence && (
                                            <span className="text-xs text-muted-foreground italic mt-1 bg-muted/30 p-2 rounded-md border border-border/50">
                                                {v.exampleSentence}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
                {categories.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground py-8 border rounded-xl">
                        No vocabulary matches the selected filters.
                    </div>
                )}
            </Accordion>
        </div>
    );
}
