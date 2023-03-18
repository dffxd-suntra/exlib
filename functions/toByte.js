function toByte(size, type) {
    if (!type) {
        [size, type] = size;
    }
    size = new Number(size);
    let unit = {
        "BYTE": 1,
        "KB": 1024,
        "MB": 1048576,
        "GB": 1073741824,
        "TB": 1099511627776,
        "PB": 1125899906842600,
    };
    return size * unit[type];
}

exports = toByte;