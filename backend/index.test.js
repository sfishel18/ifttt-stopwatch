/**
 * @jest-environment node
 */

const waitOn = require("wait-on");
const axios = require("axios");

const doUpdate = (payload) => axios.post(`${API_URL}/update`, payload);
const getStatus = (id) => axios.get(`${API_URL}/get?id=${id}`);
const wait = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

const { API_URL = "http://localhost:8080", DB_PORT = "8081" } = process.env;

beforeAll(() => waitOn({ resources: [API_URL, `tcp:${DB_PORT}`] }));

describe("update function", () => {
  test("access denied if auth is wrong", () => {
    expect.assertions(2);
    return doUpdate({
      auth: process.env.AUTH_KEY.slice(0, -1),
    }).catch((error) => {
      expect(error.response.status).toEqual(401);
      expect(error.response.data).toMatchInlineSnapshot(`"Access denied"`);
    });
  });
  test("bad request if id is missing", () => {
    expect.assertions(2);
    return doUpdate({
      auth: process.env.AUTH_KEY,
    }).catch((error) => {
      expect(error.response.status).toEqual(400);
      expect(error.response.data).toMatchInlineSnapshot(
        `"Required argument \\"id\\" is missing or empty"`
      );
    });
  });
  test("bad request if direction is invalid", () => {
    expect.assertions(2);
    return doUpdate({
      auth: process.env.AUTH_KEY,
      id: "foo",
      direction: "invalid",
    }).catch((error) => {
      expect(error.response.status).toEqual(400);
      expect(error.response.data).toMatchInlineSnapshot(
        `"Required argument \\"direction\\" is missing or invalid"`
      );
    });
  });
  test("up then pause", async () => {
    expect.assertions(5);
    const id = `up-then-pause-${Date.now()}`;
    
    await doUpdate({
      auth: process.env.AUTH_KEY,
      id,
      direction: "up",
    });
    const upStatus = await getStatus(id);
    expect(upStatus.data).toEqual(expect.objectContaining({ previousValue: 0, direction: "up" }));
    expect(upStatus.data.lastUpdatedTime).toBeLessThan(Date.now());

    await wait(2000);
    await doUpdate({
      auth: process.env.AUTH_KEY,
      id,
      direction: "pause",
    });
    const pausedStatus = await getStatus(id);
    expect(pausedStatus.data.direction).toEqual("pause");
    expect(pausedStatus.data.lastUpdatedTime).toBeGreaterThan(upStatus.data.lastUpdatedTime);
    expect(pausedStatus.data.previousValue).toBeGreaterThan(2000);
  });
  test("down then pause", async () => {
    expect.assertions(5);
    const id = `down-then-pause-${Date.now()}`;
    
    await doUpdate({
      auth: process.env.AUTH_KEY,
      id,
      direction: "down",
    });
    const downStatus = await getStatus(id);
    expect(downStatus.data).toEqual(expect.objectContaining({ previousValue: 0, direction: "down" }));
    expect(downStatus.data.lastUpdatedTime).toBeLessThan(Date.now());

    await wait(2000);
    await doUpdate({
      auth: process.env.AUTH_KEY,
      id,
      direction: "pause",
    });
    const pausedStatus = await getStatus(id);
    expect(pausedStatus.data.direction).toEqual("pause");
    expect(pausedStatus.data.lastUpdatedTime).toBeGreaterThan(downStatus.data.lastUpdatedTime);
    expect(pausedStatus.data.previousValue).toBeLessThan(-2000);
  });
  test("up then down then pause", async () => {
    jest.setTimeout(20000);
    expect.assertions(8);
    const id = `up-then-down-then-pause-${Date.now()}`;
    
    await doUpdate({
      auth: process.env.AUTH_KEY,
      id,
      direction: "up",
    });
    const upStatus = await getStatus(id);
    expect(upStatus.data).toEqual(expect.objectContaining({ previousValue: 0, direction: "up" }));
    expect(upStatus.data.lastUpdatedTime).toBeLessThan(Date.now());

    await wait(2000);
    await doUpdate({
      auth: process.env.AUTH_KEY,
      id,
      direction: "down",
    });
    const downStatus = await getStatus(id);
    expect(downStatus.data.direction).toEqual("down");
    expect(downStatus.data.lastUpdatedTime).toBeGreaterThan(upStatus.data.lastUpdatedTime);
    expect(downStatus.data.previousValue).toBeGreaterThan(2000);

    await wait(4000);
    await doUpdate({
      auth: process.env.AUTH_KEY,
      id,
      direction: "pause",
    });
    const pauseStatus = await getStatus(id);
    expect(pauseStatus.data.direction).toEqual("pause");
    expect(pauseStatus.data.lastUpdatedTime).toBeGreaterThan(downStatus.data.lastUpdatedTime);
    expect(pauseStatus.data.previousValue).toBeLessThan(-1000);
  });
  test("down then up then pause", async () => {
    jest.setTimeout(20000);
    expect.assertions(8);
    const id = `down-then-up-then-pause-${Date.now()}`;
    
    await doUpdate({
      auth: process.env.AUTH_KEY,
      id,
      direction: "down",
    });
    const downStatus = await getStatus(id);
    expect(downStatus.data).toEqual(expect.objectContaining({ previousValue: 0, direction: "down" }));
    expect(downStatus.data.lastUpdatedTime).toBeLessThan(Date.now());

    await wait(2000);
    await doUpdate({
      auth: process.env.AUTH_KEY,
      id,
      direction: "up",
    });
    const upStatus = await getStatus(id);
    expect(upStatus.data.direction).toEqual("up");
    expect(upStatus.data.lastUpdatedTime).toBeGreaterThan(downStatus.data.lastUpdatedTime);
    expect(upStatus.data.previousValue).toBeLessThan(-2000);

    await wait(4000);
    await doUpdate({
      auth: process.env.AUTH_KEY,
      id,
      direction: "pause",
    });
    const pauseStatus = await getStatus(id);
    expect(pauseStatus.data.direction).toEqual("pause");
    expect(pauseStatus.data.lastUpdatedTime).toBeGreaterThan(upStatus.data.lastUpdatedTime);
    expect(pauseStatus.data.previousValue).toBeGreaterThan(1000);
  });
});
