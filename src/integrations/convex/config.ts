const productionConvexUrl = 'https://courteous-newt-250.convex.cloud'

export const convexUrl = import.meta.env.DEV
  ? import.meta.env.VITE_CONVEX_URL
  : productionConvexUrl
