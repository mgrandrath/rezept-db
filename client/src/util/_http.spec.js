import http from "node:http";
import express from "express";
import { contentTypes, sendRequest } from "./http.js";

describe("sendRequest", () => {
  let server;

  beforeAll(async () => {
    server = new SpyServer();
    await server.start();
  });

  beforeEach(() => {
    server.reset();
  });

  afterAll(async () => {
    await server.stop();
  });

  it("should send requests and return responses", async () => {
    server.setResponse({
      status: 222,
      headers: {
        "Access-Control-Expose-Headers": "myResponseHeader",
        myResponseHeader: "myResponseHeaderValue",
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify({
        myResponseData: "myResponseValue",
      }),
    });

    const response = await sendRequest({
      method: "POST",
      url: `http://localhost:${server.port}/my/path`,
      query: {
        "some;param": "some-value",
      },
      headers: {
        myRequestHeader: "myRequestHeaderValue",
      },
      contentType: contentTypes.JSON,
      data: {
        myRequestData: "myRequestValue",
      },
    });

    expect(server.lastRequest).toMatchObject({
      method: "POST",
      path: "/my/path",
      query: {
        "some;param": "some-value",
      },
      headers: {
        myrequestheader: "myRequestHeaderValue",
        "content-type": "application/json;charset=utf-8",
      },
      body: JSON.stringify({
        myRequestData: "myRequestValue",
      }),
    });
    expect(response).toMatchObject({
      status: 222,
      headers: {
        myresponseheader: "myResponseHeaderValue",
      },
      data: {
        myResponseData: "myResponseValue",
      },
    });
  });

  it("should encode spaces in query strings as '%20' b/c the API does not accept '+' characters", async () => {
    server.setResponse({
      status: 200,
    });

    await sendRequest({
      method: "GET",
      url: `http://localhost:${server.port}/my/path`,
      query: {
        "some param": "some value",
        "other param": "other value",
      },
    });

    const rawQuery = server.lastRequest.rawQuery;
    const queryParts = rawQuery.split("&");

    expect(queryParts).toHaveLength(2);
    expect(queryParts).toContain("some%20param=some%20value");
    expect(queryParts).toContain("other%20param=other%20value");
  });
});

class SpyServer {
  constructor() {
    this.reset();
  }

  reset() {
    this.lastRequest = undefined;
    this._nextResponse = {
      status: 500,
      headers: {},
      body: "SpyServer response not specified",
    };
  }

  start() {
    this._expressServer = express();
    this._expressServer.use(express.text({ type: "*/*" }));
    this._expressServer.all("/*", (httpRequest, httpResponse) => {
      this.lastRequest = {
        method: httpRequest.method,
        path: httpRequest.path,
        query: httpRequest.query,
        rawQuery: httpRequest.originalUrl.split("?")[1],
        headers: httpRequest.headers,
        body: typeof httpRequest.body === "string" ? httpRequest.body : "",
      };

      httpResponse
        .status(this._nextResponse.status)
        .header({
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
          ...this._nextResponse.headers,
        })
        .send(this._nextResponse.body);
    });

    return new Promise((resolve, reject) => {
      // Listening on port '0' lets the OS choose a random available port
      const port = 0;

      this._httpServer = http.createServer(this._expressServer);
      this._httpServer.listen(port, resolve);
      this._httpServer.on("error", reject);
    });
  }

  stop() {
    return new Promise((resolve, reject) => {
      this._httpServer.close((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  get port() {
    return this._httpServer.address().port;
  }

  setResponse(response) {
    this._nextResponse = response;
  }
}
