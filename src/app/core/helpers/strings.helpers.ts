export function camelize(str: string, includeFirst = false): string {
  const regx = `${includeFirst ? '(?:^[a-z])|' : ''}(?:W+(.))`;
  const replacer = (match: string) => match.trim().toUpperCase();
  return str.replace(RegExp(regx, 'igm'), replacer);
}

export function fixnumber(n: number | string = 0): string {
  let nd = `${String(n).match(/\.\d+/gim) || ''}`.replace('.', '').length;
  if (nd > 2) nd = 2;
  return Number(n)?.toFixed(nd);
}

export async function copyText(text: string) {
  await navigator?.clipboard?.writeText(text);
}

export function isEmail(str: string): boolean {
  const regex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(String(str).toLocaleLowerCase());
}

export function getExtension(filename: string) {
  if (!filename) return '';
  var parts = filename.split('.');
  return parts[parts.length - 1].toLowerCase();
}

export function isImage(filename: string) {
  var ext = getExtension(filename);
  switch (ext.toLowerCase()) {
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'bmp':
    case 'png':
    case 'webp':
      //etc
      return true;
  }
  return false;
}

export function isVideo(filename: string) {
  var ext = getExtension(filename);
  switch (ext.toLowerCase()) {
    case 'm4v':
    case 'avi':
    case 'mpg':
    case 'mp4':
    case 'webm':
    case 'webm':
    case 'mpeg':
    case 'mpeg4':
    case 'mov':
    case '3gp':
    case 'mts/m2ts':
    case 'mxf':
      return true;
  }
  return false;
}

export function completeImageURL(url: string) {
  if (url && !url.includes('http') && !url.includes('https')) {
    return (url = 'https://' + url);
  }
  return url;
}

// String formatter for the dateId field of the ItemOrder model
export function formatID(dateId: string, padZeroes = false): string {
  if (/[0-9]{4}[-][0-9]{1,2}[-][0-9]{1,2}N[0-9]{1,}/.test(dateId)) {
    const splits = dateId.split('-');
    const year = splits[0];
    const numberStart = splits[2].search('N');
    const number = splits[2].slice(numberStart);
    let month = splits[1];
    let day = splits[2].slice(0, numberStart);

    if (padZeroes) {
      month = String(month).length < 2 ? '0' + month : month;
      day = String(day).length < 2 ? '0' + day : day;
    }

    return `#${year}${month}${day}${number}`;
  } else if (/[0-9]{1,2}[\/][0-9]{1,2}[\/][0-9]{4}N[0-9]{1,}/.test(dateId)) {
    const splits = dateId.split('/');
    const year = splits[2].substring(0, 4);
    const number = splits[2].substring(4);
    let month = splits[0];
    let day = splits[1];

    if (padZeroes) {
      month = String(month).length < 2 ? '0' + month : month;
      day = String(day).length < 2 ? '0' + day : day;
    }

    return `#${year}${month}${day}${number}`;
  }
}

export function unformatID(
  month: string,
  day: string,
  year: string,
  number: string
): string {
  return `${month}/${day}/${year}${number}`;
}

export function capitalize(text) {
  return text.replace(/\b\w/g, (l) => l.toUpperCase());
}

export function getDaysAgo(date: string) {
  const temporalDate = new Date(date);
  const currentDate = new Date();
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const dateDifference = Math.round(
    Math.abs((currentDate.getTime() - temporalDate.getTime()) / oneDay)
  );
  const monthDifference = Math.floor(dateDifference / 30);
  let daysAgo: string;
  if (dateDifference === 0) daysAgo = 'Hoy';
  if (dateDifference === 1) daysAgo = 'Ayer';
  if (dateDifference > 1 && dateDifference < 30)
    daysAgo = `Hace ${dateDifference} días`;
  if (dateDifference >= 30 && dateDifference < 365) {
    daysAgo = `Hace ${monthDifference} mes${monthDifference === 1 ? '' : 'es'}`;
  }
  if (dateDifference >= 365) {
    const yearDifference = Math.floor(monthDifference / 12);
    daysAgo = `Hace ${yearDifference} año${yearDifference === 1 ? '' : 's'}`;
  }
  return daysAgo;
}
