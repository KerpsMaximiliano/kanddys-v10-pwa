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

// String formatter for the dateId field of the ItemOrder model
export function formatID(dateId: string): string {
  const splits = dateId.split('/');
  const year = splits[2].substring(0, 4);
  const number = splits[2].substring(4);
  const month = splits[0];
  const day = splits[1];
  return `#${year}${month}${day}${number}`;
}

export function unformatID(
  month: string,
  day: string,
  year: string,
  number: string
): string {
  return `${month}/${day}/${year}${number}`;
}
