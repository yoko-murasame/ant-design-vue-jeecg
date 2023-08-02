/**
 * 网页爬虫简单封装
 * @author Yoko
 * 基于 cheerio https://github.com/cheeriojs/cheerio
 * 安装（不要用rc.12有bug）：yarn add cheerio@1.0.0-rc.3
 * 局限性: Cheerio 解析标记并提供用于遍历/操作结果数据结构的 API。
 * 它不会像 Web 浏览器那样解释结果。
 * 具体而言，它并不会产生视觉呈现，应用CSS，加载外部资源，或者执行JavaScript。
 * 这使得 Cheerio比其他解决方案快得多。
 * 如果您的用例需要任何此类功能，您应该考虑像Puppeteer或JSDom这样的项目。
 */
import * as cheerio from 'cheerio';
import axios from 'axios'

class WebCheerioCrawler {
  // 判断网页是否可抓取
  static exist(url, callback) {
    axios
      .get(url)
      .then(resp => callback(true))
      .catch(err => {
        console.error(err)
        callback(false)
      })
  }

  /**
   * 构造函数
   * @param urls 请求列表
   * @param chandler 自定义dom处理，回调函数($, crawl)
   * @param callback 任务完成之后调用的函数
   * @param cout 自定义过程中输出函数
   */
  constructor(urls, chandler, callback, cout) {
    this.resultData = [] // 下载的结果
    this.visited = new Set() // 已经访问过的url列表
    this.activeCount = 0 // 活跃线程数
    this.urls = urls // url列表
    this.cout = cout || this.cout // 输出函数
    this.callback = callback // 任务完成之后调用的函数
    this.over = false // 结束标志
    this.chandler = chandler // 自定义dom处理
  }

  crawl(url) {
    if (this.visited.has(url)) {
      // 已访问过的不必再访问
      return
    }
    this.activeCount++ // 活跃线程数加一
    this.cout(`正在爬取 ${url}`)
    this.visited.add(url)
    axios
      .get(url)
      .then(async (resp) => {
        if (resp.status === 200) {
          await this.handler(resp.data)
        } else {
          this.cout(resp.status)
          this.cout('请求' + url + '失败')
        }
        this.activeCount--
        this.checkOver() // 每次请求完成之后都要检查一次是否完成全部任务
      })
      .catch(err => {
        this.activeCount--
        this.cout('请求失败')
        if (err.response)
        // 如果是其它地方的异常，可能没有response对象，防止再出异常
        { this.cout('' + err.response.status) }
        this.over = true
        this.checkOver()
      })
  }

  async handler(page) {
    const $ = cheerio.load(page)
    try {
      const result = await this.chandler($, this.crawl.bind(this))
      this.cout('处理成功', result)
      this.resultData.push(result)
    } catch (e) {
      // console.error(e)
      this.cout('处理失败', e)
    }
  }

  /**
   * 自定义dom处理，回调函数示例
   * @param $ cheerio对象
   * @param crawl crawl 爬虫方法,用于递归执行
   * @returns {Promise<*>}
   */
  async chandler($, crawl) {
    var next = $('.paginate-container a')
    for (var i = 0; i < next.length; i++) {
      var it = next.eq(i)
      if (it.text().indexOf('Next') !== -1) {
        crawl(it.attr('href'))
      }
    }
    var lis = $('#user-repositories-list li')
    const resList = []
    for (let i = 0; i < lis.length; i++) {
      const li = lis.eq(i)
      const repo = {
        repoName: li
          .find('h3 a')
          .text()
          .trim(),
        repoUrl: li
          .find('h3 a')
          .attr('href')
          .trim(),
        repoDesc: li
          .find('p')
          .text()
          .trim(),
        language: li
          .find('[itemprop=programmingLanguage]')
          .text()
          .trim(),
        star: li
          .find('.Link--muted.mr-3')
          .eq(0)
          .text()
          .trim(),
        fork: li
          .find('.Link--muted.mr-3')
          .eq(1)
          .text()
          .trim(),
        forkedFrom: li
          .find('.f6.text-gray.mb-1 a')
          .text()
          .trim()
      }
      resList.push(repo)
    }
    return resList
  }

  /**
   * 根据活跃线程数检查是否下载完毕
   */
  checkOver() {
    if (!this.over && this.activeCount > 0) {
      this.cout('下载中 ...')
    } else {
      this.cout('下载完毕')
      this.callback(this.resultData)
    }
  }

  /**
   * 默认控制台打印过程结果
   * @param e
   */
  cout(e) {
    console.log(e)
  }

  /**
   * 执行入口
   */
  start() {
    this.urls.forEach(url => this.crawl(url))
  }
}

export default WebCheerioCrawler

// 测试
if (process.env.NODE_ENV === 'xx') {
  // fs = require('fs')
  var urls = ['url1', 'url2']
  new WebCheerioCrawler(
    urls,
    async function ($, crawl) {
      console.log('chandler', $, crawl)
      return 'ok'
    },
    function (data) {
      // 导出爬取到的数据
      console.log('最后处理' + data.length)
      // fs.writeFileSync(username + '.json', JSON.stringify(data, null, 2))
    }
  ).start()
  WebCheerioCrawler.exist('cuiqingcai', flag => {
    console.log(flag)
  })
}
