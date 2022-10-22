require("dotenv").config();
var express = require("express");
var app = express();
const bodyparser = require("body-parser");
let constant = require("./global/constant");
let queryLib = require("./database/query");
let programmingLangHelperLib = require("./helperLib/programmingLangLib");
let path = require("path");
app.set("views", path.join(__dirname, "/views/"));
app.set("view engine", "hbs");
app.use(bodyparser.json());

app.use(function (req, res, next) {
  /* This middleware will call for each requested API
    and  check for the requested query properties
    if _method = DELETE  existed
    then we know, client need to call DELETE request instead
  */
  if (req.query._method == "DELETE") {
    req.method = "DELETE";
    req.url = req.path;
  }
  next();
});

//To render a list of programming languages in a html page
app.get("/languages/", async (req, res) => {
  try {
    let pageNumber = parseInt(req.query.page);
    if (isNaN(pageNumber)) {
      res.status(200).send({
        responseMessage: "Page number should be an integer",
        responseData: {},
      });
    }
    let offset = (pageNumber - 1) * constant.PAGE_LIMIT;

    let sqQuery = `SELECT * 
                       FROM programming_languages 
                       LIMIT ${constant.PAGE_LIMIT} 
                       OFFSET ${offset}`;
    let result = await queryLib.excuteQuery(sqQuery);

    if (result) {
      res.render("languagelist", {
        currentPage: pageNumber,
        nextPage: pageNumber + 1,
        list: result,
      });
    } else {
      //TODO: NO record found page
    }
  } catch (e) {
    console.log("Error -> ", e);
    res.status(500).send({
      responseMessage: "Internal Server Error",
      responseData: e,
    });
  }
});

//To create a new programming language record.
app.post("/languages/", async (req, res) => {
  try {
    let userData = req.body;
    let sqlQuery = `SELECT * FROM programming_languages WHERE name = "${userData.name}"`;
    let programmingLangData = (await queryLib.excuteQuery(sqlQuery))[0];

    if (programmingLangData) {
      res.status(200).send({
        responseMessage: "Already Created !",
        responseData: {},
      });
      return;
    } else {
      let checkForValidColumn =
        programmingLangHelperLib.verifyProgrammingLangColunm(userData);
      if (!checkForValidColumn.result) {
        res.status(200).send({
          responseMessage: `${checkForValidColumn.value} is mandatory parameter`,
          responseData: {},
        });
        return;
      }
      sqlQuery = `INSERT INTO programming_languages(name,released_year,githut_rank,pypl_rank,tiobe_rank) 
            VALUES ('${userData.name}',${userData.released_year},${userData.githut_rank},${userData.pypl_rank},${userData.tiobe_rank})`;

      let result = await queryLib.excuteQuery(sqlQuery);
      if (result) {
        let createdData = await queryLib.getProgrammingLanguageDetails(result);
        res.status(200).send({
          responseMessage: "Success",
          responseData: createdData ? createdData : null,
        });
        return;
      } else {
        res.status(200).send({
          responseMessage: "Could not create !",
          responseData: {},
        });
        return;
      }
    }
  } catch (e) {
    console.log("Error -> ", e);
    res.status(500).send({
      responseMessage: "Internal Server Error",
      responseData: e,
    });
  }
});

// To update the details of programming languages using its id
app.put("/languages/:id", async (req, res) => {
  try {
    let programmingLangId = req.params.id;
    let programmingLanguageDetails =
      await queryLib.getProgrammingLanguageDetails(programmingLangId);

    if (!programmingLanguageDetails) {
      res.status(200).send({
        responseMessage: "No record found to update!",
        responseData: {},
      });
      return;
    }
    let updateData = req.body;
    let checkForUpdateData =
      programmingLangHelperLib.verifyUpdateData(updateData);
    if (!checkForUpdateData.result) {
      res.status(200).send({
        responseMessage: `${checkForUpdateData.value} is a invalid parameter!`,
        responseData: {},
      });
    }
    let sqlQuery = `UPDATE programming_languages SET `;
    let keys = Object.keys(updateData);
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      let value = updateData[key];
      let eq = "=";

      sqlQuery += ` ${key} ${eq} "${value}" ${
        i != keys.length - 1 ? ", " : ""
      }`;
    }

    sqlQuery += `WHERE id = ${programmingLangId}`;

    let result = await queryLib.excuteQuery(sqlQuery);

    if (result.changedRows) {
      let updatedData = await queryLib.getProgrammingLanguageDetails(
        programmingLangId
      );
      res.status(200).send({
        responseMessage: "Success",
        responseData: updatedData ? updatedData : null,
      });
    } else {
      res.status(200).send({
        responseMessage: "Already Updated!",
        responseData: {},
      });
    }
  } catch (e) {
    console.log("Error -> ", e);
    res.status(500).send({
      responseMessage: "Internal Server Error",
      responseData: e,
    });
  }
});

// To delete a programming language based on its id
app.delete("/languages/:id", async (req, res) => {
  let programmingLangId = req.params.id;
  let sqlQuery = `DELETE FROM programming_languages WHERE id = ${programmingLangId}`;
  let result = await queryLib.excuteQuery(sqlQuery);

  if (result.affectedRows) {
    res.redirect("/languages?page=1");
  } else {
    res.status(200).send({
      responseMessage: "Already Deleted !",
      responseData: {},
    });
  }
});

//Server will be running in a port number which is from .env
app.listen(process.env.PORT_NUMBER, () => {
  console.log(`Server running on port ${process.env.PORT_NUMBER}`);
});
