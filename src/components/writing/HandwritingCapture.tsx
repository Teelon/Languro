'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Camera, X, QrCode, Smartphone, Loader2 } from 'lucide-react';
import Image from 'next/image';
import QRCode from 'react-qr-code';

interface HandwritingCaptureProps {
    onCapture: (file: File | null) => void;
    currentFile: File | null;
}

export function HandwritingCapture({ onCapture, currentFile }: HandwritingCaptureProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    // Detect if on mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
        };
        checkMobile();
    }, []);

    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onCapture(file);
            const url = URL.createObjectURL(file);
            setPreview(url);
        }
    };

    // Clear selection
    const handleClear = () => {
        onCapture(null);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (cameraInputRef.current) cameraInputRef.current.value = '';
    };

    // Cleanup preview URL on unmount
    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    if (preview) {
        return (
            <div className="space-y-4">
                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                    <Image
                        src={preview}
                        alt="Handwriting preview"
                        fill
                        className="object-contain"
                    />
                    <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={handleClear}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                    Your handwriting is ready to submit
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Hidden file inputs */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />
            <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
            />

            {/* Upload area */}
            <Card
                className="border-2 border-dashed p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
            >
                <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="font-medium">Upload handwriting image</p>
                    <p className="text-sm text-muted-foreground">
                        Click or drag and drop
                    </p>
                </div>
            </Card>

            {/* Action buttons */}
            <div className="flex gap-2">
                {isMobile ? (
                    // Mobile: Direct camera access
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => cameraInputRef.current?.click()}
                    >
                        <Camera className="mr-2 h-4 w-4" />
                        Take Photo
                    </Button>
                ) : (
                    // Desktop: QR code for phone camera
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setShowQRModal(true)}
                    >
                        <Smartphone className="mr-2 h-4 w-4" />
                        Use Phone Camera
                    </Button>
                )}
            </div>

            <p className="text-xs text-muted-foreground text-center">
                Write on paper, then upload or take a photo of your handwriting
            </p>

            {/* QR Modal for desktop users */}
            {showQRModal && (
                <QRCameraModal
                    onClose={() => setShowQRModal(false)}
                    onSuccess={(file) => {
                        onCapture(file);
                        const url = URL.createObjectURL(file);
                        setPreview(url);
                        setShowQRModal(false);
                    }}
                />
            )}
        </div>
    );
}

/**
 * QR Code Modal for desktop-to-mobile camera bridge
 */
function QRCameraModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (file: File) => void }) {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [uploadUrl, setUploadUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Create session on mount
    useEffect(() => {
        const createSession = async () => {
            try {
                const res = await fetch('/api/writing/session/create', { method: 'POST' });
                if (!res.ok) throw new Error('Failed to create session');
                const data = await res.json();
                setSessionId(data.sessionId);

                // Construct upload URL
                const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
                setUploadUrl(`${baseUrl}/upload/${data.sessionId}`);
            } catch (err) {
                setError('Failed to generate QR code');
            } finally {
                setIsLoading(false);
            }
        };
        createSession();
    }, []);

    // Poll for status
    useEffect(() => {
        if (!sessionId) return;

        const pollInterval = setInterval(async () => {
            try {
                const res = await fetch(`/api/writing/session/${sessionId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.status === 'uploaded' && data.imageUrl) {
                        // Download the image using proxy to avoid CORS
                        const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(data.imageUrl)}`;
                        const imageRes = await fetch(proxyUrl);
                        const blob = await imageRes.blob();
                        const file = new File([blob], 'handwriting.jpg', { type: blob.type });
                        onSuccess(file);
                    }
                }
            } catch (err) {
                console.error('Polling error:', err);
            }
        }, 2000);

        return () => clearInterval(pollInterval);
    }, [sessionId, onSuccess]);


    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="p-6 max-w-sm w-full space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">Use Phone Camera</h3>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex flex-col items-center gap-6">
                    {isLoading ? (
                        <div className="h-48 w-48 flex items-center justify-center bg-muted rounded-lg">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : error ? (
                        <div className="h-48 w-48 flex items-center justify-center bg-destructive/10 rounded-lg text-destructive text-center p-4">
                            <p>{error}</p>
                        </div>
                    ) : (
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            {uploadUrl && (
                                <QRCode
                                    value={uploadUrl}
                                    size={192}
                                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                    viewBox={`0 0 256 256`}
                                />
                            )}
                        </div>
                    )}

                    <div className="text-center space-y-2">
                        <p className="font-medium">Scan with your phone</p>
                        <p className="text-sm text-muted-foreground">
                            Take a photo of your handwriting to instantly upload it here.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
