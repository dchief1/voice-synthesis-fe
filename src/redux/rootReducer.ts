import { combineReducers } from "redux";
import AuthReducer from "./slices/auth.slice";

const rootReducer = combineReducers({
  auth: AuthReducer,
});

export default rootReducer;
