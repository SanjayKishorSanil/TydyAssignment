const { getConnection } = require("./dbConnect");
const { QueryTypes } = require("sequelize");

module.exports.excuteQuery = async (sqlQuery) => {
  const conn = await getConnection();
  const res = (
    await conn.query(sqlQuery, {
      type: QueryTypes.RAW,
      raw: true,
      nest: true,
    })
  )[0];
  return res;
};

module.exports.getProgrammingLanguageDetails = async (id) => {
  const conn = await getConnection();
  let sqlQuery = `SELECT * FROM programming_languages WHERE id = ${id}`;
  const res = (
    await conn.query(sqlQuery, {
      type: QueryTypes.RAW,
      raw: true,
      nest: true,
    })
  )[0][0];
  return res;
};
