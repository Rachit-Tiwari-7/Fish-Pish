import axios from 'axios';

// URLHaus is a free service from abuse.ch that doesn't require an API key for lookups
export async function checkURLHaus(url: string) {
  try {
    const response = await axios.post(
      'https://urlhaus-api.abuse.ch/v1/url/',
      new URLSearchParams({ url }), // Send as form-urlencoded
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    const data = response.data;
    
    // Check if query status is 'ok' AND url_status is 'online' (active threat)
    if (data.query_status === 'ok' && data.url_status === 'online') {
      return {
        matches: true,
        details: {
          url_status: data.url_status,
          threat: data.threat,
          tags: data.tags,
          date_added: data.date_added
        }
      };
    }
    
    return { matches: false };
  } catch (error: any) {
    // If we get a 404, it means the URL is not in their database (which is good/safe)
    // If we get a 401 Unauthorized, it means URLHaus might have started enforcing keys or blocking this UA
    if (error.response && error.response.status === 404) {
         return { matches: false };
    }
    
    // Log error but don't crash the whole analysis
    // console.error('URLHaus Warning:', error.message);
    return { matches: false, error: true };
  }
}
