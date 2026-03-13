import loglevel from 'loglevel';
import prefix from 'loglevel-plugin-prefix';

prefix.reg(loglevel);
prefix.apply(loglevel, {
  format(_level, name) {
    return `[${name}]`;
  },
});

export function getLoglevelInstance() {
  return loglevel;
}
