import { createSlice } from "@reduxjs/toolkit";
export const userdata = createSlice({
  name: "userdata",
  initialState: {
    userState: {},
  },
  reducers: {
    handleUserState: (state, action) => {
      state.userState = action.payload;
    },
  },
});

export const { handleUserState } = userdata.actions;
export default userdata.reducer;
