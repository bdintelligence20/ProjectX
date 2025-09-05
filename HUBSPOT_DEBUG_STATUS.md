# HubSpot Integration Debugging Status

## Current Issue
The HubSpot API is returning a 401 error with message: "The OAuth token used to make this call expired 20336 day(s) ago" with expiry date of 1970-01-01T00:00:00Z.

## What This Means
- The API is not recognizing the provided key as a valid Personal Access Key
- The 1970-01-01 date suggests the token is being interpreted as invalid/null
- The system thinks we're using an OAuth token instead of a Personal Access Key

## Debugging Added
We've added detailed logging to help diagnose the issue:
```python
# Debug key format
logging.info(f"HubSpot key first 4 chars: {hubspot_api_key[:4]}...")
logging.info(f"HubSpot key last 4 chars: ...{hubspot_api_key[-4:]}")
logging.info(f"HubSpot key length: {len(hubspot_api_key)}")
logging.info(f"Contains 'pat-': {'pat-' in hubspot_api_key}")
```

## What to Check in Render Logs
After deployment completes, check the logs for these debug messages to verify:

1. **Key Format**: Does it start with 'pat-'?
   - Personal Access Keys should start with 'pat-'
   - Private App Access Tokens do NOT have this prefix

2. **Key Length**: Is it the expected length?
   - HubSpot keys are typically 100+ characters

3. **Key Integrity**: Are the first/last 4 chars what you expect?
   - This helps verify the key isn't being truncated

## Possible Solutions Based on Key Type

### If it's a Personal Access Key (starts with 'pat-')
- Already using correct Bearer authentication
- Check if key has correct permissions/scopes
- Verify key hasn't been revoked

### If it's a Private App Access Token (no 'pat-' prefix)
- The code already handles this case (uses Bearer auth regardless)
- These tokens are from Private Apps in HubSpot
- Should work with Bearer authentication

### If key looks corrupted/truncated
- Re-copy the key from HubSpot
- Ensure no extra quotes or spaces
- Update in Render environment variables

## How to Get the Right Key

### For Personal Access Key:
1. Go to HubSpot Settings > Integrations > Private Apps
2. Click on your app
3. Under "Auth" tab, find your Personal Access Token
4. Copy the full token (starts with 'pat-')

### For Private App Access Token:
1. Go to HubSpot Settings > Integrations > Private Apps  
2. Create or select a private app
3. Go to the "Auth" tab
4. Copy the Access Token (no 'pat-' prefix)
5. Ensure the app has the required scopes:
   - crm.objects.contacts.read
   - crm.objects.companies.read

## Current Implementation
- Both key types use Bearer authentication
- System will work with either Personal Access Keys or Private App tokens
- Apollo search increased to 100 results ✓

## Next Steps
1. Wait for deployment to complete (1-2 minutes)
2. Check Render logs for the debug output
3. Based on key format shown in logs, verify it matches what's in HubSpot
4. If needed, update the HUBSPOT_API_KEY in Render environment variables
