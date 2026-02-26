# ─────────────────────────────────────────────────────────────
#  Elefant — Minimalist Markdown Editor
#  Serves the vanilla HTML/CSS/JS app with nginx on port 8095
# ─────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine

LABEL org.opencontainers.image.title="Elefant"
LABEL org.opencontainers.image.description="Minimalist Markdown Editor"

# Remove default nginx placeholder content
RUN rm -rf /usr/share/nginx/html/*

# Copy app files (only what .dockerignore allows through)
COPY . /usr/share/nginx/html/

# Replace default nginx site config, then remove it from web root
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN rm -f /usr/share/nginx/html/nginx.conf

# Fix permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

EXPOSE 8095

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost:8095/ || exit 1
