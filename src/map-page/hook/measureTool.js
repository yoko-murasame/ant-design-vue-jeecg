import './measureIcon.less'
import pointMark from './not_select_point.png'
import Vue from 'vue'

export default class MeatureTool {
    constructor(sdMap) {
        this.sdMap = sdMap
        this.map = sdMap
    }

    layerDistanceList = [] // 距离
    layerAreaList = [] // 面积
    layerAngleList = [] // 长度
    setDistance = () => {
    }
    setArea = () => {
    }

    /**
     * 测量距离
     * @param {*} layerId
     */
    measureDistance(layerId) {
        this.layerDistanceList.push(layerId)
        let isMeasure = true
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

        // 添加测量结果弹窗
        const ele = document.createElement('div')
        ele.setAttribute('class', 'measure-move')
        const option = {
            element: ele,
            anchor: 'left',
            offset: [8, 0],
        }
        const tooltip = new window.mapboxgl.Marker(option).setLngLat([0, 0]).addTo(map)

        // 添加测量图层
        map.addSource('points' + layerId, {
            type: 'geojson',
            data: jsonPoint,
        })
        map.addSource('point-move' + layerId, {
            type: 'geojson',
            data: jsonPoint,
        })
        map.addSource('line' + layerId, {
            type: 'geojson',
            data: jsonLine,
        })
        map.addSource('line-move' + layerId, {
            type: 'geojson',
            data: jsonLine,
        })
        map.addSource('point-follow' + layerId, {
            type: 'geojson',
            data: jsonPoint,
        })
        map.addLayer({
            id: 'line' + layerId,
            type: 'line',
            source: 'line' + layerId,
            paint: {
                'line-color': '#ff0000',
                'line-width': 2,
                'line-opacity': 0.65,
            },
        })
        map.addLayer({
            id: 'line-move' + layerId,
            type: 'line',
            source: 'line-move' + layerId,
            paint: {
                'line-color': '#ff0000',
                'line-width': 2,
                'line-opacity': 0.65,
                'line-dasharray': [5, 2],
            },
        })
        map.addLayer({
            id: 'points' + layerId,
            type: 'circle',
            source: 'points' + layerId,
            paint: {
                'circle-color': '#ffffff',
                'circle-radius': 3.5,
                'circle-stroke-width': 1.5,
                'circle-stroke-color': '#ff0000',
            },
        })
        map.addLayer({
            id: 'point-move' + layerId,
            type: 'circle',
            source: 'point-move' + layerId,
            paint: {
                'circle-color': '#ffffff',
                'circle-radius': 3.5,
                'circle-stroke-width': 1.5,
                'circle-stroke-color': '#ff0000',
            },
        })
        // 活动点可以选择用图层，也可以选择用Mark
        map.addLayer({
            id: 'point-follow' + layerId,
            type: 'circle',
            source: 'point-follow' + layerId,
            paint: {
                'circle-color': '#199afc',
                'circle-radius': 5.5,
                'circle-stroke-width': 1.5,
                'circle-stroke-color': '#ffffff',
            },
        })

        // 清除面积测量
        this.setArea = () => {
            isMeasure = false
            map.removeLayer('point-move' + layerId)
            map.removeLayer('line-move' + layerId)

            return isMeasure
        }

        /**
         * 添加点
         * @param {*} _e
         */
        function addPointforJSON(_e) {
            if (isMeasure) {
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
                map.getSource('points' + layerId).setData(jsonPoint)
                drawLine(jsonPoint)
                addMeasureRes(jsonPoint)
            }
        }

        /**
         * 绘制线
         * @param {*} jsonPoint
         */
        function drawLine(jsonPoint) {
            if (jsonPoint.features.length > 1) {
                jsonLine.features = []
                for (let i = 0; i < jsonPoint.features.length - 1; i++) {
                    const coords = jsonPoint.features[i].geometry.coordinates
                    const next_coords = jsonPoint.features[i + 1].geometry.coordinates
                    jsonLine.features.push({
                        id:Number(i)+1,
                        type: 'Feature',
                        geometry: {
                            type: 'LineString',
                            coordinates: [coords, next_coords],
                        },
                    })
                }
                map.getSource('line' + layerId).setData(jsonLine)
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
                    close.setAttribute('class', `measure-result ${layerId} close`)
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

                    const clear = document.createElement('div')
                    clear.setAttribute('class', `measure-result ${layerId} clear`)
                    clear.onclick = (__e) => {
                        // 全部删除
                        __e.stopPropagation()
                        removeLayer()
                        map.off('mousemove', onMouseMove)
                        map.off('mousedown', onmousedown)
                        if (catchMark) {
                            catchMark.remove()
                        }
                    }

                    // const edit = document.createElement('div')
                    // edit.setAttribute('class', `measure-result ${layerId} edit`)
                    // edit.onclick = (__e) => {
                    //     // 编辑线
                    //     __e.stopPropagation()
                    //     map.off('mousemove', onMouseMove)
                    //     map.off('mousedown', onmousedown)
                    //     if (catchMark) {
                    //         catchMark.remove()
                    //     }
                    //     editLine()
                    // }

                    const element = document.createElement('div')
                    element.setAttribute('class', 'measure-result ' + layerId)
                    const option = {
                        element: element,
                        anchor: 'left',
                        offset: [8, 0],
                    }
                    element.innerHTML = i === 0 ? '起点' : ''
                    if ((jsonPoint.features.length === i + 1) & !isMeasure) {
                        //element.appendChild(edit)
                        element.appendChild(clear)
                    }
                    element.appendChild(close)
                    new window.mapboxgl.Marker(option).setLngLat(coords).addTo(map)
                }
            }
        }

