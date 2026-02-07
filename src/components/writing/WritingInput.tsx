'use client';

import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Loader2, Send, X, ZoomIn, RotateCw, Check } from 'lucide-react';
import { HandwritingCapture } from './HandwritingCapture';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '@/utils/canvasUtils';

interface WritingInputProps {
    mode: 'typed' | 'handwritten';
    onSubmit: (text: string, imageFile?: File) => void;
    isLoading: boolean;
    targetLanguage: string;
}

export function WritingInput({ mode, onSubmit, isLoading, targetLanguage }: WritingInputProps) {
    const [text, setText] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isCropping, setIsCropping] = useState(false);
    const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);

    // Crop state
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [aspect, setAspect] = useState<number | undefined>(undefined);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    const handleSubmit = () => {
        if (mode === 'typed' && text.trim()) {
            onSubmit(text.trim());
        } else if (mode === 'handwritten' && imageFile) {
            onSubmit('', imageFile);
        }
    };

    const handleCapture = (file: File) => {
        // Start cropping flow
        const url = URL.createObjectURL(file);
        setTempImageSrc(url);
        setIsCropping(true);
        setZoom(1);
        setRotation(0);
        setCrop({ x: 0, y: 0 });
        setAspect(undefined);
    };

    const onMediaLoaded = (mediaSize: { width: number; height: number; naturalWidth: number; naturalHeight: number }) => {
        // Set aspect ratio to match the image's natural aspect ratio
        setAspect(mediaSize.naturalWidth / mediaSize.naturalHeight);
    };

    const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const handleCropConfirm = async () => {
        if (!tempImageSrc || !croppedAreaPixels) return;

        try {
            const croppedImageBlob = await getCroppedImg(tempImageSrc, croppedAreaPixels, rotation);
            if (croppedImageBlob) {
                setImageFile(croppedImageBlob as File);
                setIsCropping(false);
                setTempImageSrc(null);
            }
        } catch (e) {
            console.error('Failed to crop image', e);
        }
    };

    const handleCropCancel = () => {
        setIsCropping(false);
        setTempImageSrc(null);
        setImageFile(null);
    };

    const canSubmit =
        (mode === 'typed' && text.trim().length > 0) ||
        (mode === 'handwritten' && imageFile !== null);

    return (
        <>
            <Card className="p-4 space-y-4">
                <h3 className="font-semibold">
                    {mode === 'typed' ? 'Type your response' : 'Upload your handwriting'}
                </h3>

                {mode === 'typed' ? (
                    <div className="space-y-2">
                        <Textarea
                            placeholder={`Write your description in ${targetLanguage}...`}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            rows={6}
                            className="resize-none"
                            data-testid="writing-input"
                        />
                        <p className="text-xs text-muted-foreground">
                            {text.length} characters
                        </p>
                    </div>
                ) : (
                    <HandwritingCapture
                        onCapture={handleCapture}
                        currentFile={imageFile}
                    />
                )}

                <Button
                    onClick={handleSubmit}
                    disabled={!canSubmit || isLoading}
                    className="w-full"
                    data-testid="submit-btn"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <Send className="mr-2 h-4 w-4" />
                            Submit
                        </>
                    )}
                </Button>
            </Card>

            {/* Cropper Modal */}
            {isCropping && tempImageSrc && (
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <Card className="w-full max-w-3xl bg-background border shadow-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b flex items-center justify-between">
                            <h3 className="font-semibold">Crop & Rotate Image</h3>
                            <Button variant="ghost" size="icon" onClick={handleCropCancel}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="relative flex-1 min-h-[400px] bg-black">
                            <Cropper
                                image={tempImageSrc}
                                crop={crop}
                                zoom={zoom}
                                rotation={rotation}
                                aspect={aspect}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                                onRotationChange={setRotation}
                                onMediaLoaded={onMediaLoaded}
                            />
                        </div>

                        <div className="p-4 space-y-4 bg-background border-t">
                            <div className="flex gap-8">
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <ZoomIn className="h-4 w-4" /> Zoom
                                    </div>
                                    <Slider
                                        value={[zoom]}
                                        min={1}
                                        max={3}
                                        step={0.1}
                                        onValueChange={(value) => setZoom(value[0])}
                                    />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <RotateCw className="h-4 w-4" /> Rotate
                                    </div>
                                    <Slider
                                        value={[rotation]}
                                        min={0}
                                        max={360}
                                        step={1}
                                        onValueChange={(value) => setRotation(value[0])}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={handleCropCancel}>
                                    Cancel
                                </Button>
                                <Button onClick={handleCropConfirm}>
                                    <Check className="mr-2 h-4 w-4" />
                                    Confirm
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </>
    );
}
