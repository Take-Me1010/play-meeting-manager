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
    getMatchesByRound,
    getAllMatches,
    getMatch,
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

global.getMatchesByRound = getMatchesByRound;
global.getAllMatches = getAllMatches;
global.getMatch = getMatch;
global.createMatch = createMatch;
global.reportMatchResult = reportMatchResult;
global.getCurrentUserMatches = getCurrentUserMatches;
