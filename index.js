const request = require("request-promise");
const cheerio = require("cheerio");
const Jetty = require("jetty");
const jetty = new Jetty(process.stdout);
const requestNum = [1];
var headers;
var jar = request.jar();
const start = async () => {
  jetty.text("Loading...");
  for (const i in requestNum) {
    const n = requestNum[i];
    await request({
      url: "http://www.aastocks.com/en/LTP/RTPopUpQuote.aspx?symbol=" + n,
      method: "GET",
      jar: jar
    }, function (error, response, body) {
      if (error || !body) {
        return;
      }
      if (i === requestNum.length - 1) {
        headers = response.headers;
      }
    })
  }
  setInterval(() => {
    checkprice();
  }, 1000);
}

start();

const checkprice = function () {
  request({
    url: "http://www.aastocks.com/en/LTP/RTPopUpQuote.aspx",
    method: "GET",
    jar: jar,
    header: headers
  }, function (error, response, body) {
    if (error || !body) {
      return;
    }
    headers = response.headers;
    const $ = cheerio.load(body);
    const table_tr = $("#divLatestQuote table").eq(1).find("tr");
    const updateTime = $("#divUpdate").text()
    jetty.clear();
    jetty.moveTo([0, 0]);
    for (let i = 0; i < table_tr.length; i++) {
      const table_td = table_tr.eq(i).find('td');
      const name = table_td.eq(0).text();
      const price = table_td.eq(1).text();
      const trend = table_td.eq(2).text();
      jetty.text(name + " : " + price + " " + trend + "\n");
    }
    jetty.text("\n");
    jetty.text(updateTime);
  })
};
