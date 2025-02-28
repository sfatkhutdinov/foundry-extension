/**
 * D&D Beyond Content Importer
 * Importer module for handling content import from D&D Beyond
 */

export class DnDBeyondImporter {
  constructor() {
    this.contentTypes = {
      ADVENTURE: 'adventure',
      SOURCEBOOK: 'sourcebook',
      HOMEBREW: 'homebrew',
      CHARACTER: 'character'
    };
    
    this.importQueue = [];
    this.isImporting = false;
  }

  /**
   * Open the import dialog
   */
  async openImportDialog() {
    // Check if authenticated
    if (!globalThis.game.dndbeyondImporter.auth.isAuthenticated) {
      ui.notifications.error('You must authenticate with D&D Beyond first. Please enter your Cobalt cookie in the module settings.');
      this.openSettingsDialog();
      return;
    }

    try {
      // Fetch available content
      const content = await globalThis.game.dndbeyondImporter.auth.getUserContent();
      
      // Create dialog content
      const dialogContent = await this.createImportDialogContent(content);
      
      // Show dialog
      new Dialog({
        title: 'Import from D&D Beyond',
        content: dialogContent,
        buttons: {
          import: {
            icon: '<i class="fas fa-download"></i>',
            label: 'Import Selected',
            callback: html => this.processImportSelection(html)
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: 'Cancel'
          }
        },
        default: 'import',
        render: html => this.onRenderImportDialog(html),
        width: 600
      }).render(true);
    } catch (error) {
      console.error('DnDBeyond Importer | Error opening import dialog:', error);
      ui.notifications.error('Failed to fetch content from D&D Beyond. See console for details.');
    }
  }

  /**
   * Open the module settings dialog
   */
  openSettingsDialog() {
    globalThis.game.settings.sheet.render(true);
    // Focus on the module's tab
    setTimeout(() => {
      const tab = document.querySelector('.settings-list .item[data-tab="modules"]');
      if (tab) tab.click();
    }, 100);
  }

  /**
   * Create the content for the import dialog
   * @param {Array} content - The user's D&D Beyond content
   * @returns {string} - HTML content for the dialog
   */
  async createImportDialogContent(content) {
    // Group content by type
    const adventures = content.filter(item => item.type === 'adventure');
    const sourcebooks = content.filter(item => item.type === 'sourcebook');
    const homebrew = content.filter(item => item.type === 'homebrew');
    
    // Create HTML content
    let html = `
      <form id="dndbeyond-import-form">
        <p>Select the content you wish to import from D&D Beyond:</p>
        
        <div class="form-group">
          <label>Import Options:</label>
          <div class="form-fields">
            <label class="checkbox">
              <input type="checkbox" name="overwrite" data-dtype="Boolean">
              <span>Overwrite existing content</span>
            </label>
          </div>
        </div>
        
        <div class="content-list">
    `;
    
    // Add adventures
    if (adventures.length > 0) {
      html += `<h3>Adventures</h3><div class="content-category">`;
      adventures.forEach(adventure => {
        html += `
          <div class="content-item">
            <label class="checkbox">
              <input type="checkbox" name="content" value="${adventure.id}" data-type="${this.contentTypes.ADVENTURE}">
              <span>${adventure.name}</span>
            </label>
          </div>
        `;
      });
      html += `</div>`;
    }
    
    // Add sourcebooks
    if (sourcebooks.length > 0) {
      html += `<h3>Sourcebooks</h3><div class="content-category">`;
      sourcebooks.forEach(sourcebook => {
        html += `
          <div class="content-item">
            <label class="checkbox">
              <input type="checkbox" name="content" value="${sourcebook.id}" data-type="${this.contentTypes.SOURCEBOOK}">
              <span>${sourcebook.name}</span>
            </label>
          </div>
        `;
      });
      html += `</div>`;
    }
    
    // Add homebrew
    if (homebrew.length > 0) {
      html += `<h3>Homebrew</h3><div class="content-category">`;
      homebrew.forEach(brew => {
        html += `
          <div class="content-item">
            <label class="checkbox">
              <input type="checkbox" name="content" value="${brew.id}" data-type="${this.contentTypes.HOMEBREW}">
              <span>${brew.name}</span>
            </label>
          </div>
        `;
      });
      html += `</div>`;
    }
    
    // Add characters section
    html += `
      <h3>Characters</h3>
      <div class="content-category">
        <p>Import your characters from D&D Beyond:</p>
        <button type="button" id="fetch-characters" class="fetch-characters">
          <i class="fas fa-users"></i> Fetch My Characters
        </button>
        <div id="character-list" class="character-list"></div>
      </div>
    `;
    
    html += `
        </div>
      </form>
    `;
    
    return html;
  }

