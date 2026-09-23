package com.expensetracker.backend.auth;

import com.expensetracker.backend.user.User;
import com.nimbusds.jose.jwk.source.ImmutableSecret;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    private static final String SECRET = "test-secret-at-least-32-bytes-long!!";

    private JwtService jwtService;
    private JwtDecoder jwtDecoder;

    @BeforeEach
    void setUp() {
        SecretKey secretKey = new SecretKeySpec(SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        JwtEncoder jwtEncoder = new NimbusJwtEncoder(new ImmutableSecret<>(secretKey));
        jwtDecoder = NimbusJwtDecoder.withSecretKey(secretKey)
                .macAlgorithm(MacAlgorithm.HS256)
                .build();

        JwtProperties jwtProperties = new JwtProperties(SECRET, Duration.ofHours(24), "https://expense-tracker");
        jwtService = new JwtService(jwtEncoder, jwtProperties);
    }

    @Test
    void generateToken_producesDecodableTokenWithExpectedClaims() throws Exception {
        User user = newUser(42L, "Test User", "test@example.com");

        String token = jwtService.generateToken(user);
        Jwt decoded = jwtDecoder.decode(token);

        assertThat(decoded.getSubject()).isEqualTo("42");
        assertThat(decoded.getClaimAsString("email")).isEqualTo("test@example.com");
        assertThat(decoded.getClaimAsString("name")).isEqualTo("Test User");
        assertThat(decoded.getIssuer().toString()).isEqualTo("https://expense-tracker");
        assertThat(decoded.getExpiresAt()).isAfter(decoded.getIssuedAt());
    }

    /**
     * Sets the id via reflection, since it is normally assigned by JPA on persist
     * and there is no public setter.
     */
    private User newUser(Long id, String name, String email) throws Exception {
        User user = new User(name, email, "hash");
        var idField = User.class.getDeclaredField("id");
        idField.setAccessible(true);
        idField.set(user, id);
        return user;
    }
}
