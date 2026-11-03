import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIGMA_API_BASE = 'https://api.figma.com/v1';
const FILE_KEY = process.env.FIGMA_FILE_KEY;
const TOKEN = process.env.FIGMA_PERSONAL_ACCESS_TOKEN;
const OUTPUT_DIR = './extracted-data';

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Helper function to make Figma API requests
async function figmaRequest(endpoint) {
  const url = `${FIGMA_API_BASE}${endpoint}`;
  console.log(`Requesting: ${url}`);

  const response = await fetch(url, {
    headers: {
      'X-Figma-Token': TOKEN
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Figma API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

// Test connection to Figma API
async function testConnection() {
  console.log('\n=== Testing Figma API Connection ===\n');

  try {
    const fileData = await figmaRequest(`/files/${FILE_KEY}`);
    console.log('✅ Connection successful!');
    console.log(`File name: ${fileData.name}`);
    console.log(`File key: ${FILE_KEY}`);
    console.log(`Last modified: ${fileData.lastModified}`);
    console.log(`Document URL: ${fileData.documentUrl}`);

    // Save basic file info
    const fileInfo = {
      name: fileData.name,
      key: FILE_KEY,
      lastModified: fileData.lastModified,
      documentUrl: fileData.documentUrl,
      version: fileData.version
    };

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'file-info.json'),
      JSON.stringify(fileInfo, null, 2)
    );
    console.log('\n✅ File info saved to extracted-data/file-info.json');

    return fileData;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    throw error;
  }
}

// Inspect file structure and list all pages
async function inspectFile() {
  console.log('\n=== Inspecting Figma File Structure ===\n');

  try {
    const fileData = await figmaRequest(`/files/${FILE_KEY}`);

    console.log(`File: ${fileData.name}`);
    console.log(`Total pages: ${fileData.document.children.length}\n`);

    const pages = fileData.document.children.map(page => ({
      id: page.id,
      name: page.name,
      type: page.type,
      childrenCount: page.children ? page.children.length : 0
    }));

    console.log('Pages found:');
    pages.forEach((page, index) => {
      console.log(`  ${index + 1}. ${page.name} (ID: ${page.id}, Frames: ${page.childrenCount})`);
    });

    // Save complete file structure
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'file-structure.json'),
      JSON.stringify(fileData.document, null, 2)
    );
    console.log('\n✅ Complete file structure saved to extracted-data/file-structure.json');

    // Save pages summary
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'pages-summary.json'),
      JSON.stringify(pages, null, 2)
    );
    console.log('✅ Pages summary saved to extracted-data/pages-summary.json');

    return { fileData, pages };
  } catch (error) {
    console.error('❌ Inspection failed:', error.message);
    throw error;
  }
}

// Find the Admin section in the file
function findAdminSection(fileData) {
  console.log('\n=== Searching for Admin Section ===\n');

  const pages = fileData.document.children;

  // Target the specific Admin SECTION in "Webapp design" page
  const webappPage = pages.find(page => page.name === 'Webapp design');

  if (!webappPage) {
    console.log('❌ Could not find "Webapp design" page');
    return null;
  }

  console.log(`✅ Found "Webapp design" page (ID: ${webappPage.id})`);

  // Look for SECTION type nodes named "Admin" within Webapp design
  const adminSection = webappPage.children.find(child =>
    child.type === 'SECTION' && child.name === 'Admin'
  );

  if (adminSection) {
    console.log(`✅ Found Admin section: ${adminSection.name} (ID: ${adminSection.id})`);
    console.log(`   Located in page: ${webappPage.name} (ID: ${webappPage.id})`);
    console.log(`   Total frames in section: ${adminSection.children ? adminSection.children.length : 0}`);
    return { page: webappPage, section: adminSection };
  }

  console.log('❌ Could not locate Admin section in Webapp design');
  console.log('Available sections in Webapp design:');
  webappPage.children.forEach(child => {
    console.log(`  - ${child.name} (${child.type}, ID: ${child.id})`);
  });

  return null;
}

// Extract Admin section data
async function extractAdminSection() {
  console.log('\n=== Extracting Admin Section ===\n');

  try {
    const fileData = await figmaRequest(`/files/${FILE_KEY}`);
    const adminResult = findAdminSection(fileData);

    if (!adminResult) {
      throw new Error('Admin section not found in the file');
    }

    let adminData;

    // Determine what we found (page, section, or frames)
    if (adminResult.type === 'CANVAS') {
      // It's a page
      console.log(`\nExtracting complete Admin page: ${adminResult.name}`);
      adminData = {
        type: 'page',
        name: adminResult.name,
        id: adminResult.id,
        children: adminResult.children
      };
    } else if (adminResult.section) {
      // It's a section within a page
      console.log(`\nExtracting Admin section from page: ${adminResult.page.name}`);
      adminData = {
        type: 'section',
        pageName: adminResult.page.name,
        pageId: adminResult.page.id,
        sectionName: adminResult.section.name,
        sectionId: adminResult.section.id,
        children: adminResult.section.children
      };
    } else if (adminResult.frames) {
      // It's frames within a page
      console.log(`\nExtracting Admin frames from page: ${adminResult.page.name}`);
      adminData = {
        type: 'frames',
        pageName: adminResult.page.name,
        pageId: adminResult.page.id,
        frames: adminResult.frames
      };
    }

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'admin-section.json'),
      JSON.stringify(adminData, null, 2)
    );

    const itemCount = adminData.children ? adminData.children.length :
                     adminData.frames ? adminData.frames.length : 0;

    console.log(`✅ Admin section saved to extracted-data/admin-section.json`);
    console.log(`   Total items: ${itemCount}`);

    return adminData;
  } catch (error) {
    console.error('❌ Extraction failed:', error.message);
    throw error;
  }
}

