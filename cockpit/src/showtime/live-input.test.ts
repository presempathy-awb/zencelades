import { expect, test } from "bun:test";
import { createLiveInput } from "./live-input";

function deferred<T>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
} {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((accept, deny) => {
    resolve = accept;
    reject = deny;
  });
  return { promise, resolve, reject };
}

function streamFixture(): {
  stream: MediaStream;
  end: () => void;
  stopped: () => number;
} {
  const track = new EventTarget();
  let stopCount = 0;
  const mediaTrack = Object.assign(track, {
    stop: () => {
      stopCount++;
      track.dispatchEvent(new Event("ended"));
    },
  }) as MediaStreamTrack;
  const stream = {
    getTracks: () => [mediaTrack],
    getVideoTracks: () => [mediaTrack],
  } as MediaStream;
  return {
    stream,
    end: () => track.dispatchEvent(new Event("ended")),
    stopped: () => stopCount,
  };
}

function videoFixture(play: () => Promise<void> = async () => {}): HTMLVideoElement {
  let paused = true;
  return {
    srcObject: null,
    muted: false,
    playsInline: false,
    play: () => {
      paused = false;
      return play();
    },
    pause: () => {
      paused = true;
    },
    get paused() {
      return paused;
    },
  } as HTMLVideoElement;
}

test("camera access is opt-in, starts once, and ends cleanly", async () => {
  const camera = streamFixture();
  const grant = deferred<MediaStream>();
  let requestCount = 0;
  let requestedConstraints: MediaStreamConstraints | undefined;
  const video = videoFixture();
  const input = createLiveInput(video, {
    getUserMedia: async (constraints) => {
      requestCount++;
      requestedConstraints = constraints;
      return grant.promise;
    },
  });
  expect(requestCount).toBe(0);
  expect(input.active).toBe(false);
  expect(input.pending).toBe(false);
  const first = input.start();
  const concurrent = input.start();
  expect(input.pending).toBe(true);
  grant.resolve(camera.stream);
  expect(await first).toBe(true);
  expect(await concurrent).toBe(true);
  expect(await input.start()).toBe(true);
  expect(requestCount).toBe(1);
  expect(requestedConstraints).toEqual({
    audio: false,
    video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
  });
  expect(video.srcObject).toBe(camera.stream);
  expect(video.muted).toBe(true);
  expect(video.playsInline).toBe(true);
  expect(video.paused).toBe(false);
  expect(input.active).toBe(true);
  expect(input.pending).toBe(false);
  camera.end();
  expect(input.active).toBe(false);
  expect(video.srcObject).toBe(null);
  expect(video.paused).toBe(true);
  expect(camera.stopped()).toBe(1);
  input.stop();
  expect(camera.stopped()).toBe(1);
});

test("Stop cancels a pending grant without stopping a newer camera session", async () => {
  const oldCamera = streamFixture();
  const newCamera = streamFixture();
  const oldGrant = deferred<MediaStream>();
  let requestCount = 0;
  const video = videoFixture();
  const input = createLiveInput(video, {
    getUserMedia: async () => {
      requestCount++;
      return requestCount === 1 ? oldGrant.promise : newCamera.stream;
    },
  });
  const oldStart = input.start();
  await Promise.resolve();
  input.stop();
  expect(input.pending).toBe(false);
  expect(input.active).toBe(false);
  expect(await input.start()).toBe(true);
  oldGrant.resolve(oldCamera.stream);
  expect(await oldStart).toBe(false);
  expect(oldCamera.stopped()).toBe(1);
  expect(newCamera.stopped()).toBe(0);
  expect(video.srcObject).toBe(newCamera.stream);
  expect(input.active).toBe(true);
  input.stop();
  expect(newCamera.stopped()).toBe(1);
  expect(video.srcObject).toBe(null);
  expect(video.paused).toBe(true);
});

test("permission and playback failures keep their original error and release the camera", async () => {
  const denied = new Error("Camera access was denied");
  const camera = streamFixture();
  const playback = new Error("Video playback was blocked");
  const video = videoFixture(async () => {
    throw playback;
  });
  let permissionDenied = true;
  const input = createLiveInput(video, {
    getUserMedia: async () => {
      if (permissionDenied) throw denied;
      return camera.stream;
    },
  });
  await expect(input.start()).rejects.toBe(denied);
  expect(input.pending).toBe(false);
  expect(input.active).toBe(false);
  permissionDenied = false;
  await expect(input.start()).rejects.toBe(playback);
  expect(camera.stopped()).toBe(1);
  expect(video.srcObject).toBe(null);
  expect(video.paused).toBe(true);
  expect(input.pending).toBe(false);
  expect(input.active).toBe(false);
});

test("Stop during pending playback prevents the late play result from reactivating", async () => {
  const camera = streamFixture();
  const playback = deferred<void>();
  const video = videoFixture(() => playback.promise);
  const input = createLiveInput(video, { getUserMedia: async () => camera.stream });
  const start = input.start();
  await Promise.resolve();
  await Promise.resolve();
  expect(video.srcObject).toBe(camera.stream);
  expect(input.pending).toBe(true);
  input.stop();
  playback.resolve();
  expect(await start).toBe(false);
  expect(camera.stopped()).toBe(1);
  expect(video.srcObject).toBe(null);
  expect(input.active).toBe(false);
  expect(input.pending).toBe(false);
});

test("an unavailable camera API reports a clear error and leaves no pending request", async () => {
  const input = createLiveInput(videoFixture(), {} as Pick<MediaDevices, "getUserMedia">);
  await expect(input.start()).rejects.toThrow("Camera access is unavailable");
  expect(input.active).toBe(false);
  expect(input.pending).toBe(false);
});
