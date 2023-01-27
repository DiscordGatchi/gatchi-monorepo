const HOISTING_CHARACTERS =
  "!#$%&'()*+,-./:;<=>?@[\\]^_`{|}~ ¡¢£¤¥¦§¨©ª«" +
  '¬®¯°±²³´µ¶·¸¹º»¼½¾¿×÷ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ'

const ILLEGAL_NICKNAME_REGEX = new RegExp(
  `(^([${[...HOISTING_CHARACTERS].map((c) => `\\${c}`)}0-9]+)(.+)$)`,
)

export const isHoisting = (nickOrUsername: string): boolean =>
  ILLEGAL_NICKNAME_REGEX.test(nickOrUsername)

export const clearHoistedNickname = (nickname: string) =>
  nickname.replace(ILLEGAL_NICKNAME_REGEX, '$3')
