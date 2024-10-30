import { User } from "@/types/auth.types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    signinUser: (state: AuthState, { payload }: PayloadAction<User>) => {
      state.user = payload;
      state.isAuthenticated = true;
    },
    logout: (state: AuthState) => {
      state.user = null;
      state.isAuthenticated = false;

      sessionStorage.removeItem("user");
      sessionStorage.removeItem("atk");
    },
  },
});

const { actions, reducer: AuthReducer } = authSlice;

export const { signinUser, logout } = actions;
export default AuthReducer;
