"use client";
import { useState } from 'react';
import QRCode from '@/components/QRCode';
import Success from '@/components/Success';

type ViewState = 'form' | 'qr' | 'success';

export default function StreamerTipPage({ params }: { params: { streamerId: string } }) {
    const [view, setView] = useState<ViewState>('form');
    const [amount, setAmount] = useState<number | string>('');
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');

    // Dummy generated transaction ID
    const [txId, setTxId] = useState('');

    const handleInitializePayment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || Number(amount) <= 0) return;

        setTxId(`#NB-${Math.floor(1000 + Math.random() * 9000)}-X9Q`);
        setView('qr');
    };

    const handleSuccess = () => {
        setView('success');
    };

    const resetForm = () => {
        setAmount('');
        setName('');
        setMessage('');
        setView('form');
    };

    return (
        <main className="pt-32 pb-margin-desktop px-gutter min-h-screen flex flex-col items-center justify-center">

            {view === 'form' && (
                <div className="max-w-[1000px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
                    {/* Left Side: Stream Summary / Identity */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-8 shadow-sm">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary text-[32px]">volunteer_activism</span>
                                </div>
                                <div>
                                    <h1 className="font-headline-lg text-headline-lg text-on-surface">Support the Stream</h1>
                                    <p className="text-on-surface-variant font-label-md mt-1">@{params.streamerId}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 rounded-lg bg-surface-container-low border border-outline-variant/20">
                                    <p className="text-label-sm text-primary uppercase mb-1">Current Goal</p>
                                    <p className="font-headline-md text-headline-md text-on-surface">₹45,000 / ₹1,00,000</p>
                                    <div className="w-full h-2 bg-outline-variant/30 rounded-full mt-3 overflow-hidden">
                                        <div className="h-full bg-primary pulse-accent" style={{ width: '45%' }}></div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-lg border border-outline-variant/20">
                                        <p className="text-label-sm text-on-surface-variant">Recent Tip</p>
                                        <p className="font-label-md text-on-surface">₹500 by ArjunK</p>
                                    </div>
                                    <div className="p-4 rounded-lg border border-outline-variant/20">
                                        <p className="text-label-sm text-on-surface-variant">Top Donor</p>
                                        <p className="font-label-md text-on-surface">₹2,500 by Mira_Tech</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative rounded-xl overflow-hidden aspect-video group bg-surface-container-high border border-outline-variant/20 flex items-center justify-center">
                            <span className="text-on-surface-variant font-label-sm">Stream Preview Feed</span>
                            <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent opacity-60"></div>
                            <div className="absolute bottom-4 left-4 glass-panel bg-white/40 px-3 py-1 rounded text-label-sm font-bold text-white border border-white/20">LIVE PREVIEW</div>
                        </div>
                    </div>

                    {/* Right Side: Tipping Form */}
                    <div className="lg:col-span-7">
                        <div className="glass-panel bg-surface-container-lowest/80 border border-outline-variant/50 rounded-xl p-8 shadow-xl">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="font-headline-md text-headline-md text-on-surface">Send a Tip</h2>
                                <span className="text-label-sm bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">Secure Transaction</span>
                            </div>
                            <form className="space-y-6" onSubmit={handleInitializePayment}>

                                {/* Name Input */}
                                <div className="space-y-2 group">
                                    <label className="font-label-md text-on-surface-variant" htmlFor="donor-name">Display Name</label>
                                    <div className="relative neon-glow transition-transform focus-within:-translate-y-1">
                                        <input
                                            id="donor-name"
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Enter your name"
                                            className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 py-3 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-body-md text-on-surface placeholder:text-on-surface-variant/40"
                                        />
                                        <span className="material-symbols-outlined absolute right-4 top-3 text-on-surface-variant/40">person</span>
                                    </div>
                                </div>

                                {/* Amount Presets */}
                                <div className="space-y-3">
                                    <label className="font-label-md text-on-surface-variant">Select Amount</label>
                                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                                        {[50, 100, 250, 500, 1000].map((preset) => (
                                            <button
                                                key={preset}
                                                type="button"
                                                onClick={() => setAmount(preset)}
                                                className={`py-3 rounded-lg border font-label-md transition-all active:scale-95 ${Number(amount) === preset
                                                    ? 'border-primary text-primary bg-primary/5'
                                                    : 'border-outline-variant/30 text-on-surface hover:border-primary hover:text-primary bg-surface'
                                                    }`}
                                            >
                                                ₹{preset}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="relative mt-2 neon-glow transition-transform focus-within:-translate-y-1">
                                        <span className="absolute left-4 top-3.5 text-on-surface-variant font-label-md">₹</span>
                                        <input
                                            id="custom-amount"
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="Custom Amount"
                                            className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg pl-8 pr-4 py-3 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-body-md text-on-surface"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Message Input */}
                                <div className="space-y-2">
                                    <label className="font-label-md text-on-surface-variant" htmlFor="donor-message">Your Message (Optional)</label>
                                    <div className="neon-glow transition-transform focus-within:-translate-y-1">
                                        <textarea
                                            id="donor-message"
                                            rows={4}
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Write something technical..."
                                            className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 py-3 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-body-md text-on-surface placeholder:text-on-surface-variant/40 resize-none"
                                        />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button type="submit" className="w-full bg-primary text-on-primary font-label-md py-4 rounded-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group overflow-hidden relative">
                                    <span className="relative z-10">Initialize Payment</span>
                                    <span className="material-symbols-outlined relative z-10 group-hover:translate-x-1 transition-transform">bolt</span>
                                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                </button>

                                <div className="pt-4 flex items-center justify-center gap-6 opacity-40 grayscale">
                                    <span className="material-symbols-outlined text-[32px]">qr_code_2</span>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {view === 'qr' && (
                <QRCode
                    amount={Number(amount)}
                    transactionId={txId}
                    onSuccess={handleSuccess}
                />
            )}

            {view === 'success' && (
                <Success
                    amount={Number(amount)}
                    transactionId={txId}
                    onReset={resetForm}
                />
            )}

        </main>
    );
}