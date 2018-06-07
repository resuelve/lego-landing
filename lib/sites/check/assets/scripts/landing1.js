const checkMarks = {}
const paid = false
const showResult = () => {
  if (paid) return
  const checks = Object.keys(checkMarks)
    .map(key => checkMarks[key])
  $('.spinner').hide()
  $('.loadbar').show()
  const total = checks.length + 1
  const count = checks.filter(check => check).length
  $('.loadbar .loadNotch').animate({
    width: `${count * 100 / total}%`
  }, 500)
  const pass = !checks.some(itm => !itm)
  if (!pass) return
  $('.loadbar .loadNotch').animate({
    width: '100%',
  }, 10000)
  setTimeout(() => {
    $('.loadbar .loadNotch').stop().animate({
      width: '100%',
    }, 100, () => {
      $('.loadingZone').addClass('hidden')
      $('.chartZone').removeClass('hidden')
      paid = true
    })
  }, 1000)
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
