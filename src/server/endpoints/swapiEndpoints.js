const { Planet } = require("../../app/Planet");
const { peopleFactory } = require("../../app/People");
const {
  SWAPI_BASE_URL,
  SWAPI_PLANETS_COUNT,
  SWAPI_PEOPLE_COUNT,
} = require("../constants");
const {
  isValidPlanetId,
  isValidPeopleId,
} = require("../../app/swapiFunctions");

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
    const { id } = req.params;
    if (!isValidPeopleId(id)) {
      return res.status(400).json({ error: "Invalid People Id" });
    }
    let lang;
    if (_isWookieeFormat(req)) {
      lang = "wookiee";
    }

    // we use await because peoplefactory also performs init() function after initialization
    const people = await peopleFactory(id, lang);

    let response;
    if (lang === "wookiee") {
      // translates the reponse object to wookie
      response = people.toWookie();
    } else {
      const name = people.getName();
      const mass = people.getMass();
      const height = people.getHeight();
      const homeworldName = people.getHomeworldName();
      const homeworldId = people.getHomeworlId();

      response = {
        name,
        mass,
        height,
        homeworldName,
        homeworldId,
      };
    }

    res.json(response);
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
    // Generate Random valid Ids ( int to string)
    const randomPlanetId = (
      Math.floor(Math.random() * SWAPI_PLANETS_COUNT) + 1
    ).toString();
    const randomPeopleId = (
      Math.floor(Math.random() * SWAPI_PEOPLE_COUNT) + 1
    ).toString();

    const people = await peopleFactory(randomPeopleId, "default");
    const weight = await people.getWeightOnPlanet(randomPlanetId);

    const response = {
      planetId: randomPlanetId,
      peopleId: randomPeopleId,
      weightOnPlanet: weight,
    };
    res.json(response);
  });

  server.get("/hfswapi/getLogs", async (req, res) => {
    const data = await app.db.logging.findAll();
    res.send(data);
  });
};

module.exports = applySwapiEndpoints;
