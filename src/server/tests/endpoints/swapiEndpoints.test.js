// For tests
const chai = require("chai");
const chaiHttp = require("chai-http");

// For server creation
const createExpressServer = require("../../../server");
const app = require("../../../app");
const { isValidPlanetId } = require("../../../app/swapiFunctions");

chai.use(chaiHttp);
const expect = chai.expect;

describe("endpoints", () => {
  let server;

  before(async () => {
    server = await createExpressServer(app); // Setup the server
  });

  it("should return a valid planet with JSON format", (done) => {
    const validPlanetId = 2; // a valid planetId
    chai
      .request(server) // express server
      .get(`/hfswapi/getPlanet/${validPlanetId}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.have.property("name");
        expect(res.body).to.have.property("gravity");
        // is possible to add more asserts here

        done();
      });
  });

  it("should return a 400 error for an invalid planet ID", (done) => {
    const invalidPlanetId = "invalid"; // invalid planetId
    chai
      .request(server)
      .get(`/hfswapi/getPlanet/${invalidPlanetId}`)
      .end((err, res) => {
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body).to.have.property("error");
        // is possible to add more asserts here
        done();
      });
  });

  it("should return a valid planet with Wookiee format", (done) => {
    const validPlanetId = 2; // valid planet id
    chai
      .request(server)
      .get(`/hfswapi/getPlanet/${validPlanetId}`)
      .query({ format: "wookiee" }) // format wookiee
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        // is possible to add more asserts here
        done();
      });
  });
});
