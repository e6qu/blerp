interface ParsedUA {
  browser: string;
  os: string;
  device: string;
}

export function parseUserAgent(ua: string | undefined): ParsedUA {
  if (!ua) return { browser: "Unknown", os: "Unknown", device: "Desktop" };

  let browser = "Unknown";
  let os = "Unknown";
  let device = "Desktop";

  // Browser detection
  if (ua.includes("Firefox/")) {
    browser = "Firefox";
  } else if (ua.includes("Edg/")) {
    browser = "Edge";
  } else if (ua.includes("Chrome/")) {
    browser = "Chrome";
  } else if (ua.includes("Safari/") && !ua.includes("Chrome")) {
    browser = "Safari";
  } else if (ua.includes("Opera") || ua.includes("OPR/")) {
    browser = "Opera";
  }

  // OS detection
  if (ua.includes("Windows")) {
    os = "Windows";
  } else if (ua.includes("Mac OS X") || ua.includes("Macintosh")) {
    os = "macOS";
  } else if (ua.includes("Linux") && !ua.includes("Android")) {
    os = "Linux";
  } else if (ua.includes("Android")) {
    os = "Android";
    device = "Mobile";
  } else if (ua.includes("iPhone") || ua.includes("iPad")) {
    os = "iOS";
    device = ua.includes("iPad") ? "Tablet" : "Mobile";
  }

  return { browser, os, device };
}
