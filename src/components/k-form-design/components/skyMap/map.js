import throttle from 'lodash.throttle'
export default {
  init: throttle(function () {
    return new Promise((resolve, reject) => {
      if (window.T) {
        resolve(window.T)
      } else {
        let script = window.document.createElement('script');
        script.type = 'text/JavaScript';
        script.src = "http://api.tianditu.gov.cn/api?v=4.0&tk=0e4a6a266d2dfafee67b43576492c929"
        window.document.body.appendChild(script)
        script.onload = function () {
          console.log("js加载完成")
          resolve(window.T)
        }
      }
    })
  }, 10000)

}