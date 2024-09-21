import './measureIcon.less'
import pointMark from './not_select_point.png'
import Vue from 'vue'

export default class DrawPolygon {

    constructor(sdMap) {
        this.sdMap = sdMap
        this.map = sdMap
    }

    layerDrawPolygon = [] // 距离

    setDrawPolygon = () => {}

    /**
     * 绘面
     * @param {*} layerId
     */
    drawPolygonPoint(layerId) {
        this.layerDrawPolygon.push(layerId)
        let isDraw = true
        const map = this.map
        const sdMap = this.sdMap
        map.doubleClickZoom.disable()
        let catchMark = null
        let isEdit = false
        let Geolist = []
        let dragPointOrder = 0
        let pointOnLine = [0, 0]

        const jsonPoint = {
            type: 'FeatureCollection',
            features: [],
        }
        const jsonLine = {
            type: 'FeatureCollection',
            features: [],
        }

        const ele = document.createElement('div')
        ele.setAttribute('class', 'polygon-move')
        const option = {
            element: ele,
            anchor: 'left',
            offset: [8, 0],
        }
        const tooltip = new window.mapboxgl.Marker(option).setLngLat([0, 0]).addTo(map)

        map.addSource('polygon-area' + layerId, {
            type: 'geojson',
            data: jsonPoint,
        })
        map.addSource('polygon-move' + layerId, {
            type: 'geojson',
            data: jsonPoint,
        })
        map.addSource('line-polygon' + layerId, {
            type: 'geojson',
            data: jsonLine,
        })
        map.addSource('line-polygonMove' + layerId, {
            type: 'geojson',
            data: jsonLine,
        })
        map.addLayer({
            id: 'line-polygonMove' + layerId,
            type: 'line',
            source: 'line-polygonMove' + layerId,
            paint: {
                'line-color': '#ff0000',
                'line-width': 2,
                'line-opacity': 0.65,
                'line-dasharray': [5, 2],
            },
        })
        map.addLayer({
            id: 'line-polygon' + layerId,
            type: 'fill',
            source: 'line-polygon' + layerId,
            paint: {
                'fill-color': '#ff0000',
                'fill-opacity': 0.1,
            },
        })
        map.addLayer({
            id: 'line-polygon-stroke' + layerId,
            type: 'line',
            source: 'line-polygon' + layerId,
            paint: {
                'line-color': '#ff0000',
                'line-width': 2,
                'line-opacity': 0.65,
            },
        })
        map.addLayer({
            id: 'polygon-area' + layerId,
            type: 'circle',
            source: 'polygon-area' + layerId,
            paint: {
                'circle-color': '#ffffff',
                'circle-radius': 3.5,
                'circle-stroke-width': 1.5,
                'circle-stroke-color': '#ff0000',
            },
        })
        map.addLayer({
            id: 'polygon-move' + layerId,
            type: 'circle',
            source: 'polygon-move' + layerId,
            paint: {
                'circle-color': '#ffffff',
                'circle-radius': 3.5,
                'circle-stroke-width': 1.5,
                'circle-stroke-color': '#ff0000',
            },
        })

        this.setDistance = () => {
            isDraw = false
            map.removeLayer('polygon-move' + layerId)
            map.removeLayer('line-polygonMove' + layerId)

            return isDraw
        }

        /**
         * 添加点
         * @param {*} _e
         */
        function addPointforJSON(_e) {
            if (isDraw) {
                const point = {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [_e.lngLat.lng, _e.lngLat.lat],
                    },
                    properties: {
                        id: String(new Date().getTime()),
                    },
                }
                jsonPoint.features.push(point)
                map.getSource('polygon-area' + layerId).setData(jsonPoint)
                addMeasureRes(jsonPoint)
            }
        }

