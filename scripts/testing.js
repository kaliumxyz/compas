import { log } from "@lbu/insight";
import { createBodyParsers, getApp } from "@lbu/server";
import { mainFn } from "@lbu/stdlib";
import { router } from "../generated/router.js";

const main = async logger => {
  const app = getApp({
    errorOptions: {
      leakError: true,
    },
    headers: {
      cors: {
        origin: "http://localhost:3000",
      },
    },
  });

  createBodyParsers();

  app.use(router);

  app.listen(3000, () => {
    logger.info("Listening...");
  });

  mount();
};

mainFn(import.meta, log, main);

function mount() {}
