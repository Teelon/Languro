import React, { useState } from 'react';

interface FeedbackModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (reason: string) => void;
    title?: string;
    description?: string;
    isLoggedIn?: boolean;
}

export default function FeedbackModal({
    open,
    onClose,
    onSubmit,
    title = 'Report an Issue',
    description = 'Please tell us what is wrong with this conjugation so we can fix it.',
    isLoggedIn = false
}: FeedbackModalProps) {
    const [reason, setReason] = useState('');

    const handleSubmit = () => {
        if (reason.trim()) {
            onSubmit(reason);
            setReason('');
        }
    };

    const handleClose = () => {
        setReason('');
        onClose();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 p-4 backdrop-blur-sm transition-all">
            <div className="relative w-full max-w-lg rounded-lg bg-white dark:bg-slate-800 p-6 shadow-lg sm:p-8">
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-dark dark:text-white">
                        {title}
                    </h3>
                    <p className="mt-2 text-base text-body-color dark:text-slate-300">
                        {description}
                    </p>
                </div>

                <div className="mb-6">
                    <label htmlFor="reason" className="mb-2 block text-sm font-medium text-dark dark:text-white">
                        Reason
                    </label>
                    <textarea
                        id="reason"
                        rows={4}
                        className="w-full rounded-md border border-gray-300 bg-transparent px-4 py-3 text-base text-body-color placeholder-body-color/60 transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-600 dark:text-white"
                        placeholder="e.g. Incorrect accent, wrong tense naming"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                </div>

                <div className="flex justify-between items-center gap-3">
                    {!isLoggedIn && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            Want to track your reports? <a href="/auth/signin" className="underline hover:text-primary">Log in</a>
                        </div>
                    )}
                    <div className="flex gap-3 ml-auto">
                        <button
                            onClick={handleClose}
                            className="rounded-md border border-gray-300 px-5 py-2 text-base font-medium text-body-color transition hover:bg-gray-100 focus:outline-none dark:border-slate-600 dark:text-white dark:hover:bg-slate-700"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!reason.trim()}
                            className="rounded-md bg-primary px-5 py-2 text-base font-medium text-white transition hover:bg-primary/90 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Submit Feedback
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
