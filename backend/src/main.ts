import { doGet } from './controller';
import { initializeSpreadsheet } from './spreadsheet';
import {
    registerUser,
    getCurrentUser,
    getAllUsers,
    updateUser,
    getUserById
} from './controller/userController';
import {
    getAllMatches,
    createMatch,
    reportMatchResult,
    getCurrentUserMatches
} from './controller/matchController';

global.doGet = doGet;
global.initializeSpreadsheet = initializeSpreadsheet;

global.registerUser = registerUser;
global.getCurrentUser = getCurrentUser;
global.getAllUsers = getAllUsers;
global.updateUser = updateUser;
global.getUserById = getUserById;

global.getAllMatches = getAllMatches;
global.createMatch = createMatch;
global.reportMatchResult = reportMatchResult;
global.getCurrentUserMatches = getCurrentUserMatches;
