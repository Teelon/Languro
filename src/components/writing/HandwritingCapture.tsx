'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Camera, X, QrCode, Smartphone } from 'lucide-react';
import Image from 'next/image';

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
                <QRCameraModal onClose={() => setShowQRModal(false)} />
            )}
        </div>
    );
}

/**
 * QR Code Modal for desktop-to-mobile camera bridge
 * For hackathon demo - simplified version that shows instructions
 */
function QRCameraModal({ onClose }: { onClose: () => void }) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="p-6 max-w-md mx-4 space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Use Phone Camera</h3>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="text-center space-y-4">
                    <div className="bg-muted p-8 rounded-lg">
                        <QrCode className="h-32 w-32 mx-auto text-muted-foreground" />
                    </div>

                    <div className="space-y-2">
                        <p className="font-medium">Coming Soon!</p>
                        <p className="text-sm text-muted-foreground">
                            QR-based phone camera sync is in development.<br />
                            For now, please take a photo with your phone and upload it.
                        </p>
                    </div>
                </div>

                <Button variant="outline" className="w-full" onClick={onClose}>
                    Close
                </Button>
            </Card>
        </div>
    );
}
