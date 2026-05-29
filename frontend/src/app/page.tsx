import Link from 'next/link';

export default function Home() {
    return (
        <main className="pt-32 pb-margin-desktop px-gutter min-h-[80vh] flex flex-col items-center justify-center">
            <h1 className="font-display text-display text-on-surface mb-6">Welcome to notBruce</h1>
            <Link
                href="/demo-streamer"
                className="bg-primary text-on-primary font-label-md py-4 px-8 rounded-lg shadow-lg hover:shadow-primary/30 transition-all"
            >
                View Streamer Checkout Demo
            </Link>
        </main>
    );
}