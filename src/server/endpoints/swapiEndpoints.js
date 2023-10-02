const { Planet } = require("../../app/Planet");
const { SWAPI_BASE_URL } = require("../constants");
const { isValidPlanetId } = require("../../app/swapiFunctions");

const _isWookieeFormat = (req) => {
  if (req.query.format && req.query.format == "wookiee") {
    return true;
  }
  return false;
};

const applySwapiEndpoints = (server, app) => {
  server.get("/hfswapi/test", async (req, res) => {
    const data = await app.swapiFunctions.genericRequest(
      SWAPI_BASE_URL,
      "GET",
      null,
      true
    );
    res.send(data);
  });

  server.get("/hfswapi/getPeople/:id", async (req, res) => {
    res.sendStatus(501);
  });

  server.get("/hfswapi/getPlanet/:id", async (req, res) => {
    const { id } = req.params;
    if (!isValidPlanetId(id)) {
      return res.status(400).json({ error: "Invalid Planet Id" });
    }

    const planet = new Planet(id);
    await planet.init();

    const response = {
      name: planet.getName(),
      gravity: planet.getGravity(),
    };

    res.json(response);
  });

  server.get("/hfswapi/getWeightOnPlanetRandom", async (req, res) => {
    res.sendStatus(501);
  });

  server.get("/hfswapi/getLogs", async (req, res) => {
    const data = await app.db.logging.findAll();
    res.send(data);
  });
};

module.exports = applySwapiEndpoints;