  /**
   * Handle events after rendering the import dialog
   * @param {jQuery} html - The dialog HTML
   */
  onRenderImportDialog(html) {
    // Add event listener for the fetch characters button
    html.find('#fetch-characters').click(async ev => {
      ev.preventDefault();
      await this.fetchAndDisplayCharacters(html);
    });
  }

  /**
   * Fetch and display the user's characters
   * @param {jQuery} html - The dialog HTML
   */
  async fetchAndDisplayCharacters(html) {
    try {
      const response = await globalThis.game.dndbeyondImporter.auth.makeAuthenticatedRequest('https://www.dndbeyond.com/api/user/characters');
      
      if (response.status === 200) {
        const data = await response.json();
        const characters = data.data || [];
        
        let characterHtml = '';
        
        if (characters.length === 0) {
          characterHtml = '<p>No characters found on your D&D Beyond account.</p>';
        } else {
          characters.forEach(character => {
            characterHtml += `
              <div class="content-item">
                <label class="checkbox">
                  <input type="checkbox" name="content" value="${character.id}" data-type="${this.contentTypes.CHARACTER}">
                  <span>${character.name} (Level ${character.level} ${character.race.fullName} ${character.classes.map(c => c.definition.name).join('/')})</span>
                </label>
              </div>
            `;
          });
        }
        
        html.find('#character-list').html(characterHtml);
      } else {
        ui.notifications.error('Failed to fetch characters from D&D Beyond.');
      }
    } catch (error) {
      console.error('DnDBeyond Importer | Error fetching characters:', error);
      ui.notifications.error('Error fetching characters. See console for details.');
    }
  }

  /**
   * Process the selected content for import
   * @param {jQuery} html - The dialog HTML
   */
  async processImportSelection(html) {
    const form = html.find('#dndbeyond-import-form');
    const overwrite = form.find('input[name="overwrite"]').is(':checked');
    const selectedContent = form.find('input[name="content"]:checked').map(function() {
      return {
        id: $(this).val(),
        type: $(this).data('type')
      };
    }).get();
    
    if (selectedContent.length === 0) {
      ui.notifications.warn('No content selected for import.');
      return;
    }
    
    // Add selected content to import queue
    this.importQueue = selectedContent.map(content => ({
      id: content.id,
      type: content.type,
      overwrite: overwrite,
      status: 'pending'
    }));
    
    // Start the import process
    await this.startImport();
  }

  /**
   * Start the import process
   */
  async startImport() {
    if (this.isImporting) {
      ui.notifications.warn('An import is already in progress.');
      return;
    }
    
    this.isImporting = true;
    
    // Create a progress dialog
    this.progressDialog = new Dialog({
      title: 'Importing from D&D Beyond',
      content: this.createProgressDialogContent(),
      buttons: {
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: 'Cancel',
          callback: () => this.cancelImport()
        }
      },
      close: () => this.cancelImport()
    }, {
      width: 400,
      resizable: true
    });
    
    this.progressDialog.render(true);
    
