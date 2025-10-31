/**
 * Get the site name from the current domain or environment
 * This function extracts the domain name and formats it as a site title
 */
export function getSiteName(): string {
  // Check for custom site name in environment variables first
  const customSiteName = process.env.NEXT_PUBLIC_SITE_NAME;
  if (customSiteName) {
    return customSiteName;
  }

  // Check if we're in a browser environment
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;

    // Handle localhost and development
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "Stream CMS"; // Fallback for development
    }

    // Extract domain name and format it
    return formatDomainToSiteName(hostname);
  }

  // Server-side: Check environment variables or headers
  const domain =
    process.env.NEXT_PUBLIC_SITE_DOMAIN ||
    process.env.VERCEL_URL ||
    "localhost";

  return formatDomainToSiteName(domain);
}

/**
 * Format a domain name into a readable site name
 * Examples:
 * - example.com -> "Example"
 * - my-streaming-site.com -> "My Streaming Site"
 * - stream-cms.vercel.app -> "Stream CMS"
 */
function formatDomainToSiteName(domain: string): string {
  // Remove protocol if present
  domain = domain.replace(/^https?:\/\//, "");

  // Remove www. if present
  domain = domain.replace(/^www\./, "");

  // Remove port if present
  domain = domain.split(":")[0];

  // Get the main domain (remove subdomains for common hosting services)
  if (
    domain.includes(".vercel.app") ||
    domain.includes(".netlify.app") ||
    domain.includes(".github.io")
  ) {
    const subdomain = domain.split(".")[0];
    domain = subdomain;
  } else {
    // For regular domains, take the part before the TLD
    const parts = domain.split(".");
    if (parts.length > 1) {
      domain = parts[0];
    }
  }

  // Convert kebab-case or snake_case to Title Case
  const siteName = domain
    .replace(/[-_]/g, " ") // Replace hyphens and underscores with spaces
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  // Fallback if processing results in empty string
  return siteName || "Stream CMS";
}

/**
 * Get site name for server-side rendering with request headers
 */
export function getSiteNameFromHeaders(host?: string): string {
  if (!host) {
    return getSiteName();
  }

  return formatDomainToSiteName(host);
}
