import { doGet } from "./controller";
import { initializeSpreadsheet } from "./spreadsheet";
import {
  registerUser,
  getCurrentUser,
  updateUser,
  getUserById,
} from "./controller/userController";
import {
  getAllMatches,
  reportMatchResult,
  getCurrentUserMatches,
} from "./controller/matchController";
import { getAllUsers } from "./controller/admin/userController";
import { createMatch } from "./controller/admin/matchController";

global.doGet = doGet;
global.initializeSpreadsheet = initializeSpreadsheet;

global.registerUser = registerUser;
global.getCurrentUser = getCurrentUser;
global.updateUser = updateUser;
global.getUserById = getUserById;

global.getAllMatches = getAllMatches;
global.reportMatchResult = reportMatchResult;
global.getCurrentUserMatches = getCurrentUserMatches;

// admin functions
global.getAllUsers = getAllUsers;
global.createMatch = createMatch;
