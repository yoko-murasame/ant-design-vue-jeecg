FROM nginx
MAINTAINER YOKO

ENV LANG en_US.UTF-8

# APP端口(1pc端,2移动端)
ENV APP_1_PORT 80
ENV APP_2_PORT 8888
# APP目录
ENV APP_1_PATH /var/www/html/
ENV APP_2_PATH /var/www/custom/

# 接口主机名orIP(一般写服务器对外域名orIP)
ENV API_HOST www.abc.com
# 接口上下文路径
ENV API_CONTEXT_PATH jeecg-boot
# 接口代理地址（注意末尾的/）
ENV API_PROXY_PASS http://127.0.0.1:8080/jeecg-boot/
# 网关代理后的路径（会影响流程设计器等jsp页面）
ENV API_GATEWAY_PROXY_PATH_APP_1 http://$API_HOST:$APP_1_PORT/$API_CONTEXT_PATH/
ENV API_GATEWAY_PROXY_PATH_APP_2 http://$API_HOST:$APP_2_PORT/$API_CONTEXT_PATH/

# 超图服务-上下文路径
ENV SUPERMAP_CONTEXT_PATH iserver
# 超图服务-接口代理地址
ENV SUPERMAP_PROXY_PASS http://127.0.0.1:8090/iserver/

# html为默认的dist输出应用入口；custom为外部映射目录
RUN mkdir -p $APP_1_PATH $APP_2_PATH
# 可选，不挂载目录时，直接打包进容器
#ADD dist/ $APP_1_PATH
#ADD dist2/ $APP_2_PATH

# 端口放行
EXPOSE $APP_1_PORT
EXPOSE $APP_2_PORT
# 目录挂载
VOLUME $APP_1_PATH
VOLUME $APP_2_PATH

CMD echo \
      "server {  \
                  listen $APP_1_PORT; \
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
                      proxy_set_header        Host $API_HOST:$APP_1_PORT; \
                      proxy_set_header        API-GATEWAY-PROXY-PATH $API_GATEWAY_PROXY_PATH_APP_1; \
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
                      root   $APP_1_PATH; \
                      index  index.html index.htm; \
                      try_files \$uri \$uri/ /index.html; \
                  } \
                  access_log  /var/log/nginx/access-app-1.log ; \
              } " > /etc/nginx/conf.d/default.conf \
    && echo \
          "server { \
                listen $APP_2_PORT; \
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
                    root   $APP_2_PATH; \
                    index  index.html index.htm; \
                    try_files \$uri \$uri/ /index.html; \
                } \
                location ^~ /$API_CONTEXT_PATH/ { \
                    proxy_pass $API_PROXY_PASS; \
                    proxy_set_header Host $API_HOST:$APP_2_PORT; \
                    proxy_set_header API-GATEWAY-PROXY-PATH $API_GATEWAY_PROXY_PATH_APP_2; \
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
                access_log  /var/log/nginx/access-app-2.log ; \
          }" \
    > /etc/nginx/conf.d/custom.conf && \
    cat /etc/nginx/conf.d/default.conf && \
    cat /etc/nginx/conf.d/custom.conf && \
    nginx -t && \
    nginx -g "daemon off;";
