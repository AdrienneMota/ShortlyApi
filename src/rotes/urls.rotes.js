import { Router } from "express";
import tokenValidate from "../middlewares/tokenValidate.middleware.js";
import urlValidateschema from "../middlewares/urlValidateSchema.middleware.js";
import shortUrlValidate from "../middlewares/shortUrlValidate.middleware.js";
import UrlValidateForDelete from "../middlewares/UrlValidateForDelite.middleware.js";
import { posturls, getUrls, redirectShortUrl, deleteurl, urlsFromUser, ranking} from "../controllers/urls.controllers.js";

const urlsRoute = Router()

urlsRoute.post("/urls/shorten", tokenValidate, urlValidateschema,  posturls)
urlsRoute.get("/urls/:id", getUrls)
urlsRoute.get("/urls/open/:shortUrl", shortUrlValidate, redirectShortUrl)
urlsRoute.delete("/urls/:id", tokenValidate, UrlValidateForDelete, deleteurl)
urlsRoute.get("/users/me", tokenValidate, urlsFromUser)
urlsRoute.get("/ranking", ranking)

export default urlsRoute