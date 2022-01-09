import 'dotenv/config'
import 'module-alias/register'
import validateEnv from './utils/validateEnv'
import app from "./app";

validateEnv()

app.initDatabase().listen()