        /**
         * 添加dom
         * @param {*} jsonPoint 点集
         */
        function addMeasureRes(jsonPoint) {
            if (jsonPoint.features.length > 0) {
                removedom()
                const pointList = []
                for (let i = 0; i < jsonPoint.features.length; i++) {
                    const coords = jsonPoint.features[i].geometry.coordinates
                    pointList.push(coords)

                    const close = document.createElement('div')
                    close.setAttribute('class', `polygon-result ${layerId} close`)
                    close.onclick = (__e) => {
                        // 移除点
                        __e.stopPropagation()
                        removePoint(coords)
                        map.off('mousemove', onMouseMove)
                        map.off('mousedown', onmousedown)
                        if (catchMark) {
                            catchMark.remove()
                        }
                    }
                    if ((jsonPoint.features.length === i + 1) & !isDraw) {
                        const clear = document.createElement('div')
                        clear.setAttribute('class', `polygon-result ${layerId} clear`)
                        clear.onclick = (__e) => {
                            // 全部移除
                            __e.stopPropagation()
                            removeLayer()
                            map.off('mousemove', onMouseMove)
                            map.off('mousedown', onmousedown)
                            if (catchMark) {
                                catchMark.remove()
                            }
                        }

                        // const edit = document.createElement('div')
                        // edit.setAttribute('class', `polygon-result ${layerId} edit`)
                        // edit.onclick = (__e) => {
                        //     // 编辑
                        //     __e.stopPropagation()
                        //     map.off('mousemove', onMouseMove)
                        //     map.off('mousedown', onmousedown)
                        //     if (catchMark) {
                        //         catchMark.remove()
                        //     }
                        //     editArea()
                        // }

                        const element = document.createElement('div')
                        element.setAttribute('class', 'polygon-result ' + layerId)
                        const option = {
                            element: element,
                            anchor: 'left',
                            offset: [0, 0],
                        }
                       // element.appendChild(edit)
                        element.appendChild(clear)
                        element.appendChild(close)
                        new window.mapboxgl.Marker(option).setLngLat(coords).addTo(map)
                    } else {
                        const option = {
                            element: close,
                            anchor: 'left',
                            offset: [5, -15],
                        }
                        new window.mapboxgl.Marker(option).setLngLat(coords).addTo(map)
                    }
                }
            }
        }


        /**
         * 移除点
         * @param {*} coords 点坐标
         */
        function removePoint(coords) {
            if (jsonPoint.features.length > 0) {
                if (jsonPoint.features.length === 3) {
                    jsonPoint.features = []
                    jsonLine.features = []
                    map.getSource('polygon-area' + layerId).setData(jsonPoint)
                    map.getSource('line-polygon' + layerId).setData(jsonLine)
                    removedom()
                } else {
                    for (let i = 0; i < jsonPoint.features.length; i++) {
                        if (
                            (jsonPoint.features[i].geometry.coordinates[0] === coords[0]) &
                            (jsonPoint.features[i].geometry.coordinates[1] === coords[1])
                        ) {
                            jsonPoint.features.splice(i, 1)
                        }
                    }
                    addMeasureRes(jsonPoint)
                    map.getSource('polygon-area' + layerId).setData(jsonPoint)

                    const pointList = []
                    for (let i = 0; i < jsonPoint.features.length; i++) {
                        const coord = jsonPoint.features[i].geometry.coordinates
                        pointList.push(coord)
                    }
                    const pts = pointList.concat([pointList[0]])
                    const jsona = {
                        type: 'Feature',
                        geometry: {
                            type: 'Polygon',
                            coordinates: [pts],
                        }
                    }
                    map.getSource('line-polygon' + layerId).setData(jsona)
                }
            }
        }

        /**
         * 移除dom
         */
        function removedom() {
            const dom = document.getElementsByClassName('polygon-result ' + layerId)
            const len = dom.length
            if (len) {
                for (let i = len - 1; i >= 0; i--) {
                    if (dom[i]) dom[i].remove()
                }
            }
        }

        /**
         * 移除图层
         */
        function removeLayer() {
            jsonPoint.features = []
            jsonLine.features = []
            map.removeLayer('polygon-area' + layerId)
            map.removeLayer('line-polygon' + layerId)
            map.removeLayer('line-polygon-stroke' + layerId)
            removedom()
        }

