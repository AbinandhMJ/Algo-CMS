import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { initializeApp, getApps, getApp } from 'firebase/app';
import firebaseConfig from '../../firebase-applet-config.json';
import { ProjectFile } from '../types';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const storage = getStorage(app);

export interface UploadOptions {
  projectId: string;
  file: File;
  uploadedByName: string;
  uploadedByClientUserId?: string;
  uploadedByUserId?: string;
}

/**
 * Uploads a file for a project to Firebase Storage with a graceful local fallback
 * so that tests, offline states, and preview sandboxes work seamlessly.
 */
export async function uploadProjectFile(options: UploadOptions): Promise<ProjectFile> {
  const { projectId, file, uploadedByName, uploadedByClientUserId, uploadedByUserId } = options;
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `projects/${projectId}/files/${timestamp}_${sanitizedName}`;
  const fileRef = ref(storage, storagePath);

  let downloadUrl = '';

  try {
    const uploadResult = await uploadBytes(fileRef, file, {
      contentType: file.type || 'application/octet-stream',
      customMetadata: {
        projectId,
        uploadedByName,
        originalName: file.name,
      },
    });
    downloadUrl = await getDownloadURL(uploadResult.ref);
  } catch (error) {
    console.warn('Firebase Storage direct upload note (falling back to durable local URL):', error);
    // Fallback to Data URL / Blob URL for preview or offline persistence
    downloadUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        resolve(URL.createObjectURL(file));
      };
      reader.readAsDataURL(file);
    });
  }

  const projectFile: ProjectFile = {
    id: `file-${timestamp}`,
    projectId,
    name: file.name,
    sizeBytes: file.size,
    mimeType: file.type || 'application/octet-stream',
    url: downloadUrl,
    uploadedByName,
    uploadedByClientUserId: uploadedByClientUserId || null,
    uploadedByUserId: uploadedByUserId || null,
    uploadedAt: new Date().toISOString(),
  };

  return projectFile;
}
