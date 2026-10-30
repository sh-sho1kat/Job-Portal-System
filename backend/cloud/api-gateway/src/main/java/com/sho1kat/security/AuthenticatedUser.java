package com.sho1kat.security;

/**
 * The verified identity carried by an accepted access token.
 *
 * Decoded from the JWT claims user-service writes:
 *   "sub"   -> id (string-encoded user id)
 *   "email" -> email
 *   "role"  -> role (UserRole enum name, already carrying the ROLE_ prefix,
 *              e.g. ROLE_ADMIN / ROLE_EMPLOYER / ROLE_JOB_SEEKER / ROLE_SUPER_ADMIN)
 *
 * Mirrors user-service's com.sho1kat.security.AuthenticatedUser, which uses the
 * UserRole enum; the gateway keeps the role as a string so the record can be used
 * by every filter without dragging business classes into the gateway.
 */
public record AuthenticatedUser(Long id, String email, String role) {
}
