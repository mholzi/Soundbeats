## FEATURE: [Your Integration Name]

### Integration Type
- [ ] Sensor
- [ ] Switch
- [ ] Climate
- [ ] Light
- [ ] Other: ___

### Data Source
- API Endpoint: [URL]
- Authentication: [OAuth2/API Key/Basic]
- Rate Limits: [requests/hour]
- API Documentation: [URL]

### Entities to Create
1. **Sensor: [Name]**
   - Unit: [unit]
   - Device Class: [class]
   - Update Frequency: [minutes]

### Configuration Flow
- [ ] Simple (host/port/api_key)
- [ ] OAuth2 flow
- [ ] Discovery via mDNS/SSDP
- [ ] Import from YAML

### EXAMPLES
- `examples/sensors/simple_sensor.py` - Basic sensor pattern
- `examples/config_flow/simple_flow.py` - Basic config flow

### GOTCHAS
- [List any API quirks or limitations]
- [Authentication requirements]
- [Rate limiting details]

### SUCCESS CRITERIA
- [ ] Config flow completes successfully
- [ ] Entities appear in UI within 30s
- [ ] Handles API errors gracefully
- [ ] Passes HACS validation
- [ ] Works on HA 2024.1+