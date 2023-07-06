import config from "../config.js";

export default class Account {
    constructor(t) {
        if (!t.constructor || (t.constructor != Object && t.constructor != Array)) {
            throw new Error("");
        }
    }
    add() {}
}