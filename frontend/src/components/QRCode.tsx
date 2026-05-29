"use client";
import { useState } from 'react';

interface QRCodeProps {
    amount: number;
    transactionId: string;
    onSuccess: () => void;
}

export default function QRCode({ amount, transactionId, onSuccess }: QRCodeProps) {
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePayment = () => {
        setIsProcessing(true);
        // Simulate network request
        setTimeout(() => {
            onSuccess();
        }, 2000);
    };

    // Hardcoded visual pattern from HTML
    const generateGrid = () => {
        const cells = [];
        for (let i = 0; i < 100; i++) {
            const isFilled = Math.random() > 0.4;
            cells.push(<div key={i} className={isFilled ? 'bg-on-surface' : 'bg-transparent'} />);
        }
        return cells;
    };

    return (
        <div className="w-full max-w-6xl mx-auto">
            {/* Breadcrumb */}
            <div className="w-full max-w-3xl mb-8 flex items-center gap-2 text-on-surface-variant font-label-md">
                <span>Checkout</span>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <span className="text-primary">Payment</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 w-full">
                {/* Left Column: Summary & Loading State */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                    <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/30 relative overflow-hidden">
                        <h2 className="font-headline-md text-headline-md mb-6">Order Summary</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-on-surface-variant">Tip Amount</span>
                                <span className="font-bold">₹{amount}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-on-surface-variant">Transaction ID</span>
                                <span className="font-bold uppercase">{transactionId}</span>
                            </div>
                            <div className="pt-4 border-t border-outline-variant/30 flex justify-between items-center">
                                <span className="font-bold text-lg">Total</span>
                                <span className="font-display text-2xl text-primary">₹{amount}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/20">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-2 h-2 rounded-full bg-primary neon-pulse"></div>
                            <span className="font-label-md uppercase tracking-widest text-primary">Validating Transaction</span>
                        </div>
                        <div className="h-1 w-full bg-surface-variant rounded-full overflow-hidden">
                            <div className="h-full bg-primary loading-shimmer w-2/3"></div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Payment Interaction */}
                <div className="lg:col-span-7">
                    <div className="glass-card rounded-2xl p-10 flex flex-col items-center text-center">
                        <div className="mb-8">
                            <h1 className="font-headline-lg text-headline-lg mb-2">Finalize Payment</h1>
                            <p className="text-on-surface-variant">Scan the QR code to complete payment.</p>
                        </div>

                        {/* QR Code Section */}
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-primary/5 rounded-3xl blur-2xl group-hover:bg-primary/10 transition-all"></div>
                            <div className="relative bg-white p-4 rounded-xl border-2 border-on-surface shadow-sm">
                                <div className="w-64 h-64 bg-surface-container-highest flex items-center justify-center relative overflow-hidden rounded-lg">
                                    <div className="w-full h-full p-2 grid grid-cols-10 grid-rows-10 gap-1">
                                        {/* Simulated Abstract QR */}
                                        <div className="bg-on-surface"></div><div className="bg-on-surface"></div><div className="bg-on-surface"></div><div className="bg-transparent"></div><div className="bg-on-surface"></div><div className="bg-transparent"></div><div className="bg-on-surface"></div><div className="bg-on-surface"></div><div className="bg-transparent"></div><div className="bg-transparent"></div><div className="bg-transparent"></div><div className="bg-on-surface"></div><div className="bg-transparent"></div><div className="bg-transparent"></div><div className="bg-transparent"></div><div className="bg-on-surface"></div><div className="bg-transparent"></div><div className="bg-on-surface"></div><div className="bg-transparent"></div><div className="bg-on-surface"></div><div className="bg-on-surface"></div><div className="bg-on-surface"></div><div className="bg-on-surface"></div><div className="bg-transparent"></div><div className="bg-on-surface"></div><div className="bg-on-surface"></div><div className="bg-on-surface"></div><div className="bg-transparent"></div><div className="bg-transparent"></div><div className="bg-transparent"></div><div className="bg-on-surface"></div><div className="bg-transparent"></div><div className="bg-on-surface"></div><div className="bg-on-surface"></div><div className="bg-transparent"></div><div className="bg-transparent"></div><div className="bg-on-surface"></div><div className="bg-transparent"></div><div className="bg-on-surface"></div><div className="bg-transparent"></div><div className="bg-on-surface"></div><div className="bg-on-surface"></div><div className="bg-transparent"></div><div className="bg-transparent"></div><div className="bg-transparent"></div><div className="bg-on-surface"></div><div className="bg-on-surface"></div><div className="bg-transparent"></div><div className="bg-on-surface"></div><div className="bg-on-surface"></div><div className="bg-on-surface"></div><div className="bg-on-surface"></div><div className="bg-on-surface"></div><div className="bg-on-surface"></div><div className="bg-on-surface"></div><div className="bg-transparent"></div><div className="bg-transparent"></div><div className="bg-transparent"></div><div className="bg-on-surface"></div><div className="bg-transparent"></div><div className="bg-on-surface"></div><div className="bg-on-surface"></div><div className="bg-on-surface"></div><div className="bg-on-surface"></div><div className="bg-on-surface"></div><div className="bg-transparent"></div><div className="bg-on-surface"></div><div className="bg-on-surface"></div><div className="bg-on-surface"></div><div className="bg-on-surface"></div><div className="bg-transparent"></div><div className="bg-on-surface"></div><div className="bg-transparent"></div><div className="bg-transparent"></div><div className="bg-on-surface"></div><div className="bg-transparent"></div><div className="bg-on-surface"></div><div className="bg-on-surface"></div><div className="bg-transparent"></div><div className="bg-transparent"></div><div className="bg-on-surface"></div><div className="bg-on-surface"></div><div className="bg-on-surface"></div><div className="bg-transparent"></div><div className="bg-on-surface"></div><div className="bg-transparent"></div><div className="bg-on-surface"></div><div className="bg-transparent"></div><div className="bg-on-surface"></div><div className="bg-on-surface"></div><div className="bg-transparent"></div><div className="bg-on-surface"></div><div className="bg-on-surface"></div><div className="bg-on-surface"></div><div className="bg-on-surface"></div><div className="bg-transparent"></div><div className="bg-on-surface"></div><div className="bg-transparent"></div><div className="bg-on-surface"></div><div className="bg-on-surface"></div>
                                    </div>
                                    {/* Scanning animation overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/20 to-transparent h-12 w-full animate-[bounce_3s_infinite] top-0 pointer-events-none"></div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 w-full max-w-sm space-y-4">
                            <button
                                onClick={handlePayment}
                                disabled={isProcessing}
                                className={`w-full text-on-primary py-4 px-8 rounded-lg font-label-md flex items-center justify-center gap-3 transition-all duration-200 ${isProcessing ? 'bg-primary/80 cursor-wait' : 'bg-primary hover:shadow-[0_0_20px_rgba(107,56,212,0.3)] active:scale-95'}`}
                            >
                                {isProcessing ? (
                                    <><span className="material-symbols-outlined animate-spin">refresh</span> Processing...</>
                                ) : (
                                    <><span className="material-symbols-outlined">account_balance_wallet</span> PAY VIA UPI</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}