package com.sho1kat.util;

/**
 * URL-friendly slug building shared by the microservices.
 *
 * The "-2, -3, ..." uniqueness suffixing stays in each service's mapper/impl
 * because it needs that service's own repository to check collisions.
 */
public final class SlugUtils {

    private SlugUtils() {
    }

    /**
     * Turns "Senior Java Developer" into "senior-java-developer" (trimmed, lowercased,
     * non-alphanumerics collapsed to dashes). {@code fallback} is returned when the
     * slugified result is blank (e.g. an all-symbol title); callers conventionally
     * pass the singular entity name ("job", "company", "skill", ...).
     */
    public static String slugify(String value, String fallback) {
        String slug = value.trim().toLowerCase()
                .replace("'", "")
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");
        return slug.isBlank() ? fallback : slug;
    }
}
