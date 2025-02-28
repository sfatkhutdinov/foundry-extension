# D&D Beyond Content Importer for Foundry VTT

This module allows you to import content you own on D&D Beyond into Foundry VTT using Cobalt cookies for authentication.

## Features

- Import adventures, rulebooks, and homebrew content from D&D Beyond
- Secure authentication using Cobalt cookies
- Automatic conversion of D&D Beyond content into Foundry-compatible formats
- Organized content import with proper categorization
- User-friendly interface for selecting and importing content

## Installation

1. In Foundry VTT, navigate to the "Add-on Modules" tab
2. Click "Install Module"
3. Enter the following URL in the "Manifest URL" field: `https://raw.githubusercontent.com/yourusername/dndbeyond-importer/main/module.json`
4. Click "Install"

## Usage

1. Enable the module in your Foundry VTT world
2. Access the D&D Beyond Importer through the module settings
3. Provide your Cobalt cookie from D&D Beyond (see instructions below)
4. Select the content you wish to import
5. Click "Import" to start the import process

### How to Find Your Cobalt Cookie

1. Log in to D&D Beyond in your web browser
2. Open your browser's developer tools (F12 or right-click > Inspect)
3. Navigate to the "Application" or "Storage" tab
4. Under "Cookies", select "https://www.dndbeyond.com"
5. Find the cookie named "CobaltSession"
6. Copy the value and paste it into the module's authentication field

## Security

This module never stores your D&D Beyond credentials. The Cobalt cookie is only used to authenticate requests to D&D Beyond's servers and is stored locally on your Foundry instance.

## Support

If you encounter any issues or have suggestions for improvements, please [create an issue](https://github.com/yourusername/dndbeyond-importer/issues) on GitHub.

## License

This module is licensed under the MIT License. See the LICENSE file for details.

## Disclaimer

This module is not affiliated with, endorsed, sponsored, or approved by Wizards of the Coast or D&D Beyond. All product and company names are trademarks™ or registered® trademarks of their respective holders. 