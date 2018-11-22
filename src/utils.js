import _ from "lodash";

const nest = function (seq, keys) {
    if (!keys.length)
        return seq;
    const first = keys[0];
    const rest = keys.slice(1);
    return _.mapValues(_.groupBy(seq, first), function (value) {
        return nest(value, rest)
    });
};

export default nest
