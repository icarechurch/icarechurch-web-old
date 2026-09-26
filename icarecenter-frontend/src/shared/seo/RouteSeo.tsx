import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import publicRoutes from "./public-routes.json";
import seoConfig from "./seo-config.json";

const routeMetadata = new Map(
  publicRoutes.map((route) => [route.path, route]),
);

export function RouteSeo() {
  const { pathname } = useLocation();
  const route = routeMetadata.get(pathname);
  const title = route?.title ?? `Page not found | ${seoConfig.brandName}`;
  const description =
    route?.description ?? "The requested page could not be found.";
  const canonicalUrl = `${seoConfig.siteUrl}${route?.path ?? pathname}`;
  const socialImageUrl = `${seoConfig.siteUrl}${seoConfig.socialImagePath.replaceAll(" ", "%20")}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta content={description} name="description" />
      <link href={canonicalUrl} rel="canonical" />
      <meta
        content={route ? "index, follow" : "noindex, nofollow"}
        name="robots"
      />
      <meta content={seoConfig.brandName} property="og:site_name" />
      <meta content={title} property="og:title" />
      <meta content={description} property="og:description" />
      <meta content={canonicalUrl} property="og:url" />
      <meta content="website" property="og:type" />
      <meta content={socialImageUrl} property="og:image" />
      <meta content="summary_large_image" name="twitter:card" />
      <meta content={title} name="twitter:title" />
      <meta content={description} name="twitter:description" />
      <meta content={socialImageUrl} name="twitter:image" />
    </Helmet>
  );
}
