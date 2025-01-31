﻿/**
 * @requires SuperMap/Lang.js
 */

/**
 * Namespace: SuperMap.Lang["zh-CN"]
 * Dictionary for Simplified Chinese.  Keys for entries are used in calls to
 *     <SuperMap.Lang.translate>.  Entry bodies are normal strings or
 *     strings formatted for use with <SuperMap.String.format> calls.
 */
SuperMap.Lang["zh-CN"] = {

    'unhandledRequest': "未处理的请求，返回值为 ${statusText}",

    'Permalink': "永久链接",

    'Overlays': "叠加层",

    'Base Layer': "基础图层",

    'LayerSwitcher': "图层选择",

    'noFID': "无法更新feature，缺少FID。",

    'browserNotSupported':
        "你使用的浏览器不支持矢量渲染。当前支持的渲染方式包括：\n${renderers}",

    // console message
    'minZoomLevelError':
        "minZoomLevel属性仅适合用于" +
        "使用了固定缩放级别的图层。这个 " +
        "wfs 图层检查 minZoomLevel 是过去遗留下来的。" +
        "然而，我们不能移除它，" +
        "而破坏依赖于它的基于OL的应用程序。" +
        "因此，我们废除了它 -- minZoomLevel 。" +
        "请改用min/max resolution 设置。",

    'commitSuccess': "WFS Transaction: 成功。 ${response}",

    'commitFailed': "WFS Transaction: 失败。 ${response}",

    'googleWarning':
        "Google图层不能正确加载。<br><br>" +
        "要消除这个信息，请在右上角的" +
        "图层控制面板中选择其他的基础图层。<br><br>" +
        "这种情况很可能是没有正确的包含Google地图脚本库，" +
        "或者是没有在你的站点上" +
        "使用的正确的Google Maps API密匙。<br><br>",

    'getLayerWarning':
        "${layerType} 图层不能正确加载。<br><br>" +
        "要消除这个信息，请在右上角的" +
        "图层控制面板中选择其他的基础图层。<br><br>" +
        "这种情况很可能是没有正确的包含" +
        "${layerLib} 脚本库。<br><br>",

    'Scale = 1 : ${scaleDenom}': "比例尺 = 1 : ${scaleDenom}",

    // console message
    'reprojectDeprecated':
        "你正在使用 ${layerName} 图层上的'reproject'选项。" +
        "这个选项已经不再使用：" +
        "它是被设计用来支持显示商业的地图数据，" +
        "不过现在该功能可以通过使用Spherical Mercator来实现。" +
        "更多信息请参阅帮助文档。",

    // console message
    'methodDeprecated':
        "该方法已经不再被支持，将被移除。" +
        "请使用 ${newMethod} 方法来替代。",

    'end': '',
    'mi': "英里",
    'km': "公里",
    'm': "米",
    'ft': "英尺"
};