// Generate inventory of Admin section
async function generateInventory() {
  console.log('\n=== Generating Admin Section Inventory ===\n');

  try {
    const adminPath = path.join(OUTPUT_DIR, 'admin-section.json');

    if (!fs.existsSync(adminPath)) {
      console.log('⚠️  Admin section not extracted yet. Running extraction...');
      await extractAdminSection();
    }

    const adminData = JSON.parse(fs.readFileSync(adminPath, 'utf-8'));
    const inventory = {
      summary: {},
      screens: [],
      components: [],
      navigation: [],
      tables: [],
      forms: [],
      dialogs: [],
      other: []
    };

    // Determine the frames based on type
    let frames;
    if (adminData.type === 'page') {
      frames = adminData.children;
      inventory.summary.sectionName = adminData.name;
    } else if (adminData.type === 'section') {
      frames = adminData.children;
      inventory.summary.sectionName = `${adminData.pageName} > ${adminData.sectionName}`;
    } else if (adminData.type === 'frames') {
      frames = adminData.frames;
      inventory.summary.sectionName = adminData.pageName;
    } else {
      throw new Error(`Unknown admin data type: ${adminData.type}`);
    }

    inventory.summary.totalFrames = frames.length;

    console.log(`\nAnalyzing ${frames.length} frames...\n`);

    frames.forEach((frame, index) => {
      const frameInfo = {
        id: frame.id,
        name: frame.name,
        type: frame.type,
        width: frame.width ? Math.round(frame.width) : 0,
        height: frame.height ? Math.round(frame.height) : 0,
        childrenCount: frame.children ? frame.children.length : 0
      };

      // Categorize based on name
      const nameLower = frame.name.toLowerCase();

      if (nameLower.includes('table') || nameLower.includes('list')) {
        inventory.tables.push(frameInfo);
      } else if (nameLower.includes('form') || nameLower.includes('input') || nameLower.includes('field')) {
        inventory.forms.push(frameInfo);
      } else if (nameLower.includes('dialog') || nameLower.includes('modal') || nameLower.includes('popup')) {
        inventory.dialogs.push(frameInfo);
      } else if (nameLower.includes('nav') || nameLower.includes('menu') || nameLower.includes('sidebar')) {
        inventory.navigation.push(frameInfo);
      } else if (nameLower.includes('component') || nameLower.includes('btn') || nameLower.includes('card')) {
        inventory.components.push(frameInfo);
      } else {
        inventory.screens.push(frameInfo);
      }

      console.log(`${index + 1}. ${frame.name} (${frame.type}) - ${frameInfo.width}x${frameInfo.height}`);
    });

    // Save inventory
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'admin-inventory.json'),
      JSON.stringify(inventory, null, 2)
    );

    console.log('\n=== Inventory Summary ===');
    console.log(`Section: ${inventory.summary.sectionName}`);
    console.log(`Total Frames: ${inventory.summary.totalFrames}`);
    console.log(`Screens: ${inventory.screens.length}`);
    console.log(`Components: ${inventory.components.length}`);
    console.log(`Navigation: ${inventory.navigation.length}`);
    console.log(`Tables: ${inventory.tables.length}`);
    console.log(`Forms: ${inventory.forms.length}`);
    console.log(`Dialogs: ${inventory.dialogs.length}`);
    console.log('\n✅ Inventory saved to extracted-data/admin-inventory.json');

    return inventory;
  } catch (error) {
    console.error('❌ Inventory generation failed:', error.message);
    throw error;
  }
}

// Main CLI handler
const command = process.argv[2];

switch (command) {
  case 'test':
    testConnection();
    break;
  case 'inspect':
    inspectFile();
    break;
  case 'extract-admin':
    extractAdminSection();
    break;
  case 'inventory':
    generateInventory();
    break;
  default:
    console.log(`
Usage:
  node figma-extractor.js test          - Test Figma API connection
  node figma-extractor.js inspect       - Inspect file structure and list pages
  node figma-extractor.js extract-admin  - Extract Admin section data
  node figma-extractor.js inventory     - Generate inventory of Admin section
    `);
}
