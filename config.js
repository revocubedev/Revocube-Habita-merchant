export const config = {
  figmaApiBaseUrl: 'https://api.figma.com/v1',
  fileKey: process.env.FIGMA_FILE_KEY,
  token: process.env.FIGMA_PERSONAL_ACCESS_TOKEN,
  outputDir: './extracted-data',
  adminSectionName: 'Admin' // Will verify this name after inspection
};
