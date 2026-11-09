/** Storage key for the theme choice — keep in sync with the pre-paint script in index.html. */
export const THEME_STORAGE_KEY = 'job-portal-theme'

/** Base URL of the Spring Cloud API gateway — every service call goes through it. */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
