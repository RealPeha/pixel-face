const rnd = (min, max = null) => {
    if (max === null) {
      	return Math.floor(Math.random() * (min + 1))
    }

    return Math.floor(min + Math.random() * (max + 1 - min))
}

const pos = (x, y) => ({ x, y })

const get = scheme => {
  if (!maybe(scheme.weight / 100)) {
    return {
      type: null,
      item: null
    };
  }

  const parts = Object.values(scheme.parts);
  const types = Object.keys(scheme.parts);

  const index = rnd(0, parts.length - 1);

  return {
    type: types[index],
    item: parts[index]
  };
};

const or = (a, b) => (rnd(1) === 0 ? a : b)

const maybe = chancePercent => Boolean(Math.random() < chancePercent)

module.exports = { rnd, pos, get, or, maybe }
