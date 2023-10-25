type JwtToken = `${string}.${string}.${string}`;

function removeNonLetters(str: string): string {
  return str.replace(/[^\p{L}]/gu, '');
}

export async function sleep(): Promise<any> {
  console.debug('Start async function');
  return new Promise<any>((resolve) => {
    setTimeout(() => {
      console.log(
        '2 seconds passed! =========================================== ',
      );
      resolve('1234567');
    }, 2000);
  });
}

export { JwtToken, removeNonLetters };
