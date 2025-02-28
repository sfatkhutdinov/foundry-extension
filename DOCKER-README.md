# Installing D&D Beyond Importer on Docker-based Foundry VTT

If you're running Foundry VTT in Docker, follow these steps to install and test the D&D Beyond Importer module:

## Option 1: Direct Installation (Recommended)

1. **Locate your Docker's Foundry Data path** where modules are stored. For example:
   ```
   /path/to/foundry/data/Data/modules/
   ```

2. **Copy the module's ZIP file** to the modules directory:
   ```bash
   cp /path/from/host/dndbeyond-importer.zip /path/to/foundry/data/Data/modules/
   ```
   
3. **Extract the ZIP file** within your Docker container:
   ```bash
   docker exec -it your-foundry-container bash
   cd /data/Data/modules/
   unzip dndbeyond-importer.zip -d dndbeyond-importer
   exit
   ```

4. **Restart your Foundry VTT container** to ensure the module is properly recognized:
   ```bash
   docker restart your-foundry-container
   ```

## Option 2: Volume Mounting (Development)

If you're actively developing the module, you can mount the development directory directly:

1. **Add a volume mount** to your Docker Compose file:
   ```yaml
   volumes:
     - /Users/stanislav/Documents/Programming/foundry-extension:/data/Data/modules/dndbeyond-importer
   ```

2. **Restart Docker** with the new configuration:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

## Option 3: Using the Module Installation Interface

1. **Create a module manifest URL** that is accessible from your Docker container:
   - Host the manifest file on a web server or GitHub
   - Use the URL: `https://raw.githubusercontent.com/sfatkhutdinov/foundry-extension/main/module.json`
   
2. **Install through Foundry interface:**
   - In Foundry, go to "Add-on Modules"
   - Click "Install Module"
   - Paste the manifest URL
   - Click "Install"

## Troubleshooting Docker Installation

If you encounter issues:

1. **Check Docker logs**:
   ```bash
   docker logs your-foundry-container
   ```

2. **Verify file permissions**:
   ```bash
   docker exec -it your-foundry-container bash
   ls -la /data/Data/modules/dndbeyond-importer
   ```

3. **Check the module structure** to ensure it matches expected Foundry format:
   ```bash
   docker exec -it your-foundry-container bash
   find /data/Data/modules/dndbeyond-importer -type f | sort
   ```

4. **Validate module.json** is properly formatted for v12:
   ```bash
   docker exec -it your-foundry-container bash
   cat /data/Data/modules/dndbeyond-importer/module.json
   ```

5. **Check browser console logs** for JavaScript errors after enabling the module 