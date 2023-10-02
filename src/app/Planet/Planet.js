const app = require("../../app");
const { valueToWookie } = require("../swapiFunctions");
class Planet {
  constructor(id) {
    this.id = id;
    this.name = null;
    this.gravity = null;
  }

  async init() {
    // looks for data in DB
    const planetDataFromDB = await app.db.swPlanet.findByPk(this.id);
    if (planetDataFromDB) {
      const { name, gravity } = planetDataFromDB;
      this.name = name;
      this.gravity = gravity;
    } else {
      // In the case that data is not found, get the data from SWAPI
      const { name, gravity } = await app.swapiFunctions.getPlanetDataFromSWAPI(
        this.id
      );
      this.name = name;
      this.gravity = gravity;

      // Also saves the "new" data in the local DB, so next time
      // this specific register is gonna be available locally.
      await app.db.swPlanet.create({
        id: this.id, //Forcing the Id to match the one in SWAPI
        name,
        gravity,
      });
    }
  }

  getName() {
    return this.name;
  }

  getGravity() {
    return this.gravity;
  }

  toWookie() {
    // Uses the method that is used in SWAPI to provide the wookiee format
    let attributes = {};
    attributes[valueToWookie("name")] = valueToWookie(this.getName());
    attributes[valueToWookie("mass")] = this.getGravity();

    return attributes;
  }
}

module.exports = Planet;
