/**
 * D&D Beyond Content Importer
 * Module settings configuration
 */

export function registerSettings() {
  // Register module settings
  game.settings.register('dndbeyond-importer', 'cobaltCookie', {
    name: 'D&D Beyond Cobalt Cookie',
    hint: 'Your D&D Beyond CobaltSession cookie value for authentication. This is stored locally and never shared.',
    scope: 'world',
    config: true,
    type: String,
    default: '',
    onChange: value => {
      // Validate the cookie when it changes
      if (game.dndbeyondImporter && game.dndbeyondImporter.auth) {
        game.dndbeyondImporter.auth.validateCookie(value);
      }
    }
  });

  game.settings.register('dndbeyond-importer', 'importPath', {
    name: 'Import Path',
    hint: 'The path where imported content will be stored',
    scope: 'world',
    config: true,
    type: String,
    default: 'dndbeyond',
    onChange: value => {
      console.log(`DnDBeyond Importer | Import path changed to: ${value}`);
    }
  });

  game.settings.register('dndbeyond-importer', 'lastImport', {
    name: 'Last Import',
    hint: 'Timestamp of the last successful import',
    scope: 'world',
    config: false,
    type: String,
    default: ''
  });

  game.settings.register('dndbeyond-importer', 'debugMode', {
    name: 'Debug Mode',
    hint: 'Enable debug logging for troubleshooting',
    scope: 'world',
    config: true,
    type: Boolean,
    default: false
  });
} 