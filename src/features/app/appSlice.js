import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  status: 'idle',
  message: null,
}

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setStatus(state, action) {
      state.status = action.payload
    },
    setMessage(state, action) {
      state.message = action.payload
    },
  },
})

export const { setStatus, setMessage } = appSlice.actions
export default appSlice.reducer
