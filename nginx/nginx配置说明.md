# Nginx配置说明

1. location目录，目录下的所有（不包含子目录）`*.conf`文件会自动加载到Dockerfile的默认端口server中。

2. server目录，为自定义的server块，目录下的所有（不包含子目录）`*.conf`文件会自动加载到nginx.conf中，使用时请注意放开端口。

3. location/common中`firewall.txt`为国内ip4白名单，用于限制访问，请根据需要修改。

注：example目录里为示例文件，不会被打包进Docker镜像。