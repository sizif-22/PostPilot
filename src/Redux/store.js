import { configureStore } from "@reduxjs/toolkit";
import user from "./user.data";

export default configureStore({
  reducer: {
     user
  },
});
