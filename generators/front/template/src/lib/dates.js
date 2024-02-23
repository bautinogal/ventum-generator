export function dateFormatter(date) {
  try {
    if (typeof date === 'string') {
      return new Date(Number(date)).toLocaleString('es', {
        year: '2-digit',
        month: 'numeric',
        day: 'numeric',
        
        //timeZoneName: 'short',
      })
    } else if (typeof date === 'object') {
      return date.toLocaleString('es', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        // hour: 'numeric',
        // minute: '2-digit',
        //timeZoneName: 'short',
      })
    } else {
      return " - "
    }

  } catch (err) {
    console.log("Error formatting dates: ", err)
    return " - "
  }
}

export function dateFormatterOnlyDate(date){
  return (new Date(parseInt(date))).toLocaleString().split(',')[0]
}

export function setActualTime(dateMs){
  const date = new Date(dateMs)
  const now = new Date()
  date.setHours(now.getHours())
  date.setMinutes(now.getMinutes())
  date.setSeconds(now.getSeconds())
  return date.getTime()
}