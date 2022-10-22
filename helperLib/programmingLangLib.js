let constant = require("../global/constant");
module.exports.verifyProgrammingLangColunm = (data) => {
  let keys = Object.keys(data);
  let programmingLangTableColunm = constant.PROGRAMING_LANGUAGE_COLUNM_LIST;
  for (let i = 0; i < programmingLangTableColunm.length; i++) {
    if (!keys.includes(programmingLangTableColunm[i])) {
      return {
        result: false,
        value: programmingLangTableColunm[i],
      };
    }
  }
  return {
    result: true,
    value: "",
  };
};

module.exports.verifyUpdateData = (data) => {
  for (key in data) {
    if (!constant.PROGRAMING_LANGUAGE_COLUNM_LIST.includes(key)) {
      return {
        result: false,
        value: key,
      };
    }
  }
  return {
    result: true,
    value: "",
  };
};