        /**
         * 移除点
         * @param {*} coords 点坐标
         */
        function removePoint(coords) {
            if (jsonPoint.features.length > 0) {
                if (jsonPoint.features.length === 2) {
                    jsonPoint.features = []
                    jsonLine.features = []
                    map.getSource('points' + layerId).setData(jsonPoint)
                    map.getSource('line' + layerId).setData(jsonLine)
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
                    drawLine(jsonPoint)
                    addMeasureRes(jsonPoint)
                    map.getSource('points' + layerId).setData(jsonPoint)
                }
            }
        }



        /**
         * 移除dom
         */
        function removedom() {
            const dom = document.getElementsByClassName('measure-result ' + layerId)
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
            map.removeLayer('points' + layerId)
            map.removeLayer('line' + layerId)
            removedom()
        }

        /**
         * 鼠标move事件
         * @param {} _e
         */
        function mouseMove(_e) {
            if (isMeasure) {
                map.getCanvas().style.cursor = "url(supermap/image/draw.cur), auto";
                let coords = [_e.lngLat.lng, _e.lngLat.lat]
                const jsonp = {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: coords,
                    },
                }
                map.getSource('point-move' + layerId).setData(jsonp)

                if (jsonPoint.features.length > 0) {
                    const pointList = []
                    for (let i = 0; i < jsonPoint.features.length; i++) {
                        const coord = jsonPoint.features[i].geometry.coordinates
                        pointList.push(coord)
                    }
                    pointList.push(coords)
                    const prev = jsonPoint.features[jsonPoint.features.length - 1]
                    const jsonl = {
                        type: 'Feature',
                        geometry: {
                            type: 'LineString',
                            coordinates: [prev.geometry.coordinates, coords],
                        },
                    }
                    map.getSource('line-move' + layerId).setData(jsonl)
                    tooltip.setLngLat(coords)
                }
            }
        }

        /**
         * 绘制完成
         * @param {*} _e
         */
        function finish(_e) {
            if (isMeasure) {
                isMeasure = false
                let coords = [_e.lngLat.lng, _e.lngLat.lat]
                removePoint(coords)
                map.removeLayer('point-move' + layerId)
                map.removeLayer('line-move' + layerId)
                map.getCanvas().style.cursor = ''
                tooltip.remove()
                Vue.prototype.$bus.$emit('getLayerSource','line'+layerId)
            }
        }

        map.on('click', function (_e) {
            addPointforJSON(_e)
        })

        map.on('mousemove', function (_e) {
            mouseMove(_e)
        })

        map.on('dblclick', function (_e) {
            finish(_e)
        })

        /**
         * 编辑测量线
         */
        function editLine() {
            catchMark = createMarker()
            UpdataGeolist()

            map.on('mousemove', onMouseMove)
            map.on('mousedown', onmousedown)
        }

        function onMouseMove(e) {
            const moveCoord = [e.lngLat.lng, e.lngLat.lat]

            if (jsonPoint.features.length > 1) {
                // 计算当前指针与线段最近的点
                pointOnLine = getNearestPointOnLine(Geolist, moveCoord) // 自己计算
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
            // 开始计时
            // let start = new Date().getTime()
            const movePoint = [e.lngLat.lng, e.lngLat.lat]

            // 点跟随鼠标移动
            jsonPoint.features[dragPointOrder].geometry.coordinates = movePoint

            // 更新绘制要素
            updataFeature()

            // 计时结束
            // let end1 = new Date().getTime()
            // console.log('渲染时间：', end1 - start + 'ms')
        }

        // 更新绘制要素
        function updataFeature() {
            UpdataGeolist()
            map.getSource('points' + layerId).setData(jsonPoint)
            drawLine(jsonPoint)
            addMeasureRes(jsonPoint)
        }

        function onMouseup(e) {
            map.off('mousemove', onDrag)
            map.dragPan.enable()
        }

        // 创建Marker
        function createMarker() {
            const markerParam = {
                map: sdMap,
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
    clearMeasureAll() {
        const dom = document.getElementsByClassName('measure-result') //measure-move
        const len = dom.length
        if (len) {
            for (let i = len - 1; i >= 0; i--) {
                if (dom[i]) dom[i].remove()
            }
        }
        if (this.layerDistanceList) {
            for (let i = 0; i < this.layerDistanceList.length; i++) {
                const layerid = this.layerDistanceList[i]
                try {
                    this.map.removeLayer('points' + layerid)
                    this.map.removeLayer('line' + layerid)
                    this.map.removeLayer('point-move' + layerid)
                    this.map.removeLayer('line-move' + layerid)
                } catch (error) {
                    console.log(error)
                }
            }
        }
        this.layerDistanceList = []


        this.map.doubleClickZoom.enable()
    }
}


