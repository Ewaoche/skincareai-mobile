import * as ImagePicker from 'expo-image-picker';
import { requireOptionalNativeModule } from 'expo-modules-core';

export type ShadeSelfieValidationResult = {
  isAcceptable: boolean;
  issues: string[];
  guidance: string[];
  detectedFaceCount?: number;
  detectorUsed?: boolean;
  faceBounds?: {
    left: number;
    top: number;
    width: number;
    height: number;
  } | null;
};

type DetectedFace = {
  bounds: {
    origin: { x: number; y: number };
    size: { width: number; height: number };
  };
  yawAngle?: number | null;
  rollAngle?: number | null;
};

const MIN_DIMENSION = 720;
const MIN_ASPECT_RATIO = 0.72;
const MAX_ASPECT_RATIO = 0.88;

export function validateShadeSelfieAsset(
  asset: ImagePicker.ImagePickerAsset | null,
): ShadeSelfieValidationResult {
  if (!asset) {
    return {
      isAcceptable: false,
      issues: ['Choose or capture a selfie before starting shade matching.'],
      guidance: [],
      faceBounds: null,
    };
  }

  const issues: string[] = [];
  const guidance = [
    'Use daylight or soft window light when possible.',
    'Keep your full face centered and avoid steep tilt.',
    'Avoid heavy filters, strong shadows, and bright overhead glare.',
  ];

  if (!asset.width || !asset.height) {
    issues.push('We could not read this photo clearly enough to validate it.');
  } else {
    const shortestSide = Math.min(asset.width, asset.height);
    const aspectRatio = asset.width / asset.height;

    if (shortestSide < MIN_DIMENSION) {
      issues.push('Use a sharper selfie with a higher image resolution.');
    }

    if (aspectRatio < MIN_ASPECT_RATIO || aspectRatio > MAX_ASPECT_RATIO) {
      issues.push('Use a more centered portrait-style selfie with your face filling the frame naturally.');
    }
  }

  if (asset.mimeType && !['image/jpeg', 'image/png'].includes(asset.mimeType)) {
    issues.push('Use a standard photo format like JPEG or PNG for the most reliable result.');
  }

  return {
    isAcceptable: issues.length === 0,
    issues,
    guidance,
    detectorUsed: false,
    faceBounds: null,
  };
}

export async function validateShadeSelfieWithFaceDetection(
  asset: ImagePicker.ImagePickerAsset | null,
): Promise<ShadeSelfieValidationResult> {
  const base = validateShadeSelfieAsset(asset);

  if (!asset || !base.isAcceptable) {
    return base;
  }

  try {
    const FaceDetector = loadFaceDetectorModule();

    if (!FaceDetector) {
      return base;
    }

    const detection = await FaceDetector.detectFacesAsync(asset.uri, {
      mode: FaceDetector.FaceDetectorMode.fast,
      detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
      runClassifications: FaceDetector.FaceDetectorClassifications.all,
    });

    const issues = [...base.issues];
    const faces = detection.faces ?? [];
    return buildFaceValidationResult({
      base,
      faces: faces as DetectedFace[],
      imageWidth: detection.image?.width ?? asset.width ?? 0,
      imageHeight: detection.image?.height ?? asset.height ?? 0,
    });
  } catch {
    return base;
  }
}

