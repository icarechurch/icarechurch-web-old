import type { ChurchInfo } from "@/domains/church-info/model/church-info.types";
import seoConfig from "./seo-config.json";

const LEGACY_NAME = "I Care Fellowship";

export function createChurchStructuredData(churchInfo: ChurchInfo | null) {
  const hasAddress = Boolean(
    churchInfo?.address ||
      churchInfo?.city ||
      churchInfo?.state ||
      churchInfo?.zip,
  );
  const address = hasAddress
    ? {
        "@type": "PostalAddress",
        ...(churchInfo?.address ? { streetAddress: churchInfo.address } : {}),
        ...(churchInfo?.city ? { addressLocality: churchInfo.city } : {}),
        ...(churchInfo?.state ? { addressRegion: churchInfo.state } : {}),
        ...(churchInfo?.zip ? { postalCode: churchInfo.zip } : {}),
        addressCountry: "PH",
      }
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Church",
    "@id": `${seoConfig.siteUrl}/#church`,
    name: seoConfig.brandName,
    alternateName: LEGACY_NAME,
    url: `${seoConfig.siteUrl}/`,
    logo: `${seoConfig.siteUrl}${seoConfig.socialImagePath.replaceAll(" ", "%20")}`,
    image: `${seoConfig.siteUrl}/during%20worship%202.jpeg`,
    areaServed: { "@type": "City", name: "Olongapo City" },
    ...(churchInfo?.phone ? { telephone: churchInfo.phone } : {}),
    ...(churchInfo?.email ? { email: churchInfo.email } : {}),
    ...(address ? { address } : {}),
  };
}
