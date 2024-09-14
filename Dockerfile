FROM nginx
MAINTAINER YOKO

ENV LANG en_US.UTF-8

# 主机名orIP(一般写服务器对外域名orIP)
ENV APP_HOST_NAME www.abc.com

# APP端口(1pc端,2移动端)
ENV APP_1_PORT 80
ENV APP_2_PORT 8888
# APP目录
ENV APP_1_PATH /var/www/html/
ENV APP_2_PATH /var/www/custom/
# SSL目录
ENV SSL_PATH /var/ssl/

# 接口上下文路径
ENV API_CONTEXT_PATH jeecg-boot
# 接口代理地址（注意末尾的/）
ENV API_PROXY_PASS http://127.0.0.1:8080/jeecg-boot/
# 网关代理后的路径（会影响流程设计器等jsp页面）
ENV API_GATEWAY_PROXY_PATH_APP_1 http://$APP_HOST_NAME:$APP_1_PORT/$API_CONTEXT_PATH/
ENV API_GATEWAY_PROXY_PATH_APP_2 http://$APP_HOST_NAME:$APP_2_PORT/$API_CONTEXT_PATH/

# 超图服务-上下文路径
ENV SUPERMAP_CONTEXT_PATH iserver
# 超图服务-接口代理地址
ENV SUPERMAP_PROXY_PASS http://127.0.0.1:8090/iserver/

# html为默认的dist输出应用入口；custom为外部映射目录
RUN mkdir -p $APP_1_PATH $APP_2_PATH $SSL_PATH
# 可选，不挂载目录时，直接打包进容器
#ADD dist/ $APP_1_PATH
#ADD dist2/ $APP_2_PATH
#ADD ssl/ $SSL_PATH

# 端口放行
EXPOSE $APP_1_PORT
EXPOSE $APP_2_PORT
# 目录挂载
VOLUME $APP_1_PATH
VOLUME $APP_2_PATH
VOLUME $SSL_PATH