        /**
         * 鼠标move事件
         * @param {} _e
         */
        function mouseMove(_e) {
            if (isDraw) {
                map.getCanvas().style.cursor = "url(supermap/image/draw.cur), auto";
                const coords = [_e.lngLat.lng, _e.lngLat.lat]
                const jsonp = {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: coords,
                    },
                }
                map.getSource('polygon-move' + layerId).setData(jsonp)

                if (jsonPoint.features.length > 0) {
                    if (jsonPoint.features.length === 1) {
                        const prev = jsonPoint.features[jsonPoint.features.length - 1]
                        const jsonl = {
                            type: 'Feature',
                            geometry: {
                                type: 'LineString',
                                coordinates: [prev.geometry.coordinates, coords],
                            },
                        }
                        map.getSource('line-polygonMove' + layerId).setData(jsonl)
                    } else {
                        const json = {
                            type: 'FeatureCollection',
                            features: [],
                        }
                        map.getSource('line-polygonMove' + layerId).setData(json)

                        const pointList = []
                        for (let i = 0; i < jsonPoint.features.length; i++) {
                            const coord = jsonPoint.features[i].geometry.coordinates
                            pointList.push(coord)
                        }
                        pointList.push(coords)
                        const pts = pointList.concat([pointList[0]])
                        const jsona = {
                            type: 'Feature',
                            geometry: {
                                type: 'Polygon',
                                coordinates: [pts],
                            },
                        }
                        map.getSource('line-polygon' + layerId).setData(jsona)
                        tooltip.setLngLat(coords)
                    }
                }
            }
        }

        /**
         * 绘制完成
         * @param {*} _e
         */
        function finish(_e) {
            if (isDraw) {
                isDraw = false
                const coords = [_e.lngLat.lng, _e.lngLat.lat]
                removePoint(coords)
                map.removeLayer('polygon-move' + layerId)
                map.removeLayer('line-polygonMove' + layerId)
                map.getCanvas().style.cursor = ''
                tooltip.remove()
                Vue.prototype.$bus.$emit('getLayerSource','line-polygon'+layerId)
            }
        }

        map.on('click', function (_e) {
            addPointforJSON(_e)
        })

        map.on('dblclick', function (_e) {
            finish(_e)
        })

        map.on('mousemove', function (_e) {
            mouseMove(_e)
        })

        /**
         * 编辑测量面
         */
        function editArea() {
            catchMark = createMarker()
            UpdataGeolist()

            map.on('mousemove', onMouseMove)
            map.on('mousedown', onmousedown)
        }

        function onMouseMove(e) {
            const moveCoord = [e.lngLat.lng, e.lngLat.lat]

            if (jsonPoint.features.length > 1) {
                // 计算当前指针与线段的距离
                pointOnLine = getNearestPointOnLine(Geolist, moveCoord) // 线上实际坐标
                const screenOnLine = Object.values(map.project(pointOnLine)) // 线上屏幕坐标
                const screenP = [e.point.x, e.point.y]
                const screenDist = screenDistance(screenOnLine, screenP) // 距离
                if (screenDist < 15) {
                    isEdit = true
                    catchMark.setLngLat(pointOnLine).addTo(map)
                    catchMark.getElement().style.display = 'block'
                } else {
                    isEdit = false
                    catchMark.getElement().style.display = 'none'
                }
            } else {
                isEdit = false
                catchMark.getElement().style.display = 'none'
                map.dragPan.enable()
            }
        }

        function onmousedown(e) {
            if (isEdit) {
                map.dragPan.disable()
                let isExist = false

                // 首先判断编辑点是否是存在(存在修改原来点，不存在新加点)
                for (let i = 0; i < jsonPoint.features.length; i++) {
                    const coord = jsonPoint.features[i].geometry.coordinates
                    if (coord[0] === pointOnLine[0] && coord[1] === pointOnLine[1]) {
                        isExist = true
                    }
                }

                // 获取编辑点在列表中的位置
                dragPointOrder = getDragCoords(pointOnLine, Geolist)

                if (!isExist) {
                    // 添加编辑点
                    const point = {
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: pointOnLine,
                        },
                        properties: {
                            id: String(new Date().getTime()),
                        },
                    }
                    jsonPoint.features.splice(dragPointOrder, 0, point)

                    // 更新绘制要素
                    updataFeature()
                }

                map.on('mousemove', onDrag)
                map.on('mouseup', onMouseup)
            }
        }

        function onDrag(e) {
            const movePoint = [e.lngLat.lng, e.lngLat.lat]

            // 点跟随鼠标移动
            jsonPoint.features[dragPointOrder].geometry.coordinates = movePoint

            // 更新绘制要素
            updataFeature()
        }

        // 更新绘制要素
        function updataFeature() {
            UpdataGeolist()
            const pts = Geolist
            const jsona = {
                type: 'Feature',
                geometry: {
                    type: 'Polygon',
                    coordinates: [pts],
                },
            }
            map.getSource('line-polygon' + layerId).setData(jsona)
            map.getSource('polygon-area' + layerId).setData(jsonPoint)
            addMeasureRes(jsonPoint)
        }

        function onMouseup(e) {
            map.off('mousemove', onDrag)
            map.dragPan.enable()
        }

        // 创建Marker
        function createMarker() {
            const markerParam = {
                map: sdMap.map,
                imgUrl: pointMark,
                lngLat: [0, 0],
                height: 13,
                width: 13,
                size: 13,
                isDrag: false,
                cursor: 'default',
            }
            return new window.mapboxgl.Marker(markerParam)
        }

        // 更新点集
        function UpdataGeolist() {
            Geolist = []
            for (let i = 0; i < jsonPoint.features.length; i++) {
                const coord = jsonPoint.features[i].geometry.coordinates
                Geolist.push(coord)
            }
            Geolist.push(Geolist[0])
        }

        // 计算点到直线最近距离的点
        function getNearestPointOnLine(list, moveCoord) {
            let dis, point1, point2
            for (let i = 0; i < list.length - 1; i++) {
                const distance = getNearestDistance(moveCoord, list[i], list[i + 1])
                if (i === 0) {
                    dis = distance
                    point1 = list[i]
                    point2 = list[i + 1]
                } else {
                    if (distance < dis) {
                        dis = distance
                        point1 = list[i]
                        point2 = list[i + 1]
                    }
                }
            }
            const Point = getNearestPoint(moveCoord, point1, point2)
            return Point
        }

        // 计算点point到线段point1, point2最近距离
        function getNearestDistance(point, point1, point2) {
            const P = {}
            const A = {}
            const B = {}
            P.x = point[0]
            P.y = point[1]
            A.x = point1[0]
            A.y = point1[1]
            B.x = point2[0]
            B.y = point2[1]
            // 计算向量AP和向量AB的点积
            const dotProduct = (P.x - A.x) * (B.x - A.x) + (P.y - A.y) * (B.y - A.y)
            // 计算向量AB的长度的平方
            const lengthSquare = (B.x - A.x) * (B.x - A.x) + (B.y - A.y) * (B.y - A.y)
            // 计算点P到线段AB的投影点C
            const t = dotProduct / lengthSquare
            const C = {x: A.x + t * (B.x - A.x), y: A.y + t * (B.y - A.y)}
            // 如果点C在线段AB内，则点P到线段AB的最近距离为PC的长度；否则，点P到线段AB的最近距离为PA或PB中的较小值。
            const isInside = dotProduct >= 0 && dotProduct <= lengthSquare
            if (isInside) {
                return Math.sqrt((P.x - C.x) * (P.x - C.x) + (P.y - C.y) * (P.y - C.y))
            } else {
                return Math.min(
                    Math.sqrt((P.x - A.x) * (P.x - A.x) + (P.y - A.y) * (P.y - A.y)),
                    Math.sqrt((P.x - B.x) * (P.x - B.x) + (P.y - B.y) * (P.y - B.y))
                )
            }
        }

        // 计算点到直线最近的点 point点坐标，point1, point2直线两个端点
        function getNearestPoint(point, point1, point2) {
            let x, y, x0, y0, x1, y1, x2, y2
            x0 = point[0]
            y0 = point[1]
            x1 = point1[0]
            y1 = point1[1]
            x2 = point2[0]
            y2 = point2[1]

            if (x1 !== x2 && y1 !== y2) {
                const a = (y2 - y1) / (x2 - x1)
                const b = y1 - a * x1
                const k2 = -1 / a
                const b2 = y0 - k2 * x0
                x = (b2 - b) / (a - k2)
                y = a * x + b
            } else if (x1 === x2) {
                x = x1
                y = y0
            } else if (y1 === y2) {
                x = x0
                y = y1
            }

            // 点不能超出线段
            if (x1 < x2) {
                if (x2 < x) {
                    x = x2
                } else if (x < x1) {
                    x = x1
                }
            } else {
                if (x1 < x) {
                    x = x1
                } else if (x < x2) {
                    x = x2
                }
            }
            if (y1 < y2) {
                if (y2 < y) {
                    y = y2
                } else if (y < y1) {
                    y = y1
                }
            } else {
                if (y1 < y) {
                    y = y1
                } else if (y < y2) {
                    y = y2
                }
            }

            // 点吸附端点
            const screenX0 = Object.values(map.project([x0, y0])) // 屏幕坐标
            const screenX1 = Object.values(map.project([x1, y1])) // 屏幕坐标
            const screenX2 = Object.values(map.project([x2, y2])) // 屏幕坐标
            const screenDistX1 = screenDistance(screenX0, screenX1) // 距离
            const screenDistX2 = screenDistance(screenX0, screenX2) // 距离
            if (screenDistX1 < 10) {
                x = x1
                y = y1
            }
            if (screenDistX2 < 10) {
                x = x2
                y = y2
            }

            return [x, y]
        }

        // 屏幕距离
        function screenDistance(point1, point2) {
            const x2 = Math.pow(point1[0] - point2[0], 2)
            const y2 = Math.pow(point1[1] - point2[1], 2)
            const dist = Math.sqrt(x2 + y2)

            return dist
        }

        // 计算编辑点在线段上的添加位置
        function getDragCoords(coords, list) {
            let x, y, x1, y1, x2, y2
            let index = 0
            x = coords[0]
            y = coords[1]

            for (let i = 0; i < list.length - 1; i++) {
                x1 = list[i][0]
                y1 = list[i][1]
                x2 = list[i + 1][0]
                y2 = list[i + 1][1]

                if (x === x1 && y === y1) {
                    index = i
                    break
                } else {
                    // 计算线段的长度
                    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
                    // 计算点到线段起点的距离
                    const distance1 = Math.sqrt(Math.pow(x - x1, 2) + Math.pow(y - y1, 2))
                    // 计算点到线段终点的距离
                    const distance2 = Math.sqrt(Math.pow(x - x2, 2) + Math.pow(y - y2, 2))
                    // 如果点到线段两个端点的距离之和等于线段的长度，则点在线段上
                    if (Math.abs(length - distance1 - distance2) < 0.00001) {
                        index = i + 1
                        break
                    }
                }
            }
            return index
        }
    }

    /**
     * 清除所有测量要素
     */
    clearAllDrawPolygon() {
        const dom = document.getElementsByClassName('polygon-result') //polygon-move
        const len = dom.length
        if (len) {
            for (let i = len - 1; i >= 0; i--) {
                if (dom[i]) dom[i].remove()
            }
        }
        if (this.layerDrawPolygon) {
            for (let i = 0; i < this.layerDrawPolygon.length; i++) {
                const layerid = this.layerDrawPolygon[i]
                try {
                    this.map.removeLayer('polygon-area' + layerid)
                    this.map.removeLayer('line-polygon' + layerid)
                    this.map.removeLayer('line-polygon-stroke' + layerid)
                    this.map.removeLayer('polygon-move' + layerid)
                    this.map.removeLayer('line-polygonMove' + layerid)
                } catch (error) {
                    console.log(error)
                }
            }
        }
        this.layerDrawPolygon = []

        this.map.doubleClickZoom.enable()
    }
}


