import "dotenv/config"
import express, { NextFunction, Request, Response } from "express"
import cors from "cors"
import session from "cookie-session"
import { config } from "./config/app.config"
import connectDatabase from "./config/database.config"
import { errorHandler } from "./middlewares/errorHandler.middleware"
import { HTTPSTATUS } from "./config/http.config"
import { asyncHandler } from "./middlewares/asyncHandler.middleware"
import { BadRequestException } from "./utils/appError"
import { ErrorCodeEnum } from "./enums/error-code.enum"

import "./config/passport.config"
import passport from "passport"
import authRoutes from "./routes/auth.route"
import userRoutes from "./routes/user.route"
import isAuthenticated from "./middlewares/isAuthenticated.middleware"
import workspaceRoutes from "./routes/workspace.route"
import memberRoutes from "./routes/member.route"
import projectRoutes from "./routes/project.route"
import taskRoutes from "./routes/task.route"
import sprintRoutes from "./routes/sprint.route"
import commentRoutes from "./routes/comment.route"
import timeLogRoutes from "./routes/time-log.route"
import timelineRoutes from "./routes/timeline.route"
import integrationRoutes from "./routes/integration.route"
import billingRoutes from "./routes/billing.route"
import notificationRoutes from "./routes/notification.route"

const app = express()
app.set("trust proxy", 1)
const BASE_PATH = config.BASE_PATH

app.use(
  express.json({
    verify: (req: any, res, buf) => {
      req.rawBody = buf.toString()
    },
  }),
)

app.use(express.urlencoded({ extended: true }))

app.use(
  session({
    name: "session",
    keys: [config.SESSION_SECRET],
    maxAge: 24 * 60 * 60 * 1000,
    secure: config.NODE_ENV === "production",
    httpOnly: true,
    sameSite: config.NODE_ENV === "production" ? "none" : "lax",
  }),
)

// Passport session regeneration workaround for cookie-session
app.use((req, res, next) => {
  if (req.session && !req.session.regenerate) {
    ;(req.session as any).regenerate = (cb: () => void) => {
      cb()
    }
  }
  if (req.session && !req.session.save) {
    ;(req.session as any).save = (cb: () => void) => {
      cb()
    }
  }
  next()
})

app.use(passport.initialize())
app.use(passport.session())

app.use(
  cors({
    origin: config.FRONTEND_ORIGIN,
    credentials: true,
  }),
)

app.get(
  `/`,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    throw new BadRequestException("This is a bad request", ErrorCodeEnum.AUTH_INVALID_TOKEN)
    return res.status(HTTPSTATUS.OK).json({
      message: "Hello Subscribe to the channel & share",
    })
  }),
)

app.use(`${BASE_PATH}/auth`, authRoutes)
app.use(`${BASE_PATH}/user`, isAuthenticated, userRoutes)
app.use(`${BASE_PATH}/workspace`, isAuthenticated, workspaceRoutes)
app.use(`${BASE_PATH}/member`, isAuthenticated, memberRoutes)
app.use(`${BASE_PATH}/project`, isAuthenticated, projectRoutes)
app.use(`${BASE_PATH}/task`, isAuthenticated, taskRoutes)
app.use(`${BASE_PATH}/sprint`, isAuthenticated, sprintRoutes)
app.use(`${BASE_PATH}/comment`, isAuthenticated, commentRoutes)
app.use(`${BASE_PATH}/time-log`, isAuthenticated, timeLogRoutes)
app.use(`${BASE_PATH}/timeline`, isAuthenticated, timelineRoutes)
app.use(`${BASE_PATH}/notification`, isAuthenticated, notificationRoutes)
app.use(`${BASE_PATH}/integration`, integrationRoutes)
app.use(`${BASE_PATH}/billing`, billingRoutes)

app.use(errorHandler)

app.listen(config.PORT, async () => {
  console.log(`Server listening on port ${config.PORT} in ${config.NODE_ENV}`)
  await connectDatabase()
})
