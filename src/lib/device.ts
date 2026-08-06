export interface DeviceInfo {
  deviceType: string;
  browser: string;
  os: string;
  ipAddress: string;
  location: string;
}

export function detectDevice(): DeviceInfo {
  if (typeof navigator === "undefined") {
    return { deviceType: "Unknown", browser: "Unknown", os: "Unknown", ipAddress: "Unknown", location: "Unknown" };
  }

  const ua = navigator.userAgent;

  const deviceType = (() => {
    if (/iPad|Tablet|PlayBook|Silk/i.test(ua)) return "Tablet";
    if (/Mobile|iPhone|Android.*Mobile|Windows Phone|BlackBerry|Opera Mini/i.test(ua)) return "Phone";
    return "PC";
  })();

  const browser = (() => {
    if (/Edg\/|Edge\//i.test(ua)) return "Microsoft Edge";
    if (/OPR\/|Opera/i.test(ua)) return "Opera";
    if (/Chrome\/|Chromium/i.test(ua) && !/Edg/i.test(ua)) return "Google Chrome";
    if (/Firefox\/|FxiOS/i.test(ua)) return "Mozilla Firefox";
    if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) return "Safari";
    return "Unknown browser";
  })();

  const os = (() => {
    if (/Windows NT 10/i.test(ua)) return "Windows 10/11";
    if (/Windows NT 6\.3/i.test(ua)) return "Windows 8.1";
    if (/Windows NT 6\.1/i.test(ua)) return "Windows 7";
    if (/Windows/i.test(ua)) return "Windows";
    if (/Android/i.test(ua)) return "Android";
    if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
    if (/Mac OS X/i.test(ua)) return "macOS";
    if (/Linux/i.test(ua)) return "Linux";
    if (/CrOS/i.test(ua)) return "Chrome OS";
    return "Unknown OS";
  })();

  const screenWidth = typeof screen !== "undefined" ? screen.width : 0;
  const screenHeight = typeof screen !== "undefined" ? screen.height : 0;

  const ipAddress = "Local network";
  const location = `${screenWidth}×${screenHeight} · ${Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown timezone"}`;

  return { deviceType, browser, os, ipAddress, location };
}
