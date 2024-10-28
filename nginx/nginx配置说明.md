# Nginx配置说明

1. location目录，目录下的所有`*.conf`文件会自动加载到Dockerfile的默认端口server中。

2. server目录，为自定义的server块，目录下的所有`*.conf`文件会自动加载到nginx.conf中，使用时请注意放开端口。

注：example目录里为示例文件，不会被打包进Docker镜像。