package com.ficticia.ficticia_client_service.application.services;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import com.ficticia.ficticia_client_service.api.dtos.LoginRequest;
import com.ficticia.ficticia_client_service.api.dtos.LoginResponse;
import com.ficticia.ficticia_client_service.api.dtos.RegisterRequest;
import com.ficticia.ficticia_client_service.api.dtos.RegisterResponse;
import com.ficticia.ficticia_client_service.api.exception.BusinessException;
import com.ficticia.ficticia_client_service.application.services.impl.AuthServiceImpl;
import com.ficticia.ficticia_client_service.infrastructure.configs.JwtTokenProvider;
import com.ficticia.ficticia_client_service.infrastructure.entities.RoleEntity;
import com.ficticia.ficticia_client_service.infrastructure.entities.UserEntity;
import com.ficticia.ficticia_client_service.infrastructure.repositories.RoleRepository;
import com.ficticia.ficticia_client_service.infrastructure.repositories.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Unit tests for {@link AuthServiceImpl}.
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthServiceImpl authService;

    private LoginRequest loginRequest;
    private RegisterRequest registerRequest;

    @BeforeEach
    void setUp() {
        loginRequest = new LoginRequest();
        loginRequest.setUsername("User01");
        loginRequest.setPassword("Secret123");
        registerRequest = RegisterRequest.builder()
                .fullName("User Test")
                .employeeId("EMP-77")
                .username("John.Doe")
                .email("John.Doe@corp.com")
                .password("Secret123")
                .confirmPassword("Secret123")
                .build();
    }

    @Test
    void loginShouldFailWhenRequestIsNull() {
        assertThatThrownBy(() -> authService.login(null))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Credentials");
    }

    @Test
    void loginShouldFailWhenUserNotFound() {
        when(userRepository.findByUsernameIgnoreCase("User01")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(BusinessException.class)
                .hasMessage("Invalid username or password");
    }

    @Test
    void loginShouldFailWhenUserDisabled() {
        UserEntity disabledUser = userEntity(false, "encoded");
        when(userRepository.findByUsernameIgnoreCase("User01")).thenReturn(Optional.of(disabledUser));

        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(BusinessException.class)
                .hasMessage("Invalid username or password");
        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }

    @Test
    void loginShouldFailWhenPasswordDoesNotMatch() {
        UserEntity user = userEntity(true, "encoded");
        when(userRepository.findByUsernameIgnoreCase("User01")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Secret123", "encoded")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(BusinessException.class)
                .hasMessage("Invalid username or password");
        verify(jwtTokenProvider, never()).generateToken(anyString(), anyList());
    }

    @Test
    @SuppressWarnings("unchecked")
    void loginShouldReturnTokenWhenCredentialsValid() {
        RoleEntity role = RoleEntity.builder().id(1L).name("ROLE_ADMIN").build();
        UserEntity user = userEntity(true, "encoded");
        user.getRoles().add(role);
        when(userRepository.findByUsernameIgnoreCase("User01")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Secret123", "encoded")).thenReturn(true);
        when(jwtTokenProvider.generateToken(anyString(), anyList())).thenReturn("jwt-token");

        LoginResponse response = authService.login(loginRequest);

        ArgumentCaptor<String> usernameCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<List> authoritiesCaptor = ArgumentCaptor.forClass(List.class);
        verify(jwtTokenProvider).generateToken(usernameCaptor.capture(), authoritiesCaptor.capture());
        assertThat(usernameCaptor.getValue()).isEqualTo("User01");
        List<?> authorities = authoritiesCaptor.getValue();
        assertThat(authorities).hasSize(1);
        GrantedAuthority authority = (GrantedAuthority) authorities.get(0);
        assertThat(authority.getAuthority()).isEqualTo("ROLE_ADMIN");
        assertThat(response.getUsername()).isEqualTo("User01");
        assertThat(response.getToken()).isEqualTo("jwt-token");
        assertThat(response.getRoles()).containsExactly("ROLE_ADMIN");
    }

    @Test
    void registerShouldFailWhenRequestNull() {
        assertThatThrownBy(() -> authService.register(null))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Registration");
    }

    @Test
    void registerShouldFailWhenUsernameAlreadyExists() {
        when(userRepository.findByUsernameIgnoreCase("John.Doe")).thenReturn(Optional.of(new UserEntity()));

        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Username already in use");
    }

    @Test
    void registerShouldFailWhenEmailAlreadyExists() {
        when(userRepository.findByUsernameIgnoreCase("John.Doe")).thenReturn(Optional.empty());
        when(userRepository.findByEmailIgnoreCase("John.Doe@corp.com")).thenReturn(Optional.of(new UserEntity()));

        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Email already in use");
    }

    @Test
    void registerShouldFailWhenPasswordsDoNotMatch() {
        when(userRepository.findByUsernameIgnoreCase("John.Doe")).thenReturn(Optional.empty());
        when(userRepository.findByEmailIgnoreCase("John.Doe@corp.com")).thenReturn(Optional.empty());
        RegisterRequest invalid = RegisterRequest.builder()
                .fullName(registerRequest.getFullName())
                .employeeId(registerRequest.getEmployeeId())
                .username(registerRequest.getUsername())
                .email(registerRequest.getEmail())
                .password(registerRequest.getPassword())
                .confirmPassword("different")
                .build();

        assertThatThrownBy(() -> authService.register(invalid))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Password and confirmation");
    }

    @Test
    void registerShouldFailWhenDefaultRoleMissing() {
        when(userRepository.findByUsernameIgnoreCase("John.Doe")).thenReturn(Optional.empty());
        when(userRepository.findByEmailIgnoreCase("John.Doe@corp.com")).thenReturn(Optional.empty());
        when(roleRepository.findByName("ROLE_USER")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("ROLE_USER");
    }

    @Test
    void registerShouldPersistUserWhenDataValid() {
        RoleEntity defaultRole = RoleEntity.builder().id(99L).name("ROLE_USER").build();
        when(userRepository.findByUsernameIgnoreCase("John.Doe")).thenReturn(Optional.empty());
        when(userRepository.findByEmailIgnoreCase("John.Doe@corp.com")).thenReturn(Optional.empty());
        when(roleRepository.findByName("ROLE_USER")).thenReturn(Optional.of(defaultRole));
        when(passwordEncoder.encode("Secret123")).thenReturn("encoded-pass");
        ArgumentCaptor<UserEntity> captor = ArgumentCaptor.forClass(UserEntity.class);
        UserEntity persisted = userEntity(true, "encoded-pass");
        persisted.setUsername("john.doe");
        persisted.setEmail("john.doe@corp.com");
        persisted.getRoles().add(defaultRole);
        when(userRepository.save(any(UserEntity.class))).thenReturn(persisted);

        RegisterResponse response = authService.register(registerRequest);

        verify(userRepository).save(captor.capture());
        UserEntity savedEntity = captor.getValue();
        assertThat(savedEntity.getUsername()).isEqualTo("john.doe");
        assertThat(savedEntity.getEmail()).isEqualTo("john.doe@corp.com");
        assertThat(savedEntity.getPassword()).isEqualTo("encoded-pass");
        assertThat(savedEntity.getRoles()).contains(defaultRole);
        assertThat(response.getUsername()).isEqualTo("john.doe");
        assertThat(response.getRoles()).containsExactly("ROLE_USER");
        assertThat(response.isEnabled()).isTrue();
        verify(passwordEncoder).encode("Secret123");
    }

    private UserEntity userEntity(final boolean enabled, final String password) {
        return UserEntity.builder()
                .id(1L)
                .username("User01")
                .email("user01@mail.com")
                .password(password)
                .enabled(enabled)
                .build();
    }
}
