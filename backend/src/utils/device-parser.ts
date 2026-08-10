import UAParser from 'ua-parser-js';

export interface ParsedDevice {
  deviceType: string; // 'mobile' | 'tablet' | 'desktop' | 'bot' | 'unknown'
  browser: string;
  operatingSystem: string;
}

// Parses a User-Agent string into coarse, analytics-friendly buckets.
export function parseUserAgent(userAgent: string | undefined): ParsedDevice {
  if (!userAgent) {
    return { deviceType: 'unknown', browser: 'Unknown', operatingSystem: 'Unknown' };
  }

  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  const rawType = result.device.type; // 'mobile' | 'tablet' | undefined for desktop
  let deviceType: string;
  if (rawType === 'mobile' || rawType === 'tablet') {
    deviceType = rawType;
  } else if (/bot|crawler|spider|crawling/i.test(userAgent)) {
    deviceType = 'bot';
  } else {
    deviceType = 'desktop';
  }

  return {
    deviceType,
    browser: result.browser.name ?? 'Unknown',
    operatingSystem: result.os.name ?? 'Unknown',
  };
}
