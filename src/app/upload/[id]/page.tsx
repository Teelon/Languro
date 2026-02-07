'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, CheckCircle2, Loader2, Upload, XCircle } from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';

export default function MobileUploadPage() {
    const params = useParams();
    const sessionId = params.id as string;

    const [status, setStatus] = useState<'loading' | 'pending' | 'uploading' | 'success' | 'error' | 'expired'>('loading');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initial check
    useEffect(() => {
        const checkSession = async () => {
            try {
                const res = await fetch(`/api/writing/session/${sessionId}`);
                if (!res.ok) {
                    if (res.status === 410) setStatus('expired');
                    else throw new Error('Session not found');
                    return;
                }
                const data = await res.json();
                if (data.status === 'uploaded') {
                    setStatus('success');
                } else {
                    setStatus('pending');
                }
            } catch (err) {
                setStatus('error');
                setErrorMessage('Invalid session');
            }
        };

        if (sessionId) checkSession();
    }, [sessionId]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show preview
        const url = URL.createObjectURL(file);
        setPreview(url);
        setStatus('uploading');

        // Upload
        try {
            const formData = new FormData();
            formData.append('image', file);

            const res = await fetch(`/api/writing/session/${sessionId}/upload`, {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error('Upload failed');

            setStatus('success');
        } catch (err) {
            console.error(err);
            setStatus('error');
            setErrorMessage('Failed to upload image. Please try again.');
        }
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (status === 'expired') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Card className="p-8 max-w-md w-full text-center space-y-4">
                    <XCircle className="h-12 w-12 text-destructive mx-auto" />
                    <h1 className="text-xl font-bold">Session Expired</h1>
                    <p className="text-muted-foreground">
                        This upload session has expired. Please refresh the page on your computer to generate a new QR code.
                    </p>
                </Card>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Card className="p-8 max-w-md w-full text-center space-y-4">
                    <XCircle className="h-12 w-12 text-destructive mx-auto" />
                    <h1 className="text-xl font-bold">Error</h1>
                    <p className="text-muted-foreground">{errorMessage}</p>
                    <Button onClick={() => window.location.reload()}>Try Again</Button>
                </Card>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Card className="p-8 max-w-md w-full text-center space-y-4">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
                    <h1 className="text-xl font-bold">Upload Successful!</h1>
                    <p className="text-muted-foreground">
                        Your handwriting has been uploaded. You can now continue on your computer.
                    </p>
                    {preview && (
                        <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-muted">
                            <Image src={preview} alt="Uploaded" fill className="object-contain" />
                        </div>
                    )}
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 gap-4">
            <div className="text-center space-y-2 mb-8">
                <h1 className="text-2xl font-bold">Upload Handwriting</h1>
                <p className="text-muted-foreground">
                    Take a photo of your handwritten text
                </p>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
            />

            <Button
                size="lg"
                className="w-full max-w-xs h-16 text-lg"
                onClick={() => fileInputRef.current?.click()}
            >
                <Camera className="mr-2 h-6 w-6" />
                Take Photo
            </Button>

            <Button
                variant="outline"
                size="lg"
                className="w-full max-w-xs"
                onClick={() => fileInputRef.current?.click()}
            >
                <Upload className="mr-2 h-4 w-4" />
                Upload File
            </Button>

            <p className="text-xs text-muted-foreground mt-8 text-center max-w-xs">
                Ensure good lighting and that the text is clearly visible.
            </p>

            {status === 'uploading' && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="text-center space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                        <p className="font-medium">Uploading...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
