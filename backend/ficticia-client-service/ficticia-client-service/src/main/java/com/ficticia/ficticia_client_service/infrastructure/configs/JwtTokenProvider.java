package com.ficticia.ficticia_client_service.infrastructure.configs;

import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

/**
 * Utility component responsible for issuing and validating JWT tokens.
 */
@Component
public class JwtTokenProvider {

    private final byte[] secretKey;
    private final long expirationMillis;

    /**
     * Builds a {@link JwtTokenProvider} using configuration properties.
     *
     * @param secret           base64 secret used to sign the token
     * @param expirationMillis token validity in milliseconds
     */
    public JwtTokenProvider(
            @Value("${jwt.secret}") final String secret,
            @Value("${jwt.expiration-millis}") final long expirationMillis) {
        this.secretKey = Decoders.BASE64.decode(secret);
        this.expirationMillis = expirationMillis;
    }

    /**
     * Generates a signed JWT containing the username and granted roles.
     *
     * @param username    authenticated username
     * @param authorities authorities granted to the user
     * @return signed JWT token
     */
    public String generateToken(final String username,
                                final Collection<? extends GrantedAuthority> authorities) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMillis);
        List<String> roles = authorities.stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .claim("roles", roles)
                .signWith(Keys.hmacShaKeyFor(secretKey), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Retrieves the username stored as subject in the provided token.
     *
     * @param token raw JWT token
     * @return username
     */
    public String getUsernameFromToken(final String token) {
        return parseClaims(token).getBody().getSubject();
    }

    /**
     * Validates the JWT signature and expiration date.
     *
     * @param token raw JWT token
     * @return {@code true} when the token is valid
     */
    public boolean validateToken(final String token) {
        try {
            parseClaims(token);
            return true;
        } catch (RuntimeException ex) {
            return false;
        }
    }

    private Jws<Claims> parseClaims(final String token) {
        return Jwts.parserBuilder()
                .setSigningKey(Keys.hmacShaKeyFor(secretKey))
                .build()
                .parseClaimsJws(token);
    }
}
