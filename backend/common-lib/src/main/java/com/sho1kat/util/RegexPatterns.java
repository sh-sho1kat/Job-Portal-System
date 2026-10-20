package com.sho1kat.util;

import lombok.NoArgsConstructor;

@NoArgsConstructor
public final class RegexPatterns {

    public static final String EMAIL_REGEX = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$";
    public static final String PASSWORD_REGEX = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\\S+$).{8,}$";
    public static final String PHONE_NUMBER_REGEX = "^\\+?[1-9]\\d{1,14}$";
    public static final String HTTP_URL = "^https?://\\S+$";
    public static final String SLUG_REGEX = "^[a-z0-9]+(?:-[a-z0-9]+)*$";

}
