export enum CreditCardImg {
  VISA      = 'assets/images/credit-cards/icon-visa.svg',
  MASTER    = 'assets/images/credit-cards/icon-master.svg',
  AMEX      = 'assets/images/credit-cards/icon-amex.svg',
  DINERS    = 'assets/images/credit-cards/icon-diners.svg',
  DEFAULT   = 'assets/images/credit-cards/card.svg',
}

export enum CreditCardMask {
  DEFAULT   = '**** **** **** ****',
  AMEX      = '**** ****** *****',
}

export enum CreditCardRegex {
  VISA      = '^4',
  MASTER    = '^(5|(2(221|222|223|224|225|226|227|228|229|23|24|25|26|27|28|29|3|4|5|6|70|71|720)))',
  AMEX      = '^((34)|(37))',
  CABAL     = '^((627170)|(589657)|(603522)|(604((20[1-9])|(2[1-9][0-9])|(3[0-9]{2})|(400))))',
  DINERS    = '^((30)|(36)|(38))',
}

export enum CreditCardRegexFull {
  VISA      = '^4[0-9]{6,}$',
  MASTER    = '^5[1-5][0-9]{5,}|222[1-9][0-9]{3,}|22[3-9][0-9]{4,}|2[3-6][0-9]{5,}|27[01][0-9]{4,}|2720[0-9]{3,}$',
  AMEX      = '^3[47][0-9]{5,}$',
  CABAL     = '^((627170)|(589657)|(603522)|(604((20[1-9])|(2[1-9][0-9])|(3[0-9]{2})|(400))))',
  DINERS    = '^3(?:0[0-5]|[68][0-9])[0-9]{4,}$',
  DISCOVER  = '^6(?:011|5[0-9]{2})[0-9]{3,}$',
  JCB       = '^(?:2131|1800|35[0-9]{3})[0-9]{3,}$'
}

export enum CreditCardType {
  VISA      = 'VISA',
  MASTER    = 'MASTER',
  AMEX      = 'AMEX',
  CABAL     = 'CABAL',
  DINERS    = 'DINERS',
  DISCOVER  = 'DISCOVER',
  JCB       = 'JCB',
}

export enum CVVLenght {
  VISA      = 3,
  MASTER    = 3,
  AMEX      = 4,
  CABAL     = 3,
  DINERS    = 3,
  DISCOVER  = 3,
  JCB       = 3,
}
