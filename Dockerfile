FROM nginx
MAINTAINER YOKO

ENV LANG en_US.UTF-8

# 主机名orIP（一般写服务器对外域名orIP）
ENV APP_HOST_NAME www.abc.com
# 访问协议：http / https
ENV APP_PROTOCOL http

# APP端口（默认提供了两个端口用于区分不同环境，默认放开第一个应用的端口和目录映射）
ENV APP_1_PORT 80
ENV APP_2_PORT 8888
# APP目录
ENV APP_1_PATH /var/www/html
ENV APP_2_PATH /var/www/custom
# SSL目录
ENV SSL_PATH /var/ssl
# 自定义的Nginx块配置路径
ENV NGINX_CONF_PATH /var/conf
# 自定义的Nginx location块配置
ENV NGINX_LOCATION_CONF_PATH $NGINX_CONF_PATH/location
# 自定义的Nginx server块配置
ENV NGINX_SERVER_CONF_PATH $NGINX_CONF_PATH/server

# 接口上下文路径
ENV API_CONTEXT_PATH jeecg-boot
# 接口代理地址（注意末尾的/）
ENV API_PROXY_PASS_APP_1 http://127.0.0.1:8080/jeecg-boot/
ENV API_PROXY_PASS_APP_2 http://127.0.0.1:8081/jeecg-boot/
# 网关代理后的路径（会影响流程设计器等jsp页面）
ENV API_GATEWAY_PROXY_PATH_APP_1 $APP_PROTOCOL://$APP_HOST_NAME:$APP_1_PORT/$API_CONTEXT_PATH/
ENV API_GATEWAY_PROXY_PATH_APP_2 $APP_PROTOCOL://$APP_HOST_NAME:$APP_2_PORT/$API_CONTEXT_PATH/

# html为默认的dist输出应用入口；custom为外部映射目录；目录`/etc/nginx/html`的作用是修复带变量的日志保存问题
RUN mkdir -p $APP_1_PATH $APP_2_PATH $SSL_PATH $NGINX_LOCATION_CONF_PATH $NGINX_SERVER_CONF_PATH /etc/nginx/html
# 打包文件-编译文件（可选）
#ADD dist/ $APP_1_PATH
#ADD dist2/ $APP_2_PATH
# 打包文件-证书文件（可选）
#ADD ssl/ $SSL_PATH
# 打包文件-自定义的Nginx配置文件
ADD nginx/ $NGINX_CONF_PATH/
# 以root用户身份启动，防止日志权限问题
RUN sed -i 's/^user  nginx;/user  root;/' /etc/nginx/nginx.conf
# 提供日志分片变量
RUN sed -i '/include \/etc\/nginx\/conf.d\/\*.conf;/i \
map $time_iso8601 $logDate { \
"~^(?<ymd>\\d{4}-\\d{2}-\\d{2})" $ymd; \
    default                       '\''default-date'\''; \
}' /etc/nginx/nginx.conf
# 加载自定义NginxServer块
RUN sed -i "/include \/etc\/nginx\/conf.d\/\*.conf;/a include $NGINX_SERVER_CONF_PATH/*.conf;" /etc/nginx/nginx.conf

# 端口放行-应用端口1
EXPOSE $APP_1_PORT
# 端口放行-应用端口2（可选）
EXPOSE $APP_2_PORT
# 目录挂载-应用路径1
VOLUME $APP_1_PATH
# 目录挂载-应用路径2（可选）
VOLUME $APP_2_PATH
# 目录挂载-证书路径（可选）
VOLUME $SSL_PATH
# 目录挂载-自定义location块配置路径（可选）
VOLUME $NGINX_LOCATION_CONF_PATH
# 目录挂载-自定义server块配置路径（可选）
VOLUME $NGINX_SERVER_CONF_PATH
# 目录挂载-日志（可选）
VOLUME /var/log/nginx

