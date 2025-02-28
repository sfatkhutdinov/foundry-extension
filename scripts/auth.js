/**
 * D&D Beyond Content Importer
 * Authentication module for handling Cobalt cookie authentication
 */

export class DnDBeyondAuth {
  constructor() {
    this.isAuthenticated = false;
    this.userData = null;
    this.cobaltCookie = '';
  }

  /**
   * Initialize the authentication module
   */
  async initialize() {
    this.cobaltCookie = game.settings.get('dndbeyond-importer', 'cobaltCookie');
    if (this.cobaltCookie) {
      await this.validateCookie(this.cobaltCookie);
    }
  }

  /**
   * Validate the Cobalt cookie by making a test request to D&D Beyond
   * @param {string} cookie - The Cobalt cookie to validate
   * @returns {Promise<boolean>} - Whether the cookie is valid
   */
  async validateCookie(cookie) {
    try {
      const response = await this.makeAuthenticatedRequest('https://www.dndbeyond.com/api/user/characters', cookie);
      
      if (response.status === 200) {
        const data = await response.json();
        this.isAuthenticated = true;
        this.cobaltCookie = cookie;
        this.userData = data;
        ui.notifications.info('D&D Beyond authentication successful!');
        return true;
      } else {
        this.isAuthenticated = false;
        this.userData = null;
        ui.notifications.error('D&D Beyond authentication failed. Please check your Cobalt cookie.');
        return false;
      }
    } catch (error) {
      console.error('DnDBeyond Importer | Authentication error:', error);
      ui.notifications.error('D&D Beyond authentication error. See console for details.');
      this.isAuthenticated = false;
      this.userData = null;
      return false;
    }
  }

  /**
   * Make an authenticated request to D&D Beyond
   * @param {string} url - The URL to request
   * @param {string} cookie - The Cobalt cookie to use for authentication
   * @returns {Promise<Response>} - The fetch response
   */
  async makeAuthenticatedRequest(url, cookie = null) {
    const cookieToUse = cookie || this.cobaltCookie;
    
    if (!cookieToUse) {
      throw new Error('No Cobalt cookie available for authentication');
    }

    // Use the Foundry VTT fetch API to make the request
    return fetch(url, {
      method: 'GET',
      headers: {
        'Cookie': `CobaltSession=${cookieToUse}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
  }

  /**
   * Get the user's D&D Beyond content
   * @returns {Promise<Array>} - Array of content items
   */
  async getUserContent() {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated with D&D Beyond');
    }

    try {
      // Fetch the user's purchased content
      const response = await this.makeAuthenticatedRequest('https://www.dndbeyond.com/api/subscriptions/user/digital-content');
      
      if (response.status === 200) {
        const data = await response.json();
        return data.items || [];
      } else {
        throw new Error(`Failed to fetch user content: ${response.status}`);
      }
    } catch (error) {
      console.error('DnDBeyond Importer | Error fetching user content:', error);
      throw error;
    }
  }
} 