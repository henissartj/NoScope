export interface GeoIPInfo {
  country: string;
  city: string;
  isp: string;
  lat: number;
  lon: number;
  threatLevel?: 'Safe' | 'Suspicious' | 'Malicious';
}

export const getGeoIP = async (ip: string): Promise<GeoIPInfo | null> => {
  try {
    // We use ip-api.com for free GeoIP without API key.
    // It's rate-limited to 45 req/min, which is enough for our needs.
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,city,isp,lat,lon,query`);
    const data = await res.json();
    
    if (data.status === 'success') {
      // Simulate Threat Intelligence based on known malicious ISPs or regions (mock logic for demonstration)
      // In a real scenario, you'd call VirusTotal API here
      let threatLevel: GeoIPInfo['threatLevel'] = 'Safe';
      
      // Arbitrary mock threat intel logic for demonstration purposes:
      if (['Russia', 'China', 'North Korea', 'Iran'].includes(data.country)) {
        threatLevel = 'Suspicious';
      }
      if (data.isp.toLowerCase().includes('tor') || data.isp.toLowerCase().includes('vpn')) {
        threatLevel = 'Malicious';
      }

      return {
        country: data.country,
        city: data.city,
        isp: data.isp,
        lat: data.lat,
        lon: data.lon,
        threatLevel
      };
    }
    return null;
  } catch (error) {
    console.error('GeoIP lookup failed', error);
    return null;
  }
};
