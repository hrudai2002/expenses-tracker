type DecimalLike = {
  toString(): string;
};

function toNumber(value: DecimalLike | number | string): number {
  return Number(value.toString());
}

function toNullableNumber(value: DecimalLike | number | string | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  return toNumber(value);
}

export { toNumber, toNullableNumber };

