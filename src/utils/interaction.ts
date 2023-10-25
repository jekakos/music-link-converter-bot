export default class interaction {
  static sleep(sec: number) {
    return new Promise((resolve) => setTimeout(resolve, sec * 1000));
  }
}
