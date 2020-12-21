package org.tbbtalent.server.security;

import java.io.IOException;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import org.tbbtalent.server.model.db.User;

/**
 * Sets an authenticated user's selected language based on the X-Language
 * header in the HTTP request.
 * <p/>
 * This matches up with the language.interceptor.ts class on the 
 * browser (Angular) side.
 */
public class LanguageFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(LanguageFilter.class);

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {
        try {
            String selectedLanguage = request.getHeader("X-Language");
            if (StringUtils.isBlank(selectedLanguage)) {
                selectedLanguage = "en";
            }
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null) {
                Object principal = authentication.getPrincipal();
                if (principal instanceof AuthenticatedUser) {
                    User user = ((AuthenticatedUser) principal).getUser();
                    user.setSelectedLanguage(selectedLanguage);
                }
            }

        } catch (Exception ex) {
            logger.error("Could not set user language in security context", ex);
        }

        filterChain.doFilter(request, response);
    }

}
