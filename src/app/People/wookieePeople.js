const { valueToWookie } = require("../swapiFunctions");
const AbstractPeople = require("./abstractPeople");

class WookieePeople extends AbstractPeople {
  constructor(id) {
    super(id);
  }

  toWookie() {
    // Uses the method that is used in SWAPI to provide the wookiee format
    let attributes = {};
    attributes[valueToWookie("name")] = valueToWookie(this.getName());
    attributes[valueToWookie("mass")] = this.getMass();
    attributes[valueToWookie("height")] = this.getHeight();
    attributes[valueToWookie("homeworldName")] = valueToWookie(
      this.getHomeworldName()
    );
    attributes[valueToWookie("homeworldId")] = this.getHomeworlId();

    return attributes;
  }
}

module.exports = WookieePeople;
