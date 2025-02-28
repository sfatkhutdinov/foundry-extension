/**
 * D&D Beyond Content Importer
 * Main entry point for the module
 */

import { registerSettings } from './settings.js';
import { DnDBeyondImporter } from './importer.js';
import { DnDBeyondAuth } from './auth.js';

Hooks.once('init', async function() {
  console.log('DnDBeyond Importer | Initializing module');
  
  // Register module settings
  registerSettings();
  
  // Register the module in the game
  game.dndbeyondImporter = {
    importer: new DnDBeyondImporter(),
    auth: new DnDBeyondAuth()
  };
});

Hooks.once('ready', async function() {
  console.log('DnDBeyond Importer | Module ready');
});

// Add a button to the sidebar
Hooks.on('renderSidebarTab', async (app, html) => {
  if (app.options.id === 'compendium') {
    const importButton = $(`
      <div class="action-buttons flexrow">
        <button class="dndbeyond-import">
          <i class="fas fa-download"></i> Import from D&D Beyond
        </button>
      </div>
    `);
    
    html.find('.directory-footer').append(importButton);
    
    html.find('.dndbeyond-import').click(ev => {
      ev.preventDefault();
      game.dndbeyondImporter.importer.openImportDialog();
    });
  }
}); 