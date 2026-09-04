import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  File,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Tag,
  X,
} from 'lucide-react';
import { uploadProjectFile } from '../../services/storage';
import { ProjectFile } from '../../types';

interface ClientFileUploadZoneProps {
  projectId: string;
  projectName: string;
  clientUserName: string;
  clientUserId?: string;
  onFileUploaded: (file: ProjectFile) => void;
}

export const ClientFileUploadZone: React.FC<ClientFileUploadZoneProps> = ({
  projectId,
  projectName,
  clientUserName,
  clientUserId,
  onFileUploaded,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fileCategory, setFileCategory] = useState<string>('Brand Asset');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    'Brand Asset',
    'Reference Doc',
    'Feedback Screenshot',
    'Technical Spec',
  ];

  const handleFileProcess = async (file: File) => {
    if (!file) return;
    setUploadError(null);
    setSuccessMessage(null);

    // Max 25MB check
    if (file.size > 25 * 1024 * 1024) {
      setUploadError('File exceeds 25MB limit. Please choose a smaller file.');
      return;
    }

    try {
      setIsUploading(true);

      // Call our storage service
      const projectFile = await uploadProjectFile({
        projectId,
        file,
        uploadedByName: `${clientUserName} (${fileCategory})`,
        uploadedByClientUserId: clientUserId,
      });

      onFileUploaded(projectFile);
      setSuccessMessage(`"${file.name}" uploaded successfully to ${projectName}!`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error('File upload error:', err);
      setUploadError(err.message || 'Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Upload Project Deliverables & Assets</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Share brand assets, reference documentation, or feedback screenshots directly to{' '}
            <span className="font-medium text-slate-800">{projectName}</span>.
          </p>
        </div>

        {/* Category Selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-medium text-slate-400 mr-1 flex items-center gap-1">
            <Tag className="h-3 w-3" /> Tag:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFileCategory(cat)}
              className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                fileCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {uploadError && (
        <div className="mb-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-800">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <span>{uploadError}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Drag & Drop Area */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-50/50'
            : 'border-slate-200 bg-slate-50/60 hover:border-slate-300 hover:bg-slate-50'
        } ${isUploading ? 'opacity-70 pointer-events-none' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          id="client-project-file-input"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFileProcess(e.target.files[0]);
            }
          }}
        />

        {isUploading ? (
          <div className="py-2 flex flex-col items-center gap-2">
            <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
            <p className="text-xs font-medium text-slate-800">Uploading to Firebase Storage...</p>
            <p className="text-[11px] text-slate-400">Scoped to {projectName}</p>
          </div>
        ) : (
          <>
            <div className="rounded-full bg-white p-3 shadow-2xs border border-slate-200 mb-2.5">
              <UploadCloud className="h-6 w-6 text-slate-700" />
            </div>
            <p className="text-xs font-medium text-slate-800">
              <span className="text-blue-700 underline font-semibold">Click to browse</span> or drag and drop files here
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Supports PNG, JPG, SVG, PDF, DOCX, XLSX, ZIP (Max 25MB)
            </p>
          </>
        )}
      </div>
    </div>
  );
};
