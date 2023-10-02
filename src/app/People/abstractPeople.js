const app = require("../../app");
const { Planet } = require("../Planet");

const swapiFunctions = app.swapiFunctions;

class AbstractPeople {
  constructor(id) {
    if (this.constructor == AbstractPeople) {
      throw new Error("Abstract classes can't be instantiated.");
    }
    this.id = id;
  }

  // The initial request may take slightly longer as it fetches data from SWAPI.
  // Subsequent requests will be significantly faster, as the data will be in the local database.
  async init() {
    // try to get data from DB
    const peopleDataFromDB = await app.db.swPeople.findByPk(this.id);
    if (peopleDataFromDB) {
      const { name, mass, height, homeworld_name, homeworld_id } =
        peopleDataFromDB;
      this.name = name;
      this.mass = mass;
      this.height = height;
      this.homeworld_name = homeworld_name;
      this.homeworld_id = homeworld_id;
    } else {
      // In the case that data is not found, get the data from SWAPI
      const { name, mass, height, homeworld_id } =
        await swapiFunctions.getPeopleDataFromSWAPI(this.id);

      // homeworld_name is not in the PEOPLE resource from SWAPI, so
      // yet one more request is needed

      // Get data from planet
      const { name: planetName, gravity } =
        await swapiFunctions.getPlanetDataFromSWAPI(homeworld_id);

      // Saves planet data in DB (gonna be useful when computing Weight on Planet)
      await app.db.swPlanet.create({
        name: planetName,
        gravity,
      });

      // Saves people data in DB
      await app.db.swPeople.create({
        id: this.id, //Forcing the Id to match the one in SWAPI
        name,
        mass,
        height,
        homeworld_name: planetName,
        homeworld_id,
      });

      // Save attributes
      this.name = name;
      this.mass = mass;
      this.height = height;
      this.homeworld_name = planetName;
      this.homeworld_id = homeworld_id;
    }
  }

  getId() {
    return this.id;
  }

  getName() {
    return this.name;
  }

  getMass() {
    return this.mass;
  }

  getHeight() {
    return this.height;
  }

  getHomeworldName() {
    return this.homeworld_name;
  }

  getHomeworlId() {
    return this.homeworld_id;
  }

  // this function never fails, just gives a message if something is wrong
  async getWeightOnPlanet(planetId) {
    if (planetId === this.homeworld_id) {
      return "ERROR: You are trying to compute the weight of a character on its own home world.";
    }

    const planet = new Planet(planetId);
    await planet.init();

    // Saves planet data in DB
    await app.db.swPlanet.create({
      name: planet.getName(),
      gravity: planet.getGravity(),
    });

    // Due to our standarized values for mass and gravity, -1 means that the value is unknown.
    if (this.mass < 0 || planet.getGravity() < 0) {
      return "ERROR: Either planet gravity or people mass is unknown.";
    }

    // both values are valid, just use the provided function.
    return swapiFunctions.getWeightOnPlanet(this.mass, planet.getGravity());
  }
}

module.exports = AbstractPeople;
