# 🚀 Quick Start Guide

## Prerequisites Check

1. **Start Docker Desktop** - Make sure Docker is running on your system

2. **Update Integration Name** - Replace "your_integration" with your actual integration name in:
   - `.env` file
   - `custom_components/your_integration/` folder name
   - All files in that folder
   - `hacs.json`
   - `manifest.json`

3. **Update GitHub Username** - Replace "yourgithubusername" in:
   - `manifest.json` - codeowners field
   - `README.md` - badges and links

## Start Development Environment

```bash
# Once Docker is running:
./scripts/setup-dev.sh
```

## First Time Setup

1. **Access Home Assistant**: http://localhost:8123
   - Create admin account
   - Set location (can skip devices)
   
2. **Puppeteer Browser**: http://localhost:3001
   - For automated testing
   - Browser automation interface

2. **Install HACS**:
   ```bash
   # Download HACS
   cd config
   wget -O - https://get.hacs.xyz | bash -
   cd ..
   
   # Restart Home Assistant
   docker-compose restart homeassistant
   ```

3. **Add HACS Integration**:
   - Settings > Integrations > Add Integration
   - Search "HACS"
   - Follow GitHub authorization

## Develop Your Integration

1. **Edit INITIAL.md** with your integration requirements

2. **In Claude Desktop, run**:
   ```
   /generate-ha-prp INITIAL.md
   ```

3. **Review generated PRP**, then run:
   ```
   /execute-ha-prp PRPs/your-feature.md
   ```

## Test Your Integration

1. **Restart Home Assistant**:
   ```bash
   docker-compose restart homeassistant
   ```

2. **Add Your Integration**:
   - Settings > Integrations > Add Integration
   - Search for your integration name
   - Complete configuration

3. **Check Entities**:
   - Settings > Devices & Services > Entities
   - Look for your new entities

## Validate

```bash
./scripts/validate-all.sh
```

## Common Issues

### Docker Not Running
- Start Docker Desktop application
- Wait for it to fully start
- Try setup script again

### Integration Not Showing
- Check logs: `docker-compose logs homeassistant`
- Verify manifest.json is valid JSON
- Ensure domain matches folder name
- Restart Home Assistant

### HACS Not Installing
- Make sure you're in the config directory
- Check you have wget installed
- Try manual download from GitHub

## Next Steps

1. Implement your specific integration logic
2. Add more sensors/entities as needed
3. Write unit tests
4. Create GitHub repository
5. Make first release for HACS