'use strict';
const HOMEYCOLORGREENRGB = 'rgb(50,159,0)';
const HOMEYCOLORYELLOWRGB = 'rgb(255,132,0)';
const HOMEYCOLORREDRGB = 'rgb(216,28,29)';
const MINIMUMDAILYVARIATION = 40;

export function getBooleanColorScale(value) {
  return value ? HOMEYCOLORGREENRGB : HOMEYCOLORREDRGB;
}

export function getPriceColor(value, minPrice, dailyPriceVariation) {
  // If the variation is not high, then we dont need to take the power price into
  // consideration through the day. The potensial for saving is to small
  const isDailyPriceVariationLow = dailyPriceVariation < MINIMUMDAILYVARIATION;
  if (isDailyPriceVariationLow) {
    return HOMEYCOLORGREENRGB;
  }

  /*
      Interpolate colors between green-yellow-red.
      Do the interpolation between green and yellow, and yellow and red
      for percentages below and above 50%
      */
  const percentageOfVariation = (value - minPrice) / dailyPriceVariation;

  if (percentageOfVariation > 0.5) {
    return colorInterpolate(
      HOMEYCOLORYELLOWRGB,
      HOMEYCOLORREDRGB,
      (percentageOfVariation - 0.5) * 2, // Convert the percentage to between 0-1 when values are from 0.5-1
    );
  }

  return colorInterpolate(
    HOMEYCOLORGREENRGB,
    HOMEYCOLORYELLOWRGB,
    percentageOfVariation * 2, // Convert the percentage to between 0-1 when values are from 0-0.5
  );
}

function getRgb(color) {
  const [r, g, b] = color
    .replace('rgb(', '')
    .replace(')', '')
    .split(',')
    .map((str) => Number(str));
  return {
    r,
    g,
    b,
  };
}

function colorInterpolate(colorA, colorB, intval) {
  const rgbA = getRgb(colorA);
  const rgbB = getRgb(colorB);

  const colorVal = (prop) =>
    Math.round(rgbA[prop] * (1 - intval) + rgbB[prop] * intval);
  return `rgb(${colorVal('r')}, ${colorVal('g')}, ${colorVal('b')})`;
}
