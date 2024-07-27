FROM nginx
MAINTAINER YOKO
VOLUME /var/www/custom/
ENV LANG en_US.UTF-8

# 接口协议
ENV API_PROTOCOL http
# 接口主机名 or IP
ENV API_HOST jeecg-boot-system
# 接口端口
ENV API_PORT 8080
# 接口上下文路径
ENV API_CONTEXT_PATH jeecg-boot
# 接口代理地址（可以直接复写这个）
ENV API_PROXY_PASS $API_PROTOCOL://$API_HOST:$API_PORT/$API_CONTEXT_PATH/

# 超图服务-上下文路径
ENV SUPERMAP_CONTEXT_PATH iserver
# 超图服务-接口代理地址
ENV SUPERMAP_PROXY_PASS http://127.0.0.1:8090/iserver/

# html为默认的dist输出应用入口；custom为外部映射目录
RUN mkdir  -p  /var/www/html /var/www/custom
ADD dist/ /var/www/html/

# 默认html对应的端口
EXPOSE 80
EXPOSE 443
# 自定义custom对应的端口
EXPOSE 8888

CMD echo \
      "server {  \
                  listen 80; \
                  gzip on; \
                  gzip_static on; \
                  gzip_min_length 1k; \
                  gzip_comp_level 4; \
                  gzip_proxied any; \
                  gzip_types text/plain text/xml text/css; \
                  gzip_vary on; \
                  gzip_disable \"MSIE [1-6]\\.(?!.*SV1)\"; \
                  # add_header Access-Control-Allow-Origin *; \
                  # add_header Access-Control-Allow-Headers X-Requested-With; \
                  # add_header Access-Control-Allow-Methods GET,PUT,POST,DELETE,OPTIONS; \
                  # 在nginx的server中添加 \
                  set \$method \$request_method; \
                  if (\$http_X_HTTP_Method_Override ~* 'DELETE') { \
                    set \$method DELETE; \
                  } \
                  if (\$http_X_HTTP_Method_Override ~* 'PUT') { \
                    set \$method PUT; \
                  } \
                  proxy_method \$method; \
                  # 避免端点安全问题 \
                  if (\$request_uri ~* '/actuator') { \
                    return 403; \
                  } \
                  # 放行options \
                  if (\$method = 'OPTIONS') { \
                    return 204; \
                  } \
                  location ^~ /$API_CONTEXT_PATH/ { \
                      proxy_pass              $API_PROXY_PASS; \
                      proxy_set_header        Host $API_HOST; \
                      proxy_set_header        X-Real-IP \$remote_addr; \
                      proxy_set_header        X-Forwarded-For \$proxy_add_x_forwarded_for; \
                      proxy_http_version 1.1; \
                      proxy_set_header Upgrade \$http_upgrade; \
                      proxy_set_header Connection 'upgrade'; \
                      proxy_connect_timeout 60s; \
                      proxy_read_timeout 7200s; \
                      proxy_send_timeout 60s; \
                  } \
                  location ^~ /$SUPERMAP_CONTEXT_PATH/ { \
                      proxy_pass              $SUPERMAP_PROXY_PASS; \
                      proxy_set_header        X-Real-IP \$remote_addr; \
                      proxy_set_header        X-Forwarded-For \$proxy_add_x_forwarded_for; \
                  } \
                  #解决Router(mode: 'history')模式下，刷新路由地址不能找到页面的问题 \
                  location / { \
                     root   /var/www/html/; \
                      index  index.html index.htm; \
                      if (!-e \$request_filename) { \
                          rewrite ^(.*)\$ /index.html?s=\$1 last; \
                          break; \
                      } \
                  } \
                  access_log  /var/log/nginx/access.log ; \
              } " > /etc/nginx/conf.d/default.conf \
    && echo \
          "server { \
                listen 8888; \
                server_name localhost; \
                #index index.php index.html index.htm default.php default.htm default.html; \
                gzip on; \
                gzip_static on; \
                gzip_min_length 1k; \
                gzip_comp_level 4; \
                gzip_proxied any; \
                gzip_types text/plain text/xml text/css; \
                gzip_vary on; \
                gzip_disable \"MSIE [1-6]\\.(?!.*SV1)\"; \
                # add_header Access-Control-Allow-Origin *; \
                # add_header Access-Control-Allow-Headers X-Requested-With; \
                # add_header Access-Control-Allow-Methods GET,PUT,POST,DELETE,OPTIONS; \
                # 在nginx的server中添加 \
                set \$method \$request_method; \
                if (\$http_X_HTTP_Method_Override ~* 'DELETE') { \
                  set \$method DELETE; \
                } \
                if (\$http_X_HTTP_Method_Override ~* 'PUT') { \
                  set \$method PUT; \
                } \
                proxy_method \$method; \
                # 避免端点安全问题 \
                if (\$request_uri ~* '/actuator') { \
                  return 403; \
                } \
                # 放行options \
                if (\$method = 'OPTIONS') { \
                  return 204; \
                } \
                #解决Router(mode: 'history')模式下，刷新路由地址不能找到页面的问题 \
                location / { \
                   root   /var/www/custom/; \
                    index  index.html index.htm; \
                    if (!-e \$request_filename) { \
                        rewrite ^(.*)\$ /index.html?s=\$1 last; \
                        break; \
                    } \
                } \
                location ^~ /$API_CONTEXT_PATH/ { \
                  proxy_pass $API_PROXY_PASS; \
                  proxy_set_header Host $API_HOST; \
                  proxy_set_header X-Real-IP \$remote_addr; \
                  proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for; \
                  proxy_http_version 1.1; \
                  proxy_set_header Upgrade \$http_upgrade; \
                  proxy_set_header Connection 'upgrade'; \
                  proxy_connect_timeout 60s; \
                  proxy_read_timeout 7200s; \
                  proxy_send_timeout 60s; \
                } \
                location ^~ /$SUPERMAP_CONTEXT_PATH/ { \
                  proxy_pass              $SUPERMAP_PROXY_PASS; \
                  proxy_set_header        X-Real-IP \$remote_addr; \
                  proxy_set_header        X-Forwarded-For \$proxy_add_x_forwarded_for; \
                } \
                access_log  /var/log/nginx/access-custom.log ; \
          }" \
    > /etc/nginx/conf.d/custom.conf && \
    cat /etc/nginx/conf.d/default.conf && \
    cat /etc/nginx/conf.d/custom.conf && \
    nginx -t && \
    nginx -g "daemon off;";
