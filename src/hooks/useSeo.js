import { useEffect } from "react";

const useSeo = (seoData) => {
  useEffect(() => {
    if (seoData.title) {
      document.title = seoData.title;
    }

    const updateMetaTag = (name, content) => {
      let metaTag = document.querySelector(`meta[name="${name}"]`);
      if (!metaTag) {
        metaTag = document.createElement("meta");
        metaTag.setAttribute("name", name);
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute("content", content);
    };

    const updatePropertyMetaTag = (property, content) => {
      let metaTag = document.querySelector(`meta[property="${property}"]`);
      if (!metaTag) {
        metaTag = document.createElement("meta");
        metaTag.setAttribute("property", property);
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute("content", content);
    };

    if (seoData.description) {
      updateMetaTag("description", seoData.description);
    }

    if (seoData.og) {
      if (seoData.og.title) updatePropertyMetaTag("og:title", seoData.og.title);
      if (seoData.og.description)
        updatePropertyMetaTag("og:description", seoData.og.description);
      if (seoData.og.image) updatePropertyMetaTag("og:image", seoData.og.image);
      if (seoData.og.url) updatePropertyMetaTag("og:url", seoData.og.url);
      if (seoData.og.type) updatePropertyMetaTag("og:type", seoData.og.type);
    }

    if (seoData.twitter) {
      if (seoData.twitter.card)
        updateMetaTag("twitter:card", seoData.twitter.card);
      if (seoData.twitter.title)
        updateMetaTag("twitter:title", seoData.twitter.title);
      if (seoData.twitter.description)
        updateMetaTag("twitter:description", seoData.twitter.description);
      if (seoData.twitter.image)
        updateMetaTag("twitter:image", seoData.twitter.image);
    }

    if (seoData.canonicalUrl) {
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement("link");
        canonicalLink.setAttribute("rel", "canonical");
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute("href", seoData.canonicalUrl);
    }

    return () => {};
  }, [seoData]);
};

export default useSeo;
