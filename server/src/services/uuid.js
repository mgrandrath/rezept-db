"use strict";

const realUuid = require("uuid");

module.exports = class Uuid {
  static create() {
    return new Uuid(realUuid);
  }

  static createNull(fixedUuid) {
    return new Uuid(nullUuid(fixedUuid));
  }

  constructor(uuid) {
    this._uuid = uuid;
  }

  uuidV4() {
    return this._uuid.v4();
  }
};

const nullUuid = (fixedUuid) => {
  return {
    v4: () => fixedUuid ?? "00000000-0000-0000-0000-000000000000",
  };
};
