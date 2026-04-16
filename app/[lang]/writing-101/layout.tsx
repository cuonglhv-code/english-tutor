import { Writing101Tabs } from "@/components/writing-101/Writing101Tabs";

export default function Writing101Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <Writing101Tabs />
            {children}
        </div>
    );
}
