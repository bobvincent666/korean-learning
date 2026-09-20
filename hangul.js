export const compose = (leadIndex, vowelIndex) => {
  if (!Number.isInteger(leadIndex) || leadIndex < 0 || leadIndex > 18 ||
      !Number.isInteger(vowelIndex) || vowelIndex < 0 || vowelIndex > 20) {
    throw new RangeError('Invalid Hangul jamo index');
  }
  return String.fromCodePoint(0xAC00 + (leadIndex * 21 + vowelIndex) * 28);
};

export const reading = (consonantRoman, vowelRoman) => consonantRoman + vowelRoman;
export const vowelDemo = vowelIndex => compose(11, vowelIndex);