export function buildFaceValidationResult(input: {
  base: ShadeSelfieValidationResult;
  faces: DetectedFace[];
  imageWidth: number;
  imageHeight: number;
}): ShadeSelfieValidationResult {
  const issues = [...input.base.issues];

  if (input.faces.length === 0) {
    issues.push('No clear face was detected. Use a front-facing selfie with your whole face visible.');
    return {
      ...input.base,
      issues,
      isAcceptable: false,
      detectedFaceCount: 0,
      detectorUsed: true,
      faceBounds: null,
    };
  }

  if (input.faces.length > 1) {
    issues.push('Use a selfie with only one face in the frame.');
    return {
      ...input.base,
      issues,
      isAcceptable: false,
      detectedFaceCount: input.faces.length,
      detectorUsed: true,
      faceBounds: null,
    };
  }

  const face = input.faces[0]!;
  let faceBounds: ShadeSelfieValidationResult['faceBounds'] = null;

  if (input.imageWidth > 0 && input.imageHeight > 0) {
    const centerX = face.bounds.origin.x + face.bounds.size.width / 2;
    const centerY = face.bounds.origin.y + face.bounds.size.height / 2;
    const centerOffsetX = Math.abs(centerX / input.imageWidth - 0.5);
    const centerOffsetY = Math.abs(centerY / input.imageHeight - 0.5);
    const widthCoverage = face.bounds.size.width / input.imageWidth;
    const heightCoverage = face.bounds.size.height / input.imageHeight;

    if (centerOffsetX > 0.18 || centerOffsetY > 0.2) {
      issues.push('Center your face more clearly in the frame before matching.');
    }

    if (widthCoverage < 0.28 || heightCoverage < 0.28) {
      issues.push('Move closer so your face fills more of the selfie.');
    }

    faceBounds = {
      left: clamp(face.bounds.origin.x / input.imageWidth, 0, 1),
      top: clamp(face.bounds.origin.y / input.imageHeight, 0, 1),
      width: clamp(widthCoverage, 0, 1),
      height: clamp(heightCoverage, 0, 1),
    };
  }

  const yaw = Math.abs(face.yawAngle ?? 0);
  const roll = Math.abs(face.rollAngle ?? 0);

  if (yaw > 18) {
    issues.push('Face the camera more directly instead of turning to the side.');
  }

  if (roll > 12) {
    issues.push('Keep your head more level for a cleaner shade reading.');
  }

  return {
    ...input.base,
    issues,
    isAcceptable: issues.length === 0,
    detectedFaceCount: input.faces.length,
    detectorUsed: true,
    faceBounds,
  };
}

export function describeShadeConfidence(score: number): {
  label: string;
  body: string;
} {
  if (score >= 0.86) {
    return {
      label: 'High confidence',
      body: 'This selfie produced a strong enough profile to trust the leading shade candidates more confidently.',
    };
  }

  if (score >= 0.74) {
    return {
      label: 'Good candidate',
      body: 'The result is usable, but a brighter, cleaner selfie could improve the next match pass.',
    };
  }

  if (score >= 0.6) {
    return {
      label: 'Low confidence',
      body: 'The result is still directional. Retaking the selfie in softer daylight may improve the match quality.',
    };
  }

  return {
    label: 'Retake recommended',
    body: 'This result should be treated cautiously. A clearer, front-facing selfie is recommended before relying on the shade suggestions.',
  };
}

enum FaceDetectorMode {
  fast = 1,
  accurate = 2,
}

enum FaceDetectorLandmarks {
  none = 1,
  all = 2,
}

enum FaceDetectorClassifications {
  none = 1,
  all = 2,
}

type FaceDetectorModule = {
  detectFacesAsync: (
    uri: string,
    options?: {
      mode?: FaceDetectorMode;
      detectLandmarks?: FaceDetectorLandmarks;
      runClassifications?: FaceDetectorClassifications;
    },
  ) => Promise<{
    faces: DetectedFace[];
    image?: {
      width?: number;
      height?: number;
    };
  }>;
  FaceDetectorMode: typeof FaceDetectorMode;
  FaceDetectorLandmarks: typeof FaceDetectorLandmarks;
  FaceDetectorClassifications: typeof FaceDetectorClassifications;
};

export function loadFaceDetectorModule(): FaceDetectorModule | null {
  const nativeModule = requireOptionalNativeModule<{
    detectFaces: (input: {
      uri: string;
      mode?: FaceDetectorMode;
      detectLandmarks?: FaceDetectorLandmarks;
      runClassifications?: FaceDetectorClassifications;
    }) => Promise<{
      faces: DetectedFace[];
      image?: {
        width?: number;
        height?: number;
      };
    }>;
  }>('ExpoFaceDetector');

  if (!nativeModule?.detectFaces) {
    return null;
  }

  return {
    detectFacesAsync: (uri, options = {}) =>
      nativeModule.detectFaces({
        ...options,
        uri,
      }),
    FaceDetectorMode,
    FaceDetectorLandmarks,
    FaceDetectorClassifications,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
