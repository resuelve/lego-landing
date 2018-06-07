const checkMarks = {}
let paid = false
let looking = false

const burox = (data) => {
  return $.ajax({
    "async": true,
    "crossDomain": true,
    "url": "/proxi/https://buro-api.resuelve.io/api/v1/buro",
    "method": "POST",
    "headers": {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Cache-Control": "no-cache"
    },
    "processData": false,
    "data": JSON.stringify(data, false, 2)
  })
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
    console.log('success')
    console.log(data)
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
