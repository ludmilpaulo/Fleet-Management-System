/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useMemo, useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { FolderClosed, FolderOpen, X } from "lucide-react";
import { FileInputProps } from "@/types/components";

const FileInput = ({
  id = "file",
  name = "file",
  label,
  placeholder,
  multiple,
  required,
  landscape,
  onChange,
}: FileInputProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const previewsRef = useRef<HTMLDivElement>(null);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      onChange?.(Array.from(e.target.files));
    } else {
      setFiles([]);
      onChange?.(null);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
    gsap.to(iconRef.current, {
      scale: 1.2,
      duration: 0.3,
      ease: "back.out(1.7)",
    });
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    gsap.to(iconRef.current, {
      scale: 1,
      duration: 0.3,
      ease: "back.out(1.7)",
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    gsap.to(iconRef.current, {
      scale: 1,
      duration: 0.3,
      ease: "back.out(1.7)",
    });
    if (e.dataTransfer.files) {
      setFiles(Array.from(e.dataTransfer.files));
      onChange?.(Array.from(e.dataTransfer.files));
    }
  };
  const handleRemoveFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    onChange?.(newFiles);
  };

  useEffect(() => {
    if (containerRef.current && iconRef.current && textRef.current) {
      // Initial animation
      gsap.from(containerRef.current, {
        y: 20,
        duration: 0.6,
        ease: "power3.out",
      });

      // Floating animation for icon
      gsap.to(iconRef.current, {
        y: -8,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });

      // Subtle pulse animation for text
      gsap.to(textRef.current, {
        opacity: 1,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });
    }
  }, []);

  useMemo(() => {
    (async () => {
      if (!files || files.length <= 0) {
        setPreviews([]);
        return;
      }
      if (files.length > 0) {
        const previews_urls = files.map((file) => {
          return URL.createObjectURL(file);
        });
        setPreviews(previews_urls);

        if (previewsRef.current) {
          gsap.fromTo(
            previewsRef.current.children,
            {
              scale: 0.5,
              y: 20,
              rotation: -10,
            },
            {
              scale: 1,
              y: 0,
              rotation: 0,
              duration: 0.5,
              stagger: 0.1,
              ease: "back.out(1.7)",
            },
          );
        }
      }
    })();
  }, [files]);

  return (
    <div
      className="w-full space-y-4 bg-background text-text mb-6 flex flex-col border-2 border-border p-4 rounded-lg"
      ref={containerRef}
    >
      <label htmlFor={id} className="text-sm font-semibold">
        {label || "Upload Image"}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div
        onDragEnter={handleDragEnter}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative overflow-hidden h-52 border-2 border-dashed rounded-xl p-8 w-full transition-all duration-500 ${
          isDragging
            ? "border-foreground bg-foreground bg-opacity-5"
            : "border-text border-opacity-30 hover:border-foreground hover:border-opacity-50"
        }`}
      >
        <input
          type="file"
          name={name}
          placeholder={placeholder}
          id={id}
          accept="image/*"
          multiple={multiple}
          onChange={handleOnChange}
          required={required}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className="relative flex flex-col items-center justify-center h-full space-y-4 pointer-events-none">
          <div ref={iconRef} className="text-3xl transition-transform">
            {/* {isDragging ? "📂" : "📁"} */}
            {isDragging ? <FolderOpen /> : <FolderClosed />}
          </div>
          <div ref={textRef} className="text-center">
            <p className="text-md font-medium mb-2">
              Drag and drop your files here
            </p>
            <p className="text-xs opacity-70">
              or click to browse from your computer
            </p>
            <p className="text-[.6em] mt-4 opacity-50">
              {multiple ? "Multiple files allowed" : "Single file only"}
            </p>
          </div>
        </div>
      </div>
      <ScrollArea
        ref={previewsRef}
        className="w-full overflow-auto max-h-[350px] rounded-lg whitespace-nowrap "
      >
        <div className="flex h-max gap-1">
          {previews.length > 0 ? (
            previews.map((preview, index) => (
              <div
                key={index}
                className={`relative ${
                  landscape ? "w-[580px]" : " w-[200px]"
                } h-[100%] shadow-lg flex items-center justify-center overflow-hidden border-2 border-text border-opacity-30 rounded-lg transition-all duration-500 group hover:border-foreground hover:border-opacity-50`}
              >
                <img
                  key={index}
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className={`h-fit w-fit object-cover`}
                  // width={landscape ? 550 : 200}
                  // height={landscape ? 300 : 350}
                />
                <div className="absolute top-0 right-0 bg-black/25 z-10 w-full p-2 flex items-center justify-end">
                  <button
                    type="button"
                    title="remove"
                    onClick={() => handleRemoveFile(index)}
                    className="text-white opacity-70 hover:opacity-100 transition-opacity duration-300"
                  >
                    <X size={16} />
                  </button>
                </div>
                {/* <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-500 w-[200px]" /> */}
              </div>
            ))
          ) : (
            <span className="text-xs font-bold">no item to preview</span>
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default FileInput;
