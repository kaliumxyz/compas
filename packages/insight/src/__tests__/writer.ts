import "jest";
import { LogLevel } from "../types";
import { DevWriter, Writer } from "../Writer";

const mockWrite = jest.fn();

beforeEach(() => {
  mockWrite.mockClear();
});

describe("Writer", () => {
  it("should write new lines", () => {
    const w = new Writer(({ write: mockWrite } as any) as NodeJS.WriteStream);
    w.write({ message: "", timestamp: new Date(), level: LogLevel.Error });

    expect(mockWrite).toBeCalled();
    expect(mockWrite.mock.calls[0][0].indexOf("\n")).toBeGreaterThan(-1);
  });

  it("to be json parse able", () => {
    expect.assertions(1);

    const w = new Writer(({ write: mockWrite } as any) as NodeJS.WriteStream);
    w.write({
      message: "",
      timestamp: new Date(),
      level: LogLevel.Error,
      foo: "bar",
    });
    expect(mockWrite).toBeCalled();

    const d = mockWrite.mock.calls[0][0];
    try {
      JSON.parse(d);
    } catch (e) {
      expect(e).toMatchSnapshot();
    }
  });

  it("should contain all data", () => {
    const w = new Writer(({ write: mockWrite } as any) as NodeJS.WriteStream);
    w.write({
      message: "",
      timestamp: new Date(),
      level: LogLevel.Error,
      foo: "bar",
    });
    expect(mockWrite).toBeCalled();

    const d = JSON.parse(mockWrite.mock.calls[0][0]);
    expect(d).toHaveProperty("foo", "bar");
  });
});

describe("DevWriter", () => {
  // By improving readability of the DevWriter#write implementation
  // testing was made a bit harder as it is doing more than a single stream#write
  // call per log
  const mockeWriterIndexOf = (value: string): number =>
    mockWrite.mock.calls.findIndex(it => it[0].includes(value));

  it("should write new lines", () => {
    const w = new DevWriter(({
      write: mockWrite,
    } as any) as NodeJS.WriteStream);
    w.write({ message: "", timestamp: new Date(), level: LogLevel.Error });

    expect(mockWrite).toBeCalled();
    expect(mockeWriterIndexOf("\n")).toBeGreaterThan(-1);
  });

  it("should format timestamp", () => {
    const w = new DevWriter(({
      write: mockWrite,
    } as any) as NodeJS.WriteStream);
    w.write({ message: "", timestamp: new Date(), level: LogLevel.Error });

    expect(mockWrite).toBeCalled();
    const data = mockWrite.mock.calls[0][0];
    expect(data).toMatch(/\d{2}:\d{2}:\d{2}\.\d{3}/gi);
  });

  it("should contain log level", () => {
    const w = new DevWriter(({
      write: mockWrite,
    } as any) as NodeJS.WriteStream);
    w.write({ message: "", timestamp: new Date(), level: LogLevel.Info });
    w.write({ message: "", timestamp: new Date(), level: LogLevel.Error });

    expect(mockWrite).toBeCalled();

    expect(mockeWriterIndexOf("info")).toBeGreaterThan(-1);
    expect(mockeWriterIndexOf("error")).toBeGreaterThan(-1);
  });

  it("should print rest of values", () => {
    const w = new DevWriter(({
      write: mockWrite,
    } as any) as NodeJS.WriteStream);
    w.write({
      message: "",
      timestamp: new Date(),
      level: LogLevel.Info,
      myProp: ["my", "value"],
    });

    expect(mockWrite).toBeCalled();
    expect(mockeWriterIndexOf("myProp")).toBeGreaterThan(-1);
  });
});
