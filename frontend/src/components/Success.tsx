"use client";
import { useState } from 'react';

interface SuccessProps {
    amount: number;
    transactionId: string;
    onReset: () => void;
}

export default function Success({ amount, transactionId, onReset }: SuccessProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(transactionId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full flex items-center justify-center relative">
            {/* Technical Grid Background Decor */}
            <div className="absolute inset-[-100%] z-0 pointer-events-none opacity-5">
                <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(#6b38d4 1px, transparent 1px), linear-gradient(90deg, #6b38d4 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            </div>

            <div className="w-full max-w-[540px] z-10">
                <div className="glass-card rounded-xl p-10 flex flex-col items-center text-center shadow-[0_32px_64px_-12px_rgba(107,56,212,0.1)]">

                    {/* Animated Success Icon */}
                    <div className="w-24 h-24 mb-8 relative">
                        <div className="absolute inset-0 bg-secondary/10 rounded-full neon-pulse"></div>
                        <div className="relative w-full h-full rounded-full flex items-center justify-center border-4 border-secondary text-secondary">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24">
                                <polyline className="success-checkmark" points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                    </div>

                    <h1 className="font-headline-lg text-headline-lg text-on-surface mb-3">Payment Successful!</h1>

                    {/* Transaction Details Bento */}
                    <div className="w-full grid grid-cols-2 gap-4 mb-10">
                        <div className="bg-surface-container-low rounded-lg p-4 border border-outline-variant/30 text-left">
                            <span className="font-label-sm text-label-sm text-on-surface-variant block mb-1">AMOUNT</span>
                            <span className="font-headline-md text-headline-md text-primary">₹{amount}</span>
                        </div>
                        <div className="bg-surface-container-low rounded-lg p-4 border border-outline-variant/30 text-left">
                            <span className="font-label-sm text-label-sm text-on-surface-variant block mb-1">METHOD</span>
                            <div className="flex items-center gap-2 font-label-md">UPI</div>
                        </div>
                        <div className="col-span-2 bg-surface-container-low rounded-lg p-4 border border-outline-variant/30 flex justify-between items-center">
                            <div>
                                <span className="font-label-sm text-label-sm text-on-surface-variant block mb-1">TRANSACTION ID</span>
                                <span className="font-label-md text-label-md text-on-surface uppercase tracking-wider">{transactionId}</span>
                            </div>
                            <button onClick={handleCopy} className="p-2 hover:bg-surface-container rounded-full transition-colors">
                                <span className={`material-symbols-outlined ${copied ? 'text-secondary' : 'text-primary'}`}>
                                    {copied ? 'check' : 'content_copy'}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="w-full space-y-3">
                        <button
                            onClick={onReset}
                            className="w-full py-4 bg-primary text-on-primary font-label-md text-label-md rounded-lg flex items-center justify-center gap-2 shadow-[0_12px_24px_-8px_rgba(107,56,212,0.4)] hover:shadow-[0_16px_32px_-8px_rgba(107,56,212,0.5)] transition-all active:scale-[0.98]"
                        >
                            <span className="material-symbols-outlined text-[20px]">volunteer_activism</span>
                            Send Another Tip
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}