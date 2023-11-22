/**
 * 判断是否为常见图片格式
 * @param fileName
 * @returns {boolean}
 */
export const isImage = (fileName) => {
  const imageExtensions = [
    'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico', 'tif', 'tiff',
    'jfif', 'pjpeg', 'pjp', 'apng', 'avif', 'svgz', 'xbm'
  ];
  const extension = fileName.split('.').pop().toLowerCase();
  return imageExtensions.includes(extension);
}

/**
 * 判断是否为常见视频格式
 * @param fileName
 * @returns {boolean}
 */
export const isVideo = (fileName) => {
  const videoExtensions = [
    'mp_four', 'mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'm4v', 'mpeg', 'mpg',
    '3gp', '3g2', 'ogg', 'ogv', 'ts', 'mts'
  ];
  const extension = fileName.split('.').pop().toLowerCase();
  return videoExtensions.includes(extension);
}