CMD echo \
      "server {  \
          listen $APP_1_PORT; \
          server_name $APP_HOST_NAME; \
          # ssl证书配置 \
          # server_name $APP_HOST_NAME ssl; \
          # ssl_certificate /etc/nginx/ssl/aa.bb.com.pem; \
          # ssl_certificate_key /etc/nginx/ssl/aa.bb.com.key; \
          # ssl安全配置 \
          # ssl_session_timeout 5m; # 设置 SSL 会话的超时时间 \
          # ssl_session_cache shared:MozSSL:10m; # 在共享内存中分配 10MB 用于缓存 SSL 会话 \
          # ssl_session_tickets off; # 禁用 SSL 会话票据 \
          # ssl_protocols    TLSv1.2 TLSv1.3; # 只允许使用 TLS 1.2 和 TLS 1.3 协议，禁用了较旧且不安全的版本（如 TLS 1.0 和 TLS 1.1） \
          # ssl_prefer_server_ciphers off; # 不优先使用服务器端的首选算法，允许客户端选择密码套件。通常，客户端会选择它支持的最强密码套件。 \
          # ssl_ciphers HIGH:!NULL:!aNULL:!MD5:!DES:!3DES; # 加密算法，在使用服务器端的首选算法时配置 \
          # error_page 497 301 https://$APP_HOST_NAME:$APP_1_PORT\$request_uri; #http重定向刀https \
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
          # 超图代理 \
          location ^~ /$SUPERMAP_CONTEXT_PATH/ { \
              proxy_pass              $SUPERMAP_PROXY_PASS; \
              # 有时候别人的网关会有Refer、Origin的校验，可以在这里去伪装 \
              proxy_hide_header         Referer; \
              proxy_set_header          Origin $SUPERMAP_PROXY_PASS; \
              # Host头也经常会影响到代理 \
              # proxy_set_header        Host \$host; \
              proxy_set_header        X-Real-IP \$remote_addr; \
              proxy_set_header        X-Forwarded-For \$proxy_add_x_forwarded_for; \
          } \
          # 后端接口 \
          location ^~ /$API_CONTEXT_PATH/ { \
              proxy_pass              $API_PROXY_PASS; \
              proxy_set_header        Host $APP_HOST_NAME:$APP_1_PORT; \
              proxy_set_header        API-GATEWAY-PROXY-PATH $API_GATEWAY_PROXY_PATH_APP_1; \
              proxy_set_header        X-Real-IP \$remote_addr; \
              proxy_set_header        X-Forwarded-For \$proxy_add_x_forwarded_for; \
              proxy_http_version 1.1; \
              proxy_set_header Upgrade \$http_upgrade; \
              proxy_set_header Connection 'upgrade'; \
              proxy_connect_timeout 60s; \
              proxy_read_timeout 7200s; \
              proxy_send_timeout 60s; \
              # 下面配置在反代到某些https网址，包含重定向等规则时使用 \
              # proxy_redirect off; # proxy_redirect http://backend_server http://frontend_server; 将上游服务器返回的 Location 头部中的 URL 从 http://backend_server 替换为 http://frontend_server \
              # proxy_ssl_server_name on; # 启用 SNI \
              # proxy_ssl_name backend_server; # 可选：指定上游服务器的名称 \
              # sub_filter cloud.sakurasep.club \$server_name; # 修改服务器返回给客户端的 HTML、CSS、JavaScript 等文件的内容 \
              # sub_filter_once off; # 只修改一次 \
          } \
          # 先匹配非子应用，根目录访问 \
          location / { \
              root   $APP_1_PATH; \
              index  index.html index.htm; \
              try_files \$uri \$uri/ \index.html; \
          } \
          # 假设部署目录中有onemap的子应用，登录页重定向到子应用onemap的页面 \
          # location = /sso/login { \
          #     rewrite ^/sso/login\$ /onemap/ permanent; \
          # } \
          # 假设部署目录中有onemap的子应用，重定向根路径到子应用 \
          # location = / { \
          #     return 301 /onemap/; \
          # } \
          # 再匹配子应用，解决Router(mode: 'history')模式下，刷新路由地址不能找到页面的问题 \
          location ~* ^/(.+?)(/.*)?\$ { \
              root   $APP_1_PATH; \
              index  index.html index.htm; \
              #解决动态子应用的刷新问题 \
              set \$base_path /\$1; \
              set \$index_path \$base_path/index.html; \
              try_files \$uri \$uri/ \$index_path; \
          } \
          access_log  /var/log/nginx/access-app-1.log ; \
      } " > /etc/nginx/conf.d/default.conf && echo \
      "server { \
          listen $APP_2_PORT; \
          server_name $APP_HOST_NAME; \
          # ssl证书配置 \
          # server_name $APP_HOST_NAME ssl; \
          # ssl_certificate /etc/nginx/ssl/aa.bb.com.pem; \
          # ssl_certificate_key /etc/nginx/ssl/aa.bb.com.key; \
          # ssl安全配置 \
          # ssl_session_timeout 5m; # 设置 SSL 会话的超时时间 \
          # ssl_session_cache shared:MozSSL:10m; # 在共享内存中分配 10MB 用于缓存 SSL 会话 \
          # ssl_session_tickets off; # 禁用 SSL 会话票据 \
          # ssl_protocols    TLSv1.2 TLSv1.3; # 只允许使用 TLS 1.2 和 TLS 1.3 协议，禁用了较旧且不安全的版本（如 TLS 1.0 和 TLS 1.1） \
          # ssl_prefer_server_ciphers off; # 不优先使用服务器端的首选算法，允许客户端选择密码套件。通常，客户端会选择它支持的最强密码套件。 \
          # ssl_ciphers HIGH:!NULL:!aNULL:!MD5:!DES:!3DES; # 加密算法，在使用服务器端的首选算法时配置 \
          # error_page 497 301 https://$APP_HOST_NAME:$APP_2_PORT\$request_uri; #http重定向刀https \
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
          # 超图代理 \
          location ^~ /$SUPERMAP_CONTEXT_PATH/ { \
              proxy_pass              $SUPERMAP_PROXY_PASS; \
              # 有时候别人的网关会有Refer、Origin的校验，可以在这里去伪装 \
              proxy_hide_header         Referer; \
              proxy_set_header          Origin $SUPERMAP_PROXY_PASS; \
              # Host头也经常会影响到代理 \
              # proxy_set_header        Host \$host; \
              proxy_set_header        X-Real-IP \$remote_addr; \
              proxy_set_header        X-Forwarded-For \$proxy_add_x_forwarded_for; \
          } \
          # 后端接口 \
          location ^~ /$API_CONTEXT_PATH/ { \
              proxy_pass              $API_PROXY_PASS; \
              proxy_set_header        Host $APP_HOST_NAME:$APP_2_PORT; \
              proxy_set_header        API-GATEWAY-PROXY-PATH $API_GATEWAY_PROXY_PATH_APP_2; \
              proxy_set_header        X-Real-IP \$remote_addr; \
              proxy_set_header        X-Forwarded-For \$proxy_add_x_forwarded_for; \
              proxy_http_version 1.1; \
              proxy_set_header Upgrade \$http_upgrade; \
              proxy_set_header Connection 'upgrade'; \
              proxy_connect_timeout 60s; \
              proxy_read_timeout 7200s; \
              proxy_send_timeout 60s; \
              # 下面配置在反代到某些https网址，包含重定向等规则时使用 \
              # proxy_redirect off; # proxy_redirect http://backend_server http://frontend_server; 将上游服务器返回的 Location 头部中的 URL 从 http://backend_server 替换为 http://frontend_server \
              # proxy_ssl_server_name on; # 启用 SNI \
              # proxy_ssl_name backend_server; # 可选：指定上游服务器的名称 \
              # sub_filter cloud.sakurasep.club \$server_name; # 修改服务器返回给客户端的 HTML、CSS、JavaScript 等文件的内容 \
              # sub_filter_once off; # 只修改一次 \
          } \
          # 先匹配非子应用，根目录访问 \
          location / { \
              root   $APP_2_PATH; \
              index  index.html index.htm; \
              try_files \$uri \$uri/ \index.html; \
          } \
          # 假设部署目录中有onemap的子应用，登录页重定向到子应用onemap的页面 \
          # location = /sso/login { \
          #     rewrite ^/sso/login\$ /onemap/ permanent; \
          # } \
          # 假设部署目录中有onemap的子应用，重定向根路径到子应用 \
          # location = / { \
          #     return 301 /onemap/; \
          # } \
          # 再匹配子应用，解决Router(mode: 'history')模式下，刷新路由地址不能找到页面的问题 \
          location ~* ^/(.+?)(/.*)?\$ { \
              root   $APP_2_PATH; \
              index  index.html index.htm; \
              #解决动态子应用的刷新问题 \
              set \$base_path /\$1; \
              set \$index_path \$base_path/index.html; \
              try_files \$uri \$uri/ \$index_path; \
          } \
          access_log  /var/log/nginx/access-app-2.log ; \
      }" \
    > /etc/nginx/conf.d/custom.conf && \
    cat /etc/nginx/conf.d/default.conf && \
    cat /etc/nginx/conf.d/custom.conf && \
    nginx -t && \
    nginx -g "daemon off;";
