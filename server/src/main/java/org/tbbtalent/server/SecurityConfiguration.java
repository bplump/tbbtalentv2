package org.tbbtalent.server;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.BeanIds;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.tbbtalent.server.security.*;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(
        securedEnabled = true,
        jsr250Enabled = true,
        prePostEnabled = true)
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {

    @Autowired
    private Environment env;

    @Autowired
    private CandidateUserDetailsService userDetailsService;

    @Autowired
    private JwtAuthenticationEntryPoint unauthorizedHandler;

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .exceptionHandling()
                .authenticationEntryPoint(unauthorizedHandler)
                .and()
            .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .and()
            .authorizeRequests()
                .antMatchers("/backend/jobseeker").permitAll()
                .antMatchers("/api/portal/auth").permitAll()
                .antMatchers("/api/portal/auth/**").permitAll()
                .antMatchers("/api/portal/user/reset-password-email").permitAll()
                .antMatchers("/api/portal/user/check-token").permitAll()
                .antMatchers("/api/portal/user/reset-password").permitAll()
                .antMatchers("/api/portal/language/system/**").permitAll()
                .antMatchers("/api/portal/language/translations/**").permitAll()
                .antMatchers("/api/portal/**").hasAnyRole("USER")
                .antMatchers("/api/admin/auth").permitAll()
                .antMatchers("/api/admin/auth/**").permitAll()

                // ADMIN ONLY RESTRICTIONS
                    // Migrate database
                .antMatchers("/api/admin/system/migrate").hasAnyRole("ADMIN")
                    // ALL DELETE end points
                .antMatchers(HttpMethod.DELETE, "/api/admin/**/*").hasRole("ADMIN")
                    // UPDATE/EDIT general settings
                .antMatchers(HttpMethod.PUT,
                        "/api/admin/user/*",
                        "/api/admin/country/*",
                        "/api/admin/nationality/*",
                        "/api/admin/language/*",
                        "/api/admin/language-level/*",
                        "/api/admin/occupation/*",
                        "/api/admin/education-level/*",
                        "/api/admin/education-major/*",
                        "/api/admin/translation/*",
                        "/api/admin/translation/file/*").hasRole("ADMIN")
                    // CREATE general settings
                .antMatchers(HttpMethod.POST,
                        "/api/admin/user",
                        "/api/admin/country",
                        "/api/admin/nationality",
                        "/api/admin/language",
                        "/api/admin/language-level",
                        "/api/admin/occupation",
                        "/api/admin/education-level",
                        "/api/admin/education-major").hasRole("ADMIN")

                // ADMIN/SOURCE PARTNER ADMIN ONLY - see candidate file attachments
                .antMatchers(HttpMethod.POST, "/api/admin/candidate-attachment/search").hasAnyRole("ADMIN", "SOURCEPARTNERADMIN")

                // ALL OTHER END POINTS
                    // POST
                .antMatchers(HttpMethod.POST, "/api/admin/**").hasAnyRole("ADMIN", "SOURCEPARTNERADMIN", "SEMILIMITED", "LIMITED")

                    // PUT
                .antMatchers(HttpMethod.PUT, "/api/admin/**").hasAnyRole("ADMIN", "SOURCEPARTNERADMIN", "SEMILIMITED", "LIMITED")

                    // GET
                .antMatchers(HttpMethod.GET, "/api/admin/**").hasAnyRole("ADMIN", "SOURCEPARTNERADMIN", "SEMILIMITED", "LIMITED")

                .and()
            .csrf().disable()
            .requiresChannel().requestMatchers( r -> r.getHeader("X-Forwarded-Proto") != null).requiresSecure()

        ;

        // Add the JWT security filter
        http.addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
        http.addFilterAfter(languageFilter(), UsernamePasswordAuthenticationFilter.class);
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter();
    }

    @Bean
    public LanguageFilter languageFilter() {
        return new LanguageFilter();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean(name = BeanIds.AUTHENTICATION_MANAGER)
    @Override
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.authenticationProvider(userAuthenticationProvider());
    }

    private TbbAuthenticationProvider userAuthenticationProvider() {
        TbbAuthenticationProvider tbbAuthenticationProvider = new TbbAuthenticationProvider(userDetailsService);
        tbbAuthenticationProvider.setPasswordEncoder(passwordEncoder());
        return tbbAuthenticationProvider;
    }

}
