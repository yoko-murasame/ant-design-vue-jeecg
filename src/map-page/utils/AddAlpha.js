export const AddAlpha = (colorCode, alpha) => {
  // HEX颜色代码转为RGB格式
  if (colorCode.charAt(0) === '#') {
    colorCode = colorCode.slice(1)
    let r = parseInt(colorCode.substring(0, 2), 16)
    let g = parseInt(colorCode.substring(2, 4), 16)
    let b = parseInt(colorCode.substring(4), 16)
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')'
  } else if (colorCode.slice(0, 4) === 'rgb(') {
    let rgb = colorCode.slice(4, -1).split(',')
    return 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + alpha + ')'
  } else {
    return colorCode
  }
}