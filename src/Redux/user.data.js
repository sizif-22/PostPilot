import { createSlice } from "@reduxjs/toolkit";
export const userdata = createSlice({
  name: "userdata",
  initialState: {
    userState: {},
    currentChannelId: "",
  },
  reducers: {
    handleUserState: (state, action) => {
      state.userState = action.payload;
    },
    handleCurrentChannelId: (state, action) => {
      state.currentChannelId = action.payload;
    },
  },
});

export const { handleUserState, handleCurrentChannelId } = userdata.actions;
export default userdata.reducer;
