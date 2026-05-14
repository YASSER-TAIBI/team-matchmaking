import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export type ImageProcessingOptions = {
  width: number;
  height: number;
  outputType?: string;
  quality?: number;
};

export type CloudinaryUploadOptions = {
  fileName?: string;
  folder?: string;
  cloudName?: string;
  uploadPreset?: string;
};

@Injectable({
  providedIn: 'root'
})
export class ImageProcessingService {
  private document = inject(DOCUMENT);

  // Charge l'image sélectionnée, la recadre au centre dans un carré,
  // la redimensionne selon la taille demandée puis la convertit en Blob.
  async processImage(file: File, options: ImageProcessingOptions): Promise<Blob> {
    const image = await this.loadImageFromFile(file);
    const canvas = this.document.createElement('canvas');
    canvas.width = options.width;
    canvas.height = options.height;

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Impossible de préparer le canvas de l\'image.');
    }

    const imageWidth = image.naturalWidth || image.width;
    const imageHeight = image.naturalHeight || image.height;
    const sourceSize = Math.min(imageWidth, imageHeight);
    const sourceX = (imageWidth - sourceSize) / 2;
    const sourceY = (imageHeight - sourceSize) / 2;

    context.clearRect(0, 0, options.width, options.height);
    context.drawImage(
      image,
      sourceX,
      sourceY,
      sourceSize,
      sourceSize,
      0,
      0,
      options.width,
      options.height
    );

    const outputType = options.outputType ?? 'image/webp';
    const quality = options.quality ?? 0.92;
    const blob = await this.canvasToBlob(canvas, outputType, quality);

    if (!blob) {
      throw new Error('Impossible de convertir l\'image au format demandé.');
    }

    return blob;
  }

  // Envoie un Blob déjà traité vers Cloudinary en utilisant la configuration
  // globale du projet ou des options surchargées pour le nom et le dossier.
  async uploadToCloudinary(blob: Blob, options: CloudinaryUploadOptions = {}): Promise<string> {
    const cloudName = options.cloudName?.trim() || environment.cloudinary?.cloudName?.trim();
    const uploadPreset = options.uploadPreset?.trim() || environment.cloudinary?.uploadPreset?.trim();

    if (!cloudName || !uploadPreset) {
      throw new Error('La configuration Cloudinary est incomplète. Renseignez cloudName et uploadPreset.');
    }

    const formData = new FormData();
    formData.append('file', blob, options.fileName ?? 'image.webp');
    formData.append('upload_preset', uploadPreset);

    const folder = options.folder?.trim() || environment.cloudinary?.folder?.trim();
    if (folder) {
      formData.append('folder', folder);
    }

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('L\'upload Cloudinary a échoué. Vérifiez votre upload preset.');
    }

    const payload = await response.json() as { secure_url?: string };
    if (!payload.secure_url) {
      throw new Error('Cloudinary n\'a pas retourné d\'URL exploitable.');
    }

    return payload.secure_url;
  }

  // Transforme un fichier local choisi par l'utilisateur en élément image HTML,
  // afin de pouvoir le dessiner ensuite dans un canvas côté navigateur.
  private loadImageFromFile(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file);
      const image = new Image();

      image.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(image);
      };

      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Impossible de lire l\'image sélectionnée.'));
      };

      image.src = objectUrl;
    });
  }

  // Convertit le contenu du canvas en Blob dans le format demandé,
  // par exemple WebP avec un niveau de qualité défini.
  private canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
    return new Promise(resolve => {
      canvas.toBlob(blob => resolve(blob), type, quality);
    });
  }
}