# 启动入口
CMD echo \
      "server {  \
          server_name $APP_HOST_NAME; \
          listen $APP_1_PORT; \
          # # ssl配置-ssl端口 \
          # listen $APP_1_PORT ssl; \
          # # ssl配置-ssl证书，crt和pem都可以 \
          # ssl_certificate $SSL_PATH/$APP_HOST_NAME.pem; \
          # # ssl配置-ssl证书，key \
          # ssl_certificate_key $SSL_PATH/$APP_HOST_NAME.key; \
          # # http重定向到https（务必开启） \
          # error_page 497 https://$APP_HOST_NAME:$APP_1_PORT\$request_uri; \
          # # SSL安全-设置 SSL 会话的超时时间 \
          # ssl_session_timeout 5m; \
          # # SSL安全-在共享内存中分配 10MB 用于缓存 SSL 会话 \
          # ssl_session_cache shared:MozSSL:10m; \
          # # SSL安全-禁用 SSL 会话票据，用于在不使用服务器端会话缓存的情况下恢复 SSL 会话。禁用它可以增加安全性，因为它避免了潜在的票据重用问题 \
          # ssl_session_tickets off; \
          # # SSL安全-只允许使用 TLS 1.2 和 TLS 1.3 协议，禁用了较旧且不安全的版本（如 TLS 1.0 和 TLS 1.1） \
          # ssl_protocols    TLSv1.2 TLSv1.3; \
          # # SSL安全-不优先使用服务器端的首选算法，允许客户端选择密码套件。通常，客户端会选择它支持的最强密码套件。 \
          # ssl_prefer_server_ciphers off; \
          # # SSL安全-加密算法，在启用服务器端的首选算法时配置 \
          # # ssl_ciphers HIGH:!NULL:!aNULL:!MD5:!DES:!3DES; \
          gzip on; \
          gzip_static on; \
          gzip_min_length 1k; \
          gzip_comp_level 4; \
          gzip_proxied any; \
          gzip_types text/plain text/xml text/css; \
          gzip_vary on; \
          gzip_disable \"MSIE [1-6]\\.(?!.*SV1)\"; \
          client_max_body_size 1000m; \
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
          # 引入自定义的location块配置 \
          include $NGINX_LOCATION_CONF_PATH/*.conf; \
          # 后端接口 \
          location ^~ /$API_CONTEXT_PATH/ { \
              proxy_pass              $API_PROXY_PASS_APP_1; \
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
          # 忽略favicon.ico文件的错误日志 \
          location ~* /favicon\\.ico\$ { \
              log_not_found off; \
              access_log off; \
              try_files \$uri =204; \
          } \
          # 先匹配非子应用，根目录访问 \
          location / { \
              root   $APP_1_PATH; \
              index  index.html index.htm; \
              try_files \$uri \$uri/ \index.html; \
          } \
          # 再匹配子应用，解决Router(mode: 'history')模式下，刷新路由地址不能找到页面的问题 \
          location ~* ^/(.+?)(/.*)?\$ { \
              root   $APP_1_PATH; \
              index  index.html index.htm; \
              #解决动态子应用的刷新问题 \
              set \$base_path /\$1; \
              set \$index_path \$base_path/index.html; \
              try_files \$uri \$uri/ \$index_path; \
          } \
          access_log  /var/log/nginx/access-\$host-\$server_port-\$logDate.log; \
          open_log_file_cache max=10; \
      } " > /etc/nginx/conf.d/default.conf && echo \
      "server { \
          server_name $APP_HOST_NAME; \
          listen $APP_2_PORT; \
          # # ssl配置-ssl端口 \
          # listen $APP_2_PORT ssl; \
          # # ssl配置-ssl证书，crt和pem都可以 \
          # ssl_certificate $SSL_PATH/$APP_HOST_NAME.pem; \
          # # ssl配置-ssl证书，key \
          # ssl_certificate_key $SSL_PATH/$APP_HOST_NAME.key; \
          # # http重定向到https（务必开启） \
          # error_page 497 https://$APP_HOST_NAME:$APP_2_PORT\$request_uri; \
          # # SSL安全-设置 SSL 会话的超时时间 \
          # ssl_session_timeout 5m; \
          # # SSL安全-在共享内存中分配 10MB 用于缓存 SSL 会话 \
          # ssl_session_cache shared:MozSSL:10m; \
          # # SSL安全-禁用 SSL 会话票据，用于在不使用服务器端会话缓存的情况下恢复 SSL 会话。禁用它可以增加安全性，因为它避免了潜在的票据重用问题 \
          # ssl_session_tickets off; \
          # # SSL安全-只允许使用 TLS 1.2 和 TLS 1.3 协议，禁用了较旧且不安全的版本（如 TLS 1.0 和 TLS 1.1） \
          # ssl_protocols    TLSv1.2 TLSv1.3; \
          # # SSL安全-不优先使用服务器端的首选算法，允许客户端选择密码套件。通常，客户端会选择它支持的最强密码套件。 \
          # ssl_prefer_server_ciphers off; \
          # # SSL安全-加密算法，在启用服务器端的首选算法时配置 \
          # # ssl_ciphers HIGH:!NULL:!aNULL:!MD5:!DES:!3DES; \
          #index index.php index.html index.htm default.php default.htm default.html; \
          gzip on; \
          gzip_static on; \
          gzip_min_length 1k; \
          gzip_comp_level 4; \
          gzip_proxied any; \
          gzip_types text/plain text/xml text/css; \
          gzip_vary on; \
          gzip_disable \"MSIE [1-6]\\.(?!.*SV1)\"; \
          client_max_body_size 1000m; \
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
          # 引入自定义的location块配置 \
          include $NGINX_LOCATION_CONF_PATH/*.conf; \
          # 后端接口 \
          location ^~ /$API_CONTEXT_PATH/ { \
              proxy_pass              $API_PROXY_PASS_APP_2; \
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
          # 忽略favicon.ico文件的错误日志 \
          location ~* /favicon\\.ico\$ { \
              log_not_found off; \
              access_log off; \
              try_files \$uri =204; \
          } \
          # 先匹配非子应用，根目录访问 \
          location / { \
              root   $APP_2_PATH; \
              index  index.html index.htm; \
              try_files \$uri \$uri/ \index.html; \
          } \
          # 再匹配子应用，解决Router(mode: 'history')模式下，刷新路由地址不能找到页面的问题 \
          location ~* ^/(.+?)(/.*)?\$ { \
              root   $APP_2_PATH; \
              index  index.html index.htm; \
              #解决动态子应用的刷新问题 \
              set \$base_path /\$1; \
              set \$index_path \$base_path/index.html; \
              try_files \$uri \$uri/ \$index_path; \
          } \
          access_log  /var/log/nginx/access-\$host-\$server_port-\$logDate.log; \
          open_log_file_cache max=10; \
      }" \
    > /etc/nginx/conf.d/custom.conf && \
    cat /etc/nginx/conf.d/default.conf && \
    cat /etc/nginx/conf.d/custom.conf && \
    nginx -t && \
    nginx -g "daemon off;";
