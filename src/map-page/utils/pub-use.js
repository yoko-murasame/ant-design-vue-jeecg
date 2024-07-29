/**
 * 获取文件
 * examples /src/assets/img/xxx.png
 * @param url
 */
export default function useFileHome(url) {
  const context = require.context('@/map-page/img', true, /\.(png|svg|jpg|jpeg)$/)
  const modules = {}

  context.keys().forEach((key) => {
    modules[key.replace('./', '@/map-page/img/')] = context(key)
  })

  if (modules[url]) {
    return modules[url].default || modules[url]
  }
}
