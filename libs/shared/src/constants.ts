export const CONSTANTS = {
  PAGINATION: {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },
  UPLOADS: {
    MAX_FILE_SIZE_MB: 5,
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  },
  THRESHOLDS: {
    QUOTA_WARNING_1: 70, // 70% used
    QUOTA_WARNING_2: 85,
    QUOTA_WARNING_3: 95,
  }
};
