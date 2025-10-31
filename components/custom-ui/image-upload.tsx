"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onFileSelect?: (file: File | null) => void;
  slug?: string;
  label?: string;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  onFileSelect,
  slug,
  label = "Upload Image",
  className = "",
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Use the actual value or preview URL
  const displayUrl = previewUrl || value || "";

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      onFileSelect?.(null);
      return;
    }

    // Validate file size
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert("File too large. Maximum size is 5MB.");
      return;
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("Invalid file type. Only JPEG, PNG, and WebP are allowed.");
      return;
    }

    console.log("File selected:", {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

    // Store the file for later upload
    onFileSelect?.(file);

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setPreviewUrl(previewUrl);
    
    // Don't call onChange here - we'll upload when form is submitted
    // For now, set a temporary placeholder
    onChange(`temp-upload-${file.name}`);
  };

  const handleRemove = () => {
    setPreviewUrl("");
    onChange("");
  };



  const handleButtonClick = () => {
    console.log("Browse button clicked, triggering file input");
    fileInputRef.current?.click();
  };



  return (
    <div className={`space-y-4 ${className}`}>
      <Label>{label}</Label>
      
      {/* Preview */}
      {displayUrl && (
        <div className="relative inline-block">
          <div className="relative w-32 h-48 border rounded-lg overflow-hidden">
            <Image
              src={displayUrl}
              alt="Preview"
              fill
              className="object-cover"
              onError={() => {
                setPreviewUrl("");
                onChange("");
              }}
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6"
            onClick={handleRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Upload Button */}
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={!slug}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          disabled={!slug}
          onClick={handleButtonClick}
        >
          <Upload className="h-4 w-4 mr-2" />
          Browse Local Image
        </Button>
        
        {!slug && (
          <span className="text-sm text-muted-foreground">
            Enter a title first to enable upload
          </span>
        )}
      </div>
    </div>
  );
}