    // Process the queue
    await this.processImportQueue();
  }

  /**
   * Create the content for the progress dialog
   * @returns {string} - HTML content for the dialog
   */
  createProgressDialogContent() {
    return `
      <div class="import-progress">
        <p>Importing content from D&D Beyond...</p>
        <div class="progress-bar">
          <div class="progress-bar-fill" style="width: 0%"></div>
        </div>
        <p class="progress-text">0/${this.importQueue.length} items imported</p>
        <div class="progress-log">
          <p>Preparing to import...</p>
        </div>
      </div>
    `;
  }

  /**
   * Update the progress dialog
   * @param {number} progress - The current progress (0-100)
   * @param {string} message - The message to display
   */
  updateProgressDialog(progress, message) {
    if (!this.progressDialog) return;
    
    const html = this.progressDialog.element;
    const progressBar = html.find('.progress-bar-fill');
    const progressText = html.find('.progress-text');
    const progressLog = html.find('.progress-log');
    
    progressBar.css('width', `${progress}%`);
    
    const completed = this.importQueue.filter(item => item.status === 'completed').length;
    const failed = this.importQueue.filter(item => item.status === 'failed').length;
    progressText.text(`${completed}/${this.importQueue.length} items imported (${failed} failed)`);
    
    if (message) {
      progressLog.prepend(`<p>${message}</p>`);
    }
  }

  /**
   * Process the import queue
   */
  async processImportQueue() {
    const totalItems = this.importQueue.length;
    let completed = 0;
    
    for (const item of this.importQueue) {
      if (item.status !== 'pending') continue;
      
      try {
        item.status = 'processing';
        this.updateProgressDialog(
          Math.floor((completed / totalItems) * 100),
          `Importing ${this.getContentTypeName(item.type)} (ID: ${item.id})...`
        );
        
        // Import the content based on its type
        switch (item.type) {
          case this.contentTypes.ADVENTURE:
            await this.importAdventure(item.id, item.overwrite);
            break;
          case this.contentTypes.SOURCEBOOK:
            await this.importSourcebook(item.id, item.overwrite);
            break;
          case this.contentTypes.HOMEBREW:
            await this.importHomebrew(item.id, item.overwrite);
            break;
          case this.contentTypes.CHARACTER:
            await this.importCharacter(item.id, item.overwrite);
            break;
        }
        
        item.status = 'completed';
        this.updateProgressDialog(
          Math.floor(((completed + 1) / totalItems) * 100),
          `Successfully imported ${this.getContentTypeName(item.type)} (ID: ${item.id})`
        );
      } catch (error) {
        console.error(`DnDBeyond Importer | Error importing ${item.type} (ID: ${item.id}):`, error);
        item.status = 'failed';
        item.error = error.message;
        this.updateProgressDialog(
          Math.floor(((completed + 1) / totalItems) * 100),
          `Failed to import ${this.getContentTypeName(item.type)} (ID: ${item.id}): ${error.message}`
        );
      }
      
      completed++;
    }
    
    // Update the final progress
    this.updateProgressDialog(100, 'Import completed!');
    
    // Update the last import timestamp
    globalThis.game.settings.set('dndbeyond-importer', 'lastImport', new Date().toISOString());
    
    // Change the dialog buttons
    if (this.progressDialog) {
      this.progressDialog.data.buttons = {
        close: {
          icon: '<i class="fas fa-check"></i>',
          label: 'Close'
        }
      };
      this.progressDialog.render(true);
    }
    
    this.isImporting = false;
  }

  /**
   * Cancel the import process
   */
  cancelImport() {
    if (!this.isImporting) return;
    
    // Mark all processing items as failed
    this.importQueue.forEach(item => {
      if (item.status === 'processing') {
        item.status = 'failed';
        item.error = 'Import cancelled';
      }
    });
    
    this.isImporting = false;
    ui.notifications.info('Import cancelled.');
  }

  /**
   * Get the human-readable name for a content type
   * @param {string} type - The content type
   * @returns {string} - The human-readable name
   */
  getContentTypeName(type) {
    switch (type) {
      case this.contentTypes.ADVENTURE:
        return 'Adventure';
      case this.contentTypes.SOURCEBOOK:
        return 'Sourcebook';
      case this.contentTypes.HOMEBREW:
        return 'Homebrew Content';
      case this.contentTypes.CHARACTER:
        return 'Character';
      default:
        return 'Content';
    }
  }

  /**
   * Import an adventure from D&D Beyond
   * @param {string} id - The adventure ID
   * @param {boolean} overwrite - Whether to overwrite existing content
   */
  async importAdventure(id, overwrite) {
    // This is a placeholder for the actual implementation
    // In a real implementation, this would fetch the adventure data from D&D Beyond
    // and convert it into Foundry VTT compatible format
    
    console.log(`Importing adventure ${id} (overwrite: ${overwrite})`);
    
    // Simulate a delay for testing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create a compendium for the adventure
    const label = `Adventure ${id}`;
    const name = `adventure-${id}`;
    
    // Check if the compendium already exists
    const existingPack = globalThis.game.packs.find(p => p.metadata.name === name);
    
    if (existingPack && !overwrite) {
      throw new Error('Adventure already exists and overwrite is disabled');
    }
    
    // Create or clear the compendium
    let pack;
    if (existingPack) {
      pack = existingPack;
      // Clear the compendium
      await pack.clear();
    } else {
      // Create a new compendium
      pack = await CompendiumCollection.createCompendium({
        name,
        label,
        path: `packs/${name}.db`,
        private: false,
        system: globalThis.game.system.id,
        type: 'Adventure'
      });
    }
    
    // Add some sample content to the compendium
    // In a real implementation, this would be the actual adventure content
    const sampleActor = {
      name: 'Sample NPC',
      type: 'npc',
      img: 'icons/svg/mystery-man.svg',
      data: {
        abilities: {
          str: { value: 10 },
          dex: { value: 10 },
          con: { value: 10 },
          int: { value: 10 },
          wis: { value: 10 },
          cha: { value: 10 }
        }
      }
    };
    
    await pack.importDocument(sampleActor);
    
    return true;
  }

  /**
   * Import a sourcebook from D&D Beyond
   * @param {string} id - The sourcebook ID
   * @param {boolean} overwrite - Whether to overwrite existing content
   */
  async importSourcebook(id, overwrite) {
    // Placeholder implementation
    console.log(`Importing sourcebook ${id} (overwrite: ${overwrite})`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    return true;
  }

  /**
   * Import homebrew content from D&D Beyond
   * @param {string} id - The homebrew content ID
   * @param {boolean} overwrite - Whether to overwrite existing content
   */
  async importHomebrew(id, overwrite) {
    // Placeholder implementation
    console.log(`Importing homebrew ${id} (overwrite: ${overwrite})`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    return true;
  }

  /**
   * Import a character from D&D Beyond
   * @param {string} id - The character ID
   * @param {boolean} overwrite - Whether to overwrite existing content
   */
  async importCharacter(id, overwrite) {
    // Placeholder implementation
    console.log(`Importing character ${id} (overwrite: ${overwrite})`);
    
    try {
      // Fetch character data from D&D Beyond
      const response = await globalThis.game.dndbeyondImporter.auth.makeAuthenticatedRequest(`https://www.dndbeyond.com/api/character/${id}/json`);
      
      if (response.status !== 200) {
        throw new Error(`Failed to fetch character data: ${response.status}`);
      }
      
      const characterData = await response.json();
      
      // Check if character already exists
      const existingActor = globalThis.game.actors.find(a => a.getFlag('dndbeyond-importer', 'characterId') === id);
      
      if (existingActor && !overwrite) {
        throw new Error('Character already exists and overwrite is disabled');
      }
      
      // Convert D&D Beyond character data to Foundry VTT format
      const actorData = this.convertCharacterToActorData(characterData);
      
      // Create or update the actor
      if (existingActor) {
        await existingActor.update(actorData);
      } else {
        await Actor.create(actorData);
      }
      
      return true;
    } catch (error) {
      console.error('DnDBeyond Importer | Error importing character:', error);
      throw error;
    }
  }

  /**
   * Convert D&D Beyond character data to Foundry VTT actor data
   * @param {Object} characterData - The D&D Beyond character data
   * @returns {Object} - The Foundry VTT actor data
   */
  convertCharacterToActorData(characterData) {
    // This is a placeholder for the actual conversion logic
    // In a real implementation, this would convert the D&D Beyond character data
    // into a format compatible with the Foundry VTT system being used
    
    return {
      name: characterData.name,
      type: 'character',
      img: characterData.avatarUrl || 'icons/svg/mystery-man.svg',
      data: {
        abilities: {
          str: { value: characterData.stats.find(s => s.id === 1)?.value || 10 },
          dex: { value: characterData.stats.find(s => s.id === 2)?.value || 10 },
          con: { value: characterData.stats.find(s => s.id === 3)?.value || 10 },
          int: { value: characterData.stats.find(s => s.id === 4)?.value || 10 },
          wis: { value: characterData.stats.find(s => s.id === 5)?.value || 10 },
          cha: { value: characterData.stats.find(s => s.id === 6)?.value || 10 }
        },
        attributes: {
          hp: {
            value: characterData.hitPoints,
            max: characterData.hitPoints
          },
          ac: {
            value: characterData.armorClass
          }
        }
      },
      flags: {
        'dndbeyond-importer': {
          characterId: characterData.id,
          lastUpdated: new Date().toISOString()
        }
      }
    };
  }
} 