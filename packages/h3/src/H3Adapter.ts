import {
  AppControllerRoute,
  AppViewRoute,
  BullBoardQueues,
  ControllerHandlerReturnType,
  IServerAdapter,
  UIConfig,
} from "@bull-board/api/dist/typings/app";
import fs from "fs";
import { createRouter, eventHandler, getRouterParams, setResponseHeader, getQuery } from "h3";
import ejs from "ejs";

export class H3Adapter implements IServerAdapter {
  private uiHandler = createRouter();
  private basePath = "/ui";
  private bullBoardQueues: BullBoardQueues | undefined;
  private viewPath: string | undefined;
  private uiConfig: UIConfig = {};

  public setBasePath(path: string): H3Adapter {
    this.basePath = path;
    return this;
  }

  private getStaticFile(path: string, filename: string) {
    return fs.readFileSync(`${this.viewPath}${path}/${filename}`, "utf-8");
  }

  private getContentType(filename: string) {
    let contentType = "text/html";

    switch (filename.split(".").pop()) {
      case "js":
        contentType = "text/javascript";
        break;
      case "css":
        contentType = "text/css";
        break;
      case "png":
        contentType = "image/png";
        break;
      case "svg":
        contentType = "image/svg+xml";
        break;
      case "json":
        contentType = "application/json";
        break;
      case "ico":
        contentType = "image/x-icon";
        break;
    }

    return contentType;
  }

  public setStaticPath(staticsRoute: string, _staticsPath: string): H3Adapter {
    this.uiHandler
      .get(
        this.basePath,
        eventHandler(async () => {
          return ejs.renderFile(this.viewPath + "/index.ejs", {
            basePath: `${this.basePath}/`,
            title: this.uiConfig.boardTitle || "BullMQ",
            favIconAlternative: this.uiConfig.favIcon?.alternative || "",
            favIconDefault: this.uiConfig.favIcon?.default || "",
            uiConfig: JSON.stringify(this.uiConfig),
          });
        })
      )
      .get(
        `${this.basePath}${staticsRoute}/**`,
        eventHandler(async (event) => {
          const { _ } = getRouterParams(event);

          setResponseHeader(event, "Content-Type", `${this.getContentType(_)}; charset=UTF-8`);

          return this.getStaticFile(staticsRoute, _);
        })
      );

    return this;
  }

  public setViewsPath(viewPath: string): H3Adapter {
    this.viewPath = viewPath;

    return this;
  }

  public setErrorHandler(_handler: (error: Error) => ControllerHandlerReturnType) {
    return this;
  }

  public setApiRoutes(routes: AppControllerRoute[]): H3Adapter {
    routes.forEach(({ route, handler, method }) => {
      this.uiHandler.use(
        `${this.basePath}${route}`,
        eventHandler(async (event) => {
          return handler({
            queues: this.bullBoardQueues!,
            params: getRouterParams(event) as any,
            query: getQuery(event) as any,
          });
        }),
        method
      );
    });

    return this;
  }

  public setEntryRoute(_routeDef: AppViewRoute): H3Adapter {
    return this;
  }

  public setQueues(bullBoardQueues: BullBoardQueues): H3Adapter {
    this.bullBoardQueues = bullBoardQueues;
    return this;
  }

  setUIConfig(config: UIConfig = {}): H3Adapter {
    this.uiConfig = config;

    return this;
  }

  public registerHandlers() {
    return this.uiHandler;
  }
}