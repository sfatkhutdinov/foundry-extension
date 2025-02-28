/**
 * D&D Beyond Content Importer
 * Main entry point for the module
 */

import { registerSettings } from './settings.js';
import { DnDBeyondImporter } from './importer.js';
import { DnDBeyondAuth } from './auth.js';

// Use Foundry's global variable
const MODULEID = 'dndbeyond-importer';

Hooks.once('init', async function() {
  console.log('DnDBeyond Importer | Initializing module');
  
  // Register module settings
  registerSettings();
  
  // Register the module in the game
  // In V12, use globalThis.game instead of just game to ensure compatibility
  globalThis.game.modules.get(MODULEID).api = {
    importer: new DnDBeyondImporter(),
    auth: new DnDBeyondAuth()
  };
  
  // For backward compatibility
  globalThis.game.dndbeyondImporter = globalThis.game.modules.get(MODULEID).api;
});

Hooks.once('ready', async function() {
  console.log('DnDBeyond Importer | Module ready');
  
  // Optional: Initialize auth on ready
  if (globalThis.game.dndbeyondImporter && globalThis.game.dndbeyondImporter.auth) {
    await globalThis.game.dndbeyondImporter.auth.initialize();
  }
});

// Add a button to the sidebar - using V12 jQuery syntax with $ instead of jQuery
Hooks.on('renderSidebarTab', async (app, html) => {
  if (app.options.id === 'compendium') {
    const importButton = `
      <div class="action-buttons flexrow">
        <button class="dndbeyond-import">
          <i class="fas fa-download"></i> Import from D&D Beyond
        </button>
      </div>
    `;
    
    html.find('.directory-footer').append(importButton);
    
    html.find('.dndbeyond-import').click(ev => {
      ev.preventDefault();
      globalThis.game.dndbeyondImporter.importer.openImportDialog();
    });
  }
}); 