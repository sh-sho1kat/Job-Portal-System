package com.sho1kat.util;

import java.security.SecureRandom;

/**
 * Cryptographically random temporary passwords. Always contains at least one
 * uppercase letter, one lowercase letter, one digit and one special character —
 * so generated passwords also satisfy the registration password policy
 * (look-alike chars I/l/1 and O/0 are excluded).
 */
public final class PasswordGenerator {

    private static final String UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    private static final String LOWER = "abcdefghijkmnopqrstuvwxyz";
    private static final String DIGITS = "23456789";
    private static final String SPECIALS = "@$!%*?&";
    private static final SecureRandom RANDOM = new SecureRandom();

    private PasswordGenerator() {
    }

    /** @return a 16-character password with guaranteed character-class coverage. */
    public static String generate() {
        return generate(16);
    }

    public static String generate(int length) {
        if (length < 8) {
            throw new IllegalArgumentException("Password length must be at least 8");
        }
        var password = new StringBuilder(length);
        password.append(pick(UPPER));
        password.append(pick(LOWER));
        password.append(pick(DIGITS));
        password.append(pick(SPECIALS));
        String all = UPPER + LOWER + DIGITS + SPECIALS;
        while (password.length() < length) {
            password.append(pick(all));
        }
        return shuffle(password);
    }

    private static char pick(String characters) {
        return characters.charAt(RANDOM.nextInt(characters.length()));
    }

    /** Fisher–Yates, so the class-guarantee characters aren't always first. */
    private static String shuffle(StringBuilder password) {
        for (int i = password.length() - 1; i > 0; i--) {
            int j = RANDOM.nextInt(i + 1);
            char tmp = password.charAt(i);
            password.setCharAt(i, password.charAt(j));
            password.setCharAt(j, tmp);
        }
        return password.toString();
    }
}
