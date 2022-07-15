import http from "node:http";
import express from "express";
import { contentTypes, sendRequest } from "./http";

describe("sendRequest", () => {
  let server: SpyServer;

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

    const rawQuery = server.lastRequest?.rawQuery;
    const queryParts = rawQuery?.split("&");

    expect(queryParts).toHaveLength(2);
    expect(queryParts).toContain("some%20param=some%20value");
    expect(queryParts).toContain("other%20param=other%20value");
  });

  it("should remove empty strings from query parameters b/c the API does not accept those", async () => {
    server.setResponse({
      status: 200,
    });

    await sendRequest({
      method: "GET",
      url: `http://localhost:${server.port}/my/path`,
      query: {
        some_param: "",
      },
    });

    const query = server.lastRequest?.query;

    expect(query).toEqual({});
  });

  it("should conform to style 'form' when serializing array values", async () => {
    server.setResponse({
      status: 200,
    });

    await sendRequest({
      method: "GET",
      url: `http://localhost:${server.port}/my/path`,
      query: {
        someArray: ["one", "two", "three"],
      },
    });

    const rawQuery = server.lastRequest?.rawQuery;

    expect(rawQuery).toEqual("someArray=one&someArray=two&someArray=three");
  });

  it("should conform to style 'deepObject' when serializing object values", async () => {
    server.setResponse({
      status: 200,
    });

    await sendRequest({
      method: "GET",
      url: `http://localhost:${server.port}/my/path`,
      query: {
        someObject: { one: "eins", two: "zwei" },
      },
    });

    const rawQuery = server.lastRequest?.rawQuery;

    expect(decodeURIComponent(String(rawQuery))).toEqual(
      "someObject[one]=eins&someObject[two]=zwei"
    );
  });
});

interface SpyRequest {
  method: string;
  path: string;
  query: object;
  rawQuery: string;
  headers: object;
  body: string;
}

interface SpyResponse {
  status?: number;
  headers?: object;
  body?: string;
}

class SpyServer {
  lastRequest: SpyRequest | undefined;
  _nextResponse!: SpyResponse;
  _expressServer: express.Express | undefined;
  _httpServer: http.Server | undefined;

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
        .status(this._nextResponse.status ?? 200)
        .header({
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
          ...this._nextResponse.headers,
        })
        .send(this._nextResponse.body);
    });

    return new Promise<void>((resolve, reject) => {
      // Listening on port '0' lets the OS choose a random available port
      const port = 0;

      this._httpServer = http.createServer(this._expressServer);
      this._httpServer.listen(port, resolve);
      this._httpServer.on("error", reject);
    });
  }

  stop() {
    return new Promise<void>((resolve, reject) => {
      if (!this._httpServer) {
        resolve();
        return;
      }

      this._httpServer.close((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
        this._httpServer = undefined;
      });
    });
  }

  get port() {
    const address = this._httpServer?.address();
    if (!address) {
      throw new Error("Failed to determine server address");
    } else if (typeof address === "string") {
      throw new Error(
        "Server unexpectedly seems to be connected to a socket instead of a network interface"
      );
    } else {
      return address.port;
    }
  }

  setResponse(response: SpyResponse) {
    this._nextResponse = response;
  }
}
