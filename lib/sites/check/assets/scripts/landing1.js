const checkMarks = {}
let paid = false
let looking = false

const burox = (data) => {
  return $.ajax({
    "async": true,
    "crossDomain": true,
    "url": "/proxi/https://buro-api.resuelve.io/api/v1/financial_diagnosis",
    "method": "POST",
    "headers": {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Cache-Control": "no-cache"
    },
    timeout: 60 * 2 * 1000,
    "processData": false,
    "data": JSON.stringify(data, false, 2)
  })
}

const ranges = (score) => {
  switch (true) {
    case (score > 699):
      return 'excelente'
      break
    case (score > 649):
      return 'bueno'
      break
    case (score > 550):
      return 'regular'
      break
    default:
      return 'malo'
  }
}

class Rangemap {
  constructor (input, output) {
    this.inMin = input[0]
    this.inMax = input[1]
    this.outMin = output[0]
    this.outMax = output[1]
  }
  transport (value, trim = false) {
    let retval = (value - this.inMin) *
      (this.outMax - this.outMin) / (this.inMax - this.inMin) +
      this.outMin
    if (!trim) return retval
    if (retval < this.outMin) return this.outMin
    if (retval > this.outMax) return this.outMax
    return retval
  }
}

const showResult = () => {
  if (paid || looking) return
  const checks = Object.keys(checkMarks)
    .map(key => checkMarks[key])
  $('.spinner').hide()
  $('.loadbar').show()
  const total = checks.length + 1
  const count = checks.filter(check => check).length
  $('.loadbar .loadNotch').removeClass('animating')
  $('.loadbar .loadNotch').animate({
    width: `${count * 100 / total}%`
  }, 500)
  const pass = !checks.some(itm => !itm)
  if (!pass) return
  looking = true
  setTimeout(() => {
    $('.loadbar .loadNotch').addClass('animating')
  }, 1000)
  $('.loadbar .loadNotch').animate({
    width: '90%',
  }, 30000)
  burox({
    "request":{
      "persona":{
        "apellido_paterno": "RAMOS",
        "apellido_materno": "TELLEZ",
        "primer_nombre": "EDMUNDO",
        "rfc": "RATE5510099U6"
      }
    }
  }).then(data => {
    $('.number.dataResult').text(data.data.score)
    $(`.${ranges(data.data.score)}`).show()
    const range = new Rangemap([350, 850], [0, 100])
    const transported = range.transport(data.data.score, true)
    $('.bar .overlay').animate({
      width: `${100 - transported - 5}%`
    }, 500, () => {
      $('.bar .overlay').animate({
        width: `${100 - transported}%`
      }, 500)
    })
    $('.loadbar .loadNotch').stop().animate({
      width: '100%',
    }, 100, () => {
      $('.loadingZone').addClass('hidden')
      $('.chartZone').removeClass('hidden')
      paid = true
    })
  }).fail(data => {
    console.log('fail')
    console.log(data)
  })
}
$(document).ready(function() {
  $('.payment .btn-share').each((k, itm) => {
    checkMarks[$(itm).attr('href')] = false
  })
  $('.btn-share').click(function(e) {
    e.preventDefault();
    window.open($(this).attr('href'), 'fbShareWindow', 'height=450, width=550, top=' + ($(window).height() / 2 - 275) + ', left=' + ($(window).width() / 2 - 225) + ', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0');
    checkMarks[$(this).attr('href')] = true
    showResult()
    return false
  });
});
